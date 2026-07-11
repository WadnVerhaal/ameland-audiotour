export const amelandBrand = {
  name: 'Ameland Audiotours',
  fromName: 'Bjorn & Sander',
  fromEmail: 'info@amelandaudiotours.nl',
  websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.amelandaudiotours.nl',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://app.amelandaudiotours.nl',

  colors: {
    deepGreen: '#244439',
    green: '#3f6f5a',
    softGreen: '#edf4ee',
    sand: '#f4ead8',
    warmSand: '#dfc9a6',
    cream: '#fffaf1',
    ink: '#20312b',
    muted: '#68776f',
    white: '#ffffff',
  },

  radius: {
    large: '28px',
    medium: '18px',
    small: '12px',
  },
} as const
