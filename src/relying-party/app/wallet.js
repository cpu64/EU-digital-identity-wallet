/**
 * wallet.js — Communication abstraction module
 *
 * This is the SOLE integration point between the shop and the identity wallet.
 * Currently in MOCK mode: all credential requests are fulfilled via browser-side
 * UI (HTML forms / dialogs). When real wallet integration is implemented (SCRUM-17),
 * only this module needs to change — the rest of the server stays untouched.
 *
 * Each exported function represents one type of credential request:
 *
 *   requestAgeOver18()    → used at checkout when cart has extreme sauces
 *   requestReviewClaims() → used when submitting a product review
 *   requestCheckoutInfo() → used at checkout to pre-fill delivery info
 *
 * In mock mode these functions return a `{ mode: "mock" }` marker and leave
 * the actual user interaction to the frontend (see public/wallet.js).
 *
 * Contract for real wallet integration:
 *   - Each function receives a `sessionId` (or similar correlation handle).
 *   - It initiates the wallet presentation request and resolves with the
 *     disclosed claims, or rejects if the user denies / times out.
 *   - The response shape must match the interfaces documented below.
 */

"use strict";

/**
 * Request proof that the user is over 18.
 *
 * Real wallet response shape:
 *   { age_over_18: true }
 *
 * Mock: resolved immediately with { mode: "mock" } — the frontend handles
 * the confirmation dialog and sends the result back via the API.
 */
function requestAgeOver18() {
  return Promise.resolve({ mode: "mock" });
}

/**
 * Request identity claims for posting a review.
 *
 * Real wallet response shape (only first_name is mandatory):
 *   { first_name: string, family_name?: string, nationality?: string }
 *
 * Mock: see above.
 */
function requestReviewClaims() {
  return Promise.resolve({ mode: "mock" });
}

/**
 * Request delivery / contact info for checkout.
 *
 * Real wallet response shape (all optional — user may decline any field):
 *   { email?: string, address?: string, pseudonym?: string }
 *
 * Mock: see above.
 */
function requestCheckoutInfo() {
  return Promise.resolve({ mode: "mock" });
}

module.exports = { requestAgeOver18, requestReviewClaims, requestCheckoutInfo };
