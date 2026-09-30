import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CatBreed, CatState } from '../types';

interface Cat3DCanvasProps {
  state: CatState;
  facing: 'left' | 'right';
  isPurring: boolean;
  selectedBreed?: CatBreed;
  onPet?: () => void;
  width?: number;
  height?: number;
  className?: string;
  enableControls?: boolean;
}

export const Cat3DCanvas: React.FC<Cat3DCanvasProps> = ({
  state,
  facing,
  isPurring,
  selectedBreed = 'orange_tabby',
  onPet,
  width = 160,
  height = 140,
  className = '',
  enableControls = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const catModelRef = useRef<THREE.Group | null>(null);
  const originalGeometriesRef = useRef<Map<THREE.BufferGeometry, Float32Array>>(new Map());
  
  const [isLoaded, setIsLoaded] = useState(false);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());

  // Breed color overrides
  const getBreedColors = (breed: CatBreed) => {
    switch (breed) {
      case 'tuxedo':
        return { base: 0x1e293b, belly: 0xf8fafc };
      case 'calico':
        return { base: 0xf59e0b, belly: 0xf8fafc };
      case 'void_black':
        return { base: 0x0f172a, belly: 0x334155 };
      case 'snow_white':
        return { base: 0xf1f5f9, belly: 0xffffff };
      case 'orange_tabby':
      default:
        return { base: 0xea580c, belly: 0xfef3c7 };
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 5, 26);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Lighting - tuned for low-poly faceted shading
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(12, 18, 15);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x67e8f9, 1.2);
    rimLight.position.set(-15, 10, -12);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xfef08a, 0.8);
    fillLight.position.set(0, -10, 10);
    scene.add(fillLight);

    // 5. Load the genuine Poly Pizza GLB 3D Model
    const loader = new GLTFLoader();
    const modelUrl = '/models/cat.glb';

    loader.load(
      modelUrl,
      (gltf) => {
        const cat = gltf.scene;
        catModelRef.current = cat;

        // Auto-center and normalize size
        const box = new THREE.Box3().setFromObject(cat);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 14 / (maxDim || 1);

        cat.scale.set(scale, scale, scale);
        cat.position.set(-center.x * scale, -center.y * scale - 1.5, -center.z * scale);

        // Enhance low-poly aesthetic with flat shading & high-specular materials
        cat.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const geom = mesh.geometry;
            if (geom && !originalGeometriesRef.current.has(geom)) {
              originalGeometriesRef.current.set(
                geom,
                new Float32Array(geom.attributes.position.array)
              );
            }

            if (mesh.material) {
              const oldMat = mesh.material as THREE.MeshStandardMaterial;
              const newMat = new THREE.MeshStandardMaterial({
                map: oldMat.map || null,
                roughness: 0.45,
                metalness: 0.1,
                flatShading: true,
              });
              mesh.material = newMat;
            }
          }
        });

        scene.add(cat);
        setIsLoaded(true);
      },
      undefined,
      (error) => {
        console.warn('Could not load /models/cat.glb directly, building procedural low-poly cat mesh fallback', error);
        // Fallback procedural low-poly 3D cat mesh in Three.js
        const group = new THREE.Group();
        
        // Body (Faceted Dodecahedron / Box)
        const bodyGeom = new THREE.BoxGeometry(7, 5, 8, 2, 2, 2);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0xea580c,
          flatShading: true,
          roughness: 0.4,
        });
        const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        bodyMesh.position.set(0, 0, 0);
        group.add(bodyMesh);

        // Head
        const headGeom = new THREE.BoxGeometry(4.5, 4, 4.5, 2, 2, 2);
        const headMat = new THREE.MeshStandardMaterial({
          color: 0xf97316,
          flatShading: true,
          roughness: 0.4,
        });
        const headMesh = new THREE.Mesh(headGeom, headMat);
        headMesh.position.set(0, 2.5, 4.2);
        group.add(headMesh);

        // Ears
        const earGeom = new THREE.ConeGeometry(1.2, 2, 4);
        const earMat = new THREE.MeshStandardMaterial({
          color: 0xea580c,
          flatShading: true,
        });
        const leftEar = new THREE.Mesh(earGeom, earMat);
        leftEar.position.set(-1.4, 5, 4);
        leftEar.rotation.z = 0.2;
        group.add(leftEar);

        const rightEar = new THREE.Mesh(earGeom, earMat);
        rightEar.position.set(1.4, 5, 4);
        rightEar.rotation.z = -0.2;
        group.add(rightEar);

        // Tail
        const tailGeom = new THREE.CylinderGeometry(0.5, 0.7, 5, 5);
        const tailMesh = new THREE.Mesh(tailGeom, bodyMat);
        tailMesh.position.set(0, 2.5, -4.5);
        tailMesh.rotation.x = -0.8;
        group.add(tailMesh);

        catModelRef.current = group;
        scene.add(group);
        setIsLoaded(true);
      }
    );

    // 6. Animation render loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clockRef.current.getElapsedTime();

      if (catModelRef.current) {
        const cat = catModelRef.current;

        // Base orientation based on facing direction
        const targetYaw = facing === 'left' ? -Math.PI * 0.45 : Math.PI * 0.45;
        
        // Mouse follow look-at interpolation
        const lookX = mouseTargetRef.current.x * 0.35;
        const lookY = mouseTargetRef.current.y * 0.25;

        // Dynamic 3D geometry animations per state
        switch (state) {
          case 'stalk':
          case 'pounce': {
            // 3D stalking/pouncing bob and body sway
            const walkSpeed = state === 'pounce' ? 14 : 8;
            cat.rotation.y = THREE.MathUtils.lerp(cat.rotation.y, targetYaw + Math.sin(elapsedTime * walkSpeed) * 0.15 + lookX, 0.1);
            cat.rotation.z = Math.sin(elapsedTime * walkSpeed) * 0.08;
            cat.rotation.x = Math.abs(Math.sin(elapsedTime * walkSpeed)) * 0.08 - lookY;
            cat.position.y = Math.abs(Math.sin(elapsedTime * walkSpeed)) * 0.6 - 1.5;
            cat.scale.set(1, 1, 1);
            break;
          }

          case 'groom': {
            // Cat grooming motion with head tilt
            cat.rotation.y = THREE.MathUtils.lerp(cat.rotation.y, targetYaw * 0.7 + Math.sin(elapsedTime * 6) * 0.1, 0.1);
            cat.rotation.x = 0.2 + Math.sin(elapsedTime * 6) * 0.08;
            cat.rotation.z = Math.sin(elapsedTime * 4) * 0.05;
            cat.scale.set(1, 0.96, 1);
            break;
          }

          case 'sleep': {
            // Sleeping curled pose with rhythmic deep breathing
            cat.rotation.y = THREE.MathUtils.lerp(cat.rotation.y, targetYaw * 0.6, 0.08);
            cat.rotation.x = THREE.MathUtils.lerp(cat.rotation.x, 0.2, 0.08);
            cat.rotation.z = THREE.MathUtils.lerp(cat.rotation.z, 0.35, 0.08);
            const breath = 1 + Math.sin(elapsedTime * 1.8) * 0.05;
            cat.scale.set(breath, breath * 0.92, breath);
            cat.position.y = -2.2;
            break;
          }

          case 'loaf': {
            // Cozy bread loaf tucked pose
            cat.rotation.y = THREE.MathUtils.lerp(cat.rotation.y, targetYaw * 0.8 + lookX, 0.08);
            cat.rotation.x = THREE.MathUtils.lerp(cat.rotation.x, -lookY * 0.5, 0.08);
            cat.rotation.z = 0;
            const loafBreath = 1 + Math.sin(elapsedTime * 2.5) * 0.03;
            cat.scale.set(loafBreath * 1.05, loafBreath * 0.95, loafBreath * 1.02);
            cat.position.y = -1.8;
            break;
          }

          case 'purr':
          default: {
            // Sitting and purring with happy squash & stretch wobble
            const purrBounce = isPurring ? Math.sin(elapsedTime * 24) * 0.06 : 0;
            const idleBreath = Math.sin(elapsedTime * 3) * 0.03;
            
            cat.rotation.y = THREE.MathUtils.lerp(cat.rotation.y, targetYaw + lookX, 0.1);
            cat.rotation.x = THREE.MathUtils.lerp(cat.rotation.x, -lookY + idleBreath, 0.1);
            cat.rotation.z = isPurring ? Math.sin(elapsedTime * 20) * 0.04 : 0;

            const squash = isPurring ? 1 + purrBounce : 1 + idleBreath;
            cat.scale.set(squash * 1.02, (2 - squash) * 0.98, squash);
            cat.position.y = isPurring ? -1.3 + Math.abs(Math.sin(elapsedTime * 12)) * 0.3 : -1.5;
            break;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [width, height]);

  // Update breed material colors dynamically
  useEffect(() => {
    if (!catModelRef.current) return;
    const colors = getBreedColors(selectedBreed);
    catModelRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).color) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (!mat.map) {
            mat.color.setHex(colors.base);
          }
        }
      }
    });
  }, [selectedBreed, isLoaded]);

  // Mouse move / look tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableControls) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseTargetRef.current = { x, y };

    if (isDraggingRef.current && catModelRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      catModelRef.current.rotation.y += deltaX * 0.02;
      catModelRef.current.rotation.x += deltaY * 0.02;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    mouseTargetRef.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={mountRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`relative cursor-grab active:cursor-grabbing select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        // Only trigger pet if it was a quick click rather than a drag
        if (onPet) onPet();
      }}
      title="3D Low-Poly Cat (GLB) — Drag to rotate 3D, Click to pet!"
    />
  );
};
