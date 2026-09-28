import { useState } from "react";

export default function PromptInput({ onSubmit, disabled }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (text.trim()) onSubmit(text.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="prompt">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your notes or type a topic (e.g. photosynthesis)"
        rows={6}
      />
      <button type="submit" disabled={disabled || !text.trim()}>
        {disabled ? "Generating..." : "Generate flashcards"}
      </button>
    </form>
  );
}
