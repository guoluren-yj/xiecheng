import React, { Component, createRef } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, filterNullValueObject } from 'utils/utils';
import FilterBar from '_components/FilterBarTable/FilterBar';

import { precisionRender } from '@/utils/precision';
import { openSkuDetail } from '@/utils/openCommonTab';
import SelectFilter from '@/components/SelectFilter';
import { openPriceInfo, openLadderPrice } from './openPrices';
import style from './index.less';

const tableDs = (url, initParams, isCheckBox = 'true') => ({
  selection: isCheckBox ? 'multiple' : false,
  autoQuery: false,
  pageSize: 20,
  primaryKey: 'skuId',
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
      const { filterParams = {}, ...other } = data;
      return {
        url,
        method: 'GET',
        data: { ...filterParams, ...initParams, ...other },
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
  return (
    <Table
      {...otherProps}
      style={{ width, maxHeight: 'calc(100vh - 312px)' }}
      ref={tableRef}
      pagination={{ showQuickJumper: false }}
    />
  );
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
    skuType: 'CATA',
    // form: {},
  };

  cacheQueryParam = createRef({});

  async componentDidMount() {
    const { onSkuChange = (e) => e } = this.props;
    await this.skuAssignDs.query();
    onSkuChange({}, this.skuAssignDs.totalCount);
  }

  handleSearch = async (params) => {
    const { readOnly } = this.props;
    const { skuType } = this.state;
    if (!readOnly) {
      // 缓存筛选条件，切换商品来源可获取源
      if (params) {
        this.cacheQueryParam.current = params;
      }
      const _params = params || this.cacheQueryParam.current;
      this.skuSourceDs.setQueryParameter(
        'filterParams',
        filterNullValueObject({ ..._params, skuType })
      );
      //  已分配商品
      this.skuAssignDs.setQueryParameter('filterParams', filterNullValueObject(_params));
      this.skuSourceDs.query();
      this.skuAssignDs.query();
    }
  };

  handleViewSku = (record) => {
    const { backPath, tabState } = this.props;
    openSkuDetail({
      record,
      backPath,
      tabState,
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
      this.skuSourceDs.unSelectAll();
      this.skuSourceDs.clearCachedSelected();
      this.skuSourceDs.query();
      this.skuAssignDs.query();
    }
  };

  handleDelete = async () => {
    const { onDelete = () => new Promise(), onSkuChange = (e) => e } = this.props;
    const list = this.skuAssignDs.selected.map((record) => record.toData());

    this.setState({ delLoading: true });
    const res = await onDelete(list);
    this.setState({ delLoading: false });
    const result = getResponse(res);
    if (result) {
      const hasSku = this.skuAssignDs.totalCount - list.length;
      onSkuChange(result, hasSku);
      notification.success();
      this.skuAssignDs.unSelectAll();
      this.skuAssignDs.clearCachedSelected();
      this.skuSourceDs.query();
      this.skuAssignDs.query();
    }
  };

  rendererPrices = ({ name, record }) => {
    const priceList = record.get('productPoolList') || [];
    const priceInfo = priceList[0] || {};
    // 价格信息不为一或者为类型为阶梯价格，含税单价不展示
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

  handleChange = (value, isInit) => {
    this.setState({ skuType: value }, () => {
      // 下拉初始化走筛选器的查询
      if (!isInit) {
        this.handleSearch();
      }
    });
  };

  renderAgreementLineOrNumber = ({ record }) => {
    const priceList = record.get('productPoolList') || [];
    const num = (priceList[0] || {}).agreementNumber;
    const lineNum = (priceList[0] || {}).agreementLineNumber;
    if (!num && !lineNum) {
      return '-';
    }
    return priceList.length > 1 ? '-' : `${num || '-'}-${lineNum || '-'}`;
  };

  getColumns = () => {
    const { isReceive } = this.props;
    const columns = [
      {
        name: 'skuCode',
        width: 120,
        renderer: ({ value, record }) =>
          record.get('sourceFrom') === 'EC' ? (
            value
          ) : (
            <a onClick={() => this.handleViewSku(record)}>{value}</a>
          ),
      },
      { name: 'skuName', width: 200 },
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
        title: intl.get('sagm.common.model.agreementNumAndLine').d('协议号-行号'),
        width: 150,
        show: !isReceive,
        renderer: this.renderAgreementLineOrNumber,
      },
      // {
      //   name: 'agreementLineNumber',
      //   width: 50,
      //   show: !isReceive,
      //   renderer: this.renderAgreementLineOrNumber,
      // },
      // {
      //   name: 'option',
      //   width: 80,
      //   align: 'center',
      //   lock: 'right',
      //   renderer: ({ record }) => (
      //     <a
      //       onClick={() => this.handleViewSku(record)}
      //       disabled={record.get('sourceFrom') === 'EC'}
      //     >
      //       {intl.get('sagm.common.model.look').d('查看')}
      //     </a>
      //   ),
      // },
    ];
    return columns.filter((f) => f.show !== false);
  };

  render() {
    const { readOnly, queryDs, isReceive, onlyCate, rightInfo: { title } = {} } = this.props;
    const { joinLoading, delLoading } = this.state;
    // 采购协议只有目录化商品
    const JoinButton = observer(({ dataSet }) => (
      <Button
        disabled={dataSet.selected.length === 0}
        loading={joinLoading}
        onClick={this.handleJoin}
        icon="navigate_next"
      >
        {/* {intl.get('sagm.common.button.join').d('加入')} */}
      </Button>
    ));

    const DelButton = observer(({ dataSet }) => (
      <Button
        disabled={dataSet.selected.length === 0}
        onClick={this.handleDelete}
        loading={delLoading}
        icon="navigate_before"
      >
        {/* {intl.get('hzero.common.button.delete').d('删除')} */}
      </Button>
    ));

    const columns = this.getColumns();

    return (
      <div className={style['transfer-wrapper']}>
        {/* {!readOnly && (
          <C7nFilterForm
            fields={queryFields}
            ds={queryDs}
            queryFieldsLimit={queryFieldsLimit}
            onSearch={this.handleSearch}
            onRef={(ds) => {
              this.formSearchDs = ds;
            }}
          />
        )} */}
        {!readOnly && (
          <FilterBar
            dataSet={[queryDs]}
            // autoQuery={false}
            // eslint-disable-next-line no-return-assign
            onQuery={({ params }) => {
              this.handleSearch(params);
            }}
          />
        )}
        {readOnly ? (
          <Table
            dataSet={this.skuAssignDs}
            columns={columns}
            customizedCode="authority-sku-readonly"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          />
        ) : (
          <div className="sku-tables">
            <div className="left-table">
              <div className="table-header">
                <span>{intl.get('sagm.common.view.agreementSkuHouse').d('协议商品库')}</span>
                <span className="table-header-divider">|</span>
                <div className="table-header-filter">
                  <SelectFilter
                    label={intl.get('sagm.common.model.skuSource').d('商品来源')}
                    disabled={isReceive || onlyCate}
                    showExpandIcon={!isReceive && !onlyCate}
                    options={[
                      {
                        text: intl.get('sagm.common.model.cata').d('目录化'),
                        value: 'CATA',
                        isDefault: true,
                      },
                      { text: intl.get('sagm.common.model.ec').d('电商'), value: 'EC' },
                    ]}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
              <ModalTable
                width={490}
                dataSet={this.skuSourceDs}
                columns={columns}
                customizedCode="authority-sku-left"
              />
            </div>
            <div className="transfer-btns">
              <JoinButton dataSet={this.skuSourceDs} />
              <DelButton dataSet={this.skuAssignDs} />
            </div>
            <div className="right-table">
              <p>{title || intl.get('sagm.common.view.assignedSku').d('已分配商品')}</p>
              <ModalTable
                width={490}
                dataSet={this.skuAssignDs}
                columns={columns}
                customizedCode="authority-sku-right"
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
