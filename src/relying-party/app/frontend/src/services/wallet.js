/**
 * client/wallet.js — client-side wallet abstraction
 *
 * Mirrors the server-side wallet.js contract.
 * Mode is probed from /api/wallet/mode at app startup.
 *
 * In mock mode it uses browser native `window.prompt` and `window.confirm`
 * to explicitly simulate an external OS-level wallet redirect interrupting the app flow.
 */

import * as walletInterface from './walletInterface.js';

let mode = 'mock'

import { API_BASE } from '../config'

export async function init() {
    try {
        const res = await fetch(`${API_BASE}/api/wallet/mode`)
        mode = (await res.json()).mode ?? 'mock'
    } catch {
        mode = 'mock'
    }
}

export function getMode() { return mode }

/** Resolves { age_over_18: bool } */
export async function requestAgeOver18(options = {}) {
    if (mode === 'mock') {
        return mockRequestAgeOver18();
    }
    else if (mode == 'wallet') {
        return walletInterface.requestAgeOver18(options);
    }
    throw new Error('wallet mode not implemented')
}

/** Resolves { email?, address? } */
export async function requestCheckoutInfo(options = {}) {
    if (mode === 'mock') {
        return mockRequestCheckoutInfo();
    }
    else if (mode == 'wallet') {
        return walletInterface.requestCheckoutInfo(options);
    }
    throw new Error('wallet mode not implemented')
}

/** Resolves { first_name, family_name?, nationality? } */
export async function requestReviewClaims(options = {}) {
    if (mode === 'mock') {
        return mockRequestReviewClaims();
    }
    else if (mode == 'wallet') {
        return walletInterface.requestReviewClaims(options);
    }
    throw new Error('wallet mode not implemented')
}

async function mockRequestAgeOver18() {
    const input = window.prompt("EUDI WALLET SIMULATION:\n\nHot Sauce Shop requires a verified 'Age Over 18' credential from your wallet to proceed with this purchase.\n\nEnter 'true' to disclose you are over 18, or 'false' if you are under 18:")
    if (input === null) throw new Error("Wallet request aborted by user.")

    const isOver18 = input.trim().toLowerCase() === 'true'
    return { age_over_18: isOver18 }
}

async function mockRequestCheckoutInfo() {
    window.alert("EUDI WALLET SIMULATION:\n\nThe relying party is requesting your Delivery Address and Email.")
    const email = window.prompt("Wallet Credential [Email]:")
    if (email === null) throw new Error("Wallet request aborted.")

    const address = window.prompt("Wallet Credential [Delivery Address]:")
    if (address === null) throw new Error("Wallet request aborted.")

    return { email: email.trim(), address: address.trim() }
}

async function mockRequestReviewClaims() {
    window.alert("EUDI WALLET SIMULATION:\n\nThe relying party requires your Identity Credentials to post a review.")

    const first_name = window.prompt("Required Wallet Credential [First Name]:\nProvide your verified first name:")
    if (!first_name) throw new Error("First name credential is required to submit a review.")

    const family_name = window.prompt("Optional Wallet Credential [Family Name]:") || undefined
    const nationality = window.prompt("Optional Wallet Credential [Nationality]:") || undefined

    return { first_name, family_name, nationality }
}
