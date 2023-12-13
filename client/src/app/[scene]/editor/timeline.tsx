import { Frame as FrameType } from "@/app/models";
import { isOn } from "./led";
import { rgbToHex } from "@/app/utils";
import { BareIcon, IconButton } from "@/app/icons/icons";
import { HorizontalDivider } from "@/app/components";
import { Action, State } from "./state";
import { Dispatch } from "react";
import { getAllSelectedLeds } from "./selectors";

function CaretDiv() {
  return (
    <div className="w-2 h-2 border-t-4 border-b-4 border-orange-500 transform rotate-45" />
  );
}

function Frame({
  frame,
  frameNumber,
  isPrimarySelected,
  isSecondarySelected,
  selectedLeds,
  onClick,
}: {
  frame: FrameType;
  frameNumber: number;
  isPrimarySelected: boolean;
  isSecondarySelected: boolean;
  selectedLeds: string[];
  onClick: () => void;
}) {
  const background =
    isPrimarySelected || isSecondarySelected ? "bg-blue-300" : "bg-blue-100";
  const primarySelectedLedState = frame.ledStates[selectedLeds[0] ?? -1];
  const dotColor =
    primarySelectedLedState && isOn(primarySelectedLedState)
      ? `rgb(${primarySelectedLedState.r},${primarySelectedLedState.g},${primarySelectedLedState.b})`
      : primarySelectedLedState === undefined
      ? "rgba(0,0,0,0)"
      : "rgb(0,0,0)";

  return (
    <div
      className={`w-8 h-full flex flex-col justify-center items-center border-r-2 border-black ${background}`}
      onClick={onClick}
    >
      <div
        className={`rounded-full w-4 h-4`}
        style={{ backgroundColor: dotColor }}
      />
      <div>{frameNumber}</div>
    </div>
  );
}

export default function Timeline({
  state,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) {
  const frames = state.scene.frames;
  const primarySelectedFrame = state.currentFrame;
  const secondarySelectedFrames = state.selectedFrames;
  const fps = state.scene.fps;
  const selectedLeds = getAllSelectedLeds(state);
  return (
    <div className="border-4 border-black h-[4rem] flex flex-row">
      <div className="min-w-[200px] max-w-[300px]">
        <div>Frames: {frames.length} </div>
        <div>Total Time: {(frames.length / fps).toFixed(2)}s</div>
      </div>
      <div className="flex flex-col w-8 text-center justify-stretch">
        <div
          className="hover:bg-blue-400"
          role="button"
          onClick={() => {
            dispatch({ type: "add-frame" });
          }}
        >
          <BareIcon name="add" />
        </div>
        <div
          className="hover:bg-red-400"
          onClick={() => {
            dispatch({ type: "remove-last-frame" });
          }}
        >
          <BareIcon name="remove" />
        </div>
      </div>
      <div className="flex flex-row overflow-x-auto timeline-frames">
        {frames.map((frame, indx) => {
          const isPrimarySelected = primarySelectedFrame === indx;
          return (
            <div key={indx} className="relative">
              {isPrimarySelected && (
                <div className="absolute w-full flex flex-row justify-center -top-1">
                  <CaretDiv />
                </div>
              )}
              <Frame
                frame={frame}
                frameNumber={indx}
                isPrimarySelected={isPrimarySelected}
                isSecondarySelected={secondarySelectedFrames.includes(indx)}
                selectedLeds={selectedLeds}
                onClick={() => dispatch({ type: "select-frame", frame: indx })}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
