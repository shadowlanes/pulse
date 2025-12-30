import PulseCalendar from "./components/PulseCalendar";
import PulseMetrics from "./components/PulseMetrics";

function App() {
    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-primary/30 font-sans">
            <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <h1 className="text-xl font-black tracking-tighter">PULSE</h1>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-16 text-center sm:text-left">
                    <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4">
                        Global Health <span className="text-primary italic">Status</span>
                    </h2>
                    <p className="text-neutral-400 text-lg sm:text-xl max-w-2xl">
                        Analyzing the world’s most significant headlines every 24 hours to track the rhythm of our civilization.
                    </p>
                </div>

                <PulseMetrics />
                <PulseCalendar />

                <footer className="mt-24 pt-12 border-t border-white/5 text-center text-neutral-600 text-sm">
                    <p>&copy; {new Date().getFullYear()} Pulse. A historical archive for humanity.</p>
                </footer>
            </main>
        </div>
    );
}

export default App;
