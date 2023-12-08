"use client";
import { Frame, LedState, Scene } from "@/app/models";
import { isOff } from "./led";
import { hexToRgb } from "@/app/utils";
import { cloneDeep } from "lodash";
import { getAllSelectedLeds } from "./selectors";

type Tool<
  Type extends string = "generic",
  Data extends Record<string, unknown> = {}
> = {
  type: Type;
} & Data;

type SelectTool = Tool<
  "select",
  { selectedLed: string | null; additionalLeds: string[] }
>;
export const DefaultSelectTool: SelectTool = {
  type: "select",
  selectedLed: null,
  additionalLeds: [],
};

type PaintTool = Tool<"paint", { color: string }>;
export const DefaultPaintTool: PaintTool = {
  type: "paint",
  color: "#00ff00",
};

type AddLedTool = Tool<"add-led">;
export const DefaultAddLedTool: AddLedTool = { type: "add-led" };

export type State = {
  scene: Scene;
  currentTool: SelectTool | PaintTool | AddLedTool;
  currentFrame: number;
  selectedFrames: number[];
  isMultiSelecting: boolean;
  isRangeSelecting: boolean;
  isPlaying: boolean;
  isLiveEnabled: boolean;
};

type AddLedAction = {
  type: "add-led";
  position?: {
    relX: number;
    relY: number;
  };
};
type SetLedPositionAction = {
  type: "set-led-position";
  led: string;
  relX: number;
  relY: number;
};
type SelectLedAction = {
  type: "select-led";
  led: string;
};
type DeslectAllLedsAction = {
  type: "deselect-all-leds";
};
type DeselectSecondaryFramesAction = {
  type: "deselect-secondary-frames";
};
type SetLedColorAction = {
  type: "set-led-color";
  color: string;
  led?: string;
};
type AddFrameAction = {
  type: "add-frame";
};
type RemoveFrameAction = {
  type: "remove-last-frame";
};
type SelectFrameAction = {
  type: "select-frame";
  frame: number;
};
type SetMultiSelectingAction = {
  type: "set-multi-selecting";
  isMultiSelecting: boolean;
};
type DeleteSelectedFramesAction = {
  type: "delete-selected-frames";
};
type RemoveLastLedAction = {
  type: "remove-last-led";
};
type PlayAction = {
  type: "play";
};
type StopAction = {
  type: "stop";
};
type SetRangeSelectingAction = {
  type: "set-range-selecting";
  isRangeSelecting: boolean;
};
type ChaseAction = {
  type: "chase";
  color: string;
  frames: number;
};
type SnakeAction = {
  type: "snake";
  frames: number;
};

type BlinkAction = {
  type: "blink";
  color: string;
  framesOn: number;
  framesOff: number;
  times: number;
};

type GlowAction = {
  type: "glow";
  fromColor: string;
  toColor: string;
  frames: number;
};

type SetterActions<
  K extends keyof State =
    | "isMultiSelecting"
    | "isRangeSelecting"
    | "currentTool"
    | "currentFrame"
    | "isLiveEnabled",
  V extends State[K] = State[K]
> = {
  type: "set-state";
  key: K;
  value: V;
};

type SceneSetterActions<
  K extends keyof Scene = "fps" | "name",
  V extends Scene[K] = Scene[K]
> = {
  type: "set-scene-value";
  key: K;
  value: V;
};

export type Action =
  | AddLedAction
  | SetLedPositionAction
  | SelectLedAction
  | DeslectAllLedsAction
  | SetLedColorAction
  | AddFrameAction
  | RemoveFrameAction
  | SelectFrameAction
  | SetMultiSelectingAction
  | DeselectSecondaryFramesAction
  | DeleteSelectedFramesAction
  | RemoveLastLedAction
  | PlayAction
  | StopAction
  | BlinkAction
  | GlowAction
  | SetRangeSelectingAction
  | SetterActions
  | SceneSetterActions
  | ChaseAction
  | SnakeAction;

export const defaultLedState: LedState = {
  r: 0,
  g: 0,
  b: 0,
};

// helpers
function getLedsList(state: State) {
  return Object.keys(state.scene.ledPositions);
}

