/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';

export default class CustomizeProvider extends Component {
  static childContextTypes = {
    h0CutomizeUtils: PropTypes.object,
    c7nCutomizeUtils: PropTypes.object,
    setH0CutomizeUtils: PropTypes.func,
    setC7nCutomizeUtils: PropTypes.func,
  };

  getChildContext() {
    return {
      h0CutomizeUtils: this.h0CutomizeUtils,
      c7nCutomizeUtils: this.c7nCutomizeUtils,
      setC7nCutomizeUtils: this.setC7nCutomizeUtils,
      setH0CutomizeUtils: this.setH0CutomizeUtils,
    };
  }

  h0CutomizeUtils = null;

  c7nCutomizeUtils = null;

  @Bind()
  setH0CutomizeUtils(h0CutomizeUtils) {
    if (!this.h0CutomizeUtils) {
      this.h0CutomizeUtils = h0CutomizeUtils;
    }
  }

  @Bind()
  setC7nCutomizeUtils(c7nCutomizeUtils) {
    if (!this.c7nCutomizeUtils) {
      this.c7nCutomizeUtils = c7nCutomizeUtils;
    }
  }

  render() {
    return this.props.children;
  }
}
