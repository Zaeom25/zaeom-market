import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Play, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
    featured?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, featured }) => {
    // Utility to strip HTML tags for card view - This utility is no longer directly used for the main description display
    // but kept in case other parts of the component or related components might need it.
    const cleanDescription = React.useMemo(() => {
        if (!product.description) return 'Este item foi selecionado pela curadoria Zaeom para transformar sua operação digital.';
        // Remove HTML tags and decode basic entities (like &nbsp;)
        return product.description
            .replace(/<[^>]*>?/gm, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }, [product.description]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            onClick={() => onClick(product)}
            className={`glass-card group cursor-pointer rounded-[2rem] overflow-hidden flex flex-col h-full transition-all duration-500 relative ${featured
                ? 'border-zaeom-neon/40 shadow-[0_0_40px_rgba(0,224,85,0.15)] ring-1 ring-zaeom-neon/30'
                : 'border-white/5 shadow-xl'
                }`}
        >
            {/* Elite Ribbon (Tarja) */}
            {featured && (
                <div className="absolute top-4 -right-12 bg-zaeom-neon text-black font-black text-[9px] py-1.5 px-12 rotate-45 z-20 shadow-xl uppercase tracking-[0.2em] pointer-events-none">
                    Elite Item
                </div>
            )}

            {/* Image Preview - Fixed aspect ratio */}
            <div className="relative aspect-video overflow-hidden bg-white/5 border-b border-white/5">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.title}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=800&auto=format&fit=crop';
                        }}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                        {product.type === 'course' ? <Play size={32} className="text-zaeom-neon/20" /> : <ShoppingCart size={32} className="text-zaeom-neon/20" />}
                    </div>
                )}

                {/* Badges Container - Fixed Top Left */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 pr-12">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${product.source === 'own'
                        ? 'bg-zaeom-neon/10 border-zaeom-neon/30 text-zaeom-neon'
                        : 'bg-white/10 border-white/20 text-white'
                        }`}>
                        {product.source === 'own' ? 'Zaeom' : 'PARCEIRO'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-black/40 border border-white/10 text-zaeom-gray backdrop-blur-md">
                        {product.type === 'course' ? 'CURSO' : 'TOOL'}
                    </span>
                </div>

                {/* Hover Glow Overlay */}
                <div className="absolute inset-0 bg-zaeom-neon/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

            {/* Content Section - Strict Length Management */}
            <div className="p-7 flex flex-col flex-1 space-y-4">
                <div className="space-y-1.5">
                    {/* Title - Strict 1 Line Height */}
                    <h4 className={`text-xl font-bold transition-colors line-clamp-1 h-7 ${featured ? 'text-white' : 'group-hover:text-zaeom-neon'}`}>
                        {product.title}
                    </h4>
                    {/* Category - Always visible */}
                    <div className="text-[10px] text-zaeom-gray font-bold uppercase tracking-[0.25em] opacity-60">
                        {product.category?.name || 'Inovação'}
                    </div>
                </div>

                {/* Description - Strict 2 Line Height */}
                <p className="text-zaeom-gray text-sm line-clamp-2 leading-relaxed h-[2.8rem] overflow-hidden break-words">
                    {cleanDescription}
                </p>

                {/* Footer Actions */}
                <div className="mt-auto pt-5 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center text-zaeom-neon text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                        Detalhes <ExternalLink size={14} className="ml-2" />
                    </div>
                    {featured ? (
                        <div className="w-2 h-2 rounded-full bg-zaeom-neon shadow-[0_0_15px_#00e055] animate-pulse" />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
