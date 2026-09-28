// The only file that talks to our backend. The LLM is never called from the browser.
export async function generateCards(input) {
  let res;
  try {
    res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });
  } catch {
    throw new Error("Network error. Is the server running?");
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    // body wasn't JSON; handled below
  }

  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
  return data.raw; // raw text from the model, not yet trusted
}
