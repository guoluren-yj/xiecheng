import React, { Component } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, filterNullValueObject } from 'utils/utils';
import SearchBar from '_components/SearchBarTable/SearchBar';

import QueryField from '@/routes/sstk/components/QueryField';
import style from './index.less';

const tableDs = (url, initParams, isCheckBox = 'true') => ({
  selection: isCheckBox ? 'multiple' : false,
  autoQuery: false,
  primaryKey: 'itemId',
  pageSize: 20,
  cacheSelection: true,
  fields: [
    {
      label: intl.get('sstk.stockConfig.model.itemCode').d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get('sstk.stockConfig.model.itemName').d('物料名称'),
      name: 'itemName',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url,
        method: 'GET',
        data: { ...data, ...initParams },
      };
    },
  },
});

const ModalTable = props => {
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
    <div style={{ height: 'calc(100vh - 255px)' }}>
      <Table
        style={{ width, maxHeight: 'calc(100% - 22px)' }}
        queryBar='none'
        // showAllPageSelectionButton
        {...otherProps}
        ref={tableRef}
        pagination={{ showQuickJumper: false }}
      />
    </div>
  );
};

const AllSkuShow = observer(({ children, width }) => {
  // const allSkuEnable = record ? record.get('allSkuEnable') : 0;
  return <div style={{ width, display: 'flex' }}>{children}</div>;
});

@formatterCollections({
  code: ['hzero.common', 'sstk.stockConfig', 'sagm.common'],
})
export default class Transfer extends Component {
  constructor(props) {
    super(props);
    const {
      leftInfo: { url: leftUrl, params: leftParams = {} } = {},
      rightInfo: { url: rightUrl, params: rightParams = {} } = {},
      readOnly = false,
    } = props;
    this.stockSourceDs = new DataSet(tableDs(leftUrl, leftParams));
    this.stockAssignDs = new DataSet(tableDs(rightUrl, rightParams, !readOnly));
  }

  // 缓存
  queryRef = React.createRef();;

  state = {
    joinLoading: false,
    delLoading: false,
    form: {},
  };

  getQueryParams = () => {
    return filterNullValueObject(this.state.form);
  };

  componentDidMount() {
    const { readOnly } = this.props;
    if (readOnly) {
      this.stockAssignDs.query();
    }
  }

  handleSearch = async queryDs => {
    const data = queryDs.current.toJSONData();
    delete data.__dirty;
    delete data.__id;
    delete data._status;
    const { readOnly } = this.props;
    this.setState({ form: data }, () => {
      if (!readOnly) {
        this.stockSourceDs.setQueryParameter(
          'filterParams',
          filterNullValueObject(data)
        );
        this.stockSourceDs.query();
        //  已分配商品查询
        this.stockAssignDs.setQueryParameter('filterParams', filterNullValueObject(data));
        this.stockAssignDs.query();
      }
    });
  };

  handleJoin = async () => {
    const { strategyId, onJoin = () => new Promise(), onDataChange = e => e } = this.props;
    const list = this.stockSourceDs.selected.map(record => record.toData());
    // const cacheSelected = this.stockSourceDs.cachedSelected.map(record => record.toData());
    // console.log(list, cacheSelected, this.stockSourceDs.unSelected)
    // console.log(11, this.stockSourceDs.isAllPageSelection)
    this.setState({ joinLoading: true });
    const res = await onJoin(list, strategyId);
    this.setState({ joinLoading: false });
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.stockSourceDs.unSelectAll();
      this.stockSourceDs.clearCachedSelected();
      this.stockSourceDs.query();
      this.stockAssignDs.query();
      onDataChange();
    }
  };

  handleDelete = async () => {
    const { onDelete = () => new Promise(), onDataChange = e => e } = this.props;
    const list = this.stockAssignDs.selected.map(record => record.toData());

    this.setState({ delLoading: true });
    const res = await onDelete(list);
    this.setState({ delLoading: false });
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.stockAssignDs.unSelectAll();
      this.stockAssignDs.clearCachedSelected();
      this.stockSourceDs.query();
      this.stockAssignDs.query();
      onDataChange();
    }
  };

  getColumns = () => {
    const columns = [
      { name: 'itemCode', width: 120 },
      { name: 'itemName', width: 150 },
    ];
    return columns.filter(f => f.show !== false);
  };

  render() {
    const {
      // record,
      readOnly,
    } = this.props;
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
        funcType="raised"
      >
        &lt;
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    ));

    const searchBarProps = {
      searchCode: 'SSTK.STOCK_STRATEGY_CONFIG.ITEM.SEARCHBAR',
      dataSet: [this.stockSourceDs, this.stockAssignDs],
      closeFilterSelector: true,
      expandable: false,
      left: {
        render: () => (
          <QueryField
            name="itemNameCode"
            dataSet={[this.stockSourceDs, this.stockAssignDs]}
            onRef={ref => {
              this.queryRef.current = ref;
            }}
            placeholder={intl
              .get('sstk.stockConfig.view.query.itemNameCode')
              .d('请输入物料编码、名称查询')}
          />
        ),
      },
      onClear: () => {
        if (this.queryRef.current) this.queryRef.current.handleClear();
      },
      onReset: () => {
        if (this.queryRef.current) this.queryRef.current.handleClear();
      },
      cacheState: true,
    };

    return (
      <div className={style['transfer-wrapper']}>
        {!readOnly && (
          <SearchBar {...searchBarProps} />
        )}
        {readOnly ? (
          <Table dataSet={this.stockAssignDs} columns={this.getColumns()} />
        ) : (
          <div className="sku-tables">
            <div className="left-table">
              <div className="table-header">
                <span>{intl.get('sstk.stockConfig.view.allItems').d('所有物料')}</span>
              </div>
              <ModalTable width={500} dataSet={this.stockSourceDs} columns={this.getColumns()} customizedCode='stockSource' />
            </div>
            <AllSkuShow>
              <div className="transfer-btns">
                <div>
                  <JoinButton dataSet={this.stockSourceDs} />
                </div>
                <div>
                  <DelButton dataSet={this.stockAssignDs} />
                </div>
              </div>
            </AllSkuShow>

            <div className="right-table">
              <div className="table-header">
                <p>{intl.get('sstk.stockConfig.view.choosedItem').d('已选物料')}</p>
              </div>
              <AllSkuShow width={500}>
                <ModalTable width={500} dataSet={this.stockAssignDs} columns={this.getColumns()} customizedCode='stockAssign' />
              </AllSkuShow>
            </div>
          </div>
        )}
      </div>
    );
  }
}
