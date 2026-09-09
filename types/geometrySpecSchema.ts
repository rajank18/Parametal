import { z } from 'zod';

export const TopologySchema = z.enum(['revolved', 'prismatic_assembly', 'continuous_sheet']);

export const ObjectTypeSchema = z.enum([
  'seating',
  'table',
  'lighting',
  'storage',
  'partition',
  'electronics',
  'container',
  'wall_mounted',
  'unknown',
]);

export const MaterialTypeSchema = z.enum(['galvanized', 'mild_steel', 'aluminum', 'custom']);

export const DimensionsSchema = z.object({
  width: z.number().min(1).max(20000),
  depth: z.number().min(1).max(20000),
  height: z.number().min(1).max(20000),
});

export const RevolvedComponentSpecSchema = z.object({
  type: z.literal('revolved_body'),
  id: z.string().optional(),
  role: z.string().optional(),
  height: z.number().positive(),
  baseRadius: z.number().positive(),
  waistRadius: z.number().positive().optional(),
  neckRadius: z.number().positive().optional(),
  profilePoints: z
    .array(
      z.object({
        yRatio: z.number().min(0).max(1),
        rRatio: z.number().min(0).max(1),
      })
    )
    .optional(),
  wallThickness: z.number().positive().optional(),
  hasHandle: z.boolean().optional(),
  handleWidth: z.number().optional(),
  hasSpout: z.boolean().optional(),
  spoutLength: z.number().optional(),
  spoutAngle: z.number().optional(),
  hasLid: z.boolean().optional(),
  lidKnobRadius: z.number().optional(),
});

export const PrismaticSlabSpecSchema = z.object({
  type: z.enum(['prismatic_slab', 'flat_sheet']),
  id: z.string().optional(),
  role: z.string().optional(),
  dimensions: z.tuple([z.number().positive(), z.number().positive(), z.number().positive()]),
  position: z.tuple([z.number(), z.number(), z.number()]).optional(),
  rotation: z.tuple([z.number(), z.number(), z.number()]).optional(),
  cornerRadius: z.number().optional(),
  color: z.string().optional(),
});

export const SupportLegsSpecSchema = z.object({
  type: z.enum(['support_legs', 'legs']),
  id: z.string().optional(),
  role: z.string().optional(),
  style: z.enum(['four_corner', 'u_frame', 'pedestal', 'hairpin', 'blade', 'cantilever']),
  count: z.number().int().positive().optional(),
  legHeight: z.number().positive(),
  legWidth: z.number().positive().optional(),
  legDepth: z.number().positive().optional(),
  legRadius: z.number().positive().optional(),
  inset: z.number().optional(),
  angle: z.number().optional(),
  color: z.string().optional(),
});

export const BentSheetSpecSchema = z.object({
  type: z.literal('bent_sheet'),
  id: z.string().optional(),
  role: z.string().optional(),
  width: z.number().positive(),
  thickness: z.number().positive(),
  profilePoints: z.array(z.tuple([z.number(), z.number()])).min(2).optional(),
  bends: z
    .array(
      z.object({
        segmentLength: z.number().positive(),
        bendAngle: z.number(),
        bendRadius: z.number().optional(),
      })
    )
    .optional(),
  extrusionDepth: z.number().optional(),
  position: z.tuple([z.number(), z.number(), z.number()]).optional(),
  rotation: z.tuple([z.number(), z.number(), z.number()]).optional(),
  color: z.string().optional(),
});

export const CurvedSheetPanelSpecSchema = z.object({
  type: z.enum(['curved_sheet_panel', 'side_panel']),
  id: z.string().optional(),
  role: z.string().optional(),
  width: z.number().positive(),
  height: z.number().positive(),
  thickness: z.number().positive(),
  horizontalCurvature: z.number().optional(),
  verticalCurvature: z.number().optional(),
  cornerRadius: z.number().optional(),
  position: z.tuple([z.number(), z.number(), z.number()]).optional(),
  rotation: z.tuple([z.number(), z.number(), z.number()]).optional(),
  color: z.string().optional(),
});

export const FramePostSpecSchema = z.object({
  type: z.enum(['frame_post', 'frame']),
  id: z.string().optional(),
  role: z.string().optional(),
  height: z.number().positive(),
  radius: z.number().positive().optional(),
  width: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  positions: z.array(z.tuple([z.number(), z.number(), z.number()])).min(1),
  color: z.string().optional(),
});

export const CutoutSpecSchema = z.object({
  type: z.literal('cutout'),
  id: z.string().optional(),
  role: z.string().optional(),
  shape: z.enum(['rectangular', 'circular', 'pill', 'polygon']),
  size: z.tuple([z.number().positive(), z.number().positive()]),
  position: z.tuple([z.number(), z.number(), z.number()]),
  normal: z.tuple([z.number(), z.number(), z.number()]).optional(),
});

export const RepeatedModuleSpecSchema = z.object({
  type: z.literal('repeated_module'),
  id: z.string().optional(),
  role: z.string().optional(),
  rows: z.number().int().min(1),
  columns: z.number().int().min(1),
  rowSpacing: z.number().positive(),
  columnSpacing: z.number().positive(),
  module: z.union([CurvedSheetPanelSpecSchema, PrismaticSlabSpecSchema]),
  stagger: z.boolean().optional(),
  rotationVariation: z.number().optional(),
  depthVariation: z.number().optional(),
});

