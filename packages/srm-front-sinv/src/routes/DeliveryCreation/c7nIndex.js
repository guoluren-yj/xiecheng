import React, { Fragment, useMemo, useEffect, useState, useCallback } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { compose, isEmpty, isNil } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import {
  batchCreateDelivery,
  // fetchBusinessRule,
  submitDelivery,
  batchDeleteDelivery,
} from '@/services/deliveryCreationService';
import {
  getResponse,
  getCurrentOrganizationId,
  getUserOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import notification from 'utils/notification';
import CommonImport from 'hzero-front/lib/components/Import';
import { SRM_SPUC } from '_utils/config';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import Creation from './NewCreation/index';
import Maintenance from './NewMaintenance/index';
import { creationDataSet } from './NewCreation/indexDS';
import { maintenanceDataSet } from './NewMaintenance/indexDS';
import OperationRecord from './NewMaintenance/Operation/OperationRecord';

const { TabPane } = Tabs;

const tenantId = getCurrentOrganizationId();

const supplierTenantId = getUserOrganizationId();

let createSearchBarRef = null;

const C7NIndex = (props) => {
  const { history, customizeTable, customizeBtnGroup, planList, useFlag } = props;

  const [listState, useListState] = useState({
    tabkey: 'deliveryCreationTab',
    loading: false,
  });

  const createDs = useMemo(
    () => new DataSet(creationDataSet({ planFlag: planList.planTypeFlag })),
    [planList.planTypeFlag]
  );

  const maintenanceDs = useMemo(() => new DataSet(maintenanceDataSet()), []);

  // useEffect(() => {
  //   fetchBusinessInit();
  // }, []);

  useEffect(() => {
    queryList();
  }, []);
  // }, [planList.planTypeFlag]);

  // 查询条件
  const queryList = useCallback(
    (queryParams) => {
      if (listState.tabkey === 'deliveryCreationTab') {
        createDs.setQueryParameter('params', {
          ...queryParams,
          planFlag: planList.planTypeFlag,
          customizeUnitCode: +planList.planTypeFlag
            ? 'SINV.DELIVERY_CREATION.LIST_BY_PLAN,SINV.DELIVERY_CREATION.NEW_FILTER'
            : 'SINV.DELIVERY_CREATION.LIST,SINV.DELIVERY_CREATION.NEW_FILTER',
        });
        createDs.query();
      } else {
        maintenanceDs.setQueryParameter('params', {
          customizeUnitCode:
            'SINV.DELIVERY_CREATION.LIST_BY_MAINTAIN,SINV.DELIVERY_CREATION.NEW_FILTER_BY_MAINTAI',
        });
        maintenanceDs.query();
      }
    },
    [listState.tabkey, planList.planTypeFlag]
  );

  const tabChange = (key) => {
    if (key === 'deliveryCreationTab') {
      createDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
      createDs.unSelectAll(); // 初始化时清除缓存的勾选记录
    } else {
      maintenanceDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
      maintenanceDs.unSelectAll(); // 初始化时清除缓存的勾选记录
    }
    useListState({ ...listState, tabkey: key });
    createSearchBarRef.handleQuery(true);
  };

  /**
   * createDelivery - 创建送货单
   */
  const createDelivery = async () => {
    useListState({ ...listState, loading: true });
    const data = createDs?.selected.map((item) => item.toJSONData());
    const a = await batchCreateDelivery(data);
    const res = getResponse(a);
    if (getResponse(res)) {
      if (res?.length === 1) {
        const asnHeaderId = res.map((n) => n.asnHeaderId);
        // 前端判空/未定义
        if (!isNil(asnHeaderId)) {
          notification.success();
          useListState({ ...listState, loading: false });
          history.push({ pathname: `/sinv/delivery-creation/newDetail/${asnHeaderId}` });
        }
      } else if (res?.length > 1) {
        notification.success();
        useListState({ ...listState, loading: false });
        history.push({ pathname: `/sinv/delivery-creation/newDetailTable` });
      }
    } else {
      useListState({ ...listState, loading: false });
    }
  };

  // 按计划送货切换
  const selectedChange = (key) => {
    createDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
    createDs.unSelectAll(); // 初始化时清除缓存的勾选记录
    useFlag({
      ...planList,
      planTypeFlag: key,
    });
    createSearchBarRef.handleQuery(true);
  };

  /**
   * submitDelivery - 批量提交送货单
   */
  const batchSubmitDeliverys = (dataSet) => {
    const data = dataSet?.selected?.map((item) => item.toJSONData());
    Modal.confirm({
      title: intl.get(`sinv.common.model.common.confirmSubmit`).d('是否确认提交送货单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        const res = await submitDelivery({ data });
        if (getResponse(res)) {
          notification.success();
          dataSet.clearCachedSelected(); // 初始化时清除缓存的勾选记录
          dataSet.unSelectAll(); // 初始化时清除缓存的勾选记录
          dataSet.query();
        }
      },
    });
  };

  // 删除
  const batchDeleteDeliverys = (dataSet) => {
    const data = dataSet?.selected?.map((item) => item.toJSONData());
    Modal.confirm({
      title: intl.get(`sinv.common.model.common.confirmDelete`).d('是否确认删除送货单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        const res = await batchDeleteDelivery(data);
        if (getResponse(res)) {
          notification.success();
          dataSet.clearCachedSelected(); // 初始化时清除缓存的勾选记录
          dataSet.unSelectAll(); // 初始化时清除缓存的勾选记录
          dataSet.query();
        }
      },
    });
  };

  // 跳转明细
  const detailChange = (record) => {
    const id = record.get('asnHeaderId');
    // 前端判空/未定义
    if (!isNil(id)) {
      history.push({ pathname: `/sinv/delivery-creation/newDetail/${id}` });
    }
  };

  const operationChange = (record) => {
    const listProps = { asnHeaderId: record.get('asnHeaderId') };
    Modal.open({
      title: intl.get(`sinv.common.model.common.operationRecord`).d('操作记录'),
      drawer: true,
      size: 'large',
      closable: true,
      children: <OperationRecord {...listProps} />,
      footer: false,
    });
  };

  const searchBarTableRef = (ref) => {
    createSearchBarRef = ref;
  };

  // 按钮
  const HeaderBtns = observer(({ dataSet }) => {
    const creationQueryParams = filterNullValueObject({
      ...dataSet?.queryParameter.params,
      ...dataSet.queryDataSet?.toData()[0],
    });

    const planIdList = (
      dataSet?.selected.map((item) => item.toJSONData()).filter((n) => n.planId) || []
    )
      .map((n) => n.planId)
      .join();

    const templateCode =
      planList.planTypeFlag === '1' ? 'ASN.PLAN_NEW_BATCH_IMPORT' : 'ASN.BATCH_NEW_IMPORT';
    const buttons = {
      create: [
        {
          name: 'create',
          child: intl.get(`sinv.deliveryCreation.view.button.createDelivery`).d('创建送货单'),
          btnType: 'c7n-pro',
          btnProps: {
            color: 'primary',
            icon: 'check',
            disabled: isEmpty(dataSet?.selected),
            onClick: () => createDelivery(),
            loading: listState.loading,
          },
        },
        {
          name: 'new-export',
          group: true,
          child: (
            <ExcelExportPro
              buttonText={
                isEmpty(dataSet?.selected)
                  ? intl.get('sinv.deliveryCreation.view.button.newExport').d('新版导出')
                  : intl.get(`sinv.purchaserDelivery.view.button.newCheckExport`).d('新版勾选导出')
              }
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                funcType: 'flat',
                permissionList: [
                  {
                    code:
                      'srm.logistics.delivery.delivery-creation.ps.button.deliverycreation.newexport',
                    type: 'c7n-pro',
                  },
                ],
              }}
              requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-location/purchaser/can-create-asn/export-new`}
              queryParams={
                isEmpty(dataSet?.selected)
                  ? {
                      ...creationQueryParams,
                      supplierTenantId,
                    }
                  : {
                      planIdList,
                      supplierTenantId,
                      planFlag: isNaN(creationQueryParams.planFlag)
                        ? '0'
                        : creationQueryParams.planFlag,
                      poLineLocationIds: dataSet?.selected
                        .map((item) => item.toJSONData())
                        .map((n) => n.poLineLocationId),
                    }
              }
              templateCode="SPUC_SINV_ASN_HEADER_CREATE_EXPORT"
            />
          ),
        },
        {
          name: 'new-import',
          group: true,
          child: (
            <CommonImport
              businessObjectTemplateCode={templateCode}
              prefixPatch={SRM_SPUC}
              refreshButton
              buttonText={intl.get(`sinv.deliveryCreation.view.button.newImport`).d('新版导入')}
              args={{
                tenantId,
                templateCode,
              }}
              buttonProps={{
                icon: 'archive',
                type: 'c7n-pro',
                funcType: 'flat',
                permissionList: [
                  {
                    code: `srm.logistics.delivery.delivery-creation.ps.button.newimport`,
                    type: 'button',
                    meaning: '批量导入-新',
                  },
                ],
              }}
            />
          ),
        },
      ],
      maintenance: [
        {
          name: 'submit',
          child: intl.get(`hzero.common.button.submit`).d('提交'),
          btnType: 'c7n-pro',
          btnProps: {
            color: 'primary',
            icon: 'check',
            type: 'c7n-pro',
            disabled: isEmpty(dataSet?.selected),
            onClick: () => batchSubmitDeliverys(dataSet),
          },
        },
        {
          name: 'delete',
          child: intl.get(`hzero.common.button.delete`).d('删除'),
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'delete',
            type: 'c7n-pro',
            funcType: 'flat',
            disabled: isEmpty(dataSet?.selected),
            onClick: () => batchDeleteDeliverys(dataSet),
          },
        },
        {
          name: 'new-export',
          group: true,
          child: (
            <ExcelExportPro
              buttonText={
                isEmpty(dataSet?.selected)
                  ? intl.get('sinv.purchaserDelivery.view.button.newExport').d('新版导出')
                  : intl.get(`sinv.purchaserDelivery.view.button.newCheckExport`).d('新版勾选导出')
              }
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                funcType: 'flat',
                permissionList: [
                  {
                    code: 'srm.logistics.delivery.delivery-creation.ps.button.maintain.newexport',
                    type: 'c7n-pro',
                    funcType: 'flat',
                  },
                ],
              }}
              requestUrl={`${SRM_SPUC}/v1/${tenantId}/asn-header/for-supplier/maintain/export`}
              queryParams={
                isEmpty(dataSet?.selected)
                  ? {
                      ...creationQueryParams,
                      supplierTenantId,
                    }
                  : {
                      ...creationQueryParams,
                      supplierTenantId,
                      asnHeaderIds: dataSet?.selected
                        .map((item) => item.toJSONData())
                        .map((n) => n.asnHeaderId),
                    }
              }
              templateCode="SPUC_SINV_ASN_HEADER_MAINTAIN_EXPORT"
            />
          ),
        },
      ],
    };
    if (listState.tabkey === 'deliveryCreationTab') {
      return customizeBtnGroup(
        {
          code: `SINV.DELIVERY_NEW_CREATION.BUTTONS.CREATION`,
          pro: true,
        },
        <DynamicButtons buttons={buttons.create} />
      );
    } else {
      return customizeBtnGroup(
        {
          code: `SINV.DELIVERY_NEW_CREATION.BUTTONS.MAINTENANCE`,
          pro: true,
        },
        <DynamicButtons buttons={buttons.maintenance} />
      );
    }
  });
  const createProps = {
    createDs,
    customizeTable,
    planTypeFlag: planList.planTypeFlag,
    ruleData: planList.ruleData,
    selectedChange,
    searchBarTableRef,
    queryList,
  };
  const maintenanceProps = {
    maintenanceDs,
    customizeTable,
    detailChange,
    operationChange,
  };
  return (
    <Fragment>
      <Header title={intl.get(`sinv.deliveryCreation.view.title.deliveryCreation`).d('送货单创建')}>
        <HeaderBtns
          dataSet={listState.tabkey === 'deliveryCreationTab' ? createDs : maintenanceDs}
        />
      </Header>
      <Content>
        <Tabs defaultActiveKey={listState.tabkey} onChange={(key) => tabChange(key)}>
          <TabPane
            tab={intl.get(`sinv.deliveryCreation.view.title.deliveryCreationTab`).d('送货单创建')}
            key="deliveryCreationTab"
          >
            <Creation {...createProps} />
          </TabPane>
          <TabPane
            tab={intl
              .get(`sinv.deliveryCreation.view.title.deliveryMaintenanceTab`)
              .d('送货单维护')}
            key="deliveryMaintenanceTab"
          >
            <Maintenance {...maintenanceProps} />
          </TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default compose(
  WithCustomize({
    unitCode: [
      'SINV.DELIVERY_CREATION.LIST_BY_MAINTAIN',
      'SINV.DELIVERY_CREATION.FILTER_BY_MAINTAIN',
      'SINV.DELIVERY_CREATION.LIST',
      'SINV.DELIVERY_CREATION.FILTER',
      'SINV.DELIVERY_CREATION.LIST_BY_PLAN',
      'SINV.DELIVERY_CREATION.NEW_FILTER',
      'SINV.DELIVERY_CREATION.NEW_FILTER_BY_MAINTAIN',
      'SINV.DELIVERY_NEW_CREATION.BUTTONS.CREATION',
      'SINV.DELIVERY_NEW_CREATION.BUTTONS.MAINTENANCE',
      'sinv.receiptExecution',
    ],
  }),
  formatterCollections({
    code: [
      'sinv.deliveryCreation',
      'sinv.purchaserDelivery',
      'sinv.purchaseReception',
      'sinv.common',
      'entity.company',
      'entity.customer',
      'entity.item',
      'entity.organization',
    ],
  })
)(C7NIndex);
