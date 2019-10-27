import * as needle from 'needle'
import * as ogs from 'open-graph-scraper'
import { OpenGraph, EventSource, Event } from './event'

class PunchLineEvent implements Event {
  public readonly name: string
  public readonly date: Date
  public readonly link: string
  public readonly image: string
  public readonly description: string

  public constructor(openGraph: OpenGraph) {
    this.name = openGraph.ogTitle
    this.date = new Date()
    this.link = openGraph.ogUrl
    this.image = openGraph.ogImage.url
    this.description = openGraph.ogDescription
  }
}

export class PunchLine implements EventSource {
  public name = 'Punch Line'
  private url = 'http://www.punchlinecomedyclub.com'

  public async fetchListing(date: Date): Promise<Event[]> {
    const eventData = await this.fetch(this.url)
    if (eventData.length === 0) {
      console.log('No events to process from SFJazz')
      return []
    }
    const eventIds = (eventData as string).match(/tmeventid=[A-Z0-9]+/g)
    if (!eventIds) {
      console.log('No events to process from Punch Line')
      return []
    }
    const deduplicatedEventIds = Array.from(new Set(eventIds))
    const promises = deduplicatedEventIds.map(eventId => {
        console.log(eventId)
        const computedURL = `http://www.punchlinecomedyclub.com/EventDetail?${eventId}`
        console.log(computedURL)
        return this.fetchEventPageOpenGraphData(computedURL)
    })
    const openGraphEvents = await Promise.all(promises)
    return openGraphEvents.map(openGraph => {
        return new PunchLineEvent(openGraph)
    })
  }

  private async fetch(url: string) {
    const response = await needle('get', url)
    if (response.statusCode !== 200) {
      throw `Error with response code of ${response.statusCode}`
    }
    return response.body
  }

  private async fetchEventPageOpenGraphData(eventURL: string): Promise<OpenGraph> {
    const options = { url: eventURL }
    const result = await ogs(options)
    const openGraph = result.data
    return openGraph
  }
}
