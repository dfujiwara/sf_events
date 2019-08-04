const needle = require('needle')
const ogs = require('open-graph-scraper')
import { OpenGraph, Event, EventData, EventSource } from './event'

export class SFJazz implements EventSource {
  public name = 'SF Jazz'

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
    const events: Event[] = eventData.map((data: EventData) => new Event('https://www.sfjazz.org', data))
    let list: [Event, OpenGraph][] = []
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
    return list
  }

  private async fetch(url: string) {
    const response = await needle('get', url)
    if (response.statusCode !== 200) {
      throw `Error with response code of ${response.statusCode}`
    }
    return response.body
  }

  private async fetchEventPageOpenGraphData(event: Event, cache: Map<string, OpenGraph>): Promise<[Event, OpenGraph]> {
    const cachedOpenGraph = cache.get(event.link)
    if (cachedOpenGraph !== undefined) {
      console.log(`in cache ${event.link}`)
      return Promise.resolve([event, cachedOpenGraph])
    }
    console.log(`fetching ${event.link}`)
    const options = { url: event.link }
    const result = await ogs(options)
    const openGraph = new OpenGraph(result.data)
    cache.set(event.link, openGraph)
    return [event, openGraph]
  }
}
