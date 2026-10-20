/*
 * @Description: 模板审查记录
 * @Date: 2026-03-04 15:20:13
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useMemo } from 'react';
import intl from 'utils/intl';
import { useDataSet, Table, Modal } from 'choerodon-ui/pro';

import { SRM_SPCM } from '_utils/config';

import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const recordDS = ({ documentId }) => {
  return {
    paging: true,
    selection: false,
    autoQuery: true,
    // primaryKey: 'recordId',
    pageSize: 20,
    fields: [
      {
        label: intl.get(`spcm.contractTemplate.model.taskId`).d('任务ID'),
        name: 'taskId',
        type: 'string',
      },
      {
        label: intl.get(`spcm.contractTemplate.model.taskCreateDate`).d('任务创建时间'),
        name: 'creationDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`spcm.contractTemplate.model.taskStatus`).d('任务状态'),
        name: 'taskStatus',
        type: 'string',
        lookupCode: 'SPCM.REVIEW_TASK_STATUS',
      },
      {
        label: intl.get(`spcm.contractTemplate.model.lawyer`).d('审查发起人'),
        name: 'lawyer',
      },
      {
        name: 'reviewResult',
        label: intl.get('spcm.common.model.common.reviewResult').d('审查结果'),
      },
      {
        label: intl.get(`spcm.contractTemplate.model.standpoint`).d('合同立场'),
        name: 'standPoint',
      },
      {
        label: intl.get(`spcm.contractTemplate.model.cusCheckContent`).d('自定义审查内容'),
        name: 'reviewContent',
      },
      {
        label: intl.get(`spcm.contractTemplate.model.taskMessage`).d('返回消息'),
        name: 'taskMessage',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/smart-review-tasks/query`,
          method: 'GET',
          params: { ...params, documentId },
        };
      },
    },
  };
};

const ReviewRecord = ({ pcTemplateFileId }) => {
  const recordDs = useDataSet(() =>
    recordDS({
      documentId: pcTemplateFileId,
    })
  );

  const columns = useMemo(
    () => [
      { name: 'taskId' },
      { name: 'creationDate' },
      { name: 'taskStatus' },
      { name: 'lawyer' },
      {
        name: 'reviewResult',
        renderer: ({ record }) =>
          record?.get('taskStatus') === 'SUCCESS' && (
            <a onClick={() => window?.open(record?.get('resultUrl'))}>
              {intl.get('spcm.workspace.view.button.viewSmartReview').d('查看审查结果')}
            </a>
          ),
      },
      { name: 'standPoint' },
      { name: 'reviewContent' },
      { name: 'taskMessage' },
    ],
    []
  );

  return <Table dataSet={recordDs} columns={columns} />;
};

export default ReviewRecord;

export function showReviewRecord(props = {}) {
  Modal.open({
    key: Modal.key(),
    drawer: true,
    title: intl.get('spcm.contractTemplate.view.title.reviewRecord').d('模板审查记录'),
    children: <ReviewRecord {...props} />,
    closable: true,
    movable: false,
    destroyOnClose: true,
    style: { width: 1090 },
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    okButton: false,
  });
}
