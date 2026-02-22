import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-purple-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-teal-900/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent tracking-tighter">
          Crowdfr
        </div>
        <div className="flex items-center gap-8">
          <Link href="/pricing" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
            Log In
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-purple-400 mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          FOR ARTISTS &amp; CREATORS
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 max-w-4xl leading-[0.9]">
          The ultimate platform for <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">independent artists.</span>
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mb-12 font-medium leading-relaxed">
          Create converting landing pages for your releases, build your fan contact list, and grow your audience with email campaigns and real-time analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-2xl font-black text-lg hover:from-indigo-500 hover:to-teal-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-900/20 group"
          >
            Launch Your First Drop
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl font-black text-lg hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
          >
            Sign In
          </Link>
        </div>

        {/* Floating Feature Preview */}
        <div className="mt-24 w-full max-w-5xl px-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden aspect-[16/9] shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 w-full p-8 opacity-50">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-zinc-800 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-8 left-8 z-20">
                <div className="text-sm font-bold text-zinc-500 mb-1">DASHBOARD PREVIEW</div>
                <div className="text-2xl font-black text-white">Manage everything in one place.</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-20 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-6">
          <div className="text-zinc-500 text-sm font-medium">
            © 2026 Crowdfr Inc. Built for artists.
          </div>
          <div className="flex gap-8 text-zinc-500 text-sm font-bold">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
