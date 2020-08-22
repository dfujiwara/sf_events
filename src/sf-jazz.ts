import * as needle from 'needle'
import * as ogs from 'open-graph-scraper'
import { OpenGraph, EventSource, Event } from 'event'

interface EventData {
  name: string
  eventDate: Date
  detailsLink: string
}

class SFJazzEvent implements Event {
  public readonly name: string
  public readonly date: Date
  public readonly link: string
  public readonly image: string
  public readonly description: string

  public constructor(event: EventData, openGraph: OpenGraph) {
    this.name = event.name
    this.date = new Date(event.eventDate)
    this.link = openGraph.ogUrl
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
    if (eventData.length === 0) {
      console.log('No events to process from SFJazz')
      return []
    }
    let list: [EventData, OpenGraph][] = []
    let openGraphCache = new Map<string, OpenGraph>()
    const promise = eventData
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
      }, this.fetchEventPageOpenGraphData(eventData[0], openGraphCache))
      .then(resolvedValue => {
        list.push(resolvedValue)
      })
    await promise
    return list.map(eventTuple => {
      const [event, openGraph] = eventTuple
      return new SFJazzEvent(event, openGraph)
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
    event: EventData,
    cache: Map<string, OpenGraph>,
  ): Promise<[EventData, OpenGraph]> {
    const pageURL = 'https://www.sfjazz.org' + event.detailsLink
    const cachedOpenGraph = cache.get(pageURL)
    if (cachedOpenGraph !== undefined) {
      console.log(`in cache ${pageURL}`)
      return Promise.resolve([event, cachedOpenGraph])
    }
    console.log(`fetching ${pageURL}`)
    const options = { url: pageURL }
    const result = await ogs(options)
    const openGraph = result.data
    cache.set(pageURL, result.data)
    return [event, openGraph]
  }
}
