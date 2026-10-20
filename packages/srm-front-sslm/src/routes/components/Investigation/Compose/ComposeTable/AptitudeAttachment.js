/*
 * AptitudeAttachment - 资质附件
 * @Date: 2022-06-17 18:34:00
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { Table, Modal, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';

import C7nDragUpload from '@/routes/components/C7nDragUpload';
import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';

const userInfo = getCurrentUser();
const organizationId = getCurrentOrganizationId();

const AptitudeAttachment = ({
  record: proserviceRecord,
  dataSet,
  investgProserviceId,
  editable,
}) => {
  useEffect(() => {
    const { attachment = [] } = proserviceRecord.toData();
    dataSet.loadData(attachment);
  }, [proserviceRecord]);

  // modal 确认按钮回调
  const handleOk = useCallback(
    fileList => {
      const { realName, id } = userInfo;
      const fileData = !isEmpty(fileList)
        ? fileList.map(file => ({
            uploadUserId: id,
            uploadUserName: realName,
            attachmentDesc: file.name,
            attachmentSize: file.size,
            attachmentUrl: file.response,
            tenantId: organizationId,
            investgProserviceId,
          }))
        : [];
      fileData.forEach(n => {
        dataSet.create(n, 0);
      });
    },
    [dataSet]
  );

  // 新建附件回调
  const handleAdd = useCallback(() => {
    Modal.open({
      key: Modal.key(),
      closable: true,
      movable: false,
      title: intl.get('hzero.common.upload.text').d('上传附件'),
      children: <C7nDragUpload onOk={handleOk} />,
    });
  }, []);

  const columns = [
    {
      name: 'attachmentDesc',
      width: 150,
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
      name: 'attachmentSize',
      width: 100,
      renderer: ({ value }) => {
        if (value) {
          const size = `${value / (1024 * 1024)}`;
          return size.substring(0, 5);
        } else {
          return 0;
        }
      },
    },
    {
      name: 'uploadUserName',
      width: 100,
    },
    {
      name: 'uploadDate',
      width: 150,
    },
    {
      name: 'attachmentType',
      width: 120,
      editor: editable,
    },
    {
      name: 'dueDate',
      width: 120,
      editor: editable,
    },
    {
      name: 'remark',
      width: 150,
      editor: editable,
    },
    {
      name: 'operation',
      width: 80,
      renderer: ({ record }) => {
        const { tenantId, attachmentUrl } = record.get(['tenantId', 'attachmentUrl']);
        return (
          attachmentUrl && (
            <a
              href={downLoadFile({ tenantId, attachmentUrl })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {intl.get('hzero.common.button.download').d('下载')}
            </a>
          )
        );
      },
    },
  ];
  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={
        editable
          ? [
            <Button icon="playlist_add" onClick={handleAdd}>
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>,
              'delete',
            ]
          : []
      }
    />
  );
};

export default AptitudeAttachment;
