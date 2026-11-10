import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Compass,
  RotateCcw,
  Sparkles,
  Heart,
  Eye,
  Camera,
} from 'lucide-react';

interface CalmingSanctuary3DProps {
  onClose?: () => void;
}

type AmbientMood = 'dawn' | 'noon' | 'sunset' | 'night';

const MOOD_CONFIGS: Record<
  AmbientMood,
  {
    name: string;
    skyColor: number;
    fogColor: number;
    keyLightColor: number;
    keyLightIntensity: number;
    hemiSky: number;
    hemiGround: number;
    lanternIntensity: number;
  }
> = {
  dawn: {
    name: 'Peaceful Dawn',
    skyColor: 0xffe8d6,
    fogColor: 0xffe8d6,
    keyLightColor: 0xffc499,
    keyLightIntensity: 2.2,
    hemiSky: 0xffe0c8,
    hemiGround: 0xb4c5b7,
    lanternIntensity: 1.0,
  },
  noon: {
    name: 'Gentle Sunlight',
    skyColor: 0xe6f4f8,
    fogColor: 0xe6f4f8,
    keyLightColor: 0xffffff,
    keyLightIntensity: 2.5,
    hemiSky: 0xcbe3fb,
    hemiGround: 0x9bc4a8,
    lanternIntensity: 0.2,
  },
  sunset: {
    name: 'Golden Sunset',
    skyColor: 0xfce4d8,
    fogColor: 0xfce4d8,
    keyLightColor: 0xff8c42,
    keyLightIntensity: 2.8,
    hemiSky: 0xffaa70,
    hemiGround: 0x5a4a42,
    lanternIntensity: 2.0,
  },
  night: {
    name: 'Starry Twilight',
    skyColor: 0x141b2b,
    fogColor: 0x141b2b,
    keyLightColor: 0x6e8ca8,
    keyLightIntensity: 0.8,
    hemiSky: 0x223048,
    hemiGround: 0x0d141e,
    lanternIntensity: 3.5,
  },
};

