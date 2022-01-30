import React from "react";
import { 
    Form,
    Message
} from "semantic-ui-react";

import PopUp from "./PopUp";

import Token from "../auth/Token";

import "./BoxCreate.css";

class BoxCreate extends PopUp {
    state = {
        name: "",
        description: "",
        selectedFile: "",
        public: false,
        tokenExists: Token.exists(), //Check if theyre supposed to be logged in
        expired: false,
        username: null
    };

    componentDidMount() {        
        Token.expired().then((result) => {
            if (result) this.setState({ expired: true });
        });

        Token.getUser().then((result) => {
            if (result != null) this.setState({ username:  result });
        })
    }

    handleFileChange = (e) => {
        this.setState({ selectedFile: e.target.files[0] });
    };

    handleSubmit = () => {
        //Handle file upload
        const data = new FormData();
        data.append("name", this.state.name);
        data.append("description", this.state.description);

        //Logged in functionality
        if (this.state.tokenExists) {
            if (this.state.expired) {
                return;
            } else {
                data.append("username", Token.getUser());
                data.append("public", this.state.public);
            } 
        } else {
                data.append("public", true);
        }

        if (this.state.selectedFile) {
            data.append("file", this.state.selectedFile);
            fetch("/api/upload", {
                method: "POST",
                body: data,
            }).then((res) => {});
        } else {
            fetch(
                `/api/emptybox?name=${this.state.name}\
                &description=${this.state.description}\
                &username=${this.state.username}\
                &public=${this.state.public ? 1 : 0}`
            ).then((res) => {});
        }
        this.setState({ name: "", description: "", selectedFile: "" });
        //TODO(Callum) : Show confirmation message
        this.close();
        window.location.reload(false);
    };

    render() {
        return (
            <div className="PopUpBox">
                {!this.state.expired ? null : 
                    <Message negative>
                        <Message.Header as="a" to="/login">
                            Sorry, your session has expired please login to submit.
                        </Message.Header>
                    </Message>
                }
                <Form onSubmit={this.handleSubmit}>
                    <Form.Input
                        required
                        fluid
                        name="name"
                        label="Name"
                        placeholder="Box Name"
                        onChange={this.handleChange}
                    />
                    <Form.Input
                        required
                        fluid
                        name="description"
                        label="Description"
                        placeholder="Description"
                        onChange={this.handleChange}
                    />
                    <Form.Input
                        type="file"
                        fluid
                        label="File upload"
                        onChange={this.handleFileChange}
                    />
                    <Form.Checkbox
                        label={
                            Token.exists() ? "Public" :
                            "Public - Please login to change visibility"
                        }
                        name="public"
                        disabled={!Token.exists()}
                        onChange={this.handleChange}
                     /> 
                    <Form.Group widths="equal">
                        <Form.Button>Submit</Form.Button>
                        <Form.Button onClick={this.close}>Cancel</Form.Button>
                    </Form.Group>
                </Form>
            </div>
        );
    }
}

export default BoxCreate;
