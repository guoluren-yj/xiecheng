/**
 * currencyOrg - 租户级币种定义
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Table, Modal } from 'hzero-ui';
import { isUndefined, isEmpty, differenceBy } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';

import FilterForm from './FilterForm';
import CurrencyForm from './CurrencyForm';

/**
 * 币种--租户级
 * @extends {Component} - React.Component
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} currencyOrg - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {boolean} saving - 保存操作是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e=>e] - redux dispatch方法
 * @return React.element
 */

@withCustomize({
  unitCode: ['SMDM_CURRENCY.EDIT_FORM', 'SMDM_CURRENCY.LIST', 'SMDM_CURRENCY.SEARCH'],
})
@connect(({ currencyOrg, loading }) => ({
  currencyOrg,
  loading: loading.effects['currencyOrg/fetchCurrencies'],
  saving: loading.effects['currencyOrg/updateCurrency'],
  quoting: loading.effects['currencyOrg/quoteCurrency'],
  updateEnabledFlagLoading: loading.effects['currencyOrg/updateEnabledFlag'],
}))
@formatterCollections({ code: 'smdm.currencyOrg' })
export default class CurrencyOrg extends PureComponent {
  /**
   * state初始化
   * @param {objec} props - 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      editRowData: {},
      tipModalVisible: false,
      fieldsValue: {},
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  currencyForm;

  /**
   * 生命周期函数，render()调用后获取页面展示数据
   */
  componentDidMount() {
    this.init();
  }

  /**
   * 初始化值集
   */
  @Bind()
  init() {
    const { dispatch } = this.props;
    dispatch({
      type: 'currencyOrg/init',
    }).then(() => {
      this.handleSearchCurrency();
    });
  }

