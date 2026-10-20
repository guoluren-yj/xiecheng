import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { flowRight } from 'lodash';
import { Tabs, Button } from 'choerodon-ui/pro';

import withProps from 'utils/withProps';
import intl from 'utils/intl';
import qs from 'qs';
// import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import ImportButton from 'components/Import';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import { checkPermission } from 'services/api';

import { ObserverBtn, DropdownBtn, MenuItemLinkBtn } from '@/components/CommonButtons';
import { confirmBefore } from '@/utils/c7nModal';
import { getC7NExportQueryParams } from '@/utils/utils';
import { openTextArea } from '@/utils/modals';
import {
  submitAgreement,
  terminateAgreement,
  getSkuUomConfig,
  createProduct,
  lineDeleteProduct,
} from '@/services/mallProtocolManagementService';
import {
  agreementApprove,
  agreementReject,
  agreementPublish,
} from '@/services/mallAgreementApproveService';
import useTabs from '@/hooks/useTabs';
import { protManageBtns } from '../../small/const/uniCode';
import SearchBarSubTable from './SearchBarSubTable';
import { openProductModal } from './Detail/agmLineFuncs';
import { getTabs } from './tabConfig';
import PriceLib from '../PriceLib';
import confirm from './Detail/confirm';

import { PERMISSION_PROTOCOL_WORKBENCH_SKU_NUMBER } from '../const/permissionCode';

const { TabGroup, TabPane } = Tabs;

let initTabKey = 'all';
const groupDefaultKey = { protocol: 'all', detail: 'product_detail' };
const tabKeys = [
  'create',
  'submitted',
  'approveReject',
  'approved',
  'published',
  'finished',
  'all',
  'protocol_detail',
  'product_detail',
];

