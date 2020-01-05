import React, {Component} from 'react';
import './App.css';
import Navbar from "./Components/Navbar/Navbar.js";
import {Button, Icon} from 'semantic-ui-react';
import {
    getRequestUrl,
    GET_ALL_CATEGORIES,
    CREATE_CATEGORY,
    CREATE_ITEM
} from "./constants";
import Category from "./Components/Category/Category";
import CreateCategoryModal from "./Components/CreateCategoryModal/CreateCategoryModal";
import AddItemsMessage from "./Components/AddItemsMessage/AddItemsMessage";
import AddItemModal from "./Components/AddItemModal/AddItemModal";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            categories: [],
            open: false,
            activeCategory: null,
            newCategory: '', // Text for the users new category that they are trying to create
            newCategoryError: false,
            addItemOpen: false,
            item: {
                quantity: 0,
                name: '',
            }
        }
    }

    async componentDidMount() {
        const categories = await(await fetch(getRequestUrl(GET_ALL_CATEGORIES))).json();
        if(categories.length > 0) this.setState({ categories, activeCategory: categories[0].name });
    }

    async handleModalSubmit(cancel) {
        const { newCategory, categories } = this.state;

        // The cancel button was clicked no need to check for valid input
        if(cancel === 'cancel') {
            this.setState({ open: false, newCategory: '' });
            return;
        }

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

    async handleAddItem(cancel) {
        const { item, activeCategory } = this.state;

        // The cancel button was clicked no need to check for valid input
        if(cancel === 'cancel') {
            this.setState({ addItemOpen: false, item: { quantity: 1, name: '' } });
            return;
        }

        const response = await (await fetch(getRequestUrl(CREATE_ITEM), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({ ...item, category: activeCategory })

        })).json();
        console.log("[INFO] Successfully created new item: ", response);
        this.setState({ addItemOpen: false, item: { quantity: 1, name: '' } })
    }

    render() {
        return (
            <div>
                <Navbar/>
                <CreateCategoryModal
                    open={this.state.open}
                    onClose={(cancel) => this.handleModalSubmit(cancel)}
                    onChange={value => this.setState({ newCategory: value })}
                    error={this.state.newCategoryError}

                />
                <AddItemModal
                    open={this.state.addItemOpen}
                    onClose={(close) => this.handleAddItem(close)}
                    onChange={(val) => this.setState((prev) => ({ item: { ...prev.item, name: val } }))}
                    onQuantityChange={(quantity) => this.setState((prev) => ({ item: { ...prev.item, quantity }}))}
                    quantity={this.state.item.quantity}
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
                                <AddItemsMessage onClick={() => this.setState({ addItemOpen: true })} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export default App;
