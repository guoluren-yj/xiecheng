import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { Tabs, Tag } from 'choerodon-ui';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import qs from 'qs';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import style from './index.less';

const organizationId = getCurrentOrganizationId();

const code = 'SAGM.SALE_AGREEMENT.LIST.ALL';

const tableDs = (statusCode) => ({
  selection: false,
  autoQuery: false,
  queryFields: [
    {
      name: 'agreementHeaderCodeName',
      type: 'string',
      label: intl.get('sagm.saleAgreement.model.agreementNumName').d('协议编号/名称'),
    },
    {
      name: 'agreementHeaderType',
      label: intl.get('sagm.saleAgreement.model.agreementType').d('协议类型'),
      lookupCode: 'SAGM.AGREEMENT_HEADER_TYPE',
    },
    // {
    //   name: 'supplier',
    //   type: 'object',
    //   ignore: 'always',
    //   lovCode: 'SMAL.PRODUCT_SUPPLIER',
    //   lovPara: { companyId: -1, tenantId: organizationId },
    //   valueField: 'supplierCompanyId',
    //   textField: 'supplierCompanyName',
    //   label: intl.get('sagm.common.model.supplier').d('供应商'),
    // },
    // {
    //   name: 'originalSupplierCompanyId',
    //   bind: 'supplier.supplierCompanyId',
    // },
  ],
  fields: [
    { name: 'statusCodeMeaning', label: intl.get('hzero.common.status').d('状态') },
    {
      name: 'agreementHeaderNum',
      label: intl.get('sagm.saleAgreement.model.agreementNum').d('协议编号'),
    },
    {
      name: 'agreementHeaderName',
      label: intl.get('sagm.saleAgreement.model.agreementName').d('协议名称'),
    },
    {
      name: 'originalSupplierTypeMeaning',
      label: intl.get('sagm.saleAgreement.view.sourceSupplierType').d('原始供应商类型'),
    },
    {
      name: 'originalSupplierCompanyName',
      label: intl.get('sagm.saleAgreement.view.sourceSupplierName').d('原始供应商名称'),
    },
    {
      name: 'showSupplierTypeMeaning',
      label: intl.get('sagm.saleAgreement.view.showMainBody').d('展示主体'),
    },
    {
      name: 'proxyCompanyName',
      label: intl.get('sagm.saleAgreement.view.saleMainBody').d('销售主体'),
    },
    {
      name: 'agreementHeaderTypeMeaning',
      label: intl.get('sagm.saleAgreement.model.agreementType').d('协议类型'),
    },
    {
      name: 'creationDate',
      label: intl.get('sagm.common.model.creationTime').d('创建时间'),
    },
    {
      name: 'purchaseAgreementCode',
      label: intl.get('sagm.saleAgreement.view.sourceNum').d('来源单据'),
    },
  ],

  transport: {
    read({ data }) {
      return {
        url: `/sagm/v1/${organizationId}/sale-agreement-headers`,
        method: 'GET',
        data: { ...data, statusCode, customizeUnitCode: code },
      };
    },
  },
});

