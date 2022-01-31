import React from "react";
import { Loader, Header } from "semantic-ui-react";

import Page from "../models/Page";
import Box from "../models/Box";

import Token from "../auth/Token";


function UsersBoxes() {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        fetch(`/api/boxes?token=${Token.get()}`)
            .then((res) => res.json())
            .then((data) => setData(data));
    }, []);

    const loader = () => {
        return (
                <Loader inverted content="Loading" />
        );
    };

    class Display extends React.Component {
        render() {
            return (
                <>
                    <Header as="h1" className="BoxesHeader">
                        My Boxes
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

export default UsersBoxes;