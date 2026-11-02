"use client";

import React, { useRef, useEffect, useState, useCallback, memo } from "react";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { soundFX } from "../../utils/soundEffects";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconRotateClockwise,
  IconCrosshair,
  IconPlane,
  IconCamera,
  IconRocket,
  IconMaximize,
  IconMinimize,
  IconDeviceGamepad2,
  IconAdjustmentsHorizontal,
  IconX,
  IconGauge,
  IconRuler,
  IconChevronRight,
  IconFlame,
  IconBrandPlanetscale
} from "@tabler/icons-react";

// Deterministik Sabit Ağaç ve Bulut Koordinatları
const STATIC_CLOUDS = [
  { x: 35, y: 56, z: -45, s: 1.4 },
  { x: -45, y: 62, z: -65, s: 1.7 },
  { x: 75, y: 52, z: -35, s: 1.3 },
  { x: -10, y: 68, z: -80, s: 2.0 },
  { x: 110, y: 58, z: -50, s: 1.5 },
];

const STATIC_FOREST_TREES = [
  { x: -70, z: -40, h: 18 },
  { x: -50, z: -35, h: 22 },
  { x: -30, z: -50, h: 16 },
  { x: -15, z: -30, h: 20 },
  { x: 20, z: -45, h: 19 },
  { x: 35, z: -35, h: 24 },
  { x: 65, z: -40, h: 21 },
  { x: 80, z: -55, h: 25 },
  { x: 100, z: -35, h: 17 },
  { x: 120, z: -45, h: 22 },
  { x: 135, z: -60, h: 26 },
  { x: -85, z: -60, h: 23 },
  { x: -60, z: -70, h: 25 },
  { x: 45, z: -65, h: 20 },
  { x: 90, z: -70, h: 24 },
];

