import React, { Component } from 'react';
import { Menu, Image } from 'semantic-ui-react';
import Logo from '../../Resources/images/logo.png';
import './Navbar.css';

  export default class Navbar extends Component {
    render() {
        return (
            <Menu>
                <Menu.Item>
                    <Image src={Logo} height={40} width={40} />
                </Menu.Item>
              <Menu.Item
                  name='editorials'
              >
                Inventory Management
              </Menu.Item>
            </Menu>
        )
    }
  }
