import React, { useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import ExcelExportPro from 'components/ExcelExportPro';
import { getResponse, getCurrentUserId, getCurrentOrganizationId } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';
import { getRectificationItems } from '@/services/purchaserEvaluationWorkbenchServices';

const userId = getCurrentUserId();
const organizationId = getCurrentOrganizationId();

const ReformContent = ({
  isPub,
  remote,
  customizeTable,
  dataSet,
  history,
  readOnly,
  basicInfoDs,
  reportStatus,
  customizeCode,
  progressStatus,
  setLoading = () => {},
  sourceKey = '', // 页面来源, SCORE_DETAILS 评分明细
  customizeReadOnly = false,
}) => {
  const { scoreStatus, evalHeaderId } =
    basicInfoDs?.current?.get(['scoreStatus', 'evalHeaderId']) || {};
  // 当前步骤条处于”评估结果确认“
  const resultFlag =
    (basicInfoDs.getState('currentStepConfig') || {}).progressStatus === 'EVAL_RESULT' ||
    progressStatus === 'EVAL_RESULT';
  const isEdit =
    sourceKey === 'SCORE_DETAILS'
      ? !readOnly && ['UNSCORE', 'SCORE_REJECTED'].includes(scoreStatus)
      : !readOnly && resultFlag && reportStatus !== 'APPROVALING';

  const getRectification = value => {
    setLoading(true);
    getRectificationItems(value)
      .then(res => {
        const response = getResponse(res);
        if (response) {
          history.push(`/sqam/create8D/detail/${response.externalOrderId}`);
          dataSet.query();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const showExtraColumnsFlag =
    sourceKey !== 'SCORE_DETAILS' &&
    (reportStatus === 'PUBLISHED' ||
      (['APPROVED'].includes(reportStatus) && progressStatus === 'EVAL_COMPLETE'));

  const cols = [
    {
      name: 'problemStatusMeaning',
      width: 120,
      hidden: !showExtraColumnsFlag,
      renderer: ({ record, value, name }) => {
        return value ? <span>{renderStatus({ value, name, record })}</span> : <span>-</span>;
      },
    },
    {
      name: 'opteration',
      width: 140,
      hidden: !showExtraColumnsFlag,
      renderer: ({ record }) => {
        return !record.get('problemNum') ? (
          <Button
            funcType="link"
            disabled={isPub}
            onClick={() => {
              getRectification(record.data);
            }}
          >
            {intl.get('sslm.supplierDocManage.view.button.qualityRectification').d('发起质量整改')}
          </Button>
        ) : (
          <span>-</span>
        );
      },
    },
    {
      name: 'problemNum',
      width: 150,
      hidden: !showExtraColumnsFlag,
      renderer: ({ value, record }) => {
        return value ? (
          <Button
            funcType="link"
            onClick={() => {
              const externalOrderId = record.get('externalOrderId');
              history.push({
                pathname: `/sqam/initiated8D/detail/${externalOrderId}`,
              });
            }}
          >
            {value}
          </Button>
        ) : (
          <span>-</span>
        );
      },
    },
    {
      name: 'problemTitle',
      width: 150,
      hidden: !showExtraColumnsFlag,
    },
    {
      name: 'reformContent',
      width: 200,
      editor: record =>
        sourceKey === 'SCORE_DETAILS' ? isEdit && record?.get('createdBy') === userId : isEdit,
    },
    {
      name: 'createdUserName',
      width: 120,
    },
    {
      name: 'creationDate',
      width: 140,
    },
    {
      name: 'lastUpdatedUserName',
      width: 120,
    },
    {
      name: 'lastUpdateDate',
      width: 140,
    },
    {
      name: 'createdMomentMeaning',
      width: 100,
    },
  ].filter(col => !col.hidden);

  const columns = remote
    ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAILS_REFORM_CONTENT_COLUMNS', cols, {
        isEdit,
        sourceKey,
        reportStatus,
      })
    : cols;

  const remoteBtns = remote
    ? remote.render('SSLM.PURCHASER_EVALUATION_WORKBENCH_QUALITY_RECTIFY_BTNS', <></>, {
        isEdit,
        dataSet,
        history,
        sourceKey,
        setLoading,
        basicInfoDs,
        reportStatus,
      })
    : [];
  const commonBtns =
    sourceKey === 'SCORE_DETAILS'
      ? []
      : [
        <ExcelExportPro
          allBody
          method="POST"
          requestUrl={`${SRM_SSLM}/v1/${organizationId}/site_eval_external_orders/eval-report/${evalHeaderId}/export`}
          templateCode="SRM_C_SRM_SSLM_SITE_EVAL_EXTERNAL_ORDER_EXPORT"
          buttonText={intl.get('hzero.common.button.export').d('导出')}
          otherButtonProps={{
              funcType: 'flat',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: 'srm.partner.purchaser.evaluation-workbench.button.external-order.export',
                  type: 'button',
                },
              ],
            }}
        />,
          remoteBtns,
        ];
  const btns = useMemo(() => (isEdit ? ['add', 'delete', ...commonBtns] : [...commonBtns]), [
    isEdit,
  ]);
  const buttons = remote
    ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAILS_REFORM_CONTENT_BTNS', btns, {
        isEdit,
        sourceKey,
        dataSet,
      })
    : btns;

  const selectionMode = remote
    ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH_SELECTION_MODE', isEdit, {
        dataSet,
        sourceKey,
        reportStatus,
      })
    : isEdit;

  return customizeTable(
    {
      code: customizeCode || 'SSLM.PURCHASER_ASSESS_DETAIL.QUALITY_RECTIFICATION',
      readOnly: customizeReadOnly,
    },
    <Table
      columns={columns}
      dataSet={dataSet}
      buttons={buttons}
      style={{ maxHeight: 420 }}
      selectionMode={selectionMode ? 'rowbox' : 'none'}
    />
  );
};

export default ReformContent;
