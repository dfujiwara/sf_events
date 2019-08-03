const needle = require('needle')
const ogs = require('open-graph-scraper')
import { OpenGraph, Event, EventData, EventSource } from './event'

export class SFJazz implements EventSource {
    public name = "SF Jazz"

    private generateURL(date: Date) {
        const twoWeeksInMilliseconds = 14 * 24 * 60 * 60 * 1000
        const futureDate = new Date(date.getTime() + twoWeeksInMilliseconds)
        const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        const futureDateString = `${futureDate.getFullYear()}-${futureDate.getMonth() + 1}-${futureDate.getDate()}`
        return `https://www.sfjazz.org/ace-api/events?startDate=${dateString}&endDate=${futureDateString}`
    }

    public async fetchListing(date: Date): Promise<[Event, OpenGraph][]> {
        const url = this.generateURL(date)
        const eventData = await this.fetch(url)
        const events = eventData.map((data: EventData) => new Event('https://www.sfjazz.org', data))
        const dedupedEvents = this.dedupeEvents(events)
        const openGraphPromises = dedupedEvents
            .map(async (event): Promise<[Event, OpenGraph]> => {
                try {
                    return [event, await this.fetchEventPageOpenGraphData(event)]
                } catch (error) {
                    console.error(error)
                    return null
                }
            })
        const openGraphEvents = await Promise.all(openGraphPromises)
        const filteredOpenGraphEvents = openGraphEvents.filter((tuple) => tuple !== null)
        return filteredOpenGraphEvents
    }

    private async fetch(url: string) {
        const response = await needle('get', url)
        if (response.statusCode !== 200) {
            throw `Error with response code of ${response.statusCode}`
        }
        return response.body
    }

    private dedupeEvents(events: Event[]): Event[] {
        const linkSet = new Set()
        return events.filter((event) => {
            if (linkSet.has(event.link)) {
                console.log(`deduping ${event.link}`)
                return false
            }
            linkSet.add(event.link)
            return true
        })
    }

    private async fetchEventPageOpenGraphData(event: Event) {
        const options = { url: event.link }
        const result = await ogs(options)
        return new OpenGraph(result.data)
    }
}
