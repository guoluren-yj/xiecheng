import React, { useEffect, useMemo, memo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';

import AuthorityTable from '@/routes/sagm/ProductAuthorityNew/AuthorityTable';
import { tableDs } from '@/routes/sagm/ProductAuthorityNew/ds';

// import Tag from '../Comps/Tag';
// import { tableDs } from '../../ProductAuthority/ds';
// import AuthorityTable from '../../ProductAuthority/AuthorityTable';

export default memo(function Authority(props) {
  const { agreementType, agreementHeaderId } = props;
  const dataSet = useMemo(
    () => new DataSet(tableDs({ paging: agreementHeaderId ? 'server' : false })),
    [agreementHeaderId]
  );
  useEffect(() => {
    if (dataSet && agreementHeaderId) {
      dataSet.setQueryParameter('showFlag', 1);
      dataSet.setQueryParameter('agreementType', agreementType);
      dataSet.setQueryParameter('agreementHeaderId', agreementHeaderId);
      dataSet.query();
    }
  }, [agreementHeaderId, dataSet]);

  const columns = useMemo(
    () => [
      {
        name: 'statusCodeMeaning',
        title: intl.get('hzero.common.status').d('状态'),
        width: 110,
        align: 'left',
        tooltip: 'none',
        renderer: ({ record, value }) => {
          const { statusCode, enableFlag } = record.get(['statusCode', 'enableFlag']);
          let code = statusCode;
          if (!['PUBLISHED', 'EXECUTING'].includes(statusCode)) {
            code = 'UNPUBLISH';
          }
          if (!enableFlag) {
            code = 'DISABLED';
          }
          const _map = {
            PUBLISHED: {
              color: 'green',
              meaning: value,
            },
            UNPUBLISH: {
              color: 'yellow',
              meaning: intl.get('sagm.common.view.status.unPublish').d('未发布'),
            },
            DISABLED: {
              color: 'red',
              meaning: intl.get('sagm.common.view.status.disabled').d('已禁用'),
            },
            EXECUTING: {
              color: 'yellow',
              meaning: value,
            },
          };
          return (
            <Tag color={_map[code]?.color} border={false}>
              {_map[code]?.meaning}
            </Tag>
          );
        },
      },
      { name: 'authorityListCode' },
      { name: 'authorityListName' },
      { name: 'controlWayCodeMeaning' },
      { name: 'controlRangeMeaning' },
      { name: 'creationDate', width: 200 },
      {
        name: 'effectiveDate',
      },
      { name: 'versionNum', width: 80 },
      { name: 'realName' },
      { name: 'remark' },
      { name: 'options', lock: 'right' },
    ],
    []
  );
  return (
    <AuthorityTable
      tableDs={dataSet}
      {...props}
      searchBarTable={agreementHeaderId}
      searchBarCode="SAGM.WORKBENCH.AUTHORITY.SEARCH_BAR"
      columns={columns}
      style={{ maxHeight: 450 }}
      customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.AUTHORITY"
    />
  );
});