function addLed(state: State, action: AddLedAction) {
  const led = Object.values(state.scene.ledPositions).length + 1;
  state.scene.ledPositions[led - 1] = action.position || {
    relX: 50,
    relY: 50,
  };

  return state;
}

function removeLastLed(state: State, action: RemoveLastLedAction) {
  const numLeds = Object.values(state.scene.ledPositions).filter(
    Boolean
  ).length;

  delete state.scene.ledPositions[numLeds - 1];

  return state;
}

function setLedPosition(state: State, action: SetLedPositionAction) {
  const ledPosition = state.scene.ledPositions[action.led];
  if (!ledPosition) return state;
  ledPosition.relX = action.relX;
  ledPosition.relY = action.relY;
  return state;
}

function selectLed(state: State, action: SelectLedAction) {
  if (state.currentTool.type !== "select") {
    return state;
  }

  const leds = getLedsList(state);

  if (leds.length < 1) {
    return state;
  }

  const selectTool = state.currentTool;

  if (state.isMultiSelecting) {
    if (action.led === "all") {
      selectTool.selectedLed = leds[0];
      selectTool.additionalLeds = leds;
    } else if (selectTool.additionalLeds.includes(action.led)) {
      selectTool.additionalLeds = selectTool.additionalLeds.filter(
        (led) => led !== action.led
      );
    } else {
      selectTool.additionalLeds.push(action.led);
    }
  } else if (state.isRangeSelecting && selectTool.selectedLed) {
    let start = Number.parseInt(selectTool.selectedLed);
    let end = Number.parseInt(action.led);

    if (start > end) {
      [start, end] = [end, start];
    }

    for (let i = start; i <= end; i++) {
      if (!state.currentTool.additionalLeds.includes(`${i}`)) {
        selectTool.additionalLeds.push(`${i}`);
      }
    }
  } else {
    selectTool.selectedLed = action.led;
    selectTool.additionalLeds = [];
  }

  return state;
}

function deselectAllLeds(state: State, action: DeslectAllLedsAction) {
  state.currentTool = DefaultSelectTool;
  return state;
}

function setLedColor(state: State, action: SetLedColorAction) {
  const selectedLeds = action.led ? [action.led] : getAllSelectedLeds(state);

  for (const frame of state.selectedFrames) {
    for (const led of selectedLeds) {
      const { r, g, b } = hexToRgb(action.color)!;

      if (isOff({ r, g, b })) {
        delete state.scene.frames[frame].ledStates[led];
      } else {
        state.scene.frames[frame].ledStates[led] = { r, g, b };
      }
    }
  }

  return state;
}

function blink(state: State, action: BlinkAction) {
  const selectedLeds = getAllSelectedLeds(state);
  if (selectedLeds.length < 1) {
    return state;
  }

  const { r, g, b } = hexToRgb(action.color)!;
  const primaryFrame = state.selectedFrames[0];
  const totalFrames = (action.framesOff + action.framesOn) * action.times;

  for (let i = 0; i < totalFrames; i++) {
    const isOn = i % (action.framesOn + action.framesOff) < action.framesOn;
    const currentFrame = primaryFrame + i;

    for (const led of selectedLeds) {
      if (state.scene.frames[currentFrame] === undefined) {
        state.scene.frames[currentFrame] = {
          ledStates: {},
        };
      }

      if (isOn) {
        state.scene.frames[currentFrame].ledStates[led] = { r, g, b };
      } else {
        delete state.scene.frames[currentFrame].ledStates[led];
      }
    }
  }

  return state;
}

