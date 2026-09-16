import { StudioEditor } from '../../components/studio/StudioEditor';

export const metadata = {
  title: '3D Studio | Parametal - Universal 3D Model Viewer & CAD Engine',
  description: 'Upload, inspect, transform, and export any 3D model file (.OBJ, .STL, .GLB, .FBX, .PLY) with precision CAD controls.',
};

export default function StudioPage() {
  return <StudioEditor />;
}
