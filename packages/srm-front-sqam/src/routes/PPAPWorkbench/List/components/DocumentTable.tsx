import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Button, Attachment } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { Button as PermissionButton } from 'components/Permission';
import { observer } from 'mobx-react';

import StatusTag from '../../../PPAPTemplate/components/StatusTag';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { DocumentListCode, DocumentSearchCode, TagColor, ActiveKey } from '../../utils/type';
import { dateRangeTransform } from '../../../../utils/utils';

interface DocumentTableProps {
  activeKey: ActiveKey,
};

const DocumentTable = (props: DocumentTableProps) => {
  const { activeKey } = props;
  const { dsMap, customizeTable, handleRecordInit, handleToDetail, remoteProps } = useContext(Store) as StoreValueType;
  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  useEffect(() => {
    handleRecordInit(activeKey);
  }, [activeKey, handleRecordInit]);

  const handleClickNum = useCallback((record) => {
    const projectHeaderId = record?.get('projectHeaderId');
    const documentNum = record?.get('documentNum');
    const projectType = record?.get('projectType');
    if (activeKey === ActiveKey.DocumentPending) {
      handleToDetail(projectHeaderId, 'edit', 'document-edit', '', projectType);
    } else if (activeKey === ActiveKey.DocumentCheck) {
      handleToDetail(projectHeaderId, 'check', 'document-check', documentNum, projectType);
    } else {
      handleToDetail(projectHeaderId, 'view', 'document-all', documentNum, projectType);
    }
  }, [handleToDetail, activeKey]);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'documentStatus',
        width: 120,
        renderer: ({ text, value, record }) => {
          const statusTag = <StatusTag value={text} flag color={record?.get('stageStatus') === 'NOT_STARTED' ? 'gray' : TagColor[value] || 'success'} />;
          return remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_LIST_CUX_DOCUMENT_STATUS_RENDERER', statusTag, { text, value, record, TagColor, StatusTag }) : statusTag;
        },
      },
      activeKey === ActiveKey.DocumentAll && {
        name: 'operate',
        width: 60,
        renderer: ({ record }) => [
          (record?.get('documentUploadPoint') === 'PROJECT_PUBLISH' || (record?.get('documentUploadPoint') === 'STAGE_OPEN' && record?.get('stageStatus') === 'IN_PROGRESS')) &&
          ['UNUPLOADED'].includes(record?.get('documentStatus')) && ['PURCHASER'].includes(record?.get('camp')) && (
            <PermissionButton
              type="c7n-pro"
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleToDetail(record?.get('projectHeaderId'), 'edit', 'document-edit', record?.get('documentNum'), record?.get('projectType'))}
              permissionList={[
              ]}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </PermissionButton>
          ),
          ['COMPLETED'].includes(record?.get('documentStatus')) && !['CLOSED'].includes(record?.get('stageStatus')) && ['PURCHASER'].includes(record?.get('camp')) && Number(record?.get('assignAuthFlag')) === 1 && (
            <PermissionButton
              type="c7n-pro"
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleToDetail(record?.get('projectHeaderId'), 'edit', 'document-edit', record?.get('documentNum'), record?.get('projectType'))}
              permissionList={[
                {
                  code: `srm.sqam.ppap.workbench.button.change`,
                  type: 'button',
                },
              ]}
            >
              {intl.get('sqam.ppap.model.btn.change').d('变更')}
            </PermissionButton>
          ),
        ].filter((v) => v),
      },
      {
        name: 'projectNum',
        width: 200,
      },
      {
        name: 'projectName',
        width: 120,
      },
      {
        name: 'documentNum',
        width: 180,
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleClickNum(record)}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'documentName',
      },
      {
        name: 'companyName',
        width: 240,
      },
      {
        name: 'supplierCompanyName',
        width: 240,
      },
      {
        name: 'documentAttachmentUuid',
        width: 150,
        renderer: ({ record }) => (
          <Attachment
            readOnly
            viewMode='popup'
            funcType={FuncType.link}
            value={record?.get('camp') === 'PURCHASER' ? record?.get('purchaseAttachmentUuid') : record?.get('documentAttachmentUuid')}
            bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
          />
        ),
      },
      {
        name: 'stageStatus',
        width: 120,
        renderer: ({ text, value, record }) => {
          const statusTag = <StatusTag value={text} flag color={TagColor[value] || 'success'} />;
          return remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_LIST_CUX_STAGE_STATUS_RENDERER', statusTag, { text, value, record, TagColor, StatusTag }) : statusTag;
        },
      },
      {
        name: 'stageName',
        width: 150,
      },
      {
        name: 'approveType',
        width: 120,
      },
      {
        name: 'campMeaning',
      },
      {
        name: 'createName',
      },
      {
        name: 'creationDate',
        width: 150,
      },
    ];
  }, [handleToDetail, handleClickNum, activeKey, remoteProps]);

  const handleFieldChange = useCallback(({ value, name, record }) => {
    if (name === 'creationDateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: DocumentListCode[activeKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={DocumentSearchCode[activeKey]}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          searchBarConfig={{
            onFieldChange: handleFieldChange,
            fieldProps: {
              creationDate: {
                defaultValue: ({ record }) => dateRangeTransform(record.get('creationDateRange'), true),
                dynamicProps: {
                  disabled: ({ record }) =>
                    record.get('creationDateRange') && record.get('creationDateRange') !== 'ALL TIME',
                },
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default observer(DocumentTable);
