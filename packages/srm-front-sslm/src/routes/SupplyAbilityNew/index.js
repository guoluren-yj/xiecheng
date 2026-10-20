/**
 * Index - 供货能力清单管理
 * @date: 2023-10-18
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import { compose } from 'lodash';
import querystring from 'querystring';
import React, { Fragment, useState, useMemo, useEffect, useCallback } from 'react';
import { DataSet, Tabs, Spin, Modal } from 'choerodon-ui/pro';

import { queryMapIdpValue } from 'services/api';
import { submitExpand, abandonExpand } from '@/services/supplyAbilityService';
import { getResponse, filterNullValueObject } from 'utils/utils';

import notification from 'utils/notification';
// import { openTab } from 'utils/menuTab';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getAbilityListDS, getExpandAbilityDS } from './stores/indexDS';
import SupplyAbility from './SupplyAbility';
import ExpandSupplyAbility from './ExpandSupplyAbility';
import { OperationButtons } from './utils';

const { TabPane } = Tabs;
let supplyAbilitySearchRef = null;

const expandCustomizeUnitCode = ['SSLM.SUPPLIER_ABLILITY_MANAGE.EXPANDING_LIST_TABLE'];

const abilityCodeList = [
  'SSLM.SUPPLIER_ABLILITY_MANAGE.LIST_TABLE',
  'SSLM.SUPPLIER_ABLILITY_MANAGE.LIST_SEARCH_BAR',
];

const abilityItemCodeList = [
  'SSLM.SUPPLIER_ABLILITY_MANAGE.ITEM_LIST_TABLE',
  'SSLM.SUPPLIER_ABLILITY_MANAGE.ITEM_SUP_LIST_SEARCH_BAR',
];

const Index = ({
  history,
  location,
  custLoading,
  customizeTable,
  customizeTabPane,
  customizeBtnGroup,
  mixObj,
  abilityListDs,
  expandAbilityDs,
  abilityListItemDs,
}) => {
  const [spinning, setSpinning] = useState(false);
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  const {
    supplierDimension: newSupplierDimension,
    defaultTabIndex,
    ...otherRouterParams
  } = routerParams;
  const [currentKey, setCurrentKey] = useState(defaultTabIndex || mixObj.currentKey);
  const [valueList, setValueList] = useState({}); // 存储值集
  const [supplierDimension, setSupplierDimension] = useState(
    newSupplierDimension || mixObj.supplierDimension
  );

  useEffect(() => {
    queryValueList();
  }, [newSupplierDimension]);

  // 跳转到详情页
  const handleGoDetail = useCallback(
    (record, type) => {
      const { data: { supplyAbilityId, supplyAbilityExpandId } = {} } = record || {};
      if (currentKey === 'supplyAbility') {
        if (supplyAbilityId) {
          history.push({
            pathname: `/sslm/supplier-ablility-manage/detail/${supplyAbilityId}`,
            search: querystring.stringify({
              type,
            }),
          });
        } else {
          history.push('/sslm/supplier-ablility-manage/create');
        }
      } else {
        history.push({
          pathname: `/sslm/supplier-ablility-manage/expand-detail/${supplyAbilityExpandId}`,
          search: querystring.stringify({
            type,
          }),
        });
      }
    },
    [currentKey, newSupplierDimension]
  );

  // 供应商维度切换回调
  const supplierDimensionChange = useCallback(value => {
    setSupplierDimension(value);
    // eslint-disable-next-line no-param-reassign
    mixObj.supplierDimension = value;
  }, []);

  // 供货能力清单定义导入
  // const handleImport = useCallback(() => {
  //   openTab({
  //     key: `/sslm/supplier-ablility-definition/import-component/SSLM_SUPPLY_ABILITY`,
  //     title: intl.get('hzero.common.title.batchImport').d('批量导入'),
  //     search: querystring.stringify({
  //       action: intl.get('hzero.common.title.batchImport').d('批量导入'),
  //     }),
  //   });
  // }, []);

  // 刷新拓展中数据
  const onRefresh = useCallback(() => {
    expandAbilityDs.unSelectAll();
    expandAbilityDs.clearCachedSelected();
    expandAbilityDs.query();
  }, []);

  // 提交审批
  const handleSubmit = useCallback(() => {
    setSpinning(true);
    const payload = {
      submitList: expandAbilityDs.toJSONData(),
      customizeUnitCode: expandCustomizeUnitCode.join(','),
    };
    submitExpand(payload)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          onRefresh();
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  // 废弃回调
  const handldAbandon = useCallback(() => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get(`sslm.common.message.confirmCancel`).d('是否确认废弃?'),
      onOk: () => {
        setSpinning(true);
        const payload = {
          abandonList: expandAbilityDs.toJSONData(),
          customizeUnitCode: expandCustomizeUnitCode.join(','),
        };
        abandonExpand(payload)
          .then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              onRefresh();
            }
          })
          .finally(() => {
            setSpinning(false);
          });
      },
    });
  }, []);

  // 查询值集
  const queryValueList = useCallback(() => {
    const lovCode = {
      dimensionList: 'SSLM.SUP.WORK_BENCH_DIMENSION',
    };
    queryMapIdpValue(lovCode).then(response => {
      const res = getResponse(response);
      if (res) {
        setValueList(res);
      }
    });
  }, []);

  // tab改变时的回调
  const handleTabChange = useCallback(key => {
    setCurrentKey(key);
    if (key === 'supplyAbility') {
      abilityListDs.query(abilityListDs.currentPage);
    } else {
      expandAbilityDs.query(expandAbilityDs.currentPage);
    }
    // eslint-disable-next-line no-param-reassign
    mixObj.currentKey = key;
  }, []);

  // 绑定筛选器的ref
  const onSearchBarRef = ref => {
    supplyAbilitySearchRef = ref;
  };

  // 获取导出查询参数
  const getSupAbilityParams = () => {
    let queryParams = {};
    // 传自定义的查询条件
    if (abilityListItemDs.queryDataSet && abilityListItemDs.queryDataSet.current) {
      queryParams = abilityListItemDs.queryDataSet.current.toData();
    } else {
      const params = supplyAbilitySearchRef.getQueryParameter();
      queryParams = params;
    }
    return filterNullValueObject(queryParams);
  };

  const commonProps = {
    customizeTable,
    custLoading,
    handleGoDetail,
  };

  const tabProps = {
    supplyAbility: {
      ...commonProps,
      dataSet: supplierDimension === 'SUPPLIER' ? abilityListDs : abilityListItemDs,
      customizeUnitCode:
        supplierDimension === 'SUPPLIER'
          ? 'SSLM.SUPPLIER_ABLILITY_MANAGE.LIST_TABLE'
          : 'SSLM.SUPPLIER_ABLILITY_MANAGE.ITEM_LIST_TABLE',
      searchBarCode:
        supplierDimension === 'SUPPLIER'
          ? 'SSLM.SUPPLIER_ABLILITY_MANAGE.LIST_SEARCH_BAR'
          : 'SSLM.SUPPLIER_ABLILITY_MANAGE.ITEM_SUP_LIST_SEARCH_BAR',
      valueSetCode: valueList,
      supplierDimension,
      supplierDimensionChange: () => supplierDimensionChange,
      onSearchBarRef,
      routerParams: otherRouterParams,
    },
    expandSupplyAbility: {
      ...commonProps,
      dataSet: expandAbilityDs,
      customizeUnitCode: 'SSLM.SUPPLIER_ABLILITY_MANAGE.EXPANDING_LIST_TABLE',
      searchBarCode: 'SSLM.SUPPLIER_ABLILITY_MANAGE.EXPANDING_LIST_SEARCH_BAR',
    },
  };

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.supplyAbility.view.message.title.manage').d('供货能力清单管理')}
      >
        <OperationButtons
          currentKey={currentKey}
          supplierDimension={supplierDimension}
          expandAbilityDs={expandAbilityDs}
          abilityListDs={abilityListDs}
          handleGoDetail={handleGoDetail}
          // handleImport={handleImport}
          handleSubmit={handleSubmit}
          handldAbandon={handldAbandon}
          customizeBtnGroup={customizeBtnGroup}
          customizeBtnGroupCode={
            currentKey === 'supplyAbility'
              ? supplierDimension === 'SUPPLIER'
                ? 'SSLM.SUPPLIER_ABLILITY_MANAGE.LIST_BTN'
                : 'SSLM.SUPPLIER_ABLILITY_MANAGE.ITEM_LIST_BTN'
              : 'SSLM.SUPPLIER_ABLILITY_MANAGE.EXPAND_LIST_BTN'
          }
          getSupAbilityParams={getSupAbilityParams}
        />
      </Header>
      <Content>
        <Spin spinning={spinning}>
          {customizeTabPane(
            {
              code: 'SSLM.SUPPLIER_ABLILITY_MANAGE.LIST_TABS',
              __force_record_to_update__: true,
            },
            <Tabs activeKey={currentKey} onChange={handleTabChange}>
              <TabPane
                key="supplyAbility"
                tab={intl.get('sslm.supplyAbility.view.tab.supplyAbility').d('供货能力清单')}
              >
                <SupplyAbility {...tabProps.supplyAbility} />
              </TabPane>
              <TabPane
                key="expandSupplyAbility"
                tab={intl
                  .get('sslm.supplyAbility.view.tab.expandSupplyAbility')
                  .d('拓展中供货能力')}
              >
                <ExpandSupplyAbility {...tabProps.expandSupplyAbility} />
              </TabPane>
            </Tabs>
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplyAbility'],
  }),
  WithCustomize({
    unitCode: [
      'SSLM.SUPPLIER_ABLILITY_MANAGE.LIST_BTN',
      'SSLM.SUPPLIER_ABLILITY_MANAGE.ITEM_LIST_BTN',
      'SSLM.SUPPLIER_ABLILITY_MANAGE.EXPAND_LIST_BTN',
      'SSLM.SUPPLIER_ABLILITY_MANAGE.LIST_TABS', // 供货能力管理tab页签
      'SSLM.SUPPLIER_ABLILITY_MANAGE.LIST_TABLE', // 供货能力清单表单-供应商维度
      'SSLM.SUPPLIER_ABLILITY_MANAGE.ITEM_LIST_TABLE', // 供货能力清单表单-供应商、物料维度
      'SSLM.SUPPLIER_ABLILITY_MANAGE.LIST_SEARCH_BAR', // 供货能力清单筛选器-供应商维度
      'SSLM.SUPPLIER_ABLILITY_MANAGE.ITEM_SUP_LIST_SEARCH_BAR', // 供货能力清单筛选器-供应商、物料维度
      'SSLM.SUPPLIER_ABLILITY_MANAGE.EXPANDING_LIST_TABLE', // 拓展中供货能力表单
      'SSLM.SUPPLIER_ABLILITY_MANAGE.EXPANDING_LIST_SEARCH_BAR', // 拓展中供货能力筛选器
    ],
  }),
  withProps(
    () => {
      const abilityListDs = new DataSet(
        getAbilityListDS({ supplierDimension: 'SUPPLIER', customizeUnitCodeList: abilityCodeList })
      );
      const abilityListItemDs = new DataSet(
        getAbilityListDS({ supplierDimension: 'ITEM', customizeUnitCodeList: abilityItemCodeList })
      );
      const expandAbilityDs = new DataSet(getExpandAbilityDS());
      const mixObj = {
        currentKey: 'supplyAbility', // 默认激活页签
        supplierDimension: 'SUPPLIER', // 供应商初始维度
      };
      return { abilityListDs, expandAbilityDs, abilityListItemDs, mixObj };
    },
    { cacheState: true }
  )
)(Index);
