"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@web/lib/utils";

interface SpotlightProps {
  fill?: string;
  className?: string;
}

export const Spotlight = ({ className, fill }: SpotlightProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0",
        className
      )}
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${fill}, transparent 80%)`
      }}
    />
  );
};