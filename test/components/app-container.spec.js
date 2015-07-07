'use strict';

import React from 'react/addons';
import AppContainer from 'components/app-container.jsx';

let TestUtils = React.addons.TestUtils;

describe('AppContainer', () => {
    let component;

    beforeEach(() => {
        component = TestUtils.renderIntoDocument(React.createElement(AppContainer));
    });

    it('should display correct value', () => {
        let HelloWorldNode = TestUtils.findRenderedDOMComponentWithTag(component, 'h1');

        expect(HelloWorldNode.getDOMNode().textContent).toBe('Hello world');
    });
});