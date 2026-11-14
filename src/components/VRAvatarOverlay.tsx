'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserCheck, RotateCcw, Compass, Gamepad2 } from 'lucide-react';

export interface VRAvatarOverlayProps {
  siteTitle?: string;
  initialYaw?: number;
  initialPitch?: number;
}

interface Ripple {
  id: number;
  xPct: number;
  yPct: number;
  scale: number;
}

/**
 * Bespoke Stylized Royal Pharaonic Explorer Avatar (Layered Vector + Metallic Shading)
 * Features sculpted Nemes headdress, golden Uraeus cobra, Wesekh collar, flowing royal cape,
 * glowing Staff of Horus, articulated stride/cape sway, and golden compass ring.
 */
function RoyalPharaonicExplorerSVG({
  isWalking,
  facingSign,
  walkCycle,
}: {
  isWalking: boolean;
  facingSign: number; // +1 right/forward, -1 left
  walkCycle: number;
}) {
  const bobY = isWalking ? Math.abs(Math.sin(walkCycle * 2)) * -5 : Math.sin(walkCycle) * -2.5;
  const leftLegRot = isWalking ? Math.sin(walkCycle * 2) * 18 : 0;
  const rightLegRot = isWalking ? -Math.sin(walkCycle * 2) * 18 : 0;
  const leftArmRot = isWalking ? -Math.sin(walkCycle * 2) * 14 : Math.sin(walkCycle) * 2;
  const staffRot = isWalking ? Math.sin(walkCycle * 2) * 10 - 6 : Math.cos(walkCycle) * 2.5 - 4;
  const capeSway = isWalking
    ? Math.sin(walkCycle * 2) * 7 + 6
    : Math.sin(walkCycle * 0.9) * 3;

  return (
    <div
      className="relative flex flex-col items-center justify-end select-none pointer-events-none"
      style={{
        transform: `translateY(${bobY.toFixed(2)}px) scaleX(${facingSign})`,
        transition: 'transform 120ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <svg
        width="160"
        height="210"
        viewBox="0 0 160 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_14px_22px_rgba(0,0,0,0.65)]"
      >
        <defs>
          <linearGradient id="goldRoyal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF0B8" />
            <stop offset="45%" stopColor="#FFD27A" />
            <stop offset="100%" stopColor="#A8741E" />
          </linearGradient>
          <linearGradient id="lapisDeep" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E4B7A" />
            <stop offset="55%" stopColor="#0F2942" />
            <stop offset="100%" stopColor="#071526" />
          </linearGradient>
          <linearGradient id="skinBronze" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFA065" />
            <stop offset="100%" stopColor="#9E6230" />
          </linearGradient>
          <linearGradient id="linenRoyal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="100%" stopColor="#DFD2B8" />
          </linearGradient>
          <radialGradient id="horusGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7DD3FC" stopOpacity="1" />
            <stop offset="45%" stopColor="#38BDF8" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Flowing Royal Cape with Wind Sway */}
        <g transform={`rotate(${capeSway.toFixed(2)}, 76, 76)`}>
          <path
            d="M66 76 C45 96, 30 134, 24 176 C42 182, 62 178, 78 168 L84 82 Z"
            fill="url(#lapisDeep)"
            stroke="#D6A044"
            strokeWidth="1.8"
          />
          <path
            d="M66 78 C49 102, 38 136, 33 173"
            stroke="#38BDF8"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Back Leg */}
        <g transform={`rotate(${leftLegRot.toFixed(2)}, 72, 134)`}>
          <path
            d="M66 132 L61 178 C60 183, 66 186, 71 184 L76 134 Z"
            fill="url(#skinBronze)"
          />
          <path d="M58 180 L74 180 L76 187 L56 187 Z" fill="url(#goldRoyal)" rx="3" />
        </g>

        {/* Front Leg */}
        <g transform={`rotate(${rightLegRot.toFixed(2)}, 86, 134)`}>
          <path
            d="M80 132 L85 179 C86 184, 93 186, 97 183 L92 133 Z"
            fill="url(#skinBronze)"
          />
          <path d="M82 180 L99 180 L102 187 L81 187 Z" fill="url(#goldRoyal)" />
        </g>

        {/* Royal Shendyt Kilt */}
        <path
          d="M62 110 L96 110 L103 144 C90 148, 70 148, 57 144 Z"
          fill="url(#linenRoyal)"
          stroke="#C9A84C"
          strokeWidth="1.5"
        />
        {/* Gold Center Apron */}
        <path
          d="M75 112 L85 112 L88 147 L72 147 Z"
          fill="url(#goldRoyal)"
        />
        <path d="M77 120 L83 120 M77 128 L83 128 M76 136 L84 136" stroke="#0F2942" strokeWidth="1.6" />

        {/* Lapis & Gold Royal Belt */}
        <rect x="61" y="104" width="38" height="9" rx="4" fill="url(#lapisDeep)" stroke="#FFD27A" strokeWidth="1.6" />
        <circle cx="80" cy="108.5" r="3" fill="#38BDF8" />

        {/* Back Arm */}
        <g transform={`rotate(${leftArmRot.toFixed(2)}, 62, 80)`}>
          <path
            d="M60 76 C50 92, 47 108, 49 120"
            stroke="url(#skinBronze)"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M47 108 L53 108"
            stroke="url(#goldRoyal)"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>

        {/* Sculpted Torso */}
        <path
          d="M60 72 C60 66, 98 66, 98 72 L95 106 L64 106 Z"
          fill="url(#skinBronze)"
        />

        {/* Wesekh Gold & Turquoise Collar */}
        <path
          d="M57 71 C66 88, 92 88, 101 71 C94 67, 64 67, 57 71 Z"
          fill="url(#goldRoyal)"
          stroke="#0F2942"
          strokeWidth="1.2"
        />
        <path
          d="M62 74 C70 84, 88 84, 96 74"
          stroke="#38BDF8"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M66 78 C73 85, 85 85, 92 78"
          stroke="#0F2942"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Head & Sculpted Nemes Headdress */}
        <g>
          {/* Nemes Back Lappets */}
          <path
            d="M58 46 C50 62, 51 82, 57 90 L66 86 L65 50 Z"
            fill="url(#goldRoyal)"
            stroke="#0F2942"
            strokeWidth="1.2"
          />
          <path
            d="M100 46 C108 62, 107 82, 101 90 L92 86 L93 50 Z"
            fill="url(#goldRoyal)"
            stroke="#0F2942"
            strokeWidth="1.2"
          />
          {/* Lapis Stripes on Nemes Lappets */}
          <path d="M54 62 L63 62 M53 70 L63 70 M54 78 L63 78" stroke="#0F2942" strokeWidth="2.4" />
          <path d="M95 62 L104 62 M95 70 L105 70 M95 78 L104 78" stroke="#0F2942" strokeWidth="2.4" />

          {/* Face */}
          <ellipse cx="79" cy="51" rx="14.5" ry="16" fill="url(#skinBronze)" />
          {/* Expressive Eyes with Kohl */}
          <ellipse cx="73.5" cy="50" rx="3.2" ry="2.2" fill="#FFFFFF" />
          <ellipse cx="85" cy="50" rx="3.2" ry="2.2" fill="#FFFFFF" />
          <circle cx="74" cy="50" r="1.4" fill="#080705" />
          <circle cx="85.5" cy="50" r="1.4" fill="#080705" />
          <path d="M70 46.5 Q73.5 45 77 46.8" stroke="#080705" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M82 46.8 Q85.5 45 89 46.5" stroke="#080705" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M75.5 58.5 Q79.5 61 83.5 58.5" stroke="#5A3314" strokeWidth="1.5" strokeLinecap="round" />

          {/* Nemes Crown Dome */}
          <path
            d="M59 45 C58 26, 100 26, 99 45 C92 38, 66 38, 59 45 Z"
            fill="url(#goldRoyal)"
            stroke="#0F2942"
            strokeWidth="1.3"
          />
          {/* Lapis Brow Band */}
          <path
            d="M62 41 C71 36, 87 36, 96 41"
            stroke="#0F2942"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Golden Uraeus Cobra */}
          <path
            d="M79 38 C79 31, 83 25, 79 20 C76 23, 76 29, 79 33"
            fill="url(#goldRoyal)"
            stroke="#A8741E"
            strokeWidth="1.2"
          />
          <circle cx="79" cy="21" r="2.2" fill="#38BDF8" />
        </g>

        {/* Front Arm + Glowing Staff of Horus */}
        <g transform={`rotate(${staffRot.toFixed(2)}, 96, 80)`}>
          <path
            d="M96 77 C107 90, 111 104, 109 116"
            stroke="url(#skinBronze)"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M106 105 L112 105"
            stroke="url(#goldRoyal)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Staff of Horus */}
          <line x1="115" y1="36" x2="108" y2="184" stroke="url(#goldRoyal)" strokeWidth="4.2" strokeLinecap="round" />
          <circle cx="115" cy="30" r="16" fill="url(#horusGlow)" />
          <circle cx="115" cy="30" r="8.5" fill="none" stroke="url(#goldRoyal)" strokeWidth="3.2" />
          <circle cx="115" cy="30" r="3.5" fill="#38BDF8" />
          <path d="M105 42 L125 42" stroke="url(#goldRoyal)" strokeWidth="3.2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export default function VRAvatarOverlay(_props: VRAvatarOverlayProps) {
  const [avatarActive, setAvatarActive] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [facingSign, setFacingSign] = useState(1);
  const [walkCycle, setWalkCycle] = useState(0);

  // Normalized viewport floor coordinates:
  // xPct: 14..86 (% across viewport), yPct: 48..88 (% down from top, 48 = deep corridor, 88 = foreground)
  const [avatarPos, setAvatarPos] = useState({ xPct: 50, yPct: 76 });
  const avatarPosRef = useRef({ xPct: 50, yPct: 76 });
  const targetPosRef = useRef<{ xPct: number; yPct: number } | null>(null);
  const lastCursorRef = useRef<{ xPct: number; yPct: number } | null>(null);

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleIdRef = useRef(0);
  const lastRippleTimeRef = useRef(0);

  // Joystick & Keyboard state
  const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 });
  const joystickVecRef = useRef({ x: 0, y: 0 }); // x: -1..1 (left/right), y: -1..1 (up=forward, down=back)
  const keysPressedRef = useRef<Set<string>>(new Set());
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const isDraggingJoystickRef = useRef(false);

  const spawnRipple = useCallback((xPct: number, yPct: number, scale: number) => {
    const id = ++rippleIdRef.current;
    setRipples((prev) => [...prev.slice(-4), { id, xPct, yPct, scale }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  }, []);

  // Voice toggle listener for Pharaoh Avatar ON/OFF
  useEffect(() => {
    const handleVoiceToggle = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail && typeof detail.active === 'boolean') {
        setAvatarActive(detail.active);
      } else {
        setAvatarActive((prev) => !prev);
      }
    };
    window.addEventListener('egyptx:toggle-pharaoh-avatar', handleVoiceToggle);
    return () => window.removeEventListener('egyptx:toggle-pharaoh-avatar', handleVoiceToggle);
  }, []);

  // Keyboard navigation (WASD & Arrow keys)
  useEffect(() => {
    if (!avatarActive) {
      keysPressedRef.current.clear();
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        targetPosRef.current = null; // manual override cancels click-to-follow target
        keysPressedRef.current.add(e.code);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.code);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [avatarActive]);

  // Click-to-follow sync with Matterport floor rings (handles both direct clicks and cross-origin iframe clicks)
  useEffect(() => {
    if (!avatarActive) return;

    const handlePointerMove = (e: PointerEvent) => {
      lastCursorRef.current = {
        xPct: (e.clientX / Math.max(1, window.innerWidth)) * 100,
        yPct: (e.clientY / Math.max(1, window.innerHeight)) * 100,
      };
    };

    const setClickTarget = (clientX: number, clientY: number) => {
      const xPct = Math.max(14, Math.min(86, (clientX / Math.max(1, window.innerWidth)) * 100));
      const yPct = Math.max(48, Math.min(88, (clientY / Math.max(1, window.innerHeight)) * 100));
      targetPosRef.current = { xPct, yPct };
      const depthT = (yPct - 48) / 40;
      spawnRipple(xPct, yPct, 0.52 + depthT * 0.65);
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-avatar-control="true"]')) return;
      setClickTarget(e.clientX, e.clientY);
    };

    const handleWindowBlur = () => {
      // Clicking inside the Matterport cross-origin iframe triggers window.blur
      if (lastCursorRef.current) {
        const { xPct, yPct } = lastCursorRef.current;
        const clampedX = Math.max(14, Math.min(86, xPct));
        const clampedY = Math.max(48, Math.min(88, yPct));
        targetPosRef.current = { xPct: clampedX, yPct: clampedY };
        const depthT = (clampedY - 48) / 40;
        spawnRipple(clampedX, clampedY, 0.52 + depthT * 0.65);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [avatarActive, spawnRipple]);

  // 60fps requestAnimationFrame Physics & Perspective Floor Loop
  useEffect(() => {
    if (!avatarActive) return;

    let rafId = 0;
    let lastTime = performance.now();
    let phase = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const keys = keysPressedRef.current;
      let kx = 0;
      let ky = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) kx -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) kx += 1;
      if (keys.has('KeyW') || keys.has('ArrowUp')) ky -= 1; // up toward horizon = deeper into temple
      if (keys.has('KeyS') || keys.has('ArrowDown')) ky += 1; // down toward camera

      const vx = Math.max(-1, Math.min(1, kx + joystickVecRef.current.x));
      const vy = Math.max(-1, Math.min(1, ky + joystickVecRef.current.y));
      const manualMag = Math.hypot(vx, vy);

      let moving = false;

      if (manualMag >= 0.12) {
        targetPosRef.current = null;
        moving = true;
        const speedX = 24;
        const speedY = 18;
        const nextX = Math.max(14, Math.min(86, avatarPosRef.current.xPct + vx * speedX * dt));
        const nextY = Math.max(48, Math.min(88, avatarPosRef.current.yPct + vy * speedY * dt));
        if (Math.abs(vx) > 0.1) setFacingSign(vx > 0 ? 1 : -1);
        avatarPosRef.current = { xPct: nextX, yPct: nextY };
        setAvatarPos({ xPct: nextX, yPct: nextY });
      } else if (targetPosRef.current) {
        const dx = targetPosRef.current.xPct - avatarPosRef.current.xPct;
        const dy = targetPosRef.current.yPct - avatarPosRef.current.yPct;
        const dist = Math.hypot(dx, dy);

        if (dist > 0.6) {
          moving = true;
          const step = Math.min(dist, 28 * dt);
          const nextX = avatarPosRef.current.xPct + (dx / dist) * step;
          const nextY = avatarPosRef.current.yPct + (dy / dist) * step;
          if (Math.abs(dx) > 0.4) setFacingSign(dx > 0 ? 1 : -1);
          avatarPosRef.current = { xPct: nextX, yPct: nextY };
          setAvatarPos({ xPct: nextX, yPct: nextY });
        } else {
          targetPosRef.current = null;
        }
      }

      setIsWalking(moving);
      phase += dt * (moving ? 5.2 : 1.8);
      setWalkCycle(phase);

      if (moving && now - lastRippleTimeRef.current > 280) {
        lastRippleTimeRef.current = now;
        const depthT = (avatarPosRef.current.yPct - 48) / 40;
        spawnRipple(avatarPosRef.current.xPct, avatarPosRef.current.yPct, 0.52 + depthT * 0.65);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [avatarActive, spawnRipple]);

  // Virtual Joystick Handlers
  const updateJoystickFromPoint = useCallback((clientX: number, clientY: number) => {
    const base = joystickBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.36;

    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }

    targetPosRef.current = null;
    setJoystickOffset({ x: dx, y: dy });
    joystickVecRef.current = {
      x: dx / maxR,
      y: dy / maxR,
    };
  }, []);

  const resetJoystick = useCallback(() => {
    isDraggingJoystickRef.current = false;
    setJoystickOffset({ x: 0, y: 0 });
    joystickVecRef.current = { x: 0, y: 0 };
  }, []);

  const handleResetAvatar = () => {
    targetPosRef.current = null;
    avatarPosRef.current = { xPct: 50, yPct: 76 };
    setAvatarPos({ xPct: 50, yPct: 76 });
    setFacingSign(1);
  };

  // Depth scaling: 0.52x deep in temple (yPct=48) -> 1.18x close to camera (yPct=88)
  const depthProgress = (avatarPos.yPct - 48) / 40;
  const depthScale = 0.52 + depthProgress * 0.66;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none">
      {/* 1. Top Floating Toggle Pill */}
      <div
        data-avatar-control="true"
        className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 z-40"
      >
        <button
          type="button"
          onClick={() => setAvatarActive((prev) => !prev)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 shadow-xl backdrop-blur-md cursor-pointer border ${
            avatarActive
              ? 'bg-gradient-to-r from-[#D6A044] to-[#FFD27A] text-[#080705] border-[#FFD27A] shadow-[0_0_25px_rgba(214,160,68,0.65)] scale-105'
              : 'bg-black/75 hover:bg-black/90 text-[#FFD27A] border-[#D6A044]/50 hover:border-[#D6A044]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{avatarActive ? 'Pharaoh Avatar: ON' : 'Pharaoh Avatar'}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              avatarActive ? 'bg-[#080705] animate-ping' : 'bg-[#D6A044]'
            }`}
          />
        </button>

        {avatarActive && (
          <button
            type="button"
            onClick={handleResetAvatar}
            className="p-2 rounded-full bg-black/75 hover:bg-black/90 text-[#FFD27A] border border-[#D6A044]/40 hover:border-[#D6A044] text-xs transition-all shadow-lg cursor-pointer"
            title="Reset Avatar Position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Glowing Golden Floor Footstep Ripples */}
      {avatarActive &&
        ripples.map((ripple) => (
          <div
            key={ripple.id}
            style={{
              left: `${ripple.xPct}%`,
              top: `${ripple.yPct}%`,
              transform: `translate(-50%, -50%) scale(${ripple.scale})`,
            }}
            className="absolute pointer-events-none z-20"
          >
            <div className="w-16 h-6 rounded-full border border-[#FFD27A]/70 bg-[#D6A044]/15 animate-ping" />
          </div>
        ))}

      {/* 3. Royal Pharaonic Explorer Avatar + Ground Shadow + Golden Compass Ring */}
      {avatarActive && (
        <div
          style={{
            left: `${avatarPos.xPct}%`,
            top: `${avatarPos.yPct}%`,
            transform: `translate(-50%, -92%) scale(${depthScale.toFixed(3)})`,
          }}
          className="absolute pointer-events-none z-30 will-change-transform"
        >
          {/* Ground Shadow + Rotating Golden Compass Ring */}
          <div className="relative flex flex-col items-center">
            <RoyalPharaonicExplorerSVG
              isWalking={isWalking}
              facingSign={facingSign}
              walkCycle={walkCycle}
            />
            <div className="relative -mt-5 w-28 h-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-black/55 blur-md" />
              <div
                className="w-24 h-7 rounded-full border border-[#FFD27A]/75 shadow-[0_0_18px_rgba(56,189,248,0.45)]"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(56,189,248,0.22) 0%, rgba(214,160,68,0.18) 60%, transparent 100%)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Virtual Analog Joystick & Clean Pharaonic HUD Hint */}
      {avatarActive && (
        <>
          <div
            data-avatar-control="true"
            className="absolute bottom-14 left-5 pointer-events-auto flex flex-col items-center gap-1.5 z-40"
          >
            <div
              ref={joystickBaseRef}
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                isDraggingJoystickRef.current = true;
                updateJoystickFromPoint(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (!isDraggingJoystickRef.current) return;
                e.stopPropagation();
                updateJoystickFromPoint(e.clientX, e.clientY);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                resetJoystick();
              }}
              onPointerCancel={resetJoystick}
              className="w-24 h-24 rounded-full bg-black/65 backdrop-blur-md border-2 border-[#D6A044]/70 shadow-[0_0_25px_rgba(214,160,68,0.3)] relative flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
              title="Use Joystick or WASD to walk"
            >
              <span className="absolute top-1.5 text-[9px] font-bold text-[#FFD27A]/80">W</span>
              <span className="absolute bottom-1.5 text-[9px] font-bold text-[#FFD27A]/80">S</span>
              <span className="absolute left-2 text-[9px] font-bold text-[#FFD27A]/80">A</span>
              <span className="absolute right-2 text-[9px] font-bold text-[#FFD27A]/80">D</span>

              <div
                style={{
                  transform: `translate(${joystickOffset.x}px, ${joystickOffset.y}px)`,
                }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD27A] to-[#D6A044] border border-white/60 shadow-[0_0_15px_rgba(214,160,68,0.9)] flex items-center justify-center transition-transform duration-75"
              >
                <Gamepad2 className="w-4 h-4 text-[#080705]" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-14 right-5 pointer-events-none z-40">
            <div className="px-3.5 py-2 rounded-full bg-[#080705]/80 backdrop-blur-md border border-[#D6A044]/40 text-[11px] font-medium text-[#F5EFE6] flex items-center gap-2 shadow-lg">
              <Compass className="w-3.5 h-3.5 text-[#FFD27A] shrink-0" />
              <span>Drag to look 360° · Click floor or use Joystick to walk</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
