import React from 'react';

interface PetChickenProps {
  type: string;
  className?: string;
  isFeeding?: boolean;
  level?: number;
  isAscending?: boolean;
}

const CONFIGS: Record<string, any> = {
  chicken_classic: { b1: '#FEF9C3', b2: '#EAB308', b3: '#A16207', w: '#FDE68A', a: '#FFFBEB' },
  chicken_golden: { b1: '#FFFBEB', b2: '#F59E0B', b3: '#92400E', w: '#FDE68A', a: '#FEF9C3', glow: 'rgba(251,191,36,0.7)', crown: true },
  chicken_ninja: { b1: '#6B7280', b2: '#1F2937', b3: '#111827', w: '#374151', a: '#9CA3AF', dark: true },
  chicken_wizard: { b1: '#C4B5FD', b2: '#7C3AED', b3: '#4C1D95', w: '#8B5CF6', a: '#EDE9FE', hat: true, glow: 'rgba(139,92,246,0.5)' },
  chicken_cosmic: { b1: '#A5B4FC', b2: '#4338CA', b3: '#1E1B4B', w: '#6366F1', a: '#E0E7FF', cosmic: true, glow: 'rgba(99,102,241,0.6)' },
  chicken_robot: { b1: '#D1D5DB', b2: '#6B7280', b3: '#374151', w: '#9CA3AF', a: '#F3F4F6', robot: true },
  chicken_devil: { b1: '#FCA5A5', b2: '#DC2626', b3: '#7F1D1D', w: '#EF4444', a: '#FECACA', horns: true, glow: 'rgba(220,38,38,0.5)' },
  chicken_angel: { b1: '#F0F9FF', b2: '#BAE6FD', b3: '#7DD3FC', w: '#E0F2FE', a: '#FFFFFF', halo: true, glow: 'rgba(186,230,253,0.6)' },
  chicken_samurai: { b1: '#FCA5A5', b2: '#DC2626', b3: '#7F1D1D', w: '#1F2937', a: '#FECACA', headband: true },
  chicken_viking: { b1: '#FDE68A', b2: '#D97706', b3: '#78350F', w: '#92400E', a: '#FEF3C7', helmet: true },
};

