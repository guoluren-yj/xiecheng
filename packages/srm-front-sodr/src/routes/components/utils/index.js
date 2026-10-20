import React, { cloneElement, Fragment, memo, useEffect, useState } from 'react';
import { transaction, runInAction, observable } from 'mobx';
import {
  DataSet,
  Modal,
  NumberField,
  Form,
  TextArea,
  Table,
  TextField,
  Currency,
  Spin,
  Output,
  Tooltip,
  Lov,
  DatePicker,
} from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import {
  isNumber,
  isEmpty,
  isNil,
  isNaN,
  noop,
  isArray,
  isString,
  cloneDeep,
  uniqWith,
  compose,
  isFunction,
  omitBy,
} from 'lodash';
import { observer } from 'mobx-react-lite';
import { routerRedux } from 'dva/router';
import { stringify } from 'querystring';
import { Button } from 'components/Permission';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
import intl from 'utils/intl';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import {
  getCurrentLanguage,
  getCurrentOrganizationId,
  getCurrentTenant,
  getResponse,
  getCurrentUserId,
  getUserOrganizationId,
} from 'utils/utils';
import notification from 'utils/notification';
import EmbedPage from '_components/EmbedPage';
import { SRM_SPUC } from '_utils/config';
import { loadTrackingMethod } from 'hzero-front/lib/customize/customizeTracking';

import BudgetVerificationTable from '@/routes/components/BudgetVerificationTable';
import { GiftInfo, giftInfoDsConfig } from '@/routes/components/GiftInfo';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/intelligentReview.svg';
import { StatusTag } from '../StatusTag';
import {
  fetchConfigSheetRfxPrepare,
  getSourceUrlConfig,
  fetchAutoGetCompany,
  fetchAutoGetAgent,
} from '@/services/quotePurchaseRequisitionService';
import {
  queryNewTableEnable,
  budgetVerification,
  checkInvOrganization,
  checkCategoryId,
  queryDoubleUomConfig,
  queryAmountCalcConfig,
  queryOrderControlConfig,
  queryDoubleUnitConversion,
  paymentPlanWholeCancel,
  paymentPlanLineCancel,
  paymentPlanChange,
  batchSubmitWarn,
  updateGift,
  paymentPlanConfig,
  fetchDisplayDocAndDocFlow,
  fetchOperationFlag,
  revokeWorkFlowByKey,
  poLineSplit,
  poChangeLineSplit,
  associatedPcCheck,
  associatedPcAmountCheck,
  paymentCheckSubmit,
  batchAddOrderLine,
  orderAmountCalculation,
  fetchFundPlanConfig,
  termHeadersValidate,
  // termHeadersValidateData,
  fundPlanSave,
  fundPlanCancelSimulate,
  fetchEnableFundConfig,
  fundPlanChangelSimulate,
} from '../../../services/orderWorkspaceService';
import { MAX_QUAN_NUMBER } from './constant';
import styles from '../index.less';

const { tenantNum } = getCurrentTenant();
const tenantId = getCurrentOrganizationId();
const userId = getCurrentUserId();

/**
 *来源系统 srm, erp, 目录化， 电商
 * @returns {{srm: string, erp: string, catalogMall: string, elMall: string}}
 */
export function sourceSystem() {
  const systemSource = { srm: 'SRM', erp: 'ERP', catalogMall: 'CATALOGUE', elMall: 'E-COMMERCE' };
  return systemSource;
}

/**
 *处理精度 currency默认为10, quantity默认为6
 * @returns {{srm: string, erp: string, catalogMall: string, elMall: string}}
 */
export function getPrecision(precision) {
  const _default = 10;
  const _precision = !isNil(precision) ? Number(precision) : _default;
  return _precision;
}

/**
 *订单来源 申请转订单, 手工创建订单, 寻源转订单，协议转订单
 * @returns {{prRequest: string, prOrder: string, source: string, pcOrder: string}}
 */
export function sourceBill() {
  const billSource = {
    prRequest: 'PURCHASE_REQUEST',
    prOrder: 'PURCHASE_ORDER',
    source: 'source',
    pcOrder: 'CONTRACT_ORDER',
  };
  return billSource;
}

/**
 *订单来源页面 手工创建订单 申请转订单 订单维护
 * @returns {{prRequest: string, prOrder: string, source: string, pcOrder: string}}
 */
export function sourcePage() {
  const pageSource = {
    pageRequest: 'pageRequest', // 采购申请
    pageOrder: 'pageOrder', // 手工创建
    pageSource: 'pageSource', // 订单维护
    pageMaintain: 'pageMaintain', // 订单维护
    pageConract: 'pageConract', // 采购协议
  };
  return pageSource;
}

function fileReader(blob) {
  // eslint-disable-next-line
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onerror = () => {
      fileReader.abort();
      reject();
    };

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.readAsText(blob);
  });
}

export async function getJsonBlob(blob) {
  const blobText = await fileReader(blob);
  return JSON.parse(blobText);
}

/**
 * 拼接单位展示
 * @param {String} uomCode 单位编码
 * @param {String} uomName 单位名称
 * @returns uomCodeAndName
 */
export function formatUom(uomCode, uomName) {
  if (uomCode || uomName) {
    return `${uomCode || ''}/${uomName || ''}`;
  }
}

/**
 * 金额格式化
 * @param {Number} aumont 金额
 * @param {Number} precision 精度
 * @param {Boolean} isSupplement 是否补0
 * @param {Boolean} useGrouping 是否展示分隔符
 * @returns
 */
export function formatAumont(aumont, precision, isSupplement, useGrouping = true) {
  let newPrecision = Number(precision);
  if (isNil(newPrecision) || isNaN(newPrecision) || newPrecision > 20) newPrecision = 20;
  const language = getCurrentLanguage().split('_').join('-');
  const options = Object.assign(
    { useGrouping },
    { maximumFractionDigits: newPrecision },
    isSupplement ? { minimumFractionDigits: newPrecision } : {}
  );
  if (isNumber(aumont)) {
    return aumont.toLocaleString(language, options);
  }
  if (math.isBigNumber(aumont)) {
    return NumberField.format(aumont, language, options);
  }
  return aumont;
}

/**
 * InputNumber精度控制
 * @param {String} aumontStr 金额字符串
 * @param {*} precision 精度
 * @returns
 */
export function parseAumont(aumontStr, precision) {
  const arr = `${aumontStr}`.split('.');
  const newPrecision = isNil(precision) ? 10 : precision;
  if (
    arr.length === 2 &&
    !isNaN(newPrecision) &&
    // newPrecision !== null &&
    arr[1].length > Number(newPrecision)
  ) {
    return `${arr[0]}.${arr[1].substr(0, Number(newPrecision))}`;
  }
  return aumontStr;
}

/**
 * c7n Collapse expandIcon节点渲染
 * @returns expandIcon
 */
export function expandIcon() {
  return <div className={styles.expandIcon} />;
}

/**
 *  dataSets数据count
 * @param {*} ds dataSet
 * @returns dataSets数据count
 */
export function getCount(ds) {
  return isNumber(ds.totalCount) && ds.status === 'ready'
    ? ds.totalCount > 99
      ? '99+'
      : ds.totalCount
    : '';
}

export function newTableEnable(NewComp, menuFlag) {
  return (OldCom) => {
    const Default = class extends React.Component {
      state = {
        UI_VERSION: '',
      };

      componentDidMount() {
        const params = {
          tenantId: 0,
          map: {
            tenantNum,
            menuFlag,
          },
        };
        queryNewTableEnable(params).then((res) => {
          if (res?.length) {
            this.setState({ UI_VERSION: 'C7N' });
          } else {
            this.setState({ UI_VERSION: 'H0' });
          }
        });
      }

      render() {
        const { UI_VERSION } = this.state;
        if (UI_VERSION === 'C7N') {
          return <NewComp {...this.props} />;
        } else if (UI_VERSION === 'H0') {
          return <OldCom {...this.props} />;
        }
        return null;
      }
    };

    return Default;
  };
}

/**
 *C7N 订单功能菜单
 * @returns {{prRequest: string, prOrder: string, source: string, pcOrder: string}}
 */
export const MenuType = {
  ORDER_MAINTAIN: 'orderMaintain',
};
/**
 * 字段金额格式化配置, 用于 dynamicProps.formatterOptions
 * 无需isSupplement: type: currency -> 自动补0， type: number -> 不补0
 * @param {Function} getPrecisions 获取精度， props参考 dynamicProps
 * @returns
 */
export function c7nAmountFormatterOptions(getPrecisions) {
  return (props) => {
    const precision = getPrecisions(props);
    const options = {
      maximumFractionDigits: precision || 20,
    };
    if (precision) {
      options.minimumFractionDigits = precision;
    }
    return { options };
  };
}

/**
 * 高阶函数: 功能是否使用C7N新组件
 * @param {String} key 配置表《老订单使用C7N新组件租户[spuc_order_new_tenant]》中的菜单标识，该标识对应值集为SODR.C7N_MENU_TYPE
 * @param {Component} OldIndex 旧功能入口
 * @returns
 */
export function useC7NComponent(key, OldIndex) {
  return function (NewIndex) {
    return memo(function (props) {
      const [useNew, setUseNew] = useState();
      useEffect(() => {
        queryNewTableEnable({
          tenantId: 0,
          map: {
            tenantNum: getCurrentTenant().tenantNum,
            menuFlag: key,
          },
        }).then((res) => {
          if (res && res.length) {
            setUseNew(true);
          } else {
            setUseNew(false);
          }
        });
      }, []);
      if (useNew === true) {
        return <NewIndex {...props} />;
      }
      if (useNew === false) {
        return <OldIndex {...props} />;
      }
      return <Spin />;
    });
  };
}

/**
 * 跳转其他模块页面链接
 * @param {String} key 页面跳转的模块标识 ['purchase','contract','source'] 申请、协议、寻源
 * @param {Record} record 行数据
 * @param {String} from 从哪个跳转
 * @returns
 */
export async function redirectToOther(key, record) {
  // prHeaderId
  let link = '';
  let search = {};
  const otherPage = ['purchase', 'contract', 'source'];
  const { prHeaderId, poSourcePlatform, sourceFrom, holdPcHeaderId, sourceHeaderId } = record;
  switch (key) {
    case 'purchase': {
      if (!prHeaderId) return;
      const result = await fetchConfigSheetRfxPrepare({ tenant: tenantNum });
      search = { backVoidPage: 'NO' };
      // 在配置表中走老页面，否则走新采购申请工详情
      const res = result?.content || [];
      if (getResponse(result) && res && !isEmpty(res)) {
        if (poSourcePlatform === 'ERP') {
          // 旧采购申请详情
          link = `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`;
        } else {
          link = `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
        }
      } else {
        // 新采购申请详情
        link = `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
      }
      break;
    }
    case 'contract':
      search = { pcHeaderId: holdPcHeaderId, backVoidPage: 'NO' };
      link = holdPcHeaderId && `/spcm/purchase-contract-view/detail`;
      break;
    case 'source': {
      search = { backPath: 'NO' };
      if (!sourceHeaderId) {
        return;
      }
      const response = getResponse(await getSourceUrlConfig({ sourceHeaderId }));
      if (!response) {
        return;
      }
      const { offlineWholeFlag } = response;
      if (offlineWholeFlag) {
        link = `/ssrc/new-inquiry-hall/whole-detail/${sourceHeaderId}`;
      } else if (sourceFrom === 'RFX') {
        link = `/ssrc/new-inquiry-hall/rfx-detail/${sourceHeaderId}`;
      } else if (sourceFrom === 'BID') {
        link = `/ssrc/new-bid-hall/bid-detail/${sourceHeaderId}`;
      }
      break;
    }
    default:
      break;
  }
  if (otherPage.includes(key) && link) {
    if (window.parent !== window && window.parent) {
      window.parent.postMessage({
        type: 'link',
        data: JSON.stringify({
          pathname: link,
          search: stringify(search),
        }),
      });
    } else {
      const { dispatch } = window.dvaApp._store;
      dispatch(
        routerRedux.push({
          pathname: link,
          search: stringify(search),
        })
      );
    }
  }
}

export async function handleBudgetVerificationPro(
  payload = [],
  callback = (e) => e,
  loadingOption = {}
) {
  const { loading, key, remote, data } = loadingOption;
  const handleLoading = (status) => {
    if (isEmpty(loadingOption)) return;
    if (key === 'submitLoading') {
      loading([key], status);
    } else {
      loading({ [key]: status });
    }
  };
  handleLoading(true);
  const res = getResponse(await budgetVerification(payload));
  handleLoading(false);

  const onCallBack = async () => {
    if (res) {
      if (isEmpty(res)) {
        return !!getResponse(await callback());
      } else {
        const errList = res.filter((i) => i.errorFlag !== '0');
        if (isEmpty(errList)) {
          return !!getResponse(await callback());
        } else {
          Modal.open({
            title: intl.get('sodr.common.model.common.budgetCheckTip').d('预算校验提示'),
            children: (
              <BudgetVerificationTable
                data={errList}
                message={intl
                  .get('sodr.common.model.common.budgetCheckSubmit')
                  .d('以下订单行已超预警线或超量占用，请确认是否继续提交？')}
              />
            ),
            style: { width: '742px' },
            okText: intl.get('hzero.common.button.sure').d('确定'),
            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
            onOk: async () => {
              return !!getResponse(await callback());
            },
            destroyOnClose: true,
            drawer: true,
          });
        }
      }
    } else {
      return false;
    }
  };

  if (remote.event) {
    remote.event.fireEvent('afterBudgetVerification', { res, payload, onCallBack, data });
  } else {
    onCallBack();
  }
}
/**
 *  handleBudgetVerification
 * 订单提交预算校验(订单工作台)
 * @param {*} payload 参数
 * @param {Function} callback 订单提交
 */
export async function handleBudgetVerification(
  payload = [],
  callback = (e) => e,
  loadingOption = {}
) {
  const { loading, key } = loadingOption;
  const handleLoading = (status) => {
    if (isEmpty(loadingOption)) return;
    if (key === 'submitLoading') {
      loading([key], status);
    } else {
      loading({ [key]: status });
    }
  };
  handleLoading(true);
  const res = getResponse(await budgetVerification(payload));
  handleLoading(false);
  if (res) {
    if (isEmpty(res)) {
      await callback();
      return true;
    } else {
      const errList = res.filter((i) => i.errorFlag !== '0');
      if (isEmpty(errList)) {
        await callback();
        return true;
      } else {
        const modalPromise = new Promise((resolve) => {
          Modal.open({
            title: intl.get('sodr.common.model.common.budgetCheckTip').d('预算校验提示'),
            children: (
              <BudgetVerificationTable
                data={errList}
                message={intl
                  .get('sodr.common.model.common.budgetCheckSubmit')
                  .d('以下订单行已超预警线或超量占用，请确认是否继续提交？')}
              />
            ),
            style: { width: '742px' },
            okText: intl.get('hzero.common.button.sure').d('确定'),
            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
            onOk: async () => {
              await callback();
              resolve(true);
            },
            afterClose: () => resolve(false),
            destroyOnClose: true,
            drawer: true,
          });
        });
        const modalRes = await modalPromise;
        return modalRes;
      }
    }
  } else {
    return false;
  }
}

export async function handleOldBudgetVerification(dispatch, action, callback = (e) => e) {
  const response = await dispatch(action);
  if (response) {
    if (isEmpty(response)) {
      callback();
    } else {
      const errList = response.filter((i) => i.errorFlag !== '0');
      if (isEmpty(errList)) {
        callback();
      } else {
        Modal.open({
          title: intl.get('sodr.common.model.common.budgetCheckTip').d('预算校验提示'),
          children: (
            <BudgetVerificationTable
              data={errList}
              message={intl
                .get('sodr.common.model.common.budgetCheckSubmit')
                .d('以下订单行已超预警线或超量占用，请确认是否继续提交？')}
            />
          ),
          style: { width: '742px' },
          okText: intl.get('hzero.common.button.sure').d('确定'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          onOk: callback,
          destroyOnClose: true,
          drawer: true,
        });
      }
    }
  }
}

/**
 *  handleBatchSubmitWarn
 * 订单提交批量校验(订单工作台)
 * @param {*} payload 参数
 * @param {Function} callback 订单提交
 */
export async function handleBatchSubmitWarn(payload = [], loadingOption = {}, remote) {
  const { loading, key } = loadingOption;
  const handleLoading = (status) => {
    if (isEmpty(loadingOption)) return;
    if (key === 'submitLoading') {
      loading([key], status);
    } else {
      loading({ [key]: status });
    }
  };
  handleLoading(true);
  const res = getResponse(await batchSubmitWarn(payload));
  handleLoading(false);
  if (res) {
    if (res?.message) {
      const confirmModalProps = remote.process('getConfirmModalProps', {
        data: res,
        payload,
      });
      const modal = await Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div
            className={styles['submit-tip']}
            // eslint-disable-next-line
            dangerouslySetInnerHTML={{ __html: res?.message }}
          />
        ),
        className: styles['batch-submit-modal'],
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        // children: res.message,
        ...confirmModalProps,
      });
      return modal;
    } else {
      return 'ok';
    }
  }
}

