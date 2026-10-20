import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Lov from './Lov';

export default class App extends Component {
  static contextTypes = {
    h0CutomizeUtils: PropTypes.object,
    c7nCutomizeUtils: PropTypes.object,
    setH0CutomizeUtils: PropTypes.func,
    setC7nCutomizeUtils: PropTypes.func,
  };

  render() {
    return <Lov {...(this.context || {})} {...this.props} />;
  }
}
