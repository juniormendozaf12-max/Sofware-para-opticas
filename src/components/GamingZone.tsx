import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowLeft, Gamepad2, Trophy, Zap, Users, MapPin, Phone, Mail, ChevronDown, Play, Pause, Monitor, Headphones, Target, Swords } from 'lucide-react';

// ══════════════════════════════════════════
// GAMING ZONE — Tekken 8 Gamer Style
// Centro Óptico Sicuani
// ══════════════════════════════════════════

const springSmooth = { type: 'spring' as const, stiffness: 100, damping: 20 };

// Platform SVG Icons
const PlatformIcons = {
  playstation: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M9.5 4v15.5l-4-1.5V8.5c0-.5.3-1 .8-1.2L9.5 4zm5 7.5V4l3.2 1.2c.5.2.8.6.8 1.1v9.7l-4 1.5V11.5zm-9 7l3 1.1v-2.1l-3 1zm13-1l-3 1.1v-2.1l3 1z"/>
    </svg>
  ),
  xbox: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5L7 13l1.5-1.5 2 2 5-5L17 10l-6.5 6.5z"/>
    </svg>
  ),
  nintendo: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M6 4h4c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm8 0h4c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM6 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
    </svg>
  ),
  pc: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M20 3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h7v2H8v2h8v-2h-3v-2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H4V5h16v10z"/>
    </svg>
  ),
  vr: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M20.5 6h-17C2.67 6 2 6.67 2 7.5v9c0 .83.67 1.5 1.5 1.5H8l2-3h4l2 3h4.5c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5zM8 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm8 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>
  ),
};

// Glitch Text Component
function GlitchText({ children, className = '' }: { children: string; className?: string }) {
  return (
    <span className={`glitch-text relative inline-block ${className}`} data-text={children}>
      {children}
    </span>
  );
}

