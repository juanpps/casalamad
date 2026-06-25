import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { TrackingView } from './components/TrackingView';

interface Portion {
  label: string;
  priceStr: string;
  priceNum: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  tag: string;
  image: string;
  portions: Portion[];
  rating?: string;
  reviews?: number;
  prepTime?: string;
  popular?: boolean;
  spicy?: boolean;
}

interface Category {
  id: 'arroces' | 'combos' | 'extras';
  name: string;
  hanzi: string;
  items: MenuItem[];
}

interface CartItem {
  key: string; // name + '||' + portion
  name: string;
  portion: string;
  priceStr: string;
  priceNum: number;
  qty: number;
}

const MENU_DATA: Category[] = [
  {
    id: 'arroces',
    name: 'Arroces',
    hanzi: '饭',
    items: [
      {
        id: 'arroz-chino',
        name: 'Arroz Wok',
        description: 'Jamón, camarón, pollo, raíces, habichuela y zanahoria',
        tag: '招牌',
        image: 'img_2.jpg',
        portions: [
          { label: 'Personal', priceStr: '$20.000', priceNum: 20000 },
          { label: '2 Personas', priceStr: '$30.000', priceNum: 30000 },
          { label: '3 Personas', priceStr: '$40.000', priceNum: 40000 }
        ],
        rating: '4.9',
        reviews: 24,
        prepTime: '15-20 min',
        popular: true
      },
      {
        id: 'arroz-chino-especial',
        name: 'Arroz Wok Especial',
        description: 'Pollo, camarón, cerdo, jamón, raíces, habichuela y zanahoria',
        tag: '特级',
        image: 'img_3.jpg',
        portions: [
          { label: 'Personal', priceStr: '$23.000', priceNum: 23000 },
          { label: '2 Personas', priceStr: '$34.000', priceNum: 34000 },
          { label: '3 Personas', priceStr: '$45.000', priceNum: 45000 }
        ],
        rating: '4.8',
        reviews: 18,
        prepTime: '15-20 min'
      },
      {
        id: 'arroz-wok-pollo',
        name: 'Arroz al Wok con Pollo',
        description: 'Arroz salteado a fuego alto con trozos de pechuga de pollo, raíces chinas y vegetales frescos de temporada',
        tag: '人气',
        image: 'img_4.jpg',
        portions: [
          { label: 'Personal', priceStr: '$22.000', priceNum: 22000 },
          { label: '2 Personas', priceStr: '$32.000', priceNum: 32000 }
        ],
        rating: '4.7',
        reviews: 14,
        prepTime: '10-15 min'
      }
    ]
  },
  {
    id: 'combos',
    name: 'Platos & Combos',
    hanzi: '套',
    items: [
      {
        id: 'combo-dragon',
        name: 'Combo Dragón',
        description: 'Arroz wok + Costilla agridulce + Papas a la francesa',
        tag: '热卖',
        image: 'img_5.jpg',
        portions: [
          { label: 'Sencillo', priceStr: '$25.000', priceNum: 25000 },
          { label: 'Especial', priceStr: '$32.000', priceNum: 32000 }
        ],
        rating: '4.9',
        reviews: 31,
        prepTime: '20-25 min',
        popular: true
      },
      {
        id: 'combo-imperial',
        name: 'Combo Imperial',
        description: 'Arroz wok + Pollo agridulce + Costilla de cerdo + Lumpsia tradicional de vegetales',
        tag: '推荐',
        image: 'img_6.jpg',
        portions: [
          { label: 'Familiar (2-3 pers)', priceStr: '$54.000', priceNum: 54000 }
        ],
        rating: '4.8',
        reviews: 28,
        prepTime: '20-25 min'
      },
      {
        id: 'lomo-wok',
        name: 'Lomo al Wok Especial',
        description: 'Lomo de res finamente cortado, salteado al wok con cebolla morada, pimentón verde y salsa de soya premium',
        tag: '经典',
        image: 'img_7.jpg',
        portions: [
          { label: 'Personal', priceStr: '$26.000', priceNum: 26000 }
        ],
        rating: '4.6',
        reviews: 11,
        prepTime: '15 min',
        spicy: true
      }
    ]
  },
  {
    id: 'extras',
    name: 'Adiciones',
    hanzi: '加',
    items: [
      {
        id: 'costilla-agridulce',
        name: 'Costilla Agridulce',
        description: 'Porción de costillas bañadas en nuestra salsa secreta',
        tag: '美味',
        image: 'img_8.jpg',
        portions: [
          { label: 'Porción', priceStr: '$16.000', priceNum: 16000 }
        ],
        rating: '4.8',
        reviews: 19,
        prepTime: '10 min'
      },
      {
        id: 'lumpsia',
        name: 'Lumpsia de Vegetales',
        description: 'Rollo primavera crocante relleno de verduras selectas',
        tag: '小吃',
        image: 'img_9.jpg',
        portions: [
          { label: '1 Unidad', priceStr: '$4.000', priceNum: 4000 },
          { label: '3 Unidades', priceStr: '$10.000', priceNum: 10000 }
        ],
        rating: '4.7',
        reviews: 22,
        prepTime: '5-10 min'
      }
    ]
  }
];

const mapDbItemToMenuItem = (item: any): MenuItem => {
  return {
    id: item.id,
    name: item.nombre,
    description: item.descripcion || '',
    tag: item.tag || '',
    image: item.imagen_url || 'img_1.png',
    portions: Array.isArray(item.porciones) ? item.porciones.map((p: any) => ({
      label: p.label,
      priceStr: p.priceStr || (p.priceNum ? '$' + p.priceNum.toLocaleString('es-CO') : ''),
      priceNum: p.priceNum || 0
    })) : [],
    rating: item.rating || '4.8',
    reviews: item.reviews || 0,
    prepTime: item.prep_time || '15-20 min',
    popular: item.popular || false,
    spicy: item.spicy || false
  };
};

