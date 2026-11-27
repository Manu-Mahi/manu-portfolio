import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowUpRight, Mail, Sparkles, FolderGit2, User, X, Check, FileText, Copy, Linkedin, Github, MapPin } from 'lucide-react';
import { ProjectsSection } from './components/ProjectsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { BeyondCode } from './components/BeyondCode';

// Exact background color matching animation borders (#0db4ba)
const BG_COLOR = '#0db4ba';
const TOTAL_FRAMES = 64;
const NATURAL_WIDTH = 1280;
const NATURAL_HEIGHT = 720;
// Face center detected by MediaPipe landmarks in 1280x720 video (Frame 200 neutral)
const FACE_NATURAL_X = 623.4;
const FACE_NATURAL_Y = 300.8;

// Shortest path circular angular interpolation
function lerpAngle(current: number, target: number, factor: number): number {
  let diff = target - current;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  return current + diff * factor;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'beyond'>('home');
  const [activeModal, setActiveModal] = useState<'work' | 'about' | 'contact' | 'resume' | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [emailCopied, setEmailCopied] = useState<boolean>(false);

  const handleCopyEmail = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText('manumahishree@gmail.com');
    setEmailCopied(true);
    window.setTimeout(() => setEmailCopied(false), 2000);
  }, []);

  // Mouse & Tracking references (avoid React re-render overhead in 60fps RAF loop)
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 640,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 360,
    active: false,
  });

  const smoothAngleRef = useRef<number>(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const centerImageRef = useRef<HTMLImageElement | null>(null);

  // Custom arrow pointer DOM element
  const cursorArrowRef = useRef<HTMLDivElement | null>(null);

  // 1. Preload 64 WebP frames + center.webp
  useEffect(() => {
    let mounted = true;
    const images: HTMLImageElement[] = [];
    let count = 0;

    const totalToLoad = TOTAL_FRAMES + 1; // 64 frames + center frame

    const onImageLoaded = () => {
      if (!mounted) return;
      count++;
      setLoadedCount(count);
      if (count === totalToLoad) {
        imagesRef.current = images;
        setIsLoaded(true);
      }
    };

    // Load center neutral frame
    const centerImg = new Image();
    centerImg.src = '/frames/center.webp';
    centerImg.onload = () => {
      centerImageRef.current = centerImg;
      onImageLoaded();
    };
    centerImg.onerror = () => {
      centerImg.src = '/center.webp';
      centerImg.onload = () => {
        centerImageRef.current = centerImg;
        onImageLoaded();
      };
    };

    // Load 64 circular slices
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/frames/frame_${i}.webp`;
      img.onload = onImageLoaded;
      img.onerror = () => {
        img.src = `/frames/${i}.webp`;
        img.onload = onImageLoaded;
      };
      images.push(img);
    }

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Window mouse & cursor listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;

      // Position clean arrow cursor instantly (0ms lag, tip at cursor coordinate)
      if (cursorArrowRef.current) {
        cursorArrowRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // 3. High-performance Canvas Renderer (Seamless Background & Zero Ghosting)
  useEffect(() => {
    if (!isLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Handle canvas resolution & resizing
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Fill canvas with exact luxury teal background
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, width, height);

      // Responsive positioning:
      const isDesktop = width >= 1024;
      const isTablet = width >= 768 && width < 1024;

      // Character scale & sizing (Reduced by ~8-10% from 1.24 down to 1.13 for optimal balance)
      let scale = (height * (isDesktop ? 1.13 : isTablet ? 0.90 : 0.72)) / NATURAL_HEIGHT;
      const maxRenderW = isDesktop ? width * 0.72 : width * 0.92;
      if (scale * NATURAL_WIDTH > maxRenderW) {
        scale = maxRenderW / NATURAL_WIDTH;
      }

      const renderW = NATURAL_WIDTH * scale;
      const renderH = NATURAL_HEIGHT * scale;

      // Positioned on the right side of the screen, extending naturally beyond the bottom edge
      const desktopTargetX = width * 0.67;
      const targetFaceScreenX = isDesktop ? desktopTargetX : isTablet ? width * 0.60 : width * 0.50;
      
      // Calculate offsetY such that bottom of the frame extends naturally beyond the hero canvas bottom edge
      let calculatedOffsetY = isDesktop ? height * 0.44 - FACE_NATURAL_Y * scale : height * 0.40 - FACE_NATURAL_Y * scale;
      if (calculatedOffsetY + renderH < height + 8) {
        calculatedOffsetY = height + 8 - renderH;
      }

      const offsetX = targetFaceScreenX - FACE_NATURAL_X * scale;
      const offsetY = calculatedOffsetY;

      // Face position on screen in canvas viewport
      const faceScreenX = offsetX + FACE_NATURAL_X * scale;
      const faceScreenY = offsetY + FACE_NATURAL_Y * scale;

      // Relative vector from face to cursor
      const dx = mouseRef.current.x - faceScreenX;
      const dy = mouseRef.current.y - faceScreenY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Deadzone threshold (near face): switch to neutral eye-contact frame
      const deadzoneRadius = Math.min(width, height) * 0.12;

      let frameToDraw: HTMLImageElement | null = null;

      if (distance < deadzoneRadius && centerImageRef.current) {
        // Looking directly into user's eyes
        frameToDraw = centerImageRef.current;
      } else {
        // Target angle in screen space: [ -PI, PI ]
        const targetAngle = Math.atan2(dy, dx);

        // Fast circular angular lerp factor ~0.26 (~35ms response time)
        const lerpFactor = Math.min(1, 1 - Math.pow(1 - 0.26, dt * 60));
        smoothAngleRef.current = lerpAngle(smoothAngleRef.current, targetAngle, lerpFactor);

        // Normalize smoothed angle to [ 0, 2*PI )
        let normAngle = smoothAngleRef.current % (2 * Math.PI);
        if (normAngle < 0) normAngle += 2 * Math.PI;

        // Map to frame index 0..63
        const frameIndex = Math.round((normAngle / (2 * Math.PI)) * TOTAL_FRAMES) % TOTAL_FRAMES;
        frameToDraw = imagesRef.current[frameIndex] || imagesRef.current[0];
      }

      // Draw exactly ONE crisp frame at 100% opacity (no alpha blending ghosting)
      if (frameToDraw && frameToDraw.complete && frameToDraw.naturalWidth > 0) {
        ctx.drawImage(frameToDraw, offsetX, offsetY, renderW, renderH);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLoaded]);

  // Interactive hover handlers for custom magnetic cursor
  const handleInteractiveEnter = useCallback(() => setIsHovered(true), []);
  const handleInteractiveLeave = useCallback(() => setIsHovered(false), []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const scrollToHome = useCallback(() => {
    const el = document.getElementById('top');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const scrollToProjects = useCallback(() => {
    scrollToSection('projects');
  }, [scrollToSection]);

  const scrollToBeyond = useCallback(() => {
    scrollToSection('beyond-code');
  }, [scrollToSection]);

  const handleNavClick = useCallback((item: 'home' | 'projects' | 'experience' | 'beyond' | 'contact') => {
    if (item === 'home') {
      scrollToHome();
    } else if (item === 'projects') {
      scrollToProjects();
    } else if (item === 'experience') {
      const el = document.getElementById('experience');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setActiveModal('work');
      }
    } else if (item === 'beyond') {
      scrollToBeyond();
    } else if (item === 'contact') {
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setActiveModal('contact');
      }
    }
  }, [scrollToHome, scrollToProjects, scrollToBeyond]);

  return (
    <div id="top" className="relative w-full min-h-screen bg-[#0db4ba] text-white">
      {/* Clean Arrow Pointer (150% of normal default cursor size: 36x36px, sharp and minimal) */}
      <div ref={cursorArrowRef} className="custom-arrow-cursor hidden md:block">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]"
        >
          <path
            d="M3 2L10.5 21L13.5 13.5L21 10.5L3 2Z"
            fill="#FFFFFF"
            stroke="#111111"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Preloader Screen */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0db4ba] transition-opacity duration-700">
          <div className="relative flex flex-col items-center gap-6">
            <div className="text-4xl sm:text-5xl font-script tracking-wider text-white/95">
              Manu
            </div>
            <div className="w-64 h-[3px] bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/90 transition-all duration-150 ease-out rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                style={{ width: `${Math.round((loadedCount / (TOTAL_FRAMES + 1)) * 100)}%` }}
              />
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
              Curating Experience • {Math.round((loadedCount / (TOTAL_FRAMES + 1)) * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Floating Header Pill: [HOME] · [PROJECTS] · [EXPERIENCE] · [BEYOND CODE] · [LET'S TALK] */}
      <header className="fixed top-5 sm:top-6 md:top-8 left-[calc(50%+30px)] -translate-x-1/2 z-30 pointer-events-auto max-w-[95vw]">
        <nav
          className="glass-pill flex items-center gap-1 sm:gap-2 md:gap-2.5 px-3 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2 rounded-full transition-all duration-300 shadow-xl overflow-x-auto no-scrollbar whitespace-nowrap"
          onMouseEnter={handleInteractiveEnter}
          onMouseLeave={handleInteractiveLeave}
        >
          <button
            onClick={() => handleNavClick('home')}
            className="px-2 sm:px-3 py-0.5 text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-[0.18em] sm:tracking-[0.20em] text-white/85 hover:text-white uppercase transition-colors rounded-full hover:bg-white/10 shrink-0"
          >
            [HOME]
          </button>
          <span className="text-white/25 select-none text-[9px] sm:text-[10px] shrink-0">•</span>
          <button
            onClick={() => handleNavClick('projects')}
            className="px-2 sm:px-3 py-0.5 text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-[0.18em] sm:tracking-[0.20em] text-white/85 hover:text-white uppercase transition-colors rounded-full hover:bg-white/10 shrink-0"
          >
            [PROJECTS]
          </button>
          <span className="text-white/25 select-none text-[9px] sm:text-[10px] shrink-0">•</span>
          <button
            onClick={() => handleNavClick('experience')}
            className="px-2 sm:px-3 py-0.5 text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-[0.18em] sm:tracking-[0.20em] text-white/85 hover:text-white uppercase transition-colors rounded-full hover:bg-white/10 shrink-0"
          >
            [EXPERIENCE]
          </button>
          <span className="text-white/25 select-none text-[9px] sm:text-[10px] shrink-0">•</span>
          <button
            onClick={() => handleNavClick('beyond')}
            className="px-2 sm:px-3 py-0.5 text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-[0.18em] sm:tracking-[0.20em] text-white/85 hover:text-white uppercase transition-colors rounded-full hover:bg-white/10 shrink-0"
          >
            [BEYOND CODE]
          </button>
          <span className="text-white/25 select-none text-[9px] sm:text-[10px] shrink-0">•</span>
          <button
            onClick={() => handleNavClick('contact')}
            className="px-2 sm:px-3 py-0.5 text-[10px] sm:text-[11px] md:text-xs font-semibold tracking-[0.18em] sm:tracking-[0.20em] text-white/85 hover:text-white uppercase transition-colors rounded-full hover:bg-white/10 shrink-0"
          >
            [LET'S TALK]
          </button>
        </nav>
      </header>


      {/* ========================================================================= */}
      {/* HERO SECTION (Preserved Exactly: Canvas Character, Typography & Buttons) */}
      {/* ========================================================================= */}
      <div className="relative w-full h-screen overflow-hidden bg-[#0db4ba]">
        {/* Fullscreen Motionless Zero-Ghosting 60FPS Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block pointer-events-none"
          style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: BG_COLOR,
          }}
        />

        {/* Hero Typography & CTA (Shifted closer to the character on the right) */}
        <section className="absolute top-[54%] sm:top-[55%] -translate-y-1/2 left-28 sm:left-36 md:left-48 lg:left-64 xl:left-72 2xl:left-80 z-20 pointer-events-auto max-w-[420px] sm:max-w-[460px] lg:max-w-[500px] xl:max-w-[540px]">
          {/* Modern Clean Introduction */}
          <p className="text-[13px] sm:text-[15px] md:text-[17px] font-semibold tracking-[0.25em] text-white/90 uppercase mb-2 drop-shadow-md">
            Hi, I'm
          </p>

          {/* Elegant Cursive Name (~65% scale) */}
          <h1 className="font-script text-[5.4rem] sm:text-[6.8rem] md:text-[8.2rem] xl:text-[9.8rem] font-bold text-white tracking-wide text-shadow-luxury leading-[0.9] select-none py-1 drop-shadow-2xl">
            Manushree
          </h1>

          {/* A SOFTWARE ENGINEER */}
          <p className="font-modern font-light text-[12px] sm:text-[14px] md:text-[15px] lg:text-[16px] tracking-[0.22em] text-white/75 uppercase leading-none mt-[10px] select-none">
            A Software Engineer
          </p>

          {/* Description (Scaled proportionally, fits cleanly into 4 lines with breathing room) */}
          <p className="text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] leading-[1.45] text-white/95 font-normal tracking-wide mt-5 mb-4 text-shadow-luxury max-w-[530px]">
            I’m passionate about building technology for healthcare and accessibility to improve quality of life. I enjoy bringing ideas to life through software and AI to solve real-world challenge as a Software Engineering student at UT Dallas.
          </p>

          {/* Location: McKinney, TX */}
          <p className="font-modern font-light text-[10px] sm:text-[11px] md:text-[11.5px] lg:text-[12px] tracking-[0.22em] text-white/75 uppercase leading-none mb-7 select-none">
            McKinney, TX
          </p>

          {/* Stylish White Pill Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
            {/* Resume (Solid White Pill with Arrow Icon) */}
            <a
              href="https://drive.google.com/file/d/1Czj09CsdXOshLE8-5RBQHAQul57_Y05R/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={handleInteractiveEnter}
              onMouseLeave={handleInteractiveLeave}
              className="group flex items-center gap-2.5 px-7 py-3 sm:px-8 sm:py-3.5 rounded-full bg-white text-[#036061] font-bold text-sm sm:text-base tracking-wider uppercase shadow-[0_6px_24px_rgba(0,0,0,0.30)] hover:shadow-[0_10px_35px_rgba(255,255,255,0.48)] hover:scale-[1.04] active:scale-[0.97] transition-all duration-200"
            >
              <span>Resume</span>
              <ArrowUpRight className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 stroke-[2.3]" />
            </a>

            {/* LinkedIn (Frosted Glass / White Border) */}
            <a
              href="https://www.linkedin.com/in/manumahi/"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={handleInteractiveEnter}
              onMouseLeave={handleInteractiveLeave}
              className="flex items-center gap-2.5 px-7 py-3 sm:px-8 sm:py-3.5 rounded-full glass-pill text-white font-semibold text-sm sm:text-base tracking-wider uppercase hover:scale-[1.04] active:scale-[0.97] transition-all duration-200"
            >
              <span>LinkedIn</span>
            </a>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* SELECTED PROJECTS SECTION (Solid Near-Black #0A0A0A with Teal Accents)   */}
      {/* ========================================================================= */}
      <ProjectsSection
        onInteractiveEnter={handleInteractiveEnter}
        onInteractiveLeave={handleInteractiveLeave}
      />

      {/* ========================================================================= */}
      {/* EXPERIENCE SECTION (Bright Teal #0db4ba, Positioned Between Projects & Beyond Code) */}
      {/* ========================================================================= */}
      <ExperienceSection
        onInteractiveEnter={handleInteractiveEnter}
        onInteractiveLeave={handleInteractiveLeave}
      />

      {/* ========================================================================= */}
      {/* BEYOND CODE SECTION (Directly following Experience in vertical page flow) */}
      {/* ========================================================================= */}
      <BeyondCode
        onInteractiveEnter={handleInteractiveEnter}
        onInteractiveLeave={handleInteractiveLeave}
      />

      {/* Interactive Modal System for [ABOUT], [CONTACT], [RESUME] */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#046566]/95 border border-white/20 shadow-2xl backdrop-blur-xl text-white">
            {/* Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              onMouseEnter={handleInteractiveEnter}
              onMouseLeave={handleInteractiveLeave}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal: ABOUT */}
            {activeModal === 'about' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-widest">
                  <User className="w-4 h-4" />
                  <span>Engineering Philosophy</span>
                </div>
                <h3 className="font-script text-4xl font-bold text-white">
                  About Manu
                </h3>
                <p className="text-sm text-white/85 leading-relaxed">
                  I bridge the precision of high-scale backend systems with the elegance of bespoke,
                  award-winning frontend architecture.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="block text-[11px] text-white/50 uppercase tracking-wider mb-1">Frontend</span>
                    <span className="text-xs font-medium text-white/90">React 19, TypeScript, WebGL, Canvas, Tailwind</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="block text-[11px] text-white/50 uppercase tracking-wider mb-1">Backend</span>
                    <span className="text-xs font-medium text-white/90">Node.js, Python, PostgreSQL, Redis, GraphQL</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: CONTACT */}
            {activeModal === 'contact' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-widest">
                  <Mail className="w-4 h-4" />
                  <span>Get In Touch</span>
                </div>
                <h3 className="font-script text-4xl font-bold text-white">
                  Let's Connect!
                </h3>
                <p className="text-sm text-white/85 leading-relaxed">
                  Whether it's an opportunity, a collaboration, or just a hello, I'd love to hear from you!
                </p>
                <div className="space-y-2.5 pt-2">
                  <div
                    onMouseEnter={handleInteractiveEnter}
                    onMouseLeave={handleInteractiveLeave}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-white"
                  >
                    <a
                      href="mailto:manumahishree@gmail.com"
                      className="flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2.5 font-semibold text-sm text-white">
                        <Mail className="w-4 h-4 text-white/90 shrink-0" />
                        <span>Email</span>
                      </div>
                      <div className="text-xs text-white/80 mt-1 pl-[26px] truncate">
                        manumahishree@gmail.com
                      </div>
                    </a>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        aria-label="Copy email address"
                        title={emailCopied ? 'Copied!' : 'Copy email'}
                        className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {emailCopied ? (
                          <Check className="w-4 h-4 text-emerald-300" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href="mailto:manumahishree@gmail.com"
                        aria-label="Send email"
                        className="p-1 text-white/70 hover:text-white transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <a
                    href="https://www.linkedin.com/in/manumahi/"
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={handleInteractiveEnter}
                    onMouseLeave={handleInteractiveLeave}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 transition-all text-sm font-semibold text-white/95"
                  >
                    <span className="flex items-center gap-2.5">
                      <Linkedin className="w-4 h-4 text-white/90 shrink-0" />
                      <span>LinkedIn</span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-white/70" />
                  </a>
                  <a
                    href="https://github.com/Manu-Mahi"
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={handleInteractiveEnter}
                    onMouseLeave={handleInteractiveLeave}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 transition-all text-sm font-semibold text-white/95"
                  >
                    <span className="flex items-center gap-2.5">
                      <Github className="w-4 h-4 text-white/90 shrink-0" />
                      <span>GitHub</span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-white/70" />
                  </a>
                </div>
                <div className="pt-2 flex items-center justify-center gap-1.5 text-white/80 text-xs">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>McKinney, Texas</span>
                </div>
              </div>
            )}

            {/* Modal: RESUME */}
            {activeModal === 'resume' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-widest">
                  <FileText className="w-4 h-4" />
                  <span>Curriculum Vitae</span>
                </div>
                <h3 className="font-script text-4xl font-bold text-white">
                  Manu's Resume
                </h3>
                <p className="text-sm text-white/85 leading-relaxed">
                  Full Stack Engineer with 5+ years specializing in reactive web applications,
                  microservices, and human-computer interactive animations.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Lead Full Stack Engineer</div>
                      <div className="text-[11px] text-white/60">Fintech & Cloud Systems • 2023 - Present</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Senior Frontend Specialist</div>
                      <div className="text-[11px] text-white/60">Creative WebGL Studio • 2021 - 2023</div>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      alert('Resume download started.');
                      setActiveModal(null);
                    }}
                    onMouseEnter={handleInteractiveEnter}
                    onMouseLeave={handleInteractiveLeave}
                    className="w-full py-3.5 rounded-full bg-white text-[#036061] font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all"
                  >
                    Download Complete CV (PDF)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}