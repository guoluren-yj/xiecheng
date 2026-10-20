/*
 * ReadMatterDetail 寻源事项
 * @date: 2020/5/8
 * @author: <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Checkbox, Button, Modal } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Button as C7nButton } from 'choerodon-ui/pro';

import { replacePrivateBucket } from '@/utils/utils';

@formatterCollections({
  code: ['ssrc.supplierQuotation'],
})
export default class ReadMatterDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedFlag: false,
    };
  }

  @Bind()
  handleChangeFlag(e) {
    this.setState({
      checkedFlag: e.target.checked,
    });
  }

  // 渲染弹窗页脚
  @Bind()
  handleRenderFooter() {
    const {
      onNext,
      handleReadMatterCancel,
      modalType,
      currentOperateRow = {},
      loading = false,
    } = this.props;
    const { checkedFlag } = this.state;
    return (
      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <Checkbox onChange={this.handleChangeFlag}>
          {modalType === 'RFX'
            ? intl
                .get(`ssrc.supplierQuotation.view.message.agreedOfRfx`)
                .d('我已阅读并同意寻源事项说明')
            : intl
                .get(`ssrc.supplierQuotation.view.message.agreedOfBid`)
                .d('我已阅读并同意招标事项说明')}
        </Checkbox>
        <Button type="default" onClick={() => handleReadMatterCancel()}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>
        <C7nButton
          color="primary"
          loading={loading}
          disabled={!checkedFlag}
          onClick={() => onNext(currentOperateRow)}
          style={{ marginLeft: '8px' }}
        >
          {intl.get(`ssrc.supplierQuotation.view.message.button.nextPath`).d('下一步')}
        </C7nButton>
      </div>
    );
  }

  render() {
    const { matterDetail, handleReadMatterCancel, readMatterDetailVisible, modalType } = this.props;
    const newMatterDetail = replacePrivateBucket(matterDetail);
    return (
      <Modal
        visible={readMatterDetailVisible}
        width={800}
        footer={this.handleRenderFooter()}
        onCancel={handleReadMatterCancel}
        destroyOnClose
        title={
          modalType === 'RFX'
            ? intl
                .get(`ssrc.supplierQuotation.view.message.rfxMatterDetailInstructions`)
                .d('寻源事项说明')
            : intl.get(`ssrc.supplierQuotation.view.message.bidMatterDetail`).d('招标事项说明')
        }
      >
        <Fragment>
          <div style={{ minHeight: '380px', maxHeight: '400px', overflowY: 'scroll' }}>
            <div dangerouslySetInnerHTML={{ __html: newMatterDetail || '' }} />
          </div>
        </Fragment>
      </Modal>
    );
  }
}
