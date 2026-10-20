import React, { useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Table, useDataSet, Attachment } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import { fileTemplateAttachmentDS } from './storeDS';

const FileTemplateAttachment = (props) => {
  const { header, rfx, customizeTable = noop } = props;

  const { unitCodeSymbol } = rfx || {};

  const fileTemplateAttachmentDs = useDataSet(
    () =>
      fileTemplateAttachmentDS({
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.ATTACHMENT_REQUIREMENT_TABLE`,
      }),
    [rfxHeaderId, unitCodeSymbol]
  );

  const { rfxHeaderId } = header || {};

  useEffect(() => {
    if (rfxHeaderId) {
      fileTemplateAttachmentDs.setQueryParameter('sourceId', rfxHeaderId);
      fileTemplateAttachmentDs.query();
    }
  }, [rfxHeaderId]);

  // table columns
  const columns = useMemo(() => [
    {
      name: 'attachmentTypeMeaning',
    },
    {
      name: 'tempAttachmentUuid',
      renderer: ({ record }) => {
        const tempAttachmentUuid = record.get('tempAttachmentUuid');
        if (!tempAttachmentUuid) return null;
        return (
          <Attachment
            record={record}
            name="tempAttachmentUuid"
            viewMode="popup"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-template-requirement"
            labelLayout="float"
            readOnly
            previewTarget
          >
            {intl.get('hzero.common.upload.view').d('查看附件')}
          </Attachment>
        );
      },
    },
    { name: 'remark' },
    { name: 'attachmentUuid' },
  ]);

  return customizeTable(
    {
      code: `SSRC.${unitCodeSymbol}_DETAIL.ATTACHMENT_REQUIREMENT_TABLE`,
      dataSet: fileTemplateAttachmentDs,
    },
    <Table dataSet={fileTemplateAttachmentDs} columns={columns} />
  );
};

export default observer(FileTemplateAttachment);
