import { throttle } from "lodash";
import { CurrentScene, Scene } from "./models";
import { revalidatePath } from "next/cache";

function getHostName() {
  if (typeof window !== "undefined") {
    return `${window.location.hostname}:5000`;
  }

  return "127.0.0.1:5000";
}

function fetchIt<T>(
  path: string,
  fetchOptions: RequestInit = {},
  data?: object
): Promise<T> {
  const url = `http://${getHostName()}/api${path}`;
  console.log("API URL", url);
  return fetch(url, {
    ...fetchOptions,
    mode: "cors",
    cache: "no-cache",
    headers: {
      ...fetchOptions.headers,
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then((res) => res.json());
}

function revalidateHomepage() {
  if (typeof window !== "undefined") {
    return;
  }

  revalidatePath("/");
}

export async function getScene(sceneId: string): Promise<Scene> {
  const { scene } = await fetchIt<{ scene: Scene }>(`/scenes/${sceneId}`);

  return scene;
}

export async function getScenes(): Promise<Scene[]> {
  const { scenes } = await fetchIt<{ scenes: Scene[] }>(`/scenes`);

  return scenes;
}

export async function getCurrentScene(): Promise<CurrentScene> {
  return fetchIt<CurrentScene>(`/player`);
}

export async function playScene(sceneId: string): Promise<void> {
  await fetchIt(
    `/player/play`,
    {
      method: "POST",
    },
    { sceneId }
  );

  revalidateHomepage();
}

export async function deleteScene(sceneId: string): Promise<void> {
  await fetchIt(`/scenes/${sceneId}`, {
    method: "DELETE",
  });
  revalidateHomepage();
}

export async function saveScene(scene: Scene): Promise<void> {
  await fetchIt(
    `/scenes/${scene.id}`,
    {
      method: "PUT",
    },
    scene
  );
  revalidateHomepage();
}

export const throttledSaveScene = throttle(saveScene, 60000, {
  trailing: true,
});

export async function createScene(): Promise<{ id: string }> {
  const response = await fetchIt<{ id: string }>(
    `/scenes`,
    {
      method: "POST",
    },
    {}
  );
  revalidateHomepage();

  return response;
}

export async function stopScene(): Promise<void> {
  await fetchIt(`/player/stop`, {
    method: "POST",
  });
  revalidateHomepage();
}

async function setFrame(sceneId: string, frameNum: number): Promise<void> {
  await fetchIt(
    `/player/show-frame`,
    {
      method: "POST",
    },
    { sceneId, frameNum }
  );
}

export const throttledSetFrame = throttle(setFrame, 1000, {
  leading: true,
});
