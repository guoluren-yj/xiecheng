import { DataSet } from 'choerodon-ui/pro';

import React, { Fragment, useImperativeHandle, useMemo } from 'react';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import '../index.less';
import intl from 'utils/intl';
import { lineDs } from './stores';

const Index = React.forwardRef(
  (
    {
      rpHeaderId,
      splitNode,
      isReady,
      code,
      releasedDetailFlag,
      handleDetailField,
      handleBlLineSourceModal,
      customizeTable,
      searchCode,
      pubPathFlag,
    },
    ref
  ) => {
    const lineTableDs = useMemo(
      () =>
        new DataSet(
          lineDs({
            rpHeaderId,
            handleDetailField,
            releasedDetailFlag,
            pubPathFlag,
            // customizeUnitCode: 'SRPM.RP_EXECUTE_PLATFORM_DETAIL.LINEINFO',
            customizeUnitCode: `${code},${searchCode}`,
          })
        ),
      []
    );

    const lineColumns = useMemo(() => {
      const splitColumns =
        splitNode === 'BALANCE_SPLIT'
          ? [
              {
                name: releasedDetailFlag === 1 ? 'splitFlagMeaning' : 'vtSplitFlagMeaning',
                width: 180,
              },
              {
                name: 'vtSplitNumAndLineNum',
                width: 200,
              },
            ]
          : [];
      const columns = [
        {
          name: 'lineNum',
          width: 100,
        },
        ...splitColumns,
        {
          name: 'rpNum',
          renderer: ({ record }) => {
            return record.get('vtSplitFlag') !== 1 ? (
              <a onClick={() => handleBlLineSourceModal(record)}>
                {intl.get(`srpm.common.model.common.check`).d('查看')}
              </a>
            ) : null;
          },
          width: 100,
        },
        {
          name: 'invOrganizationId',
          width: 120,
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
          name: 'categoryId',
          width: 120,
        },
        {
          name: 'itemModel',
          width: 100,
        },
        {
          name: 'itemSpecs',
          width: 100,
        },
        {
          name: 'uomId',
          width: 100,
        },
        {
          name: 'neededDate',
          width: 100,
        },
        {
          name: 'quantity',
          width: 100,
        },
        {
          name: 'taxId',
          width: 100,
        },
        {
          name: 'taxRate',
          width: 100,
        },
        {
          name: 'taxIncludedUnitPrice',
          width: 150,
        },
        {
          name: 'unitPrice',
          width: 130,
        },
        {
          name: 'taxIncludedLineAmount',
          width: 130,
        },
        {
          name: 'lineAmount',
          width: 100,
        },
        {
          name: 'localCurrencyNoTaxSum',
          width: 130,
        },
        {
          name: 'localCurrencyNoTaxUnit',
          width: 130,
        },
        {
          name: 'localCurrencyTaxSum',
          width: 130,
        },
        {
          name: 'localCurrencyTaxUnit',
          width: 130,
        },
        {
          name: 'remark',
          width: 130,
        },
        {
          name: 'attachmentUuid',
          width: 100,
        },
      ];

      if (!isReady) {
        columns.push(
          ...[
            {
              name: 'rpTypeId',
              width: 130,
            },
            {
              name: 'companyId',
              width: 180,
            },
            {
              name: 'ouId',
              width: 200,
            },
            {
              name: 'purchaseOrgId',
              width: 150,
            },
            {
              name: 'unitId',
              width: 150,
            },
            {
              name: 'purchaseAgentId',
              width: 150,
            },
            {
              name: 'localCurrency',
              width: 100,
            },
            {
              name: 'currencyCode',
              width: 100,
            },
            {
              name: 'requestedBy',
              width: 150,
            },
            {
              name: 'requestDate',
              width: 120,
            },
            {
              name: 'vtHeaderRemark',
              width: 100,
            },
          ]
        );
      }

      return columns;
    }, [splitNode, releasedDetailFlag]);

    const loadLineDate = async () => {
      await lineTableDs.query();
    };

    const saveCurrentData = () => {
      return lineTableDs;
    };

    // 函数组件调用到子组件的函数
    useImperativeHandle(ref, () => ({
      loadLineDate,
      saveCurrentData,
      ref: ref.current,
    }));

    return (
      <Fragment>
        {customizeTable(
          {
            code, // 必传，和unitCode一一对应
            dataSet: lineTableDs,
            custLoading: false,
          },
          <SearchBarTable
            searchCode={searchCode}
            style={{ maxHeight: '450px' }}
            dataSet={lineTableDs}
            columns={lineColumns}
            data={[]}
            selectionMode="none"
            searchBarConfig={{
              autoQuery: false,
              expandable: false,
              closeFilterSelector: true,
            }}
          />
        )}
      </Fragment>
    );
  }
);

export default Index;
