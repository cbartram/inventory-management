import React, {Component} from 'react';
import './App.css';
import Navbar from "./Components/Navbar/Navbar.js";
import {Button, Icon} from 'semantic-ui-react';
import {getRequestUrl, GET_ALL_CATEGORIES, CREATE_CATEGORY} from "./constants";
import Category from "./Components/Category/Category";
import CreateCategoryModal from "./Components/CreateCategoryModal/CreateCategoryModal";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            categories: [],
            open: false,
            newCategory: '', // Text for the users new category that they are trying to create
            newCategoryError: false,
        }
    }

    async componentDidMount() {
        const categories = await(await fetch(getRequestUrl(GET_ALL_CATEGORIES))).json();
        if(categories.length > 0) this.setState({ categories, activeCategory: categories[0].name });
    }

    async handleModalSubmit(name) {
        const { newCategory, categories } = this.state;
        if(newCategory.length === 0)
            // Don't close the modal if its invalid
            this.setState({ newCategoryError: true });
        else {
            const response = await ( await fetch(getRequestUrl(CREATE_CATEGORY), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({ name: newCategory })

            })).json();
            this.setState({open: false, newCategory: '', categories: [...categories, response] });
        }
    }

    render() {
        return (
            <div>
                <Navbar/>
                <CreateCategoryModal
                    open={this.state.open}
                    onClose={() => this.handleModalSubmit()}
                    onChange={value => this.setState({ newCategory: value })}
                    error={this.state.newCategoryError}

                />
                <div className="container-fluid">
                    <div className="container-margin">
                        <div className="inner-container">
                            <div className="collection-container">
                                <Button primary onClick={() => this.setState({ open: true })}>
                                    <Icon name="plus"/>
                                    New Category
                                </Button>
                                { this.state.categories.map(({ name }, i) =>
                                    <Category
                                        key={i}
                                        onClick={() => this.setState({ activeCategory: name })} active={name === this.state.activeCategory}>{name}
                                    </Category>)
                                }
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
