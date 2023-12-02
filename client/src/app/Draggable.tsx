"use client";

import { useDraggable } from "@dnd-kit/core";

export function Draggable(props: {
  children: React.ReactNode;
  id: string | number;
  initialPosition: { left: number; top: number };
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : {};

  return (
    <button
      ref={setNodeRef}
      style={{
        ...style,
        position: "absolute",
        left: `${props.initialPosition.left}%`,
        top: `${props.initialPosition.top}%`,
      }}
      {...listeners}
      {...attributes}
    >
      {props.children}
    </button>
  );
}
