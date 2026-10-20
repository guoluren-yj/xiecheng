/* eslint-disable no-irregular-whitespace */
/* eslint-disable func-names */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-empty */
/* eslint-disable no-param-reassign */
import intl from 'utils/intl';
import {
  getCurrentLanguage,
  getResponse,
  getCurrentTenant,
  getCurrentOrganizationId,
  getUserOrganizationId,
} from 'utils/utils';
import { isNil, isArray } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import moment from 'moment';
import { Modal, Spin, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import {
  queryIsSlodConfig,
  queryDoubleUomConfig,
  queryNewTableEnable,
  queryAmountCalcConfig,
  fetchOperationFlag,
} from '@/services/sinvCommonService';
import React, { memo, useEffect, useState } from 'react';
import notification from 'utils/notification';
import { getCustomizeCode, getCustomizeBtnCodes } from './util';
import style from '../index.less';

const language = getCurrentLanguage().split('_').join('-');

const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();

/**
 * 全局加载
 * @param {*} child 加载元素
 * @param {*} maskStyle 蒙层样式
 * @returns Modal
 */
export function loadingModal(child = <Spin />, maskStyle = {}) {
  return Modal.open({
    className: style['loading-mark'],
    style: { top: '50%' }, // 距离中心位置 50%
    maskClosable: true, // 点击蒙层可关闭
    children: child,
    maskStyle: {
      background: 'rgba(0, 0, 0, 0.1)',
      ...maskStyle,
    },
  });
}

/**
 * 千分位显示
 */
export function onThousandChange(value) {
  return isNil(value) || isNil(Number(value))
    ? value
    : Number(value).toLocaleString(language, { maximumFractionDigits: 20 });
}

/**
 * 大数字展示
 * @param value(需要格式化的数字) string | number | BigNumber
 * @param decimalPlaces(最小精度——默认-1) string | number
 * @param args( maxDp:最大精度——默认20 ) object
 * @return string
 */
export function showBigNumber(value, decimalPlaces = -1, args = {}, isNum) {
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
  const num = Number(
    newValue.toLocaleString(language, {
      useGrouping: false,
      minimumFractionDigits: minDp,
      maximumFractionDigits: minDp > Number(maxDp) ? minDp : Number(maxDp),
    })
  );
  return isNum
    ? num
    : newValue.toLocaleString(language, {
        minimumFractionDigits: minDp,
        maximumFractionDigits: minDp > Number(maxDp) ? minDp : Number(maxDp),
      });
}

/**
 * 高阶函数: 功能是否使用C7N新组件
 * @param { String } key 配置表 例如我的送货单menuName === my_delivery
 * @param { Component } OldIndex 旧功能入口
 * @returns
 */

export function useC7NComponent(OldIndex, key) {
  const param = getCurrentTenant();
  return function (NewIndex) {
    return memo(function (props) {
      const [useNew, setUseNew] = useState();
      useEffect(() => {
        queryNewTableEnable(param).then((res) => {
          if (res && res?.length) {
            const MenuTypes = res.filter((i) => i.menuName === key);
            if (MenuTypes.length) {
              setUseNew(true);
            } else {
              setUseNew(false);
            }
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
 * 通用打印(目前只读取json格式报错信息)
 * @param {返回值} response
 * @param {回调函数} callback
 */
export function globalPrint(response, callback) {
  if (response && response.type && response.type.includes('application/json')) {
    const reader = new FileReader();
    reader.readAsText(response, 'utf-8');
    reader.onload = () => {
      const readers = reader.result;
      const parseObj = JSON?.parse(readers);
      notification.error({ message: parseObj.message });
    };
  } else if (response) {
    const file = new Blob([response], { type: 'application/pdf' });
    const fileURL = URL?.createObjectURL(file);
    const printWindow = window?.open(fileURL);
    if (printWindow) printWindow?.print();
    if (callback && typeof callback === 'function') callback();
  }
}

/**
 * Todo: 默认按数量接收、按金额接收(conversionUpdate({field='secondaryQuantity'}))、单位变更换算
 * 1.按数量接收:开启双单位,执行数量填写后，前端实时调用前端公共换算方法，得出”执行数量（基本）“展示, 物流模块未开启：执行数量填写后，无需调用公共方法，直接赋值给到”基本数量“
 * 2.按金额接收:对于有物料id的行，开启双单位的，调公共换算方法得出新执行数量值；未开启双单位的，新执行数量等于老执行数量；无物料id的行，无论是否开启双单位，新执行数量等于老执行数量
 * 3.单位变更换算: 前端需实时调用前端公共换算方法，传入新单位、新执行数量得出老执行数量值
 */

export function conversionUpdate({ record, value, type, field = 'quantity' }) {
  const randomNum = (Math.random() * 100000).toString().substr(0, 5);
  const {
    poSourcePlatform,
    subjectType,
    itemId,
    secondaryQuantity,
    quantity,
    secondaryUomId,
    uomId: doublePrimaryUomId,
    uomPrecision,
    secondaryUomRate = 1,
    secondaryUomPrecision,
  } = record.get([
    'secondaryUomPrecision',
    'uomPrecision',
    'secondaryUomId',
    'quantity',
    'secondaryQuantity',
    'uomId',
    'itemId',
    'poSourcePlatform',
    'subjectType',
    'secondaryUomRate', // 比例关系
  ]); // skuFlag 定制品标识  skuProportion 定制品比例
  const params = {
    businessKey: randomNum, // 主键
    itemId, // 物料Id
    doublePrimaryUomId, // 基本单位
    secondaryUomId: type === 'return' ? secondaryUomId : secondaryUomId?.uomId, // 辅助单位
    primaryQuantity: ['quantity', 'executeReverseQuantity'].includes(field) ? undefined : quantity, // 基本数量
    secondaryQuantity:
      field === 'secondaryQuantity' || type === 'amount'
        ? undefined
        : field === 'executeReverseQuantity'
        ? value
        : secondaryQuantity, // 辅助数量
  };

  // 订单来源系统为【电商商城、目录化商城】
  if (poSourcePlatform === 'CATALOGUE' || poSourcePlatform === 'E-COMMERCE') {
    if (subjectType === 'QUANTITY') {
      record.set({
        [field]: showBigNumber(
          math.multipliedBy(secondaryQuantity, secondaryUomRate),
          isNil(uomPrecision) ? 10 : uomPrecision,
          {
            maxDp: isNil(uomPrecision) ? 10 : uomPrecision,
          },
          true
        ),
      });
    }

    if (subjectType === 'AMOUNT') {
      if (record.getField('secondaryUomId').dirty) return false; // 单位变更 不计算
      record.set({
        [field]: showBigNumber(
          math.div(params.primaryQuantity, secondaryUomRate),
          isNil(uomPrecision) ? 10 : uomPrecision,
          {
            maxDp: isNil(uomPrecision) ? 10 : uomPrecision,
          },
          true
        ),
      });
    }
    return false;
  }

  if (type === 'amount' && subjectType === 'AMOUNT') {
    if (record.getField('secondaryUomId').dirty) return false; // 单位变更 不计算
    record.set({
      [field]: showBigNumber(
        math.div(params.primaryQuantity, secondaryUomRate),
        isNil(secondaryUomPrecision) ? 10 : secondaryUomPrecision,
        {
          maxDp: isNil(secondaryUomPrecision) ? 10 : secondaryUomPrecision,
        },
        true
      ),
    });
    return false;
  }

  // 订单来源系统不为【电商商城、目录化商城】
  // console.log(dataSet, dataSet.getState('doubleUnitEnabled'), itemId, value, '__________');
  if (itemId && value) {
    if (record.getField('secondaryUomId').dirty) return false; // 单位变更 不计算
    record.set({
      [field]: showBigNumber(
        math.multipliedBy(value, secondaryUomRate),
        isNil(uomPrecision) ? 10 : uomPrecision,
        {
          maxDp: isNil(uomPrecision) ? 10 : uomPrecision,
        },
        true
      ),
    });
  } else if (value) {
    record.set({ [field]: value });
  }
}

/**
 * 功能:查询开启双单位配置
 * @returns Comp
 */
export function useDoubleUomConfig() {
  return (Components) => {
    class Wrap extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          isSlodConfig: false, // 是否开启发货
          doubleUnitEnabled: 0, // 0上下游都不开启双单位，1上下游和物流都开启双单位，2仅物流开启
        };
        this.queryUomConfig = this.queryUomConfig.bind(this);
      }

      queryUomConfig(callback) {
        queryDoubleUomConfig().then((res) => {
          if (getResponse(res)) {
            const num = [1, 2].includes(res) ? res : 0;
            this.setState({ doubleUnitEnabled: num });
            if (callback) callback(num);
          }
        });
      }

      componentDidMount() {
        const { location = {} } = this.props;
        const { from = 'one', nodeConfigIndexAbc = 'K' } = location;
        const _arr = [
          ...getCustomizeBtnCodes({ nodeConfigIndexAbc }),
          ...getCustomizeCode({ tab: from, nodeConfigIndexAbc }),
        ];
        this.props.queryUnitConfig(undefined, null, _arr);
        this.queryUomConfig();
        queryIsSlodConfig().then((res) => {
          if (getResponse(res)) {
            this.setState({
              isSlodConfig: res,
            });
          }
        });
      }

      render() {
        const { children, ...otherProps } = this.props;
        const newProps = {
          children,
          ...this.state,
          ...otherProps,
          queryUomConfig: this.queryUomConfig,
        };
        return React.createElement(Components, { ...newProps }, children);
      }
    }
    return WithCustomize({ manualQuery: true })(Wrap);
    // return Wrap;
  };
}

/**
 * 功能:查询开启双单位配置-收货工作流用
 * @returns WrapComponent
 */
export function useDoubleUomConfigWork(WrapComponent) {
  return function Advances(props) {
    const [doubleUnitEnabled, setState] = useState(null);

    useEffect(() => {
      queryUomConfig();
    }, []);

    const queryUomConfig = (callback) => {
      queryDoubleUomConfig().then((res) => {
        if (getResponse(res)) {
          const num = [1, 2].includes(res) ? res : 0;
          setState(num);
          if (callback) callback(num);
        }
      });
    };

    const hocProps = {
      ...props,
      doubleUnitEnabled,
      queryUomConfig,
    };
    if (isNil(doubleUnitEnabled)) {
      return <WrapComponent {...hocProps} />;
    }
    return <Spin />;
  };
}

// 公用获取金额计算配置 Amount | Price;
export async function queryCalcRuleConfig(params = [{}]) {
  const result = await queryAmountCalcConfig(params);
  if (getResponse(result) && isArray(result)) {
    return result[0];
  }
  return 'Amount';
}
export function useTable(dataSet, columns, props) {
  return props?.customizeTable && props?.code ? (
    props?.customizeTable(
      {
        code: props?.code,
        readOnly: props.editFlag,
        __force_record_to_update__: true,
      },
      <Table
        dataSet={dataSet}
        columns={columns}
        selectionMode="none"
        style={{ maxHeight: 300 }}
        {...props}
      />
    )
  ) : (
    <Table dataSet={dataSet} columns={columns} style={{ maxHeight: 300 }} {...props} />
  );
}

export const isSupplier = organizationId !== tenantId; // true供应商 false采购方

/**
 * 功能:根据key过滤数组对象
 * @returns []
 */
export const filterObjVal = (arr, key) => {
  const obj = {};
  return arr.reduce(function (item, next) {
    obj[next[key]] ? '' : (obj[next[key]] = true && item.push(next));
    return item;
  }, []);
};

function formatErrorInfo(headerDS, lineDS, text) {
  const headerErrors = headerDS.current?.getValidationErrors() || [];
  const lineErrors = lineDS ? lineDS.getValidationErrors() : [];
  let errorMsg = [];
  headerErrors.forEach((item) => {
    const { injectionOptions = {}, $validationMessage = '' } = item?.errors[0];
    const { label = '' } = injectionOptions;
    if (label || $validationMessage) {
      errorMsg = [
        ...errorMsg,
        <span>
          {' '}
          {label
            ? intl.get('hzero.common.validation.notNull', { name: label })
            : $validationMessage}{' '}
          <br />{' '}
        </span>,
      ];
    }
    return item;
  });
  lineErrors.forEach((item, index) => {
    const { errors = [] } = item;
    // 如果行信息有验证不通过报错，先把标题加上去
    if (index === 0) {
      errorMsg = [
        ...errorMsg,
        <span style={{ fontWeight: '600', color: '#000000' }}>
          {text}: <br />{' '}
        </span>,
      ];
    }
    const lineIndex = item.record?.index + 1;
    errors.forEach((ele) => {
      const { injectionOptions = {}, $validationMessage = '', ruleName = '' } = ele?.errors[0];
      if (ruleName === 'attachmentError') {
        const { label = '' } = injectionOptions;
        if (label || $validationMessage) {
          errorMsg = [
            ...errorMsg,
            <span>
              {intl.get('ssta.common.validate.line.index', { index: lineIndex })}{' '}
              <span>
                {' '}
                {label
                  ? intl.get('hzero.common.validation.notNull', { name: label })
                  : $validationMessage}{' '}
                <br />{' '}
              </span>
              <br />{' '}
            </span>,
          ];
        }
      } else {
        errorMsg = [];
      }
    });
    return item;
  });
  if (errorMsg.length > 0) {
    notification.error({ message: errorMsg });
  }
}

export { formatErrorInfo };
// 校验token
export const validToken = (ds) => {
  if (isNil(ds.toData()[0]._token)) return false;
};

// 校验时间格式
export const validTime = (time, name) => {
  const isValidDate = Date.parse(time);
  if (isNaN(isValidDate)) {
    notification.error({
      message: intl.get('sinv.common.model.common.validTime', { name }),
    });
    return false;
  }
  return true;
};

//  收货单状态 rcvStatusCode
export const renderRcvStatus = (record) => {
  const value = record.get('rcvStatusCode');
  const TagStyle = { border: 'none' };
  if (['20_SUBMITTED', '35_PUBLISH', '40_FINISHED'].includes(value)) {
    // 绿色
    return (
      <div>
        <Tag color="green" style={{ ...TagStyle }}>
          {record.get('rcvStatusCodeMeaning')}
        </Tag>
      </div>
    );
  } else if (['10_NEW'].includes(value)) {
    // 橙色
    return (
      <div>
        <Tag color="orange" style={{ ...TagStyle }}>
          {record.get('rcvStatusCodeMeaning')}
        </Tag>
      </div>
    );
  } else {
    //  红色
    return (
      <div>
        <Tag color="red" style={{ ...TagStyle }}>
          {record.get('rcvStatusCodeMeaning')}
        </Tag>
      </div>
    );
  }
};

export const renderStatusCode = (record, code) => {
  const value = record.get(code);
  const TagStyle = { border: 'none' };
  if (
    [
      'SUBMITTED',
      'APPROVED',
      'PUBLISHED',
      'CONFIRMED',
      'DELIVERED',
      'SHIPPED',
      'DELETED',
      'PURCHASER_SUBMITTED',
      'SUPPLIER_SUBMITTED',
      'PURCHASER_PUBLISHED',
      'SUPPLIER_PUBLISHED',
    ].includes(value)
  ) {
    // 绿色
    return (
      <div>
        <Tag color="green" style={{ ...TagStyle }}>
          {record.get('displayStatusMeaning') ||
            record.get('asnStatusMeaning') ||
            record.get('pcStatusCodeMeaning')}
        </Tag>
      </div>
    );
  } else if (['PENDING', 'NEW'].includes(value)) {
    // 橙色
    return (
      <div>
        <Tag color="orange" style={{ ...TagStyle }}>
          {record.get('displayStatusMeaning') ||
            record.get('asnStatusMeaning') ||
            record.get('pcStatusCodeMeaning')}
        </Tag>
      </div>
    );
  } else if (
    [
      'CANCELED',
      'CLOSED',
      'DEPRECATED',
      'WFL_WITHDRAWN',
      'WITHDRAWN',
      'EFFECTED',
      'TERMINATION',
    ].includes(value)
  ) {
    return (
      <div>
        <Tag color="gray" style={{ ...TagStyle }}>
          {record.get('displayStatusMeaning') ||
            record.get('asnStatusMeaning') ||
            record.get('pcStatusCodeMeaning')}
        </Tag>
      </div>
    );
  } else {
    //  红色
    return value ? (
      <div>
        <Tag color="red" style={{ ...TagStyle }}>
          {record.get('displayStatusMeaning') ||
            record.get('asnStatusMeaning') ||
            record.get('pcStatusCodeMeaning')}
        </Tag>
      </div>
    ) : (
      '-'
    );
  }
};
export function dateRangeTransform(dateRange = null) {
  const transToArr = () => {
    switch (dateRange) {
      case 'IN_ONE_MONTH':
        return [moment().subtract(1, 'month'), moment(new Date()).format('YYYY-MM-DD')];
      case 'IN_TO_MONTH':
        return [moment().subtract(2, 'month'), moment(new Date()).format('YYYY-MM-DD')];
      case 'IN_THREE_MONTH':
        return [moment().subtract(3, 'month'), moment(new Date()).format('YYYY-MM-DD')];
      case 'HALF_THE_YEAR':
        return [moment().subtract(6, 'month'), moment(new Date()).format('YYYY-MM-DD')];
      case 'IN_ONE_YEAR':
        return [moment().subtract(12, 'month'), moment(new Date()).format('YYYY-MM-DD')];
      case 'ALL':
        return [];
      default:
        return [moment().subtract(3, 'month'), moment(new Date()).format('YYYY-MM-DD')];
    }
  };
  return transToArr();
}

/**
 * 查询条件汇总
 * defaultTabIndex 指定打开哪个tab
 * finishedDate 指定事务完成日期rcvTrxTypeId
 * rcvTrxTypeName 指定事务类型
 * 平台供应商id、本地供应商id、库存组织id、实际操作日期起、实际操作日期至。
 */

export const showSearchParams = (defaultParams) => {
  return {
    invOrganizationId: {
      lovPara: { tenantId: getCurrentOrganizationId() },
      defaultValue: () => {
        return defaultParams.invOrganizationId
          ? {
              organizationId: defaultParams.invOrganizationId,
              organizationName: defaultParams.organizationName,
            }
          : null;
      },
    },
    trxDate: {
      defaultValue: ({ record }) => {
        return defaultParams.trxDate
          ? defaultParams.trxDate
          : dateRangeTransform(
              isNil(record.get('trxDataRange')) ? 'IN_THREE_MONTH' : record.get('trxDataRange')
            );
      },
      dynamicProps: {
        disabled: ({ record }) => record.get('trxDataRange'),
      },
    },
    tempKey: {
      lovPara: { tenantId: getCurrentOrganizationId() },
      defaultValue: () => {
        return defaultParams.tempKey
          ? {
              peSuppliers: defaultParams.tempKey,
              supplierOrErpName: defaultParams.displaySupplierName,
            }
          : null;
      },
    },
  };
};

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
