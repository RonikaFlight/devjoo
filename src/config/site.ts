export const siteConfig = {
  name: 'DevJoo',
  description: 'بازار هوشمند پروژه‌های تکنولوژی و دیجیتال',
  slogan: 'پروژه مناسب، بدون رقابت بیهوده',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://devjoo.ir',
  apiUrl: process.env.API_URL || 'https://api.devjoo.ir',
  locale: 'fa_IR',
  language: 'fa',
  direction: 'rtl' as const,

  seo: {
    defaultTitle: 'پروژه فریلنسری، برنامه نویسی و دیجیتال | DevJoo',
    defaultDescription: 'در DevJoo پروژه‌های برنامه نویسی، فرانت اند، React، Next.js، وردپرس، طراحی UI/UX، سئو و سایر حوزه‌های دیجیتال را پیدا کنید یا متخصص مناسب پروژه خود را استخدام کنید.',
    titleTemplate: '%s | DevJoo',
    ogImage: '/og-image.png',
  },

  defaultProposalLimit: 10,
  minProposalLimit: 3,
  maxProposalLimit: 20,

  nav: {
    items: [
      { label: 'پروژه‌ها', href: '/projects' },
      { label: 'فریلنسرها', href: '/freelancers' },
      { label: 'دسته‌بندی‌ها', href: '/categories' },
      { label: 'خدمات', href: '/services' },
      { label: 'وبلاگ', href: '/blog' },
    ],
  },

  footer: {
    popularSkills: [
      'React', 'Next.js', 'WordPress', 'Python', 'UI/UX', 'SEO', 'Node.js', 'AI',
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;