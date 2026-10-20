import React, { useContext, useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import { Store } from '../stores';
import { bepResultDS } from '../stores/indexDS';
import { BepResultGridCode } from '../../utils/type';
import { statusTagRender } from '../../../../components/StatusTag';

const BepResult = (props) => {

  const { statementLineId } = props;
  const { headerDs, customizeTable } = useContext(Store);

  const bepResultDs = useMemo(() => new DataSet(bepResultDS()), []);

  useEffect(() => {
    if (statementLineId) {
      bepResultDs.setQueryParameter('statementLineId', statementLineId);
      bepResultDs.query();
    } else if (headerDs) {
      bepResultDs.bind(headerDs, 'bepResult');
    }
  }, [headerDs, bepResultDs, statementLineId]);

  const columns = useMemo(() => {
    return [
      { name: 'payStatus', width: 150, renderer: statusTagRender },
      { name: 'bepRecordNum', width: 250 },
      { name: 'payCommandNum', width: 250 },
      { name: 'statementLineNum', width: 150 },
      { name: 'verificationCode', width: 150 },
      { name: 'payInitiationDate', width: 150 },
      { name: 'payAmount', width: 150 },
      { name: 'bepRequestStatus', width: 150, renderer: statusTagRender },
      { name: 'payFailedReason', width: 250 },
      { name: 'createByName', width: 150 },
      { name: 'sdatPayNum', width: 220 },
      { name: 'bankSerialNum', width: 220 },
    ];
  }, []);

  return customizeTable({
    code: BepResultGridCode,
  }, (
    <Table
      columns={columns}
      dataSet={bepResultDs}
      style={{ maxHeight: 430 }}
    />
  ));
};

export default BepResult;