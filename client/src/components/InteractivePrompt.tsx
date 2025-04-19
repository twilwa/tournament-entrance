export default function InteractivePrompt() {
  return (
    <div className="absolute bottom-6 left-0 right-0 text-center">
      <p className="text-xs md:text-sm opacity-50 font-['Share_Tech_Mono'] animate-flicker-fast">
        <span className="hidden md:inline">[CLICK ANYWHERE] </span>
        <span>[PRESS ANY KEY] </span>
        <span className="hidden md:inline">[MOVE CURSOR]</span>
      </p>
    </div>
  );
}
