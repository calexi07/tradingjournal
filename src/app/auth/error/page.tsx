export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#080c10]">
      <div className="text-center max-w-md px-6">
        <div className="text-5xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold mb-3 text-[#f85149]">
          Eroare la autentificare
        </h1>
        <p className="text-[#8b949e] mb-8">
          Ceva nu a mers bine cu login-ul prin Discord. Încearcă din nou.
        </p>
        
          href="/"
          className="inline-flex items-center justify-center bg-[#00d4aa] hover:bg-[#00b894] text-[#080c10] font-semibold py-3 px-8 rounded-xl transition-all duration-200"
        >
          Înapoi la pagina principală
        </a>
      </div>
    </main>
  )
}
