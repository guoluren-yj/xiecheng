/*
 * materiallInfoList - 送货单审批详情物料信息列表
 * @date: 2018/11/12 16:45:42
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Tag } from 'hzero-ui';
import { sum, isNumber, isNil } from 'lodash';
import ImageList from '@/routes/components/ImageList';
import intl from 'utils/intl';
import UploadModal from '_components/Upload';
import { Bind } from 'lodash-decorators';
import { dateRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import { showBigNumber } from '@/routes/components/utils';

export default class MaterialInfoList extends PureComponent {
  defaultTableRowKey = 'asnLineId';

  /**
   *
   * attachmentUuid - 附件的uuid
   * @memberof MaterialInfoList
   */
  @Bind()
  handleAttachmentView(attachmentUuid) {
    const { handleAttachmentModal } = this.props;
    if (handleAttachmentModal) {
      handleAttachmentModal(attachmentUuid);
    }
  }

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

  render() {
    const {
      dataSource = [],
      pagination,
      loading,
      onChange = (e) => e,
      customizeTable,
      openBOMModal = (e) => e,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
        dataIndex: 'displayAsnLineNum',
        width: 100,
        fixed: 'left',
        sorter: true,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 140,
        fixed: 'left',
        sorter: true,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.supplierItemNum`).d('供应商料号'),
        dataIndex: 'supplierItemNum',
        width: 110,
      },
      {
        title: intl.get(`sinv.common.model.common.suppliesNumDescription`).d('供应商料号描述'),
        dataIndex: 'supplierItemDesc',
        width: 130,
      },
      {
        title: intl.get(`sinv.common.model.common.quantity`).d('订单数量'),
        dataIndex: 'quantity',
        width: 100,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.canShipQuantity`).d('可发货'),
        dataIndex: 'canShipQuantity',
        width: 100,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
        render: (_val, record) => this.showUomText(record, 'uom'),
      },
      {
        title: intl.get(`sinv.common.model.common.theShipQuantity`).d('本次发货'),
        dataIndex: 'shipQuantity',
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
        title: intl.get(`sinv.common.model.common.unitPackageQuantity`).d('单包装数'),
        dataIndex: 'unitPackageQuantity',
        width: 100,
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
        title: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
        dataIndex: 'lotNum',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.productionDate`).d('生产日期'),
        dataIndex: 'productionDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.purchaseReception.message.shelfLife`).d('保质期'),
        dataIndex: 'shelfLife',
        width: 100,
        // render: dateRender,
      },
      {
        title: intl.get(`sinv.purchaseReception.message.lotExpirationDate`).d('批次有效期'),
        dataIndex: 'lotExpirationDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.serialNum`).d('序列号'),
        dataIndex: 'serialNum',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.invoiceNum`).d('发票号'),
        dataIndex: 'invoiceNum',
        width: 120,
      },

      {
        title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
        dataIndex: 'displayLineNum',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
        dataIndex: 'versionNum',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.promiseDeliveryDate`).d('承诺交货日期'),
        dataIndex: 'promisedDate',
        width: 120,
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
        title: intl.get(`sinv.common.model.common.productionOrderNum`).d('生产工单号'),
        dataIndex: 'productionOrderNum',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
        dataIndex: 'contactInfo',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
        dataIndex: 'productNum',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
        dataIndex: 'productName',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
        dataIndex: 'catalogName',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.purchaseRemark`).d('采购方行备注'),
        dataIndex: 'purchaseRemark',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common..otherLineAttachmentUuid`).d('采购方行附件'),
        dataIndex: 'approveAttachmentUuid',
        width: 130,
        render: (val, record) => (
          <a onClick={() => this.attachmentUuidList(val, record)}>
            {intl.get(`entity.attachment.upload`).d('附件上传')}
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
          </a>
        ),
      },
      {
        title: intl.get(`sinv.common.model.common.suppliersRemark`).d('供应商备注'),
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
        title: intl.get(`sinv.common.model.common.attachmentUrlList`).d('图片附件'),
        dataIndex: 'attachmentUrlList',
        width: 100,
        render: (v) => {
          return <ImageList imageDTO={v || []} />;
        },
      },
    ].map((item) => ({
      ...item,
      // title: <div style={{ textAlign: (item.align && item.align) || 'left' }}>{item.title}</div>,
    }));
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      rowKey: this.defaultTableRowKey,
      columns,
      dataSource,
      pagination,
      loading,
      bordered: true,
      onChange,
      scroll: {
        x: scrollX >= 1200 ? scrollX : false,
        y: 'calc(100vh - 400px)',
      },
    };
    return customizeTable(
      {
        code: 'SINV.DELIVERY_APPROVED_DETAIL.BASIC',
      },
      <EditTable {...tableProps} />
    );
  }
}
