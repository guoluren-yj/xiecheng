import React, { useMemo, useContext, useCallback } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import { observer } from 'mobx-react';
import DynamicButtons from "_components/DynamicButtons";
import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import { stringify } from 'querystring';

import intl from 'utils/intl';
import { isNil } from 'lodash';
import { getResponse } from 'utils/utils';

import type { CreateValueType } from '../Detail/stores/StoreProvider';
import { Store } from '../Detail/stores/StoreProvider';
import { stepbBtns, notifyValidErrors } from '../utils/utils';

import { updateStep } from '../Detail/stores/api';
import BasicInfo from '../Detail/component/BasicInfo';
import ApprovalList from '../Detail/component/ApprovalList';
import DeliverableList from '../Detail/component/DeliverableList';
import StageList from '../Detail/component/StageList';
import { stepNameList } from '../utils/type';

import styles from './index.less';

const { Step } = Steps;

export default observer(() => {
  const { headerDs, modal, defaultCurrent, approvalLineDs, deliverableLineDs, stageLineDs, onQueryList, history } = useContext<CreateValueType>(Store);

  const current = isNil(headerDs.current?.getState('current')) ? defaultCurrent : headerDs.current?.getState('current');

  // 删除模板
  const handleDeleteTemplate = useCallback(async(confirmModal) => {
    const res = await headerDs.delete(headerDs.current, false);
    if (!res) return;
    if (confirmModal) confirmModal.close();
    modal.close();
    if (onQueryList) onQueryList();
  }, [headerDs, modal, onQueryList]);

  // 保存模板
  const handleSaveTemplate = useCallback(async(confirmModal) => {
    const validRes = await headerDs.validate();
    // 校验失败，通知校验内容
    if (!validRes) {
      notifyValidErrors(headerDs);
      return undefined;
    };
    const res = await headerDs.setState('submitType', 'save').forceSubmit();
    if (!res) return;
    if (confirmModal) confirmModal.close();
    modal.close();
  }, [headerDs, modal]);

  // 点击取消
  const handleCancel = useCallback(() => {
    const { templateId, templateNum } = headerDs.current?.get(['templateId', 'templateNum']) || {};
    if (!templateId) modal.close();
    else {
      const confirmModal = Modal.open({
        border: false,
        header: null,
        className: 'c7n-pro-confirm-wrapper',
        children: (
          <div style={{color: '#1d2129'}}>
            <div style={{fontSize: '16px', fontWeight: 600, lineHeight: '32px'}}>{intl.get('hzero.common.message.confirm.title').d('提示')}</div>
            <div>
              <span>{intl.get('sqam.ppap.view.message.confirm').d('确定要')}</span>
              <span>{intl.get('hzero.common.button.cancel').d('取消')}</span>
              {templateNum}?
            </div>
          </div>
        ),
        okText: intl.get('sqam.common.view.button.confirmCancelDocument').d('确认取消单据'),
        cancelText: intl.get('sqam.common.view.button.gottaThink').d('我再想想'),
        onOk: () => handleDeleteTemplate(confirmModal),
        footer: (okBtn, cancelBtn) => [
          cancelBtn,
          <Button onClick={() => handleSaveTemplate(confirmModal)}>
            {intl.get('sqam.common.view.button.saveDraft').d('保存草稿')}
          </Button>,
          okBtn,
        ],
      });
    }
  }, [modal, headerDs, handleDeleteTemplate, handleSaveTemplate]);

  // 点击上一步/下一步
  const handleSetStepsCurrent = useCallback(async (type: string) => {
    const stepCurrent = headerDs.current?.getState('current');
    const oldCurrent = isNil(stepCurrent) ? defaultCurrent : stepCurrent;
    const newCurrent = type === 'next' ? oldCurrent + 1 : oldCurrent - 1;
    // eslint-disable-next-line no-unused-expressions
    headerDs.current?.setState('current', newCurrent);
    const step = stepNameList[newCurrent];
    if (!step) return;
    const { templateId, objectVersionNumber } = headerDs.current?.get(['templateId', 'objectVersionNumber']) || {};
    const res = getResponse(await updateStep({ step, templateId, objectVersionNumber }));
    if (!res) return;
    // eslint-disable-next-line no-unused-expressions
    headerDs.current?.init('objectVersionNumber', res.objectVersionNumber);
    if (step === 'END') {
      // 进入详情
      history.push({
        pathname: `/sqam/PPAPTemplate/detail/${templateId}`,
        search: stringify({ operate: 'edit' }),
      });
    }
  }, [headerDs, defaultCurrent, history]);

  // 点击保存基本信息
  const handleSaveBaseInfo = useCallback(async () => {
    headerDs.dataToJSON = DataToJSON.all;
    const res = await headerDs.forceSubmit();
    if (res) {
      handleSetStepsCurrent('next');
      if (onQueryList) onQueryList();
    }
  }, [headerDs, handleSetStepsCurrent, onQueryList]);

  const handleSaveApproval = useCallback(async () => {
    const validRes = await approvalLineDs.validate();
    if (!validRes) {
      notifyValidErrors(approvalLineDs);
      return;
    }
    approvalLineDs.dataToJSON = DataToJSON.all;
    const res = await approvalLineDs.forceSubmit();
    approvalLineDs.dataToJSON = DataToJSON.selected;
    if (res) {
      handleSetStepsCurrent('next');
    }
  }, [approvalLineDs, handleSetStepsCurrent]);

  const handleSaveDocument = useCallback(async () => {
    const validRes = await deliverableLineDs.validate();
    if (!validRes) {
      notifyValidErrors(deliverableLineDs);
      return;
    }
    deliverableLineDs.dataToJSON = DataToJSON.all;
    const res = await deliverableLineDs.forceSubmit();
    deliverableLineDs.dataToJSON = DataToJSON.selected;
    if (res) {
      handleSetStepsCurrent('next');
    }
  }, [deliverableLineDs, handleSetStepsCurrent]);

  const handleSaveStage = useCallback(async () => {
    const validRes = await stageLineDs.validate();
    if (!validRes) {
      notifyValidErrors(stageLineDs);
      return;
    }
    stageLineDs.dataToJSON = DataToJSON.all;
    const res = await stageLineDs.forceSubmit();
    stageLineDs.dataToJSON = DataToJSON.selected;
    if (res) {
      handleSetStepsCurrent('next');
    }
  }, [stageLineDs, handleSetStepsCurrent]);

  const stepList: any = useMemo(() => {
    const cancelBtn = {
      name: 'cancel',
      child: intl.get('hzero.common.button.cancel').d('取消'),
      btnProps: {
        onClick: handleCancel,
        waitType: 'throttle',
        wait: 1500,
      },
    };
    const prevBtn = {
      name: 'prevStep',
      child: intl.get(`sqam.common.button.prevStep`).d('上一步'),
      btnProps: {
        onClick: () => handleSetStepsCurrent('prev'),
        waitType: 'throttle',
        wait: 1500,
      },
    };
    const nextBtn = (props) => {
      const { btnText = intl.get(`sqam.common.button.nextStep`).d('下一步'), ...btnPorps } = props;
      return {
        name: 'nextStep',
        child: btnText,
        btnProps: {
          color: 'primary',
          waitType: 'throttle',
          wait: 1500,
          ...btnPorps,
        },
      };
    };
    return [
      {
        title: intl.get(`sqam.ppap.model.template.baseInfo`).d('基本信息'),
        content: <BasicInfo />,
        footerBtns: [
          nextBtn({
            onClick: handleSaveBaseInfo,
            btnText: intl.get(`sqam.common.button.createAndNextStep`).d('创建并下一步'),
          }),
          cancelBtn,
        ],
      },
      {
        title: intl.get(`sqam.ppap.model.template.projectApprovalWay`).d('项目审批方式'),
        content: <ApprovalList />,
        footerBtns: [
          nextBtn({
            onClick: handleSaveApproval,
          }),
          prevBtn,
          cancelBtn,
        ],
      },
      {
        title: intl.get(`sqam.ppap.model.template.deliverableConfig`).d('交付物配置'),
        content: <DeliverableList />,
        footerBtns: [
          nextBtn({
            onClick: handleSaveDocument,
            disabled: deliverableLineDs.length === 0,
          }),
          prevBtn,
          cancelBtn,
        ],
      },
      {
        title: intl.get(`sqam.ppap.model.template.stageConfig`).d('阶段配置'),
        content: <StageList />,
        footerBtns: [
          nextBtn({
            onClick: handleSaveStage,
            disabled: stageLineDs.length === 0,
          }),
          prevBtn,
          cancelBtn,
        ],
      },
    ];
  }, [handleCancel, handleSetStepsCurrent, handleSaveBaseInfo, handleSaveDocument, handleSaveApproval, handleSaveStage, deliverableLineDs.length, stageLineDs.length]);

  return (
    <div className={styles['create-steps-wrapper']}>
      <Steps
        current={current}
        size="small"
        style={{ paddingBottom: 16, borderBottom: '1px solid #f5f5f5' }}
      >
        {stepList.map(({ title, name }) => (
          <Step title={title} key={name} />
        ))}
      </Steps>
      <div className="create-steps-content">{stepList[current]?.content}</div>
      <div className="sqam-body-footer">
        <DynamicButtons buttons={stepbBtns(stepList[current]?.footerBtns)} />
      </div>
    </div>
  );
});
