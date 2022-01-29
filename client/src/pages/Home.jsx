import React from "react";
import {
    Dimmer,
    Loader,
    Segment
} from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";
import "./Home.css";

import Page from "../models/Page";
import Box from "../models/Box";

function Home() {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        fetch("/api/all")
            .then((res) => res.json())
            .then((data) => setData(data));
    }, []);

    const loader = () => {
        return (
            <Segment>
                <Dimmer active inverted>
                    <Loader inverted content="Loading" />
                </Dimmer>
            </Segment>
        );
    };

    const Boxes = () => {
        <div className="Boxes">
            {!data ? loader() : Box.renderAll(data.boxes)}
        </div>
    }

    class Display extends React.Component {
        render() {
            return (            
                <div className="Boxes">
                    {!data ? loader() : Box.renderAll(data.boxes)}
                </div>
            );
        }
    }

    return Page(Display)

    // return (
    //     <div className="App">
    //         <div className="Header">
    //             <h1 className="Title">File Boxes</h1>
    //             <p>A Website for displaying CSV files.</p>
    //         </div>
    //         <Sidebar.Pushable>
    //             <Sidebar
    //                 as={Menu}
    //                 animation="push"
    //                 direction="left"
    //                 icon='labeled'
    //                 width="wide"
    //                 inverted
    //                 vertical
    //                 visible
    //             >
    //                 <Menu.Item as='a'>
    //                   <Icon name='home' inverted />
    //                   Home
    //                 </Menu.Item>
    //                 <Menu.Item as='a'>
    //                   <Icon name='sign in' inverted />
    //                   Login
    //                 </Menu.Item>
    //                 <Menu.Item as='a'>
    //                   <Icon name='sign out' inverted />
    //                   Logout
    //                 </Menu.Item>
    //             </Sidebar>
    //             <Sidebar.Pusher>
    //                 <div className="Main">
        // <div className="Boxes">
        //     {!data ? loader() : Box.renderAll(data.boxes)}
        // </div>
    //                 </div>
    //             </Sidebar.Pusher>
    //         </Sidebar.Pushable>
    //     </div>
    // );
}

export default Home;
