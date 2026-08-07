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
  currency: string;      // e.g., "USD", "EUR", "GBP"
  selectedLanguage: 'en' | 'es' | 'fr' | 'it' | 'ar'; // Current builder language
  categories: MenuCategory[];
  items: MenuItem[];
  themeColor: 'emerald' | 'rose' | 'amber' | 'neutral';
}

// Preset Premium Culinary Images from Unsplash
const PRESET_CULINARY_IMAGES = [
  { name: 'Neapolitan Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80' },
  { name: 'Gourmet Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80' },
  { name: 'Fresh Salad', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80' },
  { name: 'Signature Steak', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
  { name: 'Craft Cocktail', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&auto=format&fit=crop&q=80' },
  { name: 'Chocolate Fondant', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80' }
];

const PRESET_ICONS = ['🍕', '🍔', '🥗', '🍹', '🍰', '🥩', '🍝', '☕', '🍣', '🥞', '🍷', '🌮'];

export default function RestaurantMenu() {
  const { locale } = useTranslation();
  const isArabic = locale === 'ar';

  const tMenu = (enText: string): string => {
    if (!isArabic) return enText;
    const dict: Record<string, string> = {
      "Interactive Menu Hub": "مركز القوائم التفاعلية",
      "Gourmet QR Restaurant Menu": "قائمة مطعم QR الفاخرة",
      "Design beautiful, high-converting digital restaurant menus with variants, active promotion tags, multi-language translation selectors, and interactive simulated smartphone menu previews.": "صمّم قوائم طعام رقمية جميلة وعالية التحويل للمطاعم مع المتغيرات، وشارات الترويج النشطة، ومحددات الترجمة متعددة اللغات، ومعاينات تفاعلية لمحاكاة قائمة الهاتف الذكي.",
      "Load Italian Theme": "تحميل السمة الإيطالية",
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
      "Add Category": "إضافة فئة",
      "3. Create New Dish / Beverage": "3. إنشاء طبق / مشروب جديد",
      "Configure core product details, pricing, tags, and variants to append them below.": "تكوين تفاصيل المنتج الأساسية، والتسعير، والشارات، والمتغيرات لإضافتها أدناه.",
      "Target Category": "الفئة المستهدفة",
      "Item Title (English)": "اسم الصنف (بالإنجليزي)",
      "Base Price ($)": "السعر الأساسي ($)",
      "Active Special Tag": "شارة خاصة نشطة",
      "Item Description (English)": "وصف الصنف (بالإنجليزي)",
      "Select an active special tag to highlight this dish": "اختر شارة خاصة نشطة لإبراز هذا الطبق",
      "Special dietary attributes": "سمات غذائية خاصة",
      "Vegetarian": "نباتي",
      "Spicy": "حار",
      "Gluten-Free": "خالي من الغلوتين",
      "Create custom size/type variants with price modifiers": "أنشئ متغيرات مخصصة للحجم/النوع مع معدلات الأسعار",
      "Add Price Variant Option": "إضافة خيار متغير السعر",
      "Image URL (Optional)": "رابط الصورة (اختياري)",
      "Add Item to Menu Catalog": "إضافة الصنف إلى كتالوج القائمة",
      "4. Published Menu & Digital Catalog": "4. القائمة المنشورة والكتالوج الرقمي",
      "Review items organized by category. Click edit to adjust or trash to remove.": "راجع الأصناف المنظمة حسب الفئة. انقر فوق تحرير للضبط أو سلة المهملات للإزالة.",
      "No dishes created in this category. Click above to add some!": "لم يتم إنشاء أي أطباق في هذه الفئة. انقر أعلاه لإضافة بعضها!",
      "Live Preview Simulator": "محاكي المعاينة المباشرة",
      "Gourmet Live Previews": "معاينات حية فاخرة",
      "Scan QR Code to Open on Phone": "امسح رمز QR لفتحه على الهاتف",
      "Scan this high-fidelity QR design with your phone to view the active published menu layout instantly on your mobile device.": "امسح تصميم QR عالي الدقة هذا بهاتفك لعرض تخطيط القائمة النشط المنشور على الفور على جهازك المحمول.",
      "Publish menu to activate QR live link!": "انشر القائمة لتنشيط رابط QR المباشر!",
      "Options": "خيارات",
      "Edit Item": "تعديل الصنف",
      "Option Label": "تسمية الخيار",
      "Price modifier": "معدل السعر",
      "Delete variant": "حذف المتغير",
      "Update Item": "تحديث الصنف",
      "Cancel": "إلغاء",
      "Save Changes": "حفظ التغييرات"
    };
    return dict[enText] || enText;
  };

  const [menu, setMenu] = useState<RestaurantMenuConfig>({
    id: 'menu-' + Math.random().toString(36).substring(2, 9),
    restaurantName: isArabic ? 'جاستو بيسترو أند بار' : 'Gusto Bistro & Bar',
    description: isArabic ? 'تناول طعام عصري وحرفي بمكونات عضوية مصادرها محلية.' : 'Artisanal modern dining with locally sourced, organic ingredients.',
    currency: 'USD',
    selectedLanguage: isArabic ? 'ar' : 'en',
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
        description: { en: '400g prime grass-fed black angus ribeye served with fresh herb butter and triple-cooked rosemary fries.', es: '400g de ribeye premium de black angus alimentado con pasto, servido con mantequilla de hierbas finas y patatar fritas al romero.', fr: '400g d’entrecôte de boeuf black angus nouri à l’herbe, servie avec beurre d’herbes fraîches et frites au romarin.', it: '400g di costata di manzo black angus da pascolo, servito con burro alle erbe aromatiche e patatine fritte al rosmarino.', ar: 'ستيك ريب آي بلاك أنجوس فاخر مغذى على العشب 400 جرام يقدم مع زبدة الأعشاب الطازجة وبطاطا مقلية بالروزماري.' },
        price: 42.00,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
        variants: [
          { name: 'Medium Rare cooked', priceModifier: 0 },
          { name: 'Well Done slow-bake', priceModifier: 0 },
          { name: 'Topped with Seared Foie Gras', priceModifier: 12.00 }
        ],
        offerTag: 'Popular',
        isSpicy: false
      },
      {
        id: 'item-3',
        categoryId: 'cat-3',
        name: { en: 'Warm Lava Chocolate Cake', es: 'Volcán de Chocolate Caliente', fr: 'Fondant au Chocolat Chaud', it: 'Tortino al Cioccolato Caldo', ar: 'كيكة الشوكولاتة لافا الدافئة' },
        description: { en: 'Molten Belgian dark chocolate middle, served with a scoop of Tahitian vanilla bean ice cream & raspberry coulis.', es: 'Centro fundido de chocolate amargo belga, servido con helado de vainilla de Tahití y coulis de frambuesa.', fr: 'Cœur coulant au chocolat noir belge, servi avec une boule de glace à la vanille de Tahiti et coulis de framboise.', it: 'Cuore di cioccolato fondente belga fuso, servito con gelato alla vaniglia di Tahiti e coulis di lamponi.', ar: 'وسط شوكولاتة بلجيكية داكنة سائلة، يقدم مع مغرفة من آيس كريم فانيليا تاهيتي وكوليس التوت.' },
        price: 12.50,
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
        variants: [
          { name: 'Single Scoop Ice Cream', priceModifier: 0 },
          { name: 'Double Scoop Ice Cream', priceModifier: 2.50 }
        ],
        isVegetarian: true
      }
    ]
  });

  const [savedMenus, setSavedMenus] = useState<RestaurantMenuConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Mobile simulation states
  const [simulatedLanguage, setSimulatedLanguage] = useState<'en' | 'es' | 'fr' | 'it'>('en');
  const [simulatedCart, setSimulatedCart] = useState<{ item: MenuItem; selectedVariant: MenuVariant; quantity: number }[]>([]);
  const [activePreviewItem, setActivePreviewItem] = useState<MenuItem | null>(null);
  const [tempVariant, setTempVariant] = useState<MenuVariant | null>(null);

  // New item draft states
  const [newItemCategory, setNewItemCategory] = useState<string>('cat-1');
  const [newItemNameEn, setNewItemNameEn] = useState('');
  const [newItemNameEs, setNewItemNameEs] = useState('');
  const [newItemDescEn, setNewItemDescEn] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('15.00');
  const [newItemImage, setNewItemImage] = useState(PRESET_CULINARY_IMAGES[0].url);
  const [newItemOffer, setNewItemOffer] = useState('');
  const [newItemIsVegetarian, setNewItemIsVegetarian] = useState(false);
  const [newItemIsSpicy, setNewItemIsSpicy] = useState(false);

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
        it: 'Nuova Categoria'
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
    if (!newItemNameEn.trim()) return;

    const newItemId = 'item-' + Math.random().toString(36).substring(2, 9);
    const priceNum = parseFloat(newItemPrice) || 12.00;

    const newItem: MenuItem = {
      id: newItemId,
      categoryId: newItemCategory,
      name: {
        en: newItemNameEn,
        es: newItemNameEs || newItemNameEn,
        fr: newItemNameEn,
        it: newItemNameEn
      },
      description: {
        en: newItemDescEn || 'Delectable chef crafted culinary creation seasoned to perfection.',
        es: newItemDescEn ? 'Creación culinaria exquisita del chef sazonada a la perfección.' : 'Delectable chef crafted culinary creation seasoned to perfection.',
        fr: 'Création culinaire exquise préparée avec passion.',
        it: 'Creazione culinaria artigianale preparata con passione.'
      },
      price: priceNum,
      imageUrl: newItemImage,
      variants: [
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
    setNewItemNameEn('');
    setNewItemNameEs('');
    setNewItemDescEn('');
    setNewItemOffer('');
    setNewItemIsVegetarian(false);
    setNewItemIsSpicy(false);

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
            variants: [...item.variants, { name: 'Extra Side Option', priceModifier: 2.50 }]
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
        "name": cat.name[menu.selectedLanguage] || cat.name['en'],
        "hasMenuItem": menu.items
          .filter(item => item.categoryId === cat.id)
          .map(item => ({
            "@type": "MenuItem",
            "name": item.name[menu.selectedLanguage] || item.name['en'],
            "description": item.description[menu.selectedLanguage] || item.description['en'],
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    playAudioSound('generate');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Format price
  const formatPrice = (amount: number, currency: string) => {
    const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
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
                      setMenu(prev => ({ ...prev, selectedLanguage: l.code as any }));
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
                  placeholder="e.g. Gusto Bistro"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{tMenu("Menu Currency")}</label>
                <select
                  value={menu.currency}
                  onChange={e => setMenu(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{tMenu("Short Restaurant Slogan")}</label>
                <input
                  type="text"
                  value={menu.description}
                  onChange={e => setMenu(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Handmade pasta, fresh stonebaked pizza, exquisite desserts."
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
                      {isArabic ? 'الاسم' : 'Name'} ({menu.selectedLanguage.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={cat.name[menu.selectedLanguage] || ''}
                      onChange={e => handleUpdateCategoryName(cat.id, e.target.value)}
                      placeholder="e.g. Main Dishes"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 outline-none focus:border-indigo-400"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveCategory(cat.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
                    title="Delete Category (Cascades items)"
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
                    <option key={c.id} value={c.id}>{c.icon} {c.name[menu.selectedLanguage] || c.name['en']}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{tMenu("Item Title (English)")}</label>
                <input
                  type="text"
                  value={newItemNameEn}
                  onChange={e => setNewItemNameEn(e.target.value)}
                  placeholder="e.g. Avocado Toast Deluxe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:ring-1 focus:ring-indigo-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Title (Spanish Spanish)</label>
                <input
                  type="text"
                  value={newItemNameEs}
                  onChange={e => setNewItemNameEs(e.target.value)}
                  placeholder="e.g. Tostada de Aguacate"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:ring-1 focus:ring-indigo-400 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">English Description</label>
                <input
                  type="text"
                  value={newItemDescEn}
                  onChange={e => setNewItemDescEn(e.target.value)}
                  placeholder="e.g. Smashed organic avocados on sourdough with poached eggs."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:ring-1 focus:ring-indigo-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Base Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    placeholder="15.00"
                    className="w-full pl-6 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:ring-1 focus:ring-indigo-400 outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Active Offer Tag / Promo labels */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Promo Label (Optional)</label>
                <input
                  type="text"
                  value={newItemOffer}
                  onChange={e => setNewItemOffer(e.target.value)}
                  placeholder="e.g. Chef's Choice, 20% Off"
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
                  🌿 Vegetarian / Green Vegan
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newItemIsSpicy}
                    onChange={e => setNewItemIsSpicy(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded-md border-slate-300 focus:ring-rose-500"
                  />
                  🌶️ Spicy / Fiery Heat
                </label>
              </div>

              {/* Image picker */}
              <div className="sm:col-span-3 border-t border-slate-100 pt-3">
                <label className="block text-xs font-bold text-slate-700 mb-2">Selected Culinary Image</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_CULINARY_IMAGES.map(pic => (
                    <button
                      key={pic.name}
                      type="button"
                      onClick={() => {
                        setNewItemImage(pic.url);
                        playAudioSound('preview');
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-transform ${newItemImage === pic.url ? 'border-indigo-600 scale-105' : 'border-transparent opacity-80 hover:opacity-100'}`}
                    >
                      <img src={pic.url} alt={pic.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-slate-900/65 text-[7px] text-white py-0.5 text-center truncate px-1">
                        {pic.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-3 flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Append Dish to Menu
                </button>
              </div>

            </div>

            {/* List of current items & Variants editor */}
            <div className="space-y-4 pt-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Active Dishes & Variant Pricing</h4>
              
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
                              {itemCat?.icon} {itemCat?.name[menu.selectedLanguage] || 'Unassigned'}
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
                              <label className="text-[8px] font-bold text-slate-400 block uppercase">Name ({menu.selectedLanguage})</label>
                              <input
                                type="text"
                                value={item.name[menu.selectedLanguage] || ''}
                                onChange={e => handleUpdateItemLang(item.id, 'name', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-slate-400 block uppercase">Description ({menu.selectedLanguage})</label>
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
                            Portion Sizes & Custom Variants
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddItemVariant(item.id)}
                            className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            + Add Variant
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.variants.map((v, vIdx) => (
                            <div key={vIdx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <input
                                type="text"
                                value={v.name}
                                onChange={e => handleUpdateItemVariant(item.id, vIdx, 'name', e.target.value)}
                                placeholder="Size/Option"
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
                    <p className="text-xs text-slate-400">No dishes created yet. Fill out the appended form above to insert plates.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Mobile Simulator Mockup, Customized Restaurant QR Code, and JSON Schema */}
        <div className="lg:col-span-5 space-y-8 sticky top-24">
          
          {/* Section 1: Simulated Mobile Device Menu Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                Table-Top Smartphone Menu Preview
              </span>
              
              {/* Simulated Customer Language select */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border">
                {['en', 'es', 'fr', 'it'].map(l => (
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
                    🍽️ All Items
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
                      {cat.icon} {cat.name[simulatedLanguage] || cat.name['en']}
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
                          alt={item.name[simulatedLanguage]}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1.5">
                              <h5 className="text-[11px] font-extrabold text-slate-800 truncate">
                                {item.name[simulatedLanguage] || item.name['en']}
                              </h5>
                              <span className="text-[10px] font-black text-slate-900">
                                {formatPrice(item.price, menu.currency)}
                              </span>
                            </div>
                            <p className="text-[8px] text-slate-400 line-clamp-2 leading-snug">
                              {item.description[simulatedLanguage] || item.description['en']}
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
                      <p className="text-[10px] text-slate-400">Empty menu setup</p>
                    </div>
                  )}
                </div>

                {/* Simulated table client checkout section */}
                <div className="bg-slate-50 border-t border-slate-100 p-2.5 shrink-0 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                      Mock Table Cart ({simulatedCart.length})
                    </span>
                    <span className="text-slate-900 font-extrabold">Total: {formatPrice(getCartTotal(), menu.currency)}</span>
                  </div>

                  {simulatedCart.length > 0 ? (
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {simulatedCart.map((cartEntry, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[8px] bg-white p-1 rounded border border-slate-100">
                          <span className="text-slate-700 truncate font-semibold">
                            {cartEntry.quantity}x {cartEntry.item.name[simulatedLanguage]} ({cartEntry.selectedVariant.name})
                          </span>
                          <button
                            onClick={() => handleRemoveFromCart(idx)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[8px] text-slate-400 text-center">Scan QR code, select dishes & click simulated variants to order.</p>
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
                            <span className="text-[7px] text-indigo-600 font-bold uppercase tracking-wider">ADD TO BASKET</span>
                            <h6 className="text-xs font-black text-slate-900">{activePreviewItem.name[simulatedLanguage] || activePreviewItem.name['en']}</h6>
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
                          <span className="text-[8px] font-bold text-slate-400 block uppercase">Choose portion variation:</span>
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
                                <span className="font-bold">{v.name}</span>
                              </div>
                              <span className="font-extrabold">
                                {v.priceModifier > 0 ? `+${formatPrice(v.priceModifier, menu.currency)}` : 'Included'}
                              </span>
                            </label>
                          ))}
                        </div>

                        <button
                          onClick={handleAddToCart}
                          className="w-full py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Simulate Adding to Table Order
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
                Live QR Code Integration
              </h4>
              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${selectedTheme.badge}`}>
                Table Ready QR
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
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Table-top Tent Card URL</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Print this high-resolution color-coded QR code on table tents or wine cards to grant guests instant touchless smartphone access.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = getQRImageSrc();
                      link.setAttribute('download', `${menu.restaurantName.replace(/\s+/g, '_')}_qr_code.png`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      playAudioSound('preview');
                    }}
                    className="py-1 px-3 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </button>
                  <button
                    onClick={() => copyToClipboard(getQRContent(), 'QR URL')}
                    className="py-1 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    {copiedField === 'QR URL' ? 'Link Copied!' : 'Copy Direct Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Google SEO Search Friendly JSON-LD */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black tracking-widest uppercase text-slate-300">
                  Google SEO Rich Snippet Schema
                </h4>
              </div>

              <button
                onClick={() => copyToClipboard(getMenuJSONLD(), 'JSON-LD')}
                className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                {copiedField === 'JSON-LD' ? 'Copied' : 'Copy LD+JSON Schema'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              Inject this fully populated <code className="text-emerald-400 font-mono">application/ld+json</code> structure into your restaurant’s site header to trigger Google’s Interactive Food Menus inside organic search result layouts.
            </p>

            <div className="max-h-36 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[8px] text-slate-300 scrollbar-thin">
              <pre>{getMenuJSONLD()}</pre>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
