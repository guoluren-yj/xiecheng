import { Table, DataSet } from 'choerodon-ui/pro';

import React, { Fragment, useImperativeHandle, useMemo } from 'react';
import '../index.less';
import { yesOrNoRender } from 'utils/renderer';
import { lineDs } from './stores';
import { PriceModal } from './priceModal';

const Index = React.forwardRef(
  ({ prHeaderId, handleDetailField, customizeTable = () => { } }, ref) => {
    const lineTableDs = useMemo(
      () =>
        new DataSet(
          lineDs({
            readOnly: true,
            prHeaderId,
            handleDetailField,
            customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASELINE',
          })
        ),
      [prHeaderId]
    );

    const renderAmount = ({ record, name, text }) => {
      if (record && record.get('linePriceHiddenFlag') === 1) {
        return record.get(`${name}Meaning`);
      }

      return text;
    };

    const lineColumns = () => {
      const columns = [
        {
          name: 'displayLineNum',
          width: 120,
        },
        {
          name: 'invOrganizationIdLov',
          width: 120,
        },
        {
          name: 'productNum',
          width: 100,
        },
        {
          name: 'productName',
          width: 100,
        },
        { name: 'thirdSkuCode', width: 100 },
        { name: 'thirdSkuName', width: 100 },
        { name: 'itemCodeLov', width: 100 },
        {
          name: 'itemName',
          width: 100,
        },
        {
          name: 'customMadeFlag',
          width: 100,
          renderer: ({ value }) => (value ? yesOrNoRender(value) : null),
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
          name: 'categoryLov',
          width: 100,
          // editor: true,
        },
        {
          name: 'catalogName',
          width: 100,
        },
        {
          name: 'neededDate',
          width: 100,
        },
        {
          name: 'occupiedQuantity',
          width: 100,
        },
        {
          name: 'changeQuantity',
          width: 100,
        },
        {
          name: 'quantity',
          width: 100,
          type: 'number',
        },
        {
          name: 'uomLov',
          width: 100,
        },
        {
          name: 'taxLov',
          width: 100,
        },
        {
          name: 'taxRate',
          width: 100,
        },
        {
          name: 'currencyLov',
          width: 100,
        },
        {
          name: 'taxIncludedUnitPrice',
          width: 150,
          renderer: renderAmount,
        }, // 预估单价(不含税)
        {
          name: 'lastPurPrice',
          width: 100,
          renderer: ({ record }) => (
            <PriceModal
              {...{
                item: record.toData(),
              }}
            />
          ),
        },
        {
          name: 'unitPriceBatch',
          width: 100,
        },
        {
          name: 'taxIncludedLineAmount',
          width: 130,
          renderer: renderAmount,
        }, // 行金额(不含税)
        {
          name: 'localCurrencyNoTaxSum',
          width: 130,
          renderer: renderAmount,
        },
        {
          name: 'localCurrencyNoTaxUnit',
          width: 130,
          renderer: renderAmount,
        },
        {
          name: 'localCurrencyTaxSum',
          width: 130,
          renderer: renderAmount,
        },
        {
          name: 'localCurrencyTaxUnit',
          width: 130,
          renderer: renderAmount,
        },
        {
          name: 'supplierCompanyIdLov',
          width: 100,
        },
        {
          name: 'supplierList',
          width: 100,
        },
        {
          name: 'prRequestedLov',
          width: 100,
          renderer: ({ record }) => record?.get('prRequestedNum') && record?.get('prRequestedName') ? `${record?.get('prRequestedNum')}-${record?.get('prRequestedName')}` : record?.get('prRequestedName') || record?.get('prRequestedNum'),
        },
        {
          name: 'purchaseAgentLov',
          width: 100,
        },
        {
          name: 'executorName',
          width: 100,
        },
        {
          name: 'accountSubjectLov',
          width: 100,
        },
        {
          name: 'costLov',
          width: 100,
        },
        {
          name: 'expBearDepLov',
          width: 100,
        },
        {
          name: 'projectNum',
          width: 100,
        },
        {
          name: 'projectName',
          width: 100,
        },
        {
          name: 'projectCategoryLov',
          width: 100,
        },
        {
          name: 'wbsLov',
          width: 100,
          renderer: ({ record }) => record.get('wbsCode'),
        },
        {
          name: 'taxIncludedBudgetUnitPrice',
          width: 100,
          renderer: renderAmount,
        },
        {
          name: 'budgetIoFlag',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(Number(value)),
        },
        {
          name: 'budgetAccountLov',
          width: 100,
        },
        {
          name: 'pcNum',
          width: 100,
        },
        {
          name: 'receiveAddress',
          width: 100,
        },
        {
          name: 'receiveTelNum',
          width: 240,
          renderer: ({ value, record }) =>
            value ? `${record.get('internationalTelCode') || ''}${value}` : '',
        },
        {
          name: 'lineFreight',
          width: 100,
          renderer: renderAmount,
        },
        { name: 'rpSourceNum', width: 100 },
        {
          name: 'remark',
          width: 100,
        },
        {
          name: 'budgetOccupyFlag',
          width: 100,
        },
        {
          name: 'attachmentUuid',
          width: 100,
        },
      ];
      return columns;
    };

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
            code: 'SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASELINE', // 必传，和unitCode一一对应
            dataSet: lineTableDs,
            custLoading: false,
          },
          <Table
            style={{ maxHeight: '450px' }}
            dataSet={lineTableDs}
            columns={lineColumns()}
            data={[]}
          />
        )}
      </Fragment>
    );
  }
);

export default Index;
