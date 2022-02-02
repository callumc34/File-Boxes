import React from "react";
import Axios from "axios";
import { Loader, Header } from "semantic-ui-react";

import AdminToken from "../auth/AdminToken";
import Page from "../models/Page";
import User from "../models/User";

import "./Admin.css";

function Admin() {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        Axios.post("/api/admin/users", {
            token: AdminToken.get(),
        }).then((result) => {
            setData(result.data);
        });
    }, []);

    const loader = () => {
        return <Loader inverted content="Loading" />;
    };

    class Display extends React.Component {
        render() {
            return (
                <>
                    <Header as="h1" className="BoxesHeader">
                        Users
                    </Header>
                    <div className="Boxes">
                        {!data ? loader() : User.renderList(data.users)}
                    </div>
                </>
            );
        }
    }

    return Page(Display);
}

export default Admin;
