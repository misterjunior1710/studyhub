// Shared StudyHub brand tokens for auth email templates.
// Keep in sync with the app's primary color (hsl(243, 75%, 58%)).

export const BRAND = {
  name: 'StudyHub',
  url: 'https://studyhub.world',
  logoUrl: 'https://i.ibb.co/rKYZq3k4/Study-Hub.png',
  tagline: 'Your study squad, all in one place.',
  supportEmail: 'studyhub.community.web@gmail.com',
  primary: 'hsl(243, 75%, 58%)',
  primaryDark: 'hsl(243, 75%, 48%)',
}

export const styles = {
  main: {
    backgroundColor: '#f6f7fb',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: '24px 12px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '40px 32px',
    maxWidth: '560px',
    margin: '0 auto',
    boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06)',
  },
  logoWrap: {
    textAlign: 'center' as const,
    margin: '0 0 24px',
  },
  logo: {
    display: 'block',
    margin: '0 auto',
    borderRadius: '12px',
  },
  h1: {
    fontSize: '26px',
    lineHeight: '1.25',
    fontWeight: 700 as const,
    color: 'hsl(0, 0%, 9%)',
    margin: '0 0 16px',
    textAlign: 'center' as const,
    letterSpacing: '-0.01em',
  },
  text: {
    fontSize: '16px',
    color: 'hsl(0, 0%, 25%)',
    lineHeight: '1.65',
    margin: '0 0 20px',
    textAlign: 'center' as const,
  },
  textLeft: {
    fontSize: '16px',
    color: 'hsl(0, 0%, 25%)',
    lineHeight: '1.65',
    margin: '0 0 20px',
  },
  link: { color: 'hsl(243, 75%, 58%)', textDecoration: 'underline', fontWeight: 600 as const },
  buttonWrap: { textAlign: 'center' as const, margin: '28px 0 24px' },
  button: {
    backgroundColor: 'hsl(243, 75%, 58%)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 700 as const,
    borderRadius: '999px',
    padding: '16px 36px',
    textDecoration: 'none',
    display: 'inline-block',
    boxShadow: '0 6px 16px rgba(79, 70, 229, 0.35)',
  },
  hint: {
    fontSize: '13px',
    color: 'hsl(0, 0%, 45%)',
    lineHeight: '1.6',
    textAlign: 'center' as const,
    margin: '8px 0 0',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #eef0f5',
    margin: '32px 0 24px',
  },
  footer: {
    textAlign: 'center' as const,
    margin: '24px auto 0',
    maxWidth: '560px',
  },
  footerLogo: {
    display: 'block',
    margin: '0 auto 12px',
    borderRadius: '8px',
  },
  footerBrand: {
    fontSize: '14px',
    fontWeight: 700 as const,
    color: 'hsl(243, 75%, 58%)',
    textDecoration: 'none',
  },
  footerText: {
    fontSize: '12px',
    color: 'hsl(0, 0%, 45%)',
    margin: '8px 0 0',
    lineHeight: '1.6',
  },
  codeBox: {
    fontSize: '36px',
    fontWeight: 800 as const,
    letterSpacing: '0.4em',
    color: 'hsl(243, 75%, 58%)',
    textAlign: 'center' as const,
    backgroundColor: '#f1f3ff',
    borderRadius: '14px',
    padding: '20px 12px',
    margin: '12px 0 24px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
}
