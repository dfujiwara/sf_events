import config from './config'
import { email } from './email'
import SFJazz from './sf-jazz'

const run = async () => {
  try {
    const sfJazz = new SFJazz()
    const openGraphEvents = await sfJazz.fetchListing()
    const generatedHTML = generateHTML(openGraphEvents)
    email('SF JAZZ!', generatedHTML, config.recipients, config.emailUserName, config.password)
  } catch(error) {
    console.error(error)
    return
  }
}

const generateHTML = (openGraphEvents) => {
  const divCollection = openGraphEvents
    .map((openGraphEvent) => {
      const [event, openGraph] = openGraphEvent
      return `
        <div>
          <a href='${event.link}'>${event.name}</a> - <time>${event.date}</time>
          <div>${openGraph.description || 'No description'}</div>
          <div>
            <img src='${openGraph.image}'/>
          </div>
        </div>`
    })
    .reduce((html, eventDiv) => html + eventDiv, '')
  return `
  <!doctype html>
  <html>
    <head>
    </head>
    <body>
      ${divCollection}
    </body>
  </html>
  `
}

run()
