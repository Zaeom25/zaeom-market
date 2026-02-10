// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Célula de Segurança: JWT não encontrado.');

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) throw new Error('Acesso negado: Sessão inválida.');

        const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single();
        const isMaster = user.email === 'danilomouraoficial@gmail.com' || profile?.role === 'master' || profile?.role === 'admin';

        if (!isMaster) throw new Error('Acesso negado: Apenas o escalão superior pode convidar membros.');

        const { email, full_name, role } = await req.json();

        if (!serviceRoleKey) throw new Error('Configuração crítica ausente: SERVICE_ROLE_KEY.');

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // Convidar com metadados para o trigger processar
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { full_name, role },
            redirectTo: `${new URL(req.url).origin}/admin`
        });

        if (inviteError) throw inviteError;

        return new Response(JSON.stringify({ message: 'Acesso liberado e convite enviado!', user: inviteData.user }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
})
