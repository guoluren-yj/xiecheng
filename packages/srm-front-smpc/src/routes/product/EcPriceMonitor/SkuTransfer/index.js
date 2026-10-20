import React, { Component } from 'react';
// import { Button } from 'hzero-ui';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import FilterBar from '_components/FilterBarTable/FilterBar';

import { precisionRender } from '@/utils/precision';

import { saveDimensions, deleteDimensions } from '../api';
import style from './index.less';

const organizationId = getCurrentOrganizationId();

const tableDs = (initParams, isCheckBox = 'true') => ({
  selection: isCheckBox ? 'multiple' : false,
  pageSize: 20,
  autoQuery: false,
  fields: [
    { name: 'supplierCompanyName', label: intl.get('sagm.common.model.supplier').d('供应商') },
    { name: 'skuCode', label: intl.get('sagm.common.model.productCode').d('商品编码') },
    { name: 'skuName', label: intl.get('sagm.common.model.productName').d('商品名称') },
    { name: 'thirdSkuCode', label: intl.get('sagm.common.model.thirdSkuCode').d('第三方商品编码') },
    { name: 'categoryName', label: intl.get('sagm.common.model.plateformCategory').d('平台分类') },
    {
      name: 'agreementTaxedPrice',
      type: 'number',
      label: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
    },
    {
      name: 'agreementPrice',
      type: 'number',
      label: intl.get('sagm.common.view.price.noTax').d('单价(不含税)'),
    },
    { name: 'uomName', label: intl.get('sagm.common.model.uom').d('单位') },
    { name: 'option', label: intl.get('hzero.common.action').d('操作') },
  ],
  transport: {
    read({ data }) {
      const { filterParams = {} } = data;
      return {
        url: `/smpc/v1/${organizationId}/ec-price-monitor-dimensions/sku-dimension`,
        method: 'GET',
        data: { ...filterParams, ...initParams },
      };
    },
  },
});

const ModalTable = (props) => {
  const { width, ...otherProps } = props;
  // const [update, setUpdate] = React.useState();
  // const tableRef = React.useRef();
  // React.useEffect(() => {
  //   setUpdate('update');
  // }, []);
  // React.useEffect(() => {
  //   if (width) {
  //     tableRef.current.tableStore.width = width;
  //   }
  // }, [update]);
  return (
    <Table
      style={{ width, maxHeight: 'calc(100% - 76px)' }}
      {...otherProps}
      // ref={tableRef}
      pagination={{ showQuickJumper: false }}
    />
  );
};

export default class Transfer extends Component {
  constructor(props) {
    super(props);
    const { monitorStrategyId, readOnly = false } = props;
    this.skuSourceDs = new DataSet(tableDs({ monitorStrategyId }));
    this.skuAssignDs = new DataSet(tableDs({ queryFlag: 1, monitorStrategyId }, !readOnly));
  }

  queryFields = [
    {
      name: 'skuName',
      fieldProps: {
        label: intl.get('sagm.common.model.skuName').d('商品名称'),
      },
    },
    {
      name: 'skuCode',
      fieldProps: {
        label: intl.get('sagm.common.model.skuCode').d('商品编码'),
      },
    },
  ];

  queryDs = new DataSet({
    autoCreate: true,
    autoQuery: false,
    fields: this.queryFields.map((m) => ({ name: m.name, ...m.fieldProps })),
    queryFields: [
      {
        name: 'skuName',
        label: intl.get('sagm.common.model.skuName').d('商品名称'),
        display: true,
      },
      {
        name: 'skuCode',
        label: intl.get('sagm.common.model.skuCode').d('商品编码'),
        display: true,
      },
      {
        name: 'creationDate',
        label: intl.get('hzero.common.date.createdDate').d('创建时间'),
        sortFlag: true,
        visible: false,
      },
    ],
  });

  componentDidMount() {
    const { modal, onChange, monitorType, monitorStrategyId } = this.props;
    this.skuSourceDs.query();
    this.skuAssignDs.query();
    modal.update({
      onOk: () => {
        if (onChange) {
          const res = this.skuAssignDs.toData().map((sku) => ({
            ...sku,
            monitorType,
            monitorStrategyId,
            dimensionValue: sku.skuId,
            dimensionValueCode: sku.skuCode,
            dimensionValueName: sku.skuName,
          }));
          onChange(res);
        }
      },
    });
  }

