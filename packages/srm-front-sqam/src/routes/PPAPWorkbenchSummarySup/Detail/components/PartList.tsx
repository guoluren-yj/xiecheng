// 零件列表
import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Table } from 'choerodon-ui/pro';
import { TableButtonType, SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import type { TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { DetailProjectPartListCode } from '../../utils/type';


const PartList = () => {
  const { partLineDs, customizeTable, createFlag, headerDs, editFlag } = useContext<StoreValueType>(Store);
  const { projectStatus } = headerDs.current?.get(['projectStatus']) || {};

  const editorFlag = useMemo(() => {
    return createFlag || (['NEW', 'PUBLISH_REJECTED'].includes(projectStatus) && editFlag);
  }, [createFlag, projectStatus, editFlag]);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'partLov',
        editor: editorFlag,
      },
      {
        name: 'itemName',
        editor: editorFlag,
      },
      {
        name: 'categoryLov',
        editor: editorFlag,
      },
    ];
  }, [editorFlag]);

  // 向下新增避免序号反转
  const handleAddLine = useCallback(() => {
    partLineDs.create({}, 0);
  }, [partLineDs]);

  // 删除行时清空无法回写的数据
  const handleDeleteLine = useCallback(async () => {
    const { selected } = partLineDs;
    const res = await partLineDs.delete(selected);
    if (!res) return;
    partLineDs.query(undefined, undefined, true);
  }, [partLineDs]);

  const buttons = useMemo(() => {
    return editFlag ?
      [
        [TableButtonType.add, { onClick: handleAddLine }] as [TableButtonType, TableButtonProps],
        [TableButtonType.delete, { onClick: handleDeleteLine }] as [TableButtonType, TableButtonProps],
      ] : [];
  }, [handleAddLine, handleDeleteLine, editFlag]);

  return (
    <Fragment>
      {customizeTable(
        { code: DetailProjectPartListCode },
        <Table
          columns={columns}
          buttons={buttons}
          dataSet={partLineDs}
          selectionMode={!editFlag ? SelectionMode.none : SelectionMode.rowbox}
          style={{ maxHeight: 430 }}
        />
      )}
    </Fragment>

  );
};

export default observer(PartList);
