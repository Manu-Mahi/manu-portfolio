import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Palette,
  Flame,
  Snowflake,
  Cake,
  Plane,
  CircleDot,
} from 'lucide-react';

interface BeyondCodeProps {
  onInteractiveEnter?: () => void;
  onInteractiveLeave?: () => void;
}

interface PolaroidPhoto {
  id: string;
  interest: string;
  caption: string;
  date?: string;
  gradient: string;
  image?: string;
  imageClassName?: string;
  // Position in the right-hand collage container (relative % or px)
  xPercent: number; // 0 to 100 relative to right cluster container
  yPercent: number; // 0 to 100 relative to right cluster container
  width: number;    // px width
  aspectRatio: number;
  rotation: number; // degrees
  zIndex: number;
}

// Exactly 6 interests matching user's list
const INTERESTS = [
  { id: '1', name: 'Drawing', icon: Palette, note: 'Paper, charcoal & digital sketches' },
  { id: '2', name: 'Bharatanatyam', icon: Flame, note: 'Classical storytelling through abhinaya' },
  { id: '3', name: 'Ice Skating', icon: Snowflake, note: 'Freedom on crisp ice' },
  { id: '4', name: 'Baking', icon: Cake, note: 'Sourdough, pastries & warm spices' },
  { id: '5', name: 'Traveling', icon: Plane, note: 'Wandering new cities & landscapes' },
  { id: '6', name: 'Softball', icon: CircleDot, note: 'Weekend games & team spirit' },
];

// 7 artistic overlapping Polaroids loosely clustered on the right side, directly inspired by the user's reference
const RIGHT_POLAROIDS: PolaroidPhoto[] = [
  // Top row
  {
    id: 'rp-1',
    interest: 'Drawing',
    caption: 'Travelling since five',
    date: 'oct 2024',
    gradient: 'from-amber-200/50 via-orange-300/40 to-amber-900/60',
    image: '/polaroid-travel.jpg',
    xPercent: 6,
    yPercent: -2,
    width: 220,
    aspectRatio: 1.05,
    rotation: -4,
    zIndex: 15,
  },
  {
    id: 'rp-2',
    interest: 'Bharatanatyam',
    caption: 'Made with love',
    date: 'aug 2024',
    gradient: 'from-rose-400/50 via-red-900/40 to-amber-600/50',
    image: '/polaroid-baking.jpg',
    imageClassName: 'object-[50%_85%]',
    xPercent: 47,
    yPercent: 3,
    width: 230,
    aspectRatio: 1.02,
    rotation: 3,
    zIndex: 17,
  },
  // Middle cluster
  {
    id: 'rp-3',
    interest: 'Ice Skating',
    caption: 'Softball Champions - 1st place',
    date: 'jan 2024',
    gradient: 'from-cyan-200/60 via-blue-400/40 to-indigo-900/60',
    image: '/polaroid-softball.jpg',
    xPercent: -4,
    yPercent: 33,
    width: 225,
    aspectRatio: 0.98,
    rotation: -2,
    zIndex: 14,
  },
  {
    id: 'rp-4',
    interest: 'Baking',
    caption: 'People ive built with',
    date: 'nov 2024',
    gradient: 'from-amber-100/60 via-yellow-600/40 to-stone-800/60',
    image: '/polaroid-team.jpg',
    xPercent: 32,
    yPercent: 38,
    width: 235,
    aspectRatio: 1.08,
    rotation: 2.5,
    zIndex: 16, // center overlapping highlight
  },
  {
    id: 'rp-5',
    interest: 'Traveling',
    caption: 'UTD rangam - 3rd place',
    date: 'jul 2024',
    gradient: 'from-emerald-300/50 via-teal-700/40 to-slate-900/60',
    image: '/polaroid-dance.jpg',
    xPercent: 68,
    yPercent: 32,
    width: 230,
    aspectRatio: 1.04,
    rotation: 5,
    zIndex: 18,
  },
  // Bottom row
  {
    id: 'rp-6',
    interest: 'Softball',
    caption: 'Painting my world',
    date: 'may 2024',
    gradient: 'from-amber-300/50 via-rose-500/40 to-purple-950/60',
    image: '/painting-world.jpg',
    imageClassName: 'scale-[1.08] translate-y-[3%]',
    xPercent: 8,
    yPercent: 72,
    width: 225,
    aspectRatio: 1.33,
    rotation: -3.5,
    zIndex: 12,
  },
  {
    id: 'rp-7',
    interest: 'Traveling',
    caption: 'Skating through life',
    date: 'sep 2024',
    gradient: 'from-amber-300/50 via-sky-600/40 to-indigo-950/60',
    image: '/polaroid-skating.jpg',
    imageClassName: 'object-top scale-[1.15] translate-x-[7%] translate-y-[1%]',
    xPercent: 50,
    yPercent: 68,
    width: 230,
    aspectRatio: 1.0,
    rotation: 3,
    zIndex: 15,
  },
];

