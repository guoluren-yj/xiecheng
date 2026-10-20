/**
 * List - 订单确认 - 明细页面表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { sum, isNumber, isFunction, isNil, isEqual, debounce } from 'lodash';
// import { add, format, bignumber } from 'mathjs';
import { math } from 'choerodon-ui/dataset';
import { BigNumber } from 'bignumber.js';
import EditTable from 'components/EditTable';
import { Form, Tabs, InputNumber, DatePicker, Input, Button, Select, Tooltip } from 'hzero-ui';
import moment from 'moment';

import notification from 'utils/notification';
import UploadModal from 'components/Upload';
import intl from 'utils/intl';
import Switch from 'components/Switch';
import { getDateFormat } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { dateRender } from 'utils/renderer';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';

import { BUCKET_NAME, MAX_QUAN_NUMBER, LINE_DIRECTORY } from '@/routes/components/utils/constant';
import {
  formatAumont,
  parseAumont,
  formatNumber,
  getDynamicLabel,
  conversionUpdateForH0,
} from '@/routes/components/utils';
import styles from './index.less';
import CustomSpecModal from '@/routes/QuotePurchaseRequisition/components/CustomSpecModal';

// RadioGroup组件初始化
// const RadioGroup = Radio.Group;
// RadioButton组件初始化
const { TextArea } = Input;
// const RadioButton = Radio.Button;
const { TabPane } = Tabs;
const { Option } = Select;
const FormItem = Form.Item;

// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.confirmOrder.model.common';
// 设置sodr国际化前缀 - common - message
const viewMessagePrompt = 'sodr.confirmOrder.view.message';
// 设置通用国际化前缀
const commonPrompt = 'hzero.common';
// 设置entityItem国际化前缀
const entityItem = 'entity.item';
// 设置sodr国际化前缀 - common - model
const modelCommonPrompt = 'sodr.common.model.common';

// function numberFormat(val) {
//   if (val) {
//     const count = countDecimals(val);
//     return isNumber(val) && !isNaN(val) ? numberRender(val, count <= 2 ? 2 : count) : val;
//   }
// }

// function countDecimals(val) {
//   return isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? `${val}`.split('.')[1].length || 0
//     : 0;
// }

/**
 * List - 业务组件 - 订单确认
 * @extends {Component} - React.Component
 * @reactProps {!Object} [processing={}] - dispatch处理过程
 * @reactProps {Array<Object>} [dataSource=[]] - 数据源
 * @reactProps {object} [pagination={}]
 * @reactProps {function} [assignDataSource= (e => e)] - 合并数据
 * @reactProps {function} [openBOMModal= (e => e)] 打开BOM
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @return React.element
 */
export default class List extends PureComponent {
  constructor(props) {
    super(props);

    // 方法注册
    [
      'getColumns',
      'handleOnRadioGroupChange',
      'onTableRow',
      'handleMaintain',
      'calculateDoubleUom',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.state = {
      customVisable: false,
      customData: [],
      specsJsonType: 'custom',
    };
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

  calculateDoubleUom(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'quotePurchaseRequisition/calculateDoubleUom',
      payload,
    });
  }

  /**
   * saveRowData - 合并行数据
   * @param {object} rowData - 行数据
   */
  saveRowData(rowData) {
    const { dataSource = [], assignDataSource = (e) => e } = this.props;
    assignDataSource(dataSource.common.map((n) => (n.key === rowData.key ? rowData : n)));
  }

  /**
   * setRowBackground - 根据deliveryDateRejectFlag设置行背景
   * @param {object} record - 行数据
   */
  setRowBackground(record) {
    return {
      background:
        record.frozenFlag === 1 || record.cancelledFlag === 1 || record.cancelledFlag === 3
          ? '#eee'
          : record.deliveryDateRejectFlag === 1
          ? '#fff0cc'
          : '#fff',
    };
  }

