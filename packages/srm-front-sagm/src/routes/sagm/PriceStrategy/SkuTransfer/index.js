import React, { Component } from 'react';
// import { Button } from 'hzero-ui';
import { DataSet, Table, Button, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import notification from 'utils/notification';
import remoteFunc from 'hzero-front/lib/utils/remote';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import ImportButton from 'components/Import';
import ExcelExport from 'components/ExcelExport';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'components/ExcelExportPro';

import { openSkuDetail } from '@/utils/openCommonTab';
import { precisionRender } from '@/utils/precision';
import { openImport } from '@/utils/c7nModal';
import SelectFilter from '@/components/SelectFilter';
import { openPriceInfo, openLadderPrice } from './openPrices';

import C7nFilterForm from './C7nFilterForm';
import style from './index.less';

const tableDs = (url, initParams, isCheckBox = 'true', dataChange = e => e) => ({
  selection: isCheckBox ? 'multiple' : false,
  autoQuery: false,
  primaryKey: 'skuId',
  pageSize: 20,
  fields: [
    { name: 'supplierCompanyName', label: intl.get('sagm.common.model.supplier').d('供应商') },
    { name: 'skuCode', label: intl.get('sagm.common.model.productCode').d('商品编码') },
    { name: 'skuName', label: intl.get('sagm.common.model.productName').d('商品名称') },
    { name: 'thirdSkuCode', label: intl.get('sagm.common.model.thirdSkuCode').d('第三方商品编码') },
    { name: 'categoryName', label: intl.get('sagm.common.model.plateformCategory').d('平台分类') },
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
  events: {
    load: ({ dataSet }) => {
      const initDataCount = dataSet.getState('initDataCount');
      if (typeof initDataCount === 'number') {
        if (initDataCount !== dataSet.totalCount) {
          dataChange();
        }
      } else {
        dataSet.setState('initDataCount', initDataCount);
      }
    },
  },
});

const ModalTable = props => {
  const { width, maxHeight, ...otherProps } = props;
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
      style={{ width, maxHeight }}
      {...otherProps}
      ref={tableRef}
      pagination={{ showQuickJumper: false }}
      customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.STRATEGY_DETAIL_SKU_TRANSFER"
    />
  );
};

const AllSkuShow = observer(({ children, width, record }) => {
  const allSkuEnable = record ? record.get('allSkuEnable') : 0;
  return <div style={{ width, display: 'flex' }}>{!allSkuEnable && children}</div>;
});
/**
 * 仅销售协议入口
 */
@remoteFunc({
  code: 'REMOTE_PRICE_STRATEGY', // 松下二开，商品穿梭框增加采购方字段 需求 mall-6213
  name: 'remote',
})
@withCustomize({ unitCode: ['SAGM.SALE_WORKBENCH.PRICE.BTNS'] })
export default class Transfer extends Component {
  constructor(props) {
    super(props);
    const {
      leftInfo: { url: leftUrl, params: leftParams = {} } = {},
      rightInfo: { url: rightUrl, params: rightParams = {} } = {},
      readOnly = false,
      onSkuChange = e => e,
    } = props;
    this.skuSourceDs = new DataSet(tableDs(leftUrl, leftParams));
    this.skuAssignDs = new DataSet(tableDs(rightUrl, rightParams, !readOnly, onSkuChange));
  }

  state = {
    joinLoading: false,
    delLoading: false,
    skuType: 'CATA',
    form: {},
    filterFold: true,
  };

  getQueryParams = () => {
    return filterNullValueObject(this.state.form);
  };

  componentDidMount() {
    const { readOnly } = this.props;
    if (readOnly) {
      this.skuAssignDs.query();
    }
  }

  handleSearch = async queryDs => {
    const data = queryDs.current.toJSONData();
    delete data.__dirty;
    delete data.__id;
    delete data._status;
    const { readOnly } = this.props;
    this.setState({ form: { ...data, skuType: this.state.skuType } }, () => {
      if (!readOnly) {
        this.skuSourceDs.setQueryParameter(
          'filterParams',
          filterNullValueObject({ ...data, skuType: this.state.skuType })
        );
        this.skuSourceDs.query();
        //  已分配商品查询
        this.skuAssignDs.setQueryParameter('filterParams', filterNullValueObject(data));
        this.skuAssignDs.query();
      }
    });
  };

  handleViewSku = record => {
    const { backPath } = this.props;
    openSkuDetail({
      record,
      backPath,
    });
  };

  handleJoin = async () => {
    const { params, onJoin = () => new Promise(), onSkuChange = e => e } = this.props;
    const list = this.skuSourceDs.selected.map(record => ({
      ...record.toData(),
      ...params,
      allSkuEnable: 0,
      tenantId: getCurrentOrganizationId(),
    }));
    this.setState({ joinLoading: true });
    const res = await onJoin(list);
    this.setState({ joinLoading: false });
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.skuSourceDs.unSelectAll();
      this.skuSourceDs.clearCachedSelected();
      this.skuSourceDs.query();
      this.skuAssignDs.query();
      onSkuChange();
    }
  };

  handleDelete = async () => {
    const { onDelete = () => new Promise(), params, onSkuChange = e => e } = this.props;
    const list = this.skuAssignDs.selected.map(record => ({
      ...record.toData(),
      ...params,
    }));

    this.setState({ delLoading: true });
    const res = await onDelete(list);
    this.setState({ delLoading: false });
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.skuAssignDs.unSelectAll();
      this.skuAssignDs.clearCachedSelected();
      this.skuSourceDs.query();
      this.skuAssignDs.query();
      onSkuChange();
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

  handleChange = value => {
    this.setState({ skuType: value }, () => {
      this.handleSearch(this.formSearchDs);
    });
  };

  getColumns = type => {
    const { skuType } = this.state;
    const { remote } = this.props;
    const columns = remote.process(
      'SKU_TRANSFER_TABLE_COLUMNS',
      [
        { name: 'supplierCompanyName', width: 120 },
        {
          name: 'skuCode',
          width: 120,
          renderer: ({ text, record }) => (
            <a
              onClick={() => this.handleViewSku(record)}
              disabled={record.get('sourceFrom') !== 'CATA'}
            >
              {text}
            </a>
          ),
        },
        { name: 'skuName', width: 200 },
        { name: 'thirdSkuCode', width: 120 },
        { name: 'categoryName', width: 120 },
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
        // {
        //   name: 'option',
        //   width: 80,
        //   align: 'center',
        //   lock: 'right',
        //   renderer: ({ record }) => (
        //     <a
        //       onClick={() => this.handleViewSku(record)}
        //       disabled={record.get('sourceFrom') !== 'CATA'}
        //     >
        //       {intl.get('sagm.common.model.look').d('查看')}
        //     </a>
        //   ),
        // },
      ],
      // 二开参数
      {
        purchaseC: [
          {
            name: 'companyName',
            minWidth: 120,
            header: intl.get('sagm.common.model.purchase').d('采购方'),
            show: skuType === 'CATA' || type === 'assignedSku',
          },
        ],
      }
    );
    return columns.filter(f => f.show !== false);
  };

  render() {
    const {
      record,
      readOnly,
      queryFields = [],
      queryDs,
      queryFieldsLimit = 3,
      params: changeParams = {},
      rightInfo: { url, params = {} } = {},
      permissionList,
      customizeBtnGroup,
    } = this.props;
    const { joinLoading, delLoading } = this.state;
    const JoinButton = observer(({ dataSet }) => (
      <Button
        disabled={dataSet.selected.length === 0}
        loading={joinLoading}
        style={{ marginBottom: 16, borderRadius: 0 }}
        onClick={this.handleJoin}
      >
        <Icon type="keyboard_arrow_right" style={{ height: 20, lineHeight: 0, marginRight: 0 }} />
      </Button>
    ));

    const DelButton = observer(({ dataSet }) => (
      <Button
        disabled={dataSet.selected.length === 0}
        onClick={this.handleDelete}
        loading={delLoading}
        style={{ borderRadius: 0 }}
        funcType="raised"
      >
        <Icon type="keyboard_arrow_left" style={{ height: 20, lineHeight: 0, marginRight: 0 }} />
      </Button>
    ));

    const buttons = [
      <ImportButton
        businessObjectTemplateCode="SAGM.STRATEGY_SKU_MAPPING"
        refreshButton
        buttonText={intl.get('sagm.common.button.importNew').d('(新)导入')}
        prefixPatch="/sagm"
        args={{ ...changeParams, templateCode: 'SAGM.STRATEGY_SKU_MAPPING' }}
        buttonProps={{
          icon: 'archive',
          color: 'primary',
          funcType: 'flat',
          permissionList: [
            permissionList[0] || {
              code: `sagm.price-strategy.button.sku-import-new`,
              type: 'button',
              meaning: '价格策略管理-（新）商品导入',
            },
          ],
        }}
        successCallBack={() => this.skuAssignDs.query()}
      />,
      <ExcelExportPro
        templateCode="SAGM_STRATEGY_SKU_MAPPING_EXPORT"
        buttonText={intl.get('sagm.common.button.exportNew').d('(新)导出')}
        requestUrl={`${url}/export`}
        queryParams={{ ...this.getQueryParams(), ...params }}
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          color: 'primary',
          icon: 'unarchive',
          permissionList: [
            permissionList[1] || {
              code: `sagm.price-strategy.button.sku-export-new`,
              type: 'button',
              meaning: '价格策略管理-（新）商品导出',
            },
          ],
        }}
      />,
    ];

    const customizeButtons = [
      {
        name: 'oldImport',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.import').d('导入'),
        btnProps: {
          funcType: 'flat',
          color: 'primary',
          icon: 'archive',
          onClick: () =>
            openImport(
              { width: 1090, afterClose: () => this.skuAssignDs.query() },
              {
                key: '/sagm/price-strategy/data-import',
                code: 'SAGM.STRATEGY_SKU_MAPPING',
                args: { ...changeParams, templateCode: 'SAGM.STRATEGY_SKU_MAPPING' },
              }
            ),
        },
      },
      {
        name: 'oldExport',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${url}/export`,
          queryParams: { ...this.getQueryParams(), ...params },
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            color: 'primary',
            icon: 'unarchive',
          },
        },
      },
    ];

    return (
      <div className={style['transfer-wrapper']}>
        {!readOnly && (
          <C7nFilterForm
            fields={queryFields}
            ds={queryDs}
            queryFieldsLimit={queryFieldsLimit}
            onSearch={this.handleSearch}
            onRef={(ds, fold) => {
              this.formSearchDs = ds;
              this.setState({
                filterFold: fold,
              });
            }}
          />
        )}
        {readOnly ? (
          <Table dataSet={this.skuAssignDs} columns={this.getColumns('assignedSku')} />
        ) : (
          <div className="sku-tables">
            <div className="left-table">
              <div className="table-header">
                <span>{intl.get('sagm.common.view.agreementSkuHouse').d('协议商品库')}</span>
                <span className="table-header-divider">|</span>
                <div className="table-header-filter">
                  <SelectFilter
                    label={intl.get('sagm.common.model.skuSource').d('商品来源')}
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
                width={493}
                dataSet={this.skuSourceDs}
                columns={this.getColumns('libSku')}
                maxHeight={this.state.filterFold ? 'calc(100vh - 315px)' : 'calc(100vh - 355px)'}
              />
            </div>
            <AllSkuShow record={record}>
              <div className="transfer-btns">
                <div>
                  <JoinButton dataSet={this.skuSourceDs} />
                </div>
                <div>
                  <DelButton dataSet={this.skuAssignDs} />
                </div>
              </div>
            </AllSkuShow>

            <div className="right-table">
              <div className="table-header">
                <p>{intl.get('sagm.common.view.assignedSku').d('已分配商品')}</p>
                <div style={{ marginLeft: 8 }}>
                  {customizeBtnGroup(
                    {
                      code: 'SAGM.SALE_WORKBENCH.PRICE.BTNS',
                      // 新版按钮组个性化（必须）
                      pro: true,
                    },
                    <DynamicButtons buttons={customizeButtons} />
                  )}
                  {buttons}
                </div>
              </div>
              {/* <div style={{ display: 'flex' }}>
                  <span>&nbsp;{intl.get('sagm.common.model.allSku').d('全部商品')}&nbsp;</span>
                  {record && (
                    <Switch name="allSkuEnable" record={record} onChange={this.handleChangeCheck} />
                  )}
                </div>
              </div> */}
              <AllSkuShow width={493} record={record}>
                <ModalTable
                  width={493}
                  dataSet={this.skuAssignDs}
                  columns={this.getColumns('assignedSku')}
                  maxHeight={this.state.filterFold ? 'calc(100vh - 315px)' : 'calc(100vh - 355px)'}
                />
              </AllSkuShow>
            </div>
          </div>
        )}
      </div>
    );
  }
}
