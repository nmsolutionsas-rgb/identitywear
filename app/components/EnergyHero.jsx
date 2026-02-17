import { Link } from 'react-router';

export default function EnergyHero() {
    return (
        <section className="relative w-full h-[85vh] md:h-screen overflow-hidden bg-black">
            {/* Background Image */}
            <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2940&auto=format&fit=crop"
                alt="New in Red collection"
                className="w-full h-full object-cover object-center opacity-90"
            />

            {/* Overlay Content */}
            <div className="absolute bottom-16 left-6 md:bottom-24 md:left-12 lg:left-24 z-10 text-white max-w-2xl p-4">
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-4 leading-[0.9]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                    NEW IN: <span className="text-[var(--identity-red)]">RED</span>
                </h2>
                <p className="text-lg md:text-xl font-medium mb-8 max-w-lg text-gray-200" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Our bestselling styles, in trending shades of red. Engineered for performance, designed for identity.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/collections/new-in"
                        className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-[var(--identity-red)] hover:text-white transition-colors duration-300 text-center"
                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                        Shop New In
                    </Link>
                    <Link
                        to="/collections/red"
                        className="px-8 py-4 border-2 border-white text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-300 text-center"
                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                        Shop Red
                    </Link>
                </div>
            </div>

            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </section>
    );
}
