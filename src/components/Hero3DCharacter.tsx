import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Hero3DCharacter: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useEffect(() => {
    const mountContainer = mountRef.current;
    if (!mountContainer) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();

    const width = mountContainer.clientWidth || 400;
    const height = mountContainer.clientHeight || 500;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 4.8);

    // Renderer setup inside try-catch to prevent uncaught WebGL context errors
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      
      renderer.domElement.className = 'w-full h-full block relative z-10 cursor-grab active:cursor-grabbing focus:outline-none';
      renderer.domElement.setAttribute('title', 'Interactive 3D LEVELUP Hero Avatar');

      // Clear any prior children and append
      mountContainer.innerHTML = '';
      mountContainer.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('WebGL is unavailable or context could not be created:', err);
      setIsWebGLSupported(false);
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Main key light (Warm professional light)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    // Rim light (Futuristic Cyan/Emerald sheen)
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 3.2);
    rimLight.position.set(-3, 3, -2);
    scene.add(rimLight);

    // Bottom bounce light (Subtle purple/indigo ground reflection)
    const bounceLight = new THREE.DirectionalLight(0x6366f1, 1.4);
    bounceLight.position.set(0, -3, 2);
    scene.add(bounceLight);

    // Group for whole character + floating elements
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Character Group
    const characterGroup = new THREE.Group();
    rootGroup.add(characterGroup);

    // -------------------------------------------------------------
    // PROCEDURAL 3D FUTURISTIC "LEVELUP" AVATAR
    // Clean matte obsidian, carbon weave, satin graphite & gold trims
    // -------------------------------------------------------------

    // Materials
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Deep matte obsidian
      roughness: 0.35,
      metalness: 0.2,
    });

    const armorPlateMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.2,
      metalness: 0.6,
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // LEVELUP energetic amber/gold
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
    });

    const glowCyanMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.1,
      metalness: 0.5,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8,
    });

    const glassVisorMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.05,
      metalness: 0.9,
      transmission: 0.6,
      transparent: true,
      opacity: 0.92,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const skinToneMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.6,
      metalness: 0.05,
    });

    // 1. Torso & Kinetic Armor Vest
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.24, 0.68, 16);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.y = 0.48;
    characterGroup.add(torso);

    // Chest plate
    const chestPlateGeo = new THREE.BoxGeometry(0.44, 0.32, 0.22);
    const chestPlate = new THREE.Mesh(chestPlateGeo, armorPlateMat);
    chestPlate.position.set(0, 0.58, 0.12);
    chestPlate.rotation.x = -0.1;
    characterGroup.add(chestPlate);

    // LEVELUP Core Arc Badge (Subtle glowing chest emblem)
    const arcGeo = new THREE.RingGeometry(0.04, 0.07, 24);
    const arcEmblem = new THREE.Mesh(arcGeo, glowCyanMat);
    arcEmblem.position.set(0, 0.60, 0.24);
    characterGroup.add(arcEmblem);

    const arcCenterGeo = new THREE.CircleGeometry(0.025, 16);
    const arcCenter = new THREE.Mesh(arcCenterGeo, goldAccentMat);
    arcCenter.position.set(0, 0.60, 0.241);
    characterGroup.add(arcCenter);

    // Collar / Neck
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.18, 16);
    const neck = new THREE.Mesh(neckGeo, skinToneMat);
    neck.position.y = 0.88;
    characterGroup.add(neck);

    // 2. Stylized Futuristic Head & Visor
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.1;
    characterGroup.add(headGroup);

    // Cranium / Face structure
    const craniumGeo = new THREE.SphereGeometry(0.23, 24, 24);
    craniumGeo.scale(0.9, 1.05, 0.95);
    const cranium = new THREE.Mesh(craniumGeo, skinToneMat);
    headGroup.add(cranium);

    // Sleek geometric visor headset
    const visorGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.12, 24, 1, false, 0, Math.PI);
    const visor = new THREE.Mesh(visorGeo, glassVisorMat);
    visor.rotation.y = -Math.PI / 2;
    visor.position.set(0, 0.03, 0.08);
    headGroup.add(visor);

    // Visor glowing optical line
    const visorLineGeo = new THREE.BoxGeometry(0.38, 0.02, 0.02);
    const visorLine = new THREE.Mesh(visorLineGeo, glowCyanMat);
    visorLine.position.set(0, 0.03, 0.22);
    headGroup.add(visorLine);

    // Minimalistic Hair / Crown hood piece
    const crownGeo = new THREE.SphereGeometry(0.238, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2);
    crownGeo.scale(0.92, 1.05, 0.95);
    const crown = new THREE.Mesh(crownGeo, armorPlateMat);
    crown.position.set(0, 0.04, -0.02);
    headGroup.add(crown);

    // 3. Shoulders & Arms (Confident upright athletic stance)
    // Left Shoulder & Arm
    const shoulderLeftGeo = new THREE.SphereGeometry(0.13, 16, 16);
    const shoulderLeft = new THREE.Mesh(shoulderLeftGeo, armorPlateMat);
    shoulderLeft.position.set(-0.40, 0.72, 0);
    characterGroup.add(shoulderLeft);

    const bicepLeftGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.34, 12);
    const bicepLeft = new THREE.Mesh(bicepLeftGeo, suitMat);
    bicepLeft.position.set(-0.44, 0.50, 0.04);
    bicepLeft.rotation.z = 0.2;
    bicepLeft.rotation.x = -0.15;
    characterGroup.add(bicepLeft);

    const forearmLeftGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.32, 12);
    const forearmLeft = new THREE.Mesh(forearmLeftGeo, armorPlateMat);
    forearmLeft.position.set(-0.46, 0.22, 0.12);
    forearmLeft.rotation.x = -0.35;
    forearmLeft.rotation.z = 0.1;
    characterGroup.add(forearmLeft);

    // Right Shoulder & Arm
    const shoulderRightGeo = new THREE.SphereGeometry(0.13, 16, 16);
    const shoulderRight = new THREE.Mesh(shoulderRightGeo, armorPlateMat);
    shoulderRight.position.set(0.40, 0.72, 0);
    characterGroup.add(shoulderRight);

    const bicepRightGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.34, 12);
    const bicepRight = new THREE.Mesh(bicepRightGeo, suitMat);
    bicepRight.position.set(0.44, 0.50, 0.04);
    bicepRight.rotation.z = -0.2;
    bicepRight.rotation.x = -0.15;
    characterGroup.add(bicepRight);

    const forearmRightGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.32, 12);
    const forearmRight = new THREE.Mesh(forearmRightGeo, armorPlateMat);
    forearmRight.position.set(0.46, 0.22, 0.12);
    forearmRight.rotation.x = -0.35;
    forearmRight.rotation.z = -0.1;
    characterGroup.add(forearmRight);

    // 4. Waist & Legs
    const waistGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.22, 16);
    const waist = new THREE.Mesh(waistGeo, armorPlateMat);
    waist.position.y = 0.14;
    characterGroup.add(waist);

    // Belt Level Emblem
    const beltBuckleGeo = new THREE.BoxGeometry(0.12, 0.06, 0.04);
    const beltBuckle = new THREE.Mesh(beltBuckleGeo, goldAccentMat);
    beltBuckle.position.set(0, 0.14, 0.14);
    characterGroup.add(beltBuckle);

    // Left Leg
    const thighLeftGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.48, 12);
    const thighLeft = new THREE.Mesh(thighLeftGeo, suitMat);
    thighLeft.position.set(-0.16, -0.18, 0);
    thighLeft.rotation.z = 0.06;
    characterGroup.add(thighLeft);

    const shinLeftGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.48, 12);
    const shinLeft = new THREE.Mesh(shinLeftGeo, armorPlateMat);
    shinLeft.position.set(-0.18, -0.62, 0.02);
    characterGroup.add(shinLeft);

    const bootLeftGeo = new THREE.BoxGeometry(0.12, 0.12, 0.24);
    const bootLeft = new THREE.Mesh(bootLeftGeo, suitMat);
    bootLeft.position.set(-0.18, -0.88, 0.06);
    characterGroup.add(bootLeft);

    // Right Leg
    const thighRightGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.48, 12);
    const thighRight = new THREE.Mesh(thighRightGeo, suitMat);
    thighRight.position.set(0.16, -0.18, 0);
    thighRight.rotation.z = -0.06;
    characterGroup.add(thighRight);

    const shinRightGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.48, 12);
    const shinRight = new THREE.Mesh(shinRightGeo, armorPlateMat);
    shinRight.position.set(0.18, -0.62, 0.02);
    characterGroup.add(shinRight);

    const bootRightGeo = new THREE.BoxGeometry(0.12, 0.12, 0.24);
    const bootRight = new THREE.Mesh(bootRightGeo, suitMat);
    bootRight.position.set(0.18, -0.88, 0.06);
    characterGroup.add(bootRight);

    // -------------------------------------------------------------
    // LEVEL PROGRESSION GLOWING RINGS & MOTIF
    // -------------------------------------------------------------
    const ringGroup = new THREE.Group();
    ringGroup.position.set(0, -0.92, 0);
    ringGroup.rotation.x = Math.PI / 2.2;
    rootGroup.add(ringGroup);

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: false,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    const ringGeo1 = new THREE.RingGeometry(0.85, 0.88, 48);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringGroup.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });

    const ringGeo2 = new THREE.RingGeometry(1.15, 1.18, 48);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringGroup.add(ring2);

    // Halo ring behind head/torso (Level-up ascension halo)
    const haloGeo = new THREE.TorusGeometry(0.72, 0.012, 16, 64);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 0.72, -0.18);
    halo.rotation.y = 0.2;
    rootGroup.add(halo);

    // Small floating geometric particle nodes representing level-up data
    const nodesGroup = new THREE.Group();
    rootGroup.add(nodesGroup);

    const nodeGeo = new THREE.OctahedronGeometry(0.045);
    const nodeMatGold = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const nodeMatCyan = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });

    const floatingNodes: Array<{ mesh: THREE.Mesh; speed: number; phase: number; radius: number; height: number }> = [];

    for (let i = 0; i < 7; i++) {
      const isGold = i % 2 === 0;
      const mesh = new THREE.Mesh(nodeGeo, isGold ? nodeMatGold : nodeMatCyan);
      const angle = (i / 7) * Math.PI * 2;
      const radius = 0.9 + (i % 3) * 0.25;
      const height = -0.4 + (i * 0.25);
      mesh.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      nodesGroup.add(mesh);
      floatingNodes.push({
        mesh,
        speed: 0.4 + (i % 4) * 0.15,
        phase: i * 1.1,
        radius,
        height,
      });
    }

    // -------------------------------------------------------------
    // INTERACTION & ANIMATION LOOP
    // -------------------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let targetPositionY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (prefersReducedMotion) return;
      const rect = mountContainer.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 2;
      mouseY = y * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Responsive Resize Observer
    const handleResize = () => {
      if (!mountContainer || !renderer || !camera) return;
      const w = mountContainer.clientWidth;
      const h = mountContainer.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountContainer);

    // Viewport Intersection Observer
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    intersectionObserver.observe(mountContainer);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth floating animation
      if (!prefersReducedMotion) {
        const floatOffset = Math.sin(elapsedTime * 1.4) * 0.08;
        characterGroup.position.y = floatOffset;
        halo.position.y = 0.72 + floatOffset * 0.5;

        // Subtle breathing tilt
        characterGroup.rotation.z = Math.sin(elapsedTime * 0.9) * 0.015;

        // Mouse Parallax Lerping
        targetRotationY = mouseX * 0.25;
        targetRotationX = -mouseY * 0.15;
        targetPositionY = -mouseY * 0.08;

        rootGroup.rotation.y += (targetRotationY - rootGroup.rotation.y) * 0.06;
        rootGroup.rotation.x += (targetRotationX - rootGroup.rotation.x) * 0.06;
        rootGroup.position.y += (targetPositionY - rootGroup.position.y) * 0.06;

        // Rotate level progression rings slowly
        ring1.rotation.z = elapsedTime * 0.35;
        ring2.rotation.z = -elapsedTime * 0.25;
        halo.rotation.z = elapsedTime * 0.15;

        // Animate floating orbit nodes
        floatingNodes.forEach((node) => {
          const currentAngle = node.phase + elapsedTime * node.speed * 0.6;
          node.mesh.position.x = Math.cos(currentAngle) * node.radius;
          node.mesh.position.z = Math.sin(currentAngle) * node.radius;
          node.mesh.position.y = node.height + Math.sin(elapsedTime * 2 + node.phase) * 0.08;
          node.mesh.rotation.x += 0.02;
          node.mesh.rotation.y += 0.03;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (renderer) {
        if (renderer.domElement && mountContainer.contains(renderer.domElement)) {
          mountContainer.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
      scene.clear();
    };
  }, []);

  // 5 Orbiting Floating UI badges representing core LEVELUP modules
  const floatingBadges = [
    {
      id: 1,
      title: 'Fitness & Overload',
      stat: '98% Overload • 2.4k kcal',
      icon: 'fitness_center',
      color: 'from-amber-500/20 to-amber-500/5 text-amber-500 border-amber-500/30',
      dotColor: 'bg-amber-500',
      posClass: '-top-3 left-4 md:-left-4',
      delay: '0s',
    },
    {
      id: 2,
      title: 'Career & ATS Score',
      stat: 'Score 96 • Staff Ready',
      icon: 'description',
      color: 'from-cyan-500/20 to-cyan-500/5 text-cyan-500 border-cyan-500/30',
      dotColor: 'bg-cyan-500',
      posClass: 'top-1/4 -right-2 md:-right-6',
      delay: '0.4s',
    },
    {
      id: 3,
      title: 'Productivity & Flow',
      stat: '4h 20m • 14d Streak',
      icon: 'schedule',
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500 border-emerald-500/30',
      dotColor: 'bg-emerald-500',
      posClass: 'bottom-20 -left-2 md:-left-8',
      delay: '0.8s',
    },
    {
      id: 4,
      title: 'Finance & Growth',
      stat: '₹ Cashflow Positive',
      icon: 'payments',
      color: 'from-indigo-500/20 to-indigo-500/5 text-indigo-500 border-indigo-500/30',
      dotColor: 'bg-indigo-500',
      posClass: 'bottom-6 right-6 md:right-2',
      delay: '1.2s',
    },
  ];

  return (
    <div className="relative w-full h-[460px] sm:h-[540px] lg:h-[620px] flex items-center justify-center select-none">
      {/* Ambient background glow halo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] rounded-full bg-gradient-to-tr from-primary/20 via-cyan-500/10 to-amber-500/15 blur-3xl opacity-60 animate-pulse [animation-duration:6s]"></div>
      </div>

      {/* Main 3D Mount Container */}
      <div
        ref={mountRef}
        className="w-full h-full flex items-center justify-center relative z-10"
      />

      {/* Static Fallback if WebGL fails */}
      {!isWebGLSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-15 bg-surface-container-lowest/80 backdrop-blur-md rounded-3xl border border-outline-variant">
          <div className="w-28 h-28 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl mb-3">
            <span className="material-symbols-outlined text-5xl">upgrade</span>
          </div>
          <p className="font-headline-sm text-on-surface font-bold text-base">LEVEL UP YOUR LIFE</p>
          <p className="text-xs text-on-surface-variant max-w-xs mt-1">
            One unified performance platform for physical, mental, and career momentum.
          </p>
        </div>
      )}

      {/* Floating Level Progression Motif Badge (Top Center-Right) */}
      <div className="absolute top-2 right-4 md:right-10 z-20 pointer-events-auto bg-surface/90 backdrop-blur-md border border-primary/30 rounded-2xl px-4 py-2.5 shadow-xl animate-bounce [animation-duration:4s]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-on-primary font-mono font-bold text-xs shadow-md">
            UP
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-semibold">Status</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <p className="text-xs font-bold text-on-surface font-mono">LVL 01 → LVL 02</p>
          </div>
        </div>
        {/* Progression mini bar */}
        <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
          <div className="bg-gradient-to-r from-primary via-cyan-400 to-amber-400 h-full w-[78%] rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Floating Geometric UI Module Badges */}
      {floatingBadges.map((badge) => (
        <div
          key={badge.id}
          onMouseEnter={() => setActiveCard(badge.id)}
          onMouseLeave={() => setActiveCard(null)}
          className={`absolute ${badge.posClass} z-20 transition-all duration-300 pointer-events-auto cursor-default ${
            activeCard === badge.id ? 'scale-105 shadow-2xl z-30' : 'hover:scale-102'
          }`}
          style={{ animationDelay: badge.delay }}
        >
          <div
            className={`bg-surface/90 backdrop-blur-md border ${badge.color} rounded-xl px-3.5 py-2.5 shadow-lg flex items-center gap-2.5 text-left`}
          >
            <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px]">{badge.icon}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface leading-tight">{badge.title}</p>
              <p className="text-[10px] text-on-surface-variant font-mono">{badge.stat}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Bottom Level Up Pill */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/80 rounded-full px-4 py-1.5 shadow-md flex items-center gap-2 text-[11px] text-on-surface-variant font-medium whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-primary"></span>
        <span>Drag to rotate • Parallax interactive</span>
      </div>
    </div>
  );
};
