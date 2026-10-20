/**
 * List - 我发出的订单 - 明细页面表格
 * @date: 2018-10-24
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { sum, isNumber, isNil } from 'lodash';
// import { Table } from 'hzero-ui';
import { Tag } from 'hzero-ui';
import intl from 'utils/intl';
import UploadModal from '_components/Upload';
import { Bind } from 'lodash-decorators';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import ImageList from '@/routes/components/ImageList';
import { showBigNumber } from '@/routes/components/utils';

/**
 * List - 业务组件 - 我发送的订单
 * @extends {Component} - React.Component
 * @reactProps {!Object} [processing={}] - dispatch处理过程
 * @reactProps {Array<Object>} [dataSource=[]] - 数据源
 * @reactProps {object} [pagination={}]
 * @reactProps {function} [assignDataSource= (e => e)] - 合并数据
 * @reactProps {function} [openBOMModal= (e => e)] 打开BOM
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @return React.element
 */
export default class DetailList extends PureComponent {
  @Bind()
  attachmentUuidList(val, record) {
    const { attachmentUuidList } = this.props;
    attachmentUuidList(val, record);
  }

  @Bind()
  handleleadType(record) {
    const { handleleadType } = this.props;
    if (handleleadType) {
      handleleadType(true, record);
    }
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
   * getColumns - 组装columns
   * @param {!string} currentTabKey - tab 切换key
   */
  getColumns(currentTabKey) {
    const { openBOMModal = (e) => e } = this.props;
    const defaultColumns = [
      {
        title: intl.get(`sinv.common.model.deliveryCanceled.lineCancelStatus`).d('行取消导入状态'),
        dataIndex: 'cancelSyncStatusMeaning',
        fixed: 'left',
        width: 120,
        render: (val, record) => {
          return (
            <a onClick={() => this.handleleadType(record)}>
              {intl.get(`sinv.common.model.common.leadTypeRecord`).d('查看')}
            </a>
          );
        },
      },
      {
        title: intl.get(`sinv.common.model.closeSyncResponseMsg`).d('反馈信息'),
        dataIndex: 'cancelSyncResponseMsg',
        fixed: 'left',
        width: 180,
      },
      {
        title: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
        dataIndex: 'displayAsnLineNum',
        width: 100,
        fixed: 'left',
        sorter: true,
      },
      {
        title: intl.get(`sinv.common.model.common.customerItemCode`).d('客户物料编码'),
        dataIndex: 'itemCode',
        width: 140,
        fixed: 'left',
        sorter: true,
      },
      {
        title: intl.get(`sinv.common.model.common.customerItemName`).d('客户物料名称'),
        dataIndex: 'itemName',
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
            width: 80,
            render: (value) => yesOrNoRender(value),
          },
          {
            title: intl.get(`sinv.common.model.common.closedFlag`).d('已关闭'),
            dataIndex: 'closedFlag',
            width: 80,
            render: (value) => yesOrNoRender(value),
          },
          {
            title: intl.get(`sinv.common.model.common.shipQuantity`).d('发货数量'),
            dataIndex: 'shipQuantity',
            width: 100,
            render: (value) => showBigNumber(value),
          },
          {
            title: intl.get(`sinv.common.model.common.grossWeight`).d('毛重'),
            dataIndex: 'grossWeightStandard',
            width: 120,
            align: 'right',
          },
          {
            title: intl.get(`sinv.common.model.common.netWeight`).d('净重'),
            dataIndex: 'netWeightStandard',
            width: 120,
            align: 'right',
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
            width: 100,
            render: (_val, record) => this.showUomText(record, 'uom'),
          },
          {
            title: intl.get(`sinv.common.model.common.receiveStatus`).d('接收状态'),
            dataIndex: 'receiveStatusMeaning',
            width: 100,
          },
          {
            title: intl.get(`sinv.common.model.common.receiveQuantity`).d('已接收'),
            dataIndex: 'receiveQuantity',
            width: 100,
            render: (value) => showBigNumber(value),
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
            width: 120,
            render: dateRender,
          },
          {
            title: intl.get(`sinv.common.model.common.promisedDate`).d('承诺日期'),
            dataIndex: 'promisedDate',
            width: 120,
            render: dateRender,
          },
          {
            title: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
            dataIndex: 'agentName',
            width: 100,
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
          },
          {
            title: intl.get(`sinv.common.model.common.otherLineAttachmentUuid`).d('采购方行附件'),
            dataIndex: 'approveAttachmentUuid',
            width: 130,
            render: (val, record) => (
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
            ),
          },
          {
            title: intl.get(`sinv.common.model.common.supplierRemark`).d('供应商行备注'),
            dataIndex: 'supplierRemark',
            width: 150,
          },
          {
            title: intl.get(`sinv.common.model.common.attachmentUuid`).d('附件查看'),
            dataIndex: 'attachmentUuid',
            width: 130,
            render: (val, record) => (
              <UploadModal
                bucketName="private-bucket"
                bucketDirectory="sodr-order"
                attachmentUUID={record.attachmentUuid}
                icon={false}
                viewOnly
              />
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
        ],
      ],
      [
        'otherInfo',
        [
          {
            title: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
            dataIndex: 'lotNum',
            width: 120,
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
          },
          {
            title: intl.get(`sinv.purchaseReception.message.lotExpirationDate`).d('批次有效期'),
            dataIndex: 'lotExpirationDate',
            width: 100,
            render: dateRender,
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
            title: intl.get(`sinv.common.model.common.oldItemCode`).d('旧物料号'),
            dataIndex: 'oldItemCode',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.myItemCode`).d('我的物料编码'),
            dataIndex: 'myItemCode',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.myItemName`).d('我的物料名称'),
            dataIndex: 'myItemName',
            width: 120,
          },
          {
            title: intl.get(`sinv.common.model.common.commonName`).d('通用名'),
            dataIndex: 'commonName',
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
    return defaultColumns.concat(dynamicColumns.get(currentTabKey) || []);
  }

  /**
   * handleOnChange - 表格切换事件
   * @param {!object} e - 事件对象
   */
  @Bind()
  handleOnChange(page, _, sorter) {
    const { onSearch = (e) => e } = this.props;
    onSearch(page, _, sorter);
  }

  render() {
    const {
      currentTabKey,
      loading,
      dataSource,
      pagination,
      rowSelection,
      customizeTable,
    } = this.props;
    const columns = this.getColumns(currentTabKey);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 200;
    const code =
      currentTabKey === 'basicInfo'
        ? 'SODR.DELIVERY_CANCELLED_DETAIL.BASIC'
        : 'SODR.DELIVERY_CANCELLED_DETAIL.OTEHR';
    const tableProps = {
      columns,
      dataSource,
      pagination,
      loading,
      rowSelection,
      bordered: true,
      rowKey: 'asnLineId',
      onChange: this.handleOnChange,
      scroll: {
        x: scrollX,
        y: 'calc(100vh - 400px)',
      },
    };

    return customizeTable(
      {
        code,
      },
      <EditTable {...tableProps} />
    );
  }
}
