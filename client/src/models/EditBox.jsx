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
            selectedFile: "",
            showError: props.box.fileHash == null ? true : false,
            error: "Unable to edit empty box"
        };
    }

    handleSubmit = () => {
        if (this.state.fileHash == null) return;
        fetch(`
            http://localhost:5000/api/edit?fileHash=${this.state.fileHash}\
&name=${this.state.name}\
&description=${this.state.description}\
&username=${this.state.username}\
&public=${this.state.public ? 1 : 0}
        `).then(
            (res) => {}
        );

        this.setState({ name: "", description: "", selectedFile: "" });
        //TODO(Callum) : Show confirmation message
        this.close();
        window.location.reload(false);
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

        Axios.get(`/api/file?fileHash=${this.box.fileHash}`)
        .then((result) => {
            this.box.preview(result.data);
        })
        .catch((err) => {

        });
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
                        onChange={this.handleCheckbox}
                     /> 
                    <Form.Group widths="equal">
                        <Button positive>Submit</Button>
                        <Button onClick={this.close} negative>Cancel</Button>
                    </Form.Group>
                </Form>
                <Button onClick={this.unbox} secondary>Unbox</Button>
                <Button onClick={this.preview} primary>Preview</Button>    
            </div>
        );
    }
}

export default EditBox;
