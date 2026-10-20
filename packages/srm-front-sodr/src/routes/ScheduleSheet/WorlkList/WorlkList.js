import React, { Component, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { dateRender, dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { formatAumont } from '../../components/utils';

@withCustomize({
  unitCode: ['SODR.PLAN_SHEET_PUBLISH.APPROVE_LIST'],
})
export default class List extends Component {
  render() {
    const {
      customizeTable,
      loading,
      dataSource = [],
      onSearch,
      handleToAsnNums,
      handleOperating,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'serialNum',
        width: 60,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.status`).d('状态'),
        dataIndex: 'planStatus',
        width: 60,
        fixed: 'left',
        render: (_, record) => record.planStatusMeaning,
      },
      {
        title: intl.get(`sodr.common.model.common.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.planQuantity`).d('本次计划数量'),
        dataIndex: 'planQuantity',
        width: 120,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.planDate`).d('本次计划到货日期'),
        dataIndex: 'planDate',
        width: 180,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.common.model.common.purchaserRemark1`).d('采购方备注'),
        dataIndex: 'purchaserRemark',
        width: 200,
      },
      {
        title: intl.get(`sodr.common.model.common.supplierConfirmQuantity`).d('供应方确认数量'),
        dataIndex: 'supplierConfirmQuantity',
        width: 140,
      },
      {
        title: intl.get(`sodr.common.model.common.supplierRemark`).d('供应商备注'),
        dataIndex: 'supplierRemark',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 140,
      },
      {
        title: intl.get(`sodr.common.model.common.poLineId`).d('订单行号'),
        dataIndex: 'lineNum',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.orderDisplayLineLocationNum`).d('订单发运号'),
        dataIndex: 'lineLocationNum',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.netReceivedQuantitys`).d('净接收数量'),
        dataIndex: 'netReceivedQuantity',
        width: 80,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.sendingQuantity`).d('送货中数量'),
        dataIndex: 'sendingQuantity',
        width: 80,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
        dataIndex: 'uomName',
        width: 60,
      },
      {
        title: intl.get(`sodr.common.model.common.needByDate`).d('需求日期'),
        dataIndex: 'needByDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.common.model.common.promiseDeliveryDate`).d('承诺交货日期'),
        dataIndex: 'promiseDeliveryDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.common.model.common.agentId`).d('采购员'),
        dataIndex: 'agentId',
        width: 100,
        render: (_, record) => record.purchaseAgentName,
      },
      {
        title: intl.get(`entity.item.companyId`).d('公司'),
        dataIndex: 'companyName',
        width: 180,
      },
      {
        title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`entity.organization.class.inventoryName`).d('库房'),
        dataIndex: 'inventoryName',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.receivingAddress`).d('收货地址'),
        dataIndex: 'shipToThirdPartyAddress',
        width: 200,
      },
      {
        title: intl.get(`sodr.common.model.common.asnNums`).d('关联送货单'),
        dataIndex: 'asnNums',
        width: 120,
        render: (val, record) => <a onClick={() => handleToAsnNums(record)}>{val || ''}</a>,
      },
      {
        title: intl.get(`sodr.common.model.common.createDate`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sodr.common.model.common.createdByName`).d('创建人'),
        dataIndex: 'createdBy',
        width: 70,
        render: (_, record) => record.createdByName,
      },
      {
        title: intl.get(`sodr.common.view.button.operationRecord`).d('操作记录'),
        dataIndex: 'operating',
        width: 130,
        render: (__, record) => (
          <a onClick={() => handleOperating(true, record)}>
            {intl.get(`sodr.common.view.button.operationRecord`).d('操作记录')}
          </a>
        ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SODR.PLAN_SHEET_PUBLISH.APPROVE_LIST',
          },
          <Table
            loading={loading}
            rowKey="planId"
            bordered
            scroll={{ x: scrollX }}
            columns={columns}
            dataSource={dataSource}
            onChange={onSearch}
          />
        )}
      </Fragment>
    );
  }
}
