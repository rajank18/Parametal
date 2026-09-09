import * as THREE from 'three';
import { GeometrySpec, RevolvedComponentSpec } from '../types/design';

export interface GeneratedMeshPart {
  id: string;
  name: string;
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  materialType?: string;
}

export interface GeneratedGeometryResult {
  parts: GeneratedMeshPart[];
  boundingWidth: number;
  boundingDepth: number;
  boundingHeight: number;
  surfaceAreaMm2: number;
}

export function generateRevolvedGeometry(spec: GeometrySpec): GeneratedGeometryResult {
  const parts: GeneratedMeshPart[] = [];
  const primaryComp = (spec.components.find((c) => c.type === 'revolved_body') as RevolvedComponentSpec) || {
    type: 'revolved_body',
    height: spec.dimensions.height || 500,
    baseRadius: (spec.dimensions.width || 300) * 0.25,
    waistRadius: (spec.dimensions.width || 300) * 0.45,
    neckRadius: (spec.dimensions.width || 300) * 0.2,
  };

  const heightM = (primaryComp.height || spec.dimensions.height || 500) * 0.001;
  const baseR = (primaryComp.baseRadius || 100) * 0.001;
  const waistR = (primaryComp.waistRadius || baseR * 1.5) * 0.001;
  const neckR = (primaryComp.neckRadius || baseR * 0.8) * 0.001;

  // 1. Build smooth 2D revolved profile spline
  const rawControlPoints: THREE.Vector2[] = [];

  if (primaryComp.profilePoints && Array.isArray(primaryComp.profilePoints) && primaryComp.profilePoints.length >= 2) {
    const maxR = Math.max(baseR, waistR, neckR, 0.05);
    primaryComp.profilePoints.forEach((pt) => {
      const y = Math.max(0, Math.min(1, pt.yRatio ?? 0)) * heightM;
      const r = Math.max(0.005, (pt.rRatio ?? 0.5) * maxR);
      rawControlPoints.push(new THREE.Vector2(r, y));
    });
  } else {
    rawControlPoints.push(new THREE.Vector2(baseR, 0));
    rawControlPoints.push(new THREE.Vector2(waistR, heightM * 0.45));
    rawControlPoints.push(new THREE.Vector2(neckR, heightM * 0.9));
    rawControlPoints.push(new THREE.Vector2(neckR * 0.95, heightM));
  }

  // Ensure points are sorted by Y
  rawControlPoints.sort((a, b) => a.y - b.y);

  const spline = new THREE.SplineCurve(rawControlPoints);
  const smoothPoints = spline.getPoints(64);
  const vesselGeo = new THREE.LatheGeometry(smoothPoints, 64);

  parts.push({
    id: 'revolved-body',
    name: primaryComp.role || 'Revolved Body',
    geometry: vesselGeo,
    position: [0, 0, 0],
    color: '#a2482b',
  });

  // 2. Curved Pouring Spout
  if (primaryComp.hasSpout) {
    const spoutLen = (primaryComp.spoutLength || 140) * 0.001;
    const waistPos = rawControlPoints[Math.floor(rawControlPoints.length * 0.45)] || new THREE.Vector2(waistR, heightM * 0.45);
    const spoutOrigin = new THREE.Vector3(waistPos.x * 0.92, waistPos.y, 0);

    const spoutCurve = new THREE.CurvePath<THREE.Vector3>();
    const midPt = new THREE.Vector3(waistPos.x + spoutLen * 0.5, waistPos.y + spoutLen * 0.4, 0);
    const tipPt = new THREE.Vector3(waistPos.x + spoutLen * 0.85, waistPos.y + spoutLen * 0.85, 0);

    spoutCurve.add(new THREE.QuadraticBezierCurve3(spoutOrigin, midPt, tipPt));
    const spoutGeo = new THREE.TubeGeometry(spoutCurve, 32, 0.016, 16, false);

    parts.push({
      id: 'spout',
      name: 'Pouring Spout',
      geometry: spoutGeo,
      position: [0, 0, 0],
      color: '#8c381e',
    });
  }

  // 3. Ergonomic Side Handle
  if (primaryComp.hasHandle) {
    const handleW = (primaryComp.handleWidth || 90) * 0.001;
    const topPt = rawControlPoints[rawControlPoints.length - 1] || new THREE.Vector2(neckR, heightM);
    const bottomPt = rawControlPoints[1] || new THREE.Vector2(waistR, heightM * 0.3);

    const handleCurve = new THREE.CurvePath<THREE.Vector3>();
    const p1 = new THREE.Vector3(-bottomPt.x * 0.95, heightM * 0.25, 0);
    const p2 = new THREE.Vector3(-bottomPt.x - handleW, heightM * 0.45, 0);
    const p3 = new THREE.Vector3(-topPt.x - handleW, heightM * 0.75, 0);
    const p4 = new THREE.Vector3(-topPt.x * 0.95, heightM * 0.85, 0);

    handleCurve.add(new THREE.CubicBezierCurve3(p1, p2, p3, p4));
    const handleGeo = new THREE.TubeGeometry(handleCurve, 32, 0.012, 16, false);

    parts.push({
      id: 'handle',
      name: 'Side Handle',
      geometry: handleGeo,
      position: [0, 0, 0],
      color: '#6e2d18',
    });
  }

  // 4. Top Lid & Knob
  if (primaryComp.hasLid) {
    const topPt = rawControlPoints[rawControlPoints.length - 1] || new THREE.Vector2(neckR, heightM);
    const lidRadius = topPt.x * 1.02;
    const lidY = topPt.y;

    const lidPoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const r = THREE.MathUtils.lerp(lidRadius, 0.002, t);
      const y = lidY + Math.sin(t * Math.PI * 0.5) * 0.025;
      lidPoints.push(new THREE.Vector2(r, y));
    }
    const lidGeo = new THREE.LatheGeometry(lidPoints, 48);

    parts.push({
      id: 'lid',
      name: 'Top Lid',
      geometry: lidGeo,
      position: [0, 0, 0],
      color: '#b55435',
    });

    const knobR = (primaryComp.lidKnobRadius || 15) * 0.001;
    if (knobR > 0) {
      const knobGeo = new THREE.SphereGeometry(knobR, 24, 24);
      knobGeo.translate(0, lidY + 0.03 + knobR, 0);
      parts.push({
        id: 'knob',
        name: 'Lid Knob',
        geometry: knobGeo,
        position: [0, 0, 0],
        color: '#d4a373',
      });
    }
  }

  return {
    parts,
    boundingWidth: spec.dimensions.width || waistR * 2000,
    boundingDepth: spec.dimensions.depth || waistR * 2000,
    boundingHeight: spec.dimensions.height || heightM * 1000,
    surfaceAreaMm2: Math.PI * (waistR * 1000) * (heightM * 1000),
  };
}
