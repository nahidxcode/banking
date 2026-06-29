// Thrown when Appwrite is unreachable (network timeout / DNS / connection
// refused) after retries. This is NOT an auth failure, so callers must treat
// it differently from a `null` user and must not log the user out.
//
// Lives outside the "use server" action files because those may only export
// async functions — a class export there is a build error.
export class SessionUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Could not reach the authentication service.");
    this.name = "SessionUnavailableError";
    this.cause = cause;
  }
}
