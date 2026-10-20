/**
 * index -预付款核销明细
 * @date: 2020-03-12
 * @author zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import { Icon, Collapse, Spin, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';

import { createPagination } from 'utils/utils';
import intl from 'utils/intl';
// import notification from 'utils/notification';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';

import styles from './index.less';
import HeaderInfo from './HeaderInfo';
import ListTable from './ListTable';

const { Panel } = Collapse;

const common = 'sfin.advancePaymentRecord.model.common.';

@formatterCollections({
  code: ['sfin.payment', 'sfin.advancePaymentRecord'],
})
@Form.create({ fieldNameProp: null })
@connect(({ cancelAfterVerification, loading }) => ({
  cancelAfterVerification,
  headerLoading: loading.effects['cancelAfterVerification/queryHeaderList'],
}))
export default class PayDetail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { paymentHeaderId, paymentLineId, source } = querystring.parse(search.substr(1));

    this.state = {
      source,
      paymentLineId,
      paymentHeaderId,
      collapseKeys: ['header', 'list'], // 打开的折叠面板key
      headerInfo: {},
      InvoiceLineSource: [],
      InvoicePagination: {},
    };
  }

  componentDidMount() {
    this.fetchHeaderList();
    // this.fetchAdvanceLine();
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {string} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind
  fetchHeaderList(page = {}) {
    const { dispatch } = this.props;
    const { paymentLineId } = this.state;
    dispatch({
      type: 'cancelAfterVerification/queryHeaderList',
      payload: {
        paymentLineId,
        page,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          headerInfo: res,
          InvoiceLineSource: res.cancelVerificationVOListPage.content.map((n) => ({
            ...n,
            _status: 'update',
          })),
          InvoicePagination: createPagination(res.cancelVerificationVOListPage),
        });
      }
    });
  }

  /**
   * 查询行信息
   */
  @Bind()
  fetchAdvanceLine(page = {}) {
    const { dispatch } = this.props;
    const { paymentLineId } = this.state;
    dispatch({
      type: 'cancelAfterVerification/fetchAdvanceLine',
      payload: { paymentLineId, ...page },
    }).then((res) => {
      if (res) {
        this.setState({
          InvoiceLineSource: res.content.map((n) => ({ ...n, _status: 'update' })),
          InvoicePagination: createPagination(res),
        });
      }
    });
  }

  render() {
    const { headerLoading = false } = this.props;
    const {
      collapseKeys,
      headerInfo,
      InvoiceLineSource = [],
      InvoicePagination = {},
      source,
      paymentHeaderId,
    } = this.state;
    const listProps = {
      onSearch: this.fetchHeaderList,
      loading: headerLoading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
    };
    const lists =
      source === 'payDetailLine'
        ? `/sfin/pay-query/list`
        : source !== 'maintain'
        ? `/sfin/pay-query/detail/${paymentHeaderId}`
        : `/sfin/pay-approve/detail/${paymentHeaderId}`;
    return (
      <Fragment>
        <Header
          title={intl.get(`sfin.payment.common.payApproveDetail`).d('预付款核销明细')}
          backPath={lists}
        />
        <Content>
          <Spin spinning={false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
            <Collapse
              className={styles['form-collapse']}
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                forceRender
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>{intl.get(`${common}advanceHeaderInfo`).d('核销头信息')}</h3>
                    <a>
                      {collapseKeys.includes('header')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('header') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="header"
              >
                <HeaderInfo
                  onRef={this.handleBindRef}
                  Ref={(node) => {
                    this.HeaderRef = node;
                  }}
                  updateState={this.updateState}
                  editable={1}
                  maintainEditable={0}
                  headerInfo={headerInfo}
                  loading={headerLoading}
                />
              </Panel>
              <Panel
                forceRender
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>{intl.get(`${common}advanceListInfo`).d('核销行信息')}</h3>
                    <a>
                      {collapseKeys.includes('list')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('list') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="list"
              >
                <ListTable {...listProps} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
