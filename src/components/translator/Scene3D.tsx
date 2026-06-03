'use client';

import { useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { LANGUAGES, THEMES, TILE_COUNT, type LanguageMeta, type ThemeName } from '@/lib/translator';
import { useTranslatorStore } from '@/stores/translator-store';

/* ── Constants ── */
const TILE_W = 2.6;
const TILE_H = 3.3;
const TILE_D = 0.1;
const CAROUSEL_R = 5.8;
const BREATH_AMP = 0.1;
const BREATH_SPEED = 0.6;
const LERP_SPEED = 3.5;
const COLOR_CYCLE_SPEED = 0.4;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(t, 1);
}

function lerpColor(c: THREE.Color, a: THREE.Color, b: THREE.Color, t: number) {
  c.r = lerp(a.r, b.r, t);
  c.g = lerp(a.g, b.g, t);
  c.b = lerp(a.b, b.b, t);
}

/* ── Compute initial target for a tile index ── */
function computeTarget(index: number, viewState: string, carouselRotation: number) {
  const tv = new THREE.Vector3();
  let rotY = 0;
  let scale = 1;

  if (viewState === 'cluster') {
    const angle = (index / TILE_COUNT) * Math.PI * 2 + Math.PI / TILE_COUNT;
    const ring = index % 2 === 0 ? 1.4 : 2.4;
    tv.set(
      Math.cos(angle) * ring,
      Math.sin(angle) * ring * 0.8,
      index * 0.12 - 0.5
    );
    rotY = Math.cos(angle) * 0.06;
  } else if (viewState === 'carousel') {
    const angle = (index / TILE_COUNT) * Math.PI * 2 + carouselRotation;
    tv.set(
      Math.sin(angle) * CAROUSEL_R,
      0,
      Math.cos(angle) * CAROUSEL_R - CAROUSEL_R
    );
    rotY = angle;
  } else {
    const angle = (index / TILE_COUNT) * Math.PI * 2 + carouselRotation;
    tv.set(Math.sin(angle) * 3, 0, Math.cos(angle) * 3 - 9);
    rotY = angle;
    scale = 0.6;
  }

  return { pos: tv, rotY, scale };
}

/* ── Theme helpers ── */
function getThemeConfig(theme: ThemeName) {
  return THEMES[theme];
}