export async function handleOldBatchSubmitWarn(remote, dispatch, action, callback = (e) => e) {
  const res = await dispatch(action);
  if (res) {
    const confirmModalProps = remote.process('getConfirmModalProps', {
      data: res,
      type: 'batchSubmit',
    });
    if (res?.value) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: <div className={styles['submit-tip']}>{res?.message}</div>,
        className: styles['batch-submit-modal'],
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => callback(),
        ...confirmModalProps,
      });
    } else {
      callback();
    }
  }
}

/**
 * 金额计算逻辑
 * @param {{hasTax: boolean, hasMount: boolean, options:{ taxUnitPrice: number, netUnitPrice: number, quantity:number, each: number, taxRate:number, financialPrecision:number, defaultPrecision:number, }}}
 * @param options.hasTax {boolean} 基准价类型是否为含税单价
 * @param options.hasMount {boolean} 单据是否有金额
 * @param options.taxUnitPrice {number}  含税单价 基准价类型为不含税单价可不传
 * @param options.netUnitPrice {number} 不含税单价 基准价类型为含税单价可不传
 * @param options.quantity {number} 数量
 * @param options.each {number} 每 不传默认为1
 * @param options.taxRate {number}  税率  不传默认为0
 * @param options.financialPrecision {number} 金额精度
 * @param options.defaultPrecision {number} 单位精度
 * @param options.caclRule {string} 计算规则 'Amount'| 'Price' 默认为'Amount'
 *
 * @returns {{taxAmount: number, netAmount: number, taxQuota: number, taxUnitPrice: number, netUnitPrice: number}}
 * @returns calcTaxAmount {number} 含税金额
 * @returns calcNetAmount {number} 不含税金额
 * @returns calcTaxQuota {number} 税额
 * @returns calcTaxUnitPrice {number} 含税单价
 * @returns calcNetUnitPrice {number} 不含税单价
 *
 * @example
 */
export function amountCalculationSource(options) {
  const _option = options || {};
  const {
    hasTax,
    hasMount,
    quantity,
    each = 1,
    taxRate = 0,
    caclRule = 'Amount',
    financialPrecision = 10,
    defaultPrecision = 10,
  } = _option;
  const getBigNumber = (val) =>
    val && !math.isZero(val) && !math.isNaN(val) ? new BigNumber(val) : val;
  const isValidNum = (num) =>
    (isNumber(num) || math.isBigNumber(num)) && !math.isNaN(num) && math.isFinite(num);
  const toFixedNum = (num, precision) => new BigNumber(math.toFixed(num, Number(precision)));
  const bigQuantity = getBigNumber(quantity);
  const bigEach = getBigNumber(each);
  const bigTaxRate = getBigNumber(taxRate || 0);
  const _taxRate = math.div(bigTaxRate, 100);
  if (hasTax) {
    let calcNetAmount;
    let calcNetUnitPrice;
    const { taxUnitPrice } = _option;
    const bigTaxUnitPrice = getBigNumber(taxUnitPrice);
    if (!isValidNum(bigQuantity) || !isValidNum(bigTaxUnitPrice)) return {};
    if (hasMount) {
      const calcTaxAmount = toFixedNum(
        math.div(math.multipliedBy(bigTaxUnitPrice, bigQuantity), bigEach),
        financialPrecision
      );
      const calcTaxQuota = toFixedNum(
        math.multipliedBy(math.div(calcTaxAmount, math.plus(1, _taxRate)), _taxRate),
        financialPrecision
      );
      if (caclRule === 'Amount') {
        calcNetAmount = toFixedNum(math.minus(calcTaxAmount, calcTaxQuota), financialPrecision);
        calcNetUnitPrice = math.isZero(calcNetAmount)
          ? 0
          : toFixedNum(
              math.multipliedBy(math.div(calcNetAmount, bigQuantity), bigEach),
              defaultPrecision
            );
      } else {
        calcNetUnitPrice = toFixedNum(
          math.div(bigTaxUnitPrice, math.plus(1, _taxRate)),
          defaultPrecision
        );
        calcNetAmount = toFixedNum(
          math.div(math.multipliedBy(calcNetUnitPrice, bigQuantity), bigEach),
          financialPrecision
        );
      }
      return {
        calcTaxAmount,
        calcTaxQuota,
        calcNetAmount,
        calcNetUnitPrice: math.isZero(taxRate) ? taxUnitPrice : calcNetUnitPrice,
      };
    } else {
      if (math.isZero(taxRate)) {
        return { calcNetUnitPrice: taxUnitPrice };
      }
      calcNetUnitPrice = toFixedNum(
        math.div(bigTaxUnitPrice, math.plus(1, _taxRate)),
        defaultPrecision
      );
      return { calcNetUnitPrice: math.isZero(taxRate) ? taxUnitPrice : calcNetUnitPrice };
    }
  } else {
    let calcTaxAmount;
    let calcTaxUnitPrice;
    const { netUnitPrice } = _option;
    const bigNetUnitPrice = getBigNumber(netUnitPrice);
    if (!isValidNum(bigQuantity) || !isValidNum(bigNetUnitPrice)) return {};
    if (hasMount) {
      const calcNetAmount = toFixedNum(
        math.div(math.multipliedBy(bigNetUnitPrice, bigQuantity), bigEach),
        financialPrecision
      );
      const calcTaxQuota = toFixedNum(
        math.multipliedBy(calcNetAmount, _taxRate),
        financialPrecision
      );
      if (caclRule === 'Amount') {
        calcTaxAmount = toFixedNum(math.plus(calcNetAmount, calcTaxQuota), financialPrecision);
        calcTaxUnitPrice = math.isZero(calcTaxAmount)
          ? 0
          : toFixedNum(
              math.multipliedBy(math.div(calcTaxAmount, bigQuantity), bigEach),
              defaultPrecision
            );
      } else {
        calcTaxUnitPrice = toFixedNum(
          math.multipliedBy(bigNetUnitPrice, math.plus(1, _taxRate)),
          defaultPrecision
        );
        calcTaxAmount = toFixedNum(
          math.div(math.multipliedBy(bigNetUnitPrice, bigQuantity), bigEach),
          financialPrecision
        );
      }
      return {
        calcNetAmount,
        calcTaxQuota,
        calcTaxAmount,
        calcTaxUnitPrice: math.isZero(taxRate) ? netUnitPrice : calcTaxUnitPrice,
      };
    } else {
      calcTaxUnitPrice = toFixedNum(
        math.multipliedBy(bigNetUnitPrice, math.plus(1, _taxRate)),
        defaultPrecision
      );
      return { calcTaxUnitPrice: math.isZero(taxRate) ? netUnitPrice : calcTaxUnitPrice };
    }
  }
}

/**
 * 订单工作台[维护页面-手工创建、采购申请]、C7N订单维护、C7N采购申请页面 税率计算
 * @param {String} benchmarkPriceType 基准价类型
 * @param {Record} record 行数据
 * @param {Object} lovData  选中税率的Lov数据
 * @param {dataSet} ds 当前行ds
 * @returns {Object} 计算后的的单价数据
 */
export function amountCalculationPro(benchmarkPriceType, record, lovData, ds) {
  const {
    quantity,
    taxRateType,
    financialPrecision,
    defaultPrecision,
    unitPriceBatch: each,
    lineAmount: netAmount,
    taxIncludedLineAmount: taxAmount,
    unitPrice: netUnitPrice,
    enteredTaxIncludedPrice: taxUnitPrice,
  } = record.get([
    'quantity',
    'financialPrecision',
    'defaultPrecision',
    'unitPriceBatch',
    'lineAmount',
    'taxIncludedLineAmount',
    'unitPrice',
    'enteredTaxIncludedPrice',
    'taxRateType',
  ]);
  const { taxRate } = lovData || {};
  const caclRule = ds?.getState('amountCalcRule');
  const calculate = amountCalculation({
    hasTax: benchmarkPriceType !== 'NET_PRICE',
    // console.log('caclRule', caclRule);
    hasMount: true,
    each,
    taxRate,
    taxUnitPrice,
    netUnitPrice,
    taxAmount,
    netAmount,
    quantity,
    caclRule,
    financialPrecision,
    defaultPrecision,
    taxRateType,
  });
  const { calcTaxUnitPrice, calcNetUnitPrice } = calculate;

  const price =
    benchmarkPriceType === 'NET_PRICE'
      ? {
          enteredTaxIncludedPrice:
            (isNumber(calcTaxUnitPrice) || math.isBigNumber(calcTaxUnitPrice)) &&
            !math.isNaN(calcTaxUnitPrice)
              ? record.get('defaultPrecision')
                ? new BigNumber(
                    math.toFixed(
                      new BigNumber(calcTaxUnitPrice),
                      Number(record.get('defaultPrecision'))
                    )
                  )
                : calcTaxUnitPrice
              : undefined,
        }
      : {
          unitPrice:
            (isNumber(calcNetUnitPrice) || math.isBigNumber(calcNetUnitPrice)) &&
            !math.isNaN(calcNetUnitPrice)
              ? record.get('defaultPrecision')
                ? new BigNumber(
                    math.toFixed(
                      new BigNumber(calcNetUnitPrice),
                      Number(record.get('defaultPrecision'))
                    )
                  )
                : calcNetUnitPrice
              : undefined,
        };
  return price;
}
/**
 * 批量编辑字段校验规则
 * @param {Object} fields 批量编辑字段
 * @returns {Boolean} 是否继续批量编辑
 */
export async function validateBatchEditing(fields = {}) {
  const errList = [];
  const fieldKeys = Object.keys(fields);
  const fieldsName = {
    invOrganizationId: intl.get('sodr.workspace.model.common.invOrganizationId').d('库存组织'),
    ouId: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    itemId: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
    costId: intl.get('sodr.workspace.model.common.costId').d('成本中心'),
    invInventoryId: intl.get('sodr.workspace.model.common.invInventoryId').d('收货库房'),
    categoryId: intl.get('sodr.workspace.model.common.categoryId').d('物料分类'),
    itemNameRuleMsg: intl
      .get('sodr.workspace.model.common.itemName.batchInfo')
      .d('存在含【物料编码】的订单行，【物料描述】保存时将针对【物料编码】有值的行不执行批量编辑'),
  };
  // 字段从属关系单一逻辑校验
  const dependencyRules = [
    {
      included: ['invOrganizationId'],
      notInclud: ['costId'],
      keyList: [['invOrganizationId', 'ouId', 'itemId']],
    },
    {
      included: ['costId'],
      notInclud: ['invOrganizationId'],
      keyList: [['costId', 'ouId']],
    },
    {
      included: ['invOrganizationId', 'costId'],
      notInclud: [],
      keyList: [
        ['invOrganizationId', 'ouId', 'itemId'],
        ['costId', 'ouId'],
      ],
    },
    {
      included: ['invOrganizationId'],
      notInclud: ['costId', 'invInventoryId'],
      keyList: [['invOrganizationId', 'ouId', 'itemId']],
    },
    {
      included: ['costId'],
      notInclud: ['invOrganizationId', 'invInventoryId'],
      keyList: [['costId', 'ouId']],
    },
    {
      included: ['invInventoryId'],
      notInclud: ['invOrganizationId', 'costId'],
      keyList: [['invInventoryId', 'invOrganizationId']],
    },
    {
      included: ['invOrganizationId', 'costId'],
      notInclud: ['invInventoryId'],
      keyList: [
        ['invOrganizationId', 'ouId', 'itemId'],
        ['costId', 'ouId'],
      ],
    },
    {
      included: ['invOrganizationId', 'invInventoryId'],
      notInclud: ['costId'],
      keyList: [
        ['invOrganizationId', 'ouId', 'itemId'],
        ['invInventoryId', 'invOrganizationId'],
      ],
    },
    {
      included: ['costId', 'invInventoryId'],
      notInclud: ['invOrganizationId'],
      keyList: [
        ['costId', 'ouId'],
        ['invInventoryId', 'invOrganizationId'],
      ],
    },
    {
      included: ['invOrganizationId', 'costId', 'invInventoryId'],
      notInclud: [],
      keyList: [
        ['invOrganizationId', 'ouId', 'itemId'],
        ['costId', 'ouId'],
        ['invInventoryId', 'invOrganizationId'],
      ],
    },
  ];
  // 字段从属关系或逻辑校验
  const dependencyReduceRules = [
    {
      included: ['categoryId'],
      notInclud: [],
      keyList: [['categoryId', 'itemId']],
    },
  ];
  // 字段业务逻辑校验
  const businessRules = [
    {
      code: 'itemName',
      msg: fieldsName.itemNameRuleMsg,
      rule: () => true,
    },
  ];

  dependencyReduceRules.forEach((i) => {
    const included = i.included.every((n) => fieldKeys.includes(n));
    const notInclud = i.notInclud.find((n) => fieldKeys.includes(n));
    if (included && !notInclud) {
      i.keyList.forEach((item) => {
        const msg = intl
          .get('sodr.common.model.common.validatefieldsRulePro', {
            list: String(item.map((n) => `【${fieldsName[n]}】`)),
          })
          .d('{list}存在从属关系校验,保存时如上校验不通过的行将不执行批量编辑');
        errList.push(msg);
      });
    }
  });

  businessRules.forEach((i) => {
    if (fieldKeys.includes(i.code) && i.rule()) {
      errList.push(i.msg);
    }
  });

  const currentRule = dependencyRules
    .sort((a, b) => b.included.length - a.included.length)
    .find((i) => {
      const included = i.included.every((n) => fieldKeys.includes(n));
      const notInclud = i.notInclud.find((n) => fieldKeys.includes(n));
      return included && !notInclud;
    });
  if (currentRule) {
    currentRule.keyList.forEach((i) => {
      const msg = intl
        .get('sodr.common.model.common.validatefieldsRulePro', {
          list: String(i.map((n) => `【${fieldsName[n]}】`)),
        })
        .d('{list}存在从属关系校验,保存时如上校验不通过的行将不执行批量编辑');
      errList.push(msg);
    });
  }

  const errorMsg = errList.map((i, idx) => {
    return errList.length > 1 ? (
      <p>
        {idx + 1}.{i}
      </p>
    ) : (
      <p>{i}</p>
    );
  });

  const commonMsg = intl.get('sodr.common.model.common.validateConfirm').d('是否确认批量编辑?');
  if (!isEmpty(errList)) {
    const result = await Modal.confirm({
      title: intl.get('sodr.common.model.common.errorMessage').d('提示'),
      children: (
        <>
          {errorMsg}
          {commonMsg}
        </>
      ),
    });
    return result === 'ok';
  }
  return true;
}

