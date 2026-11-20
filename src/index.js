
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Preserve existing worksheet pages and assets.
    if (url.pathname !== "/api/coach") {
      return env.ASSETS.fetch(request);
    }

    // The AI endpoint accepts POST requests only.
    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    // Fail closed until student authentication and
    // the AI Worker service binding are configured.
    return Response.json(
      { error: "AI Coach integration not yet enabled" },
      { status: 503 }
    );
  }
};
