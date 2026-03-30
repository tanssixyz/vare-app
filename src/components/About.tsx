import { useState } from "react"

export function About() {
  const [open, setOpen] = useState(true)

  return (
    <div className="about">
      <button
        className="about-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        what is väre{open ? " ↑" : " ↓"}
      </button>

      {open && (
        <div className="about-body">
          <p>
            A väre is a gathering around something that exists in the world —
            a piece of music, a text, a moment in time.
          </p>
          <p>
            People who were moved by it can mark their resonance here.
            No message. No recipient. Nothing shared but the fact of being moved.
          </p>
          <p>
            Each mark receives a unique colour derived from that specific moment
            on the chain. The gathering closes when the window passes.
            What remains is permanent — who was here, and when.
          </p>
          <p className="about-etymology">
            from Finnish — <em>väre</em>, a shimmer, a ripple,
            the signal before contact
          </p>
        </div>
      )}
    </div>
  )
}
