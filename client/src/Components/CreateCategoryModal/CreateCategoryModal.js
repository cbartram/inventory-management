import React, { Component } from 'react';
import './CreateCategoryModal.css';
import {
    Button,
    Modal,
} from 'semantic-ui-react';
import TextField from "@material-ui/core/TextField";

export default class CreateCategoryModal extends Component {
  render() {
      return (
          <Modal open={this.props.open} className="category-modal">
              <Modal.Header>
                  <h3 className="category-modal-header mb-2">Add a Category</h3>
              </Modal.Header>
              <Modal.Content>
                  <TextField
                      label="Category Name"
                      onChange={({ target }) => this.props.onChange(target.value)}
                      error={this.props.error}
                      helperText={this.props.error ? 'Your category name must be at least 1 character long.' : null }
                  />
              </Modal.Content>
              <Modal.Actions>
                  <button className="btn btn-secondary-outline" onClick={() => this.props.onClose('cancel')}>Cancel</button>
                  <button className="btn btn-link ml-auto mb-1" onClick={() => this.props.onClose('done')}>Done</button>
              </Modal.Actions>
          </Modal>
      )
  }
}
