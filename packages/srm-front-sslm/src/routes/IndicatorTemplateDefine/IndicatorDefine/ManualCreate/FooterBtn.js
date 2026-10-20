/*
 * @Date: 2024-01-23 17:22:00
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useState } from 'react';
import { Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { saveManualIndicator } from '@/services/indicatorTemplateDefineService';

const FooterBtn = ({
  type,
  modal,
  isEdit,
  remote,
  remoteRef,
  indicatorFormDs,
  formulaConfigDs,
  optionsConfigDs,
  indicatorListDs,
  updateToTemplate,
}) => {
  const [footerLoading, setLoading] = useState(false);

  // 关闭弹框
  const handleClose = () => {
    modal.close();
  };

  // 获取需保存的数据
  const getSaveParams = async () => {
    const baseInfo = indicatorFormDs.current?.toData() || {};
    const { scoreType, indicatorType, parentIndicatorId } = baseInfo;
    const validateList = [
      indicatorFormDs.validate(),
      scoreType === 'SYSTEM' && formulaConfigDs.validate(),
      indicatorType === 'OPT' && optionsConfigDs.validate(),
    ].filter(Boolean);
    let payload = {};
    const validateListFlag = await Promise.all(validateList);
    if (!validateListFlag.includes(false)) {
      payload = {
        ...baseInfo,
        enabledFlag: 1,
        sourceCode: 'CUSTOM',
        parentIndicatorId: parentIndicatorId === -1 ? null : parentIndicatorId,
        kpiIndicatorOptList: indicatorType === 'OPT' ? optionsConfigDs.toJSONData() : [],
        kpiIndicatorFmlList: scoreType === 'SYSTEM' ? formulaConfigDs.toJSONData() : [],
      };
    }
    const remotePayload = remote
      ? await remote.process('SSLM_INDICATOR_TEMPLATE_DEFINE_LIST_MANUAL_SAVE_PARAMS', payload, {
          remoteRef,
        })
      : payload;
    return remotePayload;
  };

  // 确认按钮回调
  const handleOk = async () => {
    if (isEdit) {
      const saveParams = await getSaveParams();
      if (remote && remote.event) {
        // 默认返回true,当返回false时走二开逻辑不走标准逻辑
        const res = await remote.event.fireEvent('cuxManualModalOk', {
          saveParams,
          handleClose,
          setLoading,
        });
        if (!res) {
          return;
        }
      }
      if (!isEmpty(saveParams)) {
        setLoading(true);
        return saveManualIndicator(saveParams)
          .then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              handleClose();
              if (indicatorListDs) {
                // 指标定义列表ds
                indicatorListDs.query();
              }
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      handleClose();
    }
  };

  // 更新至评分模板
  const handleUpdateToTemplate = async () => {
    const saveParams = await getSaveParams();
    if (!isEmpty(saveParams)) {
      return updateToTemplate({ params: saveParams, modal, type: 'MODAL' });
    }
  };

  return (
    <Fragment>
      <Button loading={footerLoading} color="primary" onClick={handleOk}>
        {isEdit
          ? intl.get('hzero.common.button.ok').d('确定')
          : intl.get('hzero.common.button.close').d('关闭')}
      </Button>
      <Button loading={footerLoading} hidden={type !== 'EDIT'} onClick={handleUpdateToTemplate}>
        {intl
          .get('spfm.supplierKpiIndicator.view.button.updateToScoringTemplate')
          .d('更新至评分模板')}
      </Button>
      <Button loading={footerLoading} hidden={!isEdit} onClick={handleClose}>
        {intl.get('hzero.common.button.cancel').d('取消')}
      </Button>
    </Fragment>
  );
};

export default FooterBtn;
