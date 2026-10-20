import React, { useMemo, useContext, useCallback, useEffect, Fragment, useState } from 'react';
import { observer } from 'mobx-react';
import { Steps, Collapse } from 'choerodon-ui';
import { Modal, Dropdown, Button, Icon, useModal } from 'choerodon-ui/pro';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { Placements } from 'choerodon-ui/pro/lib/dropdown/enum';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { isEmpty, isNil } from 'lodash';
import classnames from 'classnames';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import { Header, Content } from 'components/Page';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import { unitValidate } from '../../../../utils/utils';
import { stepbBtns } from '../../../../utils/utils';
import { useModalOpen } from '../../../../utils/hooks';
import type {
  CreateStoreValueType,
} from '../Detail/stores';
import {
  Store,
} from '../Detail/stores';
import SceneInfo from '../components/SceneInfo';
import ApplyRange from '../components/ApplyRange';
import TrigerCondition from '../components/TriggerCondition';
import CalculateRule from '../components/CalculateRule';
import DetailContent from '../Detail/DetailContent';
import { getEffectiveData } from '../Detail/stores/mainDS';
import HistoryVersion from '../../../../component/HistoryRecord/Version';
import OperateRecord from '../../../../component/HistoryRecord';
import { renderBubblePrompt } from '../../../../utils/renderer';

import styles from './index.less';
import Style from '../../../common.less';

const { Step } = Steps;
const { Panel } = Collapse;

const organizationId = getCurrentOrganizationId();

type BtnType = "h0" | "c7n" | "c7n-pro" | undefined;

// 保存头信息的当前字段校验
const baseInfoFields = [
  'ruleNum',
  'ruleName',
  'scenarioConfigIdLov',
  'date',
  'sourceType',
  'versionNumber',
  'ruleStatus'];

const HistoryBtn = observer(props => {
  const { ruleNum, onClick, ruleId } = props;
  return (
    <Dropdown
      placement={Placements.bottomRight}
      overlay={
        <HistoryVersion
          primaryKey="ruleId"
          onClick={onClick}
          readTransport={{
            url: `/spcm/v1/${organizationId}/pfp-rule/history/page?ruleNum=${ruleNum}&ruleId=${ruleId}&page=0`,
            method: 'GET',
          }}
          fieldsConfig={{
            userName: { alias: 'createdByName' },
            // versionNumber: { alias: undefined },
            loginName: {
              alias: 'createdByLoginName',
            },
            time: { alias: 'creationDate' },
          }}
        />
      }
    >
      <Button funcType={FuncType.flat} icon="schedule">
        {intl.get('hzero.common.button.historyVersion').d('历史版本')}
        <Icon type="expand_more" />
      </Button>
    </Dropdown>
  );
});

