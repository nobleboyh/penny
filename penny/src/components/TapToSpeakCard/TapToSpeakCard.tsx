interface Props {
  onTap: () => void
}

export function TapToSpeakCard({ onTap }: Props) {
  return (
    <section className="shrink-0 bg-gradient-to-br from-violet-600 to-violet-800 p-4 rounded-xl relative overflow-hidden">
      <div className="absolute -right-2 -bottom-2 opacity-10" aria-hidden="true">
        <span className="material-symbols-outlined text-7xl">mic</span>
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <p className="text-violet-100/90 text-[11px] mb-3 text-center">
          Spent something? Tap and say it to log!
        </p>
        <button
          onClick={onTap}
          type="button"
          aria-label="Tap to speak and log a transaction"
          className="bg-white text-violet-700 w-full py-2.5 rounded-full font-headline font-black text-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">mic</span>
          TAP TO SPEAK
        </button>
      </div>
    </section>
  )
}
