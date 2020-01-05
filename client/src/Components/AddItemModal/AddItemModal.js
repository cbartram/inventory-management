import React, { Component } from 'react';
import './AddItemModal.css';
import times from 'lodash/times';
import {Modal} from 'semantic-ui-react';
import TextField from "@material-ui/core/TextField";
import MenuItem from '@material-ui/core/MenuItem';

export default class AddItemModal extends Component {
  render() {
      return (
          <Modal open={this.props.open} className="category-modal">
            <Modal.Header>
                <h3 className="category-modal-header mb-2">Add an Item</h3>
            </Modal.Header>
            <Modal.Content>
                <div className="d-flex flex-column">
                  <TextField
                      className="mb-3"
                      variant="outlined"
                      label="Item Name"
                      onChange={({ target }) => this.props.onChange(target.value)}
                      error={this.props.error}
                      helperText={this.props.error ? 'Your item name must be at least 1 character long.' : null }
                  />
                    <TextField
                        select
                        label="Select"
                        value={this.props.quantity}
                        onChange={({ target }) => this.props.onQuantityChange(target.value)}
                        helperText="Quantity of this item available"
                        variant="outlined"
                        error={this.props.error}
                    >
                        {
                            times(10, (i) => {
                                return (
                                    <MenuItem value={i} key={i}>
                                        {i}
                                    </MenuItem>
                                )
                            })
                        }
                    </TextField>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <button className="btn btn-outline-secondary" onClick={() => this.props.onClose('cancel')}>Cancel</button>
                <button className="btn btn-link ml-auto mb-1" onClick={() => this.props.onClose('done')}>Done</button>
            </Modal.Actions>
          </Modal>
      )
  }
}
