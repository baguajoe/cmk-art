// Bio page (route "/bio").
// TEXT ONLY — no photo, per spec. Heading + the artist's bio.
export default function Bio() {
  return (
    <div className="page bio">
      <h1>About the Artist</h1>

      <div className="bio-text">
        <p>
          Carmen Kershaw is a self-taught abstract artist and retired
          kindergarten teacher whose work celebrates creativity, emotion, and
          cultural expression. Inspired by talented art teachers at her school,
          she began painting eight years ago and has since developed a unique
          artistic style that reflects her passion for color, movement, and
          storytelling.
        </p>
        <p>
          Carmen's work combines expressive abstract painting with two signature
          techniques. One style features continuous-line artwork created from a
          single uninterrupted line, while another incorporates vibrant African
          fabrics—many gifted by her sister—to add texture, depth, and cultural
          significance to her mixed media pieces.
        </p>
        <p>
          Through abstract art, Carmen enjoys creating work that invites each
          viewer to find their own meaning and emotional connection. She believes
          art should inspire reflection, spark conversation, and bring beauty into
          everyday spaces.
        </p>
        <p>
          Now exhibiting her work publicly, Carmen continues to explore new ideas
          and techniques while creating original pieces for collectors, homes, and
          businesses.
        </p>
      </div>
    </div>
  )
}
