import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ShoppingCart, ShoppingBag, Share2, Edit2, Copy, ExternalLink, X, Sparkles, Search, ChevronRight, MessageSquareText, Loader2, Minus, Globe } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';

// --- Firebase Config ---
const currentUrlParams = new URLSearchParams(window.location.search);

const firebaseConfig = {
  apiKey: "AIzaSyD6Vz3EXEE8C_67l1gJDVfqAmOmSv37XJs",
  authDomain: "family-grocery-dedb7.firebaseapp.com",
  projectId: "family-grocery-dedb7",
  storageBucket: "family-grocery-dedb7.firebasestorage.app",
  messagingSenderId: "329029861566",
  appId: "1:329029861566:web:5de3557a04afbcbac51eef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'grocery-app-default';

// --- מילון שפות (Translations Dictionary) ---
const translations = {
  he: {
    setupTitle: "מי בא לקנות?",
    setupDesc: "כדי שנדע מי הוסיף כל מוצר לרשימה, ספרו לנו מי אתם.",
    familyLabel: "שם המשפחה שלכם:",
    familyPlaceholder: "בית משפחת...",
    nameLabel: "השם הפרטי שלך:",
    namePlaceholder: "למשל: אבא, אמא, דני...",
    enterList: "היכנס לרשימה",
    familyOf: "משפחת",
    save: "שמור",
    share: "שתף",
    emptyCart: "הסל ריק כרגע",
    clearPurchased: "נקה מוצרים שנקנו",
    searchPlaceholder: "חיפוש מהיר של מוצרים...",
    searchResults: "תוצאות חיפוש:",
    notFound: "לא מצאנו",
    addCustom: "לא מצאת? הוסף בעצמך:",
    newProductName: "שם מוצר חדש",
    addBtn: "הוסף",
    backToCats: "חזרה לקטגוריות",
    addNewProduct: "הוסף מוצר חדש",
    aiTitle: "עוזר חכם למטבח ✨",
    aiDesc: "תגיד לי מה בא לך להכין, ואני אכתוב מתכון ואכין רשימת קניות!",
    aiPlaceholder: "למשל: בולונז או ארוחת ערב מהירה...",
    aiThinking: "חושב וכותב מתכון...",
    aiGenerate: "צור מתכון ומצרכים",
    ingredientsNeeded: "המצרכים הדרושים:",
    addAllToCart: "הוסף הכל לעגלה",
    aiAllRemoved: "הסרת את כל המצרכים - לא חסר לכם כלום למתכון! 🎉",
    recipeSteps: "הוראות הכנה שלב אחר שלב",
    customAddTitle: "הוספת מוצר",
    customAddLabel: "שם המוצר שחסר:",
    customAddPlaceholder: "למשל: גבינת עיזים",
    cancel: "ביטול",
    continueBtn: "המשך",
    selectAmount: "בחירת כמות",
    notePlaceholder: "הערה (למשל: רק של תנובה...)",
    tabList: "הרשימה",
    tabAdd: "הוספה",
    tabMagic: "קסם",
    toastAdded: "נוסף לעגלה!",
    toastCopied: "הקישור הועתק! הדבק בוואטסאפ.",
    toastAiError: "לא הצלחנו לייצר מתכון, נסה שוב.",
    toastKeyError: "אירעה שגיאה. ודא שהגדרת מפתח AI.",
    toastAiAdded: "הוספנו את המצרכים לעגלה!",
    shareModalTitle: "איך לשתף את האפליקציה?",
    shareFamilyBtn: "שתף רשימה משפחתית",
    shareFamilySub: "לעריכה משותפת של הרשימה הנוכחית",
    shareAppBtn: "שתף אפליקציה נקייה",
    shareAppSub: "לפתיחת רשימה חדשה וריקה",
    addedBy: "נוסף ע\"י:"
  },
  en: {
    setupTitle: "Who's Shopping?",
    setupDesc: "Tell us who you are so we know who added what.",
    familyLabel: "Family Name:",
    familyPlaceholder: "The Smith Family...",
    nameLabel: "Your First Name:",
    namePlaceholder: "e.g., Mom, Dad, Danny...",
    enterList: "Enter List",
    familyOf: "The",
    save: "Save",
    share: "Share",
    emptyCart: "Cart is empty",
    clearPurchased: "Clear Purchased",
    searchPlaceholder: "Quick product search...",
    searchResults: "Search Results:",
    notFound: "We couldn't find",
    addCustom: "Didn't find it? Add custom:",
    newProductName: "New product name",
    addBtn: "Add",
    backToCats: "Back to Categories",
    addNewProduct: "Add new product",
    aiTitle: "Smart Kitchen Assistant ✨",
    aiDesc: "Tell me what you crave, and I'll create a recipe and shopping list!",
    aiPlaceholder: "e.g., Bolognese or a quick dinner...",
    aiThinking: "Thinking & writing recipe...",
    aiGenerate: "Generate Recipe & List",
    ingredientsNeeded: "Ingredients needed:",
    addAllToCart: "Add All to Cart",
    aiAllRemoved: "You removed all ingredients - you're good to go! 🎉",
    recipeSteps: "Step-by-step Instructions",
    customAddTitle: "Add Custom Product",
    customAddLabel: "Missing product name:",
    customAddPlaceholder: "e.g., Goat cheese",
    cancel: "Cancel",
    continueBtn: "Continue",
    selectAmount: "Select Amount",
    notePlaceholder: "Note (e.g., Only specific brand...)",
    tabList: "List",
    tabAdd: "Add",
    tabMagic: "Magic",
    toastAdded: "added to cart!",
    toastCopied: "Link copied! Paste in WhatsApp.",
    toastAiError: "Couldn't generate recipe, try again.",
    toastKeyError: "Error occurred. Check AI API key.",
    toastAiAdded: "Added ingredients to cart!",
    shareModalTitle: "How would you like to share?",
    shareFamilyBtn: "Share Family List",
    shareFamilySub: "Collaborate on this current list",
    shareAppBtn: "Share Clean App",
    shareAppSub: "Start a brand new, empty list",
    addedBy: "Added by:"
  }
};

// --- קטלוג מוצרים בעברית ---
const CATEGORIES_HE = {
  'מקרר ומוצרי חלב': {
    'חלב ומשקאות': [
      { name: 'חלב 3%', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150', emoji: '🥛' },
      { name: 'חלב 1%', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150', emoji: '🥛' },
      { name: 'חלב שיבולת שועל', img: null, emoji: '🌾' },
      { name: 'חלב סויה', img: null, emoji: '🌱' },
      { name: 'שוקו', img: null, emoji: '🧋' }
    ],
    'גבינות': [
      { name: 'גבינה צהובה', img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=150', emoji: '🧀' },
      { name: 'קוטג׳', img: null, emoji: '🥣' },
      { name: 'גבינה לבנה', img: null, emoji: '🥣' },
      { name: 'גבינה בולגרית', img: null, emoji: '🧀' }
    ],
    'ביצים וסלטים': [
      { name: 'ביצים L', img: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=150', emoji: '🥚' },
      { name: 'חמאה', img: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=150', emoji: '🧈' },
      { name: 'חומוס', img: null, emoji: '🥣' },
      { name: 'טחינה', img: null, emoji: '🥣' }
    ]
  },
  'ירקות ופירות': {
    'ירקות': [
      { name: 'עגבניה', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150', emoji: '🍅' },
      { name: 'מלפפון', img: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=150', emoji: '🥒' },
      { name: 'בצל', img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=150', emoji: '🧅' },
      { name: 'שום', img: 'https://images.unsplash.com/photo-1587049352847-81a56d773c1c?w=150', emoji: '🧄' },
      { name: 'תפוח אדמה', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150', emoji: '🥔' }
    ],
    'פירות': [
      { name: 'בננה', img: 'https://images.unsplash.com/photo-1571501435520-c06f52e82502?w=150', emoji: '🍌' },
      { name: 'תפוח עץ', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=150', emoji: '🍎' },
      { name: 'לימון', img: 'https://images.unsplash.com/photo-1590502593747-422eba4105ef?w=150', emoji: '🍋' }
    ]
  },
  'בשר ודגים טריים': {
    'עוף והודו': [
      { name: 'עוף שלם', img: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=150', emoji: '🍗' },
      { name: 'חזה עוף', img: null, emoji: '🥩' },
      { name: 'שניצל טרי', img: null, emoji: '🍗' }
    ],
    'בקר ודגים': [
      { name: 'בשר טחון', img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=150', emoji: '🥩' },
      { name: 'דג סלמון טרי', img: 'https://images.unsplash.com/photo-1511833075217-4dbf77c38c03?w=150', emoji: '🐟' }
    ]
  },
  'מזווה ומאפייה': {
    'לחמים ומאפים': [
      { name: 'לחם אחיד', img: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=150', emoji: '🍞' },
      { name: 'פיתות', img: null, emoji: '🫓' },
      { name: 'לחמניות', img: 'https://images.unsplash.com/photo-1577047285642-8356980cc8e6?w=150', emoji: '🥖' }
    ],
    'יבש ושימורים': [
      { name: 'פסטה', img: null, emoji: '🍝' },
      { name: 'אורז', img: null, emoji: '🍚' },
      { name: 'שמן זית', img: null, emoji: '🫙' },
      { name: 'רסק עגבניות', img: null, emoji: '🥫' }
    ]
  },
  'שתייה': {
    'קלה ומים': [
      { name: 'מים מינרלים (שישייה)', img: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=150', emoji: '💧' },
      { name: 'קולה', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150', emoji: '🥤' }
    ]
  },
  'ניקיון וחד פעמי': {
    'מוצרי ניקיון': [
      { name: 'נייר טואלט', img: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=150', emoji: '🧻' },
      { name: 'נוזל כלים', img: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=150', emoji: '🧼' }
    ]
  }
};

// --- קטלוג מוצרים באנגלית ---
const CATEGORIES_EN = {
  'Dairy & Fridge': {
    'Milk & Beverages': [
      { name: 'Milk 3%', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150', emoji: '🥛' },
      { name: 'Milk 1%', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150', emoji: '🥛' },
      { name: 'Oat Milk', img: null, emoji: '🌾' },
      { name: 'Soy Milk', img: null, emoji: '🌱' },
      { name: 'Chocolate Milk', img: null, emoji: '🧋' }
    ],
    'Cheese': [
      { name: 'Yellow Cheese', img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=150', emoji: '🧀' },
      { name: 'Cottage Cheese', img: null, emoji: '🥣' },
      { name: 'White Cheese', img: null, emoji: '🥣' },
      { name: 'Feta Cheese', img: null, emoji: '🧀' }
    ],
    'Eggs & Salads': [
      { name: 'Eggs L', img: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=150', emoji: '🥚' },
      { name: 'Butter', img: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=150', emoji: '🧈' },
      { name: 'Hummus', img: null, emoji: '🥣' },
      { name: 'Tahini', img: null, emoji: '🥣' }
    ]
  },
  'Fruits & Vegetables': {
    'Vegetables': [
      { name: 'Tomato', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150', emoji: '🍅' },
      { name: 'Cucumber', img: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=150', emoji: '🥒' },
      { name: 'Onion', img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=150', emoji: '🧅' },
      { name: 'Garlic', img: 'https://images.unsplash.com/photo-1587049352847-81a56d773c1c?w=150', emoji: '🧄' },
      { name: 'Potato', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150', emoji: '🥔' }
    ],
    'Fruits': [
      { name: 'Banana', img: 'https://images.unsplash.com/photo-1571501435520-c06f52e82502?w=150', emoji: '🍌' },
      { name: 'Apple', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=150', emoji: '🍎' },
      { name: 'Lemon', img: 'https://images.unsplash.com/photo-1590502593747-422eba4105ef?w=150', emoji: '🍋' }
    ]
  },
  'Fresh Meat & Fish': {
    'Chicken & Turkey': [
      { name: 'Whole Chicken', img: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=150', emoji: '🍗' },
      { name: 'Chicken Breast', img: null, emoji: '🥩' },
      { name: 'Fresh Schnitzel', img: null, emoji: '🍗' }
    ],
    'Beef & Fish': [
      { name: 'Minced Meat', img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=150', emoji: '🥩' },
      { name: 'Fresh Salmon', img: 'https://images.unsplash.com/photo-1511833075217-4dbf77c38c03?w=150', emoji: '🐟' }
    ]
  },
  'Pantry & Bakery': {
    'Breads & Pastries': [
      { name: 'Standard Bread', img: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=150', emoji: '🍞' },
      { name: 'Pitas', img: null, emoji: '🫓' },
      { name: 'Buns', img: 'https://images.unsplash.com/photo-1577047285642-8356980cc8e6?w=150', emoji: '🥖' }
    ],
    'Dry Goods & Canned': [
      { name: 'Pasta', img: null, emoji: '🍝' },
      { name: 'Rice', img: null, emoji: '🍚' },
      { name: 'Olive Oil', img: null, emoji: '🫙' },
      { name: 'Tomato Paste', img: null, emoji: '🥫' }
    ]
  },
  'Beverages': {
    'Soft Drinks & Water': [
      { name: 'Mineral Water (6-pack)', img: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=150', emoji: '💧' },
      { name: 'Cola', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150', emoji: '🥤' }
    ]
  },
  'Cleaning & Disposables': {
    'Cleaning Products': [
      { name: 'Toilet Paper', img: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=150', emoji: '🧻' },
      { name: 'Dish Soap', img: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=150', emoji: '🧼' }
    ]
  }
};

const ProductImage = ({ src, emoji, size = 'default' }) => {
  const [error, setError] = useState(false);
  const dims = size === 'small' ? 'w-8 h-8 text-xl' : 'w-10 h-10 text-2xl';
  
  if (!src || error) {
    return (
      <div className={`${dims} flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-xl shadow-sm border border-gray-100`}>
        {emoji}
      </div>
    );
  }
  return <img src={src} alt="product" onError={() => setError(true)} className={`${dims} flex-shrink-0 object-cover rounded-xl shadow-sm border border-gray-200`} />;
};

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('grocery_lang') || 'he');
  const t = translations[lang];
  const isRtl = lang === 'he';
  const UNITS = lang === 'he' ? ['יחידות', 'ק"ג', 'גרם', 'ליטר', 'אריזות'] : ['pcs', 'kg', 'g', 'L', 'packs'];

  // תיקון חשוב: בחירת מילון הקטגוריות בהתאם לשפה
  const baseCategories = lang === 'he' ? CATEGORIES_HE : CATEGORIES_EN;

  const [listId, setListId] = useState(() => {
    const urlListId = currentUrlParams.get('list');
    if (urlListId) {
      localStorage.setItem('grocery_list_id', urlListId.toUpperCase());
      return urlListId.toUpperCase();
    }
    return localStorage.getItem('grocery_list_id') || Math.random().toString(36).substr(2, 5).toUpperCase();
  });

  const [userName, setUserName] = useState(() => localStorage.getItem('grocery_user_name') || '');
  const [showSetup, setShowSetup] = useState(!localStorage.getItem('grocery_user_name'));
  const [setupTempFamily, setSetupTempFamily] = useState('');
  const [setupTempUser, setSetupTempUser] = useState('');

  const [items, setItems] = useState([]);
  const [customCatalog, setCustomCatalog] = useState([]); 
  const [activeMainCategory, setActiveMainCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [addingProduct, setAddingProduct] = useState(null);
  const [addAmount, setAddAmount] = useState(1);
  const [addUnit, setAddUnit] = useState(UNITS[0]);
  const [addNote, setAddNote] = useState('');
  
  const [customItemName, setCustomItemName] = useState('');
  const [customItemModal, setCustomItemModal] = useState(false);
  const [customItemMainCat, setCustomItemMainCat] = useState('');
  const [customItemSubCat, setCustomItemSubCat] = useState('');
  
  const [toastMsg, setToastMsg] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const [familyName, setFamilyName] = useState('');
  const [isEditingFamily, setIsEditingFamily] = useState(false);
  const [tempFamily, setTempFamily] = useState('');

  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantResults, setAssistantResults] = useState([]);
  const [assistantRecipeName, setAssistantRecipeName] = useState('');
  const [assistantInstructions, setAssistantInstructions] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleLanguage = () => {
    const newLang = lang === 'he' ? 'en' : 'he';
    setLang(newLang);
    localStorage.setItem('grocery_lang', newLang);
    setActiveMainCategory(null); // איפוס קטגוריה כשמשנים שפה כדי למנוע מסך ריק
    setSearchTerm('');
  };

  useEffect(() => {
    localStorage.setItem('grocery_list_id', listId);
    if (currentUrlParams.has('list')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [listId]);

  const fullCategories = useMemo(() => {
    const merged = JSON.parse(JSON.stringify(baseCategories));
    customCatalog.forEach(item => {
      if (merged[item.mainCategory]) {
        if (!merged[item.mainCategory][item.subCategory]) {
          merged[item.mainCategory][item.subCategory] = [];
        }
        if (!merged[item.mainCategory][item.subCategory].find(i => i.name === item.name)) {
          merged[item.mainCategory][item.subCategory].push(item);
        }
      }
    });
    return merged;
  }, [customCatalog, baseCategories]);

  const allProducts = useMemo(() => {
    let list = [];
    Object.entries(fullCategories).forEach(([mainCat, subCats]) => {
      Object.entries(subCats).forEach(([subCat, prods]) => {
        prods.forEach(p => list.push({ ...p, mainCategory: mainCat, subCategory: subCat }));
      });
    });
    return list;
  }, [fullCategories]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, allProducts]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth error", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const listRef = collection(db, 'artifacts', appId, 'public', 'data', `list_${listId}`);
    const unsubList = onSnapshot(listRef, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    }, (error) => console.error("Error syncing list:", error));

    const metaRef = doc(db, 'artifacts', appId, 'public', 'data', 'metadata', `meta_${listId}`);
    const unsubMeta = onSnapshot(metaRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().familyName) {
        setFamilyName(docSnap.data().familyName);
      }
    }, (error) => console.error("Error syncing metadata:", error));

    const customCatRef = collection(db, 'artifacts', appId, 'public', 'data', `custom_${listId}`);
    const unsubCustomCat = onSnapshot(customCatRef, (snap) => {
      setCustomCatalog(snap.docs.map(d => d.data()));
    }, (error) => console.error("Error syncing custom catalog:", error));

    return () => { unsubList(); unsubMeta(); unsubCustomCat(); };
  }, [user, listId]);

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (!setupTempUser.trim()) return;
    
    localStorage.setItem('grocery_user_name', setupTempUser.trim());
    setUserName(setupTempUser.trim());
    
    if (setupTempFamily.trim() && !familyName) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'metadata', `meta_${listId}`), { familyName: setupTempFamily.trim() }, { merge: true });
      setFamilyName(setupTempFamily.trim());
    }
    
    setShowSetup(false);
  };

  const saveFamilyName = async () => {
    if (!tempFamily.trim() || !user) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'metadata', `meta_${listId}`), { familyName: tempFamily.trim() }, { merge: true });
    setIsEditingFamily(false);
  };

  const confirmAddItem = async () => {
    if (!user || !addingProduct) return;
    const { name, emoji, img } = addingProduct;
    const amount = parseFloat(addAmount) || 1;
    const unit = addUnit;
    const note = addNote.trim();

    const existing = items.find(i => i.name === name && (i.unit || UNITS[0]) === unit && (i.note || '') === note && !i.purchased);

    if (existing) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `list_${listId}`, existing.id), { amount: existing.amount + amount });
    } else {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `list_${listId}`), {
        name, emoji: emoji || '🛒', img: img || null,
        purchased: false, amount, unit, note, 
        addedBy: userName,
        createdAt: Date.now()
      });
    }
    showToast(`${name} ${t.toastAdded}`);
    setAddingProduct(null);
    setSearchTerm('');
  };

  const togglePurchased = async (id, current) => {
    if (!user) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `list_${listId}`, id), { purchased: !current });
  };

  const updateAmount = async (id, amount, unit, delta) => {
    if (!user) return;
    const step = (unit === 'ק"ג' || unit === 'kg') ? 0.25 : ((unit === 'גרם' || unit === 'g') ? 100 : 1);
    const newAmount = Math.max(0, amount + (delta > 0 ? step : -step));
    
    if (newAmount === 0) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `list_${listId}`, id));
    } else {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `list_${listId}`, id), { amount: newAmount });
    }
  };

  const clearPurchased = async () => {
    if (!user) return;
    const purchased = items.filter(i => i.purchased);
    for (const item of purchased) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `list_${listId}`, item.id));
    }
  };

  const removeAiIngredient = (id) => {
    setAssistantResults(prev => prev.filter(item => item.id !== id));
  };

  const executeShare = async (urlToShare) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t.familyOf} ${familyName || ''}`,
          text: '🛒',
          url: urlToShare
        });
      } catch (err) {
        console.log("Share canceled or failed", err);
      }
    } else {
      navigator.clipboard.writeText(urlToShare);
      showToast(t.toastCopied);
    }
    setShareModalOpen(false);
  };

  const shareFamilyList = () => executeShare(`${window.location.origin}${window.location.pathname}?list=${listId}`);
  const shareBlankApp = () => executeShare(`${window.location.origin}${window.location.pathname}`);

  const generateSmartList = async () => {
    if (!assistantPrompt.trim()) return;
    setIsGenerating(true);
    setAssistantResults([]);
    setAssistantRecipeName('');
    setAssistantInstructions([]);
    setShowInstructions(false);

   try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
      
      const aiLangInstruction = lang === 'he' 
        ? "אתה עוזר חכם למטבח בעברית. המשתמש יבקש רעיון לארוחה או מתכון. החזר JSON מסודר בלבד. כלול: recipeName (שם המתכון), ingredients (מערך עם name, amount, unit, emoji), ו-instructions (מערך מחרוזות)."
        : "You are a smart kitchen assistant. The user will ask for a recipe. Return ONLY a valid JSON. Include: recipeName, ingredients (array of objects with name, amount, unit, emoji), and instructions (array of strings). Write everything in English.";

      const payload = {
        contents: [{ parts: [{ text: assistantPrompt }] }],
        systemInstruction: { parts: [{ text: aiLangInstruction }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: { 
              recipeName: { type: "STRING" },
              ingredients: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: { name: { type: "STRING" }, amount: { type: "NUMBER" }, unit: { type: "STRING" }, emoji: { type: "STRING" } },
                  required: ["name", "amount", "unit", "emoji"]
                }
              },
              instructions: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["recipeName", "ingredients", "instructions"]
          }
        }
      };

      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
        setAssistantRecipeName(parsed.recipeName);
        setAssistantInstructions(parsed.instructions);
        setAssistantResults(parsed.ingredients.map((ing, idx) => ({ ...ing, id: `ai-${idx}` })));
      } else {
        showToast(t.toastAiError);
      }
    } catch (error) {
      showToast(t.toastKeyError);
    } finally {
      setIsGenerating(false);
    }
  };

  const addAllFromAssistant = async () => {
    if (!user || assistantResults.length === 0) return;
    for (const item of assistantResults) {
      const existing = items.find(i => i.name === item.name && (i.unit || UNITS[0]) === item.unit && !i.purchased);
      if (existing) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `list_${listId}`, existing.id), { amount: existing.amount + item.amount });
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `list_${listId}`), {
          name: item.name, emoji: item.emoji, img: null,
          purchased: false, amount: item.amount, unit: item.unit, note: '', 
          addedBy: userName,
          createdAt: Date.now()
        });
      }
    }
    showToast(t.toastAiAdded);
    setAssistantResults([]);
    setAssistantPrompt('');
    setActiveTab('list');
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 font-sans" dir={isRtl ? "rtl" : "ltr"}>
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 text-center border border-green-100 relative">
          
          <button onClick={toggleLanguage} className="absolute top-4 left-4 bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition">
             <Globe size={18} />
          </button>

          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 mt-4">
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">{t.setupTitle}</h2>
          <p className="text-sm text-gray-500 mb-6">{t.setupDesc}</p>
          
          <form onSubmit={handleSetupSubmit} className="space-y-4">
            {!familyName && (
              <div className={isRtl ? "text-right" : "text-left"}>
                <label className="text-xs font-bold text-gray-600 block mb-1">{t.familyLabel}</label>
                <input
                  type="text"
                  placeholder={t.familyPlaceholder}
                  value={setupTempFamily}
                  onChange={(e) => setSetupTempFamily(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:bg-white transition-colors"
                />
              </div>
            )}
            <div className={isRtl ? "text-right" : "text-left"}>
              <label className="text-xs font-bold text-gray-600 block mb-1">{t.nameLabel}</label>
              <input
                type="text"
                placeholder={t.namePlaceholder}
                value={setupTempUser}
                onChange={(e) => setSetupTempUser(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:bg-white transition-colors"
              />
            </div>
            <button 
              type="submit" 
              disabled={!setupTempUser.trim()}
              className="w-full bg-green-500 text-white font-black py-3 rounded-xl shadow-md hover:bg-green-600 transition-colors disabled:opacity-50 mt-2"
            >
              {t.enterList}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 font-sans relative pb-20" dir={isRtl ? "rtl" : "ltr"}>
      
      <div className="fixed inset-0 pointer-events-none z-0">
         <img src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1080&auto=format&fit=crop" className="w-full h-full object-cover opacity-20" alt="Supermarket Cart" />
         <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        <header className="bg-green-600 text-white p-3 shadow-md rounded-2xl mb-4 flex justify-between items-center relative">
          
          <button onClick={toggleLanguage} className="absolute -top-3 -left-2 bg-white/90 text-green-700 shadow border border-green-200 px-2 py-1 rounded-full text-[10px] font-bold z-50 flex items-center gap-1 backdrop-blur-sm">
             <Globe size={12}/> {lang === 'he' ? 'EN' : 'HE'}
          </button>

          <div className="flex items-center gap-2 mr-2 ml-2">
            <ShoppingCart className="w-5 h-5" />
            {isEditingFamily ? (
              <div className="flex items-center gap-2">
                <input 
                  autoFocus
                  type="text" 
                  value={tempFamily} 
                  onChange={e => setTempFamily(e.target.value)}
                  className="bg-green-700 text-white px-2 py-0.5 rounded text-sm outline-none w-28 border border-green-500"
                />
                <button onClick={saveFamilyName} className="text-xs bg-white text-green-700 px-2 py-1 rounded font-bold">{t.save}</button>
              </div>
            ) : (
              <h1 
                onClick={() => { setTempFamily(familyName); setIsEditingFamily(true); }}
                className="text-base font-bold flex items-center gap-1 cursor-pointer hover:bg-green-500 px-2 py-1 rounded transition-colors -mx-2"
              >
                {t.familyOf} {familyName} <Edit2 className="w-3 h-3 opacity-70" />
              </h1>
            )}
          </div>
          <div className="flex gap-2">
             <button onClick={() => setShareModalOpen(true)} className="px-3 py-1.5 bg-green-500 rounded-full hover:bg-green-400 transition shadow-sm text-xs font-bold flex items-center gap-1">
               {t.share} <Share2 className="w-3 h-3" />
             </button>
          </div>
        </header>
        
        {activeTab === 'list' && (
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="text-center bg-white/80 backdrop-blur rounded-2xl p-6 border border-gray-100 shadow-sm mt-8">
                <ShoppingBag className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                <p className="text-base font-bold text-gray-500">{t.emptyCart}</p>
              </div>
            ) : 
            items.map(item => (
              <div key={item.id} className={`bg-white/95 backdrop-blur p-2.5 rounded-xl shadow-sm flex items-center justify-between border border-gray-100 transition-all ${item.purchased ? 'opacity-60' : (isRtl ? 'border-r-4 border-r-green-500' : 'border-l-4 border-l-green-500')}`}>
                
                <div className="flex items-center gap-2 cursor-pointer flex-1 overflow-hidden" onClick={() => togglePurchased(item.id, item.purchased)}>
                  <button className={`p-1 rounded-full flex-shrink-0 ${item.purchased ? 'text-green-500' : 'text-gray-300'}`}>
                    {item.purchased ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <ProductImage src={item.img} emoji={item.emoji} size="small" />
                  <div className={`flex flex-col min-w-0 ${isRtl ? "text-right" : "text-left"}`}>
                    <span className={`font-bold text-sm truncate ${item.purchased ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.name}
                      {item.addedBy && (
                        <span className={`text-[10px] text-gray-400 font-normal italic mx-1`}>
                          ({t.addedBy} {item.addedBy})
                        </span>
                      )}
                    </span>
                    {item.note && (
                      <span className="text-[10px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                        <MessageSquareText size={10}/> {item.note}
                      </span>
                    )}
                  </div>
                </div>

                {!item.purchased && (
                  <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200 flex-shrink-0" dir="ltr">
                    <button onClick={() => updateAmount(item.id, item.amount, item.unit, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 font-bold active:scale-95">-</button>
                    <div className="flex flex-col items-center justify-center w-6" dir={isRtl ? "rtl" : "ltr"}>
                      <span className="font-bold text-gray-800 text-sm leading-none">{item.amount}</span>
                      <span className="text-[8px] text-gray-500">{item.unit}</span>
                    </div>
                    <button onClick={() => updateAmount(item.id, item.amount, item.unit, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 font-bold active:scale-95">+</button>
                  </div>
                )}
              </div>
            ))}

            {items.some(i => i.purchased) && (
              <button onClick={clearPurchased} className="w-full mt-4 py-3 flex justify-center items-center gap-2 bg-white text-red-500 rounded-xl font-bold shadow-sm border border-red-100 hover:bg-red-50 text-sm transition-colors">
                <Trash2 size={16} /> {t.clearPurchased}
              </button>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setActiveMainCategory(null); }}
                placeholder={t.searchPlaceholder}
                className={`w-full bg-white/90 backdrop-blur border border-gray-200 rounded-xl py-3 ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400`}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchTerm ? (
               <div className="bg-white/95 rounded-xl p-3 shadow-sm border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 mb-3">{t.searchResults}</h3>
                  {searchResults.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {searchResults.map(item => (
                        <button key={item.name} onClick={() => { setAddingProduct(item); setAddUnit(UNITS[0]); setAddAmount(1); setAddNote(''); }} className={`flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-transparent hover:border-green-200 ${isRtl ? "text-right" : "text-left"}`}>
                          <ProductImage src={item.img} emoji={item.emoji} size="small" />
                          <div className="flex-grow min-w-0">
                            <div className="font-bold text-sm text-gray-800 truncate">{item.name}</div>
                            <div className="text-[10px] text-gray-400 truncate">{item.mainCategory} &gt; {item.subCategory}</div>
                          </div>
                          <Plus size={16} className="text-green-500 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-sm text-gray-400">{t.notFound} "{searchTerm}"</p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-600 mb-2">{t.addCustom}</p>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if(!customItemName.trim() || !user) return;
                      const newItem = { name: customItemName.trim(), emoji: '🛒', img: null, mainCategory: lang === 'he' ? 'מזווה ומאפייה' : 'Pantry & Bakery', subCategory: lang === 'he' ? 'יבש ושימורים' : 'Dry Goods & Canned' };
                      addDoc(collection(db, 'artifacts', appId, 'public', 'data', `custom_${listId}`), newItem).then(() => {
                        setAddingProduct(newItem); setAddUnit(UNITS[0]); setAddAmount(1); setAddNote(''); setCustomItemName('');
                      });
                    }} className="flex gap-2">
                      <input type="text" value={customItemName} onChange={(e) => setCustomItemName(e.target.value)} placeholder={t.newProductName} className={`flex-grow p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-green-500 ${isRtl ? "text-right" : "text-left"}`} />
                      <button type="submit" disabled={!customItemName.trim()} className="bg-green-600 text-white px-4 text-sm rounded-lg font-bold disabled:opacity-50">{t.addBtn}</button>
                    </form>
                  </div>
               </div>
            ) : !activeMainCategory ? (
              <div className="flex flex-col gap-2">
                {Object.keys(fullCategories).map(cat => (
                  <button key={cat} onClick={() => setActiveMainCategory(cat)} className="w-full bg-white/95 p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between text-gray-800 hover:bg-green-50 active:scale-95 transition-colors">
                    <span className="font-bold text-sm">{cat}</span>
                    <ChevronRight size={16} className={`text-gray-400 ${!isRtl && 'rotate-180'}`} />
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3 bg-white/90 p-2.5 rounded-xl shadow-sm border border-green-100">
                  <h2 className="font-black text-sm text-green-800 px-1">{activeMainCategory}</h2>
                  <button onClick={() => setActiveMainCategory(null)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                    {t.backToCats}
                  </button>
                </div>
                
                <div className="space-y-6">
                  {Object.entries(fullCategories[activeMainCategory]).map(([subCatName, itemsList]) => (
                    <div key={subCatName} className="bg-white/70 backdrop-blur p-2 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className={`text-xs font-bold text-gray-500 mb-2 px-1 ${isRtl ? "text-right" : "text-left"}`}>{subCatName}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        {itemsList.map(item => (
                          <button 
                            key={item.name} 
                            onClick={() => {
                              setAddingProduct(item);
                              setAddUnit((activeMainCategory === 'ירקות ופירות' || activeMainCategory === 'Fruits & Vegetables' || activeMainCategory === 'בשר ודגים טריים' || activeMainCategory === 'Fresh Meat & Fish') ? UNITS[1] : UNITS[0]);
                              setAddAmount(1);
                              setAddNote('');
                            }} 
                            className={`bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-3 active:scale-95 ${isRtl ? "text-right" : "text-left"} hover:border-green-200 transition-colors`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <ProductImage src={item.img} emoji={item.emoji} size="small" />
                              <span className="font-bold text-sm text-gray-800 truncate">{item.name}</span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                              <Plus size={14} className="text-green-600" />
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      <button onClick={() => {
                        setCustomItemMainCat(activeMainCategory);
                        setCustomItemSubCat(subCatName);
                        setCustomItemName('');
                        setCustomItemModal(true);
                      }} className="w-full p-2 border-2 border-dashed border-green-200 rounded-xl text-green-600 font-bold text-xs flex items-center justify-center gap-1 hover:bg-green-50 transition-colors bg-white/50">
                        <Plus size={14}/> {t.addNewProduct}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assistant' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-2xl shadow-lg text-white text-center">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-green-100" />
              <h2 className="text-xl font-black mb-1">{t.aiTitle}</h2>
              <p className="text-green-50 text-xs mb-4">{t.aiDesc}</p>
              
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={assistantPrompt}
                  onChange={(e) => setAssistantPrompt(e.target.value)}
                  placeholder={t.aiPlaceholder}
                  className={`bg-white/95 text-gray-800 text-sm px-3 py-3 rounded-xl outline-none w-full shadow-inner ${isRtl ? "text-right" : "text-left"}`}
                  disabled={isGenerating}
                />
                <button 
                  onClick={generateSmartList}
                  disabled={isGenerating || !assistantPrompt.trim()}
                  className="bg-green-800 text-white px-4 py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-green-900 transition-colors shadow-md flex justify-center items-center gap-2"
                >
                  {isGenerating ? <><Loader2 size={16} className="animate-spin" /> {t.aiThinking}</> : t.aiGenerate}
                </button>
              </div>
            </div>

            {!isGenerating && assistantRecipeName && (
              <div className="bg-white/95 rounded-2xl p-4 shadow-md border border-green-100">
                <h3 className={`font-black text-lg text-green-700 mb-4 pb-2 border-b border-green-50 ${isRtl ? "text-right" : "text-left"}`}>🍲 {assistantRecipeName}</h3>
                
                <div className={`font-bold text-gray-800 text-sm mb-3 ${isRtl ? "text-right" : "text-left"}`}>{t.ingredientsNeeded}</div>
                <ul className="divide-y divide-gray-100 mb-5">
                  {assistantResults.map((item) => (
                    <li key={item.id} className="py-2.5 flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.emoji}</span>
                        <div className="font-bold text-sm text-gray-800">{item.name}</div>
                        <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{item.amount} {item.unit}</span>
                      </div>
                      <button 
                        onClick={() => removeAiIngredient(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                    </li>
                  ))}
                </ul>

                {assistantResults.length > 0 ? (
                  <button 
                    onClick={addAllFromAssistant}
                    className="w-full bg-green-500 text-white font-black py-3 rounded-xl text-sm flex justify-center items-center gap-2 shadow-md hover:bg-green-600 transition-colors mb-3"
                  >
                    <Plus size={16} /> {t.addAllToCart}
                  </button>
                ) : (
                  <div className="text-center text-sm font-bold text-green-600 bg-green-50 p-3 rounded-xl mb-3 border border-green-100">
                    {t.aiAllRemoved}
                  </div>
                )}

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="w-full bg-gray-50 p-3 flex justify-between items-center text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {t.recipeSteps}
                    <ChevronRight size={16} className={`transform transition-transform ${showInstructions ? (isRtl ? '-rotate-90' : 'rotate-90') : (isRtl ? 'rotate-90' : 'rotate-0')}`} />
                  </button>
                  
                  {showInstructions && (
                    <div className={`p-4 bg-white text-sm text-gray-700 leading-relaxed border-t border-gray-100 ${isRtl ? "text-right" : "text-left"}`}>
                      <ol className="list-decimal list-inside space-y-2">
                        {assistantInstructions.map((step, idx) => (
                          <li key={idx} className="pb-2 border-b border-gray-50 last:border-0 last:pb-0">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir={isRtl ? "rtl" : "ltr"}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100">
            <div className="bg-green-50 p-4 border-b border-green-100 flex items-center justify-center relative">
               <h3 className="font-black text-lg text-green-900">{t.shareModalTitle}</h3>
               <button onClick={() => setShareModalOpen(false)} className={`absolute ${isRtl ? 'left-4' : 'right-4'} text-gray-400 hover:text-gray-600`}><X size={20}/></button>
            </div>
            
            <div className="p-5 space-y-4">
              <button onClick={shareFamilyList} className="w-full bg-white border-2 border-green-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 hover:bg-green-50 transition active:scale-95">
                 <div className="flex items-center gap-2 text-green-700 font-black text-base">
                    <Share2 size={18} /> {t.shareFamilyBtn}
                 </div>
                 <span className="text-xs text-gray-500">{t.shareFamilySub}</span>
              </button>

              <button onClick={shareBlankApp} className="w-full bg-white border-2 border-blue-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 hover:bg-blue-50 transition active:scale-95">
                 <div className="flex items-center gap-2 text-blue-600 font-black text-base">
                    <ExternalLink size={18} /> {t.shareAppBtn}
                 </div>
                 <span className="text-xs text-gray-500">{t.shareAppSub}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {customItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir={isRtl ? "rtl" : "ltr"}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-5">
            <h3 className="font-black text-lg text-gray-800 mb-4 flex items-center gap-2">
               <Plus className="text-green-500"/> {t.customAddTitle}
            </h3>
            <form onSubmit={(e) => {
                e.preventDefault();
                if (!customItemName.trim() || !user) return;
                const newItem = { name: customItemName.trim(), emoji: '🛒', img: null, mainCategory: customItemMainCat, subCategory: customItemSubCat };
                addDoc(collection(db, 'artifacts', appId, 'public', 'data', `custom_${listId}`), newItem).then(() => {
                  setAddingProduct(newItem); setAddUnit(UNITS[0]); setAddAmount(1); setAddNote(''); setCustomItemName(''); setCustomItemModal(false);
                });
            }} className="space-y-4">
              <div className={isRtl ? "text-right" : "text-left"}>
                <label className="text-xs font-bold text-gray-500 mb-1 block">{t.customAddLabel}</label>
                <input autoFocus type="text" value={customItemName} onChange={(e) => setCustomItemName(e.target.value)} placeholder={t.customAddPlaceholder} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setCustomItemModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 text-sm hover:bg-gray-200 transition-colors">{t.cancel}</button>
                <button type="submit" disabled={!customItemName.trim()} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-green-500 disabled:opacity-50 text-sm hover:bg-green-600 transition-colors shadow-md">{t.continueBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir={isRtl ? "rtl" : "ltr"}>
          <div className="bg-white rounded-3xl shadow-2xl w-[260px] overflow-hidden">
            <div className="bg-green-50 p-3 border-b border-green-100 flex items-center gap-3">
              <ProductImage src={addingProduct.img} emoji={addingProduct.emoji} size="small" />
              <div className={isRtl ? "text-right" : "text-left"}>
                <h3 className="font-black text-base text-green-900 leading-tight">{addingProduct.name}</h3>
                <p className="text-[10px] font-bold text-green-700 mt-0.5">{t.selectAmount}</p>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-inner" dir="ltr">
                  <button type="button" onClick={() => setAddAmount(Math.max(0.1, addAmount - ((addUnit === 'ק"ג' || addUnit === 'kg') ? 0.25 : ((addUnit === 'גרם' || addUnit === 'g') ? 100 : 1))))} className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-lg font-bold text-green-600 active:scale-95 hover:bg-gray-50">-</button>
                  <input type="number" value={addAmount} onChange={(e) => setAddAmount(parseFloat(e.target.value) || 0)} className="flex-grow h-9 bg-transparent text-center text-lg font-black focus:outline-none text-gray-800 min-w-0" dir={isRtl ? "rtl" : "ltr"} />
                  <button type="button" onClick={() => setAddAmount(addAmount + ((addUnit === 'ק"ג' || addUnit === 'kg') ? 0.25 : ((addUnit === 'גרם' || addUnit === 'g') ? 100 : 1)))} className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-lg font-bold text-green-600 active:scale-95 hover:bg-gray-50">+</button>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {UNITS.map(unit => (
                    <button
                      key={unit}
                      onClick={() => { 
                        setAddUnit(unit); 
                        if ((unit === 'גרם' || unit === 'g') && addAmount < 100) setAddAmount(100); 
                        if (unit !== 'גרם' && unit !== 'g' && addAmount >= 100) setAddAmount(1); 
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${addUnit === unit ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                 <div className="relative">
                    <MessageSquareText className={`absolute ${isRtl ? 'right-2.5' : 'left-2.5'} top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5`} />
                    <input 
                      type="text" 
                      value={addNote}
                      onChange={(e) => setAddNote(e.target.value)}
                      placeholder={t.notePlaceholder} 
                      className={`w-full bg-gray-50 border border-gray-200 rounded-lg py-2 ${isRtl ? 'pr-8 pl-2' : 'pl-8 pr-2 text-left'} text-xs outline-none focus:border-green-400 transition-colors shadow-inner`}
                    />
                 </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setAddingProduct(null)} className="flex-1 py-2.5 px-2 rounded-xl font-bold text-gray-600 bg-gray-100 text-xs hover:bg-gray-200 transition-colors">{t.cancel}</button>
                <button onClick={confirmAddItem} className="flex-[2] py-2.5 px-2 rounded-xl font-black text-white bg-green-500 shadow-md text-xs flex justify-center items-center gap-1.5 hover:bg-green-600 transition-colors">{t.addBtn} <ShoppingCart size={14}/></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl z-50 font-bold text-xs whitespace-nowrap flex items-center gap-1.5 animate-slide-up" dir={isRtl ? "rtl" : "ltr"}>
          <CheckCircle2 size={14} className="text-green-400" />
          {toastMsg}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-[0_-5px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 z-40" dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-md mx-auto flex p-1.5 gap-1.5">
          <button onClick={() => setActiveTab('list')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-colors ${activeTab === 'list' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-50'}`}>
            <ShoppingCart size={16} /> {t.tabList}
          </button>
          <button onClick={() => setActiveTab('add')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-colors ${activeTab === 'add' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Plus size={16} /> {t.tabAdd}
          </button>
          <button onClick={() => setActiveTab('assistant')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition-colors ${activeTab === 'assistant' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Sparkles size={16} /> {t.tabMagic}
          </button>
        </div>
      </nav>
    </div>
  );
}
