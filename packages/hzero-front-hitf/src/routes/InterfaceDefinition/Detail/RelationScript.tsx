import React, { useMemo, useCallback, useEffect } from 'react';
import { DataSet, Table, TextArea, TextField, Select } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

interface RelationScriptProps {
  tableDs: DataSet,
  id: string,
}

const RelationScript: React.FC<RelationScriptProps> = ({
  tableDs,
  id,
}) => {
  const handleLoad = ({ dataSet }) => {
    dataSet.forEach((record) => {
      const { scriptTypeCode } = record.get(['isPublish', 'scriptTypeCode']);
      // 接口定义不可删除前置后置脚本
      const selectFlag = scriptTypeCode === 'BEFORE' || scriptTypeCode === 'AFTER';
      // eslint-disable-next-line no-param-reassign
      record.selectable = !selectFlag;
    });
  };
  useEffect(() => {
    tableDs.addEventListener('load', handleLoad);
    return () => {
      tableDs.removeEventListener('load', handleLoad);
    };
  }, [tableDs]);

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'adaptorTaskCode',
        editor: <TextField />,
      },
      {
        name: 'adaptorTaskName',
        editor: <TextField />,
      },
      {
        name: 'scriptTypeCode',
        editor: (record) => record.get('scriptId') ? false : <Select />,
      },
      {
        name: 'paramCode',
        editor: <TextField />,
      },
      {
        name: 'triggerTypeCode',
        editor: <TextField />,
      },
      {
        name: 'triggerTypeName',
        editor: <TextArea />,
      },
      {
        name: 'comments',
        editor: <TextArea />,
      },
    ],
    []
  );

  const handleAdd = useCallback(() => {
    tableDs.create({}, 1);
  }, [tableDs]);

  const handleDelete = useCallback(() => {
    tableDs.delete(tableDs.selected, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
    });
  }, [tableDs]);

  return (
    <Table
      dataSet={tableDs}
      columns={columns}
      rowNumber
      buttons={[
        [TableButtonType.add, { onClick: handleAdd, disabled: !id }],
        [TableButtonType.delete, { onClick: handleDelete, disabled: !id }],
      ]}
    />
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(RelationScript));
