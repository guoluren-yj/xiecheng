import React from 'react';
import querystring from 'querystring';
import { isEmpty, isArray } from 'lodash';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';
import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';

import {
  getDocCompareTaskIdOrTextUrl,
  getDocOnLineUrl,
  fetchCurrentContractText,
} from '@/services/contractCommonService';

import styles from '../styles.less';

let timerId = null;
let loadCompareModal = null;

// 获取当前合同文本对比的基准文档
export const getBasicDocumentDefaultValue = async (params = {}) => {
  const res = await fetchCurrentContractText(params);
  if (getResponse(res)) {
    if (res && isArray(res) && !isEmpty(res)) {
      return res[0];
    }
  }
};

// 状态错误报错
export const statusErrorMessage = () => {
  notification.error({
    description: intl
      .get('spcm.common.view.message.statusErrorMsg')
      .d('当前合同状态不支持进行文本对比'),
  });
};

// 文本对比加载弹窗
export const openLoadCompareTextModal = async (params = {}) => {
  // 循环之前先清空上一次timerId
  clearTimerId();
  // 循环获取链接
  handleDocOnLineUrl(params);
  return new Promise((resolve) => {
    loadCompareModal = Modal.open({
      movable: false,
      cancelButton: false,
      okText: intl.get('hzero.common.button.cance').d('取消'),
      style: { width: 520 },
      destroyOnClose: true,
      className: styles['spcm-load-compare-modal'],
      children: (
        <div>
          <div className={styles['spcm-load-compare-modal-title']}>
            {intl.get('hzero.common.message.confirm').d('提示')}
          </div>
          <div className={styles['spcm-load-compare-modal-content']}>
            {intl.get('spcm.common.view.message.documentComparing').d('文档对比中，请耐心等待。')}
          </div>
        </div>
      ),
      afterClose: () => {
        // 弹窗关闭清空循环
        clearTimerId();
      },
    });
    resolve(true);
  });
};

// 计费弹窗
export const openChargeModal = async (params = {}) => {
  const { pcHeaderId } = params;
  return new Promise((resolve) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      children: (
        <p>
          {intl
            .get('spcm.common.view.message.compareChargeMsg')
            .d('发起文档对比，可能会产生计费，请确认。')}
        </p>
      ),
      onOk: async () => {
        // 获取taskId和对比url;
        const res = await getDocCompareTaskIdOrTextUrl(params);
        if (getResponse(res)) {
          resolve(true);
          const { taskId, compareViewUrl } = res;
          // 有对比url直接跳转去对比页
          if (compareViewUrl) {
            const params = {
              fileUrl: compareViewUrl,
            };
            closeAllModal();
            goToTextComparePage(params);
            return true;
          }
          // 通过taskId循环获取对比url
          if (taskId) {
            const params = {
              taskId,
              pcHeaderId,
            };
            openLoadCompareTextModal(params);
            return true;
          }
          // 没有taskId也没有对比url的情况先不处理
          return true;
        }
        resolve(false);
        return false;
      },
      onCancel: () => {
        resolve(false);
      },
    });
  });
};

// 跳转文本对比
export const goToTextComparePage = (params = {}) => {
  const { fileUrl } = params;
  const pathname = '/spcm/contract-text-compare';
  const search = querystring.stringify({ fileUrl });
  // 判断是否为 relative 类型流程表单页面
  if (window.top !== window) {
    window.parent.postMessage({
      type: 'openTab',
      data: JSON.stringify({
        closable: true,
        key: pathname,
        path: pathname,
        search,
        title: intl.get('hzero.common.view.title.contractTextComparison').d('合同文本对比'),
      }),
    });
  } else {
    openTab({
      key: pathname,
      search,
      title: intl.get('hzero.common.view.title.contractTextComparison').d('合同文本对比'),
    });
  }
};

// 获取文本对比链接
export const handleDocOnLineUrl = (params = {}) => {
  timerId = setInterval(() => {
    getDocOnLineUrl(params).then((res) => {
      if (getResponse(res)) {
        const { compareViewUrl, smartTaskFetchFlag } = res;
        if (compareViewUrl && Number(smartTaskFetchFlag) === 1) {
          // 清空任务，跳转详情
          clearTimerId();
          closeAllModal();
          goToTextComparePage({ fileUrl: compareViewUrl });
        }
      } else {
        clearTimerId();
        // 关闭加载对比中弹窗
        if (loadCompareModal) {
          loadCompareModal.close();
        }
      }
    });
  }, 2000);
};

const clearTimerId = () => {
  if (timerId) {
    clearInterval(timerId);
  }
};

// 关闭所有弹窗
const closeAllModal = () => {
  Modal.destroyAll();
};
