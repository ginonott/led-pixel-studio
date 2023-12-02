"use client";
import { Dispatch, useCallback, useEffect, useRef } from "react";
import { State, Action } from "./state";

export function useAnimateScene(dispatch: Dispatch<Action>, state: State) {
  const animationState = useRef({
    isPlaying: false,
    totalFrames: 0,
    currentFrame: 0,
  });

  useEffect(() => {
    function animation() {
      if (!animationState.current.isPlaying) return;
      const { currentFrame, totalFrames } = animationState.current;
      let nextFrame = currentFrame + 1;
      if (nextFrame >= totalFrames) {
        nextFrame = 0;
      }

      animationState.current.currentFrame = nextFrame;
      dispatch({ type: "select-frame", frame: nextFrame });
    }
    const handle = setInterval(animation, 1000 / state.scene.fps);

    return () => {
      clearInterval(handle);
    };
  }, [dispatch, state.scene.fps]);

  const toggleAnimationState = useCallback(() => {
    animationState.current.isPlaying = !state.isPlaying;
    animationState.current.totalFrames = state.scene.frames.length;
    animationState.current.currentFrame = 0;

    dispatch({ type: state.isPlaying ? "stop" : "play" });
  }, [dispatch, state.isPlaying, state.scene.frames.length]);

  return {
    toggleAnimationState,
  };
}
