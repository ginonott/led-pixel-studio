import { getScene } from "@/app/api";

export default async function Page({ params }: { params: { scene: string } }) {
  const scene = await getScene(params.scene);
  return <SceneEditor scene={await getData(params.scene)} />;
}