function App() {
  // Public Menu & Shopping Cart States
  const [activeCategory, setActiveCategory] = useState<'todos' | 'arroces' | 'combos' | 'extras'>('todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'local' | 'domicilio'>('local');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [nota, setNota] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Supabase Data States
  const [platos, setPlatos] = useState<any[]>([]);
  const [configuracion, setConfiguracion] = useState<any>({
    whatsapp: '573217140547',
    horario: '11 am – 10 pm · Lun a Dom',
    direccion: 'Cra 24e #14-08 · Sector 25 Manzanares',
    direccion_maps: 'https://maps.app.goo.gl/JERm3cEdqyYrPNAK7',
    instagram: '',
    facebook: ''
  });
  const [loading, setLoading] = useState(true);

  // Admin & Auth States
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<'platos' | 'configuracion'>('platos');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Tracking State
  const [trackingToken, setTrackingToken] = useState<string | null>(null);

  // Dish Editor Modal State
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<any | null>(null);
  const [imageSelectorTab, setImageSelectorTab] = useState<'url' | 'file'>('url');
  const [dishForm, setDishForm] = useState<any>({
    nombre: '',
    descripcion: '',
    categoria: 'arroces',
    imagen_url: '',
    tag: '',
    rating: '4.8',
    reviews: 0,
    prep_time: '15-20 min',
    popular: false,
    spicy: false,
    visible: true,
    porciones: []
  });

  // Fetch Menu and Config data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Platos from Supabase
      const { data: platosData, error: platosErr } = await supabase
        .from('platos')
        .select('*')
        .order('orden', { ascending: true });

      if (platosErr) throw platosErr;
      if (platosData) {
        setPlatos(platosData);
      }

      // Fetch Configuration
      const { data: configData, error: configErr } = await supabase
        .from('configuracion')
        .select('*')
        .eq('id', 1)
        .single();

      if (configErr && configErr.code !== 'PGRST116') throw configErr;
      if (configData) {
        setConfiguracion(configData);
      }
    } catch (err) {
      console.warn('Fallback settings enabled. Local static data is in use.', err);
    } finally {
      setLoading(false);
    }
  };

  // Auth & URL Hash Listeners
  useEffect(() => {
    fetchData();

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Check tracking route
    const path = window.location.pathname;
    if (path.startsWith('/tracking/')) {
      const token = path.replace('/tracking/', '');
      setTrackingToken(token);
    }

    // Hash change handler to navigate to admin console (#admin)
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminActive(true);
      } else {
        setIsAdminActive(false);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  // Sync scroll lock when cart panel is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 2200);
  };

  // Cart operations
  const addToCart = (name: string, portion: string, priceStr: string, priceNum: number) => {
    const key = `${name}||${portion}`;
    setCart(prevCart => {
      const existing = prevCart.find(i => i.key === key);
      if (existing) {
        return prevCart.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prevCart, { key, name, portion, priceStr, priceNum, qty: 1 }];
    });
    showToast(`${name} · ${portion}`);
  };

  const changeQty = (key: string, delta: number) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.key === key) {
            const nextQty = item.qty + delta;
            return { ...item, qty: nextQty };
          }
          return item;
        })
        .filter(item => item.qty > 0);
    });
  };

  const removeItem = (key: string) => {
    setCart(prevCart => prevCart.filter(item => item.key !== key));
  };

  const clearCart = () => {
    setCart([]);
  };

  const formatCOP = (n: number) => {
    return '$' + n.toLocaleString('es-CO');
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.priceNum * item.qty, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Public order confirmation flow
  const handlePreConfirm = () => {
    if (cart.length === 0) return;
    if (!nombre.trim()) { showToast('Escribe tu nombre'); return; }
    if (!telefono.trim()) { showToast('Escribe tu teléfono'); return; }
    if (deliveryMode === 'domicilio' && !direccion.trim()) { showToast('Escribe tu dirección'); return; }
    setIsConfirmOpen(true);
  };

  const sendWhatsApp = () => {
    let msg = `🐉 *Pedido — Casa Lamad*\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `👤 *Nombre:* ${nombre.trim()}\n`;
    msg += `📞 *Teléfono:* ${telefono.trim()}\n`;
    if (deliveryMode === 'domicilio') {
      msg += `🛵 *Modalidad:* Domicilio\n`;
      msg += `📍 *Dirección de entrega:* ${direccion.trim()}\n`;
    } else {
      msg += `🏠 *Modalidad:* Recoger en local\n`;
      msg += `📍 *Dirección local:* ${configuracion.direccion}\n`;
      msg += `🕐 *Horario:* ${configuracion.horario}\n`;
    }
    msg += `\n🍽️ *Detalle del pedido:*\n`;
    cart.forEach(item => {
      msg += `  • ${item.name} (${item.portion}) ×${item.qty}  →  ${formatCOP(item.priceNum * item.qty)}\n`;
    });
    msg += `\n💰 *TOTAL: ${formatCOP(cartTotal)}*`;
    if (nota.trim()) msg += `\n\n📝 *Notas:* ${nota.trim()}`;
    msg += `\n\n_Pedido generado desde el menú digital de Casa Lamad_ 🥢`;
    window.open(`https://wa.me/${configuracion.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    setIsConfirmOpen(false);
  };

  // Auth Operations
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const allowedEmail = import.meta.env.VITE_ALLOWED_ADMIN_EMAIL;
    if (allowedEmail && email.toLowerCase() !== allowedEmail.toLowerCase()) {
      setAuthError('Acceso denegado: Correo no autorizado.');
      setAuthLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showToast('Sesión iniciada con éxito');
    } catch (err: any) {
      setAuthError('Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast('Sesión cerrada');
  };

  // Dish Operations (Admin Panel)
  const openDishModal = (dish: any = null) => {
    if (dish) {
      setEditingDish(dish);
      setDishForm({
        nombre: dish.nombre,
        descripcion: dish.descripcion || '',
        categoria: dish.categoria,
        imagen_url: dish.imagen_url || '',
        tag: dish.tag || '',
        rating: dish.rating || '4.8',
        reviews: dish.reviews || 0,
        prep_time: dish.prep_time || '15-20 min',
        popular: dish.popular || false,
        spicy: dish.spicy || false,
        visible: dish.visible !== false,
        porciones: Array.isArray(dish.porciones) ? [...dish.porciones] : []
      });
      setImageSelectorTab(dish.imagen_url && (dish.imagen_url.startsWith('data:') || dish.imagen_url.startsWith('http')) ? 'url' : 'url');
    } else {
      setEditingDish(null);
      setDishForm({
        nombre: '',
        descripcion: '',
        categoria: 'arroces',
        imagen_url: '',
        tag: '',
        rating: '4.8',
        reviews: 0,
        prep_time: '15-20 min',
        popular: false,
        spicy: false,
        visible: true,
        porciones: [{ label: 'Personal', priceNum: 15000, priceStr: '$15.000' }]
      });
      setImageSelectorTab('url');
    }
    setIsDishModalOpen(true);
  };

  const handleDishFormSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.nombre.trim()) return alert('El nombre es requerido');
    if (dishForm.porciones.length === 0) return alert('Debes agregar al menos una porción con su precio');

    // Generate formatted portion prices
    const portionsPayload = dishForm.porciones.map((p: any) => ({
      label: p.label.trim(),
      priceNum: Number(p.priceNum) || 0,
      priceStr: formatCOP(Number(p.priceNum) || 0)
    }));

    const payload = {
      nombre: dishForm.nombre.trim(),
      descripcion: dishForm.descripcion.trim(),
      categoria: dishForm.categoria,
      imagen_url: dishForm.imagen_url.trim(),
      tag: dishForm.tag.trim(),
      rating: dishForm.rating,
      reviews: Number(dishForm.reviews) || 0,
      prep_time: dishForm.prep_time.trim(),
      popular: dishForm.popular,
      spicy: dishForm.spicy,
      visible: dishForm.visible,
      porciones: portionsPayload
    };

    try {
      if (editingDish) {
        const { error } = await supabase
          .from('platos')
          .update(payload)
          .eq('id', editingDish.id);
        if (error) throw error;
        showToast('Plato actualizado');
      } else {
        const idSlug = dishForm.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
        const { error } = await supabase
          .from('platos')
          .insert({
            id: idSlug,
            orden: platos.length + 1,
            ...payload
          });
        if (error) throw error;
        showToast('Plato agregado');
      }
      setIsDishModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert('Error al guardar plato: ' + err.message);
    }
  };

  const handleDeleteDish = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este plato?')) return;
    try {
      const { error } = await supabase
        .from('platos')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showToast('Plato eliminado');
      fetchData();
    } catch (err: any) {
      alert('Error al eliminar plato: ' + err.message);
    }
  };

  const handleToggleVisibility = async (dish: any) => {
    try {
      const { error } = await supabase
        .from('platos')
        .update({ visible: !dish.visible })
        .eq('id', dish.id);
      if (error) throw error;
      showToast(dish.visible ? 'Plato ocultado en el menú' : 'Plato visible en el menú');
      fetchData();
    } catch (err: any) {
      alert('Error al modificar visibilidad: ' + err.message);
    }
  };

  // Convert files to base64 URLs
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 1.2 * 1024 * 1024) {
      alert('La imagen es demasiado grande. El límite recomendado es 1.2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDishForm((prev: any) => ({
        ...prev,
        imagen_url: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  // Configuration updates
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('configuracion')
        .upsert({
          id: 1,
          whatsapp: configuracion.whatsapp.trim(),
          horario: configuracion.horario.trim(),
          direccion: configuracion.direccion.trim(),
          direccion_maps: configuracion.direccion_maps.trim(),
          instagram: (configuracion.instagram || '').trim(),
          facebook: (configuracion.facebook || '').trim()
        });
      if (error) throw error;
      showToast('Configuración actualizada');
      fetchData();
    } catch (err: any) {
      alert('Error al guardar configuración: ' + err.message);
    }
  };

  // Portion list logic inside dish editor
  const handleAddPortionRow = () => {
    setDishForm((prev: any) => ({
      ...prev,
      porciones: [...prev.porciones, { label: '', priceNum: 0 }]
    }));
  };

  const handleUpdatePortionRow = (idx: number, field: string, val: any) => {
    setDishForm((prev: any) => {
      const updated = [...prev.porciones];
      updated[idx] = {
        ...updated[idx],
        [field]: val
      };
      return {
        ...prev,
        porciones: updated
      };
    });
  };

  const handleRemovePortionRow = (idx: number) => {
    setDishForm((prev: any) => ({
      ...prev,
      porciones: prev.porciones.filter((_: any, i: number) => i !== idx)
    }));
  };

  // Process and sort categories list
  const categoriesList: Category[] = platos.length > 0 ? [
    {
      id: 'arroces',
      name: 'Arroces',
      hanzi: '饭',
      items: platos.filter(p => p.categoria === 'arroces').map(mapDbItemToMenuItem)
    },
    {
      id: 'combos',
      name: 'Platos & Combos',
      hanzi: '套',
      items: platos.filter(p => p.categoria === 'combos').map(mapDbItemToMenuItem)
    },
    {
      id: 'extras',
      name: 'Adiciones',
      hanzi: '加',
      items: platos.filter(p => p.categoria === 'extras').map(mapDbItemToMenuItem)
    }
  ] : MENU_DATA;

  // Filter items for user visibility
  const displayMenuData: Category[] = categoriesList.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      const dbPlato = platos.find(p => p.id === item.id);
      return dbPlato ? dbPlato.visible !== false : true;
    })
  }));

  // Render Tracking View
  if (trackingToken) {
    return <TrackingView token={trackingToken} />;
  }

  // Render Admin Console Interface
  if (isAdminActive) {
    if (!session) {
      // Login Panel
      return (
        <div className="admin-auth-container">
          <div className="cloud-pattern"></div>
          <div className="auth-card">
            <div className="auth-header">
              <div className="seal" style={{ position: 'relative', top: '0', right: '0', margin: '0 auto 15px' }}><span>李</span></div>
              <h2>Casa Lamad</h2>
              <p>Consola de Administrador</p>
            </div>

            {authError && (
              <div style={{ background: 'rgba(139,0,0,0.4)', border: '1px solid #ff6b6b', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#fff', marginBottom: '15px', textAlign: 'center' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleSignIn}>
              <div className="admin-form-group">
                <label htmlFor="authEmail">Correo Electrónico</label>
                <input
                  id="authEmail"
                  type="email"
                  className="admin-input-field"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="authPassword">Contraseña</label>
                <input
                  id="authPassword"
                  type="password"
                  className="admin-input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                {authLoading ? 'Procesando...' : 'Iniciar Sesión'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <a href="#" className="admin-link" style={{ fontSize: '11px' }}>Volver al Menú Principal</a>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Authenticated Admin Dashboard Panel
    return (
      <div className="admin-dashboard-container">
        {/* Admin Navigation Bar */}
        <header className="admin-navbar">
          <div className="admin-brand">
            <div className="seal" style={{ position: 'relative', top: '0', right: '0', width: '36px', height: '36px' }}><span>李</span></div>
            <div className="admin-brand-text">
              <h2>Casa Lamad</h2>
              <span>Panel de Control</span>
            </div>
          </div>

          <div className="admin-nav-tabs">
            <button
              className={`admin-tab-btn ${adminActiveTab === 'platos' ? 'active' : ''}`}
              onClick={() => setAdminActiveTab('platos')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              Platos
            </button>
            <button
              className={`admin-tab-btn ${adminActiveTab === 'configuracion' ? 'active' : ''}`}
              onClick={() => setAdminActiveTab('configuracion')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.1a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Redes & Datos
            </button>
            <a href="#" className="admin-tab-btn" style={{ textDecoration: 'none' }}>
              Ver Menú
            </a>
            <button className="admin-logout-btn" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </header>

        {/* Dashboard Sections */}
        <main className="admin-content">
          {adminActiveTab === 'platos' ? (
            <section>
              <div className="admin-section-header">
                <h3>Gestión de Platos</h3>
                <button className="admin-btn primary" onClick={() => openDishModal()}>
                  + Agregar Plato
                </button>
              </div>

              {loading ? (
                <div className="admin-loading-spinner">
                  <div className="admin-spinner"></div>
                  Cargando platos desde Supabase...
                </div>
              ) : platos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(250,243,224,0.4)', border: '1px dashed rgba(201,162,39,0.3)', borderRadius: '12px' }}>
                  Aún no hay platos en la base de datos de Supabase. ¡Crea uno nuevo!
                </div>
              ) : (
                <div className="admin-dishes-grid">
                  {platos.map((dish) => {
                    const mapped = mapDbItemToMenuItem(dish);
                    const imageSrc = mapped.image.startsWith('data:') || mapped.image.startsWith('http') ? mapped.image : `/${mapped.image}`;
                    return (
                      <div key={dish.id} className={`admin-dish-card ${dish.visible === false ? 'hidden-dish' : ''}`}>
                        <img src={imageSrc} alt={dish.nombre} className="admin-dish-img" />
                        <div className="admin-dish-details">
                          <div className="admin-dish-info">
                            <h4>{dish.nombre}</h4>
                            <p>{dish.descripcion || 'Sin descripción.'}</p>
                            <div className="admin-dish-badges">
                              <span className="admin-badge cat">{dish.categoria}</span>
                              {dish.tag && <span className="admin-badge tag">{dish.tag}</span>}
                              {dish.visible === false && <span className="admin-badge status-hidden">Oculto</span>}
                              {dish.spicy && <span className="admin-badge spicy">🌶️ Picante</span>}
                              {dish.popular && <span className="admin-badge popular">🔥 Popular</span>}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--gold-pale)', fontWeight: '600' }}>
                              {mapped.portions.map(p => `${p.label}: ${p.priceStr}`).join(' | ')}
                            </div>
                          </div>

                          <div className="admin-dish-actions">
                            <button
                              className={`admin-mini-btn toggle ${dish.visible !== false ? 'visible-on' : 'visible-off'}`}
                              onClick={() => handleToggleVisibility(dish)}
                              title={dish.visible !== false ? 'Ocultar del menú público' : 'Mostrar en menú público'}
                            >
                              {dish.visible !== false ? '👁️ Visible' : '👁️‍🗨️ Oculto'}
                            </button>
                            <button className="admin-mini-btn edit" onClick={() => openDishModal(dish)}>
                              ✏️ Editar
                            </button>
                            <button className="admin-mini-btn delete" onClick={() => handleDeleteDish(dish.id)}>
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            <section>
              <div className="admin-section-header">
                <h3>Redes Sociales & Datos del Local</h3>
              </div>

              <div className="admin-settings-card">
                <form onSubmit={handleSaveConfig}>
                  <div className="admin-settings-row">
                    <div className="admin-form-group">
                      <label htmlFor="cfgWhatsapp">Número de WhatsApp (con código de país sin +)</label>
                      <input
                        id="cfgWhatsapp"
                        type="text"
                        className="admin-input-field"
                        value={configuracion.whatsapp}
                        onChange={(e) => setConfiguracion({ ...configuracion, whatsapp: e.target.value })}
                        required
                        placeholder="Ej: 573217140547"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label htmlFor="cfgHorario">Horario Comercial</label>
                      <input
                        id="cfgHorario"
                        type="text"
                        className="admin-input-field"
                        value={configuracion.horario}
                        onChange={(e) => setConfiguracion({ ...configuracion, horario: e.target.value })}
                        required
                        placeholder="Ej: 11 am – 10 pm · Lun a Dom"
                      />
                    </div>
                  </div>

                  <div className="admin-settings-row">
                    <div className="admin-form-group">
                      <label htmlFor="cfgDireccion">Dirección Física</label>
                      <input
                        id="cfgDireccion"
                        type="text"
                        className="admin-input-field"
                        value={configuracion.direccion}
                        onChange={(e) => setConfiguracion({ ...configuracion, direccion: e.target.value })}
                        required
                        placeholder="Ej: Cra 24e #14-08 · Sector 25 Manzanares"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label htmlFor="cfgDireccionMaps">Enlace de Google Maps</label>
                      <input
                        id="cfgDireccionMaps"
                        type="url"
                        className="admin-input-field"
                        value={configuracion.direccion_maps}
                        onChange={(e) => setConfiguracion({ ...configuracion, direccion_maps: e.target.value })}
                        required
                        placeholder="https://maps.app.goo.gl/..."
                      />
                    </div>
                  </div>

                  <div className="admin-settings-row">
                    <div className="admin-form-group">
                      <label htmlFor="cfgInstagram">Enlace Instagram (Opcional)</label>
                      <input
                        id="cfgInstagram"
                        type="text"
                        className="admin-input-field"
                        value={configuracion.instagram || ''}
                        onChange={(e) => setConfiguracion({ ...configuracion, instagram: e.target.value })}
                        placeholder="Ej: @casalamad.wok o URL completa"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label htmlFor="cfgFacebook">Enlace Facebook (Opcional)</label>
                      <input
                        id="cfgFacebook"
                        type="text"
                        className="admin-input-field"
                        value={configuracion.facebook || ''}
                        onChange={(e) => setConfiguracion({ ...configuracion, facebook: e.target.value })}
                        placeholder="Ej: URL de la página de Facebook"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', borderTop: '1px solid rgba(201, 162, 39, 0.2)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="admin-btn primary">
                      💾 Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}
        </main>

        {/* Modal: Add or Edit Dish Form */}
        {isDishModalOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h4>{editingDish ? 'Editar Plato' : 'Nuevo Plato'}</h4>
                <button className="admin-modal-close" onClick={() => setIsDishModalOpen(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="12"></line>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleDishFormSave}>
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <label htmlFor="dishName">Nombre del Plato *</label>
                    <input
                      id="dishName"
                      type="text"
                      className="admin-input-field"
                      value={dishForm.nombre}
                      onChange={(e) => setDishForm({ ...dishForm, nombre: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="dishDesc">Descripción *</label>
                    <textarea
                      id="dishDesc"
                      className="admin-input-field"
                      rows={3}
                      value={dishForm.descripcion}
                      onChange={(e) => setDishForm({ ...dishForm, descripcion: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="form-row-2">
                    <div className="admin-form-group">
                      <label htmlFor="dishCat">Categoría *</label>
                      <select
                        id="dishCat"
                        className="admin-input-field"
                        value={dishForm.categoria}
                        onChange={(e) => setDishForm({ ...dishForm, categoria: e.target.value })}
                        required
                      >
                        <option value="arroces">Arroces</option>
                        <option value="combos">Platos & Combos</option>
                        <option value="extras">Adiciones</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label htmlFor="dishTag">Etiqueta (Tag, ej: 招牌)</label>
                      <input
                        id="dishTag"
                        type="text"
                        className="admin-input-field"
                        value={dishForm.tag}
                        onChange={(e) => setDishForm({ ...dishForm, tag: e.target.value })}
                        placeholder="Ej: 招牌 o Recomendado"
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="admin-form-group">
                      <label htmlFor="dishRating">Calificación (Rating)</label>
                      <input
                        id="dishRating"
                        type="text"
                        className="admin-input-field"
                        value={dishForm.rating}
                        onChange={(e) => setDishForm({ ...dishForm, rating: e.target.value })}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label htmlFor="dishReviews">Número de Calificaciones</label>
                      <input
                        id="dishReviews"
                        type="number"
                        className="admin-input-field"
                        value={dishForm.reviews}
                        onChange={(e) => setDishForm({ ...dishForm, reviews: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="dishPrep">Tiempo de preparación</label>
                    <input
                      id="dishPrep"
                      type="text"
                      className="admin-input-field"
                      value={dishForm.prep_time}
                      onChange={(e) => setDishForm({ ...dishForm, prep_time: e.target.value })}
                      placeholder="Ej: 15-20 min"
                    />
                  </div>

                  {/* Portions pricing editor */}
                  <div className="portions-editor">
                    <h5>Porciones y Precios</h5>
                    <div className="portions-editor-list">
                      {dishForm.porciones.map((port: any, idx: number) => (
                        <div key={idx} className="portion-editor-row">
                          <input
                            type="text"
                            className="admin-input-field"
                            placeholder="Ej: Personal, 2 Pers..."
                            value={port.label}
                            onChange={(e) => handleUpdatePortionRow(idx, 'label', e.target.value)}
                            required
                          />
                          <input
                            type="number"
                            className="admin-input-field price-input"
                            placeholder="Precio (COP)"
                            value={port.priceNum || ''}
                            onChange={(e) => handleUpdatePortionRow(idx, 'priceNum', parseInt(e.target.value) || 0)}
                            required
                          />
                          <button
                            type="button"
                            className="admin-del-port-btn"
                            onClick={() => handleRemovePortionRow(idx)}
                            title="Eliminar porción"
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="admin-add-port-btn"
                      onClick={handleAddPortionRow}
                    >
                      ➕ Agregar Porción
                    </button>
                  </div>

                  {/* Image Selector / Uploader */}
                  <div className="admin-form-group">
                    <label>Imagen del Plato</label>
                    <div className="image-selector-tabs">
                      <button
                        type="button"
                        className={`img-selector-tab ${imageSelectorTab === 'url' ? 'active' : ''}`}
                        onClick={() => setImageSelectorTab('url')}
                      >
                        Enlace / URL Externa
                      </button>
                      <button
                        type="button"
                        className={`img-selector-tab ${imageSelectorTab === 'file' ? 'active' : ''}`}
                        onClick={() => setImageSelectorTab('file')}
                      >
                        Subir Archivo Local
                      </button>
                    </div>

                    {imageSelectorTab === 'url' ? (
                      <input
                        type="text"
                        className="admin-input-field"
                        placeholder="Ej: https://images.unsplash.com/... o img_2.jpg"
                        value={dishForm.imagen_url}
                        onChange={(e) => setDishForm({ ...dishForm, imagen_url: e.target.value })}
                      />
                    ) : (
                      <div className="image-upload-area">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                        />
                        <div className="upload-placeholder-text">
                          Arrastra o <b>haz clic aquí</b> para seleccionar tu imagen (.png, .jpg)
                        </div>
                      </div>
                    )}

                    {dishForm.imagen_url && (
                      <div className="admin-image-preview-wrap">
                        <img
                          src={dishForm.imagen_url.startsWith('data:') || dishForm.imagen_url.startsWith('http') ? dishForm.imagen_url : `/${dishForm.imagen_url}`}
                          alt="Previsualización"
                        />
                      </div>
                    )}
                  </div>

                  {/* Checkbox triggers */}
                  <div className="admin-checkbox-row">
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={dishForm.popular}
                        onChange={(e) => setDishForm({ ...dishForm, popular: e.target.checked })}
                      />
                      Destacar como Popular (🔥)
                    </label>
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={dishForm.spicy}
                        onChange={(e) => setDishForm({ ...dishForm, spicy: e.target.checked })}
                      />
                      Plato Picante (🌶️)
                    </label>
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={dishForm.visible}
                        onChange={(e) => setDishForm({ ...dishForm, visible: e.target.checked })}
                      />
                      Visible en el menú público (👁️)
                    </label>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn secondary" onClick={() => setIsDishModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="admin-btn primary">
                    {editingDish ? 'Actualizar' : 'Agregar Plato'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PUBLIC CUSTOMER INTERFACE
  return (
    <>
      {/* HERO */}
      <header className="hero">
        <div className="cloud-pattern"></div>

        <div className="hero-corner tl">
          <svg viewBox="0 0 54 54" fill="none" stroke="#C9A227" strokeWidth="1.4">
            <path d="M4 4 L4 20 M4 4 L20 4" />
            <path d="M4 14c5 0 9 4 9 9M13 4c0 5 4 9 9 9" strokeLinecap="round" />
          </svg>
        </div>
        <div className="hero-corner tr">
          <svg viewBox="0 0 54 54" fill="none" stroke="#C9A227" strokeWidth="1.4">
            <path d="M4 4 L4 20 M4 4 L20 4" />
            <path d="M4 14c5 0 9 4 9 9M13 4c0 5 4 9 9 9" strokeLinecap="round" />
          </svg>
        </div>

        <div className="seal"><span>李</span></div>

        <div className="logo-badge">
          <img src="/img_1.png" alt="Casa Lamad — Arroz al Wok" />
        </div>

        <div className="hero-brush">美味中餐</div>
        <h1>Menú Digital</h1>

        <div className="hero-info">
          <span className="info-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            <b>{configuracion.horario.split(' · ')[0] || '11 am – 10 pm'}</b> · {configuracion.horario.split(' · ')[1] || 'Lun a Dom'}
          </span>
          <a className="info-item info-btn" href={configuracion.direccion_maps} target="_blank" rel="noopener" aria-label="Abrir ubicación en Google Maps">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <b>{configuracion.direccion.split(' · ')[0] || 'Cra 24e #14-08'}</b> · {configuracion.direccion.split(' · ')[1] || 'Sector 25 Manzanares'}
          </a>
          <a className="info-item info-btn" href={`https://wa.me/${configuracion.whatsapp}`} target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.6 6.32A8.86 8.86 0 0012 4a8.94 8.94 0 00-7.74 13.4L3 21l3.7-1.23A8.93 8.93 0 0012 21a8.94 8.94 0 008.94-8.94 8.86 8.86 0 00-3.34-5.74zM12 19.4a7.4 7.4 0 01-3.77-1.03l-.27-.16-2.8.93.94-2.73-.18-.28A7.41 7.41 0 0117.9 9.5 7.4 7.4 0 0112 19.4zm4.05-5.54c-.22-.11-1.31-.65-1.51-.72-.2-.07-.35-.11-.5.11-.15.22-.57.72-.7.87-.13.15-.26.16-.48.05-.22-.11-1.27-.47-2.07-1.31-.62-.65-1.07-1.4-1.21-1.65-.13-.22 0-.34.12-.45.11-.1.25-.27.37-.41.12-.13.16-.22.25-.37.08-.15.04-.28-.02-.39-.06-.11-.5-1.2-.69-1.65-.18-.43-.36-.37-.5-.38-.13 0-.28 0-.42 0-.15 0-.39.06-.59.28-.21.22-.79.77-.79 1.87 0 1.1.81 2.16.92 2.31.11.15 1.56 2.38 3.79 3.24 1.81.7 2.18.6 2.58.56.4-.04 1.31-.53 1.49-1.05.18-.51.18-.94.13-1.04-.05-.1-.18-.16-.4-.26z" />
            </svg>
            <b>{configuracion.whatsapp.replace(/^57/, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}</b>
          </a>
        </div>

        <div className="meander-border"></div>
      </header>

      {/* FILTER NAVBAR */}
      <nav className="section-tabs" aria-label="Categorías del menú">
        <button
          className={`tab-btn ${activeCategory === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveCategory('todos')}
        >
          <span className="tab-hanzi">全</span> Todos
        </button>
        <button
          className={`tab-btn ${activeCategory === 'arroces' ? 'active' : ''}`}
          onClick={() => setActiveCategory('arroces')}
        >
          <span className="tab-hanzi">饭</span> Arroces
        </button>
        <button
          className={`tab-btn ${activeCategory === 'combos' ? 'active' : ''}`}
          onClick={() => setActiveCategory('combos')}
        >
          <span className="tab-hanzi">套</span> Platos
        </button>
        <button
          className={`tab-btn ${activeCategory === 'extras' ? 'active' : ''}`}
          onClick={() => setActiveCategory('extras')}
        >
          <span className="tab-hanzi">加</span> Adiciones
        </button>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="menu-container">
        {loading && platos.length === 0 ? (
          <div className="skeleton-loading">
            <div className="skeleton-item"></div>
            <div className="skeleton-item"></div>
            <div className="skeleton-item"></div>
          </div>
        ) : (
          displayMenuData.map((category) => {
            const isVisible = activeCategory === 'todos' || activeCategory === category.id;
            if (!isVisible) return null;

            return (
              <section key={category.id} className="menu-section" id={category.id}>
                <div className="section-header">
                  <span className="hanzi">{category.hanzi}</span>
                  <h2>{category.name}</h2>
                  <div className="section-line"></div>
                </div>
                <div className="cards-grid">
                  {category.items.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'rgba(250,243,224,0.4)' }}>
                      No hay platos visibles en esta categoría.
                    </div>
                  ) : (
                    category.items.map((item) => {
                      const imageSrc = item.image.startsWith('data:') || item.image.startsWith('http') ? item.image : `/${item.image}`;
                      return (
                        <div key={item.id} className="menu-card">
                          <div className="card-img-wrap has-photo">
                            {item.tag && <span className="card-tag">{item.tag}</span>}
                            <img src={imageSrc} alt={item.name} loading="lazy" />
                          </div>
                          <div className="card-body">
                            <div className="card-title">{item.name}</div>
                            <div className="card-desc">{item.description}</div>
                            
                            {/* Card Details (Prep Time, Rating, Badges) */}
                            <div className="card-meta-row">
                              {item.rating && (
                                <div className="card-meta-item rating" title="Calificación promedio">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                  <span>{item.rating} {item.reviews ? `(${item.reviews})` : ''}</span>
                                </div>
                              )}
                              {item.prepTime && (
                                <div className="card-meta-item prep-time" title="Tiempo de preparación">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  <span>{item.prepTime}</span>
                                </div>
                              )}
                              {item.spicy && (
                                <div className="card-meta-item spicy" title="Plato picante">
                                  <span>🌶️ Picante</span>
                                </div>
                              )}
                              {item.popular && (
                                <div className="card-meta-item popular" title="Plato muy solicitado">
                                  <span>🔥 Popular</span>
                                </div>
                              )}
                            </div>

                            <div className="portions-list">
                              {item.portions.map((portion, idx) => (
                                <div
                                  key={idx}
                                  className="portion-row"
                                  onClick={() => addToCart(item.name, portion.label, portion.priceStr, portion.priceNum)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      addToCart(item.name, portion.label, portion.priceStr, portion.priceNum);
                                    }
                                  }}
                                >
                                  <span className="portion-label">{portion.label}</span>
                                  <span className="portion-price">{portion.priceStr}</span>
                                  <button className="add-btn" aria-label={`Agregar ${item.name} ${portion.label} al pedido`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                      <path d="M12 5v14M5 12h14" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {category.id === 'extras' && (
                  <div className="nota-card">
                    <h3>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <path d="M12 9v4M12 17h.01" />
                      </svg>
                      Nota Importante
                    </h3>
                    <ul>
                      <li>No manejamos porciones para 4 personas</li>
                      <li>Solo productos mencionados en el menú</li>
                      <li>Salsa agridulce disponible a petición del cliente</li>
                    </ul>
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>

      {/* FOOTER */}
      <footer className="menu-footer">
        <p>© {new Date().getFullYear()} Casa Lamad. Todos los derechos reservados.</p>
        <a href="#admin" className="admin-link">Consola de Administrador</a>
      </footer>

      {/* CART FAB */}
      <button className="cart-fab" id="cartFab" onClick={() => setIsCartOpen(true)} aria-label="Abrir carrito de compras">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
        </svg>
        <span className="cart-count" id="cartCount">{cartCount}</span>
        <span id="cartTotalFab">{formatCOP(cartTotal)}</span>
      </button>

      {/* CART OVERLAY */}
      <div
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        id="cartOverlay"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* CART SIDEBAR */}
      <aside className={`cart-panel ${isCartOpen ? 'open' : ''}`} id="cartPanel">
        <div className="cart-ph">
          <div className="cart-ph-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            <h3>Tu Pedido</h3>
          </div>
          <span className="cart-ph-sub">订单</span>
          <button className="cart-close" onClick={() => setIsCartOpen(false)} aria-label="Cerrar carrito">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="cart-items" id="cartItems">
          {cart.length === 0 ? (
            <div className="cart-empty" id="cartEmpty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 21V8a2 2 0 012-2h12a2 2 0 012 2v13M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" />
                <path d="M4 12h16" />
              </svg>
              <p>Tu carrito está vacío</p>
              <span>空空如也</span>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.key} className="cart-item">
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-portion">{item.portion}</div>
                  <div className="ci-bottom-row">
                    <div className="ci-qty">
                      <button className="qty-btn" onClick={() => changeQty(item.key, -1)} aria-label="Disminuir cantidad">−</button>
                      <span className="qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => changeQty(item.key, 1)} aria-label="Aumentar cantidad">+</button>
                    </div>
                    <div className="ci-price">{formatCOP(item.priceNum * item.qty)}</div>
                  </div>
                </div>
                <button
                  className="ci-remove"
                  onClick={() => removeItem(item.key)}
                  aria-label={`Quitar ${item.name} del carrito`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* CART CHECKOUT DETAILS */}
        <div className="cart-pf">
          <div className="cart-total">
            <span>Total a Pagar</span>
            <span id="cartTotalVal">{formatCOP(cartTotal)}</span>
          </div>

          <div className="delivery-toggle-wrap">
            <button
              className={`dt-btn ${deliveryMode === 'local' ? 'active' : ''}`}
              onClick={() => setDeliveryMode('local')}
            >
              Recoger Local
            </button>
            <button
              className={`dt-btn ${deliveryMode === 'domicilio' ? 'active' : ''}`}
              onClick={() => setDeliveryMode('domicilio')}
            >
              Domicilio
            </button>
          </div>

          <div className="cart-form">
            <input
              className="form-input"
              id="fieldName"
              type="text"
              placeholder="Tu nombre *"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              className="form-input"
              id="fieldTelefono"
              type="tel"
              placeholder="Tu teléfono de contacto *"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
            <div className={`field-address ${deliveryMode === 'domicilio' ? 'visible' : ''}`} id="fieldAddressWrap">
              <input
                className="form-input"
                id="fieldDireccion"
                type="text"
                placeholder="Dirección de entrega *"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required={deliveryMode === 'domicilio'}
              />
            </div>
            <textarea
              className="form-input"
              id="fieldNota"
              rows={2}
              placeholder="Notas del pedido (ej: salsa agridulce, sin cebolla...)"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            ></textarea>
          </div>

          <button
            className="whatsapp-btn"
            id="whatsappBtn"
            onClick={handlePreConfirm}
            disabled={cart.length === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4" />
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Revisar y confirmar pedido
          </button>
          <button className="clear-btn" onClick={clearCart}>Vaciar carrito</button>
        </div>
      </aside>

      {/* TOAST SUCCESS NOTIFICATION */}
      <div className={`toast ${toast.show ? 'show' : ''}`} id="toast">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span id="toastMsg">{toast.message}</span>
      </div>

      {/* ORDER CONFIRMATION MODAL (Invoice Preview) */}
      {isConfirmOpen && (
        <div className="confirm-overlay" id="confirmOverlay" onClick={() => setIsConfirmOpen(false)}>
          <div className="confirm-modal" id="confirmModal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
            
            {/* Modal Header */}
            <div className="confirm-header">
              <div className="confirm-header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="confirm-header-text">
                <h2 id="confirmTitle">Resumen del Pedido</h2>
                <span className="confirm-hanzi">订单确认</span>
              </div>
              <button className="confirm-close" onClick={() => setIsConfirmOpen(false)} aria-label="Cerrar resumen">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Customer Info */}
            <div className="confirm-section">
              <div className="confirm-section-label">Información del cliente</div>
              <div className="confirm-info-grid">
                <div className="confirm-info-row">
                  <span className="confirm-info-icon">👤</span>
                  <span className="confirm-info-val">{nombre.trim()}</span>
                </div>
                <div className="confirm-info-row">
                  <span className="confirm-info-icon">📞</span>
                  <span className="confirm-info-val">{telefono.trim()}</span>
                </div>
                <div className="confirm-info-row">
                  <span className="confirm-info-icon">{deliveryMode === 'domicilio' ? '🛵' : '🏠'}</span>
                  <span className="confirm-info-val">
                    {deliveryMode === 'domicilio'
                      ? `Domicilio — ${direccion.trim()}`
                      : 'Recoger en local'}
                  </span>
                </div>
                {nota.trim() && (
                  <div className="confirm-info-row">
                    <span className="confirm-info-icon">📝</span>
                    <span className="confirm-info-val nota-val">{nota.trim()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="confirm-divider">
              <span>🐉</span>
            </div>

            {/* Order Items */}
            <div className="confirm-section">
              <div className="confirm-section-label">Detalle del pedido</div>
              <div className="confirm-items-list">
                {cart.map((item) => (
                  <div key={item.key} className="confirm-item-row">
                    <div className="confirm-item-left">
                      <span className="confirm-item-qty">{item.qty}×</span>
                      <div className="confirm-item-info">
                        <span className="confirm-item-name">{item.name}</span>
                        <span className="confirm-item-portion">{item.portion}</span>
                      </div>
                    </div>
                    <span className="confirm-item-price">{formatCOP(item.priceNum * item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="confirm-total-row">
              <span className="confirm-total-label">TOTAL A PAGAR</span>
              <span className="confirm-total-val">{formatCOP(cartTotal)}</span>
            </div>

            {/* Actions */}
            <div className="confirm-actions">
              <button className="confirm-edit-btn" onClick={() => setIsConfirmOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar pedido
              </button>
              <button className="confirm-send-btn" id="confirmSendBtn" onClick={sendWhatsApp}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M11.999 2C6.476 2 2 6.477 2 12.001c0 1.765.463 3.499 1.338 5.02L2 22l5.116-1.338A9.946 9.946 0 0012 21.999C17.523 22 22 17.523 22 12c0-5.522-4.477-9.999-10.001-10z" />
                </svg>
                Confirmar y enviar por WhatsApp
              </button>
            </div>

            {/* Footer note */}
            <p className="confirm-footer-note">Al confirmar, se abrirá WhatsApp con tu pedido listo para enviar.</p>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
