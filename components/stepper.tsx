"use client";

import { Minus, Plus } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";

interface StepperProps {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  decreaseLabel: string;
  increaseLabel: string;
  onChange: (value: number) => void;
}

export function Stepper({
  label,
  hint,
  value,
  min,
  max,
  decreaseLabel,
  increaseLabel,
  onChange,
}: StepperProps) {
  const id = useId();

  return (
    <div role="group" aria-labelledby={id} className="flex items-center justify-between gap-4">
      <div id={id}>
        <p className="font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label={decreaseLabel}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Minus aria-hidden />
        </Button>
        <output aria-live="polite" className="w-8 text-center font-semibold tabular-nums">
          {value}
        </output>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label={increaseLabel}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Plus aria-hidden />
        </Button>
      </div>
    </div>
  );
}
