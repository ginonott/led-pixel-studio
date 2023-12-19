"use client";
import { useEffect, useState } from "react";
import { State } from "./state";
import { throttledSaveScene } from "@/app/api";

export function useSave(state: State) {
  const [{ lastSaved }, setSaving] = useState<{
    lastSaved: Date | null;
  }>({ lastSaved: null });
  function save(state: State, set: typeof setSaving, immediate = false) {
    throttledSaveScene(state.scene)?.finally(() => {
      setSaving({ lastSaved: new Date() });
    });

    if (immediate) {
      throttledSaveScene.flush();
    }
  }

  // autosave
  useEffect(() => {
    save(state, setSaving);
  }, [state]);

  function handleSave() {
    save(state, setSaving, true);
  }

  return { lastSaved, handleSave };
}
