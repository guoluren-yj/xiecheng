import React, { useMemo } from 'react';
import { isEmpty } from 'lodash';
import { Button, Lov, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { tempDelete } from '@/routes/spc/PriceAdjustmentWorkbench/utils';

const Index = (props) => {
  const {
    isEdit,
    isAssign,
    record,
    formulaId,
    dataSet,
    headerDS,
    assignItemBomCustCode,
    customizeTable,
  } = props;

  const columns = useMemo(
    () => [
      {
        name: 'bomViewId',
        editor: isEdit,
      },
      {
        name: 'bomViewCode',
      },
      {
        name: 'mainItemName',
      },
      {
        name: 'mainItemCode',
      },
      {
        name: 'creationRealName',
      },
      {
        name: 'creationDate',
      },
    ],
    [isEdit]
  );

  const handleCreate = (data) => {
    data.forEach((item) => {
      const { bomViewItemId, bomViewCode, bomViewItemName, bomViewId, bomViewName } = item;
      dataSet.create({
        bomViewId,
        bomViewName,
        bomViewCode,
        mainItemId: bomViewItemId,
        mainItemName: bomViewItemName,
      });
    });
    bomItemLovDS.clearCachedSelected();
    bomItemLovDS.unSelectAll();
    bomItemLovDS.reset();
  };

  const handleDelete = async () => {
    const selectedRows = dataSet.selected;
    const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
    const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
    // 删除本地数据
    dataSet.remove(newAddRows);

    if (!isEmpty(existedRows)) {
      // 删除线上数据
      await dataSet.delete(existedRows, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
      headerDS.query();
    }
  };

  const handleRemove = () => {
    tempDelete(dataSet, 'relId', 'shieldLineIds');
  };

  const bomItemLovDS = new DataSet({
    fields: [
      {
        name: 'bomItemLov',
        type: 'object',
        lovCode: 'SPC.PRICE_BOM_VIEW_LOV',
        dynamicProps: {
          lovPara: () => {
            const deleteLineRelIds =
              dataSet?.getState('deleteLines')?.map((rec) => ({ relId: rec.get('relId') })) || [];
            const list = deleteLineRelIds?.concat(dataSet?.toJSONData() || []);
            return {
              formulaId,
              bomTemplateId: record?.get('bomStructureId')?.bomTemplateId,
              bomTemplateCode: record?.get('bomStructureId')?.bomTemplateCode,
              relIds: list
                ?.filter((item) => item.relId)
                .map((item) => item.relId)
                .toString(),
              shieldBomViewCodes: list
                ?.filter((item) => item.bomViewCode)
                .map((item) => item.bomViewCode)
                .toString(),
              shieldLineIds: dataSet.getQueryParameter('shieldLineIds'),
            };
          },
        },
      },
    ],
  });

  const TableButtons = observer((btnProps) => {
    const { ds, lovDs } = btnProps;
    const buttonCommonProps = {
      color: 'primary',
      funcType: 'flat',
    };
    return [
      <Lov
        name="bomItemLov"
        multiple
        mode="button"
        noCache
        clearButton={false}
        data-name="add"
        icon="playlist_add"
        onChange={(data) => handleCreate(data)}
        dataSet={lovDs}
        tableProps={{ selectionMode: 'rowbox' }} // 勾选模式为 rowbox
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.btn.add').d('新增')}
      </Lov>,
      <Button
        data-name="delete"
        icon="delete_sweep"
        disabled={isEmpty(ds.selected)}
        onClick={isAssign ? handleRemove : handleDelete}
        {...buttonCommonProps}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </Button>,
    ];
  });

  return customizeTable(
    {
      code: assignItemBomCustCode,
    },
    <FilterBarTable
      dataSet={dataSet}
      columns={columns}
      style={{ maxHeight: 430 }}
      buttons={isEdit && [<TableButtons ds={dataSet} lovDs={bomItemLovDS} />]}
      filterBarConfig={{
        autoQuery: false,
        collpaseble: !!isEdit,
      }}
    />
  );
};

export default Index;
