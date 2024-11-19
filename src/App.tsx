import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import * as BABYLON from '@babylonjs/core'
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SceneComponent from './components/3d/SceneComponent'
import MaterialPreview from './components/3d/MaterialPreview'
import SliderSection from './components/shared/SliderSection'
import ColorPickerSection from './components/shared/ColorPickerSection'
import githubMark from '@/assets/github-mark.svg'
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
  diffuseColor: new BABYLON.Color3(1, 0.4, 0.6),
  specularColor: new BABYLON.Color3(1, 0.8, 0.9),
  emissiveColor: new BABYLON.Color3(0.7, 0.2, 0.3),
  ambientColor: new BABYLON.Color3(1, 0.8, 0.9),
  alpha: 1,
}

const defaultPbrMaterialOptions = {
  albedoColor: new BABYLON.Color3(0.2, 1, 0.5),
  metallic: 0,
  roughness: 0,
  alpha: 1,
  refraction: 0,
  translucency: 0,
}

const defaultText = ''

function App() {
  const [text, setUserInput] = useState(defaultText)
  const [prevText, setPrevUserInput] = useState(defaultText.slice(0, -1))
  const [bevelOptions, setBevelOptions] = useState(defaultBevelOptions)
  const [extrusionOptions, setExtrusionOptions] = useState(defaultExtrusionOptions)
  const [materialType, setMaterialType] = useState<MaterialType>('StandardMaterial')
  const [standardMaterialOptions, setStandartMaterialOptions] = useState(defaultStandardMaterialOptions)
  const [pbrMaterialOptions, setPbrMaterialOptions] = useState(defaultPbrMaterialOptions)
  const [standardMaterialOptionsPreview, setStandartMaterialOptionsPreview] = useState(defaultStandardMaterialOptions)
  const [pbrMaterialOptionsPreview, setPbrMaterialOptionsPreview] = useState(defaultPbrMaterialOptions)

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
      <header className="w-full h-12 flex items-center justify-between shrink-0 px-6 font-bold border-b border-solid border-zinc-200">
        <div>Ballonné</div>
        <a href="https://github.com/leegakyeong/ballonne" target="_blank" rel="noopener noreferrer">
          <img src={githubMark} width="24" height="24" />
        </a>
      </header>
      <div className="w-full h-full flex">
        <div className="min-w-64 px-6 py-4 text-left border-r border-solid border-zinc-200">
          <div className="text-md font-semibold mb-4">Edges</div>
          <div className="text-sm font-semibold mb-4">Bevel</div>
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
          <div className="text-sm font-semibold mt-6 mb-4">Extrusion</div>
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
            className="h-20 rounded-none border-t border-solid border-zinc-200 focus:outline-none px-6"
            placeholder="Type something"
            defaultValue={defaultText}
            onChange={(e) => {
              setUserInput((prev) => {
                setPrevUserInput(prev)
                return e.target.value
              })
            }}
          />
        </div>
        <div className="min-w-64 px-6 py-4 text-left border-l border-solid border-zinc-200">
          <div className="text-md font-semibold mb-4">Material</div>
          <Tabs defaultValue="standard">
            <TabsList className="mb-3">
              <TabsTrigger value="standard" className="bg-transparent text-xs">Standard</TabsTrigger>
              <TabsTrigger value="pbr" className="bg-transparent text-xs">PBR</TabsTrigger>
              <TabsTrigger value="custom" className="bg-transparent text-xs">Custom</TabsTrigger>
            </TabsList>
            <TabsContent value="standard">
              <MaterialPreview
                materialType="StandardMaterial"
                standardMaterialOptions={standardMaterialOptionsPreview}
                pbrMaterialOptions={pbrMaterialOptionsPreview}
              />
              <ColorPickerSection
                name="Diffuse Color"
                value={standardMaterialOptionsPreview.diffuseColor}
                onChange={(hex) => setStandartMaterialOptionsPreview({ ...standardMaterialOptionsPreview, diffuseColor: BABYLON.Color3.FromHexString(hex) })}
              />
              <ColorPickerSection
                name="Specular Color"
                value={standardMaterialOptionsPreview.specularColor}
                onChange={(hex) => setStandartMaterialOptionsPreview({ ...standardMaterialOptionsPreview, specularColor: BABYLON.Color3.FromHexString(hex) })}
              />
              <ColorPickerSection
                name="Emissive Color"
                value={standardMaterialOptionsPreview.emissiveColor}
                onChange={(hex) => setStandartMaterialOptionsPreview({ ...standardMaterialOptionsPreview, emissiveColor: BABYLON.Color3.FromHexString(hex) })}
              />
              <ColorPickerSection
                name="Ambient Color"
                value={standardMaterialOptionsPreview.ambientColor}
                onChange={(hex) => setStandartMaterialOptionsPreview({ ...standardMaterialOptionsPreview, ambientColor: BABYLON.Color3.FromHexString(hex) })}
              />
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => {
                    setMaterialType('StandardMaterial')
                    setStandartMaterialOptions(standardMaterialOptionsPreview)
                  }}
                >Apply</Button>
              </div>
            </TabsContent>
            <TabsContent value="pbr">
              <MaterialPreview
                materialType="PBRMaterial"
                standardMaterialOptions={standardMaterialOptionsPreview}
                pbrMaterialOptions={pbrMaterialOptionsPreview}
              />
              <ColorPickerSection
                name="Albedo Color"
                value={pbrMaterialOptionsPreview.albedoColor}
                onChange={(hex) => setPbrMaterialOptionsPreview({ ...pbrMaterialOptionsPreview, albedoColor: BABYLON.Color3.FromHexString(hex) })}
              />
              <SliderSection
                name="Metallic"
                value={pbrMaterialOptionsPreview.metallic}
                defaultValue={defaultPbrMaterialOptions.metallic}
                max={1}
                step={0.01}
                onValueChange={(value) => setPbrMaterialOptionsPreview({ ...pbrMaterialOptionsPreview, metallic: value })}
              />
              <SliderSection
                name="Roughness"
                value={pbrMaterialOptionsPreview.roughness}
                defaultValue={defaultPbrMaterialOptions.roughness}
                max={1}
                step={0.01}
                onValueChange={(value) => setPbrMaterialOptionsPreview({ ...pbrMaterialOptionsPreview, roughness: value })}
              />
              <SliderSection
                name="Alpha"
                value={pbrMaterialOptionsPreview.alpha}
                defaultValue={defaultPbrMaterialOptions.alpha}
                max={1}
                step={0.01}
                onValueChange={(value) => setPbrMaterialOptionsPreview({ ...pbrMaterialOptionsPreview, alpha: value })}
              />
              <SliderSection
                name="Refraction"
                value={pbrMaterialOptionsPreview.refraction}
                defaultValue={defaultPbrMaterialOptions.refraction}
                max={1}
                step={0.01}
                onValueChange={(value) => setPbrMaterialOptionsPreview({ ...pbrMaterialOptionsPreview, refraction: value })}
              />
              <SliderSection
                name="Translucency"
                value={pbrMaterialOptionsPreview.translucency}
                defaultValue={defaultPbrMaterialOptions.translucency}
                max={1}
                step={0.01}
                onValueChange={(value) => setPbrMaterialOptionsPreview({ ...pbrMaterialOptionsPreview, translucency: value })}
              />
              <div className="mt-7 flex justify-center">
                <Button
                  onClick={() => {
                    setMaterialType('PBRMaterial')
                    setPbrMaterialOptions(pbrMaterialOptionsPreview)
                  }}
                >Apply</Button>
              </div>
            </TabsContent>
            <TabsContent value="custom">
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

export default App
