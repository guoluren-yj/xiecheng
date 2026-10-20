/**
 * List - 送货单创建 - 汇总tab列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { sum, isNumber, isNil } from 'lodash';
import moment from 'moment';
import { dateRender } from 'hzero-front/lib/utils/renderer';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { showRecordModal } from '@/routes/components/CustomSpecsModal';

import styles from './index.less';
import urgentImg from '@/assets/icon-expedited.svg';
import yanqiImg from '@/assets/yanqi.svg';
import abnormal from '@/assets/abnormal.svg';
import { showBigNumber } from '@/routes/components/utils';
/**
 * List - 业务组件 - 送货单创建 - 送货单创建汇总tab内容列表
 * @extends {Component} - React.Component
 * @reactProps {function} [ref= (e => e)] - react ref属性
 * @reactProps {boolean} [loading=false] - 表格处理状态
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @reactProps {object} [pagination={}] - 分页数据
 * @reactProps {Array<Object>} [dataSource=[]] - 表格数据源
 * @reactProps {object} [rowSelection={}] - 表格选择框配置
 * @return React.element
 */
export default class List extends Component {
  constructor(props) {
    super(props);
    // 方法注册
    ['onCell'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  // defaultTableRowKey = 'poLineLocationId';

  /**
   * onCell - 设置表格单元格属性函数
   */
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  showUomText = (record) => {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  };

  render() {
    const { dataSource = [], customizeTable = () => {}, planFlag, ...others } = this.props;
    const tableProps = {
      dataSource,
      columns: [
        {
          title: intl.get(`sinv.common.model.common.serialNumber`).d('序号'),
          width: 100,
          dataIndex: 'serialNumber',
          fixed: 'left',
        },
        {
          title: intl.get(`sinv.common.model.common.customerItemCode`).d('客户物料编码'),
          align: 'left',
          width: 150,
          dataIndex: 'itemCode',
          fixed: 'left',
          sorter: true,
        },
        {
          title: intl.get(`sinv.common.model.common.customerItemName`).d('客户物料名称'),
          align: 'left',
          width: 160,
          dataIndex: 'itemName',
          fixed: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.sourcePlatform`).d('订单来源'),
          dataIndex: 'poSourcePlatformMeaning',
          width: 120,
          align: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.orderTypeName`).d('订单类型'),
          dataIndex: 'orderTypeName',
          width: 120,
          align: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
          dataIndex: 'displayPoNum',
          align: 'left',
          width: 170,
          sorter: true,
          render: (value, record) => (
            <div className={styles['row-agent-column']}>
              {value}
              {record.createSyncStatus === 'FAIL' ? (
                <Tooltip title={record.sapMsg}>
                  <img src={abnormal} alt="img" />
                </Tooltip>
              ) : null}
              {record.urgentFlag === 1 ? (
                <Tooltip title={intl.get(`sinv.common.model.common.urgent`).d('订单加急')}>
                  <img src={urgentImg} alt="img" />
                </Tooltip>
              ) : null}
              {record.overdueFlag > 0 ? (
                <Tooltip title={intl.get(`sinv.common.model.common.yanqiImg`).d(`订单超期`)}>
                  <img src={yanqiImg} alt="img" />
                </Tooltip>
              ) : null}
              {record.deliverySyncStatus === 'FAIL' ? (
                <Tooltip
                  title={intl
                    .get(`sinv.deliveryCreation.view.message.feedbackMsg`)
                    .d('订单承诺交期回传失败，请联系采购方重新同步')}
                >
                  <img src={abnormal} alt="img" />
                </Tooltip>
              ) : null}
            </div>
          ),
        },
        {
          title: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
          dataIndex: 'displayReleaseNum',
          align: 'left',
          width: 120,
          sorter: true,
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
          dataIndex: 'displayLineNum',
          width: 120,
          align: 'left',
          sorter: true,
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 120,
          align: 'left',
          sorter: true,
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
          dataIndex: 'versionNum',
          width: 120,
          align: 'left',
          sorter: true,
        },
        {
          title: intl.get(`sinv.common.model.common.quantity`).d('订单数量'),
          dataIndex: 'quantity',
          width: 100,
          align: 'left',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.canAsnQuantity`).d('可发货数量'),
          dataIndex: 'canAsnQuantity',
          width: 120,
          align: 'left',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.netReceivedQuantity`).d('净接收'),
          dataIndex: 'netReceivedQuantity',
          width: 100,
          align: 'left',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.onWayQuantity`).d('在途数量'),
          dataIndex: 'onWayQuantity',
          width: 100,
          align: 'left',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.shippedQuantity`).d('累计发货'),
          dataIndex: 'shippedQuantity',
          width: 100,
          align: 'left',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          align: 'left',
          render: (_val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`sinv.common.model.common.neededDate`).d('需求日期'),
          dataIndex: 'needByDate',
          width: 120,
          align: 'left',
          sorter: true,
          render: (text) => {
            const val = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
            return <span>{dateRender(val)}</span>;
          },
        },
        {
          title: intl.get(`sinv.common.model.common.promisedDate`).d('承诺日期'),
          dataIndex: 'promiseDeliveryDate',
          width: 150,
          align: 'left',
          sorter: true,
          // render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : null),
          render: (text) => {
            const val = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
            return <span>{dateRender(val)}</span>;
          },
        },
        {
          title: intl.get(`sinv.common.model.common.exemptInspectionFlag`).d('是否免检'),
          dataIndex: 'exemptInspectionFlag',
          width: 90,
          align: 'left',
          render: yesOrNoRender,
        },
        {
          title: intl.get(`sinv.common.model.common.immedShippedFlag`).d('是否直发'),
          dataIndex: 'immedShippedFlag',
          width: 90,
          align: 'left',
          render: yesOrNoRender,
        },
        {
          title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
          dataIndex: 'purOrganizationName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
          dataIndex: 'purchaseAgentName',
          width: 120,
          align: 'left',
        },
        {
          title: intl.get(`entity.customer.tag`).d('客户'),
          dataIndex: 'companyName',
          width: 180,
          align: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.invOrganizationName`).d('收货组织名称'),
          dataIndex: 'invOrganizationName',
          width: 180,
          align: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.shipToThirdPartyAddress`).d('收货地点名称'),
          dataIndex: 'shipToThirdPartyAddress',
          width: 180,
          align: 'left',
          render: (val) => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.inventoryName`).d('库房'),
          dataIndex: 'inventoryName',
          width: 180,
          align: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.locationName`).d('库位'),
          dataIndex: 'locationName',
          width: 180,
          align: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
          dataIndex: 'shipToThirdPartyName',
          width: 180,
          align: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.message.contactInfo`).d('联系人信息'),
          dataIndex: 'shipToThirdPartyContact',
          width: 180,
          align: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
          dataIndex: 'productNum',
          width: 180,
          align: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
          dataIndex: 'productName',
          width: 180,
          align: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
          dataIndex: 'catalogName',
          width: 180,
          align: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.purchaseRemark`).d('采购方行备注'),
          dataIndex: 'lineLocationRemark',
          align: 'left',
          width: 120,
          render: (val) => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
          // onCell: this.onCell,
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'supplierCompanyName',
          width: 180,
          align: 'left',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.companySiteName`).d('公司地点'),
          dataIndex: 'supplierSiteName',
          width: 180,
          align: 'left',
          render: (val) => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.commonName`).d('通用名'),
          dataIndex: 'commonName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.categoryNames`).d('物料类别'),
          dataIndex: 'categoryName',
          width: 120,
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
      ],
      rowKey: +planFlag ? 'planId' : 'poLineLocationId',
      bordered: true,
      ...others,
    };
    tableProps.scroll = {
      x: sum(tableProps.columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 250,
      y: 'calc(100vh - 400px)',
    };
    return customizeTable(
      {
        code: +planFlag ? 'SINV.DELIVERY_CREATION.LIST_BY_PLAN' : 'SINV.DELIVERY_CREATION.LIST',
      },
      <Table {...tableProps} key={+planFlag ? 'planId' : 'poLineLocationId'} />
    );
  }
}
