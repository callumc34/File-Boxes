import React from "react";
import { Form,
    Button,
    Message
} from "semantic-ui-react";
import Axios from "axios";

import Token from "../auth/Token";
import PopUp from "./PopUp";

import "./EditBox.css";

class EditBox extends PopUp {
    constructor(props) {
        super(props);
        this.box = props.box;
        this.state = {
            name: props.box.name,
            description: props.box.description,
            fileHash: props.box.fileHash,
            public: props.box.public,
            _id: props.box._id,
            selectedFile: "",
            showError: false,
            error: ""
        };
    }

    handleSubmit = () => {
        fetch(`
            http://localhost:5000/api/edit?\
_id=${this.state._id}\
&fileHash=${this.state.fileHash}\
&name=${this.state.name}\
&description=${this.state.description}\
&username=${this.state.username}\
&public=${this.state.public ? 1 : 0}
        `).then(
            (res) => {
                this.close();
                window.location.reload();
            }
        );
    };

    unbox = () => {
        if (this.state.fileHash === null) {
            this.setState({
                showError: true,
                error: "Unable to unbox an empty box."
            });
            return;
        }
        this.box.unbox();
    };

    preview = () => {
        if (this.state.fileHash === null) {
            this.setState({
                showError: true,
                error: "Unable to preview an empty box."
            });
            return;
        }
        this.close();

        Axios.get(`/api/file?_id=${this.box._id}`)
        .then((result) => {
            this.box.preview(result.data);
        })
        .catch((err) => {

        });
    }

    delete = () => {
        this.box.delete();
    }

    render() {
        const { name, description } = this.state;

        return (
            <div className="PopUpBox">
                {!this.state.showError ? null : 
                    <Message negative>
                        <Message.Header as="a" to="/login">
                            {this.state.error}
                        </Message.Header>
                    </Message>
                }
                <Form onSubmit={this.handleSubmit}>
                    <Form.Input
                        required
                        fluid
                        name="name"
                        label="Name"
                        value={name}
                        placeholder="Box Name"
                        onChange={this.handleChange}
                    />
                    <Form.Input
                        required
                        fluid
                        name="description"
                        label="Description"
                        value={description}
                        placeholder="Description"
                        onChange={this.handleChange}
                    />
                    <Form.Checkbox
                        label={
                            Token.exists() ? "Public" :
                            "Public - Please login to change visibility"
                        }
                        name="public"
                        disabled={!Token.exists()}
                        checked={this.state.public}
                        onChange={this.handleCheckbox}
                     /> 
                    <Form.Group widths="equal">
                        <Button positive>Submit</Button>
                        <Button onClick={this.close} negative>Cancel</Button>
                    </Form.Group>
                </Form>
                <Button onClick={this.unbox} secondary>Unbox</Button>
                <Button onClick={this.preview} primary>Preview</Button>
                <Button onClick={this.delete} negative>Delete</Button>
            </div>
        );
    }
}

export default EditBox;
