import React, { Component } from 'react';
import './AddItemsMessage.css';

export default class AddItemsMessage extends Component {
  render() {
      return (
          <div className="add-items-container">
              <img className="add-items-image" alt="add-items" src="https://www.gstatic.com/save/empty_collection.svg" />
              <div className="add-items-header">Add items to this collection</div>
              <div className="add-items-subtext">Look for the bookmark across Google to add what you like!</div>
              <button className="btn btn-primary" onClick={() => this.props.onClick()}>Add Items</button>
          </div>
      )
  }
}
