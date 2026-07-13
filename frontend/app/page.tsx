import Link from "next/link"
import { ShieldCheck, LandmarkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import GlobeDemo from "@/components/globe-demo"

export default function HomePage() {
  const heroDetails = {
    heading: "Turn Your Mobile Money History Into Financial Credibility",
    subheading: "Securely sync your MTN MoMo transaction data to build a verified Credit Score Passport. Prove your loan readiness, track statements in GH₵, and unlock formal small-business financing.",
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LandmarkIcon className="size-4" />
            </div>
            <span className="font-semibold text-sm leading-tight tracking-tight">Credit Passport</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Button size="sm" render={<Link href="/login" />} nativeButton={false}>
              Get started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-secondary/30 to-background">
        <div className="absolute left-0 top-0 bottom-0 -z-10 w-full">
            <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#8080800b_1px,transparent_1px),linear-gradient(to_bottom,#8080800b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]">
            </div>
        </div>

        <div className="text-center max-w-3xl mx-auto z-10 mt-10">
            <h1 className="text-4xl md:text-6xl md:leading-tight font-bold tracking-tight text-foreground max-w-lg md:max-w-2xl mx-auto">
                {heroDetails.heading}
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
                {heroDetails.subheading}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-fit mx-auto">
                <Link 
                  href="/login" 
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-center shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Generate My Score
                </Link>
            </div>
        </div>

        {/* Premium Mobile Phone Mockup Replacing Static Image Asset */}
        <div className="relative mt-12 md:mt-16 mx-auto z-20 transition-all duration-700 hover:scale-[1.02]">
            {/* Outer Phone Shell */}
            <div className="relative mx-auto w-[320px] h-[640px] bg-slate-950 rounded-[45px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/30 overflow-hidden">
                
                {/* Speaker Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-5 w-32 bg-slate-950 rounded-b-xl z-30 flex items-center justify-center">
                    <div className="w-12 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* App Internal View Container */}
                <div className="w-full h-full bg-slate-50 rounded-[36px] pt-6 px-4 overflow-y-auto font-sans text-slate-900 select-none text-left scrollbar-hide">
                    
                    {/* Header Area */}
                    <div className="flex items-center justify-between my-3">
                        <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Financial Passport</p>
                            <h3 className="text-sm font-bold text-slate-800">Akosua Mensah</h3>
                        </div>
                        {/* Local MTN Mobile Money Badge */}
                        <div className="flex items-center gap-1 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                            <span className="h-1.5 w-1.5 bg-blue-600 rounded-full animate-pulse" />
                            MTN MoMo
                        </div>
                    </div>

                    {/* Credit Score Gauge Component */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center relative overflow-hidden my-3">
                        <p className="text-xs text-slate-400 font-medium">Verified Credit Score</p>
                        
                        <div className="my-2 relative flex flex-col items-center justify-center">
                            <span className="text-3xl font-black tracking-tight text-blue-600">742</span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-100">
                                Excellent Progress
                            </span>
                        </div>

                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full w-[82%]" />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-medium">
                            <span>300</span>
                            <span>850 Tier Max</span>
                        </div>
                    </div>

                    {/* Financial Capacity Breakdown */}
                    <div className="grid grid-cols-2 gap-2 my-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] text-slate-400 font-semibold">Loan Readiness</p>
                            <p className="text-sm font-black text-slate-700 mt-0.5">GH₵ 5,000</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] text-slate-400 font-semibold">Verified Volume</p>
                            <p className="text-sm font-black text-slate-700 mt-0.5">GH₵ 12,450</p>
                        </div>
                    </div>

                    {/* Simulated Mobile Money Statements Parser */}
                    <div className="my-3">
                        <div className="flex justify-between items-center mb-2 px-0.5">
                            <span className="text-xs font-bold text-slate-700">MoMo Statement Insights</span>
                            <span className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">View History</span>
                        </div>

                        <div className="space-y-1.5">
                            {[
                                { desc: "Received from Cash-In", amt: "+GH₵ 450.00", type: "income" },
                                { desc: "Payment to Merchant", amt: "-GH₵ 120.00", type: "expense" },
                                { desc: "Transfer to Wallet", amt: "+GH₵ 800.00", type: "income" }
                            ].map((tx, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-700">{tx.desc}</p>
                                        <p className="text-[9px] text-slate-400">Statement Sync Verified</p>
                                    </div>
                                    <span className={`text-[11px] font-extrabold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-600'}`}>
                                        {tx.amt}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Encryption Banner */}
                    <div className="mt-4 p-2.5 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-1.5 text-[9px] font-bold shadow-sm">
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                        Secure Bank-Grade Data Protection
                    </div>
                </div>
            </div>
        </div>
        
        {/* Soft background glow underneath phone layer */}
        <div className="absolute left-0 right-0 bottom-0 backdrop-blur-[1px] h-24 bg-gradient-to-b from-transparent to-background z-10 pointer-events-none"></div>
      </main>

      {/* Live Network Animation Section */}
      <section className="relative w-full py-24 bg-black overflow-hidden flex flex-col items-center">
        <div className="text-center z-20 mb-8 max-w-3xl px-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            A Global Passport for Local Credit
          </h2>
          <p className="text-slate-400 text-lg">
            Our infrastructure syncs thousands of transactions across multiple networks every second, creating a borderless financial identity.
          </p>
        </div>
        
        {/* The 3D Interactive Globe */}
        <div className="relative w-full h-[600px] flex items-center justify-center -mt-20 z-10 pointer-events-none">
          <GlobeDemo />
        </div>
        
        <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none"></div>
      </section>
    </div>
  )
}
