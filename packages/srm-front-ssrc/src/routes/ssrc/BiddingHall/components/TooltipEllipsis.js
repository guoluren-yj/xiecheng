import React, { Component } from 'react';
import { Tooltip } from 'choerodon-ui/pro';

export default class TooltipEllipsis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showPopover: false,
    };
  }

  componentDidMount() {
    this.validShowPopover();
  }

  validShowPopover = () => {
    const { scrollWidth, clientWidth } = this.children || {};
    this.setState({
      showPopover: scrollWidth > clientWidth,
    });
  };

  refChildren = (ref) => {
    this.children = ref;
  };

  renderChildren() {
    return React.cloneElement(this.props.children, {
      ref: this.refChildren,
    });
  }

  render() {
    const { children, ...other } = this.props;
    const { showPopover } = this.state;

    if (showPopover) {
      return (
        <Tooltip title={null} {...other}>
          {this.renderChildren()}
        </Tooltip>
      );
    }

    return this.renderChildren();
  }
}
