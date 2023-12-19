import { throttle } from "lodash";
import { PlayerState, Scene } from "./models";
import { revalidateTag } from "next/cache";
import { io, Socket } from "socket.io-client";

function getHostName() {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_SERVER_HOSTNAME as string;
  }

  return process.env.NEXT_PUBLIC_CLIENT_HOSTNAME as string;
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
    next: {
      tags: ["api"],
    },
  }).then((res) => res.json());
}

function revalidateHomepage() {
  if (typeof window !== "undefined") {
    return;
  }

  revalidateTag("api");
}

export async function getScene(sceneId: string): Promise<Scene> {
  const { scene } = await fetchIt<{ scene: Scene }>(`/scenes/${sceneId}`);

  return scene;
}

export async function getScenes(): Promise<Scene[]> {
  const { scenes } = await fetchIt<{ scenes: Scene[] }>(`/scenes`);

  return scenes;
}

export async function getPlayerState(): Promise<PlayerState> {
  return fetchIt<PlayerState>(`/player`);
}

export async function playScene(sceneId: string): Promise<void> {
  await fetchIt(`/scenes/${sceneId}/play`, {
    method: "POST",
  });

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

export async function stopPlayer(): Promise<void> {
  await fetchIt(`/player/stop`, {
    method: "POST",
  });
  revalidateHomepage();
}

export async function pausePlayer(): Promise<void> {
  await fetchIt(`/player/pause`, {
    method: "POST",
  });
  revalidateHomepage();
}

export async function resumePlayer(): Promise<void> {
  await fetchIt(`/player/play`, {
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

export async function copyScene(sceneId: string): Promise<{ id: string }> {
  const response = await fetchIt<{ id: string }>(
    `/scenes/${sceneId}/copy`,
    {
      method: "POST",
    },
    {}
  );
  revalidateHomepage();

  return response;
}

export async function lockScene(sceneId: string): Promise<void> {
  await fetchIt(`/scenes/${sceneId}/lock`, {
    method: "POST",
  });
  revalidateHomepage();
}

let socket: WeakRef<Socket> | null = null;
export function getSocketConnection() {
  if (socket) {
    return socket.deref();
  }

  if (typeof window === "undefined") {
    return null;
  }

  socket = new WeakRef(io(`ws://${getHostName()}`));

  return socket.deref();
}

export function getPrograms() {
  return fetchIt<string[]>(`/programs`);
}

export function startProgram(program: string) {
  return fetchIt(`/programs/${program}/start`, {
    method: "POST",
  });
}
