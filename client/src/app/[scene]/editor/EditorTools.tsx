import {
  Container,
  HorizontalDivider,
  VerticalDivider,
} from "@/app/components";
import { LinkIcon, IconButton, Icon } from "@/app/icons/icons";
import { Dispatch } from "react";
import {
  State,
  Action,
  DefaultAddLedTool,
  DefaultSelectTool,
  DefaultPaintTool,
} from "./state";
import {
  playScene,
  saveScene,
  stopScene,
  throttledSaveScene,
  throttledSetFrame,
} from "@/app/api";
import { useRouter } from "next/navigation";
import { getNumberOfLeds } from "./selectors";

export function EditorTools({
  state,
  dispatch,
  disabled,
  toggleAnimationState,
  handleSave,
  lastSaved,
}: {
  state: State;
  dispatch: Dispatch<Action>;
  disabled: boolean;
  toggleAnimationState: () => void;
  handleSave: () => void;
  lastSaved: Date | null;
}) {
  const router = useRouter();
  return (
    <Container border direction="row">
      <IconButton
        name="arrow_back"
        text="back"
        size="md"
        onClick={() => {
          throttledSaveScene.cancel();
          throttledSaveScene(state.scene)?.finally(() => {
            router.refresh();
          });

          router.push("/");
        }}
      />
      <input
        placeholder="Scene Name"
        value={state.scene.name}
        onChange={(val) => {
          dispatch({
            type: "set-scene-value",
            key: "name",
            value: val.target.value,
          });
        }}
        className="text-3xl mx-4"
      />
      <div className="flex flex-col justify-center align-middle font-semibold">
        <div className="text-center">{getNumberOfLeds(state)}</div>
        <div>LEDs</div>
      </div>
      <div className="flex flex-row space-x-4">
        <IconButton
          name="arrow_selector_tool"
          text="select tool"
          disabled={disabled}
          color="positive"
          depressed={state.currentTool.type === "select"}
          onClick={() => {
            dispatch({
              type: "set-state",
              key: "currentTool",
              value: DefaultSelectTool,
            });
          }}
          size="md"
        />
        <IconButton
          name="brush"
          text="Paint"
          disabled={disabled}
          color="positive"
          depressed={state.currentTool.type === "paint"}
          size="md"
          onClick={() => {
            dispatch({
              type: "set-state",
              key: "currentTool",
              value: DefaultPaintTool,
            });
          }}
        />
        <IconButton
          name="lightbulb"
          text="LED Tool"
          disabled={disabled}
          color="positive"
          depressed={state.currentTool.type === "add-led"}
          onClick={() => {
            dispatch({
              type: "set-state",
              key: "currentTool",
              value: DefaultAddLedTool,
            });
          }}
          size="md"
        />
        <IconButton
          name="lightbulb"
          text="Remove LED"
          size="md"
          disabled={disabled}
          modifier="remove"
          color="negative"
          onClick={() => {
            dispatch({ type: "remove-last-led" });
          }}
        />
        <VerticalDivider />
        <IconButton
          color="positive"
          name={state.isPlaying ? "pause" : "play_arrow"}
          text={state.isPlaying ? "Pause" : "Test"}
          onClick={toggleAnimationState}
          size="md"
        />
        <VerticalDivider />
        <IconButton
          name="cast"
          color="caution"
          text={state.isLiveEnabled ? "Stop Live" : "Enable Live"}
          size="md"
          depressed={state.isLiveEnabled}
          onClick={() => {
            dispatch({
              type: "set-state",
              key: "isLiveEnabled",
              value: !state.isLiveEnabled,
            });
          }}
        />
        <VerticalDivider />
        <IconButton
          name="save"
          text="Save"
          onClick={handleSave}
          title={`Last saved: ${lastSaved?.toLocaleString() ?? "Never"}`}
          size="md"
        />
      </div>
    </Container>
  );
}
