/**
 *  合同文本对比
 */
import React from 'react';

import { Modal, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { checkBillRemind } from '@/services/contractCommonService';

import Content from './components/Content';
import { getIndexDS } from './stores/indexDS';
import {
  statusErrorMessage,
  openChargeModal,
  getBasicDocumentDefaultValue,
  openLoadCompareTextModal,
  goToTextComparePage,
} from './utils/utils';

// 合同文本对比弹窗
export async function operationTextCompareModal(params = {}) {
  const { headerInfo = {} } = params;
  const { pcStatusCode, pcHeaderId } = headerInfo || {};
  // 查询基准文档默认值默认
  const defaultValueObj = await getBasicDocumentDefaultValue({
    compareType: 'TEXT_COMPARE',
    pcHeaderId,
  });
  let recordValues = {};
  if (defaultValueObj) {
    const { fileUrl, versionName, compareFileType } = defaultValueObj;
    recordValues = {
      fileUrl,
      fileUrlMeaning: versionName,
      compareFileType,
    };
  }
  // 新建/已删除，不能对比
  const notCompareFlag = !pcStatusCode || ['PENDING', 'DELETED'].includes(pcStatusCode);
  const formDs = new DataSet(getIndexDS({ pcHeaderId }));
  formDs.create({
    ...recordValues,
  });
  Modal.open({
    key: Modal.key(),
    movable: false,
    drawer: true,
    style: { width: 380 },
    okText: intl.get('spcm.common.view.button.toCompare').d('去对比'),
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl.get('spcm.common.view.title.selectCompareDocument').d('对比文档选定'),
    children: <Content dataSet={formDs} />,
    onOk: async () => {
      // 校验单据状态
      if (notCompareFlag) {
        statusErrorMessage();
        return false;
      }
      const flag = await formDs.validate();
      if (!flag) {
        return false;
      }
      // 处理获取taskId入参
      const data = formDs.current?.toData() || {};
      const { fileUrlMeaning, ...others } = data;
      const payload = {
        ...others,
        leftDTO: {
          compareFileType: others?.compareFileType,
          fileUrl: others?.fileUrl,
        },
        rightDTO: {
          compareFileType: others?.rightCompareFileType,
          fileUrl: others?.comparefileUrl,
        },
        pcHeaderId,
      };
      const res = await checkBillRemind(payload);
      if (getResponse(res)) {
        const { compareTaskId, smartCompareStatus, compareViewUrl } = res;
        switch (smartCompareStatus) {
          case 'success':
            // 有对比url直接跳转去对比页
            goToTextComparePage({
              fileUrl: compareViewUrl,
            });
            return true;
          case 'wait': {
            // 没有taskId也没有对比url的情况,执行弹窗计费
            const closeFlag = await openChargeModal(payload);
            return closeFlag;
          }
          case 'working': {
            // 有taskId,执行轮询获取对比url
            const params = {
              taskId: compareTaskId,
              pcHeaderId,
            };
            openLoadCompareTextModal(params);
            return true;
          }
          default:
            return false;
        }
      }
      return false;
    },
  });
}
