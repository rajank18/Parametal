import * as THREE from 'three';
import { CanopyParameters, ControlPoint3D } from '../types/design';
import { createControlGridCurves, buildControlPointGrid } from './curves';
import { CanopyMeshOutput } from './types';

/**
 * Maps parametric coordinates [x, y, z] (mm)
 * to Three.js coordinates [X, Y, Z] (meters, where Y=Up, Z=Depth).
 */
export function toThreeVec(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x * 0.001, z * 0.001, y * 0.001);
}

export function generateCanopyGeometry(
  params: CanopyParameters,
  controlPoints: ControlPoint3D[]
): CanopyMeshOutput {
  const { backCurve, spineCurve, frontCurve } = createControlGridCurves(controlPoints);

  const uSegments = 64; // width resolution (left to right)
  const vSegments = 32; // depth resolution (back to front)
  const thickness = Math.max(0.6, params.thickness) * 0.001; // meters

  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const getParametricPoint = (u: number, v: number): THREE.Vector3 => {
    const pBack = backCurve.getPoint(u);
    const pSpine = spineCurve.getPoint(u);
    const pFront = frontCurve.getPoint(u);

    if (v <= 0.5) {
      const t = v / 0.5;
      return new THREE.Vector3().lerpVectors(pBack, pSpine, t);
    } else {
      const t = (v - 0.5) / 0.5;
      return new THREE.Vector3().lerpVectors(pSpine, pFront, t);
    }
  };

  const getSurfacePoint = (u: number, v: number): THREE.Vector3 => {
    const p = getParametricPoint(u, v);
    return toThreeVec(p.x, p.y, p.z);
  };

  const getSurfaceNormal = (u: number, v: number): THREE.Vector3 => {
    const delta = 0.005;
    const p = getSurfacePoint(u, v);
    const pU = getSurfacePoint(Math.min(1, u + delta), v);
    const pV = getSurfacePoint(u, Math.min(1, v + delta));

    const du = new THREE.Vector3().subVectors(pU, p);
    const dv = new THREE.Vector3().subVectors(pV, p);

    const norm = new THREE.Vector3().crossVectors(du, dv).normalize();
    if (norm.y < 0) norm.negate();
    return norm;
  };

  const topGrid: THREE.Vector3[][] = [];
  const botGrid: THREE.Vector3[][] = [];
  const normGrid: THREE.Vector3[][] = [];

  for (let i = 0; i <= uSegments; i++) {
    const u = i / uSegments;
    topGrid[i] = [];
    botGrid[i] = [];
    normGrid[i] = [];

    for (let j = 0; j <= vSegments; j++) {
      const v = j / vSegments;
      const p = getSurfacePoint(u, v);
      const norm = getSurfaceNormal(u, v);

      normGrid[i][j] = norm;

      topGrid[i][j] = p.clone().addScaledVector(norm, thickness / 2);
      botGrid[i][j] = p.clone().addScaledVector(norm, -thickness / 2);
    }
  }

  const addVertex = (pos: THREE.Vector3, norm: THREE.Vector3, u: number, v: number) => {
    vertices.push(pos.x, pos.y, pos.z);
    normals.push(norm.x, norm.y, norm.z);
    uvs.push(u, v);
    return (vertices.length / 3) - 1;
  };

  // Top Surface
  const topIndices: number[][] = [];
  for (let i = 0; i <= uSegments; i++) {
    topIndices[i] = [];
    for (let j = 0; j <= vSegments; j++) {
      topIndices[i][j] = addVertex(
        topGrid[i][j],
        normGrid[i][j],
        i / uSegments,
        j / vSegments
      );
    }
  }

  for (let i = 0; i < uSegments; i++) {
    for (let j = 0; j < vSegments; j++) {
      const a = topIndices[i][j];
      const b = topIndices[i + 1][j];
      const c = topIndices[i + 1][j + 1];
      const d = topIndices[i][j + 1];

      indices.push(a, b, c);
      indices.push(a, c, d);
    }
  }

  // Bottom Surface
  const botIndices: number[][] = [];
  for (let i = 0; i <= uSegments; i++) {
    botIndices[i] = [];
    for (let j = 0; j <= vSegments; j++) {
      botIndices[i][j] = addVertex(
        botGrid[i][j],
        normGrid[i][j].clone().negate(),
        i / uSegments,
        j / vSegments
      );
    }
  }

  for (let i = 0; i < uSegments; i++) {
    for (let j = 0; j < vSegments; j++) {
      const a = botIndices[i][j];
      const b = botIndices[i + 1][j];
      const c = botIndices[i + 1][j + 1];
      const d = botIndices[i][j + 1];

      indices.push(a, c, b);
      indices.push(a, d, c);
    }
  }

  // Edge Trim Walls
  for (let i = 0; i < uSegments; i++) {
    const normB = new THREE.Vector3(0, 0, -1);
    const idxTA = addVertex(topGrid[i][0], normB, i / uSegments, 0);
    const idxTB = addVertex(topGrid[i + 1][0], normB, (i + 1) / uSegments, 0);
    const idxBA = addVertex(botGrid[i][0], normB, i / uSegments, 1);
    const idxBB = addVertex(botGrid[i + 1][0], normB, (i + 1) / uSegments, 1);

    indices.push(idxTA, idxBA, idxTB);
    indices.push(idxTB, idxBA, idxBB);

    const normF = new THREE.Vector3(0, 0, 1);
    const idxFTA = addVertex(topGrid[i][vSegments], normF, i / uSegments, 0);
    const idxFTB = addVertex(topGrid[i + 1][vSegments], normF, (i + 1) / uSegments, 0);
    const idxFBA = addVertex(botGrid[i][vSegments], normF, i / uSegments, 1);
    const idxFBB = addVertex(botGrid[i + 1][vSegments], normF, (i + 1) / uSegments, 1);

    indices.push(idxFTA, idxFTB, idxFBA);
    indices.push(idxFTB, idxFBB, idxFBA);
  }

  for (let j = 0; j < vSegments; j++) {
    const normL = new THREE.Vector3(-1, 0, 0);
    const idxLTA = addVertex(topGrid[0][j], normL, j / vSegments, 0);
    const idxLTB = addVertex(topGrid[0][j + 1], normL, (j + 1) / uSegments, 0);
    const idxLBA = addVertex(botGrid[0][j], normL, j / vSegments, 1);
    const idxLBB = addVertex(botGrid[0][j + 1], normL, (j + 1) / uSegments, 1);

    indices.push(idxLTA, idxLTB, idxLBA);
    indices.push(idxLTB, idxLBB, idxLBA);

    const normR = new THREE.Vector3(1, 0, 0);
    const idxRTA = addVertex(topGrid[uSegments][j], normR, j / vSegments, 0);
    const idxRTB = addVertex(topGrid[uSegments][j + 1], normR, (uSegments) / uSegments, 0);
    const idxRBA = addVertex(botGrid[uSegments][j], normR, j / vSegments, 1);
    const idxRBB = addVertex(botGrid[uSegments][j + 1], normR, (uSegments) / uSegments, 1);

    indices.push(idxRTA, idxRBA, idxRTB);
    indices.push(idxRTB, idxRBA, idxRBB);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();

  const bbox = geometry.boundingBox!;
  const boundingWidth = (bbox.max.x - bbox.min.x) * 1000;
  const boundingDepth = (bbox.max.z - bbox.min.z) * 1000;
  const boundingHeight = (bbox.max.y - bbox.min.y) * 1000;
  const surfaceAreaMm2 = boundingWidth * boundingDepth * 1.15;

  return {
    geometry,
    spineCurve,
    frontCurve,
    backCurve,
    boundingWidth,
    boundingDepth,
    boundingHeight,
    surfaceAreaMm2,
  };
}

/**
 * Generates a fully CLOSED 360-degree sheet-metal standing body pedestal.
 * The top rim slope is calculated dynamically to match the pitched roof slope of the canopy sheet perfectly!
 */
export function generateBodyGeometry(
  params: CanopyParameters,
  customControlPoints?: ControlPoint3D[]
): THREE.BufferGeometry {
  const controlPoints = customControlPoints || buildControlPointGrid(params);
  const { backCurve, spineCurve, frontCurve } = createControlGridCurves(controlPoints);

  const baseRx = 0.175; // base width 350mm
  const baseRz = 0.14;  // base depth 280mm
  const topRx = 0.09;   // top width 180mm
  const topRz = 0.075;  // top depth 150mm
  const thicknessM = Math.max(0.6, params.thickness) * 0.001;

  const uSegs = 48; // 360 degree circular resolution
  const vSegs = 48; // vertical height resolution

  const vertices: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // Helper to calculate exact canopy underside height (in meters) at position (xMm, zMm)
  const getCanopyHeightAt = (xMm: number, zMm: number): number => {
    const widthMm = params.width || 700;
    const depthMm = params.depth || 450;
    
    const u = THREE.MathUtils.clamp((xMm + (widthMm / 2)) / widthMm, 0, 1);
    
    const pBack = backCurve.getPoint(u);
    const pSpine = spineCurve.getPoint(u);
    const pFront = frontCurve.getPoint(u);

    let zRoofMm = pSpine.z;
    if (zMm < 0) {
      const t = THREE.MathUtils.clamp((zMm + (depthMm / 2)) / (depthMm / 2), 0, 1);
      zRoofMm = THREE.MathUtils.lerp(pBack.z, pSpine.z, t);
    } else {
      const t = THREE.MathUtils.clamp(zMm / (depthMm / 2), 0, 1);
      zRoofMm = THREE.MathUtils.lerp(pSpine.z, pFront.z, t);
    }

    return (zRoofMm * 0.001) - 0.006;
  };

  const getBodyPoint = (u: number, v: number): { pos: THREE.Vector3; norm: THREE.Vector3 } => {
    const angle = u * Math.PI * 2;

    const rx = THREE.MathUtils.lerp(baseRx, topRx, v);
    const rz = THREE.MathUtils.lerp(baseRz, topRz, v);

    const xLean = Math.sin(Math.PI * v) * 0.02;
    const zLean = (1 - Math.cos(Math.PI * v)) * 0.03;

    const foldFactor = 1 - 0.18 * Math.sin(angle * 2) * Math.cos(angle);

    const x = Math.sin(angle) * rx * foldFactor + xLean;
    const z = Math.cos(angle) * rz * foldFactor + zLean;

    const topYForThisAngle = getCanopyHeightAt(x * 1000, z * 1000);
    const y = v * topYForThisAngle;

    const pos = new THREE.Vector3(x, y, z);
    const norm = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle)).normalize();

    return { pos, norm };
  };

  for (let j = 0; j <= vSegs; j++) {
    const v = j / vSegs;

    for (let i = 0; i <= uSegs; i++) {
      const u = i / uSegs;
      const { pos, norm } = getBodyPoint(u, v);

      const outP = pos.clone().addScaledVector(norm, thicknessM / 2);
      vertices.push(outP.x, outP.y, outP.z);
      normals.push(norm.x, norm.y, norm.z);

      const inP = pos.clone().addScaledVector(norm, -thicknessM / 2);
      vertices.push(inP.x, inP.y, inP.z);
      normals.push(-norm.x, -norm.y, -norm.z);
    }
  }

  for (let j = 0; j < vSegs; j++) {
    for (let i = 0; i < uSegs; i++) {
      const rowA = j * (uSegs + 1) * 2;
      const rowB = (j + 1) * (uSegs + 1) * 2;

      const aTop = rowA + i * 2;
      const bTop = rowA + (i + 1) * 2;
      const cTop = rowB + (i + 1) * 2;
      const dTop = rowB + i * 2;

      indices.push(aTop, bTop, cTop);
      indices.push(aTop, cTop, dTop);

      const aBot = aTop + 1;
      const bBot = bTop + 1;
      const cBot = cTop + 1;
      const dBot = dTop + 1;

      indices.push(aBot, cBot, bBot);
      indices.push(aBot, dBot, cBot);
    }
  }

  const baseRow = 0;
  for (let i = 0; i < uSegs; i++) {
    const outIdxA = baseRow + i * 2;
    const inIdxA = outIdxA + 1;
    const outIdxB = baseRow + (i + 1) * 2;
    const inIdxB = outIdxB + 1;

    indices.push(outIdxA, inIdxA, outIdxB);
    indices.push(outIdxB, inIdxA, inIdxB);
  }

  const topRow = vSegs * (uSegs + 1) * 2;
  for (let i = 0; i < uSegs; i++) {
    const outIdxA = topRow + i * 2;
    const inIdxA = outIdxA + 1;
    const outIdxB = topRow + (i + 1) * 2;
    const inIdxB = outIdxB + 1;

    indices.push(outIdxA, outIdxB, inIdxA);
    indices.push(outIdxB, inIdxB, inIdxA);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}