/**
 * 批量编辑
 * @param {dataSet} batchMaintenanceDs 批量编辑ds
 * @param {dataSet} ds 表格ds
 * @param {Object} options
 * @returns {Promise}
 */
export async function handleBatchOk(batchMaintenanceDs, ds, options = {}) {
  const { hasPriceLibrary = false, getValues = noop, remote, remoteCode } = options;
  const batchRecord = batchMaintenanceDs.current;
  const fields = batchMaintenanceDs.fields.toJSON();
  const initFields = batchMaintenanceDs.props.fields;
  const { __id, _status, __dirty, ...values } = batchRecord.toJSONData();
  const { invOrganizationId, categoryId } = values;
  const { selected, all } = ds;
  const isAll = isEmpty(selected);
  const records = isAll ? all : selected;
  const data = records.map((i) => i.toData());
  const custStandardFields = [];
  const fieldMapValues = [];
  for (const i in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, i) && fields[i]) {
      const value =
        typeof fields[i].getValue(batchRecord) === 'number'
          ? String(fields[i].getValue(batchRecord))
          : fields[i].getValue(batchRecord);
      const lable = fields[i].get('label');
      const bind = fields[i].get('bind');
      // 是否是扩展的标准字段
      const isCustStandardField = !(
        initFields.find((n) => n.name === fields[i].name) || fields[i].name.includes('attribute')
      );
      if (isCustStandardField && lable && value) {
        custStandardFields.push(lable);
      } else if (value && !bind) {
        fieldMapValues.push([i, value]);
      }
    }
  }
  if (!isEmpty(custStandardFields)) {
    notification.error({
      message: intl
        .get(`sodr.workspace.view.message.hasCustStandardFields`, {
          fields: String(custStandardFields.map((i) => `【${i}】`)),
        })
        .d('{fields}为扩展的标准字段，不允许批量编辑！'),
    });
    return false;
  }
  const validateRes =
    (await validateBatchEditing(values, ds)) && (await batchMaintenanceDs.validate());
  if (!validateRes) return false;
  if (invOrganizationId) {
    let checkRes;
    const { poHeaderDetailDTO } = getValues();
    const res = await checkInvOrganization({
      list: { poHeaderDetailDTO, poLineDetailDTOs: data },
      invOrganizationId,
    });
    try {
      checkRes = getResponse(JSON.parse(res));
    } catch {
      checkRes = res;
    }
    if (checkRes !== 'SUCCESS') return false;
  }
  if (categoryId) {
    let checkRes;
    const res = await checkCategoryId({
      list: data,
      categoryId,
    });
    try {
      checkRes = getResponse(JSON.parse(res));
    } catch {
      checkRes = res;
    }
    if (checkRes !== 'SUCCESS') return false;
  }
  // 处理同时编辑行上存在关联关系的字段 控制维护顺序
  const adjustEditingOrderList = [['invOrganizationId', 'receiveToleranceQuantityType']];
  adjustEditingOrderList.forEach((i) => {
    // 只处理1对1 有其他场景再优化
    const [fristField, lastField] = i;
    const fristIndex = fieldMapValues.findIndex((index) => index[0] === fristField);
    const lastIndex = fieldMapValues.findIndex((index) => index[0] === lastField);
    if (fristIndex > -1 && lastIndex > -1 && fristIndex > lastIndex) {
      [fieldMapValues[fristIndex], fieldMapValues[lastIndex]] = [
        fieldMapValues[lastIndex],
        fieldMapValues[fristIndex],
      ];
    }
  });
  if (isAll) {
    const oldFieldMap = ds.getState('fieldMap') || {};
    const oldFieldMapValues = ds.getState('fieldMapValues') || [];
    ds.setState({
      fieldMap: { ...oldFieldMap, ...values },
      fieldMapValues: uniqWith([...fieldMapValues, ...oldFieldMapValues], (a, b) => a[0] === b[0]),
    });
  }

  const batchRecordKeys = ds.getState('batchRecordKeys') || new Set();
  runInAction(() => {
    records.forEach((i) => {
      fieldMapValues.forEach(([key, value]) => {
        const field = i.getField(key);
        let _value = value;
        if (value && value.toJS) {
          _value = value.toJS();
        }
        const itemNameEdit = ['itemName'].includes(key) ? !i.get('itemId')?.itemId : true;
        const preFlag =
          !field.disabled &&
          !field.get('bind') &&
          itemNameEdit &&
          (['enteredTaxIncludedPrice', 'unitPrice', 'taxId'].includes(key) && hasPriceLibrary
            ? !i.get('priceLibraryId')
            : true);
        const flag = remote
          ? remote.process(remoteCode, preFlag, { batchMaintenanceDs, ds, options, key, item: i })
          : preFlag;
        if (flag) {
          i.set({ [key]: _value });
          if (isAll) {
            batchRecordKeys.add(i.key);
          }
        }
      });
    });
  });
  ds.setState({ batchRecordKeys });
  batchMaintenanceDs.reset();
}

// 去掉折叠按钮icon,并调整按钮样式
export function btnsFormat(btns) {
  const showBtns = [];
  let foldBtns = [];
  btns
    .filter((item) => item)
    .forEach((btn, index) => {
      const { name, group, btnComp, btnProps = {} } = btn;
      const { funcType, color } = btnProps;

      const newFuncType = funcType || (index === 0 ? 'raised' : 'flat');
      const newColor = color || (index === 0 ? 'primary ' : 'default');
      const pushArr = index < 5 ? showBtns : foldBtns;
      if (!group && !btnComp) {
        pushArr.push({
          ...btn,
          btnType: 'c7n-pro',
          btnProps: { ...btnProps, funcType: newFuncType, color: newColor, key: name },
        });
      } else {
        pushArr.push(btn);
      }
    });
  const style = {
    width: '100%',
    margin: 0,
    display: 'block',
    fontWeight: 'bold',
    padding: '0 15px',
    textAlign: 'left',
  };
  foldBtns = foldBtns.map((item) => {
    const { btnProps } = item;
    if (btnProps && btnProps.buttonProps) {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          buttonProps: {
            ...btnProps.buttonProps,
            style: { ...btnProps.buttonProps.style, ...style },
            icon: '',
          },
        },
      };
    } else if (btnProps && btnProps.otherButtonProps) {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          otherButtonProps: {
            ...btnProps.otherButtonProps,
            style: { ...btnProps.otherButtonProps.style, ...style, textAlign: 'left' },
            icon: '',
          },
        },
      };
    } else {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          style: { ...btnProps.style, ...style },
          icon: '',
        },
      };
    }
  });
  return foldBtns.length
    ? [
        ...showBtns,
        {
          name: 'more',
          // group: true,
          children: foldBtns,
          // createElement(Icon, { type: 'more_horiz' }),
          child: (
            <Button
              //  style={{ 'margin-right': '28px' }}
              icon="more_horiz"
              funcType="flat"
              type="c7n-pro"
            />
          ),
        },
      ]
    : showBtns;
}

/**
 * 大数字展示
 * @param value(需要格式化的数字) string | number | BigNumber
 * @param decimalPlaces(最小精度——默认-1) string | number
 * @param args( maxDp:最大精度——默认20 ) object
 * @return string
 */
export function showBigNumber(value, decimalPlaces = -1, args = {}) {
  if (isNil(value) || math?.isNaN(value)) {
    return value;
  }
  // 0特殊处理
  if (math?.isZero(value)) {
    return math?.toFixed(0, Number(decimalPlaces) > -1 ? Number(decimalPlaces) : 0);
  }
  // 字符串转化为数字/大数字
  const newValue = math?.plus(value, 0);
  if (isNil(newValue)) {
    return newValue;
  }
  // 最大精度
  const { maxDp = 20 } = args;
  // 最小精度
  const minDp = Number(decimalPlaces) > -1 ? Number(decimalPlaces) : math?.dp(value);
  // 格式化数字
  const language = getCurrentLanguage().split('_').join('-');
  return newValue.toLocaleString(language, {
    minimumFractionDigits: minDp,
    maximumFractionDigits: minDp > Number(maxDp) ? minDp : Number(maxDp),
  });
}

/**
 * 数字格式化
 * @param {Number} num 数字
 * @param {Boolean} originPrecision 是否传入精度
 * @param {Boolean} isSupplement 是否补0
 * @param {Boolean} useGrouping 是否展示分隔符
 * @returns
 */
export function formatNumber(num, originPrecision = -1, isSupplement = true, useGrouping = true) {
  if (!math.isFinite(num)) {
    return '';
  }
  const numArray = `${num}`.split('.');
  const precision =
    originPrecision === -1
      ? numArray.length > 1 && numArray[1].length > 2
        ? numArray[1].length
        : 2
      : originPrecision;
  const language = getCurrentLanguage().split('_').join('-');
  const options = Object.assign(
    { useGrouping },
    {
      maximumFractionDigits: precision,
    },
    precision && isSupplement ? { minimumFractionDigits: precision } : {}
  );
  if (isNumber(num)) {
    return num.toLocaleString(language, options);
  }
  if (math.isBigNumber(num)) {
    return NumberField.format(num, language, options);
  }
  return num;
}

/**
 * H0订单维护 物料变更时获取 辅助单位
 * @param {Object} basicUomObj 基本单位信息
 * @param {Boolean} sodrEnabled 订单是否开启双单位
 * @param {Object} lov 选中的物料值集信息
 * @param {String} type h0或c7n计算
 * @returns {Object}
 */
export function getSecondaryUomFormItem({ sodrEnabled, lov, type = 'h0' }) {
  if (type === 'h0') {
    const {
      uomId,
      uomCode,
      uomName,
      uomPrecision,
      uomCodeAndName = formatUom(uomCode, uomName),
    } = lov;
    const {
      secondaryUomId,
      secondaryUomCode,
      secondaryUomName,
      secondaryUomCodeAndName,
      secondaryUomPrecision,
    } = lov;
    const unEnabledSecondaryObj = {
      secondaryUomId: uomId,
      secondaryUomCode: uomCode,
      secondaryUomName: uomName,
      secondaryUomCodeAndName: uomCodeAndName,
      secondaryUomPrecision: uomPrecision,
    };
    const _secondaryUomObj = {
      secondaryUomId,
      secondaryUomCode,
      secondaryUomName,
      secondaryUomPrecision,
      secondaryUomCodeAndName,
    };
    let secondaryUomObj = {};
    secondaryUomObj = sodrEnabled
      ? secondaryUomId
        ? _secondaryUomObj
        : unEnabledSecondaryObj
      : unEnabledSecondaryObj;
    return secondaryUomObj;
  }
}

// 根据双单位配置开启返回显示名称 开启:基本单位，基本数量, 不开启:单位,数量
export function getDynamicLabel(config = 0, field = 'quantity') {
  const basicUomLabel = intl.get(`sodr.common.view.message.basicUomName`).d('基本单位');
  const basicQuanLabel = intl.get(`sodr.common.view.message.basicQuantity`).d('基本数量');
  const originUomLabel = intl.get(`sodr.common.model.common.uomCodeAndName`).d('单位');
  const originQuanLabel = intl.get(`sodr.common.model.common.newQuantity`).d('数量');
  if (field === 'quantity') {
    return !config ? originQuanLabel : basicQuanLabel;
  } else {
    return !config ? originUomLabel : basicUomLabel;
  }
}

/**
 * H0-数量换算接口更新
 * @param {Object} record
 * @param {Object} record 当前数据
 */
export async function conversionUpdateForH0({
  record,
  clearQuantity,
  query = (e) => e,
  doubleUnitEnabled,
  loading = (e) => e,
}) {
  const businessKey = '-9999';
  const sodrEnabled = doubleUnitEnabled !== 0;
  const { setFieldsValue = (e) => e, getFieldsValue = (e) => e, getFieldValue = (e) => e } =
    record?.$form || {};
  const { itemId, uomId: doublePrimaryUomId, secondaryQuantity, secondaryUomId } =
    getFieldsValue() || {};
  if (!itemId) {
    setFieldsValue({ quantity: getFieldValue('secondaryQuantity') });
    return;
  }
  if (!(doublePrimaryUomId && secondaryQuantity && secondaryUomId)) return;
  const itemOrgUom = {
    itemId,
    businessKey,
    secondaryUomId,
    secondaryQuantity,
    doublePrimaryUomId,
  };
  if (sodrEnabled) {
    try {
      loading(true);
      const list = await query([itemOrgUom]);
      loading(false);
      if (getResponse(list)) {
        if (!isEmpty(list)) {
          const target = list.find((j) => j.businessKey === businessKey);
          if (target && !isNil(target.primaryQuantity)) {
            setFieldsValue({ quantity: target.primaryQuantity });
          }
          // eslint-disable-next-line no-param-reassign
          record.__calculateError__ = false;
        }
        return Promise.resolve(list);
      } else {
        // eslint-disable-next-line no-param-reassign
        record.__calculateError__ = true;
        if (clearQuantity) {
          setFieldsValue({ quantity: undefined });
        }
        return Promise.reject();
      }
    } catch (error) {
      loading(false);
      return Promise.reject(error);
    }
  }
}

/**
 * h0 辅助单位、辅助数量 字段变化换算
 * @param {Object} record 行数据
 * @param {String} fieldName 变动字段
 * @param {Object} fieldProps 当前字段变动传入数据
 * @param {Number} doubleUnitEnabled 双单位是否开启
 * @param {Function} calc 传入的计算方法
 */
