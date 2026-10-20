import React from 'react';
import { Table } from 'choerodon-ui/pro';

const allotSectionModal = ({ modalDs, detailFlag = false }) => {
  const columns = [
    {
      name: 'sectionNum',
      width: 150,
    },
    {
      name: 'sectionName',
      width: 150,
    },
    {
      name: 'inviteFlag',
      width: 100,
      editor: !detailFlag,
    },
    {
      name: 'sectionRemark',
      width: 150,
    },
    {
      name: 'sectionAttachmentUuid',
      width: 120,
    },
  ];

  return <Table columns={columns} dataSet={modalDs} />;
};

export default allotSectionModal;
