import React from "react";
import {
    Card,
    Form,
    Header
} from "semantic-ui-react";

import Page from "../models/Page";
import "./Login.css";

function Login() {
    class Display extends React.Component {
        state = {
            username: "",
            password: ""
        };

        handleChange = (e, { name, value }) => this.setState({ [name]: value });

        handleSubmit = () => {
            console.log(this.state);
        }

        render() {
            return (
                <div className="Login">
                    <Card>
                        <Card.Content className="LogInTitle">
                            <Header as="h1" textAlign="center">Log In</Header>
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

export default Login;