import { Frame as FrameType } from "@/app/models";
import { isOn } from "./led";
import { rgbToHex } from "@/app/utils";

function CaretDiv() {
  return (
    <div className="w-2 h-2 border-t-4 border-b-4 border-orange-500 transform rotate-45" />
  );
}

function Frame({
  frame,
  isPrimarySelected,
  isSecondarySelected,
  selectedLeds,
  onClick,
}: {
  frame: FrameType;
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
    </div>
  );
}

export default function Timeline({
  frames,
  selectedFrames,
  selectedLeds,
  fps,
  onSelectFrame,
}: {
  frames: FrameType[];
  selectedFrames: number[];
  selectedLeds: string[];
  fps: number;
  onSelectFrame: (frame: number) => void;
}) {
  const primarySelectedFrame = frames[selectedFrames[0] ?? 0];
  const secondarySelectedFrames = selectedFrames.slice(1);
  return (
    <div className="border-4 border-black h-[4rem] flex flex-row">
      <div className="min-w-[200px] max-w-[300px]">
        <div>Frames: {frames.length} </div>
        <div>Total Time: {(frames.length / fps).toFixed(2)}s</div>
      </div>
      <div className="flex flex-row overflow-x-auto">
        {frames.map((frame, indx) => {
          const isPrimarySelected = primarySelectedFrame === frame;
          return (
            <div key={indx} className="relative">
              {isPrimarySelected && (
                <div className="absolute w-full flex flex-row justify-center -top-1">
                  <CaretDiv />
                </div>
              )}
              <Frame
                frame={frame}
                isPrimarySelected={isPrimarySelected}
                isSecondarySelected={secondarySelectedFrames.includes(indx)}
                selectedLeds={selectedLeds}
                onClick={() => onSelectFrame(indx)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
