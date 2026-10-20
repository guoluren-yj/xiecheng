/**
 * OtherInfoList - 订单确认 - 明细页面表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { sum, isNumber, isFunction, isNil, debounce } from 'lodash';
// import { add, format, bignumber } from 'mathjs';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
import {
  Row,
  Col,
  Tabs,
  Table,
  Tooltip,
  Form,
  DatePicker,
  InputNumber,
  Input,
  Select,
} from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
// import { numberRender } from 'utils/renderer';
import UploadModal from 'components/Upload';
import EditTable from 'components/EditTable';
import {
  dateRender, // 日期时间格式化
} from 'hzero-front/lib/utils/renderer';
// import Switch from 'components/Switch';yarn
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import Switch from 'components/Switch';
import urgentImg from '@/assets/icon-expedited.svg';
import yanqiImg from '@/assets/yanqi.svg';
import rise from '@/assets/rise.svg';
import decline from '@/assets/decline.svg';
import abnormal from '@/assets/abnormal.svg';
import {
  formatAumont,
  formatNumber,
  parseAumont,
  getDynamicLabel,
  conversionUpdateForH0,
} from '@/routes/components/utils';
import Evaluation from './Evaluation';
import CustomSpecModal from '@/routes/QuotePurchaseRequisition/components/CustomSpecModal';
import { BUCKET_NAME, MAX_QUAN_NUMBER, LINE_DIRECTORY } from '@/routes/components/utils/constant';
// import styles from './index.less';

// RadioGroup组件初始化
// RadioButton组件初始化
const { TabPane } = Tabs;
const { TextArea } = Input;
const FormItem = Form.Item;
// 设置sodr国际化前缀 - common - model
const modelCommonPrompt = 'sodr.common.model.common';
// EditableContext组件初始化
// const EditableContext = React.createContext();
// EditableRow组件初始化
// const EditableRow = ({ form, index, ...props }) => {
//   return (
//     <EditableContext.Provider value={form}>
//       <tr {...props} />
//     </EditableContext.Provider>
//   );
// };

// EditableRow组件form高阶化处理,传入form
// const EditableFormRow = Form.create({ fieldNameProp: null })(EditableRow);

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
@Form.create({ fieldNameProp: null })
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['getColumns', 'handleOnRadioGroupChange', 'onTableRow', 'Time', 'calculateDoubleUom'].forEach(
      (method) => {
        this[method] = this[method].bind(this);
      }
    );

    this.state = {
      customVisable: false,
      customData: [],
      specsJsonType: 'custom',
    };
  }

  componentDidUpdate(prevProps) {
    const currentData = prevProps.form.getFieldsValue();
    const { basicFormData, handleChangeLineDisplay } = this.props;
    if (JSON.stringify(currentData) !== JSON.stringify(basicFormData)) {
      handleChangeLineDisplay(currentData);
    }
  }

  Time(day) {
    const toDay = new Date();
    return moment(toDay).diff(moment(day), 'days');
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
  setRowBackground(record) {
    return record.cancelledFlag === 1 || record.cancelledFlag === 3 || record.frozenFlag === 1
      ? { background: '#eee' }
      : null;
  }

  calculateDoubleUom(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'quotePurchaseRequisition/calculateDoubleUom',
      payload,
    });
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
    if (val && !val.toString().match(/^[1-9]\d*|0$/)) return;
    const { onHeaderSetState, onLineSetState, doubleUnitEnabled, amountCalcRule } = this.props;
    await this.handleSecondaryNumChange(val, record, doubleUnitEnabled);
    const quantity = record.$form.getFieldValue('quantity');
    // const { enteredTaxIncludedPrice, taxRate, key, unitPriceBatch } = record;
    // const returnedBaseNum = record.returnedFlag === 1 ? -1 : 1;
    // // 行上含税行金额=新的数量*原币含税单价
    // const taxIncludedLineAmount = Number(
    //   format(
    //     unitPriceBatch
    //       ? multiply(
    //           multiply(bignumber(val), bignumber(enteredTaxIncludedPrice)) /
    //             bignumber(unitPriceBatch),
    //           bignumber(returnedBaseNum)
    //         )
    //       : multiply(
    //           bignumber(val),
    //           bignumber(enteredTaxIncludedPrice),
    //           bignumber(returnedBaseNum)
    //         ),
    //     14
    //   )
    // );
    // 行上不含税行金额=含税行金额/（1+税率）
    // const lineAmount = Number(
    //   format(ceil(bignumber(taxIncludedLineAmount) / bignumber(1 + taxRate / 100)), 14)
    // );
    const {
      key,
      taxRateType,
      returnedFlag,
      benchmarkPriceType,
      enteredTaxIncludedPrice: taxUnitPrice,
      unitPrice: netUnitPrice,
      unitPriceBatch: each,
      taxRate = 0,
      defaultPrecision,
      financialPrecision,
    } = record;
    const returnedBaseNum = returnedFlag === 1 ? -1 : 1;
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
          key,
          lineAmount: math.multipliedBy(
            new BigNumber(calcNetAmount),
            new BigNumber(returnedBaseNum)
          ),
          taxIncludedLineAmount: math.multipliedBy(
            new BigNumber(calcTaxAmount),
            new BigNumber(returnedBaseNum)
          ),
          quantity,
        },
        () => {
          const { dataSource = [] } = this.props;
          // 头上含税金额=各行含税行金额之和
          const taxIncludeAmount = dataSource.common.reduce((total, item) => {
            return math.plus(new BigNumber(total), new BigNumber(item.taxIncludedLineAmount));
          }, 0);
          // 头上不含税金额=各行不含税行金额之和
          const amount = dataSource.common.reduce((total, item) => {
            return math.plus(new BigNumber(total), new BigNumber(item.lineAmount));
          }, 0);
          onHeaderSetState({
            taxIncludeAmount,
            amount,
          });
        }
      );
    }
  }, 600);

  /**
   * getColumns - 组装columns
   * @param {!string} actionKey - tab 切换key
   */
  getColumns(actionKey) {
    const {
      openBOMModal = (e) => e,
      radioGroupValue,
      amountFinancialPrecision,
      headerInfo = {},
      doubleUnitEnabled,
      enumMap: { purchaseLineType = [] },
    } = this.props;
    const { transactionMode } = headerInfo;
    const getStatusRender = (value, record) => {
      // let render = '';
      // if (record.frozenFlag === 1) {
      //   render = intl.get('hzero.common.status.frozen').d('冻结');
      // }

      // if (record.cancelledFlag === 1) {
      //   render = intl.get('hzero.common.status.cancelled').d('取消');
      // }

      // if (record.closedFlag === 1) {
      //   render = intl.get('hzero.common.status.closed').d('关闭');
      // }
      return (
        <Fragment>
          {radioGroupValue === 'basic' && record.beyondQuantity > 0 ? (
            <Tooltip
              title={intl
                .get(`sodr.common.model.commo.orderDelayDays`, {
                  num: this.Time(record.promiseDeliveryDate),
                })
                .d(`订单超期${this.Time(record.promiseDeliveryDate)}天，请及时安排送货！`)}
            >
              <img src={yanqiImg} alt="img" />
            </Tooltip>
          ) : (
            ''
          )}
          {record.urgentFlag === 1 && (
            <img src={urgentImg} alt={intl.get('hzero.common.status.urgent').d('加急')} />
          )}
          {record.deliverySyncStatus === 'FAIL' ? (
            <Tooltip
              title={intl
                .get(`sodr.common.view.message.detailFeedbackMsg`)
                .d('承诺交期回传失败，请重新同步')}
            >
              <img src={abnormal} alt="img" style={{ width: 15, height: 15 }} />
            </Tooltip>
          ) : (
            ''
          )}
          {value}
        </Fragment>
      );
    };
    const defaultColumns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'displayStatusMeaning',
        width: 150,
        className: 'status',
        render: (text, record) => getStatusRender(text, record),
      },
      {
        title: intl.get(`sodr.common.model.common.displayLineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 60,
      },
      {
        title: intl.get(`sodr.common.model.common.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        dataIndex: 'projectCategoryMeaning',
        width: 100,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 90,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('itemCode', { initialValue: val })(<span>{val}</span>)}
            {record.$form.getFieldDecorator('itemId', { initialValue: record.itemId })}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
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
            title: intl.get(`sodr.common.model.common.quantity`).d('数量'),
            dataIndex: 'secondaryQuantity',
            width: 120,
            render: (val, record) =>
              record.quantityEditFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryQuantity', {
                    initialValue: val,
                    rules: [
                      {
                        required: record.quantityEnableFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`sodr.common.model.common.quantity`).d('数量'),
                        }),
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
                      disabled={!doubleUnitEnabled || transactionMode === 'TRIPARTITE'}
                      onChange={(e) => {
                        if (!doubleUnitEnabled) return;
                        this.handleQuantityChange(e, record);
                        setTimeout(() => this.forceUpdate(), 600);
                      }}
                      precision={record.secondaryUomPrecision}
                      allowThousandth="true"
                    />
                  )}
                </Form.Item>
              ) : (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryQuantity', { initialValue: val })(
                    <span>{formatAumont(record.$form.getFieldValue('secondaryQuantity'))}</span>
                  )}
                </Form.Item>
              ),
          },
          doubleUnitEnabled && {
            title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
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
            title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
            dataIndex: 'quantity',
            width: 120,
            render: (val, record) =>
              record.quantityEditFlag && !doubleUnitEnabled ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('quantity', {
                    initialValue: val,
                    rules: [
                      {
                        required: record.quantityEnableFlag && !doubleUnitEnabled,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`sodr.common.model.common.quantity`).d('数量'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      disabled={doubleUnitEnabled || transactionMode === 'TRIPARTITE'}
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
                      parser={(value) => parseAumont(value, record.uomPrecision)}
                      allowThousandth="true"
                    />
                  )}
                  {!doubleUnitEnabled &&
                    record.$form.getFieldDecorator('secondaryQuantity', {
                      initialValue: record.secondaryQuantity,
                    })}
                </Form.Item>
              ) : (
                <Form.Item>
                  {record.$form.getFieldDecorator('quantity', { initialValue: val })(
                    <span>{formatAumont(record.$form.getFieldValue('quantity'))}</span>
                  )}
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
            title: intl.get(`sodr.common.model.common.needByDate`).d('需求日期'),
            dataIndex: 'needByDate',
            width: 120,
            // render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : text),
            render: (text) => {
              const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
              const formatDom = dateRender(dom) || null;
              return <>{formatDom}</>;
            },
          },
          {
            title: intl.get(`sodr.common.model.common.promiseDeliveryDate`).d('承诺交货日期'),
            dataIndex: 'promiseDeliveryDate',
            width: 150,
            render: (val, record) => {
              if (record.deliveryDateEditFlag) {
                return (
                  <Form.Item>
                    {record.$form.getFieldDecorator('promiseDeliveryDate', {
                      initialValue: val ? moment(val) : undefined,
                      rules: [
                        {
                          required: record.deliveryDateEnableFlag,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`sodr.common.model.common.promiseDeliveryDate`)
                              .d('承诺交货日期'),
                          }),
                        },
                      ],
                    })(<DatePicker />)}
                  </Form.Item>
                );
              } else {
                const dom = val ? moment(val).format(DEFAULT_DATE_FORMAT) : null;
                const formatDom = dateRender(dom) || null;
                return <>{formatDom}</>;
              }
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
            title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
            dataIndex: 'unitPrice',
            width: 130,
            align: 'right',
            render: (text, record) =>
              record.priceShieldFlag === 1 ? (
                '******'
              ) : (
                <Fragment>
                  {headerInfo.poSourcePlatform === 'ERP'
                    ? formatAumont(text)
                    : formatAumont(text, record.defaultPrecision)}
                  {[-1, 1].includes(record.modifyPriceFlag) &&
                    record.benchmarkPriceType === 'NET_PRICE' && (
                      <img src={record.modifyPriceFlag === 1 ? rise : decline} alt="img" />
                    )}
                </Fragment>
              ),
          },
          {
            title: intl.get(`sodr.common.model.common.taxedEnteredUnitPrice`).d('原币含税单价'),
            dataIndex: 'enteredTaxIncludedPrice',
            width: 120,
            align: 'right',
            render: (text, record) =>
              record.priceShieldFlag === 1 ? (
                '******'
              ) : (
                <Fragment>
                  {headerInfo.poSourcePlatform === 'ERP'
                    ? formatAumont(text)
                    : formatAumont(text, record.defaultPrecision)}
                  {[-1, 1].includes(record.modifyPriceFlag) &&
                    record.benchmarkPriceType !== 'NET_PRICE' && (
                      <img src={record.modifyPriceFlag === 1 ? rise : decline} alt="img" />
                    )}
                </Fragment>
              ),
          },
          {
            title: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
            dataIndex: 'unitPriceBatch',
            width: 90,
            render: (value) => formatAumont(value),
          },
          {
            title: intl.get(`sodr.common.model.common.lineAmount`).d('不含税行金额'),
            dataIndex: 'lineAmount',
            width: 130,
            align: 'right',
            render: (text, record) => {
              return amountFinancialPrecision(
                record.priceShieldFlag,
                text,
                record.financialPrecision,
                headerInfo.poSourcePlatform,
                headerInfo.sourceOfTransferOrder
              );
            },
          },
          {
            title: intl.get(`sodr.common.model.common.taxIncludedLineAmount`).d('含税行金额'),
            dataIndex: 'taxIncludedLineAmount',
            width: 130,
            align: 'right',
            render: (text, record) => {
              return amountFinancialPrecision(
                record.priceShieldFlag,
                text,
                record.financialPrecision,
                headerInfo.poSourcePlatform,
                headerInfo.sourceOfTransferOrder
              );
            },
          },
          {
            title: `${intl.get(`sodr.common.model.common.taxRate`).d('税率')}(%)`,
            dataIndex: 'taxRate',
            width: 90,
            // render: (text) => (isNumber(Number(text)) ? Number(text) : 0),
          },
          {
            title: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
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
            width: 90,
          },
          {
            title: intl.get(`sodr.common.model.common.inventoryName`).d('收货库房'),
            dataIndex: 'inventoryName',
            width: 90,
          },
          {
            title: intl.get(`sodr.common.model.common.locationName`).d('收货库位'),
            dataIndex: 'locationName',
            width: 90,
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
            title: intl.get(`sodr.common.model.common.specifications`).d('规格'),
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
            title: intl.get(`sodr.common.model.common.model`).d('型号'),
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
            title: intl.get(`sodr.common.model.common.brand`).d('品牌'),
            dataIndex: 'brand',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`sodr.common.model.common.purchaserRemark`).d('采购方行备注'),
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
            title: intl.get(`sodr.common.model.common.feedback`).d('反馈信息'),
            dataIndex: 'feedback',
            onCell,
            width: 180,
            render: (value, record) => {
              return (
                <FormItem>
                  {record.$form.getFieldDecorator('feedback', { initialValue: value })(
                    <TextArea disabled style={{ resize: 'vertical' }} rows={1} />
                  )}
                </FormItem>
              );
            },
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
        ],
      ],

      [
        'others',
        [
          {
            title: intl.get(`sodr.common.model.common.itemType`).d('物品类型'),
            dataIndex: 'categoryName',
            width: 120,
            render: (val) => <Tooltip title={val}>{val}</Tooltip>,
          },
          {
            title: intl.get(`sodr.common.model.common.rate`).d('汇率'),
            dataIndex: 'exchangeRate',
            width: 90,
          },
          {
            title: intl.get(`sodr.common.model.common.consignedFlag`).d('是否寄售'),
            dataIndex: 'consignedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          // {
          //   title: intl.get(`sodr.common.model.common.projectCategory`).d('是否委外'),
          //   dataIndex: 'projectCategory',
          //   width: 90,
          //   render: text =>
          //     intl
          //       .get(`hzero.common${text === '1' ? '.status.yes' : '.status.no'}`)
          //       .d(text === '1' ? '是' : '否'),
          // },
          {
            title: intl.get(`sodr.common.model.common.returnedFlag`).d('是否退回'),
            dataIndex: 'returnedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`sodr.common.model.common.freeFlag`).d('是否免费'),
            dataIndex: 'freeFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          {
            title: intl.get(`sodr.common.model.common.immedShippedFlag`).d('是否直发'),
            dataIndex: 'immedShippedFlag',
            width: 90,
            render: (text) =>
              intl
                .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
                .d(text === 1 ? '是' : '否'),
          },
          // TODO 后端没字段
          {
            title: intl.get(`sodr.common.model.common.bom`).d('外协BOM'),
            dataIndex: 'bom',
            width: 100,
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
            title: intl.get(`sodr.common.model.common.purReqAppliedName`).d('申请人'),
            dataIndex: 'prRequestedName',
            width: 90,
            render: (_, record) => record.purReqAppliedName,
          },
          {
            title: intl.get(`sodr.common.model.common.commodityEncoding`).d('商品编码'),
            dataIndex: 'productNum',
            width: 130,
          },
          {
            title: intl.get(`sodr.common.model.common.tradeName`).d('商品名称'),
            dataIndex: 'productName',
            width: 100,
          },
          {
            title: intl.get(`sodr.common.model.common.catalogue`).d('商品目录'),
            dataIndex: 'catalogName',
            width: 100,
          },
          {
            title: intl.get(`sodr.common.model.common.shipToThirdPartyName`).d('送达方'),
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
            title: intl.get(`sodr.common.model.common.shipToThirdPartyContact`).d('联系人信息'),
            dataIndex: 'shipToThirdPartyContact',
            width: 150,
          },
          {
            title: intl.get(`sodr.common.model.common.receiveTelNum`).d('联系人电话'),
            dataIndex: 'receiveTelNum',
            width: 150,
            render: (val, record) => (
              <span>{val ? `${record.internationalTelCode || ''} ${val}` : ''}</span>
            ),
          },
          {
            title: intl.get(`sodr.common.model.common.priceUomName`).d('订单价格单位'),
            dataIndex: 'priceUomName',
            width: 120,
            render: (_, { priceUomCodeName }) => priceUomCodeName,
          },
          {
            title: intl.get(`sodr.common.model.common.priceUomConversion`).d('单位转换关系'),
            dataIndex: 'priceUomConversion',
            width: 150,
            onCell,
          },
          // {
          //   title: intl.get(`sodr.common.model.common.frozenFlag`).d('冻结状态'),
          //   dataIndex: 'frozenFlag',
          //   align: 'center',
          //   width: 90,
          //   render: text =>
          //     intl
          //       .get(`hzero.common${text === 1 ? '.status.yes' : '.status.no'}`)
          //       .d(text === 1 ? '是' : '否'),
          // },
        ],
      ],
      ['invoice', []],
      [
        'partners',
        [
          {
            title: intl.get(`sodr.common.model.common.partnerType`).d('合作类型'),
            dataIndex: 'partnerType',
            width: 150,
            onCell,
          },
          {
            title: intl.get(`sodr.common.model.common.partnerNum`).d('合作方编码'),
            dataIndex: 'partnerNum',
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.partnerName`).d('合作方名称'),
            dataIndex: 'partnerName',
            width: 120,
          },
          {
            title: intl.get(`sodr.common.model.common.dataSourceCode`).d('来源系统'),
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
    return actionKey !== 'partners'
      ? defaultColumns.concat(dynamicColumns.get(actionKey))
      : dynamicColumns.get(actionKey);
  }

  /**
   * handleOnRadioGroupChange - RadioGroup change事件
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
        if (radioGroupValue === 'invoice') {
          setActionListCommonRow(record);
        }
      },
    };
  }

  render() {
    const {
      dataSource = [],
      pagination,
      processing,
      customizeTable,
      customizeTabPane,
      radioGroupValue,
      evaluationDataSource = {},
      settings = {},
      customizeForm,
      form,
      basicFormData,
      onBasicTableChange,
    } = this.props;
    const { getFieldDecorator } = form;

    const { customVisable, customData, specsJsonType } = this.state;
    // const { showEvaluationFlag } = evaluationDataSource;
    const columns =
      radioGroupValue === 'evaluation' ? [] : this.getColumns(radioGroupValue).filter((i) => i);
    let scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const srcollY = radioGroupValue === 'basic' || radioGroupValue === 'others' ? 470 : 0;
    if (radioGroupValue === 'basic') scrollX += 300;
    // const components = {
    //   body: {
    //     row: EditableFormRow,
    //   },
    // };
    const actionTableKey = ['basic', 'others', 'invoice'].includes(radioGroupValue)
      ? 'common'
      : radioGroupValue;
    const tableProps = {
      // rowKey: this.defaultTableRowKey,
      // components,
      columns,
      dataSource: dataSource[actionTableKey] || [],
      pagination: pagination[actionTableKey],
      loading:
        processing.queryDetailListLoading ||
        processing.calculateDoubleUomLoading ||
        (processing.queryPartnersLoading && radioGroupValue === 'partners'),
      bordered: true,
      onChange: this.handleOnChange.bind(this),
      scroll: { x: scrollX >= 1200 && radioGroupValue !== 'invoice' ? scrollX : false, y: srcollY },
    };
    const evaluationProps = {
      evaluationDataSource,
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
    // const associatedDocProps = {
    //   associatedDoc,
    //   visible: radioGroupValue === 'invoice',
    // };
    return (
      <Fragment>
        {customizeTabPane(
          {
            code: 'SODR.RECEIVED_ORDER_DETAIL.TAB',
            custDefaultActive: (key) => this.handleOnRadioGroupChange(key),
          },
          <Tabs onChange={this.handleOnRadioGroupChange} className="detail-list" animated={false}>
            <TabPane
              key="basic"
              tab={intl.get(`sodr.common.view.message.title.basicInfo`).d('基础信息')}
              forceRender
            >
              <div style={{ marginBottom: '16px' }}>
                {customizeForm(
                  {
                    form,
                    code: 'SODR.RECEIVED_ORDER_DETAIL.BASIC_INFO',
                  },
                  <Form layout="inline" className="more-fields-form">
                    <Row {...EDIT_FORM_ROW_LAYOUT}>
                      <Col span={8} />
                      <Col span={8} />
                      <Col span={8}>
                        <FormItem
                          label={intl
                            .get(`sodr.common.model.common.hideCloseAndCancelLines`)
                            .d('隐藏取消/关闭行')}
                        >
                          {getFieldDecorator('lineDisplay', {
                            initialValue: basicFormData.lineDisplay,
                          })(<Switch />)}
                        </FormItem>
                      </Col>
                    </Row>
                  </Form>
                )}
              </div>
              {radioGroupValue === 'basic' &&
                customizeTable(
                  {
                    code: 'SODR.RECEIVED_ORDER_DETAIL.BASIC',
                  },
                  <EditTable {...tableProps} onDataChange={onBasicTableChange} />
                )}
            </TabPane>
            <TabPane
              key="others"
              tab={intl.get(`sodr.common.view.message.title.otherInfo`).d('其他信息')}
              forceRender
            >
              {radioGroupValue === 'others' &&
                customizeTable(
                  {
                    code: 'SODR.RECEIVED_ORDER_DETAIL.OTHER',
                  },
                  <EditTable {...tableProps} />
                )}
            </TabPane>
            <TabPane
              disabled={processing.queryDetailListLoading}
              key="invoice"
              tab={intl.get(`sodr.common.view.message.andNum`).d('关联单据')}
              forceRender
            >
              <EditTable {...tableProps} />
            </TabPane>
            <TabPane
              key="partners"
              tab={intl.get(`sodr.common.view.message.title.partners`).d('合作方')}
              forceRender
            >
              <Table {...tableProps} />
            </TabPane>
            {settings['010217'] === '1' && settings['010218'] === '1' && (
              <TabPane
                key="evaluation"
                tab={intl.get(`sodr.common.view.message.evaluate`).d('评价')}
                forceRender
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
