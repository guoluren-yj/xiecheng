import React, { useMemo, useCallback, useEffect, useContext, Fragment, createElement } from 'react';
import { flow, isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { DataSet } from 'choerodon-ui/pro';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import StageTable from './StageTable';
import SourceTable from './SourceTable';
import { stageTableDS, sourceTableDS } from './storeDS';
import { LineAddSourceCode, LineAddStageCode } from '../../utils/type';
import { Store } from '../../Detail/stores';

const source = 'addLine';

const QuoteAddLine = flow(
  observer,
  withCustomize({
    unitCode: [
      LineAddStageCode.Grid,
      LineAddSourceCode.Grid,
    ],
  }),
)((props) => {
  const { remote, lineDs, headerDs } = useContext(Store);
  const { modal, customizeTable } = props;

  const { prepViewType} = headerDs.current?.get(['prepViewType']) || {};

  const tableDs = useMemo(() => {
    let dsProps = {};
    if(prepViewType === 'STAGE') dsProps = stageTableDS({ headerDs });
    if(prepViewType === 'SOURCE_DOCUMENT') dsProps = sourceTableDS({ headerDs });
    return new DataSet(dsProps);
  }, [headerDs, prepViewType]);
  const { selected } = tableDs;

  const handleOk = useCallback(async () => {
    if (remote) {
      const cuxEventRes = await remote.event.fireEvent('beforeAddLine', {
        lineDs,
        headerDs,
      });
      if (cuxEventRes === false) return false;
    }
    const res = await tableDs.setState('submitType', 'addLine').submit();
    if(!res) return false;
    headerDs.query(undefined, undefined, true);
  }, [remote, lineDs, tableDs, headerDs]);

  useEffect(() => {
    modal.handleOk(handleOk);
    modal.update({ okProps: { disabled: isEmpty(selected) } });
  }, [modal, selected, handleOk]);

  const component = useMemo(() => {
    if (prepViewType === 'STAGE') return StageTable;
    if (prepViewType === 'SOURCE_DOCUMENT') return SourceTable;
    return null;
  }, [prepViewType]);

  return (
    <Fragment>
      {component && createElement(component, { source, tableDs, customizeTable })}
    </Fragment>
  );
}) as React.FC;

export default QuoteAddLine;
