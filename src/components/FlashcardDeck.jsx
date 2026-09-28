import { useState } from "react";

export default function FlashcardDeck({ cards }) {
  const [deck, setDeck] = useState(cards); // cards currently being studied
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState([]);
  const [knownCount, setKnownCount] = useState(0);

  const finished = index >= deck.length;

  function answer(gotIt) {
    const card = deck[index];
    if (gotIt) setKnownCount((k) => k + 1);
    else setMissed((m) => [...m, card]);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  function restart(newDeck) {
    setDeck(newDeck);
    setIndex(0);
    setFlipped(false);
    setMissed([]);
    setKnownCount(0);
  }

  if (finished) {
    return (
      <div className="summary">
        <h2>Round complete</h2>
        <p>
          You knew {knownCount} of {deck.length}.
        </p>
        {missed.length > 0 && (
          <button onClick={() => restart(missed)}>
            Re-test {missed.length} missed card{missed.length > 1 ? "s" : ""}
          </button>
        )}
        <button className="secondary" onClick={() => restart(cards)}>
          Start over
        </button>
      </div>
    );
  }

  const card = deck[index];

  return (
    <div>
      <p className="progress">
        Card {index + 1} of {deck.length}
      </p>

      <div
        className={`card ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFlipped((f) => !f)}
      >
        <span className="label">{flipped ? "Answer" : "Question"}</span>
        <p>{flipped ? card.answer : card.question}</p>
        {!flipped && <small>Tap to flip</small>}
      </div>

      {flipped && (
        <div className="actions">
          <button className="miss" onClick={() => answer(false)}>Missed it</button>
          <button className="got" onClick={() => answer(true)}>Got it</button>
        </div>
      )}
    </div>
  );
}
