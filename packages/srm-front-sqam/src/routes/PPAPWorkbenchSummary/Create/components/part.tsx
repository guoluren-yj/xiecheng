// 零件列表
import React, { Fragment, useMemo, useCallback } from 'react';
import { Table } from 'choerodon-ui/pro';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import type { TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';



const PartList = (props) => {
  const { partLineDs } = props;


  const columns: any = useMemo(() => {
    return [
      {
        name: 'partLov',
        editor: true,
      },
      {
        name: 'itemName',
        editor: true,
      },
      {
        name: 'categoryLov',
        editor: true,
      },
    ];
  }, []);

  // 向下新增避免序号反转
  const handleAddLine = useCallback(() => {
    partLineDs.create({}, 0);
  }, [partLineDs]);

  const buttons = useMemo(() => {
    return [
      [TableButtonType.add, { onClick: handleAddLine }] as [TableButtonType, TableButtonProps],
      [TableButtonType.delete] as any,
    ];
  }, [handleAddLine]);

  return (
    <Fragment>
      <Table
        columns={columns}
        buttons={buttons}
        dataSet={partLineDs}
        style={{ maxHeight: 430 }}
      />
    </Fragment>

  );
};

export default observer(PartList);
