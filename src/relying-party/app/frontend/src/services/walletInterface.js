export async function requestAgeOver18(options = {}) {
    const data = await handleWalletRequest({
        requested_claims: ["birth_date"]
    }, options);
    const birthYear = data["birth_date"] ? new Date(data["birth_date"]).getFullYear() : 2000;
    return { age_over_18: new Date().getFullYear() - birthYear >= 18 };
}

export async function requestCheckoutInfo(options = {}) {
    const data = await handleWalletRequest({
        requested_claims: ["email_address", "resident_address"]
    }, options);
    return { email: data["email_address"], address: data["resident_address"] };
}

export async function requestReviewClaims(options = {}) {
    const data = await handleWalletRequest({
        requested_claims: ["given_name", "family_name", "nationality"]
    }, options);
    return {
        first_name: data["given_name"],
        family_name: data["family_name"],
        nationality: data["nationality"]
    };
}

import { showWalletRequestDialog } from '../components/WalletRequestDialog';

async function handleWalletRequest(requestPayload, options = {}) {
    const res = await fetch('/api/wallet/request', { method: 'POST' });
    const { nonce } = await res.json();

    const specRequest = {
        ...requestPayload,
        nonce,
        proof_endpoint: `https://public.${window.location.hostname}/api/proof`,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
    };

    const requestJson = JSON.stringify(specRequest, null, 2);
    const request = btoa(requestJson);

    return showWalletRequestDialog({
        request,
        nonce,
        title: options.title,
        description: options.description
    });
}
