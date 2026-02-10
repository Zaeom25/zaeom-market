import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Search,
    ShieldAlert,
    LogOut,
    Monitor,
    GraduationCap,
    Briefcase,
    Grid3X3,
    Zap,
    Globe,
    Cpu,
    Layers,
    ChevronDown,
    Code,
    Database,
    Layout,
    MessageSquare,
    BarChart,
    Video,
    Smartphone,
    Cloud,
    ShieldCheck,
    Trophy,
    Users,
    Target,
    Compass,
    PenTool,
    Coffee,
    Music,
    Server,
    HardDrive,
    Terminal,
    Sparkles,
    Shield,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Category } from '../types';
import { useSettings } from '../hooks/useSettings';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const ICON_MAP: Record<string, any> = {
    Monitor, GraduationCap, Briefcase, Zap, Globe, Cpu, Layers,
    Code, Database, Layout, MessageSquare, BarChart, Video,
    Smartphone, Cloud, ShieldCheck, Trophy, Users, Target,
    Compass, PenTool, Coffee, Music, Server, HardDrive, Terminal
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { sidebarOpen, toggleSidebar, activeCategory, setActiveCategory, searchQuery, setSearchQuery } = useStore();
    const { settings } = useSettings();
    const [categories, setCategories] = useState<Category[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleCategoryClick = (slug: string | null) => {
        setActiveCategory(slug);
        if (location.pathname !== '/') {
            navigate('/');
        }
        setIsMobileMenuOpen(false); // Close mobile menu on validation
    };

    useEffect(() => {
        async function fetchInitialData() {
            try {
                // Parallel fetch for speed
                const [sessionRes, categoriesRes] = await Promise.all([
                    supabase.auth.getSession(),
                    supabase.from('categories').select('*').order('name')
                ]);

                // 1. Handle User Session
                if (sessionRes.data.session) {
                    const session = sessionRes.data.session;
                    setUserEmail(session.user.email || null);
                    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();

                    if (session.user.email === 'danilomouraoficial@gmail.com') {
                        setUserRole('master');
                    } else if (profile) {
                        setUserRole(profile.role);
                    }
                }

                // 2. Handle Categories
                if (categoriesRes.data) {
                    setCategories(categoriesRes.data);
                    const active = categoriesRes.data.find(c => c.slug === activeCategory);
                    if (active?.parent_id) {
                        setExpandedGroups(prev => [...new Set([...prev, active.parent_id!])]);
                    }
                }
            } catch (err) {
                console.error('System: Critical init failure:', err);
            }
        }
        fetchInitialData();
    }, [activeCategory]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) window.location.reload();
    };

    const toggleGroup = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedGroups(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const rootCategories = categories.filter(c => !c.parent_id);
    const canAccessAdmin = userRole === 'admin' || userRole === 'seller' || userRole === 'master';

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-zaeom-bg text-white overflow-hidden font-inter">
            {/* Main Sidebar - Desktop Only */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 300 : 88 }}
                className="hidden md:flex relative z-50 flex-col bg-[#050505] border-r border-white/5 h-screen transition-all duration-500 ease-out shadow-[20px_0_50px_rgba(0,0,0,0.8)]"
            >
                {/* Brand / Toggle Section */}
                <div className="p-8 flex items-center h-24">
                    <div className={`flex items-center w-full ${!sidebarOpen ? 'justify-center' : 'justify-between'}`}>
                        {/* Brand Logo - Always visible */}
                        <Link to="/" className="flex items-center group outline-none">
                            {!sidebarOpen && settings?.favicon_url ? (
                                <img
                                    src={settings.favicon_url}
                                    className="h-10 w-10 object-contain transition-all duration-300 group-hover:scale-110"
                                    alt="Icon"
                                />
                            ) : settings?.logo_url ? (
                                <img
                                    src={settings.logo_url}
                                    className={`${sidebarOpen ? 'h-10' : 'h-8'} w-auto object-contain transition-all duration-300 group-hover:scale-105`}
                                    alt="Logo"
                                />
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-zaeom-neon rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,224,85,0.4)] group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                                        <Shield size={22} className="text-black" />
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {sidebarOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="font-black text-xl tracking-tighter leading-none whitespace-nowrap"
                                            >
                                                {(settings?.site_name || 'ZAEOM').toUpperCase().split(' ')[0]}
                                                <span className="text-zaeom-neon">.</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* Floating Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        className={`absolute -right-4 top-10 w-8 h-8 rounded-full border border-white/10 bg-[#0A0A0A] text-zaeom-gray hover:text-zaeom-neon hover:border-zaeom-neon/50 flex items-center justify-center transition-all duration-300 z-[60] shadow-xl`}
                    >
                        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 mt-4 px-4 space-y-8 overflow-y-auto custom-scrollbar">
                    {/* General Section */}
                    <div className="space-y-2">
                        {sidebarOpen && (
                            <span className="px-4 text-[10px] font-black text-zaeom-gray uppercase tracking-[0.3em] opacity-40">Explorar</span>
                        )}
                        <button
                            onClick={() => handleCategoryClick(null)}
                            className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group relative ${activeCategory === null && location.pathname === '/'
                                ? 'bg-white/5 text-zaeom-neon border border-zaeom-neon/20 shadow-[0_0_20px_rgba(0,224,85,0.1)]'
                                : 'text-zaeom-gray hover:bg-white/5 hover:text-white'
                                } ${!sidebarOpen ? 'justify-center' : ''}`}
                        >
                            <Grid3X3 size={20} className={(activeCategory === null && location.pathname === '/') ? 'text-zaeom-neon' : 'group-hover:text-zaeom-neon'} />
                            {sidebarOpen && <span className="ml-4 font-bold text-sm tracking-tight">Marketplace Hub</span>}
                        </button>
                    </div>

                    {/* Categories Section */}
                    <div className="space-y-3">
                        {sidebarOpen && (
                            <span className="px-4 text-[10px] font-black text-zaeom-gray uppercase tracking-[0.3em] opacity-40">Categorias</span>
                        )}
                        <div className="space-y-1.5">
                            {rootCategories.map((cat) => {
                                const IconComp = ICON_MAP[cat.icon || ''] || Monitor;
                                const subcats = categories.filter(s => s.parent_id === cat.id);
                                const isExpanded = expandedGroups.includes(cat.id);
                                const isActive = activeCategory === cat.slug || subcats.some(s => s.slug === activeCategory);

                                return (
                                    <div key={cat.id} className="space-y-1">
                                        <button
                                            onClick={() => handleCategoryClick(cat.slug)}
                                            className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group relative ${isActive
                                                ? 'bg-white/5 text-zaeom-neon border border-white/5 shadow-inner'
                                                : 'text-zaeom-gray hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <IconComp size={20} className={isActive ? 'text-zaeom-neon' : 'group-hover:text-white'} />
                                            {sidebarOpen && (
                                                <>
                                                    <span className="ml-4 font-bold text-sm tracking-tight whitespace-nowrap">{cat.name}</span>
                                                    {subcats.length > 0 && (
                                                        <div
                                                            onClick={(e) => toggleGroup(cat.id, e)}
                                                            className="ml-auto p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                                        >
                                                            <ChevronDown size={14} className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {sidebarOpen && subcats.length > 0 && isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="ml-8 mt-1 space-y-1 overflow-hidden border-l border-white/5 pl-4"
                                                >
                                                    {subcats.map(sub => (
                                                        <button
                                                            key={sub.id}
                                                            onClick={() => handleCategoryClick(sub.slug)}
                                                            className={`w-full text-left py-2.5 text-xs font-bold tracking-tight transition-all relative ${activeCategory === sub.slug
                                                                ? 'text-zaeom-neon'
                                                                : 'text-zaeom-gray hover:text-white'
                                                                }`}
                                                        >
                                                            {sub.name}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar Footer - Settings & User Context */}
                <div className="p-6 border-t border-white/5 bg-black/20 space-y-4">
                    <div className="space-y-1">
                        {/* Admin-Only Control Panel Button */}
                        {canAccessAdmin && (
                            <Link
                                to="/admin"
                                className={`w-full flex items-center p-3.5 rounded-xl transition-all group ${location.pathname === '/admin' ? 'bg-zaeom-neon text-black shadow-[0_0_15px_rgba(0,224,85,0.3)]' : 'text-zaeom-gray hover:text-white hover:bg-white/5'} ${!sidebarOpen ? 'justify-center' : ''}`}
                            >
                                <ShieldAlert size={20} className={location.pathname === '/admin' ? 'text-black' : 'group-hover:text-zaeom-neon'} />
                                {sidebarOpen && <span className="ml-4 font-bold text-sm tracking-tight">Painel Admin</span>}
                            </Link>
                        )}

                        {userEmail && (
                            <button
                                onClick={handleLogout}
                                className={`w-full flex items-center p-3.5 rounded-xl text-zaeom-gray hover:text-red-400 hover:bg-red-400/5 transition-all group ${!sidebarOpen ? 'justify-center' : ''}`}
                            >
                                <LogOut size={20} />
                                {sidebarOpen && <span className="ml-4 font-bold text-sm tracking-tight">Encerrar Sessão</span>}
                            </button>
                        )}
                    </div>

                    {/* User Context Card */}
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-[1.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/5 flex items-center space-x-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-zaeom-neon/10 border border-zaeom-neon/20 flex items-center justify-center text-zaeom-neon font-black shrink-0 shadow-inner">
                                {userEmail ? userEmail[0].toUpperCase() : <Sparkles size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-black tracking-tight truncate">
                                    {userEmail ? userEmail.split('@')[0] : 'Explorador'}
                                </div>
                                <div className="text-[10px] text-zaeom-gray font-bold uppercase tracking-widest opacity-60">
                                    {userRole === 'master' ? 'Supremo' : userRole === 'admin' ? 'Administrador' : userRole === 'seller' ? 'Vendedor' : 'Visitante'}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-[#050505] border-r border-white/5 z-[100] md:hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-white/5">
                                <span className="font-black text-lg tracking-tighter uppercase whitespace-nowrap">
                                    {(settings?.site_name || 'ZAEOM').toUpperCase().split(' ')[0]}
                                    <span className="text-zaeom-neon">.</span>
                                </span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zaeom-gray hover:text-white">
                                    <ChevronLeft size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                                {/* General Section */}
                                <div className="space-y-2">
                                    <span className="px-2 text-[10px] font-black text-zaeom-gray uppercase tracking-[0.3em] opacity-40">Explorar</span>
                                    <button
                                        onClick={() => handleCategoryClick(null)}
                                        className={`w-full flex items-center p-3 rounded-xl transition-all group ${activeCategory === null && location.pathname === '/'
                                            ? 'bg-white/5 text-zaeom-neon border border-zaeom-neon/20 shadow-inner'
                                            : 'text-zaeom-gray hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Grid3X3 size={18} className={activeCategory === null ? 'text-zaeom-neon' : ''} />
                                        <span className="ml-3 font-bold text-sm tracking-tight">Marketplace Hub</span>
                                    </button>
                                </div>

                                {/* Categories Section */}
                                <div className="space-y-3">
                                    <span className="px-2 text-[10px] font-black text-zaeom-gray uppercase tracking-[0.3em] opacity-40">Categorias</span>
                                    <div className="space-y-1">
                                        {rootCategories.map((cat) => {
                                            const IconComp = ICON_MAP[cat.icon || ''] || Monitor;
                                            const subcats = categories.filter(s => s.parent_id === cat.id);
                                            const isExpanded = expandedGroups.includes(cat.id);
                                            const isActive = activeCategory === cat.slug || subcats.some(s => s.slug === activeCategory);

                                            return (
                                                <div key={cat.id} className="space-y-1">
                                                    <button
                                                        onClick={() => handleCategoryClick(cat.slug)}
                                                        className={`w-full flex items-center p-3 rounded-xl transition-all group relative ${isActive
                                                            ? 'bg-white/5 text-zaeom-neon border border-white/5'
                                                            : 'text-zaeom-gray hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        <IconComp size={18} className={isActive ? 'text-zaeom-neon' : ''} />
                                                        <span className="ml-3 font-bold text-sm tracking-tight flex-1 text-left">{cat.name}</span>
                                                        {subcats.length > 0 && (
                                                            <div
                                                                onClick={(e) => toggleGroup(cat.id, e)}
                                                                className="p-1 hover:bg-white/10 rounded-lg"
                                                            >
                                                                <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        )}
                                                    </button>

                                                    <AnimatePresence>
                                                        {subcats.length > 0 && isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="ml-4 pl-4 border-l border-white/5 space-y-1"
                                                            >
                                                                {subcats.map(sub => (
                                                                    <button
                                                                        key={sub.id}
                                                                        onClick={() => handleCategoryClick(sub.slug)}
                                                                        className={`w-full text-left py-2 text-xs font-bold tracking-tight transition-all ${activeCategory === sub.slug
                                                                            ? 'text-zaeom-neon'
                                                                            : 'text-zaeom-gray hover:text-white'
                                                                            }`}
                                                                    >
                                                                        {sub.name}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[80] bg-black/90 backdrop-blur-xl border-t border-white/5 px-6 pb-safe-offset-4 pt-1">
                <div className="flex items-center justify-around h-20">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className={`flex flex-col items-center space-y-1.5 transition-all text-zaeom-gray hover:text-white`}
                    >
                        <Layout size={22} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Menu</span>
                    </button>

                    <button
                        onClick={() => handleCategoryClick(null)}
                        className={`flex flex-col items-center space-y-1.5 transition-all transform -translate-y-4 bg-zaeom-neon text-black p-4 rounded-full shadow-[0_0_20px_rgba(0,224,85,0.4)] border-4 border-[#050505]`}
                    >
                        <Grid3X3 size={24} />
                    </button>

                    {canAccessAdmin ? (
                        <Link
                            to="/admin"
                            className={`flex flex-col items-center space-y-1.5 transition-all ${location.pathname === '/admin' ? 'text-white' : 'text-zaeom-gray'}`}
                        >
                            <ShieldAlert size={22} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Admin</span>
                        </Link>
                    ) : (
                        <button
                            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                            className={`flex flex-col items-center space-y-1.5 transition-all ${isMobileSearchOpen ? 'text-white' : 'text-zaeom-gray'}`}
                        >
                            <Search size={22} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Busca</span>
                        </button>
                    )}
                </div>
            </nav>

            {/* Main Content Viewport */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-zaeom-bg relative">
                {/* Visual Accent Decoration */}
                <div className="absolute top-0 left-0 w-1/3 h-[500px] bg-zaeom-neon/[0.03] blur-[150px] pointer-events-none rounded-full -translate-x-1/2 -translate-y-1/2" />

                {/* Global Search Navbar */}
                <header className={`h-20 md:h-24 flex items-center justify-between px-6 md:px-10 bg-transparent relative z-40 transition-all ${isMobileSearchOpen ? 'flex' : 'hidden md:flex'}`}>
                    <div className="flex-1 max-w-2xl relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="text-zaeom-gray group-focus-within:text-zaeom-neon transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar no ecossistema..."
                            value={searchQuery}
                            autoFocus={isMobileSearchOpen}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-[1.2rem] py-3.5 md:py-4 pl-14 pr-6 focus:outline-none focus:border-zaeom-neon/30 focus:bg-white/[0.05] transition-all text-sm font-medium tracking-tight shadow-2xl"
                        />
                    </div>
                </header>

                {/* Mobile Header Brand (Visible when search is closed) */}
                <header className={`md:hidden h-20 flex items-center justify-between px-6 bg-transparent relative z-40 ${isMobileSearchOpen ? 'hidden' : 'flex'}`}>
                    <Link to="/" onClick={() => handleCategoryClick(null)} className="flex items-center space-x-3 outline-none">
                        {settings?.favicon_url ? (
                            <img src={settings.favicon_url} className="h-8 w-8 object-contain" alt="Icon" />
                        ) : (
                            <div className="w-8 h-8 bg-zaeom-neon rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,224,85,0.4)]">
                                <Shield size={18} className="text-black" />
                            </div>
                        )}
                        <span className="font-black text-lg tracking-tighter uppercase whitespace-nowrap">
                            {(settings?.site_name || 'ZAEOM').toUpperCase().split(' ')[0]}
                            <span className="text-zaeom-neon">.</span>
                        </span>
                    </Link>
                    <div className="w-1.5 h-1.5 bg-zaeom-neon rounded-full animate-pulse" />
                </header>

                {/* Main Dynamic View Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32 md:pb-10 custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
