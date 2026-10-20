/**
 * OperationRecord - 供应商查看页面
 * @date: 2019 1/8
 * @author: zili.hou@hand-china
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Modal, Form } from 'hzero-ui';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';

const promptCode = 'ssrc.quoController';

@Form.create({ fieldNameProp: null })
export default class OperationRecord extends PureComponent {
  componentDidMount() {}

  render() {
    const { visible, hideModal, supplierDataSource, form, customizeTable } = this.props;
    const { getFieldDecorator } = form;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.quoController.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.minimumPrice`).d('最低限价'),
        dataIndex: 'minLimitPrice',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.maximumPrice`).d('最高限价'),
        dataIndex: 'maxLimitPrice',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.whetherToInvite`).d('是否邀请'),
        dataIndex: 'inviteFlag',
        align: 'center',
        width: 100,
        render: (val) => (
          <Form.Item>
            {getFieldDecorator('inviteFlag', {
              initialValue: val,
            })(<Checkbox checkedValue={1} unCheckedValue={0} disabled />)}
          </Form.Item>
        ),
      },
    ];
    const modalProps = {
      visible,
      width: 600,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '650px', overflow: 'auto' },
      title: intl.get(`${promptCode}.view.message.title.screeningSupplier`).d('筛选供应商'),
    };
    const tableProps = {
      rowKey: 'rfxLineSupplierId',
      dataSource: supplierDataSource,
      columns,
      pagination: false,
    };
    return (
      <Modal {...modalProps}>
        {customizeTable(
          {
            code: 'SSRC.QUOTATION_CONTROLLER_DETAIL.ITEM_FILTER_SUPPLIER',
          },
          <Table {...tableProps} bordered />
        )}
      </Modal>
    );
  }
}
