"use client";

import { Draggable } from "@/app/Draggable";
import { Frame, Scene } from "@/app/models";
import { Dispatch, Ref, useReducer, useRef } from "react";
import Led from "./led";
import Timeline from "./timeline";
import { DndContext, useDroppable } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { ToolPanel } from "./tool-panel";
import {
  State,
  defaultLedState,
  Action,
  reducer,
  DefaultSelectTool,
} from "./state";
import { useKeyboardListeners } from "./useKeyboardListeners";
import { useAnimateScene } from "./useAnimateScene";
import { useSave } from "./useSave";
import { EditorTools } from "./EditorTools";
import {
  getAdditionalSelectedLeds,
  getAllSelectedLeds,
  getSelectedLed,
} from "./selectors";
import BrushCursor from "./brush.png";

function calculateRelativePosition(
  canvasRect: DOMRect,
  x: number,
  y: number
): { relX: number; relY: number } {
  const relX = ((x - canvasRect.left) / canvasRect.width) * 100;
  const relY = ((y - canvasRect.top) / canvasRect.height) * 100;

  return { relX, relY };
}

function Canvas({
  state,
  dispatch,
  setRef,
}: {
  state: State;
  dispatch: Dispatch<Action>;
  setRef: (ref: HTMLElement | null) => void;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const { setNodeRef } = useDroppable({
    id: "droppable",
  });

  const selectedFrame: Frame = state.scene.frames[state.selectedFrames[0] ?? 0];
  const selectedLed = getSelectedLed(state);
  const additionalSelectedLeds = getAdditionalSelectedLeds(state);
  const cursorStyle =
    state.currentTool.type === "paint"
      ? `url(${BrushCursor.src}) 0 24, auto`
      : "auto";

  return (
    <div
      className={`flex-1 relative mb-8 mr-8`}
      style={{
        cursor: cursorStyle,
      }}
      ref={(node) => {
        setNodeRef(node);
        setRef(node);
        canvasRef.current = node;
      }}
      onClick={(event) => {
        if (!canvasRef.current) {
          return;
        }

        if (state.currentTool.type === "add-led") {
          console.log("adding led");
          dispatch({
            type: "add-led",
            position: calculateRelativePosition(
              canvasRef.current.getBoundingClientRect(),
              event.clientX,
              event.clientY
            ),
          });
        }
      }}
    >
      <ToolPanel state={state} dispatch={dispatch} />
      {Object.entries(state.scene.ledPositions).map(([led, position]) => {
        const ledState = selectedFrame.ledStates[led] ?? defaultLedState;

        if (!position) return null;
        if (state.isPlaying) {
          return (
            <Led
              key={led}
              ledPosition={position}
              ledState={ledState}
              isPrimarySelected={led === selectedLed}
              isSecondarySelected={additionalSelectedLeds.includes(led)}
              ledNumber={led}
            />
          );
        }

        return (
          <Draggable
            key={led}
            id={led}
            initialPosition={{ left: position.relX, top: position.relY }}
            disabled={state.currentTool.type !== "select"}
            style={{
              cursor: cursorStyle,
            }}
          >
            <Led
              ledPosition={position}
              ledState={ledState}
              isPrimarySelected={led === selectedLed}
              isSecondarySelected={additionalSelectedLeds.includes(led)}
              ledNumber={led}
              onMouseOver={(event) => {
                if (state.currentTool.type === "paint" && event.buttons === 1) {
                  dispatch({
                    type: "set-led-color",
                    led,
                    color: state.currentTool.color,
                  });
                }
              }}
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
    currentTool: DefaultSelectTool,
    currentFrame: 0,
  } as State);

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

        const { relX, relY } = calculateRelativePosition(
          canvasRect,
          rect.left,
          rect.top
        );

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

        <Timeline state={state} dispatch={dispatch} />
      </div>
    </DndContext>
  );
}