function glow(state: State, action: GlowAction) {
  const selectedLeds = getAllSelectedLeds(state);
  if (selectedLeds.length < 1) {
    return state;
  }

  let { r: fromR, g: fromG, b: fromB } = hexToRgb(action.fromColor)!;
  let { r: toR, g: toG, b: toB } = hexToRgb(action.toColor)!;

  let startingFrame = state.selectedFrames[0];
  const totalFrames = action.frames;

  for (let i = 0; i < totalFrames; i++) {
    const currentFrame = startingFrame + i;

    for (const led of selectedLeds) {
      if (state.scene.frames[currentFrame] === undefined) {
        state.scene.frames[currentFrame] = {
          ledStates: {},
        };
      }

      const percent = i / totalFrames;
      const r = Math.floor(fromR + (toR - fromR) * percent);
      const g = Math.floor(fromG + (toG - fromG) * percent);
      const b = Math.floor(fromB + (toB - fromB) * percent);

      state.scene.frames[currentFrame].ledStates[led] = { r, g, b };
    }
  }

  [fromR, fromG, fromB, toR, toG, toB] = [toR, toG, toB, fromR, fromG, fromB];
  startingFrame = state.selectedFrames[0] + totalFrames;

  for (let i = 0; i < totalFrames; i++) {
    const currentFrame = startingFrame + i;

    for (const led of selectedLeds) {
      if (state.scene.frames[currentFrame] === undefined) {
        state.scene.frames[currentFrame] = {
          ledStates: {},
        };
      }

      const percent = i / totalFrames;
      const r = Math.floor(fromR + (toR - fromR) * percent);
      const g = Math.floor(fromG + (toG - fromG) * percent);
      const b = Math.floor(fromB + (toB - fromB) * percent);

      state.scene.frames[currentFrame].ledStates[led] = { r, g, b };
    }
  }

  return state;
}

function addFrame(state: State, action: AddFrameAction) {
  const frame: Frame = {
    ledStates: {},
  };
  state.scene.frames.push(frame);

  return state;
}

function removeFrame(state: State, action: RemoveFrameAction) {
  state.scene.frames.pop();

  return state;
}

function selectFrame(state: State, action: SelectFrameAction) {
  if (state.isRangeSelecting) {
    let start = state.currentFrame;
    let end = action.frame;

    if (start > end) {
      [start, end] = [end, start];
    }

    for (let i = start; i <= end; i++) {
      if (!state.selectedFrames.includes(i)) {
        state.selectedFrames.push(i);
      }
    }

    return state;
  }

  if (state.isMultiSelecting) {
    if (state.selectedFrames.includes(action.frame)) {
      state.selectedFrames = state.selectedFrames.filter(
        (frame) => frame !== action.frame
      );
    } else {
      state.selectedFrames.push(action.frame);
    }
  } else {
    state.currentFrame = action.frame;
    state.selectedFrames = [];
  }

  return state;
}

function handleSetterAction(state: State, action: SetterActions) {
  (state[action.key] as any) = action.value;
  return state;
}

function handleSceneSetterAction<
  K extends keyof Pick<Scene, "fps" | "name"> = "fps" | "name",
  V extends Scene[K] = Scene[K]
>(state: State, action: SceneSetterActions<K, V>) {
  if ((action.key === "fps" && (action.value as number) < 1) || !action.value) {
    (state.scene[action.key] as any) = 1;
    return state;
  }

  state.scene[action.key] = action.value;
  return state;
}

function setMultiSelecting(state: State, action: SetMultiSelectingAction) {
  state.isMultiSelecting = action.isMultiSelecting;
  return state;
}

function setRangeSelecting(state: State, action: SetRangeSelectingAction) {
  state.isRangeSelecting = action.isRangeSelecting;
  return state;
}

function deselectSecondaryFrames(state: State) {
  state.selectedFrames = [state.selectedFrames[0]];
  return state;
}

function deleteSelectedFrames(state: State) {
  const primarySelectedFrame = state.currentFrame;
  const selectedFrames = [primarySelectedFrame, ...state.selectedFrames].sort(
    (a, b) => b - a
  );
  for (const frame of selectedFrames) {
    state.scene.frames.splice(frame, 1);
  }

  state.currentFrame = Math.max(primarySelectedFrame - 1, 0);
  state.selectedFrames = [];

  return state;
}

function play(state: State) {
  state.isPlaying = true;
  state.selectedFrames = [0];
  state.currentTool = DefaultSelectTool;

  return state;
}

function stop(state: State) {
  state.isPlaying = false;
  return state;
}

function chaseAnimatimation(state: State, action: ChaseAction) {
  const selectedLeds = getAllSelectedLeds(state);
  if (selectedLeds.length < 1) {
    return state;
  }

  const colors = ["#ff0000", "#00ff00", "#0000ff"];
  const frames = action.frames;

  for (let i = 0; i < frames; i++) {
    const currentFrame = state.selectedFrames[0] + i;

    for (const led of selectedLeds) {
      if (state.scene.frames[currentFrame] === undefined) {
        state.scene.frames[currentFrame] = {
          ledStates: {},
        };
      }

      const color = colors[i % colors.length];
      const { r, g, b } = hexToRgb(color)!;

      state.scene.frames[currentFrame].ledStates[led] = { r, g, b };
    }
  }

  return state;
}

