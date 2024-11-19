import { useEffect, useRef } from 'react'
import * as BABYLON from '@babylonjs/core'
import { PbrMaterialOptions, StandardMaterialOptions } from '@/types/options'

type MaterialType = 'StandardMaterial' | 'PBRMaterial' | 'CustomMaterial'

type MaterialPreviewProps = {
  materialType: MaterialType
  standardMaterialOptions: StandardMaterialOptions
  pbrMaterialOptions: PbrMaterialOptions
}

export default function MaterialPreview({
  materialType,
  standardMaterialOptions,
  pbrMaterialOptions,
}: MaterialPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<BABYLON.Scene>()
  const engineRef = useRef<BABYLON.Engine>()

  useEffect(() => {
    const { current: canvas } = canvasRef

    if (!canvas) return

    const engine = new BABYLON.Engine(canvas, true)
    engineRef.current = engine

    const scene = new BABYLON.Scene(engine)
    scene.clearColor = new BABYLON.Color4(1, 1, 1, 1)

    sceneRef.current = scene

    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1;

    engine.runRenderLoop(() => {
      scene.render()
    })

    const resize = () => {
      scene.getEngine().resize()
    }

    if (window) {
      window.addEventListener('resize', resize)
    }

    return () => {
      scene.getEngine().dispose()

      if (window) {
        window.removeEventListener('resize', resize)
      }
    }
  }, [])

  useEffect(() => {
    const scene = sceneRef.current
    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 8 }, scene)

    if (materialType === 'StandardMaterial') {
      const { diffuseColor, specularColor, emissiveColor, ambientColor, alpha } = standardMaterialOptions

      const material = new BABYLON.StandardMaterial('material', scene)
      material.diffuseColor = diffuseColor
      material.specularColor = specularColor
      material.emissiveColor = emissiveColor
      material.ambientColor = ambientColor
      material.alpha = alpha

      sphere.material = material
    } else if (materialType === 'PBRMaterial') {
      const { albedoColor, metallic, roughness, alpha, refraction, translucency } = pbrMaterialOptions

      const material = new BABYLON.PBRMaterial('material', scene)
      material.albedoColor = albedoColor
      material.metallic = metallic
      material.roughness = roughness
      material.alpha = alpha
      material.subSurface.isRefractionEnabled = true
      material.subSurface.refractionIntensity = refraction
      material.subSurface.isTranslucencyEnabled = true
      material.subSurface.translucencyIntensity = translucency

      sphere.material = material
    } else {
      //
    }
  }, [materialType, standardMaterialOptions, pbrMaterialOptions])

  return <canvas ref={canvasRef} width={208} height={208} className="mb-5" />
}
