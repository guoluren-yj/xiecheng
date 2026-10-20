// 改造自定义C7nPopover
import React, { useState, useCallback } from 'react';
import { Popover, Icon, Spin, Steps } from 'choerodon-ui';

import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import {
  resetSearchBarCache,
  getSearchBarKey,
} from 'srm-front-boot/lib/components/SearchBarTable/util/cache';

import { _cuzSearchCode } from './constants';
import {
  fetchModal,
  subAndDelete,
  handleBatchRejectApi,
  handleBatchConfirmApi,
} from '@/services/ReceipWorkbenchService';
import { getCustomizeCode, getCustomizeBtnCodes } from '@/routes/components/utils/util';
import './index.less';

const { Step } = Steps;

// 定义常量，避免代码重复
const BASE_PREFIX = 'SINV.RECEIPT_WORKBENCH_THING';

// 获取自定义代码
function getCustomizeCodes(nodeConfigIndexAbc, tabCutPage) {
  return [
    ...getCustomizeBtnCodes({ nodeConfigIndexAbc }),
    ...getCustomizeCode({ tab: tabCutPage, nodeConfigIndexAbc }),
  ];
}

/**
 * 获取tab默认显示的key
 * defaultTabIndex ||(origin === '1' && 'two') ||(origin === 'EvaluationFileManagement' && 'three') ||cacheTab.get('key') ||base ||from ||'one'
 * @param {*} _object
 * @returns key
 */
export function tabCutPageDefaultProps(_object) {
  const { defaultTabIndex, origin, base, from, cacheTab } = _object;

  if (defaultTabIndex) return defaultTabIndex; // 优先使用defaultTabIndex

  if (origin === '1') return 'two'; // 如果origin为1，则默认显示第二个tab

  if (origin === 'EvaluationFileManagement') return 'three'; // 如果origin为EvaluationFileManagement，则默认显示第三个tab, origin来源卡片

  if (cacheTab.get('key')) return cacheTab.get('key'); // 如果有缓存，则显示缓存

  return base || from || 'one';
}

/**
 * 按单按行展示标识
 *  origin === 'EvaluationFileManagement' ? 'flat' : viewType || 'flat'
 * @param {*} _object
 */
export function viewTypeDefaultProps(_object) {
  const { origin, viewType } = _object;

  if (origin === 'EvaluationFileManagement') return 'flat'; // 如果origin为EvaluationFileManagement，则默认显示第三个tab, origin来源卡片

  return viewType || 'flat';
}

/**
 * ds处理
 */
export function currentDsProps({
  props: {
    waitTableDs,
    courseAsnTableDs,
    courseTableDs,
    endTableDs,
    endAsnTableDs,
    returnTableDs,
    waitConfirmAsnTableDs,
    waitConfirmTableDs,
  },
  state: { tabCutPage, viewType, courseAsLine },
}) {
  const dsSelectorMap = {
    one: () => waitTableDs,
    two: () => (courseAsLine ? courseAsnTableDs : courseTableDs),
    three: () => (viewType === 'flat' ? endTableDs : endAsnTableDs),
    four: () => returnTableDs,
    five: () => (courseAsLine ? waitConfirmAsnTableDs : waitConfirmTableDs),
    default: () => waitTableDs,
  };

  const selector = dsSelectorMap[tabCutPage] || dsSelectorMap.default;
  return selector();
}

/**
 * 根据传入对象的 state 属性生成代码字符串
 * @param {Object} that - 包含 state 属性的对象
 * @returns {string} 生成的代码字符串
 */
export function cuzCodeProps(that) {
  let code;

  const { nodeConfigIndexAbc, tabCutPage, viewType, courseAsLine } = that.state;

  switch (tabCutPage) {
    case 'one':
      code = `${BASE_PREFIX}.WAIT.${nodeConfigIndexAbc},${BASE_PREFIX}.WAIT_SEARCH`;
      break;
    case 'two':
      if (courseAsLine) {
        code = `${BASE_PREFIX}.COURSE.ASN.${nodeConfigIndexAbc},${BASE_PREFIX}.COURSE_SEARCH`;
      } else {
        code = `${BASE_PREFIX}.COURSE.${nodeConfigIndexAbc},${BASE_PREFIX}.COURSE_SEARCH`;
      }
      break;
    case 'five':
      if (courseAsLine) {
        code = `${BASE_PREFIX}.CONFIRM.ASN.${nodeConfigIndexAbc},${BASE_PREFIX}.CONFIRM.SEARCH`;
      } else {
        code = `${BASE_PREFIX}.CONFIRM.COURSE.${nodeConfigIndexAbc},${BASE_PREFIX}.CONFIRM.SEARCH`;
      }
      break;
    case 'three':
      if (viewType === 'flat') {
        code = `${BASE_PREFIX}.END.HAN.${nodeConfigIndexAbc},${BASE_PREFIX}.END_SEARCH`;
      } else {
        code = `${BASE_PREFIX}.END.DAN.${nodeConfigIndexAbc},${BASE_PREFIX}.END_SEARCH`;
      }
      break;
    case 'four':
      code = `${BASE_PREFIX}.RETURN.${nodeConfigIndexAbc},${BASE_PREFIX}.RETURN_SEARCH`;
      break;
    default:
      code = `${BASE_PREFIX}.WAIT.${nodeConfigIndexAbc},${BASE_PREFIX}.WAIT_SEARCH`;
      break;
  }
  return code;
}