  handleSearch = (params) => {
    const { readOnly } = this.props;
    if (params) {
      this.skuAssignDs.setQueryParameter('filterParams', params);
      this.skuSourceDs.setQueryParameter('filterParams', params);
    }
    if (!readOnly) {
      this.skuSourceDs.query();
    }
    this.skuAssignDs.query();
  };

  handleJoin = async () => {
    const { monitorType, monitorStrategyId } = this.props;
    const list = this.skuSourceDs.selected.map((record) => ({
      ...record.toData(),
      monitorType,
      monitorStrategyId,
      dimensionValue: record.get('skuId'),
      dimensionValueCode: record.get('skuCode'),
      dimensionValueName: record.get('skuName'),
    }));
    const res = await saveDimensions(list);
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.handleSearch();
    }
  };

  handleDelete = async () => {
    const { monitorStrategyId } = this.props;
    const list = this.skuAssignDs.selected.map((record) => ({
      ...record.toData(),
      monitorStrategyId,
      dimensionValue: record.get('skuId'),
      dimensionValueCode: record.get('skuCode'),
      dimensionValueName: record.get('skuName'),
    }));

    const res = await deleteDimensions(list);
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.handleSearch();
    }
  };

  rendererPrices = ({ record, name }) => {
    const [prices = {}] = record.get('skuSalesInfos') || [];
    return precisionRender({ name, recordData: prices, showLine: true });
  };

  getColumns = () => {
    const columns = [
      { name: 'supplierCompanyName', width: 120 },
      { name: 'skuCode', width: 120 },
      { name: 'skuName', width: 200 },
      { name: 'thirdSkuCode', width: 120 },
      { name: 'categoryName', width: 120 },
      {
        name: 'uomName',
        width: 80,
      },
      { name: 'agreementTaxedPrice', width: 120, renderer: this.rendererPrices },
      { name: 'agreementPrice', width: 120, renderer: this.rendererPrices },
    ];
    return columns.filter((f) => f.show !== false);
  };

  render() {
    const { readOnly } = this.props;
    const JoinButton = observer(({ dataSet }) => (
      <Button
        disabled={dataSet.selected.length === 0}
        style={{ marginBottom: 16, borderRadius: 0 }}
        onClick={this.handleJoin}
        icon="keyboard_arrow_right"
      />
    ));

    const DelButton = observer(({ dataSet }) => (
      <Button
        disabled={dataSet.selected.length === 0}
        style={{ borderRadius: 0 }}
        onClick={this.handleDelete}
        icon="keyboard_arrow_left"
      />
    ));

    return (
      <div className={style['transfer-wrapper']}>
        <FilterBar
          dataSet={[this.queryDs]}
          onQuery={({ params }) => this.handleSearch(params)}
          checkDataSetStatus={false}
          defaultSortedField="creationDate"
        />
        {readOnly ? (
          <Table dataSet={this.skuAssignDs} columns={this.getColumns()} />
        ) : (
          <div className="sku-tables">
            <div className="left-table">
              <div className="table-header">
                <span>{intl.get('sagm.common.view.skuPool').d('商品库')}</span>
              </div>
              <ModalTable
                width={493}
                dataSet={this.skuSourceDs}
                columns={this.getColumns()}
                customizedCode="SMPC.EC_PRICE_MONITOR.TRANSFER.LEFT"
              />
            </div>
            <div className="transfer-btns">
              <div>
                <JoinButton dataSet={this.skuSourceDs} />
              </div>
              <div>
                <DelButton dataSet={this.skuAssignDs} />
              </div>
            </div>

            <div className="right-table">
              <div className="table-header">
                <p>{intl.get('sagm.common.view.assignedSku').d('已分配商品')}</p>
              </div>
              <ModalTable
                width={493}
                dataSet={this.skuAssignDs}
                columns={this.getColumns()}
                customizedCode="SMPC.EC_PRICE_MONITOR.TRANSFER.RIGHT"
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
