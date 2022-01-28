import React from "react";
import { Dimmer, Loader, Segment } from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";
import "./App.css";

import Box from "./models/Box";

function App() {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        fetch("/api/all")
            .then((res) => res.json())
            .then((data) => setData(data));
    }, []);

    const loader = () => {
        return (
            <Segment>
                <Dimmer active inverted>
                    <Loader inverted content="Loading" />
                </Dimmer>
            </Segment>
        );
    };

    return (
        <div className="App">
            <div className="Header">
                <h1 className="Title">File Boxes</h1>
                <p>A Website for displaying CSV files.</p>
            </div>
            <div className="Main">
                <div className="Boxes">
                    {!data ? loader() : Box.renderAll(data.boxes)}
                </div>
            </div>
        </div>
    );
}

export default App;
