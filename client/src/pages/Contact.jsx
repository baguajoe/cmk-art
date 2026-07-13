import { useState } from 'react'
import config, { FORMSPREE_ENDPOINT } from '../config.js'

// Contact page (route "/contact").
// - Controlled form (Name, Email, Message) backed by useState.
// - On submit, POSTs JSON to Formspree (see /src/config.js) — the same static,
//   no-backend service the Checkout page uses. Formspree emails Carmen the
//   message. No Flask backend required.
// - Shows a success message on HTTP 200 and an error message on failure,
//   all without reloading the page.
export default function Contact() {
  // Form field values.
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  // Submission state: 'idle' | 'sending' | 'success' | 'error'
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Generic change handler — updates whichever field fired the event.
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // prevent the default full-page reload
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...form,
          type: 'CONTACT MESSAGE',
          _subject: `CMK Art contact — ${form.name.trim()}`,
        }),
      })

      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', message: '' }) // clear the form
      } else {
        // Formspree returns { errors: [{ message }] } on failure.
        const data = await res.json().catch(() => ({}))
        const firstError =
          Array.isArray(data.errors) && data.errors[0]?.message
        setErrorMsg(firstError || 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch {
      // Network error / service not reachable.
      setErrorMsg('Could not send your message. Please try again later.')
      setStatus('error')
    }
  }

  return (
    <div className="page contact">
      <h1>Get in Touch</h1>
      <p className="contact-intro">
        Interested in a piece, a commission, or just want to say hello? Send a
        message below and Carmen will get back to you.
      </p>

      <div className="contact-layout">
        {/* ---------- Form ---------- */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Message
            <textarea
              name="message"
              rows="6"
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>

          {/* Inline status feedback */}
          {status === 'success' && (
            <p className="form-feedback success">
              Thank you! Your message has been sent.
            </p>
          )}
          {status === 'error' && (
            <p className="form-feedback error">{errorMsg}</p>
          )}
        </form>

        {/* ---------- Contact details / links ---------- */}
        <aside className="contact-details">
          <h2>Other ways to connect</h2>

          {/* Placeholder email — replace with Carmen's real address if different. */}
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:cmkart@gmail.com">cmkart@gmail.com</a>
          </p>

          {/* CashApp handle pulled from config so it stays in one place. */}
          <p>
            <strong>CashApp:</strong> {config.CASHAPP_HANDLE}
          </p>

          <p>
            <strong>Facebook:</strong>{' '}
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CMK Art on Facebook
            </a>
          </p>

          {/* Instagram — uncomment and add the real handle when ready:
          <p>
            <strong>Instagram:</strong>{' '}
            <a
              href="https://www.instagram.com/your-handle"
              target="_blank"
              rel="noopener noreferrer"
            >
              @your-handle
            </a>
          </p>
          */}
        </aside>
      </div>
    </div>
  )
}
