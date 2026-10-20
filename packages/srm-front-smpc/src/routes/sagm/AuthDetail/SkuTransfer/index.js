import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, filterNullValueObject } from 'utils/utils';

import { precisionRender } from '@/routes/product/utilsApi/precision';
import { openPriceInfo, openLadderPrice } from './openPrices';
import { openSkuDetail } from '@/utils/openCommonTab';
import FilterForm from './FilterForm';
import style from './index.less';

const tableDs = (url, initParams, isCheckBox = 'true') => ({
  selection: isCheckBox ? 'multiple' : false,
  autoQuery: false,
  fields: [
    { name: 'supplierCompanyName', label: intl.get('sagm.common.model.supplier').d('供应商') },
    { name: 'skuCode', label: intl.get('sagm.common.model.productCode').d('商品编码') },
    { name: 'skuName', label: intl.get('sagm.common.model.productName').d('商品名称') },
    { name: 'categoryName', label: intl.get('sagm.common.model.plateformCategory').d('平台分类') },
    { name: 'catalogName', label: intl.get('sagm.common.model.catalog').d('目录') },
    {
      name: 'agreementPrice',
      type: 'number',
      label: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
    },
    {
      name: 'nakedPrice',
      type: 'number',
      label: intl.get('sagm.common.view.price.noTax').d('单价(不含税)'),
    },
    { name: 'uomName', label: intl.get('sagm.common.model.uom').d('单位') },
    { name: 'agreementNumber', label: intl.get('sagm.common.model.agreementNum').d('协议号') },
    {
      name: 'agreementLineNumber',
      label: intl.get('sagm.common.model.lineNumber').d('行号'),
      type: 'number',
    },
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

const ModalTable = (props) => {
  const { width, ...otherProps } = props;
  const [update, setUpdate] = React.useState();
  const tableRef = React.useRef();
  React.useEffect(() => {
    setUpdate('update');
  }, []);
  React.useEffect(() => {
    if (width) {
      tableRef.current.tableStore.width = width;
    }
  }, [update]);
  return <Table {...otherProps} style={{ width }} ref={tableRef} />;
};

export default class Transfer extends Component {
  constructor(props) {
    super(props);
    const {
      leftInfo: { url: leftUrl, params: leftParams = {} } = {},
      rightInfo: { url: rightUrl, params: rightParams = {} } = {},
      readOnly = false,
      addColumns = [],
    } = props;
    this.skuSourceDs = new DataSet(tableDs(leftUrl, leftParams));
    this.skuAssignDs = new DataSet(tableDs(rightUrl, rightParams, !readOnly));

    addColumns.forEach((field) => {
      this.skuSourceDs.addField(field.name, field);
      this.skuAssignDs.addField(field.name, field);
    });
  }

  state = {
    joinLoading: false,
    delLoading: false,
  };

  form;

  handleBindRef = (ref = {}) => {
    this.form = ref.props.form || {};
  };

  async componentDidMount() {
    const { queryRequired = true, onSkuChange = (e) => e } = this.props;
    if (!queryRequired) {
      this.handleSearch();
    }
    await this.skuAssignDs.query();
    onSkuChange({}, this.skuAssignDs.totalCount);
  }

  handleSearch = () => {
    const { readOnly } = this.props;
    if (!readOnly) {
      const { validateFields } = this.form;
      validateFields((err, values) => {
        if (!err) {
          this.skuSourceDs.setQueryParameter('filterParams', filterNullValueObject(values));
          this.skuSourceDs.query();
          this.skuAssignDs.setQueryParameter('filterParams', filterNullValueObject(values));
          this.skuAssignDs.query();
        }
      });
    }
  };

  handleViewSku = (record) => {
    const { backPath } = this.props;
    openSkuDetail({
      record,
      backPath,
      type: backPath?.includes('-sup') ? 'sup' : 'pur',
    });
  };

  handleJoin = async () => {
    const { params, onJoin = () => new Promise(), onSkuChange = (e) => e } = this.props;
    const list = this.skuSourceDs.selected.map((record) => ({
      ...record.toData(),
      ...params,
    }));

    this.setState({ joinLoading: true });
    const res = await onJoin(list);
    this.setState({ joinLoading: false });
    const result = getResponse(res);
    if (result) {
      onSkuChange(result, 1);
      notification.success();
      this.skuSourceDs.query();
      this.skuAssignDs.query();
    }
  };

  handleDelete = async () => {
    const {
      onDelete = () => new Promise(),
      queryRequired = true,
      onSkuChange = (e) => e,
    } = this.props;
    const { getFieldsValue } = this.form;
    const { skuName, cId, supplierCompanyId } = getFieldsValue();
    const isSearch = skuName || cId || supplierCompanyId;
    const list = this.skuAssignDs.selected.map((record) => record.toData());

    this.setState({ delLoading: true });
    const res = await onDelete(list);
    this.setState({ delLoading: false });
    const result = getResponse(res);
    if (result) {
      const hasSku = this.skuAssignDs.totalCount - list.length;
      onSkuChange(result, hasSku);
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

  rendererPrices = ({ name, record }) => {
    const priceList = record.get('productPoolList') || [];
    const priceInfo = priceList[0] || {};
    // 价格信息不为一或者为类型为阶梯价格，未税单价不展示
    if (name !== 'nakedPrice' && (priceList.length !== 1 || priceInfo.ladderEnableFlag)) {
      return undefined;
    }
    // 价格信息小于二，同时类型不为阶梯价格
    if (priceList.length < 2 && !priceInfo.ladderEnableFlag) {
      return precisionRender({ name, recordData: priceInfo });
    } else if (priceList.length < 2 && priceInfo.ladderEnableFlag) {
      return (
        <a onClick={() => openLadderPrice(priceInfo.productPoolLadderList)}>
          {intl.get('sagm.common.model.ladderPrice').d('阶梯价格')}
        </a>
      );
    }
    return (
      <a onClick={() => openPriceInfo(priceList)}>
        {intl.get('sagm.common.model.priceInfo').d('价格信息')}
      </a>
    );
  };

  renderAgreementLineOrNumber = ({ name, record }) => {
    const priceList = record.get('productPoolList') || [];
    return priceList.length > 1 ? '-' : (priceList[0] || {})[name];
  };

  getColumns = () => {
    const columns = [
      { name: 'skuCode', width: 120 },
      { name: 'skuName', minWidth: 200 },
      { name: 'categoryName', width: 120 },
      {
        name: 'catalogName',
        width: 150,
        label: intl.get('sagm.common.model.catalog').d('目录'),
        tooltip: 'overflow',
      },
      {
        name: 'uomName',
        width: 80,
        renderer: ({ record }) => {
          const priceList = record.get('productPoolList') || [];
          const { uomName } = priceList[0] || {};

          return priceList.length > 1 ? undefined : uomName;
        },
      },
      { name: 'nakedPrice', width: 120, renderer: this.rendererPrices },
      { name: 'agreementPrice', width: 120, renderer: this.rendererPrices },
      {
        name: 'agreementNumber',
        width: 120,
        renderer: this.renderAgreementLineOrNumber,
      },
      {
        name: 'agreementLineNumber',
        width: 50,
        renderer: this.renderAgreementLineOrNumber,
      },
      {
        name: 'option',
        width: 80,
        align: 'center',
        lock: 'right',
        renderer: ({ record: r }) => (
          <a onClick={() => this.handleViewSku(r)}>
            {intl.get('sagm.common.model.look').d('查看')}
          </a>
        ),
      },
    ];
    return columns.filter((f) => f.show !== false);
  };

  render() {
    const { readOnly, queryRequired = true, queryFields = [] } = this.props;
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

    const columns = this.getColumns();

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
              <ModalTable width={450} dataSet={this.skuSourceDs} columns={columns} />
            </div>
            <div className="transfer-btns">
              <JoinButton dataSet={this.skuSourceDs} />
              <DelButton dataSet={this.skuAssignDs} />
            </div>
            <div className="right-table">
              <p>{intl.get('sagm.common.view.assignedSku').d('已分配商品')}</p>
              <ModalTable width={450} dataSet={this.skuAssignDs} columns={columns} />
            </div>
          </div>
        )}
      </div>
    );
  }
}
