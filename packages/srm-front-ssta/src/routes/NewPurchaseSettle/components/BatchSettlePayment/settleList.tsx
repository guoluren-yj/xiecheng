import type { ReactElement } from 'react';
import React, { useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { DataSet, Table, useModal, Modal, Button } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { flow, isFunction } from 'lodash';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import type { TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse } from 'utils/utils';

import { settleListDS } from './storeDS';
import DynamicAlert from '../../../Components/DynamicAlert';
import Styles from '../../../common.less';
import { useModalOpen } from '../../hooks';
import AddSettleList from './AddSettleList';
import { getBatchSettleList } from '../../../../services/settlePoolServices';
import { handleViewDetail } from './utils';

export const BatchCode = 'SSTA.PURCHASE_SETTLE_DETAIL.BATCH_SETTLE_LIST';



interface BatchSettleListProps {
  modal?: any,
  batchApproveId: any,
  okCallback: () => void,
  customizeForm: Function,
  customizeTable: Function,
  handleBackList: Function,
  setSettleList: any,
  settleHeaderId: string,
  setActiveKey: any,
  handleReplaceRouter: Function,
}

const BatchSettleList = flow(
  observer,
  // @ts-ignore
  withCustomize({
    unitCode: [
      BatchCode,
    ],
  }),
)((props: BatchSettleListProps) => {

  const {
    modal,
    okCallback,
    batchApproveId,
    // customizeForm,
    customizeTable,
    handleBackList,
    setSettleList,
    settleHeaderId,
    setActiveKey,
    handleReplaceRouter,
  } = props;
  const settleListDs = useMemo(() => new DataSet(settleListDS(batchApproveId)), [batchApproveId]);
  const { selected } = settleListDs;
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);

  const handleSubmit = useCallback(async () => {
    const res = await settleListDs.submit();
    if (!res) return false;
    if (isFunction(okCallback)) okCallback();
  }, [settleListDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
  }, [modal, handleSubmit]);


  const columns: any = useMemo(() => {
    return [
      {
        name: 'settleNum',
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleViewDetail(record?.get('settleHeaderId'))}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'companyName',
      },
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'paymentApplyAmount',
      },
      {
        name: 'paymentAmount',
      },
      {
        name: 'applyAmount',
      },
    ];
  }, [handleViewDetail]);

  const handleUpdateBatchSettle = useCallback(async() => {
    settleListDs.query();
    const res = getResponse(await getBatchSettleList(batchApproveId));
    if (res) {
      setSettleList(res);
      if (!res.some((item) => item.settleHeaderId === settleHeaderId)) {
        setActiveKey(res[0]?.settleHeaderId);
      }
    }
  }, [batchApproveId, setSettleList, settleHeaderId, setActiveKey, settleListDs]);

  const handleAdd = useCallback(() => {
    modalOpen({
      title: intl.get('ssta.common.button.settle.addSettle').d('新增结算单'),
      size: 'large',
      editFlag: true,
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-detailDrawer-modal'],
      okText: intl.get('hzero.common.button.confirm').d('确认'),
      children: (
        <AddSettleList
          batchApproveId={batchApproveId}
          okCallback={handleUpdateBatchSettle}
        />
      ),
    });
  }, [handleUpdateBatchSettle, batchApproveId]);

  const handleDelete = useCallback(async() => {
    // 是否全部勾选
    const flag = settleListDs?.totalCount === selected?.length;
    const msg = flag ? intl.get('ssta.common.view.message.batch.removeAllTips').d('本批次下所有结算单均移除后，自动解散当前批次，返回结算单列表，是否确认解散当前结算单批次') : intl.get('ssta.common.view.message.batch.removeTips').d('是否确认移除选中行？');
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.title.tip').d('提示'),
      children: msg,
    });
    if (confirmRes !== 'ok') return false;
    const res = await settleListDs.delete(selected, false);
    if (!res) return;
    if (flag && handleBackList) handleBackList();
    const deleteCurrentFlag = selected.some(record => record.key === settleHeaderId);
    if (deleteCurrentFlag) {
      return handleReplaceRouter({
        settleHeaderId: settleListDs.get(0)?.key,
      });
    }
    handleUpdateBatchSettle();
  }, [settleListDs, selected, settleHeaderId, handleBackList, handleUpdateBatchSettle, handleReplaceRouter]);

  const buttons = useMemo(() => {
    return [
      [TableButtonType.add, { onClick: handleAdd, name: 'add' }] as [TableButtonType, TableButtonProps],
      [TableButtonType.delete, { onClick: handleDelete, name: 'delete', children: intl.get(`ssta.common.view.button.batchremove`).d('批量移除'), icon: 'delete_sweep' }] as [TableButtonType, TableButtonProps],
    ];
  }, [handleAdd, handleDelete]);

  return (
    <div>
      <DynamicAlert
        message={intl.get('ssta.common.view.message.batchSettleDocument').d('可在当前页面中新增结算单至本批次中一并提交，或从本批次中移除结算单，移除后的结算单状态保留新建/已退回状态，可在工作台列表页面找到对应单据继续编辑')}
      />
      <div>
        {customizeTable(
          { code: BatchCode },
          <Table
            dataSet={settleListDs}
            columns={columns}
            buttons={buttons}
          />
        )}
      </div>
    </div>
  );
}) as (props: BatchSettleListProps) => ReactElement;

export default BatchSettleList;
