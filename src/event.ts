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

export class OpenGraph {
    readonly title: string
    readonly url: string
    readonly image: string
    readonly description: string

    constructor(openGraphData) {
        this.title = openGraphData.data.ogTitle
        this.url = openGraphData.data.ogUrl
        this.image = openGraphData.data.ogImage.url
        this.description = openGraphData.data.ogDescription
    }
}