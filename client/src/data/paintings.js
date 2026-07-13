// ============================================================================
//  GALLERY DATA — Carmen Kershaw / CMK Art
// ============================================================================
//
//  HOW TO EDIT THE GALLERY
//  -----------------------
//  Each painting is one object in the array below. The fields are:
//
//       id          — a UNIQUE number. Never reuse an id; the cart, checkout,
//                      and the backend "sold list" all identify a painting by
//                      its id. If you add a painting, give it a new id.
//       title       — name of the piece (edit freely).
//       group       — MUST be exactly "One Line" or "African Fabric". The
//                      gallery groups pieces into sections by this value and the
//                      group filter buttons depend on it.
//       medium      — e.g. 'acrylic on canvas'.
//       size        — physical dimensions, e.g. '14" x 18"'.
//       price       — a WHOLE-DOLLAR NUMBER, e.g. 242 (NOT "$242" and no cents).
//                      Displayed with formatPrice() and included in the order
//                      email, so keep it a plain number.
//       image       — path to the photo, "/images/<filename>" (see below).
//       status      — MUST be exactly "available" or "sold" (lowercase). Sold
//                      pieces show a "Sold" badge and can't be added to the cart.
//       description — a short blurb about the piece. Left as "" for now; fill in
//                      any time — it shows in the lightbox when present.
//
//  HOW TO CHANGE TITLES / PRICES / DESCRIPTIONS
//  --------------------------------------------
//  Just edit the field on the relevant object and save. For a price, change the
//  number (e.g. price: 400). For a description, type text between the quotes
//  (e.g. description: 'A continuous-line study of...').
//
//  HOW TO MARK SOMETHING SOLD  (manual — do this yourself)
//  -------------------------------------------------------
//  Payment is manual (CashApp/Venmo), so nothing marks a painting sold
//  automatically. AFTER you have CONFIRMED a buyer's CashApp (or Venmo) payment
//  actually landed, change that painting's status from "available" to "sold"
//  below and rebuild/redeploy. Sold pieces show a "Sold" badge and can't be
//  added to the cart. See the README "Marking paintings sold" section.
//
//  HOW TO SWAP IMAGES
//  ------------------
//  Real photos live in /client/public/images and are referenced as
//  "/images/<filename>". The simplest approach: overwrite painting1.jpg ..
//  painting12.jpg with real photos of Carmen's work, keeping the same
//  filenames. Or add a new file and update the matching `image` field below.
// ============================================================================

const paintings = [
  // ------------------------------- One Line -------------------------------
  {
    id: 1,
    title: "Momma's Baby",
    group: 'One Line',
    medium: 'acrylic on canvas panel',
    size: '14" x 18"',
    price: 242,
    image: '/images/painting1.jpg',
    status: 'available',
    description: '',
  },
  {
    id: 2,
    title: 'Abstract Male',
    group: 'One Line',
    medium: 'acrylic on canvas',
    size: '10" x 20"',
    price: 200,
    image: '/images/painting2.jpg',
    status: 'available',
    description: '',
  },
  {
    id: 3,
    title: 'Side Profile Afro',
    group: 'One Line',
    medium: 'acrylic on canvas panel',
    size: '18" x 24"',
    price: 400,
    image: '/images/painting3.jpg',
    status: 'available',
    description: '',
  },
  {
    id: 4,
    title: 'Royal Head Wrap',
    group: 'One Line',
    medium: 'acrylic on canvas',
    size: '30" x 30"',
    price: 600,
    image: '/images/painting4.jpg',
    status: 'available',
    description: '',
  },
  {
    id: 5,
    title: 'Queens Crown',
    group: 'One Line',
    medium: 'acrylic on canvas',
    size: '30" x 30"',
    price: 600,
    image: '/images/painting5.jpg',
    status: 'available',
    description: '',
  },

  // ---------------------------- African Fabric ----------------------------
  {
    id: 6,
    title: 'African Queen',
    group: 'African Fabric',
    medium: 'acrylic and fabric on canvas',
    size: '18" x 24"',
    price: 450,
    image: '/images/painting6.jpg',
    status: 'available',
    description: '',
  },
  {
    id: 7,
    title: 'African King',
    group: 'African Fabric',
    medium: 'acrylic and fabric on canvas',
    size: '18" x 24"',
    price: 450,
    image: '/images/painting7.jpg',
    status: 'available',
    description: '',
  },
  {
    id: 8,
    title: 'African Princess',
    group: 'African Fabric',
    medium: 'acrylic and fabric on canvas',
    size: '12" x 16"',
    price: 200,
    image: '/images/painting8.jpg',
    status: 'available',
    description: '',
  },
  {
    id: 9,
    title: 'Sunset Sistahs',
    group: 'African Fabric',
    medium: 'acrylic and fabric on canvas',
    size: '20" x 24"',
    price: 500,
    image: '/images/painting9.jpg',
    status: 'available',
    description: '',
  },
  {
    id: 10,
    title: 'Martin',
    group: 'African Fabric',
    medium: 'acrylic and fabric on canvas',
    size: '20" x 24"',
    price: 500,
    image: '/images/painting10.jpg',
    status: 'available',
    description: '',
  },
  {
    id: 11,
    title: 'Malcolm',
    group: 'African Fabric',
    medium: 'acrylic and fabric on canvas',
    size: '20" x 24"',
    price: 500,
    image: '/images/painting11.jpg',
    status: 'available',
    description: '',
  },
  {
    id: 12,
    title: 'Butterflies Nectar',
    group: 'African Fabric',
    medium: 'acrylic and fabric on canvas',
    size: '12" x 24"',
    price: 300,
    image: '/images/painting12.jpg',
    status: 'available',
    description: '',
  },
]

// The two section groups, in display order. Used by the Gallery page to build
// section headers and the group filter. If you add a new group value above,
// add it here too.
export const GROUPS = ['One Line', 'African Fabric']

export default paintings
