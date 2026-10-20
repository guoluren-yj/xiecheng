import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Button, Table, Modal, Lov, DataSet } from 'choerodon-ui/pro';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';

import { fetchRemoveObjectList } from '@/services/riskScanConfig/monitorConfigService';

import AddOuterModal from '../AddOuterModal';

const tenantId = getCurrentOrganizationId();
let selectOuterList = [];

export default function DynamicTable(props) {
  const {
    localId,
    pageType,
    dataSet,
    dynamicType,
    typeSupplierListDS,
    selectHandListDS,
    accountListDS,
    expectSupplierCategoryIds = [],
    monitorWorkbench = {},
    onGetDetailData = () => {},
    getCategoryList = () => {},
    onCallBackToSave = () => {},
  } = props;

  const { monitorConfigDetail = {} } = monitorWorkbench || {};

  const supplierSelectDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'categoryObj',
            type: 'object',
            lovCode: 'SSLM.SUPPLIER_CATEGORY_PAGE',
            multiple: true,
            noCache: true,
            lovPara: {
              tenantId,
              enabledFlag: 1,
              parentCategoryId: 0,
              expectSupplierCategoryIds,
            },
            lovQueryAxiosConfig: () => {
              return {
                url: `/sslm/v1/${getCurrentOrganizationId()}/supplier-categorys/tree-c7n-post`,
                method: 'POST',
              };
            },
            textField: 'categoryDescription',
            optionsProps: {
              paging: 'server',
              idField: 'categoryId',
              parentIdField: 'parentCategoryId',
              record: {
                dynamicProps: {
                  selectable: record => record.get('checkFlag'),
                },
              },
              events: {
                select: ({ dataSet: ds, record }) => {
                  // 仅多选时处理联动
                  const parentCategoryId = record.get('parentCategoryId');
                  if (parentCategoryId) {
                    const parentRecord = ds.find(rec => rec.get('categoryId') === parentCategoryId);
                    if (parentRecord) {
                      ds.select(parentRecord);
                    }
                  }
                },
              },
            },
            transformResponse: (value, data) => {
              const { categoryList } = data;
              if (!isEmpty(categoryList)) {
                return categoryList;
              } else {
                return value;
              }
            },
          },
          {
            name: 'categoryIdList',
            bind: 'categoryObj.categoryId',
          },
          {
            name: 'expectSupplierCategoryIds',
          },
        ],
      }),
    []
  );

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (dataSet) {
      dataSet.addEventListener('select', selectEvent);
      dataSet.addEventListener('unSelect', selectEvent);
      dataSet.addEventListener('selectAll', selectEvent);
      dataSet.addEventListener('unSelectAll', selectEvent);
    }

    return () => {
      if (dataSet) {
        dataSet.data = [];
        dataSet.reset();
        dataSet.removeEventListener('select', selectEvent);
        dataSet.removeEventListener('unSelect', selectEvent);
        dataSet.removeEventListener('selectAll', selectEvent);
        dataSet.removeEventListener('unSelectAll', selectEvent);
      }
      selectOuterList = [];
    };
  }, [dataSet]);

  useEffect(() => {
    if (
      expectSupplierCategoryIds &&
      expectSupplierCategoryIds.length > 0 &&
      supplierSelectDs.current
    ) {
      const categoryObjField = supplierSelectDs.getField('categoryObj');
      categoryObjField.setLovPara('expectSupplierCategoryIds', expectSupplierCategoryIds);
    }
  }, [expectSupplierCategoryIds]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const selectEvent = () => {
    setRefresh(true);
  };

  const typeColumns = () => {
    return [
      ['SUPPLIER_CATEGORY'].includes(dynamicType) && { name: 'categoryCode' },
      ['SUPPLIER_CATEGORY'].includes(dynamicType) && { name: 'categoryName' },
      ['COOP_SUPPLIER', 'MANUAL_SUPPLIER'].includes(dynamicType) && { name: 'supplierCode' },
      ['COOP_SUPPLIER', 'MANUAL_SUPPLIER'].includes(dynamicType) && { name: 'supplierName' },
      ['PURCHASER'].includes(dynamicType) && { name: 'accountCode' },
      ['PURCHASER'].includes(dynamicType) && { name: 'name' },
      ['PLATFORM_OUTER'].includes(dynamicType) && { name: 'companyName' },
      ['PLATFORM_OUTER', 'COOP_SUPPLIER', 'MANUAL_SUPPLIER'].includes(dynamicType) && {
        name: 'socialCode',
      },
    ].filter(Boolean);
  };

  const modalColumns = () => {
    return [
      ['SUPPLIER_CATEGORY'].includes(dynamicType) && { name: 'supplierCategoryCode' },
      ['SUPPLIER_CATEGORY'].includes(dynamicType) && { name: 'supplierCategoryDescription' },
      ['PURCHASER'].includes(dynamicType) && { name: 'purchaser' },
      { name: 'supplierCompanyNum' },
      { name: 'supplierCompanyName' },
      { name: 'unifiedSocialCode' },
    ].filter(Boolean);
  };

  /**
   * 查看供应商
   */
  const handleViewSupplier = () => {
    let modal = null;

    const handleCloseModal = () => {
      typeSupplierListDS.loadData([]);
      typeSupplierListDS.reset();
      modal.close();
    };
    const handleFilterQueryAll = ({ params }) => {
      typeSupplierListDS.queryDataSet.data = [
        {
          ...params,
          riskPlanId: localId,
        },
      ];
      typeSupplierListDS.query();
    };

    modal = Modal.open({
      title: intl.get('sdat.riskScanConfig.button.viewSupplier').d('查看供应商'),
      key: 'viewPurchaser',
      children: (
        <>
          <FilterBar
            dataSet={[typeSupplierListDS]}
            cacheState
            cacheKey="SDAT.RISK_SCAN_CONFIG_VIEW_TREE_SUPPLIER_LIST"
            onQuery={handleFilterQueryAll}
            // defaultSortedField="creationTime"
            // defaultSortedOrder="desc"
            fields={[
              {
                name: 'companyName',
                type: 'string',
                label: intl.get('sdat.riskScanConfig.model.companyName').d('供应商名称'),
                display: false,
                merge: true,
              },
              {
                name: 'supplierTypeName',
                type: 'string',
                label: intl.get(`sdat.riskScanConfig.model.supplierTypeName`).d('供应商分类名称'),
                display: true,
                lock: true,
              },
              // {
              //   name: 'creationTime',
              //   sortFlag: true,
              //   visible: false,
              // },
            ]}
          />
          <div style={{ height: 'calc(100vh - 210px)' }}>
            <Table
              dataSet={typeSupplierListDS}
              columns={modalColumns()}
              queryBar="none"
              autoHeight={{ type: 'maxHeight', diff: 40 }}
            />
          </div>
        </>
      ),
      closable: true,
      drawer: true,
      mask: true,
      destroyOnClose: true,
      style: { width: '1000px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * 批量删除供应商分类
   */
  const batchDeleteTypeList = () => {
    if (dataSet.selected.length) {
      const list = dataSet.selected
        ?.filter(rcd => rcd.get('planObjectId'))
        ?.map(rcd => rcd.toData());
      const localList = dataSet.selected?.filter(rcd => !rcd.get('planObjectId'));

      if (localList && localList.length) {
        dataSet.delete(localList, false);
      }

      if (list && list.length) {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm').d('提示'),
          children: (
            <div>
              {intl
                .get('sdat.riskScanConfig.view.message.deleteCompanyConfirm')
                .d('是否确认删除所选公司列表')}
            </div>
          ),
        }).then(button => {
          if (button === 'ok') {
            fetchRemoveObjectList({
              ...monitorConfigDetail,
              wb2RiskPlanObjectList: [...list],
            }).then(res => {
              if (getResponse(res)) {
                dataSet.loadData([]);
                notification.success();
                onGetDetailData(localId);
                if (dynamicType === 'SUPPLIER_CATEGORY') {
                  getCategoryList();
                }
              }
            });
          }
        });
      }
    }
  };

  const selectHandColumns = () => {
    return [
      { name: 'supplierCompanyNum' },
      { name: 'supplierCompanyName' },
      { name: 'unifiedSocialCode' },
    ];
  };

  /**
   * 手动添加供应商
   */
  const handleCreateHandItem = () => {
    let modal = null;

    // selectHandListDS.setQueryParameter('userId', getCurrentUser().id);
    // selectHandListDS.setQueryParameter('tenantId', getCurrentOrganizationId());
    // selectHandListDS.setQueryParameter('useTenant', getCurrentOrganizationId());
    // selectHandListDS.setQueryParameter('tenant', getCurrentOrganizationId());
    selectHandListDS.query();

    const handleCloseModal = () => {
      selectHandListDS.loadData([]);
      selectHandListDS.reset();
      selectHandListDS.clearCachedSelected();
      modal.close();
    };

    const handleOk = () => {
      const list = selectHandListDS?.selected ?? [];
      if (list.length) {
        list.forEach(record => {
          dataSet.create(
            {
              supplierCode: record?.get('supplierCompanyNum') ?? '',
              supplierName: record?.get('supplierCompanyName') ?? '',
              socialCode: record?.get('unifiedSocialCode') ?? '',
              scanObjectId: record?.get('supplierCompanyId') ?? '',
              tenantId: getCurrentOrganizationId(),
              companyName: record?.get('supplierCompanyName') ?? '',
            },
            0
          );
        });
        handleCloseModal();
        onCallBackToSave();
      } else {
        notification.warning({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl
            .get('sdat.riskScanConfig.view.message.mustSelectOneOrMoreSupplier')
            .d('请至少选择一个供应商'),
        });
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.riskScanConfig.view.title.handAddSupplier').d('手动添加供应商'),
      key: 'handAddSupplier',
      children: (
        <div style={{ height: 'calc(100vh - 160px)' }}>
          <Table
            dataSet={selectHandListDS}
            columns={selectHandColumns()}
            autoHeight={{ type: 'maxHeight', diff: 40 }}
          />
        </div>
      ),
      closable: true,
      drawer: true,
      mask: false,
      destroyOnClose: true,
      style: { width: '1000px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleOk}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const handleCreateAccount = () => {};

  const handleSelectOuterList = (list = []) => {
    selectOuterList = list || [];
  };

  /**
   * 添加平台外企业
   */
  const handleAddOuterCompany = () => {
    let modal = null;

    const handleOk = () => {
      if (selectOuterList.length) {
        selectOuterList.forEach(record => {
          dataSet.create(
            {
              companyName: record.name ?? '',
              socialCode: record.creditCode ?? '',
            },
            0
          );
        });
        modal.close();
        onCallBackToSave();
      } else {
        notification.warning({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl
            .get('sdat.riskScanConfig.view.message.mustSelectOneOuterCompany')
            .d('请至少选择一个企业'),
        });
      }
    };

    const handleCloseModal = () => {
      modal.close();
    };

    modal = Modal.open({
      title: intl.get('sdat.riskScanConfig.view.title.addOuterCompany').d('平台外企业'),
      key: 'addOuterCompany',
      children: <AddOuterModal localId={localId} onSelectList={handleSelectOuterList} />,
      closable: true,
      drawer: true,
      mask: false,
      destroyOnClose: true,
      style: { width: '1000px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleOk}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const handleViewAccount = () => {
    let modal = null;

    const handleCloseModal = () => {
      accountListDS.loadData([]);
      accountListDS.reset();
      modal.close();
    };
    const handleFilterQueryAll = ({ params }) => {
      accountListDS.queryDataSet.data = [
        {
          ...params,
        },
      ];
      accountListDS.query();
    };

    modal = Modal.open({
      title: intl.get('sdat.riskScanConfig.button.viewSupplier').d('查看供应商'),
      key: 'viewSupplier',
      children: (
        <>
          <FilterBar
            dataSet={[accountListDS]}
            cacheState
            cacheKey="SDAT.RISK_SCAN_CONFIG_VIEW_PURCHASER_LIST"
            onQuery={handleFilterQueryAll}
            defaultSortedField="creationTime"
            defaultSortedOrder="desc"
            fields={[
              {
                name: 'companyName',
                type: 'string',
                label: intl.get('sdat.riskScanConfig.model.companyName').d('供应商名称'),
                display: false,
                merge: true,
              },
              {
                name: 'purchaser',
                type: 'string',
                label: intl.get(`sdat.riskScanConfig.model.purchaser`).d('采购员'),
                display: true,
                lock: true,
              },
              {
                name: 'creationTime',
                sortFlag: true,
                visible: false,
              },
            ]}
          />
          <Table dataSet={accountListDS} columns={modalColumns()} queryBar="none" />
        </>
      ),
      closable: true,
      drawer: true,
      mask: false,
      destroyOnClose: true,
      style: { width: '1000px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  const handleSelectSupplier = list => {
    if (list.length) {
      list.forEach(record => {
        dataSet.create(
          {
            categoryCode: record?.get('categoryCode') ?? '',
            categoryName: record?.get('categoryDescription') ?? '',
            scanObjectId: record?.get('categoryId') ?? '',
          },
          0
        );
      });

      onCallBackToSave();
    } else {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl
          .get('sdat.riskScanConfig.view.message.mustSelectOneOrMoreSupplier')
          .d('请至少选择一个供应商'),
      });
    }
  };

  const buttons = () => {
    return pageType === 'view'
      ? [
          dynamicType === 'SUPPLIER_CATEGORY' && (
            <Button funcType="flat" icon="assignment_ind-o" onClick={handleViewSupplier}>
              {intl.get('sdat.riskScanConfig.button.viewSupplier').d('查看供应商')}
            </Button>
          ),
          dynamicType === 'PURCHASER' && (
            <Button funcType="flat" onClick={handleViewAccount}>
              {intl.get('sdat.riskScanConfig.button.viewSupplier').d('查看供应商')}
            </Button>
          ),
        ]
      : [
          dynamicType === 'SUPPLIER_CATEGORY' && (
            <Lov
              dataSet={supplierSelectDs}
              name="categoryObj"
              mode="button"
              disabled={pageType === 'view'}
              clearButton={false}
              key="create"
              icon="playlist_add"
              searchFieldInPopup
              tableProps={{
                // mode: 'tree',
                treeAsync: true,
                alwaysShowRowBox: true,
                selectionMode: 'rowbox',
                onRow: ({ record: tableRecord }) => {
                  const nodeProps = { disabled: false };
                  if (tableRecord.get('hasChild') === 0) {
                    nodeProps.isLeaf = true;
                  }
                  return nodeProps;
                },
              }}
              modalProps={{
                destroyOnClose: true,
                afterClose: () => {
                  supplierSelectDs.loadData([]);
                  supplierSelectDs.clearCachedSelected();
                  supplierSelectDs.reset();
                },
              }}
              onBeforeSelect={handleSelectSupplier}
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </Lov>
          ),
          dynamicType === 'SUPPLIER_CATEGORY' && (
            <Button
              funcType="flat"
              icon="delete_sweep"
              disabled={pageType === 'view' || !dataSet?.selected?.length}
              onClick={batchDeleteTypeList}
            >
              {intl.get('hzero.common.button.batchDelete').d('批量删除')}
            </Button>
          ),
          dynamicType === 'SUPPLIER_CATEGORY' && (
            <Button funcType="flat" icon="assignment_ind-o" onClick={handleViewSupplier}>
              {intl.get('sdat.riskScanConfig.button.viewSupplier').d('查看供应商')}
            </Button>
          ),

          dynamicType === 'MANUAL_SUPPLIER' && (
            <Button
              icon="add"
              funcType="flat"
              disabled={pageType === 'view'}
              onClick={handleCreateHandItem}
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
          ),
          dynamicType === 'MANUAL_SUPPLIER' && (
            <Button
              funcType="flat"
              icon="delete_sweep"
              disabled={pageType === 'view' || !dataSet?.selected?.length}
              onClick={batchDeleteTypeList}
            >
              {intl.get('hzero.common.button.batchDelete').d('批量删除')}
            </Button>
          ),

          dynamicType === 'PURCHASER' && (
            <Button
              icon="add"
              funcType="flat"
              disabled={pageType === 'view'}
              onClick={handleCreateAccount}
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
          ),
          dynamicType === 'PURCHASER' && (
            <Button
              funcType="flat"
              icon="delete_sweep"
              disabled={pageType === 'view' || !dataSet?.selected?.length}
              onClick={batchDeleteTypeList}
            >
              {intl.get('hzero.common.button.batchDelete').d('批量删除')}
            </Button>
          ),
          dynamicType === 'PURCHASER' && (
            <Button funcType="flat" onClick={handleViewAccount}>
              {intl.get('sdat.riskScanConfig.button.viewSupplier').d('查看供应商')}
            </Button>
          ),

          dynamicType === 'PLATFORM_OUTER' && (
            <Button
              icon="add"
              funcType="flat"
              disabled={pageType === 'view'}
              onClick={handleAddOuterCompany}
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
          ),
          dynamicType === 'PLATFORM_OUTER' && (
            <Button
              funcType="flat"
              icon="delete_sweep"
              disabled={pageType === 'view' || !dataSet?.selected?.length}
              onClick={batchDeleteTypeList}
            >
              {intl.get('hzero.common.button.batchDelete').d('批量删除')}
            </Button>
          ),
        ];
  };

  return (
    <div style={{ height: 'calc(100vh - 400px)' }}>
      {dynamicType ? (
        <Table
          dataSet={dataSet}
          queryBar="none"
          buttons={buttons()}
          columns={typeColumns()}
          autoHeight={{ type: 'maxHeight', diff: 40 }}
        />
      ) : null}
    </div>
  );
}
