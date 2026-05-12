import React, { useEffect, useState } from 'react';
import { PetChicken } from './PetChicken';

interface Props { petType:string|null; petName:string; onFinished:()=>void; }

const META:Record<string,any> = {
  chicken_classic: {name:'Gà Classic',color:'#FFC107',glow:'#FFC10799',rarity:'Phổ Thông',rarityBg:'#78909C',desc:'Chú gà truyền thống, ham ăn chóng lớn.'},
  chicken_golden:  {name:'Gà Vàng May Mắn',color:'#FFD700',glow:'#FFD70099',rarity:'Hiếm',rarityBg:'#F9A825',desc:'Mang năng lượng tài lộc và thịnh vượng.'},
  chicken_ninja:   {name:'Gà Ninja',color:'#AB47BC',glow:'#AB47BC88',rarity:'Hiếm',rarityBg:'#6A1B9A',desc:'Âm thầm nhanh nhẹn trong bóng tối.'},
  chicken_wizard:  {name:'Gà Phù Thủy',color:'#CE93D8',glow:'#CE93D899',rarity:'Siêu Hiếm',rarityBg:'#7B1FA2',desc:'Bậc thầy phép thuật và lời tiên tri.'},
  chicken_robot:   {name:'Gà Robot',color:'#00E5FF',glow:'#00E5FF88',rarity:'Hiếm',rarityBg:'#00838F',desc:'Trí tuệ nhân tạo vượt thời đại.'},
  chicken_angel:   {name:'Gà Thiên Thần',color:'#64B5F6',glow:'#64B5F688',rarity:'Siêu Hiếm',rarityBg:'#1565C0',desc:'Ban phát phước lành và bình an.'},
  chicken_devil:   {name:'Gà Ác Ma',color:'#FF5252',glow:'#FF525299',rarity:'Siêu Hiếm',rarityBg:'#B71C1C',desc:'Cá tính nổi loạn và đầy quyền năng.'},
  chicken_samurai: {name:'Gà Samurai',color:'#FF8A80',glow:'#FF8A8088',rarity:'Hiếm',rarityBg:'#C62828',desc:'Tinh thần võ sĩ đạo bất diệt.'},
  chicken_viking:  {name:'Gà Viking',color:'#FFAB40',glow:'#FFAB4088',rarity:'Phổ Thông',rarityBg:'#E65100',desc:'Chiến binh dũng mãnh phương Bắc.'},
  chicken_cosmic:  {name:'Gà Vũ Trụ',color:'#7986CB',glow:'#7986CBAA',rarity:'Huyền Thoại',rarityBg:'#1A237E',desc:'Kết nối với năng lượng vũ trụ.'},
};

