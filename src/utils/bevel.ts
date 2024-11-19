import * as BABYLON from '@babylonjs/core'

export function createBeveledPaths(shape: BABYLON.Vector3[], depth: number, bevelSize: number, bevelSegments: number) {
  const paths = [];
  for (let i = 0; i <= bevelSegments; i++) {
      const t = i / bevelSegments;
      const scale = 1 - t * bevelSize; // 경로의 크기를 점진적으로 줄임
      const z = t * depth; // Z 방향으로 깊이 이동
      const scaledShape = shape.map(v => v.scale(scale).add(new BABYLON.Vector3(0, 0, z)));
      paths.push(scaledShape);
  }
  // 마지막 depth 레벨 추가
  const finalShape = shape.map(v => v.add(new BABYLON.Vector3(0, 0, depth)));
  paths.push(finalShape);
  return paths;
}
