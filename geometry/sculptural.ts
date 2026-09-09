import * as THREE from 'three';
import { SculpturalParameters } from '../types/design';

export function generateSculpturalVesselGeometry(params: SculpturalParameters): {
  vesselGeometry: THREE.BufferGeometry;
  handleGeometry: THREE.BufferGeometry | null;
  spoutGeometry: THREE.BufferGeometry | null;
  lidGeometry: THREE.BufferGeometry | null;
  knobGeometry: THREE.BufferGeometry | null;
  boundingWidth: number;
  boundingDepth: number;
  boundingHeight: number;
} {
  const heightM = (params.height || 500) * 0.001;
  const baseR = (params.baseRadius || 100) * 0.001;
  const waistR = (params.waistRadius || 180) * 0.001;
  const neckR = (params.neckRadius || 80) * 0.001;

  // 1. Build smooth 2D revolved Spline Curve profile
  const rawControlPoints: THREE.Vector2[] = [];

  if (params.profilePoints && Array.isArray(params.profilePoints) && params.profilePoints.length >= 3) {
    const maxR = Math.max(baseR, waistR, neckR, 0.1);
    params.profilePoints.forEach((pt) => {
      const y = (pt.yRatio ?? 0) * heightM;
      const r = Math.max(0.01, (pt.rRatio ?? 0.5) * maxR);
      rawControlPoints.push(new THREE.Vector2(r, y));
    });
  } else {
    // Default smooth bulbous shape
    rawControlPoints.push(new THREE.Vector2(baseR, 0));
    rawControlPoints.push(new THREE.Vector2(waistR, heightM * 0.45));
    rawControlPoints.push(new THREE.Vector2(neckR, heightM * 0.9));
    rawControlPoints.push(new THREE.Vector2(neckR * 0.95, heightM));
  }

  // Interpolate 64 points along a smooth SplineCurve to remove sharp creases
  const spline = new THREE.SplineCurve(rawControlPoints);
  const smoothPoints = spline.getPoints(64);

  // Create smooth revolved body surface geometry
  const vesselGeometry = new THREE.LatheGeometry(smoothPoints, 64);

  // 2. Curved Pouring Spout Geometry (e.g. Teapots, Kettles, Jugs)
  let spoutGeometry: THREE.BufferGeometry | null = null;
  if (params.hasSpout) {
    const spoutLen = (params.spoutLength || 140) * 0.001;
    const waistPos = rawControlPoints[Math.floor(rawControlPoints.length * 0.45)] || new THREE.Vector2(waistR, heightM * 0.45);
    const spoutOrigin = new THREE.Vector3(waistPos.x * 0.92, waistPos.y, 0);

    const spoutCurve = new THREE.CurvePath<THREE.Vector3>();
    const midPt = new THREE.Vector3(
      waistPos.x + spoutLen * 0.5,
      waistPos.y + spoutLen * 0.4,
      0
    );
    const tipPt = new THREE.Vector3(
      waistPos.x + spoutLen * 0.85,
      waistPos.y + spoutLen * 0.85,
      0
    );

    spoutCurve.add(new THREE.QuadraticBezierCurve3(spoutOrigin, midPt, tipPt));
    spoutGeometry = new THREE.TubeGeometry(spoutCurve, 32, 0.016, 16, false);
  }

  // 3. Ergonomic Side Handle Geometry
  let handleGeometry: THREE.BufferGeometry | null = null;
  if (params.hasHandle) {
    const handleW = (params.handleWidth || 90) * 0.001;
    const topPt = rawControlPoints[rawControlPoints.length - 1] || new THREE.Vector2(neckR, heightM);
    const bottomPt = rawControlPoints[1] || new THREE.Vector2(waistR, heightM * 0.3);

    const handleCurve = new THREE.CurvePath<THREE.Vector3>();
    const p1 = new THREE.Vector3(-bottomPt.x * 0.95, heightM * 0.25, 0);
    const p2 = new THREE.Vector3(-bottomPt.x - handleW, heightM * 0.45, 0);
    const p3 = new THREE.Vector3(-topPt.x - handleW, heightM * 0.75, 0);
    const p4 = new THREE.Vector3(-topPt.x * 0.95, heightM * 0.85, 0);

    handleCurve.add(new THREE.CubicBezierCurve3(p1, p2, p3, p4));
    handleGeometry = new THREE.TubeGeometry(handleCurve, 32, 0.012, 16, false);
  }

  // 4. Top Lid Disc Geometry (rendered ONLY if hasLid === true)
  let lidGeometry: THREE.BufferGeometry | null = null;
  let knobGeometry: THREE.BufferGeometry | null = null;
  if (params.hasLid === true) {
    const topPt = rawControlPoints[rawControlPoints.length - 1] || new THREE.Vector2(neckR, heightM);
    const lidRadius = topPt.x * 1.02;
    const lidY = topPt.y;

    // Domed lid surface
    const lidPoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const r = THREE.MathUtils.lerp(lidRadius, 0.002, t);
      const y = lidY + Math.sin(t * Math.PI * 0.5) * 0.025;
      lidPoints.push(new THREE.Vector2(r, y));
    }
    lidGeometry = new THREE.LatheGeometry(lidPoints, 48);

    // Spherical top handle knob (rendered ONLY if lidKnobRadius > 0)
    const knobR = (params.lidKnobRadius || 0) * 0.001;
    if (knobR > 0) {
      knobGeometry = new THREE.SphereGeometry(knobR, 24, 24);
      knobGeometry.translate(0, lidY + 0.03 + knobR, 0);
    }
  }

  return {
    vesselGeometry,
    handleGeometry,
    spoutGeometry,
    lidGeometry,
    knobGeometry,
    boundingWidth: (waistR * 2 + (params.hasHandle ? params.handleWidth || 90 : 0) + (params.hasSpout ? params.spoutLength || 140 : 0)),
    boundingDepth: waistR * 2000,
    boundingHeight: params.height || 500,
  };
}
