import React, { Component } from 'react';
import './Category.css';
import {Icon} from "semantic-ui-react";

export default class Category extends Component {
  render() {
      return (
          <div className={`category ${this.props.active ? 'active' : '' }`} onClick={() => this.props.onClick()}>
              <div className="d-flex">
                  <div className="category-icon">
                      <Icon name="folder open outline" size="large" />
                  </div>
                  <div className="d-flex flex-column">
                      <span className={`category-name ${this.props.active ? 'active' : '' }`}>{ this.props.children }</span>
                      <span className="text-muted">Private &middot; 0 items</span>
                  </div>
              </div>
          </div>
      )
  }
}
