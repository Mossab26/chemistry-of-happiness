import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type RobotState = 'idle' | 'listening' | 'processing' | 'speaking' | 'happy' | 'error' | 'muted';

interface RobotMascotProps {
  state: RobotState;
  isMuted?: boolean;
  onInteract?: () => void;
  className?: string;
}

export const RobotMascot: React.FC<RobotMascotProps> = ({
  state = 'idle',
  isMuted = false,
  onInteract,
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const stateRef = useRef<RobotState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      console.warn('WebGL not available for 3D robot, falling back to SVG/CSS animation', e);
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

    // Ambient and Directional Lights with warm academic tone
    const ambientLight = new THREE.AmbientLight(0x231710, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfef3c7, 2.6);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const goldGlowLight = new THREE.PointLight(0xc5a059, 3.2, 8);
    goldGlowLight.position.set(0, 0.3, 2);
    scene.add(goldGlowLight);

    const rimLight = new THREE.PointLight(0x78350f, 2, 6);
    rimLight.position.set(-3, -1, -2);
    scene.add(rimLight);

    // Root Robot Group
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    // Luxury Academic Materials: Rich dark brown metal, antique brushed gold
    const darkBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1c130e,
      roughness: 0.3,
      metalness: 0.85,
    });

    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x0c0705,
      roughness: 0.1,
      metalness: 0.95,
    });

    // Luminous Antique Gold LED Eyes
    const goldEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      emissive: 0xe5c158,
      emissiveIntensity: 2.3,
      roughness: 0.2,
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      roughness: 0.35,
      metalness: 0.9,
    });

    // 1. Robot Head (Dark rounded pod)
    const headGroup = new THREE.Group();
    robotGroup.add(headGroup);

    const headGeo = new THREE.SphereGeometry(1.05, 36, 36);
    headGeo.scale(1.15, 1, 1);
    const headMesh = new THREE.Mesh(headGeo, darkBodyMat);
    headGroup.add(headMesh);

    // Visor Face
    const visorGeo = new THREE.SphereGeometry(0.98, 32, 32);
    visorGeo.scale(1.08, 0.88, 0.9);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.05, 0.2);
    headGroup.add(visorMesh);

    // Eyes (Expressive Antique Gold LEDs)
    const eyeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 24);
    eyeGeo.rotateX(Math.PI / 2);

    const leftEye = new THREE.Mesh(eyeGeo, goldEmissiveMat);
    leftEye.position.set(-0.42, 0.12, 1.05);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, goldEmissiveMat);
    rightEye.position.set(0.42, 0.12, 1.05);
    headGroup.add(rightEye);

    // Eye Pupils / Highlights
    const pupilGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.4, 0.16, 1.1);
    headGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.44, 0.16, 1.1);
    headGroup.add(rightPupil);

    // Mouth sound wave bar (reactive during speech)
    const mouthGeo = new THREE.BoxGeometry(0.35, 0.04, 0.05);
    const mouthMesh = new THREE.Mesh(mouthGeo, goldEmissiveMat);
    mouthMesh.position.set(0, -0.22, 1.05);
    headGroup.add(mouthMesh);

    // Cute Headphones / Earcups in Antique Gold
    const earcupGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 28);
    earcupGeo.rotateZ(Math.PI / 2);

    const leftEarcup = new THREE.Mesh(earcupGeo, goldAccentMat);
    leftEarcup.position.set(-1.26, 0.05, 0);
    headGroup.add(leftEarcup);

    const rightEarcup = new THREE.Mesh(earcupGeo, goldAccentMat);
    rightEarcup.position.set(1.26, 0.05, 0);
    headGroup.add(rightEarcup);

    // Gold glowing ring on earcups
    const ringGeo = new THREE.TorusGeometry(0.26, 0.04, 16, 32);
    ringGeo.rotateY(Math.PI / 2);

    const leftRing = new THREE.Mesh(ringGeo, goldEmissiveMat);
    leftRing.position.set(-1.42, 0.05, 0);
    headGroup.add(leftRing);

    const rightRing = new THREE.Mesh(ringGeo, goldEmissiveMat);
    rightRing.position.set(1.42, 0.05, 0);
    headGroup.add(rightRing);

    // Headband
    const bandCurve = new THREE.EllipseCurve(0, 0, 1.25, 1.25, 0, Math.PI, false, 0);
    const bandPoints = bandCurve.getPoints(30);
    const bandGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(bandPoints.map(p => new THREE.Vector3(p.x, p.y, 0))),
      30,
      0.08,
      8,
      false
    );
    const bandMesh = new THREE.Mesh(bandGeo, darkBodyMat);
    bandMesh.position.set(0, 0.05, 0);
    headGroup.add(bandMesh);

    // 2. Robot Body (Floating base pod)
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, -1.25, 0);
    robotGroup.add(bodyGroup);

    const torsoGeo = new THREE.CylinderGeometry(0.65, 0.45, 0.8, 32);
    const torsoMesh = new THREE.Mesh(torsoGeo, darkBodyMat);
    bodyGroup.add(torsoMesh);

    // Chest Emblem / Chemistry of Happiness Reactor
    const reactorGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 24);
    reactorGeo.rotateX(Math.PI / 2);
    const reactorMesh = new THREE.Mesh(reactorGeo, goldEmissiveMat);
    reactorMesh.position.set(0, 0.05, 0.58);
    bodyGroup.add(reactorMesh);

    // Floating halo ring under body
    const haloGeo = new THREE.TorusGeometry(0.7, 0.03, 16, 40);
    haloGeo.rotateX(Math.PI / 2);
    const haloMesh = new THREE.Mesh(haloGeo, goldEmissiveMat);
    haloMesh.position.set(0, -0.6, 0);
    bodyGroup.add(haloMesh);

    // Mouse Tracking
    let targetRotX = 0;
    let targetRotY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.4;
      targetRotX = -y * 0.3;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Gentle floating oscillation
      robotGroup.position.y = Math.sin(elapsed * 2) * 0.1;
      robotGroup.rotation.z = Math.sin(elapsed * 1.5) * 0.03;

      // Smooth mouse follow
      headGroup.rotation.y += (targetRotY - headGroup.rotation.y) * 0.08;
      headGroup.rotation.x += (targetRotX - headGroup.rotation.x) * 0.08;

      // Ring rotation
      haloMesh.rotation.z = elapsed * 1.5;

      // State-specific procedural animations
      switch (currentState) {
        case 'listening': {
          goldEmissiveMat.emissiveIntensity = 3.2 + Math.sin(elapsed * 8) * 1.0;
          goldEmissiveMat.emissive.setHex(0xfde047);
          leftEye.scale.set(1.2, 1.2, 1);
          rightEye.scale.set(1.2, 1.2, 1);
          mouthMesh.scale.set(1, 1, 1);
          break;
        }
        case 'processing': {
          goldEmissiveMat.emissiveIntensity = 2.2 + Math.sin(elapsed * 12) * 1.5;
          goldEmissiveMat.emissive.setHex(0xd97706); // Amber thinking glow
          leftEye.scale.set(0.9 + Math.sin(elapsed * 10) * 0.2, 0.9, 1);
          rightEye.scale.set(0.9 - Math.sin(elapsed * 10) * 0.2, 0.9, 1);
          mouthMesh.scale.set(0.8, 0.8, 1);
          break;
        }
        case 'speaking': {
          goldEmissiveMat.emissiveIntensity = 2.8 + Math.sin(elapsed * 14) * 0.8;
          goldEmissiveMat.emissive.setHex(0xe5c158);
          // Animated mouth wave
          const mouthWave = 1 + Math.abs(Math.sin(elapsed * 16)) * 4.5;
          mouthMesh.scale.set(1.1, mouthWave, 1);
          leftEye.scale.set(1.05, 1.05, 1);
          rightEye.scale.set(1.05, 1.05, 1);
          break;
        }
        case 'happy': {
          goldEmissiveMat.emissiveIntensity = 3.5;
          goldEmissiveMat.emissive.setHex(0xfef08a); // brilliant bright warm gold
          leftEye.scale.set(1.2, 0.35, 1);
          rightEye.scale.set(1.2, 0.35, 1);
          mouthMesh.scale.set(1.4, 2.5, 1);
          robotGroup.position.y += Math.abs(Math.sin(elapsed * 6)) * 0.15;
          break;
        }
        case 'error': {
          goldEmissiveMat.emissiveIntensity = 1.8 + Math.sin(elapsed * 6) * 0.5;
          goldEmissiveMat.emissive.setHex(0xb45309);
          leftEye.scale.set(0.8, 1.1, 1);
          rightEye.scale.set(1.1, 0.8, 1);
          mouthMesh.scale.set(0.6, 0.5, 1);
          break;
        }
        default: { // 'idle' or 'muted'
          goldEmissiveMat.emissiveIntensity = 2.2;
          goldEmissiveMat.emissive.setHex(0xc5a059);
          mouthMesh.scale.set(1, 1, 1);

          // Periodic natural blink
          const blinkInterval = Math.sin(elapsed * 0.8);
          if (blinkInterval > 0.97) {
            leftEye.scale.set(1, 0.1, 1);
            rightEye.scale.set(1, 0.1, 1);
          } else {
            leftEye.scale.set(1, 1, 1);
            rightEye.scale.set(1, 1, 1);
          }
          break;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      onClick={onInteract}
      className={`relative flex items-center justify-center cursor-pointer select-none ${className}`}
      title="انقر للتفاعل مع رفيق السعادة"
    >
      {/* 3D WebGL Canvas Container */}
      {webglSupported ? (
        <div ref={mountRef} className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96" />
      ) : (
        /* WebGL Fallback: High Fidelity Luxury Academic SVG/CSS Mascot */
        <div className="w-64 h-64 sm:w-72 sm:h-72 flex flex-col items-center justify-center relative animate-pulse">
          <div className="w-48 h-44 bg-[#1c130e] border-2 border-[#c5a059] rounded-3xl shadow-2xl shadow-amber-900/50 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Glowing gold eyes */}
            <div className="flex gap-10 mt-3">
              <div className="w-7 h-7 bg-[#e5c158] rounded-full shadow-lg shadow-amber-400 animate-ping" />
              <div className="w-7 h-7 bg-[#e5c158] rounded-full shadow-lg shadow-amber-400 animate-ping" />
            </div>
            {/* Mouth */}
            <div className={`mt-6 h-2 bg-[#c5a059] rounded-full transition-all ${state === 'speaking' ? 'w-16 animate-bounce' : 'w-8'}`} />
            {/* Earcups */}
            <div className="absolute -left-4 top-14 w-6 h-14 bg-[#3a281c] rounded-l-xl border-l-2 border-[#c5a059]" />
            <div className="absolute -right-4 top-14 w-6 h-14 bg-[#3a281c] rounded-r-xl border-r-2 border-[#c5a059]" />
          </div>
          <div className="w-32 h-16 bg-[#261b14] border-2 border-[#c5a059]/50 rounded-b-3xl mt-1 shadow-lg" />
        </div>
      )}

      {/* State Badge Overlay in Vintage Gold & Dark Espresso */}
      <div className="absolute bottom-1 bg-[#1a120c]/95 border border-[#c5a059]/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-[#f7f2ea] shadow-lg flex items-center gap-2 pointer-events-none">
        <span className={`w-2 h-2 rounded-full ${
          state === 'listening' ? 'bg-[#fde047] animate-ping' :
          state === 'speaking' ? 'bg-[#e5c158] animate-pulse' :
          state === 'processing' ? 'bg-[#d97706] animate-spin' :
          state === 'happy' ? 'bg-[#fef08a]' :
          state === 'error' ? 'bg-rose-500' : 'bg-[#c5a059]'
        }`} />
        <span className="font-arabic-body">
          {state === 'listening' ? 'يستمع إليك...' :
           state === 'speaking' ? 'يتحدث...' :
           state === 'processing' ? 'يتأمل في الأرشيف...' :
           state === 'happy' ? 'مسرور بالتواصل الأكاديمي!' :
           state === 'error' ? 'حدث خطأ بسيط' :
           isMuted ? 'صوت المساعد صامت' : 'رفيق السعادة • جاهز للمساعدة'}
        </span>
      </div>
    </div>
  );
};
