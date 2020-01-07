import React, { Component } from 'react';
import './ItemList.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Item from "../Item/Item";

export default class ItemList extends Component {
  render() {
      return (
          <List>
              {
                  this.props.items.map(listItem => {
                      return (
                        <ListItem key={listItem.sid}>
                         <Item name={listItem.name} quantity={listItem.quantity} />
                        </ListItem>
                      )
                  })
              }
          </List>
      )
  }
};
