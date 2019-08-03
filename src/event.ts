export interface EventData {
    name: string
    eventDate: Date
    detailsLink: string
}

export class Event {
    public readonly name: string
    public readonly date: Date
    public readonly link: string

    public constructor(domain: string, eventData: EventData) {
        this.name = eventData.name
        this.date = new Date(eventData.eventDate)
        this.link = `${domain}${eventData.detailsLink}`
    }
}

export interface OpenGraphData {
    ogTitle: string
    ogUrl: string
    ogImage: {url: string}
    ogDescription: string
}

export class OpenGraph {
    public readonly title: string
    public readonly url: string
    public readonly image: string
    public readonly description: string

    public constructor(openGraphData: OpenGraphData) {
        this.title = openGraphData.ogTitle
        this.url = openGraphData.ogUrl
        this.image = openGraphData.ogImage.url
        this.description = openGraphData.ogDescription
    }
}

export type OpenGraphEvent = [Event, OpenGraph]

export interface EventSource {
    name: string
    fetchListing(date: Date): Promise<OpenGraphEvent[]>
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

export function generateHTML(eventSource: EventSource, openGraphEvents: OpenGraphEvent[]) {
  const divCollection = openGraphEvents
    .map((openGraphEvent) => {
      const [event, openGraph] = openGraphEvent
      return `
        <div class='container'>
          <div class='title-container'>
            <h3 class='title-link'>
              <a href='${event.link}'>${event.name}</a>
            </h3>
            <div class='title-time'>
              ${event.date.toLocaleDateString('en-US', {hour: '2-digit', minute: '2-digit'})}
            </div>
          </div>
          <div>
            <a href='${event.link}'>
              <img src='${openGraph.image}'/>
            </a>
          </div>
          <p>
            ${openGraph.description || 'No description'}
          </p>
        </div>`
    })
    .reduce((html, eventDiv) => html + eventDiv, '')
  return `
  <!doctype html>
  <html>
    <head>
      ${styleTag}
    </head>
    <body>
      <h1>${eventSource.name}</h1
      ${divCollection}
    </body>
  </html>
  `
}