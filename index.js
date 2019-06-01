const needle = require('needle');
const ogs = require('open-graph-scraper')
const gmailSend = require('gmail-send')
const config = require('./config')

class Event {
  constructor(eventData, domain= 'https://www.sfjazz.org') {
    this.name = eventData.name
    this.date = new Date(eventData.eventDate)
    this.link = `${domain}${eventData.detailsLink}`
  }
}

class OpenGraph {
  constructor (openGraphData) {
    this.title = openGraphData.data.ogTitle  
    this.url = openGraphData.data.ogUrl
    this.image = openGraphData.data.ogImage.url
    this.description = openGraphData.data.ogDescription
  }
}

const run = async () => {
  try {
    const eventData = await fetchListing()
    const events = dedupeEvents(eventData.map((data) => new Event(data)))
    const openGraphPromises = events
      .map(async (event) => {
        try {
          return [event, await fetchEventPageOpenGraphData(event)]
        } catch (error) {
          console.error(error)
          return null
        }
      })
    const openGraphEvents = await Promise.all(openGraphPromises)
    const filteredOpenGraphEvents = openGraphEvents.filter((tuple) => tuple !== null)
    const generatedHTML = generateHTML(filteredOpenGraphEvents)
    email('SF JAZZ!', generatedHTML)
  } catch(error) {
    console.error(error)
    return
  }
}

const fetchListing = async (date = new Date()) => {
  const url = generateURL(date)
  return await fetch(url)
}

const fetch = async (url) => {
  const response = await needle('get', url)
  if (response.statusCode !== 200) {
    throw `Error with response code of ${response.statusCode}`
  }
  return response.body
}

const generateURL = (date) => {
  const twoWeeksInMilliseconds = 14 * 24 * 60 * 60 * 1000
  const futureDate = new Date(date.getTime() + twoWeeksInMilliseconds)
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  const futureDateString = `${futureDate.getFullYear()}-${futureDate.getMonth() + 1}-${futureDate.getDate()}`
  const url = `https://www.sfjazz.org/ace-api/events?startDate=${dateString}&endDate=${futureDateString}`
  return url
}

const fetchEventPageOpenGraphData = async (event) => {
  const options = {url: event.link}
  const result = await ogs(options)
  return new OpenGraph(result)
}

const dedupeEvents = (events) => {
  const linkSet = new Set()
  return events.filter((event) => {
    if (linkSet.has(event.link)) {
      console.log(`deduping ${event.link}`)
      return false
    }
    linkSet.add(event.link)
    return true
  })
}

const generateHTML = (openGraphEvents) => {
  const divCollection = openGraphEvents
    .map((openGraphEvent) => {
      const [event, openGraph] = openGraphEvent
      return `
        <div>
          <a href='${event.link}'>${event.name}</a> - ${event.date}
          <img src='${openGraph.image}'>
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

const email = (subject, html, recipients = config.recipients, emailUserName = config.emailUserName, password = config.password) => {
  const sendEmail = gmailSend({
    user: emailUserName,
    pass: password,
    subject: subject,
    html: html
  })

  recipients.map(recipient => {
    sendEmail({ to: recipient }, (err, res) => {
      if (err != null) {
        console.error(err)
      } else {
        console.log(res)
      }
    })
  })
}
run()
