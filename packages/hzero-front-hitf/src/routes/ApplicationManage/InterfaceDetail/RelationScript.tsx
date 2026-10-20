import React, { useMemo, useCallback, useEffect } from 'react';
import { DataSet, Table, TextArea, TextField, Select } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

interface RelationScriptProps {
  tableDs: DataSet,
}

const RelationScript: React.FC<RelationScriptProps> = ({
  tableDs,
}) => {
  const handleLoad = ({ dataSet }) => {
    dataSet.forEach((record) => {
      const { isPublish, scriptTypeCode } = record.get(['isPublish', 'scriptTypeCode']);
      // 应用管理只可修改自己新增的脚本
      const selectFlag = isPublish || scriptTypeCode === 'BEFORE' || scriptTypeCode === 'AFTER';
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
        // 预定义的invoke类型不可编辑
        editor: (record) => record.get('isPublish') && record.get('scriptTypeCode') === 'INVOKE' ? false : <TextField />,
      },
      {
        name: 'adaptorTaskName',
        // 预定义的invoke类型不可编辑
        editor: (record) => record.get('isPublish') && record.get('scriptTypeCode') === 'INVOKE' ? false : <TextField />,
      },
      {
        name: 'scriptTypeCode',
        editor: (record) => record.get('scriptId') ? false : <Select />,
      },
      {
        name: 'paramCode',
        editor: (record) => record.get('isPublish') && record.get('scriptTypeCode') === 'INVOKE' ? false : <TextField />,
      },
      {
        name: 'triggerTypeCode',
        editor: (record) => record.get('isPublish') && record.get('scriptTypeCode') === 'INVOKE' ? false : <TextField />,
      },
      {
        name: 'triggerTypeName',
        editor: (record) => record.get('isPublish') && record.get('scriptTypeCode') === 'INVOKE' ? false : <TextArea />,
      },
      {
        name: 'comments',
        // 预定义的invoke类型不可编辑
        editor: (record) => record.get('isPublish') && record.get('scriptTypeCode') === 'INVOKE' ? false : <TextArea />,
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
        [TableButtonType.add, { onClick: handleAdd }],
        [TableButtonType.delete, { onClick: handleDelete }],
      ]}
    />
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(RelationScript));
