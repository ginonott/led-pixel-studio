import SceneEditor from "./editor";
import { createScene, getScene } from "@/app/api";
import { redirect } from "next/navigation";

async function getData(sceneId: string) {
  if (sceneId === "__new") {
    const { id } = await createScene();
    return redirect(`scenes/${id}/editor`);
  }

  return getScene(sceneId);
}

export default async function Page({ params }: { params: { scene: string } }) {
  return <SceneEditor scene={await getData(params.scene)} />;
}
