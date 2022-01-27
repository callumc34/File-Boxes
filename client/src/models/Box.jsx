import React from "react";

import "./Box.css";

class Box extends React.Component {
    constructor(
        props
    ) {
        super(props);
        this.name = props.name;
        this.description = props.description;
        this.fileId = props.fileId;
    }

    //TODO(Callum) : Add CSV interactions

    static renderAll(boxes) {
        var boxBoxes = [];
        for (let box of boxes) {
            boxBoxes.push(new Box({
                name : box.name,
                description : box.description,
                fileId : box.fileId
            }))
        }
        return boxBoxes.map((box) => <div className="BoxRender">{box.render()}</div>)
    }

    render() {
        return (
            <div className="Box">
                <div className="Name">Name: {this.name}</div>
                <div className="Description">{this.description}</div>
                <div className="File">TODO</div>
            </div>
        );
    }
}

export default Box;