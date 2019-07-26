import config from './config'
import { email } from './email'
import { sfJazz } from './sf-jazz'
import { generateHTML } from './event'

const run = async () => {
  try {
    const openGraphEvents = await sfJazz.fetchListing()
    const generatedHTML = generateHTML(sfJazz, openGraphEvents)
    email('SF Events!', generatedHTML, config.recipients, config.emailUserName, config.password)
  } catch(error) {
    console.error(error)
    return
  }
}

run()