export const ComponentSpecSchema = z.discriminatedUnion('type', [
  RevolvedComponentSpecSchema,
  PrismaticSlabSpecSchema.extend({ type: z.literal('prismatic_slab') }),
  PrismaticSlabSpecSchema.extend({ type: z.literal('flat_sheet') }),
  SupportLegsSpecSchema.extend({ type: z.literal('support_legs') }),
  SupportLegsSpecSchema.extend({ type: z.literal('legs') }),
  BentSheetSpecSchema,
  CurvedSheetPanelSpecSchema.extend({ type: z.literal('curved_sheet_panel') }),
  CurvedSheetPanelSpecSchema.extend({ type: z.literal('side_panel') }),
  FramePostSpecSchema.extend({ type: z.literal('frame_post') }),
  FramePostSpecSchema.extend({ type: z.literal('frame') }),
  CutoutSpecSchema,
  RepeatedModuleSpecSchema,
]);

export const GeometrySpecSchema = z.object({
  topology: TopologySchema,
  objectType: ObjectTypeSchema,
  confidence: z.number().min(0).max(1),
  dimensions: DimensionsSchema,
  components: z.array(ComponentSpecSchema).min(1),
  materialType: MaterialTypeSchema.optional(),
  symmetry: z.enum(['none', 'bilateral', 'rotational_y']).optional(),
});

export const SculpturalParametersSchema = z.object({
  objectName: z.string().min(1),
  height: z.number().positive().optional(),
  baseRadius: z.number().positive().optional(),
  waistRadius: z.number().positive().optional(),
  neckRadius: z.number().positive().optional(),
  profilePoints: z
    .array(
      z.object({
        yRatio: z.number().min(0).max(1),
        rRatio: z.number().min(0).max(1),
      })
    )
    .optional(),
  wallThickness: z.number().positive().optional(),
  hasHandle: z.boolean().optional(),
  handleWidth: z.number().optional(),
  hasSpout: z.boolean().optional(),
  spoutLength: z.number().optional(),
  spoutAngle: z.number().optional(),
  hasLid: z.boolean().optional(),
  lidKnobRadius: z.number().optional(),
  materialType: MaterialTypeSchema.default('aluminum'),
  geometrySpec: GeometrySpecSchema,
});

const VALID_CATEGORIES = [
  'sculptural',
  'lamp',
  'seating',
  'partition',
  'table',
  'storage',
  'wall_mounted',
] as const;

export type ValidCategory = (typeof VALID_CATEGORIES)[number];

export function normalizeActiveCategory(cat: any): ValidCategory {
  if (typeof cat !== 'string') return 'sculptural';
  const lower = cat.toLowerCase().trim();
  if (VALID_CATEGORIES.includes(lower as any)) return lower as ValidCategory;
  if (
    lower.includes('chair') ||
    lower.includes('bench') ||
    lower.includes('stool') ||
    lower.includes('seat') ||
    lower.includes('sofa') ||
    lower.includes('couch')
  )
    return 'seating';
  if (lower.includes('desk') || lower.includes('table') || lower.includes('stand')) return 'table';
  if (
    lower.includes('lamp') ||
    lower.includes('light') ||
    lower.includes('sconce') ||
    lower.includes('chandelier')
  )
    return 'lamp';
  if (
    lower.includes('screen') ||
    lower.includes('divider') ||
    lower.includes('partition') ||
    lower.includes('wall')
  )
    return 'partition';
  if (
    lower.includes('shelf') ||
    lower.includes('cabinet') ||
    lower.includes('credenza') ||
    lower.includes('storage') ||
    lower.includes('drawer')
  )
    return 'storage';
  return 'sculptural';
}

export function normalizeRawAiPayload(rawJson: any): any {
  if (!rawJson || typeof rawJson !== 'object') return rawJson;

  // Case 1: AI returned GeometrySpec directly at root
  if (rawJson.topology && rawJson.components && rawJson.dimensions) {
    return {
      activeCategory: 'sculptural',
      sculpturalParameters: {
        objectName: rawJson.objectName || 'Custom Parametric Object',
        materialType: rawJson.materialType || 'mild_steel',
        geometrySpec: rawJson,
      },
    };
  }

  // Case 2: AI returned sculpturalParameters directly at root
  if (rawJson.geometrySpec && !rawJson.sculpturalParameters) {
    return {
      activeCategory: 'sculptural',
      sculpturalParameters: rawJson,
    };
  }

  // Case 3: Standard object
  const activeCategory = normalizeActiveCategory(rawJson.activeCategory);

  return {
    ...rawJson,
    activeCategory,
  };
}

export const ActiveCategorySchema = z.preprocess(
  (val) => normalizeActiveCategory(val),
  z.enum(VALID_CATEGORIES)
);

export const AnalyzeImageResponseSchema = z.object({
  activeCategory: ActiveCategorySchema,
  sculpturalParameters: SculpturalParametersSchema.optional(),
  parameters: z.any().optional(),
  seatingParameters: z.any().optional(),
  partitionParameters: z.any().optional(),
});

export type ValidatedGeometrySpec = z.infer<typeof GeometrySpecSchema>;
export type ValidatedSculpturalParameters = z.infer<typeof SculpturalParametersSchema>;

