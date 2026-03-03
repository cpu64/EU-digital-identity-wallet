from functools import partial
from quart import Quart, Blueprint, jsonify
from quart_cors import cors

FIRST_DOMAIN = 'trusted-list.wallet.test'
SECOND_DOMAIN = 'public.trusted-list.wallet.test'

app = Quart(__name__, host_matching=True, static_host=FIRST_DOMAIN)

main = Blueprint('main', __name__)
public = Blueprint('public', __name__)
main_route = partial(main.route, host=FIRST_DOMAIN)
public_route = partial(public.route, host=SECOND_DOMAIN)
cors(public, allow_origin="*")

@main_route('/')
def main_index():
    return jsonify({"message": f"Hello from {FIRST_DOMAIN}! Main site (protected)"})

@public_route('/')
def public_index():
    return  jsonify({"message": f"Hello from {SECOND_DOMAIN}! API (public)"})

app.register_blueprint(main)
app.register_blueprint(public)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True)
