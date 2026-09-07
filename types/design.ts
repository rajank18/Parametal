import * as THREE from 'three';

export type MaterialType = 'galvanized' | 'mild_steel' | 'aluminum' | 'custom';
export type ThemeMode = 'dark' | 'light';
export type ObjectCategory = 'lamp' | 'seating' | 'table' | 'storage' | 'partition' | 'wall_mounted';

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
  controlPoints: ControlPoint3D[];
  seatingControlPoints: ControlPoint3D[];
  selectedPointId: string | null;
  wireframe: boolean;
  showHandles: boolean;
  showReferenceOverlay: boolean;
  activeTab: 'parameters' | 'material' | 'lighting' | 'fabrication';
  theme: ThemeMode;
  activeCategory: ObjectCategory;
  studioLightRotation: number;
  
  // Actions
  updateParameters: (params: Partial<CanopyParameters>) => void;
  updateSeatingParameters: (params: Partial<SeatingParameters>) => void;
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
