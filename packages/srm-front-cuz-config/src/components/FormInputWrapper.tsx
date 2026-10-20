import React, {Component, forwardRef} from "react";

class Inner extends Component<any, any> {
  state = {
    visible: false,
  }

  onMouseEnter = () => {
    this.setState({visible: true});
  }

  onMouseLeave = () => {
    this.setState({visible: false});
  }

  render() {
    const { children, Wrapper, wrapperProps } = this.props;
    return (
      <Wrapper {...wrapperProps} visible={this.state.visible}>
        <span onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
          {children}
        </span>
      </Wrapper>
    );
  }
}
export default forwardRef<unknown, any>(function FormInputWrapper({ Wrapper, wrapperProps, Child, childProps, ...props }, ref) {
  return (
    <Inner Wrapper={Wrapper} wrapperProps={wrapperProps}>
      <Child {...childProps} {...props} ref={ref} />
    </Inner>
  );
});