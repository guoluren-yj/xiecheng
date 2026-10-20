import React, { PureComponent } from 'react';
import { Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import Investigation from '../../Investigation/Component/Investigation';

export default class InvestigatePreview extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    if (onRef) onRef(this.handleShowModal);
    this.state = {
      modalVisible: false,
    };
  }

  /**
   * 打开预览调查表模态框
   */
  @Bind()
  handleShowModal() {
    this.setState({ modalVisible: true });
  }

  /**
   * 关闭预览调查表模态框
   */
  @Bind()
  handleCancel() {
    this.setState({ modalVisible: false });
  }

  render() {
    const { organizationId, investigateTemplateId, previewTitle } = this.props;
    const { modalVisible } = this.state;
    return (
      <Modal
        destroyOnClose
        visible={modalVisible}
        width={1000}
        onCancel={this.handleCancel}
        footer={null}
      >
        <Header>{previewTitle}</Header>
        <Content>
          <Investigation
            organizationId={organizationId}
            investigateTemplateId={investigateTemplateId}
            isShowRecord={false}
          />
        </Content>
      </Modal>
    );
  }
}