  /**
   * 模糊查询币种
   */
  @Bind()
  handleSearchCurrency(fields = {}) {
    const { dispatch } = this.props;
    const { form } = this.state;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'currencyOrg/fetchCurrencies',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
        customizeUnitCode: 'SMDM_CURRENCY.LIST,SMDM_CURRENCY.SEARCH',
      },
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.setState({ form: ref.props.form });
  }

  /**
   * 引入云级数据
   */
  @Bind()
  quoteData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'currencyOrg/quoteCurrency',
      payload: {},
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchCurrency();
      }
    });
  }

  /**
   * 打开模态框
   * @param {boolean} flag - 是否打开模态框
   * @param {object} [record = {}] - 币种信息
   */
  @Bind()
  showEditModal(flag, record = {}) {
    this.setState({
      modalVisible: !!flag,
      editRowData: record,
    });
  }

  /**
   * 关闭币种编辑侧滑框
   */
  @Bind()
  hideModal() {
    this.currencyForm.resetForm();
    this.setState({ modalVisible: false });
  }

  /**
   * 编辑
   * @param {object} fieldsValue 获取的表单值
   */
  @Bind()
  handleSaveOption(fieldsValue) {
    const {
      financialPrecision: oldFinancialPrecision,
      defaultPrecision: oldDefaultPrecision,
    } = this.state.editRowData;
    const { financialPrecision, defaultPrecision } = fieldsValue;

    if (financialPrecision !== oldFinancialPrecision || defaultPrecision !== oldDefaultPrecision) {
      this.setState({ tipModalVisible: true, fieldsValue });
    } else {
      this.handleSave(fieldsValue);
    }
  }

  @Bind()
  handleSave(fieldsValue) {
    const currentFieldsValue = fieldsValue || this.state.fieldsValue;
    const {
      dispatch,
      currencyOrg: { pagination = {} },
    } = this.props;
    const { editRowData } = this.state;
    const newPayload = {
      customizeUnitCode: 'SMDM_CURRENCY.LIST,SMDM_CURRENCY.EDIT_FORM',
      body: [
        {
          ...editRowData,
          ...currentFieldsValue,
        },
      ],
    };
    if (editRowData.currencyId) {
      dispatch({
        type: 'currencyOrg/updateCurrency',
        payload: newPayload,
      }).then((res) => {
        if (res) {
          this.showEditModal(false);
          this.handleSearchCurrency(pagination);
          notification.success();
        }
      });
    }
  }

  handleChangeEnabledFlag = (flag) => {
    const {
      dispatch,
      currencyOrg: { pagination = {} },
    } = this.props;

    const params = {
      enabledFlag: flag,
      list: this.state.selectedRows,
    };
    dispatch({
      type: 'currencyOrg/updateEnabledFlag',
      payload: params,
    }).then((res) => {
      if (res) {
        // this.showEditModal(false);
        this.setState({ selectedRowKeys: [], selectedRows: [] });
        this.handleSearchCurrency(pagination);
        notification.success();
      }
    });
  };

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };

  changeSelect = (record, selected) => {
    let newSelectedRows = this.state.selectedRows;
    if (selected) {
      newSelectedRows.push(record);
    } else {
      newSelectedRows = differenceBy(newSelectedRows, [record], 'currencyId');
    }
    this.setState({ selectedRows: newSelectedRows });
  };

  changeSelectAll = (selected, _selectedRows, changeRows) => {
    let newSelectedRows = this.state.selectedRows;
    if (selected) {
      newSelectedRows = newSelectedRows.concat(changeRows);
    } else {
      newSelectedRows = differenceBy(newSelectedRows, changeRows, 'currencyId');
    }
    this.setState({ selectedRows: newSelectedRows });
  };

  render() {
    const {
      loading,
      saving,
      quoting,
      updateEnabledFlagLoading,
      currencyOrg: { data = {}, pagination = {}, enabledList = [] },
      customizeForm,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const {
      modalVisible,
      editRowData,
      tipModalVisible,
      fieldsValue,
      selectedRowKeys = [],
      selectedRows = [],
    } = this.state;
    const filterProps = {
      onSearch: this.handleSearchCurrency,
      onRef: this.handleBindRef,
      customizeFilterForm,
      enabledList,
    };
    const columns = [
      {
        title: intl.get(`smdm.currencyOrg.model.currency.currencyCode`).d('引用币种代码'),
        width: 200,
        dataIndex: 'currencyCode',
      },
      {
        title: intl.get(`smdm.currencyOrg.model.currency.currencyName`).d('引用币种名称'),
        dataIndex: 'currencyName',
      },
      {
        title: intl.get(`smdm.currencyOrg.model.currency.financialPrecision`).d('财务精度'),
        // align: 'right',
        width: 100,
        dataIndex: 'financialPrecision',
      },
      {
        title: intl.get(`smdm.currencyOrg.model.currency.defaultPrecision`).d('精度'),
        // align: 'right',
        width: 100,
        dataIndex: 'defaultPrecision',
      },
      {
        title: intl.get(`smdm.currencyOrg.model.currency.currencySymbol`).d('货币符号'),
        // align: 'center',
        width: 100,
        dataIndex: 'currencySymbol',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        // align: 'center',
        dataIndex: 'enabledFlag',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        // align: 'center',
        dataIndex: 'option',
        render: (_, record) => {
          return (
            <a onClick={() => this.showEditModal(true, record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.changeSelect,
      onSelectAll: this.changeSelectAll,
    };

    return (
      <React.Fragment>
        <Header title={intl.get(`smdm.currencyOrg.view.message.title`).d('币种定义')}>
          <Button icon="fork" loading={quoting || loading} type="primary" onClick={this.quoteData}>
            {intl.get(`smdm.currencyOrg.view.option.quote`).d('引用云级数据')}
          </Button>
          <Button
            loading={updateEnabledFlagLoading}
            disabled={selectedRows?.length === 0 || selectedRows?.some((ele) => !ele.enabledFlag)}
            onClick={() => this.handleChangeEnabledFlag(0)}
          >
            {intl.get('hzero.common.status.disable').d('禁用')}
          </Button>
          <Button
            loading={updateEnabledFlagLoading}
            disabled={selectedRows?.length === 0 || selectedRows?.some((ele) => ele.enabledFlag)}
            onClick={() => this.handleChangeEnabledFlag(1)}
          >
            {intl.get('hzero.common.status.enable').d('启用')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            {
              code: 'SMDM_CURRENCY.LIST',
            },
            <Table
              bordered
              rowKey="currencyId"
              loading={loading}
              dataSource={data.content}
              columns={columns}
              pagination={pagination}
              onChange={this.handleSearchCurrency}
              rowSelection={rowSelection}
            />
          )}
          <CurrencyForm
            sideBar
            destroyOnClose
            title={intl.get(`smdm.currencyOrg.view.message.edit`).d('编辑币种')}
            onRef={(ref) => {
              this.currencyForm = ref;
            }}
            data={editRowData}
            handleAdd={this.handleSaveOption}
            confirmLoading={saving || loading}
            modalVisible={modalVisible}
            hideModal={this.hideModal}
            customizeForm={customizeForm}
          />
          {tipModalVisible && (
            <Modal
              title={intl.get(`smdm.currencyOrg.model.TipTitle`).d('温馨提示')}
              destroyOnClose
              visible={tipModalVisible}
              onOk={() => {
                this.setState({ tipModalVisible: false });
                this.handleSave(fieldsValue);
              }}
              onCancel={() => {
                this.setState({ tipModalVisible: false });
              }}
            >
              <div>
                {intl
                  .get(`smdm.currencyOrg.model.tip`)
                  .d('变更币种精度可能会导致单据前后单价金额不一致，请确认是否继续进行变更')}
              </div>
            </Modal>
          )}
        </Content>
      </React.Fragment>
    );
  }
}
