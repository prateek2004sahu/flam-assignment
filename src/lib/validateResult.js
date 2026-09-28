// Turns the model's raw text into safe data, or an error message.
export function validateResult(raw) {
  if (!raw || !raw.trim()) {
    return { ok: false, error: "The AI returned an empty response." };
  }

  // Models sometimes wrap JSON in ```json fences, so strip them
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    return { ok: false, error: "The AI returned malformed JSON." };
  }

  if (!data || !Array.isArray(data.cards)) {
    return { ok: false, error: "The AI response had the wrong shape." };
  }

  // Keep only cards that have real text in both fields
  const cards = data.cards.filter(
    (c) =>
      c &&
      typeof c.question === "string" && c.question.trim() &&
      typeof c.answer === "string" && c.answer.trim()
  );

  if (cards.length === 0) {
    return { ok: false, error: "The AI returned no usable flashcards." };
  }
  return { ok: true, cards };
}
