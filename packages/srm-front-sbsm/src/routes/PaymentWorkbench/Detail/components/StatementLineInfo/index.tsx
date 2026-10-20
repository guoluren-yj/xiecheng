import React, { useContext, useLayoutEffect, Fragment } from 'react';
import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';

import { Store } from '../../stores';
import StatementLineBepInfo from './Bep';
import StatementLinePaperInfo from './Paper';
import StatementLineOfflineInfo from './Offline';

interface StatementLineInfoProps {
  source?: 'approveEdit',
}

const StatementLineInfo = (props: StatementLineInfoProps) => {
  const { source } = props;
  const { boolMap, headerDs, statementLineDs } = useContext(Store);
  const payForm = headerDs.current?.get('payForm');

  useLayoutEffect(() => {
    statementLineDs.selection = boolMap.editFlag || source === 'approveEdit' ? DataSetSelection.multiple : false;
    statementLineDs.bind(headerDs, 'inputPayStatementLineDTOList');
    return () => {
      headerDs.map(record => record.init({ inputPayStatementLineDTOList: null })); // 触发step重新查询
      delete headerDs.children.inputPayStatementLineDTOList; // 避免step数据校验
    };
  }, [source, boolMap, headerDs, statementLineDs]);

  return (
    <Fragment>
      {payForm === 'BANK_CORPORATE_EXPRESS' && <StatementLineBepInfo />}
      {payForm === 'BANK_PAPER' && <StatementLinePaperInfo source={source} />}
      {payForm === 'OFFLINE_PAY' && <StatementLineOfflineInfo />}
    </Fragment>
  );
};

export default StatementLineInfo;