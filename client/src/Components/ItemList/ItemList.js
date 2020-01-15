import React, { Component } from 'react';
import './ItemList.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Item from "../Item/Item";
import {GET_IMAGES, getRequestUrl} from "../../constants";
import {Loader} from "semantic-ui-react";

export default class ItemList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            images: [],
            isLoading: true,
        }
    }

    async componentDidMount() {
        const images = await (await fetch(getRequestUrl(GET_IMAGES) + this.props.category, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
        })).json();

        console.log(images);
        this.setState({ images, isLoading: false });
    }

    render() {
        if(this.state.isLoading)
            return <Loader active />;
        return (
          <List>
              {
                  this.props.items.map(listItem => {
                      console.log(listItem);
                      return (
                        <ListItem key={listItem.sid}>
                         <Item image={this.state.images[listItem.name][0]} {...listItem} />
                        </ListItem>
                      )
                  })
              }
          </List>
      )
  }
};