export const PetChicken: React.FC<PetChickenProps> = ({ type, className = '', isFeeding = false, level = 3, isAscending = false }) => {
  const cfg = CONFIGS[type] || CONFIGS.chicken_classic;
  const isBaby = level === 0;
  const isTeen = level === 1;
  const isGod = level === 3;
  const showAcc = level >= 2;

  // SVG center point — CY tuned to visually center chicken in the display circle
  const CX = 100, CY = 130;
  const scale = isBaby ? 0.58 : isTeen ? 0.78 : isGod ? 1.05 : 1.0;

  // Add a global offset to push the entire chicken down
  const globalOffsetY = 45;
  // SVG-native centering: translate(cx*(1-s), cy*(1-s) + offsetY) scale(s)
  const svgTransform = `translate(${CX * (1 - scale)},${CY * (1 - scale) + globalOffsetY}) scale(${scale})`;
  const uid = type.replace('chicken_', '');

  return (
    <div className={`relative ${className}`} style={{ filter: cfg.glow ? `drop-shadow(0 0 22px ${cfg.glow})` : 'drop-shadow(0 18px 28px rgba(0,0,0,0.45))' }}>
      <svg viewBox="0 0 200 230" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id={`bg-${uid}`} cx="32%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="10%" stopColor={cfg.a} stopOpacity="0.9" />
            <stop offset="35%" stopColor={cfg.b1} />
            <stop offset="62%" stopColor={cfg.b2} />
            <stop offset="88%" stopColor={cfg.b3} />
            <stop offset="100%" stopColor={cfg.b3} stopOpacity="0.7" />
          </radialGradient>
          <radialGradient id={`wg-${uid}`} cx="38%" cy="30%" r="65%">
            <stop offset="0%" stopColor={cfg.a} />
            <stop offset="45%" stopColor={cfg.b1} />
            <stop offset="100%" stopColor={cfg.b3} />
          </radialGradient>
          <radialGradient id="combGrad" cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#FF9999" />
            <stop offset="60%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#991B1B" />
          </radialGradient>
          <radialGradient id="beakGrad" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <filter id="bl"><feGaussianBlur stdDeviation="5" /></filter>
          <filter id="bl2"><feGaussianBlur stdDeviation="2.5" /></filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="b1" />
            <feGaussianBlur stdDeviation="4" result="b2" />
            <feMerge>
              <feMergeNode in="b1" />
              <feMergeNode in="b2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Mystical turbulence distortion filter */}
          <filter id="mysticWarp" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence type="turbulence" baseFrequency="0.012 0.018" numOctaves="3" seed="5" result="noise">
              <animate attributeName="baseFrequency" values="0.012 0.018;0.018 0.024;0.012 0.018" dur="12s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" result="warp" />
            <feGaussianBlur in="warp" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Soft ethereal haze filter */}
          <filter id="hazeBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          {/* Iridescent shared gradient */}
          <radialGradient id="iridescentHaze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="40%" stopColor="#C4B5FD" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          {cfg.cosmic && (
            <pattern id="stars" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="1.5" fill="white" opacity="0.9" />
              <circle cx="28" cy="18" r="2" fill="#C7D2FE" opacity="0.7" />
              <circle cx="15" cy="32" r="1" fill="white" opacity="0.5" />
              <circle cx="35" cy="5" r="2.5" fill="#A5B4FC" opacity="0.6" />
            </pattern>
          )}
          <style>{`
            @keyframes breathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.97) scaleX(1.015)} }
            @keyframes flapL   { 0%,100%{transform:rotate(12deg)} 50%{transform:rotate(-8deg)} }
            @keyframes flapR   { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(8deg)} }
            @keyframes blink   { 0%,92%,100%{transform:scaleY(1)} 94%,98%{transform:scaleY(0.07)} }
            @keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
            @keyframes chew    { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(8deg)} }
            @keyframes spinAura{ from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
            @keyframes heart   { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-50px) scale(1.6);opacity:0} }
            @keyframes scan    { from{cx:55} to{cx:145} }
            @keyframes pulse2  { 0%,100%{opacity:0.6} 50%{opacity:1} }
            @keyframes shimmer { 0%,100%{opacity:0.7} 50%{opacity:1} }
            @keyframes twinkle {
              0%, 100% { opacity: 0.3; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.2); }
            }
            @keyframes rainbowBorder {
              0% { stroke: #ff0000; }
              20% { stroke: #ff00ff; }
              40% { stroke: #0000ff; }
              60% { stroke: #00ffff; }
              80% { stroke: #00ff00; }
              100% { stroke: #ffff00; }
            }
            @keyframes glowPulse {
              0%, 100% { filter: drop-shadow(0 0 5px rgba(255,255,255,0.4)); }
              50% { filter: drop-shadow(0 0 20px rgba(255,255,255,0.8)); }
            }
            @keyframes auroraFlow {
              0% { transform: translateX(-22px) skewX(-6deg) scaleY(0.9); opacity: 0.25; }
              50% { transform: translateX(22px) skewX(6deg) scaleY(1.1); opacity: 0.65; }
              100% { transform: translateX(-22px) skewX(-6deg) scaleY(0.9); opacity: 0.25; }
            }
            @keyframes runeGlow {
              0% { transform: rotate(0deg); opacity: 0.5; filter: brightness(1) drop-shadow(0 0 4px #818CF8); }
              50% { transform: rotate(180deg); opacity: 1; filter: brightness(1.8) drop-shadow(0 0 12px #A5B4FC); }
              100% { transform: rotate(360deg); opacity: 0.5; filter: brightness(1) drop-shadow(0 0 4px #818CF8); }
            }
            @keyframes orbitPulse {
              0%, 100% { transform: scale(0.9); opacity: 0.6; filter: brightness(1); }
              50% { transform: scale(1.25); opacity: 1; filter: brightness(2) drop-shadow(0 0 8px currentColor); }
            }
            @keyframes circuitPulse {
              0%, 100% { opacity: 0.25; filter: drop-shadow(0 0 3px #22D3EE); }
              50% { opacity: 1; filter: drop-shadow(0 0 14px #67E8F9); }
            }
            @keyframes liquidMotion {
              0% { filter: url(#auroraBlur) hue-rotate(0deg); }
              50% { filter: url(#auroraBlur) hue-rotate(20deg); }
              100% { filter: url(#auroraBlur) hue-rotate(0deg); }
            }
            @keyframes kunaiThrow {
              0% { opacity: 0; transform: scale(0) rotate(0deg); }
              15% { opacity: 1; transform: scale(1) rotate(0deg); }
              85% { opacity: 1; transform: scale(1) rotate(360deg); }
              100% { opacity: 0; transform: scale(0) rotate(720deg); }
            }
            @keyframes hellPulse {
              0%, 100% { transform: scale(1); opacity: 0.45; filter: drop-shadow(0 0 6px #EF4444); }
              50% { transform: scale(1.05); opacity: 0.7; filter: drop-shadow(0 0 18px #F97316); }
            }
            @keyframes fireRise {
              0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.95; }
              60% { opacity: 0.5; }
              100% { transform: translateY(-105px) scale(0.15) rotate(45deg); opacity: 0; }
            }
            @keyframes sakuraFloat {
              0% { transform: translate(0, -115px) rotate(0deg) scale(0.8); opacity: 0; }
              12% { opacity: 1; }
              88% { opacity: 0.85; }
              100% { transform: translate(45px, 115px) rotate(600deg) scale(0.6); opacity: 0; }
            }
            @keyframes snowDrift {
              0% { transform: translateY(-115px) translateX(0) rotate(0deg); opacity: 0; }
              12% { opacity: 1; }
              50% { transform: translateY(0) translateX(15px) rotate(90deg); }
              88% { opacity: 1; }
              100% { transform: translateY(115px) translateX(-5px) rotate(180deg); opacity: 0; }
            }
            @keyframes coinBounce {
              0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); }
              50% { transform: translateY(-10px) scale(1.1); filter: drop-shadow(0 12px 10px rgba(0,0,0,0.15)) drop-shadow(0 0 10px #FBBF24); }
            }
            @keyframes petalRotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes crystalShimmer {
              0%, 100% { transform: scale(0.85); opacity: 0.3; filter: drop-shadow(0 0 3px #BAE6FD); }
              50% { transform: scale(1.08); opacity: 1; filter: drop-shadow(0 0 10px white); }
            }
            @keyframes angelPulse {
              0%, 100% { transform: scale(1); opacity: 0.6; }
              50% { transform: scale(1.08); opacity: 1; filter: drop-shadow(0 0 15px #FDE68A); }
            }
            @keyframes nebulaBreath {
              0%, 100% { transform: scale(1); opacity: 0.85; }
              50% { transform: scale(1.07); opacity: 1; }
            }
            @keyframes auraColorShift {
              0%   { filter: url(#strongGlow) hue-rotate(0deg) brightness(1); }
              33%  { filter: url(#strongGlow) hue-rotate(20deg) brightness(1.2); }
              66%  { filter: url(#strongGlow) hue-rotate(-15deg) brightness(1.1); }
              100% { filter: url(#strongGlow) hue-rotate(0deg) brightness(1); }
            }
            @keyframes mysticHaze {
              0%   { opacity: 0.4; transform: scale(1) rotate(0deg); }
              33%  { opacity: 0.7; transform: scale(1.08) rotate(120deg); }
              66%  { opacity: 0.5; transform: scale(0.94) rotate(240deg); }
              100% { opacity: 0.4; transform: scale(1) rotate(360deg); }
            }
            @keyframes etherealDrift {
              0%   { transform: translateX(0) translateY(0) scale(1); opacity: 0.3; }
              25%  { transform: translateX(12px) translateY(-8px) scale(1.1); opacity: 0.6; }
              50%  { transform: translateX(-8px) translateY(10px) scale(0.95); opacity: 0.4; }
              75%  { transform: translateX(6px) translateY(-12px) scale(1.05); opacity: 0.65; }
              100% { transform: translateX(0) translateY(0) scale(1); opacity: 0.3; }
            }
            @keyframes iridescent {
              0%   { opacity: 0.35; filter: hue-rotate(0deg) saturate(1.5); }
              25%  { opacity: 0.6;  filter: hue-rotate(60deg) saturate(2); }
              50%  { opacity: 0.4;  filter: hue-rotate(120deg) saturate(1.8); }
              75%  { opacity: 0.55; filter: hue-rotate(200deg) saturate(2.2); }
              100% { opacity: 0.35; filter: hue-rotate(360deg) saturate(1.5); }
            }
          `}</style>
        </defs>

        {/* God aura - Dynamic based on Type */}
        {isGod && (
          <g transform={`translate(100, ${112 + globalOffsetY}) scale(1.15)`}>
            {/* ─── Shared Mystical Haze (all types) ─── */}
            <g>
              {/* Iridescent base glow — shifts color slowly */}
              <circle r="135" fill="url(#iridescentHaze)" style={{ animation: 'iridescent 10s ease-in-out infinite' }} />
              {/* Turbulent ethereal mist rings */}
              {[...Array(3)].map((_, i) => (
                <ellipse key={`mist-${i}`}
                  rx={100 + i * 12} ry={95 + i * 8}
                  fill="none" stroke="white" strokeWidth={1 - i * 0.2} opacity={0.08 - i * 0.02}
                  filter="url(#mysticWarp)"
                  style={{ animation: `mysticHaze ${14 + i * 5}s ease-in-out infinite`, animationDelay: `${i * 2}s` }} />
              ))}
              {/* Drifting ethereal orbs */}
              {[...Array(8)].map((_, i) => (
                <circle key={`orb-${i}`}
                  cx={Math.cos(i * 45 * Math.PI / 180) * 118}
                  cy={Math.sin(i * 45 * Math.PI / 180) * 118}
                  r={3 + (i % 3) * 1.5} fill="white" opacity="0.15"
                  filter="url(#hazeBlur)"
                  style={{ animation: `etherealDrift ${6 + i}s ease-in-out infinite`, animationDelay: `${i * 0.7}s` }} />
              ))}
            </g>

            {type.includes('wizard') && (
              <g style={{ animation: 'nebulaBreath 6s ease-in-out infinite' }}>
                <circle r="132" fill="none" stroke="#818CF8" strokeWidth="2" strokeDasharray="4 8" opacity="0.6" filter="url(#mysticWarp)" style={{ animation: 'spinAura 18s linear infinite' }} />
                <circle r="115" fill="none" stroke="#6366F1" strokeWidth="3" strokeDasharray="60 20" opacity="0.4" filter="url(#softGlow)" style={{ animation: 'spinAura 28s linear infinite reverse' }} />
                {[...Array(8)].map((_, i) => (
                  <g key={`rune-${i}`} transform={`rotate(${i * 45})`}
                    style={{ animation: 'runeGlow 4s ease-in-out infinite', animationDelay: `${i * 0.5}s` }}>
                    <circle cx="0" cy="-123" r="14" fill="#1E1B4B" stroke="#818CF8" strokeWidth="2" opacity="0.95" filter="url(#softGlow)" />
                    <text x="0" y="-119" fontSize="14" fill="#E0E7FF" textAnchor="middle" dominantBaseline="middle">
                      {['\u2727', '\u269b', '\u2721', '\u2625', '\u263e', '\u2600', '\u262f', '\u2735'][i]}
                    </text>
                  </g>
                ))}
                {[...Array(20)].map((_, i) => (
                  <circle key={`mote-${i}`} filter="url(#softGlow)"
                    cx={Math.cos(i * 18 * Math.PI / 180) * 103}
                    cy={Math.sin(i * 18 * Math.PI / 180) * 103}
                    r={1.5 + (i % 3) * 0.5} fill="#C7D2FE" opacity="0.85"
                    style={{ animation: `twinkle ${1.5 + (i % 3)}s ease-in-out infinite`, animationDelay: `${i * 0.12}s` }} />
                ))}
              </g>
            )}

            {/* ─── 1b. Cosmic — Galaxy Nebula & Orbital Planets ─── */}
            {type.includes('cosmic') && (
              <g style={{ animation: 'nebulaBreath 7s ease-in-out infinite' }}>
                <defs>
                  <radialGradient id="cosmicNebula" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35" />
                    <stop offset="45%" stopColor="#1D4ED8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle r="122" fill="url(#cosmicNebula)" />
                <circle r="128" fill="none" stroke="#7C3AED" strokeWidth="2" strokeDasharray="2 6" opacity="0.6" filter="url(#mysticWarp)" style={{ animation: 'spinAura 40s linear infinite' }} />
                {[...Array(5)].map((_, i) => {
                  const rad = 88 + i * 8;
                  const colors = ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#C084FC'];
                  return (
                    <g key={`orbit-${i}`} style={{ animation: `spinAura ${14 + i * 7}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}` }}>
                      <circle cx="0" cy={-rad} r={5 - i * 0.4} fill={colors[i]} filter="url(#strongGlow)"
                        style={{ animation: 'orbitPulse 2s ease-in-out infinite', animationDelay: `${i * 0.4}s` }} />
                    </g>
                  );
                })}
                {[...Array(35)].map((_, i) => (
                  <circle key={`star-${i}`} filter="url(#softGlow)"
                    cx={Math.cos(i * (360 / 35) * Math.PI / 180) * 110}
                    cy={Math.sin(i * (360 / 35) * Math.PI / 180) * 110}
                    r={0.9 + (i % 3) * 0.6} fill="white" opacity="0.7"
                    style={{ animation: `twinkle ${1.5 + (i % 4)}s ease-in-out infinite`, animationDelay: `${i * 0.08}s` }} />
                ))}
              </g>
            )}

            {/* ─── 2. Ninja — Dark Vortex & Kunai ─── */}
            {type.includes('ninja') && (
              <g>
                <circle r="128" fill="none" stroke="#7C3AED" strokeWidth="3" strokeDasharray="3 7" opacity="0.7" filter="url(#softGlow)" style={{ animation: 'spinAura 7s linear infinite' }} />
                <circle r="110" fill="none" stroke="#A78BFA" strokeWidth="2" strokeDasharray="8 12" opacity="0.5" filter="url(#softGlow)" style={{ animation: 'spinAura 10s linear infinite reverse' }} />
                {[...Array(6)].map((_, i) => (
                  <g key={`kunai-${i}`} transform={`rotate(${i * 60})`}
                    style={{ animation: 'kunaiThrow 2.5s ease-in-out infinite', animationDelay: `${i * 0.42}s` }}>
                    <path d="M0,-118 L5,-103 L0,-95 L-5,-103 Z" fill="#DDD6FE" stroke="white" strokeWidth="0.8" filter="url(#softGlow)" />
                    <path d="M0,-95 L6,-89 L0,-85 L-6,-89 Z" fill="#8B5CF6" />
                    <line x1="0" y1="-85" x2="0" y2="-76" stroke="#C4B5FD" strokeWidth="2.5" strokeLinecap="round" />
                  </g>
                ))}
                {[...Array(4)].map((_, i) => (
                  <ellipse key={`wisp-${i}`} rx="50" ry="92" fill="#5B21B6" opacity="0.18"
                    transform={`rotate(${i * 90})`}
                    style={{ animation: `auroraFlow ${4 + i}s ease-in-out infinite`, animationDelay: `${i * 0.8}s`, filter: 'blur(14px)' }} />
                ))}
              </g>
            )}

            {/* ─── 3. Devil — Hellfire Rings & Embers ─── */}
            {type.includes('devil') && (
              <g>
                <defs>
                  <radialGradient id="hellGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FCA5A5" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#DC2626" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle r="118" fill="url(#hellGlow)" style={{ animation: 'hellPulse 3s ease-in-out infinite' }} />
                <circle r="122" fill="none" stroke="#EF4444" strokeWidth="3" strokeDasharray="15 8" opacity="0.7" filter="url(#softGlow)" style={{ animation: 'spinAura 4s linear infinite' }} />
                <circle r="104" fill="none" stroke="#FDE047" strokeWidth="2" strokeDasharray="8 12" opacity="0.55" filter="url(#softGlow)" style={{ animation: 'spinAura 6s linear infinite reverse' }} />
                {[...Array(22)].map((_, i) => {
                  const angle = (i / 22) * 2 * Math.PI;
                  const rad = 45 + (i % 4) * 20;
                  return (
                    <circle key={`ember-${i}`} filter="url(#softGlow)"
                      cx={Math.cos(angle) * rad} cy={Math.sin(angle) * rad + 40}
                      r={2 + (i % 3)} fill={i % 3 === 0 ? '#FEF08A' : i % 3 === 1 ? '#EF4444' : '#F97316'}
                      style={{ animation: `fireRise ${1.0 + (i % 5) * 0.35}s ease-out infinite`, animationDelay: `${i * 0.1}s` }} />
                  );
                })}
              </g>
            )}

            {/* ─── 4. Robot — Hex Grid & Data Streams ─── */}
            {type.includes('robot') && (
              <g>
                <circle r="130" fill="none" stroke="#22D3EE" strokeWidth="2.5" strokeDasharray="2 8" opacity="0.6" filter="url(#softGlow)" style={{ animation: 'spinAura 12s linear infinite' }} />
                <circle r="112" fill="none" stroke="#67E8F9" strokeWidth="2" strokeDasharray="20 5" opacity="0.5" filter="url(#softGlow)" style={{ animation: 'spinAura 18s linear infinite reverse' }} />
                {[...Array(12)].map((_, i) => (
                  <g key={`node-${i}`} transform={`rotate(${i * 30})`}>
                    <circle cx="0" cy="-122" r="6" fill="#083344" stroke="#22D3EE" strokeWidth="2.5" filter="url(#softGlow)"
                      style={{ animation: 'circuitPulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
                    <line x1="0" y1="-116" x2="0" y2="-104" stroke="#67E8F9" strokeWidth="2" filter="url(#softGlow)"
                      style={{ animation: 'circuitPulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
                  </g>
                ))}
                {[...Array(6)].map((_, i) => (
                  <rect key={`data-${i}`} x={-4} y={-130} width={8} height={20} fill="#67E8F9" rx="3" filter="url(#strongGlow)"
                    transform={`rotate(${i * 60})`}
                    style={{ animation: 'circuitPulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
                ))}
              </g>
            )}

            {/* ─── 5. Angel — Radiant Halo & Feather Arc ─── */}
            {type.includes('angel') && (
              <g style={{ animation: 'angelPulse 5s ease-in-out infinite' }}>
                <defs>
                  <radialGradient id="angelGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FEF9C3" stopOpacity="0.5" />
                    <stop offset="60%" stopColor="#FDE68A" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FFFBEB" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle r="118" fill="url(#angelGlow)" />
                <circle r="128" fill="none" stroke="#FDE68A" strokeWidth="2.5" strokeDasharray="20 8" opacity="0.55" style={{ animation: 'spinAura 35s linear infinite' }} />
                <circle r="108" fill="none" stroke="#FEF3C7" strokeWidth="1.5" opacity="0.4" style={{ animation: 'spinAura 45s linear infinite reverse' }} />
                {[...Array(10)].map((_, i) => (
                  <g key={`feather-${i}`} transform={`rotate(${i * 36})`}
                    style={{ animation: 'auroraFlow 3.5s ease-in-out infinite', animationDelay: `${i * 0.35}s` }}>
                    <path d="M0,-130 Q7,-116 0,-100 Q-7,-116 0,-130" fill="white" opacity="0.8" />
                    <line x1="0" y1="-130" x2="0" y2="-100" stroke="white" strokeWidth="0.7" opacity="0.5" />
                  </g>
                ))}
                {[...Array(16)].map((_, i) => (
                  <circle key={`halo-${i}`}
                    cx={Math.cos(i * 22.5 * Math.PI / 180) * 128}
                    cy={Math.sin(i * 22.5 * Math.PI / 180) * 128}
                    r="2.5" fill="#FDE68A"
                    style={{ animation: `twinkle ${1.5 + (i % 3)}s ease-in-out infinite`, animationDelay: `${i * 0.12}s` }} />
                ))}
              </g>
            )}

            {/* ─── 6. Samurai — Sakura Mandala ─── */}
            {type.includes('samurai') && (
              <g>
                <defs>
                  <radialGradient id="sakuraGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FCE7F3" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle r="118" fill="url(#sakuraGlow)" />
                <circle r="122" fill="none" stroke="#F9A8D4" strokeWidth="1.5" strokeDasharray="3 6" opacity="0.5" style={{ animation: 'spinAura 25s linear infinite' }} />
                <g style={{ animation: 'petalRotate 18s linear infinite' }}>
                  {[...Array(8)].map((_, i) => (
                    <g key={`petal-${i}`} transform={`rotate(${i * 45})`}>
                      <ellipse cx="0" cy="-110" rx="9" ry="16" fill="#FBCFE8" opacity="0.75" />
                      <ellipse cx="0" cy="-110" rx="5" ry="8" fill="#F9A8D4" opacity="0.6" />
                    </g>
                  ))}
                </g>
                {[...Array(12)].map((_, i) => (
                  <path key={`sakura-${i}`} d="M0,0 C4,-5 9,-5 13,0 C9,5 4,5 0,0"
                    fill="#FDF2F8" stroke="#EC4899" strokeWidth="0.5" opacity="0.9"
                    transform={`translate(${(i * 23) % 150 - 75}, ${(i * 17) % 70 - 35})`}
                    style={{ animation: 'sakuraFloat 5s linear infinite', animationDelay: `${i * 0.5}s` }} />
                ))}
              </g>
            )}

            {/* ─── 7. Viking — Frost Crystal Halo ─── */}
            {type.includes('viking') && (
              <g>
                <defs>
                  <radialGradient id="frostGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle r="115" fill="url(#frostGlow)" />
                <circle r="122" fill="none" stroke="#7DD3FC" strokeWidth="2" strokeDasharray="10 6" opacity="0.55" style={{ animation: 'spinAura 22s linear infinite reverse' }} />
                {[...Array(8)].map((_, i) => (
                  <g key={`crystal-${i}`} transform={`rotate(${i * 45})`}
                    style={{ animation: 'crystalShimmer 2.5s ease-in-out infinite', animationDelay: `${i * 0.32}s` }}>
                    <line x1="0" y1="-106" x2="0" y2="-126" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="-7" y1="-114" x2="7" y2="-114" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <line x1="-5" y1="-120" x2="5" y2="-120" stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="0" cy="-126" r="2.5" fill="white" opacity="1" />
                  </g>
                ))}
                {[...Array(12)].map((_, i) => (
                  <circle key={`snow-${i}`}
                    cx={(i * 24) % 200 - 100} cy={(i * 17) % 90 - 45}
                    r={1.5 + (i % 3) * 0.5} fill="white" opacity="0.8"
                    style={{ animation: `snowDrift ${3.5 + i % 4}s linear infinite`, animationDelay: `${i * 0.4}s` }} />
                ))}
              </g>
            )}

            {/* ─── 8. Golden — Orbiting Coin Ring ─── */}
            {type.includes('golden') && (
              <g>
                <defs>
                  <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#92400E" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle r="118" fill="url(#goldGlow)" style={{ animation: 'angelPulse 4s ease-in-out infinite' }} />
                <circle r="125" fill="none" stroke="#FCD34D" strokeWidth="2" opacity="0.5" style={{ animation: 'spinAura 18s linear infinite' }} />
                {[...Array(10)].map((_, i) => (
                  <g key={`coin-${i}`} transform={`rotate(${i * 36})`}
                    style={{ animation: 'coinBounce 2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}>
                    <circle cx="0" cy="-115" r="9" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
                    <circle cx="0" cy="-115" r="6" fill="none" stroke="#FDE68A" strokeWidth="1" />
                    <text x="0" y="-112" fontSize="8" fill="#78350F" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">$</text>
                  </g>
                ))}
                {[...Array(22)].map((_, i) => (
                  <circle key={`sparkle-${i}`}
                    cx={Math.cos(i * (360 / 22) * Math.PI / 180) * 95}
                    cy={Math.sin(i * (360 / 22) * Math.PI / 180) * 95}
                    r={1.2 + (i % 3) * 0.5} fill="#FDE68A"
                    style={{ animation: `twinkle ${0.8 + (i % 3) * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.09}s` }} />
                ))}
              </g>
            )}

            {/* ─── 8. Classic (Pure Aurora Borealis - Default) ─── */}
            {type.includes('classic') && (
              <>
                <defs>
                  <linearGradient id="auroraGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4ADE80" stopOpacity="0" /><stop offset="50%" stopColor="#22C55E" stopOpacity="0.6" /><stop offset="100%" stopColor="#166534" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="auroraPurple" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C084FC" stopOpacity="0" /><stop offset="50%" stopColor="#A855F7" stopOpacity="0.5" /><stop offset="100%" stopColor="#6B21A8" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="auroraBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0" /><stop offset="50%" stopColor="#3B82F6" stopOpacity="0.5" /><stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="auroraPink" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F472B6" stopOpacity="0" /><stop offset="50%" stopColor="#EC4899" stopOpacity="0.5" /><stop offset="100%" stopColor="#9D174D" stopOpacity="0" />
                  </linearGradient>
                  <filter id="auroraBlur">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
                    <feTurbulence type="turbulence" baseFrequency="0.01 0.02" numOctaves="3" seed="2" result="noise">
                      <animate attributeName="baseFrequency" values="0.01 0.02; 0.015 0.025; 0.01 0.02" dur="10s" repeatCount="indefinite" />
                    </feTurbulence>
                    <feDisplacementMap in="blur" in2="noise" scale="25" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                </defs>
                <g style={{ animation: 'liquidMotion 8s ease-in-out infinite' }}>
                  <g filter="url(#auroraBlur)">
                    <g style={{ animation: 'spinAura 40s linear infinite' }}>
                      <path d="M-140,-50 A140,140 0 1,1 140,-50" fill="none" stroke="url(#auroraBlue)" strokeWidth="70" opacity="0.35" />
                      <path d="M-130,20 A130,130 0 1,0 130,20" fill="none" stroke="url(#auroraGreen)" strokeWidth="60" opacity="0.45" />
                    </g>
                    <g style={{ animation: 'spinAura 30s linear infinite reverse' }}>
                      <path d="M-125,40 A125,125 0 1,1 125,40" fill="none" stroke="url(#auroraPurple)" strokeWidth="65" opacity="0.35" />
                      <path d="M-115,-30 A115,115 0 1,0 115,-30" fill="none" stroke="url(#auroraPink)" strokeWidth="60" opacity="0.45" />
                    </g>
                  </g>
                </g>
                <g style={{ animation: 'spinAura 60s linear infinite' }}>
                  {[...Array(25)].map((_, i) => (
                    <circle key={i} cx={(Math.cos(i * 14.4 * Math.PI / 180) * 125)} cy={(Math.sin(i * 14.4 * Math.PI / 180) * 125)} r={1 + Math.random()} fill="white"
                      filter="drop-shadow(0 0 5px white)"
                      style={{ animation: `twinkle ${1.5 + Math.random() * 2}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
                  ))}
                </g>
              </>
            )}
          </g>
        )}

        {/* Shadow */}
        <ellipse cx="100" cy={214 + globalOffsetY} rx={isBaby ? 32 : isTeen ? 44 : 57} ry="10" fill="black" opacity="0.2"
          style={{ animation: isFeeding ? 'none' : 'float 3s ease-in-out infinite', transformOrigin: `100px ${214 + globalOffsetY}px` }} />

        {/* All body scaled by level — SVG-native centering */}
        <g transform={svgTransform} style={{ transition: 'transform 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <g style={{ animation: isFeeding ? 'bounce 0.4s ease-in-out infinite' : 'breathe 3.2s ease-in-out infinite', transformOrigin: '100px 160px' }}>

            {/* Wings (back layer, 3D shaded) */}
            <g style={{ transformOrigin: '28px 128px', animation: 'flapL 1.8s ease-in-out infinite' }}>
              <ellipse cx="28" cy="130" rx="20" ry="36" fill={`url(#wg-${uid})`} transform="rotate(28 28 130)" filter="drop-shadow(3px 5px 6px rgba(0,0,0,0.35))" />
              {/* Wing feather lines */}
              <path d="M22,110 Q14,130 18,152" fill="none" stroke={cfg.b3} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" transform="rotate(28 28 130)" />
              <path d="M28,106 Q20,128 24,150" fill="none" stroke={cfg.b3} strokeWidth="1" strokeLinecap="round" opacity="0.3" transform="rotate(28 28 130)" />
              <ellipse cx="22" cy="120" rx="6" ry="13" fill="white" opacity="0.2" transform="rotate(28 22 120)" />
            </g>
            <g style={{ transformOrigin: '172px 128px', animation: 'flapR 1.8s ease-in-out infinite' }}>
              <ellipse cx="172" cy="130" rx="20" ry="36" fill={`url(#wg-${uid})`} transform="rotate(-28 172 130)" filter="drop-shadow(-3px 5px 6px rgba(0,0,0,0.35))" />
              <path d="M178,110 Q186,130 182,152" fill="none" stroke={cfg.b3} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" transform="rotate(-28 172 130)" />
              <path d="M172,106 Q180,128 176,150" fill="none" stroke={cfg.b3} strokeWidth="1" strokeLinecap="round" opacity="0.3" transform="rotate(-28 172 130)" />
              <ellipse cx="178" cy="120" rx="6" ry="13" fill="white" opacity="0.2" transform="rotate(-28 178 120)" />
            </g>

            {/* Feet (teen+) */}
            {!isBaby && (
              <g>
                {/* Left leg */}
                <rect x="75" y="166" width="10" height="26" rx="5" fill="url(#lg)" />
                <ellipse cx="75" cy="192" rx="6" ry="4" fill="#D97706" />  {/* ankle */}
                <ellipse cx="65" cy="198" rx="9" ry="5" transform="rotate(18 65 198)" fill="url(#lg)" />
                <ellipse cx="79" cy="200" rx="11" ry="5.5" fill="url(#lg)" />
                <ellipse cx="93" cy="198" rx="9" ry="5" transform="rotate(-18 93 198)" fill="url(#lg)" />
                <path d="M65,197 L63,204" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
                <path d="M79,199 L79,206" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
                <path d="M93,197 L95,204" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
                {/* Right leg */}
                <rect x="116" y="166" width="10" height="26" rx="5" fill="url(#lg)" />
                <ellipse cx="121" cy="192" rx="6" ry="4" fill="#D97706" />
                <ellipse cx="107" cy="198" rx="9" ry="5" transform="rotate(18 107 198)" fill="url(#lg)" />
                <ellipse cx="121" cy="200" rx="11" ry="5.5" fill="url(#lg)" />
                <ellipse cx="135" cy="198" rx="9" ry="5" transform="rotate(-18 135 198)" fill="url(#lg)" />
                <path d="M107,197 L105,204" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
                <path d="M121,199 L121,206" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
                <path d="M135,197 L137,204" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}

            {/* Baby feet (simpler) */}
            {isBaby && (
              <g>
                <rect x="80" y="170" width="9" height="18" rx="4.5" fill="url(#lg)" />
                <ellipse cx="80" cy="191" rx="11" ry="5" fill="url(#lg)" />
                <rect x="111" y="170" width="9" height="18" rx="4.5" fill="url(#lg)" />
                <ellipse cx="120" cy="191" rx="11" ry="5" fill="url(#lg)" />
              </g>
            )}

            {/* Halo behind */}
            {showAcc && cfg.halo && (
              <ellipse cx="100" cy="13" rx="48" ry="13" fill="none" stroke="#FEF08A" strokeWidth="9"
                style={{ animation: 'pulse2 2s ease-in-out infinite' }} filter="url(#glow)" />
            )}
            {/* Horns behind */}
            {showAcc && cfg.horns && (
              <g fill="#7F1D1D">
                <path d="M52,52 Q18,6 38,-2 Q62,32 68,44 Z" filter="drop-shadow(0 0 4px #ef4444)" />
                <path d="M148,52 Q182,6 162,-2 Q138,32 132,44 Z" filter="drop-shadow(0 0 4px #ef4444)" />
                <path d="M55,52 Q22,10 40,0 Q63,33 69,44 Z" fill="#DC2626" opacity="0.7" />
                <path d="M145,52 Q178,10 160,0 Q137,33 131,44 Z" fill="#DC2626" opacity="0.7" />
              </g>
            )}

            {/* Main body */}
            <ellipse cx="100" cy="112" rx="81" ry="76" fill={`url(#bg-${uid})`} />
            {cfg.cosmic && <ellipse cx="100" cy="112" rx="81" ry="76" fill="url(#stars)" opacity="0.8" />}

            {/* Deep AO shadow at bottom of body */}
            <ellipse cx="100" cy="178" rx="60" ry="18" fill={cfg.b3} opacity="0.28" filter="url(#bl)" />

            {/* Large diffuse top gloss */}
            <path d="M28,76 C40,30 112,24 152,50 C98,38 48,56 34,102 Z" fill="white" opacity="0.55" filter="url(#bl)" />
            {/* Small sharp specular highlight */}
            <ellipse cx="56" cy="60" rx="18" ry="10" transform="rotate(-38 56 60)" fill="white" opacity="0.92" />
            <ellipse cx="64" cy="56" rx="6" ry="3" transform="rotate(-38 64 56)" fill="white" opacity="1" />
            {/* Rim light right side */}
            <path d="M136,182 C172,160 186,114 182,70 C192,118 170,182 104,190 C114,188 126,186 136,182 Z" fill={cfg.a} opacity="0.6" filter="url(#bl)" />
            {/* Subtle sub-surface scattering (chest warmth) */}
            <ellipse cx="100" cy="140" rx="45" ry="32" fill={cfg.a} opacity="0.18" filter="url(#bl)" />

            {/* Comb + wattle — visible unless wearing headgear at level 2+ */}
            {(!showAcc || (!cfg.hat && !cfg.crown && !cfg.helmet && !cfg.halo && !cfg.horns)) && (
              <g>
                {/* Feather tuft (baby) */}
                <path d="M100,38 Q120,16 104,2 Q108,22 115,36" fill="none" stroke={cfg.b3} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
                <path d="M100,38 Q80,16 96,2  Q92,22 85,36" fill="none" stroke={cfg.b3} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
                {!isBaby && (
                  <g>
                    {/* Comb */}
                    <path d="M84,46 Q87,8 100,20 Q113,8 116,46 Z" fill="url(#combGrad)" stroke="#9B1C1C" strokeWidth="1.5" />
                    <circle cx="100" cy="16" r="14" fill="url(#combGrad)" stroke="#9B1C1C" strokeWidth="1.5" />
                    <circle cx="83" cy="29" r="11" fill="url(#combGrad)" stroke="#9B1C1C" strokeWidth="1.5" />
                    <circle cx="117" cy="29" r="11" fill="url(#combGrad)" stroke="#9B1C1C" strokeWidth="1.5" />
                    {/* Comb highlights */}
                    <circle cx="97" cy="11" r="4" fill="white" opacity="0.4" />
                    <circle cx="82" cy="25" r="3" fill="white" opacity="0.3" />
                    {/* Wattle under beak */}
                    <ellipse cx="100" cy="126" rx="8" ry="6" fill="url(#combGrad)" stroke="#9B1C1C" strokeWidth="1" opacity="0.9" />
                    <ellipse cx="100" cy="124" rx="4" ry="3" fill="white" opacity="0.25" />
                  </g>
                )}
              </g>
            )}

            {/* ── Accessories (level 2+) ── */}
            {/* Wizard hat */}
            {showAcc && cfg.hat && (
              <g transform="translate(0,-30)">
                <ellipse cx="100" cy="56" rx="78" ry="19" fill="#1E1B4B" stroke="#312E81" strokeWidth="2.5" />
                <path d="M48,56 Q100,-48 152,56 Z" fill="#4338CA" />
                <path d="M55,56 Q100,-20 145,56 Z" fill="#312E81" opacity="0.55" />
                <ellipse cx="100" cy="56" rx="78" ry="19" fill="none" stroke="#6366F1" strokeWidth="1" opacity="0.8" />
                {/* Star */}
                <path d="M100,14 L103,24 L114,24 L106,30 L109,41 L100,35 L91,41 L94,30 L86,24 L97,24 Z" fill="#FBBF24" filter="url(#glow)" />
                {/* Band decoration */}
                <path d="M58,56 Q100,44 142,56" fill="none" stroke="#A5B4FC" strokeWidth="2" opacity="0.7" />
              </g>
            )}
            {/* Crown (Gà Vàng) */}
            {showAcc && cfg.crown && (
              <g transform="translate(0,-20)">
                {/* Crown base */}
                <path d="M50,60 L150,60 L140,20 L115,45 L100,10 L85,45 L60,20 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M52,58 L148,58 L139,24 L115,48 L100,16 L85,48 L61,24 Z" fill="#FDE68A" />
                <ellipse cx="100" cy="60" rx="50" ry="12" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
                <ellipse cx="100" cy="60" rx="46" ry="8" fill="#FDE68A" opacity="0.6" />
                {/* Gems */}
                <circle cx="100" cy="46" r="5" fill="#EF4444" filter="url(#glow)" />
                <circle cx="75" cy="48" r="3.5" fill="#3B82F6" />
                <circle cx="125" cy="48" r="3.5" fill="#3B82F6" />
                <circle cx="100" cy="10" r="4" fill="#EF4444" />
                <circle cx="60" cy="20" r="3" fill="#10B981" />
                <circle cx="140" cy="20" r="3" fill="#10B981" />
              </g>
            )}
            {/* Viking helmet */}
            {showAcc && cfg.helmet && (
              <g transform="translate(0,-12)">
                <path d="M38,66 C38,8 162,8 162,66 Z" fill="#9CA3AF" stroke="#6B7280" strokeWidth="3" />
                <path d="M42,66 C42,18 158,18 158,66 Z" fill="#D1D5DB" opacity="0.4" />
                <rect x="32" y="62" width="136" height="15" rx="7.5" fill="#6B7280" stroke="#4B5563" strokeWidth="2" />
                <rect x="36" y="63" width="128" height="6" rx="3" fill="white" opacity="0.2" />
                <circle cx="100" cy="69" r="6" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" />
                <path d="M44,44 Q2,8 8,-22 Q32,4 64,34 Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
                <path d="M156,44 Q198,8 192,-22 Q168,4 136,34 Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
                <path d="M48,44 Q10,10 14,-18 Q36,6 66,34 Z" fill="white" opacity="0.3" />
              </g>
            )}
            {/* Headband */}
            {showAcc && cfg.headband && (
              <g>
                <rect x="28" y="54" width="144" height="22" rx="11" fill="white" transform="rotate(-3 100 65)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))" />
                <rect x="32" y="56" width="136" height="8" rx="4" fill="white" transform="rotate(-3 100 60)" opacity="0.5" />
                <circle cx="100" cy="65" r="9" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />
                <circle cx="100" cy="65" r="4" fill="white" opacity="0.5" />
                <path d="M167,60 Q196,72 180,108 Q167,84 160,77 Z" fill="white" />
                <path d="M159,66 Q182,84 166,118 Q156,98 150,88 Z" fill="white" opacity="0.7" />
              </g>
            )}
            {/* Ninja mask */}
            {showAcc && cfg.dark && (
              <g>
                <path d="M22,88 C22,54 178,54 178,88 C178,118 22,118 22,88 Z" fill="#111827" />
                <path d="M26,88 C26,60 174,60 174,88 C174,108 26,108 26,88 Z" fill="#1F2937" opacity="0.6" />
                <path d="M168,93 Q204,103 190,144 Q172,114 162,108 Z" fill="#111827" />
                <path d="M158,99 Q192,124 168,158 Q158,130 152,118 Z" fill="#1F2937" opacity="0.8" />
              </g>
            )}
            {/* Robot visor */}
            {showAcc && cfg.robot && (
              <g>
                <rect x="32" y="64" width="136" height="44" rx="22" fill="#111827" stroke="#374151" strokeWidth="4" />
                <rect x="38" y="70" width="124" height="14" rx="7" fill="#1F2937" />
                <rect x="40" y="72" width="120" height="7" rx="3.5" fill="white" opacity="0.15" />
              </g>
            )}

            {/* Eyes */}
            {(!showAcc || !cfg.robot) ? (
              <g style={{ transformOrigin: '100px 96px', animation: 'blink 5s ease-in-out infinite' }}>
                {isFeeding ? (
                  // Happy eyes ^ ^ (squinting)
                  <g fill="none" strokeLinecap="round">
                    <path d="M52,96 Q65,78 78,96" stroke={cfg.dark && showAcc ? '#F9FAFB' : cfg.b3} strokeWidth="8" />
                    <path d="M122,96 Q135,78 148,96" stroke={cfg.dark && showAcc ? '#F9FAFB' : cfg.b3} strokeWidth="8" />
                    {/* Rosy cheeks when happy */}
                    <ellipse cx="45" cy="108" rx="14" ry="8" fill="#FCA5A5" opacity="0.7" filter="url(#bl2)" />
                    <ellipse cx="155" cy="108" rx="14" ry="8" fill="#FCA5A5" opacity="0.7" filter="url(#bl2)" />
                  </g>
                ) : (
                  <>
                    {/* Left eye — sclera + iris + pupil + catchlights */}
                    <circle cx="64" cy="96" r="16" fill="white" opacity="0.95" />
                    <circle cx="64" cy="96" r="13" fill={cfg.dark && showAcc ? '#E5E7EB' : '#2D3748'} />
                    <circle cx="64" cy="96" r="8" fill={cfg.dark && showAcc ? '#9CA3AF' : '#1a1a2e'} />
                    <circle cx="58" cy="90" r="5" fill="white" opacity="0.9" />
                    <circle cx="70" cy="102" r="2.5" fill="white" opacity="0.5" />
                    <circle cx="56" cy="88" r="1.8" fill="white" opacity="1" />
                    <path d="M51,105 A14 14 0 0 0 77,105 A15 15 0 0 1 51,105" fill={cfg.b1} opacity="0.55" />
                    {/* Right eye */}
                    <circle cx="136" cy="96" r="16" fill="white" opacity="0.95" />
                    <circle cx="136" cy="96" r="13" fill={cfg.dark && showAcc ? '#E5E7EB' : '#2D3748'} />
                    <circle cx="136" cy="96" r="8" fill={cfg.dark && showAcc ? '#9CA3AF' : '#1a1a2e'} />
                    <circle cx="130" cy="90" r="5" fill="white" opacity="0.9" />
                    <circle cx="142" cy="102" r="2.5" fill="white" opacity="0.5" />
                    <circle cx="128" cy="88" r="1.8" fill="white" opacity="1" />
                    <path d="M123,105 A14 14 0 0 0 149,105 A15 15 0 0 1 123,105" fill={cfg.b1} opacity="0.55" />
                  </>
                )}
              </g>
            ) : (
              // Robot scanner eye
              <g>
                <rect x="46" y="78" width="108" height="20" rx="10" fill="#374151" />
                <rect x="48" y="80" width="104" height="8" rx="4" fill="#111827" />
                <circle r="11" fill="#EF4444" filter="url(#glow)">
                  <animate attributeName="cx" values="60;140;60" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="88;88;88" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle r="5" fill="#FECACA" opacity="0.9">
                  <animate attributeName="cx" values="60;140;60" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="88;88;88" dur="1.8s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* Blush — soft, natural, two-tone */}
            {(!showAcc || (!cfg.dark && !cfg.robot)) && (
              <g filter="url(#bl2)">
                <ellipse cx="44" cy="118" rx="22" ry="13" fill="#F87171" opacity="0.5" />
                <ellipse cx="44" cy="116" rx="14" ry="8" fill="#FCA5A5" opacity="0.4" />
                <ellipse cx="156" cy="118" rx="22" ry="13" fill="#F87171" opacity="0.5" />
                <ellipse cx="156" cy="116" rx="14" ry="8" fill="#FCA5A5" opacity="0.4" />
              </g>
            )}

            {/* Beak — gradient, drop shadow, 3D depth */}
            <g style={{ transformOrigin: '100px 114px', animation: isFeeding ? 'chew 0.2s ease-in-out infinite' : 'none' }}>
              <path d="M82,112 Q100,102 118,112 Q100,126 82,112 Z" fill="url(#beakGrad)" filter="drop-shadow(0 4px 5px rgba(0,0,0,0.3))" />
              {/* Top gloss */}
              <path d="M90,108 Q100,105 110,108" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
              {/* Side shadow line */}
              <path d="M84,114 Q100,118 116,114" stroke="#92400E" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />
              {isFeeding ? (
                <g>
                  <path d="M85,115 Q100,140 115,115 Z" fill="#6B0F0F" />
                  <path d="M90,125 Q100,137 110,125 Z" fill="#FECACA" />
                  <path d="M96,129 Q100,132 104,129" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
                </g>
              ) : (
                <path d="M88,116 Q100,121 112,116" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none" />
              )}
            </g>

            {/* Feeding hearts */}
            {isFeeding && (
              <g>
                <text x="155" y="50" fontSize="18" style={{ animation: 'heart 1s ease-in infinite' }}>❤️</text>
                <text x="28" y="60" fontSize="14" style={{ animation: 'heart 1.3s ease-in infinite 0.2s' }}>💛</text>
                <text x="148" y="80" fontSize="12" style={{ animation: 'heart 0.9s ease-in infinite 0.4s' }}>✨</text>
              </g>
            )}

            {/* God sparkles - Permanent subtle + pulsing when Ascending */}
            {isGod && !isFeeding && (
              <g style={{ animation: isAscending ? 'pulse2 0.5s ease-in-out infinite' : 'pulse2 3s ease-in-out infinite' }}>
                <text x="20" y="70" fontSize={isAscending ? "16" : "10"} opacity={isAscending ? 1 : 0.4}>✨</text>
                <text x="162" y="55" fontSize={isAscending ? "14" : "8"} opacity={isAscending ? 1 : 0.3}>⭐</text>
                <text x="155" y="160" fontSize={isAscending ? "15" : "9"} opacity={isAscending ? 1 : 0.4}>✨</text>
                {isAscending && (
                  <>
                    <text x="100" y="20" fontSize="20" className="animate-bounce">👑</text>
                    <text x="40" y="40" fontSize="12">✨</text>
                    <text x="160" y="100" fontSize="12">✨</text>
                  </>
                )}
              </g>
            )}

          </g>
        </g>
      </svg>
    </div>
  );
};
