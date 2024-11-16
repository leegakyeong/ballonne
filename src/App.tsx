import { useState, useCallback } from 'react'
import * as BABYLON from "@babylonjs/core"
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, Scene, Animation, CircleEase, EasingFunction, StandardMaterial, Color3, GlowLayer, ParticleHelper, PointLight, PBRMaterial, Mesh, Vector2, PolygonMeshBuilder, VertexBuffer } from '@babylonjs/core'
import earcut from 'earcut'
import opentype from 'opentype.js'
import { Compiler, Font, TextMeshBuilder } from 'babylon.font'
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import SceneComponent from './components/3d/SceneComponent'
import wasmUrl from "babylon.font/build/optimized.wasm?url";
import './App.css'

type MaterialType = 'StandardMaterial' | 'PBRMaterial'

function App() {
  const [userInput, setUserInput] = useState('')
  const [prevUserInput, setPrevUserInput] = useState('')
  const [materialType, setMaterialType] = useState<MaterialType>('StandardMaterial')

  async function onSceneReady(scene: Scene) {
    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());

    const canvas = scene.getEngine().getRenderingCanvas();

    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // render text
    const res = await fetch('/src/assets/Phase-AGX_29-55-82.json')
    const fontData = await res.json()

    const curveAnimation = await Animation.CreateFromSnippetAsync('1NGH42#44')

    let letterMaterial
    switch (materialType) {
      case 'StandardMaterial':
        letterMaterial = new StandardMaterial('letterMaterial', scene)
        break
      case 'PBRMaterial':
        letterMaterial = new PBRMaterial('letterMaterial', scene)
        break
      default:
        letterMaterial = new StandardMaterial('letterMaterial', scene)
        break
    }

    const compiler = await Compiler.Build(wasmUrl);
    const font = await Font.Install("/src/assets/NotoSansKR-Regular.ttf", compiler, opentype);
    const builder = new TextMeshBuilder(BABYLON, earcut)

    const words = userInput > prevUserInput ? userInput.split(' ') : prevUserInput.split(' ')
    const letters = userInput > prevUserInput ? userInput.split('') : prevUserInput.split('')
    let letterMesh
    let x = 0
    let y = 0
    letters.forEach((letter, i) => {
      const mesh: Mesh = builder.create(
        {
          font,
          text: letter,
          size: 1,
          ppc: 2,
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
      const positions = mesh.getVerticesData(VertexBuffer.PositionKind)
      if (!positions) return
      // paths도 닫아 줘야 하는데...
      const polygonPath = []
      for (let i = 0; i < positions.length; i += 3) {
        polygonPath.push(new Vector3(positions[i], positions[i + 2], 0))
      }
      polygonPath.push(polygonPath[0]) // 폴리곤을 닫아야 함. 이 부분 고치기!
      letterMesh = MeshBuilder.ExtrudeShape(
        'letterMesh',
        {
          shape: polygonPath,
          path: [new Vector3(0, 0, 0), new Vector3(0, 0, 1)],
          closePath: true,
          // closeShape: true,
          // rotation: 0.5,
          // cap: Mesh.CAP_ALL,
          // sideOrientation: Mesh.DOUBLESIDE
        },
        scene
      )
      letterMesh.position = mesh.position
      mesh.setEnabled(false)

      if (letter === ' ') {
        letterMesh = MeshBuilder.CreateBox(
          'spaceMesh',
          {
            width: 0.1,
          },
          scene
        )
        letterMesh.position.y = 0.5
      }

      if (!letterMesh) return

      // const letterMaterial = new StandardMaterial('letterMaterial', scene)
      letterMesh.material = letterMaterial;

      if (words.includes('good')) {
        letterMaterial.emissiveColor = new Color3(0, 0, 0)
        const glow = new GlowLayer('glow', scene)
        glow.intensity = 0.2
        glow.customEmissiveColorSelector = function (mesh, _0, _1, result) {
          if (mesh.name === "letterMesh") {
            result.set(1, 1, 0, 1);
          } else {
            result.set(0, 0, 0, 0);
          }
        }

        // light emission (근데 반사할 만한 곳이 필요할 듯..?)
        const pointLight = new PointLight('pointLight', new Vector3(1, 1, 1), scene)
        pointLight.diffuse = new Color3(1, 0, 0);
	      pointLight.specular = new Color3(0, 1, 0);
      } else if (words.includes('sad')) {
        letterMaterial.diffuseColor = new Color3(0, 0, 1)

        const droopAnimation = new Animation(
          'droopAnimation',
          'position.y',
          30,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CYCLE,
        )

        droopAnimation.setKeys([
          { frame: 0, value: letterMesh.position.y },
          { frame: 60, value: letterMesh.position.y - Math.random() * 2 },
        ])

        const easingFunction = new CircleEase()
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT)
        droopAnimation.setEasingFunction(easingFunction)

        letterMesh.animations.push(droopAnimation)
        scene.beginAnimation(letterMesh, 0, 120, false)
      } else if (words.includes('smile')) {
        letterMesh.animations = curveAnimation as Animation[]
        scene.beginAnimation(letterMesh, 0, 100, false)

        ParticleHelper.CreateDefault(new Vector3(0, 0.5, 0)).start()
      } else {
        letterMaterial.diffuseColor = new Color3(1, 0, 1)
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

      x += letterWidth / 2 + letterSpacing

      // 마지막 글자 입력 애니메이션
      if (i + 1 === (userInput > prevUserInput ? userInput.length : prevUserInput.length)) {
        const letterAppearanceAnimation = new Animation(
          'letterAppearanceAnimation',
          'material.alpha',
          30,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CYCLE,
        )

        letterAppearanceAnimation.setKeys([
          { frame: 0, value: userInput > prevUserInput ? 0 : 1 },
          { frame: 10, value: userInput > prevUserInput ? 1 : 0 },
        ])

        const easingFunction = new CircleEase()
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)
        letterAppearanceAnimation.setEasingFunction(easingFunction)

        letterMesh.animations.push(letterAppearanceAnimation)
        scene.beginAnimation(letterMesh, 0, 120, false)
      }
    })
  }

  const onRender = useCallback((scene: Scene) => {
  }, [])

  return (
    <>
      <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" userInput={userInput} />
      <Input
        onChange={(e) => {
          setUserInput((prev) => {
            setPrevUserInput(prev)
            return e.target.value
          })
        }}
      />
      <div>
        <Button onClick={() => setMaterialType('StandardMaterial')}>Standard Material</Button>
        <Button onClick={() => setMaterialType('PBRMaterial')}>PBR Material</Button>
      </div>
    </>
  )
}

export default App
