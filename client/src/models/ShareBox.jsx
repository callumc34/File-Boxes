import React from "react";
import { Button, Form, Message } from "semantic-ui-react";

import Token from "../auth/Token";
import PopUp from "./PopUp";

import "./ShareBox.css";

class ShareBox extends PopUp {
    constructor(props) {
        super(props);
        this.box = props.box;
    }

    handleSubmit = () => {
        fetch(
            `/api/sharebox?_id=${this.box._id}&username=${
                this.state.username
            }${Token.toURLString()}`
        )
            .then((result) => {
                this.finished();
            })
            .catch((err) => {
                this.error(
                    "Unable to share. Please check you are logged in and own the box."
                );
            });
    };

    render() {
        return (
            <div className="PopUpBox ShareBox">
                {!this.state.showError ? null : (
                    <Message negative>
                        <Message.Header as="a" to="/login">
                            {this.state.error}
                        </Message.Header>
                    </Message>
                )}
                <Form onSubmit={this.handleSubmit}>
                    <Form.Input
                        required
                        fluid
                        name="username"
                        label="Share to"
                        placeholder="Username"
                        onChange={this.handleChange}
                    />
                    <Form.Group widths="equal">
                        <Button positive>Submit</Button>
                        <Button onClick={this.close} negative>
                            Cancel
                        </Button>
                    </Form.Group>
                </Form>
            </div>
        );
    }
}

export default ShareBox;
