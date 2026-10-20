/*
 * @Date: 2022-07-02 13:33:10
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Tag } from 'choerodon-ui';
import { DataSet, Tabs, Table, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { approveNameRender } from 'utils/renderer';

import { queryH0ApproveRecords } from '@/services/commonService';
import { operationRecordDS, approvedRecordDS } from './stores/indexDS';

const H0ApproveRecord = ({
  documentId,
  params: { sourceCode, documentType, submitUserId } = {},
}) => {
  const [spinning, setSpinning] = useState(false);
  const operationDs = useMemo(
    () => new DataSet(operationRecordDS({ documentId, params: { sourceCode, submitUserId } })),
    [documentId]
  );
  const approveDs = useMemo(() => new DataSet(approvedRecordDS()), []);

  const operationColumns = [
    {
      name: 'realName',
      width: 200,
    },
    {
      name: 'operatedDate',
      width: 250,
    },
    {
      name: 'operationMeaning',
    },
    { name: 'operatedRemark' },
  ];
  const actionType = {
    startEvent: intl.get('hzero.common.text.startEvent').d('开始'),
    userTask: intl.get('hzero.common.text.userTask').d('审批中'),
    endEvent: intl.get('hzero.common.text.endEvent').d('结束'),
  };
  const approveColumns = [
    {
      name: 'name',
      width: 200,
      renderer: ({ record }) => {
        const {
          data: { nodeNameMeaning, actType },
        } = record;
        return `${nodeNameMeaning}${actionType[actType]}`;
      },
    },
    {
      name: 'action',
      width: 120,
      renderer: ({ record = {} }) => {
        const { data: { action, actType } = {} } = record;
        if (action) {
          return approveNameRender(action);
        } else if (actType === 'startEvent') {
          return <Tag color="green">{intl.get('hwfp.common.status.start').d('开始')}</Tag>;
        } else if (actType === 'endEvent') {
          return <Tag color="gray">{intl.get('hwfp.common.status.end').d('结束')}</Tag>;
        } else if (actType) {
          return <Tag>{intl.get('hwfp.common.view.message.approvaling').d('审批中')}</Tag>;
        } else {
          return '';
        }
      },
    },
    {
      name: 'assigneeName',
      width: 150,
    },
    {
      name: 'comment',
    },
    {
      name: 'endTime',
      width: 150,
    },
  ];

  useEffect(() => {
    setSpinning(true);
    queryH0ApproveRecords({
      documentId,
      documentType: documentType || 'SITE_EVAL',
      userId: submitUserId,
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          approveDs.loadData(res);
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, [documentId]);

  return (
    <Tabs animated={false}>
      <Tabs.TabPane
        tab={intl.get('sslm.siteInvestigateReport.view.button.operationRecord').d('操作记录')}
      >
        <Table dataSet={operationDs} columns={operationColumns} border />
      </Tabs.TabPane>
      <Tabs.TabPane tab={intl.get('sslm.common.button.approveRecords').d('审批记录')}>
        <Spin spinning={spinning}>
          <Table dataSet={approveDs} columns={approveColumns} border />
        </Spin>
      </Tabs.TabPane>
    </Tabs>
  );
};

export default H0ApproveRecord;
