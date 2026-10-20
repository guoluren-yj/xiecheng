import React, { useMemo, useEffect } from 'react';
import { useDataSet, Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { TableDS } from './store';
import { commonDelete, FooterBtns } from '../utils';

const Index = (props) => {
  const { bomDimensionConfigId, bomTemplateId, isEdit, modal } = props;
  const tableDs = useDataSet(() => TableDS({ bomDimensionConfigId, bomTemplateId, isEdit }), [
    bomDimensionConfigId,
    isEdit,
  ]);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (modal) {
      const { update } = modal;
      const btnProps = {
        modal,
        isEdit,
        tableDs,
        submitDs: tableDs,
      };
      update({
        footer: () => <FooterBtns {...btnProps} />,
      });
    }
  }, [tableDs, isEdit]);

  const init = async () => {
    tableDs.query();
  };

  const handleDelete = async () => {
    commonDelete(tableDs);
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'bomLineName',
          editor: isEdit,
        },
        {
          name: 'bomLineCode',
        },
        {
          name: 'groupListCode',
          editor: isEdit,
        },
        {
          name: 'groupListName',
        },
      ].filter((item) => item),
    [isEdit]
  );

  const TableButtons = observer((btnProps) => {
    const { ds } = btnProps;
    const buttonCommonProps = {
      color: 'primary',
      funcType: 'flat',
    };
    return [
      <Button
        data-name="delete"
        icon="delete_sweep"
        disabled={isEmpty(ds.selected)}
        onClick={handleDelete}
        {...buttonCommonProps}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </Button>,
    ];
  });

  return (
    <>
      <Table
        customizable
        customizedCode="SPC.BOM_DIM_CONFIG.COMPONENTLIST"
        dataSet={tableDs}
        columns={columns}
        buttons={isEdit && ['add', <TableButtons ds={tableDs} />]}
        style={{ maxHeight: 'calc(100vh - 178px)' }}
      />
    </>
  );
};

export default Index;
