import { create } from 'zustand';
import { CanopyParameters, SeatingParameters, PartitionParameters, ControlPoint3D, DesignState, ObjectCategory, ThemeMode } from '../types/design';
import { buildControlPointGrid } from '../geometry/curves';
import { buildSeatingControlPoints } from '../geometry/seating';

export type CameraPreset = 'perspective' | 'front' | 'back' | 'left' | 'right' | 'top';

export interface ExtendedDesignState extends DesignState {
    cameraPreset: CameraPreset;
    setCameraPreset: (preset: CameraPreset) => void;
    moveControlPointWithFalloff: (id: string, newPos: [number, number, number]) => void;
}

export const DEFAULT_CANOPY_PARAMETERS: CanopyParameters = {
    width: 700,
    depth: 450,
    height: 1325,
    leftTipHeight: 1260,
    rightTipHeight: 1090,
    centerHeight: 1335,
    frontCurvature: 1.0,
    backCurvature: 1.0,
    curveDepth: 50,
    cornerRadius: 15,
    thickness: 1.0,
    materialType: 'galvanized',
    lightIntensity: 70,
    lightColor: '#ffeaad',
};

export const DEFAULT_SEATING_PARAMETERS: SeatingParameters = {
    overallWidth: 940,
    overallDepth: 1500,
    overallHeight: 920,

    seatWidth: 620,
    seatDepth: 500,
    seatHeight: 420,

    backrestHeight: 450,
    backrestAngle: 20,

    seatCurvature: 80,
    backCurvature: 200,

    frontSupportHeight: 420,
    rearSupportHeight: 420,

    leftRightCurvature: 10,
    topLipCurl: 25,
    topFoldAngle: 45,

    sheetThickness: 1,
    materialType: 'galvanized',
};

export const DEFAULT_PARTITION_PARAMETERS: PartitionParameters = {
    panelWidth: 400,
    panelHeight: 550,
    panelDepth: 180,

    horizontalCurve: 120,
    verticalCurve: 90,

    topRadius: 40,
    bottomRadius: 40,

    columns: 4,
    rows: 4,

    columnSpacing: 480,
    rowSpacing: 520,

    rotationVariation: 15,
    depthVariation: 30,

    postRadius: 8,
    panelThickness: 2.0,
    materialType: 'custom',
    lightBulbs: true,
};

export const useDesignStore = create<ExtendedDesignState>((set, get) => ({
    parameters: { ...DEFAULT_CANOPY_PARAMETERS },
    seatingParameters: { ...DEFAULT_SEATING_PARAMETERS },
    partitionParameters: { ...DEFAULT_PARTITION_PARAMETERS },
    controlPoints: buildControlPointGrid(DEFAULT_CANOPY_PARAMETERS),
    seatingControlPoints: buildSeatingControlPoints(DEFAULT_SEATING_PARAMETERS),
    selectedPointId: null,
    wireframe: false,
    showHandles: false,
    showReferenceOverlay: false,
    activeTab: 'parameters',
    theme: 'light',
    activeCategory: 'lamp',
    isCategoryModalOpen: true,
    cameraPreset: 'perspective',
    studioLightRotation: 45,

    updateParameters: (newParams: Partial<CanopyParameters>) => {
        set((state) => {
            const updatedParams = { ...state.parameters, ...newParams };
            const updatedPoints = buildControlPointGrid(updatedParams);
            return {
                parameters: updatedParams,
                controlPoints: updatedPoints,
            };
        });
    },

    updateSeatingParameters: (newParams: Partial<SeatingParameters>) => {
        set((state) => {
            const updatedParams = { ...state.seatingParameters, ...newParams };
            const updatedPoints = buildSeatingControlPoints(updatedParams);
            return {
                seatingParameters: updatedParams,
                seatingControlPoints: updatedPoints,
            };
        });
    },

    updatePartitionParameters: (newParams: Partial<PartitionParameters>) => {
        set((state) => ({
            partitionParameters: { ...state.partitionParameters, ...newParams },
        }));
    },

    updateControlPoint: (id: string, position: [number, number, number]) => {
        set((state) => {
            const updatedPoints = state.controlPoints.map((pt) =>
                pt.id === id ? { ...pt, position } : pt
            );
            return { controlPoints: updatedPoints };
        });
    },

    updateSeatingControlPoint: (id: string, position: [number, number, number]) => {
        set((state) => {
            const updatedPoints = state.seatingControlPoints.map((pt) =>
                pt.id === id ? { ...pt, position } : pt
            );
            return { seatingControlPoints: updatedPoints };
        });
    },

    moveControlPointWithFalloff: (id: string, newPos: [number, number, number]) => {
        set((state) => {
            const isSeating = state.activeCategory === 'seating';
            const pointsList = isSeating ? state.seatingControlPoints : state.controlPoints;

            const targetPoint = pointsList.find((p) => p.id === id);
            if (!targetPoint) return state;

            const deltaX = newPos[0] - targetPoint.position[0];
            const deltaY = newPos[1] - targetPoint.position[1];
            const deltaZ = newPos[2] - targetPoint.position[2];

            const radius = 350;

            const updatedPoints = pointsList.map((pt) => {
                if (pt.id === id) return { ...pt, position: newPos };

                const dx = pt.position[0] - targetPoint.position[0];
                const dy = pt.position[1] - targetPoint.position[1];
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist >= radius) return pt;

                const t = dist / radius;
                const falloff = 0.5 * (1 + Math.cos(Math.PI * t));

                return {
                    ...pt,
                    position: [
                        pt.position[0] + deltaX * falloff * 0.5,
                        pt.position[1] + deltaY * falloff * 0.5,
                        pt.position[2] + deltaZ * falloff,
                    ] as [number, number, number],
                };
            });

            return isSeating
                ? { seatingControlPoints: updatedPoints }
                : { controlPoints: updatedPoints };
        });
    },

    setSelectedPoint: (id: string | null) => set({ selectedPointId: id }),
    setWireframe: (wireframe: boolean) => set({ wireframe }),
    setShowHandles: (showHandles: boolean) => set({ showHandles }),
    setShowReferenceOverlay: (showReferenceOverlay: boolean) => set({ showReferenceOverlay }),
    setActiveTab: (activeTab) => set({ activeTab }),
    setTheme: (theme: ThemeMode) => set({ theme }),
    setActiveCategory: (category: ObjectCategory) => set({ activeCategory: category }),
    setIsCategoryModalOpen: (isCategoryModalOpen: boolean) => set({ isCategoryModalOpen }),
    setCameraPreset: (cameraPreset: CameraPreset) => set({ cameraPreset }),
    setStudioLightRotation: (studioLightRotation: number) => set({ studioLightRotation }),

    resetToDefaults: () => {
        set({
            parameters: { ...DEFAULT_CANOPY_PARAMETERS },
            seatingParameters: { ...DEFAULT_SEATING_PARAMETERS },
            controlPoints: buildControlPointGrid(DEFAULT_CANOPY_PARAMETERS),
            seatingControlPoints: buildSeatingControlPoints(DEFAULT_SEATING_PARAMETERS),
            selectedPointId: null,
            wireframe: false,
            showHandles: false,
        });
    },
}));
