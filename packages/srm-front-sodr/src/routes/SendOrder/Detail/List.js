/**
 * List - 我发出的订单 - 明细页面表格
 * @date: 2018-10-24
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { sum, isNumber, isFunction, isNil } from 'lodash';
import { Tabs, Form, Input, Tooltip, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import querystring from 'querystring';
import { openTab } from 'utils/menuTab';
import DocFlow from '_components/DocFlow';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
// import { numberRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import UploadModal from 'components/Upload';
import { dateRender } from 'hzero-front/lib/utils/renderer';
import {
  formatAumont,
  redirectToOther,
  formatNumber,
  getDynamicLabel,
} from '@/routes/components/utils';
import urgentImg from '@/assets/icon-expedited.svg';
import yanqiImg from '@/assets/yanqi.svg';
import rise from '@/assets/rise.svg';
import decline from '@/assets/decline.svg';
import abnormal from '@/assets/abnormal.svg';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import Evaluation from './Evaluation';
import CustomSpecModal from '@/routes/QuotePurchaseRequisition/components/CustomSpecModal';
import { TooltipTextArea } from '@/routes/components/TooltipFormItem';
import { BUCKET_NAME } from '@/routes/components/utils/constant';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const { TextArea } = Input;

// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.sendOrder.model.common';
// 设置sodr国际化前缀 - common - message
const titlePrompt = 'sodr.sendOrder.view.title';
const buttonPrompt = 'sodr.sendOrder.view.button';

// function numberFormat(val) {
//   if (val || val === 0) {
//     const count = countDecimals(val);
//     return isNumber(val) && !isNaN(val) ? numberRender(val, count <= 2 ? 2 : count) : val;
//   } else {
//     return '';
//   }
// }

// function countDecimals(val) {
//   return isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? `${val}`.split('.')[1].length || 0
//     : 0;
// }

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
export default class List extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tenantId: getCurrentOrganizationId(),
      customVisable: false,
      customData: [],
      specsJsonType: 'custom',
    };

    // 方法注册
    ['getColumns', 'handleOnRadioGroupChange', 'onTableRow', 'Time'].forEach((method) => {
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

  // 跳转商城
  @Bind()
  goToMall(record) {
    const { poSourcePlatform } = this.props;
    openTab({
      key: '/scec/commom-goods-preview',
      title: intl.get(`${titlePrompt}.productPreview`).d('商品预览'),
      search: querystring.stringify({
        productId: record.productId,
        companyId: record.companyId,
        type: poSourcePlatform,
      }),
    });
  }

  /**
   * setRowBackground - 根据deliveryDateRejectFlag设置行背景
   * @param {object} record - 行数据
   */
  setRowBackground(record) {
    return record.cancelledFlag === 1 || record.cancelledFlag === 3 || record.frozenFlag === 1
      ? { background: '#eee' }
      : null;
  }

  priceUomRender(text, record) {
    return record.priceUomCode ? `${record.priceUomCode || ''}/${text || ''}` : '';
  }

  // @Bind()
  Time(day) {
    const toDay = new Date();
    return moment(toDay).diff(moment(day), 'days');
  }

  /**
   * getColumns - 组装columns
   * @param {!string} actionKey - tab 切换key
   */
  getColumns(actionKey) {
    const {
      openBOMModal = (e) => e,
      radioGroupValue,
      poSourcePlatform,
      amountFinancialPrecision,
      headerInfo,
      isDocFlowLink,
      doubleUnitEnabled,
      enumMap: { purchaseLineType = [] },
    } = this.props;
    const { tenantId } = this.state;
    const getStatusRender = (record) => {
      const render = record.displayStatusMeaning;
      // if (record.frozenFlag === 1) {
      //   render = intl.get(`${modelPrompt}.frozen`).d('冻结');
      // }

      // if (record.cancelledFlag === 1) {
      //   render = intl.get('hzero.common.button.cancel').d('取消');
      // }

      // if (record.closedFlag === 1) {
      //   render = intl.get(`${modelPrompt}.closed`).d('已关闭');
      // }

      return (
        <Fragment>
          {radioGroupValue === 'basic' && record.beyondQuantity > 0 ? (
            <Tooltip
              title={intl
                .get(`sodr.sendOrder.model.common.orderDelayDays`, {
                  num: this.Time(record.promiseDeliveryDate),
                })
                .d(`订单超期${this.Time(record.promiseDeliveryDate)}天，请提醒供应商安排送货！`)}
            >
              <img src={yanqiImg} alt="img" />
            </Tooltip>
          ) : (
            ''
          )}
          {record.urgentFlag === 1 && (
            <img src={urgentImg} alt={intl.get(`${buttonPrompt}.detailUrgent`).d('加急')} />
          )}
          {record.deliverySyncStatus === 'FAIL' ? (
            <Tooltip
              title={
                intl
                  .get(`sodr.common.view.message.orderFeedbackMsg`)
                  .d('ERP订单承诺交货日期同步失败：失败原因') +
                (record.deliverySyncResponseMsg || '')
              }
            >
              <img src={abnormal} alt="img" />
            </Tooltip>
          ) : (
            ''
          )}
          {render}
        </Fragment>
      );
    };

    const defaultColumns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'displayStatusMeaning',
        width: 100,
        className: 'status',
        render: (text, record) => getStatusRender(record),
      },
      {
        title: intl.get(`${modelPrompt}.lineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 60,
      },
      {
        title: intl.get(`${modelPrompt}.shipmentNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        width: 100,
        dataIndex: 'projectCategoryMeaning',
      },
      {
        title: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 90,
      },
      {
        title: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
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
            render: (value, record) => formatAumont(value, record.secondaryUomPrecision),
          },
          doubleUnitEnabled && {
            title: intl.get(`${modelPrompt}.uomName`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 150,
            render: (_, { secondaryUomCodeAndName }) => secondaryUomCodeAndName,
          },
          {
            title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
            dataIndex: 'quantity',
            width: 80,
            render: (value, record) => formatAumont(value, record.uomPrecision),
          },
          {
            title: getDynamicLabel(doubleUnitEnabled, 'uom'),
            dataIndex: 'uomName',
            width: 150,
            render: (_, { uomCodeAndName }) => uomCodeAndName,
          },
          {
            title: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
            dataIndex: 'needByDate',
            width: 120,
            render: (text) => {
              const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
              const formatDom = dateRender(dom) || null;
              return <>{formatDom}</>;
            },
          },
          {
            title: intl.get(`${modelPrompt}.promiseDeliveryDate`).d('承诺交货日期'),
            dataIndex: 'promiseDeliveryDate',
            width: 120,
            // render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : text),
            render: (text) => {
              const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
              const formatDom = dateRender(dom) || null;
              return <>{formatDom}</>;
            },
          },
          {
            title: intl.get(`sodr.common.model.common.currentPurchasePrice`).d('最近一次采购价'),
            width: 130,
            align: 'right',
            dataIndex: 'lastPurchasePrice',
            render: (val) => formatNumber(val),
          },
          {
            title: intl.get(`${modelPrompt}.afterTaxunitPrice`).d('不含税单价'),
            width: 120,
            dataIndex: 'unitPrice',
            align: 'right',
            render: (text, record) =>
              record.priceShieldFlag === 1 ? (
                '******'
              ) : (
                <Fragment>
                  {poSourcePlatform === 'ERP'
                    ? formatAumont(text)
                    : formatAumont(text, record.defaultPrecision)}
                  {[-1, 1].includes(record.modifyPriceFlag) &&
                    record.benchmarkPriceType === 'NET_PRICE' && (
                      <img
                        style={{ marginBottom: '2px' }}
                        src={record.modifyPriceFlag === 1 ? rise : decline}
                        alt="img"
                      />
                    )}
                </Fragment>
              ),
          },
          {
            title: intl.get(`${modelPrompt}.enteredTaxIncludedPrice`).d('原币含税单价'),
            dataIndex: 'enteredTaxIncludedPrice',
            width: 120,
            align: 'right',
            render: (text, record) =>
              record.priceShieldFlag === 1 ? (
                '******'
              ) : (
                <Fragment>
                  {poSourcePlatform === 'ERP'
                    ? formatAumont(text)
                    : formatAumont(text, record.defaultPrecision)}
                  {[-1, 1].includes(record.modifyPriceFlag) &&
                    record.benchmarkPriceType !== 'NET_PRICE' && (
                      <img
                        style={{ marginBottom: '2px' }}
                        src={record.modifyPriceFlag === 1 ? rise : decline}
                        alt="img"
                      />
                    )}
                </Fragment>
              ),
          },

          {
            title: intl.get(`${modelPrompt}.unitPriceBatch`).d('每'),
            dataIndex: 'unitPriceBatch',
            width: 80,
            render: (val) => formatAumont(val),
          },
          {
            title: intl.get(`${modelPrompt}.afterTaxlineAmount`).d('不含税行金额'),
            dataIndex: 'lineAmount',
            width: 120,
            align: 'right',
            render: (text, record) => {
              return amountFinancialPrecision(
                record.priceShieldFlag,
                text,
                record.financialPrecision,
                poSourcePlatform,
                headerInfo.sourceOfTransferOrder
              );
            },
          },
          {
            title: intl.get(`${modelPrompt}.taxIncludedLineAmount`).d('含税行金额'),
            dataIndex: 'taxIncludedLineAmount',
            width: 120,
            align: 'right',
            render: (text, record) => {
              return amountFinancialPrecision(
                record.priceShieldFlag,
                text,
                record.financialPrecision,
                poSourcePlatform,
                headerInfo.sourceOfTransferOrder
              );
            },
          },
          {
            title: `${intl.get(`${modelPrompt}.taxRate`).d('税率')}(%)`,
            dataIndex: 'taxRate',
            width: 80,
            render: (text) => (isNumber(Number(text)) ? Number(text) : 0),
          },
          {
            title: intl.get(`${modelPrompt}.currencyCode`).d('币种'),
            dataIndex: 'currencyCode',
            width: 80,
          },
          {
            title: intl.get('sodr.common.model.common.department').d('部门'),
            dataIndex: 'departmentName',
            width: 130,
          },
          {
            title: intl.get(`sodr.common.model.common.organizationName`).d('收货组织'),
            dataIndex: 'invOrganizationName',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.inventoryName`).d('收货库房'),
            dataIndex: 'inventoryName',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.locationName`).d('收货库位'),
            dataIndex: 'locationName',
            width: 120,
          },
          {
            title: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
            dataIndex: 'costName',
            width: 120,
          },
          {
            title: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
            dataIndex: 'accountSubjectName',
            width: 120,
          },
          {
            title: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
            dataIndex: 'wbs',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.specifications`).d('规格'),
            dataIndex: 'specifications',
            width: 100,
            render: (val) => (
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
            title: intl.get(`${modelPrompt}.modelNum`).d('型号'),
            dataIndex: 'model',
            width: 100,
          },
          {
            title: intl
              .get(`sprm.purchaseReqCreation.model.common.customSpecsJson`)
              .d('定制品属性'),
            width: 150,
            dataIndex: 'customSpecsJson',
            render: (val) => (
              <a
                disabled={this.props?.viewOnly}
                onClick={() => {
                  this.setState({
                    customData: val ? JSON.parse(val) : [],
                    customVisable: true,
                    specsJsonType: 'custom',
                  });
                }}
              >
                {intl.get(`sprm.purchaseReqCreation.model.common.customSpecsJson`).d('定制品属性')}
              </a>
            ),
          },
          {
            title: intl.get(`sprm.purchaseReqCreation.model.common.customSpecs`).d('定制品属性'),
            width: 150,
            dataIndex: 'customSpecs',
            render: (val) => (
              <TextArea disabled value={val} style={{ resize: 'vertical' }} rows={1} />
            ),
          },
          {
            title: intl.get(`sprm.purchaseReqCreation.model.common.productSpecsJson`).d('商品属性'),
            width: 150,
            dataIndex: 'productSpecsJson',
            render: (val) => {
              return (
                <a
                  disabled={this.props?.viewOnly}
                  onClick={() => {
                    this.setState({
                      customData: val ? JSON.parse(val) : [],
                      specsJsonType: 'product',
                      customVisable: true,
                    });
                  }}
                >
                  {intl.get(`sprm.purchaseReqCreation.model.common.productSpecsJson`).d('商品属性')}
                </a>
              );
            },
          },
          {
            title: intl.get(`sprm.purchaseReqCreation.model.common.productSpecs`).d('商品属性'),
            width: 150,
            dataIndex: 'productSpecs',
            render: (val, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`productSpecs`, {
                  initialValue: val,
                })(<TextArea disabled style={{ resize: 'vertical' }} rows={1} />)}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.productBrand`).d('商品品牌'),
            dataIndex: 'productBrand',
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.productModel`).d('商品规格'),
            dataIndex: 'productModel',
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.packingList`).d('商品型号'),
            dataIndex: 'packingList',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.brand`).d('品牌'),
            dataIndex: 'brand',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`${modelPrompt}.purchaserRemark`).d('采购方行备注'),
            dataIndex: 'remark',
            width: 240,
            render: (val, record) =>
              ['create', 'update'].includes(record._status) ? (
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
                <Tooltip title={val}>{val}</Tooltip>
              ),
          },
          {
            title: intl.get(`${modelPrompt}.feedbackInfo`).d('反馈信息'),
            dataIndex: 'feedback',
            width: 180,
            onCell,
          },
          {
            title: intl.get(`sodr.common.model.common.lineAttachmentUuid`).d('行附件'),
            dataIndex: 'attachmentUuid',
            width: 100,
            render: (value, record) => (
              <UploadModal
                bucketName={BUCKET_NAME}
                // bucketDirectory="sodr-order"
                attachmentUUID={record.attachmentUuid}
                viewOnly
                icon={false}
              />
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.domesticTaxIncludedPrice`).d('本币含税单价'),
            width: 120,
            dataIndex: 'domesticTaxIncludedPrice',
            render: (val, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : poSourcePlatform === 'ERP'
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
                : poSourcePlatform === 'ERP'
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
                poSourcePlatform
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
                poSourcePlatform
              ),
          },
          {
            title: intl.get(`sodr.common.model.common.budgetAccount`).d('预算科目'),
            width: 120,
            dataIndex: 'budgetAccountId',
            render: (_, record) => record.budgetAccountName,
          },
          {
            title: intl.get(`sodr.common.model.common.receiveToleranceQuantityType`).d('允差类型'),
            width: 150,
            dataIndex: 'receiveToleranceQuantityType',
          },
          {
            title: intl.get(`sodr.common.model.common.purchaseLineTypes`).d('采购行类型'),
            width: 150,
            dataIndex: 'purchaseLineTypeId',
            render: (val, record) => {
              return (
                <FormItem>
                  {record.$form.getFieldDecorator(`purchaseLineTypeId`, {
                    initialValue: !isNil(val) ? val.toString() : null,
                  })(
                    <Select allowClear style={{ width: '100%' }}>
                      {purchaseLineType.map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              );
            },
          },
          {
            title: intl.get(`sodr.common.model.common.strategyName`).d('发货策略'),
            dataIndex: 'deliveryStrategyId',
            width: 200,
            render: (_, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`deliveryStrategyId`, {
                  initialValue: record.deliveryStrategyId,
                })(
                  <Lov
                    code="SLOD.DELIVERY_STRATEGY"
                    disabled
                    textValue={record.deliveryStrategyIdMeaning}
                    queryParams={{
                      tenantId,
                    }}
                  />
                )}
              </FormItem>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.receivingStrategy`).d('收货策略'),
            dataIndex: 'strategyHeaderId',
            width: 200,
            render: (_, record) => (
              <FormItem>
                {record.$form.getFieldDecorator(`strategyHeaderId`, {
                  initialValue: record.strategyHeaderId,
                })(
                  <Lov
                    code="SINV.STRATEGY_LINE_CODE_AND_NAME_PO"
                    disabled
                    textValue={record.strategyHeaderIdMeaning}
                    queryParams={{
                      tenantId,
                    }}
                  />
                )}
              </FormItem>
            ),
          },
          !isDocFlowLink && {
            width: 100,
            dataIndex: 'docFlow',
            title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
            render: (_, record) => (
              <DocFlow tableName="sodr_po_line_location" tablePk={record.poLineLocationId} />
            ),
          },
        ].filter((i) => i),
      ],

      [
        'others',
        [
          {
            title: intl.get(`${modelPrompt}.itemTypeDesc`).d('物品类型'),
            dataIndex: 'categoryName',
            width: 120,
            render: (val) => <Tooltip title={val}>{val}</Tooltip>,
          },
          {
            title: intl.get(`${modelPrompt}.exchangeRate`).d('汇率'),
            dataIndex: 'exchangeRate',
            width: 90,
          },
          {
            title: intl.get(`${modelPrompt}.consignedFlag`).d('是否寄售'),
            dataIndex: 'consignedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.returnedFlag`).d('是否退回'),
            dataIndex: 'returnedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.freeFlag`).d('是否免费'),
            dataIndex: 'freeFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.immedShippedFlag`).d('是否直发'),
            dataIndex: 'immedShippedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          // TODO 后端没字段
          {
            title: intl.get(`${titlePrompt}.titleBom`).d('外协BOM'),
            width: 100,
            dataIndex: 'bom',
            render: (text, record) => (
              <a onClick={() => openBOMModal(record)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </a>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.purReqLineNum`).d('采购申请号|行号'),
            dataIndex: 'displayPrNumAndDisplayPrLineNum',
            width: 180,
            render: (val, record) => (
              <a onClick={() => redirectToOther('purchase', record)}>{val}</a>
            ),
          },
          {
            title: intl.get(`${modelPrompt}.quotePurchase.number`).d('采购协议号|行号'),
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
            title: intl.get(`entity.roles.proposer`).d('申请人'),
            dataIndex: 'prRequestedName',
            width: 90,
            render: (_, record) => record.purReqAppliedName,
          },
          {
            title: intl.get(`${modelPrompt}.productNum`).d('商品编码'),
            dataIndex: 'productNum',
            width: 130,
            // render: (val, record) =>
            //   poSourcePlatform === 'E-COMMERCE' ? (
            //     <a onClick={() => this.goToMall(record)}>{val}</a>
            //   ) : (
            //     val
            //   ),
          },
          {
            title: intl.get(`${modelPrompt}.productName`).d('商品名称'),
            dataIndex: 'productName',
            width: 100,
          },
          {
            title: intl.get(`${modelPrompt}.commodityDirectory`).d('商品目录'),
            dataIndex: 'catalogName',
            width: 100,
          },
          {
            title: intl.get(`${modelPrompt}.shipToThirdPartyName`).d('送达方'),
            dataIndex: 'shipToThirdPartyName',
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('送货地址'),
            dataIndex: 'shipToThirdPartyAddress',
            width: 150,
            onCell,
            render: (val) => <Tooltip title={val}>{val}</Tooltip>,
          },
          {
            title: intl.get(`${modelPrompt}.contactPersonInfo`).d('联系人信息'),
            dataIndex: 'shipToThirdPartyContact',
            width: 150,
          },
          {
            title: intl.get(`${modelPrompt}.receiveTelNum`).d('联系人电话'),
            dataIndex: 'receiveTelNum',
            width: 150,
            render: (val, record) => (
              <span>{val ? `${record.internationalTelCode || ''} ${val}` : ''}</span>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.priceUomName`).d('订单价格单位'),
            dataIndex: 'priceUomName',
            width: 150,
            render: (_, { priceUomCodeName }) => priceUomCodeName,
          },
          {
            title: intl.get(`${modelPrompt}.unitConversionRelation`).d('单位转换关系'),
            dataIndex: 'priceUomConversion',
            width: 150,
            onCell,
          },
        ],
      ],
      ['invoice', []],
      [
        'partners',
        [
          {
            title: intl.get(`${modelPrompt}.cooperationType`).d('合作类型'),
            dataIndex: 'partnerType',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`${modelPrompt}.partnerNum`).d('合作方编码'),
            dataIndex: 'partnerNum',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.partnerName`).d('合作方名称'),
            dataIndex: 'partnerName',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.sourceSystem`).d('来源系统'),
            dataIndex: 'externalSystemCode',
            width: 120,
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
    if (poSourcePlatform === 'E-COMMERCE') {
      const priceItem = [
        {
          title: intl
            .get(`sodr.common.model.common.includingTaxAndFreightPrice`)
            .d('原币含税单价（含运费）'),
          dataIndex: 'enteredTaxIncludedPrice',
          width: 180,
          align: 'right',
          render: (text, record) =>
            record.priceShieldFlag === 1 ? (
              '******'
            ) : (
              <Fragment>
                {poSourcePlatform === 'ERP' ? formatNumber(text, false, false) : formatNumber(text)}
                {[-1, 1].includes(record.modifyPriceFlag) && (
                  <img
                    style={{ marginBottom: '2px' }}
                    src={record.modifyPriceFlag === 1 ? rise : decline}
                    alt="img"
                  />
                )}
              </Fragment>
            ),
        },
        {
          title: intl
            .get(`sodr.common.model.common.taxExcludedFreightPrice`)
            .d('原币含税单价（不含运费）'),
          dataIndex: 'taxWithoutFreightPrice',
          width: 190,
          align: 'right',
          render: (text, record) =>
            record.priceShieldFlag === 1
              ? '******'
              : poSourcePlatform === 'ERP'
              ? formatNumber(text, false, false)
              : formatNumber(text),
        },
      ];
      dynamicColumns.get('basic').splice(
        dynamicColumns
          .get('basic')
          .findIndex(({ dataIndex }) => dataIndex === 'enteredTaxIncludedPrice'),
        1,
        ...priceItem
      );
    }
    // return actionKey !== 'partners'
    //   ? actionKey === 'basic' || actionKey === 'others'
    //     ? dynamicColumns.get(actionKey)
    //     : defaultColumns.concat(dynamicColumns.get(actionKey))
    //   : dynamicColumns.get(actionKey);
    return actionKey !== 'partners'
      ? defaultColumns.concat(dynamicColumns.get(actionKey))
      : dynamicColumns.get(actionKey);
  }

  /**
   * handleOnRadioGroupChange - tabs change事件
   * @param {!object} e - 事件对象
   */
  handleOnRadioGroupChange(key) {
    const { onRadioGroupChange = (e) => e } = this.props;
    onRadioGroupChange(key);
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
    const { setActionListCommonRow = (e) => e, actionListCommonRow, radioGroupValue } = this.props;
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
      customizeTable,
      radioGroupValue,
      evaluationDataSource = {},
      settings = {},
      sourceFromCancel,
      customizeTabPane,
      // form,
      customizeForm,
    } = this.props;
    // const { showEvaluationFlag } = evaluationDataSource;
    const { customVisable, customData, specsJsonType } = this.state;
    const columns =
      radioGroupValue === 'evaluation' ? [] : this.getColumns(radioGroupValue).filter((i) => i);
    let scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const srcollY =
      radioGroupValue === 'basic' || radioGroupValue === 'others' || radioGroupValue === 'invoice'
        ? 470
        : 0;
    if (radioGroupValue === 'basic') scrollX += 300;
    const actionTableKey = ['basic', 'others', 'invoice'].includes(radioGroupValue)
      ? 'common'
      : radioGroupValue;
    const tableProps = {
      columns,
      dataSource: dataSource[actionTableKey] || [],
      pagination: pagination[actionTableKey],
      loading:
        processing.queryDetailListLoading ||
        (processing.queryPartnersLoading && radioGroupValue === 'partners'),
      bordered: true,
      onChange: this.handleOnChange.bind(this),
      scroll: { x: scrollX >= 1200 && radioGroupValue !== 'invoice' ? scrollX : false, y: srcollY },
      rowKey: radioGroupValue === 'partners' ? 'poPartnerId' : 'poLineLocationId',
    };
    const evaluationProps = {
      evaluationDataSource,
      // form,
      customizeForm,
    };

    if (radioGroupValue !== 'partners') {
      tableProps.onRow = this.onTableRow;
    }

    const CustomSpecProps = {
      specsJsonType,
      visible: customVisable,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisable: false });
      },
    };
    return (
      <Fragment>
        {customizeTabPane(
          {
            code: sourceFromCancel
              ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.TAB'
              : 'SODR.SEND_ORDER_DETAIL.TAB',
            custDefaultActive: (key) => this.handleOnRadioGroupChange(key || 'basic'),
          },
          <Tabs onChange={this.handleOnRadioGroupChange} className="detail-list" animated={false}>
            <TabPane key="basic" tab={intl.get(`${titlePrompt}.basicInfo`).d('基础信息')}>
              {radioGroupValue === 'basic' &&
                customizeTable(
                  {
                    code: sourceFromCancel
                      ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.LINE'
                      : 'SODR.SEND_ORDER_DETAIL.BASIC',
                  },
                  <EditTable {...tableProps} />
                )}
            </TabPane>
            <TabPane key="others" tab={intl.get(`${titlePrompt}.otherInfo`).d('其他信息')}>
              {radioGroupValue === 'others' &&
                customizeTable(
                  {
                    code: sourceFromCancel
                      ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.OTHER'
                      : 'SODR.SEND_ORDER_DETAIL.OTHER',
                  },
                  <EditTable {...tableProps} />
                )}
            </TabPane>
            <TabPane
              disabled={processing.queryDetailListLoading}
              key="invoice"
              tab={intl.get(`${titlePrompt}.docRelate`).d('关联单据')}
            >
              {radioGroupValue === 'invoice' &&
                customizeTable(
                  {
                    code: sourceFromCancel
                      ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.INVOICE'
                      : 'SODR.SEND_ORDER_DETAIL.INVOICE',
                  },
                  <EditTable {...tableProps} />
                )}
            </TabPane>

            <TabPane key="partners" tab={intl.get(`${titlePrompt}.partners`).d('合作方')}>
              <EditTable {...tableProps} />
            </TabPane>
            {settings['010217'] === '1' && (
              <TabPane
                key="evaluation"
                tab={intl.get(`sodr.common.view.message.evaluate`).d('评价')}
              >
                <Evaluation {...evaluationProps} />
              </TabPane>
            )}
          </Tabs>
        )}
        {customVisable && <CustomSpecModal {...CustomSpecProps} />}
      </Fragment>
    );
  }
}
