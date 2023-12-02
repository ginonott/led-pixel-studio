"use client";

import { useRouter } from "next/navigation";
import { PropsWithoutRef } from "react";
import { IconButton } from "./icons/icons";
import { Scene } from "./models";
import { deleteScene, playScene } from "./api";

export default function SceneToolbar({
  scene,
}: PropsWithoutRef<{ scene: Scene }>) {
  const router = useRouter();
  return (
    <div>
      <IconButton
        name="play_arrow"
        color="positive"
        onClick={() => {
          playScene(scene.id).then(() => {
            router.refresh();
          });
        }}
      />
      <IconButton
        name="arrow_forward"
        onClick={() => {
          router.push(`/${scene.id}/editor`);
        }}
      />
      <IconButton
        name="delete"
        color="negative"
        onClick={() => {
          deleteScene(scene.id).then(() => {
            router.refresh();
          });
        }}
      />
    </div>
  );
}
