/**
 * Attachment - 附件
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Fragment } from 'react';
import { isEmpty } from 'lodash';
import { Table, Modal, Button } from 'choerodon-ui/pro';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';

import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';
import C7nDragUpload from '@/routes/components/C7nDragUpload';

const organizationId = getCurrentOrganizationId();
const userInfo = getCurrentUser();

const Attachment = ({
  dataSet,
  isEdit,
  custLoading,
  customizeTable,
  code = '',
  buttonCode = '',
  supplierWarehouseRemote,
}) => {
  /**
   * modal 确认按钮回调
   */
  const handleOk = fileList => {
    const { realName } = userInfo;
    const fileData = !isEmpty(fileList)
      ? fileList.map(file => ({
          uploader: realName,
          description: file.name,
          fileSize: file.size,
          attachmentUrl: file.response,
          tenantId: organizationId,
          extAddressReqId: uuidv4(),
        }))
      : [];
    fileData.forEach(n => {
      dataSet.create(n, 0);
    });
  };

  // 新增附件
  const handleAdd = () => {
    Modal.open({
      key: Modal.key(),
      closable: true,
      movable: false,
      title: intl.get('hzero.common.upload.text').d('上传附件'),
      children: <C7nDragUpload onOk={handleOk} />,
    });
  };

  const columns = [
    {
      name: 'description',
      width: 200,
    },
    {
      name: 'fileSize',
      width: 130,
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
      name: 'uploader',
    },
    {
      name: 'uploadDate',
      width: 160,
    },
    {
      name: 'remark',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'operation',
      width: 100,
      renderer: ({ record }) => {
        const { data: { tenantId, attachmentUrl, description } = {} } = record;
        return (
          <span className="action-link">
            {attachmentUrl && (
              <a
                href={downLoadFile({ tenantId, attachmentUrl })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {intl.get('hzero.common.button.download').d('下载')}
              </a>
            )}
            {isReview(description) && attachmentUrl && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => reviewFile(description, attachmentUrl)}
              >
                {intl.get('hzero.common.button.review').d('预览')}
              </a>
            )}
          </span>
        );
      },
    },
  ];
  // 获取父ds的数据
  const buttons = isEdit
    ? [
      <Button icon="playlist_add" onClick={handleAdd} name="add">
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
        'delete',
      ]
    : [];
  return (
    <Fragment>
      {supplierWarehouseRemote &&
        supplierWarehouseRemote.render('SSLM.SUPPLIER_WAREHOUSE_ATTACHMENT_INFO_RENDER', <></>, {})}
      {customizeTable(
        {
          code, // 单元编码，必传
          buttonCode,
        },
        <Table dataSet={dataSet} columns={columns} buttons={buttons} custLoading={custLoading} />
      )}
    </Fragment>
  );
};

export default Attachment;
