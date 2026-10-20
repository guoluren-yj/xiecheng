/*
 * @Date: 2023-09-15 11:16:50
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import C7nAddAttachmentBtn from '@/routes/components/C7nAddAttachmentBtn';
import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';

const userInfo = getCurrentUser();
const organizationId = getCurrentOrganizationId();

const Index = ({
  dataSet,
  readOnlyFlag,
  customizeTable,
  customizeUnitCode,
  custLoading,
  isEdit = true,
  deleteAttachmentData = () => {},
  setLoading,
}) => {
  const columns = [
    {
      width: 120,
      name: 'attachmentCode',
    },
    {
      width: 200,
      name: 'attachmentDesc',
      renderer: ({ value, record }) => {
        const { attachmentDesc, attachmentUrl } = record.get(['attachmentDesc', 'attachmentUrl']);
        return isReview(attachmentDesc) && attachmentUrl ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => reviewFile(attachmentDesc, attachmentUrl)}
          >
            {value}
          </a>
        ) : (
          value
        );
      },
    },
    {
      width: 150,
      align: 'right',
      name: 'attachmentSize',
      renderer: ({ value }) => `${value / (1024 * 1024)}`.substring(0, 5),
    },
    {
      width: 150,
      name: 'realName',
    },
    {
      width: 150,
      name: 'uploadDate',
    },
    {
      width: 120,
      name: 'attachmentType',
      editor: isEdit,
    },
    {
      width: 120,
      name: 'effectiveDate',
      editor: isEdit,
    },
    {
      width: 120,
      name: 'expiryDate',
      editor: isEdit,
    },
    {
      width: 120,
      name: 'remark',
      editor: isEdit,
    },
    {
      name: 'option',
      width: 80,
      lock: 'right',
      renderer: ({ record }) => {
        const { tenantId, attachmentUrl } = record.get(['tenantId', 'attachmentUrl']);
        return (
          attachmentUrl && (
            <Button funcType="link" href={downLoadFile({ tenantId, attachmentUrl })}>
              {intl.get('hzero.common.button.download').d('下载')}
            </Button>
          )
        );
      },
    },
  ];

  //  新增附件 确认按钮回调
  const handleOk = useCallback(file => {
    const { realName, loginName, id } = userInfo;
    dataSet.create(
      {
        loginName,
        realName,
        uploadUserId: id,
        uploadUserName: realName,
        attachmentDesc: file.name,
        attachmentSize: file.size,
        attachmentUrl: file.response,
        tenantId: organizationId,
      },
      0
    );
  }, []);

  const getButtons = useCallback(() => {
    return isEdit
      ? [
        <C7nAddAttachmentBtn onOk={handleOk} setLoading={setLoading} />,
          [
            'delete',
            {
              onClick: () => deleteAttachmentData(dataSet),
            },
          ],
        ]
      : [];
  }, [isEdit, dataSet]);

  return customizeTable(
    {
      code: customizeUnitCode,
      readOnly: readOnlyFlag,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={getButtons()}
      custLoading={custLoading}
      selectionMode="rowbox"
      style={{ maxHeight: 'calc(100vh - 400px)' }}
    />
  );
};

export default Index;
