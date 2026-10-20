/*
 * BasicInfoList - 送货单tabs基本信息
 * @date: 2018/11/14 14:58:31
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyleft Copyleft (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isNil } from 'lodash';
import ImageList from '@/routes/components/ImageList';
import intl from 'utils/intl';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import UploadModal from '_components/Upload';
import EditTable from 'components/EditTable';
import { showRecordModal } from '@/routes/components/CustomSpecsModal';
import { showBigNumber } from '@/routes/components/utils';

const commonModelPrompt = 'sinv.common.model.common';

export default class BasicInfoList extends PureComponent {
  defaultTableRowKey = 'asnLineId';

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
   * handleOnChange - 表格切换事件
   * @param {!object} e - 事件对象
   */
  @Bind()
  handleOnChange(page, _, sorter) {
    const { onSearch = (e) => e } = this.props;
    onSearch(page, sorter);
  }

  /**
   * 获取列
   * @param {String} activeKey
   * @returns
   * @memberof BasicInfoList
   */
  @Bind()
  getColumns(activeKey) {
    const { openBOMModal = (e) => e, remote, headerInfo } = this.props;
    const defaultColumns = [
      {
        title: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
        dataIndex: 'asnLineNum',
        align: 'left',
        width: 100,
        fixed: 'left',
        sorter: true,
      },
      {
        title: intl.get(`sinv.common.model.common.customerItemCode`).d('客户物料编码'),
        dataIndex: 'itemCode',
        align: 'left',
        width: 110,
        fixed: 'left',
        sorter: true,
      },
      {
        title: intl.get(`${commonModelPrompt}.categoryId`).d('物料品类'),
        dataIndex: 'categoryName',
        width: 110,
        fixed: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.customerItemName`).d('客户物料名称'),
        dataIndex: 'itemName',
        align: 'left',
        width: 110,
        fixed: 'left',
      },
    ];
    const dynamicColumns = new Map([
      [
        'basicInfo',
        [
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
            title: intl.get(`sinv.common.model.common.cancelledFlag`).d('已取消'),
            dataIndex: 'cancelledFlag',
            align: 'left',
            width: 70,
            render: yesOrNoRender,
          },
          {
            title: intl.get(`sinv.common.model.common.closedFlag`).d('已关闭'),
            dataIndex: 'closedFlag',
            align: 'left',
            width: 70,
            render: yesOrNoRender,
          },
          {
            title: intl.get(`sinv.common.model.common.sendQuantity`).d('发货数量'),
            dataIndex: 'shipQuantity',
            align: 'left',
            width: 120,
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
            title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
            dataIndex: 'uomName',
            width: 60,
            align: 'left',
            render: (_val, record) => this.showUomText(record, 'uom'),
          },
          {
            title: intl.get(`sinv.common.model.common.receiveStatus`).d('接收状态'),
            dataIndex: 'receiveStatusMeaning',
            align: 'left',
            width: 90,
          },
          {
            title: intl.get(`sinv.common.model.common.receiveQuantity`).d('已接收'),
            dataIndex: 'receiveQuantity',
            align: 'left',
            width: 70,
            render: (value) => showBigNumber(value),
          },
          {
            title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
            dataIndex: 'displayPoNum',
            width: 70,
            align: 'left',
          },
          {
            title: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
            dataIndex: 'displayReleaseNum',
            width: 70,
            align: 'left',
          },
          {
            title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
            dataIndex: 'displayLineNum',
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
            title: intl.get(`sinv.common.model.common.batchNo`).d('采购批次'),
            dataIndex: 'batchNo',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
            dataIndex: 'lotNum',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
            dataIndex: 'neededDate',
            align: 'left',
            width: 100,
            render: dateRender,
          },
          {
            title: intl.get(`${commonModelPrompt}.promisedDate`).d('承诺日期'),
            dataIndex: 'promisedDate',
            align: 'left',
            width: 120,
            render: dateRender,
          },
          {
            title: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
            dataIndex: 'purchaseAgentName',
            width: 100,
            align: 'left',
          },
          {
            title: intl.get(`sinv.common.model.common.inventoryName`).d('库房'),
            dataIndex: 'inventoryName',
            width: 100,
            align: 'left',
          },
          {
            title: intl.get(`sinv.common.model.common.locationName`).d('库位'),
            dataIndex: 'locationName',
            width: 100,
            align: 'left',
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
            width: 70,
            align: 'left',
          },
          {
            title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
            dataIndex: 'productNum',
            align: 'left',
            width: 190,
          },
          {
            title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
            dataIndex: 'productName',
            align: 'left',
            width: 90,
          },
          {
            title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
            dataIndex: 'catalogName',
            align: 'left',
            width: 90,
          },
          {
            title: intl.get(`sinv.common.model.common.purchaseRemark`).d('采购方行备注'),
            dataIndex: 'purchaseRemark',
            width: 110,
            align: 'left',
          },
          {
            title: intl.get(`${commonModelPrompt}.otherLineAttachmentUuid`).d('采购方行附件'),
            dataIndex: 'attachmentUuid',
            width: 130,
            render: (val, record) => {
              return (
                <a onClick={() => this.attachmentUuidList(val, record)}>
                  {intl.get(`sinv.common.model.common.attachmentUuid`).d('附件查看')}
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
              );
            },
          },
          {
            title: intl.get(`${commonModelPrompt}.supplierRemark`).d('供应商行备注'),
            dataIndex: 'supplierRemark',
            align: 'left',
            width: 110,
          },
          {
            title: intl.get(`entity.attachment.tag`).d('附件'),
            dataIndex: 'tag',
            width: 110,
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
            title: intl.get(`sinv.common.model.common.attachmentUrlList`).d('图片附件'),
            dataIndex: 'attachmentUrlList',
            width: 100,
            render: (v) => {
              return <ImageList imageDTO={v || []} />;
            },
          },
        ],
      ],
      [
        'otherInfo',
        [
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
            align: 'left',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.lotExpirationDate`).d('批次有效期'),
            dataIndex: 'lotExpirationDate',
            align: 'left',
            width: 150,
            render: dateRender,
          },
          {
            title: intl.get(`${commonModelPrompt}.unitPackageQuantity`).d('单包装数'),
            dataIndex: 'unitPackageQuantity',
            align: 'left',
            width: 110,
            render: (value) => showBigNumber(value),
          },
          {
            title: intl.get(`sinv.common.model.common.packageQuantity`).d('件数'),
            dataIndex: 'packageQuantity',
            align: 'left',
            width: 60,
            render: (value) => showBigNumber(value),
          },
          {
            title: intl.get(`sinv.common.model.common.remainderQuantity`).d('尾数'),
            dataIndex: 'remainderQuantity',
            align: 'left',
            width: 110,
            render: (value) => showBigNumber(value),
          },
          {
            title: intl.get(`sinv.common.model.common.serialNum`).d('序列号'),
            dataIndex: 'serialNum',
            width: 100,
          },
          {
            title: intl.get(`sinv.common.model.common.invoiceNum`).d('发票号'),
            dataIndex: 'invoiceNum',
            width: 90,
          },
          {
            title: intl.get(`sinv.common.model.common.oldItemCode`).d('旧物料号'),
            dataIndex: 'oldItemCode',
            width: 90,
          },
          {
            title: intl.get(`entity.item.code`).d('物料编码'),
            dataIndex: 'supplierItemCode',
            width: 110,
          },
          {
            title: intl.get(`entity.item.name`).d('物料名称'),
            dataIndex: 'supplierItemName',
            width: 110,
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
        ],
      ],
    ]);
    const preColumns = defaultColumns.concat(dynamicColumns.get(activeKey) || []);
    return remote
      ? remote.process('SINV_SUPPLIER_REMOTE_PROCESS_BASIC_COLUMN', preColumns, {
          activeKey,
          headerInfo,
        })
      : preColumns;
  }

  render() {
    const { dataSource = [], processing, activeKey, pagination, customizeTable } = this.props;
    const columns = this.getColumns(activeKey);
    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0))) + 200;
    const code =
      activeKey === 'basicInfo'
        ? 'SINV.SUPPLIER_DELIVERY.DETAIL.BASIC'
        : 'SINV.SUPPLIER_DELIVERY.DETAIL.OTHER';
    const tableProps = {
      columns,
      dataSource,
      onChange: this.handleOnChange,
      pagination,
      loading: processing,
      bordered: true,
      scroll: {
        x: scrollX,
        y: 'calc(100vh - 400px)',
      },
      rowKey: this.defaultTableRowKey,
    };
    return customizeTable(
      {
        code,
      },
      <EditTable {...tableProps} />
    );
  }
}
