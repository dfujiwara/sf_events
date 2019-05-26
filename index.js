const needle = require('needle');
const ogs = require('open-graph-scraper')

class Event {
  constructor(eventData, domain= 'https://www.sfjazz.org') {
    this.name = eventData.name
    this.date = new Date(eventData.eventDate)
    this.link = `${domain}${eventData.detailsLink}`
  }

  get summary() {
    return `${this.name} at ${this.date.toDateString()}. More details at ${this.link}`
  }
}

class OpenGraph {
  constructor (openGraphData) {
    this.title = openGraphData.data.ogTitle  
    this.url = openGraphData.data.ogUrl
    this.image = openGraphData.data.ogImage.url
  }
}

const run = async () => {
  try {
    const eventData = await fetchListing()
    const events = dedupeEvents(eventData.map((data) => new Event(data)))
    events.forEach(async (event) => {
      try {
        const result = await fetchEventPageOpenGraphData(event)
        console.log(result)
      } catch (error) {
        console.error(error)
      }
    })
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
      return false
    }
    linkSet.add(event.link)
    return true
  })
}

run()