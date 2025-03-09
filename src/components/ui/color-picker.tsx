import { useState } from "react";
import { Check } from "lucide-react";

interface ColorOption {
  value: string;
  label: string;
  bgClass: string;
}

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const colorOptions: ColorOption[] = [
  { value: "blue", label: "Azul", bgClass: "bg-gradient-to-r from-blue-400 to-blue-600" },
  { value: "green", label: "Verde", bgClass: "bg-gradient-to-r from-green-400 to-green-600" },
  { value: "amber", label: "Âmbar", bgClass: "bg-gradient-to-r from-amber-400 to-amber-600" },
  { value: "purple", label: "Roxo", bgClass: "bg-gradient-to-r from-purple-400 to-purple-600" },
  { value: "red", label: "Vermelho", bgClass: "bg-gradient-to-r from-red-400 to-red-600" },
  { value: "gray", label: "Cinza", bgClass: "bg-gradient-to-r from-gray-400 to-gray-600" },
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colorOptions.map((color) => (
        <button
          key={color.value}
          type="button"
          className={`w-8 h-8 rounded-full ${color.bgClass} flex items-center justify-center transition-all ${
            value === color.value 
              ? "ring-2 ring-offset-2 ring-offset-background ring-primary" 
              : "hover:scale-110"
          }`}
          onClick={() => onChange(color.value)}
          title={color.label}
        >
          {value === color.value && (
            <Check className="h-4 w-4 text-white" />
          )}
        </button>
      ))}
    </div>
  );
} 