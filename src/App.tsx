import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import SceneComponent from './components/3d/SceneComponent'
import './App.css'

function App() {
  const [text, setUserInput] = useState('')
  const [prevText, setPrevUserInput] = useState('')

  return (
    <>
      <SceneComponent antialias id="my-canvas" text={text} prevText={prevText} />
      <Input
        onChange={(e) => {
          setUserInput((prev) => {
            setPrevUserInput(prev)
            return e.target.value
          })
        }}
      />
      {/* <div>
        <Button onClick={() => setMaterialType('StandardMaterial')}>Standard Material</Button>
        <Button onClick={() => setMaterialType('PBRMaterial')}>PBR Material</Button>
      </div> */}
    </>
  )
}

export default App
