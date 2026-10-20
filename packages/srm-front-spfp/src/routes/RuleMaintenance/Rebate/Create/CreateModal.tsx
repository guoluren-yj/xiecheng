import React, { useMemo, useContext, useCallback, useEffect, Fragment, useState } from 'react';
import { observer } from 'mobx-react';
import { Steps, Collapse, Spin } from 'choerodon-ui';
import { Modal, Dropdown, Button, Icon, useModal } from 'choerodon-ui/pro';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { Placements } from 'choerodon-ui/pro/lib/dropdown/enum';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { isEmpty, throttle } from 'lodash';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import { Header, Content } from 'components/Page';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import classnames from 'classnames';

import { unitValidate, stepbBtns, getValidationResponse } from '../../../../utils/utils';
import { ruleUpdateValidate, rulePublishValidate } from '../utils/api';
import type {
  CreateStoreValueType,
} from '../Detail/stores';
import
{
  Store,
} from '../Detail/stores';
import SceneInfo from '../components/SceneInfo';
import ApplyRange from '../components/ApplyRange';
import TrigerCondition from '../components/TrigerCondition';
import CalculateRule from '../components/CalculateRule';
import IssueRuleForm from '../components/IssueRuleForm';
import DetailContent from '../Detail/DetailContent';
import HistoryVersion from '../../../../component/HistoryRecord/Version';
import Computation from '../components/Computation';
import { useModalOpen } from '../../../../utils/hooks';
import OperateRecord from '../../../../component/HistoryRecord';
import Approve from '../components/Approve';
import styles from './index.less';
import Style from '../../../common.less';
import { renderBubblePrompt } from '../../../../utils/renderer';

const { Step } = Steps;
const { Panel } = Collapse;

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

