// The RIC logo sticker. Clicking it turns it over to the backing paper,
// where the details are printed.
export default function RicSticker({ flipped }) {
  return (
    <div className={`ric${flipped ? ' is-flipped' : ''}`}>
      <div className="ric-face ric-front">
        <img src="/img/fun/ric.png" alt="" draggable={false} />
      </div>
      <div className="ric-face ric-back" aria-hidden={!flipped}>
        <p className="ric-title">Rights &amp; Interests Committee, HKU</p>
        <p className="ric-role">Chairman, 2021–22</p>
        <p className="ric-note">Student advocacy, events, and learning how to run things.</p>
        <a
          data-nodrag
          className="ric-link"
          href="https://richku.com/"
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={flipped ? 0 : -1}
        >
          richku.com ↗
        </a>
      </div>
    </div>
  )
}
