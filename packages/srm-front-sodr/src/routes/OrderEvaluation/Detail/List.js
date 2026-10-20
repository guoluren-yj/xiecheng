/**
 * OtherInfoList - 订单审批 - 明细页面表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { sum, isNumber, isFunction } from 'lodash';
import moment from 'moment';
import { Table, Tabs, Form, Tooltip } from 'hzero-ui';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { dateRender } from 'utils/renderer';
import EditTable from 'components/EditTable';

import { formatAumont, redirectToOther, getDynamicLabel } from '@/routes/components/utils';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
import Evaluation from './Evaluation';
import { TooltipTextArea } from '@/routes/components/TooltipFormItem';

// import AssociatedDoc from './AssociatedDoc';
// import urgentImg from '@/assets/icon-expedited.svg';

const FormItem = Form.Item;
// const { TextArea } = Input;
const { TabPane } = Tabs;

// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.orderApproval.model.common';
// 设置sodr国际化前缀 - common - message
const viewMessagePrompt = 'sodr.orderApproval.view.message';
// 设置通用国际化前缀
const commonPrompt = 'hzero.common';

// 设置sodr国际化前缀 - common - model
const modelCommonPrompt = 'sodr.common.model.common';
// function numberFormat(val) {
//   const count = countDecimals(val);
//   return isNumber(val) && !isNaN(val) ? numberRender(val, count <= 2 ? 2 : count) : val;
// }

// function countDecimals(val) {
//   return isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? `${val}`.split('.')[1].length || 0
//     : 0;
// }

/**
 * 业务组件 - 我发送的订单
 * @extends {Component} - React.Component
 * @reactProps {!Object} [processing={}] - dispatch处理过程
 * @reactProps {Array<Object>} [dataSource=[]] - 数据源
 * @reactProps {object} [pagination={}]
 * @reactProps {function} [assignDataSource= (e => e)] - 合并数据
 * @reactProps {function} [openBOMModal= (e => e)] 打开BOM
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @return React.element
 */
