export interface Event {
  name: string
  date: Date
  link: string
  image: string
  description: string
}

export interface OpenGraph {
  ogTitle: string
  ogUrl: string
  ogImage: { url: string }
  ogDescription: string
}

export interface EventSource {
  name: string
  fetchListing(date: Date): Promise<Event[]>
}

const styleTag = `
<style>
  .container {
    display: flex;
    justify-content: space-around;
    flex-direction: column;
  }
  .title-container {
    display: flex;
    justify-content: space-between;
  }
  .title-link {
  }
  .title-time {
    align-self: center;
  }
</style>
`

export function generateHTML(eventSource: EventSource, events: Event[]) {
  const divCollection =
    events
      .map(event => {
        return `
        <div class='container'>
          <div class='title-container'>
            <h3 class='title-link'>
              <a href='${event.link}'>${event.name}</a>
            </h3>
            <div class='title-time'>
              ${event.date.toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div>
            <a href='${event.link}'>
              <img src='${event.image}'/>
            </a>
          </div>
          <p>
            ${event.description || 'No description'}
          </p>
        </div>`
      })
      .reduce((html, eventDiv) => html + eventDiv, '') || '<div>No Events</div>'
  return `
  <!doctype html>
  <html>
    <head>
      ${styleTag}
    </head>
    <body>
      <h1>${eventSource.name}</h1>
      ${divCollection}
    </body>
  </html>
  `
}
