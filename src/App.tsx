import { useState, useCallback } from 'react'
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, Scene, Mesh } from '@babylonjs/core'
import earcut from 'earcut'
import { Input } from '@/components/ui/input'
import SceneComponent from './components/3d/SceneComponent'
import './App.css'

function App() {
  const [userInput, setUserInput] = useState('')
  let box: Mesh

 async function onSceneReady(scene: Scene) {
    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());

    const canvas = scene.getEngine().getRenderingCanvas();

    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
    box.position.y = 1;

    MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

    const res = await fetch('/src/assets/Phase-AGX_29-55-82.json')
    const fontData = await res.json()
    const text = MeshBuilder.CreateText(
      'userInput',
      userInput,
      fontData,
      {
        size: 2,
        resolution: 64,
        depth: 1,
      },
      scene,
      earcut
    )
    // text.position.y = 1;
  }

  const onRender = useCallback((scene: Scene) => {
    if (!box) return

    const deltaTimeInMillis = scene.getEngine().getDeltaTime();

    const rpm = 10;
    box.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
  }, [userInput, box])

  return (
    <>
      <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" userInput={userInput} />
      <Input onChange={(e) => setUserInput(e.target.value)} />
    </>
  )
}

export default App
