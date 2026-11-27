import React, { useEffect, useRef, useState } from 'react';
import { Award, Image as ImageIcon, X } from 'lucide-react';

interface ExperienceSectionProps {
  onInteractiveEnter?: () => void;
  onInteractiveLeave?: () => void;
}

interface PlaceholderRow {
  id: string;
  numStr: string;
  role: string;
  org: string;
  dateStr?: string;
  shortDesc?: string;
  image?: string;
  imageClassName?: string;
  imagePlacement: 'left' | 'right';
  iconType: 'photo' | 'award';
}

const PLACEHOLDER_ROWS: PlaceholderRow[] = [
  {
    id: 'exp-1',
    numStr: '01 /',
    role: 'Software Engineering Intern',
    org: 'ThinkNeuro (SEIE Program)',
    dateStr: 'Jan 2026 – Apr 2026',
    shortDesc: 'Developed AI-powered accessibility applications through software development, computer vision, and collaborative engineering.',
    image: '/exp-thinkneuro.jpg',
    imagePlacement: 'left',
    iconType: 'award',
  },
  {
    id: 'exp-2',
    numStr: '02 /',
    role: 'UI/UX Project Lead',
    org: 'UTD EPICS × UX UTD',
    dateStr: 'Apr 2026 – May 2026',
    shortDesc: 'Improved the user experience of an inventory management solution for Comet Cupboard through user-centered design and collaborative development.',
    image: '/exp-comet-cupboard.jpg',
    imagePlacement: 'right',
    iconType: 'photo',
  },
  {
    id: 'exp-3',
    numStr: '03 /',
    role: 'Front-End Developer',
    org: 'CodePath',
    dateStr: 'Jun 2025 – Aug 2025',
    shortDesc: 'Applied front-end development skills through hands-on projects, collaborative development, and building responsive web experiences.',
    image: '/exp-codepath.jpg',
    imagePlacement: 'left',
    iconType: 'award',
  },
  {
    id: 'exp-4',
    numStr: '04 /',
    role: 'Summer Immersion Programmer',
    org: 'Girls Who Code',
    dateStr: 'Jul 2023',
    shortDesc: 'Explored computer science through game design, collaborative programming, and hands-on development.',
    image: '/exp-girlswhocode.jpg',
    imagePlacement: 'right',
    iconType: 'award',
  },
];

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  onInteractiveEnter,
  onInteractiveLeave,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [touchOpenId, setTouchOpenId] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<PlaceholderRow | null>(null);
  const lastPointerTypeRef = useRef<string>('mouse');

  useEffect(() => {
    if (!selectedRow) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedRow(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRow]);

  const handleImageClick = (row: PlaceholderRow) => {
    if (lastPointerTypeRef.current === 'touch') {
      if (touchOpenId !== row.id) {
        setTouchOpenId(row.id);
        return;
      }
    }
    if (row.image) {
      setSelectedRow(row);
    }
  };

  return (
    <section
      id="experience"
      className="relative z-10 w-full min-h-screen bg-[#0db4ba] text-white pt-20 sm:pt-24 md:pt-26 pb-14 sm:pb-16 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 border-t border-teal-400/20 select-none"
    >
      {/* Centered container matching Selected Projects width and left alignment */}
      <div className="relative w-full max-w-[1175px] mx-auto">
        {/* Section Header - Perfectly aligned with Selected Projects, no subheader */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left mb-4 sm:mb-5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight whitespace-nowrap">
            <span className="text-white">My other</span>{' '}
            <span className="text-[#0A0A0A]">Experiences</span>
          </h2>
        </div>

        {/* 4 Stacked Horizontal Experience Panels (Shifted an additional 40px downward via mt-[68px]) */}
        <div className="mt-[68px] flex flex-col space-y-3.5 sm:space-y-4">
          {PLACEHOLDER_ROWS.map((row) => {
            const isLeft = row.imagePlacement === 'left';
            const isOpen = hoveredId === row.id || touchOpenId === row.id;
            const coverLabel = row.iconType === 'photo' ? 'PROJECT' : 'CERTIFICATE';

            // 40% Image / Certificate Visual Block with Hover-to-Reveal Shutter & Click-to-Enlarge
            const ImageBlock = (
              <button
                type="button"
                onPointerDown={(e) => {
                  lastPointerTypeRef.current = e.pointerType;
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') {
                    setHoveredId(row.id);
                  }
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === 'mouse') {
                    setHoveredId((prev) => (prev === row.id ? null : prev));
                  }
                }}
                onClick={() => handleImageClick(row)}
                aria-expanded={isOpen}
                aria-label={`${coverLabel}: ${row.org} — ${row.role}`}
                className={`group/shutter relative w-full h-full min-h-[140px] sm:min-h-[150px] md:min-h-0 bg-[#E9E9E3] flex flex-col items-center justify-center overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0db4ba] ${
                  row.image ? 'p-2' : 'p-4'
                } ${
                  isLeft ? 'md:border-r border-black/10' : 'md:border-l border-black/10'
                }`}
              >
                {row.image && (
                  <img
                    src={row.image}
                    alt={`${row.org} — ${row.role}`}
                    className={`max-w-full max-h-full w-full h-full transition-transform duration-300 group-hover/shutter:scale-[1.02] ${
                      row.imageClassName ?? 'object-contain'
                    }`}
                    loading="lazy"
                  />
                )}

                {/* Sliding Shutter Cover */}
                <div
                  className={`absolute inset-0 z-10 bg-[#E9E9E3] flex flex-col items-center justify-center p-4 transition-transform duration-[400ms] ease-in-out ${
                    isOpen
                      ? isLeft
                        ? '-translate-x-full'
                        : 'translate-x-full'
                      : 'translate-x-0'
                  }`}
                >
                  {row.iconType === 'award' ? (
                    <Award className="w-6 h-6 sm:w-7 sm:h-7 text-[#0db4ba] stroke-[1.8] mb-1.5" />
                  ) : (
                    <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0db4ba] stroke-[1.8] mb-1.5" />
                  )}
                  <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase font-semibold text-[#111616]/85">
                    {coverLabel}
                  </span>
                </div>
              </button>
            );

            // 60% Information Block
            const InfoBlock = (
              <div className="w-full h-full p-4 sm:p-5 md:py-4 md:px-7 flex flex-col justify-between gap-2.5">
                <div className="pb-2 border-b border-white/5">
                  {/* Top metadata strip: Index, Org & Date */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[#0db4ba]">
                      {row.numStr} {row.org && <span className="text-white/90">{row.org}</span>}
                    </span>
                    {row.dateStr && (
                      <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 tracking-wider uppercase shrink-0">
                        {row.dateStr}
                      </span>
                    )}
                  </div>

                  {/* Role Title in Bold */}
                  <h3 className="text-base sm:text-lg md:text-[21px] font-bold text-white tracking-tight leading-tight mt-1">
                    {row.role}
                  </h3>
                </div>

                {/* Short Role Summary */}
                {row.shortDesc && (
                  <p className="text-[11.5px] sm:text-xs text-neutral-300/85 leading-relaxed">
                    {row.shortDesc}
                  </p>
                )}
              </div>
            );

            return (
              <div
                key={row.id}
                onMouseEnter={onInteractiveEnter}
                onMouseLeave={onInteractiveLeave}
                className="w-full min-h-[140px] md:h-[164px] rounded-lg bg-[#0B1010] border border-black/20 shadow-[0_4px_16px_rgba(0,0,0,0.22)] hover:border-teal-400/40 transition-all duration-200 overflow-hidden group grid grid-cols-1 md:grid-cols-10"
              >
                {/* 
                  Strict 40% (col-span-4) / 60% (col-span-6) grid distribution across all rows:
                  - Rows 1 & 3: Image col-span-4 (left), Info col-span-6 (right)
                  - Rows 2 & 4: Info col-span-6 (left), Image col-span-4 (right)
                  - Mobile: Image always stacks on top cleanly
                */}
                {isLeft ? (
                  <>
                    <div className="md:col-span-4 h-full min-h-0 overflow-hidden">
                      {ImageBlock}
                    </div>
                    <div className="md:col-span-6 h-full min-h-0 overflow-hidden">
                      {InfoBlock}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="order-2 md:order-1 md:col-span-6 h-full min-h-0 overflow-hidden">
                      {InfoBlock}
                    </div>
                    <div className="order-1 md:order-2 md:col-span-4 h-full min-h-0 overflow-hidden">
                      {ImageBlock}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-Size Certificate / Project Lightbox Modal */}
      {selectedRow?.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedRow(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedRow.org} — ${selectedRow.role}`}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedRow(null)}
              aria-label="Close modal"
              className="absolute -top-11 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedRow.image}
              alt={`${selectedRow.org} — ${selectedRow.role}`}
              className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl border border-teal-500/25 bg-[#071011]"
            />
          </div>
        </div>
      )}
    </section>
  );
};