const getWithProps = withProps(
  () => {
    const groupList = [
      {
        tab: intl.get('sagm.common.view.workbenchTabKey.protocol').d('协议'),
        key: 'protocol',
      },
      {
        tab: intl.get('sagm.common.view.workbenchTabKey.detail').d('明细'),
        key: 'detail',
      },
    ];
    return { tabList: getTabs(), groupList };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
);

function ProtocolWorkbench(props) {
  const {
    tabList = [],
    groupList = [],
    customizeBtnGroup,
    customizeTable,
    customizeForm,
    location: { search },
    match: { path = '' },
  } = props;
  const { tabKey: urlTabKey } = qs.parse(search.substr(1));
  const [tabKey, onTabChange, tabsCount, setTabsCount] = useTabs(initTabKey, {
    tabList,
    tabInit: false,
    tabChange: (key, groupKey) => {
      initTabKey = key; // 缓存tab
      groupDefaultKey[groupKey] = key; // 缓存双层默认tab
    },
  });
  const [uomFlag, setUomFlag] = useState(false);
  const [skuApprove, setSkuApprove] = useState(true);
  const getTabConfig = () => {
    const { dataSet, getPara = (e) => e } = tabList.find((item) => item.key === tabKey) || {};
    return [dataSet, getPara];
  };

  const [currentDs, getQueryParams] = getTabConfig();

  useEffect(() => {
    // 单位配置
    fetchUomConfig();
    // 商品权限控制
    hasSkuPermission();
    // tabKey处理
    if (urlTabKey) {
      const value = urlTabKey.toLowerCase();
      if (tabKeys.includes(value)) {
        initTabKey = value;
      }
    }
    onTabChange(initTabKey);
  }, []);

  const query = async () => {
    const res = await currentDs.query(currentDs.currentPage, null, false);
    setTabsCount((pre) => ({ ...pre, [tabKey]: res.totalElements || 0 }));
  };

  const hasSkuPermission = async () => {
    const res = await checkPermission([PERMISSION_PROTOCOL_WORKBENCH_SKU_NUMBER]);
    const isApprove = ((res || [])[0] || {}).approve;
    setSkuApprove(isApprove);
  };

  const handleManualCreate = () => {
    props.history.push(`/sagm/sagm-protocol-workbench/detail/create`);
  };

  const fetchUomConfig = async () => {
    const res = getResponse(await getSkuUomConfig());
    if (res) setUomFlag(res);
  };

  /**
   * 仅对应tab有该操作， 无需协议状态过滤
   */
  const handleCommonBachEvent = async (api, paramData, operate = '') => {
    const selectedRow = currentDs.selected;
    const data = selectedRow.map((i) => ({ ...i.toData(), ...paramData }));
    currentDs.status = 'loading';
    const res = getResponse(await api(data));
    currentDs.status = 'ready';
    if (res) {
      if (operate === 'submit') {
        onSubmitCallback(res);
        query();
        return;
      }
      notification.success();
      query();
    }
  };

  const onSubmitCallback = ({ status, message }) => {
    // 0失败 1部分成功 2 全部成功
    const info = { message };
    if (status === 1) {
      notification.success(info);
    } else if (status === 2) {
      notification.warning(info);
    } else {
      notification.error(info);
    }
  };

  /**
   * 审批拒绝
   */
  const handleApproveReject = () => {
    openTextArea({
      title: intl.get('small.common.view.approveReject').d('审批拒绝'),
      name: 'rejectRemark',
      maxLength: 100,
      label: intl.get('small.common.view.rejectReason').d('拒绝原因'),
      onOk: (param) =>
        agreementReject(currentDs.selected.map((m) => ({ ...m.toData(), ...param }))).then(
          (res) => {
            if (res) {
              notification.success();
              query();
            }
          }
        ),
    });
  };

  /**
   * 批量导入创建协议
   */
  const handleBatchImport = () => {
    openTab({
      key: `/sagm/data-import/SMAL.AGREEMENT_ALL`,
      title: 'srm.common.view.batchAgreementImport',
      search: qs.stringify({
        action: 'srm.common.view.batchAgreementImport',
        backPath: '/sagm/sagm-protocol-workbench/list',
      }),
    });
  };

  // 协议明细批量新建商品
  function createSku() {
    const _catalogId = currentDs.selected[0].get('catalogId');
    openProductModal({
      catalogId: _catalogId,
      handleProductOK: async (data) => {
        const res = await createProduct({
          cid: data.categoryId,
          agreementSkuDTO: {
            agreementLineList: currentDs.selected.map((i) => i.toData()),
            details: data.content,
          },
        });
        if (getResponse(res)) {
          notification.success();
          query();
        }
      },
    });
  }

  // 删除商品
  function handleDeleteSku(records) {
    confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      content: intl
        .get('small.mallProtocolManagement.view.product.deleteConfirm')
        .d('是否确认移除商品？'),
      onOk: async () => {
        currentDs.status = 'loading';
        const res = getResponse(
          await lineDeleteProduct({
            agreementDetails: records.map((m) => m.toData()),
          })
        );
        currentDs.status = 'ready';
        if (res) {
          notification.success();
          query();
        }
      },
    });
  }

  /**
   * 引用价格库创建协议
   */
  const handlePricePoor = () => {
    const {
      history: { push },
    } = props;
    PriceLib.create({
      afterSuccess: (data) => {
        push({
          pathname: '/sagm/sagm-protocol-workbench/detail/create',
          search: `?quoteType=price`,
          state: {
            quoteData: data,
          },
        });
      },
    });
  };

  const priceLibExport = () => (
    <Button
      funcType="flat"
      icon="unarchive"
      onClick={() => {
        PriceLib.export(path);
      }}
      help={intl.get('sagm.common.view.message.priceLibExport').d('价格库数据仅包含商城引用的部分')}
    >
      {intl.get('sagm.common.view.button.priceLibExport').d('价格库导出')}
    </Button>
  );

  const customizeButtons = useMemo(() => {
    const _path = path.split('/', 3).join('/');
    return [
      {
        name: 'create',
        group: true,
        children: [
          {
            name: 'createManual1',
            child: intl.get('sagm.common.view.button.createManual1').d('手工新建'),
            btnProps: {
              onClick: handleManualCreate,
            },
          },
          {
            name: 'quotePrice',
            child: intl.get('sagm.common.view.button.quotePrice').d('引用价格库'),
            btnProps: {
              onClick: handlePricePoor,
            },
          },
          {
            name: 'batchImportSku',
            child: intl.get('sagm.common.view.button.batchImportSku').d('批量导入'),
            btnProps: {
              onClick: handleBatchImport,
            },
          },
          {
            name: 'bactImportNew',
            btnComp: MenuItemLinkBtn,
            btnProps: {
              businessObjectTemplateCode: 'SMAL.AGREEMENT_ALL',
              refreshButton: true,
              btnComp: ImportButton,
              prefixPatch: '/sagm',
              changeServicePrefix: true,
              buttonText: intl.get('sagm.common.button.bactImportNew').d('(新)批量导入'),
              buttonProps: {
                icon: '',
                funcType: 'link',
                permissionList: [
                  {
                    code: `${path}.button.import-new`,
                    type: 'button',
                    meaning: '商城协议工作台-（新）导入',
                  },
                ],
              },
              successCallBack: () => {
                if (!tabKey.includes('detail')) {
                  query();
                }
              },
            },
          },
        ],
        child: (
          <DropdownBtn
            primary
            icon="add"
            color="primary"
            text={intl.get('sagm.common.view.button.createProtocol').d('新建协议')}
          />
        ),
      },
      {
        show: tabKey === 'create',
        name: 'batchSubmit',
        btnComp: ObserverBtn,
        btnProps: {
          icon: 'check',
          dataSet: currentDs,
          getDisable: (data = []) => {
            return data.length === 0;
          },
          onClick: () => handleCommonBachEvent(submitAgreement, {}, 'submit'),
          text: intl.get('sagm.common.view.button.batchSubmit').d('批量提交'),
        },
      },
      {
        name: 'approve',
        group: true,
        show: tabKey === 'submitted',
        children:
          currentDs?.selected?.length === 0
            ? []
            : [
                {
                  name: 'approvePass',
                  child: intl.get('sagm.common.view.button.approvePass').d('审批通过'),
                  observerBtnProps: () => ({
                    disabled: currentDs.selected.length === 0,
                    onClick: () => handleCommonBachEvent(agreementApprove),
                  }),
                },
                {
                  name: 'approveReject',
                  child: intl.get('sagm.common.view.button.approveReject').d('审批拒绝'),
                  observerBtnProps: () => ({
                    disabled: currentDs.selected.length === 0,
                    onClick: handleApproveReject,
                  }),
                },
              ],
        child: (
          <DropdownBtn
            funcType="flat"
            icon="authorize"
            text={intl.get('sagm.common.view.button.batchApprove').d('协议审批')}
            dataSet={currentDs}
            showTip
            permission
            permissionList={[
              {
                code: `${_path}.button.operate.approve`,
                type: 'button',
                meaning: '协议工作台 -审批',
              },
            ]}
          />
        ),
      },
      {
        name: 'batchTerminate',
        show: tabKey === 'published',
        btnComp: ObserverBtn,
        btnProps: {
          icon: 'not_interested',
          dataSet: currentDs,
          getDisable: (data = []) => {
            return data.length === 0;
          },
          onClick: () => {
            confirmBefore({
              title: intl
                .get('small.mallProtocolManagement.view.agreement.terminate')
                .d('协议终止'),
              type: 'warning',
              message: intl
                .get('sagm.common.view.confirm.terminateInfo')
                .d('此操作会下架该协议内商品，请谨慎操作'),
              field: {
                reasonName: 'remark',
                reasonLabel: intl.get('sagm.common.view.confirm.terminateReason').d('终止原因'),
              },
              customizeForm,
              customizeCode: 'SAGM.WORKBENCH.LINE.UPGRADE_OR_TERMINATE.FORM',
              customFunc: (paramData) => handleCommonBachEvent(terminateAgreement, paramData),
            });
          },
          text: intl.get('sagm.common.view.button.batchTerminate').d('批量终止'),
        },
      },
      // 注意 审批 和发布的权限路径， 主页和详情页都有
      {
        name: 'batchPublish',
        show: tabKey === 'approved',
        btnComp: ObserverBtn,
        btnProps: {
          icon: 'publish2',
          dataSet: currentDs,
          getDisable: (data = []) => {
            return data.length === 0;
          },
          onClick: () => handleCommonBachEvent(agreementPublish),
          text: intl.get('sagm.common.view.button.batchPublish').d('批量发布'),
          permission: true,
          permissionList: [
            {
              code: `${_path}.button.operate.publish`,
              type: 'button',
              meaning: '协议工作台 -发布',
            },
          ],
        },
      },
      {
        name: 'addSku',
        show: tabKey === 'protocol_detail',
        btnComp: ObserverBtn,
        btnProps: {
          icon: 'add',
          dataSet: currentDs,
          getDisable: (data = []) => {
            return data.length === 0;
          },
          permission: true.valueOf,
          permissionList: [
            {
              code: `sagm-protocol-workbench.button.skuNumber`,
              type: 'button',
              meaning: '商城协议工作台-协议商品数量',
            },
          ],
          onClick: createSku,
          text: intl.get('sagm.common.view.button.addSku').d('新增商品'),
        },
      },
      {
        name: 'batchDelete',
        show: tabKey === 'product_detail',
        btnComp: ObserverBtn,
        btnProps: {
          icon: 'delete_sweep',
          dataSet: currentDs,
          getDisable: (data = []) => {
            return currentDs.status !== 'ready' || data.length === 0;
          },
          permission: true,
          permissionList: [
            {
              code: `sagm-protocol-workbench.button.skuNumber`,
              type: 'button',
              meaning: '商城协议工作台-协议商品数量',
            },
          ],
          onClick: () => handleDeleteSku(currentDs.selected),
          text: intl.get('sagm.common.view.button.batchRemove').d('批量移除'),
        },
      },
      {
        name: 'exportLineNew',
        show: tabKey === 'protocol_detail',
        btnComp: ExcelExportPro,
        observerBtnProps: () => ({
          templateCode: 'SMAL_AGREEMENT_LINE_EXPORT',
          method: 'POST',
          allBody: true,
          requestUrl: `/sagm/v1/${getCurrentOrganizationId()}/agreement-lines/export/new`,
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            permissionList: [
              {
                code: `${path}.button.line-export-new`,
                type: 'button',
                meaning: '商城协议工作台-（新）协议明细导出',
              },
            ],
          },
          queryParams: () =>
            getC7NExportQueryParams(currentDs, 'agreementLineId', getQueryParams, {
              exportIdsName: 'exportIds',
            }),
          buttonText:
            currentDs.selected.length > 0
              ? intl.get('smpc.product.button.selectBatchExportNew').d('勾选导出')
              : intl.get('sagm.common.button.batchExportNew').d('导出'),
          exportAsync: true,
        }),
      },
      {
        name: 'exportSkuNew',
        show: tabKey === 'product_detail',
        btnComp: ExcelExportPro,
        observerBtnProps: () => ({
          method: 'POST',
          allBody: true,
          templateCode: uomFlag ? 'SAGM_AGREEMENT_SKU_UOM_EXPORT' : 'SAGM_AGREEMENT_SKU_EXPORT',
          requestUrl: `/sagm/v1/${getCurrentOrganizationId()}/agreement-details/export/new${
            uomFlag ? '/sku-uom' : ''
          }`,
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            permissionList: [
              {
                code: `${path}.button.sku-export-new`,
                type: 'button',
                meaning: '商城协议工作台-（新）商品导出',
              },
            ],
          },
          queryParams: () =>
            getC7NExportQueryParams(currentDs, 'agreementDetailId', getQueryParams, {
              exportIdsName: 'exportIds',
            }),
          buttonText:
            currentDs.selected.length > 0
              ? intl.get('smpc.product.button.selectBatchExportNew').d('勾选导出')
              : intl.get('sagm.common.button.batchExportNew').d('导出'),
          exportAsync: true,
        }),
      },
      {
        name: 'export',
        show: ['protocol_detail', 'product_detail'].includes(tabKey),
        btnComp: ExcelExport,
        btnProps: {
          requestUrl:
            tabKey === 'protocol_detail'
              ? `/sagm/v1/${getCurrentOrganizationId()}/agreement-lines/export`
              : `/sagm/v1/${getCurrentOrganizationId()}/agreement-details/export${
                  uomFlag ? '/sku-uom' : ''
                }`,
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
          },
          queryParams: getQueryParams,
          buttonText: intl.get('sagm.common.button.batchExport').d('批量导出'),
          exportAsync: true,
        },
      },
      {
        name: 'priceLibExport',
        btnComp: priceLibExport,
      },
    ].filter((f) => f.show !== false);
  }, [tabKey, currentDs, uomFlag, currentDs?.selected?.length]);

  return (
    <Fragment>
      <Header title={intl.get('small.common.view.mallProtocolWorkbench').d('商城协议工作台')}>
        {customizeBtnGroup(
          {
            code: protManageBtns.workbenchTop,
            // 新版按钮组个性化（必须）
            pro: true,
          },
          <DynamicButtons buttons={customizeButtons} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </Header>
      <Content>
        <Tabs
          activeKey={tabKey}
          onChange={onTabChange}
          defaultChangeable={false}
          customizedCode="SAGM.PROTOCOL_MANAGEMENT_WORKBENCH_HEADER.TABS"
        >
          {groupList.map((group) => (
            <TabGroup tab={group.tab} key={group.key} defaultActiveKey={groupDefaultKey[group.key]}>
              {tabList
                .filter((tab) => tab.groupKey === group.key)
                .map((m) => {
                  const { key, tab, dataSet, searchBarCode, customizeUnitCode } = m;
                  return (
                    <TabPane key={key} tab={tab} count={tabsCount[key]}>
                      <div style={{ height: 'calc(100vh - 260px)' }}>
                        <SearchBarSubTable
                          customizeTable={customizeTable}
                          customizeUnitCode={customizeUnitCode}
                          dataSet={dataSet}
                          searchBarCode={searchBarCode}
                          componentKey={key}
                          uomFlag={uomFlag}
                          // onDeleteSku={handleDeleteSku}
                          skuApprove={skuApprove}
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
  withCustomize({
    unitCode: [
      ...getTabs('customizeCode'),
      protManageBtns.workbenchTop,
      'SAGM.WORKBENCH.LINE.UPGRADE_OR_TERMINATE.FORM',
    ],
  }),
  formatterCollections({
    code: [
      'small.common',
      'hzero.common',
      'sagm.protocolManagement',
      'sagm.common',
      'small.mallProtocolManagement',
      'smpc.product',
    ],
  }),
  getWithProps
)(observer(ProtocolWorkbench));
