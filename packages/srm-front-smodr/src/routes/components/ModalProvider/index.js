import React from 'react';
import { ModalProvider } from 'choerodon-ui/pro';
import { StoreProvider } from './Store';

export class UpdateModalClass extends React.Component {
  render() {
    const { containerRef } = this.props;
    return (
      <ModalProvider getContainer={() => containerRef}>
        <StoreProvider location={this.props.location}>{this.props.children}</StoreProvider>
      </ModalProvider>
    );
  }
}
