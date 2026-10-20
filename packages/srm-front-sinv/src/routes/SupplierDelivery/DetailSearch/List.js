/*
 * List - 供应商送货单行查询列表
 * @date: 2018/11/12 16:55:04
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Tooltip, Tag } from 'hzero-ui';
import { sum, isNumber, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { showRecordModal } from '@/routes/components/CustomSpecsModal';
import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import UploadModal from '_components/Upload';
import { showBigNumber } from '@/routes/components/utils';

/**
 * 供应商送货单行查询列表
 * @extends {Component} - React.Component
 * @return React.element
 */
const commonModelPrompt = 'sinv.common.model.common';

export default class List extends Component {
  @Bind()
  attachmentUuidList(val, record) {
    const { attachmentUuidList } = this.props;
    attachmentUuidList(val, record);
  }

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   * @param {string} uomType -单位类型
   */
  @Bind()
  showUomText(record, uomType) {
    let _code;
    let _name;
    let text;
    const { unitCodeIsShow } = record;
    if (uomType === 'weightUom') {
      _code = record.weightUomCode;
      _name = record.weightUomName;
    } else if (uomType === 'uom') {
      _code = record.uomCode;
      _name = record.uomName;
    }
    text = _name && _code ? <span>{`${_code}/${_name}`}</span> : _name;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && _code && _name ? `${_code}/${_name}` : _name;
    }
    return text;
  }

  /**
   * 跳转到详情页
   * @param {Number} { asnHeaderId }
   */
  @Bind()
  handleToDetail({ asnHeaderId, printStatusFlag }) {
    if (this.props.onToDetail) {
      this.props.onToDetail(asnHeaderId, printStatusFlag);
    }
  }

  render() {
    const {
      loading,
      searchPaging,
      rowSelection,
      pagination = {},
      dataSource = [],
      customizeTable,
      openBOMModal = (e) => e,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
        dataIndex: 'asnNum',
        align: 'left',
        width: 150,
        render: (value, record) => <a onClick={() => this.handleToDetail(record)}>{value}</a>,
      },
      {
        title: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
        dataIndex: 'displayAsnLineNum',
        width: 70,
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
        dataIndex: 'asnTypeCodeMeaning',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.customerItemCode`).d('客户物料编码'),
        dataIndex: 'itemCode',
        width: 140,
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.customerItemName`).d('客户物料名称'),
        dataIndex: 'itemName',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.cancelledFlag`).d('已取消'),
        dataIndex: 'cancelledFlag',
        align: 'left',
        width: 80,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sinv.common.model.common.closedFlag`).d('已关闭'),
        dataIndex: 'closedFlag',
        align: 'left',
        width: 80,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}.displayReleaseNum`).d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 80,
        align: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}.displayLineNum`).d('订单行号'),
        dataIndex: 'displaylineNum',
        width: 90,
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 70,
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
        dataIndex: 'versionNum',
        width: 70,
        align: 'left',
      },
      {
        title: intl.get(`sinv.supplierDelivery.model.supplierDelivery.asnStatus`).d('送货单状态'),
        dataIndex: 'asnStatusMeaning',
        align: 'left',
        width: 120,
      },
      {
        title: intl.get(`${commonModelPrompt}.shipQuantity`).d('发货数量'),
        dataIndex: 'shipQuantity',
        align: 'left',
        width: 100,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.grossWeight`).d('毛重'),
        dataIndex: 'grossWeightStandard',
        width: 120,
        align: 'right',
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.netWeight`).d('净重'),
        dataIndex: 'netWeightStandard',
        width: 120,
        align: 'right',
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.weightUomId`).d('重量单位'),
        dataIndex: 'weightUomName',
        width: 120,
        render: (_val, record) => this.showUomText(record, 'weightUom'),
      },
      {
        title: intl.get(`sinv.common.model.common.receiveStatus`).d('接收状态'),
        dataIndex: 'receiveStatusMeaning',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.receiveQuantity`).d('已接收'),
        dataIndex: 'receiveQuantity',
        align: 'left',
        width: 80,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
        dataIndex: 'uomName',
        align: 'left',
        width: 80,
        render: (_val, record) => this.showUomText(record, 'uom'),
      },
      {
        title: intl.get(`sinv.common.model.common.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        align: 'left',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
        dataIndex: 'shipDate',
        align: 'left',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间'),
        dataIndex: 'expectedArriveDate',
        align: 'left',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        align: 'left',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${commonModelPrompt}.promisedDate`).d('承诺日期'),
        dataIndex: 'promisedDate',
        align: 'left',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.inventoryName`).d('库房'),
        dataIndex: 'inventoryName',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.locationName`).d('库位'),
        dataIndex: 'locationName',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.shipAddress`).d('发货地点'),
        dataIndex: 'supplierSiteName',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}.organizationName`).d('收货组织'),
        dataIndex: 'organizationName',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}.shipToLocationAddress`).d('收货地点'),
        dataIndex: 'shipToLocationAddress',
        width: 120,
        render: (val) => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
        align: 'left',
      },
      // {
      //   title: intl.get(`sinv.common.model.common.purOrganizationName`).d('采购组织'),
      //   dataIndex: 'purOrganizationName',
      //   width: 180,
      // },
      {
        title: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}.contactor`).d('联系人'),
        dataIndex: 'contactInfo',
        width: 80,
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
        dataIndex: 'lotNum',
        width: 80,
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.productionDate`).d('生产日期'),
        dataIndex: 'productionDate',
        align: 'left',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.shelfLife`).d('保质期'),
        dataIndex: 'shelfLife',
        width: 80,
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.lotExpirationDate`).d('批次有效期'),
        dataIndex: 'lotExpirationDate',
        width: 150,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`${commonModelPrompt}.unitPackageQuantity`).d('单包装数'),
        dataIndex: 'unitPackageQuantity',
        align: 'left',
        width: 120,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.packageQuantity`).d('件数'),
        dataIndex: 'packageQuantity',
        align: 'left',
        width: 80,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.remainderQuantity`).d('尾数'),
        dataIndex: 'remainderQuantity',
        align: 'left',
        width: 80,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.serialNum`).d('序列号'),
        dataIndex: 'serialNum',
        width: 80,
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.invoiceNum`).d('发票号'),
        dataIndex: 'invoiceNum',
        width: 80,
        align: 'left',
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get(`entity.customer.tag`).d('客户'),
        dataIndex: 'companyName',
        width: 180,
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
        dataIndex: 'productNum',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
        dataIndex: 'productName',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
        dataIndex: 'catalogName',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.oldItemCode`).d('旧物料号'),
        dataIndex: 'oldItemCode',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'supplierItemCode',
        width: 160,
        align: 'left',
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'supplierItemName',
        width: 160,
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.purchaseRemark`).d('采购方行备注'),
        dataIndex: 'purchaseRemark',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.otherLineAttachmentUuid`).d('采购方行附件'),
        dataIndex: 'approveAttachmentUuid',
        width: 130,
        render: (val, record) => (
          <a onClick={() => this.attachmentUuidList(val, record)}>
            {intl.get(`sinv.common.model.common.attachmentUuid`).d('附件查看')}
            {
              <Tag
                // color="#108ee9"
                style={{
                  height: 'auto',
                  lineHeight: '15px',
                  marginLeft: '4px',
                }}
              >
                {record?.picNums ?? 0}
              </Tag>
            }
          </a>
        ),
      },
      {
        title: intl.get(`sinv.common.model.common.supplierRemark`).d('供应商行备注'),
        dataIndex: 'supplierRemark',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.lineAttachmentUuid`).d('行附件'),
        dataIndex: 'attachmentUuid',
        width: 130,
        render: (value, record) => (
          <UploadModal
            bucketName="private-bucket"
            bucketDirectory="sodr-order"
            attachmentUUID={record.attachmentUuid}
            viewOnly
            icon={false}
          />
        ),
      },
      {
        title: intl.get(`sinv.common.model.common.bom`).d('外协BOM'),
        dataIndex: 'bom',
        width: 120,
        render: (val, record) => (
          <a onClick={() => openBOMModal(val, record)}>
            {intl.get(`hzero.common.button.view`).d('查看')}
          </a>
        ),
      },
      {
        title: intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性'),
        dataIndex: 'customSpecsJson',
        width: 120,
        render: (v) => {
          return (
            <a onClick={() => showRecordModal(v ? JSON.parse(v) : [])}>
              {intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性')}
            </a>
          );
        },
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollY = 'calc(100vh - 400px)';
    return customizeTable(
      {
        code: 'SINV.SUPPLIER_DELIVERY_LIST.GRID_BY_DETAIL',
      },
      <Table
        bordered
        rowSelection={rowSelection}
        loading={loading}
        rowKey="asnLineId"
        scroll={{
          x: scrollX,
          y: scrollY,
        }}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={searchPaging}
      />
    );
  }
}
