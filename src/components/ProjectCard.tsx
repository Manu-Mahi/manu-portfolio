import React from 'react';
import {
  Trophy,
  ExternalLink,
  Github,
  FileText,
  Bot,
  Brain,
  Box,
  Code2,
  Globe2,
  Sparkles,
} from 'lucide-react';
import type { Project } from '../data/projects';

interface ProjectCardProps {
  project: Project;
  index: number;
  onInteractiveEnter?: () => void;
  onInteractiveLeave?: () => void;
}

const renderIcon = (name?: string) => {
  const iconProps = { className: 'w-8 h-8 text-teal-400/80 group-hover:text-teal-300 transition-colors duration-300' };
  switch (name) {
    case 'robot':
      return <Bot {...iconProps} />;
    case 'brain':
      return <Brain {...iconProps} />;
    case 'box':
      return <Box {...iconProps} />;
    case 'code':
      return <Code2 {...iconProps} />;
    case 'globe':
      return <Globe2 {...iconProps} />;
    case 'sparkles':
    default:
      return <Sparkles {...iconProps} />;
  }
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  onInteractiveEnter,
  onInteractiveLeave,
}) => {
  return (
    <article
      className="group relative flex flex-col h-full rounded-[18px] bg-[#111111] border border-teal-500/20 hover:border-teal-400/60 shadow-[0_4px_24px_rgba(7,170,171,0.08)] hover:shadow-[0_12px_40px_rgba(7,170,171,0.25)] transition-all duration-300 hover:-translate-y-1.5 overflow-hidden justify-between"
      style={{
        animationDelay: `${index * 80}ms`,
      }}
      onMouseEnter={onInteractiveEnter}
      onMouseLeave={onInteractiveLeave}
    >
      {/* Top — Project Preview Area */}
      <div className="relative w-full aspect-[16/8] bg-[#0A0A0A] border-b border-teal-500/15 overflow-hidden flex items-center justify-center shrink-0">
        {/* Subtle decorative grid/glow pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/18 via-transparent to-transparent opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#07aaab_1px,transparent_1px)] [background-size:14px_14px]" />

        {/* If image is present, display it with hover zoom; else show elegant placeholder with icon */}
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className={`w-full h-full transition-transform duration-500 ${
              project.imageClassName ?? 'object-contain p-1.5 group-hover:scale-[1.03]'
            }`}
            loading="lazy"
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center gap-1 p-1.5 text-center">
            <div className="p-2 rounded-xl bg-teal-950/45 border border-teal-500/30 shadow-[0_0_18px_rgba(7,170,171,0.2)] group-hover:scale-105 group-hover:border-teal-400/50 transition-all duration-300">
              {renderIcon(project.iconName)}
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-teal-400/60 group-hover:text-teal-300/90 transition-colors">
              Preview • Architecture
            </span>
          </div>
        )}

        {/* Diagonal Teal Winner Ribbon (Noticeably Bigger & Thicker, Scaled to Fit) */}
        {project.isWinner && (
          <div className="ribbon-wrapper">
            <div className="ribbon-teal">
              WINNER
            </div>
          </div>
        )}
      </div>

      {/* Middle & Bottom Content Container — Compact padding with aligned elements */}
      <div className="flex flex-col flex-1 p-3 sm:p-3.5 justify-between">
        <div className="space-y-1">
          {/* Golden Award Badge — Rectangular with subtle rounded corners */}
          {project.award && (
            <div className="flex items-center mb-[12px]">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-950/45 border border-amber-400/50 text-amber-300 text-[10.5px] font-semibold tracking-wide shadow-[0_0_10px_rgba(251,191,36,0.18)]">
                <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{project.award}</span>
              </div>
            </div>
          )}

          {/* Bold White Project Title */}
          <h3 className="text-white tracking-tight leading-snug group-hover:text-teal-200 transition-colors duration-200 whitespace-nowrap overflow-visible">
            {project.title.includes(' — ') ? (
              <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
                <span className="font-bold text-[13.5px] sm:text-[14.5px] md:text-[14px] lg:text-[14.5px] xl:text-[15.5px]">
                  {project.title.split(' — ')[0]} —
                </span>
                <span className="font-script font-bold text-[15px] sm:text-[16.5px] md:text-[16px] lg:text-[16.5px] xl:text-[18px] tracking-normal">
                  {project.title.split(' — ')[1]}
                </span>
              </span>
            ) : (
              <span className="text-[17px] sm:text-[19px] font-bold line-clamp-1">
                {project.title}
              </span>
            )}
          </h3>

          {/* Readable Description in Muted Gray */}
          <p className="text-[13px] sm:text-[13.5px] text-neutral-300/85 leading-relaxed font-normal mb-[14px]">
            {project.description}
          </p>

          {/* Categories & Technology Tags */}
          <div className="pt-0.5 flex flex-wrap items-center gap-1.5">
            {project.categories.map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-teal-500/10 border border-teal-400/30 text-teal-300"
              >
                {cat}
              </span>
            ))}
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-full text-[11px] font-mono text-teal-200/80 bg-white/[0.03] border border-teal-500/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Spacer to guarantee equal card heights and bottom-aligned buttons */}
        <div className="flex-1 min-h-1.5" />

        {/* Bottom — Action Buttons: Transparent-White & Solid White GitHub/Code */}
        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2.5 shrink-0 mt-1">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white/90 bg-white/[0.05] border border-white/20 hover:border-white/60 hover:bg-white/[0.15] hover:text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_0_18px_rgba(255,255,255,0.35)] transition-all duration-200 active:scale-95"
            >
              <span>View Project</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80" />
            </a>
          )}

          {project.paperUrl && (
            <a
              href={project.paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white/90 bg-white/[0.05] border border-white/20 hover:border-white/60 hover:bg-white/[0.15] hover:text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_0_18px_rgba(255,255,255,0.35)] transition-all duration-200 active:scale-95"
            >
              <span>View Paper</span>
              <FileText className="w-3.5 h-3.5 text-white/80" />
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider text-[#0e1616] bg-white border border-white hover:bg-white/90 hover:shadow-[0_0_16px_rgba(255,255,255,0.45)] transition-all duration-200 active:scale-95"
            >
              <span>View Code</span>
              <Github className="w-3.5 h-3.5 text-[#0e1616]" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
};
