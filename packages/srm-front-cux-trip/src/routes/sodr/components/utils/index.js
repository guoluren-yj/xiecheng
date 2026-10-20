import { NumberField } from 'choerodon-ui/pro';
import { isNumber, isNil, isNaN, noop } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import querystring from 'querystring';

import { getCurrentLanguage, getResponse } from 'utils/utils';
import intl from 'utils/intl';

import {
  queryDoubleUomConfig,
  fetchDisplayDocAndDocFlow,
} from '@/services/sodr/cuxOrderWorkspaceService';

import FlexLinkModal from '../FlexLinkModal';

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

// 公用获取双单位配置
export async function queryCommonDoubleUomConfig(params) {
  const result = await queryDoubleUomConfig(params);
  if (getResponse(result)) {
    return Number(result);
  }
  return 0;
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
 *处理精度 currency默认为10, quantity默认为6
 * @returns {{srm: string, erp: string, catalogMall: string, elMall: string}}
 */
export function getPrecision(precision) {
  const _default = 10;
  const _precision = !isNil(precision) ? Number(precision) : _default;
  return _precision;
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
 *参考价格弹框内链接打开其他页面
 * @param {{value: string,record:object, type:string}}
 * @returns {{ReactNode}}
 */
export function getFlexLink(val, record, type) {
  let path = '';
  let search = {};
  let params = {};
  const { priceSource, sourceFromId } = record;
  switch (priceSource) {
    // PO / CON / RFX / BID
    case 'PO':
      path =
        type === 'h0'
          ? `/sodr/send-order/detail/:id`
          : `/sodr/order-workspace/detail/all-orders/:id`;
      params = { id: sourceFromId };
      search = querystring.stringify({
        openFrom: 'modal',
      });
      break;
    case 'CONTRACT':
      path = '/sodr/purchase-order-maintain/purchase/detail';
      search = querystring.stringify({ pcHeaderId: sourceFromId, openFrom: 'modal' });
      break;
    case 'RFX':
      path = '/sodr/purchase-order-maintain/source-from-requisition/query-rfq/:rfxId';
      params = { rfxId: sourceFromId };
      search = querystring.stringify({
        libFlag: `order`,
        sourcePage: 'order',
        rfxStatus: 'FINISHED',
        inComingStatus: 'CHECK_PENDING',
      });
      break;
    case 'BID':
      path = '/sodr/purchase-order-maintain/source-from-requisition/bid-event-query/:bidId';
      params = { bidId: sourceFromId };
      search = querystring.stringify({
        // libFlag: `order`,
        // sourcePage: 'order',
        openFrom: 'modal',
        source: 'NONE',
      });
      break;
    default:
      path = '';
      break;
  }
  const _search = `?${search}`;
  const _location = {
    hash: '',
    pathname: path,
    search: _search,
  };
  const flexLinkProps = {
    path,
    type,
    text: val,
    location: _location,
    match: {
      params,
      path,
    },
    history: {
      ...window.dvaApp._history,
      location: _location,
    },
  };
  // eslint-disable-next-line react/react-in-jsx-scope
  return <FlexLinkModal {...flexLinkProps} />;
}
