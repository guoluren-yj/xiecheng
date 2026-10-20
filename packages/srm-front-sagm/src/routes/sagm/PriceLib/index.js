// 引用价格库弹窗

import React, { Fragment, useMemo, useRef } from 'react';
import { DataSet, Button, Modal, Table, Tooltip } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { flowRight } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import { SRM_SAGM } from '_utils/config';

import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { precisionRender } from '@/utils/precision';
import OverflowTip from '@/components/OverflowTip';
import QueryField from '@/components/QueryField';
import { getTableDs } from './ds';
import { getUnitListByMatchIds } from './api';

const organizationId = getCurrentOrganizationId();
const userOrganizationId = getUserOrganizationId();

const searchCode = 'SAGM.PRICE_LIB.SEARCH_BAR';
const tableCustomizeCode = 'SAGM.PRICE_LIB.LIST';

const CreateBtn = observer(({ dataSet, onClick }) => {
  return (
    <Button color="primary" onClick={onClick} disabled={!dataSet || dataSet.selected.length < 1}>
      {intl.get('hzero.common.button.create').d('新建')}
    </Button>
  );
});

// 弹窗｜路由
const _QuoteTable = (props) => {
  const { dataSet, customizeTable, filterData } = props;

  const queryRef = useRef(null);

  // 必填dom
  const requireRenderer = ({ record, name, text }, renderer = () => text) => {
    const emptyFields = record.get('emptyFields') || [];
    if (emptyFields.includes(name)) {
      return (
        <span style={{ color: '#f5222d' }}>
          {intl.get('small.common.model.required').d('必填')}
        </span>
      );
    }
    return renderer({ record, name, text });
  };

  // 查看可采买公司
  function handleViewCompanys(companys) {
    const ds = new DataSet({ data: companys, selection: false, paging: false });
    Modal.open({
      title: intl.get('small.common.model.buyCompany').d('可采买公司'),
      style: { width: 380 },
      drawer: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <Table
          dataSet={ds}
          columns={[
            {
              name: 'companyNum',
              header: intl.get('small.common.model.companyNum').d('公司编码'),
              width: 120,
            },
            {
              name: 'companyName',
              header: intl.get('small.common.model.companyName').d('公司名称'),
            },
          ]}
          customizedCode="SAGM.PROTOCOL_MANAGEMENT.BUY_COMPANY"
          style={{ maxHeight: 'calc(100vh - 160px)' }}
        />
      ),
    });
  }

  // 查看阶梯价格
  function handleViewLadders(ladders) {
    const ds = new DataSet({ data: ladders, selection: false, paging: false });
    Modal.open({
      title: intl.get('sagm.common.view.title.ladderPirce').d('阶梯价'),
      style: { width: 742 },
      drawer: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <Table
          dataSet={ds}
          columns={[
            {
              name: 'ladderLineNum',
              header: intl.get('sagm.common.model.lineNumber').d('行号'),
              width: 60,
            },
            {
              name: 'ladderFrom',
              header: intl.get('sagm.common.model.numberFrom').d('数量从(>=)'),
              align: 'right',
              renderer: precisionRender,
            },
            {
              name: 'ladderTo',
              header: intl.get('sagm.common.model.numberTo').d('数量至(<)'),
              align: 'right',
              renderer: precisionRender,
            },
            {
              name: 'unitPrice',
              header: intl.get('sagm.common.model.noTaxPrice').d('未税单价'),
              align: 'right',
              renderer: precisionRender,
            },
            {
              name: 'ladderPrice',
              header: intl.get('sagm.common.model.taxPrice').d('含税单价'),
              align: 'right',
              renderer: precisionRender,
            },
          ]}
          customizedCode="SAGM.PROTOCOL_MANAGEMENT.LADDER_PRICE"
          style={{ maxHeight: 'calc(100vh - 160px)' }}
        />
      ),
    });
  }

  const columns = useMemo(
    () => [
      // 待生效：2 有效：1  无效： 0
      {
        name: 'effectiveFlagMeaning',
        width: 60,
        renderer: ({ text, record }) => {
          const status = record.get('effectiveFlag');
          const color = status === 0 ? 'gray' : status === 1 ? 'green' : 'yellow';

          return (
            <Tag color={color} border={false}>
              {text}
            </Tag>
          );
        },
      },
      {
        name: 'priceLibNumber',
        width: 180,
        tooltip: 'none',
        renderer: ({ text, record }) => {
          const errMsg = record.get('errorMessageMeaning');
          return (
            <div>
              <span style={{ lineHeight: '20px', display: 'block', paddingBottom: 4 }}>
                {' '}
                {text || '-'}
              </span>
              <span style={{ lineHeight: '20px', display: 'block' }}>
                {errMsg && <OverflowTip style={{ color: 'red' }}>{errMsg}</OverflowTip>}
              </span>
            </div>
          );
        },
      },
      {
        key: 'companyGroup',
        header: intl.get('small.common.view.supplierPurCompany').d('供采公司'),
        aggregation: true,
        align: 'left',
        width: 160,
        children: [
          { name: 'companyName' },
          {
            name: 'supplierCompanyName',
            renderer: requireRenderer,
          },
          {
            name: 'priceLibAssigns',
            renderer: ({ record }) => {
              const { priceLibAssigns, allCompanyFlag } = record.get([
                'priceLibAssigns',
                'allCompanyFlag',
              ]);
              const companys = priceLibAssigns || [];
              if (allCompanyFlag) return intl.get('small.common.model.allCompanies').d('所有公司');
              if (companys.length < 2) return companys?.[0]?.companyName;
              return (
                <a onClick={() => handleViewCompanys(companys)}>
                  {intl.get('small.common.button.more').d('更多')}
                </a>
              );
            },
          },
        ],
      },
      {
        key: 'itemGroup',
        header: intl.get('small.common.model.itemInfo').d('物料信息'),
        width: 150,
        aggregation: true,
        align: 'left',
        children: [
          { name: 'itemCode' },
          { name: 'itemName', renderer: requireRenderer },
          { name: 'itemCategoryName' },
          { name: 'uomName', renderer: requireRenderer },
        ],
      },
      {
        key: 'priceGroup',
        header: intl.get('sagm.common.model.priceInfo').d('价格信息'),
        width: 150,
        aggregation: true,
        align: 'left',
        aggregationLimitDefaultExpanded: (record) => !record.get('currencyName'),
        children: [
          { name: 'unitPrice', renderer: (p) => requireRenderer(p, precisionRender) },
          {
            name: 'taxPrice',
            renderer: (p) => {
              const { record } = p;
              const { ladderFlag, priceLibMatchLadderList: ladders } = record.get([
                'ladderFlag',
                'priceLibMatchLadderList',
              ]);
              if (ladderFlag) {
                return (
                  <a onClick={() => handleViewLadders(ladders)}>
                    {intl.get('sagm.common.view.button.ladderPrice').d('阶梯价')}
                  </a>
                );
              }
              return requireRenderer(p, precisionRender);
            },
          },
          { name: 'taxRate', renderer: requireRenderer },
          { name: 'currencyName', renderer: requireRenderer },
          {
            name: 'ladderFlag',
            renderer: ({ value }) =>
              value
                ? intl.get('sagm.common.view.ladderPrice').d('阶梯价格')
                : intl.get('sagm.common.view.fixPrice').d('固定价格'),
          },
        ],
      },
      {
        key: 'validDate',
        width: 150,
        header: intl.get('sagm.common.view.validDate').d('有效期'),
        aggregation: true,
        align: 'left',
        children: [
          { name: 'validDateFrom', renderer: requireRenderer },
          { name: 'validDateTo', renderer: requireRenderer },
        ],
      },
      {
        key: 'otherGroup',
        header: intl.get('sagm.common.view.other').d('其他'),
        width: 130,
        aggregation: true,
        align: 'left',
        children: [
          {
            name: 'quantity',
            renderer: precisionRender,
          },
          {
            name: 'minPurchaseQuantity',
            renderer: precisionRender,
          },
          {
            name: 'purOrganizationName',
          },
          {
            name: 'purchaseAgentName',
          },
          {
            name: 'founderName',
          },
        ],
      },
    ],
    []
  );

  const searchBarConfig = {
    expandable: false,
    closeFilterSelector: true,
    fieldProps: {
      companyName: { defaultValue: () => filterData?.companyName },
      supplierCompanyName: { defaultValue: () => filterData?.supplierCompanyName },
    },
    onReset: () => {
      if (queryRef.current.handleClear) queryRef.current.handleClear();
    },
    onClear: () => {
      if (queryRef.current.handleClear) queryRef.current.handleClear();
    },
    left: {
      render: () => (
        <QueryField
          name="itemCodes"
          dataSet={dataSet}
          onRef={(ref) => {
            queryRef.current = ref;
          }}
          placeholder={intl.get('smpc.product.view.queryMsg.itemCode').d('请输入物料编码查询')}
          style={{ width: 250 }}
        />
      ),
    },
  };

  return customizeTable(
    { code: tableCustomizeCode },
    <SearchBarTable
      aggregation
      dataSet={dataSet}
      columns={columns}
      searchCode={searchCode}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
      searchBarConfig={searchBarConfig}
    />
  );
};

