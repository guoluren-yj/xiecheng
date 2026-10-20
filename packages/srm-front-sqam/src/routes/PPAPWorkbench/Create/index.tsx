import React, { useMemo, useState, useCallback } from 'react';
import { Steps } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import DynamicButtons from "_components/DynamicButtons";
import intl from 'utils/intl';

import { stepbBtns } from '../../PPAPTemplate/utils/utils';
import { listDS, detailDS } from './indexDS';
import List from './components/list';
import Detail from './components/detail';

import styles from '../../PPAPTemplate/Create/index.less';

const { Step } = Steps;

export default observer((props) => {
  const { modal, handleToDetail, customizeForm } = props;
  const listDs = useMemo(() => new DataSet(listDS()), []);
  const detailDs = useMemo(() => new DataSet(detailDS()), []);
  const [current, setCurrent] = useState(0);

  const { selected } = listDs;

  // 点击取消
  const handleCancel = useCallback(() => {
    modal.close();
  }, [modal]);

  // 点击上一步/下一步
  const handleSetStepsCurrent = useCallback((index: number) => {
    setCurrent(current + index);
  }, [current]);

  // 保存
  const handleSaveBaseInfo = useCallback(async () => {
    const { templateId, templateNum, templateName, templateStatus } = selected[0]?.get(['templateId', 'templateNum', 'templateName', 'templateStatus']) || {};
    // eslint-disable-next-line no-unused-expressions
    detailDs.current?.set({ templateId, templateNum, templateName, templateStatus });
    const res = await detailDs.submit();
    if (!res) return;
    const { content } = res;
    const { projectHeaderId } = content[0] || {};
    handleToDetail(projectHeaderId, 'edit');
  }, [detailDs, handleToDetail, selected]);


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
        onClick: () => handleSetStepsCurrent(-1),
        waitType: 'throttle',
        wait: 1500,
      },
    };
    const nextBtn = (propsBtn) => {
      const { btnText = intl.get(`sqam.common.button.nextStep`).d('下一步'), ...btnPorps } = propsBtn;
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
        title: intl.get(`sqam.ppap.model.project.selectTemplate`).d('选择模板'),
        content: <List listDs={listDs} />,
        footerBtns: [
          nextBtn({
            disabled: selected.length === 0,
            onClick: () => handleSetStepsCurrent(1),
          }),
          cancelBtn,
        ],
      },
      {
        title: intl.get(`sqam.ppap.model.project.maintainInfo`).d('维护基本信息'),
        content: <Detail detailDs={detailDs} customizeForm={customizeForm} />,
        footerBtns: [
          nextBtn({
            onClick: handleSaveBaseInfo,
            btnText: intl.get(`hzero.common.model.sure`).d('确定'),
          }),
          prevBtn,
          cancelBtn,
        ],
      },
    ];
  }, [handleCancel, handleSetStepsCurrent, handleSaveBaseInfo, selected, detailDs, listDs, customizeForm]);

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
