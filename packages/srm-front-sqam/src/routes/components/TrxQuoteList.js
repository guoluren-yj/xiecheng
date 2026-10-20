import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import UploadModal from 'components/Upload/index';
import { dateRender } from 'utils/renderer';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { tableScrollWidth } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { thousandBitSeparator } from '@/routes/utils.js';

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sqam.quoteIncomingInspection'],
})
class TrxQuoteList extends PureComponent {
  render() {
    const {
      loading = false,
      dataSource = [],
      rowSelection = null,
      customizeTable,
      code,
    } = this.props;
    const promptCode = 'sqam.quoteIncomingInspection.model.quoteIncomingInspection';
    const columns = [
      {
        title: intl.get(`${promptCode}.trxNumandLine`).d('事务编号｜行号'),
        width: 150,
        fixed: 'left',
        dataIndex: 'inspectionNum',
        render: (value, record) => record && `${record.trxNum}|${record.trxLineNum}`,
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`entity.supplier.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 230,
        fixed: 'left',
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
        dataIndex: 'organizationName',
        width: 120,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.rcvTypeName`).d('事务类型'),
        dataIndex: 'rcvTypeName',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.date.trxQuantity`).d('执行数量'),
        dataIndex: 'quantity',
        width: 150,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${promptCode}.executeReverseQuantity`).d('执行退回数量'),
        dataIndex: 'executeReverseQuantity',
        width: 150,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${promptCode}.nodeConfigName`).d('执行退回节点'),
        dataIndex: 'nodeConfigName',
        width: 150,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.sourceHeaderNum`).d('事务来源单号'),
        dataIndex: 'sourceHeaderNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.displayTrxNum`).d('事务编号'),
        dataIndex: 'displayTrxNum',
        width: 120,
      },
      {
        title: intl.get('sqam.common.model.common.attachment').d('附件'),
        dataIndex: 'sinvLineAttachmentUuid',
        render: (val, record) => {
          if (record.sinvLineAttachmentUuid) {
            return (
              <UploadModal
                attachmentUUID={val}
                bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                bucketDirectory="create8D"
                viewOnly
              />
            );
          }
        },
      },
    ];
    return customizeTable(
      { code },
      <EditTable
        bordered
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
export default TrxQuoteList;
