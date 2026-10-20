/*
 * SupplierClassify - 供应商分类
 * @Date: 2023-04-12 10:27:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { useCallback } from 'react';
import { Table, Lov, Icon, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import { dsDeleteData } from '@/routes/components/utils/utils';
import { getSupplierClassifyDS } from '../../stores/getSupplierClassifyDS';

const tenantId = getCurrentOrganizationId();

const SupplierClassify = ({
  dataSet,
  isEdit,
  custLoading,
  customizeTable,
  supplierInformRemote,
}) => {
  // 新增供应商分类确认回调
  const onClassifyBeforeSelect = useCallback(
    (records = []) => {
      const { changeReqId, supplierTenantId, supplierCompanyId } =
        dataSet.getState('dsState') || {};
      const addList = records.map(record => {
        const recordData = record.toData();
        const { categoryId, ...rest } = recordData;
        return {
          ...rest,
          supplierCategoryId: categoryId,
          changeReqId,
          enabledFlag: 1,
          tenantId,
          dataChangeFlag: 2,
          supplierTenantId,
          supplierCompanyId,
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

  const getButtons = useCallback(() => {
    // 重新new ds 直接用props中的ds，新建会触发默认创建行行为
    const categoryDs = new DataSet(getSupplierClassifyDS());
    const btns = isEdit
      ? [
        <Lov
          mode="button"
          name="categoryLov"
          clearButton={false}
          dataSet={categoryDs}
          tableProps={{
              alwaysShowRowBox: true,
              selectionMode: 'rowbox',
            }}
          onBeforeSelect={onClassifyBeforeSelect}
          modalProps={{
              beforeOpen: () => {
                const lovDs = categoryDs.getField('categoryLov').getOptions(categoryDs.current);
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
          [
            'delete',
            {
              onClick: () => dsDeleteData({ dataSet }),
            },
          ],
        ]
      : [];
    const buttons = supplierInformRemote
      ? supplierInformRemote.process(
          'SSLM_SUPPLIER_INFORM_NEW_SUPPLIER_BASIC_CLASSIFY_BTNS',
          btns,
          { isEdit }
        )
      : btns;
    return buttons;
  }, [isEdit, dataSet]);

  const columns = [
    {
      name: 'categoryCode',
      editor: isEdit && (
        <Lov
          searchFieldInPopup
          onOption={({ record: optionRecord }) => {
            return {
              disabled: !optionRecord.get('checkFlag'),
            };
          }}
          tableProps={{
            alwaysShowRowBox: true,
            selectionMode: 'rowbox',
          }}
        />
      ),
    },
    {
      name: 'categoryDescription',
      editor: false,
    },
    {
      name: 'enabledFlag',
      editor: isEdit,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];

  return customizeTable(
    {
      code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SCLASSIFY',
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={getButtons()}
      custLoading={custLoading}
      selectionMode={isEdit ? 'rowbox' : 'none'}
      style={{ maxHeight: 'calc(100vh - 400px)' }}
    />
  );
};

export default SupplierClassify;
