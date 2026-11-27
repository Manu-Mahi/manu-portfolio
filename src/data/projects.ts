export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageClassName?: string;
  technologies: string[];
  categories: string[];
  award?: string; // e.g. "1st Place", "Best Paper Finalist", "Hackathon Winner"
  awardType?: 'first' | 'second' | 'finalist' | 'winner';
  isWinner?: boolean; // Controls folded ribbon display ("WINNER")
  githubUrl?: string;
  demoUrl?: string;
  paperUrl?: string;
  iconName?: 'robot' | 'brain' | 'box' | 'code' | 'globe' | 'sparkles';
}

export const PROJECTS_DATA: Project[] = [
  {
    id: 'project-1',
    title: 'BackTrack — AI Cognitive Assessment Tool',
    description: 'An AI-powered platform that analyzes speech during personal photo-based memory recall to help identify early signs of cognitive decline.',
    image: '/backtrack.jpg',
    imageClassName: 'object-cover scale-[1.55] object-center group-hover:scale-[1.6]',
    technologies: ['React', 'Node.js', 'Firebase', 'Gemini AI', 'ElevenLabs'],
    categories: [],
    award: '1st Place • WEHack General Track',
    awardType: 'first',
    isWinner: true,
    githubUrl: 'https://github.com/kxm1908/WeHack26',
    demoUrl: 'https://devpost.com/software/neurovault-uy3vqf',
    iconName: 'brain',
  },
  {
    id: 'project-2',
    title: 'SpeakThroughSigns — ASL Translator',
    description: 'An AI-powered tool that translates hand gestures into text in real time, making communication more accessible for the deaf and hard-of-hearing community.',
    image: '/project-2.jpg',
    technologies: ['Python', 'OpenCV', 'MediaPipe', 'AI/ML'],
    categories: [],
    award: '3rd Place • ThinkNeuro Demoday',
    awardType: 'winner',
    isWinner: true,
    githubUrl: 'https://github.com/Manu-Mahi/SpeakThroughSigns---Sign-Language-translator-learning-tool',
    demoUrl: 'https://www.youtube.com/watch?v=AcXf0S1JQo4',
    iconName: 'sparkles',
  },
  {
    id: 'project-3',
    title: 'Data-Centric AI — Image Classifier',
    description: 'Improved image classification accuracy to 95.02% by refining datasets, correcting labels, and analyzing embeddings rather than changing the model architecture.',
    image: '/project-3.jpg',
    technologies: ['Python', 'PyTorch', 'ResNet-18', '3LC'],
    categories: [],
    award: 'Best Embedding • 3LC × AWS Hackathon',
    awardType: 'winner',
    isWinner: true,
    githubUrl: 'https://github.com/Manu-Mahi/Hakuna-Matata---3LC-x-AWS-AI-Centric-Challenge/tree/master',
    iconName: 'box',
  },
  {
    id: 'project-4',
    title: 'Cueit — AI-Powered Smart Glasses',
    description: 'Built the software behind AI-powered smart glasses that recognize sign language gestures and translate them into context-aware speech in real time, improving communication accessibility in healthcare.',
    image: '/project-4.jpg',
    technologies: ['Python', 'MediaPipe', 'OpenCV', 'Claude AI', 'ElevenLabs'],
    categories: [],
    githubUrl: 'https://github.com/Manu-Mahi/SignBridge',
    demoUrl: 'https://www.youtube.com/watch?v=-HEfhNB5ZaU&source_ve_path=NzY3NTg&embeds_referring_euri=https%3A%2F%2Fdevpost.com%2F',
    iconName: 'robot',
  },
  {
    id: 'project-5',
    title: 'Hope Restored Missions — Inventory Tracker',
    description: 'Contributed to a nonprofit inventory management platform by improving size sorting, building admin and custom category interfaces, and enhancing QR code-based checkout workflows.',
    image: '/project-5.png',
    technologies: ['Vue.js', 'Nuxt.js', 'TypeScript', 'Prisma', 'SQLite'],
    categories: [],
    githubUrl: 'https://github.com/UTDallasEPICS/hope-restored',
    iconName: 'code',
  },
];