/**
 * 公共的查询方法封装
 */
export function findByParams(dataSet, params) {
  dataSet.setQueryParameter('params', {
    ...params,
  });
  dataSet.query();
}

/**
 * 清除勾选的数据缓存公共方法
 * */
export function clearSelectListChange(currentDs) {
  currentDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
  currentDs.unSelectAll(); // 初始化时清除缓存的勾选记录
}

export function getQueryParams(self) {
  return {
    nodeConfigId: self?.state?.nodeConfigId,
    customizeUnitCode: self?.custCode,
    ...self?.state?.isFromSupplierParams,
  };
}

/**
 * 个性化单元配置更新
 */
export function handleCustomizeConfigUpdate(self, nodeConfigIndexAbc, tabCutPage) {
  const _arr = getCustomizeCodes(nodeConfigIndexAbc, tabCutPage);
  self.props.queryUnitConfig(undefined, null, _arr);
  self.props.queryUomConfig();
  resetSearchBarCache(
    _cuzSearchCode[tabCutPage],
    getSearchBarKey(_cuzSearchCode[tabCutPage]),
    true
  );
}

/**
 * 确认/拒绝逻辑封装
 */
export async function trxConfirmApi({ data, type }, callBack) {
  const fn = {
    '30_SUP_REJECTED': handleBatchRejectApi,
    '40_FINISHED': handleBatchConfirmApi,
  };

  const res = await fn[type](data);

  if (getResponse(res)) {
    notification.success();

    callBack();
  }
}

/**
 * 提交/拒绝逻辑封装
 */
export async function trxSubmitOrDeleteApi({ data }, callBack) {
  const res = await subAndDelete(data);

  if (getResponse(res)) {
    callBack(res);
  }
}

const C7nPopover = (props) => {
  const { record = {} } = props;
  const [executeStatusContent, setExecuteStatusContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const iconStyle = {
    fontSize: 12,
    lineHeight: '18px',
    paddingLeft: '5px',
  };

  const modalClickList = useCallback((re) => {
    const { sourceHeaderNum, sourceLineNum, strategyHeaderId, rcvTrxLineId } = re;
    setLoading(true);
    fetchModal({ sourceHeaderNum, sourceLineNum, strategyHeaderId, rcvTrxLineId }).then((res) => {
      if (getResponse(res) && Array.isArray(res) && res.length) {
        setExecuteStatusContent([...res]);
        setLoading(false);
      } else {
        setExecuteStatusContent([
          { nodeConfigName: props.record.nodeConfigName, quantity: props.record.quantity },
        ]);
        setLoading(false);
      }
    });
  }, []);

  return (
    <Popover
      overlayClassName="wrapPop"
      // overlayStyle={{ fontSize: '18px' }}
      content={
        <Spin spinning={loading} size="small">
          <Steps direction="vertical">
            {(executeStatusContent || []).map((item) => {
              return (
                // <p style={{ marginBottom: 0 }}>
                //   <Badge status="success" />
                //   {item.nodeConfigName}
                //   {`(${item.quantity})`}
                // </p>
                // <Step title={item.nodeConfigName} description={<div style={{ float: 'right' }}>{item.quantity}</div>} />
                <Step
                  status={item.quantity ? 'finish' : 'wait'}
                  title={
                    <>
                      <span style={{ fontSize: '0.12rem', lineHeight: '0.18rem' }}>
                        {item.nodeConfigName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.12rem',
                          float: 'right',
                          marginLeft: '0.4rem',
                          color: '#1d2129',
                        }}
                      >
                        {item.quantity}
                      </span>
                    </>
                  }
                />
              );
            })}
          </Steps>
        </Spin>
      }
      placement="rightTop"
      trigger="hover"
    >
      <Icon type="call_split" style={iconStyle} onMouseEnter={() => modalClickList(record)} />
    </Popover>
  );
};

export default C7nPopover;
