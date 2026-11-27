import React from 'react';
import { ProjectCard } from './ProjectCard';
import { PROJECTS_DATA } from '../data/projects';

interface ProjectsSectionProps {
  onInteractiveEnter?: () => void;
  onInteractiveLeave?: () => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onInteractiveEnter,
  onInteractiveLeave,
}) => {
  return (
    <section
      id="projects"
      className="relative z-10 w-full min-h-screen bg-[#0A0A0A] text-white pt-28 sm:pt-32 md:pt-36 pb-36 sm:pb-44 md:pb-48 px-6 sm:px-10 md:px-14 lg:px-20 xl:px-28 border-t border-teal-500/20"
    >
      {/* Subtle ambient teal background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85vw] max-w-5xl h-80 bg-teal-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-600/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Centered, clean container with compact maximum width (~4-5% width reduction from 1175px to 1125px) */}
      <div className="relative w-full max-w-[1125px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Projects <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-teal-100">I've Worked On</span>
          </h2>
        </div>

        {/* 3-Column Grid for Row 1, Centered 2-Column for Row 2 */}
        <div className="flex flex-col gap-5 lg:gap-6">
          {/* Row 1: 3 Project Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {PROJECTS_DATA.slice(0, 3).map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={idx}
                onInteractiveEnter={onInteractiveEnter}
                onInteractiveLeave={onInteractiveLeave}
              />
            ))}
          </div>

          {/* Row 2: 2 Project Cards Centered Horizontally */}
          {PROJECTS_DATA.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              <div className="hidden lg:block lg:col-span-3">
                <div className="flex justify-center gap-5 lg:gap-6">
                  {PROJECTS_DATA.slice(3).map((project, idx) => (
                    <div key={project.id} className="w-[calc((100%-2*1.5rem)/3)]">
                      <ProjectCard
                        project={project}
                        index={3 + idx}
                        onInteractiveEnter={onInteractiveEnter}
                        onInteractiveLeave={onInteractiveLeave}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Fallback for mobile and tablet */}
              <div className="contents lg:hidden">
                {PROJECTS_DATA.slice(3).map((project, idx) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={3 + idx}
                    onInteractiveEnter={onInteractiveEnter}
                    onInteractiveLeave={onInteractiveLeave}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
