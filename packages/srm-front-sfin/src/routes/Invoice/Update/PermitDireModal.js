import React, { Component } from 'react';
import { Modal, Radio } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray } from 'util';
import intl from 'utils/intl';
// import { Pagination } from 'choerodon-ui';

const titlePrompt = 'sfin.invoiceBill.view.title';

export default class PermitDireModal extends Component {
  constructor(props) {
    super(props);
    const { defaultInvoiceType } = this.props;
    this.state = { defaultInvoiceType };
  }

  /**
   * 保存 modal 数据，并且关闭 modal
   */
  @Bind()
  handleOk() {
    const { onDirectLinkedInvoice, onHideModal } = this.props;
    const { defaultInvoiceType } = this.state;
    onDirectLinkedInvoice(defaultInvoiceType);
    onHideModal();
  }

  @Bind()
  onChange = e => {
    this.setState({ defaultInvoiceType: e.target.value });
  };

  render() {
    const { visible, onHideModal, invoiceType } = this.props;
    // const aaa = isArray(invoiceType) ? invoiceType[0].invoiceTypeCode : '';
    const { defaultInvoiceType } = this.state;

    const RadioGroup = Radio.Group;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const invoiceTypeList = isArray(invoiceType) ? (
      <RadioGroup name="radiogroup" defaultValue={defaultInvoiceType} onChange={this.onChange}>
        {invoiceType.map(ele => {
          return (
            <Radio value={ele.invoiceTypeCode} style={radioStyle}>
              {ele.invoiceTypeCodeMeaning}
            </Radio>
          );
        })}
      </RadioGroup>
    ) : (
      ''
    );
    return (
      <Modal
        title={intl.get(`${titlePrompt}.formOfInvoice`).d('开具发票形式')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onHideModal}
      >
        {invoiceTypeList}
      </Modal>
    );
  }
}
