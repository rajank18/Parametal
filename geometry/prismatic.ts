import * as THREE from 'three';
import { GeometrySpec, PrismaticSlabSpec, SupportLegsSpec, FramePostSpec } from '../types/design';
import { GeneratedMeshPart, GeneratedGeometryResult } from './revolved';

export function generatePrismaticAssembly(spec: GeometrySpec): GeneratedGeometryResult {
  const parts: GeneratedMeshPart[] = [];
  const overallW = (spec.dimensions.width || 800) * 0.001;
  const overallD = (spec.dimensions.depth || 600) * 0.001;
  const overallH = (spec.dimensions.height || 450) * 0.001;

  let totalSurfaceAreaMm2 = 0;

  spec.components.forEach((comp, idx) => {
    const compId = comp.id || `comp-${idx}`;
    const compName = comp.role || `${comp.type}-${idx}`;

    if (comp.type === 'prismatic_slab' || comp.type === 'flat_sheet') {
      const slab = comp as PrismaticSlabSpec;
      const dims = slab.dimensions || [800, 20, 600];
      const wM = (dims[0] || 800) * 0.001;
      const hM = (dims[1] || 20) * 0.001;
      const dM = (dims[2] || 600) * 0.001;

      const pos = slab.position || [0, (overallH - hM * 0.5) * 1000, 0];
      const posM: [number, number, number] = [
        (pos[0] || 0) * 0.001,
        (pos[1] || 0) * 0.001,
        (pos[2] || 0) * 0.001,
      ];

      const rot = slab.rotation || [0, 0, 0];
      const rotRad: [number, number, number] = [
        THREE.MathUtils.degToRad(rot[0] || 0),
        THREE.MathUtils.degToRad(rot[1] || 0),
        THREE.MathUtils.degToRad(rot[2] || 0),
      ];

      const boxGeo = new THREE.BoxGeometry(wM, hM, dM);
      totalSurfaceAreaMm2 += 2 * (dims[0] * dims[1] + dims[1] * dims[2] + dims[0] * dims[2]);

      parts.push({
        id: compId,
        name: compName,
        geometry: boxGeo,
        position: posM,
        rotation: rotRad,
        color: slab.color || '#475467',
      });
    }

    if (comp.type === 'support_legs' || comp.type === 'legs') {
      const legSpec = comp as SupportLegsSpec;
      const legH_M = (legSpec.legHeight || (overallH - 0.02) * 1000) * 0.001;
      const legRadiusM = legSpec.legRadius ? legSpec.legRadius * 0.001 : undefined;
      const legW_M = (legSpec.legWidth || (legRadiusM ? legRadiusM * 2000 : 30)) * 0.001;
      const legD_M = (legSpec.legDepth || (legRadiusM ? legRadiusM * 2000 : 30)) * 0.001;
      const insetM = (legSpec.inset ?? 40) * 0.001;
      const legY = legH_M * 0.5;

      const halfW = Math.max(0.05, overallW * 0.5 - insetM);
      const halfD = Math.max(0.05, overallD * 0.5 - insetM);

      if (legSpec.style === 'four_corner' || !legSpec.style) {
        const cornerPositions: [number, number, number][] = [
          [-halfW, legY, -halfD],
          [halfW, legY, -halfD],
          [-halfW, legY, halfD],
          [halfW, legY, halfD],
        ];

        cornerPositions.forEach((pos, cIdx) => {
          let legGeo: THREE.BufferGeometry;
          if (legRadiusM) {
            legGeo = new THREE.CylinderGeometry(legRadiusM, legRadiusM, legH_M, 16);
          } else {
            legGeo = new THREE.BoxGeometry(legW_M, legH_M, legD_M);
          }

          parts.push({
            id: `${compId}-leg-${cIdx}`,
            name: `${compName} Leg ${cIdx + 1}`,
            geometry: legGeo,
            position: pos,
            color: legSpec.color || '#2d3748',
          });
        });
      } else if (legSpec.style === 'blade') {
        // Two flat sheet side legs
        const bladePositions: [number, number, number][] = [
          [-halfW, legY, 0],
          [halfW, legY, 0],
        ];
        bladePositions.forEach((pos, bIdx) => {
          const bladeGeo = new THREE.BoxGeometry(legW_M, legH_M, overallD - insetM * 2);
          parts.push({
            id: `${compId}-blade-${bIdx}`,
            name: `${compName} Blade ${bIdx + 1}`,
            geometry: bladeGeo,
            position: pos,
            color: legSpec.color || '#2d3748',
          });
        });
      } else if (legSpec.style === 'u_frame') {
        // U-shaped metal sled base
        const frameW = overallD - insetM * 2;
        const tubeRadius = legRadiusM || 0.015;

        [-halfW, halfW].forEach((xPos, uIdx) => {
          const path = new THREE.CurvePath<THREE.Vector3>();
          path.add(new THREE.LineCurve3(new THREE.Vector3(0, legH_M, -frameW * 0.5), new THREE.Vector3(0, 0.02, -frameW * 0.5)));
          path.add(new THREE.LineCurve3(new THREE.Vector3(0, 0.02, -frameW * 0.5), new THREE.Vector3(0, 0.02, frameW * 0.5)));
          path.add(new THREE.LineCurve3(new THREE.Vector3(0, 0.02, frameW * 0.5), new THREE.Vector3(0, legH_M, frameW * 0.5)));

          const uGeo = new THREE.TubeGeometry(path, 32, tubeRadius, 12, false);
          parts.push({
            id: `${compId}-uframe-${uIdx}`,
            name: `${compName} U-Frame ${uIdx + 1}`,
            geometry: uGeo,
            position: [xPos, 0, 0],
            color: legSpec.color || '#1e293b',
          });
        });
      } else if (legSpec.style === 'pedestal') {
        // Central pedestal column with bottom plate
        const columnGeo = new THREE.CylinderGeometry(0.04, 0.05, legH_M, 24);
        const basePlateGeo = new THREE.CylinderGeometry(Math.min(halfW, halfD), Math.min(halfW, halfD), 0.015, 32);

        parts.push({
          id: `${compId}-column`,
          name: `${compName} Pedestal Column`,
          geometry: columnGeo,
          position: [0, legY, 0],
          color: legSpec.color || '#2d3748',
        });
        parts.push({
          id: `${compId}-baseplate`,
          name: `${compName} Pedestal Base Plate`,
          geometry: basePlateGeo,
          position: [0, 0.0075, 0],
          color: legSpec.color || '#1e293b',
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

  // If no parts were produced (e.g. empty components), generate default clean slab + legs from overall dimensions
  if (parts.length === 0) {
    const topThickness = 0.025;
    const topGeo = new THREE.BoxGeometry(overallW, topThickness, overallD);
    parts.push({
      id: 'default-top-slab',
      name: 'Primary Slab',
      geometry: topGeo,
      position: [0, overallH - topThickness * 0.5, 0],
      color: '#475467',
    });

    const legH = overallH - topThickness;
    const legW = 0.035;
    const halfW = overallW * 0.5 - 0.05;
    const halfD = overallD * 0.5 - 0.05;
    const cornerPositions: [number, number, number][] = [
      [-halfW, legH * 0.5, -halfD],
      [halfW, legH * 0.5, -halfD],
      [-halfW, legH * 0.5, halfD],
      [halfW, legH * 0.5, halfD],
    ];

    cornerPositions.forEach((pos, cIdx) => {
      parts.push({
        id: `default-leg-${cIdx}`,
        name: `Leg ${cIdx + 1}`,
        geometry: new THREE.BoxGeometry(legW, legH, legW),
        position: pos,
        color: '#2d3748',
      });
    });
  }

  return {
    parts,
    boundingWidth: spec.dimensions.width,
    boundingDepth: spec.dimensions.depth,
    boundingHeight: spec.dimensions.height,
    surfaceAreaMm2: totalSurfaceAreaMm2 || spec.dimensions.width * spec.dimensions.depth * 2,
  };
}
