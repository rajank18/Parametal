import * as THREE from 'three';
import { MaterialType } from '../types/design';

export interface PartitionParameters {
  panelWidth: number;          // Width of individual module sheet (mm), e.g., 400
  panelHeight: number;         // Height of individual module sheet (mm), e.g., 550
  panelDepth: number;          // Depth bulge curvature offset (mm), e.g., 180

  horizontalCurve: number;     // Transverse parabolic/hyperbolic curvature (mm), e.g., 120
  verticalCurve: number;       // Longitudinal hourglass waist curvature (mm), e.g., 90

  topRadius: number;           // Flare radius at top edge (mm), e.g., 40
  bottomRadius: number;        // Flare radius at bottom edge (mm), e.g., 40

  columns: number;             // Grid array column count, e.g., 4
  rows: number;                // Grid array row count, e.g., 4

  columnSpacing: number;       // Distance between vertical structural posts (mm), e.g., 480
  rowSpacing: number;          // Distance between vertical panel row tiers (mm), e.g., 520

  rotationVariation: number;   // Alternating or randomized angle rotation (deg), e.g., 15
  depthVariation: number;      // Alternating depth bulge offset variation (mm), e.g., 30

  postRadius: number;          // Radius of vertical structural posts (mm), e.g., 8
  panelThickness: number;      // Sheet metal thickness (mm), e.g., 2.0
  materialType: MaterialType;  // Finish (copper, galvanized, mild_steel, etc.)
  lightBulbs: boolean;         // Integrated ambient warm light nodes inside modules
}

export interface PartitionPanelOutput {
  id: string;
  label: string;               // e.g. "P-01", "P-02"
  rowIndex: number;
  colIndex: number;
  width: number;
  height: number;
  depth: number;
  rotationY: number;
  position: [number, number, number];
  geometry: THREE.BufferGeometry;
}

export interface PartitionMeshOutput {
  singlePanelGeometry: THREE.BufferGeometry;
  panels: PartitionPanelOutput[];
  postsGeometry: THREE.BufferGeometry;
  boundingWidth: number;
  boundingDepth: number;
  boundingHeight: number;
  surfaceAreaMm2: number;
  totalPanelsCount: number;
}

/**
 * Generate a single hyperbolic/saddle continuous sculptural curved sheet metal panel.
 */
