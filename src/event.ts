export interface EventData {
    name: string
    eventDate: Date
    detailsLink: string
}

export class Event {
    readonly name: string
    readonly date: Date
    readonly link: string

    constructor(domain: String, eventData: EventData) {
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
    readonly title: string
    readonly url: string
    readonly image: string
    readonly description: string

    constructor(openGraphData: OpenGraphData) {
        this.title = openGraphData.ogTitle
        this.url = openGraphData.ogUrl
        this.image = openGraphData.ogImage.url
        this.description = openGraphData.ogDescription
    }
}

export interface EventSource {
    name: string
    fetchListing(date: Date): Promise<[Event, OpenGraph][]>
}

const styleTag = `
<style>
  .container {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
  }
</style>
`

export function generateHTML(eventSource: EventSource, openGraphEvents: [Event, OpenGraph][]) {
  const divCollection = openGraphEvents
    .map((openGraphEvent) => {
      const [event, openGraph] = openGraphEvent
      return `
        <div class='container'>
          <h3><a href='${event.link}'>${event.name}</a></h3>
          <div>${event.date.toLocaleDateString('en-US', {hour: '2-digit', minute: '2-digit'})}</div>
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