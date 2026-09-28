import { useState, useRef } from "react";
import PromptInput from "./components/PromptInput";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import FlashcardDeck from "./components/FlashcardDeck";
import { generateCards } from "./lib/api";
import { validateResult } from "./lib/validateResult";

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [cards, setCards] = useState([]);
  const [error, setError] = useState("");
  const [deckVersion, setDeckVersion] = useState(0); // resets the deck for new results
  const lastInput = useRef("");
  const requestId = useRef(0);

  async function handleGenerate(input) {
    lastInput.current = input;
    const id = ++requestId.current; // this request's number
    setStatus("loading");

    try {
      const raw = await generateCards(input);
      if (id !== requestId.current) return; // a newer request started, ignore this one

      const result = validateResult(raw);
      if (!result.ok) {
        setError(result.error);
        setStatus("error");
        return;
      }
      setCards(result.cards);
      setDeckVersion((v) => v + 1);
      setStatus("success");
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <main className="app">
      <h1>📚 Study Assistant</h1>
      <PromptInput onSubmit={handleGenerate} disabled={status === "loading"} />

      {status === "idle" && (
        <p className="hint">Your flashcards will show up here.</p>
      )}
      {status === "loading" && <LoadingState />}
      {status === "error" && (
        <ErrorState message={error} onRetry={() => handleGenerate(lastInput.current)} />
      )}
      {status === "success" && <FlashcardDeck key={deckVersion} cards={cards} />}
    </main>
  );
}
