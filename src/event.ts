export interface EventData {
    name: string
    eventDate: Date
    detailsLink: string
}

export class Event {
    readonly name: string
    readonly date: Date
    readonly link: string

    constructor(domain = 'https://www.sfjazz.org', eventData: EventData) {
        this.name = eventData.name
        this.date = new Date(eventData.eventDate)
        this.link = `${domain}${eventData.detailsLink}`
    }
}
