// ============================================================================
//  GALLERY DATA — Carmen Kershaw / CMK Art
// ============================================================================
//
//  HOW TO EDIT THE GALLERY
//  -----------------------
//  1. Each painting is one object in the array below.
//  2. To change a painting's details, edit its fields:
//       title   — name of the piece
//       image   — path to the photo (see "swapping images" below)
//       medium  — e.g. "Acrylic on canvas", "Mixed media with African fabric"
//       size    — physical dimensions, e.g. '24" x 36"'
//       year    — year created
//       price   — display string, e.g. "$450" (or "—" if not for sale)
//       status  — MUST be exactly "Available" or "Sold"
//                 (the gallery filters and badge styling depend on this)
//  3. To ADD a painting: copy a block, paste it, and edit the fields.
//  4. To REMOVE a painting: delete its block.
//
//  HOW TO SWAP IMAGES
//  ------------------
//  Real photos live in /client/public/images and are referenced as
//  "/images/<filename>". To use a real photo of Carmen's work, drop the
//  file into that folder (e.g. painting1.jpg) and keep the same name, OR
//  rename it and update the matching `image` field below.
//  The placeholder files painting1.jpg .. painting12.jpg can simply be
//  overwritten with the real artwork photos.
// ============================================================================

const paintings = [
  {
    title: 'Single Thread',
    image: '/images/painting1.jpg',
    medium: 'Continuous-line ink on canvas',
    size: '24" x 30"',
    year: 2024,
    price: '$520',
    status: 'Available',
  },
  {
    title: 'Kente Rhythm',
    image: '/images/painting2.jpg',
    medium: 'Mixed media with African fabric',
    size: '30" x 40"',
    year: 2023,
    price: '$780',
    status: 'Sold',
  },
  {
    title: 'Emotive Field',
    image: '/images/painting3.jpg',
    medium: 'Acrylic on canvas',
    size: '20" x 20"',
    year: 2024,
    price: '$340',
    status: 'Available',
  },
  {
    title: 'Unbroken',
    image: '/images/painting4.jpg',
    medium: 'Continuous-line ink on paper',
    size: '18" x 24"',
    year: 2022,
    price: '$295',
    status: 'Available',
  },
  {
    title: 'Sister Cloth',
    image: '/images/painting5.jpg',
    medium: 'Mixed media with African fabric',
    size: '36" x 48"',
    year: 2023,
    price: '$1,200',
    status: 'Sold',
  },
  {
    title: 'Morning Movement',
    image: '/images/painting6.jpg',
    medium: 'Acrylic on canvas',
    size: '24" x 36"',
    year: 2025,
    price: '$610',
    status: 'Available',
  },
  {
    title: 'Story in Color',
    image: '/images/painting7.jpg',
    medium: 'Acrylic and collage on canvas',
    size: '30" x 30"',
    year: 2024,
    price: '$540',
    status: 'Available',
  },
  {
    title: 'Quiet Conversation',
    image: '/images/painting8.jpg',
    medium: 'Continuous-line ink on canvas',
    size: '16" x 20"',
    year: 2022,
    price: '$260',
    status: 'Sold',
  },
  {
    title: 'Cultural Threads',
    image: '/images/painting9.jpg',
    medium: 'Mixed media with African fabric',
    size: '24" x 48"',
    year: 2024,
    price: '$890',
    status: 'Available',
  },
  {
    title: 'Reflection No. 3',
    image: '/images/painting10.jpg',
    medium: 'Acrylic on canvas',
    size: '20" x 24"',
    year: 2023,
    price: '$380',
    status: 'Available',
  },
  {
    title: 'Inner Landscape',
    image: '/images/painting11.jpg',
    medium: 'Acrylic and ink on canvas',
    size: '36" x 36"',
    year: 2025,
    price: '$720',
    status: 'Available',
  },
  {
    title: 'Heritage',
    image: '/images/painting12.jpg',
    medium: 'Mixed media with African fabric',
    size: '40" x 60"',
    year: 2024,
    price: '$1,450',
    status: 'Sold',
  },
]

export default paintings
