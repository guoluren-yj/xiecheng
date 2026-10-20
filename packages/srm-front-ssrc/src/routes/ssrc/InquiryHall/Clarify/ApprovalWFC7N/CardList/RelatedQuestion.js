import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Table } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import intl from 'utils/intl';

import { StoreContext } from '../store/StoreProvider';

const RelatedQuestion = observer(() => {
  const {
    commonDs: { relatedQuestionDs, headerDs },
    customizeTable,
    getCustomizeUnitCode,
  } = useContext(StoreContext);

  // 寻源类型
  const sourceType = headerDs.current && headerDs.current.get('sourceType');

  const columns = [
    ['RFP', 'RFI'].includes(sourceType)
      ? null
      : {
          // I/P 不显示此字段
          name: 'clarifyTypeMeaning',
        },
    {
      name: 'description',
    },
    {
      name: 'issueFinalNum',
    },
    {
      name: 'submittedDate',
    },
    {
      name: 'submittedByUserName',
    },
    {
      name: 'supplierCompanyName',
    },
    {
      name: 'attachmentUuid',
    },
  ];

  return (
    <Collapse ghost trigger="icon" expandIconPosition="text-right">
      <Collapse.Panel
        header={intl.get('ssrc.clarify.view.title.relatedQuestionTable').d('关联问题表格')}
        key="relatedQuestion"
      >
        {customizeTable(
          {
            code: getCustomizeUnitCode('relatedTable'),
            dataSet: relatedQuestionDs,
          },
          <Table dataSet={relatedQuestionDs} columns={columns} style={{ maxHeight: '4.5rem' }} />
        )}
      </Collapse.Panel>
    </Collapse>
  );
});

export default RelatedQuestion;
