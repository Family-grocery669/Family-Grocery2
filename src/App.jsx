import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ShoppingCart, ShoppingBag, Share2, Edit2, Copy, ExternalLink, X, Sparkles, Search, ChevronRight, MessageSquareText } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';

// --- Firebase Config ---
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
const appId = 'grocery-app-default';

// --- Rich Hierarchical Product Catalog ---
const CATEGORIES = {
  'מקרר ומוצרי חלב': {
    'חלב ומשקאות': [
      { name: 'חלב 3%', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150', emoji: '🥛' },
      { name: 'חלב 1%', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150', emoji: '🥛' },
      { name: 'חלב שיבולת שועל', img: null, emoji: '🌾' },
      { name: 'חלב סויה', img: null, emoji: '🌱' },
      { name: 'שוקו', img: null, emoji: '🧋' },
      { name: 'משקה חלבון', img: null, emoji: '💪' },
      { name: 'אייס קפה', img: null, emoji: '☕' }
    ],
    'גבינות': [
      { name: 'גבינה צהובה', img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=150', emoji: '🧀' },
      { name: 'קוטג׳', img: null, emoji: '🥣' },
      { name: 'גבינה לבנה', img: null, emoji: '🥣' },
      { name: 'גבינה בולגרית', img: null, emoji: '🧀' },
      { name: 'גבינת צפתית', img: null, emoji: '🧀' },
      { name: 'גבינת פטה', img: null, emoji: '🧀' },
      { name: 'גבינת שמנת', img: null, emoji: '🧀' },
      { name: 'מוצרלה', img: null, emoji: '🧀' },
      { name: 'פרמזן', img: null, emoji: '🧀' },
      { name: 'גאודה', img: null, emoji: '🧀' }
    ],
    'מעדנים וקינוחים': [
      { name: 'יוגורט טבעי', img: null, emoji: '🍦' },
      { name: 'יוגורט חלבון', img: null, emoji: '💪' },
      { name: 'מעדן שוקולד', img: null, emoji: '🍮' },
      { name: 'מעדן וניל', img: null, emoji: '🍮' },
      { name: 'מילקי', img: null, emoji: '🍫' },
      { name: 'פודינג', img: null, emoji: '🍮' }
    ],
    'ביצים וסלטים': [
      { name: 'ביצים L', img: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=150', emoji: '🥚' },
      { name: 'ביצים M', img: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=150', emoji: '🥚' },
      { name: 'חמאה', img: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=150', emoji: '🧈' },
      { name: 'חומוס', img: null, emoji: '🥣' },
      { name: 'טחינה', img: null, emoji: '🥣' },
      { name: 'סלט חצילים', img: null, emoji: '🍆' },
      { name: 'סלט כרוב', img: null, emoji: '🥗' }
    ]
  },
  'ירקות ופירות': {
    'ירקות': [
      { name: 'עגבניה', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150', emoji: '🍅' },
      { name: 'מלפפון', img: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=150', emoji: '🥒' },
      { name: 'בצל', img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=150', emoji: '🧅' },
      { name: 'שום', img: 'https://images.unsplash.com/photo-1587049352847-81a56d773c1c?w=150', emoji: '🧄' },
      { name: 'תפוח אדמה', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150', emoji: '🥔' },
      { name: 'גזר', img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=150', emoji: '🥕' },
      { name: 'פלפל', img: 'https://images.unsplash.com/photo-1563514222080-60a5d5bb26e8?w=150', emoji: '🫑' },
      { name: 'חסה', img: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=150', emoji: '🥬' },
      { name: 'פטריות', img: 'https://images.unsplash.com/photo-1604544837549-b006c4b26ce9?w=150', emoji: '🍄' },
      { name: 'קישוא', img: null, emoji: '🥒' },
      { name: 'חציל', img: 'https://images.unsplash.com/photo-1614735241165-6756e1df61ab?w=150', emoji: '🍆' },
      { name: 'תירס', img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=150', emoji: '🌽' },
      { name: 'ברוקולי', img: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=150', emoji: '🥦' },
      { name: 'בטטה', img: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=150', emoji: '🍠' }
    ],
    'פירות': [
      { name: 'בננה', img: 'https://images.unsplash.com/photo-1571501435520-c06f52e82502?w=150', emoji: '🍌' },
      { name: 'תפוח עץ', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=150', emoji: '🍎' },
      { name: 'תפוז', img: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=150', emoji: '🍊' },
      { name: 'לימון', img: 'https://images.unsplash.com/photo-1590502593747-422eba4105ef?w=150', emoji: '🍋' },
      { name: 'אבטיח', img: 'https://images.unsplash.com/photo-1587049352851-8d4e8913475d?w=150', emoji: '🍉' },
      { name: 'ענבים', img: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=150', emoji: '🍇' },
      { name: 'אבוקדו', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=150', emoji: '🥑' },
      { name: 'תות שדה', img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=150', emoji: '🍓' }
    ]
  },
  'קפואים': {
    'ירקות קפואים': [
      { name: 'אפונה עדינה', img: null, emoji: '🟢' },
      { name: 'שעועית ירוקה', img: null, emoji: '🫘' },
      { name: 'תירס קפוא', img: null, emoji: '🌽' },
      { name: 'ברוקולי קפוא', img: null, emoji: '🥦' },
      { name: 'לקט ירקות', img: null, emoji: '🥗' }
    ],
    'מאפים ובצקים': [
      { name: 'בורקס קפוא', img: null, emoji: '🥐' },
      { name: 'פיצה קפואה', img: null, emoji: '🍕' },
      { name: 'מלאווח', img: null, emoji: '🫓' },
      { name: 'ג׳חנון', img: null, emoji: '🥖' },
      { name: 'בצק עלים', img: null, emoji: '🥐' }
    ],
    'בשר ומוכנים': [
      { name: 'שניצל תירס', img: null, emoji: '🌽' },
      { name: 'שניצל עוף קפוא', img: null, emoji: '🍗' },
      { name: 'נאגטס', img: null, emoji: '🍗' },
      { name: 'קבב קפוא', img: null, emoji: '🥩' },
      { name: 'פילה דג קפוא', img: null, emoji: '🐟' }
    ]
  },
  'בשר ודגים טריים': {
    'עוף והודו': [
      { name: 'עוף שלם', img: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=150', emoji: '🍗' },
      { name: 'חזה עוף', img: null, emoji: '🥩' },
      { name: 'שניצל טרי', img: null, emoji: '🍗' },
      { name: 'כנפיים', img: null, emoji: '🍗' },
      { name: 'הודו טחון', img: null, emoji: '🥩' }
    ],
    'בקר ודגים': [
      { name: 'בשר טחון', img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=150', emoji: '🥩' },
      { name: 'סטייק אנטריקוט', img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=150', emoji: '🥩' },
      { name: 'דג סלמון טרי', img: 'https://images.unsplash.com/photo-1511833075217-4dbf77c38c03?w=150', emoji: '🐟' },
      { name: 'דניס', img: null, emoji: '🐟' },
      { name: 'נקניקיות', img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=150', emoji: '🌭' }
    ]
  },
  'מזווה ומאפייה': {
    'לחמים ומאפים': [
      { name: 'לחם אחיד', img: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=150', emoji: '🍞' },
      { name: 'לחם מלא', img: null, emoji: '🍞' },
      { name: 'פיתות', img: null, emoji: '🫓' },
      { name: 'לחמניות', img: 'https://images.unsplash.com/photo-1577047285642-8356980cc8e6?w=150', emoji: '🥖' },
      { name: 'בייגל', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150', emoji: '🥯' }
    ],
    'יבש ושימורים': [
      { name: 'פסטה', img: null, emoji: '🍝' },
      { name: 'אורז', img: null, emoji: '🍚' },
      { name: 'שמן זית', img: null, emoji: '🫙' },
      { name: 'רסק עגבניות', img: null, emoji: '🥫' },
      { name: 'טונה בקופסא', img: null, emoji: '🐟' },
      { name: 'קפה שחור', img: null, emoji: '☕' },
      { name: 'נס קפה', img: null, emoji: '☕' }
    ]
  },
  'חטיפים ומתוקים': {
    'מלוחים': [
      { name: 'במבה', img: null, emoji: '🥜' },
      { name: 'ביסלי', img: null, emoji: '🥨' },
      { name: 'תפוצ׳יפס', img: null, emoji: '🥔' },
      { name: 'דוריטוס', img: null, emoji: '🔺' },
      { name: 'בייגלה', img: null, emoji: '🥨' },
      { name: 'אפרופו', img: null, emoji: '🌽' }
    ],
    'מתוקים': [
      { name: 'שוקולד פרה', img: null, emoji: '🍫' },
      { name: 'קליק', img: null, emoji: '🍫' },
      { name: 'ופלים', img: null, emoji: '🧇' },
      { name: 'עוגיות', img: null, emoji: '🍪' },
      { name: 'סוכריות גומי', img: null, emoji: '🍬' },
      { name: 'מסטיקים', img: null, emoji: '🍬' }
    ]
  },
  'שתייה': {
    'קלה ומים': [
      { name: 'מים מינרלים (שישייה)', img: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=150', emoji: '💧' },
      { name: 'קולה', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150', emoji: '🥤' },
      { name: 'קולה זירו', img: null, emoji: '🥤' },
      { name: 'סודה', img: null, emoji: '🫧' },
      { name: 'מיץ תפוזים', img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=150', emoji: '🧃' },
      { name: 'מים בטעמים', img: null, emoji: '💧' }
    ],
    'אלכוהול': [
      { name: 'בירה (שישייה)', img: 'https://images.unsplash.com/photo-1614316104245-c471d431c36b?w=150', emoji: '🍺' },
      { name: 'יין אדום', img: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=150', emoji: '🍷' },
      { name: 'יין לבן', img: null, emoji: '🥂' }
    ]
  },
  'ניקיון וחד פעמי': {
    'חד פעמי': [
      { name: 'כוסות פלסטיק', img: null, emoji: '🥤' },
      { name: 'כוסות קרטון', img: null, emoji: '☕' },
      { name: 'צלחות גדולות', img: null, emoji: '🍽️' },
      { name: 'צלחות קטנות', img: null, emoji: '🍽️' },
      { name: 'סכו״ם חד פעמי', img: null, emoji: '🍴' },
      { name: 'מפיות', img: null, emoji: '🧻' },
      { name: 'תבניות אלומיניום', img: null, emoji: '🥘' }
    ],
    'מוצרי ניקיון': [
      { name: 'נייר טואלט', img: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=150', emoji: '🧻' },
      { name: 'נוזל כלים', img: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=150', emoji: '🧼' },
      { name: 'אבקת כביסה', img: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=150', emoji: '🧺' },
      { name: 'מרכך כביסה', img: null, emoji: '🧴' },
      { name: 'שקיות אשפה', img: null, emoji: '🗑️' },
      { name: 'מטליות לחות', img: null, emoji: '🧻' },
      { name: 'ספוג לכלים', img: null, emoji: '🧽' }
    ]
  },
  'טואלטיקה ופארם': {
    'רחצה וטיפוח': [
      { name: 'שמפו', img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=150', emoji: '🧴' },
      { name: 'מרכך', img: null, emoji: '🧴' },
      { name: 'סבון גוף', img: null, emoji: '🧼' },
      { name: 'סבון ידיים', img: null, emoji: '🧼' },
      { name: 'דיאודורנט', img: null, emoji: '🧴' },
      { name: 'משחת שיניים', img: null, emoji: '🪥' },
      { name: 'מי פה', img: null, emoji: '💧' },
      { name: 'מגבונים', img: null, emoji: '🧻' }
    ]
  },
  'בעלי חיים': {
    'מזון לכלבים': [
      { name: 'אוכל יבש לכלב', img: null, emoji: '🐶' },
      { name: 'חטיף לכלב', img: null, emoji: '🦴' },
      { name: 'שימורים לכלב', img: null, emoji: '🥫' }
    ],
    'מזון לחתולים': [
      { name: 'אוכל יבש לחתול', img: null, emoji: '🐱' },
      { name: 'חול לחתולים', img: null, emoji: '🐈' },
      { name: 'מעדן לחתול', img: null, emoji: '🐟' }
    ]
  },
  'רכב ותחזוקה': {
    'ניקיון וטיפוח': [
      { name: 'עץ ריח לרכב', img: null, emoji: '🌲' },
      { name: 'נוזל שמשות', img: null, emoji: '💧' },
      { name: 'מטליות ניקוי', img: null, emoji: '🧽' },
      { name: 'ספריי חלונות', img: null, emoji: '✨' }
    ]
  }
};

const UNITS = ['יחידות', 'ק"ג', 'גרם', 'ליטר', 'אריזות'];

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
  const [items, setItems] = useState([]);
  const [customCatalog, setCustomCatalog] = useState([]); 
  const [activeMainCategory, setActiveMainCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [user, setUser] = useState(null);

  // --- מערכת סנכרון חכמה ללא בעיות אבטחה של URL פרטי ---
  const [listId, setListId] = useState(() => {
    // מזהה אקראי לרשימה אם לא קיים כבר
    return localStorage.getItem('grocery_list_id') || Math.random().toString(36).substr(2, 5).toUpperCase();
  });
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    localStorage.setItem('grocery_list_id', listId);
  }, [listId]);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Temp States
  const [addingProduct, setAddingProduct] = useState(null);
  const [addAmount, setAddAmount] = useState(1);
  const [addUnit, setAddUnit] = useState('יחידות');
  const [addNote, setAddNote] = useState('');
  
  const [customItemName, setCustomItemName] = useState('');
  const [customItemModal, setCustomItemModal] = useState(false);
  const [customItemMainCat, setCustomItemMainCat] = useState('');
  const [customItemSubCat, setCustomItemSubCat] = useState('');
  
  const [toastMsg, setToastMsg] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Family Info
  const [familyName, setFamilyName] = useState('ברקוביץ');
  const [isEditingFamily, setIsEditingFamily] = useState(false);
  const [tempFamily, setTempFamily] = useState('');

  // AI Assistant
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantResults, setAssistantResults] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // שילוב הקטלוג המקורי עם המוצרים האישיים שנוספו למסד הנתונים
  const fullCategories = useMemo(() => {
    const merged = JSON.parse(JSON.stringify(CATEGORIES));
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
  }, [customCatalog]);

  // Flatten products for search
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
    return allProducts.filter(p => p.name.includes(searchTerm));
  }, [searchTerm, allProducts]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Auth logic
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token && !currentUrlParams.get('ak')) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // DB Sync logic
  useEffect(() => {
    if (!user) return;
    
    // שימוש ב-listId כנתיב לשמירת הנתונים תוך הקפדה על חוקי האבטחה (מקסימום 5/6 סגמנטים)
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

    const existing = items.find(i => i.name === name && (i.unit || 'יחידות') === unit && (i.note || '') === note && !i.purchased);

    if (existing) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `list_${listId}`, existing.id), { amount: existing.amount + amount });
    } else {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `list_${listId}`), {
        name, emoji: emoji || '🛒', img: img || null,
        purchased: false, amount, unit, note, createdAt: Date.now()
      });
    }
    showToast(`${name} נוסף לעגלה!`);
    setAddingProduct(null);
    setSearchTerm('');
  };

  const togglePurchased = async (id, current) => {
    if (!user) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `list_${listId}`, id), { purchased: !current });
  };

  const updateAmount = async (id, amount, unit, delta) => {
    if (!user) return;
    const step = unit === 'ק"ג' ? 0.25 : (unit === 'גרם' ? 100 : 1);
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

  const submitCustomItem = async (e) => {
    e.preventDefault();
    if (!customItemName.trim() || !user) return;
    
    const newItem = { 
      name: customItemName.trim(), 
      emoji: '🛒', 
      img: null,
      mainCategory: customItemMainCat,
      subCategory: customItemSubCat
    };

    // שמירה למסד הנתונים של הקטלוג המותאם אישית
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `custom_${listId}`), newItem);

    // ממשיכים ישירות לחלון בחירת הכמות כדי להוסיף את המוצר לסל
    setAddingProduct(newItem);
    setAddUnit('יחידות');
    setAddAmount(1);
    setAddNote('');
    setCustomItemName('');
    setCustomItemModal(false);
  };

  const handleSearchCustomAdd = async (e) => {
    e.preventDefault();
    if (!customItemName.trim() || !user) return;
    const newItem = { 
      name: customItemName.trim(), emoji: '🛒', img: null,
      mainCategory: 'מזווה ומאפייה', subCategory: 'יבש ושימורים'
    };
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `custom_${listId}`), newItem);
    setAddingProduct(newItem);
    setAddUnit('יחידות'); setAddAmount(1); setAddNote(''); setCustomItemName('');
  };

  const copyPinCode = () => {
    const dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.value = listId;
    dummy.select();
    dummy.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(dummy);
    showToast('קוד ה-PIN הועתק! שלח אותו למשפחה.');
  };

  const generateSmartList = async () => {
    if (!assistantPrompt.trim()) return;
    setIsGenerating(true);
    setAssistantResults([]);

    try {
      const apiKey = "AQ.Ab8RN6L2h99YidYeENbASovAtUiMtlAIOPfm9MatRAmyXwhqZQ";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: assistantPrompt }] }],
        systemInstruction: { parts: [{ text: "You are a smart Hebrew grocery assistant. Return JSON list of ingredients needed for the user's meal. Format: [{name, amount, unit, emoji}]." }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: { name: { type: "STRING" }, amount: { type: "NUMBER" }, unit: { type: "STRING" }, emoji: { type: "STRING" } },
              required: ["name", "amount", "unit", "emoji"]
            }
          }
        }
      };

      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        setAssistantResults(JSON.parse(data.candidates[0].content.parts[0].text));
      } else showToast('לא הצלחנו לייצר רשימה, נסה שוב.');
    } catch (error) {
      showToast('אירעה שגיאה בחיבור לעוזר החכם.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addAllFromAssistant = async () => {
    if (!user || assistantResults.length === 0) return;
    for (const item of assistantResults) {
      const existing = items.find(i => i.name === item.name && (i.unit || 'יחידות') === item.unit && !i.purchased);
      if (existing) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `list_${listId}`, existing.id), { amount: existing.amount + item.amount });
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `list_${listId}`), {
          name: item.name, emoji: item.emoji, img: null,
          purchased: false, amount: item.amount, unit: item.unit, note: '', createdAt: Date.now()
        });
      }
    }
    showToast('הוספנו את המצרכים בהצלחה!');
    setAssistantResults([]);
    setAssistantPrompt('');
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-3 font-sans relative pb-20" dir="rtl">
      
      {/* תמונת רקע אמיתית של עגלת קניות בסופר (מובלטת יותר ומציאותית) */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <img src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1080&auto=format&fit=crop" className="w-full h-full object-cover opacity-20" alt="Supermarket Cart" />
         <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <header className="bg-green-600 text-white p-3 shadow-md rounded-2xl mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
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
                <button onClick={saveFamilyName} className="text-xs bg-white text-green-700 px-2 py-1 rounded font-bold">שמור</button>
              </div>
            ) : (
              <h1 
                onClick={() => { setTempFamily(familyName); setIsEditingFamily(true); }}
                className="text-base font-bold flex items-center gap-1 cursor-pointer hover:bg-green-500 px-2 py-1 rounded transition-colors -ml-2"
              >
                משפחת {familyName} <Edit2 className="w-3 h-3 opacity-70" />
              </h1>
            )}
          </div>
          <button onClick={() => setShareModalOpen(true)} className="p-2 bg-green-500 rounded-full hover:bg-green-400 transition shadow-sm">
            <Share2 className="w-4 h-4" />
          </button>
        </header>
        
        {/* --- TAB: LIST --- */}
        {activeTab === 'list' && (
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="text-center bg-white/80 backdrop-blur rounded-2xl p-6 border border-gray-100 shadow-sm mt-8">
                <ShoppingBag className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                <p className="text-base font-bold text-gray-500">הסל ריק כרגע</p>
              </div>
            ) : 
            items.map(item => (
              <div key={item.id} className={`bg-white/95 backdrop-blur p-2.5 rounded-xl shadow-sm flex items-center justify-between border border-gray-100 transition-all ${item.purchased ? 'opacity-60' : 'border-r-4 border-r-green-500'}`}>
                
                <div className="flex items-center gap-2 cursor-pointer flex-1 overflow-hidden" onClick={() => togglePurchased(item.id, item.purchased)}>
                  <button className={`p-1 rounded-full flex-shrink-0 ${item.purchased ? 'text-green-500' : 'text-gray-300'}`}>
                    {item.purchased ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <ProductImage src={item.img} emoji={item.emoji} size="small" />
                  <div className="flex flex-col min-w-0">
                    <span className={`font-bold text-sm truncate ${item.purchased ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.name}
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
                    <div className="flex flex-col items-center justify-center w-6" dir="rtl">
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
                <Trash2 size={16} /> נקה מוצרים שנקנו
              </button>
            )}
          </div>
        )}

        {/* --- TAB: ADD (קטגוריות וחיפוש) --- */}
        {activeTab === 'add' && (
          <div className="space-y-3">
            
            {/* שורת חיפוש חכמה */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setActiveMainCategory(null); }}
                placeholder="חיפוש מהיר של מוצרים..."
                className="w-full bg-white/90 backdrop-blur border border-gray-200 rounded-xl py-3 pr-9 pl-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchTerm ? (
               <div className="bg-white/95 rounded-xl p-3 shadow-sm border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 mb-3">תוצאות חיפוש:</h3>
                  {searchResults.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {searchResults.map(item => (
                        <button key={item.name} onClick={() => { setAddingProduct(item); setAddUnit('יחידות'); setAddAmount(1); setAddNote(''); }} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-transparent hover:border-green-200 text-right">
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
                      <p className="text-sm text-gray-400">לא מצאנו "{searchTerm}"</p>
                    </div>
                  )}
                  
                  {/* הוספה אישית מהחיפוש */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-600 mb-2">לא מצאת? הוסף בעצמך:</p>
                    <form onSubmit={handleSearchCustomAdd} className="flex gap-2">
                      <input type="text" value={customItemName} onChange={(e) => setCustomItemName(e.target.value)} placeholder="שם מוצר חדש" className="flex-grow p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-green-500" />
                      <button type="submit" disabled={!customItemName.trim()} className="bg-green-600 text-white px-4 text-sm rounded-lg font-bold disabled:opacity-50">הוסף לסל</button>
                    </form>
                  </div>
               </div>
            ) : !activeMainCategory ? (
              // רשימת קטגוריות ראשיות
              <div className="flex flex-col gap-2">
                {Object.keys(fullCategories).map(cat => (
                  <button key={cat} onClick={() => setActiveMainCategory(cat)} className="w-full bg-white/95 p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between text-gray-800 hover:bg-green-50 active:scale-95 transition-colors">
                    <span className="font-bold text-sm">{cat}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            ) : (
              // תתי קטגוריות ומוצרים
              <div>
                <div className="flex items-center justify-between mb-3 bg-white/90 p-2.5 rounded-xl shadow-sm border border-green-100">
                  <h2 className="font-black text-sm text-green-800 px-1">{activeMainCategory}</h2>
                  <button onClick={() => setActiveMainCategory(null)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                    חזרה לקטגוריות
                  </button>
                </div>
                
                <div className="space-y-6">
                  {Object.entries(fullCategories[activeMainCategory]).map(([subCatName, itemsList]) => (
                    <div key={subCatName} className="bg-white/70 backdrop-blur p-2 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-bold text-gray-500 mb-2 px-1">{subCatName}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        {itemsList.map(item => (
                          <button 
                            key={item.name} 
                            onClick={() => {
                              setAddingProduct(item);
                              setAddUnit(['ירקות', 'פירות', 'בשר ודגים טריים'].includes(activeMainCategory) ? 'ק"ג' : 'יחידות');
                              setAddAmount(1);
                              setAddNote('');
                            }} 
                            className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-3 active:scale-95 text-right hover:border-green-200 transition-colors"
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
                      
                      {/* הוספת מוצר חדש - נשמר בתת הקטגוריה הזו בדיוק! */}
                      <button onClick={() => {
                        setCustomItemMainCat(activeMainCategory);
                        setCustomItemSubCat(subCatName);
                        setCustomItemName('');
                        setCustomItemModal(true);
                      }} className="w-full p-2 border-2 border-dashed border-green-200 rounded-xl text-green-600 font-bold text-xs flex items-center justify-center gap-1 hover:bg-green-50 transition-colors bg-white/50">
                        <Plus size={14}/> לא מצאת? הוסף מוצר חדש ל{subCatName}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: AI ASSISTANT --- */}
        {activeTab === 'assistant' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-2xl shadow-lg text-white text-center">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-green-100" />
              <h2 className="text-xl font-black mb-1">עוזר חכם ✨</h2>
              <p className="text-green-50 text-xs mb-4">ספרו לי מה תרצו להכין ואבנה לכם רשימה מדויקת!</p>
              
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={assistantPrompt}
                  onChange={(e) => setAssistantPrompt(e.target.value)}
                  placeholder="למשל: על האש למשפחה..."
                  className="bg-white/95 text-gray-800 text-sm px-3 py-2.5 rounded-lg outline-none w-full shadow-inner"
                />
                <button 
                  onClick={generateSmartList}
                  disabled={isGenerating || !assistantPrompt.trim()}
                  className="bg-green-800 text-white px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-green-900 transition-colors shadow-md"
                >
                  {isGenerating ? 'חושב...' : 'צור רשימה'}
                </button>
              </div>
            </div>

            {!isGenerating && assistantResults.length > 0 && (
              <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="font-bold text-gray-800 text-sm mb-3">המצרכים הדרושים:</div>
                <ul className="divide-y divide-gray-100 mb-4">
                  {assistantResults.map((item, idx) => (
                    <li key={idx} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.emoji}</span>
                        <div className="font-bold text-sm text-gray-800">{item.name}</div>
                      </div>
                      <div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600 border border-gray-200">
                        {item.amount} {item.unit}
                      </div>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={addAllFromAssistant}
                  className="w-full bg-green-500 text-white font-black py-3 rounded-xl text-sm flex justify-center gap-2 shadow-md hover:bg-green-600 transition-colors"
                >
                  <Plus size={16} /> הוסף הכל לעגלה
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* מודל הוספת פריט מותאם אישית */}
      {customItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-5">
            <h3 className="font-black text-lg text-gray-800 mb-4 flex items-center gap-2">
               <Plus className="text-green-500"/> הוספת מוצר ל{customItemSubCat}
            </h3>
            <form onSubmit={submitCustomItem} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">שם המוצר שחסר:</label>
                <input autoFocus type="text" value={customItemName} onChange={(e) => setCustomItemName(e.target.value)} placeholder="למשל: גבינת עיזים" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setCustomItemModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 text-sm hover:bg-gray-200 transition-colors">ביטול</button>
                <button type="submit" disabled={!customItemName.trim()} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-green-500 disabled:opacity-50 text-sm hover:bg-green-600 transition-colors shadow-md">שמור והמשך</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal - מערכת ה-PIN החכמה לסנכרון */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-green-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-black text-lg">סנכרון רשימה משפחתית</h3>
              <button onClick={() => setShareModalOpen(false)} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><X size={16}/></button>
            </div>
            
            <div className="p-5 space-y-6">
              
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center shadow-inner">
                <p className="text-sm font-bold text-green-800 mb-2">קוד הגישה של הרשימה שלכם:</p>
                <div className="text-4xl font-black text-green-600 tracking-widest mb-3 select-all">{listId}</div>
                <button onClick={copyPinCode} className="w-full bg-green-200 hover:bg-green-300 text-green-800 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 mb-3">
                  <Copy size={14}/> לחץ כאן להעתקת קוד הגישה הסודי
                </button>
                <p className="text-xs text-green-700 leading-relaxed border-t border-green-200 pt-3">
                  <b>איך משתפים בסביבה זו?</b> כל מי שרוצה להצטרף לעריכת הרשימה, צריך לפתוח את האפליקציה בג'מיני אצלו ולהזין את הקוד הזה.
                </p>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold">או</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">הצטרפות לרשימה קיימת של מישהו אחר:</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="קוד גישה (5 תווים)..." 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={5}
                    className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-green-400 text-center font-black tracking-widest text-lg"
                  />
                  <button 
                    onClick={() => {
                      if (joinCode.length === 5) {
                        setListId(joinCode);
                        setShareModalOpen(false);
                        showToast('הצטרפת לרשימה בהצלחה!');
                      }
                    }}
                    disabled={joinCode.length !== 5}
                    className="bg-green-500 text-white px-5 rounded-xl font-bold disabled:opacity-50 hover:bg-green-600 transition-colors shadow-md"
                  >
                    הצטרף
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Amount Modal (הוקטן ב-20%) */}
      {addingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl w-[260px] overflow-hidden">
            <div className="bg-green-50 p-3 border-b border-green-100 flex items-center gap-3">
              <ProductImage src={addingProduct.img} emoji={addingProduct.emoji} size="small" />
              <div>
                <h3 className="font-black text-base text-green-900 leading-tight">{addingProduct.name}</h3>
                <p className="text-[10px] font-bold text-green-700 mt-0.5">בחירת כמות</p>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-inner" dir="ltr">
                  <button type="button" onClick={() => setAddAmount(Math.max(0.1, addAmount - (addUnit === 'ק"ג' ? 0.25 : (addUnit === 'גרם' ? 100 : 1))))} className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-lg font-bold text-green-600 active:scale-95 hover:bg-gray-50">-</button>
                  <input type="number" value={addAmount} onChange={(e) => setAddAmount(parseFloat(e.target.value) || 0)} className="flex-grow h-9 bg-transparent text-center text-lg font-black focus:outline-none text-gray-800 min-w-0" dir="rtl" />
                  <button type="button" onClick={() => setAddAmount(addAmount + (addUnit === 'ק"ג' ? 0.25 : (addUnit === 'גרם' ? 100 : 1)))} className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-lg font-bold text-green-600 active:scale-95 hover:bg-gray-50">+</button>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {UNITS.map(unit => (
                    <button
                      key={unit}
                      onClick={() => { setAddUnit(unit); if (unit === 'גרם' && addAmount < 100) setAddAmount(100); if (unit !== 'גרם' && addAmount >= 100) setAddAmount(1); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${addUnit === unit ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* שדה הערות מוקטן ואלגנטי */}
              <div className="pt-1">
                 <div className="relative">
                    <MessageSquareText className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input 
                      type="text" 
                      value={addNote}
                      onChange={(e) => setAddNote(e.target.value)}
                      placeholder="הערה (למשל: רק של תנובה, 5%...)" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pr-8 pl-2 text-xs outline-none focus:border-green-400 transition-colors shadow-inner"
                    />
                 </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setAddingProduct(null)} className="flex-1 py-2.5 px-2 rounded-xl font-bold text-gray-600 bg-gray-100 text-xs hover:bg-gray-200 transition-colors">ביטול</button>
                <button onClick={confirmAddItem} className="flex-[2] py-2.5 px-2 rounded-xl font-black text-white bg-green-500 shadow-md text-xs flex justify-center items-center gap-1.5 hover:bg-green-600 transition-colors">הוסף <ShoppingCart size={14}/></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl z-50 font-bold text-xs whitespace-nowrap flex items-center gap-1.5 animate-slide-up">
          <CheckCircle2 size={14} className="text-green-400" />
          {toastMsg}
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-[0_-5px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 z-40">
        <div className="max-w-md mx-auto flex p-1.5 gap-1.5">
          <button onClick={() => setActiveTab('list')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-colors ${activeTab === 'list' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-50'}`}>
            <ShoppingCart size={16} /> הרשימה
          </button>
          <button onClick={() => setActiveTab('add')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-colors ${activeTab === 'add' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Plus size={16} /> הוספה
          </button>
          <button onClick={() => setActiveTab('assistant')} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition-colors ${activeTab === 'assistant' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Sparkles size={16} /> קסם
          </button>
        </div>
      </nav>
    </div>
  );
}
