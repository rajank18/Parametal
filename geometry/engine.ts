import { GeometrySpec, SculpturalParameters } from '../types/design';
import { validateGeometrySpec, ValidationResult } from './validator';
import { generateRevolvedGeometry, GeneratedGeometryResult } from './revolved';
import { generatePrismaticAssembly } from './prismatic';
import { generateContinuousSheet } from './continuousSheet';

export function convertSculpturalParamsToSpec(params: SculpturalParameters): GeometrySpec {
  // If params already contains a modern geometrySpec, use it
  if (params?.geometrySpec && params.geometrySpec.topology) {
    return params.geometrySpec;
  }

  // Otherwise, construct a backward-compatible GeometrySpec from legacy sculptural parameters
  const height = params?.height || 500;
  const baseR = params?.baseRadius || 100;
  const waistR = params?.waistRadius || 160;
  const neckR = params?.neckRadius || 80;

  return {
    topology: 'revolved',
    objectType: 'container',
    confidence: 0.95,
    dimensions: {
      width: Math.max(baseR, waistR, neckR) * 2,
      depth: Math.max(baseR, waistR, neckR) * 2,
      height: height,
    },
    materialType: params?.materialType || 'aluminum',
    components: [
      {
        type: 'revolved_body',
        role: params?.objectName || 'Revolved Vessel Body',
        height: height,
        baseRadius: baseR,
        waistRadius: waistR,
        neckRadius: neckR,
        profilePoints: params?.profilePoints,
        wallThickness: params?.wallThickness || 2.0,
        hasHandle: params?.hasHandle,
        handleWidth: params?.handleWidth,
        hasSpout: params?.hasSpout,
        spoutLength: params?.spoutLength,
        spoutAngle: params?.spoutAngle,
        hasLid: params?.hasLid,
        lidKnobRadius: params?.lidKnobRadius,
      },
    ],
  };
}

export function generateGeometry(spec: GeometrySpec): {
  result: GeneratedGeometryResult;
  validation: ValidationResult;
} {
  const validation = validateGeometrySpec(spec);

  if (!validation.valid) {
    console.warn('[GeometryEngine] GeometrySpec validation warnings:', validation.errors);
  }

  let result: GeneratedGeometryResult;

  switch (spec?.topology) {
    case 'prismatic_assembly':
      result = generatePrismaticAssembly(spec);
      break;

    case 'continuous_sheet':
      result = generateContinuousSheet(spec);
      break;

    case 'revolved':
    default:
      result = generateRevolvedGeometry(spec);
      break;
  }

  return { result, validation };
}
