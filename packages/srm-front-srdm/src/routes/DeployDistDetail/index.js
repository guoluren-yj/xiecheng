import React, { useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { getSession } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import getDataDistributeDetailDs from './getDeployDistDetailDs';
import { DETAIL_SESSION_KEY } from '../DeployInfo/configDataPage';

const DeployDistDetail = (props) => {
  const { deployInfoId, deployDistId } = props.match.params;
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
      distributeDetailDS.loadData(getSession(`${DETAIL_SESSION_KEY}-${deployDistId}`));
    }
  }, [distributeDetailDS]);

  return (
    <>
      <Header title="配置数据迁移发版-明细" backPath={`/srdm/deploy-dist/${deployInfoId}`} />
      <Content>
        <Table queryFieldsLimit={3} border columns={columns} dataSet={distributeDetailDS} />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['hpdm.data-distribute'],
})(React.memo(DeployDistDetail));
