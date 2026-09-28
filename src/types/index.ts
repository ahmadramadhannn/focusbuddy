export type ToolType = 
  | 'punch' 
  | 'mop' 
  | 'squeegee' 
  | 'water' 
  | 'paint' 
  | 'bubble_wrap' 
  | 'laser' 
  | 'sticker' 
  | 'inspect';

export interface GlassCrackBranch {
  angle: number;
  length: number;
  subBranches: { angle: number; length: number }[];
}

export interface GlassCrack {
  id: string;
  x: number;
  y: number;
  radius: number;
  severity: number; // 1 to 5
  rings: number;
  branches: GlassCrackBranch[];
  holeRadius: number;
  shatteredShards: {
    points: { x: number; y: number }[];
    offset: { x: number; y: number };
    alpha: number;
    color: string;
  }[];
  createdAt: number;
}

export interface Droplet {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  type: 'water' | 'paint';
  dripLength: number;
  maxDripLength: number;
  speed: number;
  opacity: number;
  splatPoints?: { x: number; y: number }[];
}

export interface ScreenSticker {
  id: string;
  x: number;
  y: number;
  text: string;
  emoji: string;
  color: string;
  rotation: number;
}

export interface WipeTrail {
  x: number;
  y: number;
  radius: number;
}

export type CatBreed = 'orange_tabby' | 'calico' | 'tuxedo' | 'void_black' | 'snow_white';
export type CatState = 'loaf' | 'sleep' | 'pounce' | 'purr' | 'groom' | 'stalk';

export interface CatData {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  breed: CatBreed;
  state: CatState;
  facing: 'left' | 'right';
  purrIntensity: number;
  petsCount: number;
  thought: string;
  thoughtExpires: number;
}

export type CoachPersonality = 'boss' | 'sensei' | 'alarm' | 'duck' | 'cat';

export interface FocusGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface DesktopWindow {
  id: 'code' | 'spreadsheet' | 'notes' | 'bubble_wrap' | 'focus_hub' | 'stream_guide';
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export type WallpaperTheme = 
  | 'cozy_desk' 
  | 'nature_twilight' 
  | 'dark_slate' 
  | 'cyber_neon' 
  | 'matrix_green'
  | 'live_screen';
