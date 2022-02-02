import React, { useState } from "react";

import { Divider, Menu, Header, Icon, List, Sidebar } from "semantic-ui-react";
import { Link } from "react-router-dom";

import Token from "../auth/Token";

import "./Page.css";

function Page(Main) {
    function createMenuLink(link, icon, text) {
        return (
            <>
                <Link to={link}>
                    <Menu.Item>
                        <Icon name={icon} inverted />
                        {text}
                    </Menu.Item>
                </Link>
                <Divider />
            </>
        );
    }

    const [user, setUser] = useState({});

    React.useEffect(() => {
        if (!Token.exists()) return;
        Token.getInfo().then((result) => setUser(result));
    }, []);

    const LoginName = (
        <Header as="h3" inverted>
            Logged in as: {user.username}
        </Header>
    );

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
                    <Menu.Item>
                        <List>
                            <List.Item>
                                <Icon name="box" inverted size="massive" />
                            </List.Item>
                            <List.Content>
                                <List.Item>
                                    <Header as="h1" inverted>
                                        File Boxes
                                    </Header>
                                </List.Item>
                            </List.Content>
                        </List>
                    </Menu.Item>
                    {createMenuLink("/", "home", "Home")}
                    {createMenuLink("/boxes", "box", "My boxes")}
                    {createMenuLink("/inbox", "inbox", "Inbox")}
                    {createMenuLink("/login", "sign in", "Login")}
                    {createMenuLink("/logout", "sign out", "Logout")}
                    {createMenuLink("/admin/login", "user", "Admin")}
                    {Token.exists() && !user.expired ? LoginName : null}
                    <Divider />
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
