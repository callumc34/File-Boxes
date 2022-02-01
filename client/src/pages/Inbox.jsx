import React from "react";
import { Loader, Header } from "semantic-ui-react";

import "./Inbox.css";

import Page from "../models/Page";
import Box from "../models/Box";
import Token from "../auth/Token";

function Inbox() {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        fetch(`/api/inbox?${Token.toURLString()}`)
            .then((result) => result.json())
            .then((json) => setData(json));
    }, []);

    const loader = () => {
        return <Loader inverted content="Loading" />;
    };

    class Display extends React.Component {
        render() {
            return (
                <>
                    <Header as="h1" className="BoxesHeader">
                        Inbox
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

export default Inbox;
