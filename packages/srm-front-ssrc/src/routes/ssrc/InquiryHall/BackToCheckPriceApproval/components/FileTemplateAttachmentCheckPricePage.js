import React, { useMemo } from 'react';
import { Table, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'hzero-front/lib/utils/intl';

const AttachmentForm = observer((props = {}) => {
  const { tableAttachmentDs, customizeTable = noop, getCustomizeUnitCode = noop } = props || {};

  const columns = useMemo(() => {
    return [
      {
        name: 'attachmentTypeMeaning',
      },
      {
        name: 'templateAttachment',
        renderer: ({ record }) => {
          const { fileManageId, tempAttachmentUuid } =
            record.get(['fileManageId', 'tempAttachmentUuid']) || {};

          if (fileManageId) {
            // 来自于寻源模板的招标文件管理中的
            return null;
          } else if (tempAttachmentUuid) {
            // 来自于寻源模板的上传本地附件
            return (
              <Attachment
                record={record}
                name="tempAttachmentUuid"
                viewMode="popup"
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-template-requirement"
                readOnly
                funcType="link"
              >
                {intl.get('hzero.common.upload.view').d('查看附件')}
              </Attachment>
            );
          }
          return '';
        },
      },
      { name: 'remark' },
      {
        name: 'attachmentUuid',
      },
    ];
  }, []);

  return customizeTable(
    {
      code: getCustomizeUnitCode('attachmentTable'),
      dataSet: tableAttachmentDs,
    },
    <Table dataSet={tableAttachmentDs} columns={columns} style={{ maxHeight: '430px' }} />
  );
});

export default AttachmentForm;
