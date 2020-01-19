import React, { Component } from 'react';
import './ItemList.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Item from "../Item/Item";
import DefaultImage from '../../resources/images/default_image.png';
import {Loader} from "semantic-ui-react";

export default class ItemList extends Component {
    render() {
        return (
          <List>
              {
                  this.props.items.map(listItem => {
                      return (
                        <ListItem key={listItem.sid}>
                            <Item
                                onCheckChange={(checked) => this.props.onCheckChange(checked, { sid: listItem.sid, pid: listItem.pid })}
                                selectMode={this.props.selectMode}
                                image={typeof this.props.images[listItem.name] === 'undefined' ? DefaultImage : this.props.images[listItem.name][0]}
                                {...listItem}
                            />
                        </ListItem>
                      )
                  })
              }
          </List>
      )
  }
};
