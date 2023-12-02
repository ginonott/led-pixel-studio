import { Container, Link } from "../components";
import { Icon } from "./icons";

function getRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const colors = ["positive", "negative", "caution", "neutral"] as const;

export default function Icons() {
  return (
    <div className="p-4">
      <Link href="/">Back</Link>
      <div>
        <h1>Sizes</h1>
        <div className="flex flex-row space-x-4 items-baseline">
          {(["sm", "md", "lg", "xl", "xxl", "xxxl"] as const).map((size) => {
            return (
              <div key={size}>
                <Icon name="add" size={size} color="positive" showHover />
                {size}
              </div>
            );
          })}
        </div>
        <h1>Colors</h1>
        <div className="flex flex-row space-x-4 items-baseline">
          {colors.map((color) => {
            return (
              <div key={color}>
                <Icon name="add" size="md" color={color} showHover />
                {color}
              </div>
            );
          })}
        </div>
      </div>
      <h1>Icons</h1>
      <div className="grid grid-cols-4 gap-8">
        {(
          [
            "add",
            "delete",
            "save",
            "pause",
            "arrow_forward",
            "lightbulb",
          ] as const
        ).map((icon) => {
          return (
            <Container key={icon} border>
              <Icon
                name={icon}
                size={getRandom(["sm", "md", "lg", "xl", "xxl", "xxxl"])}
                color={getRandom(colors)}
                modifier={getRandom(["add", "remove"])}
                showHover
              />
              {icon}
            </Container>
          );
        })}
      </div>
    </div>
  );
}
