/**
 * InvoiceModal - 选择开票类型模态框
 * @date: 2019-9-16
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Modal, Radio } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import intl from 'utils/intl';

const titlePrompt = 'sfin.invoiceBill.view.title';

export default class PromptModal extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      value: null,
    };
  }

  /**
   * 保存 modal 数据，并且关闭 modal
   */
  @Bind()
  handleOk() {
    const { onModalOk } = this.props;
    const { value } = this.state;
    onModalOk(value);
  }

  /**
   * 关闭 modal
   */
  @Bind()
  handleCancel = () => {
    const { onClose } = this.props;
    onClose();
    this.setState({
      value: '',
    });
  };

  @Bind()
  onChange(e) {
    this.setState({
      value: e.target.value,
    });
  }

  render() {
    const { visible, invoiceType = [] } = this.props;
    const { value } = this.state;
    const radioStyle = {
      display: 'block',
      height: '40px',
      lineHeight: '40px',
    };
    return (
      <Modal
        visible={visible}
        title={intl.get(`${titlePrompt}.formOfInvoice`).d('开具发票形式')}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        okText={intl.get(`hzero.common.button.ok`).d('确定')}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        okButtonProps={{ disabled: !value }}
      >
        <Radio.Group onChange={this.onChange} value={value}>
          {invoiceType.map(item => (
            <Radio style={radioStyle} value={item.invoiceTypeCode}>
              {item.invoiceTypeCodeMeaning}
            </Radio>
          ))}
        </Radio.Group>
      </Modal>
    );
  }
}
