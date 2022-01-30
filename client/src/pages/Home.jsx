import React from "react";
import { Dimmer, Loader, Header, Segment } from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";
import "./Home.css";

import Page from "../models/Page";
import Box from "../models/Box";

function Home() {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        fetch("/api/public")
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

    class Display extends React.Component {
        render() {
            return (
                <>
                    <Header as="h1" className="BoxesHeader">
                        Public Boxes
                    </Header>
                    <div className="Boxes">
                        {!data ? loader() : Box.renderList(data.boxes)}
                    </div>
                </>
            );
        }
    }

    return Page(Display);
}

export default Home;