export async function conversionUpdateUomIdForH0({
  record,
  fieldName = 'uom',
  fieldProps,
  doubleUnitEnabled,
  loading = noop,
  calc = noop,
}) {
  if (fieldName === 'uom') {
    const { uomId, uomCode, uomName, uomCodeAndName, secondaryUomPrecision } = fieldProps || {};
    if (!uomId) return;
    // lov选中更新
    record.$form.setFieldsValue({
      secondaryUomId: uomId,
      secondaryUomCode: uomCode,
      secondaryUomName: uomName,
      secondaryUomCodeAndName: uomCodeAndName,
      secondaryUomPrecision,
    });
    // 开启双单位且存在基本单位则换算
    if (doubleUnitEnabled && uomId) {
      conversionUpdateForH0({
        record,
        loading,
        query: calc,
        doubleUnitEnabled,
        businessKeyField: 'poLineId',
      });
    }
    // 如果开启双单位 并且不存在物料id， 1：1赋值辅助单位
    if (doubleUnitEnabled && !record.$form.getFieldValue('itemId')) {
      record.$form.setFieldsValue({
        uomId,
        uomCode,
        uomName,
        uomCodeAndName,
        uomPrecision: secondaryUomPrecision,
      });
    }
  }
}

/**
 * C7N-数量/单位字段换算更新
 * @param {Object} dataSet
 * @param {Object} record 当前数据
 */
export async function conversionUpdate({
  dataSet,
  record,
  field = 'quantity',
  loading = (e) => e,
  source,
}) {
  const doubleUnitEnabled = dataSet.getState('doubleUnitEnabled');
  const sodrEnabled = Boolean(doubleUnitEnabled);
  const businessKey = '-9999'; // 无实际意义
  const itemId =
    typeof record.get('itemId') === 'object' ? record.get('itemId')?.itemId : record.get('itemId');
  const doublePrimaryUomId = record.get('uomId')?.uomId;
  const secondaryQuantity = record.get('secondaryQuantity');
  const secondaryUomId = record.get('secondaryUomId')?.uomId || record.get('secondaryUomId');
  // 没有物料编码 1：1计算数量
  if (!itemId) {
    record.set({ quantity: record.get('secondaryQuantity') });
    return;
  }
  if (!(doublePrimaryUomId && secondaryQuantity && secondaryUomId)) return;
  const itemOrgUom = {
    itemId,
    businessKey,
    secondaryUomId,
    secondaryQuantity,
    doublePrimaryUomId,
  };
  const loadingStart = { conversionUpdate: true };
  const loadingEnd = source === 'order-change' ? false : { conversionUpdate: false };
  if (sodrEnabled) {
    try {
      loading(loadingStart);
      const list = await queryDoubleUnitConversion([itemOrgUom]);
      if (getResponse(list)) {
        if (!isEmpty(list)) {
          const target = list.find((j) => j.businessKey === businessKey);
          if (target && !isNil(target.primaryQuantity)) {
            record.set({ [field]: target.primaryQuantity });
          }
          record.setState('__calculateError__', false);
          loading(loadingEnd);
        }
        return Promise.resolve(list);
      } else {
        record.setState('__calculateError__', true);
        return Promise.reject(list);
      }
    } catch (error) {
      loading(loadingEnd);
      return Promise.reject(error);
    } finally {
      loading(loadingEnd);
    }
  }
}

// 保存提交前对行数据计算错误校验
export const validateLineCalculate = ({ data, type = 'c7n' }) => {
  let errorFlag;
  let errorMessage;
  if (type === 'h0') {
    errorFlag = data.some((i) => i.__calculateError__);
    errorMessage = data
      .filter((i) => i.__calculateError__)
      .map((i) => `【${i.displayLineNum}】`)
      .join(',');
  }
  if (type === 'c7n') {
    errorFlag = data.some((i) => i.getState('__calculateError__'));
    errorMessage = data
      .filter((i) => i.getState('__calculateError__'))
      .map((i) => `【${i.get('displayLineNum')}】`)
      .join(',');
  }
  if (errorFlag && !isEmpty(errorMessage)) {
    notification.warning({
      message: intl
        .get(`sodr.common.view.message.validateLineCalculate`, {
          errorMessage,
        })
        .d(`订单行${errorMessage} 基本数量换算错误，请更换物料编码或单位后重新计算`),
    });
    return false;
  }
  return true;
};

// 双单位开启则校验
export const validateDoubleUom = ({
  price,
  record,
  sodrEnabled,
  lineUomId,
  type = 'h0',
  remote,
}) => {
  const itemName =
    type === 'h0'
      ? record.$form.getFieldValue('itemCode') || record.itemCode
      : record.get('itemCode');
  const uomId = type === 'h0' ? record.$form.getFieldValue('uomId') : lineUomId;
  const originGetPriceFaild = sodrEnabled && price.uomId !== uomId;
  const getPriceFaild = remote
    ? remote.process('getDoubleUomPriceFailed', originGetPriceFaild, {
        itemCode: itemName,
      })
    : originGetPriceFaild;
  if (getPriceFaild) {
    notification.error({
      message: intl
        .get(`sodr.common.view.message.validatePriceUomId`, {
          itemName,
        })
        .d(
          `订单行自动带出价格失败，失败原因：物料【${itemName}】在价格库的单位与物料主数据中的基本单位不一致，请检查价格库或物料主数据后重新操作`
        ),
    });
    return false;
  }
  return true;
};

// 公用获取双单位配置
export async function queryCommonDoubleUomConfig(params) {
  const result = await queryDoubleUomConfig(params);
  if (getResponse(result)) {
    return Number(result);
  }
  return 0;
}

// 公用获取金额计算配置 Amount | Price;
export async function queryCalcRuleConfig(params = [{}]) {
  const result = await queryAmountCalcConfig(params);
  if (getResponse(result) && isArray(result)) {
    return result[0];
  }
  return 'Amount';
}

/**
 * 获取fields字段数据
 * @param {Record} record
 * @param {String} isOriginalValue 是否为原始字段值
 * @returns {}
 */
export function getRecordData(record, isOriginalValue) {
  if (!record) return {};
  const fieldsMap = record.dataSet.fields.toJSON();
  for (const key in fieldsMap) {
    if (fieldsMap[key].pristineProps.ignore === 'always') {
      delete fieldsMap[key];
    }
  }
  const fieldKeys = Object.keys(fieldsMap);
  if (isOriginalValue) return record.get(fieldKeys);
  else {
    const data = record.toData();
    return Object.fromEntries(fieldKeys.map((i) => [i, data[i]]));
  }
}
/**
 * 付款计划更新预览弹窗
 * @param {Object} options 配置项（type：弹窗类型-根据入口 [cancel 整单取消 ｜ lineCancel 按行取消 ｜ change 变更页链接 ｜ changeSubmit 变更页按钮提交 |undefined 只读] record：数据来源record  afterOk: onOk执行后回调）
 * @param {*} body 调用金额计算接口所需参数
 * @param {Object} nextModalProps 下一步的弹窗props
 */
export async function openTermsModal(options = {}, body, nextModalProps = {}) {
  return new Promise(async (resolve) => {
    const { type, record, afterOk } = options;
    if (!record) return resolve(false);
    const { paymentPlanNum, taxIncludeAmount } = record.get(['paymentPlanNum', 'taxIncludeAmount']);
    const sourcePageData = record.toJSONData();
    const config = [
      {
        type: 'cancel',
        method: paymentPlanWholeCancel,
      },
      {
        type: 'lineCancel',
        method: paymentPlanLineCancel,
      },
      {
        type: 'change',
        method: paymentPlanChange,
      },
      {
        type: 'changeSubmit',
        method: paymentPlanChange,
      },
    ];
    const currentConfig = config.find((i) => i.type === type) || {
      title: intl.get('sodr.common.model.termsModal.paymentPlanQuery').d('付款计划查询'),
    };
    const {
      title = intl.get('sodr.common.model.termsModal.paymentPlanAdjustment').d('付款计划调整'),
      method,
    } = currentConfig;
    // 当前所处步骤
    let step = 0;
    let currentModal;
    let onSave;
    // 设置ok按钮loading
    const onSetSourceLoading = (flag) => {
      if (currentModal) {
        currentModal.update({ okProps: { loading: !!flag } });
      }
    };
    const isEdit = ['cancel', 'change', 'lineCancel', 'changeSubmit'].includes(type);
    const response = method ? await method(body) : { paymentAmount: taxIncludeAmount };
    if (getResponse(response)) {
      const { paymentAmount, termNum, termHeaderId } = response;
      // 获取弹窗内组件保存方法
      const afterClose = () => resolve(false);
      const onPartChildRef = ({ handleSave, handleSetLoading }) => {
        onSave = handleSave;
        currentModal.update({
          okProps: { loading: true },
          afterClose,
          onOk: async () => {
            const okRes = await handleSave();
            if (okRes && afterOk) {
              handleSetLoading(true);
              const afterOkRes = await afterOk();
              handleSetLoading(false);
              if (afterOkRes) {
                resolve(afterOkRes);
              }
              return afterOkRes;
            } else {
              if (okRes) {
                resolve(okRes);
              }
              return okRes;
            }
          },
        });
      };
      const prevModalProps = {
        title,
        drawer: true,
        children: (
          <EmbedPage
            sourceAmount={paymentAmount}
            sourcePageData={sourcePageData} // 订单头数据
            termsData={{ termHeaderId, termNum }} // 条款信息: 条款编码|条款id
            onPartChildRef={onPartChildRef}
            onSetSourceLoading={onSetSourceLoading}
            contentStyleType="fullfit"
            href={`/ssta/payment-plan/detail-by-num/${paymentPlanNum}?operate=${
              isEdit ? 'edit' : 'view'
            }&source=sodr`}
          />
        ),
        style: { width: 1090 },
        okText: intl.get('hzero.common.button.confirm').d('确认'),
        cancelText: isEdit
          ? intl.get('hzero.common.btn.cancel').d('取消')
          : intl.get('hzero.common.btn.close').d('关闭'),
        cancelProps: {
          color: type ? 'default' : 'primary',
        },
      };
      // 切换步骤
      const toggle = async () => {
        if (step === 0 ? onSave && (await onSave()) : true) {
          step = step ? 0 : 1;
          currentModal.update(
            step === 0
              ? prevModalProps
              : {
                  ...nextModalProps,
                  style: { width: 1090 },
                  title,
                  afterClose: (...args) => {
                    nextModalProps.afterClose(...args);
                    afterClose();
                  },
                }
          );
        }
      };
      const footer = (okBtn, cancelBtn) => {
        const fristStep = step === 0;
        const setpBtn = (
          <Button
            type="c7n-pro"
            funcType="raised"
            onClick={toggle}
            color={fristStep ? 'primary' : undefined}
          >
            {fristStep
              ? intl.get(`sodr.common.model.termsModal.next`).d('下一步')
              : intl.get(`sodr.common.model.termsModal.prev`).d('上一步')}
          </Button>
        );
        return isEdit
          ? ['change', 'changeSubmit'].includes(type)
            ? [okBtn, cancelBtn] // 变更展示按钮
            : fristStep
            ? [setpBtn, cancelBtn] // 可编辑弹窗第一页按钮
            : [okBtn, setpBtn, cancelBtn] // 可编辑弹窗第二页按钮
          : [cancelBtn]; // 只读弹窗按钮
      };
      Object.assign(prevModalProps, { footer });
      currentModal = Modal.open(prevModalProps);
    }
  });
}

/**
 * 付款计划更新弹窗（维护页面提交展示）
 * @param {Object} body 调用是否弹窗接口所需参数
 */
export async function openTermsModalForSubmit({ body }) {
  const res = getResponse(await paymentCheckSubmit(body));
  if (res) {
    const { enableEdit, paymentPlanDTO } = res;
    if (enableEdit === 1) {
      const { planNum, paymentAmount, termHeaderId, termNum } = paymentPlanDTO;
      const modalPromise = new Promise((resolve) => {
        let currentModal;
        // 获取弹窗内组件保存方法
        const onPartChildRef = ({ handleSave }) => {
          if (currentModal) {
            currentModal.update({
              okProps: {
                loading: false,
              },
              onOk: async () => {
                const okRes = await handleSave();
                if (okRes) {
                  return resolve(true);
                }
                return false;
              },
            });
          }
        };
        currentModal = Modal.open({
          title: intl.get('sodr.common.model.termsModal.paymentPlanAdjustment').d('付款计划调整'),
          drawer: true,
          style: { width: 1090 },
          afterClose: () => resolve(false),
          okProps: {
            loading: true,
          },
          children: (
            <EmbedPage
              sourceAmount={paymentAmount}
              sourcePageData={body} // 订单头数据
              termsData={{ termHeaderId, termNum }} // 条款信息: 条款编码|条款id
              onPartChildRef={onPartChildRef}
              contentStyleType="fullfit"
              href={`/ssta/payment-plan/detail-by-num/${planNum}?operate=edit&source=sodr`}
            />
          ),
        });
      });
      const modalRes = await modalPromise;
      return modalRes;
    }
    return true;
  }
}

// 获取业务规则定义-订单下单控制
export async function getStageIdList(params) {
  const result = await queryOrderControlConfig(params);
  if (getResponse(result) && result.stageIdList) {
    return result.stageIdList;
  }
}

/**
 * @description C7N页面采买组织关联带出
 * @param {Record} record
 * @param {String} name
 * @param {*} value
 * @param {DataSet} lineDs
 */
