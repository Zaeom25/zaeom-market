import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        const authHeader = req.headers.get('Authorization');

        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Falta o cabeçalho de Autorização (JWT).' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        // Initialize client with the user's JWT to verify their identity
        const supabaseClient = createClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                global: {
                    headers: { Authorization: authHeader }
                }
            }
        );

        // Get the user from the JWT
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Sessão inválida ou expirada. Faça login novamente.', details: userError?.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        // Check if user has permission
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isMasterEmail = user.email === 'danilomouraoficial@gmail.com';
        const hasPermission = profile?.role === 'admin' || profile?.role === 'master' || isMasterEmail;

        if (!hasPermission) {
            return new Response(JSON.stringify({ error: 'Acesso negado. Apenas administradores podem convidar usuários.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
            });
        }

        // Process Payload
        const body = await req.json();
        const { email, full_name, role } = body;

        if (!email) {
            return new Response(JSON.stringify({ error: 'E-mail é obrigatório.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        if (!serviceRoleKey) {
            return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // Invite User via Admin Auth API
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { full_name, role }
        });

        if (inviteError) {
            return new Response(JSON.stringify({ error: 'Erro no Supabase Auth: ' + inviteError.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Upsert Profile
        const { error: upsertError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: inviteData.user.id,
                email,
                role,
                full_name,
                updated_at: new Date().toISOString()
            });

        if (upsertError) {
            console.error('Profile Upsert Warning:', upsertError.message);
        }

        return new Response(JSON.stringify({ message: 'Convite enviado com sucesso!', user: inviteData.user }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: 'Erro inesperado: ' + error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
})
