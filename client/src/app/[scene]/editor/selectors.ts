import { State } from "./state";

export function getSelectedLed(state: State): string | null {
  return state.currentTool.type === "select"
    ? state.currentTool.selectedLed
    : null;
}

export function getAdditionalSelectedLeds(state: State): string[] {
  return state.currentTool.type === "select"
    ? state.currentTool.additionalLeds
    : [];
}

export function getAllSelectedLeds(state: State): string[] {
  if (state.currentTool.type !== "select") {
    return [];
  }

  const leds = [];
  if (state.currentTool.selectedLed) {
    leds.push(state.currentTool.selectedLed);
  }

  leds.push(...state.currentTool.additionalLeds);

  return leds;
}

export function getNumberOfLeds(state: State) {
  return Object.keys(state.scene.ledPositions).length;
}

export function getAllSelectedFrames(state: State) {
  return [state.currentFrame, ...state.selectedFrames];
}
