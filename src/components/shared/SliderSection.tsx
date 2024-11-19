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
    <div className="mb-5">
      <div className="flex justify-between mb-3">
        <label htmlFor={name} className="text-xs font-medium">{name}</label>
        <span className="text-xs text-zinc-500">{value}</span>
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
