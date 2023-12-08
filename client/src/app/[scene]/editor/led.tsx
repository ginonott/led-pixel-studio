import { LedState, LedPosition } from "@/app/models";
import { Attributes, HTMLAttributes } from "react";

export function isOn(ledState: LedState) {
  return ledState.r + ledState.g + ledState.b > 0;
}

export function isOff(ledState: LedState) {
  return !isOn(ledState);
}

export const LedSize = 28;

export default function Led({
  ledPosition,
  ledState,
  isPrimarySelected,
  isSecondarySelected,
  ledNumber,
  onMouseOver,
}: {
  ledState: LedState;
  ledPosition: LedPosition;
  isPrimarySelected: boolean;
  isSecondarySelected: boolean;
  ledNumber: string;
  onMouseOver?: HTMLAttributes<HTMLDivElement>["onMouseOver"];
}) {
  const on = isOn(ledState);

  const border = isPrimarySelected
    ? "border-2 border-green-400"
    : isSecondarySelected
    ? "border-[1px] border-blue-400"
    : "border-[1px] border-black";

  return (
    <div
      className={`rounded-md  ${border} h-8 w-8`}
      onMouseOver={onMouseOver}
      style={{
        backgroundColor: `rgb(${ledState.r},${ledState.g},${ledState.b})`,
        boxShadow: on
          ? `0 0 10px 5px rgb(${ledState.r},${ledState.g},${ledState.b})`
          : "none",
        position: "absolute",
        left: `${ledPosition.relX}%`,
        top: `${ledPosition.relY}%`,
        height: `${LedSize}px`,
        width: `${LedSize}px`,
      }}
    >
      <div className="relative w-full h-full">
        <div className="absolute top-[1.5rem] w-full h-full">{ledNumber}</div>
      </div>
    </div>
  );
}
