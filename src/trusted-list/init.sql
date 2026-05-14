CREATE TABLE IF NOT EXISTS pid_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    request_pid_endpoint TEXT NOT NULL,
    receive_pid_endpoint TEXT NOT NULL,
    public_key TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS relying_parties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    proof_endpoint TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS certificate_authorities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    issue_endpoint TEXT NOT NULL,
    public_key TEXT NOT NULL
);

INSERT INTO pid_providers (
    domain,
    name,
    request_pid_endpoint,
    receive_pid_endpoint,
    public_key
)
VALUES (
    'wallet.test',
    'Example Provider',
    'https://pid-provider.wallet.test/api/request-pid',
    'https://public.pid-provider.wallet.test/api/receive-pid',
    '{
        "alg": "ES256",
        "crv": "P-256",
        "ext": true,
        "key_ops": ["verify"],
        "kty": "EC",
        "x": "MoFr8EwN78CjCfeFnPVULkw6BVEVfrroAiRSD-jnWLU",
        "y": "DWJ4SZW22VUYBgVVyXSQ5cgIbSQN3EhakRmf1kW95Aw",
        "kid": "T/XuctRSz2wkrzY0rdzraRrgA9PaJqL104fgH34d5iE="
    }'
);

INSERT INTO relying_parties (
    name,
    proof_endpoint
)
VALUES (
    'Hot Sauce',
    'https://public.relying-party.wallet.test/api/proof'
);


INSERT INTO certificate_authorities (
    name,
    issue_endpoint,
    public_key
)
VALUES (
    'Example CA',
    'https://wallet-ca.wallet.test/api/issue-certificate',
    '{
        "alg": "ES256",
        "crv": "P-256",
        "ext": true,
        "key_ops": ["verify"],
        "kty": "EC",
        "x": "KD62D4IWv62ggzFUxGC07gcYtdze9QxI-NHH2jNwWtg",
        "y": "_wZAjJEAZX3jYrZ-PyvUQWimXwn0NK0LziMCS6u-kfE",
        "kid": "UDZq26JcGpvWOrsH8wCiZfUHE+PdRu8+lcH3u/9hHjc="
    }'
);
