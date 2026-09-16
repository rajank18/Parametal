import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export interface ModelMetadata {
  fileName: string;
  fileSize: number;
  format: string;
  vertexCount: number;
  triangleCount: number;
  meshCount: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  center: {
    x: number;
    y: number;
    z: number;
  };
}

export interface ParseResult {
  object: THREE.Group;
  metadata: ModelMetadata;
  initialScale: number;
}

/**
 * Universal 3D Model Parser Supporting OBJ, STL, GLB/GLTF, FBX, PLY and generic CAD formats.
 */
export async function parse3DModelFile(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const buffer = await file.arrayBuffer();

  let rootObject: THREE.Object3D;

  switch (extension) {
    case 'obj': {
      const text = new TextDecoder().decode(buffer);
      const loader = new OBJLoader();
      rootObject = loader.parse(text);
      break;
    }

    case 'stl': {
      const loader = new STLLoader();
      const geometry = loader.parse(buffer);
      geometry.computeVertexNormals();
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x909090,
        metalness: 0.85,
        roughness: 0.25,
        clearcoat: 0.3,
        side: THREE.DoubleSide,
      });
      rootObject = new THREE.Mesh(geometry, material);
      break;
    }

    case 'glb':
    case 'gltf': {
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
      loader.setDRACOLoader(dracoLoader);

      const gltf = await new Promise<any>((resolve, reject) => {
        loader.parse(buffer, '', resolve, reject);
      });
      rootObject = gltf.scene || gltf.scenes[0];
      break;
    }

    case 'fbx': {
      const loader = new FBXLoader();
      rootObject = loader.parse(buffer, '');
      break;
    }

    case 'ply': {
      const loader = new PLYLoader();
      const geometry = loader.parse(buffer);
      geometry.computeVertexNormals();
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x999999,
        metalness: 0.8,
        roughness: 0.3,
        side: THREE.DoubleSide,
      });
      rootObject = new THREE.Mesh(geometry, material);
      break;
    }

    default: {
      // Fallback: try parsing as OBJ or STL
      try {
        const text = new TextDecoder().decode(buffer);
        if (text.includes('v ') && text.includes('f ')) {
          const loader = new OBJLoader();
          rootObject = loader.parse(text);
        } else {
          const loader = new STLLoader();
          const geometry = loader.parse(buffer);
          geometry.computeVertexNormals();
          rootObject = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ color: 0x888888 }));
        }
      } catch (err) {
        throw new Error(`Unsupported 3D file format: .${extension}. Supported: .obj, .stl, .glb, .gltf, .fbx, .ply`);
      }
    }
  }

  // Wrap in a clean Group
  const modelGroup = new THREE.Group();
  modelGroup.name = 'UserLoadedModel';
  modelGroup.add(rootObject);

  // Traverse all child meshes to ensure proper normals, shadows, and materials
  let vertexCount = 0;
  let triangleCount = 0;
  let meshCount = 0;

  modelGroup.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      meshCount++;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const geometry = mesh.geometry;
      if (geometry) {
        if (!geometry.attributes.normal) {
          geometry.computeVertexNormals();
        }

        if (geometry.attributes.position) {
          vertexCount += geometry.attributes.position.count;
        }

        if (geometry.index) {
          triangleCount += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          triangleCount += geometry.attributes.position.count / 3;
        }
      }

      // Upgrade basic materials to Physical Materials for photorealistic metal shading
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            mat.side = THREE.DoubleSide;
          });
        } else {
          mesh.material.side = THREE.DoubleSide;
        }
      } else {
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: 0x9a9a9e,
          metalness: 0.85,
          roughness: 0.22,
          clearcoat: 0.5,
          side: THREE.DoubleSide,
        });
      }
    }
  });

  // Compute precise bounding box and dimensions
  const bbox = new THREE.Box3().setFromObject(modelGroup);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const center = new THREE.Vector3();
  bbox.getCenter(center);

  // Normalize centering: shift rootObject so that (center.x=0, min.y=0, center.z=0)
  rootObject.position.x -= center.x;
  rootObject.position.y -= bbox.min.y; // Keep model grounded directly at Y=0 on the floor grid
  rootObject.position.z -= center.z;

  // Determine an ideal initial scale so the model fits comfortably in the viewport camera
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  let initialScale = 1.0;
  if (maxDim > 100) {
    // Model is likely in millimeters (e.g. 500mm -> scale to ~1.5 units)
    initialScale = 1.5 / maxDim;
  } else if (maxDim < 0.1) {
    // Model is very small (e.g. in meters)
    initialScale = 1.5 / maxDim;
  } else {
    initialScale = 1.5 / maxDim;
  }

  const metadata: ModelMetadata = {
    fileName: file.name,
    fileSize: file.size,
    format: extension.toUpperCase(),
    vertexCount,
    triangleCount: Math.round(triangleCount),
    meshCount,
    dimensions: {
      width: Math.round(size.x * 100) / 100,
      height: Math.round(size.y * 100) / 100,
      depth: Math.round(size.z * 100) / 100,
    },
    center: {
      x: Math.round(center.x * 100) / 100,
      y: Math.round(center.y * 100) / 100,
      z: Math.round(center.z * 100) / 100,
    },
  };

  return {
    object: modelGroup,
    metadata,
    initialScale,
  };
}
