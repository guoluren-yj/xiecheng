import React, { PureComponent } from 'react';
import { Form, Table } from 'hzero-ui';

import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import UploadModal from 'components/Upload/index';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { thousandBitSeparator } from '@/routes/utils.js';

@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SQAM.CREATE_8D_LIST.TRX_QUOTE_LIST', 'SQAM.CREATE_8D_LIST.QUOTE_GRID'],
})
class ListTable extends PureComponent {
  render() {
    const {
      trxLoading,
      loading,
      dataSource = [],
      pagination = {},
      onSearch,
      rowSelection,
      isSelectTx,
      paginationTrx,
      dataTrxSource,
      customizeTable,
    } = this.props;
    const promptCode = 'sqam.quoteIncomingInspection.model.quoteIncomingInspection';
    const columns = [
      {
        title: intl.get(`${promptCode}.inspectionNum`).d('检验单号'),
        width: 150,
        fixed: 'left',
        dataIndex: 'inspectionNum',
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
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
        title: intl.get(`${promptCode}.assessmentResult`).d('评估结果'),
        dataIndex: 'assessmentResultMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.decisionResult`).d('决策结果'),
        dataIndex: 'decisionResultMeaning',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.startDate`).d('检验开始日期'),
        dataIndex: 'startDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.endDate`).d('检验结束日期'),
        dataIndex: 'endDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.poNum`).d('采购订单编号'),
        dataIndex: 'poNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.transactionNum`).d('事务编号'),
        dataIndex: 'transactionNum',
        width: 120,
      },
    ];

    const trxColumns = [
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
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 230,
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
        title: intl.get(`hzero.common.date.quantity`).d('执行数量'),
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
      {
        code: isSelectTx ? 'SQAM.CREATE_8D_LIST.TRX_QUOTE_LIST' : 'SQAM.CREATE_8D_LIST.QUOTE_GRID',
      },
      <Table
        bordered
        rowKey={isSelectTx ? 'rcvTrxLineId' : 'inspectionId'}
        loading={isSelectTx ? trxLoading : loading}
        columns={isSelectTx ? trxColumns : columns}
        dataSource={isSelectTx ? dataTrxSource : dataSource}
        pagination={isSelectTx ? paginationTrx : pagination}
        rowSelection={rowSelection}
        onChange={(page) => onSearch(page)}
        scroll={{ x: tableScrollWidth(isSelectTx ? trxColumns : columns) }}
      />
    );
  }
}
export default ListTable;
