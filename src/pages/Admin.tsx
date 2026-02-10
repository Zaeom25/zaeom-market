import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import { Product, Category, ProductType, ProductSource, Ad, SiteSettings } from '../types';
import { compressAndUploadImage } from '../lib/imageService';
import {
    Plus, Edit2, Trash2, Check, ShieldAlert, Loader2, Save,
    Image as ImageIcon, FolderTree, Package, Upload,
    Monitor, GraduationCap, Briefcase, Zap, Globe, Cpu, Layers,
    Code, Database, Layout, MessageSquare, BarChart, Video,
    Smartphone, Cloud, ShieldCheck, Trophy, Users, Target,
    Compass, PenTool, Coffee, Music, Server, HardDrive, Terminal,
    Search, Star, Megaphone, CheckCircle2, Award, Clock, Heart, Gem, LayoutPanelLeft, CreditCard, UserCog, X
} from 'lucide-react';

const ICON_OPTIONS = [
    { name: 'Monitor', icon: Monitor },
    { name: 'GraduationCap', icon: GraduationCap },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Zap', icon: Zap },
    { name: 'Globe', icon: Globe },
    { name: 'Cpu', icon: Cpu },
    { name: 'Layers', icon: Layers },
    { name: 'Code', icon: Code },
    { name: 'Database', icon: Database },
    { name: 'Layout', icon: Layout },
    { name: 'MessageSquare', icon: MessageSquare },
    { name: 'BarChart', icon: BarChart },
    { name: 'Video', icon: Video },
    { name: 'Smartphone', icon: Smartphone },
    { name: 'Cloud', icon: Cloud },
    { name: 'ShieldCheck', icon: ShieldCheck },
    { name: 'Trophy', icon: Trophy },
    { name: 'Users', icon: Users },
    { name: 'Target', icon: Target },
    { name: 'Compass', icon: Compass },
    { name: 'PenTool', icon: PenTool },
    { name: 'Coffee', icon: Coffee },
    { name: 'Music', icon: Music },
    { name: 'Server', icon: Server },
    { name: 'HardDrive', icon: HardDrive },
    { name: 'Terminal', icon: Terminal },
];

const FEAT_ICONS = [
    { name: 'ShieldCheck', icon: ShieldCheck },
    { name: 'Zap', icon: Zap },
    { name: 'Globe', icon: Globe },
    { name: 'Star', icon: Star },
    { name: 'CheckCircle2', icon: CheckCircle2 },
    { name: 'Award', icon: Award },
    { name: 'Clock', icon: Clock },
    { name: 'Smartphone', icon: Smartphone },
    { name: 'Code', icon: Code },
    { name: 'Heart', icon: Heart },
    { name: 'Gem', icon: Gem },
];

const AD_POSITIONS = [
    { id: 0, label: 'Lateral do Topo (Hero)', icon: LayoutPanelLeft },
    { id: 1, label: 'Banner de Fluxo (Meio)', icon: CreditCard }
];

const QUILL_MODULES = {
    toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link'],
        ['clean']
    ],
};

