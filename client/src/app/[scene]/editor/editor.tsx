"use client";

import { Draggable } from "@/app/Draggable";
import { Frame, Scene } from "@/app/models";
import { Dispatch, Ref, useReducer, useRef } from "react";
import Led from "./led";
import Timeline from "./timeline";
import { DndContext, useDroppable } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { ToolPanel } from "./tool-panel";
import { State, defaultLedState, Action, reducer } from "./state";
import { useKeyboardListeners } from "./useKeyboardListeners";
import { useAnimateScene } from "./useAnimateScene";
import { useSave } from "./useSave";
import { EditorTools } from "./EditorTools";

function Canvas({
  state,
  dispatch,
  setRef,
}: {
  state: State;
  dispatch: Dispatch<Action>;
  setRef: (ref: HTMLElement | null) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: "droppable",
  });

  const selectedFrame: Frame = state.scene.frames[state.selectedFrames[0] ?? 0];

  return (
    <div
      className="flex-1 relative mb-8 mr-8"
      ref={(node) => {
        setNodeRef(node);
        setRef(node);
      }}
    >
      <ToolPanel state={state} dispatch={dispatch} />
      {Object.entries(state.scene.ledPositions).map(([led, position]) => {
        const ledState = selectedFrame.ledStates[led] ?? defaultLedState;
        const primarySelectedLED = state.selectedLeds[0];
        const secondarySelectedLEDs = state.selectedLeds.slice(1);

        if (!position) return null;
        if (state.isPlaying) {
          return (
            <Led
              key={led}
              ledPosition={position}
              ledState={ledState}
              isPrimarySelected={led === primarySelectedLED}
              isSecondarySelected={secondarySelectedLEDs.includes(led)}
              ledNumber={led}
            />
          );
        }

        return (
          <Draggable
            key={led}
            id={led}
            initialPosition={{ left: position.relX, top: position.relY }}
          >
            <Led
              ledPosition={position}
              ledState={ledState}
              isPrimarySelected={led === primarySelectedLED}
              isSecondarySelected={secondarySelectedLEDs.includes(led)}
              ledNumber={led}
            />
          </Draggable>
        );
      })}
    </div>
  );
}

export default function SceneEditor({ scene: initialScene }: { scene: Scene }) {
  const canvasRef = useRef<HTMLElement | null>(null);

  const [state, dispatch] = useReducer(reducer, {
    scene: initialScene,
    selectedLeds: [],
    selectedFrames: [0],
    isMultiSelecting: false,
    isRangeSelecting: false,
    isPlaying: false,
  });

  const { handleSave, lastSaved } = useSave(state);

  const { toggleAnimationState } = useAnimateScene(dispatch, state);

  useKeyboardListeners(dispatch, state);

  const disabled = state.isPlaying;

  return (
    <DndContext
      modifiers={[restrictToParentElement]}
      onDragStart={(event) => {
        const led = event.active.id;
        dispatch({ type: "select-led", led: `${led}` });
      }}
      onDragEnd={(event) => {
        if (!canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();

        const rect = event.active.rect.current.translated;

        if (!rect) return;

        const led = event.active.id;

        const relX = ((rect.left - canvasRect.left) / canvasRect.width) * 100;
        const relY = ((rect.top - canvasRect.top) / canvasRect.height) * 100;

        dispatch({
          type: "set-led-position",
          led: `${led}`,
          relX,
          relY,
        });
      }}
    >
      <div className="w-screen h-screen flex flex-col p-4">
        <EditorTools
          state={state}
          dispatch={dispatch}
          disabled={disabled}
          toggleAnimationState={toggleAnimationState}
          handleSave={handleSave}
          lastSaved={lastSaved}
        />
        <Canvas
          state={state}
          dispatch={dispatch}
          setRef={(element) => {
            canvasRef.current = element;
          }}
        />

        <div className="flex flex-row overflow-y-auto">
          <Timeline
            key={Math.random()}
            frames={state.scene.frames}
            selectedFrames={state.selectedFrames}
            selectedLeds={state.selectedLeds}
            onSelectFrame={(frame) => {
              dispatch({ type: "select-frame", frame });
            }}
            fps={state.scene.fps}
          />
        </div>
      </div>
    </DndContext>
  );
}
