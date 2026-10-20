import React, { useState, useEffect, useMemo } from 'react';
import { Table, Modal, DataSet, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import remoteFunc from 'hzero-front/lib/utils/remote';
import DimensionList from '../Comps/Dimension';
import { fetchSingle } from '../../PriceStrategy/api';
import {
  unitColumns,
  categoryColumns,
  directoryColumns,
  supplierColumns,
  skuColumns,
} from './columns';

const organizationId = getCurrentOrganizationId();

const dimensionConfigMap = {
  ORGANIZATION: {
    displayField: 'unitName',
    icon: 'inventory_2',
    getConfig: m => {
      const { allOrgEnable, orgMappings } = m;
      const columns = unitColumns();
      const list = allOrgEnable
        ? [
            {
              unitName: intl.get('sagm.common.model.allOrganizations').d('所有组织'),
            },
          ]
        : orgMappings;
      const dataSet = new DataSet({ paging: false, selection: false });
      dataSet.loadData(list);
      return {
        dataSet,
        columns,
        isWhole: allOrgEnable,
      };
    },
    comp: Table,
  },
  CATALOG: {
    displayField: 'name',
    icon: 'donut_small',
    getConfig: m => {
      const { includeAllFlag, catalogMappings } = m;
      const columns = categoryColumns();
      const list = includeAllFlag
        ? [
            {
              name: intl.get('sagm.common.model.allCategory').d('所有分类'),
            },
          ]
        : catalogMappings;
      const dataSet = new DataSet({ paging: false, selection: false });
      dataSet.loadData(list);
      return {
        dataSet,
        columns,
        isWhole: includeAllFlag,
      };
    },
    comp: Table,
  },
  DIRECTORY: {
    displayField: 'name',
    icon: 'apps',
    getConfig: m => {
      const { directoryMappings } = m;
      const columns = directoryColumns();
      const dataSet = new DataSet({ paging: false, selection: false });
      dataSet.loadData(directoryMappings);
      return {
        dataSet,
        columns,
      };
    },
    comp: Table,
  },
  SUPPLIER: {
    displayField: 'supplierCompanyName',
    icon: 'person',
    getConfig: m => {
      const { supplierMappings } = m;
      const columns = supplierColumns();
      const dataSet = new DataSet({ paging: false, selection: false });
      dataSet.loadData(supplierMappings);
      return {
        dataSet,
        columns,
      };
    },
    comp: Table,
  },
  SKU: {
    icon: 'appmarket',
    displayField: 'skuName',
    comp: Table,
    getConfig(m) {
      const { strategyConditionId } = m;
      const dataSet = new DataSet({
        selection: false,
        pageSize: 20,
        transport: {
          read: {
            url: `/sagm/v1/${organizationId}/sku-mappings`,
            method: 'GET',
            data: { strategyConditionId },
          },
        },
      });
      dataSet.query();
      return { dataSet, columns: skuColumns() };
    },
  },
};

const DimensionContainer = remoteFunc({
  code: 'REMOTE_PRICE_STRATEGY', // 松下二开，商品穿梭框增加采购方字段 需求 mall-6213
  name: 'remote',
})(({ priceStrategyId, remote }) => {
  const [loading, setLoading] = useState(false);
  const [dimensions, setDimensions] = useState([]);
  useEffect(() => {
    initData();
  }, []);

  async function initData() {
    setLoading(true);
    const res = getResponse(await fetchSingle({ priceStrategyId }));
    setLoading(false);
    if (res) {
      const { priceStrategyConditions = [] } = res;
      setDimensions(priceStrategyConditions);
    }
  }

  const card = useMemo(
    () =>
      dimensions.map(m => {
        const { strategyDimension = {} } = m;
        const cardKey = strategyDimension.strategyDimensionCode;
        const { getConfig = e => e, ...otherProps } = dimensionConfigMap[cardKey] || {};
        const { isWhole, dataSet, columns = [] } = getConfig(m);
        const totalColumns = remote.process('DIMENSION_SKU_READ', columns, {
          purchaseColumns: [
            {
              name: 'companyName',
              minWidth: 120,
              header: intl.get('sagm.common.model.purchase').d('采购方'),
              show: cardKey === 'SKU',
            },
          ].filter(f => f.show === true),
        });
        return {
          cardKey,
          dataSet,
          title: strategyDimension.strategyDimensionName,
          count: () => (isWhole ? 0 : dataSet.totalCount),
          content: (
            <Table
              dataSet={dataSet}
              columns={totalColumns}
              style={{
                maxHeight: cardKey === 'SKU' ? 'calc(100vh - 310px)' : 'calc(100vh - 270px)',
              }}
              customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.CHECK_STRAEGY"
            />
          ),
          ...otherProps,
        };
      }),
    [dimensions]
  );

  return (
    <Spin spinning={loading}>
      <DimensionList card={card} />
    </Spin>
  );
});

export default function openDimension(priceStrategyId) {
  Modal.open({
    drawer: true,
    closable: true,
    okCancel: false,
    style: { width: 1090 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl.get('sagm.common.view.title.strategyDimension').d('策略维度'),
    children: <DimensionContainer priceStrategyId={priceStrategyId} />,
  });
}
