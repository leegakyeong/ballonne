import { useEffect, useRef, useCallback } from 'react'
import * as BABYLON from '@babylonjs/core'
import { Compiler, Font, TextMeshBuilder } from 'babylon.font'
import opentype from 'opentype.js'
import earcut from 'earcut'
import wasmUrl from 'babylon.font/build/optimized.wasm?url'
import { PbrMaterialOptions, StandardMaterialOptions } from '@/types/options'
import { createBeveledPaths } from '@/utils/bevel'

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
  const letterPosRef = useRef({ x: 0, y: 0 })
  const goodGlowRef = useRef<BABYLON.GlowLayer>()

  const getCurrentMaterial = useCallback((scene: BABYLON.Scene) => {
    switch (materialType) {
      case 'StandardMaterial': {
        const { diffuseColor, specularColor, emissiveColor, ambientColor } = standardMaterialOptions

        const letterMaterial = new BABYLON.StandardMaterial('letterMaterial', scene)

        letterMaterial.diffuseColor = diffuseColor
        letterMaterial.specularColor = specularColor
        letterMaterial.emissiveColor = emissiveColor
        letterMaterial.ambientColor = ambientColor

        return letterMaterial
      }
      case 'PBRMaterial': {
        const { albedoColor, metallic, roughness, alpha, refraction, translucency } = pbrMaterialOptions

        const letterMaterial = new BABYLON.PBRMaterial('letterMaterial', scene)

        letterMaterial.albedoColor = albedoColor

        letterMaterial.metallic = metallic
        letterMaterial.roughness = roughness
        letterMaterial.alpha = alpha

        letterMaterial.subSurface.isRefractionEnabled = true
        letterMaterial.subSurface.refractionIntensity = refraction

        letterMaterial.subSurface.isTranslucencyEnabled = true
        letterMaterial.subSurface.translucencyIntensity = translucency

        return letterMaterial
      }
      case 'CustomMaterial': {
        return new BABYLON.StandardMaterial('letterMaterial', scene)
      }
      default: {
        return new BABYLON.StandardMaterial('letterMaterial', scene)
      }
    }
  }, [materialType, pbrMaterialOptions, standardMaterialOptions])

  const createLetterMesh = useCallback((letter: string, font: Font, builder: TextMeshBuilder, scene: BABYLON.Scene) => {
    const frontMesh: BABYLON.Mesh = builder.create(
      {
        font,
        text: letter === ' ' ? 'l' : letter,
        size: extrusionOptions.scale,
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

    // Bevel 경로 생성
    const { depth: bevelDepth, segments: bevelSegments } = bevelOptions
    // const beveledPaths = createBeveledPaths(polygonPath, bevelDepth, bevelSize, bevelSegments, bevelDepth);
    const beveledPaths = createBeveledPaths(polygonPath, bevelDepth, 0.2, bevelSegments)

    const bevelMesh = BABYLON.MeshBuilder.CreateRibbon(
      "bevelMesh",
      {
        pathArray: beveledPaths,
        closeArray: true,
        closePath: true
      },
      scene
    );

    const sideMesh = BABYLON.ExtrudeShape('sideMesh', {
      shape: polygonPath,
      path: [new BABYLON.Vector3(0, 0, bevelDepth), new BABYLON.Vector3(0, 0, extrusionOptions.depth - bevelDepth)],
      // scale: extrusionOptions.scale,
      rotation: Math.PI * extrusionOptions.rotation,
      closeShape: true,
      closePath: true,
      // cap: BABYLON.Mesh.CAP_ALL,
    })
    // bevelDepth가 extrusion.depth보다 커지면 안 됨!!

    const letterMesh = BABYLON.Mesh.MergeMeshes([frontMesh, bevelMesh, sideMesh], true)
    frontMesh.isEnabled(false)
    bevelMesh.isEnabled(false)
    sideMesh.isEnabled(false)

    if (!letterMesh) return
    letterMesh.name = letter === ' ' ? 'spaceMesh' : 'letterMesh'

    const letterMaterial = getCurrentMaterial(scene)
    letterMesh.material = letterMaterial;

    if (letter === ' ') letterMaterial.alpha = 0

    return letterMesh
  }, [bevelOptions, extrusionOptions, getCurrentMaterial])

  function positionLetterMesh(letter: string, letterMesh: BABYLON.Mesh, scene: BABYLON.Scene, isDelete=false) {
    const maximum = letterMesh.getBoundingInfo().boundingBox.maximum
    const minimum = letterMesh.getBoundingInfo().boundingBox.minimum
    const letterWidth = maximum.subtract(minimum).x

    const letterSpacing = 0.1
    const translationX = (letterWidth / 2 + letterSpacing) * (isDelete ? -1 : 1)

    letterPosRef.current.x += translationX

    letterMesh.position.x = letterPosRef.current.x
    // letterMesh.position.y = y

    letterPosRef.current.x += translationX

    const letterAppearanceAnimation = new BABYLON.Animation(
      'letterAppearanceAnimation',
      'material.alpha',
      30,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
    )

    letterAppearanceAnimation.setKeys([
      { frame: 0, value: isDelete ? 1 : 0 },
      { frame: 10, value: isDelete ? 0 : 1 },
    ])

    const easingFunction = new BABYLON.CircleEase()
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT)
    letterAppearanceAnimation.setEasingFunction(easingFunction)

    if (letter !== ' ') letterMesh.animations.push(letterAppearanceAnimation)
    scene.beginAnimation(letterMesh, 0, 120, false, 1, isDelete ? () => letterMesh.dispose() : undefined)
  }

  // set up basic engine and scene
  useEffect(() => {
    const { current: canvas } = canvasRef

    if (!canvas) return

    const engine = new BABYLON.Engine(canvas, antialias)
    engineRef.current = engine

    const scene = new BABYLON.Scene(engine)
    scene.clearColor = new BABYLON.Color4(1, 0.9, 0.95, 1)

    sceneRef.current = scene

    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(new BABYLON.Vector3(3, 0, 0));
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1;

    goodGlowRef.current = new BABYLON.GlowLayer('goodGlow', scene)

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
    async function updateTextMesh(scene: BABYLON.Scene, text: string) {
      const compiler = await Compiler.Build(wasmUrl);
      const font = await Font.Install("/src/assets/NotoSansKR-Regular.ttf", compiler, opentype);
      const builder = new TextMeshBuilder(BABYLON, earcut)

      const curveAnimation = await BABYLON.Animation.CreateFromSnippetAsync('1NGH42#44')

      if (text.length === textMeshRef.current.length) { // 텍스트가 아니라 edge나 material 관련 옵션이 업데이트됐을 때
        textMeshRef.current.forEach((mesh) => mesh.dispose())
        textMeshRef.current = []

        const compiler = await Compiler.Build(wasmUrl);
        const font = await Font.Install("/src/assets/NotoSansKR-Regular.ttf", compiler, opentype);
        const builder = new TextMeshBuilder(BABYLON, earcut)

        letterPosRef.current = { x: 0, y: 0 }
        text.split('').forEach((letter) => {

          const letterMesh = createLetterMesh(letter, font, builder, scene)

          if (!letterMesh) return

          positionLetterMesh(letter, letterMesh, scene)

          textMeshRef.current.push(letterMesh)
        })

        return
      }

      if (text > prevText) {
        const lastLetter = text[text.length - 1]
        const letterMesh = createLetterMesh(lastLetter, font, builder, scene)

        if (!letterMesh) return

        positionLetterMesh(lastLetter, letterMesh, scene)

        textMeshRef.current.push(letterMesh)
      } else if (text < prevText) {
        const letterMesh = textMeshRef.current[textMeshRef.current.length - 1]

        if (!letterMesh) return

        positionLetterMesh(prevText[prevText.length - 1], letterMesh, scene, true)

        textMeshRef.current.pop()
      } else {
        //
      }

      const goodGlow = goodGlowRef.current
      if (!goodGlow) return

      const words = text.split(' ')
      goodGlow.isEnabled = false
      textMeshRef.current.forEach((letterMesh) => {
        if (words.includes('good')) {
          const goodMaterial = new BABYLON.StandardMaterial('goodMaterial')
          goodMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0)

          goodGlow.isEnabled = true
          goodGlow.intensity = 0.2
          goodGlow.customEmissiveColorSelector = function (mesh, _0, _1, result) {
            if (mesh.name === "letterMesh") {
              result.set(1, 1, 0, 1);
            } else {
              result.set(0, 0, 0, 0);
            }
          }

          // const pointLight = new BABYLON.PointLight('pointLight', new BABYLON.Vector3(1, 1, 1), scene)
          // pointLight.diffuse = new BABYLON.Color3(1, 1, 0);
          // pointLight.specular = new BABYLON.Color3(1, 1, 0);

          letterMesh.material = goodMaterial
        } else if (words.includes('sad')) {
          goodGlow.isEnabled = false

          const sadMaterial = new BABYLON.StandardMaterial('sadMaterial')
          sadMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1)

          letterMesh.material = sadMaterial

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
          goodGlow.isEnabled = false

          letterMesh.animations = curveAnimation as BABYLON.Animation[]
          scene.beginAnimation(letterMesh, 0, 100, false)

          BABYLON.ParticleHelper.CreateDefault(new BABYLON.Vector3(0, 0.5, 0)).start()
        } else {
          goodGlow.isEnabled = false
          letterMesh.material = getCurrentMaterial(scene)
        }

        if (letterMesh && letterMesh.material && letterMesh.name === 'spaceMesh') letterMesh.material.alpha = 0
      })
    }

    if (sceneRef.current) {
      updateTextMesh(sceneRef.current, text);
    }
  }, [text, prevText, materialType, createLetterMesh, getCurrentMaterial])

  return <canvas ref={canvasRef} {...rest} className="w-full flex-1" /> // 리사이징 했을 때 버그 해결해야 함
}
