import React from "react";
import ReactDOM from "react-dom";
import { Grid, Card, Segment, Icon, Button } from "semantic-ui-react";
import Axios from "axios";

import AdminToken from "../auth/AdminToken";

import "./User.css";

class EmptyUser extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        return <Card className="UserCard" header="No user" />;
    }
}

class User extends React.Component {
    constructor(props) {
        super(props);
        this.username = props.username;
    }

    static renderList(users) {
        var userList = [];
        for (let user of users) {
            userList.push(new User(user));
        }

        do {
            userList.push(new EmptyUser());
        } while (userList.length % 3 != 0 || userList.length < 6);

        var userRows = [];
        while (userList.length > 0) {
            var row = [];
            for (let i = 1; i <= 3; i++) {
                if (!userList[0]) break;
                else row.push(userList.pop());
            }
            userRows.push(row.reverse());
        }

        return (
            <Grid columns={3} divided>
                {userRows.reverse().map((row) => (
                    <Grid.Row>
                        {row.map((user) => (
                            <Grid.Column width={4}>{user.render()}</Grid.Column>
                        ))}
                    </Grid.Row>
                ))}
            </Grid>
        );
    }

    deleteUser = () => {
        Axios.post("/api/admin/deleteuser", {
            token: AdminToken.get(),
            username: this.username,
        }).then((result) => {
            window.location.reload();
        });
    };

    deleteUserBoxes = () => {
        Axios.post("/api/admin/deleteuserboxes", {
            token: AdminToken.get(),
            username: this.username,
        }).then((result) => {
            window.location.reload();
        });
    };

    render() {
        const extra = (
            <Segment.Group horizontal>
                <Button fluid onClick={this.deleteUser}>
                    <Icon name="user delete" />
                    Delete user
                </Button>
                <Button
                    fluid
                    className="NoMargin"
                    onClick={this.deleteUserBoxes}
                >
                    <Icon name="delete" />
                    Delete boxes
                </Button>
            </Segment.Group>
        );

        return (
            <Card className="UserCard" header={this.username} extra={extra} />
        );
    }
}

export default User;
