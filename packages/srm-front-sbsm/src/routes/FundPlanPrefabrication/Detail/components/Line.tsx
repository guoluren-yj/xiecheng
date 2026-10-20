import React, { useMemo, useContext, useEffect } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { Table, DataSet, CheckBox } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { StageAllDetailLineCode } from '../../utils/type';
import { viewTermTypDS } from '../stores/indexDS';

const Line = () => {
  const {
    termTableDs,
    customizeTable,
    termTableShowDs,
    recordInfo,
  } = useContext<StoreValueType>(Store);
  const viewTermTypDs = useMemo(() => new DataSet(viewTermTypDS()), []);
  const viewType = viewTermTypDs.current?.get('viewType');
  const documentLineNum = recordInfo?.get('documentLineNum');

  useEffect(() => {

  }, [termTableDs, termTableShowDs, viewType, documentLineNum]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'lineNum',
        width: 100,
      },
      {
        name: 'stageNum',
        width: 120,
      },
      {
        name: 'stageDesc',
        width: 150,
      },
      {
        name: 'stageType',
        width: 100,
      },
      {
        name: 'stagePercent',
        width: 150,
      },
      {
        name: 'stageAmount',
      },
      {
        name: 'fcDateRule',
        width: 150,
      },
      {
        name: 'fcBaseDateType',
        width: 150,
      },
      {
        name: 'fcDeadLine',
        width: 160,
      },
      {
        name: 'fcFixedDay',
        width: 120,
      },
      {
        name: 'fcAddMonth',
        width: 140,
      },
      {
        name: 'fcAccountPeriod',
        width: 150,
      },
      {
        name: 'exDateRule',
        width: 150,
      },
      {
        name: 'exBaseDateType',
        width: 150,
      },
      {
        name: 'exDeadLine',
        width: 160,
      },
      {
        name: 'exFixedDay',
        width: 140,
      },
      {
        name: 'exAddMonth',
        width: 140,
      },
      {
        name: 'exAccountPeriod',
        width: 140,
      },
    ];
  }, []);

  return (
    <div>
      <CheckBox style={{marginBottom: 16}} dataSet={viewTermTypDs} name="viewType">{intl.get('sbsm.common.model.payTermsCtrl.viewType').d('仅查看当前阶段')}</CheckBox>
      {
        customizeTable({
          code: StageAllDetailLineCode,
          readOnly: true,
        }, (
          <Table
            dataSet={viewType? termTableShowDs : termTableDs}
            columns={columns}
          />
        ))
      }
    </div>
  );
};


export default observer(Line);
