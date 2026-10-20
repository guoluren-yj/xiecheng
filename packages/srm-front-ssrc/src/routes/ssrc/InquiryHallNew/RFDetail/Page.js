import React, { Fragment, useCallback, useContext, useState, useEffect, useMemo } from 'react';
import { Steps } from 'choerodon-ui';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { Modal } from 'choerodon-ui/pro';
import { useRequest } from 'ahooks';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import { getResponse, getCurrentTenant, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { getActiveTabKey, refreshTab, openTab } from 'utils/menuTab';
import DynamicButtons from '_components/DynamicButtons';
import { openApproveModal } from '_components/ApproveModal';
import { queryBatchApprovaFlag } from '_utils/utils';
import { Button as PermissionButton } from 'components/Permission';
import { isEmpty, isNil } from 'lodash';
import querystring from 'querystring';

import { queryProgress, confirmReturn } from '@/services/rfService';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { fetchConfigSheet } from '@/services/inquiryHallNewService';
import { isText, handleRevokeApproval, getBatchOperationFlag } from '@/utils/utils';
import OperationRecordExport from '@/routes/components/OperationRecordExport';

import Store from './store/index';
import Create from './Create';
import Score from './Score';
import CheckPending from './CheckPending';
import Card from '../rfComponents/Card';
import styles from '../rfComponents/common.less';
import InQuotation from './InQuotation';
import OperationRecord from './OperationRecord';

const { Step } = Steps;

const Index = (props) => {
  const {
    remote,
    routerParams: { sourceCategory, rfHeaderId, searchParams, setPath },
    commonDs: {
      createBasicFormDs,
      rfItemLineDs,
      consultBasicFormDs,
      ladderQuotationTableDs,
      checkLadderQuotationTableDs,
      ItemLineDetailDs,
      supplierDs,
      ItemLineInQuotationDetailDs,
      checkPendingBasicFormDs,
    },
    setStoreData,
    customizeBtnGroup,
  } = useContext(Store);

  const [progress, setProgress] = useState([]);
  const [currentStep, setCurrentStep] = useState();
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false); // 双精度标志
  const [approvaFlags, setApprovaFlags] = useState({}); // 审批信息
  const [operationFlags, setOperationFlags] = useState({}); // 撤销审批信息
  const [headerInfo, setHeaderInfo] = useState({}); // 头信息
  const { runAsync: runConfirmReturnAsync } = useRequest(confirmReturn, {
    manual: true,
  });
  const [configSheet, setConfigSheet] = useState({});
  // 供应商360查询配置表是否是新用户
  const [sslmLifeCycleFlag, setSslmLifeCycleFlag] = useState(true);
  const approvaFlag = approvaFlags?.[headerInfo.businessKey];
  const operationFlag = operationFlags?.[headerInfo.businessKey];
  const { taskId, processInstanceId } = approvaFlag || {};

  useEffect(() => {
    init();
    if (remote?.event) {
      remote.event.fireEvent('onLoad', {
        createBasicFormDs,
        checkPendingBasicFormDs,
        ItemLineDetailDs,
        sourceCategory,
        supplierDs,
        onLoad: (props || {}).onLoad,
      });
    }
  }, []);

  useEffect(() => {
    rfItemLineDs.setState('doubleUnitFlag', doubleUnitFlag);
    ladderQuotationTableDs.setState('doubleUnitFlag', doubleUnitFlag);
    ItemLineDetailDs.setState('doubleUnitFlag', doubleUnitFlag);
    ItemLineInQuotationDetailDs.setState('doubleUnitFlag', doubleUnitFlag);
    checkLadderQuotationTableDs.setState('doubleUnitFlag', doubleUnitFlag);
  }, [doubleUnitFlag]);

  // 初始化查询
  const init = async () => {
    const { onFormLoaded } = props;
    fetchProgress();
    // 为了查询rfNum
    const res = await createBasicFormDs.query();
    if (getResponse(res)) {
      const { businessKey } = res || {};
      setHeaderInfo(res);
      if (businessKey) {
        const approvaFlagsRes = await queryBatchApprovaFlag([businessKey]); // 查询审批按钮显示状态
        if (getResponse(approvaFlagsRes)) {
          setApprovaFlags(approvaFlagsRes);
        }
        const operationFlagsRes = await getBatchOperationFlag([businessKey]); // 查询撤销按钮显示状态
        if (getResponse(operationFlagsRes)) {
          setOperationFlags(operationFlagsRes);
        }
      }
    }
    if (onFormLoaded && typeof onFormLoaded === 'function') {
      onFormLoaded(true);
    }
    fetchConfig();
    fetchSslmLifeCycleConfig();
  };

  // 查询配置表
  const fetchConfig = async () => {
    let data = null;
    if (!rfHeaderId) {
      return;
    }
    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_old_ui_config',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!data) {
        return;
      }
      setConfigSheet({ ...configSheet, sprmOldUiConfig: !isEmpty(data) });
    } catch (e) {
      throw e;
    }
  };

  // 供应商360查询配置表
  const fetchSslmLifeCycleConfig = async () => {
    let data = null;
    if (!rfHeaderId) {
      return;
    }
    try {
      data = await fetchConfigSheet({
        configCode: 'sslm_life_cycle_new_360_bk',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!isEmpty(data)) {
        setSslmLifeCycleFlag(false);
      }
    } catch (e) {
      throw e;
    }
  };

  // 查询进度条
  const fetchProgress = () => {
    queryProgress({ rfHeaderId }).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        // 设置值
        setProgress(result);
        const { nodeStatus, nodeSeq } = result?.find((i) => i.currentNodeFlag) || {};
        const { nodeSeq: scoreNodeSeq } = result?.find((i) => i.nodeStatus === 'SCORE') || {};
        setCurrentStep(nodeStatus);
        // 当前节点序号大于评分节点序号
        if (nodeSeq > scoreNodeSeq) {
          setStoreData('scoreViewFlag', true);
        }
      }
    });
    queryDoubleUnit();
  };

  const queryDoubleUnit = () => {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        setDoubleUnitFlag(!!Number(res));
      }
    });
  };

  // 点击步骤条
  const handleClickStep = (record = {}) => {
    const { nodeStatus = null, finishedFlag = 0, currentNodeFlag = 0 } = record || {};

    if (!finishedFlag && !currentNodeFlag) {
      notification.warning({
        message: intl
          .get('ssrc.rfDetail.view.warning.noCurrentStatusViewRFI')
          .d(`征询书尚未进行到该阶段，无法查看`),
      });
      return;
    }

    if (nodeStatus === currentStep) {
      return;
    }

    setCurrentStep(nodeStatus);
  };

  // 进度条
  const renderSteps = useCallback(() => {
    if (progress?.length) {
      const curNodeIndex = progress.findIndex((i) => i.currentNodeFlag) || 0;
      return (
        <Steps current={curNodeIndex} size="default">
          {progress?.map((s) => {
            const {
              nodeStatus = null,
              nodeStatusMeaning = null,
              // finishedFlag = null,
              // currentNodeFlag = null,
            } = s;
            return (
              <Step
                key={nodeStatus}
                onClick={() => handleClickStep(s)}
                title={nodeStatusMeaning || nodeStatus}
              />
            );
          })}
        </Steps>
      );
    }
  }, [progress, currentStep, sourceCategory]);

  // 渲染标题
  const Title = observer(({ ds }) => {
    const { current = {} } = ds || {};
    const title = current?.get?.('rfNum') ? `-${current?.get?.('rfNum')}` : '';
    return intl.get('ssrc.rfCheck.view.card.title.rf.consult.detail').d('征询书明细') + title;
  });

  const getBackPath = useMemo(() => {
    const { backRecommend } = searchParams || {};
    const activeTabKey = getActiveTabKey();
    if (
      backRecommend === 'expertDetailToRFDetail' ||
      backRecommend === 'BidEvaluateRFDetail' ||
      backRecommend === 'recommend'
    ) {
      // if (current === 'newInquiryHall') return null; // 跳转明细时判断是否从询价工作台跳转到专家评分到明细，如果是，则明细页backPath为null
      const key =
        backRecommend === 'recommend'
          ? `sourceRouter+${activeTabKey}`
          : `${backRecommend}+${activeTabKey}`;
      const backPack = JSON.parse(
        sessionStorage.getItem(key) || sessionStorage.getItem('sourceRouter') || '{}'
      )?.url;
      return backPack || null;
    } else if (activeTabKey === '/ssrc/new-project-setup') {
      // 从寻源项目面板跳转过来
      return `/ssrc/new-project-setup/detail/${createBasicFormDs.current?.get(
        'sourceProjectId'
      )}?current=newProjectSetup`;
    }
    return `${activeTabKey}/list?sourceCategory=${sourceCategory}`;
  }, [sourceCategory, searchParams, createBasicFormDs.current?.get('sourceProjectId')]);

  // 操作记录弹框
  const handleOpenOperation = () => {
    const operationRef = React.createRef();
    const operationProps = {
      rfHeaderId,
      rfTitle:
        sourceCategory === 'RFP'
          ? intl.get(`ssrc.rfDetail.view.title.RFP`).d('方案征询书')
          : intl.get(`ssrc.rfDetail.view.title.RFI`).d('信息征询书'),
      handleOperationRef: operationRef,
    };

    Modal.open({
      key: Modal.key(),
      title: intl.get(`ssrc.common.view.title.operationRecord`).d('操作记录'),
      children: <OperationRecord {...operationProps} />,
      style: { width: '720px' },
      drawer: true,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
      footer: (_, cancelBtn) => {
        return (
          <>
            {cancelBtn}
            <OperationRecordExport sourceId={rfHeaderId} type="RF" operationRef={operationRef} />
          </>
        );
      },
    });
  };

  // 第二步
  const onOk = () => {
    const params = {
      rfHeaderId,
      confirmFlag: 1,
    };
    return runConfirmReturnAsync(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        notification.success();
        init();
      }
    });
  };

  // 校验退回
  const handleConfirmReturn = () => {
    const params = {
      rfHeaderId,
    };
    return runConfirmReturnAsync(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        // 校验通过
        if (result?.body === true) {
          notification.success();
          init();
        } else if (result?.highestValidatorType === 'ERROR') {
          // 校验失败
          const { validateResults = [] } = result;

          const description = validateResults?.map?.((i, index) => {
            return <div>{`${index + 1}、${i.message}`}</div>;
          });

          notification.error({
            message: intl.get('ssrc.rf.view.title.errorInfo').d('提交失败，以下内容验证不通过'),
            description,
          });
        } else if (result?.highestValidatorType === 'WARNING') {
          // 校验警告
          const { validateResults = [] } = result;

          const description = validateResults?.map?.((i, index) => {
            return <div>{`${index + 1}、${i.message}`}</div>;
          });

          Modal.confirm({
            title: intl.get('ssrc.rf.view.title.warningInfo').d('以下验证未通过，确认发布吗？'),
            children: description,
            onOk: () => onOk(),
            onCancel: () => {},
          });
        }
      }
    });
  };

  // 澄清答疑
  const handleClarifyQuestion = () => {
    const { rfNum, companyId } = createBasicFormDs?.current?.get(['rfNum', 'companyId']) || {};
    if (!rfHeaderId || isNil(rfNum) || isNil(companyId)) return;
    const url = `/ssrc/new-clarification-letter/inter-question/${rfHeaderId}/${rfNum}/sourceTitle/${companyId}/1`;
    const search = querystring.stringify({
      sourceCategory,
      isReadOnly: 'Y',
    });

    openTab({
      key: url,
      path: url,
      title: 'srm.common.tab.title.ssrc.questionAnswer',
      closable: true,
      search,
    });
  };

  // 退回
  const handleReturn = () => {
    Modal.confirm({
      key: Modal.key(),
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get('ssrc.rfDetail.view.message.returnTips')
        .d('本单据将退回至确定入围名单，是否确认？'),
      onOk: () => handleConfirmReturn(),
    });
  };

  // 获取按钮
  const getButtons = useCallback(() => {
    const { businessKey, mainOperations, moreOperations } = headerInfo;
    const buttonKeys =
      [...(mainOperations || []), ...(moreOperations || [])].map((i) => i.operation) || [];
    const buttons = [
      currentStep === 'FINISHED'
        ? {
            name: 'return',
            btnComp: PermissionButton,
            btnProps: {
              type: 'c7n-pro',
              className: 'no-border-btn',
              funcType: 'flat',
              icon: 'reply',
              onClick: handleReturn,
              permissionList: [
                {
                  code: `ssrc.new-inquiry-hall.rf-detail.${sourceCategory}.button.return`?.toLowerCase(),
                  type: 'button',
                  meaning:
                    intl.get('ssrc.rfCheck.view.card.title.rf.consult.detail').d('征询书明细') -
                    intl.get('ssrc.rfDetail.view.button.return').d('退回'),
                },
              ],
            },
            child: intl.get('ssrc.rfDetail.view.button.return').d('退回'),
          }
        : null,
      {
        name: 'operationRecord',
        btnType: 'c7n-pro',
        btnProps: {
          onClick: handleOpenOperation,
          funcType: 'flat',
          icon: 'operation_service_request',
        },
        child: intl.get(`ssrc.common.view.button.operationRecord`).d('操作记录'),
      },
      {
        name: 'approval',
        btnType: 'c7n-pro',
        hidden: !(approvaFlags && approvaFlag && buttonKeys.includes('APPROVE')),
        child: intl.get('ssrc.inquiryHall.view.message.button.approve').d('审批'),
        btnProps: {
          wait: 1500,
          funcType: 'flat',
          icon: 'authorize',
          onClick: async () => {
            openApproveModal({
              modalProps: {
                closable: true,
              },
              taskId,
              processInstanceId,
              onSuccess: () => {
                refreshTab();
              },
            });
          },
        },
      },
      {
        name: 'revokeApproval',
        hidden: !(operationFlags && operationFlag?.REVOKE && buttonKeys.includes('CANCEL_APPROVE')),
        child: intl.get('ssrc.common.view.button.revokeApproval').d('撤销审批'),
        btnType: 'c7n-pro',
        btnProps: {
          wait: 1500,
          funcType: 'flat',
          icon: 'reply',
          onClick: async () => {
            const res = await handleRevokeApproval(businessKey);
            if (res) {
              refreshTab();
            }
          },
        },
      },
      {
        name: 'clarifyQuestion',
        child: intl.get('ssrc.inquiryHall.view.message.button.clearAnswer').d('澄清答疑'),
        btnType: 'c7n-pro',
        hidden: !createBasicFormDs?.current?.get('existClarifyFlag'),
        btnProps: {
          wait: 1000,
          funcType: 'flat',
          icon: 'question_answer',
          onClick: handleClarifyQuestion,
        },
      },
    ];
    return remote
      ? remote.process('SSRC_INQUIRY_DETAIL_RF_PROCESS_HEADER_BUTTONS', buttons, {
          setPath,
          rfHeaderId,
          currentStep,
          sourceCategory,
          consultBasicFormDs,
        })
      : buttons;
  }, [
    currentStep,
    sourceCategory,
    consultBasicFormDs?.current,
    rfHeaderId,
    approvaFlag,
    operationFlag?.REVOKE,
    headerInfo,
    createBasicFormDs?.current,
    handleClarifyQuestion,
  ]);
  const createProps = {
    doubleUnitFlag,
    configSheet,
    sslmLifeCycleFlag,
  };

  const checkPendingProps = {
    currentStep,
    doubleUnitFlag,
  };

  const inQuotationProps = {
    doubleUnitFlag,
  };

  return (
    <Fragment>
      {setPath.indexOf('/pub/') !== 0 ? (
        <Header title={<Title ds={createBasicFormDs} />} backPath={getBackPath}>
          {customizeBtnGroup(
            {
              code: `SSRC.INQUIRY_HALL_RF_DETAIL.HEADER_BUTTON_${sourceCategory}`,
              pro: true,
            },
            <DynamicButtons buttons={getButtons()} />
          )}
        </Header>
      ) : null}
      <div className={classNames('rf-page-content-warp', styles['rf-page-content'])}>
        <div className={styles['rf-card-content-wrapper']}>
          {setPath.indexOf('/pub/') !== 0 ? (
            <>
              <Card component={renderSteps()} />
              <div style={{ overflowY: 'scroll' }}>
                <div style={{ marginTop: '0px' }} />
                {currentStep === 'CREATE' && <Create {...createProps} />}
                {currentStep === 'IN_QUOTATION' && <InQuotation {...inQuotationProps} />}
                {currentStep === 'SCORE' && <Score />}
                {(currentStep === 'CHECK_PENDING' || currentStep === 'FINISHED') && (
                  <CheckPending {...checkPendingProps} sourceCategory={sourceCategory} />
                )}
              </div>
            </>
          ) : setPath.indexOf('/rf-update/') > -1 ? (
            <Create {...createProps} />
          ) : (
            <CheckPending {...checkPendingProps} sourceCategory={sourceCategory} />
          )}
          {/* <div className={styles['bottom-line']} /> */}
        </div>
      </div>
    </Fragment>
  );
};

export default observer(Index);