export default function Admin() {
    const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'ads' | 'users' | 'settings'>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [ads, setAds] = useState<Ad[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userFormData, setUserFormData] = useState({
        email: '',
        full_name: '',
        role: 'seller' as 'seller' | 'admin'
    });
    const [, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [iconSearch, setIconSearch] = useState('');

    // Global Settings State
    const [settingsData, setSettingsData] = useState<SiteSettings>({
        id: 'global',
        site_name: '',
        site_description: '',
        logo_url: '',
        favicon_url: '',
        primary_color: '#00E055',
        updated_at: ''
    });

    // Auth State
    const [authData, setAuthData] = useState({ email: '', password: '' });
    const [authLoading, setAuthLoading] = useState(false);

    // Password Reset State
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    // Product Form State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productFormData, setProductFormData] = useState({
        title: '',
        description: '',
        type: 'tool' as ProductType,
        source: 'own' as ProductSource,
        cta_link: '',
        image_url: '',
        category_id: '',
        is_active: true,
        is_featured: false,
        features: [] as { icon: string; title: string; subtitle: string }[]
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    // Category Form State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        slug: '',
        icon: 'Monitor',
        parent_id: null as string | null
    });

    // Ad Form State
    const [isAdModalOpen, setIsAdModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [adFormData, setAdFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        cta_link: '',
        is_active: true,
        position: 0
    });

    // Password Recovery State
    const [isPasswordRecoveryOpen, setIsPasswordRecoveryOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (event === 'PASSWORD_RECOVERY') {
                setIsPasswordRecoveryOpen(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchData = async () => {
        if (!session) return;
        setLoading(true);

        // Fetch current user profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setUserProfile(profile);

        const [pRes, cRes, aRes, uRes, sRes] = await Promise.all([
            supabase.from('products').select('*, category:categories(*)').order('is_featured', { ascending: false }).order('created_at', { ascending: false }),
            supabase.from('categories').select('*').order('name'),
            supabase.from('ads').select('*').order('position', { ascending: true }),
            (profile?.role === 'admin' || profile?.role === 'master' || session?.user?.email === 'danilomouraoficial@gmail.com') ? supabase.from('profiles').select('*').order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
            supabase.from('site_settings').select('*').eq('id', 'global').single()
        ]);
        if (pRes.data) setProducts(pRes.data);
        if (cRes.data) setCategories(cRes.data);
        if (aRes.data) setAds(aRes.data);
        if (uRes.data) setProfiles(uRes.data);
        if (sRes.data) setSettingsData(sRes.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [session]);

    // Recursive Category Hierarchy for Selects
    const organizedCategories = useMemo(() => {
        const roots = categories.filter(c => !c.parent_id);
        const result: { id: string; name: string; isChild: boolean }[] = [];

        roots.forEach(root => {
            result.push({ id: root.id, name: root.name, isChild: false });
            const children = categories.filter(c => c.parent_id === root.id);
            children.forEach(child => {
                result.push({ id: child.id, name: `└─ ${child.name}`, isChild: true });
            });
        });

        return result;
    }, [categories]);

    const filteredIcons = useMemo(() => {
        return ICON_OPTIONS.filter(i =>
            i.name.toLowerCase().includes(iconSearch.toLowerCase())
        );
    }, [iconSearch]);

    // Product Handlers
    const handleOpenProductModal = (product: Product | null = null) => {
        if (product) {
            setEditingProduct(product);
            setProductFormData({
                title: product.title,
                description: product.description || '',
                type: product.type,
                source: product.source,
                cta_link: product.cta_link || '',
                image_url: product.image_url || '',
                category_id: product.category_id || '',
                is_active: product.is_active,
                is_featured: product.is_featured,
                features: product.features || []
            });
        } else {
            setEditingProduct(null);
            setProductFormData({
                title: '',
                description: '',
                type: 'tool',
                source: 'own',
                cta_link: '',
                image_url: '',
                category_id: organizedCategories[0]?.id || '',
                is_active: true,
                is_featured: false,
                features: []
            });
        }
        setIsProductModalOpen(true);
    };

    const addFeature = () => {
        if (productFormData.features.length >= 4) {
            alert('Máximo de 4 vantagens atingido para manter o layout ideal.');
            return;
        }
        setProductFormData(prev => ({
            ...prev,
            features: [...prev.features, { icon: 'Star', title: 'Nova Vantagem', subtitle: 'Detalhe extra' }]
        }));
    };

    const removeFeature = (idx: number) => {
        setProductFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== idx)
        }));
    };

    const updateFeature = (idx: number, field: string, value: string) => {
        setProductFormData(prev => ({
            ...prev,
            features: prev.features.map((f, i) => i === idx ? { ...f, [field]: value } : f)
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'ad' | 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSubmitting(true);
        try {
            let path = 'product-covers';
            if (type === 'ad') path = 'ads';
            else if (type === 'logo') path = 'branding';
            else if (type === 'favicon') path = 'branding';

            const url = await compressAndUploadImage(file, path);
            if (type === 'product') {
                setProductFormData(prev => ({ ...prev, image_url: url }));
            } else if (type === 'ad') {
                setAdFormData(prev => ({ ...prev, image_url: url }));
            } else if (type === 'logo') {
                setSettingsData(prev => ({ ...prev, logo_url: url }));
            } else if (type === 'favicon') {
                setSettingsData(prev => ({ ...prev, favicon_url: url }));
            }
        } catch (error) {
            alert('Falha ao processar imagem.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = { ...productFormData, category_id: productFormData.category_id || null };
            if (editingProduct) {
                await supabase.from('products').update(data).eq('id', editingProduct.id);
            } else {
                await supabase.from('products').insert([data]);
            }
            await fetchData();
            setIsProductModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Category Handlers
    const handleOpenCategoryModal = (category: Category | null = null) => {
        setIconSearch('');
        if (category) {
            setEditingCategory(category);
            setCategoryFormData({
                name: category.name,
                slug: category.slug,
                icon: category.icon || 'Monitor',
                parent_id: category.parent_id || null
            });
        } else {
            setEditingCategory(null);
            setCategoryFormData({
                name: '',
                slug: '',
                icon: 'Monitor',
                parent_id: null
            });
        }
        setIsCategoryModalOpen(true);
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const slug = categoryFormData.slug || categoryFormData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const data = { ...categoryFormData, slug };
            if (editingCategory) {
                await supabase.from('categories').update(data).eq('id', editingCategory.id);
            } else {
                await supabase.from('categories').insert([data]);
            }
            await fetchData();
            setIsCategoryModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Excluir esta categoria? Isso removerá o vínculo de todos os produtos nela.')) return;
        await supabase.from('categories').delete().eq('id', id);
        await fetchData();
    };

    // Ad Handlers
    const handleOpenAdModal = (ad: Ad | null = null) => {
        if (ad) {
            setEditingAd(ad);
            setAdFormData({
                title: ad.title,
                description: ad.description || '',
                image_url: ad.image_url || '',
                cta_link: ad.cta_link || '',
                is_active: ad.is_active,
                position: ad.position
            });
        } else {
            setEditingAd(null);
            setAdFormData({
                title: '',
                description: '',
                image_url: '',
                cta_link: '',
                is_active: true,
                position: 0
            });
        }
        setIsAdModalOpen(true);
    };

    const handleAdSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // AUTOMATIC SWAP LOGIC: If activating this ad, deactivate others ONLY in the same position
            if (adFormData.is_active) {
                let swapQuery = supabase.from('ads').update({ is_active: false }).eq('position', adFormData.position);

                // If editing, don't deactivate yourself yet (though the next update would fix it, this is cleaner)
                if (editingAd) {
                    swapQuery = swapQuery.neq('id', editingAd.id);
                }

                await swapQuery;
            }

            if (editingAd) {
                await supabase.from('ads').update(adFormData).eq('id', editingAd.id);
            } else {
                await supabase.from('ads').insert([adFormData]);
            }
            await fetchData();
            setIsAdModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/admin`
            });
            if (error) throw error;
            alert('Email de redefinição enviado! Verifique sua caixa de entrada.');
            setIsResettingPassword(false);
            setResetEmail('');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setResetLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            alert('Senha atualizada com sucesso!');
            setIsPasswordRecoveryOpen(false);
            setNewPassword('');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email: authData.email, password: authData.password });
            if (error) throw error;
        } catch (error: any) {
            alert(error.message);
        } finally {
            setAuthLoading(false);
        }
    };

    const toggleUserRole = async (userId: string, targetRole: string) => {
        if (userId === session.user.id) return alert('Você não pode alterar seu próprio cargo.');

        const isMaster = userProfile?.role === 'master';
        let newRole = '';

        if (targetRole === 'admin') {
            if (isMaster) newRole = 'seller'; // Admin can promote to seller, Master can demote admin to seller
            else return alert('Apenas o Supremo pode rebaixar Administradores.');
        }
        else if (targetRole === 'seller') {
            if (isMaster) newRole = 'admin'; // Master promotes seller to admin
            else return alert('Apenas o Supremo pode criar novos Administradores.');
        }
        else if (targetRole === 'visitor') {
            newRole = 'seller'; // Anyone (Admin/Master) can promote visitor to seller
        }
        else if (targetRole === 'none') {
            newRole = 'visitor'; // Reset
        }

        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        if (!error) fetchData();
    };

    const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
        if (!selectedProducts.length) return;
        if (action === 'delete' && !confirm(`Deseja excluir ${selectedProducts.length} itens permanentemente?`)) return;

        setIsSubmitting(true);
        try {
            if (action === 'delete') {
                await supabase.from('products').delete().in('id', selectedProducts);
            } else {
                await supabase.from('products').update({ is_active: action === 'activate' }).in('id', selectedProducts);
            }
            setSelectedProducts([]);
            fetchData();
        } catch (err) {
            console.error('Bulk action error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (userProfile?.role !== 'master') {
            alert('Apenas o Master pode alterar as configurações globais.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .update({
                    site_name: settingsData.site_name,
                    site_description: settingsData.site_description,
                    logo_url: settingsData.logo_url,
                    favicon_url: settingsData.favicon_url,
                    primary_color: settingsData.primary_color,
                    updated_at: new Date().toISOString()
                })
                .eq('id', 'global');

            if (error) throw error;
            alert('Configurações atualizadas com sucesso!');
            window.location.reload(); // Reload to apply color/favicon changes
        } catch (err) {
            console.error('Settings error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: userFormData
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            alert('Convite enviado com sucesso para ' + userFormData.email);
            setIsUserModalOpen(false);
            setUserFormData({ email: '', full_name: '', role: 'seller' });
            fetchData();
        } catch (error: any) {
            alert('Falha ao convidar: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!session) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
                    <div className="w-full max-w-md glass-card p-10 rounded-[2.5rem] space-y-8">
                        <div className="space-y-2">
                            <div className="bg-zaeom-neon/10 w-16 h-16 rounded-full flex items-center justify-center text-zaeom-neon mx-auto mb-4 border border-zaeom-neon/20">
                                <ShieldAlert size={32} />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Admin <span className="neon-text">Access</span></h2>
                            <p className="text-zaeom-gray text-sm">Identifique-se para acessar o painel.</p>
                        </div>
                        {isResettingPassword ? (
                            <form onSubmit={handlePasswordReset} className="space-y-4 text-left">
                                <input required type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="Seu e-mail de acesso" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white" />
                                <button disabled={resetLoading} className="w-full bg-zaeom-neon text-black font-bold py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(0,224,85,0.4)] flex items-center justify-center transition-all cursor-pointer">
                                    {resetLoading ? <Loader2 className="animate-spin" size={20} /> : 'ENVIAR LINK DE RECUPERAÇÃO'}
                                </button>
                                <button type="button" onClick={() => setIsResettingPassword(false)} className="w-full text-zaeom-gray text-sm hover:text-white transition-colors cursor-pointer">Voltar para o login</button>
                            </form>
                        ) : (
                            <form onSubmit={handleAuth} className="space-y-4 text-left">
                                <input required type="email" value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })} placeholder="E-mail" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white" />
                                <input required type="password" value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })} placeholder="Senha" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white" />
                                <button disabled={authLoading} className="w-full bg-zaeom-neon text-black font-bold py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(0,224,85,0.4)] flex items-center justify-center transition-all cursor-pointer">
                                    {authLoading ? <Loader2 className="animate-spin" size={20} /> : 'DESTRAVAR ACESSO'}
                                </button>
                                <button type="button" onClick={() => setIsResettingPassword(true)} className="w-full text-zaeom-gray text-sm hover:text-white transition-colors mt-2 cursor-pointer">Esqueci minha senha</button>
                            </form>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-7xl mx-auto pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight uppercase">Painel <span className="neon-text">Control</span></h2>
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 w-full md:w-fit overflow-x-auto no-scrollbar whitespace-nowrap">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 shrink-0 ${activeTab === 'products' ? 'bg-zaeom-neon text-black' : 'text-zaeom-gray hover:text-white'}`}
                            >
                                <Package size={18} />
                                <span>PRODUTOS</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('categories')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 shrink-0 ${activeTab === 'categories' ? 'bg-zaeom-neon text-black' : 'text-zaeom-gray hover:text-white'}`}
                            >
                                <FolderTree size={18} />
                                <span>CATEGORIAS</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('ads')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 shrink-0 ${activeTab === 'ads' ? 'bg-zaeom-neon text-black' : 'text-zaeom-gray hover:text-white'}`}
                            >
                                <Megaphone size={18} />
                                <span>ANÚNCIOS</span>
                            </button>
                            {(userProfile?.role === 'admin' || userProfile?.role === 'master' || session?.user?.email === 'danilomouraoficial@gmail.com') && (
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 shrink-0 ${activeTab === 'users' ? 'bg-zaeom-neon text-black' : 'text-zaeom-gray hover:text-white'}`}
                                >
                                    <UserCog size={18} />
                                    <span>USUÁRIOS</span>
                                </button>
                            )}
                            {userProfile?.role === 'master' && (
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 shrink-0 ${activeTab === 'settings' ? 'bg-zaeom-neon text-black' : 'text-zaeom-gray hover:text-white'}`}
                                >
                                    <Zap size={18} />
                                    <span>SETTINGS</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bulk Actions Floating Bar */}
                    <AnimatePresence>
                        {selectedProducts.length > 0 && (
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 100, opacity: 0 }}
                                className="fixed bottom-24 md:bottom-10 left-1/2 md:left-[55%] -translate-x-1/2 z-[110] bg-black/95 backdrop-blur-2xl border border-zaeom-neon/20 px-6 md:px-8 py-3 md:py-4 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center space-x-4 md:space-x-8 w-[90%] md:w-auto overflow-hidden"
                            >
                                <div className="flex flex-col shrink-0">
                                    <span className="text-[9px] md:text-[10px] font-black text-zaeom-neon uppercase tracking-widest leading-none">{selectedProducts.length} Selecionados</span>
                                    <span className="hidden md:block text-[8px] text-zaeom-gray font-bold uppercase tracking-widest opacity-60">Operação em Massa</span>
                                </div>
                                <div className="h-8 w-px bg-white/10 shrink-0" />
                                <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto no-scrollbar">
                                    <button onClick={() => handleBulkAction('activate')} className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-zaeom-neon/10 hover:bg-zaeom-neon/20 text-zaeom-neon text-[9px] md:text-[10px] font-black uppercase border border-zaeom-neon/20 transition-all whitespace-nowrap">Ativar</button>
                                    <button onClick={() => handleBulkAction('deactivate')} className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[9px] md:text-[10px] font-black uppercase border border-white/10 transition-all whitespace-nowrap">Bloquear</button>
                                    <button onClick={() => handleBulkAction('delete')} className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] md:text-[10px] font-black uppercase border border-red-500/20 transition-all whitespace-nowrap">Deletar</button>
                                </div>
                                <button onClick={() => setSelectedProducts([])} className="ml-auto text-zaeom-gray hover:text-white transition-all shrink-0">
                                    <X size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {activeTab === 'users' ? (
                        <button
                            onClick={() => setIsUserModalOpen(true)}
                            className="flex items-center space-x-2 bg-zaeom-neon text-black font-bold px-6 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,224,85,0.4)] transition-all"
                        >
                            <Plus size={20} />
                            <span>CONVIDAR USUÁRIO</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                if (activeTab === 'products') handleOpenProductModal();
                                else if (activeTab === 'categories') handleOpenCategoryModal();
                                else if (activeTab === 'ads') handleOpenAdModal();
                            }}
                            className="flex items-center space-x-2 bg-zaeom-neon text-black font-bold px-6 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,224,85,0.4)] transition-all"
                        >
                            <Plus size={20} />
                            <span>NOVO {activeTab === 'products' ? 'PRODUTO' : activeTab === 'categories' ? 'GESTAO' : 'ANÚNCIO'}</span>
                        </button>
                    )}
                </div>

                {activeTab === 'products' ? (
                    <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-[#0A0A0A] text-zaeom-gray text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-5 w-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.length === products.length && products.length > 0}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedProducts(products.map(p => p.id));
                                                    else setSelectedProducts([]);
                                                }}
                                                className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-zaeom-neon"
                                            />
                                        </th>
                                        <th className="px-6 py-5 font-black">Identificação do Ativo</th>
                                        <th className="px-6 py-5 font-black">Elite Series</th>
                                        <th className="px-6 py-5 font-black">Sincronização</th>
                                        <th className="px-6 py-5 font-black text-right">Controles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {products.map(p => (
                                        <tr key={p.id} className={`hover:bg-white/[0.02] transition-colors group ${selectedProducts.includes(p.id) ? 'bg-zaeom-neon/[0.03]' : ''}`}>
                                            <td className="px-6 py-5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(p.id)}
                                                    onChange={() => {
                                                        setSelectedProducts(prev =>
                                                            prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                                                        );
                                                    }}
                                                    className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-zaeom-neon"
                                                />
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center space-x-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-[#0F0F0F] overflow-hidden border border-white/10 shrink-0 shadow-2xl group-hover:border-zaeom-neon/30 transition-all">
                                                        {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10"><ImageIcon size={22} /></div>}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-white text-sm uppercase tracking-tight leading-tight">{p.title}</div>
                                                        <div className="text-[10px] text-zaeom-gray font-bold uppercase tracking-widest mt-1 opacity-60">{p.category?.name || 'Sistema Base'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {p.is_featured ? (
                                                    <div className="flex items-center text-zaeom-neon text-[10px] font-black uppercase tracking-widest">
                                                        <Star size={14} className="mr-2 fill-zaeom-neon" /> ELITE
                                                    </div>
                                                ) : (
                                                    <span className="text-zaeom-gray text-[10px] font-black opacity-30 tracking-widest uppercase">Padrão</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-xs font-mono">
                                                <span className={`px-3 py-1.5 rounded-lg border font-black uppercase tracking-widest text-[9px] ${p.is_active ? 'text-zaeom-neon border-zaeom-neon/20 bg-zaeom-neon/5' : 'text-zaeom-gray border-white/10 bg-white/5'}`}>
                                                    {p.is_active ? 'Sync Ativa' : 'Desconectado'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={() => handleOpenProductModal(p)} className="p-3 bg-white/[0.03] hover:bg-zaeom-neon hover:text-black border border-white/5 rounded-xl transition-all"><Edit2 size={16} /></button>
                                                    {userProfile?.role === 'master' && (
                                                        <button onClick={() => supabase.from('products').delete().eq('id', p.id).then(() => fetchData())} className="p-3 bg-white/[0.03] hover:bg-red-500/20 text-zaeom-gray hover:text-red-400 border border-white/5 rounded-xl transition-all"><Trash2 size={16} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'categories' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...categories].sort((a, b) => (a.parent_id === b.id ? 1 : -1)).map(cat => {
                            const IconComp = ICON_OPTIONS.find(i => i.name === cat.icon)?.icon || Monitor;
                            const parent = categories.find(c => c.id === cat.parent_id);
                            return (
                                <motion.div key={cat.id} layout className="glass-card p-6 rounded-2xl flex items-center justify-between group h-24">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-zaeom-neon group-hover:bg-zaeom-neon/10 transition-all">
                                            <IconComp size={24} />
                                        </div>
                                        <div>
                                            <div className="font-bold">{cat.name}</div>
                                            <div className="text-[10px] text-zaeom-gray uppercase tracking-widest flex items-center">
                                                {parent ? (
                                                    <><FolderTree size={10} className="mr-1" /> {parent.name}</>
                                                ) : (
                                                    'Categoria Raiz'
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleOpenCategoryModal(cat)} className="p-2 hover:bg-white/10 rounded-lg transition-all"><Edit2 size={14} /></button>
                                        {userProfile?.role === 'master' && (
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 hover:bg-red-500/10 text-zaeom-gray hover:text-red-400 rounded-lg transition-all"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : activeTab === 'ads' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ads.map(ad => (
                            <motion.div key={ad.id} layout className="glass-card p-4 rounded-3xl flex flex-col space-y-4 group border-white/5 bg-white/[0.01]">
                                <div className="aspect-[21/9] rounded-2xl bg-black/40 overflow-hidden border border-white/10 relative">
                                    {ad.image_url ? (
                                        <img src={ad.image_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/5"><Megaphone size={32} /></div>
                                    )}
                                    <div className="absolute top-3 right-3 flex space-x-2">
                                        <button onClick={() => handleOpenAdModal(ad)} className="p-2.5 bg-black/60 backdrop-blur-md hover:bg-zaeom-neon hover:text-black rounded-xl border border-white/10 transition-all shadow-xl"><Edit2 size={14} /></button>
                                        {userProfile?.role === 'master' && (
                                            <button onClick={() => supabase.from('ads').delete().eq('id', ad.id).then(() => fetchData())} className="p-2.5 bg-black/60 backdrop-blur-md hover:bg-red-500 rounded-xl border border-white/10 transition-all shadow-xl"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                </div>
                                <div className="px-2 pb-2">
                                    <div className="font-black text-white text-[11px] uppercase tracking-widest truncate">{ad.title}</div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase tracking-tighter ${ad.is_active ? 'text-zaeom-neon border-zaeom-neon/30 bg-zaeom-neon/5' : 'text-zaeom-gray border-white/10 bg-white/5'}`}>
                                            {ad.is_active ? 'Sincronizado' : 'Offline'}
                                        </span>
                                        <span className="text-[9px] text-zaeom-gray font-bold uppercase tracking-widest opacity-40">Posição {ad.position + 1}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : activeTab === 'settings' ? (
                    <div className="max-w-4xl mx-auto py-10">
                        <form onSubmit={handleSettingsSubmit} className="space-y-12">
                            <section className="space-y-6">
                                <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
                                    <Monitor size={20} className="text-zaeom-neon" />
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-white">Configuração Visual</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-zaeom-gray uppercase tracking-widest">Nome da Aplicação</label>
                                        <input
                                            type="text"
                                            value={settingsData.site_name}
                                            onChange={e => setSettingsData({ ...settingsData, site_name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:border-zaeom-neon/50 outline-none transition-all"
                                            placeholder="Ex: Zaeom Market"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-zaeom-gray uppercase tracking-widest">Accent Color (Hex)</label>
                                        <div className="flex space-x-4">
                                            <input
                                                type="color"
                                                value={settingsData.primary_color}
                                                onChange={e => setSettingsData({ ...settingsData, primary_color: e.target.value })}
                                                className="w-16 h-16 bg-transparent border-none p-0 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={settingsData.primary_color}
                                                onChange={e => setSettingsData({ ...settingsData, primary_color: e.target.value })}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zaeom-gray uppercase tracking-widest">SEO: Meta Descrição</label>
                                    <textarea
                                        value={settingsData.site_description}
                                        onChange={e => setSettingsData({ ...settingsData, site_description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 min-h-[120px] focus:border-zaeom-neon/50 outline-none transition-all"
                                        placeholder="Descrição para Google e indexadores..."
                                    />
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
                                    <Upload size={20} className="text-zaeom-neon" />
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-white">Assets Dinâmicos</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-zaeom-gray uppercase tracking-widest">Logotipo da Marca</label>
                                        <div className="flex items-center space-x-6 bg-white/5 border border-white/10 rounded-3xl p-6">
                                            <div className="h-16 flex items-center justify-center overflow-hidden shrink-0">
                                                {settingsData.logo_url ? (
                                                    <img src={settingsData.logo_url} className="h-full w-auto object-contain" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center">
                                                        <Layout size={24} className="opacity-20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <button
                                                    type="button"
                                                    onClick={() => logoInputRef.current?.click()}
                                                    className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-all text-[10px] uppercase tracking-widest"
                                                >
                                                    {settingsData.logo_url ? 'ALTERAR LOGO' : 'UPLOAD LOGO'}
                                                </button>
                                                <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                                                <p className="text-[8px] text-zaeom-gray uppercase tracking-widest font-bold opacity-40 ml-1">PNG ou SVG recomendado</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-zaeom-gray uppercase tracking-widest">Ícone do Navegador (Favicon)</label>
                                        <div className="flex items-center space-x-6 bg-white/5 border border-white/10 rounded-3xl p-6">
                                            <div className="h-16 flex items-center justify-center overflow-hidden shrink-0">
                                                {settingsData.favicon_url ? (
                                                    <img src={settingsData.favicon_url} className="h-full w-auto object-contain p-2" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center">
                                                        <Globe size={24} className="opacity-20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <button
                                                    type="button"
                                                    onClick={() => faviconInputRef.current?.click()}
                                                    className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-all text-[10px] uppercase tracking-widest"
                                                >
                                                    {settingsData.favicon_url ? 'ALTERAR ÍCONE' : 'UPLOAD ÍCONE'}
                                                </button>
                                                <input type="file" ref={faviconInputRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'favicon')} />
                                                <p className="text-[8px] text-zaeom-gray uppercase tracking-widest font-bold opacity-40 ml-1">Formato ICO ou PNG</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <button
                                disabled={isSubmitting}
                                className="w-full bg-zaeom-neon text-black font-black py-6 rounded-2xl hover:shadow-[0_0_50px_rgba(0,224,85,0.4)] disabled:opacity-50 transition-all uppercase tracking-[0.2em]"
                            >
                                {isSubmitting ? 'Aplicando Alterações...' : 'SALVAR E ATUALIZAR MARKETPLACE'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-white/[0.01]">
                        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <UserCog size={24} className="text-zaeom-neon" />
                                <h3 className="text-xl font-bold uppercase tracking-tighter">Equipe e Permissões</h3>
                            </div>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-[#0A0A0A] text-zaeom-gray text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-5">Colaborador</th>
                                        <th className="px-8 py-5">Nível de Acesso</th>
                                        <th className="px-8 py-5 text-right w-48">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {profiles.map(u => (
                                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-xl bg-zaeom-neon/10 border border-zaeom-neon/20 flex items-center justify-center text-zaeom-neon font-black shadow-inner">
                                                        {(u.full_name || u.email)[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-white text-sm uppercase tracking-tight">{u.full_name || 'Sem Nome'}</div>
                                                        <div className="text-[10px] text-zaeom-gray font-bold tracking-widest">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`text-[10px] px-3 py-1.5 rounded-lg border font-black uppercase tracking-widest ${u.role === 'master' ? 'text-zaeom-neon border-zaeom-neon/30 bg-zaeom-neon/10' :
                                                    u.role === 'admin' ? 'text-white border-white/10 bg-white/5' :
                                                        u.role === 'seller' ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' :
                                                            'text-zaeom-gray border-white/5'
                                                    }`}>
                                                    {u.role === 'master' ? 'SUPREMO' : u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() => toggleUserRole(u.id, u.role)}
                                                        className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl border transition-all ${u.role === 'admin' ? 'border-zaeom-neon/20 text-zaeom-neon hover:bg-zaeom-neon hover:text-black' :
                                                            u.role === 'seller' ? 'border-blue-400/20 text-blue-400 hover:bg-blue-400 hover:text-black' :
                                                                'border-white/10 text-zaeom-gray hover:text-white'
                                                            }`}
                                                    >
                                                        Mudar Cargo
                                                    </button>
                                                    {userProfile?.role === 'master' && u.role !== 'master' && (
                                                        <button
                                                            onClick={() => toggleUserRole(u.id, 'none')}
                                                            className="p-3 bg-red-500/10 hover:bg-red-500 text-zaeom-gray hover:text-white border border-red-500/20 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {isProductModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={window.innerWidth < 768 ? { y: '100%' } : { opacity: 0, scale: 0.95 }} animate={window.innerWidth < 768 ? { y: 0 } : { opacity: 1, scale: 1 }} exit={window.innerWidth < 768 ? { y: '100%' } : { opacity: 0, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full h-full md:h-auto md:max-w-5xl bg-zaeom-bg border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl p-6 md:p-10 overflow-y-auto custom-scrollbar">
                            <h3 className="text-2xl font-bold uppercase mb-8">{editingProduct ? 'Editar' : 'Novo'} Ativo</h3>
                            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Left Column: Media & Settings */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="aspect-video rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
                                        {productFormData.image_url ? (
                                            <>
                                                <img src={productFormData.image_url} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-black font-bold px-4 py-2 rounded-xl flex items-center space-x-2">
                                                        <Upload size={16} /> <span>Trocar Capa</span>
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center space-y-3 text-zaeom-gray hover:text-white transition-all text-center">
                                                <Upload size={40} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Upload de Capa</span>
                                            </button>
                                        )}
                                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'product')} />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Vínculo de Checkout</label>
                                            <input type="url" placeholder="https://..." value={productFormData.cta_link} onChange={e => setProductFormData({ ...productFormData, cta_link: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-zaeom-neon/40 transition-all text-xs font-mono outline-none text-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Categoria</label>
                                            <select value={productFormData.category_id} onChange={e => setProductFormData({ ...productFormData, category_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-zaeom-neon/40 transition-all font-bold outline-none text-white appearance-none cursor-pointer">
                                                {organizedCategories.map(c => (
                                                    <option key={c.id} value={c.id} className="bg-neutral-900">{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button type="button" onClick={() => setProductFormData({ ...productFormData, is_active: !productFormData.is_active })} className={`py-3.5 rounded-2xl text-[10px] font-black border transition-all ${productFormData.is_active ? 'bg-zaeom-neon/10 border-zaeom-neon/40 text-zaeom-neon' : 'bg-white/5 border-white/10 text-zaeom-gray'}`}>
                                                {productFormData.is_active ? 'ATIVO' : 'OFFLINE'}
                                            </button>
                                            <button type="button" onClick={() => setProductFormData({ ...productFormData, is_featured: !productFormData.is_featured })} className={`py-3.5 rounded-2xl text-[10px] font-black border transition-all ${productFormData.is_featured ? 'bg-zaeom-neon text-black border-zaeom-neon shadow-[0_0_15px_rgba(0,224,85,0.3)]' : 'bg-white/5 border-white/10 text-zaeom-gray'}`}>
                                                {productFormData.is_featured ? 'DESTAQUE' : 'NORMAL'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Content */}
                                <div className="lg:col-span-8 space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Título do Produto</label>
                                        <input required placeholder="Ex: Zaeom Core v4" value={productFormData.title} onChange={e => setProductFormData({ ...productFormData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-zaeom-neon/40 transition-all font-bold text-lg outline-none text-white" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Descrição Detalhada</label>
                                        <div className="rounded-[1.25rem] overflow-hidden">
                                            <ReactQuill
                                                theme="snow"
                                                value={productFormData.description}
                                                onChange={val => setProductFormData({ ...productFormData, description: val })}
                                                modules={QUILL_MODULES}
                                                placeholder="Descreva as funcionalidades..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Vantagens (Máx 4)</label>
                                            <button type="button" onClick={addFeature} className="text-[10px] text-zaeom-neon font-black hover:underline flex items-center space-x-1">
                                                <Plus size={12} /> <span>ADICIONAR</span>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {productFormData.features.map((feat, idx) => (
                                                <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 relative group">
                                                    <button type="button" onClick={() => removeFeature(idx)} className="absolute top-2 right-2 text-zaeom-gray hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                                    <div className="flex gap-2">
                                                        <select value={feat.icon} onChange={e => updateFeature(idx, 'icon', e.target.value)} className="bg-black/40 border border-white/10 rounded-lg p-2 text-zaeom-neon text-xs outline-none">
                                                            {FEAT_ICONS.map(i => <option key={i.name} value={i.name} className="bg-neutral-900">{i.name}</option>)}
                                                        </select>
                                                        <input required placeholder="Título" value={feat.title} onChange={e => updateFeature(idx, 'title', e.target.value)} className="flex-1 bg-transparent border-b border-white/10 focus:border-zaeom-neon/40 py-1 text-xs font-bold outline-none text-white" />
                                                    </div>
                                                    <input placeholder="Subtítulo" value={feat.subtitle} onChange={e => updateFeature(idx, 'subtitle', e.target.value)} className="w-full bg-transparent text-[10px] text-zaeom-gray outline-none" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <button type="submit" disabled={isSubmitting} className="col-span-2 bg-zaeom-neon text-black font-black py-5 rounded-[1.5rem] hover:shadow-[0_0_40px_rgba(0,224,85,0.4)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
                                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                            <span>{editingProduct ? 'ATUALIZAR REGISTRO' : 'LANÇAR NO MARKETPLACE'}</span>
                                        </button>
                                        <button type="button" onClick={() => setIsProductModalOpen(false)} className="col-span-2 py-4 text-zaeom-gray hover:text-white transition-all text-[10px] uppercase font-bold tracking-widest">Fechar Painel</button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Ad Modal */}
            <AnimatePresence>
                {isAdModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-zaeom-bg border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh] custom-scrollbar">
                            <h3 className="text-2xl font-bold uppercase mb-8">{editingAd ? 'Editar' : 'Novo'} Anúncio</h3>
                            <form onSubmit={handleAdSubmit} className="space-y-6">
                                <div className="aspect-[21/9] rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
                                    {adFormData.image_url ? (
                                        <>
                                            <img src={adFormData.image_url} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-black font-bold px-4 py-2 rounded-xl">Trocar Banner</button>
                                            </div>
                                        </>
                                    ) : (
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center space-y-3 text-zaeom-gray hover:text-white transition-all">
                                            <Megaphone size={40} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Upload de Banner Profissional</span>
                                        </button>
                                    )}
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'ad')} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Título da Atração</label>
                                        <input required value={adFormData.title} onChange={e => setAdFormData({ ...adFormData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-zaeom-neon/40 transition-all font-bold outline-none text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Link de Call-to-Action</label>
                                        <input type="url" placeholder="https://..." value={adFormData.cta_link} onChange={e => setAdFormData({ ...adFormData, cta_link: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-zaeom-neon/40 transition-all font-mono text-sm outline-none text-white" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Cópia Publicitária</label>
                                    <div className="rounded-[1.25rem] overflow-hidden">
                                        <ReactQuill
                                            theme="snow"
                                            value={adFormData.description}
                                            onChange={val => setAdFormData({ ...adFormData, description: val })}
                                            modules={QUILL_MODULES}
                                            placeholder="Mensagem de impacto..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Posicionamento</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {AD_POSITIONS.map(pos => (
                                                <button
                                                    key={pos.id}
                                                    type="button"
                                                    onClick={() => setAdFormData({ ...adFormData, position: pos.id })}
                                                    className={`flex items-center space-x-3 p-4 rounded-xl border transition-all ${adFormData.position === pos.id ? 'bg-zaeom-neon/10 border-zaeom-neon text-zaeom-neon shadow-[0_0_15px_rgba(0,224,85,0.05)]' : 'bg-white/5 border-white/10 text-zaeom-gray hover:text-white'}`}
                                                >
                                                    <pos.icon size={18} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{pos.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Visibilidade</label>
                                        <button type="button" onClick={() => setAdFormData({ ...adFormData, is_active: !adFormData.is_active })} className={`w-full py-10 rounded-3xl border transition-all font-black flex flex-col items-center justify-center space-y-2 ${adFormData.is_active ? 'bg-zaeom-neon text-black border-zaeom-neon shadow-[0_0_30px_rgba(0,224,85,0.4)]' : 'bg-white/5 border-white/10 text-zaeom-gray'}`}>
                                            <span className="text-lg">{adFormData.is_active ? 'ATIVO' : 'DESLIGADO'}</span>
                                            <span className="text-[8px] font-black tracking-widest opacity-60">NO MARKETPLACE</span>
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full bg-zaeom-neon text-black font-black py-5 rounded-[1.5rem] hover:shadow-[0_0_40px_rgba(0,224,85,0.4)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Megaphone size={20} />}
                                    <span>CONVENCIAR ANÚNCIO</span>
                                </button>
                                <button type="button" onClick={() => setIsAdModalOpen(false)} className="w-full py-4 text-zaeom-gray hover:text-white transition-all text-[10px] uppercase font-bold tracking-widest">Cancelar</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Category Modal */}
            <AnimatePresence>
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCategoryModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-zaeom-bg border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh] custom-scrollbar">
                            <h3 className="text-2xl font-bold uppercase mb-8">{editingCategory ? 'Editar' : 'Nova'} Categoria</h3>
                            <form onSubmit={handleCategorySubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Nome</label>
                                        <input required value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-zaeom-neon/40 transition-all font-bold outline-none text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Vinculado a (Master)</label>
                                        <select value={categoryFormData.parent_id || ''} onChange={e => setCategoryFormData({ ...categoryFormData, parent_id: e.target.value || null })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm appearance-none cursor-pointer font-bold outline-none text-white">
                                            <option value="" className="bg-neutral-900">RAIZ</option>
                                            {categories.filter(c => !c.parent_id && c.id !== editingCategory?.id).map(c => <option key={c.id} value={c.id} className="bg-neutral-900">{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Pacote de Ícones</label>
                                        <div className="relative w-40">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zaeom-gray" size={12} />
                                            <input
                                                type="text"
                                                placeholder="Buscar..."
                                                value={iconSearch}
                                                onChange={e => setIconSearch(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-full pl-8 pr-3 py-1 text-[10px] focus:outline-none outline-none text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-6 md:grid-cols-9 gap-3 p-4 bg-white/5 rounded-3xl border border-white/5 overflow-y-auto max-h-48 custom-scrollbar">
                                        {filteredIcons.map(opt => (
                                            <button
                                                type="button"
                                                key={opt.name}
                                                onClick={() => setCategoryFormData({ ...categoryFormData, icon: opt.name })}
                                                className={`p-3 rounded-2xl border transition-all flex items-center justify-center ${categoryFormData.icon === opt.name ? 'bg-zaeom-neon text-black border-zaeom-neon shadow-[0_0_15px_rgba(0,224,85,0.3)]' : 'bg-black/20 border-white/5 text-zaeom-gray hover:text-white'}`}
                                            >
                                                <opt.icon size={20} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full bg-zaeom-neon text-black font-black py-5 rounded-[1.5rem] hover:shadow-[0_0_20px_rgba(0,224,85,0.4)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                                    <span>CONCLUIR GESTÃO</span>
                                </button>
                                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="w-full py-4 text-zaeom-gray hover:text-white transition-all text-[10px] uppercase font-bold tracking-widest">Sair</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Invite User Modal */}
            <AnimatePresence>
                {isUserModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsUserModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-lg bg-zaeom-bg border border-white/10 rounded-[2.5rem] shadow-2xl p-10"
                        >
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 bg-zaeom-neon/10 rounded-full flex items-center justify-center text-zaeom-neon mx-auto border border-zaeom-neon/20">
                                        <UserCog size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight text-white">Convidar <span className="text-zaeom-neon">Membro</span></h3>
                                    <p className="text-zaeom-gray text-xs font-bold uppercase tracking-widest opacity-60">Adicione um novo colaborador ao ecossistema.</p>
                                </div>

                                <form onSubmit={handleInviteUser} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Nome Completo</label>
                                        <input
                                            required
                                            type="text"
                                            value={userFormData.full_name}
                                            onChange={e => setUserFormData({ ...userFormData, full_name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-zaeom-neon/40 transition-all font-bold text-white outline-none"
                                            placeholder="Ex: João Silva"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">E-mail Corporativo</label>
                                        <input
                                            required
                                            type="email"
                                            value={userFormData.email}
                                            onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-zaeom-neon/40 transition-all font-bold text-white outline-none"
                                            placeholder="nome@exemplo.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Cargo de Atuação</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setUserFormData({ ...userFormData, role: 'seller' })}
                                                className={`py-4 rounded-2xl border font-bold transition-all text-xs tracking-widest ${userFormData.role === 'seller' ? 'bg-zaeom-neon text-black border-zaeom-neon shadow-[0_0_15px_rgba(0,224,85,0.3)]' : 'bg-white/5 border-white/10 text-zaeom-gray hover:text-white'}`}
                                            >
                                                VENDEDOR
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (userProfile?.role === 'master' || session?.user?.email === 'danilomouraoficial@gmail.com') {
                                                        setUserFormData({ ...userFormData, role: 'admin' });
                                                    } else {
                                                        alert('Permissão Negada: Apenas o Supremo pode designar Administradores.');
                                                    }
                                                }}
                                                className={`py-4 rounded-2xl border font-bold transition-all text-xs tracking-widest ${userFormData.role === 'admin' ? 'bg-blue-400 text-black border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-white/5 border-white/10 text-zaeom-gray hover:text-white'}`}
                                            >
                                                ADMIN
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="w-full bg-zaeom-neon text-black font-black text-sm tracking-widest py-5 rounded-[1.5rem] hover:shadow-[0_0_30px_rgba(0,224,85,0.4)] transition-all flex items-center justify-center space-x-2 mt-4 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                        <span>CONCLUIR CONVITE</span>
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Password Recovery Modal */}
            <AnimatePresence>
                {isPasswordRecoveryOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-md bg-zaeom-bg border border-white/10 rounded-[2.5rem] shadow-2xl p-10"
                        >
                            <div className="text-center space-y-4 mb-8">
                                <div className="w-16 h-16 bg-zaeom-neon/10 rounded-full flex items-center justify-center text-zaeom-neon mx-auto border border-zaeom-neon/20">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-white">Nova <span className="text-zaeom-neon">Senha</span></h3>
                                <p className="text-zaeom-gray text-xs font-bold uppercase tracking-widest opacity-60">Defina sua nova credencial de acesso.</p>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zaeom-gray uppercase tracking-widest ml-1">Nova Senha</label>
                                    <input
                                        required
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-zaeom-neon/40 transition-all font-bold text-white outline-none"
                                        placeholder="Mínimo 6 caracteres"
                                        minLength={6}
                                    />
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="w-full bg-zaeom-neon text-black font-black text-sm tracking-widest py-5 rounded-[1.5rem] hover:shadow-[0_0_30px_rgba(0,224,85,0.4)] transition-all flex items-center justify-center space-x-2 mt-4 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                    <span>ATUALIZAR SENHA</span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout >
    );
}
