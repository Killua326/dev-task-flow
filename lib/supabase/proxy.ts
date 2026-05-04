import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest){
    console.log("🔵 Middleware ejecutándose para:", request.nextUrl.pathname);
    let supabaseResponse = NextResponse.next({request,})


    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!, 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
        {
            cookies: {
                getAll(){
                    return request.cookies.getAll()
                },
                setAll(cookies_ToSet, _headers){
                    cookies_ToSet.forEach(({name, value}) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({request})
                    cookies_ToSet.forEach(({name, value, options}) => supabaseResponse.cookies.set(name, value, options))
                    Object.entries(_headers).forEach(([key, value]) => supabaseResponse.headers.set(key, value))
                },
            },
        }
    )

    const {data} = await supabase.auth.getClaims();

    const user = data?.claims

    console.log("👤 Usuario:", user ? `logueado (${user.email})` : "no logueado");
    console.log("📍 Pathname:", request.nextUrl.pathname);
    console.log("🔐 ¿Redirigir?", !user && 
        request.nextUrl.pathname !== '/login' && 
        request.nextUrl.pathname !== '/register' && 
        request.nextUrl.pathname !== '/' &&
        request.nextUrl.pathname !== '/reset-password');

    if(!user && request.nextUrl.pathname !== '/login' && request.nextUrl.pathname !== '/register' && request.nextUrl.pathname !== '/' && request.nextUrl.pathname !== '/reset-password'){
        console.log("Redireccionando a '/'")
        return NextResponse.redirect(new URL('/',request.url));
    }
    if(user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname ==='/register' || request.nextUrl.pathname ==='/')){
        console.log("🔄 Usuario logueado en login/register, redirigiendo a /dashboard");
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return supabaseResponse
}