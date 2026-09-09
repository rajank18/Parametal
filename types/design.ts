import * as THREE from 'three';

export type MaterialType = 'galvanized' | 'mild_steel' | 'aluminum' | 'custom';
export type ThemeMode = 'dark' | 'light';
export type ObjectCategory = 'lamp' | 'seating' | 'table' | 'storage' | 'partition' | 'wall_mounted' | 'sculptural';

export interface ObjectFamilyMeta {
  id: ObjectCategory;
  name: string;
  tagline: string;
  icon: string;
  description: string;
  ready: boolean;
}

export interface MaterialConfig {
  type: MaterialType;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
}

export interface CanopyParameters {
  width: number;
  depth: number;
  height: number;
  leftTipHeight: number;
  rightTipHeight: number;
  centerHeight: number;
  frontCurvature: number;
  backCurvature: number;
  curveDepth: number;
  cornerRadius: number;
  thickness: number;
  materialType: MaterialType;
  lightIntensity: number;
  lightColor: string;
}

export interface SeatingParameters {
  overallWidth: number;        // default 1180 mm
  overallDepth: number;        // default 1500 mm
  overallHeight: number;       // default 780 mm

  seatWidth: number;           // default 620 mm
  seatDepth: number;           // default 500 mm
  seatHeight: number;          // default 420 mm

  backrestHeight: number;      // default 360 mm
  backrestAngle: number;       // default 20 deg

  seatCurvature: number;       // default 80 mm
  backCurvature: number;       // default 100 mm

  frontSupportHeight: number;  // default 420 mm
  rearSupportHeight: number;   // default 420 mm

  leftRightCurvature: number;  // default 40 mm
  topLipCurl: number;          // default 25 mm
  topFoldAngle: number;        // default 45 deg (backward fold facing ground)

  sheetThickness: number;      // default 1 mm
  materialType: MaterialType;
}

export interface PartitionParameters {
  panelWidth: number;          // Default 400 mm
  panelHeight: number;         // Default 550 mm
  panelDepth: number;          // Default 180 mm

  horizontalCurve: number;     // Default 120 mm
  verticalCurve: number;       // Default 90 mm

  topRadius: number;           // Default 40 mm
  bottomRadius: number;        // Default 40 mm

  columns: number;             // Default 4
  rows: number;                // Default 4

  columnSpacing: number;       // Default 480 mm
  rowSpacing: number;          // Default 520 mm

  rotationVariation: number;   // Default 15 deg
  depthVariation: number;      // Default 30 mm

  postRadius: number;          // Default 8 mm
  panelThickness: number;      // Default 2.0 mm
  materialType: MaterialType;  // Default 'custom' (copper/bronze)
  lightBulbs: boolean;         // Default true
}

export type Topology = 'revolved' | 'prismatic_assembly' | 'continuous_sheet';

export type ObjectType =
  | 'seating'
  | 'table'
  | 'lighting'
  | 'storage'
  | 'partition'
  | 'electronics'
  | 'container'
  | 'unknown';

export interface BaseComponentSpec {
  id?: string;
  role?: string;
}

export interface RevolvedComponentSpec extends BaseComponentSpec {
  type: 'revolved_body';
  height: number;
  baseRadius: number;
  waistRadius?: number;
  neckRadius?: number;
  profilePoints?: Array<{ yRatio: number; rRatio: number }>;
  wallThickness?: number;
  hasHandle?: boolean;
  handleWidth?: number;
  hasSpout?: boolean;
  spoutLength?: number;
  spoutAngle?: number;
  hasLid?: boolean;
  lidKnobRadius?: number;
}

export interface PrismaticSlabSpec extends BaseComponentSpec {
  type: 'prismatic_slab' | 'flat_sheet';
  dimensions: [number, number, number]; // [width, height/thickness, depth] in mm
  position?: [number, number, number]; // [x, y, z] center position in mm
  rotation?: [number, number, number]; // [rx, ry, rz] Euler angles in degrees
  cornerRadius?: number;
  color?: string;
}

export interface SupportLegsSpec extends BaseComponentSpec {
  type: 'support_legs' | 'legs';
  style: 'four_corner' | 'u_frame' | 'pedestal' | 'hairpin' | 'blade' | 'cantilever';
  count?: number;
  legHeight: number; // in mm
  legWidth?: number; // cross-section width in mm
  legDepth?: number; // cross-section depth in mm
  legRadius?: number; // for cylindrical legs in mm
  inset?: number; // inset distance from outer edges in mm
  angle?: number; // outward splay angle in degrees
  color?: string;
}

export interface BentSheetSpec extends BaseComponentSpec {
  type: 'bent_sheet';
  width: number; // extrusion / transverse width in mm
  thickness: number; // sheet gauge in mm (e.g. 1.5 - 3.0)
  // Ordered 2D profile points [x, y] in mm that will be extruded or swept
  profilePoints?: Array<[number, number]>;
  // Or parameterized bends
  bends?: Array<{
    segmentLength: number; // length of straight section in mm
    bendAngle: number; // bend angle in degrees
    bendRadius?: number; // inner bend radius in mm
  }>;
  extrusionDepth?: number; // in mm
  position?: [number, number, number]; // [x, y, z] in mm
  rotation?: [number, number, number]; // [rx, ry, rz] in degrees
  color?: string;
}

