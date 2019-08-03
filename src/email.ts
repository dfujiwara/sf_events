const emailSend = require('gmail-send')

export const email = (subject: string, html: string, recipients: string[], emailUserName: string, password: string) => {
  const sendEmail = emailSend({
    user: emailUserName,
    pass: password,
    subject: subject,
    html: html,
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
