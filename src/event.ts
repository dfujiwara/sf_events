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