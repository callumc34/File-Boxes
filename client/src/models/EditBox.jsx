import React from "react";
import { Form,
    Button,
    Message
} from "semantic-ui-react";
import Axios from "axios";
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
            username: props.box.username,
            isPublic: props.box.public,
            showError: false,
            error: ""
        };
    }

    handleSubmit = () => {
        const { name, description, fileHash } = this.state;
        fetch(`
            http://localhost:5000/api/edit?fileHash=${fileHash}&name=${name}&description=${description}`).then(
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