// Constellation groups: each group = { color, stars:[{x,y}], lines:[[i,j]...] }
// x,y in 0-100 space (SVG viewBox="0 0 100 100")
const CONSTELLATIONS = [
  // 1. Top-left — Thiên Long (indigo)
  { color:'#a5b4fc', stars:[{x:7,y:12},{x:13,y:7},{x:20,y:14},{x:14,y:22},{x:22,y:27},{x:9,y:28}], lines:[[0,1],[1,2],[2,0],[0,3],[3,4],[3,5]] },
  // 2. Top-right — Bạch Hổ (gold)
  { color:'#fde68a', stars:[{x:75,y:8},{x:83,y:12},{x:90,y:6},{x:81,y:20},{x:88,y:24},{x:77,y:26}], lines:[[0,1],[1,2],[0,3],[3,4],[4,5],[1,3]] },
  // 3. Bottom-left — Chu Tước (cyan)
  { color:'#6ee7f7', stars:[{x:8,y:68},{x:16,y:62},{x:12,y:77},{x:22,y:71},{x:26,y:80},{x:19,y:83}], lines:[[0,1],[1,2],[0,2],[2,3],[3,4],[4,5]] },
  // 4. Bottom-right — Huyền Vũ (pink)
  { color:'#fca5a5', stars:[{x:76,y:70},{x:84,y:65},{x:91,y:72},{x:83,y:80},{x:89,y:85},{x:78,y:84}], lines:[[0,1],[1,2],[0,3],[3,4],[4,5],[2,3]] },
  // 5. Top-center — Thiên Yết (green)
  { color:'#bbf7d0', stars:[{x:40,y:9},{x:49,y:5},{x:58,y:11},{x:54,y:21},{x:44,y:23},{x:60,y:19}], lines:[[0,1],[1,2],[2,5],[5,3],[3,4],[4,0],[1,4]] },
  // 6. Bottom-center — Ma Kết (purple)
  { color:'#c4b5fd', stars:[{x:39,y:81},{x:48,y:86},{x:57,y:79},{x:52,y:90},{x:43,y:88},{x:61,y:84}], lines:[[0,1],[1,2],[2,5],[5,3],[3,4],[4,0]] },
  // 7. Left-center — Song Ngư (teal)
  { color:'#5eead4', stars:[{x:5,y:40},{x:12,y:35},{x:18,y:42},{x:10,y:50},{x:16,y:55},{x:6,y:57}], lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[0,3]] },
  // 8. Right-center — Bảo Bình (orange)
  { color:'#fdba74', stars:[{x:83,y:38},{x:90,y:34},{x:94,y:42},{x:88,y:48},{x:92,y:54},{x:83,y:52}], lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]] },
  // 9. Center-left mid — Xử Nữ (rose)
  { color:'#fda4af', stars:[{x:27,y:42},{x:32,y:36},{x:38,y:43},{x:34,y:51},{x:28,y:55},{x:35,y:58}], lines:[[0,1],[1,2],[2,3],[3,4],[4,0],[3,5]] },
  // 10. Center-right mid — Thiên Bình (yellow-green)
  { color:'#bef264', stars:[{x:63,y:40},{x:69,y:34},{x:75,y:41},{x:70,y:49},{x:64,y:53},{x:72,y:56}], lines:[[0,1],[1,2],[2,3],[3,4],[4,0],[3,5]] },
  // 11. Upper-left mid — Kim Ngưu (amber)
  { color:'#fcd34d', stars:[{x:24,y:18},{x:30,y:13},{x:36,y:19},{x:31,y:27},{x:25,y:30}], lines:[[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]] },
  // 12. Upper-right mid — Song Tử (violet)
  { color:'#e879f9', stars:[{x:62,y:14},{x:68,y:9},{x:74,y:15},{x:69,y:23},{x:62,y:26}], lines:[[0,1],[1,2],[2,3],[3,4],[4,0],[0,3]] },
  // 13. Lower-left mid — Bạch Dương (sky)
  { color:'#7dd3fc', stars:[{x:26,y:68},{x:32,y:62},{x:38,y:68},{x:33,y:76},{x:26,y:78}], lines:[[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]] },
  // 14. Lower-right mid — Sư Tử (coral)
  { color:'#fb923c', stars:[{x:62,y:67},{x:68,y:62},{x:74,y:68},{x:70,y:76},{x:62,y:78}], lines:[[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]] },
];

type Phase = 'dark'|'appear'|'connect'|'converge'|'flash'|'cardIn'|'flip'|'reveal';

