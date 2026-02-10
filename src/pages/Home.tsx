import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { Product, Ad } from '../types'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'

export default function Home() {
    const { activeCategory, searchQuery } = useStore()
    const { settings } = useSettings()
    const [products, setProducts] = useState<Product[]>([])
    const [ads, setAds] = useState<Ad[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // Fetch Products
                let productQuery = supabase.from('products').select('*, category:categories(*)').eq('is_active', true)

                if (activeCategory) {
                    const { data: parentCat } = await supabase.from('categories').select('id').eq('slug', activeCategory).single()
                    if (parentCat) {
                        const { data: children } = await supabase.from('categories').select('id').eq('parent_id', parentCat.id)
                        const categoryIds = [parentCat.id, ...(children?.map(c => c.id) || [])]
                        productQuery = productQuery.in('category_id', categoryIds)
                    }
                }

                if (searchQuery) {
                    productQuery = productQuery.ilike('title', `%${searchQuery}%`)
                }

                // Sort by featured first, then by date
                const { data: pData, error: pError } = await productQuery
                    .order('is_featured', { ascending: false })
                    .order('created_at', { ascending: false })

                if (pError) throw pError;
                setProducts(pData || [])

                // Fetch Ads (Only active ones, up to 2 positions)
                const { data: aData, error: aError } = await supabase.from('ads')
                    .select('*')
                    .eq('is_active', true)
                    .order('position', { ascending: true })
                    .limit(2)

                if (aError) console.warn('Ads sync warning:', aError);
                setAds(aData || [])

            } catch (error) {
                console.error('Home sync error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [activeCategory, searchQuery])

    // Skeleton Component
    const SkeletonCard = () => (
        <div className="glass-card rounded-[2.5rem] p-6 space-y-6 animate-pulse border-white/5 bg-white/[0.02]">
            <div className="aspect-video bg-white/5 rounded-3xl" />
            <div className="space-y-3">
                <div className="h-4 bg-white/5 rounded-full w-2/3" />
                <div className="h-3 bg-white/5 rounded-full w-full" />
                <div className="h-3 bg-white/5 rounded-full w-1/2" />
            </div>
            <div className="h-12 bg-white/5 rounded-2xl w-full" />
        </div>
    );

    // Ad Helper Component
    const AdCard = ({ ad, layout = 'side' }: { ad: Ad, layout?: 'side' | 'banner' }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-card cursor-pointer rounded-[2.5rem] p-8 border border-zaeom-neon/10 flex ${layout === 'banner' ? 'flex-col md:flex-row items-center gap-8' : 'flex-col justify-between'} group overflow-hidden relative shadow-2xl`}
        >
            <div className={`relative z-10 space-y-4 ${layout === 'banner' ? 'flex-1' : ''}`}>
                <div className="flex items-center text-zaeom-neon text-[10px] font-bold uppercase tracking-widest">
                    <Sparkles size={14} className="mr-2" /> {layout === 'banner' ? 'Oportunidade Zaeom' : 'Destaque Premium'}
                </div>
                <h3 className={`${layout === 'banner' ? 'text-3xl' : 'text-2xl'} font-bold leading-tight uppercase`}>{ad.title}</h3>
                <p className="text-zaeom-gray text-sm line-clamp-3 max-w-xl">{ad.description}</p>
            </div>

            <a
                href={ad.cta_link || '#'}
                target="_blank"
                className={`relative z-10 mt-6 md:mt-0 flex items-center justify-between bg-white text-black font-bold px-8 py-4 rounded-2xl hover:bg-zaeom-neon transition-all min-w-[200px] shadow-lg`}
            >
                <span>VER AGORA</span>
                <ArrowRight size={18} />
            </a>

            {ad.image_url && (
                <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
                    <img src={ad.image_url} className="w-full h-full object-cover grayscale" alt="Ad background" />
                </div>
            )}
            <div className="absolute top-0 right-0 w-32 h-32 bg-zaeom-neon/5 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
        </motion.div>
    );

    return (
        <DashboardLayout>
            <div className="space-y-12 max-w-7xl mx-auto pb-20">
                {/* Hero / Ad Position 1 */}
                {!activeCategory && !searchQuery && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <section className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 p-8 md:p-16">
                            <div className="relative z-10 space-y-4 md:space-y-6 max-w-2xl">
                                <div className="inline-flex items-center space-x-2 bg-zaeom-neon/10 border border-zaeom-neon/20 px-3 py-1 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zaeom-neon animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-zaeom-neon uppercase tracking-widest">Sistema Ativo</span>
                                </div>
                                <h1 className="text-3xl md:text-7xl font-bold tracking-tight leading-[0.9] uppercase">
                                    {settings?.site_name?.split(' ')[0] || 'ZAEOM'} <span className="neon-text">{settings?.site_name?.split(' ')[1] || 'MARKET'}</span>
                                </h1>
                                <p className="text-zaeom-gray text-base md:text-xl leading-relaxed">
                                    {settings?.site_description || 'Acesse o arsenal tático usado pelos maiores players. Ferramentas, automações e estratégias prontas para implementação.'}
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 w-2/3 h-full bg-zaeom-neon/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        </section>

                        <AnimatePresence>
                            {ads[0] && (
                                <div className="h-full">
                                    <AdCard ad={ads[0]} layout="side" />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Consolidated Products Grid */}
                <section className="space-y-10">
                    {!searchQuery && (
                        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-4">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold uppercase tracking-tighter">
                                    {activeCategory ? `Categoria: ${activeCategory}` : 'Arsenais Disponíveis'}
                                </h3>
                                <p className="text-zaeom-gray text-sm">Curadoria definitiva para máxima performance.</p>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(n => <SkeletonCard key={n} />)}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map((product, idx) => (
                                <div key={product.id} className="contents">
                                    {/* Insert Banner Ad between 1st and 2nd row (after 3 items) if it's the main feed */}
                                    {!activeCategory && !searchQuery && idx === 3 && ads[1] && (
                                        <div className="col-span-full py-4">
                                            <AdCard ad={ads[1]} layout="banner" />
                                        </div>
                                    )}
                                    <ProductCard
                                        product={product}
                                        onClick={setSelectedProduct}
                                        featured={product.is_featured}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zaeom-gray mb-2">
                                <Sparkles size={32} className="opacity-20" />
                            </div>
                            <h4 className="text-2xl font-bold">Nenhum item encontrado</h4>
                            <p className="text-zaeom-gray max-w-sm">Tente redefinir os filtros ou buscar por outro termo.</p>
                        </div>
                    )}
                </section>
            </div>

            <ProductModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </DashboardLayout>
    )
}
