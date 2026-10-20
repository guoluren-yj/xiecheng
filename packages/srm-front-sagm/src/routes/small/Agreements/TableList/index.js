// 采购协议只读协议行表格
import React, { PureComponent } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import { WithCustomizeC7N } from 'srm-front-cuz';
import { checkPermission } from 'services/api';

import c7nModal from '@/utils/c7nModal';
import { precisionRender } from '@/utils/precision';
import { getCustDimColumns, withCustomDimension } from '@/utils/customDimension';
import ViewLadder from '@/components/ViewLadder';
import PopoverList from '@/components/PopoverList';
import { agreementLineDS } from './tableDs';
import Skus from '../Skus';

import { PERMISSION_RECEIVE_PROTOCOL_SKU_NUMBER } from '../../const/permissionCode';

const unitCode = [
  'SMAL.AGREEMENT_MANAGEMENT.IMPORT_MANUAL_NEW',
  'SMAL.AGREEMENT_MANAGEMENT.IMOIRT_PRICE_LIB_NEW',
  'SMAL.AGREEMENT_MANAGEMENT.MANUAL_LINE_HISTORY',
  'SMAL.AGREEMENT_MANAGEMENT.PRICE_LIB_LINE_HISTORY',
];

// 商城协议审批详情协议行
@withCustomDimension(false)
@WithCustomizeC7N({
  unitCode,
})
@withRouter
export default class TableInfo extends PureComponent {
  constructor(props) {
    super(props);
    const { versionNum, agreementId, isHistory, searchFlag, baseInfo } = props;
    const url = isHistory
      ? 'v1/{organizationId}/agreement-line-hiss'
      : 'v1/{organizationId}/agreement-lines';
    this.tableDs = new DataSet(agreementLineDS(url));
    this.tableDs.setQueryParameter('agreementId', agreementId);
    this.tableDs.setQueryParameter('versionNum', versionNum);
    this.tableDs.setQueryParameter('searchFlag', searchFlag);
    if (!isHistory) {
      this.tableDs.setQueryParameter('deleteFlag', 0);
    }

    const customizeUnitCodeList = isHistory
      ? unitCode.filter((f) => f.includes('HISTORY'))
      : unitCode.filter((f) => !f.includes('HISTORY'));
    const code =
      baseInfo.sourceFrom === 'PRICE'
        ? customizeUnitCodeList.filter((f) => f.includes('PRICE_LIB'))
        : customizeUnitCodeList.filter((f) => !f.includes('PRICE_LIB'));
    this.tableDs.setQueryParameter('customizeUnitCode', code.join(','));

    this.state = {
      customizeUnitCodeList,
      skuApprove: true,
    };
  }

  async componentDidMount() {
    this.tableDs.query();
    const res = await checkPermission([PERMISSION_RECEIVE_PROTOCOL_SKU_NUMBER]);
    const isApprove = ((res || [])[0] || {}).approve;
    this.setState({ skuApprove: isApprove });
  }

  @Bind()
  renderRegion(record) {
    if (record.allRegionFlag === 1) {
      return intl.get('small.common.model.allAreas').d('所有区域');
    } else {
      const list = record.agreementRegionDTOList || [];
      const columns = [
        {
          title: intl.get('small.common.model.regionCode').d('区域编码'),
          dataIndex: 'regionCode',
          width: 120,
        },
        {
          title: intl.get('small.common.model.regionName').d('区域名称'),
          dataIndex: 'regionName',
        },
      ];
      return list.length === 1 ? (
        list[0].regionName
      ) : (
        <PopoverList
          dataSource={list}
          columns={columns}
          text={intl.get('hzero.common.button.more').d('更多')}
        />
      );
    }
  }

  @Bind()
  renderCompany(record) {
    if (record.allUnitFlag === 1) {
      return intl.get('small.common.model.allOrganization').d('所有组织');
    } else {
      const list = record.agreementUnitDTOList || [];
      const columns = [
        {
          title: intl.get('small.common.model.organizationCode').d('组织编码'),
          dataIndex: 'unitCode',
          width: 120,
        },
        {
          title: intl.get('small.common.model.organizationName').d('组织名称'),
          dataIndex: 'unitName',
        },
      ];
      return list.length === 1 ? (
        list[0].unitName
      ) : (
        <PopoverList
          dataSource={list}
          columns={columns}
          text={intl.get('hzero.common.button.more').d('更多')}
        />
      );
    }
  }

