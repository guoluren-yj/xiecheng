import React from 'react';
import { Modal, Button } from 'hzero-ui';
import { Table, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { thousandBitSeparator, thousandBitSeparatorCut } from '@/routes/utils';

import tableDS from './indexDS';

import '../../index.less';

// 操作按钮
const ModalFooterRender = observer(({ dataSet, onOk, onClose, loading }) => {
  const isDisabled = isEmpty(dataSet.toJSONData());
  return (
    <>
      <Button type="primary" disabled={isDisabled} onClick={onOk} loading={loading}>
        {intl.get('hzero.common.button.ok').d('确定')}
      </Button>
      <Button style={{ marginLeft: '10px' }} onClick={onClose} loading={loading}>
        {intl.get('hzero.common.btn.close').d('关闭')}
      </Button>
    </>
  );
});

class AddLinesModal extends React.Component {
  constructor(props) {
    super(props);
    const { type } = props;
    this.tableDs = new DataSet(tableDS(type));
  }

  componentDidMount() {
    const { headerInfo = {} } = this.props;
    const {
      billHeaderId,
      ouId,
      supplierCompanyId,
      supplierId,
      companyId,
      currencyCode,
    } = headerInfo;
    this.tableDs.setQueryParameter('billHeaderId', billHeaderId);
    this.tableDs.setQueryParameter('ouId', ouId);
    this.tableDs.setQueryParameter('supplierCompanyId', supplierCompanyId);
    this.tableDs.setQueryParameter('supplierId', supplierId);
    this.tableDs.setQueryParameter('companyId', companyId);
    this.tableDs.setQueryParameter('currencyCode', currencyCode);
    this.tableDs.query();
  }

  handleOk = async () => {
    const { onOk } = this.props;
    const vali = await this.tableDs.validate();
    const body = this.tableDs.toJSONData().map(({ rowKey, ...other }) => other);
    if (vali) {
      onOk(body);
    }
  };

  handleClose = () => {
    this.props.onCancel();
  };

  render() {
    const { visible, onCancel, loading, businessType } = this.props;
    const columns = [
      {
        name: 'trxAndLineNum',
        width: 180,
        lock: true,
      },
      {
        name: 'itemCode',
        width: 120,
        lock: true,
      },
      {
        name: 'itemName',
        width: 100,
        lock: true,
      },
      {
        name: 'commonName',
        width: 100,
        lock: true,
      },
      {
        name: 'specificationsAndModel',
        width: 120,
      },
      {
        name: 'unit',
        width: 100,
      },
      {
        name: 'invoiceQuantityAvailable',
        width: 100,
        render: (text) => thousandBitSeparator(text),
      },
      {
        name: 'netPrice',
        width: 100,
        align: 'right',
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.netPriceMeaning
            : thousandBitSeparatorCut(record.netPrice, record.pricePrecision),
      },
      {
        name: 'netAmount',
        align: 'right',
        width: 120,
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.netAmountMeaning
            : thousandBitSeparator(record.netAmount, record.amountPrecision),
      },
      {
        name: 'taxRate',
        width: 120,
      },
      {
        name: 'taxIncludedPrice',
        align: 'right',
        width: 120,
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.taxIncludedPriceMeaning
            : thousandBitSeparatorCut(record.taxIncludedPrice, record.pricePrecision),
      },
      {
        name: 'taxIncludedAmount',
        align: 'right',
        width: 120,
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.taxIncludedAmountMeaning
            : thousandBitSeparator(record.taxIncludedAmount, record.amountPrecision),
      },
      {
        name: 'taxAmount',
        align: 'right',
        width: 120,
        render: (text, record) =>
          record.priceShieldFlag === 1
            ? record.taxAmountMeaning
            : thousandBitSeparator(record.taxAmount, record.amountPrecision),
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'trxType',
        width: 120,
      },
      {
        name: 'parentNumber',
        width: 120,
      },
      {
        name: 'asnNumAndAsnLineNum',
        width: 120,
      },
      {
        name: 'poNumAndLineNum',
        width: 100,
      },
      {
        name: 'displayReleaseNum',
        width: 120,
      },
      {
        name: 'displayLineLocationNum',
        width: 120,
      },
      {
        name: 'orderTypeName',
        width: 120,
      },
      {
        width: 120,
        name: 'purchaseOrgName',
      },
      {
        width: 120,
        name: 'organizationName',
      },
      {
        width: 100,
        name: 'inventoryName',
      },
      {
        width: 100,
        name: 'purAgentName',
      },
      {
        width: 120,
        name: 'trxDate',
      },
    ];
    return (
      <Modal
        destroyOnClose
        visible={visible}
        width={1200}
        title={intl.get(`sfin.invoiceBill.view.message.title.addBillLines`).d('新增对账行')}
        onCancel={onCancel}
        footer={
          <ModalFooterRender
            onOk={this.handleOk}
            loading={loading}
            dataSet={this.tableDs}
            onClose={this.handleClose}
          />
        }
      >
        <Table
          dataSet={this.tableDs}
          rowKey={businessType === 'ACCEPT' ? 'acceptListLineId' : 'rcvTrxLineId'}
          columns={columns}
          queryFieldsLimit={3}
        />
      </Modal>
    );
  }
}

export default AddLinesModal;
