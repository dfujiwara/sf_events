import * as ogs from 'open-graph-scraper'
import * as Parser from 'rss-parser'
import { OpenGraph, EventSource, Event } from 'event'

type RSSListing = [string, Date]
type OpenGraphWithDate = OpenGraph & { date: Date }

export class SFGateDining implements EventSource {
  public name = 'SF Gate Dining'
  private rssURL = 'https://www.sfgate.com/rss/feed/Food-Dining-550.php'

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
      const result = await ogs(options)
      return { date: pubDate, ...result.data }
    })
    return Promise.all(promises)
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