export const HatchingOverlay: React.FC<Props> = ({petType,petName,onFinished}) => {
  const [phase,setPhase] = useState<Phase>('dark');
  const m = META[petType??'chicken_classic']??META.chicken_classic;

  useEffect(()=>{
    const ts=[
      setTimeout(()=>setPhase('appear'),  400),
      setTimeout(()=>setPhase('connect'), 1800),
      setTimeout(()=>setPhase('converge'),3600),
      setTimeout(()=>setPhase('flash'),   5400),
      setTimeout(()=>setPhase('cardIn'),  5900),
      setTimeout(()=>setPhase('flip'),    7200),
      setTimeout(()=>setPhase('reveal'),  8600),
    ];
    return ()=>ts.forEach(clearTimeout);
  },[]);

  const converging = phase==='converge'||phase==='flash';
  const showLines  = phase==='connect'||phase==='converge';
  const showCard   = ['cardIn','flip','reveal'].includes(phase);
  const flipped    = phase==='flip'||phase==='reveal';

  // Build flat star list with groupIndex & starIndex for delay calculations
  const allStars = CONSTELLATIONS.flatMap((g,gi)=>g.stars.map((s,si)=>({...s,gi,si,color:g.color,r:3+Math.random()*2})));
  const [stars] = useState(()=>allStars);

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,overflow:'hidden',background:'radial-gradient(ellipse 80% 60% at 50% 55%, #07001a 0%, #000006 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <style>{`
        @keyframes hs-fade    {from{opacity:0}to{opacity:1}}
        @keyframes hs-twinkle {0%,100%{opacity:.3;transform:scale(.7)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes hs-appear  {from{opacity:0;transform:translate(-50%,-50%) scale(0)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        @keyframes hs-flash   {0%{opacity:0}40%{opacity:1}100%{opacity:0}}
        @keyframes hs-draw    {from{stroke-dashoffset:300}to{stroke-dashoffset:0}}
        @keyframes hs-cardIn  {0%{opacity:0;transform:scale(0) rotate(-18deg);filter:blur(30px)}70%{transform:scale(1.05) rotate(2deg)}100%{opacity:1;transform:scale(1) rotate(0);filter:blur(0)}}
        @keyframes hs-spin    {from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes hs-shine   {from{left:-100px}to{left:110%}}
        @keyframes hs-glow    {0%,100%{box-shadow:0 0 40px var(--gc),0 0 80px var(--gc2)}50%{box-shadow:0 0 100px var(--gc),0 0 200px var(--gc2)}}
        @keyframes hs-floatUp {from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes hs-bounce  {0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        @keyframes hs-pulse   {0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes hs-orbit   {from{transform:rotate(var(--oa)) translateX(var(--or)) rotate(calc(-1*var(--oa)))}to{transform:rotate(calc(var(--oa)+360deg)) translateX(var(--or)) rotate(calc(-1*(var(--oa)+360deg)))}}
        @keyframes hs-textGlow{0%,100%{text-shadow:0 0 18px var(--tc),0 0 40px var(--tc)}50%{text-shadow:0 0 40px var(--tc),0 0 100px var(--tc),0 0 180px var(--tc)}}
        @keyframes hs-nebula  {0%{transform:translate(-50%,-50%) rotate(0) scale(1)}50%{transform:translate(-50%,-50%) rotate(180deg) scale(1.3)}100%{transform:translate(-50%,-50%) rotate(360deg) scale(1)}}
        @keyframes hs-conv    {0%{opacity:1}85%{opacity:1}100%{opacity:0}}
      `}</style>

      {/* Nebula layers */}
      {[{x:'20%',y:'18%',c:'rgba(70,0,160,0.3)',d:'55s'},{x:'80%',y:'75%',c:'rgba(0,20,100,0.25)',d:'75s'},{x:'50%',y:'45%',c:'rgba(50,0,90,0.2)',d:'95s'},{x:'15%',y:'72%',c:'rgba(100,0,50,0.15)',d:'65s'}].map((n,i)=>(
        <div key={i} style={{position:'absolute',left:n.x,top:n.y,width:'700px',height:'700px',borderRadius:'50%',background:`radial-gradient(circle, ${n.c} 0%, transparent 70%)`,animation:`hs-nebula ${n.d} linear infinite`}}/>
      ))}

      {/* Vignette */}
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.88) 100%)',pointerEvents:'none',zIndex:1}}/>

      {/* BG static twinkle stars */}
      {Array.from({length:70},(_,i)=>(
        <div key={i} style={{position:'absolute',width:`${1+(i%3)*.7}px`,height:`${1+(i%3)*.7}px`,borderRadius:'50%',background:'white',left:`${(i*13.7)%100}%`,top:`${(i*17.3)%100}%`,animation:`hs-twinkle ${2+i%4}s ${(i*.37)%3}s ease-in-out infinite`,opacity:.35,zIndex:2}}/>
      ))}

      {/* ── CONSTELLATION LINES (SVG) ── */}
      {showLines && (
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:4,opacity:converging?0:1,transition:'opacity 1.5s ease'}} viewBox="0 0 100 100" preserveAspectRatio="none">
          {CONSTELLATIONS.map((g,gi)=>
            g.lines.map(([a,b],li)=>{
              const s1=g.stars[a],s2=g.stars[b];
              const delay=gi*.35+li*.12;
              return (
                <line key={`${gi}-${li}`}
                  x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y}
                  stroke={g.color} strokeWidth=".4" strokeLinecap="round"
                  strokeDasharray="300" strokeDashoffset="300"
                  opacity=".65"
                  style={{animation:`hs-draw .8s ${delay}s ease forwards`}}
                />
              );
            })
          )}
        </svg>
      )}

      {/* ── CONSTELLATION STARS ── */}
      {(phase==='appear'||phase==='connect'||phase==='converge') && stars.map((s,i)=>{
        const delay = s.gi*.25+s.si*.08;
        const convDelay = s.gi*.08+s.si*.04;
        return (
          <div key={i} style={{
            position:'absolute',
            left: converging ? '50%' : `${s.x}%`,
            top:  converging ? '50%' : `${s.y}%`,
            width:`${s.r*2}px`,height:`${s.r*2}px`,
            marginLeft:`-${s.r}px`,marginTop:`-${s.r}px`,
            borderRadius:'50%',
            background:s.color,
            boxShadow:`0 0 ${s.r*4}px ${s.color}, 0 0 ${s.r*8}px ${s.color}66`,
            zIndex:5,
            opacity: phase==='appear' ? undefined : 1,
            transition: converging ? `left ${1.6+convDelay}s cubic-bezier(.4,0,.2,1), top ${1.6+convDelay}s cubic-bezier(.4,0,.2,1), opacity .5s ease` : 'none',
            animation: phase==='appear'
              ? `hs-appear .6s ${delay}s ease both`
              : phase==='connect'
              ? `hs-twinkle ${1.5+s.si*.2}s ${s.si*.1}s ease-in-out infinite`
              : undefined,
          }}/>
        );
      })}

      {/* Energy implosion glow at center during converge */}
      {converging && (
        <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:'20px',height:'20px',borderRadius:'50%',background:'white',boxShadow:'0 0 60px 30px rgba(200,150,255,0.8), 0 0 120px 60px rgba(100,50,255,0.4)',animation:'hs-pulse 1s ease-in-out infinite',zIndex:6}}/>
      )}

      {/* White flash */}
      {phase==='flash' && (
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,.95) 0%, rgba(200,150,255,.7) 40%, transparent 75%)',animation:'hs-flash .8s ease forwards',zIndex:10}}/>
      )}

      {/* ── TAROT CARD ── */}
      {showCard && (
        <div style={{perspective:'1400px',zIndex:8,animation:'hs-cardIn .9s cubic-bezier(.34,1.4,.64,1) forwards'}}>
          <div style={{width:'280px',height:'430px',transformStyle:'preserve-3d',transition:'transform 1.4s cubic-bezier(.175,.885,.32,1.275)',transform:flipped?'rotateY(180deg)':'rotateY(0)','--gc':m.glow,'--gc2':'rgba(139,92,246,0.4)',animation:!flipped?'hs-glow 2.5s ease-in-out infinite':undefined} as any}>

            {/* Card front - mystical */}
            <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',borderRadius:'20px',background:'linear-gradient(145deg,#07001a 0%,#12005a 40%,#07002a 100%)',border:'3px solid rgba(190,140,255,0.5)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
              <div style={{position:'absolute',left:'50%',top:'50%',width:'320px',height:'320px',background:'conic-gradient(from 0deg,transparent 85%,rgba(140,80,255,.15) 90%,transparent 95%)',borderRadius:'50%',transform:'translate(-50%,-50%)',animation:'hs-spin 8s linear infinite'}}/>
              {[90,62,38].map((r,i)=>(
                <div key={i} style={{position:'absolute',left:'50%',top:'50%',width:`${r*2}px`,height:`${r*2}px`,border:`1px solid rgba(180,130,255,${[.28,.2,.38][i]})`,borderRadius:'50%',transform:'translate(-50%,-50%)',animation:`hs-pulse ${[3,4,2.5][i]}s ${[0,1,.5][i]}s ease-in-out infinite`}}/>
              ))}
              {Array.from({length:8},(_,i)=>(
                <div key={i} style={{position:'absolute',top:'50%',left:'50%',width:'7px',height:'7px',borderRadius:'50%',background:`hsl(${i*45},100%,75%)`,boxShadow:`0 0 10px hsl(${i*45},100%,70%)`,marginTop:'-3.5px',marginLeft:'-3.5px','--oa':`${i*45}deg`,'--or':`${55+i%2*25}px`,animation:`hs-orbit ${2+i*.35}s linear infinite`} as any}/>
              ))}
              <div style={{fontSize:'60px',filter:'drop-shadow(0 0 24px rgba(180,120,255,0.9))',animation:'hs-bounce 3s ease-in-out infinite',zIndex:2}}>🔮</div>
              <div style={{color:'rgba(190,150,255,0.55)',fontFamily:'serif',letterSpacing:'.5em',fontSize:'10px',textTransform:'uppercase',marginTop:'18px',zIndex:2}}>✦ Chipstarot ✦</div>
              <div style={{position:'absolute',inset:'10px',border:'1px solid rgba(180,130,255,.18)',borderRadius:'14px'}}/>
              {['8px 8px auto auto','8px auto auto 8px','auto auto 8px 8px','auto 8px 8px auto'].map((p,i)=>(
                <span key={i} style={{position:'absolute',top:p.split(' ')[0],right:p.split(' ')[1],bottom:p.split(' ')[2],left:p.split(' ')[3],color:'rgba(190,150,255,.45)',fontSize:'16px'}}>✦</span>
              ))}
              <div style={{position:'absolute',top:0,bottom:0,width:'70px',background:'linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)',animation:'hs-shine 3.5s ease-in-out infinite'}}/>
            </div>

            {/* Card back - revealed */}
            <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',transform:'rotateY(180deg)',borderRadius:'20px',background:'linear-gradient(155deg,#fff9f0,#ffffff,#fff5e8)',border:`3px solid ${m.color}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',padding:'16px 14px',overflow:'hidden',boxShadow:`0 0 80px ${m.glow},0 0 200px ${m.glow}55`}}>
              <div style={{position:'absolute',inset:0,background:`conic-gradient(from 0deg,transparent 90%,${m.color}18 95%,transparent 100%)`,animation:'hs-spin 10s linear infinite',pointerEvents:'none'}}/>
              <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse 80% 40% at 50% 0%, ${m.color}28 0%, transparent 70%)`,pointerEvents:'none'}}/>
              <div style={{position:'absolute',inset:'8px',border:`1px solid ${m.color}44`,borderRadius:'14px',pointerEvents:'none'}}/>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',position:'relative'}}>
                <div style={{fontSize:'8px',letterSpacing:'.4em',color:'#a16207',textTransform:'uppercase',fontWeight:'bold'}}>✦ Chipstarot Tarot ✦</div>
                <div style={{padding:'3px 14px',borderRadius:'20px',fontSize:'9px',fontWeight:900,background:m.rarityBg,color:'white',letterSpacing:'.2em',boxShadow:`0 0 14px ${m.rarityBg}88`,textTransform:'uppercase'}}>{m.rarity}</div>
              </div>
              <div style={{fontSize:'17px',fontWeight:900,background:`linear-gradient(90deg,#92400e,${m.color},#92400e)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent','--tc':m.color,animation:'hs-textGlow 2s ease-in-out infinite,hs-floatUp .7s ease both',position:'relative'} as any}>{m.name}</div>
              <div style={{width:'140px',height:'140px',animation:'hs-floatUp .8s .1s ease both, hs-bounce 3s .8s ease-in-out infinite',flexShrink:0}}>
                {petType && <PetChicken type={petType} className="w-full h-full" level={1}/>}
              </div>
              <div style={{width:'80%',height:'1px',background:`linear-gradient(90deg,transparent,${m.color},transparent)`,flexShrink:0}}/>
              <div style={{fontSize:'11px',color:'#78350f',textAlign:'center',fontStyle:'italic',lineHeight:1.6,animation:'hs-floatUp .8s .2s ease both',position:'relative'}}>{m.desc}</div>
              <div style={{fontSize:'8px',letterSpacing:'.3em',color:'#a16207',opacity:.6,textTransform:'uppercase'}}>Linh Thú Bài Tarot</div>
            </div>
          </div>
        </div>
      )}

      {/* Sparkles on flip */}
      {flipped && Array.from({length:16},(_,i)=>(
        <div key={i} style={{position:'absolute',left:`${20+Math.random()*60}%`,top:`${15+Math.random()*70}%`,width:`${6+Math.random()*8}px`,height:`${6+Math.random()*8}px`,borderRadius:'50%',background:`hsl(${Math.random()*360},100%,75%)`,boxShadow:`0 0 10px hsl(${Math.random()*360},100%,70%)`,animation:`hs-pulse ${.8+Math.random()}s ${Math.random()*.5}s ease-out forwards`,zIndex:7}}/>
      ))}

      {/* CTA */}
      {phase==='reveal' && (
        <div style={{position:'absolute',bottom:'44px',display:'flex',flexDirection:'column',alignItems:'center',gap:'14px',animation:'hs-floatUp .8s ease forwards',zIndex:9}}>
          <div style={{fontSize:'20px',fontWeight:900,color:m.color,textShadow:`0 0 20px ${m.glow},0 0 60px ${m.glow}`,'--tc':m.color,animation:'hs-bounce 2s ease-in-out infinite,hs-textGlow 2s ease-in-out infinite'} as any}>✨ {m.name} xuất hiện! ✨</div>
          <button onClick={onFinished} style={{padding:'14px 44px',borderRadius:'40px',border:'none',cursor:'pointer',fontSize:'16px',fontWeight:700,color:'#1a0a00',background:`linear-gradient(90deg,${m.color},#fbbf24 50%,${m.color})`,boxShadow:`0 4px 30px ${m.glow}`,animation:'hs-bounce 2.5s ease-in-out infinite'}}>Tiếp tục →</button>
        </div>
      )}

      {/* Loading dots */}
      {phase==='dark' && (
        <div style={{display:'flex',gap:'10px',position:'absolute',bottom:'60px',zIndex:5}}>
          {[0,1,2].map(i=><div key={i} style={{width:'10px',height:'10px',borderRadius:'50%',background:'rgba(190,150,255,0.8)',animation:`hs-bounce 1s ${i*.15}s ease-in-out infinite`}}/>)}
        </div>
      )}
    </div>
  );
};
