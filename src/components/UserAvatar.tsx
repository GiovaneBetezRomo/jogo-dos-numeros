"use client";

import { useState } from "react";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  ringClass?: string;
}

const SIZE_MAP = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

export function UserAvatar({
  username,
  avatarUrl,
  size = "md",
  ringClass = "border-valorant-cyan/50",
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = username.slice(0, 2).toUpperCase();

  if (avatarUrl && !failed) {
    return (
      <img
        src={avatarUrl}
        alt={`Avatar de ${username}`}
        onError={() => setFailed(true)}
        className={`${SIZE_MAP[size]} rounded-xl border ${ringClass} bg-valorant-surface object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${SIZE_MAP[size]} flex shrink-0 items-center justify-center rounded-xl border ${ringClass} bg-gradient-to-br from-valorant-red/30 via-valorant-surface to-valorant-purple/30 font-display font-bold tracking-wider text-valorant-text`}
      aria-label={`Avatar de ${username}`}
    >
      {initials}
    </div>
  );
}
