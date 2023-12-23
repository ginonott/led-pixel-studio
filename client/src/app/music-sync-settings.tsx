"use client";
import { useState } from "react";
import { setMusicSyncSettings, syncMusic } from "./api";
import { Container, Label } from "./components";
import { IconButton } from "./icons/icons";
import { MusicSyncSettings } from "./models";

export default function MusicSyncSettings({
  settings,
}: {
  settings: MusicSyncSettings;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <Container border>
      <h1>Sync Music</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (loading) return;

          setLoading(true);
          const formData = new FormData(event.target as HTMLFormElement);
          const data = {
            activationThreshold: Number(formData.get("activationThreshold")),
            lowRangeColorScale: Number(formData.get("lowRangeColorScale")),
            midRangeColorScale: Number(formData.get("midRangeColorScale")),
            highRangeColorScale: Number(formData.get("highRangeColorScale")),
          };

          setMusicSyncSettings({
            ...settings,
            ...data,
          })
            .then(() => {
              syncMusic();
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        <IconButton
          disabled={loading}
          name="graphic_eq"
          text="Sync Music"
          onClick={() => {
            syncMusic();
          }}
          buttonProps={{ type: "submit" }}
          size="xl"
        />
        <Label label="activation threshold" direction="col">
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            name="activationThreshold"
            defaultValue={settings.activationThreshold}
            onChange={(e) => {
              settings.activationThreshold = Number(e.target.value);
            }}
          />
        </Label>
        <Label label="transition scale" direction="col">
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            name="transitionScale"
            defaultValue={settings.transitionScale}
          />
        </Label>
        <Label label="low range color scale" direction="col">
          <input
            type="number"
            min={0}
            max={2}
            step={0.1}
            name="lowRangeColorScale"
            defaultValue={settings.lowRangeColorScale}
          />
        </Label>
        <Label label="mid range color scale" direction="col">
          <input
            type="number"
            min={0}
            max={2}
            step={0.1}
            name="midRangeColorScale"
            defaultValue={settings.lowRangeColorScale}
          />
        </Label>
        <Label label="high range color scale" direction="col">
          <input
            type="number"
            min={0}
            max={2}
            step={0.1}
            name="highRangeColorScale"
            defaultValue={settings.lowRangeColorScale}
          />
        </Label>
        <Label label="low range" direction="col">
          <input
            type="number"
            min={0}
            max={200}
            step={10}
            name="lowRange"
            defaultValue={settings.lowRange}
          />
        </Label>
        <Label label="mid range" direction="col">
          <input
            type="number"
            min={100}
            max={1024}
            step={10}
            name="midRange"
            defaultValue={settings.midRange}
          />
        </Label>
      </form>
    </Container>
  );
}