  async handleSecondaryNumChange(value, record, doubleUnitEnabled) {
    const { itemCode } = record;
    if (!value) return;
    if (!doubleUnitEnabled) {
      record.$form.getFieldDecorator('secondaryQuantity', {
        initialValue: record.secondaryQuantity,
      });
      record.$form.setFieldsValue({ secondaryQuantity: value });
    } else {
      if (!itemCode) {
        record.$form.setFieldsValue({ quantity: value });
        return;
      }
      await conversionUpdateForH0({
        record,
        doubleUnitEnabled,
        clearQuantity: true,
        query: this.calculateDoubleUom,
      });
    }
  }

  // 数量改变，同时修改其他价格
  handleQuantityChange = debounce(async (val, record) => {
    if (record.priceShieldFlag && Number(record.priceShieldFlag) === 1) return;
    // 输入是数字或者字符串，则返回
    if (!val && val !== 0) return;
    if (!val.toString().match(/^[1-9]\d*|0$/)) return;
    const { onHeaderSetState, onLineSetState, doubleUnitEnabled, amountCalcRule } = this.props;
    const {
      keyId,
      returnedFlag,
      benchmarkPriceType,
      enteredTaxIncludedPrice: taxUnitPrice,
      unitPrice: netUnitPrice,
      unitPriceBatch: each,
      taxRate = 0,
      defaultPrecision,
      financialPrecision,
      taxRateType,
    } = record;
    await this.handleSecondaryNumChange(val, record, doubleUnitEnabled);
    const returnedBaseNum = returnedFlag === 1 ? -1 : 1;
    const quantity = record.$form.getFieldValue('quantity');
    const calculate = amountCalculation({
      hasTax: benchmarkPriceType !== 'NET_PRICE',
      hasMount: true,
      each,
      taxRate,
      taxUnitPrice,
      netUnitPrice,
      quantity,
      financialPrecision,
      defaultPrecision,
      caclRule: amountCalcRule,
      taxRateType,
    });
    const { calcTaxAmount, calcNetAmount } = calculate;
    if (isFunction(onHeaderSetState) && isFunction(onLineSetState)) {
      onLineSetState(
        {
          keyId,
          lineAmount: math.multipliedBy(
            new BigNumber(calcNetAmount),
            new BigNumber(returnedBaseNum)
          ),
          taxIncludedLineAmount: math.multipliedBy(
            new BigNumber(calcTaxAmount),
            new BigNumber(returnedBaseNum)
          ),
        },
        () => {
          const { dataSource = [] } = this.props;
          // 头上含税金额=各行含税行金额之和
          const taxIncludeAmount = dataSource.common.reduce((total, item) => {
            return math.plus(new BigNumber(total), BigNumber(item.taxIncludedLineAmount));
          }, 0);
          // 头上不含税金额=各行不含税行金额之和
          const amount = dataSource.common.reduce((total, item) => {
            return math.plus(BigNumber(total), BigNumber(item.lineAmount));
          }, 0);
          onHeaderSetState({
            taxIncludeAmount,
            amount,
          });
        }
      );
    }
  }, 300);

  /**
   * 批量维护
   */
  handleMaintain() {
    const {
      form: { getFieldsValue },
      selectedListRows = [],
      handleChangeOrderField,
    } = this.props;

    const { promiseDeliveryDate, orderField } = getFieldsValue();

    if (selectedListRows.length > 0) {
      if (promiseDeliveryDate) {
        handleChangeOrderField(orderField);

        selectedListRows.map((item) => {
          item.$form.setFieldsValue({ [orderField]: promiseDeliveryDate });
          return {
            ...item,
          };
        });
      }
    } else {
      notification.warning({
        message: intl.get(`sodr.common.view.message.moreThanOneNumber`).d('请至少勾选一条数据'),
      });
    }
  }

