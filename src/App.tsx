import { useState } from 'react'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from '@/components/ui/navigation-menu'
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import SceneComponent from './components/3d/SceneComponent'
import './App.css'

function App() {
  const [text, setUserInput] = useState('')
  const [prevText, setPrevUserInput] = useState('')
  const [bevelOptions, setBevelOptions] = useState({ depth: 0.2, segments: 5 })
  const [extrusionOptions, setExtrusionOptions] = useState({ depth: 1, scale: 1, rotation: Math.PI / 4 })

  return (
    <>
      <header className="w-full h-12 flex items-center shrink-0 px-6 font-bold border-b-2 border-solid border-gray-200">Ballonné</header>
      <div className="w-full h-full flex">
        <div className="w-60">
          <div>
            <div>bevel depth</div>
            <Slider
              defaultValue={[0.2]}
              max={10}
              step={0.1}
              onValueChange={([value]) => setBevelOptions({ ...bevelOptions, depth: value })}
            />
          </div>
          <div>
            <div>bevel segments</div>
            <Slider
              defaultValue={[5]}
              max={100}
              step={1}
              onValueChange={([value]) => setBevelOptions({ ...bevelOptions, segments: value })}
            />
          </div>
          <div>
            <div>extrusion depth</div>
            <Slider
              defaultValue={[1]}
              max={100}
              step={1}
              onValueChange={([value]) => setExtrusionOptions({ ...extrusionOptions, depth: value })}
            />
          </div>
          <div>
            <div>extrusion scale</div>
            <Slider
              defaultValue={[1]}
              max={100}
              step={1}
              onValueChange={([value]) => setExtrusionOptions({ ...extrusionOptions, scale: value })}
            />
          </div>
          <div>
            <div>extrusion rotation</div>
            <Slider
              defaultValue={[Math.PI / 4]}
              max={Math.PI * 2}
              step={Math.PI / 16}
              onValueChange={([value]) => setExtrusionOptions({ ...extrusionOptions, rotation: value })}
            />
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
