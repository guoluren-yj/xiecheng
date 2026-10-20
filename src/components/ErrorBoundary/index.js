import React from 'react';

export default class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    const { onError } = this.props;
    onError(error, errorInfo);
  }

  render() {
    const { children } = this.props;
    return children;
  }
}
