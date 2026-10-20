// documentStageLineDs
// 交付物清单列表
import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Table, Button, useModal, Attachment } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

import DocumentInfo from './DocumentInfo';
import { Store } from '../stores';
import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import type { StoreValueType } from '../stores';
import { DetailStageDocListCode, TagColor } from '../../utils/type';
import { useModalOpen } from '../../../../utils/hooks';
import styles from '../../../PPAPWorkbench/Detail/index.less';


const StageDocumentList = () => {
  const { documentStageLineDs, documentInfoDs, customizeTable, remoteProps } = useContext<StoreValueType>(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  // 点击交付物单号侧弹框
  const handleGetDetail = useCallback((record) => {
    documentInfoDs.loadData([record.toData()]);
    modalOpen({
      drawer: true,
      closable: true,
      title: intl.get('sqam.ppap.model.document.detail').d('交付物详情'),
      className: styles['sqam-document-modal'],
      style: { width: 742 },
      children: <DocumentInfo readOnly columnsNum={2} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [documentInfoDs, modalOpen]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'documentStatus',
        renderer: ({ value, text, record }) => {
          const statusTag = <StatusTag value={text} flag color={record?.get('stageStatus') === 'NOT_STARTED' ? 'gray' : TagColor[value] || 'success'} />;
          return remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_SUP_DETAIL_CUX_STAGE_DOCUMENT_LIST_STATUS_RENDERER', statusTag, { text, value, record, TagColor, StatusTag }) : statusTag;
        },
      },
      {
        name: 'documentNum',
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleGetDetail(record)}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'documentName',
      },
      {
        name: 'purchaseAttachmentUuid',
        renderer: ({ record }) => record?.get('camp') === 'PURCHASER' && Number(record?.get('supplierVisibleFlag')) === 1 ? (
          <Attachment
            readOnly
            viewMode='popup'
            funcType={FuncType.link}
            value={record?.get('purchaseAttachmentUuid')}
            bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
          />
        ) : null,
      },
      {
        name: 'documentAttachmentUuid',
      },
      {
        name: 'campMeaning',
      },
      {
        name: 'approvedBy',
        renderer: ({ record }) => {
          const { approveType, employeeName, roleName } = record?.get(['approveType', 'employeeName', 'roleName']) || {};
          return approveType === 'EMPLOYEE' ? employeeName : roleName;
        },
      },
    ];
  }, [handleGetDetail]);


  return (
    <Fragment>
      {customizeTable(
        { code: DetailStageDocListCode },
        <Table
          columns={columns}
          dataSet={documentStageLineDs}
        />
      )}
    </Fragment>

  );
};

export default observer(StageDocumentList);
