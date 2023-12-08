import Link from "next/link";

const baseSize = 48;

const dimensions = {
  sm: baseSize,
  md: baseSize * 1.5,
  lg: baseSize * 2,
  xl: baseSize * 2.5,
  xxl: baseSize * 3,
  xxxl: baseSize * 4,
};

const colors = {
  positive: "bg-green-400",
  caution: "bg-orange-400",
  neutral: "bg-blue-400",
  negative: "bg-red-500",
};

type Icons =
  | "add"
  | "remove"
  | "delete"
  | "save"
  | "pause"
  | "play_arrow"
  | "lightbulb"
  | "arrow_back"
  | "arrow_forward"
  | "photo_frame"
  | "cast"
  | "graphic_eq"
  | "edit";
type Modifiers = "add" | "remove";

export function Icon({
  name: icon,
  size = "md",
  color = "neutral",
  text,
  depressed = false,
  showHover = false,
  modifier,
  disabled,
}: {
  name: Icons;
  text?: string;
  size?: keyof typeof dimensions;
  color?: keyof typeof colors;
  depressed?: boolean;
  showHover?: boolean;
  modifier?: Modifiers;
  disabled?: boolean;
}) {
  const pxs = dimensions[size];
  const inner = pxs * 0.9;
  const colorClass = colors[color];
  const depressedClass = depressed ? "translate-x-1 translate-y-1" : "";
  const showHoverClass =
    showHover && !disabled
      ? "hover:saturate-200 cursor-pointer active:translate-x-1 active:translate-y-1"
      : "";
  const fontSize = inner * 0.75;
  const modifierSize = fontSize * 0.5;
  const disabledClass = disabled ? "grayscale" : "";

  return (
    <div style={{ height: pxs, width: pxs }} className="relative m-2">
      <div
        className={`absolute ${showHoverClass} ${depressedClass} z-10 ${disabledClass}`}
        style={{ height: pxs, width: pxs }}
      >
        {modifier && (
          <span
            className={"material-icons-sharp select-none absolute z-50"}
            style={{
              fontSize: modifierSize,
              bottom: pxs - modifierSize,
              right: pxs - modifierSize,
            }}
          >
            {modifier}
          </span>
        )}
        {text && (
          <div
            className={`whitespace-nowrap font-semibold absolute z-20 text-center`}
            style={{
              bottom: inner * 0.1,
              width: inner,
              fontSize: fontSize * 0.2,
            }}
          >
            {text}
          </div>
        )}
        <div
          className={`${colorClass} flex flex-col justify-center items-center absolute z-10`}
          style={{ width: inner, height: inner }}
        >
          <span
            className="material-icons-sharp select-none pointer-events-none"
            style={{ fontSize, maxWidth: fontSize, maxHeight: fontSize }}
          >
            {icon}
          </span>
        </div>
      </div>
      <div
        className="bg-black absolute translate-x-2 translate-y-2"
        style={{ width: inner, height: inner }}
      ></div>
    </div>
  );
}

export function IconButton({
  onClick,
  title,
  ...props
}: {
  onClick: () => void;
  title?: string;
  text?: string;
} & React.ComponentProps<typeof Icon>) {
  return (
    <button onClick={onClick} title={title}>
      <Icon {...props} showHover />
    </button>
  );
}

export function LinkIcon({
  href,
  ...props
}: { href: string; text?: string } & React.ComponentProps<typeof Icon>) {
  return (
    <Link href={href}>
      <Icon {...props} showHover />
    </Link>
  );
}
