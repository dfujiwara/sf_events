import config from './config'
import { email } from './email'
import { RSSFeed } from './rss-feed'
import { generateHTML, EventSource } from './event'

const run = async (eventSources: EventSource[]) => {
  try {
    const eventPromises = eventSources.map(async eventSource => {
      const events = await eventSource.fetchListing(new Date())
      return generateHTML(eventSource, events)
    })
    const generatedHTMLSnippets = await Promise.all(eventPromises)
    email('SF Events!', generatedHTMLSnippets.join('\n'), config.recipients, config.emailUserName, config.password)
  } catch (error) {
    console.error(error)
    throw error
  }
}

export function sfEvents() {
  const sfGateDining = new RSSFeed('SF Gate Dining', 'https://www.sfgate.com/rss/feed/Food-Dining-550.php')
  const wireCutter = new RSSFeed('WireCutter', 'https://www.nytimes.com/wirecutter/feed/')
  return run([sfGateDining, wireCutter])
}
