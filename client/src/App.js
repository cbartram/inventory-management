import React, {Component} from 'react';
import './App.css';
import Navbar from "./Components/Navbar/Navbar.js";
import {Button, Icon} from 'semantic-ui-react';

class App extends Component {
    render() {
        return (
            <div>
                <Navbar/>
                <div className="container">
                    <div className="container-margin">
                        <div className="inner-container">
                            <div className="collection-container">
                                <Button primary>
                                    <Icon name="plus"/>
                                    New Category
                                </Button>
                            </div>
                            <div className="main-content">
                                <h3>Main content</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export default App;
