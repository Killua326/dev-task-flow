'use client'
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Lock, LockOpen } from 'lucide-react'
import { clear } from "console"

export default function Reset_Password(){
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null> (null)
    const [loading, setLoading] = useState(false)
    const [sucess, setSucess] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [validToken, setValidToken] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(()=> {
        let timeout:NodeJS.Timeout
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('Evento de autenticación detectado:', event)
                if(event === 'PASSWORD_RECOVERY'){
                    console.log('Evento PASSWORD_RECOVERY detectado')
                    clearTimeout(timeout)
                    setValidToken(true)
                }
                else if(event === 'INITIAL_SESSION' && !session){
                    timeout = setTimeout(() => {
                        console.log('No se detectó sesión después de PASSWORD_RECOVERY, redirigiendo a /login')
                        setValidToken(false)
                        router.push('/login')
                    }, 5000)
                }
                else{
                    console.log('Evento de autenticación:', event)
                }
            }
        )
        return () => {subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [supabase, router])

    async function handleResetPassword(e: React.SubmitEvent){
        e.preventDefault()
        setLoading(true)
        setError(null)

        console.log('Nueva contraseña:', newPassword)
        console.log('Confirmar contraseña:', confirmPassword)

        if(newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            setLoading(false)
            return
        }
        if(newPassword.length<6){
            setError('La contraseña debe tener al menos 6 caracteres')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.updateUser({password: newPassword})

        setLoading(false)

        if(error){
            setError(error.message)
            return
        }
        else{
            setSucess(true)
            await supabase.auth.signOut()
            setTimeout(() => router.push('/login'), 1000)
        }

    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-200">
            <div className="w-full max-w-md rounded-4xl bg-white p-8 shadow-md">
                <h1 className="text-3xl font-bold text-center text-purple-600">DevTaskFlow</h1>
                <div className="flex items-center justify-between mb-2 mt-4">
                    <div className="flex items-center gap-2">
                        <LockOpen className="w-5 h-5 text-gray-600"></LockOpen>
                        <h2 className="text-center text-xl font-bold text-gray-800">Restablecer Contraseña</h2>
                    </div>
                </div>
                {validToken ? (
                    <>
                        <p className="text-sm p-2 text-gray-500">Introduzca una nueva contraseña y a continuación verifíquela</p>
                        {error && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}
                        {sucess && (
                            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                                Contraseña restablecida exitosamente. Redirigiendo a login...
                            </div>
                        )}
                    <form className="space-y-6 mt-4" onSubmit={handleResetPassword}>
                        <div className="space-y-4">
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400'></Lock>
                                <input type={showNewPassword? "text" : "password"} id="password" required className='mt-1 block w-full rounded-md border-1 border-gray-300 px-10 py-2 shadow-sm focus:border-blue-50 focus:outline-non focus:ring-1
                                focus:blue-50'  placeholder='tunuevacontraseña' value={newPassword}
                                disabled={loading} onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button type='button' className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer' onClick={() => setShowNewPassword(!showNewPassword)}>
                                    {showNewPassword? <EyeOff className='w-5 h-5'></EyeOff> : <Eye className='w-5 h-5'></Eye>}
                                </button>
                            </div>
                            <label htmlFor="password" className='block text-sm font-medium text-gray-700'>
                                Confirmar Contraseña
                            </label>
                            <div className='relative'>
                                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400'></Lock>
                                <input type={showConfirmPassword? "text" : "password"} id="password" required className='mt-1 block w-full rounded-md border-1 border-gray-300 px-10 py-2 shadow-sm focus:border-blue-50 focus:outline-non focus:ring-1
                                focus:blue-50'  placeholder='tunuevacontraseña' value={confirmPassword}
                                disabled={loading} onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button type='button' className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword? <EyeOff className='w-5 h-5'></EyeOff> : <Eye className='w-5 h-5'></Eye>}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className='w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 text-lg' disabled={loading}>
                            {loading? 'Restableciendo Contraseña' : 'Restablecer Contraseña'}
                        </button>
                    </form>
                    </>
                ) : (
                    <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                        Token de restablecimiento no válido o expirado. Por favor, solicite un nuevo restablecimiento de contraseña.
                    </div>
                )}
            </div>
        </div>
    )
}