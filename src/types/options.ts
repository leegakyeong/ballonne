import * as BABYLON from '@babylonjs/core'

export type MaterialType = 'StandardMaterial' | 'PBRMaterial' | 'CustomMaterial'

export type BevelOptions = {
  depth: number
  segments: number
}

export type ExtrusionOptions = {
  depth: number
  scale: number
  rotation: number
}

export type StandardMaterialOptions = {
  diffuseColor: BABYLON.Color3,
  specularColor: BABYLON.Color3
  emissiveColor: BABYLON.Color3
  ambientColor: BABYLON.Color3
  alpha: number
}

export type PbrMaterialOptions = {
  albedoColor: BABYLON.Color3
  metallic: number
  roughness: number
  alpha: number
  refraction: number
  translucency: number
}
