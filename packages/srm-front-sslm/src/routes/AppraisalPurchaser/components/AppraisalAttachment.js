/*
 * AppraisalAttachment - 考评附件
 * @Date: 2023-12-07 11:07:00
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useEffect } from 'react';
import { Table, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';

const AppraisalAttachment = ({ dataSet, evalHeaderId }) => {
  // 该附件仅查看，放在组件内查询，附件卡片存在的情况下才查询
  useEffect(() => {
    dataSet.query();
  }, [evalHeaderId]);

  // 下载
  const handleDownload = ({ tenantId, attachmentUrl }) => {
    const url = downLoadFile({ tenantId, attachmentUrl });
    window.open(url);
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
    <Table
      dataSet={dataSet}
      columns={columns}
      style={{ maxHeight: 600 }}
      customizedCode="SSLM.APPRAISAL_PURCHASER.APPRAISAL_ATTACHMENT_TABLE"
    />
  );
};

export default AppraisalAttachment;
