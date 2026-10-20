import React, { useMemo, useEffect, useCallback } from 'react';
import { DataSet, Switch, TextArea, Select } from 'choerodon-ui/pro';
import { Card, Collapse } from 'choerodon-ui';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import { invApplyHeaderDS } from '../../storeDS';
import EditorForm from '../../../Components/EditorForm';
import styles from '../../index.less';
import { batchSaveInvApply } from '../../api';

const { Panel } = Collapse;

const defaultActiveKey = [
  'header',
  'line',
];

const otherColumns = [
  { name: 'invoiceBy' },
  { name: 'payee' },
  { name: 'reviewer' },
  { name: 'invoiceSpecialMark', editor: Select },
  { name: 'remark', editor: TextArea, colSpan: 2, newLine: true },
];

const draweeColumns = [
  { name: 'receiver' },
  { name: 'recipientAddress' },
  { name: 'recipientPhone' },
  { name: 'pushPhoneFlag', editor: Switch },
  { name: 'recipientEmail' },
  { name: 'pushEmailFlag', editor: Switch },
];


interface BatchEditHeaderProps {
  modal?: any;
  sourceDocId: string | number | undefined;
  invApplyHeaderDs: DataSet
}

const BatchEditHeader = (props: BatchEditHeaderProps) => {

  const { modal, sourceDocId, invApplyHeaderDs } = props;

  const batchEditHeaderDs = useMemo(() => new DataSet(invApplyHeaderDS()), []);

  const handleOk = useCallback(async () => {
    const headerData = batchEditHeaderDs.current?.toData() || {};
    invApplyHeaderDs.status = DataSetStatus.loading;
    const res = getResponse(await batchSaveInvApply({
      ...headerData,
      sourceDocId,
    }));
    invApplyHeaderDs.status = DataSetStatus.ready;
    if (!res) return false;
    notification.success({});
    invApplyHeaderDs.query();
  }, [sourceDocId, invApplyHeaderDs, batchEditHeaderDs]);

  useEffect(() => {
    const defaultData = invApplyHeaderDs.current?.toData() || {};
    batchEditHeaderDs.loadData([defaultData]);
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk, invApplyHeaderDs, batchEditHeaderDs]);

  const cardList = useMemo(() => {
    return [
      {
        key: 'other',
        title: intl.get(`ssta.costSheet.view.message.panel.othersInf`).d('其他信息'),
        editorColumns: otherColumns,
      },
      {
        key: 'drawee',
        title: intl.get(`ssta.common.view.title.draweeInfo`).d('受票人信息'),
        editorColumns: draweeColumns,
      },
    ];
  }, []);

  return (
    <Content className={`${styles['ssta-detail-modal-content']} ${styles['ssta-detail-content-invoicingApply']}`}>
      <Collapse
        ghost
        trigger="icon"
        expandIconPosition="text-right"
        defaultActiveKey={defaultActiveKey}
      >
        <Panel forceRender showArrow={false} key="header" header={intl.get(`ssta.costSheet.view.message.panel.baseInfoss`).d('发票头信息')}>
          {cardList.map((item) => {
            const { key, title, editorColumns } = item;
            return (
              <Card key={key} bordered={false} className={DETAIL_CARD_CLASSNAME} title={title}>
                <EditorForm
                  editorFlag
                  useWidthPercent
                  columns={2}
                  useColon={false}
                  dataSet={batchEditHeaderDs}
                  editorColumns={editorColumns}
                />
              </Card>
            );
          })}
        </Panel>
      </Collapse>
    </Content>
  );
};

export default BatchEditHeader;
