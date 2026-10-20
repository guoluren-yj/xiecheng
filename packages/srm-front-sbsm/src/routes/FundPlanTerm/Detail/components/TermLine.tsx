import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Table, IntlField, Select } from 'choerodon-ui/pro';
import { TableButtonType, SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import type { Buttons, ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';

// import intl from 'utils/intl';
// import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { DetailCustomizeCode } from '../../utils/type';
import { getSelectedNegActConfirmMsg } from '../../../../utils/utils';
import { getNumberSelectContent } from '../../../../components/Renderer';

const baseDateFieldCodeFilter = (option, record): boolean => {
  const isPrePayment = record.get('stageType') === 'PREPAYMENT';
  return isPrePayment ? option.get('tag') !== 'payment' : option.get('tag') !== 'prepayment';
};

const TermLine = observer(() => {
  const { viewFlag, termLineDs, customizeTable, termHeaderDs } = useContext<StoreValueType>(Store);

  const { termHeaderId } = termHeaderDs.current?.get(['termHeaderId']) || {};


  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'lineNum',
        width: 100,
      },
      {
        name: 'stageNum',
        width: 120,
        editor: !viewFlag,
      },
      {
        name: 'stageDesc',
        width: 150,
        editor: !viewFlag && <IntlField />,
      },
      {
        name: 'stageType',
        width: 100,
        editor: !viewFlag,
      },
      {
        name: 'stagePercent',
        width: 150,
        editor: !viewFlag,
      },
      {
        name: 'fcDateRule',
        width: 150,
        editor: !viewFlag,
      },
      {
        name: 'fcBaseDateType',
        width: 150,
        editor: record => !viewFlag && <Select optionsFilter={(option) => baseDateFieldCodeFilter(option, record)} />,
      },
      {
        name: 'fcDeadLine',
        width: 160,
        editor: !viewFlag && <Select dropdownMatchSelectWidth={false} popupContent={getNumberSelectContent} />,
      },
      {
        name: 'fcFixedDay',
        width: 120,
        editor: !viewFlag && <Select dropdownMatchSelectWidth={false} popupContent={getNumberSelectContent} />,
      },
      {
        name: 'fcAccountPeriod',
        width: 150,
        editor: !viewFlag,
      },
      {
        name: 'fcAddMonth',
        width: 140,
        editor: !viewFlag,
      },
      {
        name: 'exDateRule',
        width: 150,
        editor: !viewFlag,
      },
      {
        name: 'exBaseDateType',
        width: 150,
        editor: record => !viewFlag && <Select optionsFilter={(option) => baseDateFieldCodeFilter(option, record)} />,
      },
      {
        name: 'exDeadLine',
        width: 160,
        editor: !viewFlag && <Select dropdownMatchSelectWidth={false} popupContent={getNumberSelectContent} />,
      },
      {
        name: 'exFixedDay',
        width: 140,
        editor: !viewFlag && <Select dropdownMatchSelectWidth={false} popupContent={getNumberSelectContent} />,
      },
      {
        name: 'exAccountPeriod',
        width: 140,
        editor: !viewFlag,
      },
      {
        name: 'exAddMonth',
        width: 140,
        editor: !viewFlag,
      },
    ];
  }, [viewFlag]);

  // 向下新增避免序号反转
  const handleAddLine = useCallback(() => {
    termLineDs.create({ termHeaderId, tenantId: getCurrentOrganizationId() });
  }, [termLineDs, termHeaderId]);

  // 删除行时清空无法回写的数据
  const handleDeleteLine = useCallback(async () => {
    const { selected } = termLineDs;
    const deleteRes = await termLineDs.delete(selected, getSelectedNegActConfirmMsg('delete', termLineDs));
    if (!deleteRes) return;
    termHeaderDs.query();
  }, [termLineDs, termHeaderDs]);

  const buttons = useMemo<Buttons[]>(() => {
    return viewFlag ?
      [] :
      [
        [TableButtonType.add, { onClick: handleAddLine }],
        [TableButtonType.delete, { icon: 'delete_sweep', onClick: handleDeleteLine }],
      ];
  }, [viewFlag, handleAddLine, handleDeleteLine]);


  return (
    <Fragment>
      {customizeTable(
        { code: DetailCustomizeCode.LineTableCode, readOnly: viewFlag },
        <Table
          columns={columns}
          buttons={buttons}
          dataSet={termLineDs}
          selectionMode={viewFlag ? SelectionMode.none : SelectionMode.rowbox}
          style={{ maxHeight: 430 }}
        />
      )}
    </Fragment>

  );
});

export default TermLine;
