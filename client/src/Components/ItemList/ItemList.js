import React, { Component } from 'react';
import './ItemList.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Item from "../Item/Item";
import {Loader} from "semantic-ui-react";

export default class ItemList extends Component {
    render() {
        if(Object.keys(this.props.images).length === 0)
            return <Loader active />;

        return (
          <List>
              {
                  this.props.items.map(listItem => {
                      return (
                        <ListItem key={listItem.sid}>
                            <Item
                                onCheckChange={(checked) => this.props.onCheckChange(checked, { sid: listItem.sid, pid: listItem.pid })}
                                selectMode={this.props.selectMode}
                                image={this.props.images[listItem.name][0]}
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