// =========================================================
// PROCEDURAL CANVAS DOKU ÜRETECİLERİ
// =========================================================
function createFurTexture(baseHex, strandHex) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = strandHex;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const len = 3 + Math.random() * 7;
    const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.45;
    ctx.globalAlpha = 0.12 + Math.random() * 0.28;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createFabricTexture(baseHex, threadHex) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = threadHex;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 128; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 128);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(128, i);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createLeatherTexture(baseHex) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = "#120904";
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 350; i++) {
    const rx = Math.random() * 128;
    const ry = Math.random() * 128;
    const r = 1 + Math.random() * 2.2;
    ctx.beginPath();
    ctx.arc(rx, ry, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createWoodGrainTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#4a210a";
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "#271004";
  ctx.lineWidth = 2;
  for (let y = 0; y < 256; y += 6) {
    ctx.globalAlpha = 0.25 + Math.random() * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    const cp1x = 75, cp1y = y + Math.sin(y * 0.05) * 12;
    const cp2x = 180, cp2y = y - Math.cos(y * 0.05) * 12;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, 256, y + (Math.random() - 0.5) * 4);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createTreeBarkTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "#3e2723";
  ctx.lineWidth = 3;
  for (let x = 0; x < 256; x += 10) {
    ctx.globalAlpha = 0.4 + Math.random() * 0.35;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 6, 128);
    ctx.lineTo(x + (Math.random() - 0.5) * 6, 256);
    ctx.stroke();
  }
  ctx.fillStyle = "#2e7d32";
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 20; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    ctx.beginPath();
    ctx.arc(rx, ry, 6 + Math.random() * 10, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function Simulation3DComponent({
  hunterDistance = 50,
  treeHeight = 30,
  muzzleVelocity = 38,
  gravity = 9.8,
  monkeyDropDelay = 0.0,
  aimAngle = null,
  manualAngle = 30.0,
  isAutoAim = true,
  projectileType = "banana",
  timeScale = 1.0,
  onHit = () => {},
  onMiss = () => {},
  onStatsUpdate = () => {},
  setHunterDistance = () => {},
  setTreeHeight = () => {},
  setMuzzleVelocity = () => {},
  setGravity = () => {},
  setMonkeyDropDelay = () => {},
  setIsAutoAim = () => {},
  setManualAngle = () => {},
  setProjectileType = () => {},
  setTimeScale = () => {},
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraMode, setCameraMode] = useState("fps");
  const [simState, setSimState] = useState("idle");
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [show3DSettings, setShow3DSettings] = useState(false);
  const [show3DHUD, setShow3DHUD] = useState(true);

  // Sıfır-Lag Direkt DOM Telemetri Ref'leri (React Render Kaskadını Tamamen Engeller)
  const hudTimeRef = useRef(null);
  const hudBulletRef = useRef(null);
  const hudSpeedRef = useRef(null);
  const hudMonkeyRef = useRef(null);
  const hudDeltaHRef = useRef(null);
  const hudDistRef = useRef(null);
  const hudAngleRef = useRef(null);

  // Sıfır Garbage Collection Vektörleri
  const refs = useRef({
    scene: null,
    camera: null,
    renderer: null,
    animationId: null,
    lastStatsTime: 0,

    tempLookDir: new THREE.Vector3(),
    tempTarget: new THREE.Vector3(),

    player: {
      x: 0,
      y: 2.3,
      z: 5.5,
      yaw: 0,
      pitch: 0,
      speed: 15,
      keys: { w: false, a: false, s: false, d: false, space: false, shift: false },
      isMouseDown: false,
      lastMouseX: 0,
      lastMouseY: 0,
    },

    // 3D Model Parçaları
    hunterGroup: null,
    hunterAimGroup: null,
    hunterHeadGroup: null,
    treeGroup: null,
    monkeyGroup: null,
    monkeyArmL: null,
    monkeyArmR: null,
    monkeyLegL: null,
    monkeyLegR: null,
    monkeyTail: null,
    bulletMesh: null,
    bananaGroup: null,
    dartGroup: null,

    // Sabit Performanslı Çift Katmanlı Neon Trail Buffer
    trailLine: null,
    trailGlowLine: null,
    trailPositions: new Float32Array(400 * 3),
    trailCount: 0,

    remoteControllerMesh: null,
    remoteButtonMesh: null,
    remoteScreenMat: null,

    simTime: 0,
    isPlaying: false,
    isPaused: false,
    bulletPos: new THREE.Vector3(0, 2.2, 0),
    bulletVel: new THREE.Vector3(0, 0, 0),
    monkeyPos: new THREE.Vector3(50, 30, 0),
    monkeyVelY: 0,
    monkeyFalling: false,
  });

  const getAimAngle = useCallback(() => {
    if (!isAutoAim && aimAngle !== null) {
      return (aimAngle * Math.PI) / 180;
    }
    const dx = hunterDistance;
    const dy = treeHeight - 2.2;
    return Math.atan2(dy, dx);
  }, [hunterDistance, treeHeight, isAutoAim, aimAngle]);

  // Canlı Simülasyon Parametreleri Ref'i (Three.js Sahnesini Asla Sıfırlamaz / Resetlemez)
  const paramsRef = useRef({
    hunterDistance,
    treeHeight,
    muzzleVelocity,
    gravity,
    monkeyDropDelay,
    projectileType,
    timeScale,
    cameraMode,
    getAimAngle,
    onHit,
    onMiss,
    onStatsUpdate,
  });

  useEffect(() => {
    paramsRef.current = {
      hunterDistance,
      treeHeight,
      muzzleVelocity,
      gravity,
      monkeyDropDelay,
      projectileType,
      timeScale,
      cameraMode,
      getAimAngle,
      onHit,
      onMiss,
      onStatsUpdate,
    };
  });

  // Duraklat / Devam Et Fonksiyonu (Bullet Time)
  const handleTogglePause = useCallback(() => {
    const r = refs.current;
    if (!r.isPlaying) return;
    r.isPaused = !r.isPaused;
    setIsPaused(r.isPaused);
  }, []);

  // Ateşleme Fonksiyonu
  const handleFireRemote = useCallback(() => {
    const r = refs.current;
    if (r.isPlaying) return;

    if (r.remoteButtonMesh) {
      r.remoteButtonMesh.position.y = 0.07;
      setTimeout(() => {
        if (r.remoteButtonMesh) r.remoteButtonMesh.position.y = 0.11;
      }, 150);
    }

    if (r.remoteScreenMat) {
      r.remoteScreenMat.color.setHex(0x10b981);
      setTimeout(() => {
        if (r.remoteScreenMat) r.remoteScreenMat.color.setHex(0x06b6d4);
      }, 250);
    }

    soundFX.playShoot();

    const theta = getAimAngle();
    const v0 = muzzleVelocity;

    r.simTime = 0;
    r.isPlaying = true;
    r.isPaused = false;
    setIsPaused(false);
    r.monkeyFalling = false;
    r.monkeyVelY = 0;
    r.trailCount = 0;

    const cannonLen = 4.2;
    r.bulletPos.set(
      Math.cos(theta) * cannonLen,
      2.2 + Math.sin(theta) * cannonLen,
      0
    );
    r.bulletVel.set(v0 * Math.cos(theta), v0 * Math.sin(theta), 0);

    if (r.bulletMesh) {
      r.bulletMesh.visible = true;
      r.bulletMesh.position.copy(r.bulletPos);
      r.bulletMesh.rotation.set(0, 0, theta);
    }

    if (r.trailLine) {
      r.trailLine.geometry.setDrawRange(0, 0);
      r.trailLine.visible = false;
    }

    if (r.trailGlowLine) {
      r.trailGlowLine.geometry.setDrawRange(0, 0);
      r.trailGlowLine.visible = false;
    }

    setSimState("flying");
  }, [getAimAngle, muzzleVelocity]);

  // Sıfırlama
  const handleReset = useCallback(() => {
    const r = refs.current;
    r.isPlaying = false;
    r.isPaused = false;
    setIsPaused(false);
    r.simTime = 0;
    r.monkeyFalling = false;
    r.monkeyVelY = 0;
    r.trailCount = 0;

    const theta = getAimAngle();
    r.bulletPos.set(0, 2.2, 0);
    r.monkeyPos.set(hunterDistance, treeHeight, 0);

    if (r.bulletMesh) {
      r.bulletMesh.visible = false;
      r.bulletMesh.position.copy(r.bulletPos);
      r.bulletMesh.rotation.set(0, 0, theta);
    }

    if (r.monkeyGroup) {
      r.monkeyGroup.position.set(hunterDistance, treeHeight, 0);
      r.monkeyGroup.rotation.set(0, 0, 0);
      if (r.monkeyArmL && r.monkeyArmR) {
        r.monkeyArmL.rotation.set(0, 0, 0);
        r.monkeyArmR.rotation.set(0, 0, 0);
      }
      if (r.monkeyLegL && r.monkeyLegR) {
        r.monkeyLegL.rotation.set(0, 0, 0);
        r.monkeyLegR.rotation.set(0, 0, 0);
      }
    }

    if (r.trailLine) {
      r.trailLine.geometry.setDrawRange(0, 0);
      r.trailLine.visible = false;
    }

    if (r.trailGlowLine) {
      r.trailGlowLine.geometry.setDrawRange(0, 0);
      r.trailGlowLine.visible = false;
    }

    // Doğrudan DOM telemetri sıfırlaması (Sıfır React re-render)
    if (hudTimeRef.current) hudTimeRef.current.textContent = "0.00s";
    if (hudBulletRef.current) hudBulletRef.current.textContent = "X: 0.0m | Y: 2.2m";
    if (hudSpeedRef.current) hudSpeedRef.current.textContent = `${muzzleVelocity.toFixed(1)} m/s`;
    if (hudMonkeyRef.current) hudMonkeyRef.current.textContent = `${treeHeight.toFixed(1)}m`;
    if (hudDeltaHRef.current) hudDeltaHRef.current.textContent = "0.00m";
    if (hudDistRef.current) hudDistRef.current.textContent = `${hunterDistance.toFixed(1)}m`;
    if (hudAngleRef.current) hudAngleRef.current.textContent = `${((theta * 180) / Math.PI).toFixed(1)}°`;

    setSimState("idle");

    onStatsUpdate({
      simTime: "0.00",
      bulletX: "0.0",
      bulletY: "2.2",
      bulletSpeed: muzzleVelocity.toFixed(1),
      monkeyY: treeHeight.toFixed(1),
      deltaH: "0.00",
      distToMonkey: hunterDistance.toFixed(1),
      angleDeg: ((theta * 180) / Math.PI).toFixed(1),
    });
  }, [hunterDistance, treeHeight, muzzleVelocity, getAimAngle, onStatsUpdate]);

  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Parametreler değiştikçe 3D nesneleri doğrudan ref üzerinden güncelle (Sadece boştayken)
  useEffect(() => {
    const r = refs.current;
    if (!r.isPlaying && !r.isPaused) {
      if (r.treeGroup) {
        r.treeGroup.position.set(hunterDistance, 0, 0);
        r.treeGroup.scale.set(1, treeHeight / 30, 1);
      }
      if (r.monkeyGroup) {
        r.monkeyGroup.position.set(hunterDistance, treeHeight, 0);
      }
      const theta = getAimAngle();
      if (r.hunterAimGroup) {
        r.hunterAimGroup.rotation.z = theta;
      }
      if (r.hunterHeadGroup) {
        r.hunterHeadGroup.rotation.z = theta * 0.35;
      }
      r.monkeyPos.set(hunterDistance, treeHeight, 0);
    }
  }, [hunterDistance, treeHeight, getAimAngle]);

  // Mermi Tipi Değişimi (Sahneyi Resetlemeden Anında Geçiş)
  useEffect(() => {
    const r = refs.current;
    if (r.bananaGroup && r.dartGroup) {
      r.bananaGroup.visible = projectileType === "banana";
      r.dartGroup.visible = projectileType !== "banana";
    }
    if (r.trailGlowLine && r.trailGlowLine.material) {
      r.trailGlowLine.material.color.setHex(projectileType === "banana" ? 0xfacc15 : 0x38bdf8);
    }
  }, [projectileType]);

  // Klavye Dinleyicisi
  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      const p = refs.current.player;
      if (k === "w" || k === "arrowup") p.keys.w = true;
      if (k === "s" || k === "arrowdown") p.keys.s = true;
      if (k === "a" || k === "arrowleft") p.keys.a = true;
      if (k === "d" || k === "arrowright") p.keys.d = true;
      if (k === " " || e.code === "Space") {
        p.keys.space = true;
        e.preventDefault();
      }
      if (k === "shift" || k === "c") p.keys.shift = true;
      if (k === "e") {
        handleFireRemote();
      }
      if (k === "g" || k === "h" || k === "p") {
        handleTogglePause();
      }
    };

    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      const p = refs.current.player;
      if (k === "w" || k === "arrowup") p.keys.w = false;
      if (k === "s" || k === "arrowdown") p.keys.s = false;
      if (k === "a" || k === "arrowleft") p.keys.a = false;
      if (k === "d" || k === "arrowright") p.keys.d = false;
      if (k === " " || e.code === "Space") p.keys.space = false;
      if (k === "shift" || k === "c") p.keys.shift = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleFireRemote, handleTogglePause]);

  const handleMouseDown = (e) => {
    const p = refs.current.player;
    p.isMouseDown = true;
    p.lastMouseX = e.clientX;
    p.lastMouseY = e.clientY;
  };

  const handleMouseMove = (e) => {
    const p = refs.current.player;
    if (!p.isMouseDown) return;

    const dx = e.clientX - p.lastMouseX;
    const dy = e.clientY - p.lastMouseY;
    p.lastMouseX = e.clientX;
    p.lastMouseY = e.clientY;

    p.yaw -= dx * 0.0035;
    p.pitch -= dy * 0.0035;
    p.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, p.pitch));
  };

  const handleMouseUp = () => {
    refs.current.player.isMouseDown = false;
  };

  // -------------------------------------------------------------
  // THREE.JS SAHNE & ULTRA GERÇEKÇİ 3D SİSTEM
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const currentRefs = refs.current;
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa5d8ff);
    scene.fog = new THREE.FogExp2(0xa5d8ff, 0.0035);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 800);
    camera.position.set(0, 2.3, 5.5);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: "high-performance",
      precision: "highp",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    currentRefs.scene = scene;
    currentRefs.camera = camera;
    currentRefs.renderer = renderer;

    // Aydınlatma
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334433, 0.85);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.6);
    sunLight.position.set(-50, 95, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Zemin
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.8,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(300, 30, 0x1e3a8a, 0x86efac);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // Sabit 3D Bulutlar
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    STATIC_CLOUDS.forEach((c) => {
      const cg = new THREE.Group();
      cg.position.set(c.x, c.y, c.z);
      cg.scale.set(c.s, c.s, c.s);
      const c1 = new THREE.Mesh(new THREE.SphereGeometry(3.2, 12, 12), cloudMat);
      const c2 = new THREE.Mesh(new THREE.SphereGeometry(4.2, 12, 12), cloudMat);
      c2.position.set(3, 1, 0);
      const c3 = new THREE.Mesh(new THREE.SphereGeometry(2.8, 12, 12), cloudMat);
      c3.position.set(-2.6, 0, 1);
      cg.add(c1, c2, c3);
      scene.add(cg);
    });

    // Sabit Orman Ağaçları
    const bgTreeMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
    const bgTrunkMat = new THREE.MeshStandardMaterial({ color: 0x592308, roughness: 0.9 });
    STATIC_FOREST_TREES.forEach((tr) => {
      const tg = new THREE.Group();
      tg.position.set(tr.x, 0, tr.z);
      const tMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, tr.h, 10), bgTrunkMat);
      tMesh.position.y = tr.h / 2;
      tg.add(tMesh);
      const tc = new THREE.Mesh(new THREE.SphereGeometry(tr.h * 0.36, 10, 10), bgTreeMat);
      tc.position.y = tr.h;
      tg.add(tc);
      scene.add(tg);
    });

    // Platform
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.6, 14),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 })
    );
    platform.position.set(0, 0.3, 0);
    platform.receiveShadow = true;
    scene.add(platform);

    // =========================================================
    // 1. ELDEKİ 3D FÜTÜRİSTİK TAKTİK KUMANDA (VIEWMODEL)
    // =========================================================
    const remoteGroup = new THREE.Group();
    remoteGroup.position.set(0.42, -0.32, -0.75);
    remoteGroup.rotation.set(-0.25, -0.32, 0.12);

    const remoteBodyMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.9,
      roughness: 0.2,
    });
    const remoteBody = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.54, 0.11), remoteBodyMat);
    remoteGroup.add(remoteBody);

    const screenMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const remoteScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.16), screenMat);
    remoteScreen.position.set(0, 0.12, 0.058);
    remoteGroup.add(remoteScreen);
    currentRefs.remoteScreenMat = screenMat;

    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.016, 0.25, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
    );
    antenna.position.set(-0.13, 0.36, 0);
    remoteGroup.add(antenna);

    const rBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.05, 24),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.6 })
    );
    rBtn.rotation.x = Math.PI / 2;
    rBtn.position.set(0, -0.1, 0.07);
    remoteGroup.add(rBtn);
    currentRefs.remoteButtonMesh = rBtn;

    camera.add(remoteGroup);
    scene.add(camera);
    currentRefs.remoteControllerMesh = remoteGroup;

    // =========================================================
    // PROCEDURAL DOKULAR
    // =========================================================
    const texFurDark = createFurTexture("#381d0a", "#1b0c03");
    const texFurChest = createFurTexture("#eab308", "#ca8a04");
    const texFabricVest = createFabricTexture("#1d4ed8", "#1e3a8a");
    const texFabricPants = createFabricTexture("#3f6212", "#1a2e05");
    const texLeather = createLeatherTexture("#2d180c");
    const texWoodRifle = createWoodGrainTexture();
    const texBark = createTreeBarkTexture();

    // =========================================================
    // 2. ULTRA GERÇEKÇİ 3D AVCI (HUNTER) MODELİ
    // =========================================================
    const hunterGroup = new THREE.Group();
    hunterGroup.position.set(0, 0.6, 0);

    const bootLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x3d2011,
      roughness: 0.55,
      metalness: 0.15,
      map: texLeather || null,
    });
    const soleRubberMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const brassEyeletMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });

    const createMasterpieceBoot = (x, isFront) => {
      const bg = new THREE.Group();
      bg.position.set(x, 0, isFront ? 0.14 : -0.12);

      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.13, 0.8), soleRubberMat);
      sole.position.set(0, 0.065, 0.1);
      sole.castShadow = true;
      bg.add(sole);

      const heel = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.32), soleRubberMat);
      heel.position.set(0, 0.16, -0.14);
      bg.add(heel);

      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.45, 16), bootLeatherMat);
      upper.position.set(0, 0.35, 0);
      upper.scale.set(0.95, 1, 1.4);
      upper.castShadow = true;
      bg.add(upper);

      const toeCap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), bootLeatherMat);
      toeCap.position.set(0, 0.22, 0.34);
      toeCap.scale.set(1.05, 0.75, 1.15);
      bg.add(toeCap);

      for (let i = 0; i < 4; i++) {
        const eyeletY = 0.28 + i * 0.08;
        const eyeletZ = 0.06 + i * 0.04;
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), brassEyeletMat);
        eyeL.position.set(-0.1, eyeletY, eyeletZ);
        bg.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), brassEyeletMat);
        eyeR.position.set(0.1, eyeletY, eyeletZ);
        bg.add(eyeR);

        const lace = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, 0.21, 6),
          new THREE.MeshStandardMaterial({ color: 0x78350f })
        );
        lace.rotation.z = Math.PI / 2;
        lace.position.set(0, eyeletY, eyeletZ);
        bg.add(lace);
      }

      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.18, 16), bootLeatherMat);
      collar.position.set(0, 0.58, 0);
      bg.add(collar);

      return bg;
    };
    hunterGroup.add(createMasterpieceBoot(-0.36, true));
    hunterGroup.add(createMasterpieceBoot(0.36, false));

    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x365314,
      roughness: 0.75,
      map: texFabricPants || null,
    });

    const createLeg = (x, rotX) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(x, 1.15, 0);
      legGroup.rotation.x = rotX;

      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.21, 0.65, 16), pantsMat);
      thigh.position.y = 0.28;
      thigh.castShadow = true;
      legGroup.add(thigh);

      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 14), pantsMat);
      knee.position.set(0, -0.02, 0.04);
      legGroup.add(knee);

      const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.18, 0.65, 16), pantsMat);
      calf.position.y = -0.32;
      calf.castShadow = true;
      legGroup.add(calf);

      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 0.26), pantsMat);
      pocket.position.set(x > 0 ? 0.22 : -0.22, 0.22, 0);
      legGroup.add(pocket);

      const pocketFlap = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.08, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x24380d, roughness: 0.8 })
      );
      pocketFlap.position.set(x > 0 ? 0.22 : -0.22, 0.38, 0);
      legGroup.add(pocketFlap);

      return legGroup;
    };
    hunterGroup.add(createLeg(-0.36, 0.08));
    hunterGroup.add(createLeg(0.36, -0.06));

    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x1f140d,
      roughness: 0.5,
      metalness: 0.2,
      map: texLeather || null,
    });
    const belt = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.18, 0.72), beltMat);
    belt.position.set(0, 1.76, 0);
    hunterGroup.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.08), brassEyeletMat);
    buckle.position.set(0, 1.76, 0.38);
    hunterGroup.add(buckle);

    const bulletGoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
    for (let i = 0; i < 4; i++) {
      const cartridge = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 10), bulletGoldMat);
      cartridge.position.set(0.22 + i * 0.09, 1.76, 0.38);
      hunterGroup.add(cartridge);
    }

    const canteenGroup = new THREE.Group();
    canteenGroup.position.set(-0.62, 1.64, 0.12);
    const canteenBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.34, 14),
      new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.6, roughness: 0.4 })
    );
    canteenGroup.add(canteenBody);
    const canteenCap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 10), brassEyeletMat);
    canteenCap.position.y = 0.21;
    canteenGroup.add(canteenCap);
    hunterGroup.add(canteenGroup);

    const vestMat = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      roughness: 0.65,
      metalness: 0.1,
      map: texFabricVest || null,
    });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });

    const shirt = new THREE.Mesh(new THREE.BoxGeometry(1.08, 1.28, 0.64), shirtMat);
    shirt.position.set(0, 2.38, 0);
    hunterGroup.add(shirt);

    const vest = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.25, 0.7), vestMat);
    vest.position.set(0, 2.38, 0);
    vest.castShadow = true;
    hunterGroup.add(vest);

    const epauletL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.58), vestMat);
    epauletL.position.set(-0.48, 3.02, 0);
    hunterGroup.add(epauletL);
    const epauletR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.58), vestMat);
    epauletR.position.set(0.48, 3.02, 0);
    hunterGroup.add(epauletR);

    const pocketMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.6 });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.1), pocketMat);
    p1.position.set(-0.33, 2.6, 0.37);
    hunterGroup.add(p1);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.1), pocketMat);
    p2.position.set(0.33, 2.6, 0.37);
    hunterGroup.add(p2);
    const p3 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.1), pocketMat);
    p3.position.set(-0.33, 2.15, 0.37);
    hunterGroup.add(p3);
    const p4 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.1), pocketMat);
    p4.position.set(0.33, 2.15, 0.37);
    hunterGroup.add(p4);

    const zipper = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 1.0, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 })
    );
    zipper.position.set(0, 2.38, 0.37);
    hunterGroup.add(zipper);

    const radioGroup = new THREE.Group();
    radioGroup.position.set(-0.48, 2.9, 0.34);
    const radioBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.24, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    radioGroup.add(radioBody);
    const radioAnt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.28, 8),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    radioAnt.position.set(-0.04, 0.22, 0);
    radioGroup.add(radioAnt);
    hunterGroup.add(radioGroup);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfac7a0, roughness: 0.55 });
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.32, 16), skinMat);
    neck.position.set(0, 3.08, 0);
    hunterGroup.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 3.42, 0);

    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 24), skinMat);
    cranium.scale.set(0.95, 1.05, 1.0);
    cranium.castShadow = true;
    headGroup.add(cranium);

    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.36, 0.45), skinMat);
    jaw.position.set(0, -0.18, 0.16);
    headGroup.add(jaw);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 12), skinMat);
    nose.position.set(0, -0.06, 0.54);
    nose.rotation.x = Math.PI / 1.1;
    headGroup.add(nose);

    const mustache = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.1, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
    );
    mustache.position.set(0, -0.18, 0.48);
    headGroup.add(mustache);

    const earMat = new THREE.MeshStandardMaterial({ color: 0xfac7a0, roughness: 0.6 });
    const earL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), earMat);
    earL.position.set(-0.48, 0, 0);
    earL.scale.set(0.6, 1.1, 0.8);
    headGroup.add(earL);

    const earR = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), earMat);
    earR.position.set(0.48, 0, 0);
    earR.scale.set(0.6, 1.1, 0.8);
    headGroup.add(earR);

    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.06, 0.46);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.15 });
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.95,
      roughness: 0.05,
    });

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.03), frameMat);
    glassesGroup.add(bridge);

    const lensL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 16), lensMat);
    lensL.rotation.x = Math.PI / 2;
    lensL.position.set(-0.16, -0.04, 0);
    glassesGroup.add(lensL);

    const lensR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 16), lensMat);
    lensR.rotation.x = Math.PI / 2;
    lensR.position.set(0.16, -0.04, 0);
    glassesGroup.add(lensR);

    headGroup.add(glassesGroup);

    const hatMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.65,
    });
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.08, 36), hatMat);
    hatBrim.position.set(0, 0.36, 0);
    hatBrim.rotation.x = -0.05;
    headGroup.add(hatBrim);

    const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.66, 0.55, 24), hatMat);
    hatCrown.position.set(0, 0.64, 0);
    hatCrown.scale.set(0.9, 1, 1.08);
    hatCrown.castShadow = true;
    headGroup.add(hatCrown);

    const hatBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.68, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8 })
    );
    hatBand.position.set(0, 0.46, 0);
    headGroup.add(hatBand);

    hunterGroup.add(headGroup);
    currentRefs.hunterHeadGroup = headGroup;

    // NİŞAN GRUBU: TÜFEK + KOLLAR VE ELLER (BİRLİKTE NİŞAN ALIR)
    const hunterAimGroup = new THREE.Group();
    hunterAimGroup.position.set(0, 2.2, 0);

    const rifleWoodMat = new THREE.MeshStandardMaterial({
      color: 0x3d1a04,
      roughness: 0.45,
      metalness: 0.1,
      map: texWoodRifle || null,
    });
    const rifleSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.95,
      roughness: 0.15,
    });

    const buttStock = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.38, 0.15), rifleWoodMat);
    buttStock.position.set(-0.55, -0.12, 0.28);
    hunterAimGroup.add(buttStock);

    const recoilPad = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.42, 0.17),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
    );
    recoilPad.position.set(-0.98, -0.12, 0.28);
    hunterAimGroup.add(recoilPad);

    const forend = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.16), rifleWoodMat);
    forend.position.set(0.65, 0, 0.28);
    hunterAimGroup.add(forend);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 4.2, 24), rifleSteelMat);
    barrel.rotation.z = -Math.PI / 2;
    barrel.position.set(2.1, 0, 0);
    barrel.castShadow = true;
    hunterAimGroup.add(barrel);

    const muzzleBrake = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
    );
    muzzleBrake.rotation.z = -Math.PI / 2;
    muzzleBrake.position.set(4.25, 0, 0);
    hunterAimGroup.add(muzzleBrake);

    const scopeMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9, roughness: 0.2 });
    const scopeTube = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.6, 16), scopeMat);
    scopeTube.rotation.z = -Math.PI / 2;
    scopeTube.position.set(0.8, 0.32, 0.28);
    hunterAimGroup.add(scopeTube);

    const scopeBell = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.11, 0.38, 16), scopeMat);
    scopeBell.rotation.z = -Math.PI / 2;
    scopeBell.position.set(1.65, 0.32, 0.28);
    hunterAimGroup.add(scopeBell);

    const scopeLensGlass = new THREE.Mesh(
      new THREE.CircleGeometry(0.14, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.95, roughness: 0.05 })
    );
    scopeLensGlass.rotation.y = Math.PI / 2;
    scopeLensGlass.position.set(1.85, 0.32, 0.28);
    hunterAimGroup.add(scopeLensGlass);

    const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12), scopeMat);
    turret.position.set(0.8, 0.44, 0.28);
    hunterAimGroup.add(turret);

    const triggerGuard = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.02, 8, 16, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
    );
    triggerGuard.position.set(0.15, -0.16, 0.28);
    triggerGuard.rotation.z = Math.PI;
    hunterAimGroup.add(triggerGuard);

    const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.65 });

    const hArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 1.1, 14), sleeveMat);
    hArmL.position.set(0.65, -0.38, -0.05);
    hArmL.rotation.set(0.4, 0, -0.6);
    hunterAimGroup.add(hArmL);

    const hHandL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), skinMat);
    hHandL.position.set(1.1, -0.12, 0.25);
    hunterAimGroup.add(hHandL);

    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 8), skinMat);
      finger.position.set(1.02 + f * 0.05, -0.05, 0.36);
      finger.rotation.x = Math.PI / 2.5;
      hunterAimGroup.add(finger);
    }

    const hArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.9, 14), sleeveMat);
    hArmR.position.set(-0.15, -0.32, 0.45);
    hArmR.rotation.set(-0.3, 0, 0.4);
    hunterAimGroup.add(hArmR);

    const hHandR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), skinMat);
    hHandR.position.set(0.12, -0.12, 0.32);
    hunterAimGroup.add(hHandR);

    scene.add(hunterAimGroup);
    currentRefs.hunterAimGroup = hunterAimGroup;

    scene.add(hunterGroup);
    currentRefs.hunterGroup = hunterGroup;

    // =========================================================
    // 3. ULTRA GERÇEKÇİ 3D MAYMUN (CHIMPANZEE / MONKEY) MODELİ
    // =========================================================
    const monkeyGroup = new THREE.Group();
    monkeyGroup.position.set(hunterDistance, treeHeight, 0);

    const furMat = new THREE.MeshStandardMaterial({
      color: 0x3b1e08,
      roughness: 0.85,
      metalness: 0.05,
      map: texFurDark || null,
    });
    const monkeySkinMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.6,
      metalness: 0.05,
      map: texFurChest || null,
    });
    const earOuterMat = new THREE.MeshStandardMaterial({ color: 0x2b1506, roughness: 0.8 });

    const mTorso = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 24), furMat);
    mTorso.scale.set(0.96, 1.45, 0.96);
    mTorso.castShadow = true;
    monkeyGroup.add(mTorso);

    const mChest = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 20), monkeySkinMat);
    mChest.position.set(0, 0.12, 0.58);
    mChest.scale.set(0.9, 1.3, 0.45);
    monkeyGroup.add(mChest);

    const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), furMat);
    shoulderL.position.set(-0.98, 0.9, 0);
    monkeyGroup.add(shoulderL);

    const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), furMat);
    shoulderR.position.set(0.98, 0.9, 0);
    monkeyGroup.add(shoulderR);

    const mHeadGroup = new THREE.Group();
    mHeadGroup.position.set(0, 1.68, 0);

    const mCranium = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 24), furMat);
    mCranium.castShadow = true;
    mHeadGroup.add(mCranium);

    const mMuzzle = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 20), monkeySkinMat);
    mMuzzle.position.set(0, -0.16, 0.52);
    mMuzzle.scale.set(1.08, 0.82, 0.72);
    mHeadGroup.add(mMuzzle);

    const mBrow = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.24, 0.38), monkeySkinMat);
    mBrow.position.set(0, 0.2, 0.65);
    mHeadGroup.add(mBrow);

    const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x180b03 });
    const nostrilL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), nostrilMat);
    nostrilL.position.set(-0.11, -0.05, 1.0);
    mHeadGroup.add(nostrilL);
    const nostrilR = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), nostrilMat);
    nostrilR.position.set(0.11, -0.05, 1.0);
    mHeadGroup.add(nostrilR);

    const mouthMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.035, 8, 24, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x240e03 })
    );
    mouthMesh.position.set(0, -0.24, 0.98);
    mouthMesh.rotation.z = Math.PI;
    mHeadGroup.add(mouthMesh);

    const createPrimateEye = (x) => {
      const eg = new THREE.Group();
      eg.position.set(x, 0.18, 0.76);
      const eW = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      const eIris = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), new THREE.MeshBasicMaterial({ color: 0x78350f }));
      eIris.position.set(0, 0, 0.08);
      const ePupil = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), new THREE.MeshBasicMaterial({ color: 0x090d16 }));
      ePupil.position.set(0, 0, 0.13);
      const eGlint = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      eGlint.position.set(0.04, 0.04, 0.16);
      eg.add(eW, eIris, ePupil, eGlint);
      return eg;
    };
    mHeadGroup.add(createPrimateEye(-0.26));
    mHeadGroup.add(createPrimateEye(0.26));

    const mEarL = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 18), earOuterMat);
    mEarL.position.set(-0.88, 0.2, 0);
    mHeadGroup.add(mEarL);
    const mEarInL = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), monkeySkinMat);
    mEarInL.position.set(-0.9, 0.2, 0.15);
    mHeadGroup.add(mEarInL);

    const mEarR = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 18), earOuterMat);
    mEarR.position.set(0.88, 0.2, 0);
    mHeadGroup.add(mEarR);
    const mEarInR = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), monkeySkinMat);
    mEarInR.position.set(0.9, 0.2, 0.15);
    mHeadGroup.add(mEarInR);

    monkeyGroup.add(mHeadGroup);

    // Kollar & Dalı Kavrayan Parmaklar (Omuz Pivotlu)
    const armLGroup = new THREE.Group();
    armLGroup.position.set(-0.95, 0.9, 0);

    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 1.4, 16), furMat);
    armL.position.set(-0.35, 0.45, 0);
    armL.rotation.z = 0.65;
    armL.castShadow = true;
    armLGroup.add(armL);

    const handLGroup = new THREE.Group();
    handLGroup.position.set(-0.7, 0.92, 0);
    const palmL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.32), monkeySkinMat);
    handLGroup.add(palmL);
    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.26, 8), monkeySkinMat);
      finger.position.set(-0.1 + f * 0.07, 0.12, 0.14);
      finger.rotation.x = Math.PI / 3;
      handLGroup.add(finger);
    }
    const thumbL = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 8), monkeySkinMat);
    thumbL.position.set(-0.16, -0.08, -0.1);
    thumbL.rotation.z = Math.PI / 3;
    handLGroup.add(thumbL);
    armLGroup.add(handLGroup);

    monkeyGroup.add(armLGroup);
    currentRefs.monkeyArmL = armLGroup;

    const armRGroup = new THREE.Group();
    armRGroup.position.set(0.95, 0.9, 0);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 1.4, 16), furMat);
    armR.position.set(0.35, 0.45, 0);
    armR.rotation.z = -0.65;
    armR.castShadow = true;
    armRGroup.add(armR);

    const handRGroup = new THREE.Group();
    handRGroup.position.set(0.7, 0.92, 0);
    const palmR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.32), monkeySkinMat);
    handRGroup.add(palmR);
    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.26, 8), monkeySkinMat);
      finger.position.set(-0.1 + f * 0.07, 0.12, 0.14);
      finger.rotation.x = Math.PI / 3;
      handRGroup.add(finger);
    }
    const thumbR = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 8), monkeySkinMat);
    thumbR.position.set(0.16, -0.08, -0.1);
    thumbR.rotation.z = -Math.PI / 3;
    handRGroup.add(thumbR);
    armRGroup.add(handRGroup);

    monkeyGroup.add(armRGroup);
    currentRefs.monkeyArmR = armRGroup;

    const legLGroup = new THREE.Group();
    legLGroup.position.set(-0.48, -0.85, 0.1);
    const legLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 1.35, 16), furMat);
    legLMesh.position.y = -0.45;
    legLGroup.add(legLMesh);
    const footLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.44), monkeySkinMat);
    footLMesh.position.set(0, -1.15, 0.1);
    legLGroup.add(footLMesh);
    monkeyGroup.add(legLGroup);
    currentRefs.monkeyLegL = legLGroup;

    const legRGroup = new THREE.Group();
    legRGroup.position.set(0.48, -0.85, 0.1);
    const legRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 1.35, 16), furMat);
    legRMesh.position.y = -0.45;
    legRGroup.add(legRMesh);
    const footRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.44), monkeySkinMat);
    footRMesh.position.set(0, -1.15, 0.1);
    legRGroup.add(footRMesh);
    monkeyGroup.add(legRGroup);
    currentRefs.monkeyLegR = legRGroup;

    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.75, -0.45),
      new THREE.Vector3(0.7, -1.1, -1.05),
      new THREE.Vector3(1.35, -0.65, -0.85),
      new THREE.Vector3(1.7, 0.25, -0.45),
      new THREE.Vector3(1.4, 0.95, -0.2),
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 32, 0.13, 14, false);
    const tailMesh = new THREE.Mesh(tailGeo, furMat);
    tailMesh.castShadow = true;
    monkeyGroup.add(tailMesh);
    currentRefs.monkeyTail = tailMesh;

    scene.add(monkeyGroup);
    currentRefs.monkeyGroup = monkeyGroup;

    // =========================================================
    // 4. HEDEF AĞAÇ (TREE)
    // Gövde x = 3.8m'dedir; maymun dalda asılı durur ve açık havaya düşer!
    // =========================================================
    const baseTreeH = 30;
    const treeGroup = new THREE.Group();
    treeGroup.position.set(hunterDistance, 0, 0);

    const trunkGeo = new THREE.CylinderGeometry(1.15, 1.8, baseTreeH + 7, 24);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x5d4037,
      roughness: 0.95,
      map: texBark || null,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(3.8, (baseTreeH + 7) / 2, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    const branchGeo = new THREE.CylinderGeometry(0.34, 0.48, 6.4, 18);
    const branch = new THREE.Mesh(branchGeo, trunkMat);
    branch.rotation.z = Math.PI / 2;
    branch.position.set(0.7, baseTreeH + 1.82, 0);
    branch.castShadow = true;
    treeGroup.add(branch);

    const subBranch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.28, 2.6, 12),
      trunkMat
    );
    subBranch.position.set(1.4, baseTreeH + 2.8, 0.6);
    subBranch.rotation.set(0.4, 0.3, -Math.PI / 3);
    subBranch.castShadow = true;
    treeGroup.add(subBranch);

    const lMat1 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });
    const lMat2 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.65 });
    const lMat3 = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.55 });

    const crownMain = new THREE.Mesh(new THREE.SphereGeometry(5.6, 20, 20), lMat1);
    crownMain.position.set(3.8, baseTreeH + 6.2, 0);
    crownMain.castShadow = true;
    treeGroup.add(crownMain);

    const crownL = new THREE.Mesh(new THREE.SphereGeometry(4.4, 18, 18), lMat2);
    crownL.position.set(1.8, baseTreeH + 4.8, 1.4);
    crownL.castShadow = true;
    treeGroup.add(crownL);

    const crownR = new THREE.Mesh(new THREE.SphereGeometry(4.5, 18, 18), lMat3);
    crownR.position.set(5.6, baseTreeH + 4.5, -1.4);
    crownR.castShadow = true;
    treeGroup.add(crownR);

    const branchFoliage1 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 14, 14), lMat3);
    branchFoliage1.position.set(-1.8, baseTreeH + 2.4, 0.3);
    branchFoliage1.castShadow = true;
    treeGroup.add(branchFoliage1);

    const branchFoliage2 = new THREE.Mesh(new THREE.SphereGeometry(1.3, 12, 12), lMat2);
    branchFoliage2.position.set(-2.4, baseTreeH + 1.8, -0.4);
    branchFoliage2.castShadow = true;
    treeGroup.add(branchFoliage2);

    treeGroup.scale.set(1, treeHeight / baseTreeH, 1);
    scene.add(treeGroup);
    currentRefs.treeGroup = treeGroup;

    // =========================================================
    // 5. PARLAK VE YÜKSEK GÖRÜNÜRLÜKLÜ 3D MERMİ (IŞIKLI / NEON)
    // =========================================================
    const bulletGroup = new THREE.Group();

    // Muz Modeli Grubu
    const bananaGroup = new THREE.Group();
    const bGeo = new THREE.TorusGeometry(0.88, 0.3, 16, 32, Math.PI * 0.8);
    const bMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
      metalness: 0.2,
      roughness: 0.25,
    });
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.rotation.z = -Math.PI * 0.4;
    bananaGroup.add(bMesh);

    const glowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      })
    );
    bananaGroup.add(glowMesh);
    bulletGroup.add(bananaGroup);
    currentRefs.bananaGroup = bananaGroup;

    // Dart Modeli Grubu
    const dartGroup = new THREE.Group();
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 1.6, 16),
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 1.0,
      })
    );
    tip.rotation.z = -Math.PI / 2;
    dartGroup.add(tip);

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 2.0, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
    );
    shaft.rotation.z = -Math.PI / 2;
    shaft.position.x = -1.0;
    dartGroup.add(shaft);

    const fin1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.04), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    fin1.position.x = -1.7;
    dartGroup.add(fin1);
    const fin2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.4), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    fin2.position.x = -1.7;
    dartGroup.add(fin2);
    bulletGroup.add(dartGroup);
    currentRefs.dartGroup = dartGroup;

    bananaGroup.visible = projectileType === "banana";
    dartGroup.visible = projectileType !== "banana";

    bulletGroup.visible = false;
    scene.add(bulletGroup);
    currentRefs.bulletMesh = bulletGroup;

    // =========================================================
    // 6. BELİRGİN VE SIFIR-KASMA ÇİFT KATMANLI NEON LAZER İZİ
    // =========================================================
    const trailBufferGeo = new THREE.BufferGeometry();
    trailBufferGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(currentRefs.trailPositions, 3)
    );
    trailBufferGeo.setDrawRange(0, 0);

    // Çekirdek Parlak Çizgi
    const trailLine = new THREE.Line(
      trailBufferGeo,
      new THREE.LineBasicMaterial({
        color: 0x00ffff,
      })
    );
    trailLine.visible = false;
    scene.add(trailLine);
    currentRefs.trailLine = trailLine;

    // Dış Parlama Çizgisi
    const trailGlowLine = new THREE.Line(
      trailBufferGeo,
      new THREE.LineBasicMaterial({
        color: projectileType === "banana" ? 0xfacc15 : 0x38bdf8,
      })
    );
    trailGlowLine.visible = false;
    scene.add(trailGlowLine);
    currentRefs.trailGlowLine = trailGlowLine;

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // =========================================================
    // 120 FPS PÜRÜZSÜZ ANİMASYON VE FİZİK DÖNGÜSÜ
    // =========================================================
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const {
        hunterDistance: curHunterDist,
        treeHeight: curTreeH,
        muzzleVelocity: curV0,
        gravity: curG,
        monkeyDropDelay: curDropDelay,
        timeScale: curTimeScale,
        cameraMode: curCameraMode,
        getAimAngle: curGetAimAngle,
        onHit: curOnHit,
        onMiss: curOnMiss,
        onStatsUpdate: curOnStatsUpdate,
      } = paramsRef.current;

      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      // Pürüzsüz delta-zaman filtresi: Ani atlamaları ve kasmayı tamamen yok eder
      const dt = Math.max(0.001, Math.min(rawDt, 0.022)) * curTimeScale;
      const r = refs.current;

      // UÇUŞ KONTROLLERİ
      const p = r.player;
      let moveForward = 0;
      let moveRight = 0;
      let moveUp = 0;

      if (p.keys.w) moveForward += 1;
      if (p.keys.s) moveForward -= 1;
      if (p.keys.a) moveRight -= 1;
      if (p.keys.d) moveRight += 1;
      if (p.keys.space) moveUp += 1;
      if (p.keys.shift) moveUp -= 1;

      if (moveForward !== 0 || moveRight !== 0 || moveUp !== 0) {
        const forwardX = -Math.sin(p.yaw);
        const forwardZ = -Math.cos(p.yaw);
        const rightX = Math.cos(p.yaw);
        const rightZ = -Math.sin(p.yaw);

        p.x += (forwardX * moveForward + rightX * moveRight) * p.speed * dt;
        p.z += (forwardZ * moveForward + rightZ * moveRight) * p.speed * dt;
        p.y += moveUp * p.speed * dt;

        p.y = Math.max(0.8, Math.min(85, p.y));
        p.x = Math.max(-60, Math.min(curHunterDist + 50, p.x));
        p.z = Math.max(-50, Math.min(70, p.z));
      }

      // KAMERA
      if (curCameraMode === "fps") {
        camera.position.set(p.x, p.y, p.z);
        r.tempLookDir.set(
          -Math.sin(p.yaw) * Math.cos(p.pitch),
          Math.sin(p.pitch),
          -Math.cos(p.yaw) * Math.cos(p.pitch)
        );
        r.tempTarget.copy(camera.position).add(r.tempLookDir);
        camera.lookAt(r.tempTarget);
        if (r.remoteControllerMesh) r.remoteControllerMesh.visible = true;
      } else if (curCameraMode === "scope") {
        camera.position.set(0.68, 2.55, 0.25);
        camera.lookAt(r.monkeyPos.x, r.monkeyPos.y, 0);
        if (r.remoteControllerMesh) r.remoteControllerMesh.visible = false;
      } else if (curCameraMode === "bullet" && r.isPlaying) {
        camera.position.set(r.bulletPos.x - 4, r.bulletPos.y + 1.6, r.bulletPos.z + 3);
        camera.lookAt(r.bulletPos.x + 8, r.bulletPos.y, 0);
        if (r.remoteControllerMesh) r.remoteControllerMesh.visible = false;
      } else if (curCameraMode === "side") {
        camera.position.set(curHunterDist * 0.45, curTreeH * 0.55 + 5, 45);
        camera.lookAt(curHunterDist * 0.48, curTreeH * 0.4, 0);
        if (r.remoteControllerMesh) r.remoteControllerMesh.visible = false;
      }

      // 3D FİZİK DÖNGÜSÜ (Dondurulduğunda fizik zamanı durur, kamera serbestçe gezinebilir)
      if (r.isPlaying && !r.isPaused) {
        r.simTime += dt;
        const curT = r.simTime;

        if (curT >= curDropDelay) {
          if (!r.monkeyFalling) {
            r.monkeyFalling = true;
            soundFX.playFall();
          }
          const tFall = curT - curDropDelay;
          const currentY = Math.max(0, curTreeH - 0.5 * curG * tFall * tFall);
          r.monkeyPos.y = currentY;
          r.monkeyVelY = -curG * tFall;

          if (r.monkeyGroup) {
            r.monkeyGroup.position.copy(r.monkeyPos);
            if (r.monkeyArmL && r.monkeyArmR) {
              r.monkeyArmL.rotation.z = -0.65 + Math.sin(curT * 22) * 0.35;
              r.monkeyArmR.rotation.z = 0.65 - Math.sin(curT * 22) * 0.35;
            }
            if (r.monkeyLegL && r.monkeyLegR) {
              r.monkeyLegL.rotation.x = Math.sin(curT * 20) * 0.45;
              r.monkeyLegR.rotation.x = -Math.sin(curT * 20) * 0.45;
            }
            r.monkeyGroup.rotation.z = Math.sin(curT * 12) * 0.15;
          }
        }

        const theta = curGetAimAngle();
        const v0 = curV0;
        const vx = v0 * Math.cos(theta);
        const vyInit = v0 * Math.sin(theta);

        r.bulletPos.x = vx * curT;
        r.bulletPos.y = 2.2 + vyInit * curT - 0.5 * curG * curT * curT;
        r.bulletVel.set(vx, vyInit - curG * curT, 0);

        if (r.bulletMesh) {
          r.bulletMesh.position.copy(r.bulletPos);
          // Mermi ve muz kendi etrafında fırıl fırıl dönmez; yörünge teğetine kilitlenerek dümdüz uçar
          const flightAngle = Math.atan2(r.bulletVel.y, r.bulletVel.x);
          r.bulletMesh.rotation.set(0, 0, flightAngle);
        }

        // Çift Katmanlı Neon İzi Çizgilerini Güncelle (Sıfır Ekstra Allocation)
        if (r.trailCount < 380) {
          const idx = r.trailCount * 3;
          r.trailPositions[idx] = r.bulletPos.x;
          r.trailPositions[idx + 1] = r.bulletPos.y;
          r.trailPositions[idx + 2] = r.bulletPos.z;
          r.trailCount++;

          if (r.trailLine && r.trailCount >= 2) {
            r.trailLine.visible = true;
            r.trailLine.geometry.attributes.position.needsUpdate = true;
            r.trailLine.geometry.setDrawRange(0, r.trailCount);
          }

          if (r.trailGlowLine && r.trailCount >= 2) {
            r.trailGlowLine.visible = true;
            r.trailGlowLine.geometry.attributes.position.needsUpdate = true;
            r.trailGlowLine.geometry.setDrawRange(0, r.trailCount);
          }
        }

        const distToMonkey = r.bulletPos.distanceTo(r.monkeyPos);
        const dyToMonkey = Math.abs(r.bulletPos.y - r.monkeyPos.y);

        // =========================================================
        // TAM ENTITY'YE DEĞME (SIFIR HAVA BOŞLUĞU İLE TEMAS)
        // =========================================================
        const isImpactX = r.bulletPos.x >= curHunterDist - 0.35;
        const isCloseEnough = distToMonkey <= 2.2;

        if (
          (isImpactX && dyToMonkey <= 2.2 && r.bulletPos.y > 0.2) ||
          (isCloseEnough && r.bulletPos.x >= curHunterDist * 0.88)
        ) {
          // Mermiyi tam varlığın göğsüne kenetle
          r.bulletPos.x = curHunterDist - 0.22;
          r.bulletPos.y = r.monkeyPos.y + 0.05;
          r.bulletPos.z = 0;
          if (r.bulletMesh) {
            r.bulletMesh.position.copy(r.bulletPos);
            r.bulletMesh.rotation.set(0, 0, Math.atan2(r.bulletVel.y, r.bulletVel.x));
          }

          // Son temas noktasını ize ekle
          if (r.trailCount < 400) {
            const idx = r.trailCount * 3;
            r.trailPositions[idx] = r.bulletPos.x;
            r.trailPositions[idx + 1] = r.bulletPos.y;
            r.trailPositions[idx + 2] = r.bulletPos.z;
            r.trailCount++;
            if (r.trailLine) {
              r.trailLine.geometry.attributes.position.needsUpdate = true;
              r.trailLine.geometry.setDrawRange(0, r.trailCount);
            }
            if (r.trailGlowLine) {
              r.trailGlowLine.geometry.attributes.position.needsUpdate = true;
              r.trailGlowLine.geometry.setDrawRange(0, r.trailCount);
            }
          }

          r.isPlaying = false;
          soundFX.playHit();
          setSimState("hit");
          curOnHit();

          curOnStatsUpdate({
            simTime: curT.toFixed(2),
            bulletX: r.bulletPos.x.toFixed(1),
            bulletY: r.bulletPos.y.toFixed(1),
            bulletSpeed: Math.hypot(r.bulletVel.x, r.bulletVel.y).toFixed(1),
            monkeyY: r.monkeyPos.y.toFixed(1),
            deltaH: (0.5 * curG * curT * curT).toFixed(2),
            distToMonkey: "0.0",
            angleDeg: ((theta * 180) / Math.PI).toFixed(1),
          });

          try {
            confetti({
              particleCount: 65,
              spread: 85,
              origin: { y: 0.55 },
              colors: ["#10b981", "#38bdf8", "#facc15", "#f43f5e"],
            });
          } catch {
            // Safe fallback
          }
        } else if (r.bulletPos.y <= 0) {
          r.isPlaying = false;
          soundFX.playMiss();
          setSimState("miss_ground");
          curOnMiss("miss_ground");
        } else if (r.bulletPos.x > curHunterDist + 10) {
          r.isPlaying = false;
          soundFX.playMiss();
          setSimState("miss_past");
          curOnMiss("miss_past");
        }

        // =========================================================
        // DOĞRUDAN DOM TELEMETRİ GÜNCELLEMESİ (SIFIR REACT RE-RENDER)
        // =========================================================
        const deltaHVal = 0.5 * curG * curT * curT;
        if (hudTimeRef.current) hudTimeRef.current.textContent = `${curT.toFixed(2)}s`;
        if (hudBulletRef.current) hudBulletRef.current.textContent = `X: ${r.bulletPos.x.toFixed(1)}m | Y: ${r.bulletPos.y.toFixed(1)}m`;
        if (hudSpeedRef.current) hudSpeedRef.current.textContent = `${Math.hypot(r.bulletVel.x, r.bulletVel.y).toFixed(1)} m/s`;
        if (hudMonkeyRef.current) hudMonkeyRef.current.textContent = `${r.monkeyPos.y.toFixed(1)}m`;
        if (hudDeltaHRef.current) hudDeltaHRef.current.textContent = `${deltaHVal.toFixed(2)}m`;
        if (hudDistRef.current) hudDistRef.current.textContent = `${distToMonkey.toFixed(1)}m`;

        // Üst bileşene düşük frekansta (250ms) telemetri aktarımı
        if (currentTime - r.lastStatsTime > 250) {
          r.lastStatsTime = currentTime;
          curOnStatsUpdate({
            simTime: curT.toFixed(2),
            bulletX: r.bulletPos.x.toFixed(1),
            bulletY: r.bulletPos.y.toFixed(1),
            bulletSpeed: Math.hypot(r.bulletVel.x, r.bulletVel.y).toFixed(1),
            monkeyY: r.monkeyPos.y.toFixed(1),
            deltaH: deltaHVal.toFixed(2),
            distToMonkey: distToMonkey.toFixed(1),
            angleDeg: ((theta * 180) / Math.PI).toFixed(1),
          });
        }
      }

      renderer.render(scene, camera);
      currentRefs.animationId = requestAnimationFrame(animate);
    };

    currentRefs.animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(currentRefs.animationId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusBadge = () => {
    if (isPaused && simState === "flying") {
      return {
        text: "⏸️ DONDURULDU (Bullet Time) [G]",
        color: "bg-amber-500 text-slate-950 font-black animate-pulse shadow-glow",
      };
    }
    switch (simState) {
      case "flying":
        return { text: "Uçuş Sürüyor...", color: "bg-sky-600 text-white animate-pulse" };
      case "hit":
        return { text: "🎯 MÜKEMMEL 3D İSABET!", color: "bg-emerald-600 text-white font-bold" };
      case "miss_ground":
        return { text: "⚠️ Mermi Yere Erken Düştü!", color: "bg-amber-600 text-white" };
      case "miss_past":
        return { text: "❌ Iska (Hedefi Aştı)", color: "bg-rose-600 text-white" };
      default:
        return { text: "3D Uçuşa & Ateşe Hazır", color: "bg-slate-200 text-slate-700" };
    }
  };

  const status = getStatusBadge();

  return (
    <div
      ref={containerRef}
      className={`relative w-full panel-3d rounded-3xl overflow-hidden flex flex-col bg-slate-950 transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none w-screen h-screen" : ""
      }`}
    >
      {/* 3D Üst Bar */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-slate-700 flex items-center justify-between flex-wrap gap-2 z-10">
        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded-full text-xs font-bold font-game tracking-wide shadow-xs ${status.color}`}>
            {status.text}
          </span>
          <span className="text-xs text-slate-300 font-semibold hidden md:inline">
            Mesafe: <strong className="text-sky-400 font-mono">{hunterDistance}m</strong> | Yükseklik:{" "}
            <strong className="text-amber-400 font-mono">{treeHeight}m</strong>
          </span>
        </div>

        {/* 3D Kamera Modları */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-2xl border border-slate-700">
          <button
            onClick={() => setCameraMode("fps")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold font-game transition-all ${
              cameraMode === "fps" ? "btn-3d-emerald text-white" : "text-slate-400 hover:text-white"
            }`}
            title="1. Şahıs: Serbest Uçuş & Kumanda"
          >
            <IconPlane size={15} />
            <span className="hidden sm:inline">Uçuş (FPS)</span>
          </button>

          <button
            onClick={() => setCameraMode("scope")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold font-game transition-all ${
              cameraMode === "scope" ? "btn-3d-blue text-white" : "text-slate-400 hover:text-white"
            }`}
            title="Dürbün Nişangahı"
          >
            <IconCrosshair size={15} />
            <span className="hidden sm:inline">Dürbün</span>
          </button>

          <button
            onClick={() => setCameraMode("bullet")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold font-game transition-all ${
              cameraMode === "bullet" ? "btn-3d-amber text-amber-950" : "text-slate-400 hover:text-white"
            }`}
            title="Merminin arkasından sinematik uçuş"
          >
            <IconRocket size={15} />
            <span className="hidden sm:inline">Mermi</span>
          </button>

          <button
            onClick={() => setCameraMode("side")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold font-game transition-all ${
              cameraMode === "side" ? "btn-3d-white text-slate-900" : "text-slate-400 hover:text-white"
            }`}
            title="Taktik 3D Yan Görünüm"
          >
            <IconCamera size={15} />
            <span className="hidden sm:inline">Yan Bakış</span>
          </button>
        </div>

        {/* 3D Hızlı Ayarlar & Aksiyon Butonları */}
        <div className="flex items-center gap-2">
          {/* 3D Ayarlar Butonu */}
          <button
            onClick={() => setShow3DSettings(!show3DSettings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-game transition-all ${
              show3DSettings
                ? "bg-amber-500 text-slate-950 shadow-glow"
                : "btn-3d-white text-slate-800 hover:text-amber-600"
            }`}
            title="3D Sahne İçi Ayar Paneli"
          >
            <IconAdjustmentsHorizontal size={16} />
            <span>3D Ayarlar</span>
          </button>

          {/* Fullscreen Butonu */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1 px-2.5 py-1.5 btn-3d-white text-slate-700 rounded-xl text-xs font-bold font-game"
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekrana Geç"}
          >
            {isFullscreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
          </button>

          {/* Dondur / Devam Et (Bullet Time) Butonu */}
          {simState === "flying" && (
            <button
              onClick={handleTogglePause}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-game transition-all ${
                isPaused
                  ? "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-glow"
                  : "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/50"
              }`}
              title="Sahneyi Dondur / Devam Et (Bullet Time) [G / H]"
            >
              {isPaused ? <IconPlayerPlayFilled size={15} /> : <IconPlayerPauseFilled size={15} />}
              <span>{isPaused ? "Devam [G]" : "Dondur [G]"}</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 btn-3d-white text-slate-700 rounded-xl text-xs font-bold font-game"
            title="Sıfırla"
          >
            <IconRotateClockwise size={15} />
            <span className="hidden sm:inline">Sıfırla</span>
          </button>

          <button
            onClick={handleFireRemote}
            disabled={simState === "flying"}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black font-game tracking-wider text-white shadow-md transition-all ${
              simState === "flying"
                ? "bg-slate-600 cursor-not-allowed opacity-70"
                : "btn-3d-emerald cursor-pointer"
            }`}
          >
            <IconPlayerPlayFilled size={15} />
            <span>ATEŞLE! [E]</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Alanı */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative w-full ${
          isFullscreen ? "h-[calc(100vh-60px)]" : "h-[460px] sm:h-[530px] lg:h-[600px]"
        } cursor-grab active:cursor-grabbing select-none overflow-hidden`}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* FPS Reticle Crosshair */}
        {cameraMode === "fps" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-5 h-5 rounded-full border border-cyan-400/70 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-glow" />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* KÖŞE ANLIK TELEMETRİ HUD KARTI (ZERO-LAG DIRECT DOM REFS) */}
        {/* ========================================================= */}
        {show3DHUD && (
          <div className="absolute top-4 left-4 z-20 pointer-events-none select-none animate-fadeIn">
            <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-sky-500/50 shadow-2xl text-white min-w-[215px] space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-700/70">
                <span className="flex items-center gap-1.5 text-sky-400 font-bold font-game tracking-wider text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  CANLI TELEMETRİ
                </span>
                <span className="text-[10px] text-emerald-400 font-bold font-sans">120 FPS</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-sans text-[11px]">⏱️ Süre (t):</span>
                <strong ref={hudTimeRef} className="text-emerald-400 text-sm font-mono">0.00s</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-sans text-[11px]">🎯 Mermi Konumu:</span>
                <span ref={hudBulletRef} className="text-sky-300 font-mono text-[11px]">X: 0.0m | Y: 2.2m</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-sans text-[11px]">⚡ Mermi Hızı:</span>
                <strong ref={hudSpeedRef} className="text-amber-400 font-mono">{muzzleVelocity.toFixed(1)} m/s</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-sans text-[11px]">🐒 Maymun Y:</span>
                <strong ref={hudMonkeyRef} className="text-amber-300 font-mono">{treeHeight.toFixed(1)}m</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-sans text-[11px]">📉 Düşüş (½gt²):</span>
                <strong ref={hudDeltaHRef} className="text-rose-400 font-mono">0.00m</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-sans text-[11px]">📏 Hedefe Mesafe:</span>
                <strong ref={hudDistRef} className="text-cyan-300 font-mono">{hunterDistance.toFixed(1)}m</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 font-sans text-[11px]">📐 Nişan Açısı:</span>
                <strong ref={hudAngleRef} className="text-purple-300 font-mono">
                  {((getAimAngle() * 180) / Math.PI).toFixed(1)}°
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3D SAHNE İÇİ ANLIK AYAR ÇEKMECESİ (SETTINGS DRAWER)       */}
        {/* ========================================================= */}
        {show3DSettings && (
          <div className="absolute top-4 right-4 bottom-14 z-30 w-80 sm:w-88 bg-slate-900/95 backdrop-blur-xl rounded-3xl border-2 border-amber-500/60 shadow-2xl text-white flex flex-col p-4 overflow-y-auto custom-scrollbar animate-slideInRight select-auto">
            {/* Başlık & Kapat Butonu */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                  <IconAdjustmentsHorizontal size={17} />
                </div>
                <h3 className="font-game font-bold text-sm tracking-wide text-amber-300">
                  3D Sahne İçi Ayarlar
                </h3>
              </div>
              <button
                onClick={() => setShow3DSettings(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Ağaç Mesafesi (x) */}
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <IconRuler size={14} className="text-sky-400" />
                    <span>Ağaç Mesafesi (d)</span>
                  </span>
                  <span className="font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-lg border border-sky-800">
                    {hunterDistance}m
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={90}
                  step={1}
                  value={hunterDistance}
                  onChange={(e) => setHunterDistance(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              {/* Ağaç Yüksekliği (h) */}
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <IconGauge size={14} className="text-amber-400" />
                    <span>Ağaç Yüksekliği (h)</span>
                  </span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-800">
                    {treeHeight}m
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={1}
                  value={treeHeight}
                  onChange={(e) => setTreeHeight(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Namlu Çıkış Hızı (v0) */}
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <IconFlame size={14} className="text-rose-400" />
                    <span>Namlu Hızı (v₀)</span>
                  </span>
                  <span className="font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-lg border border-rose-800">
                    {muzzleVelocity} m/s
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={80}
                  step={1}
                  value={muzzleVelocity}
                  onChange={(e) => setMuzzleVelocity(Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>

              {/* Yerçekimi İvmesi (g) Presets */}
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <IconBrandPlanetscale size={14} className="text-emerald-400" />
                    <span>Yerçekimi (g)</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-800">
                    {gravity} m/s²
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[
                    { name: "Dünya", val: 9.8 },
                    { name: "Ay", val: 1.6 },
                    { name: "Mars", val: 3.7 },
                    { name: "Sıfır", val: 0.0 },
                  ].map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setGravity(p.val)}
                      className={`px-1.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                        gravity === p.val
                          ? "bg-emerald-500 text-slate-950 shadow-xs"
                          : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Düşüş Gecikmesi (Δt) */}
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-300">Düşüş Gecikmesi (Δt)</span>
                  <span className="font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-800">
                    {monkeyDropDelay.toFixed(2)}s
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={2.0}
                  step={0.1}
                  value={monkeyDropDelay}
                  onChange={(e) => setMonkeyDropDelay(Number(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
              </div>

              {/* Ağır Çekim (Zaman Ölçeği) */}
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <span className="font-bold text-slate-300 block mb-1.5">Zaman Ölçeği</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1.0, 0.5, 0.2, 0.05].map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setTimeScale(scale)}
                      className={`px-1.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                        timeScale === scale
                          ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                          : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                      }`}
                    >
                      {scale === 1.0 ? "1x Normal" : `${scale}x`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mühimmat Tipi */}
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center justify-between">
                <span className="font-bold text-slate-300">Mermi Tipi:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setProjectileType("banana")}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                      projectileType === "banana"
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    🍌 Muz
                  </button>
                  <button
                    onClick={() => setProjectileType("dart")}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                      projectileType === "dart"
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    🎯 Dart
                  </button>
                </div>
              </div>

              {/* Nişan Modu */}
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-300">Nişan Modu:</span>
                  <button
                    onClick={() => setIsAutoAim(!isAutoAim)}
                    className={`px-2.5 py-1 rounded-xl font-bold text-[10px] transition-all ${
                      isAutoAim ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {isAutoAim ? "🎯 Otomatik Nişan" : "📐 Manuel Açı"}
                  </button>
                </div>
                {!isAutoAim && (
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Manuel Açı:</span>
                      <strong className="text-purple-400 font-mono">{manualAngle}°</strong>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={80}
                      step={0.5}
                      value={manualAngle}
                      onChange={(e) => setManualAngle(Number(e.target.value))}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Alt İşlem Butonları */}
            <div className="pt-3 border-t border-slate-700/80 mt-auto flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2 btn-3d-white text-slate-800 rounded-xl text-xs font-bold font-game flex items-center justify-center gap-1.5"
              >
                <IconRotateClockwise size={15} />
                <span>Sıfırla</span>
              </button>
              {simState === "flying" ? (
                <button
                  onClick={handleTogglePause}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold font-game flex items-center justify-center gap-1.5 transition-all ${
                    isPaused
                      ? "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-glow"
                      : "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/50"
                  }`}
                >
                  {isPaused ? <IconPlayerPlayFilled size={15} /> : <IconPlayerPauseFilled size={15} />}
                  <span>{isPaused ? "Devam [G]" : "Dondur [G]"}</span>
                </button>
              ) : (
                <button
                  onClick={handleFireRemote}
                  disabled={simState === "flying"}
                  className="flex-1 py-2 btn-3d-emerald text-white rounded-xl text-xs font-bold font-game flex items-center justify-center gap-1.5"
                >
                  <IconPlayerPlayFilled size={15} />
                  <span>Ateşle [E]</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Kumanda İpucu */}
        {cameraMode === "fps" && (
          <div className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-sky-400 text-white shadow-xl pointer-events-none flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white">
              <IconDeviceGamepad2 size={18} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-sky-300 block">ELİNDEKİ KUMANDA AKTİF</span>
              <span className="text-xs font-game font-bold text-slate-100">
                Ateşlemek için <strong className="text-emerald-400">[E] Tuşuna Bas</strong> veya tıkla!
              </span>
            </div>
          </div>
        )}

        {/* Uçuş & Kontrol Rehberi */}
        <div className="absolute bottom-3 left-4 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-[11px] text-slate-300 pointer-events-none flex items-center gap-3 flex-wrap">
          <span>🚀 <strong>W, A, S, D:</strong> Uç</span>
          <span>⬆️ <strong>Boşluk (Space):</strong> Yüksel</span>
          <span>⬇️ <strong>Shift / C:</strong> Alçal</span>
          <span>🎮 <strong>E:</strong> Ateşle</span>
          <span>⏸️ <strong>G / H:</strong> Dondur / Devam</span>
          <span>⚙️ <strong>3D Ayarlar:</strong> Üstteki butona tıkla</span>
        </div>

        {/* Bullet-Time Sahne Dondurma Bildirimi */}
        {isPaused && simState === "flying" && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md px-6 py-2.5 rounded-2xl border-2 border-amber-500 text-amber-300 shadow-2xl flex items-center gap-3 z-30 animate-pulse pointer-events-none">
            <IconPlayerPauseFilled size={20} className="text-amber-400 animate-bounce" />
            <div>
              <p className="font-game font-bold text-sm text-amber-300">
                BULLET TIME: Sahne Donduruldu (Pause)
              </p>
              <p className="text-xs text-slate-300">
                W, A, S, D ile merminin çevresinde uçabilirsiniz. Devam etmek için <strong className="text-amber-400">[G]</strong> veya <strong className="text-amber-400">[H]</strong> tuşuna basın.
              </p>
            </div>
          </div>
        )}

        {/* İsabet Başarı Bildirimi */}
        {simState === "hit" && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-emerald-500 shadow-2xl text-center pointer-events-none animate-bounce z-40">
            <p className="text-emerald-700 font-game font-black text-sm sm:text-base">
              🎯 TAM İSABET! Mermi Varlığa Doğrudan Çarptı!
            </p>
            <p className="text-slate-600 text-xs">
              Merminin düşüş sapması = Maymunun düşüş mesafesi = <strong className="text-emerald-800">½ g t²</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const Simulation3D = memo(Simulation3DComponent);
export default Simulation3D;
