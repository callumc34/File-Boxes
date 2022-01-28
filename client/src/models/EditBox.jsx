import React from "react";
import ReactDOM from "react-dom";
import { Form, Button } from "semantic-ui-react";

import "./EditBox.css";

class EditBox extends React.Component {
    constructor(props) {
        super(props);
        this.box = props.box;
        this.state = {
            name: props.box.name,
            description: props.box.description,
            fileHash: props.box.fileHash,
        };
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

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
        this.box.unbox();
    };

    close() {
        ReactDOM.render(
            <React.StrictMode></React.StrictMode>,
            document.getElementById("popup")
        );
    }

    render() {
        const { name, description } = this.state;

        return (
            <div className="PopUpBox">
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
                        <Form.Button>Submit</Form.Button>
                        <Form.Button onClick={this.close}>Cancel</Form.Button>
                    </Form.Group>
                </Form>
                <Button onClick={this.unbox}>Unbox</Button>
            </div>
        );
    }
}

export default EditBox;
