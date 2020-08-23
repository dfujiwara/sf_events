import config from './config'
import { email } from './email'
import { SFJazz } from './sf-jazz'
import { SFGateDining } from './sf-gate-dining'
import { generateHTML, EventSource } from './event'

const run = async (eventSources: EventSource[]) => {
  const eventPromises = eventSources.map(async eventSource => {
    const events = await eventSource.fetchListing(new Date())
    return generateHTML(eventSource, events)
  })
  const generatedHTMLSnippets = await Promise.all(eventPromises)
  email('SF Events!', generatedHTMLSnippets.join('\n'), config.recipients, config.emailUserName, config.password)
}

export function sfEvents() {
  return run([new SFJazz(), new SFGateDining()])
}
