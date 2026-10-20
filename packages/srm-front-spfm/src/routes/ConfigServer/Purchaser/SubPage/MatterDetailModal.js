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

import TinymceEditor from 'components/TinymceEditor';
import intl from 'utils/intl';

import styles from './index.less';

@connect(({ configServer }) => ({
  configServer,
}))
export default class MatterDetailModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      matterDetail: '',
    };
  }

  componentDidMount() {
    // this.handleSearch();
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('matterDetailVisible', false);
    }
  }

  /**
   * 监听富文本编辑
   * @param {object} dataSource - 编辑的数据
   */
  @Bind()
  onRichTextEditorChange(dataSource) {
    this.setState({
      matterDetail: dataSource,
    });
  }

  @Bind()
  onOK() {
    const {
      configServer: { sourceMatterList },
      sourceMatterRecrd,
      dispatch,
    } = this.props;
    const { matterDetail } = this.state;
    const newSourceMatterList = sourceMatterList.map(item =>
      sourceMatterRecrd.matterConfId === item.matterConfId ? { ...item, matterDetail } : item
    );
    dispatch({
      type: 'configServer/updateState',
      payload: { sourceMatterList: newSourceMatterList },
    });
    this.hideModal();
  }

  render() {
    const { matterDetailVisible = false, sourceMatterRecrd = {} } = this.props;
    const staticTextProps = {
      content: sourceMatterRecrd.matterDetail,
      onChange: this.onRichTextEditorChange,
    };
    return (
      <Modal
        title={
          <div>
            {intl.get(`spfm.configServer.view.message.modal.sourceMatter`).d('寻源事项说明')}
          </div>
        }
        visible={matterDetailVisible}
        onCancel={this.hideModal}
        width={1100}
        footer={[
          <Button key="cancel" onClick={this.hideModal}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
          <Button type="primary" key="save" onClick={this.onOK}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>,
        ]}
        wrapClassName={styles['purchase-requisition-approval-config']}
      >
        <TinymceEditor {...staticTextProps} />
      </Modal>
    );
  }
}
