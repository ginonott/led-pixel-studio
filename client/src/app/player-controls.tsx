"use client";

import { useRouter } from "next/navigation";
import { PropsWithoutRef } from "react";
import { pausePlayer, resumePlayer, stopPlayer } from "./api";
import { IconButton } from "./icons/icons";
import { Program, Scene } from "./models";

export default function SceneControls({
  scene,
}: PropsWithoutRef<{ scene?: Scene }>) {
  const router = useRouter();
  return (
    <div>
      <IconButton
        name="play_arrow"
        text="Play"
        color="positive"
        onClick={() => {
          resumePlayer().then(() => {
            router.refresh();
          });
        }}
        size="lg"
      />
      <IconButton
        name="pause"
        text="Pause"
        color="caution"
        onClick={() => {
          pausePlayer().then(() => {
            router.refresh();
          });
        }}
        size="lg"
      />
      <IconButton
        name="stop"
        text="Stop"
        color="negative"
        onClick={() => {
          stopPlayer().then(() => {
            router.refresh();
          });
        }}
        size="lg"
      />
      {scene ? (
        <IconButton
          text="Edit"
          name="edit"
          onClick={() => {
            router.push(`/scenes/${scene.id}/editor`);
          }}
          size="lg"
        />
      ) : null}
    </div>
  );
}
