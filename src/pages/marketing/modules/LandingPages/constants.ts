import { ThemePreset, LandingPageConfig, PageComponent } from './types';

export const THEME_PRESETS: Record<string, ThemePreset> = {
  minimal: {
    name: 'Minimal Snow',
    bgColor: '#ffffff',
    bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    primaryColor: '#0f172a',
    fontFamily: 'font-sans',
    textColor: '#1e293b'
  },
  sunset: {
    name: 'Sunset Dream',
    bgColor: '#fffdfa',
    bgGradient: 'linear-gradient(135deg, #ffedd5 0%, #fef3c7 50%, #fee2e2 100%)',
    primaryColor: '#ea580c',
    fontFamily: 'font-serif',
    textColor: '#431407'
  },
  luxury: {
    name: 'Elegant Luxury',
    bgColor: '#171717',
    bgGradient: 'linear-gradient(135deg, #0a0a0a 0%, #171717 50%, #262626 100%)',
    primaryColor: '#d4af37', // Gold
    fontFamily: 'font-serif',
    textColor: '#f5f5f5'
  },
  neon: {
    name: 'Neon Cyber',
    bgColor: '#030712',
    bgGradient: 'linear-gradient(135deg, #030712 0%, #111827 100%)',
    primaryColor: '#ec4899', // Pink
    fontFamily: 'font-mono',
    textColor: '#f9fafb'
  },
  forest: {
    name: 'Forest Retreat',
    bgColor: '#fcfdfa',
    bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    primaryColor: '#16a34a',
    fontFamily: 'font-sans',
    textColor: '#14532d'
  }
};

export const COMPONENT_PALETTE = [
  {
    type: 'hero',
    label: 'Hero Block',
    description: 'Headline, sub-headline, and quick CTA button.',
    iconName: 'Layout'
  },
  {
    type: 'image',
    label: 'Image Frame',
    description: 'High quality picture with link & borders.',
    iconName: 'Image'
  },
  {
    type: 'video',
    label: 'Video Player',
    description: 'Embed YouTube or direct MP4 streams.',
    iconName: 'Video'
  },
  {
    type: 'button',
    label: 'Action Button',
    description: 'Clickable call-to-action button.',
    iconName: 'MousePointer'
  },
  {
    type: 'social',
    label: 'Social Links',
    description: 'Clean row of active brand profiles.',
    iconName: 'Share2'
  },
  {
    type: 'map',
    label: 'Interactive Map',
    description: 'Location pin with address marker.',
    iconName: 'MapPin'
  },
  {
    type: 'gallery',
    label: 'Photo Gallery',
    description: 'Responsive multi-image collage.',
    iconName: 'Grid'
  },
  {
    type: 'pdf',
    label: 'PDF Downloader',
    description: 'Menu, guide, or ticket download panel.',
    iconName: 'FileText'
  },
  {
    type: 'contactForm',
    label: 'Contact Form',
    description: 'Capture visitor emails, names, & messages.',
    iconName: 'Mail'
  },
  {
    type: 'countdown',
    label: 'Countdown Timer',
    description: 'Urgency timer for events or drops.',
    iconName: 'Clock'
  }
];

