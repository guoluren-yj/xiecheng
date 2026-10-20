import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import Lov from 'components/Lov';
// import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import cacheComponent from 'components/CacheComponent';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';

import { tableDs, historyDs } from './ListDs';
import { fetchCurrentCompany } from './api';

@formatterCollections({
  code: ['small.common', 'small.afterSaleManage'],
})
@connect(({ loading }) => ({
  loading: loading.effects['companyPriceBaseGoodsMatchingPur/fetchList'],
}))
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/small/after-sale-manage/list' })
export default class AfterSaleManage extends Component {
  state = {
    currentCompany: {}, // 当前公司
  };

  _modal;

  tableDs = new DataSet(tableDs());

  historyDs = new DataSet(historyDs());

  columns = [
    {
      name: 'afterSaleNum',
      width: 150,
    },
    {
      name: 'poNum',
      width: 200,
    },
    {
      name: 'productNum',
      width: 140,
    },
    {
      name: 'productName',
      minWidth: 200,
    },
    {
      name: 'applyQuantity',
      width: 80,
    },
    {
      name: 'afsTypeName',
      width: 90,
    },
    {
      name: 'applicationTime',
      width: 160,
    },
    {
      name: 'manageStatusName',
      width: 140,
    },
    {
      name: 'realName',
      width: 100,
    },
    {
      name: 'options',
      lock: 'right',
      width: 200,
      renderer: this.renderOptions,
    },
  ];

  @Bind()
  renderOptions({ record }) {
    return (
      <span className="action-link">
        <a onClick={() => this.handleViewDetail(record)}>
          {intl.get('small.afterSaleManage.view.checkDetail').d('查看详情')}
        </a>
        <a onClick={() => this.showHistory(record)}>
          {intl.get('small.afterSaleManage.view.history').d('操作记录')}
        </a>
      </span>
    );
  }

  componentDidMount() {
    this.initData();
  }

  @Bind()
  async initData() {
    const { companyId } = this.props.form.getFieldsValue();
    const res = await fetchCurrentCompany();
    const result = getResponse(res);
    if (result && !companyId) {
      const { content = [] } = result;
      const currentCompany = content && content.length ? content[0] : {};
      this.setState({ currentCompany }, this.fetchList);
    } else {
      this.fetchList();
    }
  }

  hColumns = [
    {
      name: 'operatedName',
      width: 80,
    },
    {
      name: 'operatedDate',
      width: 160,
    },
    {
      name: 'operatedRemark',
      minWidth: 200,
    },
  ];

  @Bind()
  showHistory(record) {
    this.historyDs.setQueryParameter('afterSaleId', record.get('afterSaleId'));
    this.historyDs.query();
    this._modal = Modal.open({
      destroyOnClose: true,
      title: intl.get('small.afterSaleManage.view.history').d('操作记录'),
      mask: true,
      drawer: true,
      closable: true,
      footer: null,
      children: <Table dataSet={this.historyDs} columns={this.hColumns} />,
    });
  }

  @Bind()
  handleAddRecord() {
    this.props.history.push(`/small/after-sale-manage/create`);
  }

  @Bind()
  handleViewDetail(record) {
    this.props.history.push(`/small/after-sale-manage/detail/${record.get('afterSaleId')}`);
  }

  /**
   * 切换公司
   * @param {*} lovRecord
   */
  @Bind()
  changeCurrentCompany(lovRecord = {}) {
    const {
      currentCompany: { companyId: prevCompanyId },
    } = this.state;
    const { companyId, companyName } = lovRecord;
    if (prevCompanyId !== companyId) {
      this.setState({ currentCompany: { companyId, companyName } }, this.fetchList);
    }
  }

  @Bind()
  fetchList() {
    const {
      currentCompany: { companyId },
    } = this.state;
    this.tableDs.setQueryParameter('supplierCompanyId', companyId);
    this.tableDs.query(this.tableDs.currentPage);
  }

  render() {
    const { form } = this.props;
    const { companyId, companyName } = this.state.currentCompany;
    return (
      <React.Fragment>
        <Header title={intl.get('small.afterSaleManage.view.title').d('售后管理')}>
          {/* <Button type='primary' onClick={this.handleAddRecord}>线下售后补录</Button> */}
          <Form layout="inline">
            <Form.Item label={intl.get('small.afterSaleManage.model.currentCompany').d('当前公司')}>
              {form.getFieldDecorator('companyId', {
                initialValue: companyId,
              })(
                <Lov
                  allowClear={false}
                  textValue={companyName}
                  textField="companyName"
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  onChange={(_, lovRecord) => this.changeCurrentCompany(lovRecord)}
                />
              )}
            </Form.Item>
          </Form>
        </Header>
        <Content>
          <Table dataSet={this.tableDs} columns={this.columns} />
        </Content>
      </React.Fragment>
    );
  }
}
