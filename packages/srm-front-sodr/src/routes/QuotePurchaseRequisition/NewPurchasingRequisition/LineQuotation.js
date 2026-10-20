import React, { useCallback, useContext, useMemo, useState, useEffect } from 'react';
import DocFlow from '_components/DocFlow';
import { useModal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import { Store } from './stores';
import { formatAumont } from '@/routes/components/utils';
import { queryDoubleUomConfig } from '@/services/orderWorkspaceService';
import { usePrNumRender, useTable } from './hooks';
import PriceModal from './PriceModal';

const style = {
  maxHeight: `calc(100vh - ${350}px)`,
};

const LineQuotation = function LineQuotation(props) {
  const { dataSet } = props;
  const [doubleUnitEnabled, setDoubleUnit] = useState(0);
  const customizeTable = useContext(Store)?.customizeTable;
  const prNumRenderer = usePrNumRender();
  const modal = useModal();
  const handlePrice = useCallback(
    (record) => {
      modal.open({
        title: intl.get(`sodr.common.modal.referencePrice`).d('物料参考价格'),
        style: {
          width: 820,
        },
        closable: true,
        footer: null,
        children: <PriceModal record={record} />,
      });
    },
    [modal]
  );
  useEffect(() => {
    queryDoubleUom();
  });
  // 查询业务规则定义双单位配置
  const queryDoubleUom = () => {
    queryDoubleUomConfig().then((res) => {
      if (getResponse(res)) {
        setDoubleUnit(Number(res));
        dataSet.setState('doubleUnitEnabled', res);
      }
    });
  };
  const columns = useMemo(() => {
    const sodrEnabled = doubleUnitEnabled !== 0;
    return [
      {
        name: 'prNum',
        lock: true,
        width: 150,
        renderer: prNumRenderer,
      },
      {
        name: 'displayLineNum',
        lock: true,
        width: 100,
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
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'referencePrice',
        width: 90,
        renderer: ({ record }) => {
          const { itemCode, prSourcePlatform, referencePriceDisplayFlag } = record.get([
            'itemCode',
            'prSourcePlatform',
            'referencePriceDisplayFlag',
          ]);
          if (itemCode && prSourcePlatform !== 'CATALOGUE' && referencePriceDisplayFlag) {
            return (
              <a onClick={() => handlePrice(record)}>
                {intl
                  .get(`sodr.quotePurchaseRequisition.view.message.referencePrice`)
                  .d('参考价格')}
              </a>
            );
          }
        },
      },
      {
        name: 'priceLibraryId',
        width: 150,
        editor: (record) => ['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform')),
        renderer: ({ record }) =>
          ['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform'))
            ? record.get('selectDisplaySupplierCompanyName')
            : record.get('supplierName'),
      },
      {
        title: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
        name: 'noUnitPrice',
        width: 120,
        renderer: ({ value, record }) =>
          ['SRM', 'ERP', 'SHOP'].includes(record.get('prSourcePlatform'))
            ? formatAumont(value, record.get('defaultPrecision'))
            : formatAumont(record.get('unitPrice'), record.get('defaultPrecision')),
      },
      {
        name: 'secondaryQuantity',
        width: 100,
      },
      {
        name: 'thisOrderQuantity',
        width: 150,
        editor: (record) => record.isSelected && record.get('transactionMode') !== 'TRIPARTITE',
      },
      {
        name: 'occupiedQuantity',
        width: 120,
      },
      {
        name: 'restPoQuantity',
        width: 120,
      },
      {
        name: 'secondaryUomName',
        width: 100,
        renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
      },
      sodrEnabled && {
        name: 'quantity',
        width: 100,
      },
      sodrEnabled && {
        name: 'uomName',
        width: 100,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'neededDate',
        sortable: true,
        width: 120,
      },
      {
        name: 'projectCategoryMeaning',
        width: 100,
      },
      {
        name: 'accountAssignTypeCode',
        width: 120,
      },
      {
        name: 'prTypeName',
        width: 100,
      },
      {
        name: 'commonName',
        width: 120,
      },
      {
        name: 'currencyCode',
        width: 100,
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 140,
        renderer: ({ value, record }) => formatAumont(value, record.get('defaultPrecision')),
      },
      {
        name: 'supplierCode',
        width: 120,
      },
      {
        name: 'supplierName',
        width: 120,
        renderer: ({ record, value }) => value || record.get('supplierCompanyName'),
      },

      {
        name: 'companyName',
        width: 120,
      },
      {
        name: 'ouName',
        width: 120,
      },
      {
        name: 'purchaseOrgName',
        width: 180,
      },
      {
        name: 'invOrganizationName',
        width: 120,
      },
      {
        name: 'productNum',
        width: 120,
      },
      {
        name: 'productName',
        width: 120,
      },
      {
        name: 'catalogName',
        width: 120,
      },
      {
        name: 'prRequestedName',
        width: 120,
      },
      {
        name: 'contactTelNum',
        width: 120,
      },
      {
        name: 'receiverAddress',
        width: 120,
      },
      {
        name: 'surfaceTreatFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'pcNum',
        width: 160,
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
        name: 'remark',
        width: 150,
      },
      {
        name: 'prSourcePlatformMeaning',
        width: 120,
      },
      {
        name: 'urgentFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'urgentDate',
        width: 180,
      },
      {
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="sprm_pr_line" tablePk={record.get('prLineId')} />
        ),
      },
    ];
  }, [prNumRenderer, handlePrice, doubleUnitEnabled]);
  return customizeTable
    ? customizeTable(
        {
          code: 'SODR.PURCHASE_REQUISITION_LIST.LINE',
          filterCode: 'SODR.PURCHASE_REQUISITION_LIST.FILTER_LINE',
        },
        useTable(dataSet, columns, { style })
      )
    : useTable(dataSet, columns, { style });
};

export default LineQuotation;
