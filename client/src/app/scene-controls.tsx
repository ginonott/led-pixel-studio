"use client";

import { useRouter } from "next/navigation";
import { PropsWithoutRef } from "react";
import { stopScene } from "./api";
import { IconButton } from "./icons/icons";
import { Scene } from "./models";

export default function SceneControls({
  scene,
}: PropsWithoutRef<{ scene: Scene }>) {
  const router = useRouter();
  return (
    <div>
      <IconButton
        name="pause"
        text="Stop"
        color="negative"
        onClick={() => {
          stopScene().then(() => {
            router.refresh();
          });
        }}
        size="lg"
      />
      <IconButton
        text="Edit"
        name="edit"
        onClick={() => {
          location.href = `/${scene.id}/editor`;
        }}
        size="lg"
      />
    </div>
  );
}
