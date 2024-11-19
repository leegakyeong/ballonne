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
    <div className="mb-4">
      <div className="mb-1 text-left">{name}</div>
      <div className="flex items-center">
        <ColorPicker
          className="mr-2"
          value={value.toHexString()}
          onChange={onChange}
        />
        <div>{value.toHexString()}</div>
      </div>
    </div>
  )
}
