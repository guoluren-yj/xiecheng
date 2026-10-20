/*
 * index - 订单状态树查询
 * @date: 2018/10/13 11:39:51
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import intl from 'utils/intl';

import styles from './index.less';

const modelPrompt = 'sodr.sendOrder.model.common';
export default class OrderStatusTree extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      currentLi: undefined,
    };
  }

  @Bind()
  getAllSelectedChild(value) {
    let statusCodes = [];
    switch (value) {
      case 'all':
        return {};
      case 'waitRelease':
        statusCodes = ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'].toString();
        return { statusCodes };
      case 'processing':
        statusCodes = [
          'PUBLISHED',
          'PART_FEED_BACK',
          'DELIVERY_DATE_REVIEW',
          'DELIVERY_DATE_REJECT',
          'CONFIRMED',
        ].toString();
        return { statusCodes };
      case 'cancell':
        statusCodes = ['CANCELED', 'CANCELING_WFL', 'CANCELTOBECOMFIRMED'].toString();
        return { statusCodes };
      case 'close':
        statusCodes = ['CLOSED', 'CLOSE_WFL', 'CLOSETOBECOMFIRMED'].toString();
        return { statusCodes };
      case 'NOTEVALUATED':
        statusCodes = ['CONFIRMED'].toString();
        return {
          statusCodes,
          evaluationFlag: 0,
          confirmedFlag: 1,
        };
      case 'EVALUATED':
        statusCodes = ['CONFIRMED'].toString();
        return {
          statusCodes,
          evaluationFlag: 1,
          confirmedFlag: 1,
        };
      case null:
        return {};
      // return {
      //   statusCodes:
      //     'PENDING,SUBMITTED,APPROVED,REJECT,PUBLISHED,DELIVERY_DATE_REVIEW,DELIVERY_DATE_REJECT',
      //   confirmedFlag: 1,
      //   cancelledFlag: 1,
      //   closedFlag: 1,
      //   publishCancelFlag: 1,
      // };
      default:
        statusCodes = [value].toString();
        return { statusCodes };
    }
  }

  @Bind()
  cancelBubble(e) {
    const evt = e || window.event;
    if (evt.stopPropagation) {
      evt.stopPropagation();
    } else {
      // IE
      evt.cancelBubble = true;
    }
  }

  @Bind()
  handleTypeDeal(e) {
    const { currentLi } = this.state;
    const { handleSearch } = this.props;
    const value = e.target.getAttribute('value');
    if (value) {
      const newCurrentLi = currentLi === value ? null : value;
      const fields = this.getAllSelectedChild(newCurrentLi);
      handleSearch(fields, newCurrentLi);
      this.setState({ currentLi: newCurrentLi });
      this.cancelBubble(e);
    }
  }

  @Bind()
  renderTree() {
    // TODO国际化
    const { settings = {} } = this.props;
    return (
      <div className={styles['type-wrapper']} onClick={this.handleTypeDeal}>
        <div
          className={classnames({
            [styles['first-stage']]: true,
            [styles['current-item']]: this.state.currentLi === 'all',
          })}
          value="all"
        >
          <span>
            <a value="all">
              {intl.get(`sodr.receivedOrder.view.message.orderTypes.all`).d('全部')}
            </a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['second-stage']]: true,
            [styles['current-item']]: this.state.currentLi === 'waitRelease',
          })}
          value="waitRelease"
        >
          <span value="waitRelease">
            {/* <span className={styles.triangle}>{null}</span> */}
            <a value="waitRelease">{intl.get(`${modelPrompt}.waitRelease`).d('待发布')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'PENDING',
          })}
          value="PENDING"
        >
          <span>
            <a value="PENDING">{intl.get(`hzero.common.button.create`).d('新建')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'SUBMITTED',
          })}
          value="SUBMITTED"
        >
          <span>
            <a value="SUBMITTED">{intl.get(`${modelPrompt}.submitted`).d('已提交')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'APPROVED',
          })}
          value="APPROVED"
        >
          <span>
            <a value="APPROVED">{intl.get(`${modelPrompt}.approved`).d('审批通过')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'REJECTED',
          })}
          value="REJECTED"
        >
          <span>
            <a value="REJECTED">{intl.get(`${modelPrompt}.ApprovalRefused`).d('审批拒绝')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['second-stage']]: true,
            [styles['current-item']]: this.state.currentLi === 'processing',
          })}
          value="processing"
        >
          <span value="processing">
            {/* <span className={styles.triangle}>{null}</span> */}
            <a value="processing">{intl.get(`${modelPrompt}.processing`).d('执行中')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'PUBLISHED',
          })}
          value="PUBLISHED"
        >
          <span>
            <a value="PUBLISHED">{intl.get(`${modelPrompt}.published`).d('已发布')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'PART_FEED_BACK',
          })}
          value="PART_FEED_BACK"
        >
          <span>
            <a value="PART_FEED_BACK">{intl.get(`${modelPrompt}.partFeedback`).d('部分反馈')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'DELIVERY_DATE_REVIEW',
          })}
          value="DELIVERY_DATE_REVIEW"
        >
          <span>
            <a value="DELIVERY_DATE_REVIEW">
              {intl.get(`${modelPrompt}.orderFeedbackReview`).d('订单反馈审核')}
            </a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'DELIVERY_DATE_REJECT',
          })}
          value="DELIVERY_DATE_REJECT"
        >
          <span>
            <a value="DELIVERY_DATE_REJECT">
              {intl.get(`${modelPrompt}.orderFeedbackReviewReturn`).d('订单反馈审核退回')}
            </a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'CONFIRMED',
          })}
          value="CONFIRMED"
        >
          <span>
            <a value="CONFIRMED">{intl.get(`${modelPrompt}.confirmed`).d('已确认')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['second-stage-bold']]: true,
            [styles['current-item']]: this.state.currentLi === 'PUBLISH_CANCEL',
          })}
          value="PUBLISH_CANCEL"
        >
          <span>
            <a value="PUBLISH_CANCEL">{intl.get(`${modelPrompt}.cancelPublish`).d('取消发布')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['second-stage']]: true,
            [styles['current-item']]: this.state.currentLi === 'cancell',
          })}
          value="cancell"
        >
          <span value="cancell">
            <a value="cancell">{intl.get(`${modelPrompt}.cancell`).d('取消')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'CANCELED',
          })}
          value="CANCELED"
        >
          <span>
            <a value="CANCELED">{intl.get(`${modelPrompt}.cancelled`).d('已取消')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'CANCELING_WFL',
          })}
          value="CANCELING_WFL"
        >
          <span>
            <a value="CANCELING_WFL">{intl.get(`${modelPrompt}.cancelingWfl`).d('取消审批中')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'CANCELTOBECOMFIRMED',
          })}
          value="CANCELTOBECOMFIRMED"
        >
          <span>
            <a value="CANCELTOBECOMFIRMED">
              {intl.get(`sodr.common.model.common.canceltobecomfirmed`).d('取消待确认')}
            </a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['second-stage']]: true,
            [styles['current-item']]: this.state.currentLi === 'close',
          })}
          value="close"
        >
          <span value="close">
            <a value="close">{intl.get(`${modelPrompt}.close`).d('关闭')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'CLOSED',
          })}
          value="CLOSED"
        >
          <span>
            <a value="CLOSED">{intl.get(`${modelPrompt}.closed`).d('已关闭')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'CLOSE_WFL',
          })}
          value="CLOSE_WFL"
        >
          <span>
            <a value="CLOSE_WFL">{intl.get(`${modelPrompt}.closeWfl`).d('关闭审批中')}</a>
          </span>
        </div>
        <div
          className={classnames({
            [styles['third-stage']]: true,
            [styles['current-item-border']]: this.state.currentLi === 'CLOSETOBECOMFIRMED',
          })}
          value="CLOSETOBECOMFIRMED"
        >
          <span>
            <a value="CLOSETOBECOMFIRMED">
              {intl.get(`sodr.common.model.common.closetobecomfirmed`).d('关闭待确认')}
            </a>
          </span>
        </div>
        {settings['010217'] === '1' && (
          <Fragment>
            <div
              className={classnames({
                [styles['second-stage-bold']]: true,
                [styles['current-item']]: this.state.currentLi === 'NOTEVALUATED',
              })}
              value="NOTEVALUATED"
            >
              <span>
                <a value="NOTEVALUATED">
                  {intl.get(`sodr.common.view.message.notEvaluated`).d('待评价')}
                </a>
              </span>
            </div>
            <div
              className={classnames({
                [styles['second-stage-bold']]: true,
                [styles['current-item']]: this.state.currentLi === 'EVALUATED',
              })}
              value="EVALUATED"
            >
              <span>
                <a value="EVALUATED">
                  {intl.get(`sodr.common.view.message.evaluated`).d('已评价')}
                </a>
              </span>
            </div>
          </Fragment>
        )}
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        <div className={styles['order-type']}>{this.renderTree()}</div>
      </React.Fragment>
    );
  }
}
