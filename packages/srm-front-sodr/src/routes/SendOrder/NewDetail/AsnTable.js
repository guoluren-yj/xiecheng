import React, { memo, useMemo } from 'react';
import { Attachment } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { useTable } from './hooks';

const { Group } = Attachment;

const AsnTable = function AsnTable(props) {
  const { dataSet } = props;
  const columns = useMemo(
    () => [
      {
        name: 'asnNum',
        width: 150,
      },
      {
        name: 'displayAsnLineNum',
        width: 80,
      },
      {
        name: 'shipQuantity',
        width: 100,
      },
      {
        name: 'uomName',
        width: 100,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'shipDate',
        width: 120,
      },
      {
        name: 'asnStatusMeaning',
        width: 90,
      },
      {
        title: intl.get('entity.attachment.tag').d('附件'),
        width: 60,
        renderer: ({ record }) => (
          <Group>
            <Attachment name="approveAttachmentUuid" record={record} />
            <Attachment name="supplierAttaUuid" record={record} />
            <Attachment name="reviewAttachmentUuid" record={record} />
            <Attachment name="supplierAttachmentUuid" record={record} />
            <Attachment name="otherAttachmentUuid" record={record} />
          </Group>
        ),
      },
    ],
    []
  );
  return useTable(dataSet, columns);
};

export default memo(AsnTable);
