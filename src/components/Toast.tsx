"use client";

import { useState, useRef } from "react";
import { toast as sonnerToast } from "sonner";

interface ToastProps {
  id: string | number;
  message: string;
  type?: "error" | "info";
  duration?: number;
}

function Toast({ message, type = "info", duration = 3000 }: ToastProps) {
  const bg = type === "error" ? "#f87171" : "#172c4f";
  const [barKey, setBarKey] = useState(0);
  const [barDuration, setBarDuration] = useState(duration);
  const [active, setActive] = useState(true);
  const hovered = useRef(false);
  const pressed = useRef(false);

  const stop = () => {
    setActive(false);
  };

  const resume = () => {
    if (hovered.current || pressed.current) return;
    setBarDuration(2000);
    setBarKey((k) => k + 1);
    setActive(true);
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg px-4 py-3 shadow-lg text-sm font-medium text-white select-none"
      style={{ background: bg, minWidth: 220 }}
      onMouseEnter={() => { hovered.current = true; stop(); }}
      onMouseLeave={() => { hovered.current = false; resume(); }}
      onMouseDown={() => { pressed.current = true; stop(); }}
      onMouseUp={() => { pressed.current = false; resume(); }}
    >
      {message}
      {active && (
        <div
          key={barKey}
          className="absolute bottom-0 left-0 w-full"
          style={{
            height: 3,
            background: "rgba(255,255,255,0.6)",
            transformOrigin: "left center",
            animation: `toast-progress ${barDuration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

export function toast({
  message,
  type = "info",
  duration = 3000,
}: Omit<ToastProps, "id">) {
  return sonnerToast.custom(
    (id) => <Toast id={id} message={message} type={type} duration={duration} />,
    { duration }
  );
}
