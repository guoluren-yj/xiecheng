/* eslint-disable jsx-a11y/iframe-has-title */
/*
 * LogisticsInfoList - 送货单tabs物流信息
 * @date: 2020/06/03 14:58:31
 * @author: FJ <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
// import { Row, Col, Button, Spin, Form, Icon } from 'hzero-ui';
import { Spin, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Button as C7nButton, Tooltip, Icon as C7nIcon } from 'choerodon-ui';
import { Button as ProButton } from 'choerodon-ui/pro';

import { isArray } from 'lodash';
import intl from 'utils/intl';
// import { EDIT_FORM_ROW_LAYOUT, FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { fetchLogistics, handleRefreshLogistics } from '@/services/sinvCommonService';
import notification from 'utils/notification';
import styles from './index.less';

// const FormItem = Form.Item;

// @Form.create({ fieldNameProp: null })

export default class LogisticsDetail extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) props.onRef(this);
    this.state = {
      display: false,
      logisticsData: {},
      logisticsList: {},
      tipDisplay: false,
      mapFlag: false,
      isEnlarge: false,
      logisticsTrackUrl: '', // 车辆地图
      logisticsPackageUrl: '', // 包裹地图
      asnHeaderId: '',
      refreshLoading: false,
      loading: false,
    };
  }

  componentDidMount() {
    this.setState(
      {
        asnHeaderId: this.props?.headerInfo?.asnHeaderId,
      },
      () => {
        this.fetchLogistics(true);
      }
    );
  }

  // 子组件生命周期函数动态监控更新父组件传入的props
  componentWillReceiveProps(nextProps) {
    if (nextProps?.headerInfo?.asnHeaderId !== this.state.asnHeaderId) {
      this.setState(
        {
          asnHeaderId: nextProps?.headerInfo?.asnHeaderId,
        },
        () => {
          this.fetchLogistics();
        }
      );
    }
  }

  @Bind()
  async fetchLogistics(flag = false) {
    const { mapFlag } = this.state;
    const { headerInfo = {} } = this.props;
    if (headerInfo?.asnHeaderId) {
      this.setState({ loading: true });
      await fetchLogistics({ asnHeaderId: headerInfo.asnHeaderId })
        .then((res) => {
          if (res && res?.length > 0) {
            const newSymbol =
              (res[0].state || '').substr(0, 1) === '3' ||
              (res[0].state || '').substr(0, 1) === '4'; // 物流签收状态编码为3、4开头的不刷
            this.setState({
              logisticsTrackUrl: res[0]?.logisticsTrackUrl,
              mapFlag: !mapFlag,
            });
            if (!newSymbol) {
              this.handleRefreshLogistics();
            } else {
              this.setState({
                logisticsData: res[0],
              });
            }
          } else if (flag) {
            this.handleRefreshLogistics();
          }
          this.setState({ loading: false });
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    }
  }

  @Bind()
  handleRefreshLogistics() {
    const { headerInfo, fetchDetailHeader = (e) => e } = this.props;
    const { logisticsList = {}, isEnlarge } = this.state;
    this.setState({
      refreshLoading: true,
    });
    handleRefreshLogistics({ asnHeaderId: headerInfo?.asnHeaderId }).then((res) => {
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
        this.setState({
          refreshLoading: false,
        });
      } else if (isArray(res) && res.length) {
        this.setState({
          logisticsData: { ...logisticsList, ...res[0] } || {},
          logisticsPackageUrl: res[0]?.logisticsTrackUrl,
          mapFlag: false,
          isEnlarge: !isEnlarge,
        });
        fetchDetailHeader();
        this.setState({
          refreshLoading: false,
        });
      }
      this.setState({
        refreshLoading: false,
      });
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
    // const { headerInfo = {}, form, customizeForm } = this.props;
    const { headerInfo = {} } = this.props;
    const { refreshLoading } = this.state;
    const { loading } = this.state;
    const {
      // carNumber,
      // expressNum,
      // logisticsCost,
      // logisticsStaff,
      // logisticsPhoneNum,
      // logisticsContactInfo,
      // logisticsCompanyMeaning,
      // internationalTelMeaning,
      logisticsReceiptStatusMeaning,
    } = headerInfo;
    const {
      display,
      tipDisplay,
      logisticsData = {},
      mapFlag,
      logisticsTrackUrl,
      isEnlarge,
      logisticsPackageUrl,
    } = this.state;
    const { lastUpdateDate = '', asnLogisticsDtoList = [] } = logisticsData;
    const newData = (asnLogisticsDtoList && [...asnLogisticsDtoList].reverse()) || [];
    const firstItem = newData[0] || {};
    return (
      <div className={styles['logistics-content']}>
        <Spin spinning={loading || refreshLoading || false}>
          {/* <div className="logistics-title">
            {intl.get(`sinv.common.view.message.title.basicInfo`).d('基本信息')}
          </div>
          <div className="logistics-basic">
            {customizeForm(
              {
                form,
                dataSource: headerInfo,
                code: 'SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS',
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
          </div> */}
          <div className="logistics-title">
            {intl.get(`sinv.common.view.message.title.logisticsInfo`).d('物流信息')}
          </div>
          <div className="logistics-info">
            {logisticsTrackUrl || logisticsPackageUrl ? (
              <>
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
                        <C7nButton
                          style={{ marginTop: 16, float: 'right' }}
                          onClick={this.handleRefreshLogistics}
                          loading={refreshLoading}
                          icon="sync"
                          funcType="flat"
                        />
                        <div className="logistics-list">
                          <ul>{this.renderList(newData, firstItem)}</ul>
                        </div>
                      </div>
                    </>
                  )}
                  {logisticsTrackUrl && logisticsPackageUrl ? (
                    <div className="logistics-info-map-corenucleus">
                      <iframe
                        src={!isEnlarge ? logisticsTrackUrl : logisticsPackageUrl}
                        width="100%"
                        height="100%"
                      />
                    </div>
                  ) : (
                    <div className="logistics-info-map-corenucleus">
                      <iframe
                        src={logisticsTrackUrl || logisticsPackageUrl}
                        width="100%"
                        height="100%"
                      />
                    </div>
                  )}
                  {logisticsPackageUrl && logisticsTrackUrl && (
                    <div className="logistics-info-map-express">
                      <C7nButton
                        onClick={() => this.setState({ isEnlarge: !isEnlarge, mapFlag: !mapFlag })}
                        className="logistics-info-map-expand"
                        // icon='arrows-alt'
                      >
                        <Icon type="arrows-alt" />
                      </C7nButton>
                      <iframe
                        src={!isEnlarge ? logisticsPackageUrl : logisticsTrackUrl}
                        width="100%"
                        height="100%"
                      />
                    </div>
                  )}
                </div>
              </>
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
                    <ProButton
                      style={{ marginRight: 16 }}
                      onClick={this.handleRefreshLogistics}
                      loading={refreshLoading}
                      color="primary"
                    >
                      <span> {intl.get(`sinv.common.model.message.button.refresh`).d('刷新')}</span>
                      <Tooltip
                        placement="bottom"
                        title={intl
                          .get('hzero.common.button.logisticTip')
                          .d(
                            '点击后将会把「快递单号」「物流公司」「收件人电话」传给第三方用以获取物流信息，请知晓'
                          )}
                      >
                        <C7nIcon
                          style={{ marginLeft: '4px' }}
                          className={styles.helpOutline}
                          type="help_outline"
                          width={16}
                          height={16}
                        />
                      </Tooltip>
                    </ProButton>
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
            {!logisticsTrackUrl && !logisticsPackageUrl && newData.length > 5 && (
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