const HistoryBtn = observer(props =>
{
  const { ruleNum, onClick, ruleId } = props;
  return (
    <Dropdown
      placement={Placements.bottomRight}
      overlay={
        <HistoryVersion
          primaryKey="ruleId"
          onClick={onClick}
          readTransport={{
            url: `/ssta/v1/${getCurrentOrganizationId()}/rules/history/page?ruleNum=${ruleNum}&ruleId=${ruleId}&page=0`,
            method: 'GET',
          }}
          fieldsConfig={{
            userName: { alias: 'publishedByName' },
            // versionNumber: { alias: undefined },
            loginName: {
              alias: 'publishedLoginName',
            },
            time: { alias: 'publishedDate' },
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

export default observer(() =>
{
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
    rebateLineDs,
    majorPcNum,
    editable,
    setEditFlag,
    changeFlag,
    state,
    editFlag,
    addFlag,
    historyFlag,
    handleEdit,
    viewFlag,
    routeEditFlag,
    historyVersionNums,
    history,
    approveFlag,
    permissionDs,
    notPub,
    isReadOnly,
  } = useContext<CreateStoreValueType>(Store);
  const { ruleNum, ruleId, ruleStatus, stepEndFlag, confirmApproveMethod } = ruleDs?.current?.get(['ruleNum', 'ruleId', 'ruleStatus', 'stepEndFlag', 'confirmApproveMethod']) || {};
  const { approveBtn, returnBtn } = permissionDs.current?.get(['approveBtn', 'returnBtn']);
  const [bubblePrompt, setBubblePrompt] = useState('');

  // 每个step下的显示【表单】字段的columns(包括字段的必输，禁用，默认值)
  // 计算规则表单字段
  const [triggerDisplayFields, issueDisplayFields, calculateFields] = [
    ruleDs.getState('triggerDisplayFields'),
    ruleDs.getState('issueDisplayFields'),
    ruleDs.getState('calculateFields'),
  ];

  useEffect(() =>
  {
    const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
    const curStepName = defaultCurrentStep;
    // 获取当前step的index
    const stepCurrent = curStepName ? effectiveStepList.findIndex(item => item.name === curStepName) : 0;
    ruleDs.setState('stepCurrent', stepCurrent);
    // 记录在调用保存接口之前，要跳转到的step
    ruleDs.setState('beforeNextStep', stepCurrent);

  }, [ruleDs, defaultCurrentStep, stepNameList]);

  const stepCurrent = ruleDs.getState('stepCurrent') || 0;

  const handleNext = useCallback(
    () =>
    {
      ruleDs.setState('stepCurrent', stepCurrent + 1);
      ruleDs.setState('beforeNextStep', stepCurrent + 1);
      const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
      // if (effectiveStepList?.[stepCurrent + 1]?.name === 'CALCULATE_RULE')
      // {
      //   // 重新查询累计行,带出行默认值
      //   cumulativeLineDs.query();
      // }
      if (effectiveStepList?.[stepCurrent + 1]?.name === 'END')
      {
        if (majorPcNum)
        {
          // 协议保存过后，展示全部内容:只读
          setEditFlag(false);
          // 重新查询数据
          ruleDs.query();
        }
      }
    },
    [ruleDs, stepCurrent, majorPcNum, setEditFlag],
  );


  /**
   *
   * 【新建】为了维持头行信息结构，所有表单字段公用一个ds，所以每个step校验时，只能通过当前的表单字段校验
   */
  const handleAction = useCallback(
    async (headerValidateFields = undefined, lineDs, isNext = true, isSave = false) =>
    {
      const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
      let headValidateFlag = true;
      let lineValidateFlag = true;
      if (!headerValidateFields)
      {
        // 如果headerValidateFields ===undefined,默认校验全部信息
        headValidateFlag = await ruleDs.validate();
      }
      // 1.校验头,行信息
      if (headerValidateFields?.length)
      {
        headValidateFlag = await unitValidate(ruleDs, headerValidateFields);
      }
      if (lineDs)
      {
        lineValidateFlag = await lineDs.validate();
      }
      if (!headValidateFlag || !lineValidateFlag) return false;
      // 保存step
      // eslint-disable-next-line no-unused-expressions
      ruleDs?.current?.init('step', effectiveStepList?.[isNext ? stepCurrent + 1 : (ruleDs.getState('beforeNextStep') || 0)]?.name);
      // 2.保存
      ruleDs.setState('action', 'save');
      const currentStep = effectiveStepList?.[stepCurrent]?.name;

      // 执行校验后保存，或新建保存
      const handleValidateAfterSubmit = async() => {
        let res;
        try
        {
          ruleDs.status = DataSetStatus.loading;
          res = await ruleDs.setState('currentStep', currentStep).setState('source', ruleDs?.current?.get('ruleId') ? 'update' : 'create').forceSubmit();
          // 3.下一步
          if (res && res.content && !isEmpty(res.content))
          {
            // 加载数据
            // eslint-disable-next-line no-unused-expressions
            // 重新查询数据
            // 如果跳转到【适用维度】和【累计维度】，需要重新查询维度行数据，因为更新信息后返回的维度行数据不是最新的
            ruleDs.setState('ruleId', res.content[0].ruleId).query();
            if (isNext) handleNext();
            if (isSave) notification.success({});
          }
        } finally
        {
          ruleDs.status = DataSetStatus.ready;
        }
        return res;
      };
      if (ruleDs?.current?.get('ruleId')) {
        ruleDs.status = DataSetStatus.loading;
        const validateRes = getResponse(await ruleUpdateValidate({...ruleDs?.current?.toData(), currentStep}));
        ruleDs.status = DataSetStatus.ready;
        if (!validateRes) return false;
        return getValidationResponse(validateRes, handleValidateAfterSubmit);
      } else return handleValidateAfterSubmit();
    },
    [ruleDs, handleNext, stepCurrent],
  );

  const handleFinal = useCallback(
    async (action: string) =>
    {
      const { enableFlag } = ruleDs?.current?.get(['enableFlag']) || {};
      const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
      // 1.校验头信息
      const validateFlag = await unitValidate(ruleDs, issueDisplayFields || []);
      if (!validateFlag) return;
      if (action === 'publish' && enableFlag === 0)
      {
        const feedback = await Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl
            .get('spfp.ruleMaintenance.view.message.disabledParentStrategyReleaseTip')
            .d('当前规则为禁用状态，发布后将直接生效变为“已发布”，请确认是否发布'),
        });
        if (feedback !== 'ok') return;

      }
      // 保存step
      // eslint-disable-next-line no-unused-expressions
      ruleDs?.current?.init('step', effectiveStepList?.[stepCurrent]?.name);
      const handleValidateAfterSubmit = async() => {
        let res;
        // 2.发布，保存
        try
        {
          ruleDs.status = DataSetStatus.loading;
          res = await (action === 'publish' ?
            ruleDs.setState('action', action) :
            ruleDs.setState('source', 'update'))
            .forceSubmit();
          // 3.关闭弹窗，跳转详情
          if (res?.content?.length)
          {
            if (action === 'publish')
            {
              notification.success({});
              // 跳转至列表
              history.push({
                pathname: `/spfp/rule-maintenance/rebate/list`,
              });
            } else
            {
              // 协议保存按钮,走下一步
              handleNext();
            }
          }
        } finally
        {
          ruleDs.status = DataSetStatus.ready;
        }
      };
      ruleDs.status = DataSetStatus.loading;
      const requestFun = action === 'publish' ? rulePublishValidate : ruleUpdateValidate;
      const validateRes = getResponse(await requestFun(ruleDs?.current?.toData()));
      ruleDs.status = DataSetStatus.ready;
      if (!validateRes) return false;
      return getValidationResponse(validateRes, handleValidateAfterSubmit);
    },
    [ruleDs, issueDisplayFields, stepCurrent, handleNext, history],
  );

  // 计算规则提交
  const handleCalculate = useCallback(
    async (isNext = true, isSave = false) =>
    {
      const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
      // 1.校验当前头行信息
      // 1.1校验头信息
      const headValidateFlag = await unitValidate(ruleDs, calculateFields);
      // 1.2校验行信息
      // 1.2.1每行信息
      let lineValidateFlag = true;
      if (ruleDs?.current?.get('cumulativeRule'))
      {
        const calculateLineDs = ruleDs.getState('isLadder') ? cumulativeMultiLineDs : cumulativeSingleLineDs;
        lineValidateFlag = await calculateLineDs.validate();
      }
      // 1.2.2累计维度
      const dimesionlineValidateFlag = await cumulativeLineDs.validate();

      if (!headValidateFlag || !lineValidateFlag || !dimesionlineValidateFlag) return false;
      // 保存step
      // eslint-disable-next-line no-unused-expressions
      ruleDs?.current?.init('step', effectiveStepList?.[isNext ? stepCurrent + 1 : (ruleDs.getState('beforeNextStep') || 0)]?.name);
      const currentStep = effectiveStepList?.[stepCurrent]?.name;
      const handleValidateAfterSubmit = async() => {
        // 2.保存
        let res;
        try
        {
          ruleDs.status = DataSetStatus.loading;
          ruleDs.setState('action', 'save');
          res = await ruleDs.setState('currentStep', currentStep).setState('source', 'update').forceSubmit();
          if (res && res.content && !isEmpty(res.content))
          {

            ruleDs.query();
            if (isNext) handleNext();
            if (isSave) notification.success({});
          }
        } finally
        {
          ruleDs.status = DataSetStatus.ready;
        }
        return res;
      };
      ruleDs.status = DataSetStatus.loading;
      const validateRes = getResponse(await ruleUpdateValidate({...ruleDs?.current?.toData(), currentStep}));
      ruleDs.status = DataSetStatus.ready;
      if (!validateRes) return false;
      return getValidationResponse(validateRes, handleValidateAfterSubmit);
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
  const handleCancel = useCallback(() =>
  {
    if (rebateLineDs) rebateLineDs.query(undefined, undefined, false);
    modal.close();

  }, [modal, rebateLineDs]);

  const handleConfirm = useCallback(async () =>
  {
    const validateFlag = await ruleDs?.current?.validate();
    if (!validateFlag) return false;
    //  提示
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <div>
          {intl.get('spfp.ruleMaintenance.message.confirm.saveWarning').d('确定保存?')}
        </div>
      ),
      onOk: async () =>
      {
        const saveRes = await ruleDs.submit();
        if (saveRes) modal.close();
      },
    });
  }, [modal, ruleDs]);

  const saveInfoByStep = useCallback(async (step) =>
  {
    let res = false;
    switch (step)
    {
      case "BASE_INFO": res = await handleAction(baseInfoFields, undefined, false); break;
      case "APPLICATION_SCOPE": res = await handleAction([], applyRangeDs, false); break;
      case "TRIGGER_CONDITION": res = await handleAction(triggerDisplayFields || [], undefined, false); break;
      case "CALCULATE_RULE": res = await handleCalculate(false); break;
      case "ORDERING_RULE": res = await handleAction(undefined, undefined, false); break;
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
        approvalProps={{documentId: ruleId, documentType: 'SRM_SPFP_RULE' }}
        operationProps={{
          primaryKey: 'ruleId',
          documentName: intl.get(`spfp.ruleMaintenance.view.title.rebateMaintenance`).d('返利规则维护'),
          readTransport: {
            url: `/ssta/v1/${getCurrentOrganizationId()}/rule-actions/${ruleId}`,
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

  const handleApprovalMethods = useCallback((type: string) => {
    modalOpen({
      drawer: true,
      title: intl.get(`spfp.common.view.message.approvedOpinionTitle`).d('审批意见'),
      closable: true,
      editFlag: true,
      key: Modal.key(),
      className: styles['spfp-small-modal'],
      children: <Approve ruleDs={ruleDs} type={type} />,
    });
  }, [modalOpen, ruleDs]);

  const handleComputation = useCallback(async() => {
    const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
    if(effectiveStepList?.[stepCurrent]?.name === 'CALCULATE_RULE') {
      const headValidateFlag = await unitValidate(ruleDs, calculateFields);
      if (!headValidateFlag) return false;
    }
    modalOpen({
      title: intl.get(`spfp.common.view.title.computation`).d('返利结果模式计算'),
      size: 'small',
      editFlag: true,
      children: <Computation />,
      okText: intl.get(`spfp.common.view.title.startComputation`).d('执行计算'),
    });
  }, [modalOpen, ruleDs, stepCurrent, calculateFields]);

  const computationBtn = useMemo(() => {
    const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
    const code = effectiveStepList[stepCurrent]?.name;
    const showCpmputationFlag = (['CALCULATE_RULE', 'ORDERING_RULE', 'END'].includes(code) && ['UN_PUBLISHED'].includes(ruleStatus)) ||
    (['PUBLISHED', 'WAITING_APPROVAL'].includes(ruleStatus) && viewFlag);
    return [showCpmputationFlag && {
      name: 'edit',
      btnType: 'c7n-pro' as BtnType,
      btnProps: {
        icon: 'document_scanner-o',
        onClick: handleComputation,
        loading,
        wait: 1500,
        funcType: FuncType.flat,
      },
      child: intl.get('spfp.common.button.computation').d('模拟计算'),
    }];
  }, [stepCurrent, ruleDs, ruleStatus, viewFlag, handleComputation, loading]);

  const operateBtns = useMemo(() => {
    return [!addFlag && !modal && {
      name: 'operation',
      child: intl.get('hzero.common.button.operating').d('操作记录'),
      btnProps: {
        icon: 'operation_service_request',
        funcType: 'flat',
        color: 'default',
        loading,
        onClick: handleOperationRecord,
      },
    }];
  }, [handleOperationRecord, loading, addFlag, modal]);


  const notStepBtns = useMemo(() =>
  {
    const showCheck = ['WAITING_APPROVAL'].includes(ruleStatus) && ['FUNCTIONAL'].includes(confirmApproveMethod);
    return [!['WAITING_APPROVAL'].includes(ruleStatus) && !historyFlag
      && !(['PUBLISHED', 'CANCELED'].includes(ruleDs?.current?.get('ruleStatus')))
      && !['PROTOCOL'].includes(ruleDs?.current?.get('sourceType')) && !isReadOnly && {
      name: 'update',
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
    },
    !approveFlag && (approveBtn || returnBtn) && showCheck && !historyFlag && !isReadOnly && {
      name: 'approve',
      child: intl.get('hzero.common.button.shenhe').d('审核'),
      btnProps: {
        type: 'c7n-pro',
        icon: 'authorize',
        color: 'primary',
        onClick: () => handleToDetail({ ruleId }, 'approve'),
      },
    },
    approveFlag && approveBtn && showCheck && !historyFlag && {
      name: 'approveResolve',
      child: intl.get('hzero.common.view.button.confirm').d('确认'),
      btnProps: {
        icon: 'check',
        loading,
        color: 'primary',
        onClick: () => handleApprovalMethods('APPROVED'),
      },
    },
    approveFlag && returnBtn && showCheck && !historyFlag && {
      name: 'approveReject',
      child: intl.get('hzero.common.button.rollback').d('退回'),
      btnProps: {
        icon: 'reply',
        loading,
        funcType: 'flat',
        onClick: () => handleApprovalMethods('REJECTED'),
      },
    }, ...computationBtn, ...operateBtns].filter(item => item);
  }, [handleEdit, loading, historyFlag, ruleDs, approveFlag, ruleId, handleToDetail, handleApprovalMethods, approveBtn, returnBtn, operateBtns, ruleStatus, confirmApproveMethod, computationBtn, isReadOnly]);

  const stepList = useMemo(() =>
  {

    const okBtn = (props) =>
    {
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

    const publishBtn = () =>
    {
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

    const cancelBtn = (props) =>
    {
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

    const prevBtn = (props) =>
    {
      const { funcType, color } = props || {};
      return {
        name: 'prevStep',
        child: intl.get(`spfp.common.button.prevStep`).d('上一步'),
        btnProps: {
          onClick: () =>
          {
            const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
            if (effectiveStepList?.[stepCurrent]?.name === 'END' && majorPcNum)
            {
              setEditFlag(true);
            }
            ruleDs.setState('stepCurrent', stepCurrent - 1);
            ruleDs.setState('beforeNextStep', stepCurrent - 1);
            ruleDs.setState('ruleId', ruleDs?.current?.get('ruleId')).query();
          },
          funcType: funcType || modal ? undefined : 'flat',
          icon: modal ? undefined : 'arrow_back',
          color,
        },
      };
    };

    const nextBtn = (props) =>
    {
      const { btnText = intl.get(`spfp.common.button.nextStep`).d('下一步'), ...btnPorps } = props;
      return {
        name: 'nextStep',
        child: btnText,
        btnProps: {
          color: 'primary',
          icon: modal ? '' : "arrow_forward",
          ...btnPorps,
          loading,
          wait: 1500,
        },
      };
    };

    const baseInfoBtns = [
      nextBtn({
        onClick: () => handleAction(baseInfoFields, undefined),
      }),
      modal && cancelBtn({}),
      ...operateBtns,
    ];

    const applyBtns = [
      nextBtn({ onClick: () => handleAction([], applyRangeDs) }),
      prevBtn({}),
      modal && cancelBtn({}),
      !modal && okBtn({ onClick: () => handleAction([], applyRangeDs, false, true), icon: 'save', funcType: 'flat' }),
      ...operateBtns,
    ];

    const triggerBtns = [
      nextBtn({
        onClick: () => handleAction(triggerDisplayFields || [], undefined),
      }),
      prevBtn({}),
      modal && cancelBtn({}),
      !modal && okBtn({ onClick: () => handleAction(triggerDisplayFields || [], undefined, false, true), icon: 'save', funcType: 'flat' }),
      ...operateBtns,
    ];

    const calculateBtns =
      [
        nextBtn({ onClick: handleCalculate }),
        prevBtn({}),
        modal && cancelBtn({}),
        !modal && okBtn({ onClick: () => handleCalculate(false, true), icon: 'save', funcType: 'flat' }),
        ...computationBtn,
        ...operateBtns,
      ];

    const orderBtns = [
      nextBtn({ onClick: () => handleAction(undefined, undefined, true) }),
      prevBtn({}),
      modal && cancelBtn({}),
      !modal && okBtn({ onClick: () => handleAction(undefined, undefined, false, true), icon: 'save', funcType: 'flat' }),
      ...computationBtn,
      ...operateBtns,
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
        !modal && okBtn({ onClick: () => handleAction(undefined, undefined, false, true), icon: 'save', funcType: 'flat' }),
        ...computationBtn,
        ...operateBtns,
      ];
    const applyTitle = intl.get('spfp.ruleMaintenance.view.title.create.applyRange').d('适用范围');
    const list = [
      {
        title: intl.get('spfp.ruleMaintenance.view.title.create.rebateScene').d('返利场景'),
        name: 'BASE_INFO',
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
        title: applyTitle,
        header: <span>{applyTitle}{renderBubblePrompt(bubblePrompt)}</span>,
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
        title: intl.get('spfp.ruleMaintenance.view.title.create.issueRules').d('出单规则'),
        name: 'ORDERING_RULE',
        content: <IssueRuleForm />,
        footerBtns: orderBtns,
      },
      {
        title:
          changeFlag
            ? intl.get('spfp.ruleMaintenance.detail.title.changeRebateRule').d('变更返利规则')
            : majorPcNum
              ? intl.get('spfp.ruleMaintenance.detail.title.viewRebateRule').d('查看返利规则')
              : intl.get('spfp.ruleMaintenance.view.title.create.generateRule').d('生成返利规则'),
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
    loading,
    handleCancel,
    majorPcNum,
    editable,
    setEditFlag,
    changeFlag,
    handleConfirm,
    modal,
    addFlag,
    routeEditFlag,
    computationBtn,
    operateBtns,
    bubblePrompt,
  ]);

  const effectiveStepList = useMemo(() =>
  {
    const effectiveList = stepList.filter(stepObj =>
    {
      const { name } = stepObj || {};
      return stepNameList.some(step => step === name);
    });
    ruleDs.setState('effectiveStepList', effectiveList);

    return effectiveList;

  }, [stepList, stepNameList, ruleDs]);

  const onStepChange = useCallback(async (current) =>
  {

    if (current < stepCurrent || Number(stepEndFlag) === 1)
    {
      ruleDs.setState('beforeNextStep', current);
      const effectiveStepList = ruleDs.getState('effectiveStepList') || [];
      // 保存当前tab
      const res = await saveInfoByStep(effectiveStepList[stepCurrent]?.name);
      if (res)
      {
        ruleDs.setState('stepCurrent', current);

      }
    }

  }, [ruleDs, saveInfoByStep, stepCurrent, stepEndFlag]);

  const handleViewHistory = useCallback(({ record }) =>
  {
    handleToDetail(record.toData(), 'history');
  }, [handleToDetail]);

  const title = useMemo(() => {
    if (addFlag) return intl.get('spfp.ruleMaintenance.detail.title.addRebateRule').d('新建返利规则');
    else if (editFlag || routeEditFlag) return intl.get('spfp.ruleMaintenance.detail.title.editRebateRule').d('编辑返利规则');
    else if (approveFlag) return intl.get('spfp.ruleMaintenance.detail.title.checkRebateRule').d('审核返利规则');
    else return intl.get('spfp.ruleMaintenance.detail.title.viewRebateRule').d('查看返利规则');
  }, [addFlag, editFlag, routeEditFlag, approveFlag]);

  const backPath = state?.backPath || "/spfp/rule-maintenance/rebate/list";

  return !modal ? (
    <Fragment>
      <Header
        title={notPub && title}
        backPath={notPub ? backPath : ''}
        onBack={() =>
        {
          if (notPub && state?.backPath)
          {
            updateTab({
              key: getActiveTabKey(),
              search: backPath?.split('?')[1],
              state: null,
            });
          }
        }}
      >
        {notPub && <DynamicButtons maxNum={5} defaultBtnType="c7n-pro" buttons={viewFlag ? notStepBtns : stepbBtns(effectiveStepList[stepCurrent]?.footerBtns)} />}
        {ruleStatus === 'PUBLISHED' && notPub &&
          historyVersionNums > 0 &&
          <HistoryBtn ruleNum={ruleNum} ruleId={ruleId} onClick={handleViewHistory} />}
      </Header>
      {
        !viewFlag ? (
          <div className={classnames(Style['spfp-detail-content'], styles['spfp-rule-content'])}>
            <Spin spinning={loading}>
              {
                notPub && (
                  <Content
                    wrapperClassName='amount-summary-notfix-content-wrapper fixed-content-wrapper'
                  >
                    <Steps
                      current={stepCurrent}
                      onChange={throttle(onStepChange, 1500)}
                    >
                      {effectiveStepList.map(({ title, name }, index) => (
                        <Step title={title} status={stepEndFlag === 1 ? (index === stepCurrent ? 'process' : 'finish') : undefined} key={name} />
                      ))}
                    </Steps>
                  </Content>
                )
              }
            </Spin>
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
            {effectiveStepList[stepCurrent]?.content}
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
            style={{ paddingBottom: 16 }}
            onChange={onStepChange}
          >
            {effectiveStepList.map(({ title, name }) => (
              <Step title={title} key={name} />
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
