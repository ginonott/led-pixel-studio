import { getCurrentScene, getScenes } from "./api";
import { Container } from "./components";
import { Icon, LinkIcon } from "./icons/icons";
import SceneControls from "./scene-controls";
import SceneToolbar from "./scene-toolbar";
import SpotifyLogin from "./spotify-login";

const Header = () => {
  return (
    <div className="flex flex-row justify-between">
      <h1 className="text-6xl">
        <span className="text-red-500 animate-bounce">L</span>
        <span className="text-green-500">E</span>
        <span className="text-blue-500">D</span> Pixel Studio
      </h1>
      <div>
        <SpotifyLogin />
      </div>
    </div>
  );
};

async function getData() {
  const [currentScene, scenes] = await Promise.all([
    getCurrentScene(),
    getScenes(),
  ]);

  return {
    currentScene: {
      ...currentScene,
      scene: scenes.find((scene) => scene.id === currentScene.sceneId),
    },
    scenes,
  };
}

export default async function Home() {
  const { currentScene, scenes } = await getData();

  return (
    <main className="flex min-h-screen flex-col p-24">
      <Header />
      <Container border>
        <h1>
          {currentScene.scene
            ? currentScene.scene.name ||
              `Untitled Scene ${currentScene.sceneId}`
            : "No Scene Set"}
        </h1>
        {currentScene?.scene && <SceneControls scene={currentScene.scene} />}
      </Container>
      <Container>
        <h2>Scenes</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="place-self-center">
            <LinkIcon
              href="/editor"
              name="add"
              text="New Scene"
              color="positive"
              size="xxxl"
            />
          </div>
          {scenes.map((scene) => (
            <Container key={scene.id} border>
              <h3>{scene.name || `Untitled Scene ${scene.id}`}</h3>
              <div>LEDs: {Object.keys(scene.ledPositions).length}</div>
              <div>Frames: {scene.frames.length}</div>
              <div>
                Duration: {(scene.frames.length / scene.fps).toFixed(2)}s
              </div>
              <SceneToolbar scene={scene} />
            </Container>
          ))}
        </div>
      </Container>
    </main>
  );
}
