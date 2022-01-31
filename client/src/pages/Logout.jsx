import React from "react";
import { Link } from "react-router-dom";
import {
    Loader,
    Message
} from "semantic-ui-react";

import Page from "../models/Page";
import Token from "../auth/Token";

import "./Logout.css";

function Logout() {
    class Display extends React.Component {
        state = {

        }

        componentDidMount() {
            Token.delete();
            this.setState({ finished: true })
        }

        render() {
            const finishedMessage = (
                <Message className="LogoutMessage" positive>
                    <Message.Header>Logged out successfully.</Message.Header>
                    <Link to="/">
                        <p>Return home.</p>
                    </Link>
                </Message>
            );

            const loader = (
                <Loader inverted content="Loading" />
            );

            return (
                <div className="Login">
                    {this.finished ? loader : finishedMessage}
                </div>
            );
        }
    }

    return Page(Display);
}

export default Logout;