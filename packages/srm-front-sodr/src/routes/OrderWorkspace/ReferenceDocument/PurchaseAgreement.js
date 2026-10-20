/*
 * PurchaseAgreement - 引用采购协议
 * @date: 2022/05/24 11:47:39
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
import { getCurrentOrganizationId } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';

import { usePriceRender, useAmountRender } from '@/routes/OrderWorkspace/hooks';
import { queryCommonDoubleUomConfig } from '@/routes/components/utils';
import { MutlTextFieldSearch } from '@/routes/components/MultipleSearch';
import { openModal } from '@/routes/components/AgreementLadderPrice';

const tenantId = getCurrentOrganizationId();
const PurchaseRequest = (props) => {
  const { customizeTable, ds, cacheKey, searchBarRef, remote, displayDocAndDocFlow = {} } = props;

  const [doubleUnitEnabled, setDoubleUnit] = useState(0); // 双单位是否开启标识

  const rendererLadderPrice = ({ record }) => {
    const { pcSubjectId, ladderQuotationFlag } = record.get(['pcSubjectId', 'ladderQuotationFlag']);
    return ladderQuotationFlag === 1 && pcSubjectId ? (
      <a onClick={() => openModal({ pcSubjectId })}>
        {intl.get('sodr.workspace.model.common.ladderInquiry').d('阶梯价格')}
      </a>
    ) : null;
  };

  const columns = useMemo(() => {
    const defaultColumns = [
      {
        name: 'pcNum',
        width: 150,
      },
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'pcName',
        width: 150,
      },
      // {
      //   name: 'supplierCompanyNum',
      //   width: 150,
      // },
      {
        name: 'supplierCompanyName',
        width: 150,
        renderer: ({ record }) => record.get('supplierCompanyName') || record.get('supplierName'),
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
        width: 150,
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
        name: 'residueOrderQuantity',
        width: 150,
      },
      {
        name: 'uomCodeAndName',
        width: 150,
      },
      {
        name: 'deliverDate',
        width: 150,
      },
      // {
      //   name: 'neededDate',
      //   width: 150,
      // },
      {
        name: 'ladderPrice',
        width: 100,
        renderer: rendererLadderPrice,
      },
      {
        name: 'unitPrice',
        width: 150,
        renderer: usePriceRender(),
      },
      {
        name: 'lineAmount',
        width: 150,
        renderer: useAmountRender(),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        renderer: usePriceRender(),
      },
      {
        name: 'taxIncludedLineAmount',
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
        name: 'unitPriceBatch',
        width: 150,
      },
      // {
      //   name: 'ladderInquiry',
      //   width: 150,
      // },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'purchaseOrgName',
        width: 150,
      },
      {
        name: 'agentName',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 150,
      },
      {
        name: 'createdByName',
        width: 150,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      // {
      //   name: 'prNumAndLineNum', // 待定
      //   width: 150,
      // },
      // {
      //   name: 'prNumAndLineNum1', // 待定
      //   width: 150,
      // },
      {
        name: 'remark',
        width: 150,
      },
      {
        name: 'chanageOrderQuantity',
        width: 150,
      },
      {
        name: 'supplierCompanyNum',
        width: 150,
        renderer: ({ record }) => record.get('supplierCompanyNum') || record.get('supplierNum'),
      },
      {
        name: 'docFlow',
        width: 100,
        hidden: displayDocAndDocFlow.displayDocFlow !== '1',
        renderer: ({ record }) => (
          <DocFlow tableName="spcm_pc_subject" tablePk={record.get('pcSubjectId')} />
        ),
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
    ].filter((i) => i);
    // 区分新增行逻辑
    return remote?.process ? remote.process('agreementColumns', defaultColumns) : defaultColumns;
  }, [doubleUnitEnabled, displayDocAndDocFlow]);

  // 查询业务规则定义双单位配置
  const queryDoubleUom = async () => {
    const res = await queryCommonDoubleUomConfig();
    ds.setState({ doubleUnitEnabled: res });
    setDoubleUnit(res);
  };

  useEffect(() => {
    queryDoubleUom();
  }, []);

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
        multiPcNum: params.multiPcNum?.toString(),
      },
    ]);
    ds.query();
  };

  const searchBarTableProps = {
    searchBarRef,
    cacheState: true,
    searchCode: 'SODR.WORKSPACE_PURCHASEAGREEMENT.SEARCH',
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
            name="multiPcNum"
            dataSet={dataSet}
            placeholder={intl
              .get('sodr.common.model.common.purchaseAgreement')
              .d('请输入采购协议编号查询')}
          />
        ),
      },
    },
  };

  return customizeTable(
    { code: 'SODR.WORKSPACE_PURCHASEAGREEMENT.LIST', lovIgnore: false },
    <SearchBarTable
      {...(remote
        ? remote.process('purchaseAgreementSearchBarTableProps', searchBarTableProps, {
            ds,
            cacheKey,
          })
        : searchBarTableProps)}
    />
  );
};

export default PurchaseRequest;
