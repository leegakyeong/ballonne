import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import * as BABYLON from '@babylonjs/core'
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from './components/ui/color-picker'
import SceneComponent from './components/3d/SceneComponent'
import './App.css'

type MaterialType = 'StandardMaterial' | 'PBRMaterial' | 'CustomMaterial'

const defaultBevelOptions = {
  depth: 0.2,
  segments: 5
}

const defaultExtrusionOptions = {
  depth: 1,
  scale: 1,
  rotation: 0 // Math.PI * extrusionOptions.rotation
}

const defaultStandardMaterialOptions = {
  diffuseColor: new BABYLON.Color3(0, 0, 0),
  specularColor: new BABYLON.Color3(0, 0, 0),
  emissiveColor: new BABYLON.Color3(0, 0, 0),
  ambientColor: new BABYLON.Color3(0, 0, 0),
  alpha: 1,
}

const defaultPbrMaterialOptions = {
  albedoColor: new BABYLON.Color3(0, 0, 0),
  metallic: 0,
  roughness: 0,
  alpha: 1,
  refraction: 0,
  translucency: 0,
}

function App() {
  const [text, setUserInput] = useState('')
  const [prevText, setPrevUserInput] = useState('')
  const [bevelOptions, setBevelOptions] = useState(defaultBevelOptions)
  const [extrusionOptions, setExtrusionOptions] = useState(defaultExtrusionOptions)
  const [materialType, setMaterialType] = useState<MaterialType>('StandardMaterial')
  const [standardMaterialOptions, setStandartMaterialOptions] = useState(defaultStandardMaterialOptions)
  const [pbrMaterialOptions, setPbrMaterialOptions] = useState(defaultPbrMaterialOptions)

  const handleExtrusionDepthChange = useDebouncedCallback((value) => {
    setExtrusionOptions((prev) => ({ ...prev, depth: value }));
  }, 200);

  const handleExtrusionScaleChange = useDebouncedCallback((value) => {
    setExtrusionOptions((prev) => ({ ...prev, scale: value }));
  }, 200);

  const handleExtrusionRotationChange = useDebouncedCallback((value) => {
    setExtrusionOptions((prev) => ({ ...prev, rotation: value }));
  }, 200);

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
              onValueChange={([value]) => handleExtrusionDepthChange(value)}
            />
            <div>{extrusionOptions.depth}</div>
          </div>
          <div>
            <div>extrusion scale</div>
            <Slider
              defaultValue={[defaultExtrusionOptions.scale]}
              max={5}
              step={0.1}
              onValueChange={([value]) => handleExtrusionScaleChange(value)}
            />
            <div>{extrusionOptions.scale}</div>
          </div>
          <div>
            <div>extrusion rotation</div>
            <Slider
              defaultValue={[defaultExtrusionOptions.rotation]}
              max={2}
              step={0.1}
              onValueChange={([value]) => handleExtrusionRotationChange(value)}
            />
            <div>{`${extrusionOptions.rotation}${extrusionOptions.rotation ? 'π' : ''} rad`}</div>
          </div>
        </div>
        <div className="w-full h-full flex flex-col">
          <SceneComponent
            antialias
            id="my-canvas"
            text={text}
            prevText={prevText}
            bevelOptions={bevelOptions}
            extrusionOptions={extrusionOptions}
            materialType={materialType}
            standardMaterialOptions={standardMaterialOptions}
            pbrMaterialOptions={pbrMaterialOptions}
          />
          <Input
            onChange={(e) => {
              setUserInput((prev) => {
                setPrevUserInput(prev)
                return e.target.value
              })
            }}
          />
        </div>
        <div className="w-60">
          <Tabs defaultValue="standard">
            <TabsList>
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="pbr">PBR</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            <TabsContent value="standard">
              <div>
                <div>diffuseColor</div>
                <ColorPicker
                  value={standardMaterialOptions.diffuseColor.toHexString()}
                  onChange={(hex) => setStandartMaterialOptions({ ...standardMaterialOptions, diffuseColor: BABYLON.Color3.FromHexString(hex) })}
                />
                <div>{standardMaterialOptions.diffuseColor.toHexString()}</div>
              </div>
              <div>
                <div>specularColor</div>
                <ColorPicker
                  value={standardMaterialOptions.specularColor.toHexString()}
                  onChange={(hex) => setStandartMaterialOptions({ ...standardMaterialOptions, specularColor: BABYLON.Color3.FromHexString(hex) })}
                />
                <div>{standardMaterialOptions.specularColor.toHexString()}</div>
              </div>
              <div>
                <div>emissiveColor</div>
                <ColorPicker
                  value={standardMaterialOptions.emissiveColor.toHexString()}
                  onChange={(hex) => setStandartMaterialOptions({ ...standardMaterialOptions, emissiveColor: BABYLON.Color3.FromHexString(hex) })}
                />
                <div>{standardMaterialOptions.emissiveColor.toHexString()}</div>
              </div>
              <div>
                <div>ambientColor</div>
                <ColorPicker
                  value={standardMaterialOptions.ambientColor.toHexString()}
                  onChange={(hex) => setStandartMaterialOptions({ ...standardMaterialOptions, ambientColor: BABYLON.Color3.FromHexString(hex) })}
                />
                <div>{standardMaterialOptions.ambientColor.toHexString()}</div>
              </div>
              <Button onClick={() => setMaterialType('StandardMaterial')}>Apply</Button>
            </TabsContent>
            <TabsContent value="pbr">
              PBRMaterial
              <div>
                <div>albedoColor</div>
                <ColorPicker
                  value={pbrMaterialOptions.albedoColor.toHexString()}
                  onChange={(hex) => setPbrMaterialOptions({ ...pbrMaterialOptions, albedoColor: BABYLON.Color3.FromHexString(hex) })}
                />
                <div>{pbrMaterialOptions.albedoColor.toHexString()}</div>
              </div>
              <div>
                <div>
                  <label htmlFor="metallic">matallic</label>
                  <span>{pbrMaterialOptions.metallic}</span>
                </div>
                <Slider
                  name="metallic"
                  defaultValue={[defaultPbrMaterialOptions.metallic]}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) => setPbrMaterialOptions({ ...pbrMaterialOptions, metallic: value })}
                />
              </div>
              <div>
                <div>
                  <label htmlFor="roughness">roughness</label>
                  <span>{pbrMaterialOptions.roughness}</span>
                </div>
                <Slider
                  name="roughness"
                  defaultValue={[defaultPbrMaterialOptions.roughness]}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) => setPbrMaterialOptions({ ...pbrMaterialOptions, roughness: value })}
                />
              </div>
              <div>
                <div>
                  <label htmlFor="pbr-alpha">alpha</label>
                  <span>{pbrMaterialOptions.alpha}</span>
                </div>
                <Slider
                  name="pbr-alpha"
                  defaultValue={[defaultPbrMaterialOptions.alpha]}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) => setPbrMaterialOptions({ ...pbrMaterialOptions, alpha: value })}
                />
              </div>
              <div>
                <div>
                  <label htmlFor="refraction">refraction</label>
                  <span>{pbrMaterialOptions.refraction}</span>
                </div>
                <Slider
                  name="refraction"
                  defaultValue={[defaultPbrMaterialOptions.refraction]}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) => setPbrMaterialOptions({ ...pbrMaterialOptions, refraction: value })}
                />
              </div>
              <div>
                <div>
                  <label htmlFor="translucency">translucency</label>
                  <span>{pbrMaterialOptions.translucency}</span>
                </div>
                <Slider
                  name="translucenct"
                  defaultValue={[defaultPbrMaterialOptions.translucency]}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) => setPbrMaterialOptions({ ...pbrMaterialOptions, translucency: value })}
                />
              </div>
              <Button onClick={() => setMaterialType('PBRMaterial')}>Apply</Button>
            </TabsContent>
            <TabsContent value="custom">
              CustomMaterial
              <Button onClick={() => setMaterialType('CustomMaterial')}>Apply</Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

export default App