export async function getAutoBind({ record, name, value, lineDs }) {
  const {
    // ouId: ouLov,
    // purchaseOrgId: purchaseOrgLov,
    agentId: agentLov,
    // companyId: companyLov,
  } = record.get(['companyId', 'ouId', 'purchaseOrgId', 'agentId']);
  // const { companyId: oldCompanyId } = companyLov || {};
  // const { ouId: oldOuId } = ouLov || {};
  // const { purchaseOrgId: oldPurchaseOrgId } = purchaseOrgLov || {};
  const { purchaseAgentId: oldAgentId } = agentLov || {};
  // const lastGetAutoBindRes = dataSet.getState('lastGetAutoBindRes');
  // const noValueChange = () => {
  //   // 如存在值集配置不满足valueField===name 则此处需要额外处理
  //   const isChange = lastGetAutoBindRes?.[name] !== value?.[name];
  //   if (isChange) {
  //     dataSet.setState({ lastGetAutoBindRes: null });
  //   }
  //   return !isChange;
  // };
  // if (noValueChange() && value) return;
  if (name === 'companyId') {
    if (value) {
      fetchAutoGetCompany({
        companyId: value?.companyId,
        // ouId: oldOuId,
        // purchaseOrgId: oldPurchaseOrgId,
        // purchaseAgentId: oldAgentId,
      }).then((res) => {
        if (res) {
          // dataSet.setState('lastGetAutoBindRes', res);
          const {
            ouId,
            ouCode,
            ouName,
            purchaseOrgId,
            purchaseOrgName,
            purchaseAgentId,
            purchaseAgentName,
          } = res;
          record.set({
            ouId: { ouId, ouName, ouCode },
            purchaseOrgId: {
              purchaseOrgId,
              organizationName: purchaseOrgName,
            },
            agentId: {
              purchaseAgentId,
              purchaseAgentName,
            },
          });
        }
      });
    } else {
      record.set({
        ouId: null,
      });
    }
  }
  if (name === 'ouId') {
    if (value) {
      (lineDs || []).forEach((lineRecord) => {
        lineRecord.init({
          invOrganizationId: null,
        });
      });
      fetchAutoGetCompany({
        ouId: value.ouId,
        companyId: record.get('companyId')?.companyId,
      }).then((res) => {
        if (res) {
          // dataSet.setState('lastGetAutoBindRes', res);
          const {
            purchaseOrgId,
            purchaseOrgName,
            purchaseAgentId,
            purchaseAgentName,
            organizationId,
            organizationName,
          } = res;
          if (lineDs) {
            lineDs.setState({
              defaultOrgId: organizationId,
              defaultOrgName: organizationName,
            });
          }
          record.set({
            // organizationId,
            // organizationName,
            purchaseOrgId: purchaseOrgId
              ? {
                  purchaseOrgId,
                  organizationName: purchaseOrgName,
                }
              : null,
            agentId: {
              purchaseAgentId,
              purchaseAgentName,
            },
          });
          (lineDs || []).forEach((lineRecord) => {
            lineRecord.set({
              invOrganizationId: {
                organizationId,
                organizationName,
              },
            });
          });
        }
      });
    } else {
      record.set({
        purchaseOrgId: null,
        agentId: null,
      });
      (lineDs || []).forEach((lineRecord) => {
        lineRecord.init({
          invOrganizationId: null,
        });
      });
      (lineDs || []).setState({
        defaultOrgId: null,
        defaultOrgName: null,
      });
    }
  }
  if (name === 'purchaseOrgId') {
    if (value) {
      // 标准改造，去掉上迭代埋点处理
      // if (remote && remote.process('transferPurchaseAgentId')) {
      //   params.purchaseAgentId = record.get('agentId')?.purchaseAgentId;
      // }
      fetchAutoGetAgent({
        // ouId: oldOuId,
        purchaseOrgId: value?.purchaseOrgId,
        // companyId: oldCompanyId,
        purchaseAgentId: oldAgentId,
      }).then((res) => {
        if (res) {
          // dataSet.setState('lastGetAutoBindRes', res);
          const { purchaseAgentId, purchaseAgentName } = res;
          record.set({
            agentId: purchaseAgentId
              ? {
                  purchaseAgentId,
                  // purchaseAgentCode,
                  purchaseAgentName,
                }
              : null,
          });
        }
      });
    } else {
      record.set({
        agentId: null,
      });
    }
  }
}

// 对行ds校验不通过字段进行消息提示
export function showLineDsErrors(detailInfoDs) {
  const errs = detailInfoDs.getValidationErrors();
  if (!isEmpty(errs)) {
    const { errors, record } = errs[0];
    const lineNum = record.get('displayLineNum');
    const valueMissingList = []; // 必输校验未通过
    const patternMismatchList = []; // 正则校验未通过
    const customErrorList = []; // 自定义校验未通过
    errors.forEach((n) => {
      const label = n.field.get('label', record);
      const { ruleName, validationMessage } = n.errors[0];
      if (ruleName === 'valueMissing') {
        valueMissingList.push(`【${label}】`);
      } else if (ruleName === 'patternMismatch') {
        patternMismatchList.push(`【${label}】`);
        // 暂定其他的都是自定义校验
      } else {
        customErrorList.push({ label, validationMessage });
      }
    });
    let errorMsg = isEmpty(valueMissingList)
      ? ''
      : intl
          .get('sodr.workspace.view.message.valueMissingList', {
            fields: String(valueMissingList),
          })
          .d('{fields}为必输字段，不能为空');
    if (!isEmpty(patternMismatchList)) {
      errorMsg += `${isEmpty(valueMissingList) ? '' : ';'} ${intl
        .get('sodr.workspace.view.message.patternMismatchList', {
          fields: String(patternMismatchList),
        })
        .d('{fields}值为无效值，请检查')}`;
    }
    if (!isEmpty(customErrorList)) {
      customErrorList.forEach((m) => {
        errorMsg += `${isEmpty(valueMissingList) && isEmpty(patternMismatchList) ? '' : ';'} 【${
          m.label
        }】 ${m.validationMessage}`;
      });
    }
    const description = intl
      .get('sodr.workspace.view.message.showDsErrors', { lineNum: lineNum || 'null', errorMsg })
      .d('订单保存/提交失败，原因是 : 行号{lineNum} {errorMsg}');
    notification.error({ description });
  }
}

/**
 * 提交前预览赠品行信息
 * @param {*} param0
 * poHeaderIds 预览查询参数
 * data 明细页面提交预览更新(先走更新再走查询)
 * afterUpdateCallback 更新完订单行赠品数据后的回调
 * @returns {Promise}
 */
export async function previewGift({
  poHeaderIds,
  data,
  query,
  afterUpdateCallback,
  customizeUnitCode,
}) {
  const { poHeaderDetailDTO = {} } = data || {};
  const { poHeaderId } = poHeaderDetailDTO;
  const giftInfoDs = new DataSet(
    giftInfoDsConfig({
      poHeaderIds: poHeaderId ? [poHeaderId] : poHeaderIds,
      params: { customizeUnitCode },
    })
  );
  let res;
  if (data) {
    res = getResponse(await updateGift(data, query));
    if (!res) return false;
    giftInfoDs.query();
    if (afterUpdateCallback) {
      const afterUpdateCallbackRes = await afterUpdateCallback();
      if (!afterUpdateCallbackRes) return;
    }
  }
  const previewGiftModal = await Modal.confirm({
    title: intl.get('sodr.workspace.view.panel.giftInfo').d('赠品明细信息'),
    style: { width: 1090 },
    drawer: true,
    // sourceMaintenance 默认提交方法进来也属于维护页面
    children: <GiftInfo ds={giftInfoDs} sourceMaintenance />,
  });
  return previewGiftModal === 'ok' && res;
}

export const renderStatus = (code, meaning) => {
  if (!code) return null;
  const colorConfigList = [
    {
      // 黄色
      status: [
        'PENDING',
        'DELIVERY_DATE_REVIEW',
        'CLOSEING',
        'CANCELING',
        'CANCELLED_PARTIAL',
        'CLOSETOBECOMFIRMED',
        'CANCELTOBECOMFIRMED',
        'SUPPLIER_SIGN_CONTRACT', // sign
        'PURCHASER_SIGN_CONTRACT', // sign
        'WAIT_PURCHASER_SIGN', // terminated_sign
        'WAIT_SUPPLIER_SIGN', // terminated_sign
      ],
      type: 'yellow',
    },
    {
      // 绿色
      status: [
        'APPROVED',
        'PUBLISHED',
        'CONFIRMED',
        'PART_FEED_BACK',
        'SUBMITTED',
        'SUBMITTED_WFL',
        'EFFECTED', // sign
        'TERMINATED', // terminated_sign
      ],
      type: 'green',
    },
    {
      // 红色
      status: [
        'REJECTED',
        'DELIVERY_DATE_REJECT',
        'TERMINATION', // sign
      ],
      type: 'red',
    },
    {
      // 灰色
      status: [
        'CLOSED',
        'CANCELED',
        'PUBLISH_CANCEL',
        'CANCELLATION', // sign
        'NOT_TERMINATED', // terminated_sign
      ],
      type: 'gray',
    },
  ];
  const colorConfig = colorConfigList.find((i) => i.status.includes(code));
  return <StatusTag color={colorConfig?.type}>{meaning}</StatusTag>;
};

// 渲染列表智能预审字段
export const renderAiPreReview = ({ record }) => {
  const { aiApproveStatus, aiApproveStatusMeaning } = record?.get([
    'aiApproveStatus',
    'aiApproveStatusMeaning',
  ]);
  let type = 'gray';
  switch (aiApproveStatus) {
    case 'APPROVED':
      type = 'green';
      break;
    case 'APPROVED_SUGGEST':
      type = 'orange';
      break;
    case 'REJECTED':
    case 'FAIL':
      type = 'red';
      break;
    case 'APPROVING':
      type = 'blue';
      break;
    default:
      type = 'gray';
      break;
  }
  return aiApproveStatus ? (
    <Tooltip
      theme="light"
      placement="bottom"
      popupStyle={{ minWidth: 180 }}
      title={
        ['REJECTED', 'APPROVED', 'APPROVED_SUGGEST'].includes(aiApproveStatus) ? (
          <div style={{ margin: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <Badge status="success" />
              <span>{intl.get('sodr.common.model.common.aiApprovedCount').d('通过数量')}</span>
              <span style={{ float: 'right' }}>{record?.get('aiApprovedCount') || 0}</span>
            </div>
            <div>
              <Badge status="error" />
              <span>{intl.get('sodr.common.model.common.aiRejectedCount').d('不通过数量')}</span>
              <span style={{ float: 'right' }}>{record?.get('aiRejectedCount') || 0}</span>
            </div>
          </div>
        ) : null
      }
    >
      <StatusTag color={type}>
        {aiApproveStatus ? aiApproveStatusMeaning : '-'}
        {aiApproveStatus ? (
          <IntelligentReviewIcon style={{ marginLeft: '4px', verticalAlign: 'sub' }} />
        ) : null}
      </StatusTag>
    </Tooltip>
  ) : (
    '-'
  );
};

// 获取付款计划配置
export async function getPaymentPlanConfig(params) {
  const res = await paymentPlanConfig(params);
  if (getResponse(res)) {
    return res.customControlModeFlag === 1;
  }
  return Promise.reject(res);
}

/**
 * 反馈审核拒绝原因维护弹窗
 * @param customizeForm
 * @param code 个性化单元编码
 * @returns Promise (false: 不通过 ｜ object: 弹窗数据)
 */
export async function rejectReasonModal({ customizeForm, code }) {
  const ds = new DataSet({
    dataToJSON: 'all',
    autoCreate: true,
    fields: [
      {
        name: 'deliveryDateRejectRemark',
        label: intl
          .get('sodr.workspace.model.common.deliveryDateRejectRemark')
          .d('反馈审核退回原因'),
      },
    ],
  });
  return new Promise((resolve) => {
    Modal.open({
      title: intl.get('sodr.workspace.view.title.deliveryDateReject').d('反馈审核退回'),
      children: customizeForm(
        { code },
        <Form dataSet={ds} labelLayout="float">
          <TextArea
            resize="vertical"
            name="deliveryDateRejectRemark"
            placeholder={intl
              .get('sodr.workspace.view.message.deliveryDateReject')
              .d('请输入反馈审核退回原因')}
          />
        </Form>
      ),
      drawer: true,
      style: { width: 380 },
      footer: (okBtn, cancelBtn) => [okBtn, cancelBtn],
      onOk: async () => {
        const validateRes = await ds.validate();
        if (validateRes) {
          resolve(ds.current.get(['deliveryDateRejectRemark']));
        }
        return !!validateRes;
      },
      afterClose() {
        resolve(false);
      },
    });
  });
}

/**
 * 获取业务规则控制-单据流与关联单据显示配置
 * @param callback 传入的回调方法
 */
export async function getDisplayDocAndDocFlow(callback = noop) {
  const res = getResponse(await fetchDisplayDocAndDocFlow());
  if (res) {
    callback(res);
    return res;
  }
  return {};
}

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {Array} businessKeys businessKeys
 */
export async function getBatchOperationFlag(businessKeys) {
  const res = getResponse(
    await fetchOperationFlag({ body: businessKeys, query: { revokeFlag: 1 } })
  );
  if (res) {
    return res;
  }
  return {};
}

/**
 * 撤销工作流审批
 * @param {String} businessKey businessKey
 */
export function revokeWorkFlow(businessKey) {
  return new Promise(async (resolve) => {
    Modal.confirm({
      title: intl.get('sodr.common.model.common.errorMessage').d('提示'),
      children: intl
        .get('sodr.workspace.view.message.revokeWorkFlow')
        .d('是否确认撤销审批？撤销后您仍可再次提交发起审批（仅工作流审批发起人可撤销审批）'),
      onOk: async () => {
        const res = await revokeWorkFlowByKey({ businessKey });
        if (isString(res)) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: res,
          });
        } else if (getResponse(res)) {
          resolve(true);
          notification.success({
            description: intl
              .get('sodr.workspace.view.message.revokeApprovalSuccess')
              .d('撤销审批成功'),
          });
        }
        resolve(false);
      },
      afterClose: () => {
        resolve(false);
      },
    });
  });
}
/**
 * 批量拆分订单行
 * 维护/变更页面
 * @param {Object} ds  订单行ds
 * @param {Object} source  maintenance(维护) ｜ change(变更)
 * @param {Function} callback 执行完成后的回调 一般做重新查询头行数据操作
 * @param {Function} getValues 获取页面最新数据方法(包括交易采买组织信息)
 */
export async function handleBatchSplit({
  getValues,
  callback = (e) => e,
  ds,
  source = 'maintenance',
}) {
  try {
    // eslint-disable-next-line no-param-reassign
    ds.status = 'submitting';
    // 来源是维护页面
    const sourceMaintenance = source === 'maintenance';
    const basicCurrent = ds.getState('basicInfoDs')?.current;
    const { fixedAssetsFlag } = basicCurrent?.get(['fixedAssetsFlag']) || {};
    const { selected, all } = ds;
    const records = isEmpty(selected) ? all : selected;
    // 是否含有未保存的行
    let hasUnSaveLine = false;
    const validateRes = await Promise.all(
      records.map((i) => {
        const { poLineLocationId } = i.get(['poLineLocationId']);
        if (!hasUnSaveLine && !poLineLocationId) hasUnSaveLine = true;
        return i.validate();
      })
    );
    if (hasUnSaveLine && sourceMaintenance) {
      return notification.error({
        description: intl
          .get('sodr.workspace.view.message.handleBatchSplitError')
          .d(
            '订单批量拆分行失败，失败原因是存在未保存的订单行，请点击保存按钮后，再进行批量拆行操作'
          ),
      });
    }
    const record = records[validateRes.findIndex((i) => !i)];
    if (record) {
      const err = record.getValidationErrors();
      // 只考虑同时存在一种校验且是必输类型
      if (err.some((n) => n.errors[0].ruleName === 'valueMissing')) {
        return notification.error({
          description: intl
            .get('sodr.workspace.view.message.handleBatchSplitRequiredError', {
              lineNum: record.get('displayLineNum'),
            })
            .d(
              '批量拆分订单行失败，失败原因为订单行{lineNum}存在必输字段未维护，请先维护再进行相关操作'
            ),
        });
      }
    }
    const modalRes =
      // 如果全部都是固定资产行，则无需弹窗
      fixedAssetsFlag ||
      records.every((i) => i.get('fixedAssetsFlag') === 1) ||
      (await new Promise((resolve) => {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl
            .get('sodr.workspace.view.message.handleBatchSplit')
            .d(
              '您好，涉及本次拆分的订单行，含非固定资产类型。如果您需要拆分全部订单行，请点击【全部行拆分】按钮；如果您需要针对固定资产类型的订单行进行拆分，请点击【仅拆分固定资产行】按钮'
            ),
          okText: intl.get('sodr.workspace.view.button.allLineSplit').d('全部行拆分'),
          onClose: () => resolve(false),
          onOk: () => {
            resolve('all');
          },
          footer: (okBtn, cancelBtn, modal) => {
            return [
              cancelBtn,
              <Button
                type="c7n-pro"
                onClick={() => {
                  resolve('onlyFixedAssets');
                  modal.close();
                }}
              >
                {intl.get('sodr.workspace.view.button.onlyFixedAssets').d('仅拆分固定资产行')}
              </Button>,
              okBtn,
            ];
          },
        });
      }));
    if (modalRes) {
      const { poHeaderDetailDTO = {} } = getValues();
      const res = getResponse(
        await (sourceMaintenance ? poLineSplit : poChangeLineSplit)({
          poHeaderId: poHeaderDetailDTO.poHeaderId,
          body: {
            poHeaderDetailDTO,
            poLineDetailDTOs: records.map((i) => i.toData()),
          },
          query: {
            onlyFixedAssetsFlag: modalRes === 'all' ? 0 : 1,
            splitAllFlag: selected.length ? 0 : 1,
          },
        })
      );
      if (res) {
        // 变更页面
        if (!sourceMaintenance) {
          const { poLineDetailDTOs = [] } = res;
          transaction(() => {
            poLineDetailDTOs.forEach((i) => {
              const { poLineLocationId, quantity, businessKey } = i;
              const currentLine = records.find((n) =>
                // 原行用poLineLocationId 新增行没有poLineLocationId可以统一用自己生成的businessKey
                poLineLocationId
                  ? n.get('poLineLocationId') === poLineLocationId
                  : businessKey && n.get('businessKey') === businessKey
              );

              if (currentLine) {
                currentLine.set({ quantity });
              } else {
                ds.create(i);
              }
            });
          });
        }
        callback();
      }
    }
  } catch (error) {
    throw new Error(error);
  } finally {
    // eslint-disable-next-line no-param-reassign
    ds.status = 'ready';
  }
}

