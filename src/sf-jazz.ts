const needle = require('needle')
const ogs = require('open-graph-scraper')
import { OpenGraph, EventSource, Event } from './event'

interface EventData {
  name: string
  eventDate: Date
  detailsLink: string
}

class SFJazzEvent {
  public readonly name: string
  public readonly date: Date
  public readonly link: string

  public constructor(domain: string, eventData: EventData) {
    this.name = eventData.name
    this.date = new Date(eventData.eventDate)
    this.link = `${domain}${eventData.detailsLink}`
  }
}

class SFJazzFullEvent implements Event {
  public readonly name: string
  public readonly date: Date
  public readonly link: string
  public readonly image: string
  public readonly description: string

  public constructor(event: SFJazzEvent, openGraph: OpenGraph) {
    this.name = event.name
    this.date = event.date
    this.link = event.link
    this.image = openGraph.ogImage.url
    this.description = openGraph.ogDescription
  }
}

export class SFJazz implements EventSource {
  public name = 'SF Jazz'

  private generateURL(date: Date) {
    const twoWeeksInMilliseconds = 14 * 24 * 60 * 60 * 1000
    const futureDate = new Date(date.getTime() + twoWeeksInMilliseconds)
    const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    const futureDateString = `${futureDate.getFullYear()}-${futureDate.getMonth() + 1}-${futureDate.getDate()}`
    return `https://www.sfjazz.org/ace-api/events?startDate=${dateString}&endDate=${futureDateString}`
  }

  public async fetchListing(date: Date): Promise<Event[]> {
    const url = this.generateURL(date)
    const eventData = await this.fetch(url)
    const events: SFJazzEvent[] = eventData.map((data: EventData) => new SFJazzEvent('https://www.sfjazz.org', data))
    if (events.length === 0) {
      console.log('No events to process from SFJazz')
      return []
    }
    let list: [SFJazzEvent, OpenGraph][] = []
    let openGraphCache = new Map<string, OpenGraph>()
    const promise = events
      .slice(1)
      .reduce((promise, event) => {
        return promise
          .then(resolvedValue => {
            list.push(resolvedValue)
            return this.fetchEventPageOpenGraphData(event, openGraphCache)
          })
          .catch(error => {
            console.error(error)
            return this.fetchEventPageOpenGraphData(event, openGraphCache)
          })
      }, this.fetchEventPageOpenGraphData(events[0], openGraphCache))
      .then(resolvedValue => {
        list.push(resolvedValue)
      })
    await promise
    return list.map(eventTuple => {
      const [event, openGraph] = eventTuple
      return new SFJazzFullEvent(event, openGraph)
    })
  }

  private async fetch(url: string) {
    const response = await needle('get', url)
    if (response.statusCode !== 200) {
      throw `Error with response code of ${response.statusCode}`
    }
    return response.body
  }

  private async fetchEventPageOpenGraphData(
    event: SFJazzEvent,
    cache: Map<string, OpenGraph>,
  ): Promise<[SFJazzEvent, OpenGraph]> {
    const cachedOpenGraph = cache.get(event.link)
    if (cachedOpenGraph !== undefined) {
      console.log(`in cache ${event.link}`)
      return Promise.resolve([event, cachedOpenGraph])
    }
    console.log(`fetching ${event.link}`)
    const options = { url: event.link }
    const result = await ogs(options)
    const openGraph = result.data
    cache.set(event.link, result.data)
    return [event, openGraph]
  }
}
