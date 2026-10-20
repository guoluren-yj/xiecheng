/**
 * 采购方评估 - 详情 - 评估小组
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-01 15:53:44
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/Details/AssessmentPanel.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment, useMemo } from 'react';
// import intl from 'utils/intl';
import { Table, CheckBox } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';

const AssessmentPanel = observer(
  ({ customizeTable, custLoading, dataSet, isEdit, assessmentInfoDs, customizeCode }) => {
    const { reportStatus, progressStatus } =
      dataSet?.parent?.current?.get(['reportStatus', 'progressStatus']) || {};
    const newIsEdit =
      isEdit &&
      ['EVAL_PREPARE', 'SUPPLIER_EVAL'].includes(progressStatus) &&
      ['NEW', 'REJECTED', 'APPROVED', 'FEEDBACK'].includes(reportStatus);
    const buttons = [
      (progressStatus === 'EVAL_RESULT' || newIsEdit) && [
        'add',
        {
          onClick: () => {
            const evalHeaderId = dataSet?.parent?.current?.get('evalHeaderId');
            dataSet.create({ evalHeaderId });
          },
        },
      ],
      (progressStatus === 'EVAL_RESULT' || newIsEdit) && [
        'save',
        {
          onClick: () => {
            dataSet.submit().then(res => {
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
      (progressStatus === 'EVAL_RESULT' || newIsEdit) && [
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
      // newIsEdit && (
      //   <Button
      //     icon="flash_on"
      //     // onClick={handleOpenBatchAllocation}
      //     // disabled={isDisabled}
      //     funcType="flat"
      //   >
      //     {intl.get('sslm.purchaserEvaluationDetail.button.header.urge').d('催办')}
      //   </Button>
      // ),
    ];

    const columns = useMemo(
      () => [
        {
          name: 'userLov',
          width: 150,
          editor: newIsEdit,
        },
        {
          name: 'member',
          width: 150,
          editor: newIsEdit,
        },
        {
          name: 'department',
          width: 150,
          editor: newIsEdit,
        },
        {
          name: 'post',
          width: 150,
          editor: newIsEdit,
        },
        {
          name: 'phone',
          width: 260,
          editor: newIsEdit,
        },
        {
          name: 'email',
          width: 200,
          editor: newIsEdit,
        },
        {
          name: 'leaderFlag',
          width: 150,
          renderer: ({ value, record }) => {
            return newIsEdit ? (
              <CheckBox record={record} name="leaderFlag" />
            ) : (
              yesOrNoRender(value)
            );
          },
        },
        // { name: 'evaluationIndex', width: 150, editor: isEdit },
      ],
      [isEdit, progressStatus]
    );

    return (
      <Fragment>
        {customizeTable(
          {
            code: customizeCode,
            readOnly: !isEdit,
          },
          <Table
            custLoading={custLoading}
            buttons={buttons}
            columns={columns}
            dataSet={dataSet}
            border={false}
            selectionMode={newIsEdit || progressStatus === 'EVAL_RESULT' ? 'rowbox' : 'none'}
            style={{
              maxHeight: 420,
            }}
          />
        )}
      </Fragment>
    );
  }
);

export default AssessmentPanel;
