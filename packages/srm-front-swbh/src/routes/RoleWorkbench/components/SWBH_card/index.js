import React, { Component, Fragment } from 'react';
import { Row, Col, Spin, Tooltip } from 'choerodon-ui/pro';
import { Tabs, Statistic } from 'choerodon-ui';
import { connect } from 'dva';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import MyIcon from '@/routes/components/MyIcon';

import styles from '../card.less';

const { TabPane } = Tabs;

@connect(({ swbhCards, loading }) => ({
  swbhCards,
  totalLoading: loading.effects['swbhCards/getDocTotal'],
}))
@formatterCollections({
  code: ['swbh.common'],
})
export default class SwbnCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  totalRender = (total) => {
    const num = Number(total ?? 0);
    return num > 99 ? '99+' : num;
  };

  valueStyle = (number, type) => {
    const currentNumber = this.totalRender(number);
    const currentType = currentNumber === 0 ? 'common' : type;
    let fontSize = '12px';
    let color = '#1d2129';
    const fontWeight = '600';
    switch (currentType) {
      case 'attention': // '#fc9500'
        fontSize = '16px';
        color = '#fc9500';
        break;
      case 'todo':
        fontSize = '16px';
        color = '#f56349';
        break;
      case 'common':
        fontSize = '12px';
        color = '#1d2129';
        break;
      default:
        fontSize = '12px';
        color = '#1d2129';
    }
    return { fontSize, color, fontWeight };
  };

  tabRender = (data, newCardDataDocTypeDTOList, focusCardDataDocTypeDTOList) => {
    const {
      swbhCards: { currentCarousel, transferTotalElements = [] } = {},
      changeCurrentCarousel = () => {},
    } = this.props;

    const newData = newCardDataDocTypeDTOList?.filter((item) => item?.cardCode === data?.cardCode)?.[0];
    const newFocusData = focusCardDataDocTypeDTOList?.filter((item) => item?.cardCode === data?.cardCode)?.[0];
    const currentTransferTotalElements = transferTotalElements.find((i) => i.cardCode === data.cardCode)
      ?.transferTotalElements;
    return (
      <div
        className={styles.content}
        key={data.cardCode}
        onClick={() => {
          changeCurrentCarousel(data.cardCode, data);
        }}
      >
        <div className={`${styles.itemBlock} ${currentCarousel === data.cardCode ? styles.activeCard : ''} itemBlock`}>
          <div className={styles.nameBox}>
            {/* <div className={styles.docIcon}>
              <Icon
                type={docImgMap?.get(data?.cardCode || 'ALL')?.iconType}
                style={{ color: docImgMap?.get(data?.cardCode || 'ALL')?.backgroundColor }}
                className={styles.icon}
              />
              <div
                className={styles.bgBox}
                style={{ backgroundColor: docImgMap?.get(data?.cardCode || 'ALL')?.backgroundColor }}
              />
            </div> */}
            <MyIcon type={data?.cardCode?.toLowerCase() || 'all'} />
            <div className={styles.docName}>{data.cardName}</div>
          </div>
          <div className={styles.totalBox}>
            <Statistic
              className={styles.statistic}
              value={this.totalRender(newData?.todolistTotalElements || data.todolistTotalElements)}
              valueStyle={this.valueStyle(newData?.todolistTotalElements || data.todolistTotalElements, 'todo')}
              prefix={
                <Tooltip placement="leftTop" title={intl.get('swbh.common.model.common.toBeProcessed').d('待处理')}>
                  {intl.get('swbh.common.model.common.toBeProcessed').d('待处理')}
                </Tooltip>
              }
            />
            <Statistic
              className={styles.statistic}
              value={this.totalRender(newFocusData?.attentionTotalElements || data.attentionTotalElements)}
              valueStyle={this.valueStyle(
                newFocusData?.attentionTotalElements || data.attentionTotalElements,
                'attention'
              )}
              prefix={
                <Tooltip placement="leftTop" title={intl.get('swbh.common.model.common.toBeRead').d('待阅')}>
                  {intl.get('swbh.common.model.common.toBeRead').d('待阅')}
                </Tooltip>
              }
            />
            <Statistic
              className={styles.statistic}
              value={isNil(currentTransferTotalElements) ? '...' : this.totalRender(currentTransferTotalElements)}
              valueStyle={this.valueStyle(data.transferTotalElements, 'common')}
              prefix={
                <Tooltip placement="leftTop" title={intl.get('swbh.common.model.common.pendingOrder').d('待转单')}>
                  {intl.get('swbh.common.model.common.pendingOrder').d('待转单')}
                </Tooltip>
              }
            />
            <Statistic
              className={styles.statistic}
              value={this.totalRender(data.processTotalElements)}
              valueStyle={this.valueStyle(data.processTotalElements, 'common')}
              prefix={
                <Tooltip placement="leftTop" title={intl.get('swbh.common.model.common.pending').d('进行')}>
                  {intl.get('swbh.common.model.common.pending').d('进行')}
                </Tooltip>
              }
            />
          </div>
        </div>
      </div>
    );
  };

  render() {
    const {
      swbhCards: { docTotal = {}, todoDocTotal = {}, focusDocTotal = {}, totalLoading = false, currentCarousel } = {},
      changeCurrentCarousel = () => {},
      swbnCardVisible,
      swbhMode,
      showGuide,
    } = this.props;
    const { todoTotalElements = '', attentionTotalElements = '', cardDataDocTypeDTOList = [], allCard = {} } = docTotal;
    const {
      todoTotalElements: newTodoTotalElements = '',
      cardDataDocTypeDTOList: newCardDataDocTypeDTOList = [],
    } = todoDocTotal;
    const {
      attentionTotalElements: newAttentionTotalElements = '',
      cardDataDocTypeDTOList: focusCardDataDocTypeDTOList = [],
    } = focusDocTotal;

    return (
      <Fragment>
        <Spin spinning={false}>
          <Row
            type="flex"
            className={`${styles.cardBox}
            ${
              // swbnCardVisible && swbhMode !== 'focus' ? '' : styles.hiddenCardBox
              swbnCardVisible ? '' : styles.hiddenCardBox
            }
            ${showGuide ? 'swbh-card-tab' : ''}`}
          >
            {/* <Row type="flex" className={`${styles.cardBox}  ${classnames('swbh-card-tab')}`}> */}
            <Col>
              <div
                className={`${styles.whole} ${currentCarousel === 'ALL' ? styles.activeCard : ''}`}
                onClick={() => {
                  changeCurrentCarousel('ALL', allCard);
                }}
              >
                <div className={styles.nameBox}>
                  {/* <div className={styles.docIcon}>
                    <Icon type="widgets_line" className={styles.icon} />
                    <div className={styles.bgBox} />
                  </div> */}
                  <MyIcon type="all" isSvg={false} />
                  <div className={styles.docName}>{intl.get('swbh.common.model.common.docName.all').d('全部')}</div>
                </div>
                <div className={styles.totalBox}>
                  <Statistic
                    className={styles.statistic}
                    value={this.totalRender(newTodoTotalElements || todoTotalElements)}
                    valueStyle={this.valueStyle(newTodoTotalElements || todoTotalElements, 'todo')}
                    prefix={
                      <Tooltip placement="leftTop" title={intl.get('swbh.common.model.common.todo').d('待办')}>
                        {intl.get('swbh.common.model.common.todo').d('待办')}
                      </Tooltip>
                    }
                  />
                  <Statistic
                    className={styles.statistic}
                    value={this.totalRender(newAttentionTotalElements || attentionTotalElements)}
                    valueStyle={this.valueStyle(newAttentionTotalElements || attentionTotalElements, 'attention')}
                    prefix={
                      <Tooltip placement="leftTop" title={intl.get('swbh.common.model.common.toBeRead').d('待阅')}>
                        {intl.get('swbh.common.model.common.toBeRead').d('待阅')}
                      </Tooltip>
                    }
                  />
                </div>
              </div>
            </Col>
            <Col className={styles.cardList}>
              <Tabs className={styles.carousel} activeKey={currentCarousel}>
                {cardDataDocTypeDTOList.map((data) => (
                  <TabPane
                    tab={() => this.tabRender(data, newCardDataDocTypeDTOList, focusCardDataDocTypeDTOList)}
                    key={data.cardCode}
                  />
                ))}
              </Tabs>
            </Col>
          </Row>
        </Spin>
      </Fragment>
    );
  }
}
