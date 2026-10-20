/**
 * PurchaserCreditInfo - 认证信息展示 - 采购方
 * @date: 2018-12-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Spin } from 'hzero-ui';
import { withRouter } from 'react-router-dom';
import qs from 'querystring';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import Information from './Information';
import FixedMenu from './FixedMenu';

/**
 * 认证信息展示
 * @extends {Component} - React.Component
 * @reactProps {Object} creditInfo - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

formatterCollections({ code: ['seci.creditInfo'] });
@connect(({ purchaserCreditInfo, loading }) => ({
  purchaserCreditInfo,
  fetchLoading: loading.effects['purchaserCreditInfo/fetchCreditInfo'],
}))
@withRouter
export default class PurchaserCreditInfo extends PureComponent {
  constructor(props) {
    super(props);
    const { companyName } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      companyName,
    };
  }

  componentDidMount() {
    this.fetchCreditInfo();
  }

  /**
   * 查询征信信息
   */
  @Bind()
  fetchCreditInfo() {
    const { dispatch } = this.props;
    const { companyName } = this.state;
    dispatch({
      type: 'purchaserCreditInfo/fetchCreditInfo',
      payload: {
        keyword: companyName,
      },
    }).then(res => {
      if (res) {
        if (res.status !== '200') {
          notification.warning({ message: res.message });
        }
      }
    });
  }

  render() {
    const {
      fetchLoading,
      purchaserCreditInfo: {
        informationData = {},
        changeRecordData = [],
        shareholderData = [],
        abnormalItemData = [],
      },
    } = this.props;
    const informationProps = {
      informationData,
      changeRecordData,
      shareholderData,
      abnormalItemData,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`seci.creditInfo.view.message.title`).d('认证信息')}>
          {/* <Button icon="export" type="primary">
            {intl.get('hzero.common.button.export').d('导出')}
          </Button> */}
        </Header>
        <Content className="scoll-area">
          <Spin spinning={fetchLoading || false}>
            <Row gutter={24}>
              <Col span={20}>
                <Information {...informationProps} />
              </Col>
              <Col span={4}>
                <FixedMenu />
              </Col>
            </Row>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
