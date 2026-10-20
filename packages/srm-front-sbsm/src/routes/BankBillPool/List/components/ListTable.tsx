import React, { useContext, useMemo, useCallback } from 'react';
import { Modal, useModal } from 'choerodon-ui/pro';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/interface';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import Split from './Split';
import { Store } from '../stores';
import PayDocRecord from './PayDocRecord';
import { billPoolHandle } from '../../utils/api';
import { useModalOpen } from '../../../../hooks';
import { actionFlagger } from '../../utils/utils';
import commonStyles from '../../../../common.less';
import { confirmDocNegAction } from '../../../../utils/utils';
import { statusTagRender } from '../../../../components/StatusTag';
import MultiTextFilter from '../../../../components/MultiTextFilter';
import { formatColumnCommand } from '../../../../components/ColumnBtnGroup';
import { GridCustCodeMap, FilterCustCodeMap, ActiveKey } from '../../utils/type';


const ListTable = (props) => {

  const { activeKey } = props;
  const modalOpen = useModalOpen(useModal());
  const { dsMap, permissionMap, customizeTable, handleToDetail, fetchTabKeysCount } = useContext(Store);
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  const fetchTotalCount = useCallback(() => {
    fetchTabKeysCount([activeKey]);
  }, [activeKey, fetchTabKeysCount]);

  const handleViewPayDocRecord = useCallback((record) => {
    modalOpen({
      size: 'medium',
      title: intl.get('sbsm.bankBillPool.model.bankBillPool.associatedPayDocRecord').d('关联支付单记录'),
      children: <PayDocRecord paperId={record.get('paperId')} />,
    });
  }, [modalOpen]);

  const handleVoid = useCallback(async (record) => {
    const confirmRes = await confirmDocNegAction({
      action: intl.get('sbsm.bankBillPool.view.button.void').d('作废'),
      documentNum: record.get('paperNum'),
      documentName: intl.get('sbsm.bankBillPool.view.message.billPaper').d('票据'),
    });
    if (!confirmRes) return;
    const res = await billPoolHandle('void', { body: record.toJSONData() });
    if (!res) return;
    currentListDs.query(undefined, undefined, false);
    fetchTotalCount();
  }, [currentListDs, fetchTotalCount]);

  const handleSplit = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: commonStyles['sbsm-large-modal'],
      title: intl.get('sbsm.bankBillPool.view.button.split').d('拆分'),
      children: (
        <Split
          topRecord={record}
          okCallback={() => {
            currentListDs.query();
            fetchTotalCount();
          }}
        />
      ),
    });
  }, [currentListDs, fetchTotalCount]);

  const handleWithout = useCallback(async (record) => {
    const feedback: string = await Modal.confirm({
      title: intl.get('sbsm.common.view.title.tip').d('提示'),
      children: intl
        .get('sbsm.bankBillPool.view.message.confirmMarkPaperWithoutUse', { paperNum: record.get('paperNum') })
        .d('是否标记票据{paperNum}为无需使用'),
    });
    if (feedback !== 'ok') return;
    const res = await billPoolHandle('without', { body: record.toJSONData() });
    if (!res) return;
    currentListDs.query(undefined, undefined, false);
    fetchTotalCount();
  }, [currentListDs, fetchTotalCount]);

  const getOperationCommand = useCallback(
    ({ record }) => {
      const paperId = record.get('paperId');
      const [editBtn, voidBtn, splitBtn, withoutBtn] = actionFlagger({
        record,
        permissionMap,
        action: ['edit', 'void', 'split', 'without'],
      });
      const buttons = [
        {
          name: 'edit',
          text: intl.get('hzero.common.button.edit').d('编辑'),
          onClick: () => handleToDetail(paperId, 'edit'),
          showFlag: editBtn,
        },
        {
          name: 'void',
          text: intl.get('sbsm.bankBillPool.view.button.void').d('作废'),
          showFlag: voidBtn,
          onClick: () => handleVoid(record),
        },
        {
          name: 'split',
          text: intl.get('sbsm.bankBillPool.view.button.split').d('拆分'),
          showFlag: splitBtn,
          onClick: () => handleSplit(record),
        },
        {
          name: 'without',
          text: intl.get('sbsm.bankBillPool.view.button.noNeedToUse').d('无需使用'),
          showFlag: activeKey !== ActiveKey.Without && withoutBtn,
          onClick: () => handleWithout(record),
        },
      ];
      return formatColumnCommand({ buttons });
    },
    [
      activeKey,
      handleVoid,
      handleSplit,
      permissionMap,
      handleWithout,
      handleToDetail,
    ]
  );

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      { name: 'paperSystemStatus', width: 150, renderer: statusTagRender },
      (activeKey !== ActiveKey.Occupy && {
        name: 'operation',
        width: 180,
        align: ColumnAlign.left,
        command: getOperationCommand,
        title: intl.get('hzero.common.button.action').d('操作'),
      }) as ColumnProps,
      {
        name: 'payDocRecord',
        width: 160,
        title: intl.get('sbsm.bankBillPool.model.bankBillPool.associatedPayDocRecord').d('关联支付单记录'),
        renderer: ({ record }) => Number(record?.get('associateFlag')) === 1 ? (
          <a onClick={() => handleViewPayDocRecord(record)}>
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ) : null,
      },
      {
        name: 'paperNum',
        width: 150,
        renderer: ({ value, record }) => (
          <a onClick={() => handleToDetail(record?.get('paperId'))}>
            {value}
          </a>
        ),
       },
      { name: 'companyNum', width: 150 },
      { name: 'companyName', width: 220 },
      { name: 'dataSourceMeaning', width: 150 },
      { name: 'paperTypeMeaning', width: 150 },
      { name: 'paperStatus', width: 150 },
      { name: 'bankName', width: 150 },
      { name: 'drawer', width: 150 },
      { name: 'acceptor', width: 150 },
      { name: 'payer', width: 150 },
      { name: 'invoiceDate', width: 120 },
      { name: 'issueDate', width: 120 },
      { name: 'draftsDeadLine', width: 120 },
      { name: 'paperAmount', width: 150 },
      { name: 'associatePayNum', width: 150 },
      { name: 'associateStatementLineNum', width: 150 },
      { name: 'createdByName', width: 150 },
      { name: 'creationDate', width: 150 },
      { name: 'sourcePaperNum', width: 150 },
      { name: 'attachmentUuid', width: 150 },
    ];
  }, [
    activeKey,
    handleToDetail,
    getOperationCommand,
    handleViewPayDocRecord,
  ]);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: GridCustCodeMap[activeKey] },
        <SearchBarTable
          cacheState
          customizable
          columns={columns}
          dataSet={currentListDs}
          searchCode={FilterCustCodeMap[activeKey]}
          style={{ maxHeight: 'calc(100% - 20px)' }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="paperNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.bankBillPool.view.placeholder.enterBillNumToQuery')
                    .d('请输入票号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
};

export default ListTable;
