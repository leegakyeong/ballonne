import { useState } from 'react'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from '@/components/ui/navigation-menu'
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import SceneComponent from './components/3d/SceneComponent'
import './App.css'

const defaultBevelOptions = {
  depth: 0.2,
  segments: 5
}

const defaultExtrusionOptions = {
  depth: 1,
  scale: 1,
  rotation: 0 // Math.PI * extrusionOptions.rotation
}

function App() {
  const [text, setUserInput] = useState('')
  const [prevText, setPrevUserInput] = useState('')
  const [bevelOptions, setBevelOptions] = useState(defaultBevelOptions)
  const [extrusionOptions, setExtrusionOptions] = useState(defaultExtrusionOptions)

  return (
    <>
      <header className="w-full h-12 flex items-center shrink-0 px-6 font-bold border-b-2 border-solid border-gray-200">Ballonné</header>
      <div className="w-full h-full flex">
        <div className="w-60">
          {/* <div>
            <div>bevel depth</div>
            <Slider
              defaultValue={[defaultBevelOptions.depth]}
              max={10}
              step={0.1}
              onValueChange={([value]) => setBevelOptions({ ...bevelOptions, depth: value })}
            />
          </div>
          <div>
            <div>bevel segments</div>
            <Slider
              defaultValue={[defaultBevelOptions.segments]}
              max={100}
              step={1}
              onValueChange={([value]) => setBevelOptions({ ...bevelOptions, segments: value })}
            />
          </div> */}
          <div>
            <div>extrusion depth</div>
            <Slider
              defaultValue={[defaultExtrusionOptions.depth]}
              max={100}
              step={1}
              onValueChange={([value]) => setExtrusionOptions({ ...extrusionOptions, depth: value })}
            />
            <div>{extrusionOptions.depth}</div>
          </div>
          <div>
            <div>extrusion scale</div>
            <Slider
              defaultValue={[defaultExtrusionOptions.scale]}
              max={5}
              step={0.1}
              onValueChange={([value]) => setExtrusionOptions({ ...extrusionOptions, scale: value })}
            />
            <div>{extrusionOptions.scale}</div>
          </div>
          <div>
            <div>extrusion rotation</div>
            <Slider
              defaultValue={[defaultExtrusionOptions.rotation]}
              max={2}
              step={0.1}
              onValueChange={([value]) => setExtrusionOptions({ ...extrusionOptions, rotation: value })}
            />
            <div>{`π × ${extrusionOptions.rotation} rad`}</div>
          </div>
        </div>
        <div className="w-full h-full flex flex-col">
          <SceneComponent antialias id="my-canvas" text={text} prevText={prevText} bevelOptions={bevelOptions} extrusionOptions={extrusionOptions} />
          <Input
            onChange={(e) => {
              setUserInput((prev) => {
                setPrevUserInput(prev)
                return e.target.value
              })
            }}
          />
        </div>
        <div className="w-60">sidebar2</div>
      </div>
    </>
  )
}

export default App
