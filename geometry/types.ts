import * as THREE from 'three';

export interface CurvePoint {
  x: number;
  y: number;
  z: number;
}

export interface CanopyMeshOutput {
  geometry: THREE.BufferGeometry;
  spineCurve: THREE.CatmullRomCurve3;
  frontCurve: THREE.CatmullRomCurve3;
  backCurve: THREE.CatmullRomCurve3;
  boundingWidth: number;
  boundingDepth: number;
  boundingHeight: number;
  surfaceAreaMm2: number;
}
