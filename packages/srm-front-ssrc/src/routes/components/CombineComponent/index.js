import React, { Component } from 'react';

export default function CombineComponent(definedProps) {
  return (Com) => {
    class NewComponent extends Component {
      render() {
        const { forwardedRef, ...rest } = this.props;
        const newProps = { ...rest, ...definedProps };
        return <Com ref={forwardedRef} {...newProps} />;
      }
    }

    return React.forwardRef((props, ref) => {
      return <NewComponent {...props} forwardedRef={ref} />;
    });
  };
}
