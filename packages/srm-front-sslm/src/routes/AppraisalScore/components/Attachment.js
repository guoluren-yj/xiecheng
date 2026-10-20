/*
 * @Date: 2023-10-23 09:48:20
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment } from 'react';
import { Table, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentUser } from 'utils/utils';

import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';
import C7nAddAttachmentBtn from '@/routes/components/C7nAddAttachmentBtn';
import styles from '../index.less';

const userInfo = getCurrentUser();

const Attachment = ({ isEdit, dataSet, evalHeaderId, setLoading }) => {
  //  新增附件 确认按钮回调
  const handleOk = file => {
    const { realName, id, loginName } = userInfo;
    dataSet.create(
      {
        evalHeaderId,
        loginName,
        uploadUserId: id,
        uploadUserName: realName,
        attachmentName: file.name,
        attachmentUrl: file.response,
      },
      0
    );
  };

  // 下载
  const handleDownload = ({ tenantId, attachmentUrl }) => {
    const url = downLoadFile({ tenantId, attachmentUrl });
    window.open(url);
  };

  const getButtons = () => {
    return isEdit
      ? [<C7nAddAttachmentBtn onOk={handleOk} setLoading={setLoading} />, 'delete']
      : [];
  };

  const columns = [
    {
      name: 'attachmentName',
    },
    {
      name: 'uploadUserName',
    },
    {
      name: 'uploadTime',
    },
    {
      name: 'remark',
      editor: isEdit,
    },
    {
      name: 'option',
      renderer: ({ record }) => {
        const { tenantId, attachmentUrl, attachmentName } = record.get([
          'tenantId',
          'attachmentUrl',
          'attachmentName',
        ]);
        return (
          <Fragment>
            {attachmentUrl && (
              <Button funcType="link" onClick={() => handleDownload({ tenantId, attachmentUrl })}>
                {intl.get('hzero.common.button.download').d('下载')}
              </Button>
            )}
            {isReview(attachmentName) && attachmentUrl && (
              <Button
                funcType="link"
                style={{ marginLeft: 16 }}
                onClick={() => reviewFile(attachmentName, attachmentUrl)}
              >
                {intl.get('hzero.common.button.preview').d('预览')}
              </Button>
            )}
          </Fragment>
        );
      },
    },
  ];

  return (
    <div className={styles['score-card']}>
      <div className={styles['card-title']}>
        {intl.get('hzero.common.upload.modal.title').d('附件')}
      </div>
      <Table
        dataSet={dataSet}
        columns={columns}
        buttons={getButtons()}
        style={{ maxHeight: 420 }}
        selectionMode={isEdit ? 'rowbox' : 'none'}
        customizedCode="SSLM.APPRAISAL_SCORE.ATTACHMENT"
      />
    </div>
  );
};

export default Attachment;
