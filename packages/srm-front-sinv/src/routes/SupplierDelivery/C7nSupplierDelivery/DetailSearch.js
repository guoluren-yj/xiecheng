import React from 'react';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import {
  useAsnNumRender,
  useYesOrNoRender,
  useLanguageRender,
  useUomRender,
  useTooltip,
  useBomModal,
} from './hooks';
import { getCurrentTenant } from 'utils/utils';
import moment from 'moment';
import { CustModal } from '@/routes/components/C7nCustomModal';
import './index.less';

export default function DetailSearch(props) {
  const { DetailDs, customizeTable, history } = props;
  const tenantName = getCurrentTenant().tenantNum;
  const columns = [
    {
      name: 'asnNum',
      align: 'left',
      width: 160,
      renderer: useAsnNumRender(history),
    },
    {
      name: 'displayAsnLineNum',
      width: 70,
      align: 'left',
    },
    {
      name: 'asnTypeCodeMeaning',
      align: 'left',
      width: 100,
    },
    {
      name: 'itemCode',
      width: 140,
      align: 'left',
    },
    {
      name: 'itemName',
      width: 150,
      align: 'left',
    },
    {
      name: 'cancelledFlag',
      align: 'left',
      width: 80,
      renderer: useYesOrNoRender(),
    },
    {
      name: 'closedFlag',
      align: 'left',
      width: 80,
      renderer: useYesOrNoRender(),
    },
    {
      name: 'displayPoNum',
      width: 150,
      align: 'left',
    },
    {
      name: 'displayReleaseNum',
      width: 80,
      align: 'left',
    },
    {
      name: 'displaylineNum',
      width: 90,
      align: 'left',
    },
    {
      name: 'displayLineLocationNum',
      width: 70,
      align: 'left',
    },
    {
      name: 'versionNum',
      width: 70,
      align: 'left',
    },
    {
      name: 'asnStatusMeaning',
      align: 'left',
      width: 120,
    },
    {
      name: 'shipQuantity',
      align: 'left',
      width: 100,
      renderer: useLanguageRender(),
    },
    {
      name: 'grossWeightStandard',
      width: 120,
      align: 'right',
      renderer: useLanguageRender(),
    },
    {
      name: 'netWeightStandard',
      width: 120,
      align: 'right',
      renderer: useLanguageRender(),
    },
    {
      name: 'weightUomName',
      width: 120,
      renderer: useUomRender('weightUom'),
    },
    {
      name: 'receiveStatusMeaning',
      align: 'left',
      width: 100,
    },
    {
      name: 'receiveQuantity',
      align: 'left',
      width: 80,
      renderer: useLanguageRender(),
    },
    {
      name: 'uomName',
      align: 'left',
      width: 80,
      renderer: useUomRender(),
    },
    {
      name: 'creationDate',
      align: 'left',
      width: 150,
    },
    {
      name: 'shipDate',
      align: 'left',
      width: 150,
    },
    {
      name: 'expectedArriveDate',
      align: 'left',
      width: 150,
    },
    {
      name: 'neededDate',
      align: 'left',
      width: 150,
    },
    {
      name: 'promisedDate',
      align: 'left',
      width: 150,
    },
    {
      name: 'inventoryName',
      width: 100,
    },
    {
      name: 'locationName',
      width: 100,
    },
    {
      name: 'supplierSiteName',
      width: 120,
      align: 'left',
    },
    {
      name: 'organizationName',
      width: 150,
      align: 'left',
    },
    {
      name: 'shipToLocationAddress',
      width: 120,
      renderer: useTooltip({ placement: 'topLeft' }),
    },
    {
      name: 'purchaseAgentName',
      width: 120,
    },
    {
      name: 'contactInfo',
      width: 80,
    },
    {
      name: 'lotNum',
      width: 80,
    },
    {
      name: 'productionDate',
      width: 150,
    },
    {
      name: 'shelfLife',
      width: 80,
    },
    {
      name: 'lotExpirationDate',
      width: 150,
    },
    {
      name: 'unitPackageQuantity',
      width: 120,
      renderer: useLanguageRender(),
    },
    {
      name: 'packageQuantity',
      width: 80,
      renderer: useLanguageRender(),
    },
    {
      name: 'remainderQuantity',
      width: 80,
      renderer: useLanguageRender(),
    },
    {
      name: 'serialNum',
      width: 80,
      align: 'left',
    },
    {
      name: 'invoiceNum',
      width: 80,
      align: 'left',
    },
    {
      name: 'supplierCompanyName',
      width: 150,
      align: 'left',
    },
    {
      name: 'companyName',
      width: 180,
      align: 'left',
    },
    {
      name: 'productNum',
      align: 'left',
      width: 100,
    },
    {
      name: 'productName',
      align: 'left',
      width: 100,
    },
    {
      name: 'catalogName',
      align: 'left',
      width: 100,
    },
    {
      name: 'oldItemCode',
      width: 120,
      align: 'left',
    },
    {
      name: 'supplierItemCode',
      width: 160,
      align: 'left',
    },
    {
      name: 'supplierItemName',
      width: 160,
      align: 'left',
    },
    {
      name: 'purchaseRemark',
      width: 150,
    },
    {
      name: 'approveAttachmentUuid',
      width: 130,
    },
    {
      name: 'supplierRemark',
      width: 150,
    },
    {
      name: 'attachmentUuid',
      width: 130,
    },
    {
      name: 'bom',
      width: 120,
      renderer: useBomModal(),
    },
    {
      name: 'customSpecsJson',
      width: 120,
      renderer: ({ value }) => {
        return <CustModal dataSource={value ? JSON.parse(value) : []} />;
      },
    },
  ];
  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        {
          code: 'SINV.SUPPLIER_DELIVERY_LIST.GRID_BY_DETAIL',
        },
        <SearchBarTable
          searchCode="SINV.SUPPLIER_DELIVERY_LIST.NEW_FILTER_BY_DETAIL"
          cacheState
          dataSet={DetailDs}
          columns={columns}
          style={{ maxHeight: `calc(100% - 22px)` }}
          searchBarConfig={{
            fieldDefaultValueType: 'custom',
            editorProps: {
              asnStatus: {
                optionsFilter:
                  tenantName === 'SRM-SQUIRRELS'
                    ? true
                    : (record) => record.get('value') !== 'CONFIRMED',
              },
            },
            fieldProps: {
              creationDateFrom: {
                defaultValue: () => moment().subtract(1, 'quarters'),
              },
              creationDateTo: {
                defaultValue: () => moment(),
              },
            },
          }}
        />
      )}
    </div>
  );
}
