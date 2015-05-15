'use strict';

import React from 'react';
import AppContainer from './components/app-container.jsx';

class App {
    constructor(node) {
        this.node = node;
    }
    run() {
        React.render(React.createElement(AppContainer, null), this.node);
    }
    test() {
        return 'Test';
    }
}

export default App;
