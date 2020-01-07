import React, {Component} from 'react';
import './App.css';
import Navbar from "./Components/Navbar/Navbar.js";
import {Button, Icon, Loader} from 'semantic-ui-react';
import isUndefined from 'lodash/isUndefined';
import {
    getRequestUrl,
    GET_ALL_CATEGORIES,
    CREATE_CATEGORY,
    CREATE_ITEM, GET_ITEMS
} from "./constants";
import Category from "./Components/Category/Category";
import CreateCategoryModal from "./Components/CreateCategoryModal/CreateCategoryModal";
import AddItemsMessage from "./Components/AddItemsMessage/AddItemsMessage";
import AddItemModal from "./Components/AddItemModal/AddItemModal";
import ItemList from "./Components/ItemList/ItemList";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,

            // Category State
            categories: [],
            open: false,
            activeCategory: null,
            newCategory: '', // Text for the users new category that they are trying to create
            newCategoryError: false,

            // Item state
            items: {},
            addItemOpen: false,
            addItemError: false,
            item: {
                quantity: 0,
                name: '',
            }
        }
    }

    async componentDidMount() {
        const categories = await(await fetch(getRequestUrl(GET_ALL_CATEGORIES))).json();
        const items = await (await fetch(getRequestUrl(`${GET_ITEMS}/${categories[0].sid}`))).json();
        if(categories.length > 0) this.setState({ categories, activeCategory: categories[0].sid, items: { [categories[0].sid]: items }, isLoading: false });
    }

    /**
     * Creates a new category to slot items into
     * @param cancel String when the modal is closed if cancel is "cancel" then the cancel button was used to close the modal
     * else it was an actual submit of the modal
     * @returns {Promise<void>}
     */
    async createCategory(cancel) {
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

    /**
     * Creates a new item and adds it to the proper category that is currently selected
     * @param cancel String when the modal is closed if cancel is "cancel" then the cancel button was used to close the modal
     * else it was an actual submit of the modal
     * @returns {Promise<void>}
     */
    async handleAddItem(cancel) {
        const { item, activeCategory } = this.state;

        // The cancel button was clicked no need to check for valid input
        if(cancel === 'cancel') {
            this.setState({ addItemOpen: false, item: { quantity: 1, name: '' } });
            return;
        }

        if(item.name.length === 0 || !item.quantity) {
            console.log("[ERROR] Name cannot be blank and quantity must be a truthy value");
            this.setState({ addItemError: true });
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

    /**
     * Handles updating the actively selected category when the user clicks. It also fetches
     * data from the server if it isn't present or retrieves the items from the cache
     * @param sid
     * @returns {Promise<void>}
     */
    async updateActiveCategory(sid) {
        const { items } = this.state;

        if(isUndefined(items[sid])) {
            const response = await (await fetch(getRequestUrl(`${GET_ITEMS}/${sid}`))).json();
            this.setState({ activeCategory: sid, items: { ...items, [sid]: response } })
        } else {
            this.setState({ activeCategory: sid });
        }
    }

    render() {
        if(this.state.isLoading)
            return <Loader active />;

        return (
            <div>
                <Navbar/>
                <CreateCategoryModal
                    open={this.state.open}
                    onClose={(cancel) => this.createCategory(cancel)}
                    onChange={value => this.setState({ newCategory: value })}
                    error={this.state.newCategoryError}

                />
                <AddItemModal
                    open={this.state.addItemOpen}
                    onClose={(close) => this.handleAddItem(close)}
                    onChange={(val) => this.setState((prev) => ({ item: { ...prev.item, name: val } }))}
                    onQuantityChange={(quantity) => this.setState((prev) => ({ item: { ...prev.item, quantity }}))}
                    quantity={this.state.item.quantity}
                    error={this.state.addItemError}
                />
                <div className="container-fluid">
                    <div className="container-margin">
                        <div className="inner-container">
                            <div className="collection-container">
                                <Button primary onClick={() => this.setState({ open: true })}>
                                    <Icon name="plus"/>
                                    New Category
                                </Button>
                                { this.state.categories.map(({ name, sid }, i) =>
                                    <Category
                                        key={i}
                                        items={isUndefined(this.state.items[sid]) ? 0 : this.state.items[sid].length}
                                        onClick={() => this.updateActiveCategory(sid)} active={sid === this.state.activeCategory}>{name}
                                    </Category>)
                                }
                            </div>
                            <div className="main-content">
                                { this.state.items[this.state.activeCategory].length > 0 ? <ItemList items={this.state.items[this.state.activeCategory]} /> :
                                <AddItemsMessage onClick={() => this.setState({ addItemOpen: true })} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
