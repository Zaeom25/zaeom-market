# PRD: Zaeom Marketplace Portfolio & Admin Platform

## 1. Visão Geral do Produto
Uma plataforma híbrida de portfólio e marketplace de ferramentas/cursos, apresentada em um layout de dashboard imersivo. O objetivo é centralizar soluções proprietárias e de afiliação, oferecendo uma experiência de "app" (SPA) ultra-rápida, com um painel administrativo completo para gestão de conteúdo.

## 2. Stack Tecnológica
- **Frontend:** React + Vite (TypeScript).
- **Estilização:** Tailwind CSS (foco em Dark Mode, Glassmorphism, Neon Accents).
- **Ícones:** Lucide React.
- **Gerenciamento de Estado:** Zustand (ou React Context para casos simples).
- **Animações:** Framer Motion (essencial para os Popups e transições de card).
- **Backend/BaaS:** Supabase (Postgres Database, Auth, Storage para imagens).

## 3. Identidade Visual (Baseada no Upload)
- **Tema:** Cyberpunk Clean / Dark Mode Profundo.
- **Cor de Fundo:** `#050505` (quase preto) com texturas sutis de "Dot Grid" (verde escuro muito opaco).
- **Cor Primária (Acento):** `#00E055` (Verde Neon Zaeom) para botões, brilhos e destaques.
- **Tipografia:** Sans-serif moderna (Inter ou Space Grotesk), branca para títulos, cinza (#9CA3AF) para parágrafos.
- **UI Elements:** Cards com bordas finas, efeitos de hover com brilho (glow), modais com backdrop blur.

## 4. Funcionalidades Principais

### A. Interface Pública (Dashboard Layout)
1.  **Sidebar/Navbar Lateral:**
    * Navegação por Categorias (ex: Marketing, Dev, Design, Cursos).
    * Busca global de ferramentas.
    * Filtro rápido (Próprias vs. Afiliação).
2.  **Grid de Produtos (Marketplace):**
    * Cards responsivos exibindo: Capa, Título, Tag (Próprio/Afiliado), Breve descrição.
    * Micro-interações de hover (o card "acende").
3.  **Sales Page Modal (O Popup):**
    * Ao clicar no card, abre-se um modal de tela quase cheia (overlay).
    * **Estrutura do Modal:**
        * Header: Vídeo ou Imagem de destaque.
        * Body: Copywriting persuasiva (Bullet points, benefícios).
        * Footer: Botão de CTA grande ("Acessar Ferramenta" ou "Comprar Curso").
        * Se for afiliação: Link externo com tracking. Se for próprio: Link direto ou checkout.

### B. Painel Administrativo (Área de Controle)
*Acesso restrito via Supabase Auth.*
1.  **Login:** Tela de autenticação simples e segura.
2.  **Gerenciador de Produtos (CRUD):**
    * Adicionar/Editar Ferramenta ou Curso.
    * Campos: Nome, Slug, Categoria, Tipo (Afiliado/Próprio), Link de Venda, Descrição Rica (Markdown ou HTML), Imagem de Capa, Vídeo de Demo.
3.  **Gerenciador de Categorias:** Criar e editar tags/categorias para organização.

## 5. Estrutura de Dados (Supabase Schema Proposto)

**Tabela: `categories`**
- `id` (uuid)
- `name` (text)
- `slug` (text)

**Tabela: `products`**
- `id` (uuid)
- `title` (text)
- `description` (text - suporta markdown)
- `type` (enum: 'tool', 'course')
- `source` (enum: 'proprietary', 'affiliate')
- `cta_link` (text)
- `image_url` (text)
- `category_id` (fk -> categories.id)
- `is_active` (boolean)