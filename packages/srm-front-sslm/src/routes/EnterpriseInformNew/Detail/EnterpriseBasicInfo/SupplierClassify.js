/*
 * SupplierClassify - 供应商分类
 * @Date: 2023-08-29 20:54:40
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { useCallback, Fragment } from 'react';
import { Table, Lov, Icon, DataSet } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { renderStatus } from '@/routes/components/utils';
import styles from '@/routes/index.less';

import { getSupplierClassifyLov } from '../../stores/getSupplierClassifyDS';

const SupplierClassify = ({
  dataSet,
  isEdit,
  custLoading,
  customizeTable,
  isAllPlatform,
  partnerTenantId,
  handleFieldRender = () => {},
  code = '',
  changeReqId,
  mustLineTabObj = {},
  tabName,
  tableMaxHeight,
}) => {
  // 新增供应商分类确认回调
  const onClassifyBeforeSelect = useCallback(
    (records = []) => {
      const tenantIdObj = isAllPlatform ? {} : { tenantId: partnerTenantId };
      const addList = records.map(record => {
        const recordData = record.toData();
        const { categoryCode, categoryDescription } = recordData;
        return {
          categoryCode,
          categoryDescription,
          changeReqId,
          ...tenantIdObj,
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
    const categoryDs = new DataSet(getSupplierClassifyLov({ partnerTenantId }));
    return isEdit
      ? [
        <Lov
          mode="button"
          name="categoryLov"
          clearButton={false}
          dataSet={categoryDs}
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
              onClick: () => dataSet.delete(dataSet.selected, false),
            },
          ],
          ['save'],
        ]
      : [];
  }, [isEdit, dataSet]);

  const editColumns = [
    {
      name: 'categoryCode',
      editor: isEdit && (
        <Lov
          searchFieldInPopup
          onOption={({ record: optionRecord }) => {
            return {
              disabled: +optionRecord.get('hasChild'),
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

  const viewColumns = [
    {
      name: 'objectFlag',
      ignore: true,
      renderer: renderStatus,
    },
    {
      name: 'categoryCode',
      displayField: 'categoryCode',
    },
    {
      name: 'categoryDescription',
    },
    {
      name: 'enabledFlag',
      type: 'CHECKBOX',
    },
  ].map(column => {
    const { displayField, type, ignore, ...others } = column;
    return ignore
      ? others
      : {
          renderer: ({ value, record, name }) =>
            handleFieldRender({ value, record, name, type, displayField }),
          ...others,
        };
  });

  const showAlert = !!mustLineTabObj.CATEGORY && isEdit;

  return (
    <Fragment>
      {showAlert && (
        <Alert
          showIcon
          type="info"
          message={intl
            .get('sslm.common.view.tooltip.leastOneLine', {
              name: tabName,
              number: mustLineTabObj.CATEGORY,
            })
            .d(`请至少填写${mustLineTabObj.CATEGORY}条${tabName}`)}
          style={{ marginBottom: 16, border: 0 }}
          className={styles['alert-styles']}
        />
      )}
      {customizeTable(
        {
          code,
          readOnly: !isEdit,
        },
        <Table
          dataSet={dataSet}
          columns={isEdit ? editColumns : viewColumns}
          buttons={getButtons()}
          custLoading={custLoading}
          selectionMode={isEdit ? 'rowbox' : 'none'}
          style={tableMaxHeight}
        />
      )}
    </Fragment>
  );
};

export default SupplierClassify;
