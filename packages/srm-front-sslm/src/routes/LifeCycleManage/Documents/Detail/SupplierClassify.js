/*
 * @Date: 2022-12-08 15:11:47
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { useMemo, useCallback } from 'react';
import { Table, Lov, Icon, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';

import { c7nTableMaxHeight } from '@/routes/components/utils';
import { getSupplierClassifyDS } from '../stores/getSupplierClassifyDS';

const SupplierClassify = ({
  dataSet,
  isEdit,
  custLoading,
  customizeTable,
  customizeUnitCode,
  buttonCode,
  readOnlyFlag,
  sourceKey,
  pubEdit,
  lifeCycleDetailRemote,
}) => {
  const newEdit = lifeCycleDetailRemote
    ? lifeCycleDetailRemote.process('SSLM.LIFE_CYCLE_MANAGE_DETAIL.CLASSIFY_EDIT', isEdit, {
        pubEdit,
      })
    : isEdit;

  // 新增供应商分类确认回调
  const onClassifyBeforeSelect = useCallback(
    (records = []) => {
      const addList = records.map(record => {
        const recordData = record.toData();
        const {
          supplierCategoryId,
          categoryCode,
          categoryDescription,
          evaluationLevelFlag,
          evaluationScoreFlag,
        } = recordData;
        return {
          supplierCategoryId,
          categoryCode,
          categoryDescription,
          evaluationLevelFlag,
          evaluationScoreFlag,
        };
      });
      // 获取已存在分类的code集合
      const categoryCodeList = (dataSet.toData() || []).map(record => record.categoryCode);
      // 判断勾选的行是否已存在
      const existList = addList.filter(item => categoryCodeList.includes(item.categoryCode));
      if (!isEmpty(existList)) {
        notification.warning({
          message: intl.get('sslm.common.view.message.duplicateClassify').d('不可选择已存在分类'),
        });
        return false;
      }
      addList.forEach(record => {
        dataSet.create(record, 0);
      });
    },
    [dataSet]
  );

  // 获取列
  const columns = useMemo(() => {
    return [
      {
        name: 'supplierCategoryId',
        width: 200,
        editor: record =>
          newEdit &&
          !record.get('isRequisitionAddFlag') && (
            <Lov
              searchFieldInPopup
              name="supplierCategoryId"
              onOption={({ record: optionRecord }) => {
                return {
                  disabled: !optionRecord.get('checkFlag'),
                };
              }}
              tableProps={{
                mode: 'tree',
                alwaysShowRowBox: true,
                selectionMode: 'rowbox',
              }}
            />
          ),
      },
      {
        name: 'categoryDescription',
        width: 150,
      },
      {
        name: 'evaluationLevel',
        width: 100,
        editor: newEdit,
      },
      {
        name: 'evaluationScore',
        width: 120,
        editor: newEdit,
      },
      {
        name: 'enabledFlag',
        width: 80,
        editor: newEdit,
        renderer: ({ value }) => yesOrNoRender(+value) || '-',
      },
      {
        name: 'alterReason',
        width: 200,
        editor: newEdit,
      },
      {
        name: 'alterDate',
        width: 140,
      },
      {
        name: 'realName',
        width: 100,
      },
    ];
  }, [newEdit]);

  // 获取按钮
  const getButtons = () => {
    // 工作流-信息补录弹框里，不展示表格按钮
    if (newEdit && sourceKey !== 'SUPPLEMENT') {
      // 重新new ds 直接用props中的ds，新建会触发默认创建行行为
      const categoryDs = new DataSet(getSupplierClassifyDS());
      return [
        <Lov
          mode="button"
          name="add"
          clearButton={false}
          dataSet={categoryDs}
          tableProps={{
            alwaysShowRowBox: true,
            selectionMode: 'rowbox',
          }}
          onBeforeSelect={onClassifyBeforeSelect}
          modalProps={{
            beforeOpen: () => {
              const lovDs = categoryDs.getField('add').getOptions(categoryDs.current);
              if (lovDs) {
                lovDs.unSelectAll();
                lovDs.clearCachedSelected();
              }
            },
          }}
        >
          <Icon type="playlist_add" style={{ fontSize: 14, marginRight: 5, fontWeight: 400 }} />
          {intl.get('hzero.common.button.add').d('新增')}
        </Lov>,
        'delete',
      ];
    } else {
      return [];
    }
  };

  // 单据样式定制，审批表单只读
  const custProps = sourceKey === 'APPROVAL_FORM' ? { readOnly: true } : { readOnly: readOnlyFlag };

  return customizeTable(
    {
      code: customizeUnitCode,
      buttonCode,
      ...custProps,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={getButtons()}
      custLoading={custLoading}
      style={{ maxHeight: c7nTableMaxHeight }}
      selectionMode={newEdit && sourceKey !== 'SUPPLEMENT' ? 'rowbox' : 'none'}
    />
  );
};

export default SupplierClassify;
