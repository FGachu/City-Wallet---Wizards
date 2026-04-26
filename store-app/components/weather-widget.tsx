export default function WeatherWidget() {
  return (
    <div className="rounded-2xl relative overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600 p-5 text-white shadow-sm mb-4">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-30 pointer-events-none">
        <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.5 19a5.5 5.5 0 0 0-1-10.9A7 7 0 0 0 3.5 12.5 5.5 5.5 0 0 0 9 18z"/>
        </svg>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-blue-50">Stuttgart Innenstadt</div>
          <div className="text-xs text-blue-100">Now</div>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="text-4xl font-light tracking-tighter">11°</div>
          <div className="text-blue-100 flex flex-col justify-center">
            <span className="text-sm font-semibold leading-none">Overcast</span>
            <span className="text-xs mt-1">H:13° L:7°</span>
          </div>
        </div>
        <div className="mt-4 text-xs bg-white/20 backdrop-blur-md rounded-lg p-2.5 text-blue-50 border border-white/20 shadow-inner">
          Slightly cold today. Warm drinks are highly relevant for walk-ins.
        </div>
      </div>
    </div>
  );
}