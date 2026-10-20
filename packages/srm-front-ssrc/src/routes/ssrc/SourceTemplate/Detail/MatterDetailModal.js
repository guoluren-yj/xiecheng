/*
 * MatterDetailModal - 寻源事项弹框
 * @date: 2020-05-11
 * @author: LS <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';

import RichTextEditor from 'components/RichTextEditor';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import { replacePrivateBucket } from '@/utils/utils';
import styles from './index.less';

@connect(({ configServer }) => ({
  configServer,
}))
export default class MatterDetailModal extends PureComponent {
  constructor(props) {
    super(props);
    // const { matterDetail } = props; // 每次销毁组件都会进入构造函数
    this.state = {
      // matterDetail,
    };
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  hideModal () {
    const { handleModal } = this.props;
    const { matterDetail } = this.props;
    if (handleModal) {
      handleModal(matterDetail);
    }
  }

  staticTextEditorRef;

  @Bind()
  handleStaticTextEditorRef (staticTextEditorRef) {
    this.staticTextEditorRef = staticTextEditorRef;
  }

  @Bind()
  onOK () {
    const { handleModal } = this.props;
    const data = this.richTextEditor.getContent();
    if (handleModal) {
      handleModal(data);
    }
  }

  render () {
    const { matterDetailVisible = false, matterDetail, isHistory } = this.props;
    const staticTextProps = {
      content: matterDetail,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-common',
      privateBucket: true,
      // onEditorChange: this.onRichTextEditorChange,
    };
    const newMatterDetail = replacePrivateBucket(matterDetail);
    return (
      <Modal
        title={
          <div>
            {intl.get(`ssrc.sourceTemplate.view.message.modal.sourceMatterDesc`).d('寻源事项说明')}
          </div>
        }
        visible={matterDetailVisible}
        onCancel={this.hideModal}
        width={1100}
        destroyOnClose
        footer={isHistory ? null : [
          <Button key="cancel" onClick={this.hideModal}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
          <Button type="primary" key="save" onClick={this.onOK}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>,
        ]}
        wrapClassName={styles['purchase-requisition-approval-config']}
      >
        {/* <TinymceEditor {...staticTextProps} /> */}
        {isHistory ? (
          <div dangerouslySetInnerHTML={{ __html: newMatterDetail || '' }} />
        ) : (
          matterDetail !== undefined && (
            <RichTextEditor
              {...staticTextProps}
              ref={(node) => {
                this.richTextEditor = node;
              }}
            />
        ))}

      </Modal>
    );
  }
}
