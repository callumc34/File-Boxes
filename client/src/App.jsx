import React from "react";

import logo from './logo.svg';
import './App.css';

import Box from './models/Box';

function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/api/all")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div className="App">
      <div className="Header">
        <h1 className="Title">File Boxes</h1>
        <p>A Website for displaying CSV files.</p>
      </div>
      <div className="Main">
        {!data ? "Loading..." : Box.renderAll(data.boxes)}
      </div>
    </div>
  );
}

export default App;