export default observer(() => {

  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const {
    modal,
    ruleDs,
    applyRangeDs,
    cumulativeSingleLineDs,
    cumulativeMultiLineDs,
    cumulativeLineDs,
    stepNameList,
    handleToDetail,
    defaultCurrentStep,
    loading,
    majorPcNum,
    editable,
    setEditFlag,
    changeFlag,
    discountLineDs,
    state,
    editFlag,
    addFlag,
    historyFlag,
    handleEdit,
    viewFlag,
    routeEditFlag,
    historyVersionNums,
    history,
    discountRemote,
    notPub,
    location,
    isReadOnly,
  } = useContext<CreateStoreValueType>(Store);

  const { ruleNum, ruleId, ruleStatus, stepEndFlag } = ruleDs?.current?.get(['ruleNum', 'ruleId', 'ruleStatus', 'stepEndFlag']) || {};
  const [bubblePrompt, setBubblePrompt] = useState('');

  // 每个step下的显示【表单】字段的columns(包括字段的必输，禁用，默认值)
  // 计算规则表单字段
  const [triggerDisplayFields, issueDisplayFields, calculateFields] = [
    ruleDs.getState('triggerDisplayFields'),
    ruleDs.getState('issueDisplayFields'),
    ruleDs.getState('calculateFields'),
  ];

  useEffect(() => {
    const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
    const curStepName = defaultCurrentStep;
    // 获取当前step的index
    const stepCurrent = curStepName ? effectiveStepList.findIndex(item => item.name === curStepName) : 0;
    ruleDs.setState('stepCurrent', stepCurrent);

  }, [ruleDs, defaultCurrentStep, stepNameList]);

  const stepCurrent = ruleDs.getState('stepCurrent') || 0;

  const handleNext = useCallback(
    (stride = 1) => {
      ruleDs.setState('stepCurrent', stepCurrent + stride);
      const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
      if (effectiveStepList?.[stepCurrent + stride]?.name === 'END') {
        if (majorPcNum) {
          // 协议保存过后，展示全部内容:只读
          setEditFlag(false);
          // 重新查询数据
          ruleDs.query();
        }
      }
    },
    [ruleDs, stepCurrent, majorPcNum, setEditFlag],
  );

  const handleCumulativeLine = useCallback(async () => {
    if (discountRemote?.event) {
      discountRemote.event.fireEvent('handleCuxCumulativeLine', { ruleDs, applyRangeDs, cumulativeLineDs, getEffectiveData });
    }
  }, [applyRangeDs, ruleDs, cumulativeLineDs, discountRemote?.event]);

  /**
   *
   * 【新建】为了维持头行信息结构，所有表单字段公用一个ds，所以每个step校验时，只能通过当前的表单字段校验
   */
  const handleAction = useCallback(
    async (headerValidateFields = undefined, lineDs, stride = 1) => {
      const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
      let headValidateFlag = true;
      let lineValidateFlag = true;
      if (!headerValidateFields) {
        // 如果headerValidateFields ===undefined,默认校验全部信息
        headValidateFlag = await ruleDs.validate();
      }
      // 1.校验头,行信息
      if (headerValidateFields?.length) {
        headValidateFlag = await unitValidate(ruleDs, headerValidateFields);
      }
      if (lineDs) {
        lineValidateFlag = await lineDs.validate();
      }
      if (!headValidateFlag || !lineValidateFlag) return false;
      // 保存step
      const step = effectiveStepList?.[stepCurrent + stride]?.name;
      // eslint-disable-next-line no-unused-expressions
      ruleDs?.current?.init('step', effectiveStepList?.[stepCurrent + stride]?.name);
      await handleCumulativeLine();
      // 2.保存
      ruleDs.setState('action', 'save');
      const currentStep = effectiveStepList?.[stepCurrent]?.name;
      let res;
      try {
        // 保存，上一步，不校验规则互斥
        if (!stride && ruleDs?.current?.set) {
          ruleDs.current.set({ updateCheck: 0 });
        }
        ruleDs.status = DataSetStatus.loading;
        let res;
        try {
          res = await ruleDs.setState({source: ruleDs?.current?.get('ruleId') ? 'update' : 'create', currentStep }).forceSubmit();
        } catch (e) {
          res = e;
        }
        // 3.下一步
        // 保存，上一步，允许校验失败后仍然能保存，所以需要重新请求数据，防止数据超时
        // 到计算规则和生成折扣规则step的时候，允许校验失败后仍然能保存，所以需要重新请求数据，防止数据超时
        if (res && res.content && !isEmpty(res.content) || !isNil(ruleDs.current?.get('updateCheck')) || ['CALCULATE_RULE', 'END'].includes(step)) {
          // 如果跳转到【适用维度】和【累计维度】，需要重新查询维度行数据，因为更新信息后返回的维度行数据不是最新的
          ruleDs.setState('ruleId', res?.content?.[0]?.ruleId || ruleDs?.current?.get('ruleId')).query();

          // 适用范围互斥允许保存成功，但是不允许到下一步。
          if (stride && (res && res.content && !isEmpty(res.content) || !isNil(ruleDs.current?.get('updateCheck')))) handleNext(stride);
        }
      } finally {
        ruleDs.status = DataSetStatus.ready;
      }
      return res;
    },
    [ruleDs, handleNext, stepCurrent, handleCumulativeLine],
  );

  const handleFinal = useCallback(
    async (action: string) => {
      const { enableFlag } = ruleDs?.current?.get(['enableFlag']) || {};
      const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
      // 1.校验头信息
      const validateFlag = await unitValidate(ruleDs, issueDisplayFields || []);
      if (!validateFlag) return;
      // 发布埋点
      if (discountRemote?.event) {
        const res = await discountRemote.event.fireEvent('handleCuxFinal', { action, ruleDs });
        if (!res) {
          return;
        }
      }
      if (action === 'publish' && enableFlag === 0) {
        const feedback = await Modal.confirm({
          title: intl.get('spfp.common.view.title.tip').d('提示'),
          children: intl
            .get('spfp.common.view.message.confirmEnable')
            .d('当前规则为禁用状态，发布后规则会变更为已发布状态，确认发布新版本吗？'),
        });
        if (feedback !== 'ok') return;
      }
      // 保存step
      // eslint-disable-next-line no-unused-expressions
      ruleDs?.current?.init('step', effectiveStepList?.[stepCurrent]?.name);
      let res;
      // 2.发布，保存
      try {
        ruleDs.status = DataSetStatus.loading;
        res = await (action === 'publish' ?
          ruleDs.setState('action', action) :
          ruleDs.setState('source', 'update'))
          .forceSubmit();
        // 3.关闭弹窗，跳转详情
        if (res?.content?.length) {
          if (action === 'publish') {
            notification.success({});
            // 跳转至列表
            history.push({
              pathname: `/spfp/rule-maintenance/discount/list`,
            });
          } else {
            // 协议保存按钮,走下一步
            handleNext();
          }
        }
      } finally {
        ruleDs.status = DataSetStatus.ready;
      }
    },
    [ruleDs, issueDisplayFields, stepCurrent, handleNext, history, discountRemote],
  );

  // 计算规则提交
  const handleCalculate = useCallback(
    async (stride = 1) => {
      const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
      // 1.校验当前头行信息
      // 1.1校验头信息
      const headValidateFlag = await unitValidate(ruleDs, calculateFields);
      // 1.2校验行信息
      // 1.2.1每行信息
      let lineValidateFlag = true;
      if (ruleDs?.current?.get('cumulativeRule')) {
        const calculateLineDs = ruleDs.getState('isLadder') ? cumulativeMultiLineDs : cumulativeSingleLineDs;
        lineValidateFlag = await calculateLineDs.validate();
      }
      // 1.2.2累计维度
      const dimesionlineValidateFlag = await cumulativeLineDs.validate();
      if (!headValidateFlag || !lineValidateFlag || !dimesionlineValidateFlag) return false;
      // 保存step
      // eslint-disable-next-line no-unused-expressions
      ruleDs?.current?.init('step', effectiveStepList?.[stepCurrent + stride]?.name);
      // 2.保存
      let res;
      try {
        ruleDs.status = DataSetStatus.loading;
        ruleDs.setState('action', 'save');
        res = await ruleDs.setState('source', 'update').forceSubmit();
        if (res && res.content && !isEmpty(res.content)) {

          ruleDs.query();
          if (stride) handleNext(stride);
        }
      } finally {
        ruleDs.status = DataSetStatus.ready;
      }
      return res;
    },
    [
      stepCurrent,
      ruleDs,
      handleNext,
      cumulativeSingleLineDs,
      cumulativeMultiLineDs,
      cumulativeLineDs,
      calculateFields,
    ],
  );

  // 取消
  const handleCancel = useCallback(() => {
    if (discountLineDs) discountLineDs.query(undefined, undefined, false);
    modal.close();

  }, [modal, discountLineDs]);

  const handleConfirm = useCallback(async () => {
    const validateFlag = await ruleDs?.current?.validate();
    if (!validateFlag) return false;
    //  提示
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('spfp.ruleMaintenance.message.confirm.saveWarning').d('确定保存?'),
      onOk: async () => {
        const saveRes = await ruleDs.submit();
        if (saveRes) modal.close();
      },
    });
  }, [modal, ruleDs]);

  const saveInfoByStep = useCallback(async (step, stride) => {
    let res = false;
    switch (step) {
      case "DISCOUNT_SCENE": res = await handleAction(baseInfoFields, undefined, stride); break;
      case "APPLICATION_SCOPE": res = await handleAction([], applyRangeDs, stride); break;
      case "TRIGGER_CONDITION": res = await handleAction(triggerDisplayFields || [], undefined, stride); break;
      case "CALCULATE_RULE": res = await handleCalculate(stride); break;
      default: res = true; break;
    }
    return res;
  }, [applyRangeDs, handleAction, handleCalculate, triggerDisplayFields]);

  const handleOperationRecord = useCallback(() => {
    modalOpen({
      size: 'medium',
      editFlag: false,
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      children: <OperateRecord
        approvalProps={{ documentId: ruleId, documentType: 'SRM_SPCM_RULE' }}
        operationProps={{
          primaryKey: 'ruleId',
          documentName: intl.get(`spfp.ruleMaintenance.view.title.ruleMaintenance.discount`).d('返利规则维护'),
          readTransport: {
            url: `/spcm/v1/${organizationId}/rule-actions/${ruleId}`,
            method: 'GET',
          },
          fieldsConfig: {
            userName: { alias: 'processUser' },
            time: { alias: 'processDate' },
            typeName: { alias: 'processStatusMeaning' },
            remark: { alias: 'processRemark' },
          },
        }}
      />,
    });
  }, [modalOpen, ruleId]);


  const notStepBtns = useMemo(() => {
    const btns = [!historyFlag
      && !(['PUBLISHED', 'CANCELED', 'WAITING_APPROVAL'].includes(ruleDs?.current?.get('ruleStatus')))
      && !['PROTOCOL'].includes(ruleDs?.current?.get('sourceType')) && !isReadOnly && {
      name: 'edit',
      btnType: 'c7n-pro' as BtnType,
      btnProps: {
        icon: 'drive_file_rename_outline-o',
        // funcType: FuncType.flat,
        color: 'primary',
        onClick: handleEdit,
        loading,
        wait: 1500,
      },
      child: intl.get('hzero.common.button.edit').d('编辑'),
    }, !addFlag && {
      name: 'operation',
      child: intl.get('hzero.common.button.operating').d('操作记录'),
      btnProps: {
        icon: 'operation_service_request',
        funcType: 'flat',
        color: 'default',
        loading,
        onClick: handleOperationRecord,
      },
    }].filter(item => item);
    return discountRemote
      ? discountRemote.process('SPFP_DISCOUNT_DETAIL_NOTSTEPBTNS', btns, {
        ruleDs,
      })
      : btns;
  }, [handleEdit, loading, historyFlag, ruleDs, handleOperationRecord, addFlag, discountRemote, isReadOnly]);

  const stepList = useMemo(() => {
    const okBtn = (props) => {
      const { name, child, onClick, ...otherProps } = props || {};
      return {
        name: name || 'save',
        child: child || intl.get(`hzero.common.button.save`).d('保存'),
        btnProps: {
          onClick,
          wait: 1500,
          loading,
          ...otherProps,
        },
      };
    };

    const publishBtn = () => {
      return {
        name: 'publish',
        child: intl.get('spfp.common.button.publish').d('发布'),
        btnProps: {
          onClick: () => handleFinal('publish'),
          color: 'primary',
          loading,
          wait: 1500,
          icon: !modal ? 'publish2' : '',
        },
      };
    };

    const cancelBtn = (props) => {
      const { name, child, ...otherProps } = props || {};
      return {
        name: name || 'cancel',
        child: child || intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          onClick: handleCancel,
          ...otherProps,
        },
      };
    };

    const prevBtn = (props) => {
      const { funcType, color } = props || {};
      return {
        name: 'prevStep',
        child: intl.get(`spfp.common.button.prevStep`).d('上一步'),
        btnProps: {
          onClick: () => {
            const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
            if (effectiveStepList?.[stepCurrent]?.name === 'END' && majorPcNum) {
              setEditFlag(true);
            }
            ruleDs.setState('stepCurrent', stepCurrent - 1);
            ruleDs.setState('ruleId', ruleDs?.current?.get('ruleId')).query();
          },
          funcType: funcType || modal ? undefined : 'flat',
          icon: modal ? undefined : 'arrow_back',
          color,
        },
      };
    };

    const nextBtn = (props) => {
      const { btnText = intl.get(`spfp.common.button.nextStep`).d('下一步'), ...btnPorps } = props;
      return {
        name: 'nextStep',
        child: btnText,
        btnProps: {
          color: 'primary',
          icon: modal ? '' : "arrow_forward",
          wait: 1500,
          ...btnPorps,
          loading,
        },
      };
    };

    const baseInfoBtns = [
      nextBtn({
        onClick: () => handleAction(baseInfoFields, undefined),
      }),
      modal && cancelBtn({}),
    ];

    const triggerBtns = [
      nextBtn({
        onClick: () => handleAction(triggerDisplayFields || [], undefined),
      }),
      prevBtn({}),
      modal && cancelBtn({}),
      !modal && okBtn({ onClick: () => handleAction(triggerDisplayFields || [], undefined, false), icon: 'save', funcType: 'flat' }),
    ];

    const applyBtns = [
      nextBtn({ onClick: () => handleAction([], applyRangeDs) }),
      prevBtn({}),
      modal && cancelBtn({}),
      !modal && okBtn({ onClick: () => handleAction([], applyRangeDs, false), icon: 'save', funcType: 'flat' }),
    ];

    const calculateBtns =
      [
        nextBtn({ onClick: () => handleCalculate() }),
        prevBtn({}),
        modal && cancelBtn({}),
        !modal && okBtn({ onClick: () => handleAction(undefined, undefined, false), icon: 'save', funcType: 'flat' }),
      ];

    const endBtns = modal ? changeFlag ? [okBtn({
      name: 'confirm',
      child: intl.get('hzero.common.button.ok').d('确定'),
      onClick: handleConfirm,
      color: 'primary',

    }),
    cancelBtn({}),
    ] : [
      cancelBtn({
        name: 'confirm',
        child: editable ? intl.get('hzero.common.button.ok').d('确定') : intl.get('hzero.common.btn.close').d('关闭'),
        color: 'primary',
      }),
      editable ? prevBtn({}) : null,
      editable ? cancelBtn({}) : null,
    ]
      : [
        (addFlag || routeEditFlag) && publishBtn(),
        prevBtn({}),
        okBtn({ onClick: () => handleAction(undefined, undefined, false), icon: 'save', funcType: 'flat' }),
      ];

    const list = [
      {
        title: intl.get('spfp.ruleMaintenance.detail.card.title.discountScenario').d('折扣场景'),
        name: 'DISCOUNT_SCENE',
        content: <SceneInfo />,
        footerBtns: baseInfoBtns,
      },
      {
        title: intl.get('spfp.ruleMaintenance.view.title.create.triggerCondition').d('触发条件'),
        name: 'TRIGGER_CONDITION',
        content: <TrigerCondition />,
        footerBtns: triggerBtns,
      },
      {
        title: intl.get('spfp.ruleMaintenance.view.title.create.applyRange').d('适用范围'),
        header: <span>{intl.get('spfp.ruleMaintenance.view.title.create.applyRange').d('适用范围')}{renderBubblePrompt(bubblePrompt)}</span>,
        name: 'APPLICATION_SCOPE',
        content: <ApplyRange setBubblePrompt={setBubblePrompt} />,
        footerBtns: applyBtns,
      },
      {
        title: intl.get('spfp.ruleMaintenance.view.title.create.calculationRules').d('计算规则'),
        name: 'CALCULATE_RULE',
        content: <CalculateRule />,
        footerBtns: calculateBtns,
      },
      {
        title:
          changeFlag
            ? intl.get('spfp.ruleMaintenance.detail.title.changeDiscountRule').d('变更折扣规则')
            : intl.get('spfp.ruleMaintenance.view.title.create.discountRule').d('生成返利规则'),
        name: 'END',
        content: <DetailContent />,
        footerBtns: endBtns,
      },
    ];
    return list;

  }, [
    ruleDs,
    triggerDisplayFields,
    handleFinal,
    handleAction,
    handleCalculate,
    stepCurrent,
    applyRangeDs,
    handleCancel,
    loading,
    majorPcNum,
    editable,
    setEditFlag,
    changeFlag,
    handleConfirm,
    modal,
    addFlag,
    routeEditFlag,
    bubblePrompt,
  ]);

  const effectiveStepList = useMemo(() => {
    const effectiveList = stepList.filter(stepObj => {
      const { name } = stepObj || {};
      return stepNameList.some(step => step === name);
    });
    ruleDs.setState('effectiveStepList', effectiveList);

    return effectiveList;

  }, [stepList, stepNameList, ruleDs]);

  const onStepChange = useCallback(async (current) => {
      if (current < stepCurrent || Number(stepEndFlag) === 1) {
        if (current - stepCurrent < 0 && ruleDs?.current) {
          ruleDs.current.set('updateCheck', 0);
        }
      const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
      // 保存当前tab
      const res = await saveInfoByStep(effectiveStepList[stepCurrent]?.name, current - stepCurrent);
      if (res) {
        ruleDs.setState('stepCurrent', current);
      }
    }
  }, [ruleDs, saveInfoByStep, stepCurrent, stepEndFlag]);

  const handleViewHistory = useCallback(({ record }) => {
    handleToDetail(record.toData(), 'history');
  }, [handleToDetail]);

  const title = addFlag
    ? intl.get('spfp.ruleMaintenance.detail.title.addDiscountRule').d('新建折扣规则')
    : editFlag || routeEditFlag
      ? intl.get('spfp.ruleMaintenance.detail.title.editDiscountRule').d('编辑折扣规则明细')
      : intl.get('spfp.ruleMaintenance.detail.title.viewDiscountRule').d('查看折扣规则明细');

  const backPath = state?.backPath || "/spfp/rule-maintenance/discount/list";
  const getBackPath = () => {
      const isAuthorized = location?.pathname?.includes('other-detail');
      return isAuthorized ? null : backPath;
  };

  return !modal ? (
    <Fragment>
      {
        notPub && (
          <Header
            title={title}
            backPath={getBackPath()}
            onBack={() => {
              if (notPub && state?.backPath) {
                updateTab({
                  key: getActiveTabKey(),
                  search: backPath?.split('?')[1],
                  state: null,
                });
              }
            }}
          >
            {<DynamicButtons maxNum={5} defaultBtnType="c7n-pro" buttons={viewFlag ? notStepBtns : stepbBtns(effectiveStepList[stepCurrent]?.footerBtns)} />}
            {ruleStatus === 'PUBLISHED' &&
              historyVersionNums > 0 &&
              <HistoryBtn ruleNum={ruleNum} ruleId={ruleId} onClick={handleViewHistory} />}
          </Header>
        )
      }
      {
        !viewFlag && notPub ? (
          <div className={classnames(Style['spfp-detail-content'], styles['spfp-rule-content'])}>
            <Content
              wrapperClassName='amount-summary-notfix-content-wrapper fixed-content-wrapper'
            >
              <Steps
                current={stepCurrent}
                onChange={onStepChange}
              >
                {effectiveStepList.map(({ title, name }, index) => (
                  <Step title={title} status={stepEndFlag === 1 ? (index === stepCurrent ? 'process' : 'finish') : undefined} key={name} />
                ))}
              </Steps>
            </Content>
            <div className='spfp-detail-collapse-content spfp-rule-collapse-content'>
              <Collapse
                ghost
                trigger="icon"
                expandIconPosition="text-right"
                defaultActiveKey={['content']}
              >
                {
                  effectiveStepList[stepCurrent]?.name !== 'END' && (
                    <Panel showArrow={false} header={effectiveStepList[stepCurrent]?.header || effectiveStepList[stepCurrent]?.title} key='content'>
                      {effectiveStepList[stepCurrent]?.content}
                    </Panel>
                  )}
                {effectiveStepList[stepCurrent]?.name === 'END' && effectiveStepList[stepCurrent]?.content}
              </Collapse>
            </div>
          </div>
        ) : (
          <Content className={Style['spfp-collapse-content']}>
            {effectiveStepList[effectiveStepList.length - 1]?.content}
          </Content>
        )
      }
    </Fragment>
  ) : (
    <div className={styles['create-steps-wrapper']}>
      {
        editable && (
          <Steps
            current={stepCurrent}
            // size="small"
            style={{ paddingBottom: 16 }}
            onChange={onStepChange}
          >
            {effectiveStepList.map(({ title, name }, index) => (
              <Step title={title} status={stepEndFlag === 1 ? (index === stepCurrent ? 'process' : 'finish') : undefined} key={name} />
            ))}
          </Steps>
        )
      }
      <div className="create-steps-content">{effectiveStepList[stepCurrent]?.content}</div>
      <div className="spfp-body-footer">
        <DynamicButtons buttons={stepbBtns(effectiveStepList[stepCurrent]?.footerBtns)} />
      </div>
    </div>
  );
});
