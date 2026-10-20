import React, { useContext, useMemo, Fragment, useCallback } from 'react';
import { Table, Select, IntlField, Button, Modal } from 'choerodon-ui/pro';
import type { TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableButtonType, SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { DetailCustomizeCode } from '../utils/type';
import { getSelectedNegActConfirmMsg } from '../../../utils/utils';
import { getNumberSelectContent } from '../../../components/Renderer';
import styles from '../../../common.less';
import StageDetail from '../../FundPlanPrefabrication/Detail';
import { getCustomValidationResponse } from '../../../components/CustomValidation';
import { validateDeleteLine } from '../utils/api';

const baseDateFieldCodeFilter = (option, record): boolean => {
  const isPrePayment = record.get('stageType') === 'PREPAYMENT';
  return isPrePayment ? option.get('tag') !== 'payment' : option.get('tag') !== 'prepayment';
};

const TermLine = () => {

  const { sourceDocListDs, customizeTable, editFlag, sourceDocHeaderDs, isChange } = useContext<StoreValueType>(Store);
  const {amountComputeRule, dtAmount, dtLineAmount, prefabricateStatus} = sourceDocHeaderDs.current?.get(['amountComputeRule', 'dtAmount', 'dtLineAmount', 'prefabricateStatus']) || {};

  const handleClickNum = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: styles['sbsm-detailDrawer-modal'],
      style: {
        width: 1090,
      },
      children: <StageDetail recordInfo={record} viewType='STAGE' />,
      cancelButton: false,
    });
  }, []);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'lineNum',
        width: 100,
      },
      {
        name: 'stageNum',
        width: 120,
        editor: editFlag,
      },
      {
        name: 'stageDesc',
        width: 150,
        editor: editFlag && <IntlField />,
      },
      {
        name: 'stageType',
        width: 100,
        editor: editFlag,
      },
      {
        name: 'stagePercent',
        width: 150,
        editor: editFlag,
      },
      {
        name: 'stageAmount',
        editor: editFlag,
      },
      {
        name: 'fcDateRule',
        width: 150,
        editor: editFlag,
      },
      {
        name: 'fcBaseDateType',
        width: 150,
        editor: record => editFlag && <Select optionsFilter={(option) => baseDateFieldCodeFilter(option, record)} />,
      },
      {
        name: 'fcDeadLine',
        width: 160,
        editor: editFlag && <Select dropdownMatchSelectWidth={false} popupContent={getNumberSelectContent} />,
      },
      {
        name: 'fcFixedDay',
        width: 120,
        editor: editFlag && <Select dropdownMatchSelectWidth={false} popupContent={getNumberSelectContent} />,
      },
      {
        name: 'fcAddMonth',
        width: 140,
        editor: editFlag,
      },
      {
        name: 'fcAccountPeriod',
        width: 150,
        editor: editFlag,
      },
      {
        name: 'exDateRule',
        width: 150,
        editor: editFlag,
      },
      {
        name: 'exBaseDateType',
        width: 150,
        editor: record => editFlag && <Select optionsFilter={(option) => baseDateFieldCodeFilter(option, record)} />,
      },
      {
        name: 'exDeadLine',
        width: 160,
        editor: editFlag && <Select dropdownMatchSelectWidth={false} popupContent={getNumberSelectContent} />,
      },
      {
        name: 'exFixedDay',
        width: 140,
        editor: editFlag && <Select dropdownMatchSelectWidth={false} popupContent={getNumberSelectContent} />,
      },
      {
        name: 'exAddMonth',
        width: 140,
        editor: editFlag,
      },
      {
        name: 'exAccountPeriod',
        width: 140,
        editor: editFlag,
      },
      prefabricateStatus === 'SYNC_SUCCESS' && {
        name: 'operate',
        width: 140,
        renderer: ({ record }) => record?.get('poolStageId') && (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleClickNum(record)}
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </Button>
        ),
      },
    ];
  }, [editFlag, handleClickNum, prefabricateStatus]);

  const handleAddLine = useCallback(() => {
    sourceDocListDs.create({ amountComputeRule, dtAmount, dtLineAmount });
  }, [sourceDocListDs, amountComputeRule, dtAmount, dtLineAmount]);

  const handleDeleteLineSubmit = useCallback(async() => {
    const { selected } = sourceDocListDs;
    const res = await sourceDocListDs.delete(selected, getSelectedNegActConfirmMsg('delete', sourceDocListDs));
    if (!res) return;
    // 行变化，更新字段
    if (sourceDocHeaderDs.current) {
      sourceDocHeaderDs.current.set({
        existStageFlag: 1,
      });
    }
    sourceDocListDs.query(undefined, undefined, true);
  }, [sourceDocListDs, sourceDocHeaderDs]);

  const handleDeleteLine = useCallback(async () => {
    if (isChange) {
      const { selected } = sourceDocListDs;
      sourceDocHeaderDs.status = DataSetStatus.loading;
      const datas = selected?.map((item) => item?.toData());
      const validateRes = getResponse(await validateDeleteLine(datas));
      sourceDocHeaderDs.status = DataSetStatus.ready;
      if (!validateRes) return false;
      return getCustomValidationResponse(validateRes, handleDeleteLineSubmit);
    } else return handleDeleteLineSubmit();
  }, [handleDeleteLineSubmit, sourceDocHeaderDs, isChange, sourceDocListDs]);

  const buttons = useMemo(() => {
    return editFlag ?
      [
        [TableButtonType.add, { onClick: handleAddLine, disabled: false }] as [TableButtonType, TableButtonProps],
        [TableButtonType.delete, { onClick: handleDeleteLine, children: intl.get('hzero.common.button.batchDelete').d('批量删除'), icon: 'delete_sweep' }] as [TableButtonType, TableButtonProps],
      ] : [];
  }, [editFlag, handleAddLine, handleDeleteLine]);

  return (
    <Fragment>
      {customizeTable(
        { code: DetailCustomizeCode.LINE },
        <Table
          columns={columns}
          dataSet={sourceDocListDs}
          style={{ maxHeight: 430 }}
          buttons={buttons}
          selectionMode={!editFlag ? SelectionMode.none : SelectionMode.rowbox}
        />
      )}
    </Fragment>
  );
};

export default observer(TermLine);
