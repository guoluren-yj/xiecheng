/**
 * 供货能力查询（采）
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useCallback, Fragment } from 'react';
import { compose } from 'lodash';
import { routerRedux } from 'dva/router';
import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import SearchBarTable from '_components/SearchBarTable';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import {
  getUserOrganizationId,
  getCurrentOrganizationId,
  // filterNullValueObject,
} from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';

import { tableHeight, tableMaxHeight } from '@/routes/components/utils';
import { getCommonParams, hanldeCountryChange } from '@/routes/SupplyAbilityDoc/utils/index';

import getAbilityListDs from './stores/getAbilityListDS';
// import HeaderBtns from './ListHeaderBtns';

const currentTenantId = getCurrentOrganizationId();
const userOrganizationId = getUserOrganizationId();

const Index = ({ remote, custLoading, customizeTable, abilityListDs, dispatch }) => {
  // 跳转到详情页
  const handleGoDetail = useCallback(record => {
    const supplyAbilityId = record.get('supplyAbilityId');
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supply-ability-query-supplier/detail/${supplyAbilityId}`,
      })
    );
  }, []);

  const getColumns = useCallback(() => {
    const cols = [
      {
        name: 'supplierCompanyNum',
        width: 120,
        renderer: ({ value, record }) => <a onClick={() => handleGoDetail(record)}>{value}</a>,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'stageDescription',
        width: 100,
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'itemCode',
        width: 80,
      },
      {
        name: 'itemName',
        width: 180,
      },
      {
        name: 'itemCategoryCode',
        width: 80,
      },
      {
        name: 'itemCategoryName',
        width: 180,
      },
      {
        name: 'supplyFlag',
        width: 80,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'adapterProducts',
      },
      {
        name: 'countryIdMeaning',
      },
      {
        name: 'regionIdMeaning',
      },
      {
        name: 'cityIdMeaning',
      },
      {
        name: 'dateFrom',
      },
      {
        name: 'dateTo',
      },
      {
        name: 'manufacturer',
      },
      {
        name: 'remark',
      },
      {
        width: 100,
        name: 'lastUpdateUserName',
      },
      {
        width: 100,
        name: 'lastUpdateDate',
        renderer: ({ value }) => dateRender(value),
      },
    ];
    const colums = remote.process('SSLM_SUPPLY_ABLILITY_QUERY_SUPPLIER_LIST_COLUMNS', cols, {
      abilityListDs,
    });
    return colums;
  }, []);

  // const handleExportParams = () => {
  //   let exportParams = {};
  //   if (abilityListDs) {
  //     const queryData = abilityListDs.queryDataSet.current.toData();
  //     const queryParams = filterNullValueObject(queryData);
  //     const { __dirty, ...others } = queryParams;
  //     exportParams = {
  //       ...others,
  //     };
  //   }
  //   return exportParams;
  // };

  // 筛选器字段
  const getFieldProps = () => {
    const { itemCategoryId, ...others } = getCommonParams() || {};
    const fieldProps = {
      ...others,
      supplierCompanyId: {
        lovPara: {
          supplierTenantId: userOrganizationId,
          tenantId: currentTenantId,
        },
      },
      companyId: {
        lovPara: {
          tenantId: currentTenantId,
          supplierTenantId: userOrganizationId,
        },
      },
    };
    return fieldProps;
  };

  // 处理字段变更
  const handleFieldChange = ({ record, name }) => {
    hanldeCountryChange({ record, name });
  };

  return (
    <Fragment>
      <Header
        title={intl
          .get('sslm.supplyAbility.view.message.title.querySupplier')
          .d('供货能力清单查询（供）')}
      >
        {/* <HeaderBtns handleExportParams={handleExportParams} /> */}
        {remote.process('SSLM_SUPPLY_ABLILITY_QUERY_SUPPLIER_LIST_HEADER_BTNS', [], {
          abilityListDs,
        })}
      </Header>
      <Content>
        <div style={{ height: tableHeight.fixedHeight }}>
          {customizeTable(
            {
              code: 'SSLM.SUPPLY_ABLILITY_QUERY.SUPPLIER_LIST.TABLE',
            },
            <SearchBarTable
              cacheState
              dataSet={abilityListDs}
              columns={getColumns()}
              custLoading={custLoading}
              style={{ maxHeight: tableMaxHeight.fixedHeight }}
              searchCode="SSLM.SUPPLY_ABLILITY_QUERY.SUPPLIER_LIST.SEARCH"
              searchBarConfig={{
                fieldProps: getFieldProps(),
                onFieldChange: handleFieldChange,
              }}
            />
          )}
        </div>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplyAbility', 'sslm.supplyAbilityDoc'],
  }),
  WithCustomize({
    unitCode: ['SSLM.SUPPLY_ABLILITY_QUERY.SUPPLIER_LIST.TABLE'],
  }),
  withProps(
    () => {
      const abilityListDs = new DataSet(getAbilityListDs());
      return { abilityListDs };
    },
    { cacheState: true }
  ),
  remotes({
    code: 'SSLM_SUPPLY_ABLILITY_QUERY_SUPPLIER_LIST',
  })
)(Index);
