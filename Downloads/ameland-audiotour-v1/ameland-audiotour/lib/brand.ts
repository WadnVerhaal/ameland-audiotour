export const amelandBrand = {
  name: 'Ameland Audiotours',
  fromName: 'Bjorn & Sander',
  fromEmail: 'info@amelandaudiotours.nl',
  websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.amelandaudiotours.nl',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://app.amelandaudiotours.nl',
  logoUrl: process.env.NEXT_PUBLIC_EMAIL_LOGO_URL || 'https://app.amelandaudiotours.nl/icon.png',
  heroImageUrl: process.env.NEXT_PUBLIC_EMAIL_HERO_URL || 'https://app.amelandaudiotours.nl/images/tour-duinen-v2.webp',

  colors: {
    deepGreen: '#003b4d',
    green: '#003b4d',
    softGreen: '#f4f1ec',
    sand: '#f1eadf',
    warmSand: '#e96551',
    cream: '#fffdf8',
    ink: '#082f3e',
    muted: '#667067',
    white: '#ffffff',
  },

  radius: {
    large: '28px',
    medium: '18px',
    small: '12px',
  },
} as const
