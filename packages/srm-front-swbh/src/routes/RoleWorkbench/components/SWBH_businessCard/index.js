import React, { Component, Fragment } from 'react';
import { Modal, Spin } from 'choerodon-ui/pro';
import { Icon, Tag, Badge } from 'choerodon-ui';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import { withRouter } from 'react-router-dom';
import formatterCollections from 'utils/intl/formatterCollections';
import { getFlexLink } from '@/routes/utils';
import DraftModal from './DraftModal';
// import { chunk } from 'lodash';
import styles from '../card.less';

@withRouter
@formatterCollections({
  code: ['swbh.common', 'srm.common'],
})
@connect(({ swbhCards }) => ({
  swbhCards,
}))
export default class BusinessCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // setting: false,
      // currentCarousel: this.props.swbhCards?.currentCarousel ?? 'all',
    };
    // this.chooseIndex = null;
  }

  componentDidMount() {}

  handleFastDto = (item) => {
    const path = item?.route;
    const parameters = item?.parameters ?? {};
    const { params = {}, search = {} } = parameters;
    getFlexLink('', path, { ...params }, { ...search }, false);
  };

  /**
   * 草稿箱
   */
  handleModalDraft = () => {
    const { swbhCards: { currentCarousel } = {} } = this.props;
    Modal.open({
      title: intl.get('swbh.common.view.cardTitle.draft').d('草稿'),
      mask: true,
      closable: true,
      maskClosable: false,
      drawer: true,
      customizedCode: 'SWBH.ROLE_WORKBENCH.DRAFT',
      style: { maxWidth: 996, minWidth: 996 },
      className: styles['draft-container-modal'],
      children: <DraftModal currentCarousel={currentCarousel} />,
      footer: null,
    });
  };

  totalRender = (total = 0) => {
    const num = Number(total ?? 0);
    return num > 99 ? '99+' : num;
  };

  render() {
    const {
      swbhCards: {
        totalLoading = false,
        cardDocFastDTOList,
        cardQuickLinkDTOList,
        draftNum = '-',
        currentCarousel,
      } = {},
      showGuide,
    } = this.props;

    return (
      <Fragment>
        <div className={`${styles.businessCard} ${showGuide ? 'swbh-card-business' : ''}`}>
          <Spin spinning={totalLoading}>
            <div className={styles.top}>
              {/* <div className={styles.draft}>
                <span className={styles.title}>{intl.get('swbh.common.view.cardTitle.draft').d('草稿')}</span>
                <div className={styles.list}>
                  <div className={styles.businessItem}>
                    <Badge count={this.totalRender(draftNum)} className={styles.badge}>
                      <div className={styles.iconBox} onClick={this.handleModalDraft}>
                        <Icon type="drive_file_rename_outline-o" />
                      </div>
                    </Badge>
                    <div>草稿箱</div>
                  </div>
                </div>
              </div> */}
              <div className={styles.fastDTO}>
                <span className={styles.title}>
                  {/* {intl.get('swbh.common.view.cardTitle.initiateBusiness').d('快速录单')} */}
                  {intl.get('swbh.common.view.cardTitle.fastEntry').d('快速入口')}
                </span>
                <div className={styles.list}>
                  {cardQuickLinkDTOList
                    ? cardQuickLinkDTOList.map((item, index) => {
                        return (
                          <div
                            // eslint-disable-next-line react/no-array-index-key
                            key={item.quickLinkName + index}
                            className={styles.businessItem}
                            onClick={() => {
                              // if (window.collectEvent) {
                              //   window.collectEvent('ClickButton', { text: '采购员工作台-快速录单' });
                              // }
                              // this.handleFastDto(item);
                              if (window.collectEvent) {
                                window.collectEvent('ClickButton', { text: '采购员工作台-快速入口' });
                              }
                              const { dispatch } = this.props;
                              dispatch(
                                routerRedux.push({
                                  pathname: item.quickLinkRoute,
                                })
                              );
                            }}
                          >
                            <div className={styles.iconBox}>
                              <Icon type={item?.icon ?? 'assignment'} />
                            </div>
                            <div className={styles.name}>{item.quickLinkName}</div>
                          </div>
                        );
                      })
                    : null}
                </div>
              </div>
            </div>
            {/* <div className={styles.bottom}>
              <div className={styles.title}>{intl.get('swbh.common.view.cardTitle.fastEntry').d('快速入口')}</div>
              <div className={styles.tagBox}>
                {cardQuickLinkDTOList
                  ? cardQuickLinkDTOList.map((item, index) => {
                      return (
                        <Tag
                          // eslint-disable-next-line react/no-array-index-key
                          key={item.quickLinkName + index}
                          onClick={() => {
                            if (window.collectEvent) {
                              window.collectEvent('ClickButton', { text: '采购员工作台-快速入口' });
                            }
                            const { dispatch } = this.props;
                            dispatch(
                              routerRedux.push({
                                pathname: item.quickLinkRoute,
                              })
                            );
                            // this.props.history.push({ pathname: item.quickLinkRoute });
                          }}
                        >
                          <span> {item.quickLinkName}</span>
                          // <a href={`/app${item.quickLinkRoute}`}>{item.quickLinkName}</a>
                        </Tag>
                      );
                    })
                  : null}
              </div>
            </div> */}
          </Spin>
        </div>
      </Fragment>
    );
  }
}
