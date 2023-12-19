"use client";

import { useRouter } from "next/navigation";
import { PropsWithoutRef, useEffect, useState } from "react";
import { IconButton } from "./icons/icons";
import { Scene } from "./models";
import { copyScene, deleteScene, playScene } from "./api";

export default function SceneToolbar({
  scene,
}: PropsWithoutRef<{ scene: Scene }>) {
  const router = useRouter();
  const [copying, setCopying] = useState<boolean>(false);
  const deleteDisabled = scene.name.toLowerCase().includes("do not delete");
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
        name="edit"
        onClick={() => {
          router.push(`/scenes/${scene.id}/editor`);
        }}
      />
      <IconButton
        name="content_copy"
        disabled={copying}
        onClick={() => {
          if (copying) {
            return;
          }

          setCopying(true);
          copyScene(scene.id)
            .then(() => {
              router.refresh();
            })
            .finally(() => {
              setCopying(false);
            });
        }}
      />
      <div />
      <IconButton
        name="delete"
        color="negative"
        disabled={deleteDisabled}
        title={
          deleteDisabled
            ? "Remove 'do not delete' to delete this scene"
            : undefined
        }
        onClick={() => {
          deleteScene(scene.id).then(() => {
            router.refresh();
          });
        }}
      />
    </div>
  );
}
