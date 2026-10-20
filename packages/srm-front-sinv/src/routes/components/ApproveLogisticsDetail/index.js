/* eslint-disable jsx-a11y/iframe-has-title */
/*
 * LogisticsInfoList - 送货单tabs物流信息
 * @date: 2020/06/03 14:58:31
 * @author: FJ <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Row, Col, Button, Spin, Icon, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isArray, isNil } from 'lodash';

import intl from 'utils/intl';
import { EDIT_FORM_ROW_LAYOUT, FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import notification from 'utils/notification';

import styles from './index.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, sinvCommon = {} }) => ({
  loading: loading.effects['sinvCommon/fetchLogistics'],
  refreshLoading: loading.effects['sinvCommon/handleRefreshLogistics'],
  sinvCommon,
}))
export default class LogisticsDetail extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) props.onRef(this);
    this.state = {
      display: false,
      logisticsData: {},
      logisticsList: {},
      tipDisplay: false,
      mapFlag: true,
      asnHeaderId: '',
    };
  }

  componentDidMount() {
    this.setState(
      {
        asnHeaderId: this.props.headerInfo.asnHeaderId,
      },
      () => {
        this.fetchLogistics(true);
      }
    );
  }

  // 子组件生命周期函数动态监控更新父组件传入的props
  componentWillReceiveProps(nextProps) {
    if (nextProps.headerInfo.asnHeaderId !== this.state.asnHeaderId) {
      this.setState(
        {
          asnHeaderId: nextProps.headerInfo.asnHeaderId,
        },
        () => {
          this.fetchLogistics();
        }
      );
    }
  }

  @Bind()
  fetchLogistics(flag = false) {
    const {
      dispatch,
      // headerInfo: { asnHeaderId },
    } = this.props;
    const { asnHeaderId } = this.state;
    if (!isNil(asnHeaderId)) {
      dispatch({
        type: 'sinvCommon/fetchLogistics',
        payload: {
          asnHeaderId,
        },
      }).then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          this.setState({
            logisticsTrackUrl: res[0].logisticsTrackUrl,
          });
          if (res[0].logisticsId === null && res[0].logisticsTrackUrl) {
            this.handleRefreshLogistics();
          } else {
            this.setState({
              logisticsData: res[0],
            });
          }
        } else if (flag) {
          this.handleRefreshLogistics();
        }
      });
    }
  }

  @Bind()
  handleRefreshLogistics() {
    const {
      dispatch,
      headerInfo: { asnHeaderId },
      fetchDetailHeader = (e) => e,
    } = this.props;
    const { logisticsList = {} } = this.state;
    dispatch({
      type: 'sinvCommon/handleRefreshLogistics',
      payload: {
        asnHeaderId,
      },
    }).then((res) => {
      if (res && res.failed) {
        const { type, message } = res;
        if (type === 'warn') {
          notification.warning({ message });
        } else if (type === 'error') {
          notification.error({ message });
        }
        if (res.code === 'error.logistic.not.open.exception') {
          this.setState({
            tipDisplay: true,
          });
        }
        fetchDetailHeader();
      } else if (res && isArray(res)) {
        this.setState({
          logisticsData: { ...logisticsList, ...res[0] } || {},
        });
        fetchDetailHeader();
      }
    });
  }

  @Bind()
  toggleModal() {
    this.setState({
      display: !this.state.display,
    });
  }

  @Bind()
  onChangeMap() {
    const { mapFlag } = this.state;
    this.setState({
      mapFlag: !mapFlag,
    });
  }

  @Bind()
  renderList(data, firstItem) {
    const { AcceptTime, AcceptStation } = firstItem;
    return (
      <Fragment>
        <li className="active">
          <div className="logistics-date">
            <span>{AcceptTime && AcceptTime.split(' ')[0]}</span>
          </div>
          <div className="logistics-time">
            <span>{AcceptTime && AcceptTime.split(' ')[1]}</span>
          </div>
          <div className="logistics-box-cicle">
            <span
              className={`logistics-cicle active ${data.length > 1 && 'line'} ${
                AcceptStation && AcceptStation.length > 50 && 'twoLongLine'
              } ${AcceptStation && AcceptStation.length > 100 && 'threeLongLine'}`}
            />
          </div>
          <div className="logistics-desc">
            <span>{AcceptStation}</span>
          </div>
        </li>
        {data.map(
          (item, index) =>
            index > 0 && (
              // index < data.length - 1 &&
              <li>
                <div className="logistics-date">
                  {data[index - 1].AcceptTime.split(' ')[0] &&
                    data[index].AcceptTime.split(' ')[0] !==
                      data[index - 1].AcceptTime.split(' ')[0] && (
                      <span>{item.AcceptTime.split(' ')[0]}</span>
                    )}
                </div>
                <div className="logistics-time">
                  <span>{item.AcceptTime.split(' ')[1]}</span>
                </div>
                <div className="logistics-box-cicle">
                  <span
                    className={`logistics-cicle ${index < data.length - 1 && 'line'} ${
                      item.AcceptStation.length > 60 && 'twoLongLine'
                    } ${item.AcceptStation.length > 120 && 'threeLongLine'}`}
                  />
                </div>
                <div className="logistics-desc">
                  <span>{item.AcceptStation}</span>
                </div>
              </li>
            )
        )}
      </Fragment>
    );
  }

  render() {
    const { headerInfo = {}, refreshLoading, loading, form, customizeForm } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const {
      carNumber,
      expressNum,
      logisticsCost,
      logisticsStaff,
      logisticsPhoneNum,
      logisticsContactInfo,
      logisticsCompanyMeaning,
      internationalTelMeaning,
      logisticsReceiptStatusMeaning,
    } = headerInfo;
    const { display, tipDisplay, logisticsData = {}, mapFlag, logisticsTrackUrl } = this.state;
    const { lastUpdateDate = '', asnLogisticsDtoList = [] } = logisticsData;
    const newData = (asnLogisticsDtoList && [...asnLogisticsDtoList].reverse()) || [];
    const firstItem = newData[0] || {};
    return (
      <div className={styles['logistics-content']}>
        <Spin spinning={loading || refreshLoading || false}>
          <div className="logistics-title">
            {intl.get(`sinv.common.view.message.title.basicInfo`).d('基本信息')}
          </div>
          <div className="logistics-basic">
            {customizeForm(
              {
                form,
                dataSource: headerInfo,
                code: 'SINV.DELIVERY_APPROVED_DETAIL.LOGISTICS',
              },
              <Form>
                <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.expressNum`).d('快递单号')}
                    >
                      {getFieldDecorator('expressNum')(<span>{expressNum}</span>)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.logisticsStaff`).d('配送人员')}
                    >
                      {getFieldDecorator('logisticsStaff')(<span>{logisticsStaff}</span>)}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.mobileNum`).d('收件人手机号')}
                    >
                      {getFieldDecorator('logisticsPhoneNum')(
                        <span>
                          {internationalTelMeaning}|{logisticsPhoneNum}
                        </span>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.logisticsCompany`).d('物流公司')}
                    >
                      {getFieldDecorator('logisticsCompany')(
                        <span>{logisticsCompanyMeaning}</span>
                      )}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl
                        .get(`sinv.common.model.common.logisticsContactInfo`)
                        .d('联系方式')}
                    >
                      {getFieldDecorator('logisticsContactInfo')(
                        <span>{logisticsContactInfo}</span>
                      )}
                    </FormItem>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.logisticsCost`).d('物流费用')}
                    >
                      {getFieldDecorator('logisticsCost')(<span>{logisticsCost}</span>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                  <Col {...FORM_COL_3_LAYOUT}>
                    <FormItem
                      {...EDIT_FORM_ITEM_LAYOUT}
                      label={intl.get(`sinv.common.model.common.carNumber`).d('车牌号')}
                    >
                      {getFieldDecorator('carNumber', {
                        rules: [
                          {
                            max: 20,
                            message: intl.get('hzero.common.validation.max', { max: 20 }),
                          },
                        ],
                      })(<span>{carNumber}</span>)}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            )}
          </div>
          <div className="logistics-title">
            {intl.get(`sinv.common.view.message.title.logisticsInfo`).d('物流信息')}
          </div>
          <div className="logistics-info">
            {logisticsTrackUrl ? (
              <div className="logistics-info-map">
                {newData.length > 0 && (
                  <>
                    <div
                      className={
                        mapFlag ? 'logistics-info-map-icon' : 'logistics-info-map-icon-off'
                      }
                      onClick={() => this.onChangeMap()}
                    >
                      <div className="logistics-info-icon-up">
                        <Icon type="up" />
                      </div>
                    </div>
                    <div
                      className={
                        mapFlag ? 'logistics-info-map-text' : 'logistics-info-map-text-off'
                      }
                    >
                      <div className="logistics-list">
                        <ul>{this.renderList(newData, firstItem)}</ul>
                      </div>
                    </div>
                  </>
                )}
                <div className="logistics-info-map-corenucleus">
                  <iframe src={logisticsTrackUrl} width="100%" height="100%" />
                </div>
              </div>
            ) : (
              <div
                className={`logistics-details ${
                  display ? 'more' : newData.length < 6 ? 'min' : 'large'
                }`}
              >
                <div className="logistics-refresh">
                  <span className="logistics-last">
                    {intl.get(`sinv.common.model.common.lastUpdateDate`).d('最后一次更新时间：')}
                  </span>
                  {lastUpdateDate || '-'}
                  {!tipDisplay && (
                    <Button
                      style={{ marginRight: 16 }}
                      onClick={this.handleRefreshLogistics}
                      loading={refreshLoading}
                      type="primary"
                    >
                      {intl.get(`sinv.common.model.message.button.refresh`).d('刷新')}
                    </Button>
                  )}
                  <span style={{ color: '#FF0000' }}>{logisticsReceiptStatusMeaning || '-'}</span>
                </div>
                {newData.length > 0 ? (
                  <div className="logistics-list">
                    <ul>{this.renderList(newData, firstItem)}</ul>
                  </div>
                ) : tipDisplay ? (
                  <div className="no-logistics">
                    {intl
                      .get(`sinv.common.model.common.logisticsTips`)
                      .d('若需查询物流详情，请开通物流服务！')}
                  </div>
                ) : (
                  <div className="no-logistics">
                    {intl.get(`sinv.common.model.common.noLogistics`).d('暂无物流信息！')}
                  </div>
                )}
              </div>
            )}
            {!logisticsTrackUrl && newData.length > 5 && (
              <Fragment>
                {display ? (
                  <div className="logistics-info-btn close-btn" onClick={this.toggleModal}>
                    <Icon type="up" />
                    &nbsp;
                    {intl.get(`hzero.common.button.up`).d('收起')}
                  </div>
                ) : (
                  <div className="logistics-info-btn" onClick={this.toggleModal}>
                    <Icon type="down" />
                    &nbsp;
                    {intl.get(`hzero.common.button.expand`).d('展开')}
                  </div>
                )}
              </Fragment>
            )}
          </div>
        </Spin>
      </div>
    );
  }
}
