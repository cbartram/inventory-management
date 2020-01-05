import React, { Component } from 'react';
import './ItemList.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';

export default class ItemList extends Component {
  render() {
      return (
          <List>
              {
                  this.props.items.map(listItem => {
                      return (
                        <ListItem key={listItem.sid}>
                          <ListItemAvatar>
                            <Avatar>
                              <ImageIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={listItem.name} secondary={`Quantity ${listItem.quantity}`} />
                        </ListItem>
                      )
                  })
              }
          </List>
      )
  }
};
