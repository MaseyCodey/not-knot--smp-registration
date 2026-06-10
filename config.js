/*
  Not KNOT SMP site config
  1) Upload this whole folder to GitHub.
  2) Turn on GitHub Pages.
  3) For real response storage, deploy the Google Apps Script in backend/google-apps-script/Code.gs
     and paste the /exec URL below.
*/
window.SMP_CONFIG = {
  siteTitle: "Not KNOT SMP",
  formTitle: "Not KNOT SMP registration",
  formSubtitle: "You want to join. We all know.",

  // Paste your Google Apps Script Web App URL here after deployment.
  // Example: "https://script.google.com/macros/s/AKfycbxxxxx/exec"
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbxqW0n9W5dlqy81RDTSKUyzWZUOL6dUpMtXOqOysZNx0q4jTypn8zEh_u1e_vPWC_uKww/exec",

  // Local demo admin password only. This is NOT secure for a public site.
  // Real admin security comes from the ADMIN_KEY inside Code.gs.
  localAdminPassword: "AdminNotKnot2026",

  // Helpful for testing. Keeps a backup copy in the browser that submitted it.
  keepLocalBackup: true
};