// Floating Particles Component
function FloatingParticles() {
  return (
    <div className="particles-container absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle absolute w-1 h-1 bg-[#ff1a1a] rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function GamingZone() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [showNav, setShowNav] = useState(false);

  const { scrollYProgress } = useScroll({ container: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowNav(container.scrollTop > 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const services = [
    {
      num: '01',
      title: 'Arcade Clásico',
      desc: 'Revive los clásicos que marcaron generaciones. Pac-Man, Street Fighter, la época dorada.',
      icon: Gamepad2,
    },
    {
      num: '02',
      title: 'Realidad Virtual',
      desc: 'Sumérgete en mundos extraordinarios con tecnología VR de última generación.',
      icon: Headphones,
    },
    {
      num: '03',
      title: 'Gaming Competitivo',
      desc: 'Estaciones de alto rendimiento. Torneos semanales y premios exclusivos.',
      icon: Trophy,
    },
    {
      num: '04',
      title: 'Streaming Studio',
      desc: 'Equipamiento profesional para creadores de contenido. Tu canal al siguiente nivel.',
      icon: Monitor,
    },
  ];

  const portfolio = [
    { title: 'Torneo Regional 2024', cat: 'Evento', size: 'large' },
    { title: 'Zona VR Premium', cat: 'Instalación', size: 'medium' },
    { title: 'Campeones Locales', cat: 'Logro', size: 'small' },
    { title: 'Colección Arcade', cat: 'Retro', size: 'small' },
  ];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-[#0a0a0a] overflow-y-auto overflow-x-hidden z-[100]"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* ═══ GAMER STYLES ═══ */}
      <style>{`
        /* Scanlines Overlay */
        .scanlines::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.15) 2px,
            rgba(0, 0, 0, 0.15) 4px
          );
          pointer-events: none;
          z-index: 10;
        }

        /* CRT Flicker */
        .crt-flicker {
          animation: crt-flicker 0.15s infinite;
        }

        @keyframes crt-flicker {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }

        /* Glitch Text Effect */
        .glitch-text {
          position: relative;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-text::before {
          animation: glitch-1 0.3s infinite linear alternate-reverse;
          color: #ff1a1a;
          z-index: -1;
          clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
        }

        .glitch-text::after {
          animation: glitch-2 0.3s infinite linear alternate-reverse;
          color: #00ffff;
          z-index: -2;
          clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
        }

        @keyframes glitch-1 {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        @keyframes glitch-2 {
          0% { transform: translate(0); }
          20% { transform: translate(2px, -2px); }
          40% { transform: translate(2px, 2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(-2px, 2px); }
          100% { transform: translate(0); }
        }

        /* Floating Particles */
        .particle {
          animation: float-up linear infinite;
        }

        @keyframes float-up {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) rotate(720deg);
            opacity: 0;
          }
        }

        /* Neon Glow */
        .neon-glow {
          box-shadow: 0 0 5px #ff1a1a, 0 0 10px #ff1a1a, 0 0 20px #ff1a1a, 0 0 40px #ff1a1a;
        }

        /* Gaming Card Hover */
        .gaming-card {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .gaming-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 26, 26, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .gaming-card:hover::before {
          left: 100%;
        }

        .gaming-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(255, 26, 26, 0.3);
          border-color: #ff1a1a;
        }

        /* VS Badge */
        .vs-badge {
          font-family: 'Impact', sans-serif;
          text-shadow: 0 0 10px #ff1a1a, 0 0 20px #ff1a1a;
        }

        /* Combo Counter */
        .combo-badge {
          background: linear-gradient(135deg, #ff1a1a, #ff6b35);
          clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%);
        }

        /* Platform Icon Glow */
        .platform-icon {
          transition: all 0.3s ease;
        }

        .platform-icon:hover {
          color: #ff1a1a;
          filter: drop-shadow(0 0 8px #ff1a1a);
          transform: scale(1.2);
        }
      `}</style>

      {/* ═══ SCANLINES OVERLAY ═══ */}
      <div className="scanlines fixed inset-0 pointer-events-none z-[90]" />

      {/* ═══ CRT FLICKER ═══ */}
      <div className="crt-flicker fixed inset-0 bg-white pointer-events-none z-[89]" />

      {/* ═══ FLOATING PARTICLES ═══ */}
      <FloatingParticles />

      {/* ═══ FLOATING NAV ═══ */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={springSmooth}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#ff1a1a]/30"
          >
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="flex items-center gap-3 text-[#ff1a1a]"
              >
                <ArrowLeft size={20} />
                <span className="text-xs font-bold tracking-[0.2em] uppercase">Volver</span>
              </motion.button>
              <span className="font-bold text-lg tracking-[0.3em] text-[#ff1a1a] uppercase">
                <GlitchText>GAMING ZONE</GlitchText>
              </span>
              <div className="w-20" />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ═══ BACK BUTTON (Hero) ═══ */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, ...springSmooth }}
        whileHover={{ scale: 1.1, x: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 w-12 h-12 rounded-none bg-[#ff1a1a]/20 backdrop-blur-md border border-[#ff1a1a]/50 flex items-center justify-center text-[#ff1a1a] hover:bg-[#ff1a1a] hover:text-white transition-all"
        style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)' }}
      >
        <ArrowLeft size={20} />
      </motion.button>

      {/* ═══ HERO — FULLSCREEN VIDEO ═══ */}
      <section className="relative h-screen w-full overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
          >
            <source src="/1775188128418_vnfwuDsj.mp4" type="video/mp4" />
          </video>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff1a1a]/10 via-transparent to-[#ff1a1a]/10" />
        </motion.div>

        {/* VS Decoration */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
        >
          <span className="vs-badge text-8xl font-black text-[#ff1a1a]/20">VS</span>
        </motion.div>

        {/* Combo Badge */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2, ...springSmooth }}
          className="absolute top-20 right-6 z-20"
        >
          <div className="combo-badge px-4 py-2">
            <span className="text-xs font-black tracking-wider text-white">COMBO x99</span>
          </div>
        </motion.div>

        {/* Video control */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleVideo}
          className="absolute bottom-8 right-8 z-20 w-12 h-12 bg-[#ff1a1a]/30 backdrop-blur-md border border-[#ff1a1a]/50 flex items-center justify-center text-[#ff1a1a] hover:bg-[#ff1a1a] hover:text-white transition-all"
          style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)' }}
        >
          {isVideoPlaying ? <Pause size={18} /> : <Play size={18} />}
        </motion.button>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, ...springSmooth }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
        >
          <span className="text-[10px] tracking-[0.4em] uppercase text-[#ff1a1a]/80 font-bold">SCROLL</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} className="text-[#ff1a1a]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ PLATFORM LOGOS MARQUEE ═══ */}
      <section className="relative py-6 bg-gradient-to-r from-[#ff1a1a]/10 via-[#141414] to-[#ff1a1a]/10 border-y border-[#ff1a1a]/20 overflow-hidden">
        <div className="flex items-center justify-center gap-12 animate-pulse">
          {Object.entries(PlatformIcons).map(([name, icon]) => (
            <div key={name} className="platform-icon text-white/60 cursor-pointer">
              {icon}
            </div>
          ))}
          <span className="text-[#ff1a1a] font-black text-xl vs-badge">VS</span>
          {Object.entries(PlatformIcons).map(([name, icon]) => (
            <div key={`${name}-2`} className="platform-icon text-white/60 cursor-pointer">
              {icon}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ABOUT SECTION ═══ */}
      <section className="relative py-24 px-6 md:px-12 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-[3px] bg-[#ff1a1a]" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#ff1a1a]">
                Sobre Nosotros
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              Donde la <span className="text-[#ff1a1a]">VISIÓN</span> se encuentra con el <span className="text-[#ff1a1a]">GAMING</span>
            </h2>
            <p className="text-[#8a8a8a] leading-relaxed mb-8">
              En Centro Óptico Sicuani, hemos creado un espacio único donde la excelencia en salud visual
              se fusiona con experiencias de entretenimiento inmersivas. Nuestra Gaming Zone representa
              la evolución de cómo entendemos el servicio al cliente.
            </p>

            {/* Stats */}
            <div className="flex gap-12 pt-8 border-t border-[#ff1a1a]/20">
              {[
                { num: '15+', label: 'Años XP' },
                { num: '50+', label: 'Juegos' },
                { num: '∞', label: 'Diversión' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, ...springSmooth }}
                  className="text-center"
                >
                  <span className="text-3xl md:text-4xl font-black text-[#ff1a1a]">{stat.num}</span>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#8a8a8a] mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual element */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative h-80 md:h-[450px]"
          >
            <div className="absolute inset-0 border-2 border-[#ff1a1a]/50 translate-x-4 translate-y-4" style={{ clipPath: 'polygon(5% 0%, 100% 0%, 100% 95%, 95% 100%, 0% 100%, 0% 5%)' }} />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] flex items-center justify-center" style={{ clipPath: 'polygon(5% 0%, 100% 0%, 100% 95%, 95% 100%, 0% 100%, 0% 5%)' }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center justify-center"
              >
                <Gamepad2 size={120} className="text-[#ff1a1a]/30" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff1a1a]/5 via-transparent to-[#ff1a1a]/10" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SERVICES SECTION ═══ */}
      <section className="relative py-24 px-6 md:px-12 bg-[#141414]">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#ff1a1a]/[0.03] to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-10 h-[3px] bg-[#ff1a1a]" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#ff1a1a]">
                <GlitchText>SERVICIOS</GlitchText>
              </span>
              <div className="w-10 h-[3px] bg-[#ff1a1a]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Experiencias <span className="text-[#ff1a1a]">HARDCORE</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="gaming-card bg-[#0a0a0a] border border-[#2a2a2a] p-6 cursor-pointer"
                style={{ clipPath: 'polygon(0% 0%, 95% 0%, 100% 10%, 100% 100%, 5% 100%, 0% 90%)' }}
              >
                {/* Number */}
                <span className="text-5xl font-black text-[#2a2a2a] group-hover:text-[#ff1a1a] transition-colors">
                  {service.num}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 mt-4 mb-4 border border-[#ff1a1a]/30 flex items-center justify-center text-[#ff1a1a]" style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)' }}>
                  <service.icon size={24} />
                </div>

                <h3 className="text-lg font-bold text-white mb-3">{service.title}</h3>
                <p className="text-sm text-[#8a8a8a] leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PORTFOLIO SECTION ═══ */}
      <section className="relative py-24 px-6 md:px-12 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-[3px] bg-[#ff1a1a]" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#ff1a1a]">Portafolio</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              <GlitchText>HIGHLIGHTS</GlitchText>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {portfolio.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className={`gaming-card relative overflow-hidden cursor-pointer group border border-[#2a2a2a] ${
                  item.size === 'large' ? 'col-span-2 row-span-2 aspect-square' :
                  item.size === 'medium' ? 'col-span-2 aspect-video' :
                  'aspect-square'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {i === 0 && <Trophy size={60} className="text-[#ff1a1a]/30 group-hover:text-[#ff1a1a]/50 transition-all" />}
                  {i === 1 && <Headphones size={50} className="text-[#ff1a1a]/30 group-hover:text-[#ff1a1a]/50 transition-all" />}
                  {i === 2 && <Target size={40} className="text-[#ff1a1a]/30 group-hover:text-[#ff1a1a]/50 transition-all" />}
                  {i === 3 && <Gamepad2 size={40} className="text-[#ff1a1a]/30 group-hover:text-[#ff1a1a]/50 transition-all" />}
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <motion.div
                  className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
                >
                  <span className="text-[9px] font-black tracking-[0.2em] uppercase text-[#ff1a1a]">{item.cat}</span>
                  <h3 className="text-lg font-bold text-white mt-1">{item.title}</h3>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VISION GAMING CONNECTION ═══ */}
      <section className="relative py-20 px-6 bg-gradient-to-r from-[#ff1a1a]/10 via-[#0a0a0a] to-[#ff1a1a]/10 border-y border-[#ff1a1a]/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mb-8"
          >
            {/* Animated Eye */}
            <div className="relative w-24 h-24 mx-auto">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-4 border-[#ff1a1a] rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#ff1a1a] rounded-full"
              />
            </div>
          </motion.div>

          <h3 className="text-3xl font-black text-white mb-4">
            <GlitchText>VISIÓN + GAMING</GlitchText>
          </h3>
          <p className="text-[#8a8a8a] max-w-xl mx-auto">
            Protege tus ojos mientras disfrutas. Lentes con filtro de luz azul,
            exámenes especializados para gamers, y más.
          </p>
        </div>
      </section>

      {/* ═══ CONTACT SECTION ═══ */}
      <section className="relative py-24 px-6 md:px-12 bg-[#141414]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-[3px] bg-[#ff1a1a]" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#ff1a1a]">Contacto</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              <GlitchText>ÚNETE</GlitchText> <span className="text-[#ff1a1a]">AL GAME</span>
            </h2>
            <p className="text-[#8a8a8a] leading-relaxed mb-10">
              ¿Listo para subir de nivel?
              Contáctanos y únete a la comunidad gaming más exclusiva de Sicuani.
            </p>

            {/* Contact info */}
            <div className="space-y-6">
              {[
                { icon: MapPin, label: 'Base', value: 'Av. Principal 123, Sicuani' },
                { icon: Phone, label: 'Hotline', value: '+51 984 123 456' },
                { icon: Mail, label: 'Email', value: 'gaming@opticasicuani.com' },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 group cursor-pointer"
                >
                  <div className="w-12 h-12 border border-[#ff1a1a]/30 flex items-center justify-center text-[#ff1a1a] group-hover:bg-[#ff1a1a] group-hover:text-white transition-all" style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)' }}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-[#8a8a8a]">{item.label}</span>
                    <p className="text-lg font-bold text-white mt-0.5">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <form className="bg-[#0a0a0a] border border-[#ff1a1a]/30 p-8" style={{ clipPath: 'polygon(0% 0%, 98% 0%, 100% 5%, 100% 100%, 2% 100%, 0% 95%)' }}>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-[#8a8a8a] mb-2">
                    Gamertag / Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full bg-[#141414] border border-[#2a2a2a] px-4 py-3 text-white placeholder:text-[#3d3d3d] focus:border-[#ff1a1a] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-[#8a8a8a] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full bg-[#141414] border border-[#2a2a2a] px-4 py-3 text-white placeholder:text-[#3d3d3d] focus:border-[#ff1a1a] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-[#8a8a8a] mb-2">
                    Mensaje
                  </label>
                  <textarea
                    rows={4}
                    placeholder="¿En qué podemos ayudarte?"
                    className="w-full bg-[#141414] border border-[#2a2a2a] px-4 py-3 text-white placeholder:text-[#3d3d3d] focus:border-[#ff1a1a] focus:outline-none transition-colors resize-none"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full relative bg-[#ff1a1a] py-4 text-[11px] font-black tracking-[0.2em] uppercase text-white overflow-hidden"
                  style={{ clipPath: 'polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)' }}
                >
                  <span className="relative z-10">ENVIAR MENSAJE</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-8 px-6 md:px-12 bg-[#0a0a0a] border-t border-[#ff1a1a]/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-black text-sm tracking-[0.3em] text-[#ff1a1a] uppercase">
            <GlitchText>GAMING ZONE</GlitchText>
          </span>
          <span className="text-xs text-[#8a8a8a]">© 2024 Centro Óptico Sicuani. Level Up.</span>
          <div className="flex gap-3">
            {['PS', 'XB', 'PC'].map((platform) => (
              <motion.a
                key={platform}
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 border border-[#ff1a1a]/30 flex items-center justify-center text-[#8a8a8a] text-xs font-bold hover:bg-[#ff1a1a] hover:border-[#ff1a1a] hover:text-white transition-all"
                style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)' }}
              >
                {platform}
              </motion.a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
