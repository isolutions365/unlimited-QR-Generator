import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, Plus, Trash2, Edit2, Check, Download, Share2, 
  QrCode, Eye, Globe, Sparkles, PlusCircle, CheckCircle2, 
  Copy, Smartphone, FileCode, Flame, Tag, HelpCircle, 
  ChevronRight, ArrowLeft, ShoppingBag, DollarSign, UploadCloud,
  Layers, Star, RefreshCw, MessageSquare
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { api } from '../lib/api';
import { playAudioSound } from '../utils/audioFeedback';
import { useTranslation } from '../utils/i18n';

// Interfaces
interface MenuVariant {
  name: string;      // e.g. "Regular", "Large", "Spicy", "Gluten-Free"
  priceModifier: number; // e.g. 0 or +2.50
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: { [lang: string]: string };
  description: { [lang: string]: string };
  price: number;
  imageUrl: string;
  variants: MenuVariant[];
  offerTag?: string; // e.g., "Chef's Choice", "Happy Hour", "BOGO", "15% Off"
  isSpicy?: boolean;
  isVegetarian?: boolean;
}

interface MenuCategory {
  id: string;
  name: { [lang: string]: string };
  icon: string; // e.g., "🍕", "🍹", "🥗", "🍰", "🥩"
}

interface RestaurantMenuConfig {
  id: string;
  restaurantName: string;
  description: string;
  currency: string;      // e.g., "USD", "EUR", "GBP", "SAR", etc.
  selectedLanguage: 'en' | 'es' | 'fr' | 'it' | 'ar'; // Current builder language
  categories: MenuCategory[];
  items: MenuItem[];
  themeColor: 'emerald' | 'rose' | 'amber' | 'neutral';
}

// Currency definition map for supported languages
export const CURRENCY_MAP: Record<string, { symbol: string; label: string; name: string }> = {
  USD: { symbol: '$', label: 'USD ($) - US Dollar', name: 'US Dollar' },
  EUR: { symbol: '€', label: 'EUR (€) - Euro', name: 'Euro' },
  GBP: { symbol: '£', label: 'GBP (£) - British Pound', name: 'British Pound' },
  SAR: { symbol: 'ر.س', label: 'SAR (ر.س) - Saudi Riyal', name: 'Saudi Riyal' },
  PKR: { symbol: 'Rs', label: 'PKR (Rs) - Pakistani Rupee', name: 'Pakistani Rupee' },
  INR: { symbol: '₹', label: 'INR (₹) - Indian Rupee', name: 'Indian Rupee' },
  IDR: { symbol: 'Rp', label: 'IDR (Rp) - Indonesian Rupiah', name: 'Indonesian Rupiah' },
  TRY: { symbol: '₺', label: 'TRY (₺) - Turkish Lira', name: 'Turkish Lira' },
  JPY: { symbol: '¥', label: 'JPY (¥) - Japanese Yen', name: 'Japanese Yen' },
  KRW: { symbol: '₩', label: 'KRW (₩) - South Korean Won', name: 'South Korean Won' },
  CNY: { symbol: '¥', label: 'CNY (¥) - Chinese Yuan', name: 'Chinese Yuan' },
  AED: { symbol: 'د.إ', label: 'AED (د.إ) - UAE Dirham', name: 'UAE Dirham' }
};

// Default currency map per language tab
export const LANGUAGE_DEFAULT_CURRENCY: Record<string, string> = {
  en: 'USD',
  es: 'EUR',
  fr: 'EUR',
  it: 'EUR',
  ar: 'SAR',
  ur: 'PKR',
  hi: 'INR',
  id: 'IDR',
  tr: 'TRY'
};

