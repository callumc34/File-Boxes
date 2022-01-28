import React from "react";
import ReactDOM from 'react-dom';
import { Form } from 'semantic-ui-react'

import "./BoxCreate.css";

class BoxCreate extends React.Component {
    state = {
        name: "",
        description: "",
        selectedFile: ""
    }

    close() {
        ReactDOM.render(
          <React.StrictMode>
          </React.StrictMode>,
          document.getElementById('popup')
        );
    }

    handleFileChange = (e) => {
        this.setState({ selectedFile: e.target.files[0] });
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    handleSubmit = () => {
        //Handle file upload
        const data = new FormData();
        data.append('file', this.state.selectedFile);
        data.append('name', this.state.name);
        data.append('description', this.state.description);

        fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: data,
        }).then(res => {

        });

        this.setState({ name: "", description: "", selectedFile: "" })
        //TODO(Callum) : Show confirmation message
        this.close();
        window.location.reload(false);
    }

    handleUpload(ev) {
    }

    render() {
        const { name, email } = this.state;
        const upload = {
            icon: "upload",
            content: "Upload",
        }

        return (
            <div className="BoxCreate">
                <Form onSubmit={this.handleSubmit}>
                    <Form.Input required fluid name="name" label="Name" placeholder="Box Name" onChange={this.handleChange} />
                    <Form.Input required fluid name="description" label="Description" placeholder="Description" onChange={this.handleChange} />
                    <Form.Input type="file" required fluid label="File upload" onChange={this.handleFileChange} />
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