@withProps(
  () => {
    return {
      ALL: new DataSet(tableDs()), // 全部
      NEW: new DataSet(tableDs('NEW')), // 待发布
      EFFECTED: new DataSet(tableDs('EFFECTED')), // 生效
      TO_BE_EFFECTIVE: new DataSet(tableDs('TO_BE_EFFECTIVE')), // 待生效
      EXPIRED: new DataSet(tableDs('EXPIRED')), // 失效
    };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
class StatusTable extends Component {
  componentDidMount() {
    const { dsKey } = this.props;
    const ds = this.props[dsKey];
    ds.query(ds.currentPage);
  }

  render() {
    const { dsKey, columns, customizeTable } = this.props;
    const ds = this.props[dsKey];
    return customizeTable({ code }, <Table columns={columns} dataSet={ds} />);
  }
}

@withCustomize({ unitCode: [code] })
@formatterCollections({ code: ['sagm.common', 'sagm.saleAgreement'] })
export default class SaleAgreement extends Component {
  constructor(props) {
    super(props);
    const { search } = props.location;
    const { statusCode = 'ALL' } = qs.parse(search.substr(1));
    const _statusCode = ['ALL', 'NEW', 'EFFECTED', 'EXPIRED', 'TO_BE_EFFECTIVE'].includes(
      statusCode
    )
      ? statusCode
      : 'ALL';
    this.state = {
      statusCode: _statusCode,
    };
  }

  @Bind
  handleTabChange(key) {
    const {
      history: { push },
    } = this.props;
    push(`/s2-mall/sagm/sale-agreement/list?statusCode=${key}`);
    this.setState({
      statusCode: key,
    });
  }

  getColumns = (hasStatus) => {
    let columns = [
      {
        name: 'agreementHeaderNum',
        width: 200,
        renderer: ({ text, record }) => <a onClick={() => this.handleViewDetail(record)}>{text}</a>,
      },
      { name: 'agreementHeaderName', minWidth: 260 },
      // { name: 'originalSupplierTypeMeaning', width: 130 },
      // { name: 'originalSupplierCompanyName', minWidth: 130 },
      // { name: 'showSupplierTypeMeaning', width: 150 },
      { name: 'proxyCompanyName', minWidth: 200 },
      { name: 'agreementHeaderTypeMeaning', width: 180 },
      { name: 'creationDate', width: 200 },
      // { name: 'purchaseAgreementCode', width: 180 },
    ];
    if (hasStatus) {
      columns = [{ name: 'statusCodeMeaning', width: 100, renderer: this.getTag }, ...columns];
    }
    return columns;
  };

  @Bind
  getTag({ record }) {
    const { statusCode, statusCodeMeaning } = record.toData();
    const colors = {
      NEW: ['rgba(48,149,242,0.10)', '#3095F2'],
      EFFECTED: ['rgba(71,184,129,0.10)', '#47B881'],
      EXPIRED: ['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.85)'],
    };
    const [bgColor, fontColor] = colors[statusCode] || ['', ''];
    return (
      <Tag color={bgColor} style={{ color: fontColor, fontWeight: 600, cursor: 'text' }}>
        {statusCodeMeaning}
      </Tag>
    );
  }

  @Bind
  handleCreate() {
    this.props.history.push(`/s2-mall/sagm/sale-agreement/detail/edit`);
  }

  @Bind
  handleViewDetail(record) {
    const { statusCode } = this.state;
    const { agreementHeaderId, statusCode: _statusCode } = record.toData();
    // const type = originalSupplierType === 'EC' ? 'ec' : 'cata';
    const status = 'edit';
    this.props.history.push({
      pathname: `/s2-mall/sagm/sale-agreement/detail/${status}`,
      search: `agreementHeaderId=${agreementHeaderId}`,
      state: {
        backPath: `/s2-mall/sagm/sale-agreement/list?statusCode=${statusCode}`,
        isTitleB: _statusCode === 'NEW',
      },
    });
  }

  @Bind
  getTabs() {
    const { customizeTable } = this.props;
    const { statusCode } = this.state;
    const tabs = [
      { key: 'ALL', tab: intl.get('sagm.common.model.all').d('全部') },
      { key: 'NEW', tab: intl.get('sagm.common.model.waitPublish').d('待发布') },
      { key: 'EFFECTED', tab: intl.get('sagm.common.model.effected').d('生效') },
      { key: 'TO_BE_EFFECTIVE', tab: intl.get('sagm.common.model.waitEffect').d('待生效') },
      { key: 'EXPIRED', tab: intl.get('sagm.common.model.expired').d('失效') },
    ];
    return (
      <Tabs animated={false} activeKey={statusCode} onChange={this.handleTabChange}>
        {tabs.map((m) => (
          <Tabs.TabPane key={m.key} tab={m.tab}>
            <StatusTable
              columns={this.getColumns(m.key === 'ALL')}
              dsKey={m.key}
              customizeTable={customizeTable}
            />
          </Tabs.TabPane>
        ))}
      </Tabs>
    );
  }

  render() {
    return (
      <Fragment>
        <Header title={intl.get('sagm.saleAgreement.view.saleAgreement.manage').d('销售协议管理')}>
          <Button icon="add" color="primary" onClick={() => this.handleCreate()}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {/* <Button icon="playlist_add" funcType="flat" onClick={() => this.handleCreate('cata')}>
            {intl.get('sagm.saleAgreement.button.cataSaleAgreement.create').d('新建目录化销售协议')}
          </Button>
          <Button icon="playlist_add" funcType="flat" onClick={() => this.handleCreate('ec')}>
            {intl.get('sagm.saleAgreement.button.ecSaleAgreement.create').d('新建电商销售协议')}
          </Button> */}
        </Header>
        <Content className={style['sale-agreement-content']}>{this.getTabs()}</Content>
      </Fragment>
    );
  }
}
