/*
 * @Date: 2023-11-03 09:09:05
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from '_components/PrintProButton';
import { getCurrentOrganizationId } from 'utils/utils';

import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { handleRevokeApprova, handleApprove } from '@/routes/components/WorkFlowApproval';

import AppraisalDetails from '../components/AppraisalDetails';
import { getAppraisalPersonDs } from '../stores/getAppraisalPersonDS';
import { getParticipSupplierDs } from '../stores/getParticipSupplierDS';
import { getAppraisalIndicatorDs } from '../stores/getAppraisalIndicatorDS';

const tenantId = getCurrentOrganizationId();
const btnsPermissions = [
  {
    name: 'approval',
    code: 'srm.partner.evaluation-manage.appraisal-purchaser.button.detail.approval',
    meaning: '审批',
  },
  {
    name: 'revokeApproval',
    code: 'srm.partner.evaluation-manage.appraisal-purchaser.button.detail.repeal-approval',
    meaning: '撤销审批',
  },
];

const HeaderBtns = observer(
  ({
    remote,
    basicDs,
    loading,
    editFlag,
    custLoading,
    wfParams = {},
    evalHeaderId,
    customizeTable,
    evalGranularity,
    customizeUnitCode,
    onSum,
    onSave,
    onSubmit,
    onDiscard,
    onPreview,
    onTransfer,
    onBackScore,
    onSupplement,
    onRecalculate,
    onExecuteScore,
    onCreateSubmit,
    onReleaseLines,
    customizeCode,
    customizeBtnGroup,
    workflowFlag = false,
    scoreCombineTableDs,
    approvalBtnInfo,
    handleRefresh = () => {},
    isPub,
  }) => {
    const {
      evalStatus,
      systemFlag,
      evalRespRule,
      recordEvalStatus,
      newApproveConfigFlag, // 新建审批业务规则
      businessKey,
    } = basicDs?.current?.toData() || {};

    const allLoading =
      loading ||
      basicDs.getState('supplierloading') ||
      basicDs.getState('indicatorLoading') ||
      basicDs.getState('personLoading');

    // 保存
    const savaFlag =
      evalStatus && !['NEW', 'FINAL_COLLECTED', 'REJECTED', 'NEW_REJECTED'].includes(evalStatus);
    // 执行评分
    const executeFlag =
      ['WFL', 'EXT'].includes(newApproveConfigFlag) && ['NEW_REJECTED', 'NEW'].includes(evalStatus)
        ? true
        : !['NEW', 'NEW_REJECTED', 'NEW_APPROVED'].includes(evalStatus);
    // 提交新建审批
    const newSubmitFlag =
      ['WFL', 'EXT'].includes(newApproveConfigFlag) && ['NEW', 'NEW_REJECTED'].includes(evalStatus);
    // 汇总统计
    const sumFlag = !['MANUAL_COMPLETE'].includes(evalStatus);
    // 退回评分
    const backScoreFlag = ![
      'MANUAL_COMPLETE',
      'MANUAL_EVALUATING',
      'FINAL_COLLECTED',
      'REJECTED',
    ].includes(evalStatus);
    // 提交审批
    const submitFlag = !['FINAL_COLLECTED', 'REJECTED'].includes(evalStatus);
    // 评分人转交
    const transferFlag = !['MANUAL_EVALUATING'].includes(evalStatus);
    // 重新计算
    const recalculateFlag = !(
      ['MANUAL_EVALUATING', 'MANUAL_COMPLETE', 'SYSTEM_FAIL'].includes(evalStatus) && systemFlag
    );
    // 废弃
    const discardFlag = ![
      'NEW',
      'NEW_APPROVED',
      'NEW_REJECTED',
      'SYSTEM_FAIL',
      'MANUAL_EVALUATING',
    ].includes(evalStatus);
    // 发布全部行/勾选行
    const releaseAllLinesFlag = !['PARTIAL_PUBLISHED', 'COMPLETED'].includes(evalStatus);
    // 操作记录
    const operateFlag = !evalHeaderId;
    // 预览考评档案
    const previewStatus = ['NEW', 'NEW_REJECTED', 'NEW_APPROVING', 'NEW_APPROVED']; // 允许预览的状态
    const previewFlag =
      evalStatus === 'DISCARDED'
        ? recordEvalStatus
          ? previewStatus.includes(recordEvalStatus)
          : true
        : previewStatus.includes(evalStatus);
    // 查看档案详情
    const viewDetailsStatus = ['NEW', 'NEW_APPROVED', 'NEW_REJECTED', 'NEW_APPROVING'];
    const viewDetailsFlag =
      evalStatus === 'DISCARDED'
        ? recordEvalStatus
          ? viewDetailsStatus.includes(recordEvalStatus)
          : true
        : viewDetailsStatus.includes(evalStatus);

    // 操作记录
    const handleOperate = () => {
      operationRecordsModal({
        evalHeaderId,
        headerId: evalHeaderId,
        documentId: evalHeaderId,
        documentType: 'EVAL_MANAGE',
      });
    };

    // 查看档案详情
    const handleViewDetails = () => {
      const appraisalIndicatorDs = new DataSet(getAppraisalIndicatorDs({ evalHeaderId }));
      const appraisalPersonDs = new DataSet(getAppraisalPersonDs({ evalHeaderId, evalRespRule }));
      const participSupplierDs = new DataSet(
        getParticipSupplierDs({ evalHeaderId, evalGranularity })
      );
      Modal.open({
        key: Modal.key(),
        drawer: true,
        style: { width: 1090 },
        title: intl.get('sslm.common.button.viewAppraisalDetails').d('查看档案详情'),
        okText: intl.get('hzero.common.button.close').d('关闭'),
        cancelButton: false,
        children: (
          <AppraisalDetails
            workflowFlag
            readOnlyFlag
            basicDs={basicDs}
            wfParams={wfParams}
            sourceKey="VIEW_DETAIL"
            custLoading={custLoading}
            evalHeaderId={evalHeaderId}
            customizeTable={customizeTable}
            evalGranularity={evalGranularity}
            appraisalPersonDs={appraisalPersonDs}
            participSupplierDs={participSupplierDs}
            appraisalIndicatorDs={appraisalIndicatorDs}
          />
        ),
      });
    };

    // 审批/撤销审批
    const { approvalDataMap, revokeDataMap } = approvalBtnInfo || {};
    const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};

    const btns = [
      {
        name: 'infoSupplement',
        hidden: !workflowFlag,
        child: intl.get('sslm.common.model.field.infoSupplement').d('信息补录'),
        btnProps: {
          loading,
          color: 'primary',
          icon: 'mode_edit',
          onClick: () => onSupplement(),
        },
      },
      {
        name: 'execute',
        child: intl.get(`sslm.supplierDocManage.view.button.execute`).d('执行评分'),
        hidden: executeFlag || !editFlag,
        btnProps: {
          icon: 'add_task-o',
          color: 'primary',
          onClick: () => onExecuteScore(),
        },
      },
      // 新建-提交审批
      {
        name: 'newSubmit',
        child: intl.get(`sslm.commonApplication.view.button.submitReview`).d('提交审批'),
        hidden: !newSubmitFlag || !editFlag,
        btnProps: {
          icon: 'check',
          color: 'primary',
          onClick: () => onCreateSubmit(),
        },
      },
      // 汇总完成后的提交审批
      {
        name: 'submit',
        child: intl.get(`sslm.commonApplication.view.button.submitReview`).d('提交审批'),
        hidden: submitFlag || !editFlag,
        btnProps: {
          icon: 'check',
          funcType: ['FINAL_COLLECTED', 'REJECTED'].includes(evalStatus) ? 'raised' : 'flat',
          color: ['FINAL_COLLECTED', 'REJECTED'].includes(evalStatus) ? 'primary' : 'default',
          onClick: () => onSubmit(),
        },
      },
      {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        hidden: savaFlag || !editFlag,
        btnProps: {
          icon: 'save',
          funcType: 'flat',
          onClick: () => onSave(),
        },
      },
      {
        name: 'sum',
        child: intl.get(`sslm.supplierDocManage.view.button.sum`).d('汇总统计'),
        hidden: sumFlag || !editFlag,
        btnProps: {
          icon: 'bar_chart',
          funcType: evalStatus === 'MANUAL_COMPLETE' ? 'raised' : 'flat',
          color: evalStatus === 'MANUAL_COMPLETE' ? 'primary' : 'default',
          onClick: () => onSum(),
        },
      },
      {
        name: 'backScore',
        child: intl.get(`sslm.supplierDocManage.view.button.backScore`).d('退回评分'),
        hidden: backScoreFlag || !editFlag,
        btnProps: {
          icon: 'reply',
          funcType: evalStatus === 'MANUAL_EVALUATING' ? 'raised' : 'flat',
          color: evalStatus === 'MANUAL_EVALUATING' ? 'primary' : 'default',
          onClick: () => onBackScore(),
        },
      },
      {
        name: 'graderTransfer',
        child: intl.get('sslm.supplierDocManage.view.button.graderTransfer').d('评分人转交'),
        hidden: transferFlag || !editFlag,
        btnProps: {
          icon: 'transfer_within_a_station',
          funcType: 'flat',
          onClick: () => onTransfer(),
        },
      },
      {
        name: 'recalculate',
        child: intl.get(`sslm.supplierDocManage.view.button.recalculate`).d('重新计算'),
        hidden: recalculateFlag || !editFlag,
        btnProps: {
          icon: 'update',
          onClick: () => onRecalculate(),
          funcType: evalStatus === 'SYSTEM_FAIL' ? 'raised' : 'flat',
          color: evalStatus === 'SYSTEM_FAIL' ? 'primary' : 'default',
          help: intl
            .get('sslm.supplierDocManage.view.tooltip.recalculateWarn')
            .d('重新计算所有系统计算指标的得分，已完成的手工评分指标不受影响'),
        },
      },
      {
        name: 'releaseAllLines',
        hidden: releaseAllLinesFlag || !editFlag,
        child: isEmpty(scoreCombineTableDs?.selected)
          ? intl.get(`sslm.supplierDocManage.view.button.releaseAllLines`).d('发布全部行')
          : intl.get(`sslm.supplierDocManage.view.button.releaseCheckedLines`).d('发布勾选行'),
        btnProps: {
          icon: 'publish2',
          color: 'primary',
          onClick: () => onReleaseLines(),
        },
      },
      {
        name: 'previewAppraisal',
        child: intl.get('sslm.common.field.previewAppraisal').d('预览考评档案'),
        hidden: !previewFlag,
        btnProps: {
          icon: 'find_in_page',
          funcType: 'flat',
          onClick: () => onPreview(),
        },
      },
      {
        name: 'viewAppraisalDetails',
        hidden: viewDetailsFlag,
        child: intl.get('sslm.common.button.viewAppraisalDetails').d('查看档案详情'),
        btnProps: {
          icon: 'chrome_reader_mode',
          funcType: 'flat',
          onClick: () => handleViewDetails(),
        },
      },
      {
        name: 'discard',
        child: intl.get('sslm.common.button.discard').d('废弃'),
        hidden: discardFlag || !editFlag,
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          onClick: () => onDiscard(),
        },
      },
      {
        name: 'operation',
        child: intl.get('hzero.common.button.operating').d('操作记录'),
        hidden: operateFlag,
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: () => handleOperate(),
        },
      },
      {
        name: 'approval',
        hidden: isEmpty(approvalDataMap) || isPub,
        child: intl.get('hzero.common.button.approval').d('审批'),
        btnProps: {
          funcType: 'flat',
          icon: 'authorize',
          onClick: () =>
            handleApprove({
              approveProps: {
                ...approvalBtnProps,
                onSuccess: handleRefresh,
              },
            }),
        },
      },
      {
        name: 'revokeApproval',
        hidden: isEmpty(revokeDataMap) || isPub,
        child: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
        btnProps: {
          funcType: 'flat',
          icon: 'reply',
          onClick: () =>
            handleRevokeApprova({
              businessKey,
              onSuccess: handleRefresh,
            }),
        },
      },
      {
        name: 'newPrint',
        btnComp: PrintProButton,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${tenantId}/eval-headers/detail-print-new/${evalHeaderId}`,
          buttonProps: {
            funcType: 'flat',
            icon: 'print',
          },
          params: {
            pageEntryPoint: 'CUSTOMER_OWNED',
            customizeUnitCode: customizeUnitCode?.join(','),
          },
        },
      },
    ].map(btn => ({
      ...btn,
      btnProps: {
        ...btn.btnProps,
        wait: 200,
        loading: allLoading,
        waitType: 'throttle',
      },
    }));

    const buttons = remote
      ? remote.process('SSLM_APPRAISAL_PURCHASER_DETAIL_HEADER_BUTTONS', btns, {
          isPub,
          basicDs,
          editFlag,
          scoreCombineTableDs,
        })
      : btns;

    return customizeBtnGroup ? (
      customizeBtnGroup(
        {
          code: customizeCode,
          pro: true,
        },
        <DynamicButtons
          maxNum={5}
          trigger="hover"
          buttons={buttons}
          permissions={btnsPermissions}
          defaultBtnType="c7n-pro"
        />
      )
    ) : (
      <DynamicButtons
        maxNum={5}
        trigger="hover"
        buttons={buttons}
        permissions={btnsPermissions}
        defaultBtnType="c7n-pro"
      />
    );
  }
);

export default HeaderBtns;
