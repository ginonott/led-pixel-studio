"use client";
import { Button, Container, HorizontalDivider, Label } from "@/app/components";
import { IconButton } from "@/app/icons/icons";
import { rgbToHex } from "@/app/utils";
import { Dispatch, useState } from "react";
import { isOn } from "./led";
import { Action, State, getPrimarySelectedLedState } from "./state";
import { getAllSelectedLeds } from "./selectors";

// 10 shades of blue, red, green, yellow, cyan, magenta
const colors = [
  "#ff0000",
  "#ff1a1a",
  "#ff3333",
  "#ff4d4d",
  "#ff6666",
  "#ff8080",
  "#ff9999",
  "#ffb3b3",
  "#ffcccc",
  "#ffe6e6",
  "#00ff00",
  "#1aff1a",
  "#33ff33",
  "#4dff4d",
  "#66ff66",
  "#80ff80",
  "#99ff99",
  "#b3ffb3",
  "#ccffcc",
  "#e6ffe6",
  "#0000ff",
  "#1a1aff",
  "#3333ff",
  "#4d4dff",
  "#6666ff",
  "#8080ff",
  "#9999ff",
  "#b3b3ff",
  "#ccccff",
  "#e6e6ff",
  "#ffff00",
  "#ffff1a",
  "#ffff33",
  "#ffff4d",
  "#ffff66",
  "#ffff80",
  "#ffff99",
  "#ffffb3",
  "#ffffcc",
  "#ffffe6",
  "#00ffff",
  "#1affff",
  "#33ffff",
  "#4dffff",
  "#66ffff",
  "#80ffff",
  "#99ffff",
  "#b3ffff",
  "#ccffff",
  "#e6ffff",
  "#ff00ff",
  "#ff1aff",
  "#ff33ff",
  "#ff4dff",
  "#ff66ff",
  "#ff80ff",
  "#ff99ff",
  "#ffb3ff",
  "#ffccff",
  "#ffe6ff",
];

function ToolPanelContainer({ children }: { children: React.ReactNode }) {
  const [isOpen, open] = useState(true);

  return (
    <div className="absolute top-4 left-4 w-[20vw] border-2 border-black cursor-default max-h-[80vh] overflow-y-auto">
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
  const selectedLeds = getAllSelectedLeds(state);

  if (selectedLeds.length === 0) {
    return (
      <p>
        Select an LED for more options. Hint: you can CMD click and shift click
        for multiselect!
      </p>
    );
  }

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
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();

          const formData = new FormData(event.target as HTMLFormElement);
          const color = formData.get("blink-color") as string;
          const times = parseInt(formData.get("blink-times") as string);
          const framesOn = parseInt(formData.get("blink-frames-on") as string);
          const framesOff = parseInt(
            formData.get("blink-frames-off") as string
          );
          dispatch({
            type: "blink",
            color,
            times,
            framesOn,
            framesOff,
          });
        }}
      >
        <Label label="Blink Times: ">
          <input
            type="number"
            name="blink-times"
            min={1}
            defaultValue={3}
            required
          />
        </Label>
        <Label label="Frames On: ">
          <input
            type="number"
            name="blink-frames-on"
            min={1}
            defaultValue={3}
            required
          />
        </Label>
        <Label label="Frames Off: ">
          <input
            type="number"
            name="blink-frames-off"
            min={0}
            defaultValue={3}
            required
          />
        </Label>
        <Button
          variant="default"
          type="submit"
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
      </form>

      <HorizontalDivider />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();

          const formData = new FormData(event.target as HTMLFormElement);
          const fromColor = formData.get("transistion-from-color") as string;
          const toColor = formData.get("transistion-to-color") as string;
          const frames = parseInt(formData.get("transistion-frames") as string);
          dispatch({
            type: "glow",
            fromColor,
            toColor,
            frames,
          });
        }}
      >
        <Label label="From: ">
          <input
            type="color"
            name="transistion-from-color"
            required
            defaultValue="#ff0000"
          />
        </Label>
        <Label label="To: ">
          <input
            type="color"
            name="transistion-to-color"
            required
            defaultValue="#00ff00"
          />
        </Label>
        <Label label="Frames: ">
          <input
            type="number"
            name="transistion-frames"
            min={15}
            required
            defaultValue={15}
          />
        </Label>
        <Button variant="default" type="submit" style={{ width: "100%" }}>
          Glow
        </Button>
      </form>

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

function PaintTools({
  state,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) {
  if (state.currentTool.type !== "paint") {
    return null;
  }

  const currentColor = state.currentTool.color;
  return (
    <div>
      <p>Colors</p>
      <div className="flex flex-row flex-wrap gap-4">
        {colors.map((c) => {
          return (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                backgroundColor: c,
                border: c === currentColor ? "1px solid black" : "none",
                margin: c === currentColor ? 0 : 2,
              }}
              key={c}
              onClick={() => {
                dispatch({
                  type: "set-state",
                  key: "currentTool",
                  value: { type: "paint", color: c },
                });
              }}
            />
          );
        })}
      </div>
      <Label label="Custom Color">
        <input
          type="color"
          value={currentColor}
          onChange={(event) => {
            dispatch({
              type: "set-state",
              key: "currentTool",
              value: { type: "paint", color: event.target.value },
            });
          }}
        />
      </Label>
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
  const selectTools =
    state.currentTool.type === "select" ? (
      <LEDTools state={state} dispatch={dispatch} />
    ) : null;

  const paintTools =
    state.currentTool.type === "paint" ? (
      <PaintTools state={state} dispatch={dispatch} />
    ) : null;

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
      <Label label="Brightness: ">
        <input
          type="number"
          value={state.scene.brightness}
          min={1}
          max={100}
          onChange={(evt) => {
            dispatch({
              type: "set-scene-value",
              key: "brightness",
              value: parseInt(evt.target.value) ?? 100,
            });
          }}
        />
      </Label>
      <HorizontalDivider />
      {selectTools}
      {paintTools}
    </ToolPanelContainer>
  );
}