export interface CurvedSheetPanelSpec extends BaseComponentSpec {
  type: 'curved_sheet_panel' | 'side_panel';
  width: number; // in mm
  height: number; // in mm
  thickness: number; // in mm
  horizontalCurvature?: number; // sagittal arc depth in mm
  verticalCurvature?: number; // vertical arc depth in mm
  cornerRadius?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}

export interface FramePostSpec extends BaseComponentSpec {
  type: 'frame_post' | 'frame';
  height: number;
  radius?: number;
  width?: number;
  depth?: number;
  positions: Array<[number, number, number]>; // [x, y, z] in mm
  color?: string;
}

export interface CutoutSpec extends BaseComponentSpec {
  type: 'cutout';
  shape: 'rectangular' | 'circular' | 'pill' | 'polygon';
  size: [number, number]; // [width, height] in mm
  position: [number, number, number]; // [x, y, z] in mm
  normal?: [number, number, number]; // surface normal direction
}

export interface RepeatedModuleSpec extends BaseComponentSpec {
  type: 'repeated_module';
  rows: number;
  columns: number;
  rowSpacing: number; // in mm
  columnSpacing: number; // in mm
  module: CurvedSheetPanelSpec | PrismaticSlabSpec;
  stagger?: boolean;
  rotationVariation?: number; // in degrees
  depthVariation?: number; // in mm
}

export type ComponentSpec =
  | RevolvedComponentSpec
  | PrismaticSlabSpec
  | SupportLegsSpec
  | BentSheetSpec
  | CurvedSheetPanelSpec
  | FramePostSpec
  | CutoutSpec
  | RepeatedModuleSpec;

export interface GeometrySpec {
  topology: Topology;
  objectType: ObjectType;
  confidence: number;
  dimensions: {
    width: number; // in mm
    depth: number; // in mm
    height: number; // in mm
  };
  components: ComponentSpec[];
  materialType?: MaterialType;
  symmetry?: 'none' | 'bilateral' | 'rotational_y';
}

export interface MeshSubPart {
  type: 'box' | 'cylinder' | 'sphere' | 'lathe';
  size?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  profilePoints?: Array<{ yRatio: number; rRatio: number }>;
}

export interface SculpturalParameters {
  objectName: string;          // e.g. "Laptop with Screen Display"
  height: number;              // Height (mm), e.g., 500
  baseRadius: number;          // Base radius (mm), e.g., 120
  waistRadius: number;         // Waist radius (mm), e.g., 180
  neckRadius: number;          // Neck radius (mm), e.g., 80
  profilePoints?: Array<{ yRatio: number; rRatio: number }>; // Smooth vertical profile curve
  wallThickness: number;       // Sheet metal thickness (mm), e.g., 2.0
  hasHandle: boolean;          // Side handle feature
  handleWidth: number;         // Handle extension (mm)
  hasSpout?: boolean;          // Curved pouring spout feature
  spoutLength?: number;        // Spout length (mm)
  spoutAngle?: number;         // Upward angle (degrees)
  hasLid?: boolean;            // Top lid disc
  lidKnobRadius?: number;      // Spherical top handle knob radius (mm)
  materialType: MaterialType;  // Finish
  meshAssembly?: MeshSubPart[]; // Dynamic 3D part assembly array
  geometrySpec?: GeometrySpec; // Strongly typed semantic geometry specification
}

export interface ControlPoint3D {
  id: string;
  label: string;
  position: [number, number, number];
  category: 'spine' | 'front' | 'back';
}

export interface SeatingMeshOutput {
  geometry: THREE.BufferGeometry;
  boundingWidth: number;
  boundingDepth: number;
  boundingHeight: number;
  surfaceAreaMm2: number;
}

export interface DesignState {
  parameters: CanopyParameters;
  seatingParameters: SeatingParameters;
  partitionParameters: PartitionParameters;
  sculpturalParameters: SculpturalParameters;
  controlPoints: ControlPoint3D[];
  seatingControlPoints: ControlPoint3D[];
  selectedPointId: string | null;
  wireframe: boolean;
  showHandles: boolean;
  showReferenceOverlay: boolean;
  activeTab: 'parameters' | 'material' | 'lighting' | 'fabrication';
  theme: ThemeMode;
  activeCategory: ObjectCategory;
  isCategoryModalOpen: boolean;
  studioLightRotation: number;
  
  // Actions
  updateParameters: (params: Partial<CanopyParameters>) => void;
  updateSeatingParameters: (params: Partial<SeatingParameters>) => void;
  updatePartitionParameters: (params: Partial<PartitionParameters>) => void;
  updateSculpturalParameters: (params: Partial<SculpturalParameters>) => void;
  updateControlPoint: (id: string, position: [number, number, number]) => void;
  updateSeatingControlPoint: (id: string, position: [number, number, number]) => void;
  setSelectedPoint: (id: string | null) => void;
  setWireframe: (wireframe: boolean) => void;
  setShowHandles: (show: boolean) => void;
  setShowReferenceOverlay: (show: boolean) => void;
  setActiveTab: (tab: 'parameters' | 'material' | 'lighting' | 'fabrication') => void;
  setTheme: (theme: ThemeMode) => void;
  setActiveCategory: (category: ObjectCategory) => void;
  setIsCategoryModalOpen: (open: boolean) => void;
  setStudioLightRotation: (angle: number) => void;
  resetToDefaults: () => void;
}