/**
 * 订单提交预校验协议与占用金额
 * @param {Number} pageType 页面来源： 1(明细页提交) | 2(列表页提交) | 3(变更页提交)
 * @param {Object} body 调用校验接口入参
 */
export async function associatedPcAndAmountCheck(pageType, body) {
  const newBody = cloneDeep(body);
  if ([1, 3].includes(pageType)) {
    // 明细页面提交只有一条数据
    const [{ pcHeaderIdLov, poHeaderId, poLineExpVOList = [] }] = newBody;
    // 处理新增行没有头id 后续有问题可以给后端处理
    newBody[0].poLineExpVOList = poLineExpVOList.map((i) => {
      if (!i.poHeaderId) return { ...i, poHeaderId };
      return i;
    });
    // 前端需校验 先维护头关联采购协议字段，隐藏后再维护行关联采购协议 的场景
    if (
      pcHeaderIdLov &&
      poLineExpVOList.find(
        ({ pcSubjectId, priceSource }) => pcSubjectId && priceSource !== 'CONTRACT'
      )
    ) {
      return notification.error({
        description: intl
          .get('sodr.workspace.view.message.associatedPcAndAmountCheck')
          .d('同一个订单下，订单整单关联的协议信息和订单行关联的协议信息不能并存'),
      });
    }
  }
  const pcRes = getResponse(await associatedPcCheck({ pageType, body: newBody }));
  if (!pcRes) return false;
  if (!isEmpty(pcRes)) {
    const columns = [
      {
        name: 'nums',
        width: 150,
      },
      {
        name: 'message',
        className: styles['break-line-column'],
      },
    ];
    const ds = new DataSet({
      paging: false,
      selection: false,
      fields: [
        {
          name: 'nums',
          label:
            pageType === 2
              ? intl.get('sodr.common.view.message.displayPoNum').d('订单号')
              : intl.get('sodr.common.model.common.orderLineNum').d('订单行号'),
        },
        {
          name: 'message',
          label: intl.get('hzero.common.message.confirm.title').d('提示'),
        },
      ],
      data: pcRes,
    });
    const modalRes = await Modal.confirm({
      style: { width: 748 },
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <Fragment>
          <p style={{ marginBottom: 8 }}>
            {intl
              .get('sodr.workspace.view.message.associatedPcCheck')
              .d(
                '以下【订单信息】和【关联协议的信息】有差异，请检查关联协议是否选择正确。若选择错误，请修改更新后提交；若选择正常，请继续提交。'
              )}
          </p>
          <Table dataSet={ds} columns={columns} />
        </Fragment>
      ),
    });
    if (modalRes !== 'ok') return false;
  }
  const pcAmountRes = getResponse(await associatedPcAmountCheck({ pageType, body: newBody }));
  if (!pcAmountRes) return false;
  if (!isEmpty(pcAmountRes)) {
    const amountColumns = [
      {
        name: 'executionBillNum',
        width: 150,
      },
      {
        name: 'executionBillLineNum',
        width: 80,
      },
      {
        name: 'contractNum',
        width: 150,
      },
      {
        name: 'errorMessage',
      },
    ];
    const amountDs = new DataSet({
      paging: false,
      selection: false,
      fields: [
        {
          name: 'executionBillNum',
          label: intl.get('sodr.common.view.message.displayPoNum').d('订单号'),
        },
        {
          name: 'executionBillLineNum',
          label: intl.get('sodr.common.model.common.lineNum').d('行号'),
        },
        {
          name: 'contractNum',
          label: intl
            .get('sodr.workspace.model.associatedPcAndAmountCheck.contraceNum')
            .d('占用采购协议'),
        },
        {
          name: 'errorMessage',
          label: intl.get('hzero.common.message.confirm.title').d('提示'),
        },
      ],
      data: pcAmountRes,
    });
    const amountModalRes = await Modal.confirm({
      style: { width: 748 },
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <Fragment>
          <p style={{ marginBottom: 8 }}>
            {intl
              .get('sodr.workspace.view.message.associatedPcAmountCheck')
              .d('以下订单行已超预警线或超量占用，请确认是否继续提交。')}
          </p>
          <Table dataSet={amountDs} columns={amountColumns} />
        </Fragment>
      ),
    });
    if (amountModalRes !== 'ok') return false;
  }
  return true;
}

