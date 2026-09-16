import { create } from 'zustand';
import * as THREE from 'three';
import { parse3DModelFile, ModelMetadata } from '../utils/modelParser';

export type CameraPreset = 'perspective' | 'front' | 'left' | 'right' | 'back' | 'top';
export type ViewMode = 'solid' | 'wireframe' | 'xray' | 'points';
export type MaterialOverride = 'original' | 'galvanized' | 'mild_steel' | 'aluminum' | 'obsidian_black' | 'gold';

export interface SkinItem {
  id: string;
  name: string;
  fileName: string;
  url: string;
  texture?: THREE.Texture;
  isCustom?: boolean;
}

interface StudioState {
  loadedModel: THREE.Group | null;
  metadata: ModelMetadata | null;
  initialScale: number;
  
  // Transform & Dimensions
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  uniformScale: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  
  // View & Render Config
  viewMode: ViewMode;
  materialOverride: MaterialOverride;
  showBoundingBox: boolean;
  showGrid: boolean;
  lightLevel: 'low' | 'med' | 'high';
  cameraPreset: CameraPreset;
  theme: 'dark' | 'light';

  // Sidebar Collapsibility
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;

  // Skin System
  appliedSkin: SkinItem | null;
  customSkins: SkinItem[];
  skinScale: number;

  // Processing & State
  isProcessing: boolean;
  processingMessage: string;
  errorMessage: string | null;
  isInitialUploadModalOpen: boolean;

  // Actions
  setLoadedModel: (model: THREE.Group | null, metadata: ModelMetadata | null, initialScale?: number) => void;
  loadModelFromFile: (file: File) => Promise<void>;
  loadSampleModel: (sampleId: string) => Promise<void>;
  addSkinFromFile: (file: File) => Promise<void>;
  applySkin: (skin: SkinItem | null) => void;
  removeSkin: (skinId: string) => void;
  setSkinScale: (v: number) => void;
  setScaleX: (v: number) => void;
  setScaleY: (v: number) => void;
  setScaleZ: (v: number) => void;
  setUniformScale: (v: number) => void;
  setRotationX: (v: number) => void;
  setRotationY: (v: number) => void;
  setRotationZ: (v: number) => void;
  setViewMode: (mode: ViewMode) => void;
  setMaterialOverride: (mat: MaterialOverride) => void;
  setShowBoundingBox: (v: boolean) => void;
  setShowGrid: (v: boolean) => void;
  setLightLevel: (level: 'low' | 'med' | 'high') => void;
  cycleLightLevel: () => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setInitialUploadModalOpen: (open: boolean) => void;
  resetTransform: () => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  loadedModel: null,
  metadata: null,
  initialScale: 1.0,

  scaleX: 1.0,
  scaleY: 1.0,
  scaleZ: 1.0,
  uniformScale: 1.0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,

  viewMode: 'solid',
  materialOverride: 'original',
  showBoundingBox: false,
  showGrid: true,
  lightLevel: 'med',
  cameraPreset: 'perspective',
  theme: 'light',

  leftSidebarOpen: true,
  rightSidebarOpen: true,

  appliedSkin: null,
  customSkins: [],
  skinScale: 1.0,

  isProcessing: false,
  processingMessage: '',
  errorMessage: null,
  isInitialUploadModalOpen: true,

  setInitialUploadModalOpen: (open: boolean) => set({ isInitialUploadModalOpen: open }),

  setLoadedModel: (model, metadata, initialScale = 1.0) => {
    set({
      loadedModel: model,
      metadata,
      initialScale,
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
      uniformScale: 1.0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      errorMessage: null,
      isInitialUploadModalOpen: false,
    });
  },

  loadModelFromFile: async (file: File) => {
    set({ isProcessing: true, processingMessage: `Parsing ${file.name}...`, errorMessage: null });
    try {
      const result = await parse3DModelFile(file);
      set({
        loadedModel: result.object,
        metadata: result.metadata,
        initialScale: result.initialScale,
        scaleX: 1.0,
        scaleY: 1.0,
        scaleZ: 1.0,
        uniformScale: 1.0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        isProcessing: false,
        processingMessage: '',
        isInitialUploadModalOpen: false,
      });
    } catch (err: any) {
      console.error('Failed to parse 3D file:', err);
      set({
        isProcessing: false,
        processingMessage: '',
        errorMessage: err.message || 'Failed to parse 3D model file.',
      });
    }
  },

