interface EmailOptions {
  to: string
  subject: string
  textBody: string
  from?: string
}

interface PostmarkResponse {
  MessageID: string
  SubmittedAt: string
  To: string
  ErrorCode?: number
  Message?: string
}

import { getTournamentSettings } from './settings'

const POSTMARK_API_KEY = process.env.POSTMARK_API_KEY || ''
const POSTMARK_API_URL = 'https://api.postmarkapp.com/email'
const DEFAULT_FROM_EMAIL = 'classical@schachklub-k4.ch'

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const response = await fetch(POSTMARK_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_API_KEY,
      },
      body: JSON.stringify({
        From: options.from || DEFAULT_FROM_EMAIL,
        To: options.to,
        Subject: options.subject,
        TextBody: options.textBody,
      }),
    })

    const result: PostmarkResponse = await response.json()

    if (!response.ok || result.ErrorCode) {
      console.error('Postmark API error:', result)
      return false
    }

    console.log('Email sent successfully:', result.MessageID)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

// Registration Success Email
export async function sendRegistrationSuccessEmail(
  to: string,
  playerName: string,
  nickname: string
): Promise<boolean> {
  const subject = 'Registration Received - K4 Classical League'
  const textBody = `Hello ${playerName},

Welcome to the K4 Classical League!

Your registration has been submitted successfully. Here are your details:
- Name: ${playerName}
- Nickname: "${nickname}"

Your registration is currently pending approval by our tournament organizers. You'll receive another email once your registration has been approved and you're officially part of the tournament.

In the meantime, you can:
- Join our WhatsApp group: https://chat.whatsapp.com/Dc7GHirC7ce6XabpeHDwIs
- Review the tournament rules at: https://classical.schachklub-k4.ch/rules
- Check tournament links at: https://classical.schachklub-k4.ch/links

If you have any questions, please don't hesitate to contact us.

Good luck in the tournament!

Best regards,
K4 Classical League Tournament Organizers

---
This is an automated message. Please do not reply to this email.`

  return await sendEmail({ to, subject, textBody })
}

// Player Approval Email
export async function sendPlayerApprovalEmail(
  to: string,
  playerName: string,
  nickname: string
): Promise<boolean> {
  // Get tournament settings to include the correct tournament link
  const settings = await getTournamentSettings()
  const tournamentLink =
    settings.tournamentLink ||
    'https://swisssystem.org/tournament/dd5ba09cff1b4ca0972936c5d01dae58'

  const subject = 'Registration Approved - K4 Classical League'
  const textBody = `Hello ${playerName},

Great news! Your registration for the K4 Classical League has been approved.

Your tournament details:
- Name: ${playerName}
- Nickname: "${nickname}"
- Status: Approved ✅

You are now officially part of the tournament! Here's what happens next:

1. Round pairings will be published on SwissSystem.org
2. You'll receive email notifications for each new round
3. Check the tournament page for live pairings and standings: ${tournamentLink}

Important reminders:
- Join our WhatsApp group: https://chat.whatsapp.com/Dc7GHirC7ce6XabpeHDwIs
- Submit bye requests at least 3 days before each round
- Submit your game results promptly after playing
- Stay connected with other players via WhatsApp

Tournament Resources:
- View all players: https://classical.schachklub-k4.ch/players (password: Ke2!!)
- Submit results: https://classical.schachklub-k4.ch/submit-result
- Request byes: https://classical.schachklub-k4.ch/byes
- Tournament links: https://classical.schachklub-k4.ch/links

Welcome to the tournament and good luck!

Best regards,
K4 Classical League Tournament Organizers

---
This is an automated message. Please do not reply to this email.`

  return await sendEmail({ to, subject, textBody })
}

// Bye Request Approved Email
export async function sendByeApprovedEmail(
  to: string,
  playerName: string,
  roundNumber: number,
  roundDate: Date
): Promise<boolean> {
  const subject = `Bye Approved - Round ${roundNumber} - K4 Classical League`
  const textBody = `Hello ${playerName},

Your bye request has been approved for Round ${roundNumber}.

Round Details:
- Round: ${roundNumber}
- Date: ${roundDate.toLocaleDateString('de-CH')}
- Status: Bye Approved ✅

You will not be paired for this round and will receive a bye point. You can return to play in subsequent rounds.

Important:
- No game to play this round
- You automatically receive 0.5 points for the bye
- You'll be included in pairings for future rounds (unless you request more byes)

To view current standings and upcoming rounds:
https://classical.schachklub-k4.ch/links

If you have any questions about your bye or the tournament, please contact the organizers.

See you in the next round!

Best regards,
K4 Classical League Tournament Organizers

---
This is an automated message. Please do not reply to this email.`

  return await sendEmail({ to, subject, textBody })
}

