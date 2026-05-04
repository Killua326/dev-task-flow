'use client'
import { createClient } from "@/lib/supabase/client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, CircleX, MailOpen, Send} from 'lucide-react'

export default function Login(){
    /* Estados del login */
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState <string | null> (null)
    const [sucess, setSucess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    /* Estados del Modal para resetear contraseña */
    const [showModal, setShowModal] = useState(false)
    const [resetEmail, setResetEmail] = useState('')
    const [resetLoading, setResetLoading] = useState(false)
    const [resetError, setResetError] = useState <string | null> (null)
    const [resetSent, setResetSent] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    async function checkIfEmailExists(email: string){
        const { data, error } = await supabase.rpc('check_email_exists', {email_to_check: email})
        if(error){
            console.log('Error al iniciar sesión: ', error)
            return false
        }
        return data
    }

    async function logInUser(e: React.SubmitEvent){
        e.preventDefault()
        setLoading(true)
        setSucess(false)
        setError(null)

        const emailValue = emailRef.current?.value || ''
        const passwordValue = passwordRef.current?.value || ''


        console.log('Email:', emailValue)
        console.log('Password:', passwordValue)

        const emailExists = await checkIfEmailExists(emailValue)

        if(!emailExists){
            setLoading(false)
            setError("El correo electrónico no está registrado. Por favor, regístrese primero.")
            return
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailValue,
            password: passwordValue,
        })

        setLoading(false)

        if(error){
            console.log(error.code, error.status, error.message)
            if(error.status===429){
                setError("Demasiadas solicitudes, espere unos minutos antes de reintentar")
            }
            else if(error.code==='invalid_credentials'){
                setError("Correo electrónico o contraseña incorrectos")
            }
            else if(error.code==='anonymous_provider_disabled'){
                setError("No se permiten inicios de sesión anónimos")
            }
            else if(error.code ==='email_not_confirmed'){
                setError("Correo electrónico no confirmado. Revise su email y confirme su correo")
            }
            else if(error.status===400){
                setError("Debe poner un correo electrónico")
            }
            else{
                setError(error.message)
            }
            return
        }
        if(data.user){
            setSucess(true)
            setTimeout(() => router.push('/dashboard'), 1000)
        }
    }
    
    async function resetPassword(){
        setResetLoading(true)
        setResetError(null)

        if(resetEmail){
            const emailExists = await checkIfEmailExists(resetEmail)
            if(!emailExists){
                setResetError('No existe una cuenta con este correo electrónico')
                setResetLoading(false)
                return
            }
        }
        else{
            setResetError('Correo electrónico no válido')
            setResetLoading(false)
            return
        }

        const {error} = await supabase.auth.resetPasswordForEmail(resetEmail,{
            redirectTo:`${window.location.origin}/reset-password`
        })

        setResetLoading(false)
        setResetEmail('')
        
        if(error){
            if(error.status===429){
                setResetError("Demasiadas solicitudes, espere unos minutos antes de reintentar")
                return
            }
            setResetError(error.message)
        }
        else{
            setResetSent(true)
        }
    }

    useEffect(() =>{
        const handleEsc = (e:KeyboardEvent) => {
            if(e.key === 'Escape') setShowModal(false)
        }
        if(showModal){
            window.addEventListener('keydown', handleEsc)
            return () => window.removeEventListener('keydown', handleEsc)
        }
    },[showModal])

    return(
        <div className="flex min-h-screen items-center justify-center bg-gray-200">
            {showModal &&(
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowModal(false)}
                >
                    <div className="bg-white rounded-4xl p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}
                    >
                        {resetSent?(
                            <>
                            <div className='mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700'>
                                Te enviamos un correo de verificación para recuperar tu contraseña. Revisa tu correo y toca el enlace de redirección. Si no ves el correo, revisa el Spam.
                            </div>
                            <button type='button' className='w-full rounded-md bg-blue-600 px-4 py-2 mt-6 text-white hover:bg-blue-700' onClick={() => (setShowModal(false), setResetSent(false))}>
                                Iniciar Sesión
                            </button>
                            </>
                        ) :
                        (   <>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <MailOpen className="w-5 h-5 text-gray-600"></MailOpen>
                                        <h1 className="text-xl font-semibold">Recuperar contraseña</h1>
                                    </div>
                                    <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => setShowModal(!showModal)}>
                                        <CircleX className="w-5 h-5"></CircleX>
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600 mb-4">
                                    <h2>Ingrese su correo electrónico y le enviaremos un enlace para recuperar su contraseña</h2>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-xl font-medium text-gray-800 mt-2">
                                            Correo Electrónico
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></Mail>
                                            <input autoComplete='off' type="email" id='email' required value={resetEmail} className="block w-full rounded-md
                                            border-1 text-black border-gray-300 px-10 py-2 shadow-sm focus:border-blue-50 focus:outline-non focus:ring-1 focus:blue-50"
                                            placeholder="tunombre@mail.com" disabled={resetLoading} onChange={(e) => setResetEmail(e.target.value)}/>
                                        </div>
                                    </div>
                                    {resetError &&(
                                        <div className='mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700'>
                                            {resetError}
                                        </div>
                                    )}
                                    <div className="flex gap-3 mt-6">
                                        <button type="button" className="flex-1 text-lg border-1 border-gray-300 rounded-sm hover:border-gray-400 hover:bg-gray-100 transition-colors w-full px-3 py-1.5 mr-1" onClick={() => setShowModal(false)}>
                                            Cancelar
                                        </button>
                                        <button type="button" className="flex-1 text-lg text-white border-1 border-gray-300 rounded-sm hover:bg-blue-700 w-full px-3 py-1.5 bg-blue-600 flex items-center justify-center gap-2
                                        transition-colors" onClick={resetPassword} disabled={resetLoading}>
                                            <Send className="w-4 h-4 text-black"></Send>
                                            <span>Confirmar correo</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            <div className="w-full max-w-md rounded-4xl bg-white shadow-md p-8">
                <h1 className="text-3xl font-bold text-center text-purple-600">DevTaskFlow</h1>
                <h2 className='text-2xl font-bold text-center mt-2'>Iniciar Sesion</h2>
                {error &&(
                    <div className='mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700'>
                        {error}
                    </div>
                )}
                {sucess &&(
                    <div className='mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700'>
                        Inicio de Sesión exitoso
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={logInUser}>
                    <div className="space-y-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Correo Electrónico
                        </label>
                        <div className='relative'>
                            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400'></Mail>
                            <input ref ={emailRef} type="text" id="email" required className='mt-1 block w-full rounded-md
                            border-1 border-gray-300 px-10 py-2 shadow-sm focus:border-blue-50 focus:outline-non focus:ring-1
                            focus:blue-50'  placeholder='tunombre@mail.com' defaultValue={''}
                            disabled={loading}/>
                        </div>
                        <label htmlFor="password" className='block text-sm font-medium text-gray-700'>
                            Contraseña
                        </label>
                        <div className='relative'>
                            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400'></Lock>
                            <input ref ={passwordRef} type={showPassword? "text" : "password"} id="password" required className='mt-1 block w-full rounded-md border-1 border-gray-300 px-10 py-2 shadow-sm focus:border-blue-50 focus:outline-non focus:ring-1
                            focus:blue-50'  placeholder='tucontraseña' defaultValue={''}
                            disabled={loading}
                            />
                            <button type='button' className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer' onClick={() => setShowPassword(!showPassword)}>
                                {showPassword? <EyeOff className='w-5 h-5'></EyeOff> : <Eye className='w-5 h-5'></Eye>}
                            </button>
                        </div>
                        <div className="relative text-center text-lg font-medium italic">
                            <button type='button' className="relative text-purple-700 hover:text-purple-900" onClick={() => setShowModal(!showModal)} 
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    </div>
                    <button type="submit" className='w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 text-lg' disabled={loading}>
                        {loading? 'Iniciando Sesión' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    )
}