  @Bind()
  handleShowGoods(record) {
    const {
      versionNum,
      isHistory,
      isSup = false,
      isCanEdit = true,
      skuReadOnly = false,
      isCreateGo = false,
      history: { push = (e) => e } = {},
      location: { pathname, search } = {},
    } = this.props;
    const { skuApprove } = this.state;
    const { agreementLineId, supplierTenantId } = record;
    const title = intl.get('small.common.model.productInfo').d('商品信息');
    const leftUrl = `v1/{organizationId}/agreement-details/${agreementLineId}/off-line`;
    const rightUrl = isHistory
      ? `v1/{organizationId}/agreement-detail-hiss/${agreementLineId}`
      : `v1/{organizationId}/agreement-details/${agreementLineId}`;
    c7nModal({
      title,
      drawer: false,
      footer: null,
      style: { width: 1100 },
      children: (
        <Skus
          agreementLine={record}
          readOnly={skuReadOnly}
          isHistory={isHistory}
          push={push}
          isSup={isSup}
          skuApprove={skuApprove}
          isCanEdit={isCanEdit}
          isCreateGo={isCreateGo}
          backPath={`${pathname}${search || ''}`}
          leftInfo={{ url: leftUrl, params: { agreementLineId, supplierTenantId } }}
          rightInfo={{ url: rightUrl, params: { versionNum, agreementLineId } }}
          joinUrl={`v1/{organizationId}/agreement-details/${agreementLineId}`}
          deleteUrl={`v1/{organizationId}/agreement-details`}
          afterJoin={() => this.tableDs.query(this.tableDs.currentPage)}
          afterDelete={() => this.tableDs.query(this.tableDs.currentPage)}
        />
      ),
    });
  }

  @Bind()
  getColumns() {
    const { filterKeys = [], isHistory, custDimensions } = this.props;
    const ladderName = isHistory ? 'agreementLadderHiss' : 'agreementLadders';
    const custDimColumns = getCustDimColumns(this.tableDs, custDimensions, {
      readOnly: true,
      sort: 26,
    });
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
        width: 120,
      },
      {
        name: 'ladderFlag',
        width: 160,
        renderer: ({ record }) =>
          record.get('priceType') === 'LADDER_PRICE' ? (
            <ViewLadder dataSource={record.get(ladderName) || []} />
          ) : (
            ''
          ),
      },
      {
        name: 'priceHiddenFlag',
        width: 160,
        renderer: ({ record }) => record.get('priceHiddenFlagMeaning'),
        help: intl
          .get('small.common.view.hiddenPriceHelp')
          .d('开启隐藏价格则主站商品价格显示为***'),
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
        name: 'purchaseQuantityLimit',
        width: 150,
        renderer: precisionRender,
      },
      {
        name: 'purchaseAmountLimit',
        width: 150,
        renderer: precisionRender,
      },
      {
        width: 220,
        name: 'deliverRegionLov',
        renderer: ({ record }) => this.renderRegion(record.toData()),
      },
      {
        width: 220,
        name: 'buyOrganizationLov',
        renderer: ({ record }) => this.renderCompany(record.toData()),
      },
      {
        name: 'priceSourceFromNum',
        width: 130,
      },
      {
        name: 'priceSourceFromLnNum',
        width: 130,
      },
      ...custDimColumns,
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
        renderer: ({ record }) => (
          <a onClick={() => this.handleShowGoods(record.toData())}>
            {intl.get('small.common.model.product').d('商品')}({record.get('detailsFlag')})
          </a>
        ),
      },
    ];
    return columns.filter((f) => !filterKeys.includes(f.name));
  }

  render() {
    const { customizeTable, baseInfo = {} } = this.props;
    const { customizeUnitCodeList } = this.state;
    const pirceCode = customizeUnitCodeList.find((f) => f.includes('PRICE_LIB'));
    const normalCode = customizeUnitCodeList.find((f) => !f.includes('PRICE_LIB'));
    const code = baseInfo.sourceFrom === 'PRICE' ? pirceCode : normalCode;
    return (
      <React.Fragment>
        {customizeTable(
          {
            code,
          },
          <Table
            bordered
            dataSet={this.tableDs}
            columns={this.getColumns()}
            buttons={[<div key="sss" />]}
          />
        )}
      </React.Fragment>
    );
  }
}
