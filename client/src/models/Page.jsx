import {
    Dimmer,
    Loader,
    Menu,
    Icon,
    Segment,
    Sidebar
} from "semantic-ui-react";
import {
  Link
} from "react-router-dom";

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
                    icon='labeled'
                    width="wide"
                    inverted
                    vertical
                    visible
                >
                    <Menu.Item as='a'>
                        <Link to="/">
                          <Icon name='home' inverted />
                          Home
                        </Link>
                    </Menu.Item>
                    <Menu.Item as='a'>
                        <Link to="/login">
                          <Icon name='sign in' inverted />
                          Login
                        </Link>
                    </Menu.Item>
                    <Menu.Item as='a'>
                        <Link to="/logout">
                          <Icon name='sign out' inverted />
                          Logout
                        </Link>
                    </Menu.Item>
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