// New Round Pairings Email
export async function sendNewRoundPairingsEmail(
  to: string,
  playerName: string,
  roundNumber: number,
  roundDate: Date,
  hasBye: boolean = false
): Promise<boolean> {
  const subject = `Round ${roundNumber} Pairings Available - K4 Classical League`

  // Calculate the deadline (2 weeks from round date)
  const deadline = new Date(roundDate)
  deadline.setDate(deadline.getDate() + 13) // 2 weeks - 1 day for the deadline

  // Get tournament settings for the correct links
  const settings = await getTournamentSettings()
  const baseLink =
    settings.tournamentLink ||
    'https://swisssystem.org/tournament/dd5ba09cff1b4ca0972936c5d01dae58'
  const roundsLink = `${baseLink}/rounds`
  const standingsLink = `${baseLink}/standings`

  let textBody = ''

  if (hasBye) {
    textBody = `Hello ${playerName},

Great news! The pairings for Round ${roundNumber} of the K4 Classical League are now available.

🎯 YOUR PAIRING
You have received a bye for Round ${roundNumber}.
• You will receive 0.5 points automatically
• No game to play this round
• You'll be back in the pairings for Round ${roundNumber + 1}

📊 TOURNAMENT STATUS
View current standings: ${standingsLink}
Check all pairings: ${roundsLink}

💬 STAY CONNECTED
WhatsApp Group: https://chat.whatsapp.com/Dc7GHirC7ce6XabpeHDwIs
Join our group to stay updated with tournament news and connect with other players!

📋 USEFUL LINKS
• Player Directory: https://classical.schachklub-k4.ch/players
  Password: Ke2!!
• Request future byes: https://classical.schachklub-k4.ch/byes

See you in the next round!

Best regards,
K4 Classical League Tournament Organizers

---
This is an automated message. Please do not reply to this email.`
  } else {
    textBody = `Hello ${playerName},

Great news! The pairings for Round ${roundNumber} of the K4 Classical League are now available.

🎯 YOUR PAIRING
Check your opponent, board number, and colors: ${roundsLink}

📅 SCHEDULING YOUR GAME
• Playing window: ${roundDate.toLocaleDateString('de-CH')} to ${deadline.toLocaleDateString('de-CH')} (2 weeks)
• Contact your opponent within 24 hours to schedule your game
• Be flexible and accommodating with scheduling

📞 CONTACTING YOUR OPPONENT
Player Directory: https://classical.schachklub-k4.ch/players
Password: Ke2!!
Find your opponent's phone number and email in the directory.

⚠️ HAVING TROUBLE?
If you don't hear back from your opponent within 24 hours or have scheduling difficulties:
• Post in our WhatsApp group for help
• Contact the tournament organizers
• We're here to help ensure games get played!

💬 WHATSAPP GROUP
Join if you haven't already: https://chat.whatsapp.com/Dc7GHirC7ce6XabpeHDwIs
This is the best place to:
• Get help with scheduling issues
• Connect with other players
• Stay updated with tournament news

📋 AFTER YOUR GAME
• Submit result immediately: https://classical.schachklub-k4.ch/submit-result
• Include the PGN notation
• Both players should verify the result

📊 TOURNAMENT INFO
• Current standings: ${standingsLink}
• All pairings: ${roundsLink}
• Need a bye? Request early: https://classical.schachklub-k4.ch/byes

Good luck with your game! May the best player win! ♟️

Best regards,
K4 Classical League Tournament Organizers

---
This is an automated message. Please do not reply to this email.`
  }

  return await sendEmail({ to, subject, textBody })
}

// Admin Notification: New Registration
export async function sendAdminNewRegistrationEmail(
  playerName: string,
  nickname: string,
  email: string
): Promise<boolean> {
  const subject = 'New Registration - K4 Classical League'
  const textBody = `A new player has registered for the tournament!

Player Details:
- Name: ${playerName}
- Nickname: "${nickname}"
- Email: ${email}

Please review and approve this registration in the admin panel:
https://classical.schachklub-k4.ch/admin/players

Best regards,
K4 Classical League System`

  return await sendEmail({
    to: 'classical@schachklub-k4.ch',
    subject,
    textBody,
  })
}

// Admin Notification: New Bye Request
export async function sendAdminNewByeRequestEmail(
  playerName: string,
  roundNumber: number,
  reason: string
): Promise<boolean> {
  const subject = 'New Bye Request - K4 Classical League'
  const textBody = `A player has requested a bye for an upcoming round.

Bye Request Details:
- Player: ${playerName}
- Round: ${roundNumber}
- Reason: ${reason}

Please review and approve this bye request in the admin panel:
https://classical.schachklub-k4.ch/admin/byes

Best regards,
K4 Classical League System`

  return await sendEmail({
    to: 'classical@schachklub-k4.ch',
    subject,
    textBody,
  })
}

// Utility function to send emails with error handling
export async function sendEmailSafe(
  emailFunction: () => Promise<boolean>,
  context: string
): Promise<void> {
  try {
    const success = await emailFunction()
    if (!success) {
      console.error(`Failed to send ${context} email`)
    }
  } catch (error) {
    console.error(`Error sending ${context} email:`, context, error)
  }
}
