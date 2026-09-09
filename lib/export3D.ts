import * as THREE from 'three';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Convert THREE geometry / object hierarchy into FBX text format (pure JS solution)
function exportFBXText(sceneGroup: THREE.Object3D): string {
  const meshes: THREE.Mesh[] = [];
  sceneGroup.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      meshes.push(child as THREE.Mesh);
    }
  });

  let verticesStr = '';
  let polygonVertexIndexStr = '';
  let vertexOffset = 0;

  meshes.forEach((mesh) => {
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);
    const posAttr = geo.getAttribute('position');
    const indexAttr = geo.getIndex();

    if (posAttr) {
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);
        verticesStr += `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)},`;
      }

      if (indexAttr) {
        for (let i = 0; i < indexAttr.count; i += 3) {
          const a = indexAttr.getX(i) + vertexOffset;
          const b = indexAttr.getX(i + 1) + vertexOffset;
          const c = indexAttr.getX(i + 2) + vertexOffset;
          // FBX format uses XOR negative index for last vertex in polygon
          polygonVertexIndexStr += `${a},${b},${-c - 1},`;
        }
      } else {
        for (let i = 0; i < posAttr.count; i += 3) {
          const a = i + vertexOffset;
          const b = i + 1 + vertexOffset;
          const c = i + 2 + vertexOffset;
          polygonVertexIndexStr += `${a},${b},${-c - 1},`;
        }
      }
      vertexOffset += posAttr.count;
    }
  });

  return `; FBX 7.4.0 project export from Parametal Studio
FBXHeaderExtension:  {
  FBXHeaderVersion: 100800
  FBXVersion: 7400
}
Objects:  {
  Model: 1001, "Model::ParametalObject", "Mesh" {
    Vertices: *${vertexOffset * 3} {
      a: ${verticesStr.slice(0, -1)}
    }
    PolygonVertexIndex: *${polygonVertexIndexStr.split(',').length - 1} {
      a: ${polygonVertexIndexStr.slice(0, -1)}
    }
  }
}
`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportScene3D(targetInput: THREE.Object3D, format: 'obj' | 'fbx' | 'stl' | 'glb', objectName: string = 'parametal_design') {
  const safeName = objectName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'parametal_object';

  // Create a clean isolated group containing ONLY the metal design meshes (excluding floor planes, grid lines, lights, handles)
  const cleanExportGroup = new THREE.Group();

  targetInput.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const geoType = mesh.geometry?.type || '';

      // Exclude ground planes, studio receiver planes, grids, and gizmo handles
      const isGroundPlane = geoType === 'PlaneGeometry' || mesh.name.includes('Grid') || mesh.name.includes('Plane');
      const isGizmoHandle = mesh.name.includes('handle') || mesh.name.includes('gizmo') || geoType === 'OctahedronGeometry';

      if (!isGroundPlane && !isGizmoHandle) {
        const clonedMesh = mesh.clone();
        clonedMesh.applyMatrix4(mesh.matrixWorld);
        cleanExportGroup.add(clonedMesh);
      }
    }
  });

  if (format === 'obj') {
    const exporter = new OBJExporter();
    const result = exporter.parse(cleanExportGroup);
    const blob = new Blob([result], { type: 'text/plain' });
    triggerDownload(blob, `${safeName}.obj`);
    return;
  }

  if (format === 'stl') {
    const exporter = new STLExporter();
    const result = exporter.parse(cleanExportGroup, { binary: true });
    const blob = new Blob([result], { type: 'application/octet-stream' });
    triggerDownload(blob, `${safeName}.stl`);
    return;
  }

  if (format === 'glb') {
    const exporter = new GLTFExporter();
    exporter.parse(
      cleanExportGroup,
      (gltf) => {
        const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
        triggerDownload(blob, `${safeName}.glb`);
      },
      (error) => {
        console.error('GLB export error:', error);
      },
      { binary: true }
    );
    return;
  }

  if (format === 'fbx') {
    const fbxContent = exportFBXText(cleanExportGroup);
    const blob = new Blob([fbxContent], { type: 'text/plain' });
    triggerDownload(blob, `${safeName}.fbx`);
    return;
  }
}
