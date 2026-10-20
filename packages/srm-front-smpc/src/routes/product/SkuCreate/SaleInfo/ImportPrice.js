import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import FilterBarTable from '_components/FilterBarTable';
import { rendererLovDimension } from '@/utils/customDimension';

function ImportPrice(props) {
  const { dataSet } = props;
  const columns = [
    {
      name: 'itemCode',
    },
    {
      name: 'itemName',
    },
    {
      name: 'uomName',
    },
    {
      name: 'tax',
    },
    {
      name: 'currencyName',
    },
    {
      name: 'taxPrice',
    },
    {
      name: 'effectTime',
      width: 180,
      renderer: ({ record }) => {
        const { validDateFrom, validDateTo } = record.get(['validDateFrom', 'validDateTo']);
        if (validDateFrom) {
          return `${validDateFrom}~${validDateTo || ''}`;
        } else {
          return '-';
        }
      },
    },
    {
      name: 'allRegionFlag',
      renderer: ({ record }) => {
        const { allRegionFlag, agreementRegionDTOList } = record.get([
          'allRegionFlag',
          'agreementRegionDTOList',
        ]);
        const regions = agreementRegionDTOList || [];
        const regionColumns = [
          {
            name: 'regionCode',
            header: intl.get('smpc.product.view.regionCode').d('区域编码'),
          },
          {
            name: 'regionName',
            header: intl.get('smpc.product.view.regionName').d('区域名称'),
            renderer: ({ value, record: r }) => {
              const valid = r.get('regionEnableFlag') === 0; // 失效
              return (
                <Tooltip
                  title={
                    valid
                      ? intl
                          .get('smpc.product.model.skuSalesRegions.validator')
                          .d('地址库已升级，该地址已经不存在，请重新编辑。')
                      : ''
                  }
                >
                  <span style={{ color: valid ? 'red' : '#000' }}>{value}</span>
                </Tooltip>
              );
            },
          },
        ];
        return rendererLovDimension({
          title: intl.get('smpc.product.model.postRegion').d('送货区域'),
          isAll: () => allRegionFlag === 1,
          allText: intl.get('smpc.product.model.allRegion').d('所有区域'),
          data: regions,
          columns: regionColumns,
          textField: 'regionName',
        });
      },
      // renderer: ({ value }) =>
      //   value === 1 ? intl.get('smpc.product.model.allRegion').d('所有区域') : '-',
    },
    {
      name: 'allUnitFlag',
      renderer: ({ record }) => {
        const { allUnitFlag, agreementUnitDTOList } = record.get([
          'allUnitFlag',
          'agreementUnitDTOList',
        ]);
        const units = agreementUnitDTOList || [];
        const orgColumns = [
          {
            name: 'unitCode',
            header: intl.get('smpc.product.view.unitCode').d('组织编码'),
          },
          {
            name: 'unitName',
            header: intl.get('smpc.product.view.unitName').d('组织名称'),
          },
        ];
        const { unitCode, unitName } = units[0] || {};
        return rendererLovDimension({
          title: intl.get('smpc.product.model.buyOrg').d('可采买组织'),
          isAll: () => allUnitFlag === 1,
          allText: intl.get('smpc.product.model.allOrg').d('所有组织'),
          data: units,
          columns: orgColumns,
          text: `${unitCode || ''}-${unitName || ''}`,
        });
      },
      // renderer: ({ value }) =>
      //   value === 1 ? intl.get('smpc.product.model.allOrg').d('所有组织') : '-',
    },
    {
      name: 'categoryName',
    },
    {
      name: 'creationDate',
      width: 120,
    },
    {
      name: 'sourceFromMeaning',
    },
    {
      name: 'priceLibNumber',
      width: 120,
    },
  ];
  return (
    <FilterBarTable
      dataSet={dataSet}
      columns={columns}
      customizedCode="SMPC_CREATE_SALEINFO_IMPORTPRICE_TABLE"
      filterBarConfig={{
        defaultSortedField: 'creationDate',
      }}
      style={{ maxHeight: 'calc(100% - 5px)' }}
    />
  );
}

export default ImportPrice;
