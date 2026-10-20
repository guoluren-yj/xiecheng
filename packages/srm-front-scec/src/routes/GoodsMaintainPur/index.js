/**
 * GoodsMaintain -商品维护 -采购方
 * @date: 2019-1-28
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Button, Modal, Popconfirm, Badge } from 'hzero-ui';
import { connect } from 'dva';
import { isArray, isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';

import { filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

import { Header, Content } from 'components/Page';
import FilterForm from './FilterForm';
import OperateRecord from '../OperateRecord';
import ModifyDirectory from './ModifyDirectory/index';
import Sourcing from './Sourcing/index';
import styles from './index.less';

const { confirm } = Modal;

@connect(({ goodsMaintainPur, loading }) => ({
  goodsMaintainPur,
  loading: loading.effects['goodsMaintainPur/fetchGoodsList'],
  submitLoading: loading.effects['goodsMaintainPur/fetchGoodsSubmit'],
  scrappedLoading: loading.effects['goodsMaintainPur/fetchGoodsScrapped'],
  importSoucing: loading.effects['goodsMaintainPur/importSourcingList'],
}))
@formatterCollections({
  code: [
    'scec.goodsMaintainPur',
    'scec.common',
    'scec.operateRecord',
    'scec.goodsApprove',
    'ssrc.inquiryHall',
  ],
})
export default class GoodsMaintainPur extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [], // 勾选数据
      visible: false, // 操作记录框是否显示
      directoryVisible: false, // 目录修改框是否显示
      sourcingVisble: false, // 寻源框是否显示
    };
  }

  componentDidMount() {
    this.queryGoodsList();
    this.batchCode();
    const { dispatch } = this.props;
    dispatch({
      type: 'goodsMaintainPur/updateState',
      payload: {
        attachmentUUId: '',
        detail: {},
      },
    });
  }

  form;

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 更改状态的显示值级
   */
  @Bind()
  exchangeSourceType(params = []) {
    let changeParams = [];
    if (isArray(params) && params.length > 0) {
      changeParams = params.filter(item => {
        return (
          item.value === 'NEW' ||
          item.value === 'TOSUBMIT' ||
          item.value === 'APPROVED' ||
          item.value === 'REJECT' ||
          item.value === 'UNSHELVE' ||
          item.value === 'DISABLED' ||
          item.value === 'WORK_FLOW_APPROVALING'
        );
      });
    }
    return changeParams;
  }

  /**
   * 批量查询值级
   */
  @Bind()
  batchCode() {
    const { dispatch } = this.props;
    const lovCodes = {
      status: 'SCEC.PRODUCT_OPERATION', // 状态
      sourceType: 'SCEC.PRODUCT_SOURCE', // 数据来源
    };
    dispatch({
      type: 'goodsMaintainPur/batchCode',
      payload: lovCodes,
    }).then(() => {
      const {
        goodsMaintainPur: { code = {} },
      } = this.props;
      const newStatus = this.exchangeSourceType(code.status);
      this.setState({
        newStatus,
      });
    });
  }

  /**
   * 查询维护商品列表
   * @param {object} params  查询参数
   */
  @Bind()
  queryGoodsList(params = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'goodsMaintainPur/fetchGoodsList',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues,
      },
    });
  }

  /**
   * 详情
   */
  @Bind()
  handleToDetail(record = {}) {
    const router = record.productNum
      ? `/scec/goods-maintain-pur/detail?productId=${record.productId}`
      : `/scec/goods-maintain-pur/detail`;
    this.props.history.push(router);
  }

  /**
   * 保存勾选框勾选数据
   * @param {object} selectedRows 勾选的当前行数据
   */
  @Bind()
  handleRowSelectChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 商品提交
   * @param
   */
  @Bind()
  fetchGoodsSubmit() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const productIds = selectedRows.map(item => item.productId);
    dispatch({
      type: 'goodsMaintainPur/fetchGoodsSubmit',
      payload: productIds,
    }).then(res => {
      if (res) {
        notification.success();
        this.queryGoodsList();
        this.setState({
          selectedRows: [],
        });
      }
    });
  }

  /**
   * 商品作废
   */
  @Bind()
  fetchGoodsScrapped() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const productIds = selectedRows.map(item => item.productId);
    dispatch({
      type: 'goodsMaintainPur/fetchGoodsScrapped',
      payload: productIds,
    }).then(res => {
      if (res) {
        notification.success();
        this.queryGoodsList();
        this.setState({
          selectedRows: [],
        });
      }
    });
  }

  /**
   * 打开操作记录
   */
  @Bind()
  openRecord(record = {}) {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
      productId: record.productId,
    });
  }

  // 打开提示框
  @Bind()
  showConfirm() {
    confirm({
      title: intl.get('scec.common.model.tips').d('提示'),
      content: intl
        .get('scec.common.model.onSelectDataRequireFromOnlyCompany')
        .d('所选数据需属同一公司'),
    });
  }

  /**
   * 批量修改修改目录
   * ps: 属于同一公司才能批量修改目录
   */
  @Bind()
  fetchModifyDirectory() {
    const { selectedRows = [] } = this.state;
    const selectKey = selectedRows.map(item => item.companyId);
    const isFlag = selectKey.every((ele, _, array) => {
      const param = ele;
      return param === array[0];
    });
    if (!isFlag) {
      this.showConfirm();
    } else {
      this.setState({
        directoryVisible: true,
      });
    }
  }

  /**
   * 取消目录模态框显示
   */
  @Bind()
  handleCancel() {
    this.setState({
      directoryVisible: false,
      sourcingVisble: false,
    });
  }

  /**
   * 选择目录后修改目录
   */
  @Bind()
  handleUpdateGoodsCatelog(params = []) {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    const catalogId = Number(params.map(item => item.catalogId).toString(), 10);
    const productIds = selectedRows.map(item => item.productId);
    dispatch({
      type: 'goodsMaintainPur/updateCateLog',
      payload: {
        productIds,
        catalogId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.queryGoodsList();
        this.setState({
          selectedRows: [],
          directoryVisible: false,
        });
      }
    });
  }

  /**
   * 打开寻源model
   */
  @Bind()
  openSourcing() {
    const { sourcingVisble } = this.state;
    this.setState({
      sourcingVisble: !sourcingVisble,
    });
  }

  /**
   * 引用寻源list
   * @param {object} params 所选的寻源
   */
  @Bind()
  importSourcing(params = []) {
    const { dispatch } = this.props;
    const resultIds = params.map(item => item.resultId);
    dispatch({
      type: 'goodsMaintainPur/importSourcingList',
      payload: {
        resultIds,
        createdParty: 'PURCHASE',
      },
    }).then(res => {
      if (res) {
        const { productId } = res[0];
        this.setState({
          sourcingVisble: false,
          selectedRows: [],
        });
        if (productId) {
          this.props.history.push(`/scec/goods-maintain-pur/detail?productId=${productId}`);
        }
      }
    });
  }

  // 含税/不含税单价，显示保留小数点2-5位小数
  @Bind()
  toFixedTax(price = '') {
    if (price === null || price === '' || isNaN(price)) {
      return '';
    } else {
      const value = price.toString();
      const ind = value.indexOf('.');
      const precision = ind === -1 ? 0 : Math.abs(value.length - ind);
      if (precision > 2) {
        return Math.round(price * 100000) / 100000;
      } else {
        return price.toFixed(2);
      }
    }
  }

  /**
   * 通用导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/hiam/sub-account-org/data-import/PRODUCT_REF`,
      title: intl.get('hzero.common.button.import').d('批量导入'),
      search: queryString.stringify({
        action: intl.get('hzero.common.button.import').d('批量导入'),
      }),
    });
  }

  render() {
    const {
      goodsMaintainPur: {
        list = {},
        pagination = {},
        code: { sourceType = [] },
      },
      submitLoading,
      scrappedLoading,
      loading,
      importSoucing,
    } = this.props;
    const { selectedRows, visible, directoryVisible, sourcingVisble, newStatus = [] } = this.state;
    const columns = [
      {
        title: intl.get('scec.common.model.productStatus').d('状态'),
        dataIndex: 'productStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('scec.common.model.productNum').d('商品编码'),
        dataIndex: 'productNum',
        width: 120,
        render: (val, record) => {
          return <a onClick={() => this.handleToDetail(record)}>{val}</a>;
        },
      },
      {
        title: intl.get('scec.common.model.productName').d('商品名称'),
        dataIndex: 'productName',
        width: 150,
      },
      {
        title: intl.get('scec.common.model.catalogName').d('目录名称'),
        dataIndex: 'catalogName',
        width: 200,
      },
      {
        title: intl.get('scec.common.model.effectiveDays').d('有效天数'),
        dataIndex: 'effectiveDays',
        width: 100,
        render: val => {
          return val;
        },
        onCell: record => {
          const { effectiveDays } = record;
          const Days = parseInt(effectiveDays, 10);
          if (Days >= 0 && Days <= 7) {
            return { className: styles['effectiveDays-more-col'] };
          } else if (Days < 0) {
            return { className: styles['effectiveDays-col'] };
          } else {
            return {};
          }
        },
      },
      {
        title: intl.get('scec.common.model.taxPrice').d('含税单价'),
        dataIndex: 'taxPrice',
        align: 'right',
        width: 120,
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.netPrice').d('不含税单价'),
        dataIndex: 'netPrice',
        align: 'right',
        width: 120,
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.taxRate').d('税率'),
        dataIndex: 'taxRate',
        width: 80,
      },
      {
        title: intl.get('scec.common.model.supplier').d('供应商'),
        dataIndex: 'supplierName',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.company').d('公司'),
        dataIndex: 'companyName',
        width: 100,
      },
      {
        title: intl.get('scec.common.model.createdUserName').d('创建人'),
        dataIndex: 'createdUserName',
        width: 100,
      },
      {
        title: intl.get('scec.common.model.sourceFromType').d('数据来源'),
        dataIndex: 'sourceFromTypeMeaning',
        render: (text, value) => (
          <span style={value.sourceFromType === 'SHARE' ? { marginLeft: -12 } : {}}>
            <Badge
              status={
                value.sourceFromType === 'SHARE' ? (value.enableFlag ? 'success' : 'error') : ''
              }
            />
            {text}
          </span>
        ),
      },
      {
        title: intl.get('scec.common.model.sourceFromNum').d('来源单号'),
        dataIndex: 'sourceFromNum',
        width: 120,
      },
      {
        title: intl.get('scec.common.button.operating').d('操作记录'),
        dataIndex: 'record',
        width: 100,
        render: (val, record) => {
          return (
            <a onClick={() => this.openRecord(record)}>
              {intl.get('scec.common.button.operating').d('操作记录')}
            </a>
          );
        },
      },
    ];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRows.map(n => n.productId),
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => ({
        disabled:
          record.productStatus === 'UNSHELF_APPROVALING' ||
          record.productStatus === 'WORK_FLOW_APPROVALING',
      }),
    };
    const filterProps = {
      sourceType,
      status: newStatus,
      onRef: this.handleRef,
      onFetchData: this.queryGoodsList,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('scec.goodsMaintainPur.view.goodsMaintainPur.title').d('商品维护')}>
          <Button icon="fork" type="primary" onClick={this.openSourcing}>
            {intl.get('scec.goodsMaintain.button.goodsMaintain.importSourcing').d('引用寻源结果')}
          </Button>
          <Button icon="plus" onClick={() => this.handleToDetail()}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Popconfirm
            title={intl.get('scec.common.warning.tilte.sureToSubmit').d('你确定提交吗?')}
            okText={intl.get('scec.common.action.sure').d('确定')}
            cancelText={intl.get('scec.common.action.cancel').d('取消')}
            onConfirm={() => this.fetchGoodsSubmit()}
          >
            <Button icon="check" disabled={selectedRows.length < 1} loading={submitLoading}>
              {intl.get('scec.common.button.submit').d('提交')}
            </Button>
          </Popconfirm>
          <Popconfirm
            title={intl.get('scec.common.warning.tilte.sureToScrapped').d('你确定作废吗?')}
            okText={intl.get('scec.common.action.sure').d('确定')}
            cancelText={intl.get('scec.common.action.cancel').d('取消')}
            onConfirm={() => this.fetchGoodsScrapped()}
          >
            <Button icon="close" disabled={selectedRows.length < 1} loading={scrappedLoading}>
              {intl.get('scec.common.button.scrapped').d('作废')}
            </Button>
          </Popconfirm>
          <Button
            icon="setting"
            disabled={selectedRows.length < 1}
            onClick={this.fetchModifyDirectory}
          >
            {intl.get('scec.common.button.modifyDirectory').d('修改目录')}
          </Button>
          <Button onClick={this.handleImport}>
            {intl.get('hzero.common.button.import').d('批量导入')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            bordered
            pagination={pagination}
            rowKey="productId"
            rowSelection={rowSelection}
            columns={columns}
            loading={loading}
            onChange={page => this.queryGoodsList(page)}
            scroll={{ x: 1700 }}
            dataSource={list.content || []}
          />
          {visible && (
            <OperateRecord
              productId={this.state.productId}
              modalVisible={visible}
              onHandleOk={this.openRecord}
            />
          )}
          {directoryVisible && (
            <ModifyDirectory
              selectedRows={selectedRows}
              modalVisible={directoryVisible}
              onCancel={this.handleCancel}
              onHandOk={this.handleUpdateGoodsCatelog}
            />
          )}
          {sourcingVisble && (
            <Sourcing
              onHandOk={this.importSourcing}
              modalVisible={sourcingVisble}
              onCancel={this.handleCancel}
              importSoucing={importSoucing}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
