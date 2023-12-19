"use client";

import { startProgram } from "./api";
import { Tile } from "./components";
import { IconButton } from "./icons/icons";
export default function ProgramTile({ program }: { program: string }) {
  return (
    <Tile key={program}>
      <h3>{program}</h3>
      <div className="flex flex-row flex-wrap">
        <IconButton
          name="play_arrow"
          text="start"
          size="md"
          color="positive"
          onClick={() => {
            startProgram(program);
          }}
        />
      </div>
    </Tile>
  );
}
