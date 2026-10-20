/**
 * 采购方评估 - 详情 - 评估物料/品类
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-01 15:53:44
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/Details/ItemCategoryInfo.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment, useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';

const ItemCategoryInfo = observer(
  ({ customizeTable, custLoading, dataSet, isEdit, customizeCode }) => {
    const { reportStatus, progressStatus } =
      dataSet?.parent?.current?.get(['reportStatus', 'progressStatus']) || {};
    const newIsEdit =
      isEdit &&
      ['EVAL_PREPARE'].includes(progressStatus) &&
      ['NEW', 'REJECTED', 'APPROVED'].includes(reportStatus);
    const buttons = newIsEdit && [
      [
        'add',
        {
          onClick: () => {
            const evalHeaderId = dataSet?.parent?.current?.get('evalHeaderId');
            dataSet.create({ evalHeaderId });
          },
        },
      ],
      'save',
      [
        'delete',
        {
          onClick: () =>
            dataSet.delete(dataSet.selected, {
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: intl
                .get('sslm.common.view.message.sureDeleteSelectedRows')
                .d('确认删除选中行？'),
            }),
        },
      ],
    ];

    const columns = useMemo(
      () => [
        {
          name: 'itemLov',
          width: 150,
          editor: newIsEdit,
        },
        {
          name: 'itemName',
          width: 150,
          editor: newIsEdit,
        },
        {
          name: 'categoryLov',
          width: 150,
          editor: newIsEdit,
        },
        {
          name: 'itemCategoryName',
          width: 150,
          editor: newIsEdit,
        },
        {
          name: 'brand',
          width: 150,
          editor: newIsEdit,
        },
        {
          name: 'remark',
          width: 150,
          editor: newIsEdit,
        },
      ],
      [newIsEdit]
    );

    // useEffect(() => {
    //   dataSet.query();
    // }, []);

    return (
      <Fragment>
        {customizeTable(
          {
            code: customizeCode,
            readOnly: !isEdit,
          },
          <Table
            custLoading={custLoading}
            buttons={buttons}
            columns={columns}
            dataSet={dataSet}
            border={false}
            selectionMode={newIsEdit ? 'rowbox' : 'none'}
            style={{
              maxHeight: 420,
            }}
          />
        )}
      </Fragment>
    );
  }
);

export default ItemCategoryInfo;
