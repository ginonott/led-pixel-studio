"use client";

import { useRouter } from "next/navigation";
import { PropsWithoutRef, useEffect, useState } from "react";
import { IconButton } from "./icons/icons";
import { Scene } from "./models";
import { deleteScene, playScene } from "./api";

export default function SceneToolbar({
  scene,
}: PropsWithoutRef<{ scene: Scene }>) {
  const router = useRouter();
  const [isLoggedIntoSpotify, setIsLoggedIntoSpotify] =
    useState<boolean>(false);

  useEffect(() => {
    setIsLoggedIntoSpotify(!!window.localStorage.getItem("access_token"));
  }, []);

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
      <IconButton
        name="graphic_eq"
        disabled={!isLoggedIntoSpotify}
        color="positive"
        title={
          isLoggedIntoSpotify ? "" : "Log into Spotify to use this feature"
        }
        onClick={() => {}}
      />
    </div>
  );
}
