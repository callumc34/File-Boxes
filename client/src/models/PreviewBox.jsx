import React from "react";
import {
    Button,
    Loader,
    TextArea
} from "semantic-ui-react"

import PopUp from "./PopUp";

import "./PreviewBox.css";

class PreviewBox extends PopUp {
    constructor(
        props
    ) {
        super(props);

        this.data = props.data;
        this.box = props.box;
    }

    render() {
        const loader = (
            <Loader content="Loading..." />
        );

        return (
            <div className="PopUpBox">
                <TextArea value={this.data} disabled />                    
                <Button onClick={this.close} negative>Close</Button>
            </div>
        );
    }
}

export default PreviewBox;