/**
 * 自动适应高度H0-ui table
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class AutoRestHeight extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.childrenRef = null;
    this.frame = 0;
    this.state = {
      height: 'auto',
    };
  }

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.handler);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener('resize', this.handler);
  }

  resize = () => {
    const { diff = 80, topSelector } = this.props;
    if (this.childrenRef) {
      // eslint-disable-next-line
      const childrenRefWrapperDom = ReactDOM.findDOMNode(this.childrenRef);
      let childrenRefDom = childrenRefWrapperDom;
      if (topSelector) {
        childrenRefDom = childrenRefDom.querySelector(topSelector);
      }
      const { top: offsetTop } = childrenRefDom.getBoundingClientRect();
      this.setState({ height: window.innerHeight - offsetTop - diff });
      if (this.childrenRef.handleResize) {
        this.childrenRef.handleResize();
      }
    }
  };

  handler = () => {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(this.resize);
  };

  render() {
    const { height } = this.state;
    const { children, bodyStyle, style } = this.props;
    const newScroll = {
      y: height - 60,
    };
    if (children.props && children.props.scroll && children.props.scroll.x) {
      newScroll.x = children.props.scroll.x;
    }
    return React.cloneElement(children, {
      ref: ref => {
        this.childrenRef = ref;
      },
      style: {
        ...style,
        maxHeight: height,
      },
      bodyStyle: {
        ...bodyStyle,
        maxHeight: height - 40,
      },
      scroll: newScroll,
    });
  }
}
