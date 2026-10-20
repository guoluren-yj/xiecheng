import React, { Fragment, useState, useMemo, useEffect } from 'react';
import { flowRight } from 'lodash';
import { Button, Tabs } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import qs from 'qs';

import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
// import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { checkPermission } from 'services/api';
import { getSkuUomConfig } from '@/services/mallProtocolManagementService';
import useTabs from '@/hooks/useTabs';
import { agmLineDelSku } from '../agreement/api';

import getTabs from './getTabs';

const { TabGroup, TabPane } = Tabs;

let initTabKey = 'a';
const groupDefaultKey = { detail: 'a', history: 'c' };
const organizationId = getCurrentOrganizationId();

const getWithProps = withProps(
  () => {
    const groupList = [
      {
        tab: intl.get('sagm.common.view.title.detailTab').d('明细'),
        key: 'detail',
      },
      {
        tab: intl.get('sagm.common.model.historyVersion').d('历史版本'),
        key: 'history',
      },
    ];
    return { tabList: getTabs(), groupList };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
);

function SagmReceived(props) {
  const {
    tabList = [],
    groupList = [],
    customizeTable,
    match: { path = '' },
    location: { search },
    customizeBtnGroup,
  } = props;
  const { tabKey: locationTabKey } = qs.parse(search.substr(1));
  const [tabKey, onTabChange, tabsCount, setTabsCount] = useTabs(locationTabKey || initTabKey, {
    tabList,
    tabChange: (key, groupKey) => {
      initTabKey = key; // 缓存tab
      groupDefaultKey[groupKey] = key; // 缓存双层默认tab
    },
  });
  // const [tabKey, setTabKey] = useState(locationTabKey || initTabKey);
  const [uomFlag, setUomFlag] = useState(false);
  const [skuPermission, setSkuPermission] = useState(false);
  // const isLine = tabKey.includes('LINE');

  const { dataSet: currentDs } = tabList.find((f) => f.key === tabKey) || {};

  useEffect(() => {
    fetchUomConfig();
    fetchSkuPermission();
  }, []);

  // 查询单位显示配置
  async function fetchUomConfig() {
    const res = getResponse(await getSkuUomConfig());
    if (res) setUomFlag(res);
  }

  // 查询商品更改权限
  async function fetchSkuPermission() {
    const res = getResponse(await checkPermission(['mall-received-agreement.button.sku-number']));
    const isApprove = res?.[0]?.approve;
    setSkuPermission(isApprove);
  }

  const query = async () => {
    const res = await currentDs.query(currentDs.currentPage, null, false);
    setTabsCount((pre) => ({ ...pre, [tabKey]: res.totalElements || 0 }));
  };

  const BatchDeleteBtn = useMemo(() => {
    return observer(({ dataSet, onClick = (e) => e }) => {
      return (
        <Button
          funcType="flat"
          icon="delete"
          disabled={dataSet?.selected?.length < 1}
          onClick={onClick}
          wait={1000}
        >
          {intl.get('sagm.common.view.button.batchRemove').d('批量移除')}
        </Button>
      );
    });
  }, []);

  const handleBatchDelete = async () => {
    const delSkus = currentDs.selected.map((m) => m.toData());
    currentDs.status = 'submitting';
    const res = getResponse(await agmLineDelSku(delSkus));
    currentDs.status = 'ready';
    if (res) {
      notification.success();
      // currentDs.query();
      query();
    }
  };

  const getQueryParams = () => {
    const { dataSet, params } = tabList.find((f) => f.key === tabKey);
    const queryParams =
      dataSet.queryDataSet && dataSet.queryDataSet.current
        ? dataSet.queryDataSet.current.toJSONData()
        : {};
    const agreementNumbers = dataSet.getQueryParameter('agreementNumbers');
    return filterNullValueObject({ ...params, ...queryParams, agreementNumbers });
  };

  function handleViewAgmDetail(record) {
    const { agreementId, versionNum } = record.get(['agreementId', 'versionNum']);
    if (tabKey === 'c') {
      props.history.push(
        `/small/mall-received-agreement/history-detail/${agreementId}/${versionNum}`
      );
    } else {
      props.history.push(`/small/mall-received-agreement/detail/${agreementId}`);
    }
  }

  const customizeButtons = [
    {
      name: 'detailNewExport',
      show: tabKey === 'a',
      btnComp: ExcelExportPro,
      btnProps: {
        exportAsync: true,
        templateCode: 'SMAL_SUP_AGREEMENT_LINE_EXPORT',
        buttonText: intl.get('sagm.common.button.batchExportNew').d('(新)批量导出'),
        requestUrl: `/sagm/v1/${organizationId}/agreement-lines/supplier-export/new`,
        queryParams: getQueryParams,
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'unarchive',
          permissionList: [
            {
              code: `${path}.button.line-export-new`,
              type: 'button',
              meaning: '我收到的商城协议-（新）协议明细导出',
            },
          ],
        },
      },
    },
    {
      name: 'detailOldExport',
      show: tabKey === 'a',
      btnComp: ExcelExport,
      btnProps: {
        exportAsync: true,
        queryParams: getQueryParams,
        buttonText: intl.get('sagm.common.button.batchExport').d('批量导出'),
        otherButtonProps: { type: 'c7n-pro', funcType: 'flat', icon: 'unarchive' },
        requestUrl: `/sagm/v1/${organizationId}/agreement-lines/supplier-export`,
      },
    },
    {
      name: 'productNewExport',
      show: tabKey === 'b',
      btnComp: ExcelExportPro,
      btnProps: {
        exportAsync: true,
        templateCode: uomFlag ? 'SAGM_AGREEMENT_SKU_UOM_EXPORT' : 'SAGM_AGREEMENT_SKU_EXPORT',
        buttonText: intl.get('sagm.common.button.batchExportNew').d('(新)批量导出'),
        requestUrl: `/sagm/v1/${organizationId}/agreement-details/supplier-export/new${
          uomFlag ? '/sku-uom' : ''
        }`,
        queryParams: getQueryParams,
        otherButtonProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'unarchive',
          permissionList: [
            {
              code: `${path}.button.sku-export-new`,
              type: 'button',
              meaning: '我收到的商城协议-（新）商品导出',
            },
          ],
        },
      },
    },
    {
      name: 'productOldExport',
      show: tabKey === 'b',
      btnComp: ExcelExport,
      btnProps: {
        exportAsync: true,
        queryParams: getQueryParams,
        buttonText: intl.get('sagm.common.button.batchExport').d('批量导出'),
        otherButtonProps: { type: 'c7n-pro', funcType: 'flat', icon: 'unarchive' },
        requestUrl: `/sagm/v1/${organizationId}/agreement-details/supplier-export${
          uomFlag ? '/sku-uom' : ''
        }`,
      },
    },
    {
      show: tabKey === 'b' && skuPermission,
      name: 'delete',
      btnComp: BatchDeleteBtn,
      btnProps: {
        dataSet: currentDs,
        onClick: handleBatchDelete,
      },
    },
  ].filter((f) => f.show !== false);

  return (
    <Fragment>
      <Header
        title={intl.get('small.mallProtocolManagement.view.myReceived').d('我收到的商城协议')}
      >
        {customizeBtnGroup(
          {
            code: 'SAGM.RECEIVED.BTNS',
            // 新版按钮组个性化（必须）
            pro: true,
          },
          <DynamicButtons buttons={customizeButtons} />
        )}
      </Header>
      <Content>
        <Tabs
          activeKey={tabKey}
          onChange={onTabChange}
          defaultChangeable={false}
          customizedCode="SAGM.RECEIVED.LIST_HEADER.TABS"
        >
          {groupList.map((group) => (
            <TabGroup tab={group.tab} key={group.key} defaultActiveKey={groupDefaultKey[group.key]}>
              {tabList
                .filter((tab) => tab.groupKey === group.key)
                .map((m) => {
                  const { key, tab, dataSet, searchBarCode, customizeUnitCode, tabComp } = m;
                  const TableComp = tabComp;
                  return (
                    <TabPane key={key} tab={tab} count={tabsCount[key]}>
                      <div style={{ height: 'calc(100vh - 252px)' }}>
                        <TableComp
                          tabKey={key}
                          uomFlag={uomFlag}
                          dataSet={dataSet}
                          skuPermission={skuPermission}
                          searchBarCode={searchBarCode}
                          onViewAgmDetail={handleViewAgmDetail}
                          customizeUnitCode={customizeUnitCode}
                          customizeTable={customizeTable}
                        />
                      </div>
                    </TabPane>
                  );
                })}
            </TabGroup>
          ))}
        </Tabs>
      </Content>
    </Fragment>
  );
}

export default flowRight(
  withCustomize({ unitCode: getTabs('custCode') }),
  formatterCollections({
    code: [
      'small.mallProtocolManagement',
      'small.common',
      'small.productPublish',
      'sagm.common',
      'sagm.protocolManagement',
    ],
  }),
  getWithProps
)(SagmReceived);
