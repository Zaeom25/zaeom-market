import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShieldCheck, Zap, Globe, Star, CheckCircle2, Award, Clock, Smartphone, Code, Heart, Gem } from 'lucide-react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useSettings } from '../hooks/useSettings';

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
}

const ICON_MAP: Record<string, any> = {
    ShieldCheck, Zap, Globe, Star, CheckCircle2, Award, Clock, Smartphone, Code, Heart, Gem
};

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
    const { settings } = useSettings();

    React.useEffect(() => {
        if (product) {
            const prevTitle = document.title;
            document.title = `${product.title} | ${settings?.site_name || 'Zaeom Market'}`;
            return () => {
                document.title = prevTitle;
            };
        }
    }, [product, settings]);

    if (!product) return null;

    const handleAccessClick = async () => {
        try {
            await supabase.from('click_logs').insert({
                product_id: product.id,
                user_id: (await supabase.auth.getUser()).data.user?.id || null
            });
        } catch (err) {
            console.error('Error logging click:', err);
        }
    };


    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                />

                {/* Modal content */}
                <motion.div
                    initial={window.innerWidth < 768 ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
                    animate={window.innerWidth < 768 ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                    exit={window.innerWidth < 768 ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    drag={window.innerWidth < 768 ? "y" : false}
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                        if (info.offset.y > 150) onClose();
                    }}
                    className="relative w-full h-full md:h-auto max-w-5xl md:max-h-[90vh] overflow-hidden bg-zaeom-bg border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-50 p-3 rounded-2xl bg-black/40 hover:bg-white/10 text-zaeom-gray hover:text-white transition-all border border-white/10 backdrop-blur-md"
                    >
                        <X size={24} />
                    </button>

                    {/* Left: Image/Video Hero */}
                    <div className="w-full md:w-5/12 h-64 md:h-auto relative overflow-hidden bg-white/5 shrink-0">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zaeom-neon/20 to-transparent">
                                <span className="text-zaeom-neon font-bold text-4xl opacity-10">{product.title[0]}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zaeom-bg/80 via-transparent to-transparent md:hidden" />
                    </div>

                    {/* Right: Info Area (Flex container for Fixed Footer) */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-14 custom-scrollbar">
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <span className="text-zaeom-neon text-xs font-black uppercase tracking-[0.3em] opacity-80 decoration-zaeom-neon/30 underline underline-offset-8">
                                        {product.category?.name || 'Inovação'}
                                    </span>
                                    {product.is_featured && (
                                        <div className="flex items-center text-zaeom-neon bg-zaeom-neon/10 px-4 py-1.5 rounded-full border border-zaeom-neon/20">
                                            <Star size={12} className="mr-2 fill-zaeom-neon" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Elite Series</span>
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-3xl md:text-6xl font-black leading-[0.9] uppercase tracking-tighter text-white">
                                    {product.title}
                                </h2>

                                <div
                                    className="text-zaeom-gray text-base md:text-lg leading-relaxed font-medium ql-editor !p-0 break-words"
                                    dangerouslySetInnerHTML={{ __html: (product.description || 'Este item foi selecionado pela curadoria Zaeom para transformar sua operação digital.').replace(/&nbsp;|\u00A0/g, ' ') }}
                                />

                                {product.features && product.features.length > 0 && (
                                    <div className="space-y-6 pt-8 border-t border-white/5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                                            {product.features.map((feat, idx) => {
                                                const IconComp = ICON_MAP[feat.icon] || ShieldCheck;
                                                return (
                                                    <div key={idx} className="flex items-start space-x-4 group">
                                                        <div className="bg-white/[0.03] p-3 rounded-2xl text-zaeom-neon border border-white/5 group-hover:border-zaeom-neon/30 group-hover:bg-zaeom-neon/10 transition-all shrink-0">
                                                            <IconComp size={20} />
                                                        </div>
                                                        <div className="min-w-0 space-y-1">
                                                            <div className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-widest leading-tight">{feat.title}</div>
                                                            <div className="text-[9px] md:text-[10px] text-zaeom-gray uppercase font-bold tracking-tight opacity-60 leading-tight">{feat.subtitle}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-3 text-[9px] text-zaeom-gray font-black uppercase tracking-[0.3em] pt-8 opacity-30">
                                    <Globe size={12} />
                                    <span>Sistema Validado • Zaeom Ecosystem</span>
                                </div>
                            </div>
                        </div>

                        {/* Fixed Actions Footer */}
                        <div className="p-8 md:p-10 bg-[#080808]/80 backdrop-blur-xl border-t border-white/5 space-y-4 pb-12 md:pb-10">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href={product.cta_link || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleAccessClick}
                                    className="flex-1 flex items-center justify-center space-x-3 bg-zaeom-neon hover:shadow-[0_0_40px_rgba(0,224,85,0.4)] text-black font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl transition-all"
                                >
                                    <span>{product.source === 'own' ? 'ADQUIRIR ACESSO' : 'VISITAR SITE'}</span>
                                    <ExternalLink size={18} />
                                </a>
                                <button
                                    onClick={onClose}
                                    className="hidden sm:block px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-white/10"
                                >
                                    VOLTAR
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProductModal;
