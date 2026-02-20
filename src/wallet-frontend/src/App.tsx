import { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";

async function fetchRandom(): Promise<number> {
  try {
    const response = await fetch(
      "https://wallet-backend.wallet.test/wallet/random/",
    );
    const contents = await response.json();
    return contents.number;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

function App() {
  const [number, setNumber] = useState(0);

  return (
    <>
      <Button
        onClick={async () => {
          setNumber(await fetchRandom());
        }}
      >
        random number is {number}
      </Button>
    </>
  );
}

export default App;