  loadSampleModel: async (sampleId: string) => {
    set({ isProcessing: true, processingMessage: 'Generating sample 3D CAD mesh...', errorMessage: null });
    try {
      const group = new THREE.Group();
      group.name = `Sample_${sampleId}`;

      let geometry: THREE.BufferGeometry;
      if (sampleId === 'bracket') {
        geometry = new THREE.BoxGeometry(1.2, 1.6, 0.8, 12, 16, 8);
      } else if (sampleId === 'cylinder') {
        geometry = new THREE.CylinderGeometry(0.6, 0.6, 1.4, 32, 16);
      } else {
        geometry = new THREE.TorusGeometry(0.8, 0.24, 32, 64);
      }

      geometry.computeVertexNormals();
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x909094,
        metalness: 0.9,
        roughness: 0.18,
        clearcoat: 0.8,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      const bbox = new THREE.Box3().setFromObject(group);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      mesh.position.y -= bbox.min.y; // ground

      const metadata: ModelMetadata = {
        fileName: `${sampleId}_cad_template.obj`,
        fileSize: 48500,
        format: 'OBJ',
        vertexCount: geometry.attributes.position ? geometry.attributes.position.count : 0,
        triangleCount: geometry.index ? geometry.index.count / 3 : (geometry.attributes.position?.count || 0) / 3,
        meshCount: 1,
        dimensions: {
          width: Math.round(size.x * 100) / 100,
          height: Math.round(size.y * 100) / 100,
          depth: Math.round(size.z * 100) / 100,
        },
        center: { x: 0, y: Math.round(size.y / 2 * 100) / 100, z: 0 },
      };

      set({
        loadedModel: group,
        metadata,
        initialScale: 1.0,
        scaleX: 1.0,
        scaleY: 1.0,
        scaleZ: 1.0,
        uniformScale: 1.0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        isProcessing: false,
        processingMessage: '',
        isInitialUploadModalOpen: false,
      });
    } catch (err: any) {
      set({ isProcessing: false, errorMessage: err.message });
    }
  },

  addSkinFromFile: async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const loader = new THREE.TextureLoader();

      loader.load(
        objectUrl,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.needsUpdate = true;

          const newSkin: SkinItem = {
            id: `skin_${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            fileName: file.name,
            url: objectUrl,
            texture,
            isCustom: true,
          };

          const currentSkins = get().customSkins;
          set({
            customSkins: [newSkin, ...currentSkins],
            appliedSkin: newSkin,
            materialOverride: 'original',
          });
          resolve();
        },
        undefined,
        (error) => {
          console.error('Failed to load texture skin:', error);
          reject(error);
        }
      );
    });
  },

  applySkin: (skin: SkinItem | null) => {
    set({ appliedSkin: skin });
  },

  removeSkin: (skinId: string) => {
    const { appliedSkin, customSkins } = get();
    const updated = customSkins.filter((s) => s.id !== skinId);
    set({
      customSkins: updated,
      appliedSkin: appliedSkin?.id === skinId ? null : appliedSkin,
    });
  },

  setSkinScale: (v) => set({ skinScale: v }),
  setScaleX: (v) => set({ scaleX: v }),
  setScaleY: (v) => set({ scaleY: v }),
  setScaleZ: (v) => set({ scaleZ: v }),
  setUniformScale: (v) => set({ uniformScale: v }),
  setRotationX: (v) => set({ rotationX: v }),
  setRotationY: (v) => set({ rotationY: v }),
  setRotationZ: (v) => set({ rotationZ: v }),
  setViewMode: (viewMode) => set({ viewMode }),
  setMaterialOverride: (materialOverride) => set({ materialOverride, appliedSkin: null }),
  setShowBoundingBox: (showBoundingBox) => set({ showBoundingBox }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setLightLevel: (lightLevel) => set({ lightLevel }),
  cycleLightLevel: () => {
    const current = get().lightLevel;
    const next = current === 'low' ? 'med' : current === 'med' ? 'high' : 'low';
    set({ lightLevel: next });
  },
  setCameraPreset: (cameraPreset) => set({ cameraPreset }),
  setTheme: (theme) => set({ theme }),
  setLeftSidebarOpen: (leftSidebarOpen) => set({ leftSidebarOpen }),
  setRightSidebarOpen: (rightSidebarOpen) => set({ rightSidebarOpen }),
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
  resetTransform: () => set({
    scaleX: 1.0,
    scaleY: 1.0,
    scaleZ: 1.0,
    uniformScale: 1.0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    materialOverride: 'original',
    appliedSkin: null,
    viewMode: 'solid',
  }),
}));