function snakeAnimation(state: State, action: SnakeAction) {
  const colors = ["#ff0000", "#00ff00", "#0000ff"];
  const frames = action.frames;
  let colorIndex = 0;
  const snakeLength = 3;

  for (let i = 0; i < frames; i++) {
    const currentFrame = state.selectedFrames[0] + i;

    if (state.scene.frames[currentFrame] === undefined) {
      state.scene.frames[currentFrame] = {
        ledStates: {},
      };
    }

    const keys = Object.keys(state.scene.ledPositions);
    const repeat = 5;

    for (let led = 0; led < keys.length; led += repeat) {
      const color = colors[colorIndex % colors.length];
      colorIndex += 1;

      delete state.scene.frames[currentFrame].ledStates[led];

      for (let snake = 0; snake < snakeLength; snake++) {
        const ledIndex = led + snake;
        if (ledIndex < keys.length) {
          console.log(`settiing ${ledIndex} to ${color}`);
          const colorHex = hexToRgb(color)!;
          state.scene.frames[currentFrame].ledStates[`${ledIndex}`] = colorHex;
        }
      }
    }
    break;
  }

  return state;
}

function exhaustiveSwitch(_: never) {}

export function reducer(state: State, action: Action): State {
  if (
    state.isPlaying &&
    !(["stop", "select-frame"] as Array<Action["type"]>).includes(action.type)
  ) {
    return state;
  }

  let newState = cloneDeep(state);
  switch (action.type) {
    case "add-led":
      newState = addLed(newState, action);
      break;
    case "set-led-position":
      newState = setLedPosition(newState, action);
      break;
    case "select-led":
      newState = selectLed(newState, action);
      break;
    case "deselect-all-leds":
      newState = deselectAllLeds(newState, action);
      break;
    case "set-led-color":
      newState = setLedColor(newState, action);
      break;
    case "add-frame":
      newState = addFrame(newState, action);
      break;
    case "remove-last-frame":
      newState = removeFrame(newState, action);
      break;
    case "select-frame":
      newState = selectFrame(newState, action);
      break;
    case "set-multi-selecting":
      newState = setMultiSelecting(newState, action);
      break;
    case "deselect-secondary-frames":
      newState = deselectSecondaryFrames(newState);
      break;
    case "delete-selected-frames":
      newState = deleteSelectedFrames(newState);
      break;
    case "remove-last-led":
      newState = removeLastLed(newState, action);
      break;
    case "play":
      newState = play(newState);
      break;
    case "stop":
      newState = stop(newState);
      break;
    case "blink":
      newState = blink(newState, action);
      break;
    case "glow":
      newState = glow(newState, action);
      break;
    case "set-range-selecting":
      newState = setRangeSelecting(newState, action);
      break;
    case "set-state":
      newState = handleSetterAction(newState, action);
      break;
    case "set-scene-value":
      newState = handleSceneSetterAction(newState, action);
      break;
    case "chase":
      newState = chaseAnimatimation(newState, action);
      break;
    case "snake":
      newState = snakeAnimation(newState, action);
      break;
    default:
      exhaustiveSwitch(action);
      break;
  }

  // always ensure we have at least one frame and that the current frame is in bounds
  if (newState.currentFrame > newState.scene.frames.length - 1) {
    newState.currentFrame = 0;
  }

  if (newState.currentFrame < 0) {
    newState.currentFrame = 0;
  }

  if (newState.scene.frames.length === 0) {
    newState.scene.frames.push({
      ledStates: {},
    });
  }

  return newState;
}

// selectors
export function getPrimarySelectedLedState(state: State): LedState {
  const primarySelectedLED =
    state.currentTool.type === "select"
      ? state.currentTool.selectedLed || ""
      : "";
  const primarySelectedFrame = state.selectedFrames[0] ?? 0;
  return (
    state.scene.frames[primarySelectedFrame].ledStates[primarySelectedLED] ??
    defaultLedState
  );
}
