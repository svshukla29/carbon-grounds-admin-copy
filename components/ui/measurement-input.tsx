"use client";

import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface MeasurementInputProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  unit: string;
  onUnitChange: (unit: string) => void;
  units: { value: string; label: string }[];
  placeholder?: string;
}

export function MeasurementInput({
  id, value, onValueChange, unit, onUnitChange, units, placeholder,
}: MeasurementInputProps) {
  return (
    <div className="flex gap-2">
      <Input
        id={id}
        type="number"
        step="0.01"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex-1"
      />
      <Select value={unit} onValueChange={onUnitChange}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {units.map((u) => (
            <SelectItem key={u.value} value={u.value}>
              {u.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
