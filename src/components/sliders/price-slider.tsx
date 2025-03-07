import { Slider } from "@heroui/react";

export default function PriceSlider({
  minValue,
  maxValue,
  defaultValue,
}: {
  minValue: number;
  maxValue: number;
  defaultValue: number[];
}) {
  return (
    <Slider
      className="w-full"
      defaultValue={defaultValue}
      formatOptions={{ style: "currency", currency: "USD" }}
      label="Price Range: "
      maxValue={maxValue}
      minValue={minValue}
      step={50}
    />
  );
}
