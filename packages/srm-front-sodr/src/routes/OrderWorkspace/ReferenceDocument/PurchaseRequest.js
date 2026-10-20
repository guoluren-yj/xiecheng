/*
 * PurchaseRequest - 引用采购申请
 * @date: 2022/05/24 11:47:39
 * @author: mjq <jiaqi.mao@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Lov, Modal, Icon, Tooltip } from 'choerodon-ui/pro';
import { isEmpty, isArray } from 'lodash';
import { toJS } from 'mobx';

import SearchBarTable from '_components/SearchBarTable';
import DocFlow from '_components/DocFlow';
import intl from 'utils/intl';
import { Button } from 'components/Permission';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

import C7nPriceModal from '@/routes/components/C7nPriceModal';
import { formatAumont, queryCommonDoubleUomConfig } from '@/routes/components/utils';
import { usePriceRender } from '@/routes/OrderWorkspace/hooks';
import { MutlTextFieldSearch } from '@/routes/components/MultipleSearch';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();
const PurchaseRequest = (props) => {
  const {
    customizeTable,
    ds,
    cacheKey,
    searchBarRef,
    remote,
    detailPageDs = {},
    displayDocAndDocFlow = {},
  } = props;

  const [doubleUnitEnabled, setDoubleUnit] = useState(0); // 双单位是否开启标识

  // 查询业务规则定义双单位配置
  const queryDoubleUom = async () => {
    const res = await queryCommonDoubleUomConfig();
    ds.setState({ doubleUnitEnabled: res });
    setDoubleUnit(res);
  };

  useEffect(() => {
    queryDoubleUom();
  }, []);

  const openC7nPriceModal = (params) => {
    const openPriceModal = Modal.open({
      drawer: true,
      style: { width: 742 },
      title: intl.get('sodr.workspace.model.common.referPrice').d('参考价格'),
      children: (
        <C7nPriceModal
          params={params}
          customizeTable={customizeTable}
          code="SODR.WORKSPACE_PURCHASEREQUEST.REFERENCE_PRICE"
        />
      ),
      closable: true,
      footer: (
        <Button type="primary" onClick={() => openPriceModal.close()}>
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      ),
    });
  };

  const columns = useMemo(
    () => {
      const cols = [
        {
          name: 'prNum',
          width: 200,
          renderer: ({ value, record }) =>
            record.get('urgentFlag') && Number(record.get('urgentFlag')) ? (
              <React.Fragment>
                {value}
                {record.get('urgentFlag') && Number(record.get('urgentFlag')) ? (
                  <Tooltip title={intl.get(`sodr.workspace.view.tooltip.urgent`).d('订单加急')}>
                    <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                  </Tooltip>
                ) : null}
              </React.Fragment>
            ) : (
              value
            ),
        },
        {
          name: 'displayLineNum',
          width: 80,
        },
        {
          name: 'itemCode',
          width: 120,
        },
        {
          name: 'itemName',
          width: 120,
        },
        {
          name: 'referencePrice',
          width: 120,
          renderer: ({ record }) => {
            const itemCode = record.get('itemCode');
            const prSourcePlatform = record.get('prSourcePlatform');
            const referencePriceDisplayFlag = record.get('referencePriceDisplayFlag');
            const params = {};
            [
              'companyId',
              'itemId',
              'ouId',
              'invOrganizationId',
              'purchaseOrgId',
              'uomId',
              'prLineId',
              'orderTypeId',
              'orderTypeCode',
              'categoryId',
            ].forEach((i) => {
              params[i] = record.get(i);
            });
            if (itemCode && prSourcePlatform !== 'CATALOGUE' && referencePriceDisplayFlag) {
              // return <C7nPriceModal params={params} />;
              return (
                <a onClick={() => openC7nPriceModal(params)}>
                  {intl.get('sodr.workspace.model.common.referPrice').d('参考价格')}
                </a>
              );
            }
          },
        },
        {
          name: 'orderSupplierLov',
          width: 200,
          editor: (record) =>
            ['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform')) ? <Lov /> : false,
          renderer: ({ record }) =>
            ['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform'))
              ? record.get('selectDisplaySupplierCompanyName')
              : record.get('supplierName'),
        },
        doubleUnitEnabled && {
          name: 'secondaryQuantity',
          width: 150,
        },
        doubleUnitEnabled && {
          name: 'secondaryUomName',
          width: 130,
          renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
        },
        {
          name: 'quantity',
          width: 150,
        },
        {
          name: 'thisOrderQuantity',
          width: 120,
          editor: (record) => record.isSelected,
        },
        {
          name: 'restPoQuantity',
          width: 120,
        },
        {
          name: 'neededDate',
          width: 150,
        },
        {
          name: 'uomName',
          width: 130,
          renderer: ({ record }) => record.get('uomCodeAndName'),
        },
        {
          name: 'noUnitPrice',
          width: 110,
          renderer: ({ value, record }) =>
            ['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform'))
              ? formatAumont(value, record.get('defaultPrecision'))
              : formatAumont(record.get('unitPrice'), record.get('defaultPrecision')),
        },
        {
          name: 'currencyCode',
          width: 150,
        },
        {
          name: 'taxIncludedUnitPrice',
          width: 120,
          renderer: usePriceRender(),
        },
        {
          name: 'supplierCode',
          width: 110,
        },
        {
          name: 'supplierName',
          width: 150,
        },
        {
          name: 'companyName',
          width: 200,
        },
        {
          name: 'ouName',
          width: 200,
        },
        {
          name: 'purchaseOrgName',
          width: 200,
        },
        {
          name: 'invOrganizationName',
          width: 200,
        },
        {
          name: 'prTypeName',
          width: 150,
        },
        {
          name: 'categoryName',
          width: 200,
        },
        {
          name: 'productNum',
          width: 200,
        },
        {
          name: 'productName',
          width: 200,
        },
        {
          name: 'catalogName',
          width: 200,
        },
        {
          name: 'prRequestedName',
          width: 200,
        },
        {
          name: 'remark',
          width: 150,
        },
        {
          name: 'prSourcePlatform',
          width: 200,
          renderer: ({ record }) => record.get('prSourcePlatformMeaning'),
        },
        {
          name: 'urgentFlag',
          width: 120,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'urgentDate',
          width: 200,
        },
        {
          name: 'occupiedQuantity',
          width: 150,
        },
        {
          name: 'itemSpecs',
          width: 100,
        },
        {
          name: 'itemModel',
          width: 100,
        },
        {
          name: 'projectCategory',
          width: 150,
        },
        {
          name: 'accountAssignTypeCode',
          width: 150,
        },
        {
          name: 'commonName',
          width: 150,
        },
        // {
        //   name: 'enteredTaxIncludedPrice',
        //   width: 110,
        // },
        // {
        //   name: 'priceSourceNumber', // 待定
        //   width: 200,
        // },
        {
          name: 'contactTelNum',
          width: 200,
        },
        {
          name: 'receiverAddress',
          width: 200,
        },
        {
          name: 'docFlow',
          width: 100,
          hidden: displayDocAndDocFlow.displayDocFlow !== '1',
          renderer: ({ record }) => (
            <DocFlow tableName="sprm_pr_line" tablePk={record.get('prLineId')} />
          ),
        },
        {
          name: 'creationDate',
          width: 150,
        },
        {
          name: 'purchaseAgentName',
          width: 200,
        },
        {
          name: 'projectTaskId',
          width: 150,
          renderer: ({ record }) => record.get('projectTaskName'),
        },
      ].filter((i) => i);
      return remote?.process('getPurchaseRequestLineCols', cols, { cols, openC7nPriceModal, ds }) || cols;
    },
    [doubleUnitEnabled, displayDocAndDocFlow]
  );

  const onQuery = useCallback(
    ({ params }) => {
      const { tempKey = '', tempKeys = '' } = params;
      if (!tempKey.includes(':')) {
        const [supplierId, supplierCompanyId] = tempKey.split('-');
        Object.assign(params, { supplierId, supplierCompanyId });
      }
      if (!tempKeys.includes(':')) {
        const tempKeysList = tempKeys.split(',');
        const localSupplierIds = tempKeysList.map((i) => i.split('-')[0]).filter((i) => i);
        const platformSupplierIds = tempKeysList.map((i) => i.split('-')[1]).filter((i) => i);
        Object.assign(params, {
          localSupplierIds: isEmpty(localSupplierIds) ? undefined : String(localSupplierIds),
          platformSupplierIds: isEmpty(platformSupplierIds)
            ? undefined
            : String(platformSupplierIds),
        });
      }
      if (cacheKey === 'purchaseRequest') {
        Object.assign(
          params,
          remote.process('getPurchaseRequestQueryParams', { detailPageDs, ds, params })
        );
      }
      ds.queryDataSet.loadData([
        {
          ...params,
          supplierQueryParamStr: tempKey || undefined,
          recommendSupplierParamsStr: tempKeys || undefined,
          multiSelectHeaderAndLineNums: params.multiSelectHeaderAndLineNums?.toString(),
        },
      ]);
      ds.query();
    },
    [ds]
  );
  const searchBarConfig = useMemo(() => {
    const config = {
      cacheKey,
      onQuery,
      fieldProps: {
        itemCode: {
          transformValue: (value, record) => {
            if (record) {
              const val = record.get('itemCode');
              return isArray(toJS(val)) ? String(val.map((i) => i.itemCode)) : val?.itemCode;
            }
          },
          lovPara: { tenantId },
        },
        tempKey: {
          lovPara: { tenantId },
        },
        tempKeys: {
          lovPara: { tenantId },
        },
        itemCodes: {
          lovPara: { tenantId, organizationId },
        },
        executedByName: {
          lovPara: {
            tenantId,
          },
        },
      },
      left: {
        render: (_, dataSet) => (
          <MutlTextFieldSearch
            name="multiSelectHeaderAndLineNums"
            dataSet={dataSet}
            placeholder={intl
              .get('sodr.common.model.common.enterPrNum')
              .d('请输入采购申请编号查询')}
          />
        ),
      },
    };
    // 从明细页面打开的采购申请新增行弹窗才走埋点
    return cacheKey === 'purchaseRequest_detail'
      ? remote.process('purchaseRequestSearchBarConfig', config, { detailPageDs })
      : config;
  }, [cacheKey, onQuery, tenantId, organizationId]);
  const searchBarTableProps = {
    searchBarRef,
    cacheState: true,
    searchCode: 'SODR.WORKSPACE_PURCHASEREQUEST.SEARCH',
    dataSet: ds,
    columns,
    pagination: { pageSizeOptions: ['10', '20', '50', '100', '200'] },
    style: { maxHeight: 'calc(100% - 22px)' },
    virtual: true,
    virtualCell: true,
    searchBarConfig,
  };
  return customizeTable(
    { code: 'SODR.WORKSPACE_PURCHASEREQUEST.LIST', lovIgnore: false },
    <SearchBarTable
      {...(remote
        ? remote.process('purchaseRequestSearchBarTableProps', searchBarTableProps, {
          cacheKey,
          detailPageDs,
          ds,
        })
        : searchBarTableProps)}
    />
  );
};

export default PurchaseRequest;
