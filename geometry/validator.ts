import { GeometrySpec, ComponentSpec } from '../types/design';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isFiniteNumber(val: any): boolean {
  return typeof val === 'number' && Number.isFinite(val) && !Number.isNaN(val);
}

export function validateGeometrySpec(spec: GeometrySpec): ValidationResult {
  const errors: string[] = [];

  if (!spec) {
    return { valid: false, errors: ['GeometrySpec is null or undefined'] };
  }

  // 1. Topology validation
  const validTopologies = ['revolved', 'prismatic_assembly', 'continuous_sheet'];
  if (!validTopologies.includes(spec.topology)) {
    errors.push(`Invalid topology: "${spec.topology}". Must be one of: ${validTopologies.join(', ')}`);
  }

  // 2. Global Bounding Dimensions validation
  if (!spec.dimensions) {
    errors.push('Dimensions object is missing');
  } else {
    const { width, depth, height } = spec.dimensions;
    if (!isFiniteNumber(width) || width <= 0 || width > 20000) {
      errors.push(`Invalid dimension width: ${width}mm (must be between 1 and 20000)`);
    }
    if (!isFiniteNumber(depth) || depth <= 0 || depth > 20000) {
      errors.push(`Invalid dimension depth: ${depth}mm (must be between 1 and 20000)`);
    }
    if (!isFiniteNumber(height) || height <= 0 || height > 20000) {
      errors.push(`Invalid dimension height: ${height}mm (must be between 1 and 20000)`);
    }
  }

  // 3. Components array validation
  if (!Array.isArray(spec.components) || spec.components.length === 0) {
    errors.push('Components must be a non-empty array');
    return { valid: false, errors };
  }

  // 4. Validate each component individually
  spec.components.forEach((comp, idx) => {
    const prefix = `Component[${idx}] (${(comp as any)?.type || 'unknown'} / ${(comp as any)?.role || 'unnamed'}):`;

    if (!comp || typeof comp !== 'object' || !comp.type) {
      errors.push(`${prefix} Missing or invalid component structure`);
      return;
    }

    switch (comp.type) {
      case 'revolved_body': {
        if (!isFiniteNumber(comp.height) || comp.height <= 0) {
          errors.push(`${prefix} height must be a positive finite number`);
        }
        if (!isFiniteNumber(comp.baseRadius) || comp.baseRadius <= 0) {
          errors.push(`${prefix} baseRadius must be a positive finite number`);
        }
        if (comp.profilePoints) {
          if (!Array.isArray(comp.profilePoints)) {
            errors.push(`${prefix} profilePoints must be an array`);
          } else {
            comp.profilePoints.forEach((pt, pIdx) => {
              if (!isFiniteNumber(pt.yRatio) || !isFiniteNumber(pt.rRatio)) {
                errors.push(`${prefix} profilePoint[${pIdx}] contains NaN or non-finite values`);
              }
            });
          }
        }
        break;
      }

      case 'prismatic_slab':
      case 'flat_sheet': {
        if (!Array.isArray(comp.dimensions) || comp.dimensions.length !== 3) {
          errors.push(`${prefix} dimensions must be a 3-element tuple [w, h, d]`);
        } else {
          comp.dimensions.forEach((d, dIdx) => {
            if (!isFiniteNumber(d) || d <= 0) {
              errors.push(`${prefix} dimensions[${dIdx}] must be a positive finite number`);
            }
          });
        }
        if (comp.position && (!Array.isArray(comp.position) || comp.position.some((p) => !isFiniteNumber(p)))) {
          errors.push(`${prefix} position contains non-finite values`);
        }
        break;
      }

      case 'support_legs':
      case 'legs': {
        if (!isFiniteNumber(comp.legHeight) || comp.legHeight <= 0) {
          errors.push(`${prefix} legHeight must be a positive finite number`);
        }
        break;
      }

      case 'bent_sheet': {
        if (!isFiniteNumber(comp.width) || comp.width <= 0) {
          errors.push(`${prefix} width must be a positive finite number`);
        }
        if (!isFiniteNumber(comp.thickness) || comp.thickness <= 0) {
          errors.push(`${prefix} thickness must be a positive finite number`);
        }
        if (comp.profilePoints) {
          if (!Array.isArray(comp.profilePoints) || comp.profilePoints.length < 2) {
            errors.push(`${prefix} profilePoints must have at least 2 points`);
          }
        }
        break;
      }

      case 'curved_sheet_panel':
      case 'side_panel': {
        if (!isFiniteNumber(comp.width) || comp.width <= 0) {
          errors.push(`${prefix} width must be a positive finite number`);
        }
        if (!isFiniteNumber(comp.height) || comp.height <= 0) {
          errors.push(`${prefix} height must be a positive finite number`);
        }
        if (!isFiniteNumber(comp.thickness) || comp.thickness <= 0) {
          errors.push(`${prefix} thickness must be a positive finite number`);
        }
        break;
      }

      case 'repeated_module': {
        if (!isFiniteNumber(comp.rows) || comp.rows < 1) {
          errors.push(`${prefix} rows must be >= 1`);
        }
        if (!isFiniteNumber(comp.columns) || comp.columns < 1) {
          errors.push(`${prefix} columns must be >= 1`);
        }
        if (!comp.module) {
          errors.push(`${prefix} missing module definition`);
        }
        break;
      }

      case 'frame_post':
      case 'frame': {
        if (!isFiniteNumber(comp.height) || comp.height <= 0) {
          errors.push(`${prefix} height must be a positive finite number`);
        }
        if (!Array.isArray(comp.positions) || comp.positions.length === 0) {
          errors.push(`${prefix} positions array must not be empty`);
        }
        break;
      }

      case 'cutout': {
        if (!Array.isArray(comp.size) || comp.size.length !== 2 || comp.size.some((s) => !isFiniteNumber(s) || s <= 0)) {
          errors.push(`${prefix} size must be a positive 2-tuple [w, h]`);
        }
        break;
      }

      default:
        // Allow unknown components if they specify basic metadata
        break;
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
