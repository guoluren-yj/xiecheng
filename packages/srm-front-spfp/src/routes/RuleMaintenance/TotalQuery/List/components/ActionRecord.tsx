import React, { memo, useMemo, useCallback } from 'react';
import { DataSet, Table, useModal } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

import { actionRecordDS } from '../stores/indexDS';
import { useModalOpen } from '../../../../../utils/hooks';
import ExcuteResultModal from './ExcuteResultModal';

interface CumulativeModalPropsType {
  record: any;
}


export default memo((props: CumulativeModalPropsType) => {
  const { record } = props;
  const { ruleNum } = record?.get(['ruleNum']) || {};
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);

  const actionRecordDs = useMemo(() => new DataSet(actionRecordDS(ruleNum)), [ruleNum]);

  const openExcuteResultModal = useCallback((record) => {
    const serialNum = record?.get('serialNum');
    modalOpen({
      title: intl.get(`spfp.common.view.title.excuteResultInfo`).d('执行结果单据明细'),
      size: 'small',
      editFlag: false,
      children: <ExcuteResultModal rebatesSerialNum={serialNum} />,
    });
  }, [modalOpen]);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'versionNumber',
        width: 80,
      },
      {
        name: 'calculateBeginDate',
        width: 150,
      },
      {
        name: 'currentCalculateResult',
        width: 150,
      },
      {
        name: 'excuteResultDocuments',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => openExcuteResultModal(record)}>
            {intl.get(`spfp.common.view.title.detail`).d('明细')}
          </a>
        ),
      },
      {
        name: 'successFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'errorMessage',
      },
    ];
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 180px)' }}>
      <Table dataSet={actionRecordDs} style={{ maxHeight: 'calc(100% - 22px)' }} columns={columns} />
    </div>
  );
});
