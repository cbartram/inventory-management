import React, { Component } from 'react';
import './CreateCategoryModal.css';
import {
    Modal,
    Header,
    Image
} from 'semantic-ui-react';
import TextField from "@material-ui/core/TextField";

export default class CreateCategoryModal extends Component {
  render() {
      return (
          <Modal open={this.props.open} className="category-modal">
              <Modal.Header>
                  <div className="d-flex">
                      <h3 className="category-modal-header mb-0">Add a Category</h3>
                      <button className="btn btn-link ml-auto mb-1" onClick={() => this.props.onClose()}>Done</button>
                  </div>
              </Modal.Header>
              <Modal.Content>
                  <TextField
                      label="Category Name"
                      onChange={({ target }) => this.props.onChange(target.value)}
                      error={this.props.error}
                      helperText={this.props.error ? 'Your category name must be at least 1 character long.' : null }
                  />
              </Modal.Content>
          </Modal>
      )
  }
}