export default class List extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // radioGroupValue: 'basic',
    };

    // 方法注册
    ['getColumns', 'handleOnRadioGroupChange', 'onTableRow'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * componentDidMount 生命周期函数
   * 暴露this
   */
  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  /**
   * setRowBackground - 根据deliveryDateRejectFlag设置行背景
   * @param {object} record - 行数据
   */
  setRowBackground(record = {}) {
    return record.cancelledFlag === 1 ||
      record.frozenFlag === 1 ||
      record.deliveryDateRejectFlag === 1
      ? { background: '#eee' }
      : null;
  }

  /**
   * saveRowData - 合并行数据
   * @param {object} rowData - 行数据
   */
  saveRowData(rowData = {}) {
    const { dataSource = [], assignDataSource = (e) => e } = this.props;
    // const { radioGroupValue } = this.state;
    // const actionTableKey = !isEmpty(['basic', 'others'].filter(o => o === radioGroupValue)) ? 'common': radioGroupValue;
    assignDataSource((dataSource?.common || []).map((n) => (n.key === rowData.key ? rowData : n)));
  }

  /**
   * getColumns - 组装columns
   * @param {!string} actionKey - tab 切换key
   */
  getColumns(actionKey) {
    const {
      openBOMModal = (e) => e,
      path,
      amountFinancialPrecision = (e) => e,
      headerInfo = {},
      doubleUnitEnabled,
    } = this.props;
    const defaultColumns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'displayStatusMeaning',
        className: 'status',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.displayLineNum`).d('行号'),
        width: 60,
        dataIndex: 'displayLineNum',
      },
      {
        title: intl.get(`${modelPrompt}.displayLineLocationNum`).d('发运号'),
        width: 90,
        dataIndex: 'displayLineLocationNum',
      },
      {
        title: intl.get(`${modelPrompt}.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 90,
      },
      {
        title: intl.get(`${modelPrompt}.itemDescription`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (val) => <Tooltip title={val}>{val}</Tooltip>,
      },
    ].map((n) => (actionKey !== 'invoice' ? { ...n, fixed: 'left' } : n));

    const dynamicColumns = new Map([
      [
        'basic',
        [
          doubleUnitEnabled && {
            title: intl.get(`${modelPrompt}.quantity`).d('数量'),
            dataIndex: 'secondaryQuantity',
            width: 80,
            render: (text, { secondaryUomPrecision }) => formatAumont(text, secondaryUomPrecision),
          },
          doubleUnitEnabled && {
            title: intl.get(`${modelPrompt}.uomName`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 80,
            render: (_, { secondaryUomCodeAndName }) => secondaryUomCodeAndName,
          },
          {
            title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
            dataIndex: 'quantity',
            width: 100,
            render: (text) => formatAumont(text),
          },
          {
            title: getDynamicLabel(doubleUnitEnabled, 'uom'),
            dataIndex: 'uomName',
            width: 100,
            render: (_, { uomCodeAndName }) => uomCodeAndName,
          },
          {
            title: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
            width: 90,
            dataIndex: 'needByDate',
            render: (text) => {
              const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
              const formatDom = dateRender(dom) || null;
              return <>{formatDom}</>;
            },
          },
          {
            title: intl.get(`${modelPrompt}.promiseDeliveryDate`).d('承诺交货日期'),
            width: 160,
            dataIndex: 'promiseDeliveryDate',
            render: (text) => {
              const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
              const formatDom = dateRender(dom) || null;
              return <>{formatDom}</>;
            },
          },
          {
            title: intl.get(`${modelPrompt}.unitPrice`).d('不含税单价'),
            width: 100,
            dataIndex: 'unitPrice',
            align: 'right',
            render: (text, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : headerInfo.poSourcePlatform === 'ERP'
                ? formatAumont(text)
                : formatAumont(text, record.defaultPrecision),
          },
          {
            title: intl.get(`${modelPrompt}.taxedEnteredUnitPrice`).d('原币含税单价'),
            width: 150,
            dataIndex: 'enteredTaxIncludedPrice',
            align: 'right',
            render: (text, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : headerInfo.poSourcePlatform === 'ERP'
                ? formatAumont(text)
                : formatAumont(text, record.defaultPrecision),
          },
          {
            title: intl.get(`${modelPrompt}.unitPriceBatch`).d('每'),
            width: 60,
            dataIndex: 'unitPriceBatch',
            render: (val) => formatAumont(val),
          },
          {
            title: intl.get(`${modelPrompt}.lineAmount`).d('不含税行金额'),
            width: 150,
            dataIndex: 'lineAmount',
            align: 'right',
            render: (text, record) => {
              return amountFinancialPrecision(
                record.priceShieldFlag,
                text,
                record.financialPrecision,
                headerInfo.poSourcePlatform
              );
            },
          },
          {
            title: intl.get(`${modelPrompt}.taxIncludedLineAmount`).d('含税行金额'),
            width: 100,
            dataIndex: 'taxIncludedLineAmount',
            align: 'right',
            render: (text, record) => {
              return amountFinancialPrecision(
                record.priceShieldFlag,
                text,
                record.financialPrecision,
                headerInfo.poSourcePlatform
              );
            },
          },
          {
            title: `${intl.get(`${modelPrompt}.taxRate`).d('税率')}(%)`,
            width: 90,
            dataIndex: 'taxRate',
            render: (text) =>
              isNumber(Number(text)) || math.isBigNumber(text) ? new BigNumber(text) : 0,
          },
          {
            title: intl.get(`${modelPrompt}.currencyName`).d('币种'),
            width: 80,
            dataIndex: 'currencyCode',
          },
          {
            title: intl.get(`${modelPrompt}.organizationName`).d('收货组织'),
            width: 90,
            dataIndex: 'invOrganizationName',
          },
          {
            title: intl.get(`${modelPrompt}.inventoryName`).d('收货库房'),
            width: 90,
            dataIndex: 'inventoryName',
          },
          {
            title: intl.get(`${modelPrompt}.locationName`).d('收货库位'),
            width: 90,
            dataIndex: 'locationName',
          },
          {
            title: intl.get(`${modelPrompt}.specifications`).d('规格'),
            width: 60,
            dataIndex: 'specifications',
          },
          {
            title: intl.get(`${modelPrompt}.model`).d('型号'),
            width: 90,
            dataIndex: 'model',
          },
          {
            title: intl.get(`${modelPrompt}.manufacturerName`).d('制造商'),
            width: 150,
            dataIndex: 'manufacturerName',
            onCell,
          },
          {
            title: intl.get(`${modelPrompt}.brand`).d('品牌'),
            width: 150,
            dataIndex: 'brand',
            onCell,
          },
          {
            title: intl.get(`${modelPrompt}.purchaserRemark`).d('采购方行备注'),
            width: 240,
            dataIndex: 'remark',
            render: (val, record) =>
              ['create', 'update'].includes(record._status) &&
              path === '/sodr/order-approval/detail/:poHeaderId' ? (
                <FormItem>
                  {record.$form.getFieldDecorator(`remark`, {
                    initialValue: val,
                  })(
                    <TooltipTextArea
                      tipValue={record.$form.getFieldValue('remark')}
                      style={{ resize: 'vertical' }}
                      rows={1}
                    />
                  )}
                </FormItem>
              ) : (
                <Tooltip title={val}>
                  <span
                    style={{
                      width: '100%',
                      display: 'inline-block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {val}
                  </span>
                </Tooltip>
              ),
          },
          {
            title: intl.get(`${modelPrompt}.feedback`).d('反馈信息'),
            width: 180,
            dataIndex: 'feedback',
          },
          {
            title: intl.get(`sodr.common.model.common.domesticTaxIncludedPrice`).d('本币含税单价'),
            width: 120,
            dataIndex: 'domesticTaxIncludedPrice',
            render: (val, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : headerInfo.poSourcePlatform === 'ERP'
                ? formatAumont(val)
                : formatAumont(val, headerInfo.domesticDefaultPrecision),
          },
          {
            title: intl.get(`sodr.common.model.common.domesticUnitPrice`).d('本币不含税单价'),
            width: 120,
            dataIndex: 'domesticUnitPrice',
            render: (val, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : headerInfo.poSourcePlatform === 'ERP'
                ? formatAumont(val)
                : formatAumont(val, headerInfo.domesticDefaultPrecision),
          },
          {
            title: intl
              .get(`sodr.common.model.common.domesticTaxIncludedLineAmount`)
              .d('本币含税金额'),
            width: 120,
            dataIndex: 'domesticTaxIncludedLineAmount',
            render: (val, record) =>
              amountFinancialPrecision(
                record.priceShieldFlag,
                val,
                headerInfo.domesticFinancialPrecision,
                headerInfo.poSourcePlatform
              ),
          },
          {
            title: intl.get(`sodr.common.model.common.domesticLineAmount`).d('本币不含税金额'),
            width: 120,
            dataIndex: 'domesticLineAmount',
            render: (val, record) =>
              amountFinancialPrecision(
                record.priceShieldFlag,
                val,
                headerInfo.domesticFinancialPrecision,
                headerInfo.poSourcePlatform
              ),
          },
          {
            title: intl.get(`sodr.common.model.common.receiveToleranceQuantityType`).d('允差类型'),
            width: 150,
            dataIndex: 'receiveToleranceQuantityType',
          },
          {
            width: 150,
            dataIndex: 'productBrand',
            title: intl.get(`${modelCommonPrompt}.productBrand`).d('商品品牌'),
          },
          {
            width: 150,
            dataIndex: 'productModel',
            title: intl.get(`${modelCommonPrompt}.productModel`).d('商品规格'),
          },
          {
            width: 150,
            dataIndex: 'packingList',
            title: intl.get(`${modelCommonPrompt}.packingList`).d('商品型号'),
          },
        ].filter((i) => i),
      ],
      [
        'others',
        [
          {
            title: intl.get(`${modelPrompt}.oldItemCode`).d('旧物料号'),
            width: 150,
            dataIndex: 'oldItemCode',
            onCell,
          },
          {
            title: intl.get(`${modelPrompt}.itemTypeDesc`).d('物品类型'),
            width: 120,
            dataIndex: 'categoryName',
            render: (val) => <Tooltip title={val}>{val}</Tooltip>,
          },
          {
            title: intl.get(`${modelPrompt}.rate`).d('汇率'),
            width: 90,
            dataIndex: 'exchangeRate',
          },
          {
            title: intl.get(`${modelPrompt}.consignedFlag`).d('是否寄售'),
            width: 90,
            dataIndex: 'consignedFlag',
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.returnedFlag`).d('是否退回'),
            width: 90,
            dataIndex: 'returnedFlag',
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.freeFlag`).d('是否免费'),
            width: 90,
            dataIndex: 'freeFlag',
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.immedShippedFlag`).d('是否直发'),
            width: 90,
            dataIndex: 'immedShippedFlag',
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          // TODO 后端没字段
          {
            title: intl.get(`${modelPrompt}.bom`).d('外协BOM'),
            width: 120,
            dataIndex: 'bom',
            render: (text, record) => (
              <a onClick={() => openBOMModal(record)}>
                {intl.get(`${commonPrompt}.button.view`).d('查看')}
              </a>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.accountAssignment`).d('科目分配'),
            width: 120,
            dataIndex: 'accountAssignment',
          },
          {
            title: intl.get(`${modelPrompt}.purReqNum`).d('采购申请号'),
            width: 150,
            dataIndex: 'displayPrNum',
            onCell,
            render: (val, record) => (
              <a onClick={() => redirectToOther('purchase', record)}>{val}</a>
            ),
          },
          {
            title: intl.get(`${modelPrompt}.purReqLineNum`).d('采购申请行号'),
            width: 160,
            dataIndex: 'displayPrLineNum',
            render: (val, record) => (
              <a onClick={() => redirectToOther('purchase', record)}>{val}</a>
            ),
            onCell,
          },
          {
            title: intl.get(`sodr.common.model.quotePurchase.number`).d('采购协议号|行号'),
            dataIndex: 'contractNum',
            width: 180,
            render: (val, record) => (
              <a onClick={() => redirectToOther('contract', record)}>{val}</a>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.sourceLineNum`).d('寻源单号|行号'),
            dataIndex: 'sourceNumAndLine',
            width: 180,
            render: (val, record) => (
              <a onClick={() => redirectToOther('source', record)}>{val || record.sourceCodeNum}</a>
            ),
          },
          {
            title: intl.get(`${modelPrompt}.purReqAppliedName`).d('申请人'),
            width: 90,
            dataIndex: 'prRequestedName',
            render: (_, record) => record.purReqAppliedName,
          },
          {
            title: intl.get(`${modelPrompt}.shipToThirdPartyName`).d('送达方'),
            width: 120,
            dataIndex: 'shipToThirdPartyName',
          },
          {
            title: intl.get(`${modelPrompt}.shipToThirdPartyAddress`).d('送货地址'),
            width: 150,
            dataIndex: 'shipToThirdPartyAddress',
            onCell,
            render: (val) => <Tooltip title={val}>{val}</Tooltip>,
          },
          {
            title: intl.get(`${modelPrompt}.shipToThirdPartyContact`).d('联系人信息'),
            width: 150,
            dataIndex: 'shipToThirdPartyContact',
          },
          {
            title: intl.get(`${modelPrompt}.receiveTelNum`).d('联系人电话'),
            width: 150,
            dataIndex: 'receiveTelNum',
            render: (val, record) => (
              <span>{val ? `${record.internationalTelCode || ''} ${val}` : ''}</span>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.priceUomName`).d('订单价格单位'),
            width: 150,
            dataIndex: 'priceUomName',
            render: (_, { priceUomCodeName }) => priceUomCodeName,
          },
          {
            title: intl.get(`${modelPrompt}.priceUomConversion`).d('单位转换关系'),
            width: 150,
            dataIndex: 'priceUomConversion',
            onCell,
          },
          // {
          //   title: intl.get(`${modelPrompt}.frozenFlag`).d('冻结状态'),
          //   dataIndex: 'frozenFlag',
          //   align: 'center',
          //   width: 90,
          //   render: text =>
          //     intl
          //       .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
          //       .d(text === 1 ? '是' : '否'),
          // },
        ],
      ],
      ['invoice', []],
      [
        'partners',
        [
          {
            title: intl.get(`${modelPrompt}.partnerType`).d('合作类型'),
            width: 150,
            dataIndex: 'partnerType',
            onCell,
          },
          {
            title: intl.get(`${modelPrompt}.partnerNum`).d('合作方编码'),
            width: 120,
            dataIndex: 'partnerNum',
          },
          {
            title: intl.get(`${modelPrompt}.partnerName`).d('合作方名称'),
            width: 120,
            dataIndex: 'partnerName',
          },
          {
            title: intl.get(`${modelPrompt}.dataSourceCode`).d('来源系统'),
            width: 120,
            dataIndex: 'externalSystemCode',
          },
        ],
      ],
    ]);
    function onCell() {
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
    return actionKey !== 'partners'
      ? defaultColumns.concat(dynamicColumns.get(actionKey))
      : dynamicColumns.get(actionKey);
  }

  /**
   * handleOnRadioGroupChange - RadioGroup change事件
   * @param {!object} e - 事件对象
   */
  handleOnRadioGroupChange(event) {
    const { onRadioGroupChange = (e) => e } = this.props;
    onRadioGroupChange(event);
  }

  /**
   * handleOnChange - 表格切换事件
   * @param {!object} e - 事件对象
   */
  handleOnChange(page) {
    const { onChange = (e) => e, radioGroupValue } = this.props;
    onChange(radioGroupValue !== 'partners' ? 'common' : 'partners', page);
  }

  onTableRow(record) {
    const {
      setActionListCommonRow = (e) => e,
      actionListCommonRow = {},
      radioGroupValue,
    } = this.props;
    return {
      style:
        radioGroupValue !== 'invoice'
          ? this.setRowBackground(record)
          : {
              background: actionListCommonRow.key === record.key ? '#f0fffe' : '#fff',
            },
      onClick: () => {
        setActionListCommonRow(record);
      },
    };
  }

  render() {
    const {
      dataSource = [],
      pagination,
      processing,
      radioGroupValue,
      form,
      customizeTable,
      customizeTabPane,
      customizeForm,
    } = this.props;
    const columns =
      radioGroupValue === 'evaluation' ? [] : this.getColumns(radioGroupValue).filter((i) => i);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    // if (radioGroupValue === 'basic') scrollX += 750;
    const actionTableKey = ['basic', 'others', 'invoice'].includes(radioGroupValue)
      ? 'common'
      : radioGroupValue;
    const tableProps = {
      // rowKey: this.defaultTableRowKey,
      columns,
      dataSource: dataSource[actionTableKey] || [],
      pagination: pagination[actionTableKey],
      loading:
        processing.queryDetailListLoading ||
        (radioGroupValue === 'partners' && processing.queryPartnersLoading),
      bordered: true,
      onChange: this.handleOnChange.bind(this),
      scroll: { x: scrollX >= 1200 && radioGroupValue !== 'invoice' ? scrollX : false },
    };
    // const associatedDocProps = {
    //   associatedDoc,
    //   visible: radioGroupValue === 'invoice',
    // };
    const evaluationProps = {
      form,
      customizeForm,
    };
    if (radioGroupValue !== 'partners') {
      tableProps.onRow = this.onTableRow;
    }
    return customizeTabPane(
      {
        code: 'SODR.ORDER_EVALUATE_DETAIL.TAB',
      },
      <Tabs
        onChange={this.handleOnRadioGroupChange}
        className="detail-list"
        animated={false}
        activeKey={radioGroupValue}
      >
        <TabPane key="basic" tab={intl.get(`${viewMessagePrompt}.basicInfo`).d('基础信息')}>
          {radioGroupValue === 'basic' &&
            customizeTable(
              {
                code: 'SODR.ORDER_EVALUATE_DETAIL.LINE_BASIC',
              },
              <EditTable {...tableProps} />
            )}
        </TabPane>
        <TabPane key="others" tab={intl.get(`${viewMessagePrompt}.otherInfo`).d('其他信息')}>
          {customizeTable(
            {
              code: 'SODR.ORDER_EVALUATE_DETAIL.LINE_OTHER',
            },
            <Table {...tableProps} />
          )}
        </TabPane>
        <TabPane
          disabled={processing.queryDetailListLoading}
          key="invoice"
          tab={intl.get(`${viewMessagePrompt}`).d('关联单据')}
        >
          <Table {...tableProps} />
        </TabPane>
        <TabPane key="partners" tab={intl.get(`${viewMessagePrompt}.partners`).d('合作方')}>
          {customizeTable(
            {
              code: 'SODR.ORDER_EVALUATE_DETAIL.PARTNERS',
            },
            <Table {...tableProps} />
          )}
        </TabPane>
        <TabPane key="evaluation" tab={intl.get(`sodr.common.view.message.evaluate`).d('评价')}>
          <Evaluation {...evaluationProps} />
        </TabPane>
      </Tabs>
    );
  }
}
