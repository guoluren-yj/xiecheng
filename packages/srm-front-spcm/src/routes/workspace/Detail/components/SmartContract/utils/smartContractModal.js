import React from 'react';
import { isEmpty, isString } from 'lodash';
import { Modal, Button, DataSet } from 'choerodon-ui/pro';
import DeltaToHtml from 'quill-delta-to-html';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { saveSmartContract, getSmartContractTaskId } from '@/services/workspaceService';
import ContractModal from '../ContractModal';
import { getIndexDs } from '../stores/indexDS';
import { isHtmlStr } from './utils';

export function smartContractModal(props = {}) {
  const { taskId = null, headerInfo, refresHeaderData = () => {} } = props || {};

  const { pcHeaderId, objectVersionNumber: oldObjectVersionNumber } = headerInfo || {};

  const smartContractDs = new DataSet(getIndexDs({ pcHeaderId }));
  smartContractDs.setState({ taskId });
  if (!taskId) {
    smartContractDs.query();
  }

  const smartContractModal = Modal.open({
    key: Modal.key(),
    movable: false,
    drawer: true,
    style: { width: 380 },
    bodyStyle: { paddingTop: 16 },
    title: intl.get('spcm.common.view.title.smartContract').d('智能摘要'),
    children: (
      <ContractModal
        dataSet={smartContractDs}
        isEdit
        showMaskFlag={taskId}
        pcHeaderId={pcHeaderId}
      />
    ),
    okText: intl.get('hzero.common.button.save').d('保存'),
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    onOk: () => handleSaveAndClose(false),
    footer: (okBtn, cancelBtn) => (
      <div>
        {okBtn}
        <Button onClick={() => handleSaveAndClose(true)}>
          {intl.get('spcm.common.view.button.saveAndClose').d('保存并关闭')}
        </Button>
        <Button onClick={() => handleRegenerate()}>
          {intl.get('spcm.common.view.button.regenerate').d('重新生成')}
        </Button>
        {cancelBtn}
      </div>
    ),
    afterClose: () => {
      const refresHeaderFlag = smartContractDs.getState('refresHeaderFlag');
      if (refresHeaderFlag) {
        smartContractDs.setState({ refresHeaderFlag: false });
        refresHeaderData();
      }
    },
  });

  // 处理保存
  const handleSaveAndClose = async (closeFlag = false) => {
    const flag = await smartContractDs.validate();
    if (!flag) {
      return false;
    }
    const data = smartContractDs?.current?.toData() || {};
    const { contractAbstract = [], objectVersionNumber } = data;
    if (isEmpty(contractAbstract)) {
      notification.error({
        description: intl.get('spcm.common.view.message.noDataNeedSave').d('暂无数据需要保存'),
      });
      return false;
    }
    // 转字符串
    const contractAbstractStr = isString(contractAbstract)
      ? contractAbstract
      : JSON.stringify(contractAbstract);
    let dataStr = contractAbstractStr;
    try {
      // 判断是否是html格式，是直接返回
      const htmlFlag = isString(contractAbstract) && isHtmlStr(contractAbstract);
      if (!htmlFlag) {
        // 如果是delta格式转成html格式
        const converter = new DeltaToHtml(contractAbstract);
        // 使用convert()转化不会报错，如果转化不成功会返回空字符串
        dataStr = converter.convert();
        if (!dataStr) {
          dataStr = contractAbstractStr;
        }
      }
    } catch (error) {
      // 转化出错，转化为字符串存储
      dataStr = contractAbstractStr;
    }
    const payload = {
      contractAbstract: dataStr,
      pcHeaderId,
      // 传 oldObjectVersionNumber 是应为ds.query方法接口会报错取不到版本号
      objectVersionNumber: objectVersionNumber || oldObjectVersionNumber,
    };
    // 存储点击保存标识，关闭弹窗时通过标识刷新头信息
    smartContractDs.setState({ refresHeaderFlag: true });
    return new Promise((resolve) => {
      saveSmartContract(payload)
        .then(async (res) => {
          if (getResponse(res)) {
            // 重新查询头信息
            await smartContractDs.query();
          }
        })
        .finally(() => {
          if (closeFlag && smartContractModal) {
            smartContractModal.close();
          }
          resolve(closeFlag);
        });
    });
  };

  // 重新生成
  const handleRegenerate = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('spcm.common.view.message.regenerateTips')
        .d('将获取当前文本最新的摘要，是否继续？'),
      onOk: async () => {
        return getSmartContractTaskId({
          pcHeaderId,
        }).then((res) => {
          if (getResponse(res)) {
            const { taskId } = res;
            smartContractDs.setState({ taskId });
          }
        });
      },
    });
  };
}
