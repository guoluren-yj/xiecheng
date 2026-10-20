import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Input, DatePicker, Button, InputNumber, Select } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import { isArray, isEmpty, isFunction, isNil } from 'lodash';
import querystring from 'querystring';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import BatchStageMaintain from '@/routes/components/BatchStageMaintain';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { dateRender } from 'utils/renderer';
import { validateBits, renderThousandthNum } from '@/utils/util';
import { getDateFormat, tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';

import styles from './index.less';

const FormItem = Form.Item;
const commonPrompt = 'spcm.common.model.common';
const { Option } = Select;

/**
 * ContractSubject - 采购协议标的信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@formatterCollections({
  code: ['sodr.common', 'spcm.common'],
})
@withRouter
export default class ContractStage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  @Bind()
  @Throttle(1000)
  updateStageList() {
    this.setState({ tenantId: getCurrentOrganizationId() });
  }
  /**
   * 格式化数值
   * 当 value 为 undefined,null,'',NaN,Infinity,-Infinity时 返回 ''
   * @param {string|number} value 需要格式化的数
   * @param {number} [precision=0] 数值精度 必须为自然数(0+正整数)
   * @param {boolean} [allowThousandth=true] 是否加上千分位
   * @param {boolean} [allowEndZero=true] 是否补全末尾0
   * @return {string}
   */

  /* eslint-disable */
  @Bind()
  numberRender(value) {
    var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var allowThousandth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var allowEndZero = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    if (
      // 空检查
      value === null ||
      value === undefined ||
      value === '' || // 非法数值的检查
      +value === Infinity ||
      +value === -Infinity ||
      isNaN(+value)
    ) {
      return '';
    } // 将 value 转为字符串并移除千分位

    var ret;
    var valueString = String(value).replace(/,/g, '');
    if (
      valueString.length > 0 &&
      Object.prototype.toString.call(valueString.split('.')) === '[object Array]'
    ) {
      if (valueString.split('.')[1] && valueString.split('.')[1].length > 2) {
        ret = Number(valueString).toFixed(valueString.split('.')[1].length);
      } else {
        ret = Number(valueString).toFixed(precision);
      }
    }

    if (allowThousandth && typeof ret === 'string' && ret.length > 0) {
      var retList = ret.split('.');
      var commaValue = retList[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 整数部分千分位替换

      if (retList.length > 1) {
        ret = [commaValue, retList[1]].join('.');
      } else {
        ret = commaValue;
      }
    }

    if (!allowEndZero && ret.indexOf('.')) {
      return ret.replace(/(0|\.0)*$/, '');
    }

    return ret;
  }
  /* eslint-enable */

  /**
   * 改变设置已编辑标识
   */
  @Bind()
  handleChangeFormItem() {
    const { onChangeState } = this.props;
    onChangeState({ pcStageEdited: true });
  }

  /**
   * 单位改变回调
   * @param {*} value
   * @param {*} lovRecord
   */
  @Bind()
  handleChangeUom(value, lovRecord, record) {
    const {
      $form: { setFieldsValue, registerField },
    } = record;
    registerField('uomName');
    registerField('uomCode');
    setFieldsValue({ uomName: lovRecord.uomName, uomCode: lovRecord.uomCode });
    this.handleChangeFormItem();
  }

  /**
   * 选中行改变回调
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   */
  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows) {
    const { onSelectionChange } = this.props;
    onSelectionChange(selectedRowKeys, selectedRows, 'pcStage');
  }

  /* eslint-disable */
  // 改变本币或原币时,修改汇率
  @Bind()
  handleChangeCurrencyCode(type, lovRecord, record) {
    const {
      $form: { setFieldsValue, getFieldValue, registerField },
    } = record;
    const { currencyCode = null } = lovRecord;
    const { dispatch } = this.props;
    const { tenantId } = this.state;

    const isCurrencyCode = type === 'supplierCurrencyCode';
    const compareCurrencyCode =
      (isCurrencyCode && getFieldValue('purchaseCurrencyCode')) ||
      getFieldValue('supplierCurrencyCode');
    if (compareCurrencyCode === currencyCode) {
      setFieldsValue({ exchangeRate: 1 });
    } else {
      dispatch({
        type: 'contractCommon/fetchExRate',
        payload: {
          tenantId,
          fromCurrencyCode: isCurrencyCode ? currencyCode : compareCurrencyCode,
          toCurrencyCode: isCurrencyCode ? compareCurrencyCode : currencyCode,
          rateDate: moment(new Date()).format(DEFAULT_DATE_FORMAT),
        },
      }).then((res) => {
        let exchangeRate = null;
        let disableChangeRate = false;
        if (res && res.length === 1) {
          exchangeRate = res[0].rate;
          disableChangeRate = res[0].rateMethodCode === 'FR';
        }
        setFieldsValue({ exchangeRate, disableChangeRate });
      });
    }
  }
  /* eslint-enable */

  /**
   * 税种Lov修改回调
   * @param {String} value
   * @param {Object} record
   */
  @Bind()
  handleChangeTax(value, lovRecord, record) {
    const { onChangeListData, dataSource } = this.props;
    const { taxRate } = lovRecord;
    const listDataSource = dataSource.map((item) => {
      if (item.pcStageId === record.pcStageId) {
        return {
          ...item,
          taxRate,
          edited: true,
        };
      }
      return item;
    });
    onChangeListData({ pcStageDataSource: listDataSource });
    this.handleChangeFormItem();
  }

  /**
   * 协议阶段下拉框修改回调
   */
  @Bind()
  handleStageChange(record, value) {
    const { onChangeListData, dataSource, detailEnumMap = {} } = this.props;
    const { stageOptions = [] } = detailEnumMap;
    const option = stageOptions.find((n) => n.stageCode === value);
    const listDataSource = dataSource.map((item) => {
      if (item.pcStageId === record.pcStageId) {
        return {
          ...item,
          stageName: option && option.stageName,
          stageCode: value,
          prepaymentStage: option && option.prepaymentStage,
        };
      }
      return item;
    });
    onChangeListData({ pcStageDataSource: listDataSource });
    this.handleChangeFormItem();

    // 带出说明字段
    if (!record.remark && !isEmpty(option)) {
      record.$form.setFieldsValue({
        remark: option.remark,
      });
    }
  }

  /**
   * 协议条款lov修改
   */
  @Bind()
  handleChangeterm(lovRecord = {}, record) {
    const { onChangeListData, dataSource } = this.props;
    const listDataSource = dataSource.map((item) => {
      if (item.pcStageId === record.pcStageId) {
        return {
          ...item,
          termName: lovRecord.termName,
          edited: true,
        };
      }
      return item;
    });
    onChangeListData({ pcStageDataSource: listDataSource });
    this.handleChangeFormItem();
  }

  /**
   * 付款方式lov修改
   */
  @Bind()
  handleChangeTypeId(lovRecord = {}, record) {
    const { onChangeListData, dataSource } = this.props;
    const listDataSource = dataSource.map((item) => {
      if (item.pcStageId === record.pcStageId) {
        return {
          ...item,
          typeCode: lovRecord?.typeCode,
          typeName: lovRecord?.typeName,
          edited: true,
        };
      }
      return item;
    });
    onChangeListData({ pcStageDataSource: listDataSource });
    // record.$form.setFieldsValue({
    //   typeName: lovRecord.typeName,
    // });
    this.handleChangeFormItem();
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { tenantId } = this.state;
    const {
      editable,
      maintainEditable,
      onHandleRecord,
      headerInfo = {},
      detailEnumMap = {},
      // detailEnumMapStage = {},
      remote,
    } = this.props;
    const { contractPendingMethod, contractCalculateMethod, supplementFlag } = headerInfo;
    // 协议阶段新建方式为手工新建
    const stageEditFlag = contractPendingMethod === '1';
    const { stageOptions = [] } = detailEnumMap;
    const columnArray = [
      {
        title: intl.get(`spcm.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'stageNo',
        width: 80,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`stageNo`, {
                initialValue: record.stageNo,
              })(<InputNumber min={1} step={1} precision={0} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.stageCode`).d('阶段编码'),
        dataIndex: 'stageCode',
        width: 165,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          stageEditFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`stageCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.stageCode`).d('阶段编码'),
                    }),
                  },
                  {
                    max: 12,
                    message: intl.get('hzero.common.validation.max', { max: 12 }),
                  },
                  {
                    pattern: /^[A-Z\d]+$/,
                    message: intl.get(`spcm.common.view.message.capitalLettersOrNumbersOnly`, {
                      fieldName: intl.get(`${commonPrompt}.stageCode`).d('阶段编码'),
                    }),
                  },
                ],
                initialValue: record.stageCode,
              })(
                <Input
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
        dataIndex: 'stageName',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {!stageEditFlag
                ? record.$form.getFieldDecorator(`stageCode`, {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.stageName`).d('阶段名称'),
                        }),
                      },
                    ],
                    initialValue: record.stageCode,
                  })(
                    <Select
                      allowClear
                      style={{ width: '100%' }}
                      onChange={(value) => this.handleStageChange(record, value)}
                    >
                      {stageOptions.map((n) => (
                        <Option key={n.stageCode} value={n.stageCode}>
                          {n.stageName}
                        </Option>
                      ))}
                    </Select>
                  )
                : record.$form.getFieldDecorator('stageName', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.stageName`).d('阶段名称'),
                        }),
                      },
                    ],
                    initialValue: record.stageName,
                  })(
                    <Input
                      onChange={() => {
                        this.handleChangeFormItem();
                        onHandleRecord(record);
                      }}
                    />
                  )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.prepaymentStage`).d('预付款阶段'),
        dataIndex: 'prepaymentStage',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`prepaymentStage`, {
                initialValue: record.prepaymentStage,
              })(<Checkbox />)}
            </FormItem>
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`prepaymentStage`, {
                initialValue: record.prepaymentStage,
              })(<Checkbox disabled />)}
            </FormItem>
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.milestoneTime`).d('里程碑时间'),
        dataIndex: 'milestoneTime',
        width: 175,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`milestoneTime`, {
                initialValue: record.milestoneTime && moment(record.milestoneTime),
              })(
                <DatePicker
                  placeholder={null}
                  format={getDateFormat()}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  disabledDate={(currentDate) =>
                    Number(supplementFlag)
                      ? false
                      : currentDate && moment().isAfter(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get(`spcm.common.payRatio`).d('付款比例'),
        dataIndex: 'payRatio',
        width: 175,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`payRatio`, {
                initialValue: record.payRatio,
                rules: [
                  {
                    required:
                      contractCalculateMethod !== '0' &&
                      (isNaN(record.$form.getFieldValue('costQuantity')) ||
                        isNil(record.$form.getFieldValue('costQuantity'))),
                    validator: (_, value, callback) => {
                      if (isNaN(value) && isNaN(record.$form.getFieldValue('costQuantity'))) {
                        callback(
                          intl
                            .get('spcm.common.view.message.noPayratioAndCostQuantity')
                            .d('付款比例和原币费用必填其一；也可二者都填')
                        );
                      }
                      callback();
                    },
                  },
                ],
              })(
                <InputNumber
                  onChange={() => {
                    this.handleChangeFormItem();
                    const {
                      $form: { getFieldValue, setFieldsValue },
                    } = record;
                    const costQuantityVal = getFieldValue('costQuantity');
                    setFieldsValue({ costQuantity: costQuantityVal });
                    onHandleRecord(record);
                  }}
                  // 计算标识显示按费用
                  disabled={contractCalculateMethod === '0'}
                  allowThousandth
                  min={0}
                />
              )}{' '}
              %
            </FormItem>
          ) : record.payRatio || record.payRatio === 0 ? (
            `${record.payRatio} %`
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`spcm.common.currencyCode`).d('原币币种'),
        dataIndex: 'supplierCurrencyCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`supplierCurrencyCode`, {
                initialValue: record.supplierCurrencyCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.currencyCode`).d('原币币种'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPCM.CURRENCY"
                  textValue={record.supplierCurrencyCode}
                  queryParams={{ tenantId }}
                  lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                  onChange={(_, lovRecord) => {
                    this.handleChangeFormItem();
                    this.handleChangeCurrencyCode(`supplierCurrencyCode`, lovRecord, record);
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            record.supplierCurrencyCode
          ),
      },
      {
        title: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
        dataIndex: 'purchaseCurrencyCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`purchaseCurrencyCode`, {
                initialValue: record.purchaseCurrencyCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPCM.CURRENCY"
                  textValue={record.purchaseCurrencyCode}
                  queryParams={{ tenantId }}
                  lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                  onChange={(_, lovRecord) => {
                    this.handleChangeFormItem();
                    this.handleChangeCurrencyCode(`purchaseCurrencyCode`, lovRecord, record);
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            record.purchaseCurrencyCode
          ),
      },
      {
        title: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
        dataIndex: 'exchangeRate',
        width: 160,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`exchangeRate`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => validateBits(value, callback, true),
                  },
                ],
                initialValue:
                  record.$form.getFieldValue('purchaseCurrencyCode') ===
                  record.$form.getFieldValue('supplierCurrencyCode')
                    ? 1
                    : record.exchangeRate,
              })(
                <InputNumber
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  disabled={
                    record.$form.getFieldValue('purchaseCurrencyCode') ===
                    record.$form.getFieldValue('supplierCurrencyCode')
                  }
                  min={0.0000000001}
                />
              )}
              :1
            </FormItem>
          ) : (
            `${record.exchangeRate}:1`
          ),
      },
      {
        title: intl.get(`spcm.common.model.supplierCostQuantity`).d('原币费用'),
        dataIndex: 'costQuantity',
        width: 175,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`costQuantity`, {
                initialValue: record.costQuantity,
                rules: [
                  {
                    required:
                      contractCalculateMethod !== '1' &&
                      (isNaN(record.$form.getFieldValue('payRatio')) ||
                        isNil(record.$form.getFieldValue('payRatio'))),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spcm.common.model.supplierCostQuantity').d('原币费用'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (isNaN(value) && isNaN(record.$form.getFieldValue('payRatio'))) {
                        callback(
                          intl
                            .get('spcm.common.view.message.noPayratioAndCostQuantity')
                            .d('付款比例和原币费用必填其一；也可二者都填')
                        );
                      } else {
                        validateBits(value, callback);
                      }
                    },
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  financial={record.$form.getFieldValue('supplierCurrencyCode')}
                  style={{ width: '100%' }}
                  min={0}
                  // 计算标识显示按比例
                  disabled={contractCalculateMethod === '1'}
                  onChange={() => {
                    this.handleChangeFormItem();
                    const {
                      $form: { getFieldValue, setFieldsValue },
                    } = record;
                    const ratioVal = getFieldValue('payRatio');
                    setFieldsValue({ payRatio: ratioVal });
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      {
        title: intl.get('spcm.common.model.purchaseCostQuantity').d('本币费用'),
        dataIndex: 'purchaseCostQuantity',
        width: 150,
        render: (val) => renderThousandthNum(val),
      },
      {
        title: intl.get('spcm.common.model.costQuantity.chinese').d('大写费用'),
        dataIndex: 'costQuantityChinese',
        width: 150,
      },
      {
        title: intl
          .get('spcm.common.model.purchaseCostQuantity.chinese')
          .d('大写本币费用(原币费用x（本币/原币）'),
        dataIndex: 'purchaseCostQuantityChinese',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.common.termId').d('付款条款'),
        dataIndex: 'termName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem key={record.termId}>
              {record.$form.getFieldDecorator(`termId`, {
                initialValue: record.termId,
              })(
                <Lov
                  code="SMDM.PAYMENT.TERM"
                  textValue={record.termName}
                  queryParams={{ pcTypeId: headerInfo.pcTypeId }}
                  onChange={(_, lovRecord) => this.handleChangeterm(lovRecord, record)}
                />
              )}
            </FormItem>
          ) : (
            record.termName
          ),
      },
      {
        title: intl.get('spcm.common.model.common.typeId').d('付款方式'),
        dataIndex: 'typeName',
        width: 150,
        render: (val, record) => {
          return ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem key={record.typeId}>
              {record.$form.getFieldDecorator(`typeId`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.model.common.typeId`).d('付款方式'),
                    }),
                  },
                ],
                initialValue: record.typeId,
              })(
                <Lov
                  code="SPCM.PAYMENT_TYPE"
                  textValue={record.typeName || ''}
                  queryParams={{ pcTypeId: headerInfo.pcTypeId }}
                  onChange={(_, lovRecord) => this.handleChangeTypeId(lovRecord, record)}
                />
              )}
              {/* {record.$form.getFieldDecorator(`typeName`, {
                  initialValue: record.typeName,
                })} */}
            </FormItem>
          ) : (
            record.typeName
          );
        },
      },
      {
        title: intl.get('spcm.common.model.common.remindCycle').d('提醒周期'),
        dataIndex: 'remindCycle',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`remindCycle`, {
                initialValue: val,
              })(
                <InputNumber
                  min={0}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.explain').d('说明'),
        dataIndex: 'remark',
        width: 175,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`remark`, {
                rules: [
                  {
                    max: 300,
                    message: intl.get('hzero.common.validation.max', { max: 300 }),
                  },
                ],
                initialValue: record.remark ? record.remark : '',
              })(
                <Input
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
    ];

    return remote
      ? remote.process('SPCM_CONTRACT_MAINTAIN_DETAIL_COLUMN', columnArray, {
          current: this,
        })
      : columnArray;
  }

  @Bind()
  handleGetCode() {
    const { unitCodeList } = this.props;
    const {
      match: { path },
      location: { search },
    } = this.props?.parentRoute || this.props;
    const routerParams = querystring.parse(search.substr(1));
    if (path === '/spcm/contract-maintain/detail' || routerParams.hasChanged === 'true') {
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE';
    } else {
      // 解耦协议签署和我收到的协议个性化单元，以unitCodeList作为参数进行判断
      if (unitCodeList) {
        return unitCodeList.STAGE;
      }
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY';
    }
  }

  /**
   * 表单域监听
   */
  @Bind()
  handleDataChange() {
    const { dispatch = () => {}, formChanged } = this.props;
    if (!formChanged) {
      dispatch({
        type: 'contractCommon/updateState',
        payload: {
          formChanged: true,
        },
      });
    }
  }

  render() {
    const {
      loading,
      deleting,
      editable,
      onAdd,
      onDelete,
      onPrePaginationChange,
      maintainEditable = false,
      selectedRows = [],
      pagination = {},
      dataSource = [],
      check,
      checkArtificial = false,
      customizeTable,
      onChangeListData,
      headerInfo,
    } = this.props;
    const rowKey = 'pcStageId';
    const columns = this.getColumns();
    const selectedRowKeys = selectedRows.map((n) => n[rowKey]);
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelection,
    };
    const scrollX = tableScrollWidth(columns);
    const editTableProps = {
      loading,
      columns,
      dataSource,
      rowSelection: check || (checkArtificial && rowSelection),
      pagination,
      rowKey,
      bordered: true,
      onChange: (page) => onPrePaginationChange(page),
      scroll: { x: scrollX },
      className: styles['edit-table-wrapper'],
      // onDataChange: this.handleDataChange,
    };
    return (
      <Fragment>
        {editable ||
          (maintainEditable && (
            <div className={styles['btn-wrapper']}>
              <Button type="primary" onClick={onAdd}>
                {intl.get(`hzero.common.button.create`).d('新建')}
              </Button>
              <Button
                onClick={onDelete}
                loading={deleting}
                style={{ marginLeft: '8px' }}
                disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
              <BatchStageMaintain
                type="h0"
                dataSource={dataSource}
                headerInfo={headerInfo}
                onChangeListData={onChangeListData}
              />
            </div>
          ))}
        {customizeTable(
          {
            code: this.handleGetCode(),
            clearCache: (a, b, cb) => {
              if (a !== b) cb(a);
            },
            useNewCalid: true,
          },
          <EditTable {...editTableProps} />
        )}
      </Fragment>
    );
  }
}
