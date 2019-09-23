import { SFJazz } from './sf-jazz'
import * as needle from 'needle'
import * as ogs from 'open-graph-scraper'

jest.mock('needle')
jest.mock('open-graph-scraper')

describe('For SFJazz site', () => {
  let sfJazz: SFJazz
  beforeEach(() => {
    sfJazz = new SFJazz()
  })
  test('ensure that SFJazz API fetch error is handled correctly', () => {
    needle.mockResolvedValue({ statusCode: 400 })
    expect.assertions(1)
    return sfJazz.fetchListing(new Date()).catch(e => expect(e).toMatch('Error with response code of 400'))
  })
  test('no data from the SFJazz API results in empty events', async () => {
    needle.mockResolvedValue({ statusCode: 200, body: [] })
    const events = await sfJazz.fetchListing(new Date())
    expect(events.length).toBe(0)
  })
  describe('with valid data from SFJazz API', () => {
    beforeEach(() => {
      const sampleAPIData = {
        eventDate: '2019-09-22T18:00:00',
        name: 'Broken Shadows',
        detailsLink: '/tickets/productions/broken-shadows-1920/',
      }
      needle.mockResolvedValue({ statusCode: 200, body: [sampleAPIData] })
      ogs.mockResolvedValue({
        data: {
          ogTitle: 'Title',
          ogUrl: 'https://sample.com/sampleEvent',
          ogDescription: 'Description',
          ogImage: { url: 'https://sample.com/image.jpg' },
        },
      })
    })
    test('successfully retrieves a SFJazz event', async () => {
      const events = await sfJazz.fetchListing(new Date())
      expect(events.length).toBe(1)
    })
    test('the retrieve SFJazz event matches what is expected', async () => {
      const events = await sfJazz.fetchListing(new Date())
      const event = events[0]
      expect(event.name).toBe('Broken Shadows')
      expect(event.description).toBe('Description')
      expect(event.link).toBe('https://sample.com/sampleEvent')
      expect(event.image).toBe('https://sample.com/image.jpg')
      expect(event.date).toStrictEqual(new Date('2019-09-22T18:00:00'))
    })
  })
})
