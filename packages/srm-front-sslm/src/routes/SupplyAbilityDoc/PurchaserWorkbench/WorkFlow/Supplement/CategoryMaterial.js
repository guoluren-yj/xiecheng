import React from 'react';
import { isNil } from 'lodash';
import { Lov, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { renderStatus } from '@/routes/components/utils';

const CategoryMaterial = ({
  dataSet,
  custLoading,
  customizeTable,
  customizeUnitCode = '',
  headerInfo = {},
}) => {
  const isEdit = true;
  const {
    initiateCamp = '0', // 0 采购方创建，1 供应商创建
  } = headerInfo;

  // 采购方创建的单据
  const purchaserCreateFlag = !Number(initiateCamp);

  const columns = [
    {
      name: 'operationType',
      width: 100,
      editor: isEdit,
      renderer: isEdit
        ? null
        : ({ value, record }) => {
            if (isNil(value)) {
              return '-';
            }
            const { operationTypeMeaning } = record.get(['operationTypeMeaning']);
            const updateFlag = isNil(value) ? null : !!Number(value);
            let cuzOperationType = 'CREATE';
            if (!updateFlag) {
              cuzOperationType = 'CREATE';
            } else {
              cuzOperationType = 'UPDATE_ITEM';
            }
            record.init({ cuzOperationTypeMeaning: operationTypeMeaning, cuzOperationType });
            return renderStatus({ name: 'cuzOperationType', record }) || '-';
          },
    },
    {
      name: 'itemId',
      width: 150,
      editor: isEdit,
    },
    {
      name: 'itemName',
      width: 180,
    },
    {
      name: 'itemCategoryId',
      width: 140,
      editor: isEdit && (
        <Lov
          name="itemCategoryId"
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
      width: 180,
    },
    {
      name: 'supplyFlag',
      width: 80,
      editor: isEdit,
      type: 'CHECKBOX',
    },
    {
      name: 'dateFrom',
      width: 120,
      editor: isEdit,
      type: 'date',
    },
    {
      name: 'dateTo',
      width: 120,
      editor: isEdit,
      type: 'date',
    },
    {
      width: 140,
      name: 'countryId',
      editor: isEdit,
    },
    {
      width: 100,
      name: 'regionId',
      editor: isEdit,
    },
    {
      width: 100,
      name: 'cityId',
      editor: isEdit,
    },
    {
      name: 'manufacturer',
      width: 150,
      editor: isEdit,
    },
    {
      name: 'adapterProducts',
      width: 100,
      editor: isEdit,
    },
    {
      name: 'remark',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'purchaseOrganizationId',
      width: 150,
      editor: isEdit,
      hidden: !purchaserCreateFlag,
    },
    {
      name: 'inventoryOrganizationId',
      width: 200,
      editor: isEdit,
      hidden: !purchaserCreateFlag,
    },
  ];

  return (
    <div className="card-content">
      <div className="card-content-title">
        {intl.get('sslm.supplyAbility.view.message.categoryMaterialTable').d('推荐物料/品类')}
      </div>
      {customizeTable(
        {
          code: customizeUnitCode,
        },
        <Table
          dataSet={dataSet}
          columns={columns}
          queryBar="none"
          custLoading={custLoading}
          style={{ maxHeight: 518 }}
        />
      )}
    </div>
  );
};

export default CategoryMaterial;
