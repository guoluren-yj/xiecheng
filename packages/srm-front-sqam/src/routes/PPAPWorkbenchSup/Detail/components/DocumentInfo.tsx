// 交付物清单详情
import React, { useMemo, useContext } from 'react';
import { Attachment, TextArea, Output } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

// import NavigationAnchor from '../../../components/NavigationAnchor';
import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../components/EditorForm';
import { DetailDocumentCode, DetailDocumentAttachCode, TagColor, DetailDocumentCollapse, campCode } from '../../utils/type';
import styles from '../../../PPAPWorkbench/Detail/index.less';
import { getAttachmentUploadFlag } from '../../utils/utils';

const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'attachment',
];

const DocumentInfo = (props) => {
  const { columnsNum, readOnly } = props;
  const {
    documentInfoDs, typeFlag, customizeCollapse, customizeForm, remoteProps, headerDs,
  } = useContext<StoreValueType>(Store);
  const { documentStatus, documentId, camp, supplierVisibleFlag, documentUploadPoint, stageStatus } = documentInfoDs.current?.get(['documentStatus', 'documentId', 'camp', 'supplierVisibleFlag', 'documentUploadPoint', 'stageStatus']) || {};
  const { projectStatus } = headerDs.current?.get(['projectStatus']) || {};

  const editFlag = useMemo(() => {
    return !typeFlag && ['UNUPLOADED', 'REJECTED'].includes(documentStatus) && !readOnly && camp === campCode;
  }, [typeFlag, documentStatus, readOnly, camp]);

  const editorColumns = useMemo(() => {
    return [
      {
        name: 'documentStatus',
        renderer: ({ value, text, record }) => {
          const statusTag = <StatusTag value={text} flag color={record?.get('stageStatus') === 'NOT_STARTED' ? 'gray' : TagColor[value] || 'success'} />;
          return remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_SUP_DETAIL_CUX_DOCUMENT_INFO_STATUS_RENDERER', statusTag, { text, value, record, TagColor, StatusTag }) : statusTag;
        },
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
    const attachmentUploadFlag = getAttachmentUploadFlag({documentStatus, documentUploadPoint, projectStatus, stageStatus});
    return [
      camp === 'PURCHASER' && Number(supplierVisibleFlag) === 1 && { name: 'purchaseAttachmentUuid', editor: Attachment, useEditor: true, showHistory: true, readOnly: true },
      camp === campCode && { name: 'documentAttachmentUuid', editor: Attachment, useEditor: true, showHistory: true, readOnly: typeFlag || !editFlag || !attachmentUploadFlag },
      !(camp === 'PURCHASER' && Number(supplierVisibleFlag) !== 1) && { name: 'templateAttachmentUuid', editor: Attachment, useEditor: true, showHistory: true, readOnly: true },
      { name: 'remark', editor: editFlag ? TextArea : Output },
    ];
  }, [typeFlag, editFlag, camp, supplierVisibleFlag, documentStatus, documentUploadPoint, projectStatus, stageStatus]);

  const paneList = useMemo(() => {
    return [
      {
        key: 'basic',
        header: intl.get(`sqam.ppap.view.decument.info`).d('交付物基本信息'),
        content: <EditorForm
          columns={columnsNum || 3}
          useColon={false}
          dataSet={documentInfoDs}
          editorFlag={false}
          editorColumns={editorColumns}
          customizeForm={customizeForm}
          customizeOptions={{ code: DetailDocumentCode }}
        />,
        showArrow: false,
      },
      {
        key: 'attachment',
        header: intl.get(`sqam.ppap.view.title.document`).d('交付物'),
        content: <EditorForm
          columns={1}
          useColon={false}
          dataSet={documentInfoDs}
          editorFlag
          editorColumns={attachmentColumns}
          customizeForm={customizeForm}
          customizeOptions={{ code: DetailDocumentAttachCode }}
        />,
        showArrow: false,
        className: classNames({ [styles['sqam-detail-content-ppapWorkbench-info']]: !readOnly, [styles['sqam-detail-content-ppapWorkbench-attachment']]: !editFlag }),
      },
    ];
  }, [columnsNum, documentInfoDs, editorColumns, attachmentColumns, readOnly, customizeForm, editFlag]);

  // const linkList = useMemo(
  //   () =>
  //     paneList.map((item) => {
  //       const { key, header } = item;
  //       return { key, title: header, href: `ppap-document-${key}-${documentId}` };
  //     }),
  //   [paneList, documentId]
  // );

  if (!documentId) return null;

  return (
    <div id={`ppap-document-detail-content-${documentId}`} className={classNames(styles['sqam-detail-content-ppapWorkbench'], { [styles['sqam-detail-content-ppapWorkbench-panel']]: readOnly })}>
      {
        customizeCollapse(
          {
            code: DetailDocumentCollapse,
          },
          <Collapse
            ghost
            trigger="icon"
            expandIconPosition="text-right"
            defaultActiveKey={defaultActiveKey}
          >
            {paneList.map((item) => {
              const { content, key, className, ...panelProps } = item;
              return (
                <Panel key={key} forceRender className={className} id={`ppap-document-${key}-${documentId}`} {...panelProps}>
                  {content}
                </Panel>
              );
            })}
          </Collapse>
        )
      }
      {/* <NavigationAnchor
        linkList={linkList}
        currentOffsetTop={40}
        custConfig={custConfig[DetailDocumentCollapse]}
        id={`ppap-document-detail-content-${documentId}`}
      /> */}
    </div>
  );
};


export default observer(DocumentInfo);
