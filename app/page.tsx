export default function Home(){
  return(
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-purple-600">DevTaskFlow</h1>
        <p className="text-gray-600 mb-8">
          Gestión de proyectos y facturación para freelancers
        </p>
        <div className="space-x-4">
          <a 
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Iniciar Sesión  
          </a>
          <a 
            href="/register"
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Registrarse
          </a>
        </div>
      </div>
    </main>
  )
}