export const QuoteTable = flowRight(
  withCustomize({ unitCode: [tableCustomizeCode] }),
  formatterCollections({ code: ['small.common', 'sagm.common', 'smpc.product'] })
)(_QuoteTable);

// 生成dataSet
function getDataSet(filterDs, isExport) {
  const tableDs = new DataSet(getTableDs({ agmLineDs: filterDs, isExport }));
  tableDs.setQueryParameter('tenantId', organizationId);
  if (organizationId !== userOrganizationId) {
    tableDs.setQueryParameter('supplierTenantId', userOrganizationId);
  }
  if (filterDs) {
    const existMatchIds = filterDs.reduce((ids, record) => {
      if (record.get('sourceFromId')) {
        ids.push(record.get('sourceFromId'));
      }
      return ids;
    }, []);
    tableDs.setQueryParameter('existMatchIds', existMatchIds);
  }
  tableDs.setQueryParameter('customizeUnitCode', `${searchCode},${tableCustomizeCode}`);
  return { tableDs };
}

// 引用价格库创建协议
async function createAgreement({ tableDs, filterData, afterSuccess }) {
  const data = dataValidate(tableDs, filterData);
  if (!data) return false;
  const res = getResponse(await getUnitListByMatchIds(data));
  if (res) {
    res[0] = { ...data[0], ...res[0] };
    const results = res.map((m) => ({
      ...m,
      priceValidDateFrom: m.validDateFrom,
      priceValidDateTo: m.validDateTo,
    }));
    afterSuccess(results);
  }
}

