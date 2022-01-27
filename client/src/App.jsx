import logo from './logo.svg';
import './App.css';

import { Box, findBoxes } from './models/Box';

const renderAllBoxes = () => {    
        fetch("http://localhost:5000/api/all")
        .then(res => res.json())
        .then(res => console.log)
}

function App() {
  return (
    <div className="App">
      <div className="Header">
        <h1 className="Title">File Boxes</h1>
        <p>A Website for displaying CSV files.</p>
      </div>
      <div className="Main">
        {renderAllBoxes()}
      </div>
    </div>
  );
}

export default App;
