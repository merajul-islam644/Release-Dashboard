export const defaultDictionary = {
  "app.name": "Lattice",
  "nav.home": "Home",
  "nav.deployments": "Deployments",
  "nav.verification": "Verification",
  "nav.issues": "Issues",
  "nav.testRuns": "Test Runs",
  "nav.reports": "Reports",
  "nav.settings": "Settings",
  "nav.logout": "Log out",
  "auth.welcome": "Welcome back",
  "auth.subtitle": "Sign in to continue to Lattice.",
  "auth.continue": "Continue to Lattice",
  "auth.redirecting": "Redirecting...",
  "auth.notConfigured": "Login is not configured yet.",
  "auth.failed": "Sign-in failed",
  "auth.back": "Back to sign in",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.refresh": "Refresh",
  "common.loading": "Loading",
  "common.error": "Something went wrong",
  "notFound.title": "404",
  "notFound.message": "This page does not exist.",
  "notFound.home": "Back home"
} as const;

export type TranslationKey = keyof typeof defaultDictionary;