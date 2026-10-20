import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Button, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const btnsPermissions = [
  {
    name: 'exportReportAtt',
    code: 'srm.partner.purchaser.evaluation-workbench.button.report.list.batch-download',
    meaning: '导出评估报告附件',
  },
];

const HeaderBtns = observer(
  ({
    activeTabKey,
    dataSet,
    handleQueryList,
    handleQueryCount,
    handleManualCreation,
    handleReferenceEvaluationPlanCreation,
    handleDelete,
    handleDiscard,
    handleParams,
    buttonShow,
    onBatchPublish,
    customizeBtnGroup,
    exportReportAttachment,
    remote,
  }) => {
    // 禁用批量废弃标识
    const disablesStatusFlag = dataSet.selected.filter(item => {
      const { reportStatus, progressStatus } = item.data || {};
      // 可废弃状态
      const disabledStatus = [
        'NEW', // 新建
        'SYSTEM_PROCESSING', // 计算中
        'SYSTEM_COMPLETE', // SYSTEM_COMPLETE
        'SYSTEM_FAIL', // SYSTEM_FAIL
        'MANUAL_EVALUATING', // 评分中
        'MANUAL_COMPLETE', // 评分完成
        'FINAL_COLLECTED', // 汇总完成
        'REJECTED', // 审批拒绝
        'WAITINGREJECTED', // 供应商待自评
        'FEEDBACK', // 供应商已自评
        'BACK', // 退回自评
      ].includes(reportStatus);

      // 可废弃阶段
      const disabledStage =
        reportStatus === 'APPROVED' && ['EVAL_PREPARE', 'SUPPLIER_EVAL'].includes(progressStatus);
      // 不允许废弃条件 1、不在 disabledStatus 状态中， 2、状态为 APPROVED 审批通过，阶段不为 评估准备和供应商自评
      const flag = !(disabledStatus || disabledStage);
      return flag;
    });
    // 勾选行均为单据状态为【审批通过】，评估进度为【评估完成】时，批量发布可操作
    const publishDisabled =
      isEmpty(dataSet.selected) ||
      dataSet?.selected?.some(record => {
        const { reportStatus, progressStatus } =
          record?.get(['reportStatus', 'progressStatus']) || {};
        return reportStatus !== 'APPROVED' || progressStatus !== 'EVAL_COMPLETE';
      });
    const isDisabled = isEmpty(dataSet.selected) || !isEmpty(disablesStatusFlag);
    const loading = dataSet.status === 'loading';
    const noSelectFlag = isEmpty(dataSet.selected);

    const buttons = [
      {
        name: 'add',
        group: true,
        children: [
          {
            name: 'manualCreation',
            child: intl
              .get('sslm.purchaserEvaluation.dropdown.menuItem.manualCreation')
              .d('手工新建'),
            btnProps: {
              loading,
              onClick: handleManualCreation,
            },
          },
          {
            name: 'planCreation',
            child: intl
              .get('sslm.purchaserEvaluation.dropdown.menuItem.referenceEvaluationPlanCreation')
              .d('引用评估计划新建'),
            btnProps: {
              loading,
              onClick: handleReferenceEvaluationPlanCreation,
            },
          },
        ],
        child: (
          <Button icon="add" color="primary" loading={loading}>
            {intl.get(`hzero.common.button.create`).d('新建')}
            <Icon type="keyboard_arrow_down" />
          </Button>
        ),
      },
      {
        name: 'cancel',
        child: intl.get('sslm.common.button.batchDiscard').d('批量废弃'),
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'cancel',
          funcType: 'flat',
          disabled: isDisabled,
          loading,
          onClick: handleDiscard,
        },
      },
      activeTabKey === 'tabPaneAssessmentReserve' && {
        name: 'delete',
        child: intl.get('sslm.common.button.batchDelete').d('批量删除'),
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'delete_sweep',
          funcType: 'flat',
          disabled: isDisabled,
          // hidden: activeTabKey !== 'tabPaneAssessmentReserve',
          loading,
          onClick: handleDelete,
        },
      },
      activeTabKey === 'tabPaneManageAll' && {
        name: 'batchPublish',
        child: intl.get('sslm.common.buttons.batchPublish').d('批量发布'),
        btnProps: {
          loading,
          icon: 'publish2',
          funcType: 'flat',
          disabled: publishDisabled,
          onClick: onBatchPublish,
        },
      },
      {
        name: 'report-export',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report-header-export`,
          queryParams: () => handleParams(),
          otherButtonProps: {
            loading,
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
            hidden: !['tabPaneManageAll'].includes(activeTabKey),
            permissionList: [
              {
                code: 'srm.partner.purchaser.evaluation-workbench.button.report.export',
                type: 'button',
                meaning: '采购方评估工作台-详情导出',
              },
            ],
          },
          buttonText: noSelectFlag
            ? intl.get('sslm.common.button.detailExport').d('详情导出')
            : intl.get('sslm.common.button.selectedDetailExport').d('勾选详情导出'),
          templateCode: 'SRM_C_SRM_SSLM_SITE_EVAL_HEADER_PLAIN_DETAIL_EXPORT',
        },
      },
      {
        name: 'exportReportAtt',
        hidden: !['tabPaneManageAll'].includes(activeTabKey),
        child: intl
          .get('sslm.purchaserEvaluation.button.exportReportAttachment')
          .d('导出评估报告附件'),
        btnType: 'c7n-pro',
        btnProps: {
          loading,
          funcType: 'flat',
          icon: 'unarchive',
          disabled: isEmpty(dataSet.selected),
          onClick: () => exportReportAttachment(),
        },
      },
    ].filter(Boolean);

    const newAllBtns = remote
      ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH.BUTTONS', buttons, {
          dataSet,
          activeTabKey,
          handleQueryList,
          handleQueryCount,
        })
      : buttons;

    return [
      'tabPaneAssessmentReserve',
      'tabPaneUnderEvaluation',
      'tabPaneEvaluationCompleted',
      'tabPaneManageAll',
    ].includes(activeTabKey) && buttonShow
      ? customizeBtnGroup(
          {
            code: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.BUTTON',
            pro: true,
          },
        <DynamicButtons
          maxNum={5}
          buttons={newAllBtns}
          defaultBtnType="c7n-pro"
          permissions={btnsPermissions}
        />
        )
      : null;
  }
);

export default HeaderBtns;
