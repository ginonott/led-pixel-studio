export type LedState = {
  r: number;
  b: number;
  g: number;
};

export type LedPosition = {
  relX: number;
  relY: number;
};

export type Scene = {
  id: string;
  name: string;
  ledPositions: {
    [led: string]: LedPosition | undefined;
  };
  frames: Frame[];
  fps: number;
  brightness: number;
};

export type Program = {
  id: string;
  name: string;
  data: string;
  fps: number;
};

export type PlayerState = {
  scene?: Scene;
  program?: string;
  isPlaying: boolean;
};

export type Frame = {
  ledStates: {
    [led: string]: LedState | undefined;
  };
};

export type MusicSyncSettings = {
  activationThreshold: number;
  transitionScale: number;
  lowRangeColorScale: number;
  midRangeColorScale: number;
  highRangeColorScale: number;
  lowRange: number;
  midRange: number;
};