// 前置数据校验
function dataValidate(tableDs, { companyId, supplierCompanyId } = {}) {
  const data = tableDs.selected.map((m) => m.toData());
  const validateCompany = data.some(
    (s) => s.companyId !== (companyId || data?.[0]?.companyId || s.companyId)
  );
  const validateSupplier = data.some(
    (s) =>
      s.supplierCompanyId !==
      (supplierCompanyId || data?.[0]?.supplierCompanyId || s.supplierCompanyId)
  );
  if (validateCompany) {
    notification.warning({
      message: intl
        .get('sagm.common.view.message.warnByPurCompany')
        .d('存在不同的采购方，无法创建'),
    });
    return false;
  }
  if (validateSupplier) {
    notification.warning({
      message: intl.get('sagm.common.view.message.warnBySupplier').d('存在不同的供应商，无法创建'),
    });
    return false;
  }
  return data;
}

export default {
  create: ({ filterDs, filterData = {}, afterSuccess = (e) => e }) => {
    const { tableDs } = getDataSet(filterDs);
    const title = intl.get('sagm.common.view.title.priceLibCreateAgm').d('引用价格库新建协议');
    const modal = Modal.open({
      title,
      drawer: true,
      style: { width: 1090 },
      footer: (
        <Fragment>
          <CreateBtn
            dataSet={tableDs}
            onClick={async () => createAgreement({ tableDs, filterData, afterSuccess })}
          />
          <Button onClick={() => modal.close()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </Fragment>
      ),
      children: <QuoteTable dataSet={tableDs} filterData={filterData} />,
    });
    return modal;
  },
  export: (path) => {
    const { tableDs } = getDataSet(null, true);
    const exportProps = {
      requestUrl: `${SRM_SAGM}/v1/${organizationId}/price-lib-matchs/agreement-list/export`,
      queryParams: () => {
        const initQuery = tableDs.queryParameter;
        const queryParams = tableDs.queryDataSet.current.toData();
        const matchIds = tableDs.selected.map((m) => m.get('matchId')).join(',');
        return { ...initQuery, ...queryParams, matchIds };
      },
    };
    const toolTitle = intl
      .get('sagm.common.view.message.checkExport')
      .d('未勾选价格将会导出全部价格');
    const modal = Modal.open({
      title: intl.get('sagm.common.view.title.priceLibExport').d('导出价格库'),
      drawer: true,
      style: { width: 1090 },
      footer: (
        <Fragment>
          <ExcelExportPro
            {...exportProps}
            templateCode="SMAL_PRICE_LIB_MATCH_EXPORT"
            buttonText={
              <Tooltip title={toolTitle} placement="left">
                {intl.get('sagm.common.button.exportNew').d('(新)导出')}
              </Tooltip>
            }
            otherButtonProps={{
              type: 'c7n-pro',
              icon: '',
              color: 'primary',
              permissionList: [
                {
                  code: `${path}.button.price-lib-export-new`,
                  type: 'button',
                  meaning: '价格库导出-（新）导出',
                },
              ],
            }}
          />
          <ExcelExport
            {...exportProps}
            buttonText={
              <Tooltip title={toolTitle}>
                {intl.get('hzero.common.button.export').d('导出')}
              </Tooltip>
            }
            otherButtonProps={{
              type: 'c7n-pro',
              icon: '',
            }}
            // exportAsync
          />
          <Button onClick={() => modal.close()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </Fragment>
      ),
      children: <QuoteTable dataSet={tableDs} />,
    });
    return modal;
  },
};
