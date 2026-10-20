import React from 'react';
import { isFunction } from 'lodash';

import { Expose } from 'utils/remote';
import { Button, Modal } from 'choerodon-ui/pro';
import request from 'utils/request';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MARMOT } from '_utils/config';
import intl from 'utils/intl';

const handleGetFixedAssetPhysicalCategories = async (lineDS, headerDS) => {
  Modal.confirm({
    title: '提示',
    children:
      '请先保存整单信息，再点击确认以获取品类主数据的实物类别及预算分类；未保存直接确认，已维护行信息将被清空。',
    onOk: async () => {
      const res = await request(
        `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/z8VDpIK7iaK22ShWv066Mthbc5qicdH4xhXwNVg55W8PQ`,
        {
          method: 'POST',
          body: {
            settleHeaderId: headerDS.current?.get('settleHeaderId'),
          },
        }
      );
      if (getResponse(res)) {
        lineDS.query();
      }
    },
  });
};

const handleUpdateLine = async (event) => {
  const { name, record, value } = event;
  if (name === 'attributeVarchar8' && value) {
    const res = await request(
      `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/z8VDpIK7iaK22ShWv066Mtn4q4iamOQKFWQtVg9BkTvic0`,
      {
        method: 'POST',
        body: {
          attributeVarchar8: value?.value,
        },
      }
    );
    if (getResponse(res)) {
      record.set('attributeVarchar32', res?.attributeVarchar32);
    }
  }
};
// 保存、提交前校验
const validateBeforeSaveOrSubmit = async (eventProps) => {
  const { settleHeaderDs, sendData } = eventProps;
  settleHeaderDs.status = 'loading';
  const { customizeUnitCode, ...otherParams } = sendData;
  const res = await request(
    `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/tVJr78aOlyDTutHaOU553Q9Ziciaj0kCpCUOhhc89XiawuMQV0tO0zFcPRNFjavKAle`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body: otherParams,
    }
  );
  settleHeaderDs.status = 'ready';
  if (getResponse(res) && res.code === 'warn' && res.info) {
    const modalRes = await Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: res.info,
    });
    if (modalRes === 'ok') {
      return true;
    }
    return false;
  }
  return true;
};

export default new Expose({
  process: {
    SSTA_PURCHASESETTLE_DETAIL_PRE_LINE_BTN: (tableButtons, otherprops) => {
      const { updateFlag, lineDS, headerDS } = otherprops;
      const cuxFixedAssetPhysicalCategoriesBtn = (
        <Button
          key="cuxFixedAssetPhysicalCategories"
          name="cuxFixedAssetPhysicalCategories"
          disabled={!lineDS.length}
          onClick={() => handleGetFixedAssetPhysicalCategories(lineDS, headerDS)}
        >
          固资类实物分类预算分类获取
        </Button>
      );
      return [...tableButtons, updateFlag && cuxFixedAssetPhysicalCategoriesBtn].filter(Boolean);
    },
  },
  events: {
    onEffect: (eventProps) => {
      const { settleLineDs, updateFlag } = eventProps;
      if (updateFlag) {
        settleLineDs.addEventListener('update', handleUpdateLine);
      }
    },
    beforeSave: async (eventProps) => {
      const { getSaveSendData, settleHeaderDs } = eventProps || {};
      if (getSaveSendData && isFunction(getSaveSendData)) {
        const sendData = await getSaveSendData({ actionType: 'save' });
        if (!sendData) return false;
        const res = await validateBeforeSaveOrSubmit({ settleHeaderDs, sendData });
        return res;
      }
      return true;
    },
    beforeSubmit: async (eventProps) => {
      const { getSaveSendData, settleHeaderDs } = eventProps || {};
      if (getSaveSendData && isFunction(getSaveSendData)) {
        const sendData = await getSaveSendData({ actionType: 'submit' });
        if (!sendData) return false;
        settleHeaderDs.status = 'loading';
        const validatedResultDTO = settleHeaderDs.getState('validatedResultDTO');
        Object.assign(sendData.settleHeader, { validatedResultDTO });
        const res = await validateBeforeSaveOrSubmit({ settleHeaderDs, sendData });
        return res;
      }
      return true;
    },
  },
});
