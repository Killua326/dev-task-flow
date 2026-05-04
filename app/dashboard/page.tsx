'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Dashboard(){
    const supabase = createClient()
    const router = useRouter()
    // console.log(supabase)

    async function logOut(){
        try{
            await supabase.auth.signOut()
            console.log("Cierre de sesion correcto")
            router.push('/')
        }catch(error){
            console.log("Error al cerrar sesión: ", error)
        }
    }

    return(
        <div className="flex min-h-screen items-center justify-center bg-gray-200">
            <div className="w-full max-w-md rounded-4xl bg-gray-400 shadow-md p-8"
            >
                <button type='button' className="bg-red-400 hover:bg-red-500 text-white rounded-2xl p-1" onClick={logOut}
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    )
}