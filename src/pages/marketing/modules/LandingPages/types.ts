export type ThemePresetName = 'minimal' | 'sunset' | 'luxury' | 'neon' | 'forest' | 'custom';

export interface ThemePreset {
  name: string;
  bgColor: string;
  bgGradient?: string;
  primaryColor: string;
  fontFamily: string;
  textColor: string;
}

export interface SEOConfig {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  shareImage: string;
}

export interface HeroComponent {
  id: string;
  type: 'hero';
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgType: 'color' | 'gradient' | 'image';
  bgColor: string;
  bgGradient: string;
  bgImageUrl: string;
  textColor: string;
  align: 'left' | 'center' | 'right';
}

export interface ImageComponent {
  id: string;
  type: 'image';
  url: string;
  caption: string;
  altText: string;
  linkUrl: string;
  borderRadius: 'none' | 'md' | 'lg' | 'full';
  aspectRatio: '1:1' | '16:9' | '4:3' | 'auto';
}

export interface VideoComponent {
  id: string;
  type: 'video';
  url: string;
  platform: 'youtube' | 'vimeo' | 'direct';
}

export interface ButtonComponent {
  id: string;
  type: 'button';
  text: string;
  link: string;
  style: 'filled' | 'outline' | 'gradient';
  color: string;
  textColor: string;
  size: 'sm' | 'md' | 'lg';
}

export interface SocialLinkItem {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'whatsapp' | 'email';
  url: string;
  active: boolean;
}

export interface SocialLinksComponent {
  id: string;
  type: 'social';
  links: SocialLinkItem[];
  style: 'circle' | 'square' | 'minimal';
  color: string;
}

export interface MapComponent {
  id: string;
  type: 'map';
  latitude: number;
  longitude: number;
  zoom: number;
  markerTitle: string;
  address: string;
}

export interface GalleryComponent {
  id: string;
  type: 'gallery';
  images: string[];
  columns: 2 | 3 | 4;
  gap: 'sm' | 'md' | 'lg';
}

export interface PDFComponent {
  id: string;
  type: 'pdf';
  title: string;
  pdfUrl: string;
  description: string;
  showIcon: boolean;
}

export interface ContactFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  required: boolean;
  placeholder: string;
}

export interface ContactFormComponent {
  id: string;
  type: 'contactForm';
  title: string;
  description: string;
  buttonText: string;
  emailRecipient: string;
  fields: ContactFormField[];
}

export interface CountdownComponent {
  id: string;
  type: 'countdown';
  targetDate: string; // ISO / YYYY-MM-DDTHH:mm
  label: string;
  style: 'digital' | 'minimal' | 'cards';
  bgColor: string;
  textColor: string;
}

export type PageComponent =
  | HeroComponent
  | ImageComponent
  | VideoComponent
  | ButtonComponent
  | SocialLinksComponent
  | MapComponent
  | GalleryComponent
  | PDFComponent
  | ContactFormComponent
  | CountdownComponent;

export interface LandingPageConfig {
  id: string;
  title: string;
  slug: string;
  userId: string;
  theme: ThemePreset;
  seo: SEOConfig;
  components: PageComponent[];
  visits: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  pageId: string;
  pageTitle: string;
  timestamp: string;
  formData: Record<string, string>;
  userId?: string;
}
