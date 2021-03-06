import React from "react";
import { Card, Form, Message, Header } from "semantic-ui-react";
import { Link } from "react-router-dom";
import Axios from "axios";
import Token from "../auth/Token";

import Page from "../models/Page";
import "./Login.css";

function Login() {
    class Display extends React.Component {
        state = {
            username: "",
            password: "",
            failed: false,
        };

        handleChange = (e, { name, value }) => this.setState({ [name]: value });

        handleSubmit = () => {
            const { username, password } = this.state;
            Axios.post("/api/login", {
                username,
                password,
            })
                .then((result) => {
                    if (result.data.token == null)
                        return this.setState({ failed: true });
                    Token.set(result.data.token);
                    window.location.replace("/");
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
                                Log In
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
                                    No account?&ensp;
                                    <Link to="/signup">Create one</Link>
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

export default Login;
