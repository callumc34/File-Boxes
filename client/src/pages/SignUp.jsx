import React from "react";
import { Card, Form, Message, Header } from "semantic-ui-react";
import Axios from "axios";

import "./SignUp.css";

import Page from "../models/Page";

function SignUp() {
    class Display extends React.Component {
        state = {
            username: "",
            password: "",
            failed: false,
        };

        handleChange = (e, { name, value }) => this.setState({ [name]: value });

        handleSubmit = () => {
            Axios.post("/api/signup", {
                username: this.state.username,
                password: this.state.password,
            })
                .then((res) => {
                    if (res.status === 200)
                        return window.location.replace("/login");
                    this.setState({ failed: true });
                })
                .catch((err) => {
                    this.setState({ failed: true });
                });
        };

        render() {
            return (
                <div className="Login">
                    {!this.state.failed ? null : (
                        <Message negative>
                            <Message.Header>Failed to log in.</Message.Header>
                            <p>Please try again.</p>
                        </Message>
                    )}
                    <Card>
                        <Card.Content className="LogInTitle">
                            <Header as="h1" textAlign="center">
                                Sign Up
                            </Header>
                        </Card.Content>
                        <Card.Content>
                            <Form onSubmit={this.handleSubmit}>
                                <Form.Input
                                    required
                                    fluid
                                    name="username"
                                    label="Username"
                                    placeholder="Username"
                                    onChange={this.handleChange}
                                />
                                <Form.Input
                                    required
                                    fluid
                                    name="password"
                                    label="Password"
                                    placeholder="Password"
                                    onChange={this.handleChange}
                                    type="password"
                                />
                                <Form.Group>
                                    <Form.Button>Submit</Form.Button>
                                </Form.Group>
                            </Form>
                        </Card.Content>
                    </Card>
                </div>
            );
        }
    }

    return Page(Display);
}

export default SignUp;
