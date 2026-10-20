import React, { useMemo, memo, useCallback, useRef } from 'react';
import { Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import QueryField from '@/components/QueryField';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from '_components/ApproveRecordSimple';

import { agmTypeRenderer, agmStatusRenderer } from './renderers';
import { effectAgreement, validateSubmitAgr } from './api';
import { handleRevokeApprove } from '../commonUtils';
import style from './index.less';

function AgmTable(props) {
  const {
    tabKey,
    dataSet,
    isReceive,
    searchBarCode,
    customizeTable,
    customizeUnitCode,
    onViewDetail = e => e,
  } = props;

  const queryRef = useRef();

  const handlePublish = useCallback(async record => {
    const _isReceive = record.get('agreementHeaderType') === 'RECEIVE';
    dataSet.status = 'submit';
    const validateRes = getResponse(await validateSubmitAgr(record.toData()));
    if (validateRes || !_isReceive) {
      const res = getResponse(await effectAgreement(record.toJSONData()));
      dataSet.status = 'ready';
      if (res) {
        notification.success();
        dataSet.query(dataSet.currentPage);
      }
    } else {
      dataSet.status = 'ready';
      dataSet.query(dataSet.currentPage);
    }
  }, []);

  const columns = useMemo(
    () =>
      [
        {
          name: 'statusCodeMeaning',
          width: 130,
          renderer: agmStatusRenderer,
          tooltip: 'none',
        },
        {
          name: 'action',
          width: 180,
          show: ['WAITING_APPROVE', 'WAITING_PUBLISH', 'ALL'].includes(tabKey),
          header: intl.get('hzero.common.action').d('操作'),
          align: 'left',
          command: ({ record }) => [
            ['WAITING_PUBLISH', 'APPROVED'].includes(record.get('statusCode')) && (
              <Button funcType="link" onClick={() => handlePublish(record)}>
                {intl.get('sagm.common.button.publish').d('发布')}
              </Button>
            ),
            ['ALL', 'WAITING_APPROVE'].includes(tabKey) && !!record.get('wflApproveFlag') && (
              <Button
                funcType="link"
                onClick={() => {
                  openApproveModal({
                    modalProps: {
                      closable: true,
                    },
                    taskId: record.get('taskId'),
                    processInstanceId: record.get('processInstanceId'),
                    onSuccess: () => dataSet.query(dataSet.currentPage),
                  });
                }}
              >
                {intl.get('hzero.common.button.approval').d('审批')}
              </Button>
            ),
            ['ALL', 'WAITING_APPROVE'].includes(tabKey) && !!record.get('wflRevokeApproveFlag') && (
              <Button
                funcType="link"
                onClick={() =>
                  handleRevokeApprove(record.get('workflowBusinessKey')?.[0], () =>
                    dataSet.query(dataSet.currentPage)
                  )
                }
              >
                {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
              </Button>
            ),
          ],
        },
        {
          name: 'agreementHeaderNum',
          width: 200,
          renderer: ({ text, record }) => (
            <a onClick={() => onViewDetail(record, tabKey)}>{text}</a>
          ),
        },
        { name: 'agreementHeaderName', minWidth: 200 },
        {
          name: 'approvalProgress',
          width: 180,
          show: tabKey === 'WAITING_APPROVE',
          header: intl.get('sagm.common.view.approvalProgress').d('审批进度'),
          renderer: ({ record }) =>
            isEmpty(record.get('simpleApprovalHistory')) ? (
              '-'
            ) : (
              <ApproveRecordSimple data={record.get('simpleApprovalHistory') || []} />
            ),
        },
        { name: 'proxyCompanyName', minWidth: 200 },
        {
          name: 'agreementHeaderTypeMeaning',
          width: 180,
          renderer: agmTypeRenderer,
        },
        { name: 'creationDate', width: 200 },
        { name: 'validDate', width: 260 },
      ].filter(f => f.show || !('show' in f)),
    []
  );

  return customizeTable(
    { code: customizeUnitCode },
    <SearchBarTable
      className={style['agm-table']}
      cacheState
      dataSet={dataSet}
      columns={columns}
      searchCode={searchBarCode}
      searchBarConfig={{
        onReset: () => {
          if (queryRef.current) queryRef.current.handleClear();
        },
        onClear: () => {
          if (queryRef.current) queryRef.current.handleClear();
        },
        fieldProps: {
          agreementHeaderType: isReceive
            ? {
                defaultValue: 'RECEIVE',
              }
            : null,
        },
        left: {
          render: () => (
            <QueryField
              name="agreementHeaderNums"
              dataSet={dataSet}
              onRef={ref => {
                queryRef.current = ref;
              }}
              placeholder={intl
                .get('sagm.common.view.queryMsg.agreementCode')
                .d('请输入协议编码查询')}
            />
          ),
        },
      }}
      style={{ maxHeight: 'calc(100% - 4px)' }}
    />
  );
}

export default memo(AgmTable);
