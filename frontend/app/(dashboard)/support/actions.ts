"use server"

export async function submitSupportTicket(formData: FormData) {
  const email = formData.get("email") as string
  const message = formData.get("message") as string

  if (!email || !message) {
    return { error: "Please provide both an email and a message." }
  }

  // Retrieve the Resend API key
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Fallback to simulate success if no API key is provided yet
    console.log(`[SIMULATED EMAIL] To: abdulkuduszakaria360@gmail.com | From: ${email} | Msg: ${message}`)
    await new Promise(resolve => setTimeout(resolve, 1500))
    return { success: true }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Credit Passport Support <onboarding@resend.dev>",
        to: "abdulkuduszakaria360@gmail.com",
        subject: `New Support Request from ${email}`,
        text: `You have received a new support ticket from your Credit Passport system.\n\nUser Email: ${email}\n\nMessage:\n${message}`,
        reply_to: email,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error("Resend API Error:", errorData)
      return { error: "Failed to send email. Please check the server logs." }
    }

    return { success: true }
  } catch (err: any) {
    console.error("Network error sending email:", err)
    return { error: "A network error occurred while sending the email." }
  }
}
