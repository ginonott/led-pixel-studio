import { useDraggable } from "@dnd-kit/core";
import NextLink from "next/link";
import { ButtonHTMLAttributes, HTMLAttributes } from "react";

export const Container = ({
  children,
  border,
  direction = "col",
  className = "",
}: React.PropsWithChildren<{
  border?: boolean;
  direction?: "row" | "col";
  className?: string;
}>) => {
  // return a div with tailwind classes styled in neobrutalist fashion
  return (
    <div
      className={`${className} flex flex-${direction} ${
        border ? "border-2" : ""
      } border-black my-4 p-4 ${border ? "shadow-brutalist" : ""} flex-wrap`}
    >
      {children}
    </div>
  );
};

export const List = ({ children }: React.PropsWithChildren) => {
  // return a list with tailwind classes styled in neobrutalist fashion
  return <ul className="flex flex-col my-4">{children}</ul>;
};

export const ListItem = ({ children }: React.PropsWithChildren) => {
  // return a list item with tailwind classes styled in neobrutalist fashion
  return (
    <li className="flex flex-row my-4 border-l-4 border-black px-4 min-h-[32px]">
      {children}
    </li>
  );
};

export const Link = ({
  children,
  href,
}: React.PropsWithChildren<{ href: string }>) => {
  // return a link with tailwind classes styled in neobrutalist fashion
  return (
    <NextLink className="text-blue-500 underline" href={href}>
      {children}
    </NextLink>
  );
};

export const Button = ({
  children,
  variant = "default",
  ...rest
}: React.PropsWithChildren<{
  variant: "primary" | "default" | "spotify";
}> &
  ButtonHTMLAttributes<HTMLButtonElement>) => {
  // return a button with tailwind classes styled in neobrutalist fashion
  const background =
    variant === "primary"
      ? "bg-blue-300"
      : variant == "spotify"
      ? "bg-green-300"
      : "bg-white";

  return (
    <button
      {...rest}
      className={`border-2 border-b-4 border-r-4 border-black p-2 ${background} flex-row hover:saturate-150 shadow-brutalist active:shadow-none active:translate-x-[5px] active:translate-y-[5px]`}
    >
      {children}
    </button>
  );
};

export const VerticalDivider = () => {
  // return a vertical divider with tailwind classes styled in neobrutalist fashion
  return <div className="border-l-2 border-black mx-4" />;
};

export function Label({
  children,
  label,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <label className="flex flex-row items-center justify-between">
      {label}
      {children}
    </label>
  );
}

export function HorizontalDivider() {
  return <div className="border-b-2 border-black my-4" />;
}

export function DisabledOverlay({
  children,
  style = {},
}: React.PropsWithChildren<{
  style?: HTMLAttributes<HTMLDivElement>["style"];
}>) {
  return (
    <div className="bg-gray-500 opacity-50" style={style}>
      {children}
    </div>
  );
}