export async function viewCostInformation({
  record: lineRecord,
  displayPoNum,
  viewOnly,
  lineCode,
}) {
  const lineData = lineRecord.toData();
  const organizationInfoDs = lineRecord.dataSet.getState('organizationInfoDs');
  const {
    quantity,
    poLineId,
    displayLineNum,
    poHeaderId,
    benchmarkPriceType,
    currencyCode,
    financialPrecision,
    taxId,
    taxRate,
    taxCode,
  } = lineData;
  const editor = !viewOnly;
  const validateFields = [
    'quantity',
    'benchmarkPriceType',
    benchmarkPriceType === 'NET_PRICE' ? 'unitPrice' : 'enteredTaxIncludedPrice',
    'unitPriceBatch',
    'taxId',
    'currencyCode',
  ];
  if (editor) {
    const errorFields = validateFields.reduce((acc, cur) => {
      if (isNil(lineData[cur])) {
        acc.push(
          cur === 'benchmarkPriceType'
            ? intl.get('sodr.workspace.model.common.benchmarkPriceType').d('基准价')
            : lineRecord.dataSet.getField(cur).get('label')
        );
      }
      return acc;
    }, []);
    if (!isEmpty(errorFields)) {
      const fields = errorFields.join(',');
      return notification.error({
        description: intl
          .get('sodr.workspace.model.costInformation.beforModalErrorMessage', {
            fields,
          })
          .d(`费用信息查看失败，失败原因为存在订单行[${fields}]字段为空，请检查并维护`),
      });
    }
  }
  const headerDs = new DataSet({
    autoQuery: true,
    autoCreate: true,
    fields: [
      {
        name: 'itemCode',
        label: intl.get('sodr.workspace.model.costInformation.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sodr.workspace.model.costInformation.itemName').d('物料名称'),
      },
      {
        name: 'quantity',
        type: 'number',
        label: intl.get('sodr.workspace.model.costInformation.quantity').d('订单行数量'),
      },
      {
        name: 'currencyCode',
        label: intl.get('sodr.workspace.model.costInformation.currencyCode').d('订单行币种'),
      },
      {
        name: 'taxIncludedLineAmount',
        type: 'currency',
        precision: financialPrecision,
        label: intl
          .get('sodr.workspace.model.costInformation.taxIncludedLineAmount')
          .d('订单行金额(含税)'),
      },
      {
        name: 'lineAmount',
        type: 'currency',
        precision: financialPrecision,
        label: intl.get('sodr.workspace.model.costInformation.lineAmount').d('订单行金额(不含税)'),
      },
      {
        name: 'expenseTaxIncludedLineAmount',
        type: 'currency',
        label: intl
          .get('sodr.workspace.model.costInformation.expenseTaxIncludedLineAmount')
          .d('费用金额(含税)'),
        dynamicProps: {
          precision: ({ record }) => record.get('amountRecision'),
        },
      },
      {
        name: 'expenseLineAmount',
        type: 'currency',
        label: intl
          .get('sodr.workspace.model.costInformation.expenseLineAmount')
          .d('费用金额(不含税)'),
        dynamicProps: {
          precision: ({ record }) => record.get('amountRecision'),
        },
      },
      {
        name: 'expenseDomesticTaxIncludedLineAmount',
        type: 'currency',
        label: intl
          .get('sodr.workspace.model.costInformation.expenseDomesticTaxIncludedLineAmount')
          .d('费用本币金额(含税)'),
        dynamicProps: {
          precision: ({ record }) => record.get('domesticRecision'),
        },
      },
      {
        name: 'expenseDomesticLineAmount',
        type: 'currency',
        label: intl
          .get('sodr.workspace.model.costInformation.expenseDomesticLineAmount')
          .d('费用本币金额(不含税)'),
        dynamicProps: {
          precision: ({ record }) => record.get('domesticRecision'),
        },
      },
    ],
    transport: {
      read({ data }) {
        return {
          url: `${SRM_SPUC}/v1/${tenantId}/po-item-expense-line/query-expense-header-detail`,
          method: 'post',
          data: { ...data, poLineId, poHeaderId, poLine: lineData, editFlag: Number(!viewOnly) },
        };
      },
    },
  });
  const columns = [
    {
      name: 'expenseLineNum',
      width: 60,
    },
    {
      name: 'expenseCode',
      width: 130,
      editor,
    },
    {
      name: 'expenseName',
    },
    {
      name: 'pricingType',
      width: 130,
      editor,
    },
    {
      name: 'numericalValue',
      width: 120,
      editor,
    },
    {
      name: 'valueCalculation',
      width: 120,
    },
    {
      name: 'expenseCurrency',
      width: 140,
      editor,
    },
    {
      name: 'taxId',
      editor,
    },
    {
      name: 'supplier',
      width: 215,
      editor,
    },
    {
      name: 'lineAmount',
      width: 145,
    },
    {
      name: 'taxIncludedLineAmount',
      width: 145,
    },
    {
      name: 'currencyCode',
    },
    viewOnly && {
      name: 'domesticLineAmount',
      width: 145,
    },
    viewOnly && {
      name: 'domesticTaxIncludedLineAmount',
      width: 145,
    },
    viewOnly && {
      name: 'domesticCurrencyCode',
      width: 145,
    },
  ];
  // 计算费用值参数缺失报错
  const computeValueCalculationError = (fieldName) => {
    if (fieldName) {
      const field = headerDs.getField(fieldName);
      const label = field.get('label');
      notification.error({
        description: intl
          .get('sodr.workspace.model.costInformation.computeValueCalculationError', { label })
          .d(`获取不到计算参数信息【${label}】，请检查`),
      });
    }
  };
  const lineDs = new DataSet({
    autoQuery: true,
    cacheSelection: true,
    dataToJSON: 'all',
    pageSize: 20,
    primaryKey: 'poExpenseLineId',
    selection: viewOnly ? false : 'multiple',
    autoQueryAfterSubmit: true,
    fields: [
      {
        name: 'expenseLineNum',
        label: intl.get('sodr.workspace.model.costInformation.expenseLineNum').d('行号'),
      },
      {
        name: 'expenseCode',
        type: 'object',
        lovCode: 'SODR.PO_EXPENSE_TYPE',
        required: true,
        label: intl.get('sodr.workspace.model.costInformation.expenseCode').d('费用类型编码'),
        transformResponse: (value) => value && { value },
        transformRequest: (value) => value?.value,
      },
      {
        name: 'expenseName',
        label: intl.get('sodr.workspace.model.costInformation.expenseName').d('费用类型名称'),
      },
      {
        name: 'pricingType',
        required: true,
        lookupCode: 'SODR.PO_EXPENSE_AMOUNT_PRICING_TYPE',
        label: intl.get('sodr.workspace.model.costInformation.pricingType').d('计价方式'),
      },
      {
        name: 'numericalValue',
        type: 'number',
        required: true,
        label: intl.get('sodr.workspace.model.costInformation.numericalValue').d('数值'),
        validator: (value) => {
          if (math.lte(value, 0)) {
            return intl
              .get('sodr.workspace.model.costInformation.validateNumericalValue')
              .d('数值必须大于0');
          }
        },
        dynamicProps: {
          precision({ record }) {
            return record.get('pricingType') === 'LINE_PERCENTAGE_AMOUNT'
              ? 6
              : record.get('expenseRecision');
          },
          // disabled({ record }) {
          //   return !record.get('pricingType');
          // },
        },
      },
      {
        name: 'valueCalculation',
        type: 'currency',
        help: intl
          .get('sodr.workspace.model.costInformation.valueCalculationHelp')
          .d(
            '费用值根据计价方式不同，计算的规则不同\n1）计价方式=【固定金额】，则费用值=【数值】\n2）计价方式=【订单行金额%】，则费用值=【订单行基准价行金额】*数值/100\n3）计价方式=【金额/数量】，则费用值=【订单行数量】*数值'
          ),
        label: intl.get('sodr.workspace.model.costInformation.valueCalculation').d('费用值'),
        dynamicProps: {
          precision({ record }) {
            return record.get('expenseRecision');
          },
        },
      },
      {
        name: 'expenseCurrency',
        type: 'object',
        required: true,
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        label: intl.get('sodr.workspace.model.costInformation.expenseCurrency').d('费用币种'),
        dynamicProps: {
          disabled({ record }) {
            return record.get('pricingType') === 'LINE_PERCENTAGE_AMOUNT';
          },
        },
        transformResponse: (value, object) => {
          return (
            value && {
              currencyCode: value,
              financialPrecision: object.expenseRecision,
            }
          );
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'expenseRecision',
        bind: 'expenseCurrency.financialPrecision',
      },
      {
        name: 'taxId',
        type: 'object',
        lovCode: 'SMDM.TAX',
        lovPara: {
          enabledFlag: 1,
          tenantId,
        },
        required: true,
        label: intl.get('sodr.workspace.model.costInformation.taxId').d('税率'),
        transformRequest: (value) => value?.taxId,
        transformResponse: (value, object) => value && { taxId: value, taxRate: object.taxRate },
      },
      {
        name: 'taxRate',
        bind: 'taxId.taxRate',
      },
      {
        name: 'supplier',
        type: 'object',
        lovCode: 'SODR.AUTH_SUPPLIER_LIFE_CYCLE',
        ignore: 'always',
        required: true,
        label: intl.get('sodr.workspace.model.costInformation.supplier').d('供应商'),
        lovPara: {
          userId,
          tenantId,
          companyId: organizationInfoDs?.current.get('companyId')?.companyId,
          organizationId: getUserOrganizationId(),
          pageSource: 'SODR',
        },
        transformResponse: (value, object) =>
          (object.supplierId || object.supplierCompanyId) && {
            supplierId: object.supplierId,
            supplierNum: object.supplierCode,
            supplierName: object.supplierName,
            supplierCompanyId: object.supplierCompanyId,
            supplierCompanyNum: object.supplierCompanyCode,
            supplierCompanyName: object.supplierCompanyName,
            supplierTenantId: object.supplierTenantId,
            displaySupplierName: object.supplierName || object.supplierCompanyName,
          },
      },
      {
        name: 'supplierId',
        bind: 'supplier.supplierId',
      },
      {
        name: 'supplierCode',
        bind: 'supplier.supplierNum',
      },
      {
        name: 'supplierName',
        bind: 'supplier.supplierName',
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplier.supplierCompanyId',
      },
      {
        name: 'supplierCompanyCode',
        bind: 'supplier.supplierCompanyNum',
      },
      {
        name: 'supplierCompanyName',
        bind: 'supplier.supplierCompanyName',
      },
      {
        name: 'supplierTenantId',
        bind: 'supplier.supplierTenantId',
      },
      {
        name: 'lineAmount',
        type: 'currency',
        label: intl.get('sodr.workspace.model.costInformation.lineAmounts').d('费用行金额(不含税)'),
        dynamicProps: {
          precision({ record }) {
            return record.get('amountRecision');
          },
        },
      },
      {
        name: 'taxIncludedLineAmount',
        type: 'currency',
        label: intl
          .get('sodr.workspace.model.costInformation.taxIncludedLineAmounts')
          .d('费用行金额(含税)'),
        dynamicProps: {
          precision({ record }) {
            return record.get('amountRecision');
          },
        },
      },
      {
        name: 'currencyCode',
        label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
        defaultValue: currencyCode,
      },
      {
        name: 'domesticLineAmount',
        type: 'currency',
        label: intl
          .get('sodr.workspace.model.costInformation.domesticLineAmount')
          .d('费用行本币金额(不含税)'),
        dynamicProps: {
          precision({ record }) {
            return record.get('domesticRecision');
          },
        },
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        type: 'currency',
        label: intl
          .get('sodr.workspace.model.costInformation.domesticTaxIncludedLineAmount')
          .d('费用行本币金额(含税)'),
        dynamicProps: {
          precision({ record }) {
            return record.get('domesticRecision');
          },
        },
      },
      {
        name: 'domesticCurrencyCode',
        label: intl.get('sodr.workspace.model.common.domesticCurrencyCode').d('本币币种'),
      },
      {
        name: 'amountRecision',
        defaultValue: financialPrecision,
      },
      {
        name: 'benchmarkPriceType',
        defaultValue: benchmarkPriceType,
      },
      {
        name: 'poHeaderId',
        defaultValue: poHeaderId,
      },
      {
        name: 'poLineId',
        defaultValue: poLineId,
      },
    ],
    events: {
      create: ({ record }) => {
        record.init({
          taxId: { taxId, taxRate, taxCode },
          supplier: organizationInfoDs?.current.get('supplierLov'),
        });
      },
      update: ({ name, value, record }) => {
        const { pricingType, benchmarkPriceType: currentBenchmarkPriceType } = record.get([
          'pricingType',
          'benchmarkPriceType',
        ]);
        if (name === 'expenseCode') {
          const { meaning, parentValue } = value || {};
          record.set({ expenseName: meaning, pricingType: parentValue });
        }
        if (name === 'pricingType') {
          record.set({
            numericalValue: null,
            valueCalculation: null,
            lineAmount: null,
            // taxId: null,
            taxIncludedLineAmount: null,
            expenseCurrency: { currencyCode, financialPrecision },
          });
        }
        if (name === 'numericalValue') {
          if (pricingType === 'FIXED_AMOUNT') {
            record.set({ valueCalculation: value });
          } else if (pricingType === 'LINE_PERCENTAGE_AMOUNT') {
            const amountField =
              currentBenchmarkPriceType === 'NET_PRICE' ? 'lineAmount' : 'taxIncludedLineAmount';
            const amount = headerDs.current?.get(amountField);
            if (isFinite(amount)) {
              record.set({
                valueCalculation: math.div(math.multipliedBy(amount, value), 100),
              });
            } else {
              computeValueCalculationError(amountField);
            }
          } else if (pricingType === 'UNIT_AMOUNT') {
            if (isFinite(quantity)) {
              record.set({ valueCalculation: math.multipliedBy(quantity, value) });
            } else {
              computeValueCalculationError('quantity');
            }
          }
          record.set({ lineAmount: null, taxIncludedLineAmount: null });
        }
        if (name === 'taxId') {
          record.set({ lineAmount: null, taxIncludedLineAmount: null });
        }
      },
    },
    transport: {
      read({ data, params }) {
        return {
          url: `${SRM_SPUC}/v1/${tenantId}/po-item-expense-line/query-expense-line-detail`,
          method: 'post',
          data: {
            ...data,
            editFlag: Number(!viewOnly),
            quantity,
            poLineId,
            poHeaderId,
            poLine: lineData,
          },
          params: { ...params, customizeUnitCode: lineCode },
        };
      },
      submit({ data, params }) {
        return {
          url: `${SRM_SPUC}/v1/${tenantId}/po-item-expense-line/save`,
          method: 'post',
          data: data.map((i) => ({ ...i, poLine: lineData })),
          params: { ...params, customizeUnitCode: lineCode },
        };
      },
      destroy() {
        return {
          url: `${SRM_SPUC}/v1/${tenantId}/po-item-expense-line/delete`,
          method: 'delete',
        };
      },
    },
  });
  const Children = compose(
    withCustomize({ unitCode: [lineCode] }),
    observer
  )(({ customizeTable }) => {
    return (
      <Fragment>
        <Spin dataSet={headerDs}>
          <Form dataSet={headerDs} columns={2} labelLayout="float" style={{ marginBottom: 16 }}>
            {viewOnly ? (
              <Fragment>
                <Output name="itemCode" />
                <Output name="itemName" />
                <Output name="quantity" />
                <Output name="currencyCode" />
                <Output name="taxIncludedLineAmount" />
                <Output name="lineAmount" />
                <Output name="expenseTaxIncludedLineAmount" />
                <Output name="expenseLineAmount" />
                {/* 暂时不展示后续补充个性化单元再使用个性化默认隐藏 */}
                {/* <Output name="expenseDomesticTaxIncludedLineAmount" />
                <Output name="expenseDomesticLineAmount" /> */}
              </Fragment>
            ) : (
              <Fragment>
                <TextField name="itemCode" disabled />
                <TextField name="itemName" disabled />
                <NumberField name="quantity" disabled />
                <TextField name="currencyCode" disabled />
                <Currency name="taxIncludedLineAmount" disabled />
                <Currency name="lineAmount" disabled />
                <Currency name="expenseTaxIncludedLineAmount" disabled />
                <Currency name="expenseLineAmount" disabled />
              </Fragment>
            )}
          </Form>
        </Spin>
        {customizeTable(
          { code: lineCode },
          <Table
            dataSet={lineDs}
            columns={columns}
            style={{ maxHeight: 'calc(100% - 290px)' }}
            buttons={
              !viewOnly && [
                'add',
                <Tooltip
                  title={intl
                    .get('sodr.workspace.view.button.costInformationSaveTooltip')
                    .d('请维护费用行信息')}
                >
                  <Button
                    type="c7n-pro"
                    funcType="flat"
                    icon="save"
                    disabled={!lineDs.length}
                    onClick={async () => {
                      const res = await lineDs.submit();
                      if (res && res.success) {
                        lineDs.clearCachedRecords();
                        lineDs.unSelectAll();
                        lineDs.query();
                        headerDs.query();
                      }
                    }}
                  >
                    {intl.get('hzero.common.btn.save').d('保存')}
                  </Button>
                </Tooltip>,
                <Tooltip
                  title={intl.get('sodr.workspace.view.button.deleteTooltip').d('请勾选行信息')}
                >
                  <Button
                    type="c7n-pro"
                    funcType="flat"
                    icon="delete"
                    disabled={isEmpty(lineDs.selected)}
                    onClick={async () => {
                      const needQuery = lineDs.selected.find((i) => i.status !== 'add');
                      const res = await lineDs.delete(lineDs.selected);
                      if (res && res.success) {
                        if (needQuery) {
                          lineDs.clearCachedRecords();
                          lineDs.unSelectAll();
                          lineDs.query();
                          headerDs.query();
                        }
                      }
                    }}
                  >
                    {intl.get('hzero.common.button.batchDelete').d('批量删除')}
                  </Button>
                </Tooltip>,
              ]
            }
            editMode={viewOnly ? 'inline' : 'cell'}
          />
        )}
      </Fragment>
    );
  });
  Modal.open({
    drawer: true,
    style: { width: 742 },
    title: intl
      .get('sodr.workspace.model.costInformation.title', { displayPoNum, displayLineNum })
      .d(`${displayPoNum}-${displayLineNum}的费用明细`),
    children: <Children />,
    footer: (okBtn, cancelBtn) => cancelBtn,
    cancelText: intl.get('hzero.common.btn.close').d('关闭'),
    cancelProps: { color: 'primary' },
  });
}
/**
 * 批量新增行
 * @param {*} basicInfoDs 基础信息dataSet
 * @param {*} poHeaderDetailDTO 获取最新头信息
 * @param {*} validateNewLineRequiredFields 一单到底校验头字段是否完整
 * @param {*} handleCreate 单行新增方法
 * @returns
 */
export function handleBatchAdd(
  { basicInfoDs, ds },
  { poHeaderDetailDTO, validateNewLineRequiredFields, handleCreate, customizeForm, code }
) {
  if (validateNewLineRequiredFields && !validateNewLineRequiredFields()) return false;
  return new Promise((resolve) => {
    const {
      benchmarkPriceType,
      defaultPrecision,
      supplierCompanyId,
      ouId,
      ouCode,
      companyId,
      companyCode,
      orderTypeCode,
    } = poHeaderDetailDTO;
    const formDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'invOrganizationId',
          required: true,
          label: intl.get('sodr.workspace.model.common.invOrganizationId').d('库存组织'),
          type: 'object',
          lovCode: 'SPUC.SMDM.INV_ORG',
          transformRequest: (value) => value?.organizationId,
          lovPara: {
            enabledFlag: 1,
            tenantId: getCurrentOrganizationId(),
            ouId,
          },
          defaultValue: {
            organizationId: ds.getState('defaultOrgId'),
            organizationName: ds.getState('defaultOrgName'),
          },
        },
        {
          name: 'invOrganizationName',
          bind: 'invOrganizationId.organizationName',
        },
        {
          name: 'categoryId',
          required: true,
          label: intl.get('sodr.workspace.model.common.categoryId').d('物料分类'),
          type: 'object',
          lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
          optionsProps: {
            paging: 'server',
            record: {
              dynamicProps: {
                selectable: (record) => record.get('isCheck') !== false,
              },
            },
          },
          transformRequest: (value) => {
            return value?.categoryId;
          },
          lovPara: {
            tenantId: getCurrentOrganizationId(),
            enabledFlag: 1,
            businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
          },
        },
        {
          name: 'categoryName',
          bind: 'categoryId.categoryName',
        },
        {
          name: 'itemId',
          label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
          type: 'object',
          lovCode: 'SPUC.ITEM_PRICE_CODE',
          required: true,
          multiple: true,
          textField: 'itemCode',
          dynamicProps: {
            disabled: ({ record }) => !record.get('invOrganizationId')?.organizationId,
            lovPara: ({ record }) => {
              return {
                organizationId: getUserOrganizationId(),
                tenantId: getCurrentOrganizationId(),
                supplierCompanyId,
                companyId,
                ouId,
                poLineCategoryId: record.get('categoryId')?.categoryId,
                invOrganizationId: record.get('invOrganizationId')?.organizationId,
                ouCode,
                companyCode,
                orderTypeCode,
              };
            },
          },
        },
        {
          name: 'quantity',
          label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
          type: 'number',
          max: MAX_QUAN_NUMBER,
          min: 0,
          required: true,
        },
        // {
        //   name: 'secondaryQuantity',
        //   label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
        //   type: 'number',
        //   max: MAX_QUAN_NUMBER,
        //   min: 0,
        //   required: basicInfoDs.getState('doubleUnitEnabled'),
        // },
        {
          name: 'needByDate',
          label: intl.get('sodr.workspace.model.common.needByDate').d('需求日期'),
          type: 'date',
          required: true,
        },
        {
          name: 'unitPrice',
          label: intl.get(`sodr.common.model.common.unitPrices`).d('单价(不含税)'),
          type: 'number',
          min: 0,
          max: MAX_QUAN_NUMBER,
          disabled: benchmarkPriceType === 'TAX_INCLUDED_PRICE',
          precision: getPrecision(defaultPrecision),
        },
        {
          name: 'enteredTaxIncludedPrice',
          label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrices').d('单价(含税)'),
          type: 'number',
          min: 0,
          max: MAX_QUAN_NUMBER,
          disabled: benchmarkPriceType !== 'TAX_INCLUDED_PRICE',
          precision: getPrecision(defaultPrecision),
        },
        {
          name: 'taxId',
          label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
          type: 'object',
          lovCode: 'SMDM.TAX',
          lovPara: {
            enabledFlag: 1,
            tenantId: getCurrentOrganizationId(),
          },
          transformRequest: (value) => {
            return value?.taxId;
          },
        },
        {
          name: 'taxRate',
          bind: 'taxId.taxRate',
        },
        {
          name: 'taxCode',
          bind: 'taxId.taxCode',
        },
        {
          name: 'unitPriceBatch',
          label: intl.get('sodr.workspace.model.common.unitPriceBatch').d('每'),
          type: 'number',
          min: 0,
          max: MAX_QUAN_NUMBER,
        },
      ],
      events: {
        update({ record, name }) {
          if (name === 'invOrganizationId') {
            record.set({ itemId: null });
          }
          if (name === 'categoryId') {
            record.set({ itemId: null });
          }
        },
      },
    });
    Modal.open({
      title: intl.get('sodr.workspace.view.button.batchAdd').d('批量新增'),
      drawer: true,
      style: { width: 380 },
      children: customizeForm(
        { code },
        <Form dataSet={formDs} columns={1} labelLayout="float">
          <Lov name="invOrganizationId" />
          <Lov name="categoryId" />
          <Lov name="itemId" />
          <NumberField name="quantity" />
          <DatePicker name="needByDate" />
          <NumberField name="unitPrice" />
          <NumberField name="enteredTaxIncludedPrice" />
          <Lov name="taxId" />
          <NumberField name="unitPriceBatch" />
        </Form>
      ),
      afterClose: () => resolve(false),
      onOk: async () => {
        const validateRes = await formDs.validate();
        if (!validateRes) return false;
        const { itemId: itemIds, quantity, ...others } = omitBy(formDs.current.toData(), isNil);
        const doubleUnitEnabled = basicInfoDs.getState('doubleUnitEnabled');
        const data = itemIds.map(
          ({
            itemId,
            itemCode,
            itemName,
            categoryId,
            categoryName,
            receiveToleranceQuantity,
            receiveToleranceQuantityType,
            commonName,
            model,
            specifications,
            brand,
          }) => {
            const itemFields = {
              itemId,
              itemCode,
              itemName,
              categoryId,
              categoryName,
              receiveToleranceQuantity,
              receiveToleranceQuantityType,
              commonName,
              model,
              specifications,
              brand,
              ...others, // 物料分类以手工选择的优先级更高
            };
            if (doubleUnitEnabled) {
              return {
                ...itemFields,
                secondaryQuantity: quantity,
                quantity: undefined,
              };
            }
            return {
              ...itemFields,
              quantity,
            };
          }
        );
        const res = getResponse(
          await batchAddOrderLine({ poHeaderDetailDTO, poLineDetailDTOs: data })
        );
        if (res && isArray(res)) {
          if (isFunction(handleCreate)) {
            res.forEach((i) => {
              handleCreate(i, true);
            });
            resolve(!!res);
          }
        }
        return !!res;
      },
    });
  });
}

