import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { sum, isNumber, isNil } from 'lodash';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';
import { showBigNumber } from '../components/utils';

const messagePrompt = 'sinv.common.model.common';

/**
 * 接收事务入口界面
 *
 * @export
 * @class List - 列表组价
 * @extends {Component} - React.Component
 * @reactProps {boolean} loading - 数据加载状态
 * @reactProps {object} tableData - 列表数据源
 * @reactProps {object} pagination - 列表分页信息
 * @reactProps {object} rowSelection - 选择行对象
 * @reactProps {function} onChange - 分页查询
 * @returns React.element
 */
export default class List extends Component {
  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  @Bind()
  showUomText(record) {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  @Bind()
  getColumns(receiveOrderType) {
    // const { receiveOrderType } = this.props;
    const columns = {
      order: [
        {
          title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
          dataIndex: 'displayPoNum',
          width: 180,
          fixed: 'left',
        },
        {
          title: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
          dataIndex: 'lineNum',
        },
        {
          title: intl.get(`${messagePrompt}.poTypeCodeMeaning`).d('订单类型'),
          dataIndex: 'poTypeCodeMeaning',
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
          title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          render: (_val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`sinv.common.model.common.shippedQuantitys`).d('需求数量'),
          dataIndex: 'shippedQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.canPackagesNumber`).d('可收货数量'),
          dataIndex: 'canReceiveQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.invOrganizationName`).d('收货组织'),
          dataIndex: 'invOrganizationName',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.inventoryName`).d('收货库房'),
          dataIndex: 'inventoryName',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.locationNames`).d('收货库位'),
          dataIndex: 'locationName',
          width: 120,
        },
        {
          title: intl
            .get(`sinv.purchaseReception.view.message.shipToLocationAddress`)
            .d('收货地点'),
          dataIndex: 'shipToLocationAddress',
          width: 180,
        },
        {
          title: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
          dataIndex: 'agentName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
          dataIndex: 'productNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
          dataIndex: 'productName',
          width: 180,
        },
        {
          title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
          dataIndex: 'catalogName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
          dataIndex: 'contactInfo',
          width: 120,
        },
        {
          title: intl.get(`entity.supplier.tag`).d('供应商'),
          dataIndex: 'supplierCompanyName',
          width: 180,
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
          dataIndex: 'displayReleaseNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
          dataIndex: 'versionNum',
          width: 120,
        },
      ],
      delivery: [
        {
          title: intl.get(`sinv.purchaseReception.view.message.asnNum`).d('送货单号'),
          dataIndex: 'asnNum',
          width: 180,
          fixed: 'left',
        },
        {
          title: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
          dataIndex: 'asnLineNum',
        },
        {
          title: intl.get(`${messagePrompt}.asnTypeCode`).d('送货单类型'),
          dataIndex: 'asnTypeCodeMeaning',
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
          title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          render: (_val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`sinv.common.model.common.shipQuantity`).d('发货数量'),
          dataIndex: 'shipQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.canReceiveQuantity`).d('可接收数量'),
          dataIndex: 'canReceiveQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
          dataIndex: 'displayPoNum',
          width: 180,
        },
        {
          title: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
          dataIndex: 'displayReleaseNum',
          width: 120,
        },
        {
          title: intl.get(`${messagePrompt}.displayLineNum`).d('订单行号'),
          dataIndex: 'lineNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
          dataIndex: 'versionNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间'),
          dataIndex: 'expectedArriveDate',
          width: 180,
          render: (text) => (text ? moment(text).format(DEFAULT_DATETIME_FORMAT) : null),
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.invOrganizationName`).d('收货组织'),
          dataIndex: 'invOrganizationName',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.inventoryName`).d('收货库房'),
          dataIndex: 'inventoryName',
          width: 120,
        },
        {
          title: intl
            .get(`sinv.purchaseReception.view.message.shipToLocationAddress`)
            .d('收货地点'),
          dataIndex: 'shipToLocationAddress',
          width: 180,
        },
        {
          title: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
          dataIndex: 'agentName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
          dataIndex: 'productNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
          dataIndex: 'productName',
          width: 180,
        },
        {
          title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
          dataIndex: 'catalogName',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.deliverTime`).d('妥投时间'),
          dataIndex: 'deliverTime',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
          dataIndex: 'contactInfo',
          width: 120,
        },
        {
          title: intl.get(`entity.supplier.tag`).d('供应商'),
          dataIndex: 'supplierName',
          width: 180,
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          width: 120,
        },
      ],
    };
    if (receiveOrderType === 'ASN') {
      return columns.delivery;
    } else {
      return columns.order;
    }
  }

  render() {
    const {
      loading,
      tableData,
      pagination,
      rowSelection,
      onChange,
      customizeTable,
      receiveOrderType,
    } = this.props;
    const columns = this.getColumns(receiveOrderType);
    const tableProps = {
      loading,
      bordered: true,
      columns,
      dataSource: tableData,
      pagination,
      rowSelection,
      onChange: (page) => onChange(page),
      rowKey: receiveOrderType === 'ASN' ? 'asnLineId' : 'poLineLocationId',
    };
    tableProps.scroll = {
      x: sum(tableProps.columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 240,
    };
    // return customizeTable(
    //   {
    //     code: 'SINV.PURCHASE_RECEPTION.LIST',
    //   },
    //   <Table {...tableProps} key={receiveOrderType === 'ASN' ? 'asnLineId' : 'poLineLocationId'} />
    // );
    return (
      <>
        {receiveOrderType === 'ASN' &&
          customizeTable(
            {
              code: 'SINV.PURCHASE_RECEPTION.LIST',
            },
            <Table {...tableProps} />
          )}
        {receiveOrderType === 'ORDER' && <Table {...tableProps} />}
      </>
    );
  }
}
