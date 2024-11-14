import { useState, useCallback } from 'react'
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, Scene, Mesh, Animation, CircleEase, EasingFunction, StandardMaterial, Color3, GlowLayer, ParticleHelper } from '@babylonjs/core'
import earcut from 'earcut'
import { Input } from '@/components/ui/input'
import SceneComponent from './components/3d/SceneComponent'
import { getDroopAnimation, getCurveAnimation, getLetterAppearanceAnimation } from './utils/animations'
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

    const letterMaterial = new StandardMaterial('letterMaterial', scene)

    const droopAnimation = getDroopAnimation()
    const curveAnimation = await getCurveAnimation()
    const letterAppearanceAnimation = getLetterAppearanceAnimation()

    const words = userInput.split(' ')
    const letters = userInput.split('')
    let x = 0
    let y = 0
    letters.forEach((letter, i) => {
      const letterMesh = MeshBuilder.CreateText(
        'letterMesh',
        letter,
        fontData,
        {
          size: 1,
          resolution: 1,
          depth: 1,
        },
        scene,
        earcut,
      )

      if (!letterMesh) return

      letterMesh.material = letterMaterial

      if (words.includes('good')) {
        letterMaterial.emissiveColor = new Color3(0, 0, 0)
        const glow = new GlowLayer('glow', scene)
        glow.customEmissiveColorSelector = function (mesh, _0, _1, result) {
          if (mesh.name === "letterMesh") {
            result.set(1, 1, 0, 1);
          } else {
            result.set(0, 0, 0, 0);
          }
        }
      } else if (words.includes('sad')) {
        letterMaterial.diffuseColor = new Color3(0, 0, 1)

        droopAnimation.setKeys([
          { frame: 0, value: letterMesh.position.y },
          { frame: 60, value: letterMesh.position.y - Math.random() * 2 },
        ])

        letterMesh.animations.push(droopAnimation)
        scene.beginAnimation(letterMesh, 0, 120, false)
      } else if (words.includes('smile')) {
        letterMesh.animations = curveAnimation as Animation[]
        scene.beginAnimation(letterMesh, 0, 100, false)
      } else {
        letterMaterial.diffuseColor = new Color3(1, 0, 1)
      }

      // 글자 위치 설정
      letterMesh.position.x = x
      letterMesh.position.y = y
      x += 1

      // 마지막 글자 입력 애니메이션
      if (i + 1 === userInput.length) {
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
      <Input onChange={(e) => setUserInput(e.target.value)} />
    </>
  )
}

export default App
