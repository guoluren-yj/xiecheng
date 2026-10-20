// 引用价格库弹窗

import React, { Fragment, useMemo, useRef } from 'react';
import { DataSet, Button, Modal, Table, Form, Lov, Select } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { flowRight } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

// import ExcelExport from 'components/ExcelExport';
import { precisionRender } from '@/utils/precision';
import { openCatalog, openCategory } from '@/routes/pageTree';
import OverflowTip from '@/routes/components/OverflowTip';
import QueryField from '@/routes/product/SkuWorkbench/QueryField';
import { getTableDs, getCreateDs } from './ds';
import { createSkuByPriceLibs } from './api';

import styles from './styles.less';

const organizationId = getCurrentOrganizationId();
const userOrganizationId = getUserOrganizationId();

const tableCustomizeCode = 'SAGM.PRICE_LIB.LIST';
const skuCode = ['SMPC.PRICE_LIB_SUP.SUP_SKU_FORM', 'SMPC.PRICE_LIB.PUR_SKU_FORM'];
const CreateBtn = observer(({ dataSet, onClick }) => {
  return (
    <Button color="primary" onClick={onClick} disabled={!dataSet || dataSet.selected.length < 1}>
      {intl.get('hzero.common.button.create').d('新建')}
    </Button>
  );
});

// 弹窗｜路由
const _QuoteTable = (props) => {
  const { dataSet, searchCode, customizedCode, customizeTable } = props;

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
          customizedCode="priceLib.companys"
          style={{ maxHeight: 'calc(100vh - 160px)' }}
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
          style={{ maxHeight: 'calc(100vh - 160px)' }}
          dataSet={ds}
          customizedCode="priceLib.ladderPrice"
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
        />
      ),
    });
  }

  const columns = useMemo(
    () => [
      {
        name: 'effectiveFlagMeaning',
        width: 100,
        renderer: ({ text, record }) => {
          const effectiveFlag = record.get('effectiveFlag');
          const color = effectiveFlag === 0 ? 'gray' : effectiveFlag === 1 ? 'green' : 'yellow';
          return (
            <Tag color={color} style={{ border: 'none' }}>
              {text}
            </Tag>
          );
        },
      },
      {
        name: 'priceLibNumber',
        width: 180,
        tooltip: 'none',
        className: styles['priceLib-number-column'],
        renderer: ({ text, record }) => {
          const errMsg = record.get('errorMessageMeaning');
          return (
            <div>
              <div>{text || '-'}</div>
              {errMsg && <OverflowTip style={{ color: 'red' }}>{errMsg}</OverflowTip>}
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
          { name: 'supplierCompanyName' },
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

  return customizeTable(
    { code: customizedCode || tableCustomizeCode },
    <SearchBarTable
      // className={styles['price-lib-table']}
      aggregation
      dataSet={dataSet}
      columns={columns}
      searchCode={searchCode}
      style={{ maxHeight: 'calc(100vh - 155px)' }}
      searchBarConfig={{
        expandable: false,
        closeFilterSelector: true,
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
      }}
    />
  );
};

export const QuoteTable = flowRight(
  withCustomize({ unitCode: [tableCustomizeCode, 'SMPC.PRICE_LIB.LIST'] }),
  formatterCollections({ code: ['small.common', 'sagm.common', 'smpc.product'] })
)(_QuoteTable);

const SkuForm = withCustomize({ unitCode: skuCode })((props) => {
  const { customizeForm, ds, isSup } = props;
  const code = isSup ? 'SMPC.PRICE_LIB_SUP.SUP_SKU_FORM' : 'SMPC.PRICE_LIB.PUR_SKU_FORM';
  return customizeForm(
    {
      code,
    },
    <Form dataSet={ds} labelLayout="float" column={1}>
      <Lov
        name="categoryLov"
        onClick={() => openCategory({ name: 'categoryLov', record: ds.current })}
      />
      <Lov
        name="catalogLov"
        onClick={() => openCatalog({ name: 'catalogLov', record: ds.current })}
      />
      <Select name="templateId" />
    </Form>
  );
});

// 生成dataSet
function getDataSet({ filterDs, searchCode, customizedCode }) {
  const _customizedCode = customizedCode || tableCustomizeCode;
  const tableDs = new DataSet(getTableDs(filterDs));
  const createDs = new DataSet(getCreateDs());
  tableDs.setQueryParameter('tenantId', organizationId);
  if (organizationId !== userOrganizationId) {
    tableDs.setQueryParameter('supplierTenantId', userOrganizationId);
  }
  if (filterDs) {
    const existMatchIds = filterDs.toData().map((m) => m.sourceFromNumber || m.sourceFromId);
    tableDs.setQueryParameter('existMatchIds', existMatchIds);
  }
  tableDs.setQueryParameter('customizeUnitCode', `${searchCode},${_customizedCode}`);
  return { tableDs, createDs };
}

// 引用价格库创建商品
function createSku({ tableDs, createDs, isSup, afterSuccess }) {
  const data = dataValidate(tableDs);
  if (!data) return false;
  // 初始化表单ds
  (() => {
    createDs.current.reset();
    const [{ catalogId, catalogName, categoryId, categoryName }] = data;
    const isCatalog = data.every((e) => e.catalogId && e.catalogId === catalogId);
    const isCategory = data.every((e) => e.categoryId && e.categoryId === categoryId);
    if (isCatalog) createDs.current.set('catalogLov', { catalogId, catalogName });
    if (isCategory) createDs.current.set('categoryLov', { categoryId, categoryName });
  })();

  Modal.open({
    drawer: true,
    style: { width: 380 },
    title: intl.get('small.common.view.title.createSkuByPriceLib').d('引用价格库创建商品'),
    children: <SkuForm ds={createDs} isSup={isSup} />,
    onOk: async () => {
      const flag = await createDs.validate();
      if (flag) {
        const { categoryId, catalogId, templateId } = createDs.current.toData();
        const { content } = createDs.getField('templateId').getLookupData(templateId) || {};
        const params = data.map((m) => ({ ...m, details: content, categoryId, catalogId }));
        const res = getResponse(await createSkuByPriceLibs(params));
        if (res) {
          afterSuccess(res);
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
  });
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
  create: ({ searchCode: code, customizedCode, isSup, afterSuccess = (e) => e }) => {
    // 商城协议工作台-引用价格库： SAGM.PRICE_LIB.SEARCH_BAR
    const searchCode = code || (isSup ? 'SMPC.PRICE_LIB_SUP.SEARCH' : 'SAGM.PRICE_LIB.SEARCH_BAR');
    const { tableDs, createDs } = getDataSet({ searchCode, customizedCode });
    const title = intl.get('sagm.common.view.title.priceLibCreateSku').d('引用价格库新建商品');
    const modal = Modal.open({
      title,
      drawer: true,
      style: { width: 1090 },
      footer: (
        <Fragment>
          <CreateBtn
            dataSet={tableDs}
            onClick={async () => createSku({ tableDs, createDs, isSup, afterSuccess })}
          />
          <Button onClick={() => modal.close()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </Fragment>
      ),
      children: (
        <QuoteTable dataSet={tableDs} searchCode={searchCode} customizedCode={customizedCode} />
      ),
    });
    return modal;
  },
};
