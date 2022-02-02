import React from "react";
import { Card, Form, Message, Header } from "semantic-ui-react";
import Axios from "axios";

import AdminToken from "../auth/AdminToken";
import Page from "../models/Page";
import "./AdminLogin.css";

function AdminLogin() {
    class Display extends React.Component {
        state = {
            username: "",
            password: "",
            failed: false,
        };

        componentDidMount() {
            Axios.post("/api/admin/auth", {
                token: AdminToken.get(),
            }).then((result) => {
                if (result.data.valid) window.location.replace("/admin");
            });
        }

        handleChange = (e, { name, value }) => this.setState({ [name]: value });

        handleSubmit = () => {
            const { username, password } = this.state;

            Axios.post("/api/admin/login", {
                username,
                password,
            })
                .then((result) => {
                    return result.json();
                })
                .then((json) => {
                    if (json.result) {
                        AdminToken.set(json.token);
                        window.location.replace("/admin");
                    }
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

export default AdminLogin;
