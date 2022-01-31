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
        public: !Token.exists(),
        tokenExists: Token.exists()
    };
    
    handleFileChange = (e) => {
        this.setState({ selectedFile: e.target.files[0] });
    };

    handleSubmit = () => {
        fetch(
            `/api/add?\
name=${this.state.name}&\
description=${this.state.description}&\
&public=${this.state.public}\
${Token.toURLString()}`)
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            //Nothing to upload so leave
            if (!this.state.selectedFile) {
                this.finished();
                return;
            }

            let _id = json._id;
            const data = new FormData();

            data.append("_id", _id);
            if (Token.exists()) data.append("token", Token.get());
            data.append("file", this.state.selectedFile);
            fetch("/api/upload", {
                method: "POST",
                body: data
            }).then((response) => {
                this.finished();
            })
            .catch((err) => {
                this.error(err);
            });
        })
        .catch((err) => {
            this.error(err);
        });
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
                        disabled={!this.state.tokenExists}                        
                        checked={this.state.public}
                        onChange={this.handleCheckbox}
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
