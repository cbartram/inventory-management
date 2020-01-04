import React from 'react';
import './App.css';
import Navbar from "./components/Navbar/Navbar.js";
import {Button, Icon} from 'semantic-ui-react';

function App() {
  return (
    <div>
      <Navbar />
      <div className="container">
          <div className="container-margin">
            <div className="inner-container">
                <div className="collection-container">
                    <Button primary>
                        <Icon name="plus" />
                        New Category
                    </Button>
                </div>
                <div className="main-content">
                    <h3>Main content</h3>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
}

export default App;