/* ── Floating Glyph Particles ── */
function TypoParticles() {
  const pointsRef = useRef<THREE.Points>(null!);
  const theme = useTranslatorStore((s) => s.theme);

  const { positions, speeds } = useMemo(() => {
    const count = 180;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 4;
      spd[i] = 0.02 + Math.random() * 0.06;
    }
    return { positions: pos, speeds: spd };
  }, []);

  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.35)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.PointsMaterial;
      material.color.set(getThemeConfig(theme).particle);
    }
  }, [theme]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    for (let i = 0; i < speeds.length; i++) {
      posArr[i * 3 + 1] += Math.sin(time * speeds[i] + i) * 0.002;
      posArr[i * 3] += Math.cos(time * speeds[i] * 0.7 + i * 0.5) * 0.001;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={particleTexture}
        size={0.18}
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Floating Glyph Sprites ── */
function FloatingGlyphs() {
  const theme = useTranslatorStore((s) => s.theme);
  const groupRef = useRef<THREE.Group>(null!);

  const glyphs = useMemo(() => {
    const chars = ['ä', 'ö', 'ü', 'ß', 'α', 'β', 'γ', 'θ', 'þ', 'ƕ', '½', '÷', '∞', 'π', '♪'];
    return Array.from({ length: 18 }, (_, i) => ({
      char: chars[i % chars.length],
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 14,
      z: -3 - Math.random() * 10,
      speed: 0.1 + Math.random() * 0.3,
      rotSpeed: (Math.random() - 0.5) * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  const themeConfig = getThemeConfig(theme);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const g = glyphs[i];
      child.position.y = g.y + Math.sin(time * g.speed + g.phase) * 0.6;
      child.rotation.y = time * g.rotSpeed;
    });
  });

  return (
    <group ref={groupRef}>
      {glyphs.map((g, i) => (
        <Text
          key={i}
          position={[g.x, g.y, g.z]}
          fontSize={0.22 + Math.random() * 0.2}
          color={themeConfig.mutedBright}
          fillOpacity={0.2}
          anchorX="center"
          anchorY="middle"
        >
          {g.char}
        </Text>
      ))}
    </group>
  );
}

/* ── Core Aura ── */
function CoreAura() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const theme = useTranslatorStore((s) => s.theme);

  const themeConfig = getThemeConfig(theme);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const pulse = 0.6 + Math.sin(time * 0.8) * 0.15 + Math.sin(time * 1.3) * 0.1;
    meshRef.current.scale.setScalar(pulse * 3);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.08 + Math.sin(time * 0.5) * 0.03;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        color={themeConfig.aura}
        transparent
        opacity={0.08}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Tongue Tile ── */
interface TileProps {
  language: LanguageMeta;
  index: number;
}

function TongueTile({ language, index }: TileProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null!);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const backGlowMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const translatedTextRef = useRef<THREE.Group>(null!);

  const theme = useTranslatorStore((s) => s.theme);
  const viewState = useTranslatorStore((s) => s.viewState);
  const selectedLanguage = useTranslatorStore((s) => s.selectedLanguage);
  const inputText = useTranslatorStore((s) => s.inputText);
  const translatedText = useTranslatorStore((s) => s.translatedText);

  const themeConfig = getThemeConfig(theme);
  const langColor = useMemo(() => new THREE.Color(language.color), [language.color]);
  const langColorAlt = useMemo(() => new THREE.Color(language.colorAlt), [language.colorAlt]);
  const paperColor = useMemo(
    () => new THREE.Color(themeConfig.paper).lerp(new THREE.Color(language.color), 0.08),
    [themeConfig.paper, language.color]
  );
  const textColor = useMemo(() => new THREE.Color(themeConfig.ink), [themeConfig.ink]);
  const outlineColor = useMemo(() => new THREE.Color(themeConfig.textOutline), [themeConfig.textOutline]);
  const mutedBrightColor = useMemo(() => new THREE.Color(themeConfig.mutedBright), [themeConfig.mutedBright]);
  const dynamicColor = useMemo(() => new THREE.Color(), []);

  // Compute initial target so tiles don't start at (0,0,0)
  const initialTarget = useMemo(() => {
    const store = useTranslatorStore.getState();
    return computeTarget(index, store.viewState, store.carouselRotation);
  }, []); // intentionally only run once

  const animRef = useRef({
    pos: initialTarget.pos.clone(),
    rotY: initialTarget.rotY,
    scale: initialTarget.scale,
    glowOpacity: 0.06,
    emissiveIntensity: 0.03,
    tiltX: 0,
    targetRotY: initialTarget.rotY,
    targetScale: initialTarget.scale,
    targetTiltX: 0,
    tileOpacity: 1,
    settled: false,  // track if first frame has run
  });

  const targetVecRef = useRef(new THREE.Vector3());

  // Update material colors when theme changes
  useEffect(() => {
    if (matRef.current) {
      matRef.current.color.set(paperColor);
    }
  }, [theme, paperColor]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const store = useTranslatorStore.getState();
    const { viewState, selectedLanguage, hoveredTile, carouselRotation, keystrokeTime } = store;
    const time = state.clock.elapsedTime;
    const anim = animRef.current;

    const isHovered = hoveredTile === language.id;
    const isSelected = selectedLanguage === language.id;

    // Dynamic color cycling between langColor and langColorAlt
    const colorT = (Math.sin(time * COLOR_CYCLE_SPEED + index * 1.5) + 1) * 0.5;
    lerpColor(dynamicColor, langColor, langColorAlt, colorT);

    // Compute target position
    const tv = targetVecRef.current;
    if (viewState === 'cluster') {
      const angle = (index / TILE_COUNT) * Math.PI * 2 + Math.PI / TILE_COUNT;
      const ring = index % 2 === 0 ? 1.4 : 2.4;
      tv.set(
        Math.cos(angle) * ring,
        Math.sin(angle) * ring * 0.8,
        index * 0.12 - 0.5
      );
      // Breathing
      tv.y += Math.sin(time * BREATH_SPEED + index * 0.9) * BREATH_AMP;
      tv.x += Math.sin(time * BREATH_SPEED * 0.7 + index * 1.2) * BREATH_AMP * 0.4;
      anim.targetRotY = Math.cos(angle) * 0.06;
      anim.targetScale = 1;
      anim.targetTiltX = 0;
    } else if (viewState === 'carousel') {
      const angle = (index / TILE_COUNT) * Math.PI * 2 + carouselRotation;
      tv.set(
        Math.sin(angle) * CAROUSEL_R,
        Math.sin(time * 0.3 + index * 0.6) * 0.15,
        Math.cos(angle) * CAROUSEL_R - CAROUSEL_R
      );
      // FIX: removed +Math.PI — tiles now face OUTWARD (front text visible)
      anim.targetRotY = angle;
      anim.targetScale = isHovered ? 1.08 : 1;
      anim.targetTiltX = isHovered ? -0.08 : 0;
    } else {
      // selected
      if (isSelected) {
        tv.set(0, 0, 6);
        anim.targetRotY = 0;
        anim.targetScale = 1.25;
        anim.targetTiltX = 0;
      } else {
        const angle = (index / TILE_COUNT) * Math.PI * 2 + carouselRotation;
        tv.set(
          Math.sin(angle) * 3,
          0,
          Math.cos(angle) * 3 - 9
        );
        // FIX: removed +Math.PI
        anim.targetRotY = angle;
        anim.targetScale = 0.6;
        anim.targetTiltX = 0;
      }
    }

    // On first frame, snap to target instantly (prevents "stuck inside" on remount)
    if (!anim.settled) {
      anim.pos.copy(tv);
      anim.rotY = anim.targetRotY;
      anim.scale = anim.targetScale;
      anim.settled = true;
    } else {
      // Lerp toward target
      const spd = LERP_SPEED;
      anim.pos.lerp(tv, delta * spd);
      anim.rotY = lerp(anim.rotY, anim.targetRotY || 0, delta * spd);
      anim.scale = lerp(anim.scale, anim.targetScale || 1, delta * spd);
      anim.tiltX = lerp(anim.tiltX, anim.targetTiltX || 0, delta * spd);
    }

    // Apply transforms
    groupRef.current.position.copy(anim.pos);
    groupRef.current.rotation.y = anim.rotY;
    groupRef.current.rotation.x = anim.tiltX;
    groupRef.current.scale.setScalar(anim.scale);

    // Opacity for unselected tiles in selected mode
    const tileOpacity =
      viewState === 'selected' && !isSelected
        ? lerp(anim.tileOpacity ?? 1, 0.25, delta * 4)
        : lerp(anim.tileOpacity ?? 1, 1, delta * 4);
    anim.tileOpacity = tileOpacity;
    matRef.current.opacity = 0.92 * tileOpacity;

    // Glow & emissive with dynamic color
    let baseGlow = 0.1;
    let baseEmissive = 0.06;
    if (isHovered) {
      baseGlow = 0.3;
      baseEmissive = 0.18;
    }
    if (isSelected) {
      baseGlow = 0.4;
      baseEmissive = 0.25;
    }

    // Keystroke ripple
    let ripple = 0;
    if (isSelected && keystrokeTime > 0) {
      ripple = Math.max(0, 1 - (Date.now() - keystrokeTime) / 400);
      if (ripple > 0) {
        baseGlow += ripple * 0.5;
        baseEmissive += ripple * 0.4;
        anim.scale = lerp(anim.scale, anim.targetScale + ripple * 0.03, delta * 10);
      }
    }

    anim.glowOpacity = lerp(anim.glowOpacity, baseGlow, delta * 8);
    anim.emissiveIntensity = lerp(anim.emissiveIntensity, baseEmissive, delta * 8);
    glowMatRef.current.opacity = anim.glowOpacity * tileOpacity;
    glowMatRef.current.color.copy(dynamicColor);
    backGlowMatRef.current.opacity = anim.glowOpacity * 0.5 * tileOpacity;
    matRef.current.emissiveIntensity = anim.emissiveIntensity;
    matRef.current.emissive.copy(dynamicColor);

    // Translated text floating
    if (translatedTextRef.current) {
      const show = viewState === 'selected' && isSelected && translatedText.length > 0;
      translatedTextRef.current.visible = show;
      if (show) {
        translatedTextRef.current.position.y = -2.6 + Math.sin(time * 0.5) * 0.1;
      }
    }
  });

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      useTranslatorStore.getState().setHoveredTile(language.id);
    },
    [language.id]
  );

  const handlePointerOut = useCallback(() => {
    const store = useTranslatorStore.getState();
    if (store.hoveredTile === language.id) {
      store.setHoveredTile(null);
    }
  }, [language.id]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const store = useTranslatorStore.getState();
      if (store.viewState === 'carousel') {
        store.selectLanguage(language.id);
        store.setViewState('selected');
      }
    },
    [language.id]
  );

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Main tile body */}
      <RoundedBox args={[TILE_W, TILE_H, TILE_D]} radius={0.18} smoothness={6}>
        <meshPhysicalMaterial
          ref={matRef}
          color={paperColor}
          roughness={0.3}
          metalness={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.92}
          emissive={langColor}
          emissiveIntensity={0.06}
          side={THREE.DoubleSide}
          envMapIntensity={0.8}
        />
      </RoundedBox>

      {/* Edge glow */}
      <RoundedBox args={[TILE_W + 0.08, TILE_H + 0.08, TILE_D + 0.02]} radius={0.2} smoothness={6}>
        <meshBasicMaterial
          ref={glowMatRef}
          color={langColor}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </RoundedBox>

      {/* Back face glow */}
      <mesh position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[TILE_W - 0.3, TILE_H - 0.3]} />
        <meshBasicMaterial
          ref={backGlowMatRef}
          color={langColor}
          transparent
          opacity={0.05}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>

      {/* Front text - Language name (with outline for visibility) */}
      <Text
        position={[0, 0.7, 0.07]}
        fontSize={0.58}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
        outlineWidth={0.04}
        outlineColor={outlineColor}
      >
        {language.flag}{' '}{language.name}
      </Text>

      {/* Front text - Subtitle (with outline for visibility) */}
      <Text
        position={[0, -0.05, 0.07]}
        fontSize={0.22}
        color={mutedBrightColor}
        anchorX="center"
        anchorY="middle"
        fontWeight={500}
        outlineWidth={0.03}
        outlineColor={outlineColor}
      >
        {language.subtitle}
      </Text>

      {/* Front text - Decorative line */}
      <Text
        position={[0, -0.55, 0.07]}
        fontSize={0.13}
        color={langColor}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.8}
        outlineWidth={0.025}
        outlineColor={outlineColor}
      >
        ── {language.tag.toUpperCase()} ──
      </Text>

      {/* Back symbols */}
      <Text
        position={[0, 0.4, -0.07]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.2}
        color={mutedBrightColor}
        fillOpacity={0.35}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor={outlineColor}
      >
        {language.symbols}
      </Text>
      <Text
        position={[0, -0.3, -0.07]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.16}
        color={langColor}
        fillOpacity={0.35}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor={outlineColor}
      >
        {language.name.toUpperCase()}
      </Text>

      {/* Translated text (visible when selected) */}
      <group ref={translatedTextRef}>
        <Text
          position={[0, -2.6, -0.5]}
          fontSize={0.16}
          maxWidth={4}
          textAlign="center"
          color={langColor}
          fillOpacity={0.9}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor={outlineColor}
          lineHeight={1.4}
        >
          {translatedText || '...'}
        </Text>
      </group>
    </group>
  );
}

