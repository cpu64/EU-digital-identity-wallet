import random
from quart import jsonify, Quart

app = Quart(__name__)

@app.route("/wallet/random/")
async def get_random():
    return jsonify({"number": random.randint(0, 10)})

if __name__ == "__main__":
    app.run()
