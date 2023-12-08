"use client";
import { Dispatch, useEffect } from "react";
import { State, Action } from "./state";

export function useKeyboardListeners(dispatch: Dispatch<Action>, state: State) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Meta") {
        dispatch({ type: "set-multi-selecting", isMultiSelecting: true });
      }

      if (event.key.toLowerCase() === "a" && state.isMultiSelecting) {
        dispatch({ type: "select-led", led: "all" });
      }

      if (event.key === "Shift") {
        dispatch({ type: "set-range-selecting", isRangeSelecting: true });
      }

      if (event.key === "Escape") {
        dispatch({ type: "deselect-all-leds" });
        dispatch({ type: "deselect-secondary-frames" });
      }

      if (event.key === "Delete") {
        dispatch({ type: "delete-selected-frames" });
      }

      if (event.key === "ArrowRight") {
        const selectedFrame = state.currentFrame;

        dispatch({
          type: "select-frame",
          frame: Math.min(selectedFrame + 1, state.scene.frames.length - 1),
        });
      }

      if (event.key === "ArrowLeft") {
        const selectedFrame = state.currentFrame;

        dispatch({
          type: "select-frame",
          frame: Math.max(selectedFrame - 1, 0),
        });
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === "Meta") {
        dispatch({ type: "set-multi-selecting", isMultiSelecting: false });
      }

      if (event.key === "Shift") {
        dispatch({ type: "set-range-selecting", isRangeSelecting: false });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    dispatch,
    state.selectedFrames,
    state.scene.frames.length,
    state.isMultiSelecting,
    state.currentFrame,
  ]);
}
