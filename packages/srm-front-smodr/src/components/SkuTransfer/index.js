import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import qs from 'querystring';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import { getResponse, filterNullValueObject } from 'utils/utils';

import FilterForm from './FilterForm';
import style from './index.less';

const tableDs = (url, initParams, isCheckBox = 'true') => ({
  selection: isCheckBox ? 'multiple' : false,
  autoQuery: false,
  fields: [
    { name: 'supplierCompanyName', label: intl.get('sagm.common.model.supplier').d('供应商') },
    { name: 'skuCode', label: intl.get('sagm.common.model.productCode').d('商品编码') },
    { name: 'skuName', label: intl.get('sagm.common.model.productName').d('商品名称') },
    { name: 'uomName', label: intl.get('sagm.common.model.uom').d('单位') },
    { name: 'categoryName', label: intl.get('sagm.common.model.plateformCategory').d('平台分类') },
    { name: 'option', label: intl.get('hzero.common.action').d('操作') },
  ],
  transport: {
    read({ data }) {
      const { filterParams = {} } = data;
      return {
        url,
        method: 'GET',
        data: { ...filterParams, ...initParams },
      };
    },
  },
});

export default class Transfer extends Component {
  constructor(props) {
    super(props);
    const {
      leftInfo: { url: leftUrl, params: leftParams = {} } = {},
      rightInfo: { url: rightUrl, params: rightParams = {} } = {},
      readOnly = false,
    } = props;
    this.skuSourceDs = new DataSet(tableDs(leftUrl, leftParams));
    this.skuAssignDs = new DataSet(tableDs(rightUrl, rightParams, !readOnly));
  }

  state = {
    joinLoading: false,
    delLoading: false,
  };

  form;

  handleBindRef = (ref = {}) => {
    this.form = ref.props.form || {};
  };

  componentDidMount() {
    const { queryRequired = true } = this.props;
    if (!queryRequired) {
      this.handleSearch();
    }
    this.skuAssignDs.query();
  }

  handleSearch = () => {
    const { readOnly } = this.props;
    if (!readOnly) {
      const { validateFields } = this.form;
      validateFields((err, values) => {
        if (!err) {
          this.skuSourceDs.setQueryParameter('filterParams', filterNullValueObject(values));
          this.skuSourceDs.query();
        }
      });
    }
  };

  handleViewSku = (record) => {
    const { backPath } = this.props;
    const { skuId: productId, sourceFrom, agreementLineId } = record.toData();
    openTab({
      key: `/small/commom-goods-preview`,
      title: 'sagm.common.button.previewGoods',
      search: qs.stringify({
        productId,
        sourceFrom,
        companyId: -1,
        agreementLineId: agreementLineId || -1,
        backPath: backPath || '/s2-mall/sagm/price-strategy',
      }),
    });
  };

  handleJoin = async () => {
    const { params, onJoin = () => new Promise() } = this.props;
    const list = this.skuSourceDs.selected.map((record) => ({
      ...record.toData(),
      ...params,
    }));

    this.setState({ joinLoading: true });
    const res = await onJoin(list);
    this.setState({ joinLoading: false });
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.skuSourceDs.query();
      this.skuAssignDs.query();
    }
  };

  handleDelete = async () => {
    const { onDelete = () => new Promise(), queryRequired = true } = this.props;
    const { getFieldsValue } = this.form;
    const { skuName, cId, supplierCompanyId } = getFieldsValue();
    const isSearch = skuName || cId || supplierCompanyId;
    const list = this.skuAssignDs.selected.map((record) => record.toData());

    this.setState({ delLoading: true });
    const res = await onDelete(list);
    this.setState({ delLoading: false });
    const result = getResponse(res);
    if (result) {
      notification.success();
      if (queryRequired) {
        if (isSearch) {
          this.skuSourceDs.query();
        }
      } else {
        this.skuSourceDs.query();
      }
      this.skuAssignDs.query();
    }
  };

  render() {
    const { readOnly, queryRequired = true, queryFields = [], isShowSupplier = true } = this.props;
    const { joinLoading, delLoading } = this.state;
    const JoinButton = observer(({ dataSet }) => (
      <Button
        disabled={dataSet.selected.length === 0}
        loading={joinLoading}
        style={{ marginBottom: 8 }}
        onClick={this.handleJoin}
      >
        {intl.get('sagm.common.button.join').d('加入')}&gt;
      </Button>
    ));

    const DelButton = observer(({ dataSet }) => (
      <Button
        disabled={dataSet.selected.length === 0}
        onClick={this.handleDelete}
        loading={delLoading}
      >
        &lt;
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    ));

    const initColumns = [
      // { name: 'supplierCompanyName', width: 120 },
      { name: 'skuCode', width: 120 },
      { name: 'skuName', minWidth: 200 },
      { name: 'uomName', width: 80 },
      { name: 'categoryName', width: 120 },
      {
        name: 'option',
        width: 80,
        renderer: ({ record }) => (
          <a onClick={() => this.handleViewSku(record)}>
            {intl.get('sagm.common.model.look').d('查看')}
          </a>
        ),
      },
    ];

    const columns = isShowSupplier
      ? [{ name: 'supplierCompanyName', width: 120 }, ...initColumns]
      : initColumns;

    return (
      <div className={style['transfer-wrapper']}>
        {!readOnly && (
          <FilterForm
            onRef={this.handleBindRef}
            onSearch={this.handleSearch}
            queryRequired={queryRequired}
            queryFields={queryFields}
          />
        )}
        {readOnly ? (
          <Table dataSet={this.skuAssignDs} columns={columns} />
        ) : (
          <div className="sku-tables">
            <div className="left-table">
              <p>{intl.get('sagm.common.view.agreementSkuHouse').d('协议商品库')}</p>
              <Table dataSet={this.skuSourceDs} columns={columns} />
            </div>
            <div className="transfer-btns">
              <JoinButton dataSet={this.skuSourceDs} />
              <DelButton dataSet={this.skuAssignDs} />
            </div>
            <div className="right-table">
              <p>{intl.get('sagm.common.view.assignedSku').d('已分配商品')}</p>
              <Table dataSet={this.skuAssignDs} columns={columns} />
            </div>
          </div>
        )}
      </div>
    );
  }
}
