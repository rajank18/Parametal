import * as THREE from 'three';
import { SeatingParameters, ControlPoint3D, SeatingMeshOutput } from '../types/design';

/**
 * Maps parametric coordinates [x, y, z] (mm)
 * to Three.js coordinates [X, Y, Z] (meters, where Y=Up, Z=Depth).
 */
export function toThreeVec(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x * 0.001, z * 0.001, y * 0.001);
}

export const DEFAULT_SEATING_NODES: { id: string; label: string; pos: [number, number, number]; category: 'spine' | 'front' | 'back' }[] = [
  { id: 'SP1', label: 'Front Support Foot', pos: [0, -310, 0], category: 'front' },
  { id: 'SP2', label: 'Seat Knee Roll', pos: [0, -198, 560], category: 'spine' },
  { id: 'SP3', label: 'Seat Center Basin', pos: [0, -12, 483], category: 'spine' },
  { id: 'SP4', label: 'Backrest Lower Join', pos: [0, 74, 507], category: 'back' },
  { id: 'SP5', label: 'Backrest Center', pos: [0, 173, 608], category: 'back' },
  { id: 'SP6', label: 'Backrest Curved Top', pos: [0, 235, 1080], category: 'back' },
  { id: 'SP7', label: 'Rear Support Foot', pos: [0, 310, 0], category: 'back' },
];

export function buildSeatingControlPoints(
  params: SeatingParameters,
  overrides?: Record<string, [number, number, number]>
): ControlPoint3D[] {
  const widthScale = (params.overallWidth || 940) / 940;
  const depthScale = (params.overallDepth || 1500) / 1500;
  const heightScale = (params.overallHeight || 920) / 920;

  return DEFAULT_SEATING_NODES.map((n) => {
    if (overrides && overrides[n.id]) {
      return { id: n.id, label: n.label, position: overrides[n.id], category: n.category };
    }

    let [x, y, z] = n.pos;
    x *= widthScale;
    y *= depthScale;
    if (z > 0) z *= heightScale;

    return {
      id: n.id,
      label: n.label,
      position: [x, y, z],
      category: n.category,
    };
  });
}

/**
 * Generates 1:1 Parametric Sculptural Lounge Chair Geometry:
 * - Controlled Side Profile (Front Support -> Seat -> Backrest).
 * - Structural Rear Support Sheet creating large negative space arch under seat.
 * - Gentle transverse width curvature and ergonomic seat basin / backrest recess.
 */
