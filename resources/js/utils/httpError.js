/**
 * Extracts a human-readable message from an axios error, covering the common
 * cases where the server doesn't return clean JSON (expired session/CSRF,
 * gateway timeout, client-side timeout) so users aren't left with a vague
 * "something went wrong" message when the real cause is diagnosable.
 */
export function extractAxiosErrorMessage(err, fallback) {
    // A plain JS error (not something axios threw after making a request) most often means
    // the route wasn't recognised on the client (e.g. Ziggy's route list is stale because the
    // page was loaded before a new backend route existed) rather than a real network problem.
    if (err && err.isAxiosError !== true && !err?.response) {
        return "Something went wrong before the request could be sent. Please refresh the page (to pick up the latest app version) and try again.";
    }

    if (err?.code === "ECONNABORTED" || /timeout/i.test(err?.message || "")) {
        return "The request timed out. Try again with fewer questions or a smaller/clearer image.";
    }

    const status = err?.response?.status;
    const data = err?.response?.data;

    if (status === 419) {
        return "Your session has expired. Please refresh the page and log in again, then retry.";
    }

    if (data && typeof data === "object" && typeof data.message === "string" && data.message) {
        return data.message;
    }

    if (status === 413) {
        return "The uploaded image is too large. Please upload a smaller/lower-resolution image.";
    }

    if (typeof status === "number" && status >= 500) {
        return `The server ran into an error (HTTP ${status}). Please try again in a moment.`;
    }

    if (!err?.response) {
        return "Could not reach the server. Please check your connection and try again.";
    }

    return fallback;
}
