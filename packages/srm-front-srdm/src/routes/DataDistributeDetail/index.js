import React, { useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { getSession } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import getDataDistributeDetailDs from './getDataDistributeDetailDs';
import { DETAIL_SESSION_KEY } from '../DataDistribute/index';

const DataDistributeDetail = (props) => {
  const { recId } = props.match.params;
  const distributeDetailDS = useMemo(() => new DataSet(getDataDistributeDetailDs()), []);
  const columns = useMemo(
    () => [
      {
        name: 'fieldName',
      },
      {
        name: 'fieldDesc',
      },
      {
        name: 'fieldValue',
      },
      {
        name: 'fieldType',
      },
      {
        name: 'fieldSeq',
      },
      {
        name: 'numFlag',
      },
    ],
    []
  );

  useEffect(() => {
    if (distributeDetailDS.status === 'ready') {
      distributeDetailDS.loadData(getSession(`${DETAIL_SESSION_KEY}-${recId}`));
    }
  }, [distributeDetailDS]);

  return (
    <>
      <Header title="配置数据迁移测试-明细" backPath="/srdm/data/distribute" />
      <Content>
        <Table queryFieldsLimit={3} border columns={columns} dataSet={distributeDetailDS} />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['hpdm.data-distribute'],
})(React.memo(DataDistributeDetail));
