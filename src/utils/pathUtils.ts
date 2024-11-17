import * as BABYLON from '@babylonjs/core'
import earcut from 'earcut'

export const rotatePath = (path, angle) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return path.map(point =>
      new BABYLON.Vector3(
          point.x * cos - point.y * sin,
          point.x * sin + point.y * cos,
          point.z
      )
  );
};

export const createBeveledExtrudedText = (scene, shape, options) => {
  const { depth, bevelSize, bevelSegments, rotation } = options;

  // 1. 각 단계별 경로 생성
  const paths = [];
  const totalSegments = bevelSegments + 1;

  for (let i = 0; i <= totalSegments; i++) {
      const t = i / totalSegments; // 단계 비율
      const scale = 1 - bevelSize * t; // 단계별 스케일
      const offset = depth * t; // 단계별 깊이

      // 현재 단계의 경로 생성 및 회전 적용
      const path = shape.map(point =>
          new BABYLON.Vector3(point.x * scale, point.y * scale, offset)
      );
      paths.push(rotatePath(path, rotation * t)); // 회전 적용
  }

  // 2. 리본 메쉬 생성
  const ribbonMesh = BABYLON.MeshBuilder.CreateRibbon(
      "beveledExtrudedText",
      {
          pathArray: paths,
          closeArray: true,
          closePath: true,
      },
      scene
  );

  // 3. Cap 추가: 시작과 끝 경로를 기반으로 폴리곤 메쉬 생성
  const startCap = BABYLON.MeshBuilder.CreatePolygon(
      "startCap",
      { shape: shape, depth: 0 },
      scene,
      earcut
  );
  const endCap = BABYLON.MeshBuilder.CreatePolygon(
      "endCap",
      {
          shape: shape.map(point => new BABYLON.Vector2(point.x, point.y)),
          depth: 0,
      },
      scene,
      earcut
  );

  startCap.position.z = 0;
  endCap.position.z = depth;

  // Cap을 Ribbon에 병합
  const combinedMesh = BABYLON.Mesh.MergeMeshes([ribbonMesh, startCap, endCap]);

  // 4. 재질 설정
  const material = new BABYLON.StandardMaterial("textMaterial", scene);
  material.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.8);
  combinedMesh.material = material;

  return combinedMesh;
};
