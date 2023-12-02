import { Container, VerticalDivider } from "@/app/components";
import { LinkIcon, IconButton } from "@/app/icons/icons";
import { Dispatch } from "react";
import { State, Action } from "./state";
import {
  playScene,
  saveScene,
  stopScene,
  throttledSaveScene,
  throttledSetFrame,
} from "@/app/api";
import { useRouter } from "next/navigation";

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
      <div className="flex flex-row space-x-4">
        <IconButton
          name="lightbulb"
          text="Add LED"
          disabled={disabled}
          modifier="add"
          color="positive"
          onClick={() => {
            dispatch({ type: "add-led" });
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
          name="photo_frame"
          text="Add Frame"
          disabled={disabled}
          color="positive"
          onClick={() => {
            dispatch({ type: "add-frame" });
          }}
          size="md"
        />
        <IconButton
          name="photo_frame"
          text="Delete Frame"
          color="negative"
          disabled={state.scene.frames.length <= 1 || disabled}
          onClick={() => {
            dispatch({ type: "delete-selected-frames" });
          }}
          size="md"
        />
        <VerticalDivider />
        <IconButton
          color="positive"
          name={state.isPlaying ? "pause" : "play_arrow"}
          text={state.isPlaying ? "Pause" : "Play"}
          onClick={toggleAnimationState}
          size="md"
        />
        <VerticalDivider />
        <IconButton
          color="caution"
          name="play_arrow"
          text="Play Live"
          size="md"
          onClick={() => {
            saveScene(state.scene).then(() => {
              return playScene(state.scene.id);
            });
          }}
        />
        <IconButton
          name="pause"
          color="caution"
          text="Stop Live"
          size="md"
          onClick={() => {
            stopScene();
          }}
        />
        <IconButton
          name="cast"
          color="caution"
          text="Display"
          size="md"
          onClick={() => {
            saveScene(state.scene).then(() => {
              return throttledSetFrame(state.scene.id, state.selectedFrames[0]);
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
