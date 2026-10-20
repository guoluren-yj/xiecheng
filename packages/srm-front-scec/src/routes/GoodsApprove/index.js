/**
 * GoodsApprove -商品审批 index
 * @date: 2019-2-9
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { Button, Table, Popconfirm, Modal, Row, Col, Form, Input, Badge } from 'hzero-ui';
import { isUndefined, isEmpty } from 'lodash';
import { Link } from 'dva/router';

import { filterNullValueObject, tableScrollWidth } from 'utils/utils';
// import { numberRender } from 'utils/renderer';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { Header, Content } from 'components/Page';

import FilterList from './FilterList';
import OperateRecord from '../OperateRecord';
import styles from './index.less';

const { TextArea } = Input;
const promptKey = 'scec.goodsApprove.model.goodsApprove';
@Form.create({ fieldNameProp: null })
@connect(({ goodsApprove, loading }) => ({
  goodsApprove,
  loading: loading.effects['goodsApprove/fetchGoodsList'],
  approveLoading: loading.effects['goodsApprove/batchGoodsApproved'],
  rejectLoading: loading.effects['goodsApprove/batchGoodsReject'],
}))
@formatterCollections({ code: ['scec.goodsApprove', 'scec.common', 'scec.goodsPreview'] })
export default class GoodsApprove extends Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      rejectModelVisible: false, // 是否打开拒绝理由提示框
      visible: false, // 操作记录是否显影
    };
  }

  componentDidMount() {
    this.fetchGoodsList();
    this.batchCode();
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
      type: 'goodsApprove/batchCode',
      payload: lovCodes,
    });
  }

  /**
   * 查询已上架或未上架商品
   * @param {object} params  查询参数
   */
  @Bind()
  fetchGoodsList(params = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'goodsApprove/fetchGoodsList',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues,
      },
    });
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref || {}).props.form;
  }

  /**
   * 保存勾选的数据
   * @param {string} selectedRowKeys --当前勾选数据key
   * @param {object} selectedRows --当前勾选行数据
   */
  @Bind()
  handlerRowSelect(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 填写拒绝理由后，确认拒绝
   */
  @Bind()
  onRejectConfirm() {
    const { rejectModelVisible } = this.state;
    this.setState({
      rejectModelVisible: !rejectModelVisible,
    });
  }

  @Bind()
  showConfirm() {
    const { rejectLoading } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title={intl.get(`${promptKey}.explain`).d('审批说明')}
        destroyOnClose
        visible={this.state.rejectModelVisible}
        onOk={this.batchGoodsReject}
        confirmLoading={rejectLoading}
        onCancel={this.onRejectConfirm}
        okText={intl.get('scec.common.action.sure').d('确定')}
        cancelText={intl.get('scec.common.action.cancel').d('取消')}
      >
        <Row gutter={24}>
          <Col span={4} className="ant-col-label-reject">
            {intl.get(`${promptKey}.objection`).d('拒绝理由')}
          </Col>
          <Col span={20}>
            <Form.Item>{getFieldDecorator('approveRemark')(<TextArea rows={4} />)}</Form.Item>
          </Col>
        </Row>
      </Modal>
    );
  }

  /**
   * 商品批量审批通过
   * @param {object} params 选择需审批的参数
   */
  @Bind()
  batchGoodsApprove() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    const productIds = selectedRowKeys;
    dispatch({
      type: 'goodsApprove/batchGoodsApproved',
      payload: productIds,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchGoodsList();
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
      }
    });
  }

  /**
   * 商品批量审批拒绝
   * @param {object} params 选择需拒绝的参数
   */
  @Bind()
  batchGoodsReject() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    const productIds = selectedRowKeys;
    const approveRemark = this.props.form.getFieldValue('approveRemark');
    dispatch({
      type: 'goodsApprove/batchGoodsReject',
      payload: {
        productIds,
        approveRemark,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchGoodsList();
        this.onRejectConfirm();
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
      }
    });
  }

  /**
   * 操作记录显示隐藏
   */
  @Bind()
  openOperationRecord(record = {}) {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
      productId: record.productId,
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

  render() {
    const {
      goodsApprove: {
        pagination = {},
        list = {},
        code: { status = [], sourceType = [] },
      },
      loading,
      approveLoading,
      rejectLoading,
    } = this.props;
    const { selectedRows = [], selectedRowKeys = [], visible } = this.state;
    const filterList = {
      status,
      sourceType,
      onRef: this.handleRef,
      onFetchGoods: this.fetchGoodsList,
    };
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
          return <Link to={`/scec/goods-approve/detail?productId=${record.productId}`}>{val}</Link>;
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
        width: 120,
        align: 'right',
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.netPrice').d('不含税单价'),
        dataIndex: 'netPrice',
        width: 120,
        align: 'right',
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
        width: 120,
      },
      {
        title: intl.get('scec.common.model.createdUserName').d('创建人'),
        dataIndex: 'createdUserName',
        width: 120,
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
        width: 150,
      },
      {
        title: intl.get('scec.common.button.operating').d('操作记录'),
        dataIndex: 'records',
        align: 'center',
        width: 100,
        render: (_, record) => {
          return (
            <a onClick={() => this.openOperationRecord(record)}>
              {intl.get('scec.common.button.operating').d('操作记录')}
            </a>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('scec.goodsApprove.view.goodsApprove.title').d('商品审批')}>
          <Popconfirm
            title={intl.get('scec.common.warning.tilte.sureToPass').d('你确定通过吗?')}
            okText={intl.get('scec.common.action.sure').d('确定')}
            cancelText={intl.get('scec.common.action.cancel').d('取消')}
            onConfirm={() => this.batchGoodsApprove()}
          >
            <Button
              icon="check"
              type="primary"
              disabled={selectedRowKeys.length < 1}
              loading={approveLoading}
            >
              {intl.get('scec.common.button.pass').d('通过')}
            </Button>
          </Popconfirm>
          <Popconfirm
            title={intl.get('scec.common.warning.tilte.sureToRefuse').d('你确定拒绝吗?')}
            okText={intl.get('scec.common.action.sure').d('确定')}
            cancelText={intl.get('scec.common.action.cancel').d('取消')}
            onConfirm={() => this.onRejectConfirm()}
          >
            <Button icon="close" loading={rejectLoading} disabled={selectedRowKeys.length < 1}>
              {intl.get('scec.common.button.refuse').d('拒绝')}
            </Button>
          </Popconfirm>
        </Header>
        <Content>
          <FilterList {...filterList} />
          <Table
            pagination={pagination}
            dataSource={list.content || []}
            rowKey="productId"
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            loading={loading}
            bordered
            onChange={page => this.fetchGoodsList(page)}
            rowSelection={{
              selectedRowKeys: selectedRows.map(n => n.productId),
              onChange: this.handlerRowSelect,
            }}
          />
          {visible && (
            <OperateRecord
              modalVisible={visible}
              productId={this.state.productId}
              onHandleOk={this.openOperationRecord}
            />
          )}
          {this.showConfirm()}
        </Content>
      </React.Fragment>
    );
  }
}
