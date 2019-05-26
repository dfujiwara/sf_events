const needle = require('needle');

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

const run = async () => {
  const eventData = await fetchData()
  eventData.forEach((event) => {
    const eventInstance = new Event(event)
    console.log(eventInstance.summary)
  })
}

const fetchData = async (date = new Date()) => {
  const url = generateURL(date)
  const response = await needle('get', url)
  if (response.statusCode !== 200) {
    throw `Error with response code of ${response.statusCode}`
  }
  return response.body
}

const generateURL = (date) => {
  const monthInMilliseconds = 30 * 24 * 60 * 60 * 1000
  const futureDate = new Date(date.getTime() + monthInMilliseconds)
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  const futureDateString = `${futureDate.getFullYear()}-${futureDate.getMonth() + 1}-${futureDate.getDate()}`
  const url = `https://www.sfjazz.org/ace-api/events?startDate=${dateString}&endDate=${futureDateString}`
  return url
}

run()