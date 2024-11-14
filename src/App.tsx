import { useState, useCallback } from 'react'
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, Scene, Mesh, Animation, CircleEase, EasingFunction, StandardMaterial, Color3, GlowLayer } from '@babylonjs/core'
import earcut from 'earcut'
import { Input } from '@/components/ui/input'
import SceneComponent from './components/3d/SceneComponent'
import './App.css'

function App() {
  const [userInput, setUserInput] = useState('')

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

    userInput.split(' ').forEach((word, i) => {
      switch (word) {
        case 'good': {
          console.log('good')
          const glow = new GlowLayer('glow', scene)
          glow.customEmissiveColorSelector = function (mesh, subMesh, material, result) {
            if (mesh.name === "letterMesh") {
              result.set(1, 1, 0, 1);
            } else {
              result.set(0, 0, 0, 0);
            }
          }
          break
        }
        case 'sad':
          console.log('sad')
          break
        case 'smile':
          console.log('smile')
          break
        default:
          break
      }

      let x = 0
      let y = 0
      word.split('').forEach((letter, j) => {
        const letterMesh = MeshBuilder.CreateText(
          'letterMesh',
          letter,
          fontData,
          {
            size: 2,
            resolution: 10,
            depth: 1,
          },
          scene,
          earcut,
        )

        if (!letterMesh) return

        // 각 메쉬 위치 설정
        letterMesh.position.x = x
        letterMesh.position.y = y
        x += 2 // letterMesh.getBoundingInfo().boundingBox

        const letterMaterial = new StandardMaterial('letterMaterial', scene)
        // letterMaterial.diffuseColor = new Color3(1, 1, 0)
        letterMaterial.emissiveColor = new Color3(1, 0.5, 1)
        letterMesh.material = letterMaterial

        // 마지막 글자면
        if ((i + 1) * (j + 1) === userInput.length) {
          const letterAppearanceAnimation = new Animation(
            'letterAppearanceAnimation',
            'material.alpha',
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE,
          )
          const keyframes = [
            { frame: 0, value: 0 },
            { frame: 10, value: 1 },
          ]
          letterAppearanceAnimation.setKeys(keyframes)

          const easingFunction = new CircleEase()
          easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)
          letterAppearanceAnimation.setEasingFunction(easingFunction)

          letterMesh.animations.push(letterAppearanceAnimation)
          scene.beginAnimation(letterMesh, 0, 120, false)
        }
      })
    })
  }

  const onRender = useCallback((scene: Scene) => {
  }, [])

  return (
    <>
      <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" userInput={userInput} />
      <Input onChange={(e) => setUserInput(e.target.value)} />
    </>
  )
}

export default App
