import * as THREE from 'three';
import { CanopyParameters, ControlPoint3D } from '../types/design';

// Increased fold pitch for canopy roof (Front and Back edges angled down more steeply)
export const GRID_BACK_NODES: { id: string; label: string; pos: [number, number, number] }[] = [
  { id: 'B1', label: 'Back Left', pos: [-350, -225, 1170] },
  { id: 'B2', label: 'Back Left-Mid', pos: [-175, -225, 1190] },
  { id: 'B3', label: 'Back Peak', pos: [0, -225, 1220] },
  { id: 'B4', label: 'Back Right-Mid', pos: [175, -225, 1130] },
  { id: 'B5', label: 'Back Right Tip', pos: [350, -225, 1020] },
];

export const GRID_CENTER_NODES: { id: string; label: string; pos: [number, number, number] }[] = [
  { id: 'C1', label: 'Spine Left Tip', pos: [-350, 0, 1260] },
  { id: 'C2', label: 'Spine Left-1', pos: [-235, 0, 1285] },
  { id: 'C3', label: 'Spine Left-2', pos: [-115, 0, 1310] },
  { id: 'C4', label: 'Spine Peak', pos: [0, 0, 1335] },
  { id: 'C5', label: 'Spine Right-1', pos: [115, 0, 1250] },
  { id: 'C6', label: 'Spine Right-2', pos: [235, 0, 1170] },
  { id: 'C7', label: 'Spine Right Tip', pos: [350, 0, 1090] },
];

export const GRID_FRONT_NODES: { id: string; label: string; pos: [number, number, number] }[] = [
  { id: 'F1', label: 'Front Left', pos: [-350, 225, 1100] },
  { id: 'F2', label: 'Front Left-Mid', pos: [-175, 225, 1120] },
  { id: 'F3', label: 'Front Peak', pos: [0, 225, 1140] },
  { id: 'F4', label: 'Front Right-Mid', pos: [175, 225, 1060] },
  { id: 'F5', label: 'Front Right Tip', pos: [350, 225, 960] },
];

export function buildControlPointGrid(
  params: CanopyParameters,
  overrides?: Record<string, [number, number, number]>
): ControlPoint3D[] {
  const widthScale = params.width / 700;
  const depthScale = params.depth / 450;
  const centerDeltaZ = params.centerHeight - 1335;
  const leftTipDeltaZ = params.leftTipHeight - 1260;
  const rightTipDeltaZ = params.rightTipHeight - 1090;

  const points: ControlPoint3D[] = [];

  const processNode = (
    node: { id: string; label: string; pos: [number, number, number] },
    category: 'spine' | 'front' | 'back'
  ): ControlPoint3D => {
    if (overrides && overrides[node.id]) {
      return { id: node.id, label: node.label, position: overrides[node.id], category };
    }

    let [x, y, z] = node.pos;
    x *= widthScale;
    y *= depthScale;

    const normX = (x + (350 * widthScale)) / (700 * widthScale);

    let deltaZ = 0;
    if (normX <= 0.5) {
      deltaZ = THREE.MathUtils.lerp(leftTipDeltaZ, centerDeltaZ, normX * 2);
    } else {
      deltaZ = THREE.MathUtils.lerp(centerDeltaZ, rightTipDeltaZ, (normX - 0.5) * 2);
    }

    return {
      id: node.id,
      label: node.label,
      position: [x, y, z + deltaZ],
      category,
    };
  };

  GRID_CENTER_NODES.forEach((n) => points.push(processNode(n, 'spine')));
  GRID_FRONT_NODES.forEach((n) => points.push(processNode(n, 'front')));
  GRID_BACK_NODES.forEach((n) => points.push(processNode(n, 'back')));

  return points;
}

export function createControlGridCurves(controlPoints: ControlPoint3D[]) {
  const backVecs = controlPoints
    .filter((p) => p.category === 'back')
    .map((p) => new THREE.Vector3(...p.position));

  const spineVecs = controlPoints
    .filter((p) => p.category === 'spine')
    .map((p) => new THREE.Vector3(...p.position));

  const frontVecs = controlPoints
    .filter((p) => p.category === 'front')
    .map((p) => new THREE.Vector3(...p.position));

  const backCurve = new THREE.CatmullRomCurve3(backVecs, false, 'centripetal', 0.2);
  const spineCurve = new THREE.CatmullRomCurve3(spineVecs, false, 'centripetal', 0.2);
  const frontCurve = new THREE.CatmullRomCurve3(frontVecs, false, 'centripetal', 0.2);

  return { backCurve, spineCurve, frontCurve };
}
