import React from "react";
import ReactDOM from "react-dom";

import "./PopUp.css"

class PopUp extends React.Component {
    state = {};

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    close() {
        ReactDOM.render(
            <React.StrictMode></React.StrictMode>,
            document.getElementById("popup")
        );
    }
}

export default PopUp;