/* ── Scene Content ── */
function SceneContent() {
  const theme = useTranslatorStore((s) => s.theme);
  const themeConfig = getThemeConfig(theme);

  const handlePointerMissed = useCallback(() => {
    const store = useTranslatorStore.getState();
    if (store.viewState === 'selected') {
      store.resetSelection();
    }
  }, []);

  return (
    <>
      {/* Background */}
      <color attach="background" args={[themeConfig.bg]} />
      <fog attach="fog" args={[themeConfig.fog, 8, 35]} />

      {/* Lighting */}
      <ambientLight intensity={0.5} color={themeConfig.ink} />
      <pointLight
        position={[10, 8, 12]}
        intensity={2.0}
        color={themeConfig.ink}
        distance={30}
        decay={2}
      />
      <pointLight
        position={[-10, -5, 10]}
        intensity={1.0}
        color={themeConfig.aura}
        distance={25}
        decay={2}
      />
      <pointLight
        position={[0, 2, -6]}
        intensity={0.6}
        color={themeConfig.accent}
        distance={18}
        decay={2}
      />

      {/* Tiles */}
      {LANGUAGES.map((lang, i) => (
        <TongueTile key={lang.id} language={lang} index={i} />
      ))}

      {/* Particles */}
      <TypoParticles />
      <FloatingGlyphs />

      {/* Core Aura */}
      <CoreAura />

      {/* Invisible plane for missed clicks */}
      <mesh
        position={[0, 0, -15]}
        onPointerMissed={handlePointerMissed}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

/* ── Canvas Wrapper ── */
interface Scene3DProps {
  onWheel?: (e: WheelEvent) => void;
}

export default function Scene3D({ onWheel }: Scene3DProps) {
  return (
    <div className="absolute inset-0 w-full h-full" id="scene-container">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 48 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        onPointerMissed={() => {
          const store = useTranslatorStore.getState();
          if (store.viewState === 'selected') {
            store.resetSelection();
          }
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
