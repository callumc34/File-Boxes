import React from "react";
import ReactDOM from "react-dom";
import Axios from "axios";
import { Grid, Card, Segment, Icon, Button } from "semantic-ui-react";

import BoxCreate from "./BoxCreate";
import EditBox from "./EditBox";
import UploadEmpty from "./UploadEmpty";
import PreviewBox from "./PreviewBox";
import ShareBox from "./ShareBox";

import Token from "../auth/Token";

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
        this.public = props.public;
        this.username = props.username;
        this._id = props._id;
    }

    static renderList(boxes) {
        var boxBoxes = [];
        for (let box of boxes) {
            boxBoxes.push(new Box(box));
        }

        do {
            boxBoxes.push(new AddBox(boxBoxes.length));
        } while (boxBoxes.length % 3 != 0 || boxBoxes.length < 6);

        var boxRows = [];
        while (boxBoxes.length > 0) {
            var row = [];
            for (let i = 1; i <= 3; i++) {
                if (boxBoxes[0] === undefined) break;
                else row.push(boxBoxes.pop());
            }
            boxRows.push(row.reverse());
        }

        return (
            <Grid columns={3} divided>
                {boxRows.reverse().map((row) => (
                    <Grid.Row>
                        {row.map((box) => (
                            <Grid.Column width={4} key={box.name}>
                                {box.render()}
                            </Grid.Column>
                        ))}
                    </Grid.Row>
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

    delete = () => {
        Axios.get(
            `/api/delete?_id=${this._id}\
${Token.toURLString()}`
        ).then((result) => {
            window.location.reload();
        });
    };

    share = () => {
        ReactDOM.render(
            <React.StrictMode>
                <ShareBox box={this} />
            </React.StrictMode>,
            document.getElementById("popup")
        );
    };

    preview = (data) => {
        ReactDOM.render(
            <React.StrictMode>
                <PreviewBox box={this} data={data} />
            </React.StrictMode>,
            document.getElementById("popup")
        );
    };

    /**
     * @brief      Downloads a file.
     *
     * @param      {boolean}  Whether to unbox
     */
    downloadFile(unbox) {
        Axios.get(`api/download?_id=${this._id}${Token.toURLString()}`, {
            responseType: "blob",
        })
            .then((response) => {
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
                if (unbox) this.delete();
            })
            .then(() => {
                window.location.reload();
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
            <>
                <Segment.Group horizontal>
                    <Button fluid onClick={this.editCard}>
                        <Icon name="pencil alternate" />
                        Edit
                    </Button>
                    <Button fluid className="NoMargin" onClick={this.share}>
                        <Icon name="share" />
                        Share
                    </Button>
                </Segment.Group>
                <Segment.Group horizontal>
                    <Segment className="FileLink">
                        <Icon name="cloud download" />
                        <a onClick={this.download}>{this.name}.csv</a>
                    </Segment>
                    <Segment className="Hash">
                        {this.fileHash == null ? uploadButton : this.fileHash}
                    </Segment>
                </Segment.Group>
            </>
        );

        const edit = (
            <a onClick={this.editCard}>
                <Icon name="pencil alternate" /> Edit
            </a>
        );

        //TODO(Callum) : meta={this.username}
        return (
            <Card
                header={this.name}
                description={this.description}
                meta={this.username ? this.username : "unknown"}
                extra={extra}
            />
        );
    }
}

export default Box;
