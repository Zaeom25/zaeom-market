export type ProductType = 'tool' | 'course';
export type ProductSource = 'own' | 'affiliate';

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    parent_id?: string | null;
    created_at?: string;
}

export interface Product {
    id: string;
    title: string;
    description: string | null;
    type: ProductType;
    source: ProductSource;
    cta_link: string | null;
    image_url: string | null;
    category_id: string | null;
    is_active: boolean;
    is_featured: boolean;
    features?: { icon: string; title: string; subtitle: string }[];
    created_at?: string;
    updated_at?: string;
    category?: Category;
}

export interface Ad {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    cta_link: string | null;
    is_active: boolean;
    position: number;
    created_at?: string;
}

export interface SiteSettings {
    id: string;
    site_name: string;
    site_description: string;
    logo_url: string | null;
    favicon_url: string | null;
    primary_color: string;
    updated_at: string;
}
