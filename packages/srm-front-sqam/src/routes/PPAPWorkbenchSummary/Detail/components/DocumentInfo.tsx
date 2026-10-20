// 交付物清单详情
import React, { useMemo, useContext } from 'react';
import { Attachment, Output } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../components/EditorForm';
import { DetailDocumentCode, DetailDocumentAttachCode, TagColor } from '../../utils/type';

import styles from '../../../PPAPWorkbench/Detail/index.less';

const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'attachment',
];

const DocumentInfo = (props) => {
  const { columnsNum, readOnly } = props;
  const {
    documentInfoDs, customizeForm,
  } = useContext<StoreValueType>(Store);

  const editorColumns = useMemo(() => {
    return [
      {
        name: 'documentStatus',
        renderer: ({ value, text, record }) => <StatusTag value={text} flag color={record?.get('stageStatus') === 'NOT_STARTED' ? 'gray' : TagColor[value] || 'success'} />,
      },
      'documentNum',
      'documentName',
      'companyName',
      'supplierCompanyName',
      'stageNum',
      'stageName',
      'projectNum',
      'projectName',
      'campMeaning',
      'approvedOpinion',
    ];
  }, []);

  const attachmentColumns = useMemo(() => {
    return [
      { name: 'documentAttachmentUuid', editor: Attachment, useEditor: true, showHistory: true, readOnly: true },
      { name: 'templateAttachmentUuid', editor: Attachment, useEditor: true, showHistory: true, readOnly: true },
      { name: 'remark', editor: Output },
    ];
  }, []);
  if (!documentInfoDs?.current?.get('documentId')) return null;
  return (
    <div className={classNames(styles['sqam-detail-content-ppapWorkbench'], { [styles['sqam-detail-content-ppapWorkbench-panel']]: readOnly })}>
      <Collapse
        ghost
        trigger="icon"
        expandIconPosition="text-right"
        defaultActiveKey={defaultActiveKey}
      >
        <Panel key='basic' forceRender header={intl.get(`sqam.ppap.view.decument.info`).d('交付物基本信息')} showArrow={false}>
          <EditorForm
            columns={columnsNum || 3}
            useColon={false}
            dataSet={documentInfoDs}
            editorFlag={false}
            editorColumns={editorColumns}
            customizeForm={customizeForm}
            customizeOptions={{ code: DetailDocumentCode }}
          />
        </Panel>
        <Panel forceRender className={classNames({ [styles['sqam-detail-content-ppapWorkbench-info']]: !readOnly }, styles['sqam-detail-content-ppapWorkbench-attachment'])} header={intl.get(`sqam.ppap.view.title.document`).d('交付物')} key='attachment' showArrow={false}>
          <EditorForm
            columns={1}
            useColon={false}
            dataSet={documentInfoDs}
            editorFlag
            editorColumns={attachmentColumns}
            customizeForm={customizeForm}
            customizeOptions={{ code: DetailDocumentAttachCode }}
          />
        </Panel>
      </Collapse>
    </div>
  );
};


export default observer(DocumentInfo);
