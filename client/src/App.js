import React, {Component} from 'react';
import './App.css';
import Navbar from "./Components/Navbar/Navbar.js";
import {Button, Icon} from 'semantic-ui-react';
import { getRequestUrl, GET_ALL_CATEGORIES } from "./constants";
import Category from "./Components/Category/Category";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            categories: [],
        }
    }

    async componentDidMount() {
        const categories = await(await fetch(getRequestUrl(GET_ALL_CATEGORIES))).json();
        if(categories.length > 0) this.setState({ categories, activeCategory: categories[0].name });
    }

    render() {
        return (
            <div>
                <Navbar/>
                <div className="container-fluid">
                    <div className="container-margin">
                        <div className="inner-container">
                            <div className="collection-container">
                                <Button primary>
                                    <Icon name="plus"/>
                                    New Category
                                </Button>
                                { this.state.categories.map(({ name }, i) => <Category onClick={() => this.setState({ activeCategory: name })} active={name === this.state.activeCategory}>{name}</Category>) }
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
