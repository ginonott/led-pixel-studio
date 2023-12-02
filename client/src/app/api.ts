import { throttle } from "lodash";
import { CurrentScene, Scene } from "./models";
import { revalidatePath } from "next/cache";

function getHostName() {
  if (typeof window === "undefined") {
    return "127.0.0.1";
  }

  return window.location.hostname;
}

function getApiUrl(path: string): string {
  const url = `http://${getHostName()}:5000/api${path}`;
  console.log("API URL", url);
  return url;
}

function revalidateHomepage() {
  if (typeof window !== "undefined") {
    return;
  }

  revalidatePath("/");
}

export async function getScene(sceneId: string): Promise<Scene> {
  const response = await fetch(getApiUrl(`/scenes/${sceneId}`), {
    cache: "no-cache",
  }).then((res) => res.json());

  return response.scene;
}

export async function getScenes(): Promise<Scene[]> {
  const scenesResponse = await fetch(getApiUrl("/scenes"), {
    cache: "no-cache",
  }).then((res) => {
    return res.json();
  });

  return scenesResponse.scenes;
}

export async function getCurrentScene(): Promise<CurrentScene> {
  return fetch(getApiUrl("/player"), {
    cache: "no-cache",
  }).then((res) => res.json());
}

export async function playScene(sceneId: string): Promise<void> {
  return fetch(getApiUrl(`/player/play`), {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sceneId }),
  }).then((res) => {
    revalidateHomepage();
    res.json();
  });
}

export async function deleteScene(sceneId: string): Promise<void> {
  return fetch(getApiUrl(`/scenes/${sceneId}`), {
    method: "DELETE",
    cache: "no-cache",
  }).then((res) => {
    revalidateHomepage();
    return res.json();
  });
}

export async function saveScene(scene: Scene): Promise<void> {
  return fetch(getApiUrl(`/scenes/${scene.id}`), {
    cache: "no-cache",
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scene),
  }).then((res) => {
    revalidateHomepage();
    return res.json();
  });
}

export const throttledSaveScene = throttle(saveScene, 60000, {
  trailing: true,
});

export async function createScene(): Promise<{ id: string }> {
  return fetch(getApiUrl(`/scenes`), {
    cache: "no-cache",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  }).then((res) => {
    revalidateHomepage();
    return res.json();
  });
}

export async function stopScene(): Promise<void> {
  return fetch(getApiUrl(`/player/stop`), {
    cache: "no-cache",
    method: "POST",
  }).then((res) => {
    revalidateHomepage();
    return res.json();
  });
}

async function setFrame(sceneId: string, frameNum: number): Promise<void> {
  return fetch(getApiUrl(`/player/show-frame`), {
    cache: "no-cache",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sceneId, frameNum }),
  }).then((res) => {
    return res.json();
  });
}

export const throttledSetFrame = throttle(setFrame, 1000, {
  leading: true,
});
