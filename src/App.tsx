function App() {
  return (
    <div className="min-h-screen bg-parchment-dark flex items-center justify-center p-6">
      <div className="bg-parchment border-2 border-border rounded-lg shadow-lg max-w-md w-full p-8 text-center">
        <h1 className="font-pixel text-lg text-ink mb-6">
          APP DEPRECATED
        </h1>

        <div className="font-pixel text-[0.625rem] text-ink-muted space-y-4 leading-relaxed">
          <p>
            This version of Biblical Battle Plans has been retired.
          </p>

          <p>
            Please visit us on the web at:
          </p>

          <a
            href="https://biblicalbattleplans.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-pixel text-[0.625rem] text-accent-green underline hover:text-accent-green/80 break-all"
          >
            BiblicalBattlePlans.com
          </a>

          <hr className="border-border my-4" />

          <div className="text-left space-y-3">
            <p className="font-pixel text-[0.5625rem] text-ink font-bold">
              TO REMOVE THIS APP:
            </p>
            <ul className="font-pixel text-[0.5rem] text-ink-muted space-y-2 list-none">
              <li>
                <span className="text-ink">iOS:</span> Long-press the app icon &gt; Remove App &gt; Delete App
              </li>
              <li>
                <span className="text-ink">Android:</span> Long-press the app icon &gt; Uninstall
              </li>
              <li>
                <span className="text-ink">Desktop:</span> Open Chrome menu &gt; More Tools &gt; Clear browsing data, or remove from chrome://apps
              </li>
            </ul>
          </div>

          <hr className="border-border my-4" />

          <p className="text-[0.5rem]">
            Thank you for being an early adventurer. Your progress has been saved and will be available at BiblicalBattlePlans.com.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
