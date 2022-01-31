import React from "react";
import ReactDOM from "react-dom";
import { Form } from "semantic-ui-react";

import PopUp from "./PopUp";
import Token from "../auth/Token";

import "./UploadEmpty.css";

class UploadEmpty extends PopUp {
    constructor(props) {
        super(props);
        this.state = {
            name: props.box.name,
            description: props.box.description,
            fileHash: props.box.fileHash,
            public: props.box.public,
            _id: props.box._id
        };
    }

    handleFileChange = (e) => {
        this.setState({ selectedFile: e.target.files[0] });
    };

    handleSubmit = () => {
        const data = new FormData();

        data.append("_id", this.state._id);
        if (Token.exists()) data.append("token", Token.get());
        data.append("file", this.state.selectedFile);
        fetch("/api/upload", {
            method: "POST",
            body: data,
        }).then((res) => {
            this.finished();
        })
        .catch((err) => {
            this.error(err);
        });
    };

    render() {
        const { name, description } = this.state;

        return (
            <div className="PopUpBox">
                <Form onSubmit={this.handleSubmit}>
                    <Form.Input
                        required
                        fluid
                        disabled
                        name="name"
                        label="Name"
                        value={name}
                        placeholder="Box Name"
                    />
                    <Form.Input
                        required
                        fluid
                        disabled
                        name="description"
                        label="Description"
                        value={description}
                        placeholder="Description"
                    />
                    <Form.Input
                        type="file"
                        fluid
                        required
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

export default UploadEmpty;
