"use client";

import { copyScene, deleteScene, playScene } from "./api";
import { Tile } from "./components";
import { IconButton, LinkIcon } from "./icons/icons";
import { Scene } from "./models";

export default function SceneTile({ scene }: { scene: Scene }) {
  return (
    <Tile key={scene.id}>
      <h3>{scene.name || `Untitled Scene ${scene.id}`}</h3>
      <div className="flex flex-row flex-wrap">
        <IconButton
          name="play_arrow"
          text="start"
          size="md"
          color="positive"
          onClick={() => {
            playScene(scene.id);
          }}
        />
        <LinkIcon href={`scenes/${scene.id}/editor`} name="edit" text="edit" />
        <IconButton
          name="content_copy"
          text="copy"
          size="md"
          color="neutral"
          onClick={() => {
            copyScene(scene.id);
          }}
        />
        <IconButton
          name="delete"
          text="delete"
          size="md"
          color="negative"
          onClick={() => {
            deleteScene(scene.id);
          }}
        />
      </div>
    </Tile>
  );
}
