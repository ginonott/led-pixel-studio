import { getPlayerState, getPrograms, getScenes } from "./api";
import { Container } from "./components";
import { LinkIcon } from "./icons/icons";
import ProgramTile from "./program-tile";
import PlayerControls from "./player-controls";
import SceneTile from "./scene-tile";

const Header = () => {
  return (
    <h1 className="text-6xl flex flex-row flex-wrap justify-center">
      <div className="flex flex-row md:mr-4">
        <div className="text-red-500 bounce-1">L</div>
        <div className="text-green-500 bounce-2">E</div>
        <div className="text-blue-500 bounce-3">D</div>
      </div>
      <div className="text-center">Pixel Studio</div>
    </h1>
  );
};

async function getData() {
  const [playerState, scenes, programs] = await Promise.all([
    getPlayerState(),
    getScenes(),
    getPrograms(),
  ]);

  return {
    scene: playerState.scene,
    program: playerState.program,
    scenes,
    programs,
  };
}

export default async function Home() {
  const { scene, program, scenes, programs } = await getData();

  return (
    <main className="flex min-h-screen flex-col sm:p-4 lg:p-24">
      <Header />
      <Container border>
        {scene ? (
          <h2>Playing Scene: {scene.name || `Untitled Scene ${scene.id}`}</h2>
        ) : program ? (
          <h2>Playing Program: {program}</h2>
        ) : (
          <h2>Not Playing</h2>
        )}
        <PlayerControls scene={scene} />
      </Container>
      <Container border>
        <h2>Scenes</h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-4">
          <div className="place-self-center">
            <LinkIcon
              href="scenes/"
              name="add"
              text="New Scene"
              color="positive"
              size="xxxl"
            />
          </div>
          {scenes.map((scene) => (
            <SceneTile key={scene.id} scene={scene} />
          ))}
        </div>
      </Container>
      <Container border>
        <h2>Programs</h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-4">
          {programs.map((program) => (
            <ProgramTile key={program} program={program} />
          ))}
        </div>
      </Container>
    </main>
  );
}