export const BeyondCode: React.FC<BeyondCodeProps> = ({
  onInteractiveEnter,
  onInteractiveLeave,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const clusterRef = useRef<HTMLDivElement>(null);

  // Camera print animation state (triggers once when section enters view)
  const [hasPrinted, setHasPrinted] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverExitTimeoutRef = useRef<number | null>(null);

  // Intersection Observer to trigger the photo sliding upward from the camera once
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasPrinted(true);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handlePolaroidHover = (id: string) => {
    if (hoverExitTimeoutRef.current) {
      clearTimeout(hoverExitTimeoutRef.current);
      hoverExitTimeoutRef.current = null;
    }
    setHoveredId(id);
    onInteractiveEnter?.();
  };

  const handlePolaroidLeave = () => {
    if (hoverExitTimeoutRef.current) {
      clearTimeout(hoverExitTimeoutRef.current);
    }
    hoverExitTimeoutRef.current = window.setTimeout(() => {
      setHoveredId(null);
      onInteractiveLeave?.();
    }, 80);
  };

  // Calculate displacement vector and transform for each Polaroid
  const getPolaroidTransform = (p: PolaroidPhoto) => {
    if (!hoveredId) {
      return {
        transform: `translate3d(0, 0, 0) rotate(${p.rotation}deg)`,
        zIndex: p.zIndex,
        scale: 1,
        isFocused: false,
      };
    }

    if (hoveredId === p.id) {
      // Hovered photo: bring to front, scale up ~1.05, slightly straightened
      const straightenedRot = p.rotation * 0.45;
      return {
        transform: `translate3d(0, -4px, 0) rotate(${straightenedRot.toFixed(1)}deg) scale(1.05)`,
        zIndex: 50,
        scale: 1.05,
        isFocused: true,
      };
    }

    // Surrounding photos: only gently shift directly adjacent/overlapping photos by ~8-15px max
    const activePhoto = RIGHT_POLAROIDS.find((item) => item.id === hoveredId);
    if (!activePhoto) {
      return {
        transform: `translate3d(0, 0, 0) rotate(${p.rotation}deg)`,
        zIndex: p.zIndex,
        scale: 1,
        isFocused: false,
      };
    }

    const dx = p.xPercent - activePhoto.xPercent;
    const dy = p.yPercent - activePhoto.yPercent;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // If photo is farther away than proximity threshold (45%), keep it completely stationary
    const proximityThreshold = 45;
    if (dist >= proximityThreshold) {
      return {
        transform: `translate3d(0, 0, 0) rotate(${p.rotation}deg)`,
        zIndex: p.zIndex,
        scale: 1,
        isFocused: false,
      };
    }

    // Gentle micro-displacement (8px to 14px max) for immediately adjacent photos
    const factor = 1 - dist / proximityThreshold; // 0 to 1
    const pushDist = Math.round(8 + factor * 6); // 8px to 14px max
    const normX = dist > 0.01 ? dx / dist : 1;
    const normY = dist > 0.01 ? dy / dist : 0;

    const moveX = Math.round(normX * pushDist);
    const moveY = Math.round(normY * pushDist);

    return {
      transform: `translate3d(${moveX}px, ${moveY}px, 0) rotate(${p.rotation}deg) scale(1)`,
      zIndex: p.zIndex,
      scale: 1,
      isFocused: false,
    };
  };

  return (
    <section
      id="beyond-code"
      ref={sectionRef}
      className="relative z-10 w-full min-h-screen bg-[#0A0A0A] text-white pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-24 px-6 sm:px-10 md:px-14 lg:px-20 xl:px-28 border-t border-teal-500/20 select-none overflow-hidden"
    >
      {/* Subtle ambient teal background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85vw] max-w-5xl h-80 bg-teal-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-600/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Centered, clean container matching Selected Projects width and alignment */}
      <div className="relative z-20 w-full max-w-[1175px] mx-auto">
        {/* Section Header - Exactly matches Selected Projects positioning & alignment */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white whitespace-nowrap">
            Things I{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-teal-100">
              Love Doing
            </span>
          </h2>
        </div>

        {/* Main 2-Column Responsive Layout: Camera on Left, Photo Cluster on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
        
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Illustrated Polaroid Camera & Emerging Printed Photo         */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
            {/* Camera Container with Emerging Printed Photo (Shifted an additional 25px downward) */}
            <div className="relative mt-14 sm:mt-16 md:mt-18 w-[280px] sm:w-[320px] md:w-[340px] flex flex-col items-center">
            
            {/* Emerging Printed Polaroid Photo (Slides upward out of camera slot) */}
            <div
              className={`relative z-10 w-[240px] sm:w-[260px] transition-all duration-1000 ease-out ${
                hasPrinted
                  ? '-translate-y-4 opacity-100'
                  : 'translate-y-24 opacity-0'
              }`}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div className="p-2.5 pb-4 sm:p-3 sm:pb-5 bg-[#FAF9F5] rounded-[3px] shadow-[0_16px_36px_rgba(0,0,0,0.4)] border border-black/10">
                {/* Photo Area: Clean, minimal handwritten scrapbook list */}
                <div className="relative w-full bg-[#121315] rounded-[2px] py-4 px-4 text-white overflow-hidden shadow-inner flex flex-col justify-center min-h-[220px]">
                  {/* Subtle photographic vignette & grain */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

                  {/* Clean, handwritten scrapbook list */}
                  <div className="relative z-10 flex flex-col space-y-2.5 sm:space-y-3 px-1 text-left">
                    {INTERESTS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2.5 text-white/95 transition-transform hover:translate-x-1 duration-200"
                        >
                          <Icon className="w-3.5 h-3.5 text-teal-300 shrink-0 stroke-[1.8]" />
                          <span className="font-script text-[19px] sm:text-[21px] leading-none tracking-wide text-white drop-shadow-md">
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Polaroid Bottom Border Caption */}
                <div className="mt-2 px-1 flex items-baseline">
                  <span className="font-script text-[15px] sm:text-[17px] text-neutral-800 tracking-wide">
                    Things i love
                  </span>
                </div>
              </div>
            </div>

            {/* Polaroid Camera Slot (Ejection Lip) */}
            <div className="relative z-20 w-[245px] sm:w-[265px] h-2 bg-[#08484a] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] -mb-1" />

            {/* Illustrated Polaroid Instant Camera Body (Medium-bright vibrant teal) */}
            <div className="relative z-20 w-full aspect-[1/1.05] rounded-[36px] bg-[#0EAEB5] p-5 shadow-[0_24px_50px_rgba(0,0,0,0.5),0_6px_16px_rgba(0,0,0,0.35)] border border-teal-300/40 flex flex-col justify-between overflow-hidden">
              
              {/* Subtle cross-hatch leatherette texture on camera front */}
              <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 10px), repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 0, transparent 10px)',
                }}
              />

              {/* Left Grip Curved Accent (Slightly darker teal ergonomic side grip for depth) */}
              <div className="absolute top-0 left-0 bottom-0 w-16 bg-[#0B8B91] rounded-l-[36px] border-r border-teal-900/30 shadow-inner" />

              {/* Top Row: Viewfinder, Flash, & Sensor Dots */}
              <div className="relative z-10 flex items-center justify-between px-2 pt-1">
                {/* Viewfinder window */}
                <div className="w-10 h-10 rounded-xl bg-[#095458] border-2 border-teal-200/50 shadow-inner flex items-center justify-center">
                  <div className="w-5 h-5 rounded-md bg-[#053133] border border-teal-300/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-sm bg-cyan-200 shadow-[0_0_6px_rgba(165,243,252,0.9)]" />
                  </div>
                </div>

                {/* Modern Flash / Pill light */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-14 rounded-2xl bg-gradient-to-b from-white via-neutral-100 to-neutral-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-white/80 flex items-center justify-center">
                    <div className="w-5 h-9 rounded-xl bg-white/90 border border-neutral-200 shadow-inner" />
                  </div>

                  {/* Dual sensor / light meter apertures */}
                  <div className="flex flex-col gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#07474a] border border-teal-500/60 shadow-inner" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#07474a] border border-teal-500/60 shadow-inner" />
                  </div>
                </div>
              </div>

              {/* Center / Lower: Big Iconic Camera Lens with Reflections */}
              <div className="relative z-10 flex items-center justify-center my-auto">
                {/* Outer Lens Bezel */}
                <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-teal-950 via-neutral-900 to-black p-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.2)] border border-teal-300/40 flex items-center justify-center">
                  {/* Concentric Step Ring */}
                  <div className="w-full h-full rounded-full bg-black p-3.5 border border-neutral-800 flex items-center justify-center shadow-inner">
                    {/* Glass Element with Reflection Highlight */}
                    <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-neutral-950 via-slate-900 to-teal-950 border border-teal-400/40 flex items-center justify-center overflow-hidden">
                      {/* Curving Glass Reflection arc */}
                      <div className="absolute -top-3 -right-3 w-20 h-20 bg-white/20 rounded-full blur-md" />
                      <div className="absolute bottom-2 left-3 w-10 h-10 bg-teal-400/25 rounded-full blur-sm" />

                      {/* Aperture Core */}
                      <div className="w-12 h-12 rounded-full bg-[#111215] border border-neutral-700 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Subtle Shutter / Accent Detail */}
              <div className="relative z-10 flex items-center justify-between px-3 pb-1">
                <div className="h-1 w-12 rounded-full bg-white/40" />
                <span className="text-[9px] font-mono tracking-widest uppercase text-teal-950 font-bold">
                  INSTANT • CO
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Asymmetrical Polaroid Collage with Interactive Hover-Focus  */}
        {/* ========================================================================= */}
        <div
          ref={clusterRef}
          onMouseLeave={handlePolaroidLeave}
          className="lg:col-span-7 relative w-full min-h-[580px] sm:min-h-[640px] md:min-h-[700px] flex items-center justify-center"
        >
          {/* Desktop & Tablet: Asymmetrical Overlapping Collage */}
          <div className="relative w-full h-full min-h-[560px] sm:min-h-[620px]">
            {RIGHT_POLAROIDS.map((p) => {
              const state = getPolaroidTransform(p);

              return (
                <div
                  key={p.id}
                  onMouseEnter={() => handlePolaroidHover(p.id)}
                  onClick={() => handlePolaroidHover(p.id)}
                  className="absolute cursor-pointer will-change-transform"
                  style={{
                    left: `${p.xPercent}%`,
                    top: `${p.yPercent}%`,
                    width: `${p.width}px`,
                    transform: state.transform,
                    zIndex: state.zIndex,
                    transition:
                      'transform 340ms cubic-bezier(0.2, 0.9, 0.4, 1), z-index 80ms ease, box-shadow 340ms ease',
                  }}
                >
                  {/* Classic Polaroid White Frame */}
                  <div
                    className={`p-2.5 pb-5 sm:p-3 sm:pb-6 bg-[#FAF9F5] rounded-[3px] border border-black/5 transition-all duration-300 ${
                      state.isFocused
                        ? 'shadow-[0_20px_45px_rgba(0,0,0,0.55),0_6px_16px_rgba(0,0,0,0.35)]'
                        : 'shadow-[0_12px_28px_rgba(0,0,0,0.28),0_2px_5px_rgba(0,0,0,0.15)]'
                    }`}
                  >
                    {/* Photo area */}
                    <div
                      className={`relative w-full overflow-hidden bg-gradient-to-br ${p.gradient} rounded-[2px] shadow-inner flex items-center justify-center`}
                      style={{ aspectRatio: p.aspectRatio }}
                    >
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.caption}
                          className={`w-full h-full object-cover ${p.imageClassName ?? ''}`}
                          loading="lazy"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:12px_12px] opacity-10" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />

                          <div className="relative z-10 flex flex-col items-center justify-center p-3 text-center">
                            <span className="text-[11px] font-mono tracking-widest uppercase text-white/95 drop-shadow">
                              {p.interest}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Handwritten Polaroid Caption: strictly bottom-left aligned with ~14px (pl-3.5) padding */}
                    <div className="mt-2.5 pl-3.5 pr-2 flex items-baseline justify-start text-left">
                      <span className="font-script text-[15px] sm:text-[17px] leading-tight text-neutral-800 tracking-wide truncate whitespace-nowrap">
                        {p.caption}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        </div>

        {/* Bottom Footer Note moved from Projects Section */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/50 text-xs">
          <p>© {new Date().getFullYear()} Manushree.</p>
        </div>
      </div>
    </section>
  );
};
