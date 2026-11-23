/* ==========================================================
   MAISON ÉLAN — central configuration
   Edit ONLY this file to change contact details site-wide.
   ========================================================== */
window.MAISON_CONFIG = {
  // ---- Phone & WhatsApp (one number, used everywhere) ----
  // Enter the 10-digit Indian mobile number: digits only, no spaces, no +91.
  // Example format:  phoneNumber: "9XXXXXXXXX"
  // While this is empty, Call/WhatsApp buttons show a notice instead of dialling a wrong number.
  countryCode: "91",
  phoneNumber: "8591690498",

  whatsappMessage:
    "Hello MAISON ÉLAN, I'm interested in your interior design services and would like to book a consultation.",

  // ---- Business details ----
  email: "hello@maisonelan.example", // temporary placeholder
  locationText: "Bandra West, Mumbai, Maharashtra, India",
  mapsQuery: "Bandra West, Mumbai, Maharashtra, India", // general area only — no invented street address
  hours: "Monday–Saturday, 10 AM–7 PM",

  // ---- Social links (leave "" until real profiles exist) ----
  social: {
    instagram: "",
    facebook: ""
  },

  // ---- Consultation form delivery ----
  // Paste the endpoint of a real form service, e.g. Formspree:  https://formspree.io/f/xxxxxxxx
  // While empty, the form validates but will NOT claim success (it tells the visitor to call/WhatsApp/email).
  formEndpoint: "",
  // Extra fields some services require (e.g. Web3Forms: { access_key: "YOUR_KEY" }).
  formExtraFields: {}
};
