/*
 * C7nOperationRecord - 操作记录
 * @date: 2021/06/15 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useMemo, useCallback, useEffect } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { Tabs } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import C7NUpload from '_components/C7NUpload';
import { BKT_HWFP } from 'utils/config';

import { line, approval } from './store/lineDs';

const C7nOperationRecord = (props) => {
  const { poHeaderId, btnProps = {} } = props;
  const lineDs = useMemo(() => new DataSet(line(poHeaderId)), []);
  const approvalDs = useMemo(() => new DataSet(approval()), []);
  const columns = useMemo(
    () => [
      {
        header: intl
          .get('sodr.workspace.model.operationRecord.statusChangeRecord')
          .d('状态变更记录'),
        children: [
          {
            name: 'processUserName',
            width: 110,
          },
          {
            name: 'processedDate',
            width: 160,
          },
          {
            name: 'processType',
            width: 110,
            renderer: ({ record }) => record.get('processTypeMeaning'),
          },
          {
            name: 'processRemark',
            width: 110,
          },
          {
            name: 'versionNum',
            width: 110,
          },
        ],
      },
      {
        header: intl.get('sodr.workspace.model.operationRecord.dataChangeRecord').d('数据变更记录'),
        children: [
          {
            name: 'changeType',
            width: 110,
            renderer: ({ record }) => record.get('changeTypeMeaning'),
          },
          {
            name: 'displayLineNum',
            width: 110,
          },
          {
            name: 'displayLineLocationNum',
            width: 110,
          },
          {
            name: 'changeFieldName',
            width: 110,
            renderer: ({ record }) => record.get('changeFieldNameMeaning'),
          },
          {
            name: 'oldValue',
            width: 110,
          },
          {
            name: 'newValue',
          },
        ],
      },
    ],
    []
  );
  const approvalColumns = useMemo(
    () => [
      {
        name: 'endTime',
        width: 150,
      },
      {
        name: 'action',
        width: 150,
      },
      {
        name: 'name',
        width: 150,
      },
      {
        name: 'assigneeName',
        width: 150,
      },
      {
        name: 'comment',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 150,
        renderer: ({ record, name }) => {
          return (
            <C7NUpload
              viewOnly
              record={record}
              name={name}
              bucketName={BKT_HWFP}
              bucketDirectory="hwfp01"
            />
          );
        },
      },
    ],
    []
  );

  useEffect(() => {
    approvalDs.setQueryParameter('poHeaderId', poHeaderId);
  }, []);

  const handleOpen = useCallback(() => {
    lineDs.query();
    approvalDs.query();
    Modal.open({
      drawer: true,
      closable: true,
      style: { width: 1090 },
      title: intl.get('sodr.workspace.view.option.operationRecord').d('操作记录'),
      children: (
        <Tabs animated={false}>
          <Tabs.TabPane
            tab={intl.get('sodr.workspace.view.option.operationRecord').d('操作记录')}
            key="operationRecord"
          >
            <Table dataSet={lineDs} columns={columns} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get('sodr.workspace.view.option.approvalRecord').d('审批记录')}
            key="approvalRecord"
          >
            <Table dataSet={approvalDs} columns={approvalColumns} />
          </Tabs.TabPane>
        </Tabs>
      ),
      footer: null,
    });
  }, []);
  return isEmpty(btnProps) ? (
    <a onClick={handleOpen}>
      {intl.get('sodr.workspace.view.option.operationRecord').d('操作记录')}
    </a>
  ) : (
    <Button {...btnProps} onClick={handleOpen}>
      {intl.get('sodr.workspace.view.option.operationRecord').d('操作记录')}
    </Button>
  );
};

export default C7nOperationRecord;
