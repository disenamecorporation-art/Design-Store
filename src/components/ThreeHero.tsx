import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(4.5, 3.2, 6.5);
    camera.lookAt(0, -0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(6, 12, 8);
    scene.add(dirLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3, 25);
    cyanLight.position.set(-4, 3, 4);
    scene.add(cyanLight);

    const pinkLight = new THREE.PointLight(0xf43f5e, 3, 25);
    pinkLight.position.set(4, -3, 4);
    scene.add(pinkLight);

    // Plotter Machine Group
    const plotterGroup = new THREE.Group();
    scene.add(plotterGroup);

    // 1. Stand / Legs (Heavy-duty aluminum printer stand)
    const standMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.9,
      roughness: 0.3,
    });

    // Left leg
    const leftLegGeo = new THREE.BoxGeometry(0.2, 2.2, 1.4);
    const leftLeg = new THREE.Mesh(leftLegGeo, standMat);
    leftLeg.position.set(-1.8, -1.5, 0);
    plotterGroup.add(leftLeg);

    // Right leg
    const rightLegGeo = new THREE.BoxGeometry(0.2, 2.2, 1.4);
    const rightLeg = new THREE.Mesh(rightLegGeo, standMat);
    rightLeg.position.set(1.8, -1.5, 0);
    plotterGroup.add(rightLeg);

    // Bottom crossbar shelf
    const shelfGeo = new THREE.BoxGeometry(3.6, 0.15, 1.2);
    const shelf = new THREE.Mesh(shelfGeo, standMat);
    shelf.position.set(0, -2.4, 0);
    plotterGroup.add(shelf);

    // 2. Main Plotter Body Chassis (Industrial Matte Charcoal)
    const bodyGeo = new THREE.BoxGeometry(4.4, 1.3, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.7,
      roughness: 0.25,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0, 0);
    plotterGroup.add(body);

    // Top translucent smoked glass lid / cover
    const lidGeo = new THREE.BoxGeometry(4.2, 0.2, 1.6);
    const lidMat = new THREE.MeshPhysicalMaterial({
      color: 0x09090b,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.8,
    });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.set(0, 0.75, 0);
    plotterGroup.add(lid);

    // Side Ink Tanks / CISS (Continuous Ink Supply System - Cyan, Magenta, Yellow, Black pods)
    const tankBaseGeo = new THREE.BoxGeometry(0.7, 0.8, 0.9);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0xf4f4f5,
      metalness: 0.1,
      roughness: 0.1,
    });
    const tank = new THREE.Mesh(tankBaseGeo, tankMat);
    tank.position.set(2.45, -0.1, 0.2);
    plotterGroup.add(tank);

    // Colored ink indicators inside tank
    const inkColors = [0x06b6d4, 0xec4899, 0xeab308, 0x18181b];
    inkColors.forEach((color, idx) => {
      const stripeGeo = new THREE.BoxGeometry(0.12, 0.6, 0.15);
      const stripeMat = new THREE.MeshBasicMaterial({ color });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(2.15 + idx * 0.14, -0.1, 0.62);
      plotterGroup.add(stripe);
    });

    // Control Panel Touch Screen & Power Button
    const panelGeo = new THREE.BoxGeometry(0.9, 0.45, 0.05);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.1,
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(-1.3, 0.35, 0.92);
    plotterGroup.add(panel);

    // Screen glowing UI indicator
    const screenGeo = new THREE.PlaneGeometry(0.75, 0.32);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-1.3, 0.35, 0.95);
    plotterGroup.add(screen);

    // Status LED
    const ledGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(-0.75, 0.35, 0.94);
    plotterGroup.add(led);

    // 3. Media Roll at the rear
    const rollGeo = new THREE.CylinderGeometry(0.55, 0.55, 3.9, 32);
    const rollMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.9,
    });
    const paperRoll = new THREE.Mesh(rollGeo, rollMat);
    paperRoll.rotation.z = Math.PI / 2;
    paperRoll.position.set(0, 0.9, -1.1);
    plotterGroup.add(paperRoll);

    // Spindle metal rod through roll
    const spindleGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.4, 16);
    const spindleMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.9, roughness: 0.2 });
    const spindle = new THREE.Mesh(spindleGeo, spindleMat);
    spindle.rotation.z = Math.PI / 2;
    spindle.position.set(0, 0.9, -1.1);
    plotterGroup.add(spindle);

    // 4. Printed Gigantografia Banner exiting from the bottom slot
    const bannerGeo = new THREE.PlaneGeometry(3.6, 3.4);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    const updateBannerTexture = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 512);

      // Header branding
      ctx.fillStyle = '#18181b';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText('DESIGN STORE VZLA', 35, 70);

      // Accent color bars
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(35, 95, 442, 10);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(35, 115, 200, 16);
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(245, 115, 232, 16);

      // Tagline
      ctx.fillStyle = '#27272a';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('• GIGANTOGRAFÍA PROFESIONAL', 35, 175);
      ctx.fillText('• IMPRESIÓN 3D & LÁSER', 35, 210);

      // Realistic high-res vector design preview graphics
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(120, 340, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(220, 280, 200, 120);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('PREMIUM', 245, 345);

      // Grid watermark
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 2;
      for (let i = 0; i < 512; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 430);
        ctx.lineTo(i, 512);
        ctx.stroke();
      }
    };
    updateBannerTexture();

    const bannerTexture = new THREE.CanvasTexture(canvas);
    const bannerMat = new THREE.MeshStandardMaterial({
      map: bannerTexture,
      side: THREE.DoubleSide,
      roughness: 0.4,
    });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, -1.6, 0.95);
    banner.rotation.x = -0.35;
    plotterGroup.add(banner);

    // 5. Precision Carriage & Print Head
    const carriageGeo = new THREE.BoxGeometry(0.7, 0.35, 0.45);
    const carriageMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      metalness: 0.8,
      roughness: 0.2,
    });
    const carriage = new THREE.Mesh(carriageGeo, carriageMat);
    carriage.position.set(0, 0.55, 0.5);
    plotterGroup.add(carriage);

    // Metallic guide rail
    const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.0, 16);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.1 });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.rotation.z = Math.PI / 2;
    rail.position.set(0, 0.55, 0.5);
    plotterGroup.add(rail);

    // Laser / UV Print Nozzle Beam
    const beamGeo = new THREE.ConeGeometry(0.08, 0.9, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, -0.5, 0);
    carriage.add(beam);

    // Mouse movement interaction for subtle 3D tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      mouseX = (x / container.clientWidth) * 2 - 1;
      mouseY = -(y / container.clientHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Smooth floating rotation
      plotterGroup.rotation.y = targetX * 0.35 + Math.sin(elapsedTime * 0.4) * 0.08;
      plotterGroup.rotation.x = -targetY * 0.35 + 0.15;

      // Move carriage back and forth printing smoothly
      carriage.position.x = Math.sin(elapsedTime * 3.2) * 1.6;

      // Pulse nozzle laser beam
      beam.scale.y = 1 + Math.sin(elapsedTime * 14) * 0.25;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full absolute inset-0 pointer-events-none" />;
};

