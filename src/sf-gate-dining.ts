import * as ogs from 'open-graph-scraper'
import * as Parser from 'rss-parser'
import { OpenGraph, EventSource, Event } from './event'

export class SFGateDining implements EventSource {
  public name = 'SF Gate Dining'
  private rssURL = 'https://www.sfgate.com/rss/feed/Food-Dining-550.php'

  public async fetchListing({}): Promise<Event[]> {
    const links = await this.fetchRSS()
    const openGraphDataList = await this.fetchOpenGraph(links)
    return this.createEvents(openGraphDataList)
  }

  private async fetchRSS(): Promise<string[]> {
    const parser = new Parser()
    const feed = await parser.parseURL(this.rssURL)
    return feed.items.map(item => item.link)
  }

  private async fetchOpenGraph(links: string[]): Promise<OpenGraph[]> {
    const promises = links.map(async link => {
      const options = { url: link }
      const result = await ogs(options)
      const openGraph = result.data
      return openGraph
    })
    return Promise.all(promises)
  }

  private createEvents(openGraphDataList: OpenGraph[]): Event[] {
    return openGraphDataList.map(data => ({
      name: data.ogTitle,
      link: data.ogUrl,
      image: data.ogImage.url,
      description: data.ogDescription,
      date: new Date(),
    }))
  }
}
