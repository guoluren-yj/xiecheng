import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { Table, Form, Badge } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isArray } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import FilterForm from './FilterForm';

@Form.create({ fieldNameProp: null })
@connect(({ goodsShare, loading, ecCategoryCompanyCatalog }) => ({
  goodsShare,
  ecCategoryCompanyCatalog,
  loading: loading.effects['goodsShare/fetchSharedGoodsList'],
}))
@withRouter
export default class SharedGoods extends PureComponent {
  form;

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      newStatus: [],
    };
  }

  componentDidMount() {
    this.batchCode();
  }

  /**
   * 被分享商品查询
   * @param {*} page 分页
   */
  @Bind()
  sharedGoodsList(page = {}) {
    const { dispatch, companyId } = this.props;
    if (companyId) {
      const fieldsValue = isUndefined(this.form)
        ? {}
        : filterNullValueObject({
            ...this.form.getFieldsValue(),
            creationDate: this.form.getFieldValue('creationDate')
              ? this.form.getFieldValue('creationDate').format(DEFAULT_DATETIME_FORMAT)
              : '',
          });
      dispatch({
        type: 'goodsShare/fetchSharedGoodsList',
        payload: {
          companyId,
          page,
          ...fieldsValue,
        },
      });
    } else {
      notification.info({
        message: intl.get('scec.goodsShare.view.message.chooseCompany').d('请选择当前公司'),
      });
    }
  }

  /**
   * 查看详情
   */
  @Bind()
  viewDetail(record = {}) {
    const { activeKey } = this.props;
    const router =
      record.productNum &&
      `/scec/goods-share/detail?productId=${record.productId}&activeKey=${activeKey}`;
    this.props.history.push(router);
  }

  // 获取form ref
  @Bind()
  handleFormRef(ref = {}) {
    this.form = (ref.props || {}).form;
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
      type: 'goodsShare/batchCode',
      payload: lovCodes,
    }).then(() => {
      const {
        goodsShare: { code = {} },
      } = this.props;
      const newStatus = this.exchangeSourceType(code.status);
      this.setState({
        newStatus,
      });
    });
  }

  /**
   * 更改状态的显示值级
   */
  @Bind()
  exchangeSourceType(params = []) {
    let changeParams = [];
    if (isArray(params) && params.length > 0) {
      changeParams = params.filter(item => {
        return item.value !== 'EDIT';
      });
    }
    return changeParams;
  }

  render() {
    const {
      loading,
      companyId,
      goodsShare: { sharedList, sharedPagination },
    } = this.props;
    const { newStatus = [] } = this.state;
    const statusList = isArray(newStatus) && newStatus.length > 0 ? newStatus : [];
    const columns = [
      {
        title: intl.get('scec.common.model.common.productNum').d('商品编码'),
        width: 100,
        dataIndex: 'productNum',
      },
      {
        title: intl.get('scec.common.model.common.productName').d('商品名称'),
        width: 180,
        dataIndex: 'productName',
      },
      {
        title: intl.get('scec.goodsShare.model.goodsShare.receiveTime').d('接收时间'),
        width: 100,
        dataIndex: 'creationDate',
      },
      {
        title: intl.get('scec.common.model.common.supplier').d('供应商'),
        width: 100,
        dataIndex: 'supplierName',
      },
      {
        title: intl.get('scec.goodsShare.model.goodsShare.sourceCompany').d('来源公司'),
        width: 100,
        dataIndex: 'sourceName',
      },
      {
        title: intl.get('scec.goodsShare.model.goodsShare.shareFlag').d('分享状态'),
        width: 100,
        dataIndex: 'enableFlag',
        render: text => (
          <Badge
            status={text ? 'success' : 'error'}
            text={
              text && text === 1
                ? intl.get('scec.goodsShare.view.message.able').d('可用')
                : intl.get('scec.goodsShare.view.message.disable').d('不可用')
            }
          />
        ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'productStatus',
        render: record => {
          switch (record) {
            case 'NEW':
              return intl.get('scec.goodsShare.view.message.create').d('新建');
            case 'SUBMITTED':
              return intl.get('scec.goodsShare.view.message.submitted').d('已提交');
            case 'APPROVED':
              return intl.get('scec.goodsShare.view.message.approved').d('审批通过');
            case 'REJECT':
              return intl.get('scec.goodsShare.view.message.reject').d('审批拒绝');
            case 'SHELF':
              return intl.get('scec.goodsShare.view.message.shelf').d('已上架');
            case 'UNSHELVE':
              return intl.get('scec.goodsShare.view.message.unshelf').d('已下架');
            case 'INVALID':
              return intl.get('scec.goodsShare.view.message.invalid').d('已作废');
            case 'TOSUBMIT':
              return intl.get('scec.goodsShare.view.message.tosubmit').d('待提交');
            case 'DISABLED':
              return intl.get('scec.goodsShare.view.message.disabled').d('已失效');
            default:
              break;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        render: (_, record) => {
          return (
            <a onClick={() => this.viewDetail(record)}>
              {intl.get('hzero.common.button.examine').d('查看')}
            </a>
          );
        },
      },
    ];
    const filterList = {
      companyId,
      onRef: this.handleFormRef,
      status: statusList,
      sharedGoodsList: this.sharedGoodsList,
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <FilterForm {...filterList} />
        </div>
        <Table
          bordered
          rowKey="productId"
          loading={loading}
          columns={columns}
          dataSource={sharedList}
          pagination={sharedPagination}
          onChange={page => this.sharedGoodsList(page)}
        />
      </React.Fragment>
    );
  }
}
