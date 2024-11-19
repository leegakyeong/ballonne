import * as BABYLON from '@babylonjs/core'
import { ColorPicker } from '../ui/color-picker'

type ColorPickerSectionParams = {
  name: string
  value: BABYLON.Color3
  onChange: (v: string) => void
}

export default function ColorPickerSection({
  name,
  value,
  onChange,
}: ColorPickerSectionParams) {
  return (
    <div className="mb-4 pl-0.5">
      <div className="mb-3 text-left text-xs font-medium">{name}</div>
      <div className="flex items-center">
        <ColorPicker
          className="mr-2"
          value={value.toHexString()}
          onChange={onChange}
        />
        <div className="text-xs text-zinc-500">{value.toHexString()}</div>
      </div>
    </div>
  )
}
