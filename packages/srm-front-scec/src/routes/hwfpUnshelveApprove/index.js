/**
 * GoodsManage -商品下架审批
 * @date: 2019-12-9
 * @author zz <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';

import { filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';

import styles from './index.less';
import CauseModal from './causeModal';

@connect(({ hwfpUnshelveApprove, loading }) => ({
  hwfpUnshelveApprove,
  loading: loading.effects['hwfpUnshelveApprove/fetchGoodsList'],
}))
@formatterCollections({ code: ['scec.common'] })
export default class HwfpUnshelveApprove extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordData: [],
      modalVisible: false,
    };
  }

  form;

  componentDidMount() {
    this.fetchGoodsList();
  }

  @Bind()
  fetchGoodsList(params = {}) {
    const { dispatch } = this.props;
    const { productIds } = this.props.match.params;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'hwfpUnshelveApprove/fetchGoodsList',
      payload: {
        page: isEmpty(params) ? {} : params,
        productIds,
        ...fieldValues,
      },
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref || {}).props.form;
  }

  @Bind()
  handleCancel() {
    this.setState({
      modalVisible: false,
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
    const { modalVisible, recordData } = this.state;
    const {
      hwfpUnshelveApprove: { list = {}, pagination = {} },
      loading,
    } = this.props;
    const columns = [
      {
        title: '申请时间',
        dataIndex: 'operatedDate',
      },
      {
        title: intl.get('scec.common.model.productNum').d('商品编码'),
        dataIndex: 'productNum',
        width: 150,
      },
      {
        title: intl.get('scec.common.model.productName').d('商品名称'),
        dataIndex: 'productName',
        width: 150,
      },
      {
        title: intl.get('scec.common.model.catalogName').d('目录名称'),
        dataIndex: 'catalogName',
        width: 150,
      },
      {
        title: intl.get('scec.common.model.effectiveDays').d('有效天数'),
        dataIndex: 'effectiveDays',
        width: 120,
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
        title: '下架原因',
        dataIndex: 'operatedRemark',
        width: 100,
        render: (_, record) => (
          <a onClick={() => this.setState({ modalVisible: true, recordData: record })}>详情</a>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header title="下架审批" />
        <Content>
          <Table
            bordered
            columns={columns}
            loading={loading}
            rowKey="productId"
            scroll={{ x: 1680 }}
            pagination={pagination}
            dataSource={list.content || []}
            onChange={page => this.fetchGoodsList(page)}
          />
          {modalVisible && (
            <CauseModal
              recordData={recordData}
              modalVisible={modalVisible}
              onHandleCancel={this.handleCancel}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
