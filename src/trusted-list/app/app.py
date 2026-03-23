from functools import partial
from quart import Quart, Blueprint, jsonify, request, abort
from quart_cors import cors
from werkzeug.exceptions import HTTPException
import logging
logger = logging.getLogger(__name__)

FIRST_DOMAIN = 'trusted-list.wallet.test'
SECOND_DOMAIN = 'public.trusted-list.wallet.test'

app = Quart(__name__, host_matching=True, static_host=FIRST_DOMAIN)

main = Blueprint('main', __name__)
public = Blueprint('public', __name__)
main_route = partial(main.route, host=FIRST_DOMAIN)
public_route = partial(public.route, host=SECOND_DOMAIN)
cors(public, allow_origin="*")

PID_PROVIDER_LIST = [
  {
    "domain": "wallet.test",
    "name": "Example Provider",
    "request_pid_endpoint": "https://pid-provider.wallet.test/api/request-pid",
    "receive_pid_endpoint": "https://public.pid-provider.wallet.test/api/receive-pid",
    "public_key": {
      "kty": "EC",
      "crv": "P-256",
      "x": "c3QTBbjb7tTkH23lAYpP04N8Op6qTwnGftuETv97EGM",
      "y": "9HhJ9VtmRIJlS6XAWzjP7W0uApQCHbeNJ5lLg6Xs28E",
      "alg": "ES256",
      "use": "sig"
    }
  },
]

RELYING_PARTY_LIST = [
  {
    "name": "Hot Sauce",
    "proof_endpoint": "https://public.relying-party.wallet.test/api/proof",
  },
]


@app.errorhandler(HTTPException)
async def handle_http_exception(error):
    return jsonify({
        "type": "about:blank",
        "title": error.name,
        "status": error.code,
        "detail": error.description or error.name,
        "instance": request.path,
    }), error.code


@app.errorhandler(Exception)
async def handle_exception(error):
    logger.exception(error)

    return jsonify({
        "type": "about:blank",
        "title": "Internal Server Error",
        "status": 500,
        "detail": "Something went wrong",
        "instance": request.path,
    }), 500

def validate_allowed_params(args, allowed):
    received = set(args.keys())
    if not received.issubset(set(allowed)):
        abort(400, description=f"Only {', '.join(allowed)} query parameter(s) allowed")


def filter_fields(data, fields_param):
    if not fields_param:
        return data

    if not data:
        return []

    requested_fields = {f.strip() for f in fields_param.split(",")}
    allowed_fields = set(data[0].keys()) if data else set()

    invalid_fields = requested_fields - allowed_fields
    if invalid_fields:
        abort( 400, description=f"Invalid field(s): {', '.join(sorted(invalid_fields))}" )

    return [
        {k: v for k, v in item.items() if k in requested_fields}
        for item in data
    ]


def validate_single_param(args, allowed_params):
    unknown = set(args.keys()) - set(allowed_params)
    if unknown:
        abort(400, description=f"Invalid query parameter(s): {', '.join(unknown)}")

    provided = [p for p in allowed_params if p in args]

    if len(provided) != 1:
        if not provided:
            abort(400, description=f"Missing required query parameter. Exactly one of {allowed_params} must be provided.")
        else:
            abort(400, description=f"Multiple query parameters provided ({provided}). Only one of {allowed_params} is allowed.")

    return provided[0]


@main_route('/')
async def main_index():
    return jsonify({"message": f"Hello from {FIRST_DOMAIN}! Main site (protected)"})


@public_route('/')
async def public_index():
    return jsonify({"message": f"Hello from {SECOND_DOMAIN}! API (public)"})


@public_route('/api/trusted-list/pid-provider')
async def get_pid_providers():
    validate_allowed_params(request.args, ["fields"])
    fields = request.args.get("fields")
    result = filter_fields(PID_PROVIDER_LIST, fields)
    return jsonify(result)


@public_route('/api/pid-provider')
async def get_pid_provider():
    args = request.args

    param = validate_single_param(args, [
        "domain",
        "name",
        "request_pid_endpoint",
        "receive_pid_endpoint"
    ])

    value = args.get(param)

    for provider in PID_PROVIDER_LIST:
        if provider.get(param) == value:
            return jsonify(provider)

    abort(404, description="Provider not found")


@public_route('/api/trusted-list/relying-party')
async def get_relying_parties():
    fields = request.args.get("fields")
    result = filter_fields(RELYING_PARTY_LIST, fields)
    return jsonify(result)


@public_route('/api/relying-party')
async def get_relying_party():
    args = request.args

    param = validate_single_param(args, [
        "name",
        "proof_endpoint"
    ])

    value = args.get(param)

    for rp in RELYING_PARTY_LIST:
        if rp.get(param) == value:
            return jsonify(rp)

    abort(404, description="Relying party not found")


app.register_blueprint(main)
app.register_blueprint(public)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True)
