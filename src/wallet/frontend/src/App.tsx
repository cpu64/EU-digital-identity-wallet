import { useState } from "react";
import "./App.css";

async function fetchRandom(): Promise<number> {
  try {
    const response = await fetch("/wallet/random/");
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
      <button
        onClick={async () => {
          setNumber(await fetchRandom());
        }}
      >
        random number is {number}
      </button>
    </>
  );
}

export default App;