  /**
   * getColumns - 组装columns
   * @param {!string} actionKey - tab 切换key
   */
  getColumns(actionKey) {
    const {
      openBOMModal = (e) => e,
      // promiseDeliveryDateNotNullFlag,
      poSourcePlatform,
      amountFinancialPrecision,
      headerInfo = {},
      doubleUnitEnabled,
      purchaseLineType = [],
    } = this.props;
    const { transactionMode } = headerInfo;
    const isECOMMERCE = poSourcePlatform === 'E-COMMERCE'; // 电商订单
    const defaultColumns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'displayStatusMeaning',
        width: 100,
        className: 'status',
      },
      {
        title: intl.get(`${modelPrompt}.displayLineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 60,
      },
      {
        title: intl.get(`${modelPrompt}.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        width: 100,
        dataIndex: 'projectCategoryMeaning',
      },
      {
        title: intl.get(`${entityItem}.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('itemCode', { initialValue: val })(<span>{val}</span>)}
            {record.$form.getFieldDecorator('itemId', { initialValue: record.itemId })}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`${entityItem}.name`).d('物料名称'),
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
            width: 120,
            render: (val, record) =>
              !['CLOSED', 'CANCELED', 'CLOSETOBECOMFIRMED', 'CANCELTOBECOMFIRMED'].includes(
                record.displayStatusCode
              ) && record.quantityEditFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryQuantity', {
                    initialValue: val,
                    rules: [
                      {
                        required: record.quantityEnableFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${modelPrompt}.quantity`).d('数量'),
                        }),
                      },
                      {
                        pattern: /\d/,
                        message: intl.get(`hzero.common.validation.requireNumber`).d('请输入数字'),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      // 最大值限制，若为老的单子，是没有 原需求数量这个值的，需要兼容，不能定死为0
                      // max={!record.originalQuantity ? Infinity : record.originalQuantity}
                      max={
                        !math.isZero(record.originalQuantity) && !isNil(record.originalQuantity)
                          ? record.originalQuantity
                          : MAX_QUAN_NUMBER
                      }
                      onChange={(e) => {
                        if (!doubleUnitEnabled) return;
                        this.handleQuantityChange(e, record);
                        setTimeout(() => this.forceUpdate(), 600);
                      }}
                      disabled={transactionMode === 'TRIPARTITE'}
                      parser={(value) => parseAumont(value, record.secondaryUomPrecision)}
                      allowThousandth="true"
                    />
                  )}
                </Form.Item>
              ) : isEqual(
                  new BigNumber(record.secondaryQuantity),
                  new BigNumber(record.originalQuantity)
                ) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryQuantity', { initialValue: val })(
                    <span>{formatAumont(record.$form.getFieldValue('secondaryQuantity'))}</span>
                  )}
                </Form.Item>
              ) : (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryQuantity', { initialValue: val })(
                    <span className="font-red-color">
                      {formatAumont(record.$form.getFieldValue('secondaryQuantity'))}
                    </span>
                  )}
                </Form.Item>
              ),
          },
          {
            title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
            dataIndex: 'quantity',
            width: 120,
            render: (val, record) => {
              return !['CLOSED', 'CANCELED', 'CLOSETOBECOMFIRMED', 'CANCELTOBECOMFIRMED'].includes(
                record.displayStatusCode
              ) &&
                record.quantityEditFlag &&
                !doubleUnitEnabled ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('quantity', {
                    initialValue: val,
                    rules: [
                      {
                        required: record.quantityEnableFlag && !doubleUnitEnabled,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${modelPrompt}.quantity`).d('数量'),
                        }),
                      },
                      {
                        pattern: /\d/,
                        message: intl.get(`hzero.common.validation.requireNumber`).d('请输入数字'),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      // 最大值限制，若为老的单子，是没有 原需求数量这个值的，需要兼容，不能定死为0
                      max={
                        !math.isZero(record.originalQuantity) &&
                        !isNil(record.originalQuantity) &&
                        !doubleUnitEnabled
                          ? record.originalQuantity
                          : MAX_QUAN_NUMBER
                      }
                      onChange={(e) => {
                        this.handleQuantityChange(e, record);
                        setTimeout(() => this.forceUpdate(), 600);
                      }}
                      disabled={doubleUnitEnabled || transactionMode === 'TRIPARTITE'}
                      parser={(value) => parseAumont(value, record.uomPrecision)}
                      allowThousandth="true"
                    />
                  )}
                  {!doubleUnitEnabled &&
                    record.$form.getFieldDecorator('secondaryQuantity', {
                      initialValue: record.secondaryQuantity,
                    })}
                </Form.Item>
              ) : doubleUnitEnabled ||
                isEqual(new BigNumber(record.quantity), new BigNumber(record.originalQuantity)) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('quantity', { initialValue: val })(
                    <span>{formatAumont(record.$form.getFieldValue('quantity'))}</span>
                  )}
                </Form.Item>
              ) : (
                <Form.Item>
                  {record.$form.getFieldDecorator('quantity', { initialValue: val })(
                    <span className="font-red-color">
                      {formatAumont(record.$form.getFieldValue('quantity'))}
                    </span>
                  )}
                </Form.Item>
              );
            },
          },
          {
            title: intl.get(`${modelPrompt}.originalQuantity`).d('原需求数量'),
            dataIndex: 'originalQuantity',
            width: 150,
            render: (val) => formatAumont(val),
          },
          doubleUnitEnabled && {
            title: intl.get(`${modelPrompt}.uomName`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 150,
            onCell,
            render: (val, record) => (
              <Form.Item>
                {record.$form.getFieldDecorator('secondaryUomName', { initialValue: val })(
                  <span>{record.secondaryUomCodeAndName}</span>
                )}
                {record.$form.getFieldDecorator('secondaryUomId', {
                  initialValue: record.secondaryUomId,
                })}
              </Form.Item>
            ),
          },
          {
            title: getDynamicLabel(doubleUnitEnabled, 'uom'),
            dataIndex: 'uomName',
            width: 150,
            onCell,
            render: (val, record) => (
              <Form.Item>
                {record.$form.getFieldDecorator('uomName', { initialValue: val })(
                  <span>{record.uomCodeAndName}</span>
                )}
                {record.$form.getFieldDecorator('uomId', { initialValue: record.uomId })}
              </Form.Item>
            ),
          },
          {
            title: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
            dataIndex: 'needByDate',
            width: 120,
            render: (text) => {
              const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : text;
              const formatDom = dateRender(dom) || null;
              return <>{formatDom}</>;
            },
          },
          {
            title: intl.get(`${modelPrompt}.promiseDeliveryDate`).d('承诺交货日期'),
            dataIndex: 'promiseDeliveryDate',
            width: 160,
            render: (val, record) =>
              !['CLOSED', 'CANCELED', 'CLOSETOBECOMFIRMED', 'CANCELTOBECOMFIRMED'].includes(
                record.displayStatusCode
              ) && record.deliveryDateEditFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('promiseDeliveryDate', {
                    initialValue: val ? moment(val, DEFAULT_DATE_FORMAT) : null,
                    rules: [
                      {
                        required: record.deliveryDateEnableFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${modelPrompt}.promiseDeliveryDate`).d('承诺交货日期'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      format={getDateFormat()}
                      onChange={() => setTimeout(() => this.forceUpdate(), 600)}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              ) : (
                val && moment(val).format(DEFAULT_DATE_FORMAT)
              ),
          },
          {
            title: intl.get(`${modelPrompt}.unitPrice`).d('不含税单价'),
            dataIndex: 'unitPrice',
            width: 130,
            align: 'right',
            render: (text, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : poSourcePlatform === 'ERP' ||
                  ((poSourcePlatform === 'CATALOGUE' || poSourcePlatform === 'E-COMMERCE') &&
                    headerInfo.sourceOfTransferOrder === 'AUTOTRANSFER')
                ? formatAumont(text)
                : formatAumont(text, record.defaultPrecision),
          },
          {
            title: intl.get(`${modelPrompt}.taxedEnteredUnitPrice`).d('原币含税单价'),
            dataIndex: 'enteredTaxIncludedPrice',
            align: 'right',
            width: 130,
            render: (text, record) =>
              record.priceShieldFlag === 1
                ? '******'
                : poSourcePlatform === 'ERP' ||
                  ((poSourcePlatform === 'CATALOGUE' || poSourcePlatform === 'E-COMMERCE') &&
                    headerInfo.sourceOfTransferOrder === 'AUTOTRANSFER')
                ? formatAumont(text)
                : formatAumont(text, record.defaultPrecision),
          },
          {
            title: intl.get(`${modelPrompt}.unitPriceBatch`).d('每'),
            dataIndex: 'unitPriceBatch',
            width: 90,
            render: (text) => formatAumont(text),
          },
          {
            title: intl.get(`${modelPrompt}.lineAmount`).d('不含税行金额'),
            dataIndex: 'lineAmount',
            align: 'right',
            width: 130,
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
            align: 'right',
            width: 130,
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
            width: 90,
            // render: (text) => (!isNil(text) || math.isBigNumber(text)) && new BigNumber(text),
          },
          {
            title: intl.get(`${modelPrompt}.currencyName`).d('币种'),
            dataIndex: 'currencyCode',
            width: 80,
          },
          {
            title: intl.get('sodr.common.model.common.department').d('部门'),
            dataIndex: 'departmentName',
            width: 130,
          },
          {
            title: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
            dataIndex: 'costName',
            width: 180,
          },
          {
            title: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
            dataIndex: 'accountSubjectName',
            width: 180,
          },
          {
            title: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
            dataIndex: 'wbs',
            width: 180,
          },
          {
            title: intl.get(`${modelPrompt}.organizationName`).d('收货组织'),
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
            title: intl.get(`${modelPrompt}.specifications`).d('规格'),
            dataIndex: 'specifications',
            width: 60,
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
            title: intl.get(`${modelPrompt}.model`).d('型号'),
            dataIndex: 'model',
            width: 90,
          },
          {
            title: intl
              .get(`sprm.purchaseReqCreation.model.common.customSpecsJson`)
              .d('定制品属性'),
            width: 150,
            dataIndex: 'customSpecsJson',
            render: (val) => (
              <a
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
            title: intl.get(`${modelPrompt}.brand`).d('品牌'),
            dataIndex: 'brand',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`${modelPrompt}.purchaserRemark`).d('采购方行备注'),
            dataIndex: 'remark',
            width: 180,
            onCell,
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
            title: intl.get(`${modelPrompt}.feedback`).d('反馈信息'),
            dataIndex: 'feedback',
            width: 240,
            render: (val, record) =>
              !['CLOSED', 'CANCELED', 'CLOSETOBECOMFIRMED', 'CANCELTOBECOMFIRMED'].includes(
                record.displayStatusCode
              ) && !record.confirmFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('feedback', {
                    initialValue: val,
                  })(<TextArea style={{ resize: 'vertical' }} rows={1} />)}
                </Form.Item>
              ) : (
                val
              ),
          },
          {
            title: intl.get(`sodr.common.model.common.lineAttachmentUuid`).d('行附件'),
            dataIndex: 'attachmentUuid',
            width: 100,
            render: (value, record) => (
              <UploadModal
                bucketName={BUCKET_NAME}
                bucketDirectory={LINE_DIRECTORY}
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
                      {purchaseLineType.map((item) => {
                        return <Select.Option key={item.value}>{item.meaning}</Select.Option>;
                      })}
                    </Select>
                  )}
                </FormItem>
              );
            },
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
        ],
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
            title: intl.get(`${modelPrompt}.rate`).d('汇率'),
            dataIndex: 'exchangeRate',
            width: 90,
          },
          {
            title: intl.get(`${modelPrompt}.consignedFlag`).d('是否寄售'),
            dataIndex: 'consignedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          // {
          //   title: intl.get(`${modelPrompt}.projectCategory`).d('是否委外'),
          //   dataIndex: 'projectCategory',
          //   width: 90,
          //   render: text =>
          //     intl
          //       .get(`hzero.common${text === '1' ? '.status.yes' : '.status.no'}`)
          //       .d(text === '1' ? '是' : '否'),
          // },
          {
            title: intl.get(`${modelPrompt}.returnedFlag`).d('是否退回'),
            dataIndex: 'returnedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.freeFlag`).d('是否免费'),
            dataIndex: 'freeFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.immedShippedFlag`).d('是否直发'),
            dataIndex: 'immedShippedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`${commonPrompt}${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`${modelPrompt}.bom`).d('外协BOM'),
            width: 110,
            dataIndex: 'bom',
            render: (text, record) => (
              <a onClick={() => openBOMModal(record)}>
                {intl.get(`${commonPrompt}.button.view`).d('查看')}
              </a>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.purReqLineNum`).d('采购申请号|行号'),
            dataIndex: 'displayPrNumAndDisplayPrLineNum',
            width: 180,
          },
          {
            title: intl.get(`sodr.common.model.quotePurchase.number`).d('采购协议号|行号'),
            dataIndex: 'contractNum',
            width: 180,
          },
          {
            title: intl.get(`sodr.common.model.common.sourceLineNum`).d('寻源单号|行号'),
            dataIndex: 'sourceNumAndLine',
            width: 180,
            render: (val, record) => val || record.sourceCodeNum,
          },
          {
            title: intl.get(`${modelPrompt}.purReqAppliedName`).d('申请人'),
            dataIndex: 'purReqAppliedName',
            width: 90,
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
            title: intl.get(`${modelPrompt}.shipToThirdPartyContact`).d('联系人信息'),
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
            title: intl.get(`${modelPrompt}.priceUomConversion`).d('单位转换关系'),
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
            title: intl.get(`${modelPrompt}.partnerType`).d('合作类型'),
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
            title: intl.get(`${modelPrompt}.dataSourceCode`).d('来源系统'),
            dataIndex: 'externalSystemCode',
            width: 120,
          },
        ],
      ],
    ]);

    if (isECOMMERCE) {
      dynamicColumns.forEach((item, key) => {
        if (key === 'basic') {
          item.splice(19, 0, {
            title: intl.get('sodr.common.model.common.jdPrice').d('划线价'),
            dataIndex: 'jdPrice',
            align: 'right',
            width: 120,
            render: (val) => formatNumber(val),
          });
        }
      });
    }

    function onCell() {
      return {
        style: {
          overflow: 'hidden',
          maxWidth: 240,
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
      orderFields = [],
      pagination,
      processing,
      radioGroupValue,
      customizeTable,
      customizeTabPane,
      form: { getFieldDecorator },
      handleRowSelectedChange = (e) => e,
      selectedListRows = [],
      // fetchDetailList = (e) => e,
      handleChangeLineDisplay = (e) => e,
      // headerInfo = {},
      dateEditFlag,
    } = this.props;
    const { customVisable, customData, specsJsonType } = this.state;
    const columns = this.getColumns(radioGroupValue).filter((i) => i);
    let scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    if (radioGroupValue === 'basic') scrollX += 300;
    // const components = {
    //   body: {
    //     row: EditableFormRow,
    //   },
    // };
    const rowSelection = {
      selectedRowKeys: selectedListRows.map((n) => n.keyId),
      onChange: handleRowSelectedChange,
      getCheckboxProps: (record) => ({
        disabled:
          ['CLOSED', 'CANCELED', 'CLOSETOBECOMFIRMED', 'CANCELTOBECOMFIRMED'].includes(
            record.displayStatusCode
          ) || record.confirmFlag,
      }),
    };
    const actionTableKey = ['basic', 'others', 'invoice'].includes(radioGroupValue)
      ? 'common'
      : radioGroupValue;
    const tableProps = {
      rowKey: 'keyId',
      columns,
      rowSelection,
      dataSource: dataSource[actionTableKey] || [],
      pagination: pagination[actionTableKey],
      loading:
        processing.queryDetailListLoading ||
        processing.calculateDoubleUomLoading ||
        (processing.queryPartnersLoading && radioGroupValue === 'partners'),
      bordered: true,
      onChange: this.handleOnChange.bind(this),
      scroll: {
        x: scrollX >= 1200 && radioGroupValue !== 'invoice' ? scrollX : false,
        y: 'calc(100vh - 390px)',
      },
    };
    if (actionTableKey === 'common') {
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
            code: 'SODR.CONFIRM_ORDER_DETAIL.TAB',
          },
          <Tabs
            style={{ marginBottom: 16 }}
            value={radioGroupValue}
            onChange={this.handleOnRadioGroupChange}
            animated={false}
          >
            <TabPane
              key="basic"
              tab={intl.get(`${viewMessagePrompt}.title.basicInfo`).d('基础信息')}
            >
              <div
                className={styles['purchase-application']}
                style={{ display: 'flex', justifyContent: 'end' }}
              >
                <Form layout="inline">
                  <Form.Item
                    label={intl
                      .get(`sodr.common.model.common.newHideCloseAndCancelLines`)
                      .d('隐藏不可反馈订单行')}
                  >
                    <Switch defaultChecked onChange={handleChangeLineDisplay} />
                  </Form.Item>
                </Form>
                {dateEditFlag === 1 && (
                  <Form layout="inline">
                    <Form.Item style={{ marginRight: 0 }}>
                      <Button
                        data-code="search"
                        htmlType="submit"
                        type="primary"
                        onClick={this.handleMaintain}
                        disabled={dataSource.length === 0}
                      >
                        <a>
                          {intl
                            .get(`sodr.quotePurchase.model.quotePurchase.batchMaintain`)
                            .d('批量维护')}
                        </a>
                      </Button>
                    </Form.Item>
                    <Form.Item>
                      {getFieldDecorator(`promiseDeliveryDate`)(
                        <DatePicker placeholder={null} format={getDateFormat()} />
                      )}
                    </Form.Item>
                    <Form.Item>
                      {getFieldDecorator('orderField', {
                        initialValue: orderFields[0]?.value,
                      })(
                        <Select style={{ width: 130 }}>
                          {orderFields.map((n) => (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Form>
                )}
              </div>
              {radioGroupValue === 'basic' &&
                customizeTable(
                  {
                    code: 'SODR.CONFIRM_ORDER_DETAIL.BASIC',
                  },
                  <EditTable {...tableProps} />
                )}
            </TabPane>

            <TabPane
              key="others"
              tab={intl.get(`${viewMessagePrompt}.title.otherInfo`).d('其他信息')}
            >
              {radioGroupValue === 'others' &&
                customizeTable(
                  {
                    code: 'SODR.CONFIRM_ORDER_DETAIL.OTHER',
                  },
                  <EditTable {...tableProps} />
                )}
            </TabPane>

            <TabPane
              disabled={processing.queryDetailListLoading}
              key="invoice"
              tab={intl.get(`${viewMessagePrompt}`).d('关联单据')}
            >
              <EditTable {...tableProps} />
            </TabPane>

            <TabPane
              key="partners"
              tab={intl.get(`${viewMessagePrompt}.title.partners`).d('合作方')}
            >
              <EditTable {...tableProps} />
            </TabPane>
          </Tabs>
        )}
        {customVisable && <CustomSpecModal {...CustomSpecProps} />}
      </Fragment>
    );
  }
}