export const createDefaultComponent = (type: string, id: string): PageComponent => {
  switch (type) {
    case 'hero':
      return {
        id,
        type: 'hero',
        title: 'Welcome to the Live Event!',
        subtitle: 'Drag and customize this mobile page instantly. Add timers, galleries, and map pins with absolute ease.',
        ctaText: 'Claim Free Ticket',
        ctaLink: '#register',
        bgType: 'gradient',
        bgColor: '#4f46e5',
        bgGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        bgImageUrl: '',
        textColor: '#ffffff',
        align: 'center'
      };
    case 'image':
      return {
        id,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        caption: 'Premium Summer Release Sneak Peek.',
        altText: 'Running Sneaker',
        linkUrl: 'https://shop.example.com',
        borderRadius: 'lg',
        aspectRatio: '16:9'
      };
    case 'video':
      return {
        id,
        type: 'video',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube'
      };
    case 'button':
      return {
        id,
        type: 'button',
        text: 'Join VIP Discord Community',
        link: 'https://discord.gg',
        style: 'filled',
        color: '#4f46e5',
        textColor: '#ffffff',
        size: 'md'
      };
    case 'social':
      return {
        id,
        type: 'social',
        links: [
          { platform: 'instagram', url: 'https://instagram.com', active: true },
          { platform: 'twitter', url: 'https://twitter.com', active: true },
          { platform: 'youtube', url: 'https://youtube.com', active: true },
          { platform: 'whatsapp', url: 'https://wa.me', active: false },
          { platform: 'email', url: 'mailto:info@example.com', active: true }
        ],
        style: 'circle',
        color: '#4f46e5'
      };
    case 'map':
      return {
        id,
        type: 'map',
        latitude: 40.7128,
        longitude: -74.0060,
        zoom: 13,
        markerTitle: 'Bistro Head Office',
        address: '100 Broadway, New York, NY 10005'
      };
    case 'gallery':
      return {
        id,
        type: 'gallery',
        images: [
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80'
        ],
        columns: 3,
        gap: 'md'
      };
    case 'pdf':
      return {
        id,
        type: 'pdf',
        title: 'Download Food & Wine Pairing Menu',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        description: 'Get our award-winning gourmet list with tasting recommendations compiled by our master sommelier.',
        showIcon: true
      };
    case 'contactForm':
      return {
        id,
        type: 'contactForm',
        title: 'Exclusive Offer Intake',
        description: 'Leave your contact information to receive a 25% discount voucher instantly on launch day.',
        buttonText: 'Submit & Get Code',
        emailRecipient: 'admin@example.com',
        fields: [
          { id: '1', name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
          { id: '2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'jane@example.com' },
          { id: '3', name: 'message', label: 'Special Request', type: 'textarea', required: false, placeholder: 'Any preferences?' }
        ]
      };
    case 'countdown': {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      return {
        id,
        type: 'countdown',
        targetDate: tomorrow.toISOString().substring(0, 16),
        label: 'SUMMER SALES KICKOFF IN:',
        style: 'digital',
        bgColor: '#f1f5f9',
        textColor: '#0f172a'
      };
    }
    default:
      throw new Error(`Unsupported component type: ${type}`);
  }
};

export const DEFAULT_STARTER_PAGES = (): LandingPageConfig[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);

  return [
    {
      id: 'sunset-launch-page',
      title: 'Summer VIP Product Drop',
      slug: 'summer-vip-deal',
      userId: 'demo-user',
      theme: THEME_PRESETS.sunset,
      seo: {
        metaTitle: 'Summer VIP Exclusive Coupon',
        metaDescription: 'Gain access to the summer VIP shoe collection drop event before public release.',
        keywords: 'sneakers, summer drop, exclusive, vip deals',
        shareImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'
      },
      visits: 4890,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      components: [
        {
          id: 'starter-hero',
          type: 'hero',
          title: 'Vanguard VIP Collection Drop',
          subtitle: 'Our limited-run summer sneakers are dropping soon. Subscribe below to receive an early access voucher.',
          ctaText: 'Claim Discount Code',
          ctaLink: '#claim-form',
          bgType: 'gradient',
          bgColor: '#ea580c',
          bgGradient: 'linear-gradient(135deg, #ea580c 0%, #b45309 100%)',
          bgImageUrl: '',
          textColor: '#ffffff',
          align: 'center'
        },
        {
          id: 'starter-image',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
          caption: 'Signature Vanguard Pro with reactive spring cushioning.',
          altText: 'Vanguard Sneaker',
          linkUrl: '',
          borderRadius: 'lg',
          aspectRatio: '16:9'
        },
        {
          id: 'starter-timer',
          type: 'countdown',
          targetDate: tomorrow.toISOString().substring(0, 16),
          label: 'EARLY ACCES DROPS IN:',
          style: 'digital',
          bgColor: '#fff7ed',
          textColor: '#ea580c'
        },
        {
          id: 'starter-pdf',
          type: 'pdf',
          title: 'Download Premium Specs Guide',
          pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          description: 'A complete breakdowns of materials, weight charts, and design inspirations.',
          showIcon: true
        },
        {
          id: 'starter-form',
          type: 'contactForm',
          title: 'Reserve Early Access Voucher',
          description: 'Vouchers are limited to the first 500 applicants.',
          buttonText: 'Claim Coupon Code',
          emailRecipient: 'drops@vanguard.com',
          fields: [
            { id: 'f1', name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Alex Mercer' },
            { id: 'f2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'alex@mercer.com' },
            { id: 'f3', name: 'phone', label: 'Cell Number (for SMS drops)', type: 'tel', required: false, placeholder: '+1 (555) 123-4567' }
          ]
        }
      ]
    },
    {
      id: 'gourmet-bistro',
      title: 'Bistro Digital Menu & Socials',
      slug: 'bistro-digital',
      userId: 'demo-user',
      theme: THEME_PRESETS.forest,
      seo: {
        metaTitle: 'Gourmet Bistro Digital Menu',
        metaDescription: 'Scan to explore our dynamic farm-to-table lunch menu, reserve a table, or follow us on socials.',
        keywords: 'bistro, menu, restaurant, dinner specials',
        shareImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
      },
      visits: 1205,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      components: [
        {
          id: 'bistro-hero',
          type: 'hero',
          title: 'Welcome to Garden Bistro',
          subtitle: 'Organic farm-to-table kitchen open daily for brunch, coffee, and fireside dining.',
          ctaText: 'Reserve Table',
          ctaLink: 'tel:+155588899',
          bgType: 'color',
          bgColor: '#16a34a',
          bgGradient: '',
          bgImageUrl: '',
          textColor: '#ffffff',
          align: 'center'
        },
        {
          id: 'bistro-gallery',
          type: 'gallery',
          images: [
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80'
          ],
          columns: 3,
          gap: 'md'
        },
        {
          id: 'bistro-socials',
          type: 'social',
          links: [
            { platform: 'instagram', url: 'https://instagram.com/bistro', active: true },
            { platform: 'twitter', url: 'https://twitter.com/bistro', active: true },
            { platform: 'whatsapp', url: 'https://wa.me/bistro', active: true },
            { platform: 'email', url: 'mailto:table@bistro.com', active: true }
          ],
          style: 'circle',
          color: '#16a34a'
        },
        {
          id: 'bistro-map',
          type: 'map',
          latitude: 40.7580,
          longitude: -73.9855,
          zoom: 14,
          markerTitle: 'Garden Bistro - Times Square',
          address: '45th St & Broadway, New York, NY 10036'
        }
      ]
    }
  ];
};