// Preset Premium Culinary Images from Unsplash
const PRESET_CULINARY_IMAGES = [
  { name: 'كبسة لحم فاخرة (Lamb Kabsa)', url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80' },
  { name: 'مندي دجاج (Chicken Mandi)', url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=80' },
  { name: 'مشويات مشكلة (Mixed Grill)', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80' },
  { name: 'حمص شرقي (Hummus)', url: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=500&auto=format&fit=crop&q=80' },
  { name: 'كنافة بالجبنة (Kunafa Dessert)', url: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=500&auto=format&fit=crop&q=80' },
  { name: 'قهوة عربية وتمر (Arabic Coffee & Dates)', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80' },
  { name: 'شاي كرك (Karak Tea)', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80' },
  { name: 'Neapolitan Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80' },
  { name: 'Gourmet Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80' },
  { name: 'Fresh Salad', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80' },
  { name: 'Signature Steak', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
  { name: 'Chocolate Fondant', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80' }
];

const PRESET_ICONS = ['🍕', '🍔', '🥗', '🍹', '🍰', '🥩', '🍝', '☕', '🍣', '🥞', '🍷', '🌮'];

export const GULF_ARABIC_MENU_PRESET: RestaurantMenuConfig = {
  id: 'menu-default-ar',
  restaurantName: 'مطعم المجلس الخليجي الفاخر',
  description: 'أفخر المأكولات الخليجية والولائم العربية الأصيلة، كبسة، مندي، ومشويات فاخرة.',
  currency: 'SAR',
  selectedLanguage: 'ar',
  themeColor: 'emerald',
  categories: [
    {
      id: 'cat-ar-1',
      name: {
        ar: 'المقبلات والسلطات الشرقية',
        en: 'Middle Eastern Starters & Salads',
        es: 'Entrantes Orientales',
        fr: 'Entrées Orientales',
        it: 'Antipasti Orientali'
      },
      icon: '🥗'
    },
    {
      id: 'cat-ar-2',
      name: {
        ar: 'الأطباق الرئيسية والولائم الخليجية',
        en: 'Gulf Main Courses & Feasts',
        es: 'Platos Principales del Golfo',
        fr: 'Plats Principaux du Golfe',
        it: 'Piatti Principali del Golfo'
      },
      icon: '🥩'
    },
    {
      id: 'cat-ar-3',
      name: {
        ar: 'الحلويات والمشروبات العربية',
        en: 'Arabic Desserts & Drinks',
        es: 'Postres y Bebidas Árabes',
        fr: 'Desserts et Boissons Arabes',
        it: 'Dolci e Bevande Arabe'
      },
      icon: '☕'
    }
  ],
  items: [
    {
      id: 'item-ar-1',
      categoryId: 'cat-ar-1',
      name: {
        ar: 'حمص ملكي باللحم والصنوبر',
        en: 'Royal Lamb Hummus',
        es: 'Hummus Real con Carne',
        fr: 'Hummus Royal à l\'Agneau',
        it: 'Hummus Reale con Agnello'
      },
      description: {
        ar: 'حمص ناعم بصلصة الطحينة ومغطى بقطع لحم الضأن المتبلة والصنوبر المحمص مع زيت الزيتون البكر.',
        en: 'Creamy chickpea hummus topped with spiced sautéed lamb, toasted pine nuts, and virgin olive oil.',
        es: 'Hummus cremoso con carne de cordero salteada con especias y piñones tostados.',
        fr: 'Hummus crémeux garni d\'agneau sauté aux épices et pignons de pin grillés.',
        it: 'Hummus cremoso con agnello saltato e pinoli tostati.'
      },
      price: 28.00,
      imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=500&auto=format&fit=crop&q=80',
      variants: [
        { name: 'طبق شخصي', priceModifier: 0 },
        { name: 'طبق عائلي كبير', priceModifier: 14.00 }
      ],
      offerTag: 'توصية الشيف',
      isVegetarian: false
    },
    {
      id: 'item-ar-2',
      categoryId: 'cat-ar-1',
      name: {
        ar: 'تبولة لبنانية بالرمان',
        en: 'Lebanese Tabbouleh with Pomegranate',
        es: 'Tabulé Libanés',
        fr: 'Taboulé Libanais',
        it: 'Tabbouleh Libanese'
      },
      description: {
        ar: 'بقدونس طازج مفروم مع نعناع، طماطم، برغل، حبات الرمان الطازجة، وتتبيلة الليمون وزيت الزيتون.',
        en: 'Freshly chopped parsley, mint, tomatoes, bulgur, pomegranate seeds with lemon & olive oil dressing.',
        es: 'Perejil fresco picado, menta, tomate, burgul y granada.',
        fr: 'Persil frais haché, menthe, tomates, bulgur et grenades.',
        it: 'Prezzemolo fresco, menta, pomodoro e melograno.'
      },
      price: 22.00,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
      variants: [
        { name: 'الحجم العادي', priceModifier: 0 },
        { name: 'إضافة جبنة حلوم مشوية', priceModifier: 6.00 }
      ],
      isVegetarian: true
    },
    {
      id: 'item-ar-3',
      categoryId: 'cat-ar-2',
      name: {
        ar: 'كبسة لحم نعيمي فاخرة',
        en: 'Royal Lamb Kabsa',
        es: 'Kabsa de Cordero Real',
        fr: 'Kabsa d\'Agneau Royal',
        it: 'Kabsa di Agnello Reale'
      },
      description: {
        ar: 'أرز بسمتي فاخر مطبوخ بالبهارات الخليجية العطرية مع موزة لحم نعيمي طازجة ومكسرات محمصة.',
        en: 'Aromatic basmati rice cooked with authentic Gulf spices, tender fresh lamb shank, and toasted nuts.',
        es: 'Arroz basmati aromático cocinado con especias del Golfo y cordero tierno.',
        fr: 'Riz basmati parfumé mijoté aux épices du Golfe et agneau tendre.',
        it: 'Riso basmati aromatico alle spezie del Golfo con agnello tenero.'
      },
      price: 68.00,
      imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80',
      variants: [
        { name: 'وجبة فردية', priceModifier: 0 },
        { name: 'وليمة شخصين', priceModifier: 55.00 },
        { name: 'وليمة عائلية (4 أشخاص)', priceModifier: 130.00 }
      ],
      offerTag: 'الأكثر طلباً',
      isSpicy: false
    },
    {
      id: 'item-ar-4',
      categoryId: 'cat-ar-2',
      name: {
        ar: 'مندي دجاج حضرمي أصيل',
        en: 'Authentic Chicken Mandi',
        es: 'Mandi de Pollo Auténtico',
        fr: 'Mandi au Poulet Authentique',
        it: 'Mandi di Pollo Autentico'
      },
      description: {
        ar: 'دجاج محمر بالفرن بالطريقة الحضرمية يقدم على أرز المندي المدخن مع صلصة الدقوس الحارة.',
        en: 'Oven-roasted tender chicken served over smoked mandi basmati rice with spicy daqoos tomato sauce.',
        es: 'Pollo asado servido sobre arroz mandi ahumado con salsa picante.',
        fr: 'Poulet rôti servi sur riz mandi fumé avec sauce piquante.',
        it: 'Pollo arrosto con riso mandi affumicato e salsa piccante.'
      },
      price: 45.00,
      imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=80',
      variants: [
        { name: 'نصف دجاجة مع أرز', priceModifier: 0 },
        { name: 'دجاجة كاملة مع أرز', priceModifier: 22.00 }
      ],
      offerTag: 'طبق يومي',
      isSpicy: true
    },
    {
      id: 'item-ar-5',
      categoryId: 'cat-ar-2',
      name: {
        ar: 'مشويات مشكلة على الفحم',
        en: 'Charcoal Mixed Grill Platter',
        es: 'Parrillada Mixta al Carbón',
        fr: 'Grillades Mixtes au Charbon',
        it: 'Grigliata Mista al Carbone'
      },
      description: {
        ar: 'تشكيلة من كباب اللحم، شيش طاووق، وريش الغنم المشوية على الفحم مع الثومية والخبز الطازج.',
        en: 'Assortment of lamb kebab, shish tabook, and lamb chops grilled over charcoal with garlic paste.',
        es: 'Surtido de kebab de cordero, shish taook y chuletas a la parrilla.',
        fr: 'Assortiment de kebabs d\'agneau, shish taouk et côtelettes grillées.',
        it: 'Assortimento di kebab di agnello, shish taouk e costolette.'
      },
      price: 75.00,
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80',
      variants: [
        { name: 'طبق لشخص واحد', priceModifier: 0 },
        { name: 'مشكل لشخصين (1 كجم)', priceModifier: 65.00 }
      ],
      offerTag: 'مشويات طازجة'
    },
    {
      id: 'item-ar-6',
      categoryId: 'cat-ar-3',
      name: {
        ar: 'كنافة نابلسية فاخرة بالجبنة',
        en: 'Nabulsi Cheese Kunafa',
        es: 'Kunafa de Queso Nabulsi',
        fr: 'Kounafa au Fromage Nabulsi',
        it: 'Kunafa al Formaggio Nabulsi'
      },
      description: {
        ar: 'كنافة ذهبية مقرمشة محشوة بالجبن النابلسي المذاب ومسقية بقطر ماء الزهر ومزينة بالفستق الحلبي.',
        en: 'Crispy golden pastry dough layered with melted Nabulsi cheese, orange blossom syrup & pistachios.',
        es: 'Postre crujiente dorado con queso derretido y pistachos.',
        fr: 'Pâtisserie dorée au fromage fondu et pistaches.',
        it: 'Pasticceria dorata con formaggio fuso e pistacchi.'
      },
      price: 25.00,
      imageUrl: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=500&auto=format&fit=crop&q=80',
      variants: [
        { name: 'طبق شخصي دافئ', priceModifier: 0 },
        { name: 'صينية عائلية وسط', priceModifier: 20.00 }
      ],
      isVegetarian: true,
      offerTag: 'حلو اليوم'
    },
    {
      id: 'item-ar-7',
      categoryId: 'cat-ar-3',
      name: {
        ar: 'قهوة عربية بالهيل مع تمر مديني',
        en: 'Arabic Qahwa with Cardamom & Dates',
        es: 'Café Árabe con Cardamomo y Dátiles',
        fr: 'Café Arabe à la Cardamome et Dattes',
        it: 'Caffè Arabo al Cardamomo e Datteri'
      },
      description: {
        ar: 'دلة قهوة عربية أصيلة محضرة بالهيل والزعفران تقدم مع تمر صفاوي مديني فاخر وطحينة.',
        en: 'Traditional cardamom & saffron-infused golden Arabic coffee served with Madina dates and tahini.',
        es: 'Café árabe tradicional infusionado con cardamomo servido con dátiles.',
        fr: 'Café arabe traditionnel à la cardamome servi avec dattes.',
        it: 'Caffè arabo tradizionale al cardamomo con datteri.'
      },
      price: 18.00,
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
      variants: [
        { name: 'دلة صغيرة مع تمر', priceModifier: 0 },
        { name: 'دلة مجلس كبيرة مع تمر ومكسرات', priceModifier: 12.00 }
      ],
      isVegetarian: true
    },
    {
      id: 'item-ar-8',
      categoryId: 'cat-ar-3',
      name: {
        ar: 'شاي كرك خليجي بالهيل',
        en: 'Gulf Karak Tea with Cardamom',
        es: 'Té Karak del Golfo',
        fr: 'Thé Karak du Golfe',
        it: 'Tè Karak del Golfo'
      },
      description: {
        ar: 'شاي مخمور بالحليب المبخر والبهارات الخليجية والهيل الفاخر مع السكر البني.',
        en: 'Rich brewed tea cooked with evaporated milk, fragrant cardamom pods, and spices.',
        es: 'Té cocido con leche evaporada y cardamomo.',
        fr: 'Thé infusé au lait concentré et cardamome.',
        it: 'Tè concentrato con latte e cardamomo.'
      },
      price: 12.00,
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
      variants: [
        { name: 'كوب كرك دافئ', priceModifier: 0 },
        { name: 'إبريق كرك للمجلس', priceModifier: 10.00 }
      ],
      isVegetarian: true
    }
  ]
};

export const DEFAULT_ENGLISH_MENU: RestaurantMenuConfig = {
  id: 'menu-default-en',
  restaurantName: 'Gusto Bistro & Bar',
  description: 'Artisanal modern dining with locally sourced, organic ingredients.',
  currency: 'USD',
  selectedLanguage: 'en',
  themeColor: 'emerald',
  categories: [
    { id: 'cat-1', name: { en: 'Starters & Salads', es: 'Entrantes y Ensaladas', fr: 'Entrées et Salades', it: 'Antipasti e Insalate', ar: 'المقبلات والسلطات' }, icon: '🥗' },
    { id: 'cat-2', name: { en: 'Main Courses', es: 'Platos Principales', fr: 'Plats Principaux', it: 'Piatti Principali', ar: 'الأطباق الرئيسية' }, icon: '🥩' },
    { id: 'cat-3', name: { en: 'Desserts & Sweets', es: 'Postres y Dulces', fr: 'Desserts et Douceurs', it: 'Dolci e Dessert', ar: 'الحلويات والسكريات' }, icon: '🍰' }
  ],
  items: [
    {
      id: 'item-1',
      categoryId: 'cat-1',
      name: { en: 'Truffle Burrata Salad', es: 'Ensalada de Burrata con Trufa', fr: 'Salade de Burrata à la Truffe', it: 'Insalata di Burrata al Tartufo', ar: 'سلطة بوراتا بالتروفل' },
      description: { en: 'Wild arugula, heirloom cherry tomatoes, creamy burrata injected with white truffle oil & aged balsamic glaze.', es: 'Rúcula silvestre, tomates cherry, burrata cremosa con aceite de trufa blanca y vinagre balsámico envejecido.', fr: 'Roquette sauvage, tomates cerises, burrata crémeuse injectée d’huile de truffe blanche et glaçage balsamique vieilli.', it: 'Rucola selvatica, pomodorini ciliegini, burrata cremosa iniettata con olio al tartufo bianco e glassa di balsamico invecchiato.', ar: 'الجرجير البري، الطماطم الكرزية، البوراتا الكريمية المحقونة بزيت التروفل الأبيض ومزيج البلسميك المعتق.' },
      price: 18.00,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
      variants: [
        { name: 'Standard Portion', priceModifier: 0 },
        { name: 'Double Cheese Infusion', priceModifier: 4.50 }
      ],
      offerTag: 'Chef\'s Special',
      isVegetarian: true
    },
    {
      id: 'item-2',
      categoryId: 'cat-2',
      name: { en: 'Prime Ribeye Steak', es: 'Filete de Ribeye de Primera', fr: 'Ribeye de Boeuf Prime', it: 'Costata di Manzo Prime', ar: 'ستيك ريب آي فاخر' },
      description: { en: '400g prime grass-fed black angus ribeye served with fresh herb butter and triple-cooked rosemary fries.', es: '400g de ribeye premium de black angus alimentado con pasto, servido con mantequilla de hierbas finas y patatar fritas al romero.', fr: '400g d’entrecôte de boeuf black angus nouri à l’herbe, servie avec beurre d’herbes fraîches et frites au romarin.', it: '400g di costata di manzo black angus da pascolo, servito con burro alle erbe aromatiche e patatine fritte al rosmarino.', ar: 'ستيك ريب آي بلاك أنجوس فاخر مغذى على العشب يُقدّم مع زبدة الأعشاب الطازجة وبطاطس إكليل الجبل المطهوة ثلاث مرات.' },
      price: 34.99,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      variants: [
        { name: 'Medium Rare', priceModifier: 0 },
        { name: 'Medium', priceModifier: 0 },
        { name: 'Truffle Butter Twist', priceModifier: 4.50 }
      ],
      offerTag: 'Premium Selection'
    },
    {
      id: 'item-3',
      categoryId: 'cat-3',
      name: { en: 'Warm Chocolate Lava Cake', es: 'Pastel de Lava de Chocolate Caliente', fr: 'Fondant au Chocolat Chaud', it: 'Tortino al Cioccolato Caldo', ar: 'كيك الشوكولاتة الذائبة الدافئ' },
      description: { en: 'Rich dark chocolate cake with a molten center, served with Madagascan vanilla bean gelato.', es: 'Pastel de chocolate negro con centro líquido, servido con helado de vainilla.', fr: 'Gâteau au chocolat noir riche avec un cœur coulant, servi avec glace à la vanille.', it: 'Tortino al cioccolato fondente con cuore fuso, servito con gelato alla vaniglia.', ar: 'كيك الشوكولاتة الداكنة الغنية بقلب ذائب، يُقدّم مع جيلاتو الفانيليا من مدغشقر.' },
      price: 12.50,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
      variants: [
        { name: 'Single Scoop Ice Cream', priceModifier: 0 },
        { name: 'Double Scoop Ice Cream', priceModifier: 2.50 }
      ],
      isVegetarian: true
    }
  ]
};

export default function RestaurantMenu() {
  const { t, locale } = useTranslation();
  const isArabic = locale === 'ar';

  const filteredCulinaryImages = isArabic
    ? PRESET_CULINARY_IMAGES.slice(0, 7)
    : PRESET_CULINARY_IMAGES;

  const tMenu = (enText: string): string => {
    const dicts: Record<string, Record<string, string>> = {
      ar: {
      "Gourmet QR Restaurant Menu": "قائمة مطعم QR الفاخرة",
      "Design beautiful, high-converting digital restaurant menus with variants, active promotion tags, multi-language translation selectors, and interactive simulated smartphone menu previews.": "صمّم قوائم طعام رقمية جميلة وعالية التحويل للمطاعم مع المتغيرات، وشارات الترويج النشطة، ومحددات الترجمة متعددة اللغات، ومعاينات تفاعلية لمحاكاة قائمة الهاتف الذكي.",
      "Load Italian Theme": "تحميل السمة الإيطالية",
      "Load Gulf Menu": "تحميل القائمة الخليجية",
      "Publish & Sync Menu": "نشر ومزامنة القائمة",
      "Syncing...": "جاري المزامنة...",
      "1. Brand Identity & Global Locales": "1. هوية العلامة التجارية والمواقع العالمية",
      "Configure core descriptors and choose active language to enter data.": "تكوين الأوصاف الأساسية واختيار اللغة النشطة لإدخال البيانات.",
      "Restaurant Name": "اسم المطعم",
      "Menu Currency": "عملة القائمة",
      "Short Restaurant Slogan": "شعار المطعم القصير",
      "Brand Palette & Styling Vibe": "لوحة الألوان ونمط التصميم",
      "2. Menu Categories": "2. فئات القائمة",
      "Add or rename major food/drink sections. Drag down & remove categories.": "أضف أو أعد تسمية أقسام الطعام/الشراب الرئيسية. اسحب لأسفل وأزل الفئات.",
      "3. Create New Dish / Beverage": "3. إنشاء طبق / مشروب جديد",
      "Configure core product details, pricing, tags, and variants to append them below.": "تكوين تفاصيل المنتج الأساسية، والتسعير، والشارات، والمتغيرات لإضافتها أدناه.",
      "Target Category": "الفئة المستهدفة",
      "Item Title (English)": "اسم الصنف (بالإنجليزي)",
      "Item Title (Arabic)": "اسم الصنف (بالعربية)",
      "Base Price ($)": "السعر الأساسي",
      "Active Special Tag": "شارة خاصة نشطة",
      "Item Description (English)": "وصف الصنف (بالإنجليزي)",
      "Scan QR to open on phone": "امسح رمز QR لفتحه على الهاتف",
      "Scan this high-fidelity QR design with your phone to view the active published menu layout instantly on your mobile device.": "امسح تصميم QR عالي الدقة هذا بهاتفك لعرض تخطيط القائمة النشط المنشور على الفور على جهازك المحمول.",
      "Publish menu to activate QR live link!": "انشر القائمة لتنشيط رابط QR المباشر!",
      "Options": "خيارات",
      "Edit Item": "تعديل الصنف",
      "Option Label": "تسمية الخيار",
      "Price modifier": "معدل السعر",
      "Update Item": "تحديث الصنف",
      "Cancel": "إلغاء",
      "Save Changes": "حفظ التغييرات",
      "Image Source": "مصدر الصورة",
      "Option A: Select Preset Image": "الخيار أ: تحديد صورة طعام مسبقة",
      "Option B: Upload Custom Picture": "الخيار ب: تحميل صورة خاصة مخصصة",
      "Selected Culinary Image": "صورة الطبق المحددة",
      "Drag & drop your dish picture here, or click to browse": "اسحب وأسقط صورة الطبق هنا، أو انقر للتصفح",
      "Supports PNG, JPG, JPEG up to 5MB": "يدعم صيغ PNG و JPG و JPEG حتى 5 ميجابايت",
      "Custom Image Uploaded Successfully!": "تم تحميل الصورة المخصصة بنجاح!",
      "Remove & Use Preset": "إزالة واستخدام المعرض",
      "Interactive Menu Hub": "مركز القائمة التفاعلية",
      "Add Category": "إضافة فئة",
      "Delete Category (Cascades items)": "حذف الفئة (سيتم حذف الأصناف بداخلها)",
      "Item Title (Spanish)": "اسم الصنف (بالإسباني)",
      "English Description": "الوصف بالإنجليزي",
      "Arabic Description": "الوصف بالعربي",
      "Base Price": "السعر الأساسي",
      "Promo Label (Optional)": "شارة ترويجية (اختياري)",
      "Vegetarian / Green Vegan": "نباتي / خضار فيجان",
      "Spicy / Fiery Heat": "حار / حار ناري",
      "Append Dish to Menu": "إضافة الطبق إلى القائمة",
      "Active Dishes & Variant Pricing": "الأطباق النشطة وتسعير الخيارات",
      "Name": "الاسم",
      "Description": "الوصف",
      "Portion Sizes & Custom Variants": "أحجام الوجبات والمتغيرات المخصصة",
      "Add Variant": "إضافة متغير",
      "Size/Option": "الحجم/الخيار",
      "No dishes created yet. Fill out the appended form above to insert plates.": "لم يتم إنشاء أي أطباق بعد. املأ النموذج المرفق أعلاه لإدراج الأطباق.",
      "Table-Top Smartphone Menu Preview": "معاينة قائمة الهاتف الذكي على الطاولة",
      "All Items": "كل الأصناف",
      "Empty menu setup": "إعداد قائمة فارغ",
      "Mock Table Cart": "سلة طلب الطاولة الافتراضية",
      "Total": "الإجمالي",
      "Remove": "إزالة",
      "Scan QR code, select dishes & click simulated variants to order.": "امسح رمز QR، واختر الأطباق وانقر على المتغيرات المحاكاة للطلب.",
      "ADD TO BASKET": "إضافة إلى السلة",
      "Choose portion variation:": "اختر حجم الوجبة:",
      "Simulate Adding to Table Order": "محاكاة إضافة لطلب الطاولة",
      "Table-Stand QR Export": "تصدير رمز QR للمستاند",
      "Table Ready QR": "رمز جاهز للطاولة",
      "Table-top Tent Card URL": "رابط بطاقة الطاولة",
      "Print or download high-resolution QR codes for table tents or wine cards to grant guests touchless smartphone access.": "اطبع أو قم بتنزيل رموز QR عالية الدقة لبطاقات الطاولة أو بطاقات المشروبات لتمكين الضيوف من الوصول اللاتلامسي عبر هواتفهم الذكية.",
      "Download PNG": "تحميل PNG",
      "Download SVG": "تحميل SVG",
      "Download Table-Stand (PDF)": "تحميل مستاند الطاولة (PDF)",
      "Preview Digital Menu": "معاينة القائمة الرقمية",
      "Digital Menu & Quick PDF Builder": "القائمة الرقمية وباني الـ PDF السريع",
      "SEO Schema Active": "مخطط سيو نشط",
      "Your digital menu is published with live search optimization. Connect a PDF menu link or use the Quick Food Item Builder to update your live offerings.": "قائمة طعامك الرقمية منشورة مع تحسين البحث المباشر. اربط رابط قائمة PDF أو استخدم باني الأطباق السريع لتحديث عروضك المباشرة.",
      "PDF Upload / Direct Menu Link": "تحميل ملف PDF / رابط القائمة المباشر",
      "Copy Link": "نسخ الرابط",
      "Copied Link!": "تم نسخ الرابط!",
      "Open Preview": "فتح المعاينة",
      "Included": "مشمول",
      "Spanish Description": "الوصف بالإسباني",
      "e.g. Gusto Bistro": "مثال: جستو بيسترو",
      "e.g. Handmade pasta, fresh stonebaked pizza, exquisite desserts.": "مثال: باستا مصنوعة يدويًا، بيتزا طازجة مخبوزة على الحجر، حلويات رائعة.",
      "e.g. Avocado Toast Deluxe": "مثال: توست الأفوكادو الفاخر",
      "e.g. Chef's Choice, 20% Off": "مثال: اختيار الطاهي، خصم %20",
      "e.g. Main Dishes": "مثال: الأطباق الرئيسية",
      "e.g. Tostada de Aguacate": "مثال: توست أفوكادو",
      "e.g. Smashed organic avocados on sourdough with poached eggs.": "مثال: أفوكادو عضوي مهروس على خبز ريفي مع بيض مسلوق.",
      
      // Portion Sizes / Variants
      "Standard Portion": "حجم قياسي",
      "Double Cheese Infusion": "إضافة جبنة مضاعفة",
      "Medium Rare": "شبه ناضج (ميديوم رير)",
      "Medium": "متوسط النضج (ميديوم)",
      "Truffle Butter Twist": "لمسة زبدة التيروفل",
      "Single Scoop Ice Cream": "بولة آيس كريم واحدة",
      "Double Scoop Ice Cream": "بولتان آيس كريم",
      "Regular Portion": "حجم عادي",
      "Premium Upgrade": "ترقية مميزة",
      "Half portion": "نصف وجبة",
      "Full portion": "وجبة كاملة",
      "Extra Side Option": "خيار جانبي إضافي",
      "خيار إضافي": "خيار إضافي",

      // Preset Imagery / Culinary Dishes
      "كبسة لحم فاخرة (Lamb Kabsa)": "كبسة لحم فاخرة",
      "مندي دجاج (Chicken Mandi)": "مندي دجاج",
      "مشويات مشكلة (Mixed Grill)": "مشويات مشكلة",
      "حمص شرقي (Hummus)": "حمص شرقي",
      "كنافة بالجبنة (Kunafa Dessert)": "كنافة بالجبنة",
      "قهوة عربية وتمر (Arabic Coffee & Dates)": "قهوة عربية وتمر",
      "شاي كرك (Karak Tea)": "شاي كرك",
      "Neapolitan Pizza": "بيتزا نابوليتان",
      "Gourmet Burger": "برجر فاخر",
      "Fresh Salad": "سلطة طازجة",
      "Signature Steak": "ستيك مميز",
      "Chocolate Fondant": "فوندان الشوكولاتة"
      }
    };
    const activeDict = dicts[locale] || {};
    return activeDict[enText] || enText;
  };

  // Localized string resolver helpers
  const getItemName = (item: MenuItem, lang: string): string => {
    const val = item.name[lang as keyof typeof item.name];
    if (val && val.trim()) return val;
    return item.name['en'] || item.name['ar'] || Object.values(item.name)[0] || '';
  };

  const getItemDesc = (item: MenuItem, lang: string): string => {
    const val = item.description[lang as keyof typeof item.description];
    if (val && val.trim()) return val;
    return item.description['en'] || item.description['ar'] || Object.values(item.description)[0] || '';
  };

  const getCatName = (cat: MenuCategory, lang: string): string => {
    const val = cat.name[lang as keyof typeof cat.name];
    if (val && val.trim()) return val;
    return cat.name['en'] || cat.name['ar'] || Object.values(cat.name)[0] || '';
  };

  const [menu, setMenu] = useState<RestaurantMenuConfig>(() => {
    if (isArabic) {
      return GULF_ARABIC_MENU_PRESET;
    }
    return DEFAULT_ENGLISH_MENU;
  });

  // Keep menu and simulator language aligned when app locale changes
  useEffect(() => {
    if (isArabic) {
      setSimulatedLanguage('ar');
      setMenu(prev => {
        if (prev.id === 'menu-default-en' || prev.id.startsWith('menu-default')) {
          return GULF_ARABIC_MENU_PRESET;
        }
        return {
          ...prev,
          selectedLanguage: 'ar'
        };
      });
    } else {
      setSimulatedLanguage('en');
      setMenu(prev => {
        if (prev.id === 'menu-default-ar' || prev.id.startsWith('menu-default')) {
          return DEFAULT_ENGLISH_MENU;
        }
        return {
          ...prev,
          selectedLanguage: 'en'
        };
      });
    }
  }, [locale, isArabic]);

  // Mobile simulation states
  const [simulatedLanguage, setSimulatedLanguage] = useState<'en' | 'es' | 'fr' | 'it' | 'ar'>(isArabic ? 'ar' : 'en');
  const [simulatedCart, setSimulatedCart] = useState<{ item: MenuItem; selectedVariant: MenuVariant; quantity: number }[]>([]);
  const [activePreviewItem, setActivePreviewItem] = useState<MenuItem | null>(null);
  const [tempVariant, setTempVariant] = useState<MenuVariant | null>(null);

  // New item draft states
  const [newItemCategory, setNewItemCategory] = useState<string>('cat-1');
  const [newItemNames, setNewItemNames] = useState<Record<string, string>>({
    en: '', es: '', fr: '', it: '', ar: ''
  });
  const [newItemDescs, setNewItemDescs] = useState<Record<string, string>>({
    en: '', es: '', fr: '', it: '', ar: ''
  });
  const [newItemPrice, setNewItemPrice] = useState('15.00');
  const [newItemImage, setNewItemImage] = useState(PRESET_CULINARY_IMAGES[0].url);
  const [newItemOffer, setNewItemOffer] = useState('');
  const [newItemIsVegetarian, setNewItemIsVegetarian] = useState(false);
  const [newItemIsSpicy, setNewItemIsSpicy] = useState(false);

  // Custom image upload states & event handlers
  const [imageSourceMode, setImageSourceMode] = useState<'preset' | 'upload'>('preset');
  const [dragActive, setDragActive] = useState(false);
  const [customUploadedImage, setCustomUploadedImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError(isArabic ? 'الرجاء تحميل ملف صورة صالح.' : 'Please upload a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      setCustomUploadedImage(resultStr);
      setNewItemImage(resultStr);
      playAudioSound('preview');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

const [savedMenus, setSavedMenus] = useState<RestaurantMenuConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  


  // Load Saved Menus
  useEffect(() => {
    loadSavedMenus();
  }, []);

  const loadSavedMenus = async () => {
    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (e) {
        console.warn('Anon auth notice:', e);
      }
    }
    if (userId) {
      try {
        const q = query(collection(db, 'restaurant_menus'), where('userId', '==', userId));
        const snap = await getDocs(q);
        const list: RestaurantMenuConfig[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as RestaurantMenuConfig);
        });
        setSavedMenus(list);
      } catch (err) {
        console.error('Error fetching restaurant menus from Firestore:', err);
      }
    }
  };

  // Save Menu
  const handleSaveMenu = async () => {
    setIsSaving(true);
    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (e) {
        console.warn('Anon auth notice:', e);
      }
    }
    const currentMenu = { ...menu, updatedAt: new Date().toISOString() };

    if (userId) {
      try {
        await setDoc(doc(db, 'restaurant_menus', currentMenu.id), {
          ...currentMenu,
          userId
        });
        await api.saveProject({
          id: currentMenu.id,
          name: currentMenu.restaurantName || 'Restaurant Menu',
          type: 'menu',
          content: `${window.location.origin}/#menu-${currentMenu.id}`,
          userId: userId,
          trackingId: currentMenu.id
        }).catch(() => {});
        playAudioSound('generate');
      } catch (err) {
        console.error('Firestore save failed', err);
      }
    }

    await loadSavedMenus();
    setIsSaving(false);
  };

  const handleDeleteMenu = async (id: string) => {
    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (e) {}
    }
    if (userId) {
      try {
        await deleteDoc(doc(db, 'restaurant_menus', id));
        await api.deleteProject(id).catch(() => {});
        playAudioSound('preview');
      } catch (err) {
        console.error('Firestore delete failed', err);
      }
    }
    await loadSavedMenus();
  };

  // Category modifiers
  const handleAddCategory = () => {
    const randomIcon = PRESET_ICONS[Math.floor(Math.random() * PRESET_ICONS.length)];
    const newCatId = 'cat-' + Math.random().toString(36).substring(2, 9);
    const newCategory: MenuCategory = {
      id: newCatId,
      name: {
        en: 'New Category',
        es: 'Nueva Categoría',
        fr: 'Nouvelle Catégorie',
        it: 'Nuova Categoria',
        ar: 'فئة جديدة'
      },
      icon: randomIcon
    };

    setMenu(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
    playAudioSound('preview');
  };

  const handleUpdateCategoryName = (id: string, nameText: string) => {
    const lang = menu.selectedLanguage;
    setMenu(prev => ({
      ...prev,
      categories: prev.categories.map(cat => {
        if (cat.id === id) {
          return {
            ...cat,
            name: { ...cat.name, [lang]: nameText }
          };
        }
        return cat;
      })
    }));
  };

  const handleUpdateCategoryIcon = (id: string, iconStr: string) => {
    setMenu(prev => ({
      ...prev,
      categories: prev.categories.map(cat => cat.id === id ? { ...cat, icon: iconStr } : cat)
    }));
  };

  const handleRemoveCategory = (id: string) => {
    setMenu(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== id),
      items: prev.items.filter(item => item.categoryId !== id) // Cascade remove
    }));
    playAudioSound('preview');
  };

  // Add Item
  const handleAddItem = () => {
    const nameEn = newItemNames.en.trim();
    const activeLang = menu.selectedLanguage;
    const nameActive = newItemNames[activeLang]?.trim();

    // Validate that we have at least the current active language name OR english name
    if (!nameEn && !nameActive) return;

    const finalEnName = nameEn || nameActive || 'Unnamed Dish';
    const newItemId = 'item-' + Math.random().toString(36).substring(2, 9);
    const priceNum = parseFloat(newItemPrice) || 12.00;

    const newItem: MenuItem = {
      id: newItemId,
      categoryId: newItemCategory,
      name: {
        en: finalEnName,
        es: newItemNames.es.trim() || finalEnName,
        fr: newItemNames.fr.trim() || finalEnName,
        it: newItemNames.it.trim() || finalEnName,
        ar: newItemNames.ar.trim() || finalEnName
      },
      description: {
        en: newItemDescs.en.trim() || newItemDescs[activeLang]?.trim() || 'Delectable chef crafted culinary creation seasoned to perfection.',
        es: newItemDescs.es.trim() || newItemDescs.en.trim() || 'Creación culinaria exquisita del chef sazonada a la perfección.',
        fr: newItemDescs.fr.trim() || newItemDescs.en.trim() || 'Création culinaire exquise préparée avec passion.',
        it: newItemDescs.it.trim() || newItemDescs.en.trim() || 'Creazione culinaria artigianale preparata con passione.',
        ar: newItemDescs.ar.trim() || newItemDescs.en.trim() || 'طبق شهي من إعداد الشيف متبل بشكل مثالي.'
      },
      price: priceNum,
      imageUrl: newItemImage,
      variants: (isArabic || menu.selectedLanguage === 'ar') ? [
        { name: 'حجم عادي', priceModifier: 0 },
        { name: 'ترقية مميزة', priceModifier: 3.50 }
      ] : [
        { name: 'Regular Portion', priceModifier: 0 },
        { name: 'Premium Upgrade', priceModifier: 3.50 }
      ],
      offerTag: newItemOffer || undefined,
      isVegetarian: newItemIsVegetarian,
      isSpicy: newItemIsSpicy
    };

    setMenu(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Reset fields
    setNewItemNames({ en: '', es: '', fr: '', it: '', ar: '' });
    setNewItemDescs({ en: '', es: '', fr: '', it: '', ar: '' });
    setNewItemOffer('');
    setNewItemIsVegetarian(false);
    setNewItemIsSpicy(false);
    setCustomUploadedImage(null);
    setUploadError(null);
    setNewItemImage(PRESET_CULINARY_IMAGES[0].url);
    setImageSourceMode('preset');

    playAudioSound('generate');
  };

  const handleRemoveItem = (id: string) => {
    setMenu(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
    playAudioSound('preview');
  };

  // Add Variant helper inside builder
  const handleAddItemVariant = (itemId: string) => {
    setMenu(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            variants: [...item.variants, { name: (isArabic || menu.selectedLanguage === 'ar') ? 'خيار إضافي' : 'Extra Side Option', priceModifier: 2.50 }]
          };
        }
        return item;
      })
    }));
    playAudioSound('preview');
  };

  const handleRemoveItemVariant = (itemId: string, index: number) => {
    setMenu(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            variants: item.variants.filter((_, i) => i !== index)
          };
        }
        return item;
      })
    }));
    playAudioSound('preview');
  };

  const handleUpdateItemVariant = (itemId: string, idx: number, field: keyof MenuVariant, value: any) => {
    setMenu(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updated = [...item.variants];
          updated[idx] = { ...updated[idx], [field]: value };
          return { ...item, variants: updated };
        }
        return item;
      })
    }));
  };

  const handleUpdateItemLang = (itemId: string, field: 'name' | 'description', value: string) => {
    const lang = menu.selectedLanguage;
    setMenu(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            [field]: { ...item[field], [lang]: value }
          };
        }
        return item;
      })
    }));
  };

  // Simulated Mobile Order Cart helpers
  const handleAddToCart = () => {
    if (!activePreviewItem || !tempVariant) return;

    const existingCartIdx = simulatedCart.findIndex(
      cartItem => cartItem.item.id === activePreviewItem.id && cartItem.selectedVariant.name === tempVariant.name
    );

    if (existingCartIdx > -1) {
      const updated = [...simulatedCart];
      updated[existingCartIdx].quantity += 1;
      setSimulatedCart(updated);
    } else {
      setSimulatedCart(prev => [...prev, { item: activePreviewItem, selectedVariant: tempVariant, quantity: 1 }]);
    }

    setActivePreviewItem(null);
    playAudioSound('generate');
  };

  const handleRemoveFromCart = (index: number) => {
    setSimulatedCart(prev => prev.filter((_, i) => i !== index));
    playAudioSound('preview');
  };

  const getCartTotal = () => {
    return simulatedCart.reduce((acc, curr) => {
      const price = curr.item.price + curr.selectedVariant.priceModifier;
      return acc + (price * curr.quantity);
    }, 0);
  };

  // Schema LD JSON generator for SEO Search Snippet
  const getMenuJSONLD = () => {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Menu",
      "name": menu.restaurantName,
      "description": menu.description,
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": menu.currency,
        "lowPrice": menu.items.length > 0 ? Math.min(...menu.items.map(i => i.price)) : 0,
        "highPrice": menu.items.length > 0 ? Math.max(...menu.items.map(i => i.price)) : 0,
        "offerCount": menu.items.length
      },
      "hasMenuSection": menu.categories.map(cat => ({
        "@type": "MenuSection",
        "name": getCatName(cat, menu.selectedLanguage),
        "hasMenuItem": menu.items
          .filter(item => item.categoryId === cat.id)
          .map(item => ({
            "@type": "MenuItem",
            "name": getItemName(item, menu.selectedLanguage),
            "description": getItemDesc(item, menu.selectedLanguage),
            "image": item.imageUrl,
            "offers": {
              "@type": "Offer",
              "price": item.price,
              "priceCurrency": menu.currency
            }
          }))
      }))
    }, null, 2);
  };

  // Inject JSON-LD SEO Schema into document.head invisibly
  useEffect(() => {
    let scriptTag = document.getElementById('restaurant-menu-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'restaurant-menu-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = getMenuJSONLD();

    return () => {
      const el = document.getElementById('restaurant-menu-jsonld');
      if (el) {
        el.remove();
      }
    };
  }, [menu]);

  const downloadMenuQR = (format: 'png' | 'svg' = 'png') => {
    const content = encodeURIComponent(getQRContent());
    const qrColor = menu.themeColor === 'emerald' ? '065f46' : menu.themeColor === 'rose' ? '9f1239' : menu.themeColor === 'amber' ? '9a3412' : '1e293b';
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${content}&color=${qrColor}&bgcolor=ffffff&margin=15${format === 'svg' ? '&format=svg' : ''}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${menu.restaurantName.replace(/\s+/g, '_')}_menu_qr.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playAudioSound('preview');
  };

  const handleDownloadTableStandPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = encodeURIComponent(getQRContent());
    const qrColor = menu.themeColor === 'emerald' ? '065f46' : menu.themeColor === 'rose' ? '9f1239' : menu.themeColor === 'amber' ? '9a3412' : '1e293b';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${content}&color=${qrColor}&bgcolor=ffffff&margin=15`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${menu.restaurantName} - Table Stand QR</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #f8fafc;
              color: #0f172a;
            }
            .card {
              background: white;
              border: 2px solid #e2e8f0;
              border-radius: 28px;
              padding: 48px 36px;
              text-align: center;
              max-width: 440px;
              width: 100%;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
            }
            .badge {
              display: inline-block;
              background: #f1f5f9;
              color: #475569;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.1em;
              text-transform: uppercase;
              padding: 4px 12px;
              border-radius: 9999px;
              margin-bottom: 20px;
            }
            .title { font-size: 28px; font-weight: 900; margin: 0 0 8px 0; color: #0f172a; }
            .desc { font-size: 14px; color: #64748b; margin: 0 0 28px 0; line-height: 1.5; }
            .qr-box {
              background: #ffffff;
              border: 2px solid #0f172a;
              border-radius: 20px;
              padding: 16px;
              display: inline-block;
              margin-bottom: 24px;
              box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
            }
            .qr-box img { width: 220px; height: 220px; display: block; }
            .scan-text { font-size: 15px; font-weight: 800; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase; }
            .footer-text { font-size: 12px; color: #94a3b8; margin-top: 24px; }
            @media print {
              body { background: white; padding: 0; }
              .card { border: 1px solid #cbd5e1; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">Digital Menu Access</div>
            <h1 class="title">${menu.restaurantName}</h1>
            <p class="desc">${menu.description || 'Scan the QR code below to view our full digital food & beverage menu.'}</p>
            <div class="qr-box">
              <img src="${qrUrl}" alt="Menu QR Code" />
            </div>
            <div class="scan-text">📱 Scan to View Touchless Menu</div>
            <div class="footer-text">Powered by FreeQRGen Platform</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    playAudioSound('preview');
  };

  const handlePreviewDigitalMenu = () => {
    const el = document.getElementById('mobile-menu-simulator-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    playAudioSound('preview');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    playAudioSound('generate');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Format price
  const formatPrice = (amount: number, currencyCode: string) => {
    const symbol = CURRENCY_MAP[currencyCode]?.symbol || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  // QR Generator properties
  const getQRContent = () => {
    // Generates a mock direct digital menu landing URL that the user can scan to open
    return `${window.location.origin}/menu-preview?id=${menu.id}&rest=${encodeURIComponent(menu.restaurantName)}`;
  };

  const getQRImageSrc = () => {
    const content = encodeURIComponent(getQRContent());
    // Theme colors for QR code foreground
    const qrColor = menu.themeColor === 'emerald' ? '065f46' : menu.themeColor === 'rose' ? '9f1239' : menu.themeColor === 'amber' ? '9a3412' : '1e293b';
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${content}&color=${qrColor}&bgcolor=ffffff&margin=15`;
  };

  // Colors mapping based on themeColor
  const themeClasses = {
    emerald: {
      accent: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      border: 'border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500',
      text: 'text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-100',
      lightBg: 'bg-emerald-50/40',
      ring: 'ring-emerald-500',
      solidColor: 'emerald'
    },
    rose: {
      accent: 'bg-rose-600 hover:bg-rose-700 text-white',
      border: 'border-rose-200 focus:ring-rose-500 focus:border-rose-500',
      text: 'text-rose-700',
      badge: 'bg-rose-50 text-rose-800 border-rose-100',
      lightBg: 'bg-rose-50/40',
      ring: 'ring-rose-500',
      solidColor: 'rose'
    },
    amber: {
      accent: 'bg-amber-600 hover:bg-amber-700 text-white',
      border: 'border-amber-200 focus:ring-amber-500 focus:border-amber-500',
      text: 'text-amber-700',
      badge: 'bg-amber-50 text-amber-800 border-amber-100',
      lightBg: 'bg-amber-50/40',
      ring: 'ring-amber-500',
      solidColor: 'amber'
    },
    neutral: {
      accent: 'bg-slate-900 hover:bg-slate-800 text-white',
      border: 'border-slate-300 focus:ring-slate-900 focus:border-slate-900',
      text: 'text-slate-800',
      badge: 'bg-slate-50 text-slate-800 border-slate-200',
      lightBg: 'bg-slate-50/60',
      ring: 'ring-slate-900',
      solidColor: 'slate'
    }
  };

  const selectedTheme = themeClasses[menu.themeColor];

  return (
    <div id="restaurant-menu-module" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Visual Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/20">
              {tMenu("Interactive Menu Hub")}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            {tMenu("Gourmet QR Restaurant Menu")}
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            {tMenu("Design beautiful, high-converting digital restaurant menus with variants, active promotion tags, multi-language translation selectors, and interactive simulated smartphone menu previews.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => {
              setMenu({
                id: 'menu-' + Math.random().toString(36).substring(2, 9),
                restaurantName: 'The Vineyard Italian',
                description: 'Classic stonebaked pizzas, handmade pasta, and exquisite Italian reserve wines.',
                currency: 'EUR',
                selectedLanguage: 'en',
                themeColor: 'rose',
                categories: [
                  { id: 'cat-1', name: { en: 'Handmade Pasta', es: 'Pasta Artesana', fr: 'Pâtes Artisanales', it: 'Pasta Fatta a Mano', ar: 'الباستا الإيطالية' }, icon: '🍝' },
                  { id: 'cat-2', name: { en: 'Specialty Drinks', es: 'Bebidas de Especialidad', fr: 'Boissons Spéciales', it: 'Bevande Speciali', ar: 'مشروبات مميزة' }, icon: '🍷' }
                ],
                items: [
                  {
                    id: 'itm-italian-1',
                    categoryId: 'cat-1',
                    name: { en: 'Truffle Pappardelle', es: 'Pappardelle de Trufa', fr: 'Pappardelle aux Truffes', it: 'Pappardelle al Tartufo', ar: 'بابارديل بالتروفل' },
                    description: { en: 'Rich egg pasta tossed in wild porcini mushroom sauce and shaved fresh black winter truffle.', es: 'Pasta fresca con salsa de boletus y trufa negra fresca rallada.', fr: 'Pâtes fraîches nappées de sauce aux cèpes et truffe noire fraîche râpée.', it: 'Pasta all uovo fresca condita con salsa ai funghi porcini e scaglie di tartufo nero fresco.', ar: 'باستا البيض الغنية بالصلصة مع فطر البورشيني والتروفل الشتوي الأسود الطازج.' },
                    price: 24.50,
                    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
                    variants: [{ name: 'Half portion', priceModifier: -5 }, { name: 'Full portion', priceModifier: 0 }],
                    offerTag: 'Fresh'
                  }
                ]
              });
              playAudioSound('preview');
            }}
            className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all hover:bg-slate-750 cursor-pointer"
          >
            {tMenu("Load Italian Theme")}
          </button>
          <button
            onClick={handleSaveMenu}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer ${selectedTheme.accent}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSaving ? tMenu('Syncing...') : tMenu('Publish & Sync Menu')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: The Interactive Menu Builder Forms */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section A: Brand details & Multilingual toggle */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-5 h-5 text-indigo-500" />
                  {tMenu("1. Brand Identity & Global Locales")}
                </h3>
                <p className="text-[11px] text-slate-400">{tMenu("Configure core descriptors and choose active language to enter data.")}</p>
              </div>

              {/* Active Localization Language for input fields */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { code: 'en', label: '🇬🇧 EN' },
                  { code: 'es', label: '🇪🇸 ES' },
                  { code: 'fr', label: '🇫🇷 FR' },
                  { code: 'it', label: '🇮🇹 IT' },
                  { code: 'ar', label: '🇸🇦 AR' }
                ].map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      const autoCurrency = LANGUAGE_DEFAULT_CURRENCY[l.code] || 'USD';
                      setMenu(prev => ({
                        ...prev,
                        selectedLanguage: l.code as any,
                        currency: autoCurrency
                      }));
                      playAudioSound('preview');
                    }}
                    className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${menu.selectedLanguage === l.code ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{tMenu("Restaurant Name")}</label>
                <input
                  type="text"
                  value={menu.restaurantName}
                  onChange={e => setMenu(prev => ({ ...prev, restaurantName: e.target.value }))}
                  placeholder={tMenu("e.g. Gusto Bistro")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{tMenu("Menu Currency")}</label>
                <select
                  value={menu.currency}
                  onChange={e => setMenu(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all font-medium cursor-pointer"
                >
                  {Object.entries(CURRENCY_MAP).map(([code, item]) => (
                    <option key={code} value={code}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{tMenu("Short Restaurant Slogan")}</label>
                <input
                  type="text"
                  value={menu.description}
                  onChange={e => setMenu(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={tMenu("e.g. Handmade pasta, fresh stonebaked pizza, exquisite desserts.")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Menu Theme selector */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <label className="block text-xs font-bold text-slate-700">{tMenu("Brand Palette & Styling Vibe")}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'emerald', label: 'Forest Greenery', style: 'bg-emerald-600 text-emerald-100', desc: 'Organic, wholesome' },
                  { id: 'rose', label: 'Burgundy Wine', style: 'bg-rose-800 text-rose-100', desc: 'Luxury, fine dining' },
                  { id: 'amber', label: 'Golden Saffron', style: 'bg-amber-600 text-amber-100', desc: 'Vibrant, warm spices' },
                  { id: 'neutral', label: 'Slate Charcoal', style: 'bg-slate-900 text-slate-100', desc: 'Minimal, modern' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMenu(prev => ({ ...prev, themeColor: item.id as any }));
                      playAudioSound('preview');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${menu.themeColor === item.id ? 'ring-2 ring-indigo-500 border-transparent shadow-sm scale-[1.02]' : 'hover:bg-slate-50 border-slate-200'}`}
                  >
                    <div className={`w-5 h-5 rounded-full ${item.style} flex items-center justify-center text-[10px] font-bold border border-white/20 mb-2`}>✓</div>
                    <p className="text-[11px] font-bold leading-none">{isArabic ? (item.id === 'emerald' ? 'خضار الغابة' : item.id === 'rose' ? 'نبيذ بورغندي' : item.id === 'amber' ? 'زعفران ذهبي' : 'فحم رمادي') : item.label}</p>
                    <p className="text-[8px] text-slate-400 mt-1">{isArabic ? (item.id === 'emerald' ? 'عضوي وصحي' : item.id === 'rose' ? 'فاخر، راقي' : item.id === 'amber' ? 'حيوي، بهارات دافئة' : 'بسيط وحديث') : item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section B: Categories management */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-5 h-5 text-amber-500" />
                  {tMenu("2. Menu Categories")}
                </h3>
                <p className="text-[11px] text-slate-400">{tMenu("Add or rename major food/drink sections. Drag down & remove categories.")}</p>
              </div>

              <button
                type="button"
                onClick={handleAddCategory}
                className={`py-1.5 px-3 border border-indigo-100 text-indigo-600 hover:bg-indigo-50 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer`}
              >
                <Plus className="w-4 h-4" />
                {tMenu("Add Category")}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menu.categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200/50 rounded-2xl relative group">
                  
                  {/* Category icon dropdown/select */}
                  <select
                    value={cat.icon}
                    onChange={e => handleUpdateCategoryIcon(cat.id, e.target.value)}
                    className="p-1.5 border border-slate-200 rounded-lg text-sm bg-white cursor-pointer"
                  >
                    {PRESET_ICONS.map(ic => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>

                  <div className="flex-1 min-w-0">
                    <label className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">
                      {tMenu("Name")} ({menu.selectedLanguage.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={cat.name[menu.selectedLanguage] || ''}
                      onChange={e => handleUpdateCategoryName(cat.id, e.target.value)}
                      placeholder={tMenu("e.g. Main Dishes")}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 outline-none focus:border-indigo-400"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveCategory(cat.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
                    title={tMenu("Delete Category (Cascades items)")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Product Item Creator */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                <PlusCircle className="w-5 h-5 text-emerald-500" />
                {tMenu("3. Create New Dish / Beverage")}
              </h3>
              <p className="text-[11px] text-slate-400">{tMenu("Configure core product details, pricing, tags, and variants to append them below.")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 p-4 sm:p-5 rounded-2xl border border-slate-200/40">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{tMenu("Target Category")}</label>
                <select
                  value={newItemCategory}
                  onChange={e => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white outline-none"
                >
                  {menu.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {getCatName(c, menu.selectedLanguage)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{tMenu("Item Title (English)")}</label>
                <input
                  type="text"
                  value={newItemNames.en}
                  onChange={e => setNewItemNames(prev => ({ ...prev, en: e.target.value }))}
                  placeholder={tMenu("e.g. Avocado Toast Deluxe")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:ring-1 focus:ring-indigo-400 outline-none"
                />
              </div>

              {(isArabic || menu.selectedLanguage === 'ar') ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{tMenu("Item Title (Arabic)")}</label>
                  <input
                    type="text"
                    value={newItemNames.ar}
                    onChange={e => setNewItemNames(prev => ({ ...prev, ar: e.target.value }))}
                    placeholder="مثال: لحم كبسة فاخر"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:ring-1 focus:ring-indigo-400 outline-none"
                    dir="rtl"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{tMenu("Item Title (Spanish)")}</label>
                  <input
                    type="text"
                    value={newItemNames.es}
                    onChange={e => setNewItemNames(prev => ({ ...prev, es: e.target.value }))}
                    placeholder={tMenu("e.g. Tostada de Aguacate")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:ring-1 focus:ring-indigo-400 outline-none"
                  />
                </div>
              )}

              <div className={(isArabic || menu.selectedLanguage === 'ar') ? "sm:col-span-1" : "sm:col-span-2"}>
                <label className="block text-xs font-bold text-slate-700 mb-1">{tMenu("English Description")}</label>
                <input
                  type="text"
                  value={newItemDescs.en}
                  onChange={e => setNewItemDescs(prev => ({ ...prev, en: e.target.value }))}
                  placeholder={tMenu("e.g. Smashed organic avocados on sourdough with poached eggs.")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:ring-1 focus:ring-indigo-400 outline-none"
                />
              </div>

              {(isArabic || menu.selectedLanguage === 'ar') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{tMenu("Arabic Description")}</label>
                  <input
                    type="text"
                    value={newItemDescs.ar}
                    onChange={e => setNewItemDescs(prev => ({ ...prev, ar: e.target.value }))}
                    placeholder="مثال: طبق أرز برياني لذيذ مع دجاج تندوري متبل."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:ring-1 focus:ring-indigo-400 outline-none"
                    dir="rtl"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{tMenu("Base Price")}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 text-xs font-extrabold select-none pointer-events-none">
                    {CURRENCY_MAP[menu.currency]?.symbol || '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    placeholder="15.00"
                    className={`w-full ${(CURRENCY_MAP[menu.currency]?.symbol || '$').length > 2 ? 'pl-11' : (CURRENCY_MAP[menu.currency]?.symbol || '$').length > 1 ? 'pl-8' : 'pl-6'} pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:ring-1 focus:ring-indigo-400 outline-none font-semibold`}
                  />
                </div>
              </div>

              {/* Active Offer Tag / Promo labels */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{tMenu("Promo Label (Optional)")}</label>
                <input
                  type="text"
                  value={newItemOffer}
                  onChange={e => setNewItemOffer(e.target.value)}
                  placeholder={tMenu("e.g. Chef's Choice, 20% Off")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white outline-none"
                />
              </div>

              {/* Culinary details and preferences toggles */}
              <div className="sm:col-span-2 flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newItemIsVegetarian}
                    onChange={e => setNewItemIsVegetarian(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500"
                  />
                  🌿 {tMenu("Vegetarian / Green Vegan")}
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newItemIsSpicy}
                    onChange={e => setNewItemIsSpicy(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded-md border-slate-300 focus:ring-rose-500"
                  />
                  🌶️ {tMenu("Spicy / Fiery Heat")}
                </label>
              </div>

              {/* Image picker */}
              <div className="sm:col-span-3 border-t border-slate-100 pt-3">
                <label className="block text-xs font-bold text-slate-700 mb-2">{tMenu("Selected Culinary Image")}</label>
                
                {/* Mode Select Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setImageSourceMode('preset');
                      setNewItemImage(PRESET_CULINARY_IMAGES[0].url);
                      playAudioSound('preview');
                    }}
                    className={`py-2 px-3 rounded-xl border text-[10px] font-extrabold text-center transition-all cursor-pointer ${imageSourceMode === 'preset' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    🎨 {tMenu("Option A: Select Preset Image")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageSourceMode('upload');
                      setNewItemImage(customUploadedImage || '');
                      playAudioSound('preview');
                    }}
                    className={`py-2 px-3 rounded-xl border text-[10px] font-extrabold text-center transition-all cursor-pointer ${imageSourceMode === 'upload' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    📤 {tMenu("Option B: Upload Custom Picture")}
                  </button>
                </div>

                {imageSourceMode === 'preset' ? (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {filteredCulinaryImages.map(pic => (
                      <button
                        key={pic.name}
                        type="button"
                        onClick={() => {
                          setNewItemImage(pic.url);
                          playAudioSound('preview');
                        }}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${newItemImage === pic.url ? 'border-indigo-600 scale-105 shadow-xs' : 'border-transparent opacity-80 hover:opacity-100'}`}
                      >
                        <img src={pic.url} alt={pic.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/65 text-[7px] text-white py-0.5 text-center truncate px-1">
                          {tMenu(pic.name)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Drag and Drop Container */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[110px] ${
                        dragActive 
                          ? "border-indigo-500 bg-indigo-50/50" 
                          : "border-slate-300 hover:border-indigo-400 bg-white"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      {newItemImage && newItemImage.startsWith('data:') ? (
                        <div className="flex flex-col items-center gap-2 relative z-20">
                          <img 
                            src={newItemImage} 
                            alt="Uploaded preview" 
                            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs bg-slate-50"
                          />
                          <p className="text-[10px] font-bold text-emerald-600">
                            ✨ {tMenu("Custom Image Uploaded Successfully!")}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCustomUploadedImage(null);
                              setNewItemImage(PRESET_CULINARY_IMAGES[0].url);
                              setImageSourceMode('preset');
                              playAudioSound('preview');
                            }}
                            className="text-[9px] font-bold text-slate-500 hover:text-rose-600 transition-colors underline cursor-pointer"
                          >
                            {tMenu("Remove & Use Preset")}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          {uploadError ? (
                            <p className="text-[10px] font-semibold text-rose-600 bg-rose-50/80 px-2.5 py-1.5 rounded-xl border border-rose-100 mb-1">
                              ⚠️ {uploadError}
                            </p>
                          ) : (
                            <div className="p-2 bg-indigo-50 rounded-full text-indigo-500">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                          )}
                          <p className="text-[10px] font-black text-slate-700">
                            {tMenu("Drag & drop your dish picture here, or click to browse")}
                          </p>
                          <p className="text-[8px] text-slate-400">
                            {tMenu("Supports PNG, JPG, JPEG up to 5MB")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-3 flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {tMenu("Append Dish to Menu")}
                </button>
              </div>

            </div>

            {/* List of current items & Variants editor */}
            <div className="space-y-4 pt-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{tMenu("Active Dishes & Variant Pricing")}</h4>
              
              <div className="space-y-4">
                {menu.items.map(item => {
                  const itemCat = menu.categories.find(c => c.id === item.categoryId);
                  return (
                    <div key={item.id} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 sm:p-5 space-y-4">
                      
                      {/* Top section: Info and delete button */}
                      <div className="flex items-start gap-4">
                        <img
                          src={item.imageUrl}
                          alt="Culinary preview"
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full uppercase">
                              {itemCat?.icon} {itemCat ? getCatName(itemCat, menu.selectedLanguage) : 'Unassigned'}
                            </span>
                            {item.offerTag && (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                                <Tag className="w-2.5 h-2.5" />
                                {item.offerTag}
                              </span>
                            )}
                            {item.isVegetarian && <span className="text-[10px]" title="Vegetarian">🌿</span>}
                            {item.isSpicy && <span className="text-[10px]" title="Spicy">🌶️</span>}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            <div>
                              <label className="text-[8px] font-bold text-slate-400 block uppercase">{tMenu("Name")} ({menu.selectedLanguage.toUpperCase()})</label>
                              <input
                                type="text"
                                value={item.name[menu.selectedLanguage] || ''}
                                onChange={e => handleUpdateItemLang(item.id, 'name', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-slate-400 block uppercase">{tMenu("Description")} ({menu.selectedLanguage.toUpperCase()})</label>
                              <input
                                type="text"
                                value={item.description[menu.selectedLanguage] || ''}
                                onChange={e => handleUpdateItemLang(item.id, 'description', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant block editor */}
                      <div className="bg-white border border-slate-200/50 rounded-xl p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                            {tMenu("Portion Sizes & Custom Variants")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddItemVariant(item.id)}
                            className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            + {tMenu("Add Variant")}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.variants.map((v, vIdx) => (
                            <div key={vIdx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <input
                                type="text"
                                value={v.name}
                                onChange={e => handleUpdateItemVariant(item.id, vIdx, 'name', e.target.value)}
                                placeholder={tMenu("Size/Option")}
                                className="flex-1 bg-white border border-slate-200 rounded-md px-2 py-1 text-[10px] text-slate-800 outline-none"
                              />
                              <div className="w-20 relative">
                                <span className="absolute left-1.5 top-1.5 text-[8px] text-slate-400 font-bold">+</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={v.priceModifier}
                                  onChange={e => handleUpdateItemVariant(item.id, vIdx, 'priceModifier', parseFloat(e.target.value) || 0)}
                                  className="w-full bg-white border border-slate-200 rounded-md pl-3.5 pr-1.5 py-1 text-[10px] text-slate-850 font-bold outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveItemVariant(item.id, vIdx)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })}

                {menu.items.length === 0 && (
                  <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-xs text-slate-400">{tMenu("No dishes created yet. Fill out the appended form above to insert plates.")}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Mobile Simulator Mockup, Customized Restaurant QR Code, and JSON Schema */}
        <div className="lg:col-span-5 space-y-8 sticky top-24">
          
          {/* Section 1: Simulated Mobile Device Menu Preview */}
          <div id="mobile-menu-simulator-container" className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                {tMenu("Table-Top Smartphone Menu Preview")}
              </span>
              
              {/* Simulated Customer Language select */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border">
                {['en', 'es', 'fr', 'it', 'ar'].map(l => (
                  <button
                    key={l}
                    onClick={() => {
                      setSimulatedLanguage(l as any);
                      playAudioSound('preview');
                    }}
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase ${simulatedLanguage === l ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated iPhone Screen */}
            <div className="relative w-full max-w-[340px] mx-auto h-[580px] rounded-[40px] border-[10px] border-slate-950 bg-slate-950 shadow-2xl relative overflow-hidden flex flex-col">
              
              {/* Top notch camera sensor */}
              <div className="absolute top-2 inset-x-0 flex justify-center z-40">
                <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-end px-3">
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                </div>
              </div>

              {/* Status Bar simulation */}
              <div className="h-6 bg-slate-900 flex items-center justify-between px-6 text-[9px] text-white/90 z-30 shrink-0">
                <span>9:41 AM</span>
                <span className="flex items-center gap-1">
                  <span>📶</span>
                  <span>🔋 98%</span>
                </span>
              </div>

              {/* Simulated Application Frame Viewport */}
              <div className="flex-1 bg-white overflow-y-auto flex flex-col text-slate-900 relative">
                
                {/* Hero Restaurant Banner */}
                <div className="relative h-24 bg-slate-900 text-white shrink-0 flex items-end p-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${menu.items[0]?.imageUrl || PRESET_CULINARY_IMAGES[0].url})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  <div className="relative z-10">
                    <h4 className="text-sm font-black tracking-tight">{menu.restaurantName}</h4>
                    <p className="text-[8px] text-slate-300 line-clamp-1">{menu.description}</p>
                  </div>
                </div>

                {/* Categories Slider */}
                <div className="bg-slate-50 border-b border-slate-100 py-1.5 px-3 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
                  <button
                    onClick={() => {
                      setActiveCategoryFilter('all');
                      playAudioSound('preview');
                    }}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-full whitespace-nowrap shrink-0 border transition-all ${activeCategoryFilter === 'all' ? 'bg-slate-900 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    🍽️ {tMenu("All Items")}
                  </button>
                  {menu.categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategoryFilter(cat.id);
                        playAudioSound('preview');
                      }}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded-full whitespace-nowrap shrink-0 border transition-all ${activeCategoryFilter === cat.id ? 'bg-slate-900 text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                      {cat.icon} {getCatName(cat, simulatedLanguage)}
                    </button>
                  ))}
                </div>

                {/* Menu items feed */}
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                  {menu.items
                    .filter(item => activeCategoryFilter === 'all' || item.categoryId === activeCategoryFilter)
                    .map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActivePreviewItem(item);
                          setTempVariant(item.variants[0] || null);
                          playAudioSound('preview');
                        }}
                        className="flex gap-2.5 bg-slate-50 border border-slate-100 p-2 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-colors"
                      >
                        <img
                          src={item.imageUrl}
                          alt={getItemName(item, simulatedLanguage)}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1.5">
                              <h5 className="text-[11px] font-extrabold text-slate-800 truncate">
                                {getItemName(item, simulatedLanguage)}
                              </h5>
                              <span className="text-[10px] font-black text-slate-900">
                                {formatPrice(item.price, menu.currency)}
                              </span>
                            </div>
                            <p className="text-[8px] text-slate-400 line-clamp-2 leading-snug">
                              {getItemDesc(item, simulatedLanguage)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-center gap-1">
                              {item.isVegetarian && <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded font-black">🌿 VEG</span>}
                              {item.isSpicy && <span className="text-[8px] bg-rose-50 text-rose-700 px-1 py-0.5 rounded font-black">🌶️ SPICY</span>}
                            </div>
                            {item.offerTag && (
                              <span className="text-[7px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                                {item.offerTag}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {menu.items.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-[10px] text-slate-400">{tMenu("Empty menu setup")}</p>
                    </div>
                  )}
                </div>

                {/* Simulated table client checkout section */}
                <div className="bg-slate-50 border-t border-slate-100 p-2.5 shrink-0 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                      {tMenu("Mock Table Cart")} ({simulatedCart.length})
                    </span>
                    <span className="text-slate-900 font-extrabold">{tMenu("Total")}: {formatPrice(getCartTotal(), menu.currency)}</span>
                  </div>

                  {simulatedCart.length > 0 ? (
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {simulatedCart.map((cartEntry, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[8px] bg-white p-1 rounded border border-slate-100">
                          <span className="text-slate-700 truncate font-semibold">
                            {cartEntry.quantity}x {getItemName(cartEntry.item, simulatedLanguage)} ({tMenu(cartEntry.selectedVariant.name)})
                          </span>
                          <button
                            onClick={() => handleRemoveFromCart(idx)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            {tMenu("Remove")}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[8px] text-slate-400 text-center">{tMenu("Scan QR code, select dishes & click simulated variants to order.")}</p>
                  )}
                </div>

                {/* Interactive Variant Popup modal inside the iPhone */}
                <AnimatePresence>
                  {activePreviewItem && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-900/60 z-50 flex items-end"
                    >
                      <motion.div
                        initial={{ y: 150 }}
                        animate={{ y: 0 }}
                        exit={{ y: 150 }}
                        className="bg-white rounded-t-2xl w-full p-4 space-y-3.5"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[7px] text-indigo-600 font-bold uppercase tracking-wider">{tMenu("ADD TO BASKET")}</span>
                            <h6 className="text-xs font-black text-slate-900">{getItemName(activePreviewItem, simulatedLanguage)}</h6>
                          </div>
                          <button
                            onClick={() => setActivePreviewItem(null)}
                            className="text-slate-400 font-bold text-xs p-1"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Variants check list inside simulation */}
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-bold text-slate-400 block uppercase">{tMenu("Choose portion variation:")}</span>
                          {activePreviewItem.variants.map((v, i) => (
                            <label
                              key={i}
                              className={`flex items-center justify-between p-2 rounded-lg border text-[9px] cursor-pointer transition-colors ${tempVariant?.name === v.name ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                            >
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="radio"
                                  name="mock-variant"
                                  checked={tempVariant?.name === v.name}
                                  onChange={() => setTempVariant(v)}
                                  className="hidden"
                                />
                                <span className="font-bold">{tMenu(v.name)}</span>
                              </div>
                              <span className="font-extrabold">
                                {v.priceModifier > 0 ? `+${formatPrice(v.priceModifier, menu.currency)}` : tMenu('Included')}
                              </span>
                            </label>
                          ))}
                        </div>

                        <button
                          onClick={handleAddToCart}
                          className="w-full py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {tMenu("Simulate Adding to Table Order")}
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Bottom Home indicator */}
              <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
                <div className="w-24 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
          </div>

          {/* Section 2: Menu QR Code Integration Panel */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-indigo-600" />
                {tMenu("Table-Stand QR Export")}
              </h4>
              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${selectedTheme.badge}`}>
                {tMenu("Table Ready QR")}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col sm:flex-row items-center gap-5">
              <div className="w-28 h-28 shrink-0 bg-slate-50 p-1.5 rounded-xl border border-slate-100 flex items-center justify-center">
                <img
                  src={getQRImageSrc()}
                  alt="Restaurant menu QR preview"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 space-y-2.5 w-full text-center sm:text-left">
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{tMenu("Table-top Tent Card URL")}</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {tMenu("Print or download high-resolution QR codes for table tents or wine cards to grant guests touchless smartphone access.")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
                  <button
                    onClick={() => downloadMenuQR('png')}
                    className="py-1 px-3 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {tMenu("Download PNG")}
                  </button>
                  <button
                    onClick={() => downloadMenuQR('svg')}
                    className="py-1 px-3 bg-slate-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {tMenu("Download SVG")}
                  </button>
                  <button
                    onClick={handleDownloadTableStandPDF}
                    className="py-1 px-3 bg-indigo-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-300" />
                    {tMenu("Download Table-Stand (PDF)")}
                  </button>
                  <button
                    onClick={handlePreviewDigitalMenu}
                    className="py-1 px-3 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {tMenu("Preview Digital Menu")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Digital Menu Link & PDF Menu Builder */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black tracking-widest uppercase text-slate-800">
                  {tMenu("Digital Menu & Quick PDF Builder")}
                </h4>
              </div>

              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {tMenu("SEO Schema Active")}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              {tMenu("Your digital menu is published with live search optimization. Connect a PDF menu link or use the Quick Food Item Builder to update your live offerings.")}
            </p>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                  {tMenu("PDF Upload / Direct Menu Link")}
                </span>
                <button
                  onClick={() => copyToClipboard(getQRContent(), 'Direct Menu Link')}
                  className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  {copiedField === 'Direct Menu Link' ? tMenu('Copied Link!') : tMenu('Copy Link')}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getQRContent()}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-mono text-slate-600 truncate"
                />
                <button
                  onClick={handlePreviewDigitalMenu}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-xl shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  {tMenu("Open Preview")}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
