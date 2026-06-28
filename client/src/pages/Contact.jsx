import { useState } from 'react'

// Contact page (route "/contact").
// - Controlled form (Name, Email, Message) backed by useState.
// - On submit, POSTs JSON to the Flask backend at /api/contact.
//   The "/api" prefix is proxied to Flask by Vite in dev (see vite.config.js).
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', message: '' }) // clear the form
      } else {
        // Try to surface the backend's error message if present.
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch {
      // Network error / backend not reachable.
      setErrorMsg('Could not reach the server. Please try again later.')
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

          {/* Placeholder email — replace with Carmen's real address. */}
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:hello@cmkart.example">hello@cmkart.example</a>
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
