/*
 * SourcingResults - 引用寻源结果
 * @date: 2022/05/30 11:47:39
 * @author: mjq <jiaqi.mao@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useState, useMemo, useEffect } from 'react';
import { isArray } from 'lodash';
import { toJS } from 'mobx';

import SearchBarTable from '_components/SearchBarTable';
import DocFlow from '_components/DocFlow';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';

import { usePriceRender, useAmountRender } from '@/routes/OrderWorkspace/hooks';
import { MutlTextFieldSearch } from '@/routes/components/MultipleSearch';
import { queryCommonDoubleUomConfig } from '@/routes/components/utils';

const tenantId = getCurrentOrganizationId();
const SourcingResults = (props) => {
  const { customizeTable, ds, cacheKey, searchBarRef, remote, displayDocAndDocFlow = {} } = props;

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

  const columns = useMemo(
    () =>
      [
        {
          name: 'sourceNum',
          width: 150,
        },
        {
          name: 'itemNum',
          width: 80,
        },
        {
          name: 'supplierCompanyName',
          width: 150,
          renderer: ({ record }) =>
            record.get('supplierCompanyName') || record.get('erpSupplierCompanyName'),
        },
        {
          name: 'itemCode',
          width: 150,
        },
        {
          name: 'itemName',
          width: 150,
        },
        doubleUnitEnabled && {
          name: 'secondaryQuantity',
          width: 150,
        },
        doubleUnitEnabled && {
          name: 'secondaryUomCodeAndName',
          width: 130,
        },
        {
          name: 'quantity',
          width: 150,
        },
        {
          name: 'receiptsOrderQuantity',
          width: 150,
          editor: (record) => record.isSelected,
        },
        {
          name: 'remainQuantity',
          width: 150,
        },
        {
          name: 'uomCodeAndName',
          width: 130,
        },
        {
          name: 'unitPrice',
          width: 150,
          renderer: usePriceRender(),
        },
        {
          name: 'netAmount',
          width: 150,
          renderer: useAmountRender(),
        },
        {
          name: 'taxprice',
          width: 150,
        },
        {
          name: 'taxAmount',
          width: 150,
          renderer: useAmountRender(),
        },
        {
          name: 'taxRate',
          width: 80,
        },
        {
          name: 'currencyCode',
          width: 150,
        },
        {
          name: 'priceBatchQuantity',
          width: 150,
        },
        {
          name: 'ladderInquiryFlag',
          width: 150,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'companyName',
          width: 150,
        },
        {
          name: 'ouName',
          width: 150,
        },
        {
          name: 'purOrganizationName',
          width: 150,
        },
        {
          name: 'purchaseAgentName',
          width: 150,
        },
        {
          name: 'invOrganizationName',
          width: 200,
        },
        {
          name: 'categoryName',
          width: 200,
        },
        {
          name: 'realName',
          width: 150,
        },
        {
          name: 'creationDate',
          width: 150,
        },
        {
          name: 'sourceCreationDate',
          width: 150,
        },
        {
          name: 'prNumAndLineNum',
          width: 150,
          renderer: ({ value }) => value !== '|' && value,
        },
        {
          name: 'itemRemark',
          width: 150,
        },
        {
          name: 'occupationQuantity',
          width: 150,
        },
        {
          name: 'validPromisedDate',
          width: 150,
        },
        {
          name: 'supplierCompanyNum',
          width: 150,
          renderer: ({ record }) =>
            record.get('supplierCompanyNum') || record.get('erpSupplierCompanyNum'),
        },
        {
          name: 'docFlow',
          width: 100,
          hidden: displayDocAndDocFlow.displayDocFlow !== '1',
          renderer: ({ record }) => {
            return (
              <DocFlow tableName="ssrc_rfx_line_item" tablePk={record.get('sourceLineItemId')} />
            );
          },
        },
        {
          name: 'pendingFlag',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'projectTaskId',
          width: 150,
          renderer: ({ record }) => record.get('projectTaskName'),
        },
      ].filter((i) => i),
    [doubleUnitEnabled, displayDocAndDocFlow]
  );

  const onQuery = ({ params }) => {
    const { tempKey = '' } = params;
    if (!tempKey.includes(':')) {
      const supplierId = [];
      const supplierCompanyId = [];
      tempKey.split(',').forEach((i) => {
        const [localId, platformId] = i.split('-');
        if (localId) supplierId.push(localId);
        if (platformId) supplierCompanyId.push(platformId);
      });
      Object.assign(params, {
        supplierId: String(supplierId),
        supplierCompanyId: String(supplierCompanyId),
      });
    }
    ds.queryDataSet.loadData([
      {
        ...params,
        multiSourceNum: params.multiSourceNum?.toString(),
      },
    ]);
    ds.query();
  };

  const searchBarTableProps = {
    searchBarRef,
    cacheState: true,
    searchCode: 'SODR.WORKSPACE_SOURCINGRESULTS.SEARCH',
    dataSet: ds,
    columns,
    pagination: { pageSizeOptions: ['10', '20', '50', '100', '200'] },
    style: { maxHeight: 'calc(100% - 22px)' },
    virtual: true,
    virtualCell: true,
    searchBarConfig: {
      cacheKey,
      onQuery,
      editorProps: {
        pendingFlag: {
          clearButton: false,
        },
        // tempKey: {
        //   searchFieldProps: {
        //     placeholder: intl
        //       .get('sodr.workspace.view.placeholder.supplierId')
        //       .d('请输入供应商名称'),
        //   },
        // },
      },
      fieldProps: {
        tempKey: {
          lovPara: { tenantId },
        },
        itemCode: {
          transformValue: (value, record) => {
            if (record) {
              const val = record.get('itemCode');
              return isArray(toJS(val)) ? String(val.map((i) => i.itemCode)) : val?.itemCode;
            }
          },
          lovPara: { tenantId },
        },
      },
      left: {
        render: (_, dataSet) => (
          <MutlTextFieldSearch
            name="multiSourceNum"
            dataSet={dataSet}
            placeholder={intl.get('sodr.common.model.common.enterSourcNum').d('请输入寻源单号查询')}
          />
        ),
      },
    },
  };

  return customizeTable(
    { code: 'SODR.WORKSPACE_SOURCINGRESULTS.LIST' },
    <SearchBarTable
      {...(remote
        ? remote.process('sourcingResultsSearchBarTableProps', searchBarTableProps, {
            cacheKey,
            ds,
          })
        : searchBarTableProps)}
    />
  );
};

export default SourcingResults;
