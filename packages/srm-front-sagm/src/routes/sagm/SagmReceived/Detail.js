import React, { useState, useEffect, Fragment, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { checkPermission } from 'services/api';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import { precisionRender } from '@/utils/precision';
import { protocalUnitCode } from '../const/uniCode';
import FormPro from '../SagmWorkbench/Comps/FormPro';
import { SubContent } from '../ProtocolWorkbench/Detail';
import { agmBaseInfoDs, agmDetailLineDs } from './getTabs';
import { openTransfer } from '../agreement';
import { openLadderPrice } from '../ProtocolWorkbench/drawer/priceDrawer';
import { regionRender } from '../ProtocolWorkbench/renderUtils';
import styles from './index.less';

const tableUnitCode = [
  'SMAL.AGREEMENT_MANAGEMENT.IMPORT_MANUAL_NEW',
  'SMAL.AGREEMENT_MANAGEMENT.IMOIRT_PRICE_LIB_NEW',
  'SMAL.AGREEMENT_MANAGEMENT.MANUAL_LINE_HISTORY',
  'SMAL.AGREEMENT_MANAGEMENT.PRICE_LIB_LINE_HISTORY',
];

const { view, history } = protocalUnitCode;

const organizationId = getCurrentOrganizationId();

function Detail(props) {
  const [skuPermission, setSkuPermission] = useState(false);
  const [baseInfo, setBaseInfo] = useState({});
  const {
    customizeForm,
    customizeTable,
    location: { pathname },
    match: { params = {} } = {},
  } = props;

  const { agreementId, versionNum } = params;

  const isHis = pathname.includes('history-detail');
  const baseInfoCode = isHis ? history : view;
  const lineSearchCode = isHis
    ? 'SAGM.RECEIVED.HIS_DETAIL_LINE.SEARCH_BAR'
    : 'SAGM.RECEIVED.DETAIL_LINE.SEARCH_BAR';
  const currentTableCode = isHis
    ? tableUnitCode.filter((f) => f.includes('LINE_HISTORY'))
    : tableUnitCode.filter((f) => !f.includes('LINE_HISTORY'));

  const baseInfoDs = useMemo(() => {
    return new DataSet(
      agmBaseInfoDs({
        isHis,
        params: { agreementId, versionNum, customizeUnitCode: baseInfoCode },
      })
    );
  }, []);
  const tableLineDs = useMemo(() => {
    const customizeUnitCode = [...currentTableCode, lineSearchCode].join(',');
    return new DataSet(
      agmDetailLineDs({
        isHis,
        params: { agreementId, versionNum, searchFlag: 1, customizeUnitCode },
      })
    );
  }, []);

  async function initData() {
    await baseInfoDs.query();
    setBaseInfo(baseInfoDs.current.toData());
    tableLineDs.query();
  }

  // 查询商品更改权限
  async function fetchSkuPermission() {
    const res = getResponse(await checkPermission(['mall-received-agreement.button.sku-number']));
    const isApprove = res?.[0]?.approve;
    setSkuPermission(isApprove);
  }

  useEffect(() => {
    initData();
    fetchSkuPermission();
  }, []);

  const { sourceFrom, agreementStatus } = baseInfo;

  const tableCode =
    sourceFrom === 'PRICE'
      ? currentTableCode.find((f) => f.includes('PRICE_LIB'))
      : currentTableCode.find((f) => !f.includes('PRICE_LIB'));

  const columns = [
    {
      name: 'lineNum',
      width: 100,
      lock: 'left',
    },
    {
      name: 'itemLov',
      width: 150,
      lock: 'left',
      renderer: ({ record }) => record.get('itemCode'),
    },
    {
      name: 'itemName',
      width: 150,
    },
    {
      name: 'itemCategoryLov',
      width: 150,
      renderer: ({ record }) => record.get('itemCategoryName'),
    },
    {
      name: 'catalogLov',
      width: 150,
      renderer: ({ record }) => record.get('catalogName'),
    },
    {
      name: 'effectiveFlag',
      width: 100,
      renderer: ({ record }) => record.get('effectiveFlagMeaning'),
    },
    {
      width: 160,
      name: 'validDateFrom',
    },
    {
      width: 160,
      name: 'validDateTo',
    },
    {
      name: 'uomLov',
      width: 140,
      renderer: ({ record }) => record.get('uomName'),
    },
    {
      name: 'taxLov',
      width: 140,
      align: 'left',
      renderer: ({ record }) => record.get('tax') && Number(record.get('tax')),
    },
    {
      name: 'currencyLov',
      width: 140,
      renderer: ({ record }) => record.get('currencyName'),
    },
    {
      name: 'priceType',
      width: 150,
      renderer: ({ record }) => record.get('priceTypeMeaning'),
    },
    {
      name: 'unitPrice',
      width: 150,
      renderer: precisionRender,
    },
    {
      name: 'taxPrice',
      width: 150,
      renderer: precisionRender,
    },
    {
      name: 'priceBatchQuantity',
      width: 100,
    },
    {
      name: 'ladderFlag',
      width: 160,
      renderer: ({ record }) =>
        record.get('priceType') === 'LADDER_PRICE' ? (
          <a
            onClick={() =>
              openLadderPrice({
                data:
                  (isHis ? record.get('agreementLadderHiss') : record.get('agreementLadders')) ||
                  [],
                readOnly: true,
              })
            }
          >
            {intl.get('sagm.common.view.modal.ladderPrice').d('阶梯价格')}
          </a>
        ) : (
          '-'
        ),
    },
    {
      name: 'postageLov',
      width: 150,
      renderer: ({ record }) => (record.get('postage') ? record.get('postage').postageName : '-'),
    },
    {
      name: 'installLov',
      width: 150,
      renderer: ({ record }) => (record.get('install') ? record.get('install').postageName : '-'),
    },
    {
      name: 'agreementQuantity',
      width: 150,
      renderer: precisionRender,
    },
    {
      name: 'orderQuantity',
      width: 150,
      renderer: precisionRender,
    },
    {
      name: 'minPackageQuantity',
      width: 150,
      renderer: precisionRender,
    },
    {
      width: 220,
      name: 'deliverRegionLov',
      renderer: regionRender,
    },
    {
      name: 'priceSourceFromNum',
      title: intl.get('sagm.common.model.sourceFromNum').d('合同号'),
      width: 130,
    },
    {
      name: 'priceSourceFromLnNum',
      width: 130,
      title: intl.get('sagm.common.model.sourceFromLnNum').d('合同行号'),
    },
    {
      name: 'deliveryDay',
      width: 150,
    },
    {
      name: 'guaranteeDay',
      width: 150,
    },
    {
      name: 'priceLibNumber',
      width: 150,
    },
    {
      name: 'remark',
      width: 150,
      renderer: ({ value, record }) => record.get('remarkMeaning') || value,
    },
    {
      width: 120,
      lock: 'right',
      name: 'operation',
      header: intl.get('hzero.common.action').d('操作'),
      renderer: ({ record }) => {
        const readOnly = isHis || agreementStatus === 'TERMINATED';
        return (
          <a
            onClick={() =>
              openTransfer({
                record,
                mode: readOnly ? 'read' : 'default',
                isSup: true,
                isCreateGo: true,
                backPath: pathname,
                versionNum,
                skuApprove: skuPermission,
                afterRequest: () => tableLineDs.query(tableLineDs.currentPage),
              })
            }
          >
            {readOnly
              ? intl
                  .get('small.common.model.lookProduct', { value: record.get('detailsFlag') })
                  .d(`查看商品(${record.get('detailsFlag')})`)
              : intl
                  .get('small.common.model.productManage', { value: record.get('detailsFlag') })
                  .d(`商品管理(${record.get('detailsFlag')})`)}
          </a>
        );
      },
    },
  ];
  return (
    <Fragment>
      <Header
        title={intl.get('small.common.view.agreementDetail').d('协议明细')}
        backPath="/small/mall-received-agreement/list"
      />
      <Content className={styles['sagm-workbench-detail']}>
        <SubContent title={intl.get('small.common.view.baseInfo').d('基本信息')}>
          <FormPro
            readOnly
            columns={3}
            style={{ width: '75%' }}
            dataSet={baseInfoDs}
            customizeForm={customizeForm}
            customizeCode={baseInfoCode}
            fields={[
              { name: 'agreementNumber' },
              { name: 'agreementName' },
              { name: 'versionNum', renderer: ({ value }) => (value ? `v${value}` : '-') },
              { name: 'sourceFrom' },
              { name: 'agreementStatusMeaning' },
              { name: 'creationDate' },
              { name: 'companyName' },
              { name: 'supplierCompanyName' },
              {
                _type: 'empty',
                name: 'empty1',
              },
              { name: 'remark', row: 4, colSpan: 2 },
            ]}
          />
        </SubContent>
        <SubContent
          showDivide
          title={intl.get('small.mallProtocolManagement.view.agreementLine').d('协议行')}
        >
          {sourceFrom &&
            customizeTable(
              { code: tableCode },
              <SearchBarTable
                dataSet={tableLineDs}
                columns={columns}
                searchCode={lineSearchCode}
                searchBarConfig={{
                  closeFilterSelector: true,
                  defaultExpand: false,
                  fieldProps: {
                    catalogId: { lovPara: { tenantId: organizationId } },
                  },
                }}
              />
            )}
        </SubContent>
      </Content>
    </Fragment>
  );
}

export default withCustomize({
  unitCode: [view, history, ...tableUnitCode],
})(
  formatterCollections({
    code: [
      'small.common',
      'small.productPublish',
      'sagm.common',
      'small.freight',
      'sagm.protocolManagement',
      'small.mallProtocolManagement',
    ],
  })(Detail)
);
