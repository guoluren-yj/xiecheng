/**
 * 采购方评估 - 详情 - 评估小组
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-01 15:53:44
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React, { useEffect, useState } from 'react';
import { renderStatus } from '@/routes/components/utils';
import { Table, CheckBox } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';

import {
  queryBatchApprovalHistory,
  renderApproveProgress,
} from '@/routes/components/WorkFlowApproval';

import EvaluationIndicatorsInfo from './EvaluationIndicatorsInfo';

import styles from '../index.less';

const AssessmentPanel = observer(props => {
  const {
    remote,
    customizeTable,
    custLoading,
    dataSet,
    readOnly,
    pubEdit,
    assessmentInfoDs,
    isOnLine,
    reportStatus,
    customizeCode,
    customizeBtnCode,
    progressStatus,
    customizeReadOnly = false,
  } = props;
  const [approvalHistory, setApprovalHistory] = useState({});

  useEffect(() => {
    dataSet.addEventListener('load', handleDsLoadAfter);
    return () => {
      dataSet.removeEventListener('load', handleDsLoadAfter);
    };
  }, []);

  const handleDsLoadAfter = (dataSetProps = {}) => {
    const { dataSet: ds } = dataSetProps;
    const businessKeys = ds.filter(r => r.get('businessKey')).map(r => r.get('businessKey'));
    queryBatchApprovalHistory(businessKeys).then(response => {
      if (response) {
        setApprovalHistory(response);
      }
    });
  };

  const isEdit =
    pubEdit ||
    (!readOnly &&
      (isOnLine
        ? (['NEW', 'FEEDBACK', 'APPROVED', 'REJECTED', 'FINAL_COLLECTED'].includes(reportStatus) &&
            ['EVAL_PREPARE', 'SUPPLIER_EVAL', 'EVAL_RESULT'].includes(progressStatus)) ||
          ['SYSTEM_FAIL'].includes(reportStatus)
        : ['NEW'].includes(reportStatus)));

  const showScoreApproveProgress =
    ['MANUAL_EVALUATING', 'MANUAL_COMPLETE', 'FINAL_COLLECTED', 'PUBLISHED'].includes(
      reportStatus
    ) ||
    (['APPROVED'].includes(reportStatus) && ['EVAL_COMPLETE'].includes(progressStatus));

  const btns = isEdit
    ? [
        'add',
        [
          'save',
          {
            onClick: () => {
              dataSet.submit().then(res => {
                const resp = getResponse(res);
                if (resp) {
                  if (assessmentInfoDs) {
                    dataSet.query();
                    assessmentInfoDs.query();
                  }
                }
              });
            },
          },
        ],
        [
          'delete',
          {
            onClick: () => {
              dataSet
                .delete(dataSet.selected, {
                  title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  children: intl
                    .get('sslm.purchaserEvaluationDetail.view.message.deleteConfirm')
                    .d('确认删除选中行？'),
                })
                .then(res => {
                  const resp = getResponse(res);
                  if (resp) {
                    if (assessmentInfoDs) {
                      assessmentInfoDs.query();
                    }
                  }
                });
            },
          },
        ],
      ]
    : [];

  const buttons = remote
    ? remote.process(
        'SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAIL.ASSESSMENT_PANEL_TABLE_BTNS',
        btns,
        { ...props }
      )
    : btns;

  const columns = () =>
    [
      {
        name: 'userType',
        width: 150,
        // 线上评分-评估结果确认节点,已经分配评估指标的小组成员不允许进行修改和删除
        editor: record =>
          isEdit && (progressStatus === 'EVAL_RESULT' ? !record.get('scoreStatus') : true),
      },
      {
        name: 'supplierCompanyLov',
        width: 150,
        editor: record =>
          isEdit && (progressStatus === 'EVAL_RESULT' ? !record.get('scoreStatus') : true),
      },
      {
        name: 'userLov',
        width: 150,
        editor: record =>
          isEdit && (progressStatus === 'EVAL_RESULT' ? !record.get('scoreStatus') : true),
      },
      {
        name: 'member',
        width: 150,
        editor: record =>
          isEdit && (progressStatus === 'EVAL_RESULT' ? !record.get('scoreStatus') : true),
      },
      {
        name: 'department',
        width: 150,
        editor: record =>
          isEdit && (progressStatus === 'EVAL_RESULT' ? !record.get('scoreStatus') : true),
      },
      {
        name: 'post',
        width: 150,
        editor: record =>
          isEdit && (progressStatus === 'EVAL_RESULT' ? !record.get('scoreStatus') : true),
      },
      {
        name: 'phone',
        width: 200,
        editor: record => {
          const editable =
            isEdit && (progressStatus === 'EVAL_RESULT' ? !record.get('scoreStatus') : true);
          return editable;
        },
      },
      {
        name: 'email',
        width: 260,
        editor: record =>
          isEdit && (progressStatus === 'EVAL_RESULT' ? !record.get('scoreStatus') : true),
      },
      {
        name: 'leaderFlag',
        width: 80,
        renderer: ({ value, record }) => {
          return isEdit &&
            (progressStatus === 'EVAL_RESULT' ? !record.get('scoreStatus') : true) ? (
              <CheckBox record={record} name="leaderFlag" />
          ) : (
            yesOrNoRender(value)
          );
        },
      },
      {
        name: 'siteLocation',
        width: 150,
      },
      isOnLine && {
        name: 'scoreStatus',
        width: 100,
        renderer: ({ record, value, name }) => {
          const dataSource = record.get('siteEvalLineResps');
          return value ? (
            <Popover
              overlayClassName={styles['indicator-status-popover']}
              content={() => {
                return (
                  <EvaluationIndicatorsInfo dataSource={dataSource} reportStatus={reportStatus} />
                );
              }}
              placement="bottomLeft"
            >
              <span style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <span>{renderStatus({ value, name, record, iconType: 'expand_more' })}</span>
              </span>
            </Popover>
          ) : (
            <span>-</span>
          );
        },
      },
      showScoreApproveProgress && {
        name: 'scoreApprovalProgress',
        width: 160,
        title: intl
          .get('sslm.purchaserEvaluationDetail.title.scoreApprovalProgress')
          .d('评分审批进度'),
        renderer: ({ record }) => {
          return renderApproveProgress({ approvalHistoryMap: approvalHistory, record });
        },
      },
    ].filter(Boolean);

  return customizeTable(
    {
      code: customizeCode || 'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_TEAM',
      readOnly: customizeReadOnly,
      buttonCode: customizeBtnCode || 'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_TEAM_BTN',
    },
    <Table
      buttons={buttons}
      columns={columns()}
      dataSet={dataSet}
      style={{ maxHeight: 420 }}
      custLoading={custLoading}
      selectionMode={isEdit ? 'rowbox' : 'none'}
    />
  );
});

export default AssessmentPanel;
