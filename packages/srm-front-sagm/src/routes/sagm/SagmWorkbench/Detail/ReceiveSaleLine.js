import React, { memo, useMemo, useEffect } from 'react';
import { DataSet, Table, Button, Lov } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import ImportButton from 'components/Import';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import SearchBarTable from '_components/SearchBarTable';
import { precisionRender } from '@/utils/precision';
import getAgmLineDs from '../Stores/agmLineDs';
import { agmLineSellPriceColumn } from '../renderers';

const searchBarCode = 'SAGM.SALE_WORKBENCH.DETAIL.RECEIVE_AGM_LINE.SEARCH_BAR';

const DelButton = observer(({ dataSet, onClick }) => {
  return (
    <Button
      disabled={dataSet.selected.length < 1}
      onClick={onClick}
      icon="delete_sweep"
      funcType="flat"
      color="primary"
    >
      {intl.get('sagm.common.button.batchDelete').d('批量删除')}
    </Button>
  );
});

const SaveButton = observer(({ dataSet }) => {
  return (
    <Button
      icon="save"
      funcType="flat"
      color="primary"
      loading={dataSet.getState('saveLoading')}
      onClick={async () => {
        const res = await dataSet.submit();
        if (res) dataSet.query();
      }}
    >
      {intl.get('hzero.common.button.save').d('保存')}
    </Button>
  );
});

