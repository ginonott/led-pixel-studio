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
};

export type CurrentScene = {
  sceneId: string;
  isPlaying: boolean;
};

export type Frame = {
  ledStates: {
    [led: string]: LedState | undefined;
  };
};
