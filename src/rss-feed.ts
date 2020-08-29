import * as ogs from 'open-graph-scraper'
import * as Parser from 'rss-parser'
import { OpenGraph, EventSource, Event } from './event'

type RSSListing = [string, Date]
type OpenGraphWithDate = OpenGraph & { date: Date }

export class RSSFeed implements EventSource {
  public name: string
  private rssURL: string

  public constructor(name: string, url: string) {
    this.name = name
    this.rssURL = url
  }

  public async fetchListing({}): Promise<Event[]> {
    const links = await this.fetchRSS()
    const openGraphDataList = await this.fetchOpenGraph(links)
    return this.createEvents(openGraphDataList)
  }

  private async fetchRSS(): Promise<RSSListing[]> {
    const parser = new Parser()
    const feed = await parser.parseURL(this.rssURL)
    return feed.items.map(item => [item.link, new Date(item.pubDate)])
  }

  private async fetchOpenGraph(listings: RSSListing[]): Promise<OpenGraphWithDate[]> {
    const promises = listings.map(async ([link, pubDate]) => {
      const options = { url: link }
      try {
        const result = await ogs(options)
        return { date: pubDate, ...result.data }
      } catch (error) {
        console.error(error)
        return null
      }
    })
    const openGraphDataList = await Promise.all(promises)
    return openGraphDataList.filter(data => data !== null)
  }

  private createEvents(openGraphDataList: OpenGraphWithDate[]): Event[] {
    return openGraphDataList.map(data => ({
      name: data.ogTitle,
      link: data.ogUrl,
      image: data.ogImage.url,
      description: data.ogDescription,
      date: data.date,
    }))
  }
}
