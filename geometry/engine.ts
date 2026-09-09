import { GeometrySpec, SculpturalParameters } from '../types/design';
import { validateGeometrySpec, ValidationResult } from './validator';
import { generateRevolvedGeometry, GeneratedGeometryResult } from './revolved';
import { generatePrismaticAssembly } from './prismatic';
import { generateContinuousSheet } from './continuousSheet';

// Typed Errors for Fail-Fast Architecture (No silent fallbacks)
export class UnknownTopologyError extends Error {
  public topology: string;
  constructor(topology: string) {
    super(`Unknown or unsupported geometry topology: "${topology}". Must be "revolved", "prismatic_assembly", or "continuous_sheet".`);
    this.name = 'UnknownTopologyError';
    this.topology = topology;
  }
}

export class MissingGeometrySpecError extends Error {
  constructor(message = 'Missing geometrySpec or geometrySpec.topology in sculptural parameters.') {
    super(message);
    this.name = 'MissingGeometrySpecError';
  }
}

export class InvalidGeometrySpecError extends Error {
  public errors: string[];
  constructor(errors: string[]) {
    super(`Invalid GeometrySpec: ${errors.join('; ')}`);
    this.name = 'InvalidGeometrySpecError';
    this.errors = errors;
  }
}

/**
 * Strict converter: extracts the GeometrySpec from SculpturalParameters.
 * Throws MissingGeometrySpecError if absent, preventing silent fabrication of random shapes.
 */
export function convertSculpturalParamsToSpec(params: SculpturalParameters): GeometrySpec {
  if (params?.geometrySpec && params.geometrySpec.topology) {
    return params.geometrySpec;
  }

  throw new MissingGeometrySpecError(
    'No valid GeometrySpec found on sculpturalParameters. AI generation output must include a typed geometrySpec.'
  );
}

/**
 * Dedicated builder for intentional legacy parameters (e.g. manual sliders when no AI spec exists).
 */
export function buildLegacySculpturalSpec(params: SculpturalParameters): GeometrySpec {
  const height = params?.height || 500;
  const baseR = params?.baseRadius || 100;
  const waistR = params?.waistRadius || 160;
  const neckR = params?.neckRadius || 80;

  return {
    topology: 'revolved',
    objectType: 'container',
    confidence: 1.0,
    dimensions: {
      width: Math.max(baseR, waistR, neckR) * 2,
      depth: Math.max(baseR, waistR, neckR) * 2,
      height: height,
    },
    materialType: params?.materialType || 'aluminum',
    components: [
      {
        type: 'revolved_body',
        role: params?.objectName || 'Manual Sculptural Vessel Body',
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

/**
 * Deterministic Geometry Generator
 * Topology check is STRICT: throws UnknownTopologyError on unrecognized topologies.
 * Validation is BLOCKING: throws InvalidGeometrySpecError if bounds or component validation fails.
 */
export function generateGeometry(spec: GeometrySpec): {
  result: GeneratedGeometryResult;
  validation: ValidationResult;
} {
  const validTopologies = ['revolved', 'prismatic_assembly', 'continuous_sheet'];
  if (!spec || !validTopologies.includes(spec.topology)) {
    throw new UnknownTopologyError((spec as any)?.topology || 'undefined');
  }

  const validation = validateGeometrySpec(spec);

  if (!validation.valid) {
    throw new InvalidGeometrySpecError(validation.errors);
  }

  let result: GeneratedGeometryResult;

  switch (spec.topology) {
    case 'prismatic_assembly':
      result = generatePrismaticAssembly(spec);
      break;

    case 'continuous_sheet':
      result = generateContinuousSheet(spec);
      break;

    case 'revolved':
      result = generateRevolvedGeometry(spec);
      break;

    default:
      throw new UnknownTopologyError((spec as any)?.topology || 'undefined');
  }

  return { result, validation };
}
