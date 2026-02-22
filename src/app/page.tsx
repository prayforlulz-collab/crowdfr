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
      <nav className="relative z-50 flex items-center justify-between px-4 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="text-xl md:text-2xl font-black bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent tracking-tighter shrink-0">
          Crowdfr
        </div>
        <div className="flex items-center gap-3 md:gap-8">
          <Link href="/blog" className="text-xs md:text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
            Blog
          </Link>
          <Link href="/pricing" className="text-xs md:text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="text-xs md:text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
            Log In
          </Link>
          <Link
            href="/register"
            className="px-4 md:px-6 py-2 md:py-2.5 bg-white text-black rounded-full text-[11px] md:text-sm font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] whitespace-nowrap"
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

        {/* Product Showcase Section */}
        <section className="mt-24 w-full max-w-6xl px-4 perspective-1000">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Mock Dashboard */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#121215] border border-white/10 rounded-[2rem] p-6 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
                {/* Mock Browser Header */}
                <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg py-1 px-3 text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                    <span className="opacity-50">https://</span>crowdfr.com/dashboard
                  </div>
                </div>

                {/* Mock Dashboard Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-white/10 rounded-full" />
                    <div className="h-8 w-24 bg-indigo-600/20 border border-indigo-500/30 rounded-lg" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                      <div className="h-2 w-12 bg-zinc-700 rounded-full" />
                      <div className="h-6 w-20 bg-indigo-400/20 rounded-lg animate-pulse" />
                    </div>
                    <div className="h-24 bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                      <div className="h-2 w-12 bg-zinc-700 rounded-full" />
                      <div className="h-6 w-20 bg-teal-400/20 rounded-lg animate-pulse [animation-delay:200ms]" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="h-16 bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-32 bg-zinc-700 rounded-full" />
                        <div className="h-2 w-20 bg-zinc-800 rounded-full" />
                      </div>
                      <div className="w-12 h-6 bg-white/5 rounded-full" />
                    </div>
                    <div className="h-16 bg-white/10 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-indigo-500/5 scale-[1.02]">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-32 bg-white/80 rounded-full" />
                        <div className="h-2 w-20 bg-indigo-200/20 rounded-full" />
                      </div>
                      <div className="w-12 h-6 bg-indigo-500/20 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 right-4 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full pointer-events-none" />
              </div>
              <p className="mt-4 text-sm font-bold text-zinc-500 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                CENTRALIZED DASHBOARD
              </p>
            </div>

            {/* Right Column: Mobile Page Preview */}
            <div className="relative group lg:pt-20">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative mx-auto w-64 aspect-[9/19.5] bg-[#0c0c0e] border-[6px] border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-800 rounded-b-2xl z-50" />

                {/* Mock Content */}
                <div className="flex-1 p-4 pt-12">
                  <div className="w-full aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl mb-6 shadow-xl relative overflow-hidden group-hover:scale-105 transition-transform">
                    <div className="absolute inset-0 bg-indigo-600/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-2 mb-8">
                    <div className="h-4 w-3/4 bg-white/80 rounded-full mx-auto" />
                    <div className="h-3 w-1/2 bg-zinc-600 rounded-full mx-auto" />
                  </div>

                  <div className="space-y-3">
                    <div className="h-12 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500/20" />
                      <div className="h-2 w-20 bg-zinc-400 rounded-full" />
                    </div>
                    <div className="h-12 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500/20" />
                      <div className="h-2 w-20 bg-zinc-400 rounded-full" />
                    </div>
                    <div className="h-12 bg-white text-black font-bold text-[10px] rounded-xl flex items-center justify-center shadow-lg">
                      PRE-SAVE NOW
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-8 text-sm font-bold text-zinc-500 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                DYNAMIC RELEASE PAGES
              </p>
            </div>
          </div>
        </section>
        {/* Features Grid */}
        <section className="mt-40 w-full max-w-7xl px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/[0.07] transition-all">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl mb-6">🌐</div>
              <h3 className="text-xl font-bold mb-4">Personal Subdomains</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Your brand, your link. Every artist gets a dedicated <span className="text-white font-mono">artist.crowdfr.com</span> address automatically.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/[0.07] transition-all">
              <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-2xl mb-6">📊</div>
              <h3 className="text-xl font-bold mb-4">Advanced Analytics</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Track every view, click, and fan signup in real-time. Understand your audience with geographic and device breakdowns.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/[0.07] transition-all">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-2xl mb-6">✉️</div>
              <h3 className="text-xl font-bold mb-4">Fan Management</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Build your own independent mailing list. Export your data anytime. You own your relationship with your fans.
              </p>
            </div>
          </div>
        </section>
        {/* Final CTA */}
        <section className="mt-40 mb-20 text-center px-8">
          <div className="bg-gradient-to-br from-indigo-600/20 to-teal-600/10 border border-white/10 p-20 rounded-[4rem] max-w-5xl mx-auto backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
            <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to launch?</h2>
            <Link
              href="/register"
              className="px-12 py-6 bg-white text-black rounded-2xl font-black text-xl hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 inline-block"
            >
              Get Started for Free
            </Link>
            <p className="mt-6 text-zinc-500 font-medium italic">No credit card required for the Free plan.</p>
          </div>
        </section>
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
