import {
    Dimmer,
    Loader,
    Menu,
    Icon,
    Segment,
    Sidebar,
} from "semantic-ui-react";
import { Link } from "react-router-dom";

import "./Page.css";

function Page(Main) {
    return (
        <div className="App">
            <div className="Header">
                <h1 className="Title">File Boxes</h1>
                <p>A Website for displaying CSV files.</p>
            </div>
            <Sidebar.Pushable>
                <Sidebar
                    as={Menu}
                    animation="push"
                    direction="left"
                    icon="labeled"
                    width="wide"
                    inverted
                    vertical
                    visible
                >
                    <Link to="/">
                        <Menu.Item as="a">
                            <Icon name="home" inverted />
                            Home
                        </Menu.Item>
                    </Link>
                    <Link to="/login">
                        <Menu.Item as="a">
                            <Icon name="sign in" inverted />
                            Login
                        </Menu.Item>
                    </Link>
                    <Link to="/logout">
                        <Menu.Item as="a">
                            <Icon name="sign out" inverted />
                            Logout
                        </Menu.Item>
                    </Link>
                </Sidebar>
                <Sidebar.Pusher>
                    <div className="Main">
                        <Main />
                    </div>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
        </div>
    );
}

export default Page;
