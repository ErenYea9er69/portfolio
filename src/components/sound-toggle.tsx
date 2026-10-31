"use client";

import React, { useState, useEffect } from "react";
import { sound } from "@/lib/sound-fx";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SoundToggle() {
  const [muted, setMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMuted(sound.getMuted());
  }, []);

  if (!mounted) return null;

  const toggleSound = () => {
    const next = sound.toggleMute();
    setMuted(next);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200"
          onClick={toggleSound}
          aria-label={muted ? "Enable sound effects" : "Mute sound effects"}
        >
          {muted ? (
            <VolumeX className="size-4 opacity-60" />
          ) : (
            <Volume2 className="size-4 text-primary" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        <p className="text-xs font-medium">
          {muted ? "SFX Muted (Click to enable)" : "SFX Active (Click to mute)"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

