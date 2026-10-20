import React, { Fragment, useContext, useMemo, useCallback, useEffect } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { Steps, Spin } from 'choerodon-ui';
import { isNil, isEmpty, omit, isFunction } from 'lodash';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import { Modal, Tabs, DataSet, Button, CheckBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';

import styles from '../index.less';
import { updateStep } from '../utils/api';
import type { StepType } from './stores';
import StoreProvider, { Store } from './stores';
import commonStyles from '../../../common.less';
import QuotePayPool from './components/QuotePayPool';
import FillHeadInfo from './components/FillHeadInfo';
import PaymentLineStep from './components/PaymentLineStep';
import StatementLineStep from './components/StatementLineStep';
import { pendingListDS } from '../../PaymentPool/List/stores/listDS';
import { getCustomValidationResponse } from '../../../components/CustomValidation';
import FillPayPoolStep, { getFillPoolAddFields } from './components/FillPayPoolStep';

const { Step } = Steps;
const { TabPane } = Tabs;

const Create = observer(() => {

  const {
    modal,
    remote,
    loading,
    headerDs,
    cuxProps,
    okCallback,
    setLoading,
    headerListDs,
    customizeForm,
    selectedPoolData,
    permissionMap,
  } = useContext(Store);

  const payPoolDs = useMemo(() => {
    const normalDsProps = pendingListDS();
    const processDsProps = remote
      ? remote.process('SBSM.PAYMENT_WORKBENCH_DETAIL_CUX.STEP_PAY_POOL_DSPROPS', normalDsProps, { cuxProps })
      : normalDsProps;
    return new DataSet(processDsProps);
  }, [remote, cuxProps]);
  const fillPoolDs = useMemo(() => {
    const normalDsProps = pendingListDS();
    const processDsProps = remote
      ? remote.process('SBSM.PAYMENT_WORKBENCH_DETAIL_CUX.STEP_FILL_PAY_POOL_DSPROPS', normalDsProps, { cuxProps })
      : normalDsProps;
    return new DataSet(processDsProps);
  }, [remote, cuxProps]);
  const noPayPoolSelected = isEmpty(payPoolDs.selected);
  const noHeaderListSelected = isEmpty(headerListDs.selected);
  const batchFlag = headerListDs.totalCount > 1;
  const noDocFlag = isNil(headerDs.getQueryParameter('payHeaderId'));
  const defaultSelectedFlag = noDocFlag && selectedPoolData;
  const { payNum, statementLineEditPoint } = headerDs.current?.get(['payNum', 'statementLineEditPoint']) || {};

  useEffect(() => {
    if (!isNil(payNum)) {
      modal.update({ title: `${intl.get('sbsm.common.view.title.payDocCreate').d('支付单新建')}-${payNum}` });
    }
  }, [modal, payNum]);

  const stepList = useMemo(() => {
    return [
      !defaultSelectedFlag && { // 结算池新建
        name: 'PAY_POOL_SELECT',
        title: intl.get('sbsm.paymentWorkbench.view.title.quotePayTransactionCreate').d('引用支付事务新建'),
      },
      noDocFlag && {
        name: 'CONFIRM_PAYMENT_METHOD',
        title: intl.get('sbsm.paymentWorkbench.view.title.confirmPaymentMethod').d('确认付款方式'),
      } as any,
      {
        name: 'PAY_LINE',
        title: intl.get('sbsm.paymentWorkbench.view.title.maintainPaymentLine').d('维护支付行'),
      },
      statementLineEditPoint !== 'APPROVE' && {
        name: 'PAY_STATEMENT_LINE',
        title: intl.get('sbsm.paymentWorkbench.view.title.maintainSettlementLine').d('维护流水行'),
      },
    ].filter(Boolean);
  }, [
    noDocFlag,
    defaultSelectedFlag,
    statementLineEditPoint,
  ]);

  const stepMap = useMemo(() =>
    [...stepList, { name: 'END' }].reduce((acc, { name }, index) => {
      acc[name] = index;
      acc[index] = name;
      return acc;
    }, {}),
    [stepList]
  );

  const handleSetActiveKey = useCallback(
    (key) => {
      headerListDs.currentIndex = key;
    },
    [headerListDs]
  );

  // 移除当前记录前需要计算下一个待操作的单据并跳转
  const handleRemoveRecords = useCallback(
    (records: any[]) => {
      if (batchFlag) {
        headerListDs.remove(records, true);
        if (headerListDs.length === 0) modal.close();
      } else {
        modal.close();
      }
      if (okCallback) okCallback();
    },
    [
      modal,
      batchFlag,
      okCallback,
      headerListDs,
    ]
  );

  const handleRemoveCurrent = useCallback(() => {
    handleRemoveRecords([headerListDs.current]);
  }, [headerListDs, handleRemoveRecords]);

  const getStep = useCallback((direction?: 'prev' | 'next') => {
    const defaultStepName = selectedPoolData ? 'CONFIRM_PAYMENT_METHOD' : 'PAY_POOL_SELECT';
    // 拆单场景 - 单笔场景 - 新建场景 -默认值
    const currentStepName =
      headerListDs.current?.get('step') ?? headerDs.current?.get('step') ?? headerDs.getState('step') ?? defaultStepName;
    const currentIndex = stepMap[currentStepName] ?? 0;
    if (direction === 'prev') return { stepName: stepMap[currentIndex - 1], stepIndex: currentIndex - 1 };
    if (direction === 'next') return { stepName: stepMap[currentIndex + 1], stepIndex: currentIndex + 1 };
    return { stepName: currentStepName, stepIndex: currentIndex };
  }, [stepMap, headerDs, headerListDs, selectedPoolData]);

  const { stepName, stepIndex } = getStep();

  const setStep = useCallback(async (newStepName: StepType, okCallback?: Function) => {
    if (noDocFlag) {
      headerDs.setState('step', newStepName);
    }
    if (headerListDs.current) { // 拆单场景同步默认值
      headerListDs.current.init({ step: newStepName });
    }
    if (headerDs.current) {
      const oldStepName = headerDs.current.get('step');
      if (oldStepName !== newStepName) {
        setLoading(true);
        const res = getResponse(await updateStep({
          step: newStepName,
          ...headerDs.current.get(['payHeaderId', 'objectVersionNumber']),
        }));
        setLoading(false);
        if (!res) return;
        headerDs.current.init('step', newStepName); // 先触发step更新视图，避免子组件清除绑定滞后
        headerDs.query();
      }
    }
    if (newStepName === 'END') handleRemoveCurrent();
    notification.success({});
    if (isFunction(okCallback)) okCallback();
  }, [
    headerDs,
    noDocFlag,
    setLoading,
    headerListDs,
    handleRemoveCurrent,
  ]);

  const handleStepChange = useCallback(async (direction: 'prev' | 'next', okCallback?: Function) => {
    const { stepName } = getStep(direction);
    return setStep(stepName, okCallback);
  }, [getStep, setStep]);

  const handleLoadFillPool = useCallback((dataSource) => {
    setLoading(true);
    // 重设部分字段后再初始化数据
    runInAction(() => getFillPoolAddFields().forEach((field) => fillPoolDs.addField(field.name, field)));
    fillPoolDs.loadData(dataSource, dataSource.length);
    setLoading(false);
  }, [fillPoolDs, setLoading]);

  const handleSelectedData = useCallback(async () => {
    const isValid = await payPoolDs.validate();
    if (!isValid) return;
    handleLoadFillPool(payPoolDs.toJSONData());
    return handleStepChange('next');
  }, [payPoolDs, handleStepChange, handleLoadFillPool]);

  useEffect(() => {
    if (selectedPoolData) handleLoadFillPool(selectedPoolData);
  }, [selectedPoolData, handleLoadFillPool]);

  const handleCreateSelected = useCallback(async () => {
    setLoading(true);
    const validRes = await fillPoolDs
      .setState('submitType', 'createPayDocValidate')
      .submit()
      .finally(() => setLoading(false));
    if (!validRes) return;
    const handleRealCreate = async () => {
      setLoading(true);
      const createRes = await fillPoolDs
        .setState('submitType', 'createPayDoc')
        .submit()
        .finally(() => setLoading(false));
      if (!createRes) return;
      const { mode, payHeaderList } = createRes.content[0];
      if (mode === 'ASYNC') {
        modal.close();
      } else if (payHeaderList.length > 1) {
        headerListDs.loadData(payHeaderList.map(item => ({ ...item, headerRecords: [] }))); // headerRecords设置默认值,避免bind自动查询
        headerDs.bind(headerListDs, 'headerRecords');
      } else {
        const { payHeaderId } = payHeaderList[0];
        headerDs.setQueryParameter('payHeaderId', payHeaderId);
        headerDs.query();
      }
      notification.success({});
    };
    return getCustomValidationResponse(validRes?.content[0] || {}, handleRealCreate);
  }, [
    modal,
    headerDs,
    fillPoolDs,
    setLoading,
    headerListDs,
  ]);

  const handleCreateAll = useCallback(async () => {
    const confirmRes = await Modal.confirm({
      title: intl.get('sbsm.common.view.title.tip').d('提示'),
      children: intl
        .get('sbsm.common.view.message.confirmAllCreatePayDoc', { num: payPoolDs.totalCount })
        .d(
          '已选择【{num}】条待支付事务，全选新建时会根据待支付事务上的付款形式自动并单，不支持调整，是否确认创建'
        ),
    });
    if (confirmRes !== 'ok') return;
    setLoading(true);
    payPoolDs.dataToJSON = DataToJSON.all;
    const res = await payPoolDs
      .setState('submitType', 'createAll')
      .submit()
      .finally(() => {
        payPoolDs.dataToJSON = DataToJSON.selected;
        setLoading(false);
      });
    if (!res) return;
    notification.success({});
    modal.close();
  }, [modal, payPoolDs, setLoading]);

  const handleFillHeadInfo = useCallback((action, okCallback) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: commonStyles['sbsm-small-modal'],
      children: <FillHeadInfo action={action} okCallback={okCallback} customizeForm={customizeForm} />,
    });
  }, [customizeForm]);

  const handleCancel = useCallback(async () => {
    if (noDocFlag) return modal.close();
    const payNum = headerDs.current?.get('payNum');
    const res = await new Promise((resolve) => {
      Modal.confirm({
        title: intl.get('sbsm.common.view.message.tip').d('提示'),
        children: intl.get('sbsm.paymentWorkbench.view.message.confirmCancelDocNumAndFreeAffair', { num: payNum }).d('确定要取消{num}？,取消后将释放支付事务'),
        okText: intl.get('sbsm.common.view.button.confirmCancelDoc').d('确认取消单据'),
        cancelText: intl.get('sbsm.common.view.button.saveDraft').d('保存草稿'),
        onOk: () => resolve('submitCancel'),
        onCancel: () => resolve('submitUpdate'),
        footer: (okBtn, cancelBtn, confirmModal) => [
          <Button onClick={() => resolve(confirmModal.close())}>
            {intl.get('sbsm.common.view.button.gottaThink').d('我再想想')}
          </Button>,
          cancelBtn,
          permissionMap.get('cancel') && okBtn,
        ],
      });
    });
    if (res === 'submitCancel') {
      handleFillHeadInfo('cancel', async (filledHeadData) => {
        const res = await headerDs
          .setState('cacheData', filledHeadData)
          .setState('submitType', 'cancel')
          .forceSubmit();
        if (!res) return false;
        notification.success({});
        handleRemoveCurrent();
      });
    } else if (res === 'submitUpdate') {
      const res = await headerDs.setState('submitType', 'update').forceSubmit();
      if (!res) return;
      notification.success({});
      handleRemoveCurrent();
    }
  }, [
    modal,
    headerDs,
    noDocFlag,
    permissionMap,
    handleFillHeadInfo,
    handleRemoveCurrent,
  ]);

  const handleAddLine = useCallback(async () => {
    setLoading(true);
    const res = await payPoolDs
      .setState('submitType', 'addPayLine')
      .submit()
      .finally(() => setLoading(false));
    if (!res) return;
    await headerDs.query();
    return handleStepChange('next', () => payPoolDs.batchUnSelect(payPoolDs.selected));
  }, [headerDs, payPoolDs, setLoading, handleStepChange]);

  const handleSingleSubmit = useCallback(async () => {
    const validRes = await headerDs
      .setState('submitType', 'submitValidate')
      .submit();
    if (!validRes) return;
    const { stepName: nextStepName } = getStep('next');
    const handleRealCreate = async () => {
      const createRes = await headerDs
        .setState('cacheData', { step: 'END' })
        .setState('submitType', 'submit')
        .submit();
      if (!createRes) return;
      setStep(nextStepName);
    };
    return getCustomValidationResponse(validRes?.content[0] || {}, handleRealCreate);
  }, [
    getStep,
    setStep,
    headerDs,
  ]);

  const handleSavePayLine = useCallback(async () => {
    const { stepName: nextStepName } = getStep('next');
    const res = await headerDs
      .setState('cacheData', { step: nextStepName })
      .setState('submitType', 'update')
      .submit();
    if (!res) return;
    setStep(nextStepName);
  }, [
    getStep,
    setStep,
    headerDs,
  ]);

  const handleSingleSave = useCallback(async () => {
    const res = await headerDs
      .setState('submitType', 'update')
      .submit();
    if (!res) return;
    notification.success({});
    headerDs.query();
  }, [headerDs]);

  const handleBatchSubmit = useCallback(async () => {
    const headerSelectedList = headerListDs.selected.map((record) => record.getCascadeRecords('headerRecords')?.[0] || record);
    const frontValidRes = await Promise.all(headerSelectedList.map((record) => record.validate(true)));
    const errorIndex = frontValidRes.findIndex((item) => item === false);
    if (errorIndex > -1) {
      handleSetActiveKey(errorIndex);
      return;
    }
    headerListDs.commitData(headerSelectedList.map((record) => omit(({ ...record.toJSONData() }), '__id'))); // 去除id，避免根据id回写找不到数据
    headerListDs.dataToJSON = DataToJSON.selected;
    const validRes = await headerListDs
      .setState('submitType', 'submitValidate')
      .submit()
      .finally(() => {
        headerListDs.dataToJSON = DataToJSON.all;
      });
    if (!validRes) return;
    const handleRealCreate = async () => {
      headerListDs.dataToJSON = DataToJSON.selected;
      const submitRes = await headerListDs
        .setState('cacheData', { step: 'END' })
        .setState('submitType', 'submit')
        .submit()
        .finally(() => {
          headerListDs.dataToJSON = DataToJSON.all;
        });
      if (!submitRes) return;
      notification.success({});
      handleRemoveRecords(headerListDs.selected);
    };
    return getCustomValidationResponse(validRes?.content[0] || {}, handleRealCreate);
  }, [headerListDs, handleSetActiveKey, handleRemoveRecords]);

  const buttons = useMemo(() => {
    const cancelBtn = {
      name: 'cancel',
      child: intl.get('hzero.common.button.cancel').d('取消'),
      btnProps: { loading, wait: 1000, onClick: handleCancel },
    };
    const prevBtn = {
      name: 'prevStep',
      child: intl.get('sbsm.common.button.prevStep').d('上一步'),
      btnProps: { loading, wait: 1000, onClick: () => handleStepChange('prev') },
    };
    const skipBtn = {
      name: 'skipStep',
      child: intl.get('sbsm.common.button.skip').d('跳过'),
      btnProps: { loading, wait: 1000, onClick: () => handleStepChange('next') },
    };
    const renderNextBtn = (btnProps) => ({
      name: 'nextStep',
      child: intl.get('sbsm.common.button.nextStep').d('下一步'),
      btnProps: {
        loading,
        wait: 1000,
        color: 'primary',
        onClick: () => handleStepChange('next'),
        ...btnProps,
      },
    });
    const lastStepBtns = [
      permissionMap.get('submit') && {
        name: 'singleSubmit',
        child: batchFlag
          ? intl.get('sbsm.common.button.singleSubmit').d('单笔提交')
          : intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          loading,
          wait: 1000,
          color: 'primary',
          onClick: handleSingleSubmit,
        },
      },
      {
        name: 'singleSave',
        child: batchFlag
          ? intl.get('sbsm.common.button.singleSave').d('单笔保存')
          : intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          loading,
          wait: 1000,
          onClick: handleSingleSave,
        },
      },
      batchFlag && permissionMap.get('batchSubmit') && {
        name: 'batchSubmit',
        child: intl.get('sbsm.common.button.batchSubmit').d('批量提交'),
        btnProps: {
          loading,
          wait: 1000,
          disabled: noHeaderListSelected,
          onClick: handleBatchSubmit,
        },
      } as any,
      prevBtn,
      cancelBtn,
    ];
    switch (stepName) {
      case 'PAY_POOL_SELECT':
        return [
          ...(noDocFlag ? [
            permissionMap.get('create') && {
              name: 'selectedData',
              child: intl.get(`sbsm.common.button.selectedCreate`).d('勾选新建'),
              btnProps: {
                loading,
                wait: 1000,
                color: 'primary',
                disabled: noPayPoolSelected,
                onClick: handleSelectedData,
              },
            },
            permissionMap.get('createAll') && {
              name: 'allCreate',
              child: intl.get(`sbsm.common.button.allCreate`).d('全选新建'),
              btnProps: { loading, wait: 1000, onClick: handleCreateAll },
            },
          ] : [
            renderNextBtn({ disabled: noPayPoolSelected, onClick: handleAddLine }),
            skipBtn,
          ]),
          cancelBtn,
        ];
      case 'CONFIRM_PAYMENT_METHOD':
        return [
          renderNextBtn({ onClick: handleCreateSelected }),
          !defaultSelectedFlag && prevBtn,
          cancelBtn,
        ];
      case 'PAY_LINE':
        return statementLineEditPoint === 'APPROVE' ? lastStepBtns : [
          renderNextBtn({ onClick: handleSavePayLine }),
          prevBtn,
          skipBtn,
          cancelBtn,
        ];
      case 'PAY_STATEMENT_LINE':
        return lastStepBtns;
      default:
        return [prevBtn];
    };
  }, [
    loading,
    stepName,
    noDocFlag,
    batchFlag,
    handleCancel,
    handleAddLine,
    handleCreateAll,
    handleStepChange,
    handleSingleSave,
    handleSavePayLine,
    noPayPoolSelected,
    handleBatchSubmit,
    handleSingleSubmit,
    handleSelectedData,
    defaultSelectedFlag,
    noHeaderListSelected,
    handleCreateSelected,
    statementLineEditPoint,
    permissionMap,
  ]);

  const content = useMemo(() => {
    switch (stepName) {
      case 'PAY_POOL_SELECT':
        return <QuotePayPool payPoolDs={payPoolDs} />;
      case 'CONFIRM_PAYMENT_METHOD':
        return <FillPayPoolStep fillPoolDs={fillPoolDs} />;
      case 'PAY_LINE':
        return <PaymentLineStep onPrev={() => handleStepChange('prev')} />;
      case 'PAY_STATEMENT_LINE':
        return <StatementLineStep />;
      default:
        return null;
    }
  }, [stepName, payPoolDs, fillPoolDs, handleStepChange]);

  const onHeaderListIndexChange = useCallback(
    ({ record }) => {
      const payHeaderId = record?.get('payHeaderId');
      headerDs.setQueryParameter('payHeaderId', payHeaderId);
      headerDs.query(undefined, undefined, true);
    },
    [headerDs]
  );

  useEffect(() => {
    headerListDs.addEventListener('indexChange', onHeaderListIndexChange);
    return () => {
      headerListDs.removeEventListener('indexChange', onHeaderListIndexChange);
    };
  }, [headerListDs, onHeaderListIndexChange]);

  const contentRender = () => {
    return (
      <div className={commonStyles['create-steps-wrapper']}>
        <div className={commonStyles['create-steps-bar']}>
          <Steps size="small" current={stepIndex}>
            {stepList.map(({ title, name }) => (
              <Step title={title} key={name} />
            ))}
          </Steps>
        </div>
        <div className={commonStyles["create-steps-content"]}>
          {content}
        </div>
      </div>
    );
  };

  const handleChangeSelecion = useCallback((val: boolean, record?: any) => {
    if (record) {
      return val ? headerListDs.select(record) : headerListDs.unSelect(record);
    } else {
      return val ? headerListDs.selectAll() : headerListDs.unSelectAll();
    }
  }, [headerListDs]);

  const tabBarExtraRender = useCallback(() => {
    let checked = false;
    let indeterminate = false;
    if (!isEmpty(headerListDs.selected)) {
      checked = headerListDs.selected.length === headerListDs.length;
      indeterminate = !checked;
    }
    return (
      <CheckBox indeterminate={indeterminate} checked={checked} onChange={(val) => handleChangeSelecion(val)}>
        <span className={styles['tab-bar-extra-title']}>{intl.get('sbsm.common.view.message.payDoc').d('支付单')}</span>
      </CheckBox>
    );
  }, [headerListDs, handleChangeSelecion]);

  const paneTabRender = useCallback((record) => {
    return (
      <Fragment>
        <CheckBox onClick={(e) => e.stopPropagation()} checked={record.isSelected} onChange={(val) => handleChangeSelecion(val, record)} />
        <span className={styles['checkbox-outter-label']}>{record.get('payNum')}</span>
      </Fragment>
    );
  }, [handleChangeSelecion]);

  return (
    <Fragment>
      <Spin spinning={loading}>
        {batchFlag ? (
          <Tabs
            tabPosition={TabsPosition.left}
            defaultActiveKey="0"
            onChange={handleSetActiveKey}
            tabBarExtraContent={tabBarExtraRender()}
            className={styles['create-left-tabs-payDoc']}
            activeKey={headerListDs.currentIndex.toString()}
          >
            {headerListDs.map((record, index) => {
              return (
                <TabPane
                  tab={paneTabRender(record)}
                  key={index.toString()}
                  disabled={record.get('step') === 'END'}
                >
                  {contentRender()}
                </TabPane>
              );
            })}
          </Tabs>
        ) : contentRender()}
      </Spin>
      <div className="sbsm-body-footer">
        <DynamicButtons defaultBtnType="c7n-pro" buttons={buttons} />
      </div>
    </Fragment>
  );
});

const PaymentWorkbenchCreate = (props) => <StoreProvider stepFlag {...props}><Create /></StoreProvider>;

export default PaymentWorkbenchCreate;
