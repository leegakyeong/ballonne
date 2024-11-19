import { Slider } from '@/components/ui/slider'

type SliderSectionProps = {
  name: string
  value: number | string
  defaultValue: number
  max: number
  min?: number
  step: number
  onValueChange: (v: number) => void
}

export default function SliderSection({
  name,
  value,
  defaultValue,
  max,
  min,
  step,
  onValueChange,
}: SliderSectionProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <label htmlFor={name}>{name}</label>
        <span>{value}</span>
      </div>
      <Slider
        name={name}
        defaultValue={[defaultValue]}
        max={max}
        min={min ?? 0}
        step={step}
        onValueChange={([v]) => onValueChange(v)}
      />
    </div>
  )
}
