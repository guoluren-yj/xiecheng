import React from 'react';
import qs from 'querystring';
import { DataSet, Table, Select } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { openTab } from 'utils/menuTab';
import { getUserOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import { getSkuImagePath } from '@/utils/utils';
import Image from '@/components/Image';

import { tableDs, queryDs } from './ds.js';
import { statusColumn } from '../SkuWorkbench/tableColumns';
import style from './index.less';

const userOrgId = getUserOrganizationId();

@formatterCollections({ code: ['smpc.productQuery', 'smpc.product'] })
@withProps(
  () => ({
    ds: new DataSet(tableDs()),
  }),
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class ProductQuery extends React.Component {
  constructor(props) {
    super(props);
    const {
      ds,
      location: { pathname },
    } = props;
    const isSup = pathname.includes('sku-query-sup');
    const prefixUrl = pathname.split('/list')[0];
    const title = isSup
      ? intl.get('smpc.productQuery.model.supTittle').d('商品查询（供）')
      : intl.get('smpc.productQuery.model.purTittle').d('商品查询（采）');

    const queryFields = new DataSet(queryDs(isSup));
    ds.queryDataSet = queryFields;
    ds.setQueryParameter('isSup', isSup);
    if (isSup) {
      ds.setQueryParameter('supplierTenantId', userOrgId);
    }
    this.state = {
      isSup,
      title,
      prefixUrl,
      currentPath: pathname,
    };
  }

  componentDidMount() {
    const { ds } = this.props;
    ds.query(ds.currentPage);
  }

  @Bind()
  handleViewDetail(record) {
    const { history } = this.props;
    const { prefixUrl } = this.state;
    const { spuId, skuId, purSkuStatus } = record.toData();
    const req = purSkuStatus === 7 ? 'new' : '';
    history.push({
      pathname: `${prefixUrl}/detail`,
      search: qs.stringify({
        req,
        spuId,
        skuId,
        anchor: 'QUERY',
      }),
    });
  }

  @Bind
  handlePreview(record) {
    const { currentPath } = this.state;
    const { skuId: productId, sourceFrom, purSkuStatus } = record.toData();
    const req = purSkuStatus === 7 ? 'new' : '';
    openTab({
      key: '/smpc/sku-preview',
      title: 'srm.common.view.skuPreview',
      search: qs.stringify({
        req,
        productId,
        sourceFrom,
        backPath: currentPath,
      }),
    });
  }

  @Bind()
  renderSkuInfo(info) {
    return (
      <div className="product-query-info">
        <Image className="img" value={info.mediaPath} />
        <div className="text-wrapper">
          <p title={info.skuName} className="product-name">
            {info.skuName}
          </p>
          <p>
            <span>{`v${info.versionNum || 1}`}</span>
            <span>{info.spuCode}</span>
            <span title={info.categoryNamePath}>{info.categoryNamePath}</span>
          </p>
        </div>
      </div>
    );
  }

  @Bind()
  renderItemInfo({ record }) {
    return (
      <div className="list-wrapper">
        <p title={record.get('itemCode')}>
          {intl.get('smpc.product.model.item.code').d('物料编码')}：{record.get('itemCode')}
        </p>
        <p title={record.get('itemName')}>
          {intl.get('smpc.product.model.item.name').d('物料名称')}：{record.get('itemName')}
        </p>
      </div>
    );
  }

  @Bind()
  renderCompanyInfo({ record }) {
    return (
      <div className="list-wrapper">
        <p title={record.get('supplierCompany')}>
          {intl.get('smpc.product.model.sup').d('供')}：{record.get('supplierCompany')}
        </p>
        <p title={record.get('purchaserCompany')}>
          {intl.get('smpc.product.model.pur').d('采')}：{record.get('purchaserCompany')}
        </p>
      </div>
    );
  }

  @Bind()
  getColumns() {
    const { isSup } = this.state;
    const filterKey = isSup ? 2 : 1;
    const columns = [
      statusColumn(),
      {
        name: 'skuCode',
        width: 120,
      },
      {
        name: 'skuInfo',
        minWidth: 450,
        tooltip: 'none',
        renderer: ({ record }) =>
          this.renderSkuInfo({
            mediaPath: getSkuImagePath(record),
            skuName: record.get('skuName'),
            spuCode: record.get('spuCode'),
            versionNum: record.get('versionNum'),
            categoryNamePath: record.get('categoryNamePath'),
          }),
      },
      {
        name: 'itemInfo',
        width: 200,
        renderer: this.renderItemInfo,
        filters: [1],
      },
      {
        name: 'supplierCompanyName',
        width: 240,
        filters: [1],
      },
      {
        name: 'operation',
        width: 140,
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handlePreview(record)}>
                {intl.get(`smpc.product.model.preview`).d('预览')}
              </a>
              {record.get('sourceFrom') === 'CATA' && (
                <a onClick={() => this.handleViewDetail(record)}>
                  {intl.get('hzero.common.button.details').d('查看详情')}
                </a>
              )}
            </span>
          );
        },
      },
    ];
    return columns.filter((f) => {
      const { filters = [1, 2] } = f;
      return filters.includes(filterKey);
    });
  }

  render() {
    const { title } = this.state;
    return (
      <React.Fragment>
        <Header title={title} />
        <Content className={style['small-custom-c7n-page']}>
          <Table
            dataSet={this.props.ds}
            rowHeight="auto"
            columns={this.getColumns()}
            queryFields={{
              skuType: <Select clearButton={false} />,
            }}
          />
        </Content>
      </React.Fragment>
    );
  }
}
