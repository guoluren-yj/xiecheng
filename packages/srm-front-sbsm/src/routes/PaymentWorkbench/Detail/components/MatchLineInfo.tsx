import React, { useContext, useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import { Store } from '../stores';
import { matchLineDS } from '../stores/indexDS';
import { MatchLineGridCode } from '../../utils/type';

interface MatchLineInfoProps {
  statementLineId?: string | number;
}

const MatchLineInfo = (props: MatchLineInfoProps) => {

  const { statementLineId } = props;
  const { headerDs, customizeTable } = useContext(Store);

  const matchLineDs = useMemo(() => new DataSet(matchLineDS()), []);

  useEffect(() => {
    if (statementLineId) {
      matchLineDs.setQueryParameter('statementLineId', statementLineId);
      matchLineDs.query();
    } else {
      matchLineDs.bind(headerDs, 'matchLine');
    }
  }, [headerDs, matchLineDs, statementLineId]);

  const columns = useMemo(() => {
    return [
      { name: 'statementLineNum', width: 120 },
      { name: 'matchAmount', width: 130 },
      { name: 'payLineNum', width: 130 },
      { name: 'payNum', width: 170 },
      { name: 'itemCode', width: 150 },
      { name: 'itemName', width: 150 },
      { name: 'matchRuleMeaning', width: 150 },
    ];
  }, []);

  return customizeTable({
    code: MatchLineGridCode,
  }, (
    <Table
      columns={columns}
      dataSet={matchLineDs}
      style={{ maxHeight: 430 }}
    />
  ));
};

export default MatchLineInfo;