/*
 * @Date: 2022-12-21 18:08:19
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { Fragment, useMemo, useCallback } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';

import C7nDragUpload from '@/routes/components/C7nDragUpload';
import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';

const userInfo = getCurrentUser();
const organizationId = getCurrentOrganizationId();

const AttachmentModal = ({ dataSet, isEdit, itemLineRecord }) => {
  // 新增附件
  const handleAdd = useCallback(() => {
    Modal.open({
      key: Modal.key(),
      closable: true,
      movable: false,
      title: intl.get('hzero.common.upload.text').d('上传附件'),
      children: <C7nDragUpload onOk={handleOk} />,
    });
  }, []);

  //  新增附件 确认按钮回调
  const handleOk = fileList => {
    const { realName, id } = userInfo;
    const { requisitionId, supplyRecordId } = itemLineRecord.get([
      'requisitionId',
      'supplyRecordId',
    ]);
    const fileData = !isEmpty(fileList)
      ? fileList.map(file => ({
          requisitionId,
          itemLineId: supplyRecordId,
          uploadUserId: id,
          uploadUserName: realName,
          attachmentDesc: file.name,
          attachmentSize: file.size,
          attachmentUrl: file.response,
          tenantId: organizationId,
          attachmentItemId: uuidv4(),
        }))
      : [];
    fileData.forEach(n => {
      dataSet.create(n, 0);
    });
  };

  // 下载
  const handleDownload = ({ tenantId, attachmentUrl }) => {
    const url = downLoadFile({ tenantId, attachmentUrl });
    window.open(url);
  };

  const columns = useMemo(
    () => [
      {
        name: 'attachmentDesc',
        width: 150,
      },
      {
        name: 'attachmentSize',
        width: 120,
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
        width: 120,
      },
      {
        name: 'uploadDate',
        width: 150,
      },
      {
        name: 'attachmentType',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'dueDate',
        width: 180,
        editor: isEdit,
      },
      {
        name: 'remark',
        editor: isEdit,
      },
      {
        name: 'option',
        width: 100,
        renderer: ({ record }) => {
          const { tenantId, attachmentUrl, attachmentDesc } = record.get([
            'tenantId',
            'attachmentUrl',
            'attachmentDesc',
          ]);
          return (
            <Fragment>
              {attachmentUrl && (
                <Button funcType="link" onClick={() => handleDownload({ tenantId, attachmentUrl })}>
                  {intl.get('hzero.common.button.download').d('下载')}
                </Button>
              )}
              {isReview(attachmentDesc) && attachmentUrl && (
                <Button
                  funcType="link"
                  style={{ marginLeft: 16 }}
                  onClick={() => reviewFile(attachmentDesc, attachmentUrl)}
                >
                  {intl.get('hzero.common.button.preview').d('预览')}
                </Button>
              )}
            </Fragment>
          );
        },
      },
    ],
    [isEdit]
  );

  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={
        isEdit
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

export default AttachmentModal;
