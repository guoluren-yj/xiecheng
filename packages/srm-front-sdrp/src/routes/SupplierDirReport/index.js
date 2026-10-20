import React, { Fragment } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { compose } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import c7nCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import ExcelExportPro from 'components/ExcelExportPro';
import intl from 'utils/intl';
import { SRM_DATA_SDRP } from '@/utils/config';

import ReportDs from './ds';

function SupplierDirReport(props) {
  const { ds, customizeTable } = props;
  const getColumns = () => {
    return [
      { name: 'companyName' },
      { name: 'supplierCompanyNum', width: 130 },
      { name: 'supplierCompanyName', width: 130 },
      { name: 'supplierCompanyCategory' },
      { name: 'supplyCategoryName', width: 130 },
      { name: 'purchaseAgentName' },
      { name: 'contactName' },
      { name: 'mobilePhones' },
      { name: 'contactMails' },
      { name: 'businessNature' },
      { name: 'bankAccountName' },
      { name: 'bankAccountNums' },
      { name: 'typeName' },
      { name: 'paymentTypeName' },
      { name: 'firstRegionName' },
      { name: 'registeredAddress' },
      { name: 'stageDescription' },
      { name: 'stageCreationDate', width: 170 },
      { name: 'stageRealName', width: 170 },
      { name: 'levelDesc', width: 170 },
      { name: 'finalScore', width: 170 },
      { name: 'poFlag', width: 170 },
      { name: 'organizationName' },
      { name: 'headerCount', align: 'right' },
      { name: 'totalAmount', align: 'right' },
      { name: 'supplierFlag', width: 130 },
      { name: 'supplierCreationDate' },

      { name: 'supplierCnt' },
      { name: 'supplierLastUpdateDate' },
      { name: 'domesticForeignRelation' },
      { name: 'unifiedSocialCode' },
      { name: 'organizingInstitutionCode' },
      { name: 'dunsCode' },
      { name: 'organType' },
      { name: 'groupType' },
      { name: 'legalRepName' },
      { name: 'supplierRegisteredCountry' },
      { name: 'supplierRegisteredAddress' },
      { name: 'supplierAddressDetail' },
      { name: 'registeredCapital' },
      { name: 'registeredCurrency' },
      { name: 'taxpayerType' },
      { name: 'buildDate' },
      { name: 'businessTerm' },
      { name: 'industryName' },
      { name: 'industryCategoryName' },
      { name: 'serviceAreaName' },
      { name: 'website' },
      { name: 'supplierStageDescription' },
      { name: 'supplierCountryName' },
      { name: 'businessAddress' },
      { name: 'supplierLinkName' },
      { name: 'supplierDepartment' },
      { name: 'supplierPosition' },
      { name: 'supplierLinkPhone' },
      { name: 'supplierTelephone' },
      { name: 'supplierLinkEmail' },
      { name: 'supplierBankCode' },
      { name: 'supplierBankName' },
      { name: 'supplierBankFirm' },
      { name: 'supplierBranchName' },
      { name: 'supplierAccountName' },
      { name: 'supplierAccountNum' },
      { name: 'publicOrPrivate' },
    ];
  };

  const ObserverBtns = observer(() => {
    return [
      <ExcelExportPro
        templateCode="SRM_C_SUPPLIER_DIR_EXPORT"
        exportAsync
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
        }}
        buttonText={
          ds?.selected.length === 0
            ? intl.get('sdrp.common.button.export').d('导出')
            : intl.get('sdrp.common.button.selectExport').d('勾选导出')
        }
        method="POST"
        requestUrl={`${SRM_DATA_SDRP}/v1/${getCurrentOrganizationId()}/supplier/report/qualified/dir/export`}
        allBody
        queryParams={() => {
          const body = ds.selected.map((m) => m.toData());
          // 筛选器参数
          const queryRecord = ds?.queryDataSet?.current;
          if (queryRecord) {
            const queryParam = queryRecord.toJSONData();
            delete queryParam.__id;
            delete queryParam._status;
            delete queryParam.__dirty;
            return {
              ...filterNullValueObject({
                ...queryParam,
                body,
              }),
            };
          }
        }}
      />,
    ];
  });

  const onQueryValidate = ({ params = {}, fields = [], dataSet }) => {
    const _params = {};
    Object.keys(params).forEach((key) => {
      const config = fields.find((item) => item.name === key);
      if (!config) return;
      if (config.customComparisonSet?.includes('IN')) {
        if (key === 'supplierCompany') {
          const supplierList = (dataSet.toJSONData() || [])[0]?.supplierCompany_tmp || [];
          const supplierCompanyIds = [];
          const extSupplierIds = [];
          supplierList.forEach((supplier) => {
            if (supplier.supplierCompanyId) {
              supplierCompanyIds.push(supplier.supplierCompanyId);
            } else if (supplier.extSupplierId) {
              extSupplierIds.push(supplier.extSupplierId);
            }
          });
          if (supplierCompanyIds.length) _params.supplierCompanyIds = supplierCompanyIds;
          if (extSupplierIds.length) _params.extSupplierIds = extSupplierIds;
        } else {
          _params[key] = params[key].split(',');
        }
      } else {
        _params[key] = params[key];
      }
    });
    if (ds.queryDataSet) {
      ds.queryDataSet.loadData([_params]);
      ds.query();
    }
  };
  return (
    <Fragment>
      <Header title={intl.get('sdrp.reportTest.title.reportTest').d('报表测试')}>
        <ObserverBtns />
      </Header>
      <Content>
        {customizeTable(
          { code: 'SDRP.SUPPLIER.DIRECTORY_REPORT.TABLE' },
          <SearchBarTable
            dataSet={ds}
            columns={getColumns()}
            searchCode="SDRP.SUPPLIER.DIRECTORY_REPORT.SEARCH"
            style={{ maxHeight: 'calc(100% - 22px)' }}
            customizable
            customizedCode="SDRP.SUPPLIER.DIRECTORY_REPORT.TABLE"
            searchBarConfig={{
              onQuery: onQueryValidate,
            }}
          />
        )}
      </Content>
    </Fragment>
  );
}

export default compose(
  formatterCollections({
    code: ['sdrp.suppierDir', 'sdrp.common'],
  }),
  c7nCustomize({
    unitCode: ['SDRP.SUPPLIER.DIRECTORY_REPORT.TABLE', 'SDRP.SUPPLIER.DIRECTORY_REPORT.SEARCH'],
  }),
  withProps(
    () => {
      return {
        ds: new DataSet(
          ReportDs({
            customizeUnitCodes: [
              'SDRP.SUPPLIER.DIRECTORY_REPORT.TABLE',
              'SDRP.SUPPLIER.DIRECTORY_REPORT.SEARCH',
            ],
          })
        ),
      };
    },
    {
      cacheState: true,
      // keepOriginDataSet: true,
    }
  )
)(SupplierDirReport);
