import { useEffect, useRef } from 'react'
import * as BABYLON from '@babylonjs/core'
import { Compiler, Font, TextMeshBuilder } from 'babylon.font'
import opentype from 'opentype.js'
import earcut from 'earcut'
import wasmUrl from 'babylon.font/build/optimized.wasm?url'
import { PbrMaterialOptions, StandardMaterialOptions } from '@/types/options'

type MaterialType = 'StandardMaterial' | 'PBRMaterial' | 'CustomMaterial'

type SceneComponentProps = {
  antialias: boolean
  id: string
  text: string
  prevText: string
  bevelOptions: { depth: number; segments: number; }
  extrusionOptions: { depth: number; scale: number; rotation: number; }
  materialType: MaterialType
  standardMaterialOptions: StandardMaterialOptions
  pbrMaterialOptions: PbrMaterialOptions
}

export default function SceneComponent({
  antialias,
  text,
  prevText,
  bevelOptions,
  extrusionOptions,
  materialType,
  standardMaterialOptions,
  pbrMaterialOptions,
  ...rest
}: SceneComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<BABYLON.Scene>()
  const engineRef = useRef<BABYLON.Engine>()
  const textMeshRef = useRef<BABYLON.Mesh[]>([])

  // set up basic engine and scene
  useEffect(() => {
    const { current: canvas } = canvasRef

    if (!canvas) return

    const engine = new BABYLON.Engine(canvas, antialias)
    engineRef.current = engine

    const scene = new BABYLON.Scene(engine)
    sceneRef.current = scene

    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

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
  }, [antialias])

  useEffect(() => {
    async function updateTextMesh(scene: BABYLON.Scene, text:string) {
      if (textMeshRef.current) {
        textMeshRef.current.forEach((mesh) => mesh.dispose())
        textMeshRef.current = [];
      }

      const compiler = await Compiler.Build(wasmUrl);
      const font = await Font.Install("/src/assets/NotoSansKR-Regular.ttf", compiler, opentype);
      const builder = new TextMeshBuilder(BABYLON, earcut)

      const curveAnimation = await BABYLON.Animation.CreateFromSnippetAsync('1NGH42#44')

      const words = text > prevText ? text.split(' ') : prevText.split(' ')
      const letters = text > prevText ? text.split('') : prevText.split('')
      const letterMeshes: BABYLON.Mesh[] = []
      let x = 0
      // let y = 0
      letters.forEach((letter, i) => {
        const frontMesh: BABYLON.Mesh = builder.create(
          {
            font,
            text: letter,
            size: 5 * extrusionOptions.scale,
            ppc: 5,
            eps: 0.001,
            // plus `BABYLON.MeshBuilder.CreatePolygon` options
            // depth,
            // sideOrientation,
            // faceColors,
            // faceUV,
            // backUVs,
            // frontUVs,
            // updatable,
           },
          scene,
        )
        const positions = frontMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)
        if (!positions) return
        // paths도 닫아 줘야 하는데...
        const polygonPath = []
        for (let i = 0; i < positions.length; i += 3) {
          polygonPath.push(new BABYLON.Vector3(positions[i], positions[i + 2], 0))
        }
        // polygonPath.push(polygonPath[0]) // 폴리곤을 닫아야 함. 이 부분 고치기!

        // frontMesh.setEnabled(false)
        frontMesh.rotate(new BABYLON.Vector3(1, 0, 0), -Math.PI / 2)
        // frontMesh.translate(new BABYLON.Vector3(1, 0, 0), 1)

        const sideMesh = BABYLON.ExtrudeShape('letterMesh', {
          shape: polygonPath,
          path: [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, extrusionOptions.depth)],
          // scale: extrusionOptions.scale,
          rotation: Math.PI * extrusionOptions.rotation,
          closeShape: true,
          closePath: true,
          // cap: BABYLON.Mesh.CAP_ALL,
        })

        const letterMesh = BABYLON.Mesh.MergeMeshes([frontMesh, sideMesh], true)

        if (!letterMesh) return

        // const letterMaterial = new BABYLON.StandardMaterial('letterMaterial', scene)
        let letterMaterial
        switch (materialType) {
          case 'StandardMaterial': {
            const { diffuseColor, specularColor, emissiveColor, ambientColor } = standardMaterialOptions

            letterMaterial = new BABYLON.StandardMaterial('letterMaterial', scene)

            letterMaterial.diffuseColor = diffuseColor
            letterMaterial.specularColor = specularColor
            letterMaterial.emissiveColor = emissiveColor
            letterMaterial.ambientColor = ambientColor

            break
          }
          case 'PBRMaterial': {
            const { albedoColor, metallic, roughness, alpha, refraction, translucency } = pbrMaterialOptions

            letterMaterial = new BABYLON.PBRMaterial('letterMaterial', scene)

            letterMaterial.albedoColor = albedoColor

            letterMaterial.metallic = metallic
            letterMaterial.roughness = roughness
            letterMaterial.alpha = alpha

            letterMaterial.subSurface.isRefractionEnabled = true
            letterMaterial.subSurface.refractionIntensity = refraction

            letterMaterial.subSurface.isTranslucencyEnabled = true
            letterMaterial.subSurface.translucencyIntensity = translucency

            break
          }
          case 'CustomMaterial': {
            letterMaterial = new BABYLON.StandardMaterial('letterMaterial', scene)
            break
          }
          default: {
            letterMaterial = new BABYLON.StandardMaterial('letterMaterial', scene)
            break
          }
        }
        letterMesh.material = letterMaterial;

        if (words.includes('good')) {
          letterMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0)
          const glow = new BABYLON.GlowLayer('glow', scene)
          glow.intensity = 0.2
          glow.customEmissiveColorSelector = function (mesh, _0, _1, result) {
            if (mesh.name === "letterMesh") {
              result.set(1, 1, 0, 1);
            } else {
              result.set(0, 0, 0, 0);
            }
          }

          // light emission (근데 반사할 만한 곳이 필요할 듯..?)
          const pointLight = new BABYLON.PointLight('pointLight', new BABYLON.Vector3(1, 1, 1), scene)
          pointLight.diffuse = new BABYLON.Color3(1, 0, 0);
          pointLight.specular = new BABYLON.Color3(0, 1, 0);
        } else if (words.includes('sad')) {
          if (letterMaterial.diffuseColor) {
            letterMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1)
          } else {
            letterMaterial.albedoColor = new BABYLON.Color3(0, 0, 1)
          }

          const droopAnimation = new BABYLON.Animation(
            'droopAnimation',
            'position.y',
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
          )

          droopAnimation.setKeys([
            { frame: 0, value: letterMesh.position.y },
            { frame: 60, value: letterMesh.position.y - Math.random() * 2 },
          ])

          const easingFunction = new BABYLON.CircleEase()
          easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT)
          droopAnimation.setEasingFunction(easingFunction)

          letterMesh.animations.push(droopAnimation)
          scene.beginAnimation(letterMesh, 0, 120, false)
        } else if (words.includes('smile')) {
          letterMesh.animations = curveAnimation as BABYLON.Animation[]
          scene.beginAnimation(letterMesh, 0, 100, false)

          BABYLON.ParticleHelper.CreateDefault(new BABYLON.Vector3(0, 0.5, 0)).start()
        } else {
          // letterMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1)
        }

        if (letter === ' ') letterMaterial.alpha = 0

        // 글자 위치 설정
        // letterMesh.showBoundingBox = true
        const maximum = letterMesh.getBoundingInfo().boundingBox.maximum
        const minimum = letterMesh.getBoundingInfo().boundingBox.minimum
        const letterWidth = maximum.subtract(minimum).x

        const letterSpacing = 0.1

        x += letterWidth / 2 + letterSpacing

        letterMesh.position.x = x
        // letterMesh.position.y = y
        // bevelMesh.position.x = x
        frontMesh.position.x = x

        x += letterWidth / 2 + letterSpacing

        // 마지막 글자 입력 애니메이션
        if (i + 1 === (text > prevText ? text.length : prevText.length)) {
          const letterAppearanceAnimation = new BABYLON.Animation(
            'letterAppearanceAnimation',
            'material.alpha',
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
          )

          letterAppearanceAnimation.setKeys([
            { frame: 0, value: text > prevText ? 0 : 1 },
            { frame: 10, value: text > prevText ? 1 : 0 },
          ])

          const easingFunction = new BABYLON.CircleEase()
          easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT)
          letterAppearanceAnimation.setEasingFunction(easingFunction)

          letterMesh.animations.push(letterAppearanceAnimation)
          scene.beginAnimation(letterMesh, 0, 120, false, 1, () => text < prevText && letterMesh.dispose())
        }

        letterMeshes.push(letterMesh)
      })

      textMeshRef.current = letterMeshes
    }

    if (sceneRef.current) {
      updateTextMesh(sceneRef.current, text);
    }
  }, [text, prevText, bevelOptions, extrusionOptions, materialType, standardMaterialOptions, pbrMaterialOptions])

  return <canvas ref={canvasRef} {...rest} className="w-full flex-1" /> // 리사이징 했을 때 버그 해결해야 함
}
