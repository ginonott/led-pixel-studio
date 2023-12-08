"use client";
import { Button, HorizontalDivider, Label } from "@/app/components";
import { IconButton } from "@/app/icons/icons";
import { rgbToHex } from "@/app/utils";
import { Dispatch, useState } from "react";
import { isOn } from "./led";
import { Action, State, getPrimarySelectedLedState } from "./state";

function ToolPanelContainer({ children }: { children: React.ReactNode }) {
  const [isOpen, open] = useState(true);

  return (
    <div className="absolute top-4 left-4 min-w-[256px] border-2 border-black">
      <div className="border-b-2 border-black flex flex-row items-center">
        <IconButton
          size="sm"
          name={isOpen ? "remove" : "add"}
          onClick={() => open(!isOpen)}
        />
        <div className="ml-2">Tools</div>
      </div>
      <div className="max-h-[80vh] overflow-y-auto p-2">
        {isOpen && children}
      </div>
    </div>
  );
}

function LEDTools({
  state,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) {
  const [blinkInput, setBlinkInput] = useState({
    times: 3,
    framesOn: 3,
    framesOff: 2,
  });
  const [glowInput, setGlowInput] = useState({
    fromColor: "#ff0000",
    toColor: "#00ff00",
    frames: 30,
  });

  const primarySelectedLed = getPrimarySelectedLedState(state);
  const isPrimaryLedOn = isOn(primarySelectedLed);
  const primaryColor = rgbToHex(
    primarySelectedLed.r,
    primarySelectedLed.g,
    primarySelectedLed.b
  );

  return (
    <div className="flex flex-col space-y-2 p-4">
      <Button
        variant="default"
        onClick={() => {
          if (isPrimaryLedOn) {
            dispatch({ type: "set-led-color", color: "#000000" });
          } else {
            dispatch({ type: "set-led-color", color: "#ff0000" });
          }
        }}
      >
        {isPrimaryLedOn ? "Turn Off" : "Turn On"}
      </Button>
      <Label label="Color: ">
        <input
          type="color"
          value={primaryColor}
          onChange={(event) => {
            dispatch({
              type: "set-led-color",
              color: event.target.value,
            });
          }}
        />
      </Label>
      <HorizontalDivider />
      <Label label="Blink Times: ">
        <input
          type="number"
          value={blinkInput.times}
          onChange={(event) => {
            setBlinkInput({
              ...blinkInput,
              times: parseInt(event.target.value),
            });
          }}
        />
      </Label>
      <Label label="Frames On: ">
        <input
          type="number"
          value={blinkInput.framesOn}
          onChange={(event) => {
            setBlinkInput({
              ...blinkInput,
              framesOn: parseInt(event.target.value),
            });
          }}
        />
      </Label>
      <Label label="Frames Off: ">
        <input
          type="number"
          value={blinkInput.framesOff}
          onChange={(event) => {
            setBlinkInput({
              ...blinkInput,
              framesOff: parseInt(event.target.value),
            });
          }}
        />
      </Label>
      <Button
        variant="default"
        onClick={() => {
          dispatch({
            type: "blink",
            color: primaryColor,
            times: 3,
            framesOn: 3,
            framesOff: 2,
          });
        }}
      >
        Blink
      </Button>
      <HorizontalDivider />
      <Label label="From: ">
        <input
          type="color"
          value={glowInput.fromColor}
          onChange={(event) => {
            setGlowInput({
              ...glowInput,
              fromColor: event.target.value,
            });
          }}
        />
      </Label>
      <Label label="To: ">
        <input
          type="color"
          value={glowInput.toColor}
          onChange={(event) => {
            setGlowInput({
              ...glowInput,
              toColor: event.target.value,
            });
          }}
        />
      </Label>
      <Label label="Frames: ">
        <input
          type="number"
          value={glowInput.frames}
          onChange={(event) => {
            setGlowInput({
              ...glowInput,
              frames: parseInt(event.target.value),
            });
          }}
        />
      </Label>
      <Button
        variant="default"
        onClick={() => {
          dispatch({
            type: "glow",
            fromColor: glowInput.fromColor,
            toColor: glowInput.toColor,
            frames: glowInput.frames,
          });
        }}
      >
        Glow
      </Button>
      <HorizontalDivider />
      <div className="mx-8" />
      <Button
        variant="default"
        onClick={() => {
          dispatch({
            type: "chase",
            color: primaryColor,
            frames: 30,
          });
        }}
      >
        Chase
      </Button>
      <div className="mx-8" />
      <Button
        variant="default"
        onClick={() => {
          dispatch({
            type: "snake",
            frames: 30,
          });
        }}
      >
        Snake
      </Button>
    </div>
  );
}

export function ToolPanel({
  state,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) {
  const areLedsSelected = state.selectedLeds.length > 0;

  return (
    <ToolPanelContainer>
      <Label label="FPS: ">
        <input
          type="number"
          value={state.scene.fps}
          min={1}
          max={30}
          onChange={(evt) => {
            dispatch({
              type: "set-scene-value",
              key: "fps",
              value: parseInt(evt.target.value) ?? 15,
            });
          }}
        />
      </Label>
      <HorizontalDivider />
      {areLedsSelected ? (
        <LEDTools state={state} dispatch={dispatch} />
      ) : (
        "Select LEDs for more options"
      )}
    </ToolPanelContainer>
  );
}
