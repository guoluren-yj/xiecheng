/**
 * OtherInfoList - 订单签署 - 明细页面其他信息表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';

export default class OtherInfoList extends PureComponent {
  defaultTableRowKey = 'poLineId';

  render() {
    const {
      dataSource = [],
      pagination,
      processing,
      onChange = (e) => e,
      openBOMModal = (e) => e,
    } = this.props;
    const tableProps = {
      rowKey: this.defaultTableRowKey,
      columns: [
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.lineNum`).d('行号'),
          dataIndex: 'lineNum',
          align: 'center',
          width: 50,
          fixed: 'left',
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.shipmentNum`).d('发运号'),
          dataIndex: 'shipmentNum',
          align: 'center',
          width: 90,
          fixed: 'left',
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          align: 'center',
          width: 100,
          fixed: 'left',
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.itemDescription`).d('物料名称'),
          dataIndex: 'itemDescription',
          width: 150,
          fixed: 'left',
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.oldItemCode`).d('旧物料号'),
          dataIndex: 'oldItemCode',
          align: 'center',
          width: 150,
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.itemTypeDesc`).d('物品类型'),
          dataIndex: 'categoryName',
          align: 'center',
          width: 150,
          render: (val) => <Tooltip title={val}>{val}</Tooltip>,
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.rate`).d('汇率'),
          dataIndex: 'exchangeRate',
          align: 'right',
          width: 150,
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.isConsignedFlag`).d('是否寄售'),
          dataIndex: 'isConsignedFlag',
          align: 'center',
          width: 150,
          render: (text) =>
            intl
              .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
              .d(text === 1 ? '是' : '否'),
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.isReturnedFlag`).d('是否退回'),
          dataIndex: 'isReturnedFlag',
          align: 'center',
          width: 150,
          render: (text) =>
            intl
              .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
              .d(text === 1 ? '是' : '否'),
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.isFreeFlag`).d('是否免费'),
          dataIndex: 'isFreeFlag',
          align: 'center',
          width: 150,
          render: (text) =>
            intl
              .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
              .d(text === 1 ? '是' : '否'),
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.isImmedShippedFlag`).d('是否直发'),
          dataIndex: 'isImmedShippedFlag',
          align: 'center',
          render: (text) =>
            intl
              .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
              .d(text === 1 ? '是' : '否'),
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.bom`).d('外协BOM'),
          align: 'center',
          render: (text, record) => (
            <a onClick={() => openBOMModal(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ),
        },
        {
          title: intl.get(`sodr.common.model.common.accountAssignment`).d('科目分配'),
          dataIndex: 'currencyCode',
          align: 'center',
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.poReqNum`).d('采购申请号'),
          dataIndex: 'displayPrNum',
          align: 'center',
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.poReqLineNum`).d('采购申请行号'),
          dataIndex: 'displayPrLineNum',
          align: 'center',
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.poReqPreparedName`).d('申请人'),
          dataIndex: 'purReqAppliedName',
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.shipToThirdPartyName`).d('送达方'),
          dataIndex: 'shipToThirdPartyName',
          align: 'center',
        },
        {
          title: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('送货地址'),
          dataIndex: 'shipToThirdPartyAddress',
          align: 'center',
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.contactsInfo`).d('联系人信息'),
          dataIndex: 'shipToThirdPartyContact',
          align: 'center',
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.priceUomName`).d('价格单位'),
          dataIndex: 'priceUomCodeName',
          align: 'center',
        },
        {
          title: intl
            .get(`sodr.orderRelease.model.orderRelease.priceUomConversion`)
            .d('单位转换关系'),
          dataIndex: 'priceUomConversion',
          align: 'center',
        },
        {
          title: intl.get(`sodr.orderRelease.model.orderRelease.frozenFlag`).d('冻结状态'),
          dataIndex: 'frozenFlag',
          align: 'center',
          render: (text) =>
            intl
              .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
              .d(text === 1 ? '是' : '否'),
        },
      ],
      dataSource,
      pagination,
      loading: processing,
      bordered: true,
      onChange,
      scroll: { x: 2600 },
    };
    return <Table {...tableProps} />;
  }
}