export function generateSinglePartitionPanelGeometry(
  width: number,
  height: number,
  depthBulge: number,
  hCurve: number,
  vCurve: number,
  thickness: number,
  flipInward = false,
  uSegments = 24,
  vSegments = 32
): THREE.BufferGeometry {
  const w = width * 0.001;
  const h = height * 0.001;
  const bulge = depthBulge * 0.001;
  const hc = hCurve * 0.001;
  const vc = vCurve * 0.001;
  const t = thickness * 0.001;
  const dir = flipInward ? -1 : 1;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Surface point evaluation function for double-curved hourglass saddle sheet
  const evalPoint = (u: number, v: number, layerOffset: number) => {
    // u in [-0.5, 0.5], v in [0, 1]
    const xBase = u * w;
    const yBase = v * h - h * 0.5;

    // Hourglass waist compression in X based on V (narrow center, flaring top/bottom)
    const vFactor = Math.cos((v - 0.5) * Math.PI); // 1 at center, ~0 at ends
    const waistWidthScale = 1.0 - 0.35 * vFactor;
    const x = xBase * waistWidthScale;

    // Double curvature depth z:
    // 1. Bulge along V (flared outward or inward based on flipInward parameter)
    const zV = dir * bulge * (1.0 - Math.sin(v * Math.PI));
    // 2. Parabolic dish curve along U
    const zU = -dir * hc * (4 * u * u);
    // 3. Waist depth offset relative to center
    const zWaist = -dir * vc * (1.0 - vFactor);

    const z = zV + zU + zWaist + layerOffset;

    return new THREE.Vector3(x, yBase, z);
  };

  // Generate outer (front) and inner (back) offset surfaces with thickness t
  const numU = uSegments + 1;
  const numV = vSegments + 1;

  // Front surface (k = 0) & Back surface (k = 1)
  for (let k = 0; k < 2; k++) {
    const layerOffset = k === 0 ? t * 0.5 : -t * 0.5;
    for (let j = 0; j < numV; j++) {
      const v = j / vSegments;
      for (let i = 0; i < numU; i++) {
        const u = i / uSegments - 0.5;

        const pt = evalPoint(u, v, layerOffset);
        positions.push(pt.x, pt.y, pt.z);
        uvs.push(u + 0.5, v);

        // Approximate surface normal vector
        const eps = 0.001;
        const ptU = evalPoint(u + eps, v, layerOffset);
        const ptV = evalPoint(u, Math.min(1, v + eps), layerOffset);
        const du = ptU.clone().sub(pt).normalize();
        const dv = ptV.clone().sub(pt).normalize();
        const norm = new THREE.Vector3().crossVectors(du, dv).normalize();

        if (k === 1) norm.negate();
        normals.push(norm.x, norm.y, norm.z);
      }
    }
  }

  // Quads for front and back faces
  for (let k = 0; k < 2; k++) {
    const offset = k * numU * numV;
    for (let j = 0; j < vSegments; j++) {
      for (let i = 0; i < uSegments; i++) {
        const a = offset + j * numU + i;
        const b = offset + j * numU + (i + 1);
        const c = offset + (j + 1) * numU + (i + 1);
        const d = offset + (j + 1) * numU + i;

        if (k === 0) {
          indices.push(a, b, c);
          indices.push(a, c, d);
        } else {
          indices.push(a, c, b);
          indices.push(a, d, c);
        }
      }
    }
  }

  // Side perimeter edges closing skin
  const frontOffset = 0;
  const backOffset = numU * numV;

  // Top & Bottom Edges
  for (let i = 0; i < uSegments; i++) {
    // Bottom edge (j = 0)
    const fBotA = frontOffset + i;
    const fBotB = frontOffset + i + 1;
    const bBotA = backOffset + i;
    const bBotB = backOffset + i + 1;
    indices.push(fBotA, bBotA, bBotB);
    indices.push(fBotA, bBotB, fBotB);

    // Top edge (j = vSegments)
    const fTopA = frontOffset + vSegments * numU + i;
    const fTopB = frontOffset + vSegments * numU + i + 1;
    const bTopA = backOffset + vSegments * numU + i;
    const bTopB = backOffset + vSegments * numU + i + 1;
    indices.push(fTopA, fTopB, bTopB);
    indices.push(fTopA, bTopB, bTopA);
  }

  // Left & Right Edges
  for (let j = 0; j < vSegments; j++) {
    // Left edge (i = 0)
    const fLeftA = frontOffset + j * numU;
    const fLeftB = frontOffset + (j + 1) * numU;
    const bLeftA = backOffset + j * numU;
    const bLeftB = backOffset + (j + 1) * numU;
    indices.push(fLeftA, fLeftB, bLeftB);
    indices.push(fLeftA, bLeftB, bLeftA);

    // Right edge (i = uSegments)
    const fRightA = frontOffset + j * numU + uSegments;
    const fRightB = frontOffset + (j + 1) * numU + uSegments;
    const bRightA = backOffset + j * numU + uSegments;
    const bRightB = backOffset + (j + 1) * numU + uSegments;
    indices.push(fRightA, bRightA, bRightB);
    indices.push(fRightA, bRightB, fRightB);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Generate full architectural Partition Screen with vertical structural posts and arrayed curved modules.
 */
export function generatePartitionGeometry(params: PartitionParameters): PartitionMeshOutput {
  const {
    panelWidth,
    panelHeight,
    panelDepth,
    horizontalCurve,
    verticalCurve,
    columns,
    rows,
    columnSpacing,
    rowSpacing,
    rotationVariation,
    depthVariation,
    postRadius,
    panelThickness,
  } = params;

  const panelGeometryA = generateSinglePartitionPanelGeometry(
    panelWidth,
    panelHeight,
    panelDepth,
    horizontalCurve,
    verticalCurve,
    panelThickness,
    false
  );

  const panelGeometryB = generateSinglePartitionPanelGeometry(
    panelWidth,
    panelHeight,
    panelDepth,
    horizontalCurve,
    verticalCurve,
    panelThickness,
    true
  );

  const panels: PartitionPanelOutput[] = [];
  const colSpacingM = columnSpacing * 0.001;
  const rowSpacingM = rowSpacing * 0.001;

  const totalWidthM = (columns - 1) * colSpacingM + panelWidth * 0.001;
  const totalHeightM = rows * rowSpacingM;
  const startX = -((columns - 1) * colSpacingM) * 0.5;
  const startY = rowSpacingM * 0.5;

  let panelCounter = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const posX = startX + c * colSpacingM;
      const posY = startY + r * rowSpacingM;

      // Controlled organic variation pattern based on row/column checkerboard parity
      // Cross panels (1,3,5...) flip opposite to neighbors (2,4,6...)
      const parity = (r + c) % 2 === 0 ? 1 : -1;
      const rotYDeg = parity * rotationVariation;
      const offsetZ = parity * (depthVariation * 0.001);

      const panelLabel = `P-${panelCounter < 10 ? '0' : ''}${panelCounter}`;
      panelCounter++;

      const selectedGeometry = parity === 1 ? panelGeometryA : panelGeometryB;

      panels.push({
        id: `panel_${r}_${c}`,
        label: panelLabel,
        rowIndex: r,
        colIndex: c,
        width: panelWidth,
        height: panelHeight,
        depth: panelDepth + parity * depthVariation,
        rotationY: rotYDeg,
        position: [posX, posY, offsetZ],
        geometry: selectedGeometry,
      });
    }
  }

  // Generate vertical structural posts/rods geometry running full height of array
  const postsGeomList: THREE.BufferGeometry[] = [];
  const prM = (postRadius || 6) * 0.001;
  const postHeightM = totalHeightM + 0.15;

  // Place vertical structural rods directly along panel center lines
  for (let c = 0; c < columns; c++) {
    const postX = startX + c * colSpacingM;
    const cylinder = new THREE.CylinderGeometry(prM, prM, postHeightM, 16);
    // Align Z center of post at Z = 0 where the panel mid-waist intersects
    cylinder.translate(postX, totalHeightM * 0.5, 0);
    postsGeomList.push(cylinder);
  }

  // Merge vertical structural posts geometries safely
  const mergedPostsPositions: number[] = [];
  const mergedPostsNormals: number[] = [];
  const mergedPostsIndices: number[] = [];
  let vertexOffset = 0;

  for (const g of postsGeomList) {
    const pos = g.getAttribute('position');
    const norm = g.getAttribute('normal');
    const idx = g.getIndex();

    if (pos && norm && idx) {
      for (let i = 0; i < pos.count; i++) {
        mergedPostsPositions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
        mergedPostsNormals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
      }
      for (let i = 0; i < idx.count; i++) {
        mergedPostsIndices.push(idx.getX(i) + vertexOffset);
      }
      vertexOffset += pos.count;
    }
  }

  const postsGeometry = new THREE.BufferGeometry();
  postsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(mergedPostsPositions, 3));
  postsGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(mergedPostsNormals, 3));
  postsGeometry.setIndex(mergedPostsIndices);

  const singlePanelArea = (panelWidth * panelHeight * 2) + (panelWidth * panelDepth * 0.5);
  const totalSurfaceArea = singlePanelArea * panels.length;

  return {
    singlePanelGeometry: panelGeometryA,
    panels,
    postsGeometry,
    boundingWidth: totalWidthM * 1000,
    boundingDepth: (panelDepth + depthVariation) * 2,
    boundingHeight: totalHeightM * 1000,
    surfaceAreaMm2: totalSurfaceArea,
    totalPanelsCount: panels.length,
  };
}
