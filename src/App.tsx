import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import * as BABYLON from '@babylonjs/core'
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from './components/ui/color-picker'
import SceneComponent from './components/3d/SceneComponent'
import SliderSection from './components/shared/SliderSection'
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

  const handleBevelDepthChange = useDebouncedCallback((value) => {
    setBevelOptions((prev) => ({ ...prev, depth: value }))
  }, 200)

  const handleBevelSegmentsChange = useDebouncedCallback((value) => {
    setBevelOptions((prev) => ({ ...prev, segments: value }))
  }, 200)

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
        <div className="min-w-64 p-6">
          <SliderSection
            name="Bevel Depth"
            value={bevelOptions.depth}
            defaultValue={defaultBevelOptions.depth}
            max={1}
            step={0.1}
            onValueChange={handleBevelDepthChange}
          />
          <SliderSection
            name="Bevel Segments"
            value={bevelOptions.segments}
            defaultValue={defaultBevelOptions.segments}
            max={100}
            step={1}
            onValueChange={handleBevelSegmentsChange}
          />
          <SliderSection
            name="Extrusion Depth"
            value={extrusionOptions.depth}
            defaultValue={defaultExtrusionOptions.depth}
            max={10}
            min={1}
            step={0.1}
            onValueChange={handleExtrusionDepthChange}
          />
          <SliderSection
            name="Extrusion Scale"
            value={extrusionOptions.scale}
            defaultValue={defaultExtrusionOptions.scale}
            max={5}
            step={0.1}
            onValueChange={handleExtrusionScaleChange}
          />
          <SliderSection
            name="Extrusion Rotation"
            value={`${extrusionOptions.rotation}${extrusionOptions.rotation ? 'π' : ''} rad`}
            defaultValue={defaultExtrusionOptions.rotation}
            max={5}
            step={0.1}
            onValueChange={handleExtrusionRotationChange}
          />
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
        <div className="min-w-64 p-6">
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
              <div className="mb-4">
                <div className="mb-1 text-left">albedoColor</div>
                <div className="flex items-center">
                  <ColorPicker
                    className="mr-2"
                    value={pbrMaterialOptions.albedoColor.toHexString()}
                    onChange={(hex) => setPbrMaterialOptions({ ...pbrMaterialOptions, albedoColor: BABYLON.Color3.FromHexString(hex) })}
                  />
                  <div>{pbrMaterialOptions.albedoColor.toHexString()}</div>
                </div>
              </div>
              <SliderSection
                name="Metallic"
                value={pbrMaterialOptions.metallic}
                defaultValue={defaultPbrMaterialOptions.metallic}
                max={1}
                step={0.01}
                onValueChange={(value) => setPbrMaterialOptions({ ...pbrMaterialOptions, metallic: value })}
              />
              <SliderSection
                name="Roughness"
                value={pbrMaterialOptions.roughness}
                defaultValue={defaultPbrMaterialOptions.roughness}
                max={1}
                step={0.01}
                onValueChange={(value) => setPbrMaterialOptions({ ...pbrMaterialOptions, roughness: value })}
              />
              <SliderSection
                name="Alpha"
                value={pbrMaterialOptions.alpha}
                defaultValue={defaultPbrMaterialOptions.alpha}
                max={1}
                step={0.01}
                onValueChange={(value) => setPbrMaterialOptions({ ...pbrMaterialOptions, alpha: value })}
              />
              <SliderSection
                name="Refraction"
                value={pbrMaterialOptions.refraction}
                defaultValue={defaultPbrMaterialOptions.refraction}
                max={1}
                step={0.01}
                onValueChange={(value) => setPbrMaterialOptions({ ...pbrMaterialOptions, refraction: value })}
              />
              <SliderSection
                name="Translucency"
                value={pbrMaterialOptions.translucency}
                defaultValue={defaultPbrMaterialOptions.translucency}
                max={1}
                step={0.01}
                onValueChange={(value) => setPbrMaterialOptions({ ...pbrMaterialOptions, translucency: value })}
              />
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
