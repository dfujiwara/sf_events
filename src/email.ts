const emailSend = require('gmail-send')

export const email = (
    subject: string,
    html: string,
    recipients: string[],
    emailUserName: string,
    password: string
) => {
  const sendEmail = emailSend({
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

export const generateHTML = (openGraphEvents) => {
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