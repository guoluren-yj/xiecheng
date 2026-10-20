/*
 * ContractSubject - 采购协议标的信息
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  Modal,
  Select,
  Tooltip,
  Icon as H0Icon,
} from 'hzero-ui';
import { Bind, Throttle, debounce } from 'lodash-decorators';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import { useModal } from 'components/Import';
import { Button as PermissionButton } from 'components/Permission';
import CommonImport from 'hzero-front/lib/components/Import';
import { isEmpty, isFunction, isNumber, map, compose, omit, isNil } from 'lodash';
import querystring from 'querystring';
import { openTab } from 'utils/menuTab';
import { Modal as c7nModal } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import {
  renderThousandthNum,
  toNonExponential,
  validateBits,
  queryCommonDoubleUomConfig,
  validateDoubleUom,
  getDynamicLabel,
  conversionUpdateForH0,
  getSecondaryUomFormItem,
  conversionUpdateUomIdForH0,
  getAttributeFields,
} from '@/utils/util';
import BudgetModal from 'srm-front-sbud/lib/routes/BudgetOccupiedModal';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { openC7nPriceModal } from '@/routes/components/C7nPriceModal';
import { getHeaderParams } from '@/routes/components/C7nPriceModal/util';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import {
  getDateFormat,
  tableScrollWidth,
  getCurrentOrganizationId,
  // getEditTableData,
  getResponse,
} from 'utils/utils';
import {
  queryExchangeRates,
  queryExchangeRateTypes,
  getRelationDocControl,
  getImportTemplateCode,
} from '@/services/contractCommonService';
import { batchQueryPrice } from '@/services/newContractService';
import { DEFAULT_DATE_FORMAT, DATETIME_MIN } from 'utils/constants';
import EditTable from 'components/EditTable';
import DocFlow from '_components/DocFlow';
import { dateRender } from 'utils/renderer';
import { queryMapIdpValue } from 'services/api';
import ApplicationScope from './ApplicationOrganization';

import SubjectInfo from './SubjectInfo';
import CreateModal from '../../ContractMaintain/QuotePurchaseOrder/CreateModal';
import OperationLadderQuote from './OperationLadderQuote';
import ExecutiveOrderRecord from '../ExecutiveOrderRecord';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

/**
 * ContractSubject - 采购协议标的信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
class ContractSubject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      poVisible: false,
      quoteVisible: false,
      quotePcSubject: null, // 当前查看的协议标的行id，用于获取阶梯价格
      selectOptionKey: 'taxId',
      batchOptionValues: null,
      doubleUnitEnabled: 0,
      relationDoc: {}, // displayDocFlow： 单据流，displayDoc：执行单据
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  componentDidMount() {
    this.fetchDoubleUnitFlag();
    this.fetchRelationDocControl();
  }

  componentDidUpdate(prevProps) {
    const { doubleUnitEnabled } = this.props;
    if (prevProps.doubleUnitEnabled !== doubleUnitEnabled && !isNil(doubleUnitEnabled)) {
      this.fetchDoubleUnitFlag();
    }
  }

  /**
   * 双单位业务规则是否开启
   */
  @Bind()
  async fetchDoubleUnitFlag() {
    // 引用二开或者除了【协议拟制】外的doubleUnitEnabled都是undefined,会走协议标的的双单位查询
    if (isNil(this.props.doubleUnitEnabled)) {
      const res = await queryCommonDoubleUomConfig();
      this.setState({ doubleUnitEnabled: res });
    } else {
      this.setState({ doubleUnitEnabled: this.props.doubleUnitEnabled });
    }
  }

  /**
   * 单据流、执行单据业务规则是否开启
   */
  @Bind()
  async fetchRelationDocControl() {
    const res = getResponse(await getRelationDocControl());
    if (res) {
      this.setState({ relationDoc: res });
    }
  }

  @Bind()
  @Throttle(1000)
  updateSubjectList() {
    this.setState({ poVisible: false });
  }

  /* eslint-disable */
  @Bind()
  numberValidator(isDouble, value, next, record, message) {
    const uomPrecision = isDouble
      ? record.$form.getFieldValue('secondaryUomPrecision') || record.secondaryUomPrecision
      : record.$form.getFieldValue('uomPrecision') || record.uomPrecision;
    if (isNaN(value) || !value || uomPrecision == null) {
      next && next();
      return;
    }

    const reg = new RegExp(`^\\d+(\\.\\d{0,${uomPrecision}})?$`);
    if (!reg.test(toNonExponential(value))) {
      next(message || intl.get('spcm.common.model.common.quanPrecisionHighly').d('数量精度过高'));
      return;
    }

    next();
  }

  /**
   * 改变设置已编辑标识
   */
  @Bind()
  handleChangeFormItem() {
    const { onChangeState } = this.props;
    onChangeState({ pcSubjectEdited: true });
  }

  /**
   * 查询值集
   */
  @Bind()
  async fetchOptionsData(lovCode, val) {
    console.log(lovCode, val);
    const opts = await getResponse(
      queryMapIdpValue({
        [`${val}OptionsData`]: lovCode,
      })
    );
    this.setState({
      [`${val}OptionsData`]: opts?.[`${val}OptionsData`],
    });
  }

  /**
   * 基本单位改变回调
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
    registerField('uomPrecision');
    record.uomPrecision = lovRecord.uomPrecision;
    setFieldsValue({
      uomId: lovRecord.uomId,
      uomName: lovRecord.uomName,
      uomCode: lovRecord.uomCode,
      uomPrecision: lovRecord.uomPrecision,
    });
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
    onSelectionChange(selectedRowKeys, selectedRows, 'pcSubject');
  }

  // 改变本币或原币时,修改汇率
  @Bind()
  handleChangeCurrencyCode(type, lovRecord, record) {
    const {
      $form: { setFieldsValue, getFieldValue, registerField },
    } = record;
    const { currencyCode = null } = lovRecord;
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    const isCurrencyCode = type === 'currencyCode';
    const compareCurrencyCode =
      (isCurrencyCode && getFieldValue('purchaseCurrencyCode')) || getFieldValue('currencyCode');
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
   * 物料改变回调
   * @param {String} value
   * @param {Object} lovRecord
   * @param {Object} record
   */
  @Bind()
  async handleItemOnChange(value, lovRecord, record) {
    const {
      onChangeListData,
      dataSource,
      doubleUomFlag,
      pcHeaderId,
      dispatch,
      headerInfo: { priceType, pcSourceCode },
    } = this.props;
    const { doubleUnitEnabled } = this.state;
    const {
      $form: { setFieldsValue, registerField, getFieldsValue, getFieldValue },
      // priceType,
    } = record;
    const invOrganizationId = getFieldValue('invOrganizationId');
    if (!value) {
      setFieldsValue({
        [priceType === 'TAX_INCLUDED_PRICE' ? 'taxIncludedUnitPrice' : 'unitPrice']: '',
      });
      return;
    }
    this.handleChangeFormItem();
    const {
      itemName = null,
      primaryUomId = null,
      taxId = null,
      taxCode = null,
      taxRate = null,
      uomName = null,
      uomCode = null,
      uomId,
      partnerItemId = null,
      orderUomName = null,
      orderUomId = null,
      orderUomCode = null,
      specifications = null,
      model = null,
      categoryId = null,
      categoryCode = null,
      categoryName = null,
      brand = null,
      itemId,
      itemCode,
      uomCodeAndName,
    } = lovRecord;
    let secondaryUomObj = {};
    if (doubleUnitEnabled) {
      secondaryUomObj = getSecondaryUomFormItem({
        spcmEnabled: doubleUnitEnabled,
        lovRecord,
      });
      await conversionUpdateForH0({
        record,
        lovRecord,
        doubleUnitEnabled,
      });
    }
    dispatch({
      type: 'contractCommon/fetchPriceLibValidPrice',
      payload: {
        ...getFieldsValue(),
        priceLibId: null,
        pcHeaderId,
        itemId,
        itemCode,
        invOrganizationId,
        uomId,
        pcSourceCode,
        ...secondaryUomObj,
      },
    }).then((res) => {
      const unitPriceObj = {};
      let attributeFields = {};
      if (res) {
        if (!validateDoubleUom({ doubleUnitEnabled, priceUomId: res?.uomId, uomId })) return;
        const {
          taxIncludedUnitPrice,
          unitPrice,
          taxIncludedSecondaryUnitPrice,
          secondaryUnitPrice,
          unitPriceBatch,
        } = res || {};
        const hasTaxInclude = priceType === 'TAX_INCLUDED_PRICE';
        unitPriceObj[hasTaxInclude ? 'taxIncludedUnitPrice' : 'unitPrice'] = hasTaxInclude
          ? taxIncludedUnitPrice
          : unitPrice;
        unitPriceObj.benchmarkPrice = hasTaxInclude ? taxIncludedUnitPrice : unitPrice;
        if (!isNil(unitPriceBatch)) {
          unitPriceObj.unitPriceBatch = unitPriceBatch;
        }
        if (doubleUnitEnabled) {
          unitPriceObj[
            hasTaxInclude ? 'taxIncludedSecondaryUnitPrice' : 'secondaryUnitPrice'
          ] = hasTaxInclude ? taxIncludedSecondaryUnitPrice : secondaryUnitPrice;
          unitPriceObj.benchmarkPrice = hasTaxInclude
            ? taxIncludedSecondaryUnitPrice
            : secondaryUnitPrice;
        }
        attributeFields = getAttributeFields(res);
      }
      const listDataSource = dataSource.map((item) => {
        if (item.pcSubjectId === record.pcSubjectId) {
          return {
            ...attributeFields,
            ...item,
            taxRate,
            taxCode,
            uomCode,
            uomName,
            uomCodeAndName,
            taxId,
            itemName, // 物料名称
            uomId: primaryUomId,
            itemId: partnerItemId,
            specifications,
            model,
            categoryId,
            categoryCode,
            categoryName,
            brand: brand || item.brand,
            ...unitPriceObj,
            ...secondaryUomObj,
          };
        }
        return item;
      });
      const fields = {
        ...attributeFields,
        itemName,
        taxId,
        taxRate,
        taxCode,
        uomName: doubleUomFlag && orderUomName ? orderUomName : uomName,
        uomCodeAndName,
        uomCode: doubleUomFlag && orderUomCode ? orderUomCode : uomCode,
        uomId: doubleUomFlag && orderUomId ? orderUomId : primaryUomId,
        itemId: partnerItemId,
        specifications,
        model,
        categoryId,
        categoryCode,
        categoryName,
        brand,
        ...unitPriceObj,
        ...secondaryUomObj,
      };
      // 启用双单位配置了订单模块开启：如果返回的【单位】和订单行【基本单位】不一致,界面报错
      if (!brand) delete fields.brand;
      registerField('itemId');
      setFieldsValue(fields);
      onChangeListData({ pcSubjectDataSource: listDataSource });
    });
  }

  @Bind()
  @debounce(800)
  handleSecondaryNumChange(value, record) {
    const { doubleUnitEnabled } = this.state;
    const itemCode = record.$form.getFieldValue('itemCode');
    if (!(doubleUnitEnabled && itemCode)) {
      record.$form.setFieldsValue({ quantity: value || record.quantity });
    } else if (!value && value !== 0) {
      record.$form.setFieldsValue({ quantity: value });
    } else {
      conversionUpdateForH0({
        record,
        value,
        doubleUnitEnabled,
      });
    }
  }

  /**
   * 查看阶梯价格
   */
  @Bind()
  handleLadderQuote(record) {
    // const { pcSubjectId } = record;
    this.setState({
      quoteVisible: true,
      quotePcSubject: record,
    });
  }

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
      if (item.pcSubjectId === record.pcSubjectId) {
        record.$form.setFieldsValue({ taxRate });
        return {
          ...item,
          taxRate,
          edited: true,
        };
      }
      return item;
    });
    onChangeListData({ pcSubjectDataSource: listDataSource });
    this.handleChangeFormItem();
  }

  /**
   * formateDataSource - 去除新增行中pcSubjectId
   */
  @Bind()
  formateDataSource() {
    const { dataSource } = this.props;
    return dataSource.map((line) => {
      if (line._status === 'create') {
        return omit(line, ['pcSubjectId']);
      }
      return line;
    });
  }

  /**
   * onSubjectInfoModalOk - 新增信息行弹窗确定按钮事件
   */
  @Throttle(1000, {
    trailing: false,
    leading: true,
  })
  @Bind()
  onInfoModalOk() {
    const { addSubjectLines, dataSource, remote } = this.props;
    const filterDataSource = this.formateDataSource();
    const { doubleUnitEnabled } = this.state;
    if (this.subjectInfo && !isEmpty((this.subjectInfo.state || {}).selectedListRows)) {
      const selectedListRowsArrs = this.subjectInfo.state.selectedListRows.map((v) => ({
        ...v,
        uomCodeAndName: v.uomCodeAndName,
      }));
      const {
        dispatch = () => {},
        _linkFlag = false,
        headerInfo: { pcSourceCode, pcHeaderId, priceType, acceptExecuteType },
        headerInfo,
      } = this.props;
      const hasTaxInclude = priceType === 'TAX_INCLUDED_PRICE';
      const priceField = hasTaxInclude ? 'taxIncludedUnitPrice' : 'unitPrice';
      // 采购申请没有【辅助单价不含税】secondaryUnitPrice，此处只是用来给benchmarkPrice一个undefined
      const secondField = hasTaxInclude ? 'taxIncludedSecondaryUnitPrice' : 'secondaryUnitPrice';
      if (['SEARCH_SOURCE_RESULT'].includes(pcSourceCode)) {
        dispatch({
          type: 'contractMaintain/sourceCreate',
          payload: {
            query: {},
            body: selectedListRowsArrs.concat(dataSource),
          },
        }).then((res) => {
          if (res) {
            addSubjectLines(
              selectedListRowsArrs.map((row) => ({
                ...row,
                priceStartDate: row.quotationExpiryDateFrom,
                priceEndDate: row.quotationExpiryDateTo,
                benchmarkPrice: doubleUnitEnabled ? row[secondField] : row[priceField],
              }))
            );
            this.closeSubjectInfoModal();
          }
        });
      } else if (['PURCHASE_NEED'].includes(pcSourceCode)) {
        dispatch({
          type: 'contractMaintain/verified',
          payload: {
            query: {},
            selectedPurchaseContracts: selectedListRowsArrs.concat(filterDataSource),
          },
        }).then(async (res) => {
          if (res) {
            const data = [];
            selectedListRowsArrs
              .filter((i) => i.itemId)
              .map((item) => {
                data.push({
                  pcHeaderId,
                  pcSourceCode,
                  itemId: item.itemId,
                  itemCode: item.itemCode,
                  invOrganizationId: item.invOrganizationId,
                  uomId: item.uomId,
                  secondaryUomId: item.secondaryUomId,
                });
                return data;
              });
            const itemObj = {};
            if (pcHeaderId) {
              const itemList = await batchQueryPrice({
                pcHeaderId,
                data,
              });
              // eslint-disable-next-line no-unused-expressions
              Array.isArray(itemList) &&
                itemList.forEach((item) => {
                  itemObj[item.itemId] = item;
                });
            }
            let newData = (selectedListRowsArrs || []).map((item) => {
              let rest = {};
              let attributeFields = {};
              const unitPriceObj = {
                benchmarkPrice: doubleUnitEnabled ? item[secondField] : item[priceField],
              };
              if (itemObj[item.itemId]) {
                const { taxIncludedUnitPrice, unitPrice, unitPriceBatch, ...restObj } =
                  itemObj[item.itemId] || {};
                const TaxIncludedUnitPrice = isNumber(item.taxIncludedUnitPrice)
                  ? item.taxIncludedUnitPrice
                  : taxIncludedUnitPrice;
                const UnitPrice = isNumber(item.unitPrice) ? item.unitPrice : unitPrice;
                rest = restObj;
                unitPriceObj[priceField] = hasTaxInclude ? TaxIncludedUnitPrice : UnitPrice;
                unitPriceObj.benchmarkPrice = hasTaxInclude ? TaxIncludedUnitPrice : UnitPrice;
                if (
                  hasTaxInclude &&
                  ((!isNil(item.taxIncludedUnitPrice) && isNil(item.unitPriceBatch)) ||
                    (isNil(item.taxIncludedUnitPrice) && !isNil(taxIncludedUnitPrice)))
                ) {
                  unitPriceObj.unitPriceBatch = unitPriceBatch;
                } else if (
                  !hasTaxInclude &&
                  ((!isNil(item.unitPrice) && isNil(item.unitPriceBatch)) ||
                    (isNil(item.unitPrice) && !isNil(unitPrice)))
                ) {
                  unitPriceObj.unitPriceBatch = unitPriceBatch;
                }
                if (doubleUnitEnabled) {
                  unitPriceObj[secondField] = isNumber(item[secondField])
                    ? item[secondField]
                    : restObj[secondField];
                  unitPriceObj.benchmarkPrice = isNumber(item[secondField])
                    ? item[secondField]
                    : restObj[secondField];
                }
                attributeFields = getAttributeFields(itemObj[item.itemId]);
              }
              return {
                ...attributeFields,
                ...item,
                ...unitPriceObj,
                occupiedQuantity: 0,
                currencyCode: isNumber(item[priceField]) ? item.currencyCode : rest.currencyCode,
                taxRate: isNumber(item[priceField]) ? item.taxRate : rest.taxRate,
                taxId: isNumber(item[priceField]) ? item.taxId : rest.taxId,
                taxCode: isNumber(item[priceField]) ? item.taxCode : rest.taxCode,
                // 新链路框架协议取全部数量
                quantity:
                  _linkFlag && acceptExecuteType === 'CONTRACT_FRAMEWORK'
                    ? item.quantity
                    : item.availableQuantity,
                secondaryQuantity:
                  _linkFlag && acceptExecuteType === 'CONTRACT_FRAMEWORK'
                    ? item.secondaryQuantity
                    : item.secondaryAvailableQuantity,
              };
            });
            const otherProps = {
              headerInfo,
            };
            // 处理新建的采购申请的行标的信息, 支持异步
            newData = remote
              ? await remote.process(
                  'SPCM_CONTRACT_MAINTAIN_DETAIL_TRANSFORM_CREATE_SUBJECT',
                  newData,
                  otherProps
                )
              : newData;
            addSubjectLines(newData);
            this.closeSubjectInfoModal();
          }
        });
      } else {
        addSubjectLines(selectedListRowsArrs);
        this.closeSubjectInfoModal();
      }
    }
  }

  /**
   * 保管人、验收人存name
   * @param {*} lovField
   * @param {*} form
   * @param {*} field
   */
  @Bind()
  handleSetFormValue(value, form, field) {
    form.setFieldsValue({
      [field]: value,
    });
  }

  /**
   * 批量维护
   */
  @Bind()
  async handleMaintain() {
    const { dataSource, onChangeListData, detailEnumMap = {} } = this.props;
    const { propertiesList = [] } = detailEnumMap;
    const { selectOptionKey, batchOptionValues } = this.state;
    const isCurrencyCode = ['currencyCode', 'purchaseCurrencyCode'].includes(selectOptionKey);
    let isDate = ['priceStartDate', 'priceEndDate', 'deliverDate'].includes(selectOptionKey);
    const filterData = propertiesList.filter((item) => {
      return item.value === selectOptionKey;
    });
    isDate = isDate || filterData.tag === 'DATE';
    const batchOptionValue = batchOptionValues && batchOptionValues[selectOptionKey];

    if (batchOptionValue) {
      let listDataSource = null;

      if (isCurrencyCode) {
        // 获取实时汇率表
        const rateValues = await this.getERateValues();

        listDataSource = (dataSource || []).map((_subject) => {
          let rateVal = null;
          let currencyCode = null;
          let isEquallity = false;
          if (selectOptionKey === 'currencyCode') {
            currencyCode = _subject.$form.getFieldValue('purchaseCurrencyCode');
            rateVal =
              (rateValues[batchOptionValue] && rateValues[batchOptionValue][currencyCode]) || {};
            isEquallity = batchOptionValue === currencyCode;
          } else {
            currencyCode = _subject.$form.getFieldValue('currencyCode');
            rateVal =
              (rateValues[currencyCode] && rateValues[currencyCode][batchOptionValue]) || {};
            isEquallity = batchOptionValue === currencyCode;
          }

          _subject.$form.registerField('disableChangeRate');

          const updateRateVal = {
            ...batchOptionValues,
            exchangeRate: isEquallity ? 1 : rateVal.rate,
            disableChangeRate: rateVal.rateMethodCode === 'FR',
          };
          _subject.$form.setFieldsValue(updateRateVal);

          return {
            ..._subject,
            ...updateRateVal,
          };
        });
      } else if (selectOptionKey === 'projectTaskId') {
        listDataSource = (dataSource || []).map((_subject) => {
          // 协议来源是手工创建或者协议来源是申请/寻源/订单/外部系统时，上游数据项目任务无值可编辑
          const changedObj = _subject.projectTaskEditFlag === 0 ? {} : { ...batchOptionValues };
          _subject.$form.setFieldsValue(changedObj);
          return {
            ..._subject,
            ...changedObj,
          };
        });
      } else {
        const changedObj = { ...batchOptionValues };
        if (isDate) {
          changedObj[selectOptionKey] = changedObj[selectOptionKey]
            ? moment(changedObj[selectOptionKey])
            : null;
        }
        listDataSource = (dataSource || []).map((_subject) => {
          _subject.$form.setFieldsValue(changedObj);
          return {
            ..._subject,
            ...changedObj,
          };
        });
      }

      onChangeListData({ pcSubjectDataSource: listDataSource });
    }
  }

  /**
   *  获取当前日期下的汇率定义
   */
  @Bind()
  async getERateValues() {
    const params = {
      rateDate: moment(new Date()).format(DATETIME_MIN),
      enabledFlag: 1,
    };
    const res1 = getResponse(await queryExchangeRates(params));
    let exchangeRates = [];
    if (res1 && res1.content) {
      exchangeRates = res1.content;
    }
    const res2 = getResponse(await queryExchangeRateTypes(params));
    let exchangeRateTypes = [];
    if (res2 && res2.content) {
      exchangeRateTypes = res2.content;
    }
    exchangeRateTypes = new Map(exchangeRateTypes.map((type) => [type.typeCode, type]));
    const rates = exchangeRates.reduce(
      (rats, { fromCurrencyCode, toCurrencyCode, rate, rateTypeCode }) => {
        return Object.assign(rats, {
          [fromCurrencyCode]: {
            ...rats[fromCurrencyCode],
            [toCurrencyCode]: {
              rate,
              rateMethodCode: exchangeRateTypes.get(rateTypeCode)?.rateMethodCode,
            },
          },
        });
      },
      {}
    );
    return rates;
  }

  // 查看适用范围
  @debounce(1500)
  viewApplicationOrgModal = (sourceAppScopeLineDTOs) => {
    const modalKey = c7nModal.key();
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      children: <ApplicationScope sourceAppScopeLineDTOs={sourceAppScopeLineDTOs} />,
      footer: null,
      style: { width: '1000px' },
    });
  };

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { tenantId, doubleUnitEnabled, relationDoc } = this.state;
    const {
      isPurchaseContract,
      editable,
      pageSourceKey,
      maintainEditable,
      onHandleRecord,
      headerInfo = {},
      form: { getFieldValue },
      originPage = {},
      detailEnumMap = {},
      doubleUomFlag,
      taxIncludedUpRequired: taxIcUpRequired,
      docLinkFlag = 0,
      remote,
      headerRef,
    } = this.props;
    // 页面来源-协议拟制
    const isContractMaintain = ['CONTRACT_MAINTAIN'].includes(pageSourceKey);
    // 优先取ref中的form表单值，没有取接口返回的headerInfo
    const headerData = headerRef?.props.form?.getFieldsValue() || { ...headerInfo };
    const { propertiesList = [] } = detailEnumMap;
    const {
      pcSourceCode,
      pcKindCode,
      contractPurpose,
      priceType = 'NONE', // 寻源接口返回数据可能不会返回priceType（标的行上也不会返回）字段，故设定一个默认值，该值标识“无需控制”
      priceTypeMeaning,
      pcHeaderId,
      manuallyModifyAmount,
      amountControlDimension,
    } = headerInfo;

    // 当协议性质为框架协议，物料名称选填，物料分类必填
    const pcKindRequired = !['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(pcKindCode);
    // 当为引用订单创建时
    const onlyReadFlag = pcSourceCode === 'PURCHASE_ORDER';

    // 当为true时价格批量不可编辑
    const unitPriceBatchFlag = ['SEARCH_SOURCE_RESULT', 'PURCHASE_ORDER'].includes(pcSourceCode);

    // 协议行金额上限Flag
    const lineMaxContractAmountFlag =
      amountControlDimension === 'LINE' && manuallyModifyAmount === '1';

    // 当协议性质为框架协议，协议用途为电商采购，该字段为false
    const taxIncludedUpRequired =
      taxIcUpRequired ||
      !(
        ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(pcKindCode) &&
        contractPurpose === 'OMMERCE_PURCHASE'
      );
    let columnArray = {};
    columnArray = [
      {
        title: intl.get(`spcm.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'lineNum',
        width: 100,
      },
      {
        title: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
        dataIndex: 'projectTaskId',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          // 协议来源是手工创建或者协议来源是申请/寻源/订单/外部系统时，上游数据项目任务无值可编辑
          record.projectTaskEditFlag !== 0 ? (
            <FormItem>
              {record.$form.getFieldDecorator(`projectTaskId`, {
                initialValue: val,
              })(
                <Lov
                  code="SIEC.PROJECT_TASK_TREE"
                  textValue={record.projectTaskName}
                  queryParams={{
                    businessObjectCode: 'SRM_C_SRM_SPCM_PC_HEADER',
                  }}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  tableDsProps={{
                    record: {
                      dynamicProps: {
                        selectable: (_record) => _record.get('isCheck') !== false,
                      },
                    },
                  }}
                />
              )}
            </FormItem>
          ) : (
            record.projectTaskName
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemCode`, {
                initialValue: val,
              })(
                <Lov
                  code="SPCM.ITEM_RELATE_PUR_PRICE"
                  onChange={(value, lovRecord) => this.handleItemOnChange(value, lovRecord, record)}
                  lovOptions={{ valueField: 'itemCode', displayField: 'itemCode' }}
                  textValue={val}
                  queryParams={{ enabledFlag: 1, companyId: headerInfo.companyId, tenantId }}
                />
              )}
              {record.$form.getFieldDecorator('itemId', { initialValue: record.itemId })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 130,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemName`, {
                rules: [
                  {
                    required: pcKindRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
                    }),
                  },
                  {
                    max: 360,
                    message: intl.get('hzero.common.validation.max', { max: 360 }),
                  },
                ],
                initialValue: record.itemName,
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
        title: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
        dataIndex: 'categoryName',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`categoryId`, {
                initialValue: record.categoryId,
                rules: [
                  {
                    required: !pcKindRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                  textField="categoryName"
                  textValue={record.categoryName}
                  queryParams={{
                    tenantId,
                    enabledFlag: 1,
                    hzeroUIFlag: 1,
                    businessObjectCode: 'SRM_C_SRM_SPCM_PC_HEADER',
                  }}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  tableDsProps={{
                    record: {
                      dynamicProps: {
                        selectable: (_record) => _record.get('isCheck') !== false,
                      },
                    },
                  }}
                />
              )}
              {record.$form.getFieldDecorator(`categoryName`, {
                initialValue: record.categoryName,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`specifications`, {
                initialValue: record.specifications,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(
                <Input
                  onChange={() => {
                    onHandleRecord(record);
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.model`).d('型号'),
        dataIndex: 'model',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`model`, {
                initialValue: record.model,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(
                <Input
                  onChange={() => {
                    onHandleRecord(record);
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled),
        dataIndex: 'uomName',
        width: 140,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`uomId`, {
                rules: [
                  {
                    required: taxIncludedUpRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getDynamicLabel(doubleUnitEnabled),
                    }),
                  },
                ],
                initialValue: record.uomId,
              })(
                <Lov
                  code="SPCM.UOM"
                  disabled={
                    doubleUnitEnabled || (doubleUomFlag && record.$form.getFieldValue('itemCode'))
                  }
                  lovOptions={{ valueField: 'uomId', displayField: 'uomCodeAndName' }}
                  textValue={record.uomCodeAndName}
                  textField="uomCodeAndName"
                  queryParams={{ tenantId }}
                  onChange={(value, lovRecord) => {
                    this.handleChangeUom(value, lovRecord, record);
                    onHandleRecord(record);
                  }}
                />
              )}
              {record.$form.getFieldDecorator(`uomName`, {
                initialValue: record.uomName,
              })}
              {record.$form.getFieldDecorator(`uomCode`, {
                initialValue: record.uomCode,
              })}
              {record.$form.getFieldDecorator(`uomCodeAndName`, {
                initialValue: record.uomCodeAndName,
              })}
            </FormItem>
          ) : (
            record.uomCodeAndName
          ),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
        dataIndex: 'quantity',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`quantity`, {
                rules: [
                  {
                    required: pcKindRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getDynamicLabel(doubleUnitEnabled, 'quantity'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => validateBits(value, callback, true),
                  },
                  {
                    validator: (rule, value, next) =>
                      this.numberValidator(
                        false,
                        value,
                        next,
                        record,
                        intl.get('spcm.common.model.common.quanPrecisionHighly').d('数量精度过高')
                      ),
                  },
                ],
                initialValue: record.quantity,
              })(
                <InputNumber
                  disabled={doubleUnitEnabled}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  // precision={record.$form.getFieldValue('uomPrecision') || record.uomPrecision}
                  allowThousandth
                  min={0}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.taxType`).d('税种'),
        dataIndex: 'taxId',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`taxId`, {
                rules: [
                  {
                    required: taxIncludedUpRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.model.common.taxType`).d('税种'),
                    }),
                  },
                ],
                initialValue: record.taxId,
              })(
                <Lov
                  code="SPCM.TAX"
                  textValue={record.taxCode}
                  textField="taxCode"
                  lovOptions={{ displayField: 'taxCode' }}
                  queryParams={{ tenantId }}
                  onChange={(value, lovRecord) => this.handleChangeTax(value, lovRecord, record)}
                />
              )}
              {record.$form.getFieldDecorator(`taxCode`, {
                initialValue: record.taxCode,
              })}
            </FormItem>
          ) : (
            record.taxCode
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.taxNum`).d('税率'),
        dataIndex: 'taxRate',
        width: 120,
        render: (_, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`taxRate`, {
              rules: [
                {
                  validator: (rule, value, next) =>
                    this.numberValidator(
                      false,
                      value,
                      next,
                      record,
                      intl.get('spcm.common.model.common.ratePrecisionHighly').d('税率精度过高')
                    ),
                },
              ],
              initialValue: record.taxRate,
            })(<InputNumber allowThousandth disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spcm.common.model.common.unitPriceBatch`).d('价格批量'),
        dataIndex: 'unitPriceBatch',
        width: 130,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !unitPriceBatchFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`unitPriceBatch`, {
                rules: [
                  {
                    validator: (rule, value, callback) => validateBits(value, callback),
                  },
                  {
                    validator: (rule, value, next) =>
                      this.numberValidator(
                        false,
                        value,
                        next,
                        record,
                        intl
                          .get('spcm.common.model.common.unitPriceBatchPrecisionHighly')
                          .d('价格批量精度过高')
                      ),
                  },
                ],
                initialValue:
                  headerInfo.pcSourceCode === 'PURCHASE_NEED' && !record.unitPriceBatch
                    ? 1
                    : record.unitPriceBatch,
              })(
                <InputNumber
                  min={0}
                  allowThousandth
                  disabled={doubleUnitEnabled}
                  style={{ width: '100%' }}
                  // precision={record.$form.getFieldValue('uomPrecision') || record.uomPrecision}
                  onChange={() => {
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            renderThousandthNum(val)
          ),
      },
      {
        title: intl.get(`spcm.common.currencyCode`).d('原币币种'),
        dataIndex: 'currencyCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`currencyCode`, {
                rules: [
                  {
                    required: taxIncludedUpRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.currencyCode`).d('原币币种'),
                    }),
                  },
                ],
                initialValue: record.currencyCode,
              })(
                <Lov
                  code="SPCM.CURRENCY"
                  textValue={record.currencyCode}
                  textField="currencyCode"
                  queryParams={{ tenantId }}
                  lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                  onChange={(_, lovRecord) => {
                    this.handleChangeFormItem();
                    this.handleChangeCurrencyCode(`currencyCode`, lovRecord, record);
                    onHandleRecord(record);
                  }}
                />
              )}
              {record.$form.getFieldDecorator(`currencyName`, {
                initialValue: record.currencyName,
              })}
              {record.$form.getFieldDecorator(`disableChangeRate`, {
                initialValue: record.disableChangeRate,
              })}
            </FormItem>
          ) : (
            record.currencyCode
          ),
      },
      {
        title: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
        dataIndex: 'purchaseCurrencyCode',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          !onlyReadFlag ? (
            <FormItem>
              {record.$form.getFieldDecorator(`purchaseCurrencyCode`, {
                rules: [
                  {
                    required: taxIncludedUpRequired,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
                    }),
                  },
                ],
                initialValue: record.purchaseCurrencyCode,
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
              {record.$form.getFieldDecorator(`purchaseCurrencyName`, {
                initialValue: record.purchaseCurrencyName,
              })}
            </FormItem>
          ) : (
            record.purchaseCurrencyCode
          ),
      },
      {
        title: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
        dataIndex: 'exchangeRate',
        width: 160,
        render: (val, record) => {
          // 当原币不可编辑时，需要在form中赋予初始值，否则，getEditTableData获取的原币数据将会是undefined
          if (
            ['create', 'update'].includes(record._status) &&
            ((!editable && !maintainEditable) || onlyReadFlag)
          ) {
            record.$form.getFieldDecorator('currencyCode', { initialValue: record.currencyCode });
          }
          return ['create', 'update'].includes(record._status) &&
            (editable || maintainEditable) &&
            !onlyReadFlag ? (
              <FormItem>
                {record.$form.getFieldDecorator(`exchangeRate`, {
                rules: [
                  {
                    required: !!taxIncludedUpRequired,
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
                  record.$form.getFieldValue('currencyCode')
                    ? 1
                    : record.exchangeRate,
              })(
                <InputNumber
                  allowThousandth
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  style={{ width: '100%' }}
                  disabled={
                    record.$form.getFieldValue('purchaseCurrencyCode') ===
                      record.$form.getFieldValue('currencyCode') ||
                    (record.$form.getFieldValue('disableChangeRate') == null
                      ? record.defaultExchangeRate === '1'
                      : record.$form.getFieldValue('disableChangeRate'))
                  } // disableChangeRate为前端自定义字段，用于判断币种变更操作后，汇率是否可编辑；defaultExchangeRate仅用于初始化，默认为上一保存的操作结果
                  min={0.0000000001}
                />
              )}
              :1
              </FormItem>
          ) : (
            `${record.exchangeRate}:1`
          );
        },
      },
      {
        title: intl.get(`spcm.common.priceType`).d('基准价'),
        dataIndex: 'priceType',
        width: 160,
        render: (_, record) => record.priceTypeMeaning || priceTypeMeaning,
      },
      // {
      //   title: intl.get(`sodr.common.model.common.taxAmount`).d('税额'),
      //   dataIndex: 'taxAmount',
      //   width: 120,
      // },
      // {
      //   title: intl.get(`spcm.common.model.common.currencyCode`).d('原币币种'),
      //   dataIndex: 'currencyCode',
      //   width: 120,
      //   render: (val, record) =>
      //     ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
      //       <FormItem>
      //         {record.$form.getFieldDecorator(`currencyCode`, {
      //           rules: [
      //             {
      //               required: true,
      //               message: intl.get('hzero.common.validation.notNull', {
      //                 name: intl.get(`spcm.common.model.common.currencyCode`).d('原币币种'),
      //               }),
      //             },
      //           ],
      //           initialValue: record.currencyCode,
      //         })(
      //           <Lov
      //             code="SPCM.CURRENCY"
      //             textValue={record.currencyCode}
      //             queryParams={{ tenantId }}
      //             lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
      //             onChange={() => {
      //               this.handleChangeFormItem();
      //               onHandleRecord(record);
      //             }}
      //           />
      //         )}
      //       </FormItem>
      //     ) : (
      //       val
      //     ),
      // },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'taxIncludedUnitPrice'),
        width: 140,
        dataIndex: 'taxIncludedUnitPrice',
        align: 'right',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          taxIncludedUpRequired &&
          !onlyReadFlag &&
          !doubleUnitEnabled &&
          ['TAX_INCLUDED_PRICE', 'NONE'].includes(record.priceType || priceType) ? ( // 优先取行上的priceType字段；若行上无该字段（新建状态下）则从协议头上取
            <FormItem>
              {record.$form.getFieldDecorator(`taxIncludedUnitPrice`, {
                rules: [
                  {
                    required: !doubleUnitEnabled,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getDynamicLabel(doubleUnitEnabled, 'taxIncludedUnitPrice'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => validateBits(value, callback),
                  },
                ],
                initialValue: record.taxIncludedUnitPrice,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  disabled={doubleUnitEnabled}
                  currency={record.$form.getFieldValue('currencyCode')}
                  style={{ width: '100%' }}
                  min={0}
                />
              )}
            </FormItem>
          ) : taxIncludedUpRequired ? (
            renderThousandthNum(val)
          ) : null,
      },
      {
        title: intl.get(`spcm.common.model.purchaseTaxIncludedPrice`).d('本币含税单价'),
        dataIndex: 'purchaseTaxIncludedPrice',
        width: 120,
        align: 'right',
        render: (val) => renderThousandthNum(val),
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'unitPrice'),
        dataIndex: 'unitPrice',
        width: 120,
        align: 'right',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          (editable || maintainEditable) &&
          taxIncludedUpRequired &&
          !onlyReadFlag &&
          !doubleUnitEnabled &&
          ['NET_PRICE', 'NONE'].includes(record.priceType || priceType) ? ( // 优先取行上的priceType字段；若行上无该字段（新建状态下）则从协议头上取
            <FormItem>
              {record.$form.getFieldDecorator(`unitPrice`, {
                rules: [
                  {
                    required: !doubleUnitEnabled,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getDynamicLabel(doubleUnitEnabled, 'unitPrice'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => validateBits(value, callback),
                  },
                ],
                initialValue: val,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  disabled={doubleUnitEnabled}
                  currency={record.$form.getFieldValue('currencyCode')}
                  style={{ width: '100%' }}
                  min={0}
                />
              )}
            </FormItem>
          ) : taxIncludedUpRequired ? (
            renderThousandthNum(val)
          ) : null,
      },
      {
        title: intl.get(`spcm.common.model.taxIncludedLineAmount`).d('原币含税行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 120,
        align: 'right',
        render: (val) => (taxIncludedUpRequired ? renderThousandthNum(val) : null),
      },
      {
        title: intl.get(`spcm.common.model.purchaseTaxLineAmount`).d('本币含税行金额'),
        dataIndex: 'purchaseTaxLineAmount',
        width: 160,
        align: 'right',
        render: (val) => (taxIncludedUpRequired ? renderThousandthNum(val) : null),
      },
      {
        title: intl.get(`spcm.common.model.lineAmount`).d('原币不含税行金额'),
        dataIndex: 'lineAmount',
        width: 160,
        align: 'right',
        render: (val) => (taxIncludedUpRequired ? renderThousandthNum(val) : null),
      },
      {
        title: intl.get(`spcm.common.model.taxAmount`).d('原币税额'),
        dataIndex: 'taxAmount',
        width: 120,
        align: 'right',
        render: (val) => (taxIncludedUpRequired ? renderThousandthNum(val) : null),
      },
      {
        title: intl.get('spcm.common.model.taxIncludedUnitPrice.chinese').d('大写含税单价'),
        dataIndex: 'taxIncludedUnitPriceChinese',
        width: 150,
      },
      {
        title: intl
          .get('spcm.common.model.purchaseTaxIncludedPrice.chinese')
          .d('大写本币含税单价(原币含税单价x（本币/原币）)'),
        dataIndex: 'purchaseTaxIncludedPriceChinese',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.taxIncludedLineAmount.chinese').d('大写含税行金额'),
        dataIndex: 'taxIncludedLineAmountChinese',
        width: 150,
      },
      {
        title: intl
          .get('spcm.common.model.purchaseTaxLineAmount.chinese')
          .d('大写本币含税行金额(原币含税行金额x（本币/原币）)'),
        dataIndex: 'purchaseTaxLineAmountChinese',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.taxAmount.chinese').d('大写税额'),
        dataIndex: 'taxAmountChinese',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.unitPrice.chinese').d('大写单价'),
        dataIndex: 'unitPriceChinese',
        width: 150,
      },
      {
        title: intl.get('spcm.common.model.lineAmount.chinese').d('大写行金额'),
        dataIndex: 'lineAmountChinese',
        width: 150,
      },
      {
        title: intl.get(`spcm.common.model.common.priceStartDate`).d('价格有效期从'),
        width: 150,
        dataIndex: 'priceStartDate',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`priceStartDate`, {
                initialValue: record.priceStartDate ? moment(record.priceStartDate) : undefined,
              })(
                <DatePicker
                  placeholder={null}
                  format={DEFAULT_DATE_FORMAT}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  disabledDate={(currentDate) =>
                    record.$form.getFieldValue('priceEndDate') &&
                    moment(record.$form.getFieldValue('priceEndDate')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.priceEndDate`).d('价格有效期至'),
        width: 150,
        dataIndex: 'priceEndDate',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`priceEndDate`, {
                initialValue: record.priceEndDate ? moment(record.priceEndDate) : undefined,
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if (
                        value &&
                        record.$form.getFieldValue('priceStartDate') &&
                        moment(record.$form.getFieldValue('priceStartDate')).isAfter(value, 'day')
                      ) {
                        callback(
                          intl
                            .get(`spcm.common.message.priceEndDateMorethanPriceStartDate`)
                            .d('价格有效期至不能小于价格有效期从')
                        );
                      }
                      callback();
                    },
                  },
                ],
              })(
                <DatePicker
                  placeholder={null}
                  format={DEFAULT_DATE_FORMAT}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  disabledDate={(currentDate) =>
                    record.$form.getFieldValue('priceStartDate') &&
                    moment(record.$form.getFieldValue('priceStartDate')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.ladderQuote`).d('阶梯价格'),
        width: 100,
        dataIndex: 'ladderQuote',
        render: (val, record) => (
          <a disabled={record._status === 'create'} onClick={() => this.handleLadderQuote(record)}>
            {intl.get(`spcm.common.model.common.ladderQuote`).d('阶梯价格')}
          </a>
        ),
      },
      {
        title: intl.get(`spcm.common.model.common.needByDate`).d('交付日期'),
        width: 150,
        dataIndex: 'deliverDate',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`deliverDate`, {
                initialValue: record.deliverDate ? moment(record.deliverDate) : undefined,
              })(
                <DatePicker
                  placeholder={null}
                  format={getDateFormat()}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                  disabledDate={(currentDate) =>
                    currentDate && moment().isAfter(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.guaranteePeriod`).d('保质期'),
        width: 150,
        dataIndex: 'guaranteePeriod',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`guaranteePeriod`, {
                initialValue: record.guaranteePeriod,
              })(
                <Input
                  onChange={() => {
                    onHandleRecord(record);
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.packages`).d('包装'),
        width: 150,
        dataIndex: 'packages',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`packages`, {
                initialValue: record.packages,
              })(
                <Input
                  onChange={() => {
                    onHandleRecord(record);
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.manufacturer`).d('生产厂家'),
        width: 150,
        dataIndex: 'manufacturer',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`manufacturer`, {
                initialValue: record.manufacturer,
              })(
                <Input
                  onChange={() => {
                    onHandleRecord(record);
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.brandName`).d('品牌'),
        width: 150,
        dataIndex: 'brand',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`brand`, {
                initialValue: record.brand,
              })(
                <Input
                  onChange={() => {
                    onHandleRecord(record);
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.export.itemPropertiesMeaning`).d('属性'),
        dataIndex: 'itemProperties',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`itemProperties`, {
                initialValue: record.itemProperties,
              })(
                <Select
                  allowClear
                  style={{ minWidth: 150 }}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                >
                  {propertiesList.map((n) => (
                    <Select.Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            record.itemPropertiesMeaning
          ),
      },
      {
        title: intl.get(`spcm.common.model.agentName`).d('采购员'),
        dataIndex: 'agentName',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`agentId`, {
                initialValue: record.agentId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PURCHASE_AGENT"
                  textValue={record.agentName}
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
        title: intl.get(`spcm.common.model.keeperUserName`).d('保管人'),
        dataIndex: 'keeperUserName',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`keeperUserId`, {
                initialValue: record.keeperUserId,
              })(
                <Lov
                  code="SSLM.USER"
                  textValue={record.keeperUserName}
                  queryParams={{
                    tenantId,
                  }}
                  onChange={(_, lovRecord) => {
                    this.handleSetFormValue(lovRecord.userName, record.$form, 'keeperUserName');
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
              {record.$form.getFieldDecorator('keeperUserName', {
                initialValue: record.keeperUserName,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.accepterUserName`).d('验收人'),
        dataIndex: 'accepterUserName',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`accepterUserId`, {
                initialValue: record.accepterUserId,
              })(
                <Lov
                  code="SSLM.USER"
                  textValue={record.accepterUserName}
                  queryParams={{
                    tenantId,
                  }}
                  onChange={(_, lovRecord) => {
                    this.handleSetFormValue(lovRecord.userName, record.$form, 'accepterUserName');
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
              {record.$form.getFieldDecorator('accepterUserName', {
                initialValue: record.accepterUserName,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.expBearDep`).d('费用承担部门'),
        dataIndex: 'expBearDep',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`expBearDepId`, {
                initialValue: record.expBearDepId,
              })(
                <Lov
                  code="SPFM.UNIT_G_C"
                  textValue={record.expBearDep}
                  queryParams={{
                    organizationId: tenantId,
                    levelPathFrom: 0,
                    levelPathTo: 3,
                    unitTypeCode: 'D',
                    unitCompanyId: getFieldValue('companyOrgId'),
                  }}
                  onChange={(_, lovRecord) => {
                    this.handleSetFormValue(lovRecord.unitName, record.$form, 'expBearDep');
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
              {record.$form.getFieldDecorator('expBearDep', {
                initialValue: record.expBearDep,
              })}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.location`).d('地点'),
        dataIndex: 'address',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`address`, {
                initialValue: record.address,
              })(
                // TODO
                <Input
                  onChange={() => {
                    onHandleRecord(record);
                    this.handleChangeFormItem();
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.projectCode`).d('项目编码'),
        dataIndex: 'projectNum',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`projectNum`, {
                initialValue: record.projectNum,
              })(
                <Lov
                  code="SPCM.PROJECT"
                  textField="projectNum"
                  textValue={record.projectName}
                  queryParams={{
                    tenantId,
                    companyId: headerInfo.companyId,
                  }}
                  onChange={(_1, lov) => {
                    this.handleProjectChange(record.pcSubjectId, lov);
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
        title: intl.get(`spcm.common.model.invOrganizationId`).d('库存组织'),
        dataIndex: 'invOrganizationId',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`invOrganizationId`, {
                initialValue: record.invOrganizationId,
              })(
                <Lov
                  code="SPCM.UNIT_PUR_ORGANIZATION"
                  textValue={record.invOrganizationName}
                  textField="invOrganizationName"
                  queryParams={{
                    tenantId,
                    ouId: headerData.ouId || undefined,
                  }}
                  onChange={() => {
                    this.handleChangeFormItem();
                    onHandleRecord(record);
                  }}
                />
              )}
            </FormItem>
          ) : (
            record.invOrganizationName
          ),
      },
      {
        title: intl.get(`spcm.common.model.projectName`).d('项目名称'),
        dataIndex: 'projectName',
        width: 180,
      },
      {
        title: (
          <>
            {intl.get(`spcm.common.model.contractActualSource`).d('协议实际来源')}
            <Tooltip
              title={intl
                .get('spcm.common.view.message.contractActualSource')
                .d('外部系统导入的协议，该字段展示实际协议来源')}
            >
              <H0Icon type="question-circle-o" style={{ verticalAlign: 'unset', marginLeft: 2 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'contractActualSource',
        width: 120,
        render: (_, record) => record.contractActualSourceMeaning,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 250,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`remark`, {
                initialValue: record.remark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(
                <Input
                  style={{ minWidth: '250px' }}
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
        title: intl.get(`spcm.common.model.benchmarkPrice`).d('基准价格'),
        dataIndex: 'benchmarkPrice',
        width: 150,
      },
      // 本身不是单据流详情页（防止套娃现象发生），且业务规则配置单据流显示
      !Number(docLinkFlag) &&
        ['1', 1].includes(relationDoc?.displayDocFlow) && {
          title: intl.get(`spcm.common.documentFlow`).d('单据流'),
          dataIndex: 'documentFlow',
          width: 100,
          render: (_, record) => {
            return (
              record._status !== 'create' && (
                <DocFlow
                  tableName="spcm_pc_subject"
                  tablePk={record.pcSubjectId}
                  buttonType="button"
                />
              )
            );
          },
        },
      amountControlDimension === 'LINE' &&
        isContractMaintain && {
          title: (
            <Tooltip
              title={intl
                .get('spcm.common.model.common.orderLineAmountRatioTip')
                .d('该字段计算逻辑为：（协议行订单已占用金额/协议行金额上限）*100%')}
            >
              {intl
                .get('spcm.common.model.common.orderLineAmountRatio')
                .d('订单已占用行金额比例（%）')}
              <H0Icon type="question-circle-o" style={{ marginLeft: 2 }} />
            </Tooltip>
          ),
          dataIndex: 'orderOccupiedLineAmountRatio',
          width: 120,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator(`orderOccupiedLineAmountRatio`, {
                  initialValue: record.orderOccupiedLineAmountRatio,
                })(<InputNumber disabled precision={2} />)}
              </FormItem>
            ) : (
              val
            ),
        },
    ].filter(Boolean);
    // 协议金额相关行
    const agreementAmountLines = [
      lineMaxContractAmountFlag && {
        dataIndex: 'lineMaxContractAmount',
        width: 180,
        title: intl.get(`spcm.common.model.field.lineMaxContractAmount`).d('协议行金额上限'),
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (editable || maintainEditable) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`lineMaxContractAmount`, {
                initialValue: record.lineMaxContractAmount,
                rules: [
                  {
                    required: lineMaxContractAmountFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spcm.common.model.field.lineMaxContractAmount`)
                        .d('协议行金额上限'),
                    }),
                  },
                ],
              })(<InputNumber min={0} allowThousandth />)}
            </FormItem>
          ) : (
            val
          ),
      },
      amountControlDimension === 'LINE' && {
        title: intl
          .get(`spcm.common.model.field.taxIncludeLineOccupiedAmount`)
          .d('协议行订单已占用含税金额'),
        dataIndex: 'taxIncludeLineOccupiedAmount',
        width: 180,
      },
      amountControlDimension === 'LINE' && {
        title: intl.get(`spcm.common.model.field.lineOccupiedAmount`).d('协议行订单已占用未税金额'),
        dataIndex: 'lineOccupiedAmount',
        width: 180,
      },
    ].filter(Boolean);
    if (pcSourceCode === 'SEARCH_SOURCE_RESULT') {
      const sourceResultColumn = [
        {
          title: intl
            .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
            .d('适用其他组织'),
          dataIndex: 'sourceAppScopeLineDTOs',
          width: 120,
          render: (_, record) => (
            <a
              onClick={() => this.viewApplicationOrgModal(record.sourceAppScopeLineDTOs)}
              disabled={!record.sourceAppScopeLineDTOs}
            >
              {intl
                .get('ssrc.inquiryHall.model.inquiryHall.applicationOrganization')
                .d('适用其他组织')}
            </a>
          ),
        },
      ];
      columnArray = columnArray.concat(sourceResultColumn);
    }
    let maintainEditableAddColumn = [
      {
        title: intl.get(`spcm.common.model.sourceCode`).d('来源单据编号'),
        dataIndex: 'sourceCode',
        width: 120,
      },
      {
        title: intl.get(`spcm.common.model.sourceLineNum`).d('来源单据行号'),
        dataIndex: 'sourceLineNum',
        width: 120,
        render: (value, record) =>
          pcSourceCode === 'PURCHASE_NEED' ? record.sourceDisplayLineNum : value,
      },
    ];
    if (!originPage.contractMaintain) {
      const outOfMaintain = [
        // {
        //   title: intl.get(`spcm.common.model.receiptsStatus`).d('执行状态'),
        //   dataIndex: 'receiptsStatusMeaning',
        //   width: 120,
        // },
        ['1', 1].includes(relationDoc?.displayDoc) && {
          title: intl.get(`spcm.common.model.soureNum`).d('执行单据单号'),
          dataIndex: 'soureNum',
          width: 120,
          render: (_, record) => (
            <a onClick={() => this.handleControlDocumentModal(record.pcSubjectId)}>
              {intl.get('spcm.common.view.message.title.executiveDocument').d('执行单据')}
            </a>
          ),
        },
        {
          title: intl.get(`spcm.common.model.execteLineNum`).d('执行单据行号'),
          dataIndex: 'execteLineNum',
          width: 120,
        },
      ].filter(Boolean);
      maintainEditableAddColumn = maintainEditableAddColumn.concat(outOfMaintain);
    }
    columnArray = columnArray.concat(maintainEditableAddColumn);
    if (doubleUnitEnabled) {
      const axuColumns = [
        {
          title: intl.get(`spcm.common.model.common.unit`).d('单位'),
          dataIndex: 'secondaryUomId',
          width: 140,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) &&
            (editable || maintainEditable) &&
            !onlyReadFlag ? (
              <FormItem>
                {record.$form.getFieldDecorator(`secondaryUomId`, {
                  rules: [
                    {
                      required: taxIncludedUpRequired,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spcm.common.model.common.unit`).d('单位'),
                      }),
                    },
                  ],
                  initialValue: record.secondaryUomId,
                })(
                  <Lov
                    code="SMDM_ITEM_ORG_UOM"
                    disabled={
                      !doubleUnitEnabled ||
                      (doubleUomFlag && record.$form.getFieldValue('itemCode'))
                    }
                    lovOptions={{ valueField: 'uomId', displayField: 'uomCodeAndName' }}
                    textValue={record.secondaryUomCodeAndName}
                    queryParams={{
                      tenantId,
                      itemId: record.$form.getFieldValue('itemId'),
                      primaryUomId: record.$form.getFieldValue('uomId'),
                    }}
                    textField="secondaryUomCodeAndName"
                    onChange={(_, lovRecord) => {
                      conversionUpdateUomIdForH0({
                        record,
                        fieldName: 'uom',
                        fieldProps: lovRecord,
                        doubleUnitEnabled,
                      });
                      onHandleRecord(record);
                      this.handleChangeFormItem();
                    }}
                  />
                )}
                {record.$form.getFieldDecorator('secondaryUomName', {
                  initialValue: record.secondaryUomName,
                })}
                {record.$form.getFieldDecorator('secondaryUomName', {
                  initialValue: record.secondaryUomCode,
                })}
                {record.$form.getFieldDecorator('secondaryUomCodeAndName', {
                  initialValue: record.secondaryUomCodeAndName,
                })}
                {record.$form.getFieldDecorator('secondaryUomPrecision', {
                  initialValue: record.secondaryUomPrecision,
                })}
              </FormItem>
            ) : (
              record.secondaryUomCodeAndName
            ),
        },
        {
          title: intl.get(`spcm.common.model.common.quantity`).d('数量'),
          dataIndex: 'secondaryQuantity',
          width: 120,
          render: (val, record) =>
            ['create', 'update'].includes(record._status) &&
            (editable || maintainEditable) &&
            !onlyReadFlag ? (
              <FormItem>
                {record.$form.getFieldDecorator(`secondaryQuantity`, {
                  rules: [
                    {
                      required: pcKindRequired,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spcm.common.model.common.quantity`).d('数量'),
                      }),
                    },
                    {
                      validator: (rule, value, callback) => validateBits(value, callback, true),
                    },
                    {
                      validator: (rule, value, next) =>
                        this.numberValidator(
                          true,
                          value,
                          next,
                          record,
                          intl.get('spcm.common.model.common.quanPrecisionHighly').d('数量精度过高')
                        ),
                    },
                  ],
                  initialValue: record.secondaryQuantity,
                })(
                  <InputNumber
                    disabled={!doubleUnitEnabled}
                    onChange={(value) => {
                      this.handleSecondaryNumChange(value, record);
                      this.handleChangeFormItem();
                      onHandleRecord(record);
                    }}
                    // precision={record.$form.getFieldValue('uomPrecision') || record.uomPrecision}
                    allowThousandth
                    min={0}
                    style={{ width: '100%' }}
                  />
                )}
              </FormItem>
            ) : (
              renderThousandthNum(val)
            ),
        },
        {
          title: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
          width: 140,
          dataIndex: 'taxIncludedSecondaryUnitPrice',
          align: 'right',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) &&
            (editable || maintainEditable) &&
            taxIncludedUpRequired &&
            !onlyReadFlag &&
            ['TAX_INCLUDED_PRICE', 'NONE'].includes(record.priceType || priceType) ? ( // 优先取行上的priceType字段；若行上无该字段（新建状态下）则从协议头上取
              <FormItem>
                {record.$form.getFieldDecorator(`taxIncludedSecondaryUnitPrice`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
                      }),
                    },
                    {
                      validator: (rule, value, callback) => validateBits(value, callback),
                    },
                  ],
                  initialValue: val,
                })(
                  <PrecisionInputNumber
                    type="hzero"
                    onChange={() => {
                      this.handleChangeFormItem();
                      onHandleRecord(record);
                    }}
                    currency={record.$form.getFieldValue('currencyCode')}
                    style={{ width: '100%' }}
                    min={0}
                  />
                )}
              </FormItem>
            ) : taxIncludedUpRequired ? (
              renderThousandthNum(val)
            ) : null,
        },
        {
          title: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
          dataIndex: 'secondaryUnitPrice',
          width: 120,
          align: 'right',
          render: (val, record) =>
            ['create', 'update'].includes(record._status) &&
            (editable || maintainEditable) &&
            taxIncludedUpRequired &&
            !onlyReadFlag &&
            ['NET_PRICE', 'NONE'].includes(record.priceType || priceType) ? ( // 优先取行上的priceType字段；若行上无该字段（新建状态下）则从协议头上取
              <FormItem>
                {record.$form.getFieldDecorator(`secondaryUnitPrice`, {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
                      }),
                    },
                    {
                      validator: (rule, value, callback) => validateBits(value, callback),
                    },
                  ],
                  initialValue: val,
                })(
                  <PrecisionInputNumber
                    type="hzero"
                    onChange={() => {
                      this.handleChangeFormItem();
                      onHandleRecord(record);
                    }}
                    currency={record.$form.getFieldValue('currencyCode')}
                    style={{ width: '100%' }}
                    min={0}
                  />
                )}
              </FormItem>
            ) : taxIncludedUpRequired ? (
              renderThousandthNum(val)
            ) : null,
        },
      ];
      columnArray = columnArray.concat(axuColumns);
    }

    // 我发起的协议 显示字段
    if (isPurchaseContract) {
      columnArray = columnArray.concat([
        {
          title: intl.get(`spcm.common.model.occupancyRecords`).d('金额占用记录查询'),
          dataIndex: 'occupancyRecords',
          width: 120,
          // 预算类型,1代表行生成预算，2代表头生成预算，0代表没有生成
          render: (_, record) =>
            ['1', '2'].includes(record.budgetType) && (
              <BudgetModal
                documentType="PC"
                docLineId={record.budgetType === '1' ? record.pcSubjectId : pcHeaderId}
              />
            ),
        },
        ...agreementAmountLines,
      ]);
    }

    const extraColumns = [
      {
        dataIndex: 'referPrice',
        title: intl.get('spcm.common.model.common.referPrice').d('参考价格'),
        width: 150,
        render: (val, record) => {
          // 不可编辑
          const disabled = !(editable || maintainEditable) || onlyReadFlag;
          return ['PURCHASE_NEED', 'MANUALLY'].includes(pcSourceCode) ? (
            <a disabled={disabled} onClick={() => this.handleClickReferPrice(record)}>
              {intl.get('spcm.common.model.common.referPrice').d('参考价格')}
            </a>
          ) : (
            ''
          );
        },
      },
    ];
    // 协议拟制添加行
    if (maintainEditable) {
      columnArray = columnArray.concat(extraColumns);
    }
    if (isContractMaintain) {
      columnArray = columnArray.concat(agreementAmountLines);
    }

    return remote
      ? remote.process('SPCM_CONTRACT_MAINTAIN_DETAIL_SUBJECT_COLUMN', columnArray, {
          current: this,
        })
      : columnArray;
  }

  /**
   *  点击参考价格
   */
  @Bind()
  handleClickReferPrice(record) {
    const { headerRef, headerInfo } = this.props;
    const headerData = headerRef?.props.form?.getFieldsValue() || {};
    const headerParams = getHeaderParams({
      ...headerInfo,
      ...headerData,
      supplierCompanyId: headerInfo.supplierCompanyId, // 协议头平台供应商如果没有值，form表单会初始化supplierComanyName，所以不能用form表单的值
    });
    const params = {
      type: 'H0',
      // customizeTable,
      customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.REFERENCE_PRICE',
      queryParams: {
        ...record,
        ...(record?.$form?.getFieldsValue() || {}),
        ...headerParams,
      },
      onOk: (priceTableDs) => {
        this.handleChangePrice(priceTableDs, record);
      },
    };
    openC7nPriceModal(params);
  }

  @Bind()
  handleChangePrice(priceTableDs, record) {
    const { headerInfo, onHandleRecord } = this.props;
    const { doubleUnitEnabled } = this.state;
    const { selected } = priceTableDs;
    const { priceType } = headerInfo;
    if (isEmpty(selected)) return;
    const data = selected[0].toJSONData();
    const {
      taxRate,
      taxId,
      taxCode,
      currencyCode,
      uomId,
      uomCode,
      uomName,
      uomPrecision,
      uomCodeAndName,
      taxPrice,
      unitPrice,
    } = data;
    const commonField = {
      taxId,
      taxCode,
      currencyCode,
    };
    // 开启双单位
    if (
      !validateDoubleUom({
        doubleUnitEnabled,
        priceUomId: uomId,
        uomId: record.$form.getFieldValue('uomId'),
      })
    ) {
      return false;
    }
    // 判断基准价
    const hasTaxInclude = priceType === 'TAX_INCLUDED_PRICE';
    let priceField = hasTaxInclude ? 'taxIncludedUnitPrice' : 'unitPrice';
    let uomObj = {
      uomId,
      uomCode,
      uomName,
      uomPrecision,
    };
    // 开启双单位
    if (doubleUnitEnabled) {
      priceField = hasTaxInclude ? 'taxIncludedSecondaryUnitPrice' : 'secondaryUnitPrice';
      uomObj = {
        ...uomObj,
        secondaryUomPrecision: uomPrecision,
      };
      conversionUpdateUomIdForH0({
        record,
        fieldName: 'uom',
        fieldProps: uomObj,
        doubleUnitEnabled,
      });
    } else {
      // 修改单位
      this.handleChangeUom(null, uomObj, record);
      // 单独修改单位uomCodeAndName
      record.$form.setFieldsValue({
        uomCodeAndName,
      });
    }

    record.$form.setFieldsValue({
      ...commonField,
      [priceField]: hasTaxInclude ? taxPrice : unitPrice,
    });
    // 修改币种触发事件
    this.handleChangeCurrencyCode('currencyCode', { currencyCode }, record);
    // 修改税种
    this.handleChangeTax(null, { taxRate }, record);
    onHandleRecord(record);
    this.handleChangeFormItem();
    //  const listDataSource = dataSource.map((item) => {
    //   if (item.pcSubjectId === record.pcSubjectId) {
    //     return {
    //       ...item,
    //       currencyCode,
    //       taxCode,
    //       edited: true,
    //     };
    //   }
    //   return item;
    // });
    // onChangeListData({ pcSubjectDataSource: listDataSource });
  }

  /**
   * 获取可以显示的按钮
   */
  getButtons() {
    const {
      editable,
      maintainEditable = false,
      onAdd,
      onSave,
      onDelete,
      deleting,
      saveSubjectLoading,
      headerInfo: { pcSourceCode, supplementFlag },
      // showSearchSubject,
      remote,
    } = this.props;
    let btnProps = [];
    // 当为引用订单创建时
    const onlyReadFlag = pcSourceCode === 'PURCHASE_ORDER';

    // if (showSearchSubject) {
    //   btnProps = btnProps.concat([
    //     {
    //       type: 'primary',
    //       'data-name': 'search',
    //       onClick: this.handleSearchSubject,
    //       text: intl.get('hzero.common.button.search').d('查询'),
    //     },
    //   ]);
    // }

    if (editable || maintainEditable) {
      btnProps = btnProps.concat([
        {
          type: 'primary',
          'data-name': 'create',
          disabled: onlyReadFlag && supplementFlag,
          onClick: ['PURCHASE_NEED', 'SEARCH_SOURCE_RESULT'].includes(pcSourceCode)
            ? this.addSubject
            : pcSourceCode === 'PURCHASE_ORDER'
            ? () => this.handleControlModal('poVisible')
            : onAdd,
          text: intl.get(`hzero.common.button.create`).d('新建'),
        },
        {
          loading: saveSubjectLoading,
          'data-name': 'save',
          onClick: onSave,
          text: intl.get(`hzero.common.button.save`).d('保存'),
        },
        {
          loading: deleting,
          onClick: onDelete,
          'data-name': 'delete',
          disabled: onlyReadFlag && supplementFlag,
          text: intl.get(`hzero.common.button.delete`).d('删除'),
        },
      ]);
      btnProps = remote
        ? remote.process('SPCM_CONTRACT_MAINTAIN_DETAIL_SUBJECT_BTNS', btnProps, {
            current: this,
          })
        : btnProps;
    }

    if (btnProps.length > 0) {
      return map(btnProps, (prop) => {
        const btnProp = { ...prop };
        delete btnProp.text;
        return <Button {...btnProp}>{prop.text}</Button>;
      });
    }
    return [];
  }

  @Bind()
  getComFieldDisabled(key) {
    const { headerInfo } = this.props;
    const { pcSourceCode } = headerInfo;
    // 引用订单创建时，不可编辑物料名称、物料分类和本币币种
    const disabled =
      ['categoryName', 'itemName'].includes(key) && pcSourceCode === 'PURCHASE_ORDER';
    return disabled;
  }

  @Bind()
  getComLovProps(key, lovData) {
    const {
      headerInfo,
      form: { getFieldValue },
    } = this.props;
    const { tenantId } = this.state;

    // 处理lov值集
    let queryParams = { tenantId };
    if (!isEmpty(lovData)) {
      // 增加参数
      if (lovData.length > 3) {
        const paramKeys = lovData.slice(3, lovData.length);
        paramKeys.forEach((param) => {
          queryParams[param] = headerInfo[param];
        });
      }

      switch (key) {
        // 费用承担部门
        case 'expBearDep':
          queryParams = {
            organizationId: tenantId,
            levelPathFrom: 0,
            levelPathTo: 3,
            unitTypeCode: 'D',
            unitCompanyId: getFieldValue('companyOrgId'),
          };
          break;
        case 'categoryName':
          queryParams = {
            tenantId,
            enabledFlag: 1,
            hzeroUIFlag: 1,
            businessObjectCode: 'SRM_C_SRM_SPCM_PC_HEADER',
          };
          break;
        case 'projectTaskId':
          queryParams = {
            tileTreeFlag: 1,
            hzeroUIFlag: 1,
            businessObjectCode: 'SRM_C_SRM_SPCM_PC_HEADER',
          };
          break;
        default:
          break;
      }
    }
    // lov返回的值和实际回写的值不一致,主要是标准字段src-15738
    const convertObj = {
      categoryName: {
        valueField: 'categoryId',
        displayField: 'categoryName',
      },
      agentName: {
        valueField: 'agentId',
        displayField: 'agentName',
      },
      expBearDep: {
        valueField: 'expBearDepId',
        displayField: 'expBearDep',
      },
      accepterUserName: {
        valueField: 'accepterUserId',
        displayField: 'accepterUserName',
      },
      keeperUserName: {
        valueField: 'keeperUserId',
        displayField: 'keeperUserName',
      },
      projectTaskId: {
        valueField: 'projectTaskId',
        displayField: 'projectTaskName',
      },
    };

    let convertField = {};
    if (Object.keys(convertObj).includes(key)) {
      convertField = convertObj[key];
    }
    const onChange = (val, record) => {
      this.batchOptionChangeAll({
        [convertField.valueField || key]: record[lovData[1]],
        [convertField.displayField || lovData[2]]: record[lovData[2]], // 针对行上已有字段翻译
        [`${key}Meaning`]: record[lovData[2]], // 针对个性化字段翻译
      });
    };
    return { queryParams, onChange };
  }

  @Bind()
  getComCustom(key) {
    const {
      form: { getFieldDecorator },
      newEnumMap = {},
    } = this.props;
    const { batchMaintenance = [] } = newEnumMap;
    // const { tenantId } = this.state;
    if (batchMaintenance.length === 0) return null;
    const currySelectData = batchMaintenance.find((item) => {
      return item.value === key;
    });
    const lovData = currySelectData.description?.split(';') || [];
    const disabled = this.getComFieldDisabled(key);
    const lovProps = this.getComLovProps(key, lovData);
    const obj = {
      DATE: (val) => {
        return (
          <FormItem label=":" className={styles['operation-wrapper-labelWidth']}>
            {getFieldDecorator(val)(
              <DatePicker
                placeholder={null}
                format={DATETIME_MIN}
                onChange={(_, record) =>
                  this.batchOptionChangeAll({
                    [val]: record,
                  })
                }
              />
            )}
          </FormItem>
        );
      },
      LOV_VIEW: (val) => {
        return (
          <FormItem label=":" className={styles['operation-wrapper-labelWidth']}>
            {getFieldDecorator(val)(
              <Lov
                code={lovData[0]}
                tableDsProps={{
                  record: {
                    dynamicProps: {
                      selectable: (_record) => _record.get('isCheck') !== false,
                    },
                  },
                }}
                disabled={disabled}
                {...lovProps}
              />
            )}
          </FormItem>
        );
      },
      SELECT: (val) => {
        return (
          <FormItem label=":" className={styles['operation-wrapper-labelWidth']}>
            {getFieldDecorator(val)(
              <Select
                onChange={(value) => {
                  this.handleChangeFormItem();
                  this.batchOptionChangeAll({
                    [val]: value,
                  });
                }}
              >
                {(this.state[`${val}OptionsData`] || []).map((n) => (
                  <Select.Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>
        );
      },
      INPUT: (val) => {
        return (
          <FormItem label=":" className={styles['operation-wrapper-labelWidth']}>
            {getFieldDecorator(val)(
              <Input
                disabled={disabled}
                onChange={(_) => {
                  this.handleChangeFormItem();
                  this.batchOptionChangeAll({
                    [val]: _.target.value,
                  });
                }}
              />
            )}
          </FormItem>
        );
      },
    };
    if (!obj[currySelectData?.tag]) return '';
    const com = obj[currySelectData?.tag](currySelectData.value, currySelectData);
    return com;
  }

  // 批量维护的字段的所属组件
  @Bind()
  getMaintenanceCom(key) {
    const {
      form: { getFieldDecorator },
      headerInfo: { pcSourceCode },
    } = this.props;
    const { tenantId } = this.state;
    const com = this.getComCustom(key);
    switch (key) {
      case 'currencyCode':
        return (
          <FormItem label=":" className={styles['operation-wrapper-labelWidth']}>
            {getFieldDecorator(`currencyCode`)(
              <Lov
                code="SPCM.CURRENCY"
                queryParams={{ tenantId }}
                lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                onChange={(_, record) =>
                  this.batchOptionChangeAll({
                    currencyName: record.currencyName,
                    currencyCode: record.currencyCode,
                  })
                }
              />
            )}
          </FormItem>
        );
      case 'purchaseCurrencyCode':
        return (
          <FormItem label=":" className={styles['operation-wrapper-labelWidth']}>
            {getFieldDecorator(`purchaseCurrencyCode`)(
              <Lov
                code="SPCM.CURRENCY"
                disabled={pcSourceCode === 'PURCHASE_ORDER'}
                queryParams={{ tenantId }}
                lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                onChange={(_, record) =>
                  this.batchOptionChangeAll({
                    purchaseCurrencyName: record.currencyName,
                    purchaseCurrencyCode: record.currencyCode,
                  })
                }
              />
            )}
          </FormItem>
        );
      case 'taxId':
        return (
          <FormItem label=":" className={styles['operation-wrapper-labelWidth']}>
            {getFieldDecorator(`taxId`)(
              <Lov
                code="SPCM.TAX"
                lovOptions={{ displayField: 'taxCode' }}
                queryParams={{ tenantId }}
                onChange={(_, record) =>
                  this.batchOptionChangeAll({
                    taxId: record.taxId,
                    taxCode: record.taxCode,
                    taxRate: record.taxRate,
                  })
                }
              />
            )}
          </FormItem>
        );
      case 'priceStartDate':
        return (
          <FormItem label=":" className={styles['operation-wrapper-labelWidth']}>
            {getFieldDecorator(`priceStartDate`)(
              <DatePicker
                placeholder={null}
                format={DEFAULT_DATE_FORMAT}
                onChange={(_, record) =>
                  this.batchOptionChangeAll({
                    priceStartDate: record,
                  })
                }
              />
            )}
          </FormItem>
        );
      case 'priceEndDate':
        return (
          <FormItem label=":" className={styles['operation-wrapper-labelWidth']}>
            {getFieldDecorator(`priceEndDate`)(
              <DatePicker
                placeholder={null}
                format={DEFAULT_DATE_FORMAT}
                onChange={(_, record) =>
                  this.batchOptionChangeAll({
                    priceEndDate: record,
                  })
                }
              />
            )}
          </FormItem>
        );
      case 'deliverDate':
        return (
          <FormItem label=":" className={styles['operation-wrapper-labelWidth']}>
            {getFieldDecorator(`deliverDate`)(
              <DatePicker
                placeholder={null}
                format={getDateFormat()}
                onChange={(_, record) =>
                  this.batchOptionChangeAll({
                    deliverDate: record,
                  })
                }
              />
            )}
          </FormItem>
        );
      default:
        return com;
    }
  }

  // 批量维护的字段的所属组件
  @Bind()
  batchOptionChangeAll(batchOptionValues) {
    this.setState({
      batchOptionValues,
    });
  }

  /**
   * 协议标的批量导入
   */
  @Bind()
  handleImport() {
    const { pcHeaderId } = this.props;
    openTab({
      key: '/spcm/contract-subject/data-import/SPCM.PC_SUBJECT_IMPORT',
      path: '/spcm/contract-subject/data-import/SPCM.PC_SUBJECT_IMPORT',
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: querystring.stringify({
        sync: true,
        action: 'hzero.common.title.batchImport',
        backPath: `/spcm/contract-maintain/detail?pcHeaderId=${pcHeaderId}`,
        args: JSON.stringify({ pcHeaderId, workbenchFlag: '0' }),
      }),
    });
  }

  /**
   * 协议标的批量导入
   */
  @Bind()
  async handleNewImport() {
    const { openModal } = useModal();
    const { headerRef, headerInfo, onSearchSubject, pcHeaderId } = this.props;
    const headerData = headerRef?.props.form?.getFieldsValue() || {};
    const headerParams = {
      ...headerInfo,
      ...headerData,
      supplierCompanyId: headerInfo.supplierCompanyId,
    };
    this.setState({ importLoading: true });
    const res = getResponse(await getImportTemplateCode(headerParams));
    this.setState({ importLoading: false });
    if (res) {
      openModal({
        refreshButton: true,
        prefixPatch: '/spcm',
        businessObjectTemplateCode: res || 'SPCM.PC_SUBJECT_IMPORT',
        args: {
          pcHeaderId,
          workbenchFlag: '0',
        },
        buttonProps: {
          type: 'c7n-pro',
          icon: 'archive',
        },
        successCallBack: () => {
          onSearchSubject({});
        },
      });
    }
  }

  /**
   * 处理项目编码变化
   */
  @Bind()
  handleProjectChange(pcSubjectId, lov) {
    const { onChangeListData, dataSource } = this.props;
    const listDataSource = (dataSource || []).map((_subject) => {
      const subject = _subject;
      if (subject.pcSubjectId === pcSubjectId) {
        subject.projectName = lov.projectName;
      }
      return subject;
    });

    onChangeListData({ pcSubjectDataSource: listDataSource });
  }

  @Bind()
  addSubject() {
    this.setState({
      visible: true,
    });
  }

  /**
   * closeSubjectInfoModal - 关闭弹窗
   */
  @Bind()
  closeSubjectInfoModal() {
    this.setState({
      visible: false,
    });
  }

  // 模态框显隐控制
  @Bind()
  handleControlModal(visibleKey) {
    // const { poVisible } = this.state;
    // this.setState({ poVisible: !poVisible });
    const { [visibleKey]: visible } = this.state;
    this.setState({ [visibleKey]: !visible });
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
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT';
    } else {
      // 解耦协议签署和我收到的协议个性化单元，以unitCodeList作为参数进行判断
      if (unitCodeList) {
        return unitCodeList.SUBJECT;
      }
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY';
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

  /**
   * 查询标的行
   */

  @Bind()
  handleSearchSubject() {
    const {
      onSearchSubject = () => {},
      form: { getFieldsValue },
    } = this.props;
    const { searchItemName: itemName, searchItemCode: itemCode } = getFieldsValue();
    onSearchSubject({
      itemName,
      itemCode,
    });
  }

  /**
   * 显示执行单据模态框
   * @param phId 需要展示执行单据的标的行id
   */
  @Bind()
  handleControlDocumentModal(phId) {
    c7nModal.open({
      closable: true,
      movable: false,
      key: c7nModal.key(),
      title: intl.get('spcm.common.view.message.title.executiveDocument').d('执行单据'),
      style: {
        width: 800,
      },
      children: <ExecutiveOrderRecord pcSubjectId={phId} />,
      footer: null,
    });
  }

  render() {
    const {
      form: { getFieldDecorator, registerField, setFieldsValue },
      newEnumMap = {},
      remote,
      loading,
      // deleting,
      editable,
      // onAdd,
      // onSave,
      // onDelete,
      quoteSourceFlag, // 判断是否为寻源单据
      onPrePaginationChange,
      maintainEditable = false,
      selectedRows = [],
      pagination = {},
      dataSource = [],
      check,
      checkArtificial,
      headerInfo: { pcSourceCode, supplierCompanyId },
      fetchSubjectCreateList,
      customizeTable,
      customizeBtnGroup = () => {},
      onAddPurchaseOrder,
      onSearchSubject,
      // saveSubjectLoading,
      showOperationLadderQuote,
      showSearchSubject,
      sourceCreateLoading,
      pcHeaderId,
      prLineImport,
    } = this.props;
    const { batchMaintenance = [] } = newEnumMap;
    const {
      visible,
      poVisible,
      quoteVisible,
      quotePcSubject,
      tenantId,
      selectOptionKey,
      doubleUnitEnabled,
      collapsed,
      importLoading,
    } = this.state;
    const rowKey = 'pcSubjectId';
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
      onDataChange: this.handleDataChange,
    };
    const subjectInfoProps = {
      visible,
      remote,
      quoteSourceFlag,
      lineList: dataSource,
      supplierCompanyId,
      width: 900,
      onRef: (node) => {
        this.subjectInfo = node;
      },
      // loading: queryCreateListLoading,
      doubleUnitEnabled,
      fetchCreateList: fetchSubjectCreateList,
    };
    const createProps = {
      doubleUnitEnabled,
      supplierCompanyId,
      resultId: isEmpty(dataSource) ? '' : dataSource[0].resultId,
      sourceLineNum: isEmpty(dataSource) ? '' : dataSource[0].sourceLineNum,
      sourceCode: isEmpty(dataSource) ? '' : dataSource[0].sourceCode,
      visible: poVisible,
      onCancel: () => this.handleControlModal('poVisible'),
      onAddPurchaseOrder,
      dataSource,
    };
    const ladderQuoteProps = {
      doubleUnitEnabled,
      editable,
      maintainEditable,
      quotePcSubject,
      visible: quoteVisible,
      hideModal: () => this.handleControlModal('quoteVisible'),
    };
    const maintenanceCom = this.getMaintenanceCom(selectOptionKey);
    return (
      <Fragment>
        <div className={styles['operation-wrapper']}>
          <div>
            {showSearchSubject && (
              <a
                className={styles.collapsed}
                onClick={() => this.setState({ collapsed: !collapsed })}
              >
                {collapsed
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('spcm.common.view.button.viewMore').d('展开查询')}
                <Icon type={collapsed ? 'expand_less' : 'expand_more'} />
              </a>
            )}
          </div>
          <Form layout="inline">
            {/* 协议标的行的按钮 */}
            {customizeBtnGroup(
              {
                code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.BTN_GROUP',
              },
              [
                (editable || maintainEditable) && (
                  <PermissionButton
                    type="c7n-pro"
                    icon="archive"
                    data-name="newSubjectImport"
                    onClick={this.handleNewImport}
                    disabled={pcSourceCode !== 'MANUALLY'}
                    loading={importLoading}
                    style={{
                      marginLeft: 8,
                    }}
                    tooltip="none"
                    permissionList={[
                      {
                        code: 'srm.pc-admin.pc-purchaser.maintain.ps.batch.import.subject.new',
                        type: 'button',
                        meaning: '新版导入标的',
                      },
                    ]}
                  >
                    <Tooltip
                      title={intl
                        .get('spcm.contractSubject.button.newSubjectImport')
                        .d('新版导入标的')}
                    >
                      {intl.get('spcm.contractSubject.button.newSubjectImport').d('新版导入标的')}
                    </Tooltip>
                    <span className="srm-common-import-button-tag">NEW</span>
                  </PermissionButton>
                ),
                (editable || maintainEditable) && (
                  <Button
                    data-name="subjectImport"
                    onClick={this.handleImport}
                    disabled={pcSourceCode !== 'MANUALLY'}
                    style={{ marginLeft: '8px' }}
                  >
                    <Icon type="archive" style={{ fontSize: '14px', fontWeight: '400' }} />
                    {intl.get('spcm.contractSubject.button.subjectImport').d('导入标的')}
                  </Button>
                ),
                (editable || maintainEditable) && pcSourceCode === 'PURCHASE_NEED' && (
                  <CommonImport
                    data-name="prLineImport"
                    businessObjectTemplateCode="SPCM.PR_LINE_IMPORT"
                    buttonText={intl.get('spcm.common.button.prLineImport').d('申请转协议导入')}
                    args={{
                      pcHeaderId,
                      customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PURCHASE.DEMAND',
                    }}
                    prefixPatch="/spcm"
                    buttonProps={{
                      // 当前业务规则-协议选用推荐供应商未开启时，可点击
                      disabled: prLineImport,
                      style: {
                        marginLeft: 8,
                      },
                    }}
                    successCallBack={() => {
                      onSearchSubject({});
                    }}
                  />
                ),
                ...this.getButtons(),
              ]
            )}
            {(editable || maintainEditable) && (
              <React.Fragment>
                <Form.Item>
                  <Button
                    data-code="search"
                    htmlType="submit"
                    type="primary"
                    onClick={this.handleMaintain}
                    disabled={isEmpty(dataSource)}
                  >
                    {intl.get(`spcm.common.model.common.batchMaintain`).d('批量维护')}
                  </Button>
                </Form.Item>
                {maintenanceCom}
                {Array.isArray(batchMaintenance) && batchMaintenance.length > 0 && (
                  <Form.Item>
                    <Select
                      defaultValue="taxId"
                      onChange={(val) => {
                        this.setState({ selectOptionKey: val });
                        const currySelectData = batchMaintenance.find((item) => {
                          return item.value === val;
                        });
                        if (currySelectData?.tag === 'SELECT' && !this.state[`${val}OptionsData`]) {
                          this.fetchOptionsData(
                            currySelectData?.description,
                            currySelectData?.value
                          );
                        }
                      }}
                    >
                      {batchMaintenance.map((n) => (
                        <Select.Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
                {!Array.isArray(batchMaintenance) ||
                  (Array.isArray(batchMaintenance) && batchMaintenance.length === 0 && (
                    <Form.Item>
                      <Select
                        defaultValue="taxId"
                        onChange={(val) => {
                          this.setState({ selectOptionKey: val });
                        }}
                      >
                        {[
                          {
                            meaning: intl.get(`spcm.common.model.common.taxId`).d('税种'),
                            value: 'taxId',
                          },
                          {
                            meaning: intl.get(`spcm.common.currencyCode`).d('原币币种'),
                            value: 'currencyCode',
                          },
                          {
                            meaning: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
                            value: 'purchaseCurrencyCode',
                          },
                          {
                            meaning: intl
                              .get(`spcm.common.model.common.priceStartDate`)
                              .d('价格有效期从'),
                            value: 'priceStartDate',
                          },
                          {
                            meaning: intl
                              .get(`spcm.common.model.common.priceEndDate`)
                              .d('价格有效期至'),
                            value: 'priceEndDate',
                          },
                          {
                            meaning: intl.get(`spcm.common.model.common.needByDate`).d('交付日期'),
                            value: 'deliverDate',
                          },
                        ].map((n) => (
                          <Select.Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ))}
              </React.Fragment>
            )}
          </Form>
        </div>
        {showSearchSubject && collapsed && (
          <div className="table-list-search" style={{ marginBottom: 8 }}>
            <Form layout="inline">
              <Form.Item
                label={intl.get(`spcm.common.model.common.itemName`).d('物料名称')}
                {...formLayout}
              >
                {getFieldDecorator('searchItemId')(
                  <Lov
                    code="SPCM.ITEM_RELATE_PUR_PRICE"
                    textField="itemName"
                    queryParams={{ tenantId }}
                    onChange={(_, lovRecord) => {
                      const { itemCode } = lovRecord;
                      registerField('searchItemCode');
                      setFieldsValue({ searchItemCode: itemCode });
                    }}
                  />
                )}
              </Form.Item>
              <FormItem>
                <Button onClick={() => this.props.form.resetFields()}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={this.handleSearchSubject}
                  type="primary"
                  htmlType="submit"
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Form>
          </div>
        )}
        {customizeTable(
          {
            code: this.handleGetCode(),
            clearCache: (a, b, cb) => {
              if (a !== b) cb(a);
            },
            useNewCalid: true,
          },
          <EditTable {...editTableProps} key={this.props.pcSubjectTableKey} />
        )}
        <Modal
          title={intl.get(`spcm.contractSubject.view.message.addSubjectLines`).d('新增标的行')}
          destroyOnClose
          width={1100}
          visible={visible}
          onCancel={this.closeSubjectInfoModal}
          footer={
            <Button type="primary" loading={sourceCreateLoading} onClick={this.onInfoModalOk}>
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          }
        >
          <SubjectInfo {...subjectInfoProps} />
        </Modal>
        {poVisible && <CreateModal {...createProps} />}
        {showOperationLadderQuote && quoteVisible && <OperationLadderQuote {...ladderQuoteProps} />}
      </Fragment>
    );
  }
}

const hocFuc = (com) =>
  compose(
    Form.create({ fieldNameProp: null }),
    formatterCollections({
      code: [
        'sodr.quotePurchase',
        'spcm.contractSubject',
        'spcm.contractMaintain',
        'spcm.common',
        'spcm.purchaseRequisitionCreation',
        'entity.company',
        'entity.supplier',
        'entity.attachment',
        'hzero.common',
        'component.docFlow',
        'spcm.purchaseContractView',
        'spcm.contractSubject',
        'sodr.common',
        'ssrc.inquiryHall',
      ],
    }),
    withRouter
  )(com);

export { hocFuc, ContractSubject };
export default hocFuc(ContractSubject);
