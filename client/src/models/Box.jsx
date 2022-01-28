import React from "react";
import ReactDOM from "react-dom";
import Axios from "axios";
import { Grid, Card, Segment, Icon, Button } from "semantic-ui-react";

import BoxCreate from "./BoxCreate";
import EditBox from "./EditBox";
import UploadEmpty from "./UploadEmpty";

import "./Box.css";

class AddBox extends React.Component {
    constructor(key) {
        super();
        this.name = key;
    }

    createBox() {
        ReactDOM.render(
            <React.StrictMode>
                <BoxCreate />
            </React.StrictMode>,
            document.getElementById("popup")
        );
    }

    render() {
        const extra = (
            <>
                <Icon name="plus square" />
                <a onClick={this.createBox}>Add Box</a>
            </>
        );
        return <Card header="Add a new box" extra={extra} />;
    }
}

class Box extends React.Component {
    constructor(props) {
        super(props);
        this.name = props.name;
        this.description = props.description;
        this.fileHash = props.fileHash;
    }

    //TODO(Callum) : Add CSV interactions
    //Renders up to 10
    static renderAll(boxes) {
        var boxBoxes = [];
        for (let box of boxes) {
            boxBoxes.push(
                new Box({
                    name: box.name,
                    description: box.description,
                    fileHash: box.fileHash,
                })
            );
        }

        do {
            boxBoxes.push(new AddBox(boxBoxes.length));
        } while (boxBoxes.length < 10);

        return (
            <Grid colums={3} divided>
                {boxBoxes.map((box) => (
                    <Grid.Column width={3} key={box.name}>
                        {box.render()}
                    </Grid.Column>
                ))}
            </Grid>
        );
    }

    unbox = () => {
        this.downloadFile(true);
    };

    download = () => {
        this.downloadFile(false);
    };

    /**
     * @brief      Downloads a file.
     *
     * @param      {boolean}  Whether to unbox
     */
    downloadFile(unbox) {
        Axios.get(`api/download?fileHash=${this.fileHash}`, {
            responseType: "blob",
        }).then((response) => {
            const fileURL = window.URL.createObjectURL(
                new Blob([response.data])
            );
            const fileLink = document.createElement("a");
            fileLink.href = fileURL;
            const fileName = this.name + ".csv";
            fileLink.setAttribute("download", fileName);
            document.body.appendChild(fileLink);
            fileLink.click();
            fileLink.remove();
            if (unbox)
                Axios.get(`api/delete?fileHash=${this.fileHash}`).then(() =>
                    window.location.reload(true)
                );
        });
    }

    editCard = () => {
        ReactDOM.render(
            <React.StrictMode>
                <EditBox box={this} />
            </React.StrictMode>,
            document.getElementById("popup")
        );
    };

    uploadFile = () => {
        ReactDOM.render(
            <React.StrictMode>
                <UploadEmpty box={this} />
            </React.StrictMode>,
            document.getElementById("popup")
        );
    };

    render() {
        const uploadButton = (
            <Button onClick={this.uploadFile}>
                <Icon name="cloud upload" />
            </Button>
        );

        const extra = (
            <Segment.Group horizontal>
                <Segment className="FileLink">
                    <Icon name="cloud download" />
                    <a onClick={this.download}>{this.name}.csv</a>
                </Segment>
                <Segment className="Hash">
                    {this.fileHash == null ? uploadButton : this.fileHash}
                </Segment>
            </Segment.Group>
        );

        const edit = (
            <a onClick={this.editCard}>
                <Icon name="pencil alternate" /> Edit
            </a>
        );

        return (
            <Card
                header={this.name}
                description={this.description}
                meta={edit}
                extra={extra}
            />
        );
    }
}

export default Box;
