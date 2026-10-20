import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Steps } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import DynamicButtons from "_components/DynamicButtons";
import intl from 'utils/intl';

import { stepbBtns } from '../../PPAPTemplate/utils/utils';
import { listDS, detailDS, partLineDS } from './indexDS';
import List from './components/list';
import Detail from './components/detail';
import PartList from './components/part';

import styles from '../../PPAPTemplate/Create/index.less';

const { Step } = Steps;

export default observer((props) => {
  const { modal, handleToDetail } = props;
  const listDs = useMemo(() => new DataSet(listDS()), []);
  const detailDs = useMemo(() => new DataSet(detailDS()), []);
  const partLineDs = useMemo(() => new DataSet(partLineDS()), []);
  const [current, setCurrent] = useState(0);
  const partLen = partLineDs?.length || 0;

  const { selected } = listDs;

  const handleUpdate = useCallback(({ record, name }) => {
    if (name === 'partLov') {
      const partLov = record?.get('partLov');
      const { categoryId, categoryName, categoryCode } = partLov || {};
      if (categoryId) {
        record.set('categoryLov', { categoryId, categoryCode, categoryName });
      }
    }
  }, []);

  useEffect(() => {
    partLineDs.addEventListener('update', handleUpdate);
    return () => {
      partLineDs.removeEventListener('update', handleUpdate);
    };
  }, [partLineDs, handleUpdate]);

  // 点击取消
  const handleCancel = useCallback(() => {
    modal.close();
  }, [modal]);

  // 点击上一步/下一步
  const handleSetStepsCurrent = useCallback(async (index: number, ds?: any) => {
    if (ds) {
      const validRes = await ds.validate();
      if (!validRes) return;
    }
    setCurrent(current + index);
  }, [current]);

  // 保存
  const handleSaveBaseInfo = useCallback(async () => {
    const { templateId, templateNum, templateName, templateStatus } = selected[0]?.get(['templateId', 'templateNum', 'templateName', 'templateStatus']) || {};
    const itemDTOList = partLineDs.toData();
    // eslint-disable-next-line no-unused-expressions
    detailDs.current?.set({ templateId, templateNum, templateName, templateStatus, itemDTOList });
    const res = await detailDs.submit();
    if (!res) return;
    const { content } = res;
    const { projectHeaderId } = content[0] || {};
    handleToDetail(projectHeaderId, 'edit');
  }, [detailDs, handleToDetail, selected, partLineDs]);

  const stepList: any = useMemo(() => {
    const cancelBtn = {
      name: 'cancel',
      child: intl.get('hzero.common.button.cancel').d('取消'),
      btnProps: {
        onClick: handleCancel,
      },
    };
    const prevBtn = {
      name: 'prevStep',
      child: intl.get(`sqam.common.button.prevStep`).d('上一步'),
      btnProps: {
        onClick: () => handleSetStepsCurrent(-1),
      },
    };
    const nextBtn = (propsBtn) => {
      const { btnText = intl.get(`sqam.common.button.nextStep`).d('下一步'), ...btnPorps } = propsBtn;
      return {
        name: 'nextStep',
        child: btnText,
        btnProps: {
          color: 'primary',
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
        title: intl.get(`sqam.ppap.view.title.partList`).d('零件列表'),
        content: <PartList partLineDs={partLineDs} />,
        footerBtns: [
          nextBtn({
            disabled: partLen === 0,
            onClick: () => handleSetStepsCurrent(1, partLineDs),
          }),
          prevBtn,
          cancelBtn,
        ],
      },
      {
        title: intl.get(`sqam.ppap.model.project.maintainInfo`).d('维护基本信息'),
        content: <Detail detailDs={detailDs} />,
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
  }, [handleCancel, handleSetStepsCurrent, handleSaveBaseInfo, selected, detailDs, listDs, partLineDs, partLen]);

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
