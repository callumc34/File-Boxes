import React from "react";
import ReactDOM from "react-dom";
import { Form } from "semantic-ui-react";

import PopUp from "./PopUp";

import "./BoxCreate.css";

class BoxCreate extends PopUp {
    state = {
        name: "",
        description: "",
        selectedFile: "",
    };

    handleFileChange = (e) => {
        this.setState({ selectedFile: e.target.files[0] });
    };

    handleSubmit = () => {
        //Handle file upload
        const data = new FormData();
        data.append("name", this.state.name);
        data.append("description", this.state.description);
        if (this.state.selectedFile) {
            data.append("file", this.state.selectedFile);
            fetch("/api/upload", {
                method: "POST",
                body: data,
            }).then((res) => {});
        } else {
            fetch(
                `/api/emptybox?name=${this.state.name}&description=${this.state.description}`
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
