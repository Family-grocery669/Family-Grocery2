import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ShoppingCart, ShoppingBag, Share2, Edit2, Copy, ExternalLink, X, Sparkles, Search, ChevronRight, MessageSquareText, Loader2, Minus } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';

// --- Firebase Config ---
const DEFAULT_FIREBASE_CONFIG = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const currentUrlParams = new URLSearchParams(window.location.search);

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

const appId = typeof __app_id !== 'undefined' ? __app_id : 'grocery-app-default';

// --- Rich Hierarchical Product Catalog ---
const CATEGORIES = {
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
  // --- מערכת קישורים ומשתמשים חכמה ---
  const [listId, setListId] = useState(() => {
    // בדיקה האם הגענו מקישור שיתוף
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

  // States רגילים
  const [items, setItems] = useState([]);
  const [customCatalog, setCustomCatalog] = useState([]); 
  const [activeMainCategory, setActiveMainCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [joinCode, setJoinCode] = useState('');

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
  const [familyName, setFamilyName] = useState('');
  const [isEditingFamily, setIsEditingFamily] = useState(false);
  const [tempFamily, setTempFamily] = useState('');

  // AI Assistant States
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantResults, setAssistantResults] = useState([]);
  const [assistantRecipeName, setAssistantRecipeName] = useState('');
  const [assistantInstructions, setAssistantInstructions] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem('grocery_list_id', listId);
    // ניקוי ה-URL אחרי שקראנו את ה-listId כדי שייראה נקי
    if (currentUrlParams.has('list')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [listId]);

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

  // DB Sync logic
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

  // שמירת משתמש מהמסך פתיחה
  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (!setupTempUser.trim()) return;
    
    localStorage.setItem('grocery_user_name', setupTempUser.trim());
    setUserName(setupTempUser.trim());
    
    // אם המשתמש גם הזין שם משפחה חדש (כי זה לא היה קיים בקישור)
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

    const existing = items.find(i => i.name === name && (i.unit || 'יחידות') === unit && (i.note || '') === note && !i.purchased);

    if (existing) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `list_${listId}`, existing.id), { amount: existing.amount + amount });
    } else {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `list_${listId}`), {
        name, emoji: emoji || '🛒', img: img || null,
        purchased: false, amount, unit, note, 
        addedBy: userName, // התיוג של מי שהוסיף
        createdAt: Date.now()
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

  // מחיקת מצרך מתוך רשימת ה-AI לפני ההוספה לעגלה
  const removeAiIngredient = (id) => {
    setAssistantResults(prev => prev.filter(item => item.id !== id));
  };

  // שיתוף חכם דרך הטלפון
  const handleSmartShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?list=${listId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `רשימת הקניות של משפחת ${familyName || 'שלנו'}`,
          text: 'בואו לעדכן את רשימת הקניות שלנו ביחד! 🛒',
          url: shareUrl
        });
      } catch (err) {
        console.log("Share canceled or failed", err);
      }
    } else {
      // חלופה למחשבים - העתקה ללוח
      navigator.clipboard.writeText(shareUrl);
      showToast('הקישור המשפחתי הועתק! הדבק בוואטסאפ.');
    }
  };

  const generateSmartList = async () => {
    if (!assistantPrompt.trim()) return;
    setIsGenerating(true);
    setAssistantResults([]);
    setAssistantRecipeName('');
    setAssistantInstructions([]);
    setShowInstructions(false);

   try {
      // המפתח שלך תקין לחלוטין - זה הסטנדרט החדש!
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      // הפתרון: פנייה למודל gemini-3.5-flash שחי ובועט עכשיו בשרתים של גוגל
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: assistantPrompt }] }],
        systemInstruction: { parts: [{ text: "אתה עוזר חכם למטבח בעברית. המשתמש יבקש רעיון לארוחה או מתכון. החזר JSON מסודר בלבד, ללא טקסט נוסף. כלול: recipeName (שם המתכון), ingredients (מערך של אובייקטים עם name, amount, unit, emoji), ו-instructions (מערך של מחרוזות עם שלבי ההכנה)." }] },
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
        // מוסיפים ID זמני לכל מצרך כדי שנוכל למחוק אותו
        setAssistantResults(parsed.ingredients.map((ing, idx) => ({ ...ing, id: `ai-${idx}` })));
      } else {
        showToast('לא הצלחנו לייצר מתכון, נסה שוב.');
      }
    } catch (error) {
      showToast('אירעה שגיאה. ודא שהגדרת את VITE_GEMINI_API_KEY ב-Vercel.');
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
          purchased: false, amount: item.amount, unit: item.unit, note: '', 
          addedBy: userName, // תיוג מי שהוסיף מה-AI
          createdAt: Date.now()
        });
      }
    }
    showToast('הוספנו את המצרכים לעגלה!');
    setAssistantResults([]);
    setAssistantPrompt('');
    setActiveTab('list');
  };

  // --- מסך כניסה חכם (Setup Modal) ---
  if (showSetup) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 text-center border border-green-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">מי בא לקנות?</h2>
          <p className="text-sm text-gray-500 mb-6">כדי שנדע מי הוסיף כל מוצר לרשימה, ספרו לנו מי אתם.</p>
          
          <form onSubmit={handleSetupSubmit} className="space-y-4">
            {!familyName && (
              <div className="text-right">
                <label className="text-xs font-bold text-gray-600 block mb-1">שם המשפחה שלכם:</label>
                <input
                  type="text"
                  placeholder="בית משפחת..."
                  value={setupTempFamily}
                  onChange={(e) => setSetupTempFamily(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-400 focus:bg-white transition-colors"
                />
              </div>
            )}
            <div className="text-right">
              <label className="text-xs font-bold text-gray-600 block mb-1">השם הפרטי שלך:</label>
              <input
                type="text"
                placeholder="למשל: אבא, אמא, דני..."
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
              היכנס לרשימה
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- תצוגת האפליקציה הראשית ---
  return (
    <div className="min-h-screen bg-gray-50/50 p-3 font-sans relative pb-20" dir="rtl">
      
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
          <div className="flex gap-2">
             <button onClick={handleSmartShare} className="px-3 py-1.5 bg-green-500 rounded-full hover:bg-green-400 transition shadow-sm text-xs font-bold flex items-center gap-1">
               שתף <Share2 className="w-3 h-3" />
             </button>
          </div>
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
                      {/* תיוג עדין של מי שהוסיף */}
                      {item.addedBy && (
                        <span className="text-[10px] text-gray-400 font-normal italic mr-1">
                          (נוסף ע"י: {item.addedBy})
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
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-600 mb-2">לא מצאת? הוסף בעצמך:</p>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if(!customItemName.trim() || !user) return;
                      const newItem = { name: customItemName.trim(), emoji: '🛒', img: null, mainCategory: 'מזווה ומאפייה', subCategory: 'יבש ושימורים' };
                      addDoc(collection(db, 'artifacts', appId, 'public', 'data', `custom_${listId}`), newItem).then(() => {
                        setAddingProduct(newItem); setAddUnit('יחידות'); setAddAmount(1); setAddNote(''); setCustomItemName('');
                      });
                    }} className="flex gap-2">
                      <input type="text" value={customItemName} onChange={(e) => setCustomItemName(e.target.value)} placeholder="שם מוצר חדש" className="flex-grow p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-green-500" />
                      <button type="submit" disabled={!customItemName.trim()} className="bg-green-600 text-white px-4 text-sm rounded-lg font-bold disabled:opacity-50">הוסף</button>
                    </form>
                  </div>
               </div>
            ) : !activeMainCategory ? (
              <div className="flex flex-col gap-2">
                {Object.keys(fullCategories).map(cat => (
                  <button key={cat} onClick={() => setActiveMainCategory(cat)} className="w-full bg-white/95 p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between text-gray-800 hover:bg-green-50 active:scale-95 transition-colors">
                    <span className="font-bold text-sm">{cat}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            ) : (
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
                      
                      <button onClick={() => {
                        setCustomItemMainCat(activeMainCategory);
                        setCustomItemSubCat(subCatName);
                        setCustomItemName('');
                        setCustomItemModal(true);
                      }} className="w-full p-2 border-2 border-dashed border-green-200 rounded-xl text-green-600 font-bold text-xs flex items-center justify-center gap-1 hover:bg-green-50 transition-colors bg-white/50">
                        <Plus size={14}/> הוסף מוצר חדש
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
              <h2 className="text-xl font-black mb-1">עוזר חכם למטבח ✨</h2>
              <p className="text-green-50 text-xs mb-4">תגיד לי מה בא לך להכין, ואני אכתוב מתכון ואכין רשימת קניות!</p>
              
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={assistantPrompt}
                  onChange={(e) => setAssistantPrompt(e.target.value)}
                  placeholder="למשל: בולונז או ארוחת ערב מהירה..."
                  className="bg-white/95 text-gray-800 text-sm px-3 py-3 rounded-xl outline-none w-full shadow-inner"
                  disabled={isGenerating}
                />
                <button 
                  onClick={generateSmartList}
                  disabled={isGenerating || !assistantPrompt.trim()}
                  className="bg-green-800 text-white px-4 py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-green-900 transition-colors shadow-md flex justify-center items-center gap-2"
                >
                  {isGenerating ? <><Loader2 size={16} className="animate-spin" /> חושב וכותב מתכון...</> : 'צור מתכון ומצרכים'}
                </button>
              </div>
            </div>

            {!isGenerating && assistantRecipeName && (
              <div className="bg-white/95 rounded-2xl p-4 shadow-md border border-green-100">
                <h3 className="font-black text-lg text-green-700 mb-4 pb-2 border-b border-green-50">🍲 {assistantRecipeName}</h3>
                
                <div className="font-bold text-gray-800 text-sm mb-3">המצרכים הדרושים:</div>
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
                        title="יש לי בבית - הסר מהרשימה"
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
                    <Plus size={16} /> הוסף הכל לעגלה
                  </button>
                ) : (
                  <div className="text-center text-sm font-bold text-green-600 bg-green-50 p-3 rounded-xl mb-3 border border-green-100">
                    הסרת את כל המצרכים - לא חסר לכם כלום למתכון! 🎉
                  </div>
                )}

                {/* מתקפל להוראות הכנה */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="w-full bg-gray-50 p-3 flex justify-between items-center text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    הוראות הכנה שלב אחר שלב
                    <ChevronRight size={16} className={`transform transition-transform ${showInstructions ? '-rotate-90' : 'rotate-90'}`} />
                  </button>
                  
                  {showInstructions && (
                    <div className="p-4 bg-white text-sm text-gray-700 leading-relaxed border-t border-gray-100">
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

      {/* --- MODALS --- */}
      {/* Custom Item Modal */}
      {customItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-5">
            <h3 className="font-black text-lg text-gray-800 mb-4 flex items-center gap-2">
               <Plus className="text-green-500"/> הוספת מוצר
            </h3>
            <form onSubmit={(e) => {
                e.preventDefault();
                if (!customItemName.trim() || !user) return;
                const newItem = { name: customItemName.trim(), emoji: '🛒', img: null, mainCategory: customItemMainCat, subCategory: customItemSubCat };
                addDoc(collection(db, 'artifacts', appId, 'public', 'data', `custom_${listId}`), newItem).then(() => {
                  setAddingProduct(newItem); setAddUnit('יחידות'); setAddAmount(1); setAddNote(''); setCustomItemName(''); setCustomItemModal(false);
                });
            }} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">שם המוצר שחסר:</label>
                <input autoFocus type="text" value={customItemName} onChange={(e) => setCustomItemName(e.target.value)} placeholder="למשל: גבינת עיזים" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setCustomItemModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 text-sm hover:bg-gray-200 transition-colors">ביטול</button>
                <button type="submit" disabled={!customItemName.trim()} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-green-500 disabled:opacity-50 text-sm hover:bg-green-600 transition-colors shadow-md">המשך</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Amount Modal */}
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

              <div className="pt-1">
                 <div className="relative">
                    <MessageSquareText className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input 
                      type="text" 
                      value={addNote}
                      onChange={(e) => setAddNote(e.target.value)}
                      placeholder="הערה (למשל: רק של תנובה...)" 
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