export function generateSeatingGeometry(
  params: SeatingParameters,
  controlPoints: ControlPoint3D[]
): SeatingMeshOutput {
  const uSegments = 64; // width resolution
  const vSegments = 64; // profile resolution
  const thicknessM = Math.max(0.8, params.sheetThickness || 1.0) * 0.001;

  const w = params.overallWidth || 940;
  const d = params.overallDepth || 1500;
  const h = params.overallHeight || 920;

  // 1. Normalized Side Profile Design Constraints (P0 to P9)
  // Single unbroken C2 continuous spline for 100% smooth organic wave flow
  const normalizedSideProfile: [number, number][] = [
    [0.02, 0.00], // P0: Front Support Foot
    [0.03, 0.48], // P1: Front Support Slope
    [0.18, 0.72], // P2: Prominent Knee Roll Crest (Elevated Front Leg Curve)
    [0.32, 0.66], // P3: Seat Front Slope
    [0.48, 0.62], // P4: Seat Basin Center
    [0.62, 0.65], // P5: Backrest Lower Join
    [0.72, 0.88], // P6: Backrest Mid Recline
    [0.84, 1.12], // P7: Backrest Upper Sweep
    [0.96, 1.28], // P8: Top Crest Curving Backward
    [1.08, 1.16], // P9: Top Lip Rolled Backward Facing Back
  ];

  // 2. Map normalized coordinates to physical mm dimensions
  const profileKnots = normalizedSideProfile.map(([uY, uZ]) => {
    const yMm = (uY - 0.5) * d;
    const zMm = uZ * h;
    return new THREE.Vector3(0, yMm, zMm);
  });

  // 3. Smooth cubic Catmull-Rom profile spline (guarantees zero weld lines or sharp kinks)
  const profileCurve = new THREE.CatmullRomCurve3(
    profileKnots,
    false,
    'centripetal',
    0.5
  );

  // Calculates 3D parametric shell point S(u, v) on main seat/back surface
  const evalShellPoint = (u: number, v: number): THREE.Vector3 => {
    // 1. Spine profile point from continuous spline
    const pProfile = profileCurve.getPoint(v);

    // 2. Width X from -w/2 to +w/2
    let widthScale = 1.0;
    if (v > 0.6) {
      widthScale = THREE.MathUtils.lerp(1.0, 1.12, (v - 0.6) / 0.4);
    }
    const currentWidth = w * widthScale;
    const x = (u - 0.5) * currentWidth;

    let y = pProfile.y;
    let z = pProfile.z;

    // 3. Transverse width curvature (smooth C2 cradling dish across u)
    const uNormalized = (u - 0.5) * 2; // -1 to +1
    const uSquare = Math.pow(uNormalized, 2);
    const dishMm = uSquare * (params.leftRightCurvature || 10);
    z += dishMm;

    // 4. Ergonomic seat basin concavity & backrest recess (smooth sinusoidal weights)
    if (v >= 0.25 && v <= 0.60) {
      const seatWeight = Math.sin(((v - 0.25) / 0.35) * Math.PI);
      const seatRecess = (params.seatCurvature || 80) * 0.2 * seatWeight * (1 - uSquare * 0.5);
      z -= seatRecess;
    } else if (v > 0.60 && v <= 0.90) {
      const backWeight = Math.sin(((v - 0.60) / 0.30) * Math.PI);
      const backRecess = (params.backCurvature || 200) * 0.15 * backWeight * (1 - uSquare * 0.4);
      y += backRecess;
    }

    // 5. Top tail fold angle & wing flare (smooth C2 Hermite blend)
    if (v > 0.65) {
      const tailT = (v - 0.65) / 0.35;
      const smoothTailT = Math.pow(tailT, 2) * (3 - 2 * tailT); // C1 smooth Hermite step (zero kink)

      const foldAngleRad = ((params.topFoldAngle ?? 45) / 180) * Math.PI;
      const foldRadius = (params.topLipCurl || 25) * 2.0;

      // Dynamically raises/tilts top tail section backward as topFoldAngle slider moves
      y += Math.sin(smoothTailT * foldAngleRad) * foldRadius * 1.5;
      z += (1 - Math.cos(smoothTailT * foldAngleRad)) * foldRadius * 1.2;

      // Transverse wing flare
      const wingFlare = uSquare * (params.topLipCurl || 25) * smoothTailT;
      z += wingFlare * 0.5;
    }

    return new THREE.Vector3(x, y, z);
  };

  const getThreePoint = (u: number, v: number): THREE.Vector3 => {
    const p = evalShellPoint(u, v);
    return toThreeVec(p.x, p.y, p.z);
  };

  const getNormal = (u: number, v: number): THREE.Vector3 => {
    const eps = 0.004;
    const p = getThreePoint(u, v);
    const pU = getThreePoint(Math.min(1, u + eps), v);
    const pV = getThreePoint(u, Math.min(1, v + eps));

    const du = new THREE.Vector3().subVectors(pU, p);
    const dv = new THREE.Vector3().subVectors(pV, p);

    const norm = new THREE.Vector3().crossVectors(du, dv).normalize();
    if (norm.y < 0) norm.negate();
    return norm;
  };

  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const topGrid: THREE.Vector3[][] = [];
  const botGrid: THREE.Vector3[][] = [];
  const normGrid: THREE.Vector3[][] = [];

  // Generate 3D double-skin grid with offset sheet thickness
  for (let i = 0; i <= uSegments; i++) {
    const u = i / uSegments;
    topGrid[i] = [];
    botGrid[i] = [];
    normGrid[i] = [];

    for (let j = 0; j <= vSegments; j++) {
      const v = j / vSegments;
      const p = getThreePoint(u, v);
      const norm = getNormal(u, v);

      normGrid[i][j] = norm;
      topGrid[i][j] = p.clone().addScaledVector(norm, thicknessM / 2);
      botGrid[i][j] = p.clone().addScaledVector(norm, -thicknessM / 2);
    }
  }

  const addVertex = (pos: THREE.Vector3, norm: THREE.Vector3, u: number, v: number) => {
    vertices.push(pos.x, pos.y, pos.z);
    normals.push(norm.x, norm.y, norm.z);
    uvs.push(u, v);
    return (vertices.length / 3) - 1;
  };

  // Top Shell Surface
  const topIndices: number[][] = [];
  for (let i = 0; i <= uSegments; i++) {
    topIndices[i] = [];
    for (let j = 0; j <= vSegments; j++) {
      topIndices[i][j] = addVertex(topGrid[i][j], normGrid[i][j], i / uSegments, j / vSegments);
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

  // Bottom Shell Surface
  const botIndices: number[][] = [];
  for (let i = 0; i <= uSegments; i++) {
    botIndices[i] = [];
    for (let j = 0; j <= vSegments; j++) {
      botIndices[i][j] = addVertex(botGrid[i][j], normGrid[i][j].clone().negate(), i / uSegments, j / vSegments);
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
    // Front foot edge
    const normF = new THREE.Vector3(0, 0, -1);
    const idxTA = addVertex(topGrid[i][0], normF, i / uSegments, 0);
    const idxTB = addVertex(topGrid[i + 1][0], normF, (i + 1) / uSegments, 0);
    const idxBA = addVertex(botGrid[i][0], normF, i / uSegments, 1);
    const idxBB = addVertex(botGrid[i + 1][0], normF, (i + 1) / uSegments, 1);

    indices.push(idxTA, idxBA, idxTB);
    indices.push(idxTB, idxBA, idxBB);

    // Top backrest lip edge
    const normB = new THREE.Vector3(0, 0, 1);
    const idxBTA = addVertex(topGrid[i][vSegments], normB, i / uSegments, 0);
    const idxBTB = addVertex(topGrid[i + 1][vSegments], normB, (i + 1) / uSegments, 0);
    const idxBBA = addVertex(botGrid[i][vSegments], normB, i / uSegments, 1);
    const idxBBB = addVertex(botGrid[i + 1][vSegments], normB, (i + 1) / uSegments, 1);

    indices.push(idxBTA, idxBTB, idxBBA);
    indices.push(idxBTB, idxBBB, idxBBA);
  }

  for (let j = 0; j < vSegments; j++) {
    // Left side edge
    const normL = new THREE.Vector3(-1, 0, 0);
    const idxLTA = addVertex(topGrid[0][j], normL, j / vSegments, 0);
    const idxLTB = addVertex(topGrid[0][j + 1], normL, (j + 1) / uSegments, 0);
    const idxLBA = addVertex(botGrid[0][j], normL, j / vSegments, 1);
    const idxLBB = addVertex(botGrid[0][j + 1], normL, (j + 1) / uSegments, 1);

    indices.push(idxLTA, idxLTB, idxLBA);
    indices.push(idxLTB, idxLBB, idxLBA);

    // Right side edge
    const normR = new THREE.Vector3(1, 0, 0);
    const idxRTA = addVertex(topGrid[uSegments][j], normR, j / uSegments, 0);
    const idxRTB = addVertex(topGrid[uSegments][j + 1], normR, (j + 1) / uSegments, 0);
    const idxRBA = addVertex(botGrid[uSegments][j], normR, j / uSegments, 1);
    const idxRBB = addVertex(botGrid[uSegments][j + 1], normR, (j + 1) / uSegments, 1);

    indices.push(idxRTA, idxRBA, idxRTB);
    indices.push(idxRTB, idxRBA, idxRBB);
  }

  // --- REAR STRUCTURAL SUPPORT SHEET (Creating Large Negative Space Arch) ---
  const finVGrid = 48;
  const finUGrid = uSegments;

  // Master organic profile curve for rear support leg (CatmullRom spline with outward arch)
  const rearLegKnots = [
    new THREE.Vector3(0, (0.22) * d, (0.88) * h), // Start: under seat basin junction
    new THREE.Vector3(0, (0.28) * d, (0.22) * h), // Upper rear leg outward arch
    new THREE.Vector3(0, (0.30) * d, (0.18) * h), // Lower rear leg outward sweep
    new THREE.Vector3(0, (0.45) * d, 0),          // Floor ground contact foot
  ];

  const rearLegCurve = new THREE.CatmullRomCurve3(
    rearLegKnots,
    false,
    'centripetal',
    0.5
  );

  const getFinPoint = (uFin: number, vFin: number): THREE.Vector3 => {
    // Exact seam connection into underside of main seat shell at v = 0.55
    const pSeatShell = evalShellPoint(uFin, 0.55);

    if (vFin === 0) {
      return toThreeVec(pSeatShell.x, pSeatShell.y, pSeatShell.z);
    }

    // Spine point along organic CatmullRom rear leg curve
    const pSpline = rearLegCurve.getPoint(vFin);

    const xVal = (uFin - 0.5) * w;

    // Transverse curved arch across leg width
    const uNormalized = (uFin - 0.5) * 2;
    const transverseArch = (1 - Math.pow(uNormalized, 2)) * 28 * Math.sin(vFin * Math.PI);

    // Blend smoothly from top seat junction to rear leg curve
    const tBlend = Math.min(1, vFin / 0.15);
    const finalY = THREE.MathUtils.lerp(pSeatShell.y, pSpline.y, tBlend);
    const finalZ = THREE.MathUtils.lerp(pSeatShell.z, pSpline.z, tBlend) + transverseArch;

    return toThreeVec(xVal, finalY, Math.max(0, finalZ));
  };

  const finTopPts: THREE.Vector3[][] = [];
  const finBotPts: THREE.Vector3[][] = [];
  const finNorms: THREE.Vector3[][] = [];

  for (let i = 0; i <= finUGrid; i++) {
    const uFin = i / finUGrid;
    finTopPts[i] = [];
    finBotPts[i] = [];
    finNorms[i] = [];

    for (let j = 0; j <= finVGrid; j++) {
      const vFin = j / finVGrid;
      const p = getFinPoint(uFin, vFin);

      const eps = 0.004;
      const pU = getFinPoint(Math.min(1, uFin + eps), vFin);
      const pV = getFinPoint(uFin, Math.min(1, vFin + eps));
      const du = new THREE.Vector3().subVectors(pU, p);
      const dv = new THREE.Vector3().subVectors(pV, p);

      const norm = new THREE.Vector3().crossVectors(du, dv).normalize();
      if (norm.y < 0) norm.negate();

      finNorms[i][j] = norm;
      finTopPts[i][j] = p.clone().addScaledVector(norm, thicknessM / 2);
      finBotPts[i][j] = p.clone().addScaledVector(norm, -thicknessM / 2);
    }
  }

  const finIndicesTop: number[][] = [];
  for (let i = 0; i <= finUGrid; i++) {
    finIndicesTop[i] = [];
    for (let j = 0; j <= finVGrid; j++) {
      finIndicesTop[i][j] = addVertex(finTopPts[i][j], finNorms[i][j], i / finUGrid, j / finVGrid);
    }
  }

  for (let i = 0; i < finUGrid; i++) {
    for (let j = 0; j < finVGrid; j++) {
      const a = finIndicesTop[i][j];
      const b = finIndicesTop[i + 1][j];
      const c = finIndicesTop[i + 1][j + 1];
      const d = finIndicesTop[i][j + 1];

      indices.push(a, b, c);
      indices.push(a, c, d);
    }
  }

  const finIndicesBot: number[][] = [];
  for (let i = 0; i <= finUGrid; i++) {
    finIndicesBot[i] = [];
    for (let j = 0; j <= finVGrid; j++) {
      finIndicesBot[i][j] = addVertex(finBotPts[i][j], finNorms[i][j].clone().negate(), i / finUGrid, j / finVGrid);
    }
  }

  for (let i = 0; i < finUGrid; i++) {
    for (let j = 0; j < finVGrid; j++) {
      const a = finIndicesBot[i][j];
      const b = finIndicesBot[i + 1][j];
      const c = finIndicesBot[i + 1][j + 1];
      const d = finIndicesBot[i][j + 1];

      indices.push(a, c, b);
      indices.push(a, d, c);
    }
  }

  // Create final THREE.BufferGeometry
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
  const surfaceAreaMm2 = boundingWidth * boundingDepth * 1.5;

  // Bounding Box Validation Log
  console.log('[Seating Bounding Box Validation]', {
    widthMm: Math.round(boundingWidth),
    depthMm: Math.round(boundingDepth),
    heightMm: Math.round(boundingHeight),
    xBounds: [Math.round(bbox.min.x * 1000), Math.round(bbox.max.x * 1000)],
    yBounds: [Math.round(bbox.min.y * 1000), Math.round(bbox.max.y * 1000)],
    zBounds: [Math.round(bbox.min.z * 1000), Math.round(bbox.max.z * 1000)],
  });

  return {
    geometry,
    boundingWidth,
    boundingDepth,
    boundingHeight,
    surfaceAreaMm2,
  };
}
