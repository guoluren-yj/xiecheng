import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import { Button, Table, Modal, DataSet } from 'choerodon-ui/pro';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import { SRM_DATA_SDAT } from '@/utils/config';

const tenantId = getCurrentOrganizationId();

export default function DynamicTable(props) {
  const {
    // remote,
    localId,
    dataSet,
    dynamicType,
    typeSupplierListDS,
    accountListDS,
    expectSupplierCategoryIds = [],
  } = props;

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
                  selectable: (record) => record.get('checkFlag'),
                },
              },
              events: {
                select: ({ dataSet: ds, record }) => {
                  // 仅多选时处理联动
                  const parentCategoryId = record.get('parentCategoryId');
                  if (parentCategoryId) {
                    const parentRecord = ds.find(
                      (rec) => rec.get('categoryId') === parentCategoryId
                    );
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

  const buttons = () => {
    return [
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
      <ExcelExportPro
        otherButtonProps={{
          icon: 'unarchive',
          type: 'c7n-pro',
          funcType: 'flat',
        }}
        defaultSelectAll
        requestUrl={`${SRM_DATA_SDAT}/v1/${tenantId}/wb2-risk-plans/scan-object-export`}
        queryParams={{
          riskPlanId: localId,
          scanObjectType: dynamicType,
        }}
        buttonText={intl.get('hzero.common.button.confirm.export').d('导出')}
      />,
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
