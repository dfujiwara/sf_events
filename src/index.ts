import config from './config'
import { email } from './email'
import { SFJazz } from './sf-jazz'
import { generateHTML, EventSource } from './event'

const run = async (eventSources: EventSource[]) => {
  try {
    const eventPromises = eventSources.map(async (eventSource) => {
      const openGraphEvents = await eventSource.fetchListing(new Date())
      return generateHTML(eventSource, openGraphEvents)
    })
    const generatedHTMLSnippets = await Promise.all(eventPromises)
    email('SF Events!', generatedHTMLSnippets.join('\n'), config.recipients, config.emailUserName, config.password)
  } catch(error) {
    console.error(error)
    return
  }
}

run([new SFJazz()])
