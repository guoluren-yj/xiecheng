/**
 * 采购方评估 - 详情 - 评估物料/品类
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-01 15:53:44
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React, { useMemo } from 'react';
import { Table, Lov } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';

const ItemCategoryInfo = observer(
  ({
    isPub,
    remote,
    basicInfoDs,
    customizeTable,
    custLoading,
    dataSet,
    isEdit,
    pubEdit,
    customizeCode,
    customizeReadOnly = false,
    sourceKey = '', // 页面来源, SCORE_DETAILS 评分明细
  }) => {
    const isScoreDetails = sourceKey === 'SCORE_DETAILS'; // 评分明细
    const { reportStatus, progressStatus } =
      dataSet?.parent?.current?.get(['reportStatus', 'progressStatus']) || {};
    const newIsEdit =
      pubEdit ||
      (isEdit &&
        ['EVAL_PREPARE', 'EVAL_RESULT'].includes(progressStatus) &&
        ['NEW', 'REJECTED', 'APPROVED'].includes(reportStatus));
    const btns = newIsEdit && [
      [
        'add',
        {
          onClick: () => {
            const evalHeaderId = dataSet?.parent?.current?.get('evalHeaderId');
            dataSet.create({ evalHeaderId }, 0);
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
    const buttons = remote
      ? remote.process(
          'SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAILS_ITEM_CATEGORY_TABLE_BTNS',
          btns,
          {
            isPub,
            dataSet,
            newIsEdit,
            basicInfoDs,
            isScoreDetails,
          }
        )
      : btns;

    const cols = useMemo(
      () => [
        {
          name: 'itemLov',
          editor: newIsEdit,
        },
        {
          name: 'itemName',
          editor: newIsEdit,
        },
        {
          name: 'categoryLov',
          editor: newIsEdit && (
            <Lov
              name="categoryLov"
              searchFieldInPopup
              onOption={({ record: optionRecord }) => {
                return {
                  disabled: optionRecord.get('isCheck') === false,
                };
              }}
              tableProps={{
                alwaysShowRowBox: true,
                selectionMode: 'rowbox',
                onRow: ({ record }) => {
                  const nodeProps = {};
                  if (record.get('hasChild') === '0') {
                    nodeProps.isLeaf = true;
                  }
                  return nodeProps;
                },
              }}
            />
          ),
        },
        {
          name: 'itemCategoryName',
          editor: newIsEdit,
        },
        {
          name: 'brand',
          editor: newIsEdit,
        },
        {
          name: 'remark',
          hidden: isScoreDetails,
          editor: newIsEdit,
        },
      ],
      [newIsEdit]
    );
    const columns = remote
      ? remote.process(
          'SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAILS_ITEM_CATEGORY_TABLE_COLS',
          cols,
          {
            dataSet,
            newIsEdit,
            isScoreDetails,
          }
        )
      : cols;

    return customizeTable(
      {
        code: customizeCode || 'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATE_MATERIALS_TABLE',
        readOnly: customizeReadOnly,
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
    );
  }
);

export default ItemCategoryInfo;
