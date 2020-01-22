import React, {Component} from 'react';
import './App.css';
import Navbar from "./Components/Navbar/Navbar.js";
import {Button, Icon, Confirm, Loader} from 'semantic-ui-react';
import isUndefined from 'lodash/isUndefined';
import differenceBy from 'lodash/differenceBy';
import {
    getRequestUrl,
    GET_ALL_CATEGORIES,
    CREATE_CATEGORY,
    CREATE_ITEM,
    DELETE_ALL, getSocketUrl, GET_ALL_ITEMS,
} from "./constants";
import Category from "./Components/Category/Category";
import CreateCategoryModal from "./Components/CreateCategoryModal/CreateCategoryModal";
import AddItemsMessage from "./Components/AddItemsMessage/AddItemsMessage";
import AddItemModal from "./Components/AddItemModal/AddItemModal";
import ItemList from "./Components/ItemList/ItemList";
import socketIOClient from "socket.io-client";


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
            },
            // Images for each item
            images: {},

            // Can Select
            selectModeEnabled: false,
            selectedCategories: [],
            selectedItems: [],

            // Misc
            deleteConfirmOpen: false,
            socket: null,
        }
    }

    async componentDidMount() {
        // TODO Very important load all categories and all items into state on page load don't lazy load
        // TODO it affects other pages when categories/items are added/deleted but not loaded into the other pages state
        const categories = await(await fetch(getRequestUrl(GET_ALL_CATEGORIES))).json();
        const items = await (await fetch(getRequestUrl(GET_ALL_ITEMS))).json();
        const socket = socketIOClient(getSocketUrl());

        socket.on('event', event => {
            switch(event.type) {
                case 'CATEGORY_DELETE':
                    this.setState({
                        categories: differenceBy(categories, event.data, 'sid'),
                    });
                    break;
                case 'CATEGORY_CREATE':
                    this.setState({ categories: [...this.state.categories, event.data], items: {...this.state.items, [event.data.sid]: [] } });
                    break;
                case 'ITEM_DELETE':
                    const { items } = this.state;
                    event.data.forEach(deletedItem => {
                        items[deletedItem.pid] = items[deletedItem.pid].filter(item => item.sid !== deletedItem.sid);
                    });

                    this.setState({ items });
                    break;
                case 'ITEM_CREATE':
                    this.setState({
                        items: {
                            ...this.state.items,
                            [event.data.pid]: [
                                ...this.state.items[event.data.pid], {
                                    ...event.data
                                }]
                        }
                    });
                    break;
                default:
                    console.log('[INFO] Default case not sure what to do with message: ', event);
            }
        });

        if(categories.length > 0) this.setState({
            socket,
            categories,
            activeCategory: categories[0].sid,
            items,
            isLoading: false
        });
    }

    /**
     * Creates a new category to slot items into
     * @param cancel String when the modal is closed if cancel is "cancel" then the cancel button was used to close the modal
     * else it was an actual submit of the modal
     * @returns {Promise<void>}
     */
    async createCategory(cancel) {
        const { newCategory, categories, socket } = this.state;

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

            socket.emit('event', { type: 'CATEGORY_CREATE', id: socket.id, data: response });
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
        const { item, activeCategory, socket } = this.state;

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
        socket.emit('event', { type: 'ITEM_CREATE', id: socket.id, data: response });
        // Images do not get updated here for now we just show the default image for this newly created item
        this.setState({
            addItemOpen: false,
            item: { quantity: 1, name: '' },
            items: {
                ...this.state.items,
                [response.pid]: [
                    ...this.state.items[response.pid], {
                        ...response,
                    }]
            }
        })
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
            this.setState({
                activeCategory: sid,
                items: {
                    ...items,
                    [sid]: [],
                }
            });
        } else {
            this.setState({ activeCategory: sid });
        }
    }

    /**
     * Handles either adding or removing a category from
     * the list if its been marked as checked or not checked
     * @param checked
     * @param newCategory Object Contains properties for pid and sid in DynamoDB for this dataset
     */
    onCategorySelectChange(checked, newCategory) {
        const { selectedCategories } = this.state;
        if(checked) {
            this.setState({ selectedCategories: [...selectedCategories, newCategory]});
        } else {
            this.setState({ selectedCategories: selectedCategories.filter(({ sid }) => sid !== newCategory.sid )});
        }
    }

    /**
     * Handles updating local state when new items are selected and de-selected
     * @param checked
     * @param itemKey Object which has the pid and sid properties of the item in DynamoDB
     */
    onItemSelectChange(checked, itemKey) {
        const { selectedItems } = this.state;
        if(checked) {
            this.setState({ selectedItems: [ ...selectedItems, itemKey]});
        } else {
            this.setState({ selectedItems: selectedItems.filter(({ sid }) => sid !== itemKey.sid )})
        }
    }

    /**
     * Handles making the delete request to remove both categories
     * and items from the Database
     */
    async deleteRecords() {
        const {
            selectedCategories,
            selectedItems,
            items,
            socket
        } = this.state;
        let {
            categories
        } = this.state;
        console.log('Selected categories: ', selectedCategories);
        console.log('Selected Items: ', selectedItems);

        const response = await (await fetch(getRequestUrl(DELETE_ALL), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-HTTP-Method-Override': 'DELETE'
            },
            body: JSON.stringify({ items: selectedItems, categories: selectedCategories })
        })).json();

        if(response.success) {
            // TODO Show success dialogue
            if(selectedItems.length > 0)  {
                socket.emit('event', { type: 'ITEM_DELETE', id: socket.id, data: selectedItems });
                selectedItems.forEach(deletedItem => {
                    items[deletedItem.pid] = items[deletedItem.pid].filter(item => item.sid !== deletedItem.sid);
                });

                this.setState({
                    items,
                    deleteConfirmOpen: false,
                    selectedItems: [],
                    selectModeEnabled: false,
                });
            }
            if(selectedCategories.length > 0) {
                socket.emit('event', {type: 'CATEGORY_DELETE', id: socket.id, data: selectedCategories});
                this.setState({
                    categories: differenceBy(categories, selectedCategories, 'sid'),
                    deleteConfirmOpen: false,
                    selectedCategories: [],
                    selectModeEnabled: false,
                });
            }
        } else {
            console.log('[ERROR] Failed to delete: ', response);
            // TODO Show error dialogue
        }
    }

    async handleItemQuantityChange(type, item) {
        if(type.toUpperCase() === 'PLUS') {
            const response = await ( await fetch(getRequestUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-HTTP-Method-Override': 'PUT'
                },
                body: JSON.stringify({ type: 'INCREMENT', item: { pid: item.pid, sid: item.sid }})
            })).json();
        } else {
            console.log('Subtracting from ', item.name);
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
                <Confirm
                    open={this.state.deleteConfirmOpen}
                    header="Are you sure?"
                    confirmButton="Delete"
                    content={`Are you sure you want to delete ${this.state.selectedCategories.length} categories and ${this.state.selectedItems.length} items? Once you do this it cannot be un-done.`}
                    onCancel={() => this.setState({ deleteConfirmOpen: false })}
                    onConfirm={() => this.deleteRecords()}
                />
                <div className="container-fluid">
                    <div className="container-margin">
                        <div className="inner-container">
                            <div className="collection-container">
                                <Button primary className="rounded-btn" onClick={() => this.setState({ open: true })}>
                                    <Icon name="plus"/>
                                    New Category
                                </Button>
                                { this.state.categories.map(({ name, sid }, i) =>
                                    <Category
                                        onCheckChange={checked => this.onCategorySelectChange(checked, { pid: 'category', sid })}
                                        id={sid}
                                        selectMode={this.state.selectModeEnabled}
                                        key={i}
                                        items={isUndefined(this.state.items[sid]) ? 0 : this.state.items[sid].length}
                                        onClick={() => this.updateActiveCategory(sid)} active={sid === this.state.activeCategory}>{name}
                                    </Category>)
                                }
                            </div>
                            <div className="main-content">
                                <div className="row">
                                    <div className="d-flex justify-content-left">
                                        <Button secondary onClick={() => this.setState((prev) => ({ selectModeEnabled: !prev.selectModeEnabled }))}>
                                            {this.state.selectModeEnabled ? `${this.state.selectedCategories.length + this.state.selectedItems.length} Selected`  : 'Select' }
                                        </Button>
                                        {
                                            this.state.selectModeEnabled &&
                                            <Button secondary className="ml-3 button-danger" onClick={() => this.setState({ deleteConfirmOpen: true })}>
                                                <Icon name="trash" style={{ color: '#ea4335' }} />
                                                Delete
                                            </Button>
                                        }
                                        <Button secondary className="ml-3" onClick={() => this.setState({ addItemOpen: true })}>Add Items</Button>
                                    </div>
                                </div>
                                { this.state.items[this.state.activeCategory].length > 0 ? <ItemList
                                        onQuantityChange={(type, item) => this.handleItemQuantityChange(type, item)}
                                        onCheckChange={(checked, itemKey) => this.onItemSelectChange(checked, itemKey)}
                                        selectMode={this.state.selectModeEnabled}
                                        category={this.state.activeCategory}
                                        items={this.state.items[this.state.activeCategory]}
                                    /> :
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
