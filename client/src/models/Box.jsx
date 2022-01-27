import React from "react";

import "./Box.css";

class Box extends React.Component {
    constructor(
        props,
        name,
        description,
        fileId
    ) {
        super(props);
        this.name = name;
        this.description = description;
        this.fileId = fileId;
    }

    //TODO(Callum) : Add CSV interactions

    render() {
        return (
            <div className="Box">
                <div className="Name">{this.name}</div>
                <div className="Description">{this.description}</div>
                <div className="File">TODO</div>
            </div>
        );
    }
}

export default Box;