/**
 * 资金计划弹窗
 * @param {String} type 操作类型 maintenance(维护页面付款条款详情) | change(变更页面付款条款详情) | maintenance-submit(新建提交) | change-submit(变更提交) | line-cancel-submit(按行取消) | feedback(反馈审核同意) | readOnly(其他只读页面的付款条款详情)
 * @param {Object} options body 订单头行数据(按行取消为取消的行数据) | ds 订单付款条款信息dataSet(目前只有变更页面需要，缓存资金计划弹窗数据) | fetchDetailHeader 维护页面保存数据的需重新查询订单方法 | setChangeFlag 仅变更页面设置数据变更标识
 * @returns {Promise} true | false
 */
export async function handleOpenFundTermIdDetail(
  type = 'readOnly',
  { body, ds, fetchDetailHeader, setChangeFlag }
) {
  const isLineCancel = type === 'line-cancel-submit';
  const operate = ['readOnly', 'line-cancel-submit', 'feedback'].includes(type) ? 'view' : 'edit'; // 弹窗模式 只读｜编辑
  const isMaintenance = type === 'maintenance'; // 维护页面
  const isChange = type === 'change';
  const isFeedback = type === 'feedback';
  const sourceChange = ['change', 'change-submit'].includes(type);
  const isSubmit = type.includes('submit'); // 是否是提交操作 新建提交｜变更提交｜按行取消
  const getLatestConfig = ['maintenance', 'maintenance-submit'].includes(type); // 是否需要获取最新配置
  const { poHeaderDetailDTO: oldPoHeaderDetailDTO, poLineDetailDTOs: oldPoLineDetailDTOs } = body;
  const { fundTermEditFlag, fundTermDimension, oldTermHideFlag } = oldPoHeaderDetailDTO || {};
  const simulateData = {
    ...oldPoHeaderDetailDTO,
    saveFlag: 1,
    poLineExpVOList: oldPoLineDetailDTOs,
  };
  const allRes = await Promise.all([
    getLatestConfig // 维护页面获取业务规则，其余页面直接拿订单上的管控维度
      ? fetchFundPlanConfig(oldPoHeaderDetailDTO)
      : Promise.resolve(
          isLineCancel
            ? // 单行取消 管控维度在外面判断
              { enableFlag: '1', dimension: body.fundTermDimension }
            : { enableFlag: String(fundTermEditFlag), dimension: fundTermDimension }
        ),
    getLatestConfig
      ? fetchEnableFundConfig()
      : isLineCancel // 单行取消 管控维度在外面判断
      ? { termEnableFlag: 1 }
      : { termEnableFlag: oldTermHideFlag },
  ]);
  const [fundPlanRes, enableFundRes] = allRes;
  if (!getResponse(fundPlanRes) || !getResponse(enableFundRes)) {
    return false;
  }
  const { enableFlag, dimension } = fundPlanRes;
  const { termEnableFlag } = enableFundRes;
  const isOrderDimension = dimension === 'ORDER';
  if (
    (isSubmit || isFeedback || isLineCancel) &&
    !(termEnableFlag && enableFlag === '1' && dimension)
  ) {
    return true;
  }
  if (isMaintenance && enableFlag === '0') {
    notification.error({
      description: intl
        .get('sodr.workspace.view.message.fundTermIdDetailPlanConfig')
        .d('当前订单不满足启用付款管控的条件，请先保存订单更新页面数据'),
    });
    return false;
  }
  const poHeaderDetailDTO = getResponse(
    await (sourceChange
      ? fundPlanChangelSimulate(simulateData)
      : isLineCancel
      ? fundPlanCancelSimulate(body)
      : operate === 'view'
      ? Promise.resolve({
          ...oldPoHeaderDetailDTO,
          poLineExpVOList: oldPoLineDetailDTOs,
        })
      : orderAmountCalculation(simulateData))
  );
  if (!poHeaderDetailDTO) return false;
  const { poLineExpVOList = [] } = poHeaderDetailDTO;
  const {
    taxIncludeAmount,
    displayPoNum,
    poHeaderId,
    ouId,
    supplierId,
    supplierCompanyId,
    agentId,
    fundTermId,
    companyId,
    currencyCode,
    companyCode,
    supplierCompanyNum,
    poNum,
    createdBy,
  } = poHeaderDetailDTO;
  const fundTermIdDetailData = ds && ds.getState('fundTermIdDetailData');
  const mapDTOListMethod = loadTrackingMethod({
    module: 'srm-front-sodr', // 注册埋点时的模块名
    code: 'SODR.UTILS.HANDLE_OPEN_FUND_TERM_ID_DETAIL.MAPDTOLIST', // 注册埋点时的编码
  });
  const documentTermHeaderDTOList = poLineExpVOList
    .sort((a, b) => Number(a.lineNum) - Number(b.lineNum))
    .map((i) => {
      const { taxIncludedLineAmount, poLineId, lineNum, displayLineNum } = i;
      return {
        deleteFlag: Number((isOrderDimension ? taxIncludeAmount : taxIncludedLineAmount) <= 0),
        documentId: poHeaderId,
        documentNum: displayPoNum,
        termHeaderId: fundTermId,
        dtAmount: taxIncludeAmount,
        companyNum: companyCode,
        supplierId,
        supplierCompanyId,
        supplierCompanyNum,
        ouId,
        agentId,
        companyId,
        currencyCode,
        dtLineAmount: taxIncludedLineAmount,
        sourceDocId: poHeaderId,
        sourceDocLineId: poLineId,
        sourceDocNum: poNum,
        sourceDocLineNum: lineNum,
        poCreatedBy: createdBy,
        controlDimension: dimension,
        sourceDocDisplayLineNum: displayLineNum,
        ...mapDTOListMethod?.({ headerData: poHeaderDetailDTO, data: i, isOrderDimension }),
      };
    });
  const data = { controlDimension: dimension, documentTermHeaderDTOList };
  if (isSubmit) {
    if (!(fundTermId && enableFlag === '1' && termEnableFlag)) return true;
    const termHeadersValidateRes = getResponse(
      await termHeadersValidate(
        type === 'change-submit' && fundTermIdDetailData
          ? {
              ...data,
              inputConsistencyFlag: 1,
              newDocumentTermHeaderDTOList: fundTermIdDetailData.documentTermHeaderDTOList,
            }
          : data
      )
    );
    if (termHeadersValidateRes) {
      const { responseStatus, responseMessage, consistencyFlag } = termHeadersValidateRes;
      if (responseStatus === 'ERROR') {
        notification.error({ description: responseMessage });
        return false;
      } else if (consistencyFlag === 1) {
        return true;
      }
    } else {
      return false;
    }
  } else if (
    // 非提交场景下前端校验订单有效金额
    documentTermHeaderDTOList.every((i) => i.deleteFlag)
  ) {
    notification.error({
      description: isOrderDimension
        ? intl
            .get('sodr.workspace.view.message.fundTermCheckAmount')
            .d('当前订单金额小于等于0，不符合启用付款管控的条件，请检查数据')
        : intl
            .get('sodr.workspace.view.message.fundTermCheckLineAmount')
            .d('当前订单行金额均小于等于0，不符合启用付款管控的条件，请检查数据'),
    });
    return false;
  }
  //  else {
  //   const validateDataRes = getResponse(await termHeadersValidateData(data));
  //   if (!validateDataRes || validateDataRes.responseStatus === 'ERROR') {
  //     const { responseStatus, responseMessage } = validateDataRes || {};
  //     if (responseStatus === 'ERROR') {
  //       notification.error({ description: responseMessage });
  //     }
  //     return false;
  //   }
  // }
  let onSave = (e) => e;
  let fundTermIdDetailDs;
  const sourceDocHeaderDs = observable.box({});
  let onRefresh;
  const modalRes = await new Promise((resolve) => {
    const onPartChildRef = ({ handleSave = (e) => e, handleFetchDs, handleRefresh }) => {
      onSave = handleSave;
      fundTermIdDetailDs = isFunction(handleFetchDs) ? handleFetchDs() : {};
      sourceDocHeaderDs.set(fundTermIdDetailDs.sourceDocHeaderDs);
      onRefresh = handleRefresh;
    };
    Modal.open({
      title:
        operate === 'edit'
          ? intl.get('sodr.workspace.view.title.editFundTermIdDetail').d('来源单据条款编辑')
          : intl.get('sodr.workspace.view.title.viewFundTermIdDetail').d('来源单据条款查看'),
      drawer: true,
      children: (
        <EmbedPage
          sourcePageData={{
            dimensionType: dimension,
            operate,
            termId: fundTermId,
            lineData: poLineExpVOList,
            headerData: poHeaderDetailDTO,
            documentTermHeaderDTOList,
          }}
          sourceCacheData={sourceChange && ds.getState('fundTermIdDetailDs')}
          onPartChildRef={onPartChildRef}
          contentStyleType="fullfit"
          href="/pub/sbsm/source-document/detail/:id"
        />
      ),
      style: { width: 1090 },
      onOk: async () => {
        if (isFeedback || isLineCancel) {
          resolve(true);
          return true;
        }
        const res = await (isFunction(onSave) && onSave());
        if (res) {
          if (isSubmit) {
            resolve({ fundPageParam: JSON.stringify(res) });
            return true;
          } else if (isChange) {
            if (
              fundTermIdDetailDs.sourceDocHeaderDs?.dirty ||
              fundTermIdDetailDs.sourceDocListDs?.dirty
            ) {
              setChangeFlag();
            }
            ds.setState({ fundTermIdDetailDs, fundTermIdDetailData: res });
            const { termHeaderId, termName } = res.documentTermHeaderDTOList?.[0] || {};
            // 整单场景下如果修改了付款条款需要回写到订单上
            if (isOrderDimension && termHeaderId !== fundTermId) {
              ds.current.set({ fundTermId: { termHeaderId, termName } });
            }
          } else {
            const saveRes = getResponse(
              await fundPlanSave({
                poHeaderDetailDTO,
                poLineDetailDTOs: poLineExpVOList,
                fundPageParam: JSON.stringify(res),
              })
            );
            if (!saveRes) return false;
            if (isFunction(fetchDetailHeader)) {
              fetchDetailHeader(true);
            }
          }
          notification.success();
          resolve(true);
          return true;
        }
        return false;
      },
      onCancel: () => resolve(false),
      okText:
        isFeedback || isLineCancel
          ? intl.get('hzero.common.btn.ok').d('确认')
          : isSubmit
          ? intl.get('sodr.workspace.view.button.submit').d('提交')
          : intl.get('sodr.workspace.view.button.saveAndClose').d('保存并关闭'),
      footer: (okBtn, cancelBtn) => {
        const Footer = observer(() => {
          const docHeaderDs = sourceDocHeaderDs.get();
          const loading = !docHeaderDs || docHeaderDs.status !== 'ready';
          if (isMaintenance || isChange) {
            return [
              cloneElement(okBtn, { loading }),
              <Button
                type="c7n-pro"
                loading={loading}
                onClick={async () => {
                  const res = await onSave();
                  if (res) {
                    if (isChange) {
                      ds.setState({ fundTermIdDetailDs, fundTermIdDetailData: res });
                      const { termHeaderId, termName } = res.documentTermHeaderDTOList?.[0] || {};
                      // 整单场景下如果修改了付款条款需要回写到订单上
                      if (isOrderDimension && termHeaderId !== fundTermId) {
                        ds.current.set({ fundTermId: { termHeaderId, termName } });
                      }
                    } else {
                      const saveRes = getResponse(
                        await fundPlanSave({
                          poHeaderDetailDTO,
                          poLineDetailDTOs: poLineExpVOList,
                          fundPageParam: JSON.stringify(res),
                        })
                      );
                      if (!saveRes) return;
                      onRefresh();
                      if (isFunction(fetchDetailHeader)) {
                        fetchDetailHeader(true);
                      }
                    }
                    notification.success();
                  }
                }}
              >
                {intl.get('sodr.workspace.view.button.onlySave').d('仅保存')}
              </Button>,
              cancelBtn,
            ];
          } else if (isFeedback || isLineCancel) {
            return [okBtn, cancelBtn];
          } else if (operate === 'view') {
            return cancelBtn;
          } else return [okBtn, cancelBtn];
        });
        return <Footer />;
      },
      cancelText:
        operate === 'edit' || isFeedback || isLineCancel
          ? intl.get('hzero.common.btn.cancel').d('取消')
          : intl.get('hzero.common.btn.close').d('关闭'),
      cancelProps: {
        color: operate === 'edit' || isFeedback || isLineCancel ? 'default' : 'primary',
      },
    });
  });
  return modalRes;
}

/**
 * 生成当前新增行的行号
 * @param {*} basicInfoDs 订单基础信息ds
 * @param {*} detailInfoDs 订单明细信息ds
 * @param {*} record 变更引用单据新增行场景下过滤后端返回的行号
 * @returns {Number} lineNum 行号
 */
export function getMaxPoLineNum(basicInfoDs, detailInfoDs, record) {
  const { maxPoLineNum, poHeaderId } = basicInfoDs?.current.get(['maxPoLineNum', 'poHeaderId']);
  // 没有poHeaderId只有一单到底场景
  if (!isNil(maxPoLineNum) || !poHeaderId) {
    const lineNum = Math.max(
      (maxPoLineNum || 0) + detailInfoDs.created.length,
      ...(record ? detailInfoDs.all.filter((i) => i.key !== record.key) : detailInfoDs.all).map(
        (i) => (i.get('lineNum') || 0) + 1
      )
    );
    return lineNum;
  }
}