export default memo(function ReceiveSaleLine(props) {
  const {
    path,
    refresh,
    isDelete,
    readOnly,
    agmStatus,
    isPub,
    customizeTable,
    dataSet: propDataSet,
    agreementHeaderId,
    onDeleteCallback = (e) => e,
  } = props;
  const organizationId = useMemo(() => getCurrentOrganizationId(), []);

  const createDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      selection: 'multiple',
      fields: [
        {
          name: 'skuLov',
          type: 'object',
          lovCode: 'SMPC.PUR_SKU_URL',
          multiple: true,
          lovPara: {
            tenantId: organizationId,
            agreementHeaderId,
          },
          optionsProps: {
            record: {
              dynamicProps: {
                selectable: (record) => {
                  const { taxId, uomId, currencyId } = record.get(['taxId', 'uomId', 'currencyId']);
                  return taxId && uomId && currencyId;
                },
              },
            },
          },
        },
      ],
    });
  }, [agreementHeaderId]);

  const dataSet = useMemo(() => {
    return (
      propDataSet ||
      new DataSet(
        getAgmLineDs(
          {
            queryParams: {
              agreementHeaderId,
              customizeUnitCode: `${searchBarCode},SAGM.SALE_WORKBENCH.DETAIL_LINE.TABLE`,
            },
          },
          { autoQuery: false, paging: false, pageSize: 20 }
        )
      )
    );
  }, []);

  useEffect(() => {
    if (dataSet && agreementHeaderId) {
      dataSet.paging = true;
      dataSet.pageSize = 20;
      dataSet.setQueryParameter('customizeUnitCode', searchBarCode);
      dataSet.setQueryParameter('agreementHeaderId', agreementHeaderId);
      dataSet.query();
    }
  }, [refresh, agreementHeaderId, dataSet]);

  useEffect(() => {
    if (!agreementHeaderId || isDelete) {
      dataSet.selection = false;
    } else {
      dataSet.selection = 'multiple';
    }
  }, [agreementHeaderId, isDelete]);

  const getQueryParams = () => {
    const params =
      dataSet.queryDataSet && dataSet.queryDataSet.current && dataSet.queryDataSet.current.toData();
    return filterNullValueObject({
      agreementHeaderId,
      ...params,
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'skuLov',
        width: 180,
        editor: (record) =>
          record.get('agreementLineId') ? (
            false
          ) : (
            <Lov
              onBeforeSelect={(r) => {
                const { taxId, uomId, currencyId } = r.get(['taxId', 'uomId', 'currencyId']);
                if (taxId && uomId && currencyId) return true;
                notification.warning({
                  message: intl
                    .get('sagm.common.view.message.receiveLineAddSku')
                    .d('添加商品失败，失败原因是商品没有价格信息，请检查。'),
                });
                return false;
              }}
            />
          ),
      },
      { name: 'thirdSkuId', width: 140 },
      { name: 'skuName', minWidth: 180 },
      { name: 'supplierCompanyName', minWidth: 200 },
      { name: 'categoryName', width: 120 },
      { name: 'directoryName', width: 120 },
      { name: 'marketPrice', width: 90, renderer: precisionRender },
      agmLineSellPriceColumn(),
      { name: 'currencyName', width: 100 },
      { name: 'uomName', width: 80 },
      { name: 'taxRate', width: 80 },
      {
        name: 'creationDate',
        width: 120,
      },
    ],
    []
  );

  function handleDelete() {
    const addRecords = dataSet.selected.filter((f) => f.status === 'add');
    const updateRecords = dataSet.selected.filter((f) => f.status !== 'add');
    if (updateRecords.length > 0) {
      dataSet
        .delete(
          updateRecords,
          intl
            .get('sagm.common.view.title.deleteSaleAgmLine')
            .d(`删除销售协议行将移除领用限制中的商品`)
        )
        .then((res) => {
          if (res) {
            dataSet.remove(addRecords);
            onDeleteCallback();
          }
        });
    } else {
      dataSet.remove(addRecords);
    }
  }

  const buttons = useMemo(() => {
    return [
      // <Button
      //   icon="playlist_add"
      //   onClick={() => dataSet.create({ sellingPrice: 0, purchasePrice: 0, agreementHeaderId }, 0)}
      // >
      //   {intl.get('hzero.common.button.add').d('新增')}
      // </Button>,
      <Lov
        mode="button"
        dataSet={createDs}
        // 注意 name 与 个性化按钮组保持一致
        name="skuLov"
        icon="playlist_add"
        clearButton={false}
        modalProps={{
          title: intl.get('small.common.view.skuSelect').d('选择商品'),
        }}
        onChange={(value) => {
          if (value) {
            value.forEach((f) => {
              const record = dataSet.create(
                {
                  sellingPrice: f.agreementTaxedPrice,
                  purchasePrice: 0,
                  agreementHeaderId,
                },
                0
              );
              record.set('skuLov', f);
            });
          }
          createDs.reset();
        }}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Lov>,
      <DelButton dataSet={dataSet} onClick={handleDelete} name="delete" />,
      agmStatus === 'EFFECTED' ? <SaveButton dataSet={dataSet} name="save" /> : null,
      <ImportButton
        name="newImport"
        businessObjectTemplateCode="SAGM.SALE_AGREEMENT_LINE_IMPORT"
        refreshButton
        prefixPatch="/sagm"
        args={{
          agreementHeaderId,
          templateCode: 'SAGM.SALE_AGREEMENT_LINE_IMPORT',
          tenantId: organizationId,
        }}
        successCallBack={() => dataSet.query()}
        buttonProps={{
          icon: 'archive',
          color: 'primary',
          funcType: 'flat',
        }}
      />,
    ];
  }, [agreementHeaderId]);

  return agreementHeaderId ? (
    customizeTable(
      {
        code: 'SAGM.SALE_WORKBENCH.DETAIL_LINE.TABLE',
        buttonCode: 'SAGM.SALE_WORKBENCH.RECEIVE.TABLE.BYNS',
      },
      <SearchBarTable
        dataSet={dataSet}
        columns={columns}
        searchCode={searchBarCode}
        style={{ maxHeight: 531 }}
        buttons={
          isPub
            ? []
            : [
                ...(readOnly ? [] : buttons),
                <ExcelExport
                  name="oldExport"
                  exportAsync
                  requestUrl={`/sagm/v1/${organizationId}/sale-agreement-lines/receive/export`}
                  queryParams={getQueryParams}
                  otherButtonProps={{
                    type: 'c7n-pro',
                    funcType: 'flat',
                    color: 'primary',
                    icon: 'unarchive',
                  }}
                />,
                <ExcelExportPro
                  name="newExport"
                  templateCode="SAGM_SALE_AGREEMENT_LINE_RECEIVE_EXPORT"
                  buttonText={intl.get('sagm.common.button.exportNew').d('(新)导出')}
                  requestUrl={`/sagm/v1/${organizationId}/sale-agreement-lines/export/new`}
                  queryParams={getQueryParams}
                  exportAsync
                  otherButtonProps={{
                    type: 'c7n-pro',
                    funcType: 'flat',
                    color: 'primary',
                    icon: 'unarchive',
                    permissionList: [
                      {
                        code: `${path}.button.export-new`,
                        type: 'button',
                        meaning: '销售协议工作台-(新)详情行导出', // 或者是销售协议管理
                      },
                    ],
                  }}
                />,
              ]
        }
        searchBarConfig={{
          closeFilterSelector: true,
          defaultExpand: false,
          fieldProps: {
            skuId: {
              lovPara: {
                tenantId: organizationId,
                // shelfFlags: '0,1,2,3,4',
                receiveFlag: 1,
              },
            },
            catalogId: { lovPara: { tenantId: organizationId } },
            directoryId: { lovPara: { tenantId: organizationId } },
            supplierCompanyId: { lovPara: { tenantId: organizationId } },
          },
        }}
      />
    )
  ) : (
    <Table dataSet={dataSet} columns={columns} buttons={[]} style={{ maxHeight: 450 }} />
  );
});
