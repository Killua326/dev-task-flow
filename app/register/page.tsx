'use client'
import { createClient } from '@/lib/supabase/client'
import { useState, useRef} from "react"
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff} from 'lucide-react'

export default function Register(){
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null> (null)
    const [verificationSent, setVerificationSent] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    async function checkIfEmailExists(email: string){
        const { data, error } = await supabase.rpc('check_email_exists', {email_to_check: email})
        if(error){
            console.log("Error verificando email: ", error)
            return false
        }
        return data
    }

    async function signUpNewUser(e: React.SubmitEvent){
        e.preventDefault()
        setLoading(true)
        setError(null)
        setVerificationSent(false)

        const emailValue = emailRef.current?.value || ''
        const passwordValue = passwordRef.current?.value || ''

        console.log('Email:', emailValue)
        console.log('Password:', passwordValue)

        const emailExists = await checkIfEmailExists(emailValue)

        if(emailExists){
            setLoading(false)
            setError('Ya existe una cuenta con este correo electrónico. Por favor inicie sesión')
            return
        }

        const { data, error } = await supabase.auth.signUp({
            email: emailValue,
            password: passwordValue,
        })

        setLoading(false)

        if(error){
            if(error.status===429){
                setError("Demasiadas solicitudes, espere unos minutos antes de reintentar")
            }
            else if(error.code==='anonymous_provider_disabled'){
                setError("No se permiten registros anónimos")
            }
            else{
                setError(error.message)
            }
            return
        }
        if(data.user){
            setVerificationSent(true)
        }
    }

    if(verificationSent){
        return(
            <div className='flex min-h-screen items-center justify-center bg-gray-200'>
            <div className='w-full max-w-md rounded-4xl bg-white p-8 shadow-md'>
                <h1 className='text-3xl font-bold text-center text-purple-600'>DevTaskFlow</h1>
                {verificationSent &&(
                    <>
                    <div className='mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700'>
                        Registro completado exitosamente. Te enviamos un correo de verificación. Confirma tu email antes de iniciar sesión.
                    </div>
                    <button type='button' className='w-full rounded-md bg-blue-600 px-4 py-2 mt-6 text-white hover:bg-blue-700' onClick={() => router.push('/login')}>
                        Iniciar Sesión
                    </button>
                    </>
                )}
            </div>
        </div>
        )
    }
    return(
        <div className='flex min-h-screen items-center justify-center bg-gray-200'>
            <div className='w-full max-w-md rounded-4xl bg-white p-8 shadow-md'>
                <h1 className='text-3xl font-bold text-center text-purple-600'>DevTaskFlow</h1>
                <h2 className='mt-2 text-2xl font-bold text-center'>Crear cuenta</h2>
                {/* Mensaje de error */}
                {error &&(
                    <div className='mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700'>
                        {error}
                    </div>
                )}
                <form className='mt-8 space-y-6' onSubmit={signUpNewUser} autoComplete='off'>
                    <div className='space-y-4'>
                        <label htmlFor="email" className='block text-sm font-medium text-gray-700'>
                            Correo Electronico
                        </label>
                        <div className='relative'>
                            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500'></Mail>
                            <input ref ={emailRef} type="text" id="email" required className='mt-1 block w-full rounded-md
                            border-1 border-gray-300 px-10 py-2 shadow-sm focus:border-blue-50 focus:outline-non focus:ring-1
                            focus:blue-50'  placeholder='tunombre@mail.com' defaultValue={''}
                            disabled={loading}/>
                        </div>
                        <label htmlFor="password" className='block text-sm font-medium text-gray-700'>
                            Contraseña
                        </label>
                            <div className='relative'>
                                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500'></Lock>
                                <input ref ={passwordRef} type={showPassword? "text" : "password"} id="password" required className='mt-1 block w-full rounded-md
                                border-1 border-gray-300 px-10 py-2 shadow-sm focus:border-blue-50 focus:outline-non focus:ring-1
                                focus:blue-50'  placeholder='tucontraseña' defaultValue={''}
                                disabled={loading}
                                />
                                <button type='button' className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer' onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword? <EyeOff className='w-5 h-5'></EyeOff> : <Eye className='w-5 h-5'></Eye>}
                                </button>
                            </div>
                    </div>
                    <button type="submit" className='w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 text-lg' disabled={loading}>
                        {loading? 'Registrando' : 'Registrarse'}
                    </button>
                </form>
            </div>
        </div>
    )
}
