export const CosmosBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#050510]">
      {/* Realistic Deep Space Background Image (Slow Rotation) */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60 animate-[spin_200s_linear_infinite]"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=3000&auto=format&fit=crop')",
          transform: 'scale(1.6)' 
        }} 
      />
      
      {/* Secondary Cosmic Layer for Depth (Slow Pulse) */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop')"
        }}
      />

      {/* Dark gradient overlay to blend with the Tarot purple/mystic theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0A1F]/80 via-[#1A103C]/60 to-[#0B0A1F]/90 mix-blend-multiply" />

      {/* Bright Twinkling Stars (CSS) on top of the image to add sharp foreground depth - REDUCED DENSITY */}
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_1.5px,transparent_1.5px)] bg-[length:150px_150px] ml-10 mt-10 animate-[pulse_4s_ease-in-out_infinite]" />
      <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,rgba(200,200,255,1)_2px,transparent_2px)] bg-[length:250px_250px] ml-20 mt-20 animate-[pulse_6s_ease-in-out_infinite]" />
      
      {/* Falling Stars (Shooting stars) */}
      <div className="absolute w-[2px] h-[120px] bg-gradient-to-b from-transparent via-white to-transparent opacity-0 animate-[meteor_8s_linear_infinite] left-[15%] top-0 rotate-45 shadow-[0_0_10px_white]" />
      <div className="absolute w-[2px] h-[180px] bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-0 animate-[meteor_15s_linear_infinite_4s] left-[60%] top-0 rotate-45 shadow-[0_0_10px_blue]" />
      <div className="absolute w-[2px] h-[100px] bg-gradient-to-b from-transparent via-yellow-200 to-transparent opacity-0 animate-[meteor_11s_linear_infinite_7s] left-[85%] top-0 rotate-45 shadow-[0_0_10px_yellow]" />

      {/* Magical Tarot Glows */}
      <div className="absolute bottom-0 left-1/4 w-[50vw] h-[50vh] bg-purple-600/30 blur-[150px] rounded-full mix-blend-screen" />
      <div className="absolute top-0 right-1/4 w-[40vw] h-[40vh] bg-blue-600/20 blur-[150px] rounded-full mix-blend-screen" />
    </div>
  );
};
