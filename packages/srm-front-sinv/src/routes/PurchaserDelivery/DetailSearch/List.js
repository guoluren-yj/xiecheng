/*
 * List - 采购方送货单行查询列表
 * @date: 2018/11/12 16:55:04
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Tag } from 'hzero-ui';
import { sum, isNumber, isNil, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import { showRecordModal } from '@/routes/components/CustomSpecsModal';
import intl from 'utils/intl';
// import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import UploadModal from '_components/Upload';
import moment from 'moment';
import { showBigNumber } from '@/routes/components/utils';
import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import { handleRelation } from '../utils/index';

/**
 * 采购方送货单行查询列表
 * @extends {PureComponent} - React.PureComponent
 * @return React.element
 */
window.moment = moment; // 平台cuz升级移除了moment，需要在本地代码加
export default class List extends PureComponent {
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
  handleToDetail({ asnHeaderId }) {
    if (isFunction(this.props.onToDetail)) {
      this.props.onToDetail(asnHeaderId);
    }
  }

  render() {
    const {
      loading,
      history,
      dataSource = [],
      searchPaging,
      pagination = {},
      rowSelection,
      customizeTable,
      openBOMModal = (e) => e,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
        dataIndex: 'asnNum',
        width: 150,
        fixed: 'left',
        render: (value, record) => <a onClick={() => this.handleToDetail(record)}>{value}</a>,
      },
      {
        title: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
        dataIndex: 'displayAsnLineNum',
        width: 70,
        fixed: 'left',
        sorter: true,
      },
      {
        title: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
        dataIndex: 'asnTypeCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 110,
        sorter: true,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.cancelledFlag`).d('已取消'),
        dataIndex: 'cancelledFlag',
        width: 80,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sinv.common.model.common.closedFlag`).d('已关闭'),
        dataIndex: 'closedFlag',
        width: 80,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 80,
      },
      {
        title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
        dataIndex: 'displaylineNum',
        width: 110,
      },
      {
        title: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 70,
      },
      {
        title: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
        dataIndex: 'versionNum',
        width: 70,
      },
      {
        title: intl.get(`sinv.purchaserDelivery.model.purchaserDelivery.asnStatus`).d('送货单状态'),
        dataIndex: 'asnStatusMeaning',
        width: 130,
      },
      {
        title: intl.get(`sinv.common.model.common.shipQuantity`).d('发货数量'),
        dataIndex: 'shipQuantity',
        width: 110,
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
        width: 110,
      },
      {
        title: intl.get(`sinv.common.model.common.receiveQuantity`).d('已接收'),
        dataIndex: 'receiveQuantity',
        width: 80,
        render: (value) => showBigNumber(value),
      },
      // {
      //   title: intl.get(`sinv.common.model.common.inTransit`).d('在途'),
      //   dataIndex: 'inWayQuantity',
      //   width: 80,
      // },
      {
        title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
        render: (_val, record) => this.showUomText(record, 'uom'),
      },
      {
        title: intl.get(`sinv.common.model.common.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
        dataIndex: 'shipDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间'),
        dataIndex: 'expectedArriveDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.promisedDate`).d('承诺日期'),
        dataIndex: 'promisedDate',
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
        width: 150,
      },
      {
        title: intl.get(`sinv.purchaseReception.view.message.invOrganization`).d('收货组织'),
        dataIndex: 'organizationName',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
        dataIndex: 'shipToLocationAddress',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.purOrganizationName`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        width: 180,
      },
      {
        title: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 80,
      },
      {
        title: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
        dataIndex: 'contactInfo',
        width: 80,
      },
      {
        title: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
        dataIndex: 'lotNum',
        width: 80,
      },
      {
        title: intl.get(`sinv.common.model.common.productionDate`).d('生产日期'),
        dataIndex: 'productionDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.purchaseReception.message.shelfLife`).d('保质期'),
        dataIndex: 'shelfLife',
        width: 80,
      },
      {
        title: intl.get(`sinv.purchaseReception.message.lotExpirationDate`).d('批次有效期'),
        dataIndex: 'lotExpirationDate',
        render: dateRender,
        width: 140,
      },
      {
        title: intl.get(`sinv.common.model.common.unitPackageQuantity`).d('单包装数'),
        dataIndex: 'unitPackageQuantity',
        width: 110,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.packageQuantity`).d('件数'),
        dataIndex: 'packageQuantity',
        width: 80,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.remainderQuantity`).d('尾数'),
        dataIndex: 'remainderQuantity',
        width: 80,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.serialNum`).d('序列号'),
        dataIndex: 'serialNum',
        width: 80,
      },
      {
        title: intl.get(`sinv.common.model.common.invoiceNum`).d('发票号'),
        dataIndex: 'invoiceNum',
        width: 80,
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
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
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
        dataIndex: 'catalogName',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.oldItemCode`).d('旧物料号'),
        dataIndex: 'oldItemCode',
        width: 110,
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
          <div>
            <a onClick={() => this.attachmentUuidList(val, record)}>
              {intl.get(`sinv.common.model.common.attachmentUuidManage`).d('附件管理')}
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
          </div>
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
      {
        title: intl.get(`sinv.common.model.common.relationDanju`).d('关联单据'),
        dataIndex: 'relation',
        width: 150,
        render: (_, record) => (
          <a onClick={() => handleRelation({ asnLineId: record.asnLineId, history })}>
            {intl.get(`sinv.common.model.common.relationDanju`).d('关联单据')}
          </a>
        ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollY = 'calc(100vh - 400px)';
    return customizeTable(
      {
        code: 'SINV.PURCHASER_DELIVERY_LIST.GRID_BY_DETAIL',
      },
      <Table
        rowSelection={rowSelection}
        loading={loading}
        rowKey="asnLineId"
        bordered
        scroll={{
          x: scrollX,
          y: scrollY,
        }}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page, _, sorter) => searchPaging(page, _, sorter)}
      />
    );
  }
}