export const CalmingSanctuary3D: React.FC<CalmingSanctuary3DProps> = ({ onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [activeMood, setActiveMood] = useState<AmbientMood>('noon');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeView, setActiveView] = useState<'orbit' | 'fountain' | 'tree' | 'lantern'>('orbit');
  const [waterRipplesActive, setWaterRipplesActive] = useState(true);

  // Audio Context Ref for procedural calming ambient sound (zero external files)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ noiseSource?: AudioNode; gain?: GainNode; intervalId?: number }>({});

  // Three.js mutable state refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 4.5, 9));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 0));
  const moodStateRef = useRef<AmbientMood>('noon');

  // Procedural audio generator (Gentle flowing water + peaceful chime bowl)
  const toggleSound = () => {
    if (soundEnabled) {
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      setSoundEnabled(false);
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Generate pink/brown noise for soft babbling water
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.05;
        b2 = 0.85 * b2 + white * 0.1;
        output[i] = (b0 + b1 + b2) * 0.08;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 450;

      const gain = ctx.createGain();
      gain.gain.value = 0.18;

      whiteNoise.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();

      audioNodesRef.current.noiseSource = whiteNoise;
      audioNodesRef.current.gain = gain;

      // Gentle bell chime every 14 seconds
      const chimeInterval = window.setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
        const now = audioCtxRef.current.currentTime;
        const osc = audioCtxRef.current.createOscillator();
        const chimeGain = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, now); // 528Hz Solfeggio frequency for calm
        chimeGain.gain.setValueAtTime(0.001, now);
        chimeGain.gain.exponentialRampToValueAtTime(0.08, now + 0.1);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
        osc.connect(chimeGain);
        chimeGain.connect(audioCtxRef.current.destination);
        osc.start(now);
        osc.stop(now + 4.6);
      }, 14000);

      audioNodesRef.current.intervalId = chimeInterval;
      setSoundEnabled(true);
    } catch (err) {
      console.warn('Audio synthesis initialized with fallback', err);
    }
  };

  useEffect(() => {
    moodStateRef.current = activeMood;
  }, [activeMood]);

  // View switch handler with smooth camera targeting
  const setViewTarget = (view: 'orbit' | 'fountain' | 'tree' | 'lantern') => {
    setActiveView(view);
    if (view === 'orbit') {
      targetCamPosRef.current.set(0, 4.5, 9);
      targetLookAtRef.current.set(0, 1.2, 0);
    } else if (view === 'fountain') {
      targetCamPosRef.current.set(-1.2, 2.8, 3.2);
      targetLookAtRef.current.set(0, 0.9, 0);
    } else if (view === 'tree') {
      targetCamPosRef.current.set(3.4, 3.2, 3.2);
      targetLookAtRef.current.set(2.4, 2.0, -0.6);
    } else if (view === 'lantern') {
      targetCamPosRef.current.set(-2.8, 2.2, -1.2);
      targetLookAtRef.current.set(-2.2, 1.4, -2.2);
    }
  };

  // Main Three.js Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const initialMood = MOOD_CONFIGS[activeMood];
    scene.background = new THREE.Color(initialMood.skyColor);
    scene.fog = new THREE.FogExp2(initialMood.fogColor, 0.045);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 4.5, 9);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't go below ground
    controls.minDistance = 2.5;
    controls.maxDistance = 16;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // Lighting Rig
    const hemiLight = new THREE.HemisphereLight(initialMood.hemiSky, initialMood.hemiGround, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(initialMood.keyLightColor, initialMood.keyLightIntensity);
    keyLight.position.set(6, 12, 6);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 25;
      const d = 7;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xddeeff, 0.6);
    fillLight.position.set(-6, 8, -4);
    scene.add(fillLight);

    // Procedural Sand / Moss Garden Ground
    const groundGeo = new THREE.PlaneGeometry(32, 32, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xd2c7b8, // warm raked zen sand
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Ground Raked Rings Decal / Circle Ring
    const ringGeo = new THREE.RingGeometry(1.6, 3.8, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xc4b7a5,
      roughness: 0.95,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.01;
    scene.add(ringMesh);

    // ==========================================
    // 1. PROCEDURAL 8-PART FOUNTAIN (THREE.Group)
    // ==========================================
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0, 0);

    // Part 1: Outer Stone Basin Rim
    const basinOuterGeo = new THREE.CylinderGeometry(1.2, 1.0, 0.7, 32);
    const stoneBasinMat = new THREE.MeshStandardMaterial({
      color: 0x6e757a,
      roughness: 0.85,
      metalness: 0.1,
    });
    const basinOuter = new THREE.Mesh(basinOuterGeo, stoneBasinMat);
    basinOuter.position.y = 0.35;
    basinOuter.castShadow = !isSoftwareGl;
    basinOuter.receiveShadow = !isSoftwareGl;
    fountainGroup.add(basinOuter);

    // Part 2: Inner Water Pool
    const waterGeo = new THREE.CircleGeometry(1.08, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x3b82a6,
      roughness: 0.08,
      metalness: 0.25,
      transparent: true,
      opacity: 0.85,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = 0.62;
    fountainGroup.add(waterMesh);

    // Part 3: Bamboo Spout Base Post
    const bambooBaseGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16);
    const bambooMat = new THREE.MeshStandardMaterial({
      color: 0x7a8c54,
      roughness: 0.55,
      metalness: 0.12,
    });
    const bambooPost = new THREE.Mesh(bambooBaseGeo, bambooMat);
    bambooPost.position.set(-0.8, 0.6, 0);
    bambooPost.castShadow = !isSoftwareGl;
    fountainGroup.add(bambooPost);

    // Part 4: Bamboo Angled Spout
    const bambooSpoutGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 16);
    const bambooSpout = new THREE.Mesh(bambooSpoutGeo, bambooMat);
    bambooSpout.rotation.z = Math.PI / 3;
    bambooSpout.position.set(-0.45, 1.15, 0);
    bambooSpout.castShadow = !isSoftwareGl;
    fountainGroup.add(bambooSpout);

    // Part 5: Falling Water Column
    const streamGeo = new THREE.CylinderGeometry(0.02, 0.035, 0.55, 12);
    const streamMat = new THREE.MeshStandardMaterial({
      color: 0xdff6ff,
      roughness: 0.05,
      transparent: true,
      opacity: 0.75,
    });
    const streamMesh = new THREE.Mesh(streamGeo, streamMat);
    streamMesh.position.set(-0.1, 0.85, 0);
    fountainGroup.add(streamMesh);

    // Part 6: Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(3.0, 3.0);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    gradient.addColorStop(0, 'rgba(20, 20, 20, 0.65)');
    gradient.addColorStop(0.5, 'rgba(20, 20, 20, 0.25)');
    gradient.addColorStop(1, 'rgba(20, 20, 20, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.005;
    fountainGroup.add(shadowMesh);

    scene.add(fountainGroup);

    // ==========================================
    // 2. PROCEDURAL 6-PART BONSAI TREE (THREE.Group)
    // ==========================================
    const treeGroup = new THREE.Group();
    treeGroup.position.set(2.4, 0, -0.6);

    // Planter Pot
    const potGeo = new THREE.CylinderGeometry(0.65, 0.45, 0.4, 24);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0x3d3532,
      roughness: 0.7,
      metalness: 0.2,
    });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.2;
    pot.castShadow = !isSoftwareGl;
    treeGroup.add(pot);

    // Pot Soil
    const soilGeo = new THREE.CircleGeometry(0.62, 24);
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x241a14,
      roughness: 0.95,
    });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.rotation.x = -Math.PI / 2;
    soil.position.y = 0.39;
    treeGroup.add(soil);

    // Curved Trunk
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.35, 0),
      new THREE.Vector3(0.1, 0.9, 0.05),
      new THREE.Vector3(-0.15, 1.45, 0.1),
      new THREE.Vector3(0.05, 1.9, 0),
    ]);
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 20, 0.1, 10, false);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.88,
      metalness: 0.05,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.castShadow = !isSoftwareGl;
    treeGroup.add(trunk);

    // 4 Distinct Foliage Clusters
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x2d5a37,
      roughness: 0.75,
      metalness: 0.05,
    });
    const foliagePositions = [
      { pos: new THREE.Vector3(-0.25, 1.45, 0.25), scale: 0.48 },
      { pos: new THREE.Vector3(0.3, 1.7, -0.15), scale: 0.52 },
      { pos: new THREE.Vector3(-0.05, 2.1, 0.1), scale: 0.6 },
      { pos: new THREE.Vector3(0.18, 2.35, -0.05), scale: 0.4 },
    ];
    foliagePositions.forEach(({ pos, scale }) => {
      const geo = new THREE.DodecahedronGeometry(scale, 1);
      const mesh = new THREE.Mesh(geo, foliageMat);
      mesh.position.copy(pos);
      mesh.scale.set(1.2, 0.7, 1.1);
      mesh.castShadow = !isSoftwareGl;
      treeGroup.add(mesh);
    });

    scene.add(treeGroup);

    // ==========================================
    // 3. PROCEDURAL 5-PART STONE LANTERN (THREE.Group)
    // ==========================================
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(-2.2, 0, -2.2);

    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0x7b8288,
      roughness: 0.85,
      metalness: 0.1,
    });

    // Base Pedestal
    const lanternBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.25, 16), lanternMat);
    lanternBase.position.y = 0.125;
    lanternGroup.add(lanternBase);

    // Column Pillar
    const lanternPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.75, 16), lanternMat);
    lanternPillar.position.y = 0.6;
    lanternPillar.castShadow = !isSoftwareGl;
    lanternGroup.add(lanternPillar);

    // Light Chamber Box
    const lightChamber = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.35, 0.42), lanternMat);
    lightChamber.position.y = 1.12;
    lanternGroup.add(lightChamber);

    // Roof Pagoda Top
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.3, 4), lanternMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 1.42;
    roof.castShadow = !isSoftwareGl;
    lanternGroup.add(roof);

    // Internal Warm Glow Light
    const lanternLight = new THREE.PointLight(0xffa238, initialMood.lanternIntensity, 5, 2);
    lanternLight.position.set(0, 1.12, 0);
    lanternGroup.add(lanternLight);

    scene.add(lanternGroup);

    // ==========================================
    // 4. STEPPING STONES PATH & RIVER PEBBLES
    // ==========================================
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x5a6369,
      roughness: 0.8,
      metalness: 0.1,
    });
    const stonePositions = [
      { x: 0, z: 2.2, rx: 0.38, rz: 0.5 },
      { x: 0.4, z: 3.2, rx: 0.42, rz: 0.48 },
      { x: -0.2, z: 4.2, rx: 0.46, rz: 0.4 },
      { x: 1.2, z: 0.8, rx: 0.35, rz: 0.4 },
      { x: 1.8, z: 0.1, rx: 0.38, rz: 0.42 },
      { x: -1.2, z: -0.9, rx: 0.36, rz: 0.44 },
      { x: -1.7, z: -1.6, rx: 0.4, rz: 0.38 },
    ];
    stonePositions.forEach(({ x, z, rx, rz }, i) => {
      const stoneGeo = new THREE.CylinderGeometry(rx, rx * 1.05, 0.08, 14);
      const stoneMesh = new THREE.Mesh(stoneGeo, stoneMat);
      stoneMesh.position.set(x, 0.04, z);
      stoneMesh.rotation.y = i * 0.7;
      stoneMesh.receiveShadow = !isSoftwareGl;
      scene.add(stoneMesh);
    });

    // Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Smooth camera transition using MathUtils.damp
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPosRef.current.x, 3.0, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPosRef.current.y, 3.0, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPosRef.current.z, 3.0, delta);

      controls.target.x = THREE.MathUtils.damp(controls.target.x, targetLookAtRef.current.x, 3.0, delta);
      controls.target.y = THREE.MathUtils.damp(controls.target.y, targetLookAtRef.current.y, 3.0, delta);
      controls.target.z = THREE.MathUtils.damp(controls.target.z, targetLookAtRef.current.z, 3.0, delta);
      controls.update();

      // Gentle water ripple rotation
      if (waterMesh) {
        waterMesh.rotation.z = elapsed * 0.15;
      }
      if (streamMesh) {
        streamMesh.scale.x = 1 + Math.sin(elapsed * 12) * 0.08;
        streamMesh.scale.z = 1 + Math.cos(elapsed * 12) * 0.08;
      }

      // Smooth mood color updates
      const currentMood = MOOD_CONFIGS[moodStateRef.current];
      (scene.background as THREE.Color).lerp(new THREE.Color(currentMood.skyColor), 0.05);
      (scene.fog as THREE.FogExp2).color.lerp(new THREE.Color(currentMood.fogColor), 0.05);
      keyLight.color.lerp(new THREE.Color(currentMood.keyLightColor), 0.05);
      keyLight.intensity = THREE.MathUtils.damp(keyLight.intensity, currentMood.keyLightIntensity, 2, delta);
      hemiLight.color.lerp(new THREE.Color(currentMood.hemiSky), 0.05);
      hemiLight.groundColor.lerp(new THREE.Color(currentMood.hemiGround), 0.05);
      lanternLight.intensity = THREE.MathUtils.damp(lanternLight.intensity, currentMood.lanternIntensity, 2, delta);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (audioNodesRef.current.intervalId) {
        clearInterval(audioNodesRef.current.intervalId);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col bg-slate-900 overflow-hidden select-none">
      {/* Top Header Badge */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-lg backdrop-blur-none pointer-events-auto flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">3D Calming Sanctuary</h2>
            <p className="text-xs text-slate-300">Sensory decompression &amp; landmark grounding</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute soothing audio' : 'Play soothing audio'}
            className={`p-3 rounded-2xl border font-medium text-sm flex items-center space-x-2 transition-all shadow-md ${
              soundEnabled
                ? 'bg-teal-600 text-white border-teal-500'
                : 'bg-slate-800/95 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Stream Sound On' : 'Play Stream Sound'}</span>
          </button>

          {/* Close Sanctuary View */}
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-800/95 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 font-bold text-sm shadow-md transition-all"
            >
              Exit 3D View
            </button>
          )}
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full flex-1 touch-none" />

      {/* Unified Bottom Control Dock (Consolidated, No left/right floating clutter) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-2xl transition-transform duration-300 ease-in-out ${
          controlsCollapsed ? 'translate-y-[calc(100%-42px)]' : 'translate-y-0'
        }`}
      >
        <div className="bg-slate-900/95 border border-slate-700 rounded-3xl p-3 shadow-2xl flex flex-col space-y-3">
          {/* Drawer Collapse / Expand Header Tab */}
          <button
            onClick={() => setControlsCollapsed(!controlsCollapsed)}
            className="w-full flex items-center justify-center space-x-1 py-1 text-slate-400 hover:text-white text-xs font-semibold"
          >
            {controlsCollapsed ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Show Sanctuary Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Hide Controls (Zen View)</span>
              </>
            )}
          </button>

          {/* Controls Body */}
          {!controlsCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Camera Perspectives */}
              <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700/60">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center space-x-1">
                  <Camera className="w-3.5 h-3.5 text-teal-400" />
                  <span>Perspective</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: 'orbit', label: 'Full Garden' },
                      { id: 'fountain', label: 'Fountain' },
                      { id: 'tree', label: 'Bonsai' },
                      { id: 'lantern', label: 'Lantern' },
                    ] as const
                  ).map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setViewTarget(v.id)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all text-center ${
                        activeView === v.id
                          ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                          : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time of Day Lighting Mood */}
              <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700/60">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center space-x-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Time of Day</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['dawn', 'noon', 'sunset', 'night'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveMood(m)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all capitalize text-center ${
                        activeMood === m
                          ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                          : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
