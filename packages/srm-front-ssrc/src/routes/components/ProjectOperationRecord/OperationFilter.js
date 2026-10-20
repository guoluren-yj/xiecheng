import React from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';

function OperationFilter(props) {
  const { onQuery = noop } = props;

  const filterDs = useDataSet(() => {
    return {
      selection: false,
      autoQuery: false,
      fields: [],
      queryFields: [
        {
          name: 'processedBy',
          label: intl.get('ssrc.operationRecord.model.filter.processedBy').d('操作人'),
          type: 'object',
          lovCode: 'HIAM.TENANT.USER',
          valueField: 'id',
          textField: 'realName',
          lovPara: {
            organizationId: getCurrentOrganizationId(),
          },
        },
        {
          name: 'sourceNode',
          type: 'string',
          lookupCode: 'SSRC.PROJECT_PROGRESS_NODE',
          label: intl.get('ssrc.operationRecord.model.filter.sourceNode').d('操作节点'),
        },
        {
          name: 'description',
          type: 'string',
          label: intl.get('ssrc.operationRecord.model.filter.description').d('描述'),
        },
        {
          name: 'processedDateRange',
          type: 'dateTime',
          range: true,
          label: intl.get('ssrc.operationRecord.model.filter.processedDate').d('操作时间'),
        },
      ],
      transport: {
        read: () => {},
      },
    };
  }, []);

  // 筛选器字段
  const fields = [
    {
      name: 'processedBy',
      display: true,
      lock: true,
    },
    {
      name: 'sourceNode',
      display: true,
      lock: true,
    },
    {
      name: 'description',
      display: true,
      lock: true,
    },
    {
      name: 'processedDateRange',
      display: true,
      lock: true,
    },
  ];

  return (
    <FilterBar
      dataSet={[filterDs]}
      fields={fields}
      autoQuery={false}
      onQuery={(params) => {
        onQuery(params?.params || {});
      }}
    />
  );
}

export default formatterCollections({ code: ['ssrc.operationRecord'] })(OperationFilter);
