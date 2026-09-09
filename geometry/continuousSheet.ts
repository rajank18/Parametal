import * as THREE from 'three';
import { GeometrySpec, BentSheetSpec, CurvedSheetPanelSpec, RepeatedModuleSpec, FramePostSpec } from '../types/design';
import { GeneratedMeshPart, GeneratedGeometryResult } from './revolved';

// Helper to create a smooth double-curved thin sheet metal panel with thickness
export function createCurvedSheetGeometry(
  widthM: number,
  heightM: number,
  thicknessM: number,
  hCurveM: number = 0.08,
  vCurveM: number = 0.04
): THREE.BufferGeometry {
  const uSegments = 24;
  const vSegments = 24;

  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Front surface (offset +thickness/2) and back surface (offset -thickness/2)
  for (let side = 0; side < 2; side++) {
    const tOffset = (side === 0 ? 1 : -1) * (thicknessM * 0.5);

    for (let j = 0; j <= vSegments; j++) {
      const v = j / vSegments;
      const y = (v - 0.5) * heightM;
      // Vertical parabolic curvature
      const zV = 4 * vCurveM * (1 - (2 * v - 1) ** 2);

      for (let i = 0; i <= uSegments; i++) {
        const u = i / uSegments;
        const x = (u - 0.5) * widthM;
        // Horizontal parabolic curvature
        const zH = 4 * hCurveM * (1 - (2 * u - 1) ** 2);

        const z = zH + zV + tOffset;
        vertices.push(x, y, z);

        // Approximate normal
        const nx = side === 0 ? -(4 * hCurveM * (-4 * u + 2)) / widthM : (4 * hCurveM * (-4 * u + 2)) / widthM;
        const ny = 0;
        const nz = side === 0 ? 1 : -1;
        const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        normals.push(nx / nLen, ny / nLen, nz / nLen);

        uvs.push(u, v);
      }
    }
  }

  const gridOffset = (uSegments + 1) * (vSegments + 1);

  // Indices for front surface
  for (let j = 0; j < vSegments; j++) {
    for (let i = 0; i < uSegments; i++) {
      const a = j * (uSegments + 1) + i;
      const b = a + 1;
      const c = a + (uSegments + 1);
      const d = c + 1;
      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  // Indices for back surface (reversed winding)
  for (let j = 0; j < vSegments; j++) {
    for (let i = 0; i < uSegments; i++) {
      const a = gridOffset + j * (uSegments + 1) + i;
      const b = a + 1;
      const c = a + (uSegments + 1);
      const d = c + 1;
      indices.push(a, d, b);
      indices.push(a, c, d);
    }
  }

  // Edge bridging faces to close thickness
  // Top & Bottom edges
  for (let i = 0; i < uSegments; i++) {
    // Bottom edge
    const fB1 = i;
    const fB2 = i + 1;
    const bB1 = gridOffset + i;
    const bB2 = gridOffset + i + 1;
    indices.push(fB1, bB1, bB2);
    indices.push(fB1, bB2, fB2);

    // Top edge
    const fT1 = vSegments * (uSegments + 1) + i;
    const fT2 = fT1 + 1;
    const bT1 = gridOffset + vSegments * (uSegments + 1) + i;
    const bT2 = bT1 + 1;
    indices.push(fT1, fT2, bT2);
    indices.push(fT1, bT2, bT1);
  }

  // Left & Right edges
  for (let j = 0; j < vSegments; j++) {
    // Left edge
    const fL1 = j * (uSegments + 1);
    const fL2 = (j + 1) * (uSegments + 1);
    const bL1 = gridOffset + j * (uSegments + 1);
    const bL2 = gridOffset + (j + 1) * (uSegments + 1);
    indices.push(fL1, fL2, bL2);
    indices.push(fL1, bL2, bL1);

    // Right edge
    const fR1 = j * (uSegments + 1) + uSegments;
    const fR2 = (j + 1) * (uSegments + 1) + uSegments;
    const bR1 = gridOffset + j * (uSegments + 1) + uSegments;
    const bR2 = gridOffset + (j + 1) * (uSegments + 1) + uSegments;
    indices.push(fR1, bR1, bR2);
    indices.push(fR1, bR2, fR2);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

// Helper to create an extruded 2D bent profile shape with continuous thickness
export function createBentSheetProfileGeometry(
  profilePoints: Array<[number, number]>,
  widthM: number,
  thicknessM: number
): THREE.BufferGeometry {
  if (!profilePoints || profilePoints.length < 2) {
    return new THREE.BoxGeometry(widthM, thicknessM, 0.4);
  }

  // Build a 2D closed polygon outline (front edge + back edge offset by thickness)
  const outerLine: THREE.Vector2[] = profilePoints.map(([y, z]) => new THREE.Vector2(z * 0.001, y * 0.001));
  const innerLine: THREE.Vector2[] = [];

  // Compute normal offset for inner edge
  for (let i = 0; i < outerLine.length; i++) {
    const prev = outerLine[Math.max(0, i - 1)];
    const next = outerLine[Math.min(outerLine.length - 1, i + 1)];
    const dir = new THREE.Vector2().subVectors(next, prev).normalize();
    const normal = new THREE.Vector2(-dir.y, dir.x); // 90 deg normal
    const innerPt = new THREE.Vector2().addVectors(outerLine[i], normal.multiplyScalar(thicknessM));
    innerLine.push(innerPt);
  }

  const shape = new THREE.Shape();
  shape.moveTo(outerLine[0].x, outerLine[0].y);
  for (let i = 1; i < outerLine.length; i++) {
    shape.lineTo(outerLine[i].x, outerLine[i].y);
  }
  for (let i = innerLine.length - 1; i >= 0; i--) {
    shape.lineTo(innerLine[i].x, innerLine[i].y);
  }
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: widthM,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: Math.min(thicknessM * 0.2, 0.002),
    bevelThickness: Math.min(thicknessM * 0.2, 0.002),
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Center extrusion around X axis
  geo.translate(0, 0, -widthM * 0.5);
  // Rotate so profile is in Y-Z plane and extrudes along X
  geo.rotateY(Math.PI * 0.5);

  return geo;
}

export function generateContinuousSheet(spec: GeometrySpec): GeneratedGeometryResult {
  const parts: GeneratedMeshPart[] = [];
  const overallW = (spec.dimensions.width || 800) * 0.001;
  const overallD = (spec.dimensions.depth || 600) * 0.001;
  const overallH = (spec.dimensions.height || 750) * 0.001;

  let totalSurfaceAreaMm2 = 0;

  spec.components.forEach((comp, idx) => {
    const compId = comp.id || `sheet-comp-${idx}`;
    const compName = comp.role || `${comp.type}-${idx}`;

    if (comp.type === 'bent_sheet') {
      const bent = comp as BentSheetSpec;
      const sheetW = (bent.width || spec.dimensions.width || 600) * 0.001;
      const sheetT = (bent.thickness || 2.5) * 0.001;

      let profile = bent.profilePoints;

      // If no raw profile points provided, generate continuous chair/table profile
      if (!profile || profile.length < 2) {
        if (spec.objectType === 'seating') {
          // Classic continuous cantilever / sculptural ribbon chair profile:
          // Base support (on floor) -> front upright -> seat bed -> backrest -> top return curl
          profile = [
            [20, overallD * 400], // rear floor contact
            [20, -overallD * 350], // front floor contact
            [overallH * 450, -overallD * 400], // front seat lip
            [overallH * 400, overallD * 50], // seat dip
            [overallH * 850, overallD * 350], // backrest top
            [overallH * 880, overallD * 380], // top lip curl
          ];
        } else {
          // Sculptural C-shape side table profile:
          // Bottom base slab -> rear vertical wall -> top cantilever slab
          profile = [
            [20, overallD * 350],
            [20, -overallD * 350],
            [overallH * 950, -overallD * 350],
            [overallH * 950, overallD * 350],
          ];
        }
      }

      const geo = createBentSheetProfileGeometry(profile, sheetW, sheetT);
      const pos = bent.position || [0, 0, 0];
      const posM: [number, number, number] = [
        (pos[0] || 0) * 0.001,
        (pos[1] || 0) * 0.001,
        (pos[2] || 0) * 0.001,
      ];

      parts.push({
        id: compId,
        name: compName,
        geometry: geo,
        position: posM,
        color: bent.color || '#475467',
      });

      totalSurfaceAreaMm2 += sheetW * 1000 * (overallH + overallD) * 1000 * 2;
    }

    if (comp.type === 'curved_sheet_panel' || comp.type === 'side_panel') {
      const panel = comp as CurvedSheetPanelSpec;
      const pW = (panel.width || 400) * 0.001;
      const pH = (panel.height || 550) * 0.001;
      const pT = (panel.thickness || 2.0) * 0.001;
      const hCurve = (panel.horizontalCurvature ?? 80) * 0.001;
      const vCurve = (panel.verticalCurvature ?? 40) * 0.001;

      const geo = createCurvedSheetGeometry(pW, pH, pT, hCurve, vCurve);
      const pos = panel.position || [0, pH * 500, 0];
      const posM: [number, number, number] = [
        (pos[0] || 0) * 0.001,
        (pos[1] || 0) * 0.001,
        (pos[2] || 0) * 0.001,
      ];

      const rot = panel.rotation || [0, 0, 0];
      const rotRad: [number, number, number] = [
        THREE.MathUtils.degToRad(rot[0] || 0),
        THREE.MathUtils.degToRad(rot[1] || 0),
        THREE.MathUtils.degToRad(rot[2] || 0),
      ];

      parts.push({
        id: compId,
        name: compName,
        geometry: geo,
        position: posM,
        rotation: rotRad,
        color: panel.color || '#b86b35',
      });
    }

    if (comp.type === 'repeated_module') {
      const rep = comp as RepeatedModuleSpec;
      const rows = rep.rows || 3;
      const cols = rep.columns || 3;
      const rowSpacingM = (rep.rowSpacing || 500) * 0.001;
      const colSpacingM = (rep.columnSpacing || 450) * 0.001;

      const mod = rep.module || {
        type: 'curved_sheet_panel',
        width: 380,
        height: 480,
        thickness: 2.0,
        horizontalCurvature: 90,
        verticalCurvature: 60,
      };

      const modW = ((mod as any).width || 380) * 0.001;
      const modH = ((mod as any).height || 480) * 0.001;
      const modT = ((mod as any).thickness || 2.0) * 0.001;
      const hCurve = (((mod as any).horizontalCurvature ?? 90)) * 0.001;
      const vCurve = (((mod as any).verticalCurvature ?? 60)) * 0.001;

      // Base prototype geometry shared across instances
      const baseGeo = createCurvedSheetGeometry(modW, modH, modT, hCurve, vCurve);

      const totalArrayW = (cols - 1) * colSpacingM;
      const totalArrayH = (rows - 1) * rowSpacingM;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const posX = (c * colSpacingM - totalArrayW * 0.5);
          const posY = (r * rowSpacingM + modH * 0.5 + 0.05);
          const staggerZ = rep.stagger && r % 2 === 1 ? 0.04 : 0;
          const rotY = rep.rotationVariation ? (Math.sin(r * 2.1 + c * 1.7) * rep.rotationVariation) : 0;

          parts.push({
            id: `${compId}-r${r}-c${c}`,
            name: `${compName} Panel [R${r + 1}:C${c + 1}]`,
            geometry: baseGeo.clone(),
            position: [posX, posY, staggerZ],
            rotation: [0, THREE.MathUtils.degToRad(rotY), 0],
            color: (mod as any).color || '#b86b35',
          });
        }
      }

      // Add vertical structural support posts for the partition array
      const postRadiusM = 0.008;
      const postHeightM = rows * rowSpacingM + 0.1;
      const postGeo = new THREE.CylinderGeometry(postRadiusM, postRadiusM, postHeightM, 16);

      for (let c = 0; c < cols; c++) {
        const posX = c * colSpacingM - totalArrayW * 0.5;
        parts.push({
          id: `${compId}-post-${c}`,
          name: `Structural Post ${c + 1}`,
          geometry: postGeo.clone(),
          position: [posX, postHeightM * 0.5, 0],
          color: '#9a5832',
        });
      }
    }

    if (comp.type === 'frame_post' || comp.type === 'frame') {
      const frameSpec = comp as FramePostSpec;
      const postH_M = (frameSpec.height || overallH * 1000) * 0.001;
      const postR_M = (frameSpec.radius || 10) * 0.001;

      (frameSpec.positions || [[0, 0, 0]]).forEach((pos, pIdx) => {
        const postPosM: [number, number, number] = [
          (pos[0] || 0) * 0.001,
          ((pos[1] || 0) + (frameSpec.height || overallH * 1000) * 0.5) * 0.001,
          (pos[2] || 0) * 0.001,
        ];
        const postGeo = new THREE.CylinderGeometry(postR_M, postR_M, postH_M, 16);
        parts.push({
          id: `${compId}-post-${pIdx}`,
          name: `${compName} Post ${pIdx + 1}`,
          geometry: postGeo,
          position: postPosM,
          color: frameSpec.color || '#334155',
        });
      });
    }
  });

  // Fallback if no parts generated
  if (parts.length === 0) {
    const defaultProfile: Array<[number, number]> = [
      [20, overallD * 350],
      [20, -overallD * 350],
      [overallH * 950, -overallD * 350],
      [overallH * 950, overallD * 350],
    ];
    parts.push({
      id: 'default-bent-sheet',
      name: 'Bent Sheet Body',
      geometry: createBentSheetProfileGeometry(defaultProfile, overallW, 0.003),
      position: [0, 0, 0],
      color: '#475467',
    });
  }

  return {
    parts,
    boundingWidth: spec.dimensions.width,
    boundingDepth: spec.dimensions.depth,
    boundingHeight: spec.dimensions.height,
    surfaceAreaMm2: totalSurfaceAreaMm2 || spec.dimensions.width * spec.dimensions.height * 2,
  };
}
