import React, { Component, Fragment } from 'react';
import { connect } from 'dva';

import { Button, Menu, Dropdown, Icon, CheckBox, Row, Col } from 'choerodon-ui/pro';
// import { Button, Menu, Dropdown, Icon, CheckBox, Row, Col, Modal } from 'choerodon-ui/pro';
import { Tabs, Spin as ChoerodonSpin } from 'choerodon-ui';
import classnames from 'classnames';
import { getResponse } from 'utils/utils';
// import { Header, Content } from 'components/Page';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { withRouter } from 'react-router-dom';
import { queryPrDetail, releaseSendBack, releaseSubmit } from '@/services/rpExecuteProgramService';
import Header from './components/Header';
import styles from '../index.less';

import Base from './components/Base.js';
import PurchaseOrgInfo from './components/PurchaseOrgInfo.js';
import PurchaseLine from './components/PurchaseLine.js';

import maintainStyles from '../Detail/index.less';

const commonPrompt = 'srpm.common.model.common';

const { TabPane } = Tabs;

@WithCustomizeC7N({
  unitCode: [
    'SPRM.PURCHASE_PLAFORM_CANCEL.BASE',
    'SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASEORGINFO',
    'SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASELINE',
  ],
})
@formatterCollections({
  code: [
    'srpm.common',
    'sprm.common',
    'sprm.purchaseReqCreation',
    'entity.company',
    'entity.roles',
    'entity.business',
    'entity.organization',
    'entity.item',
    'entity.attachment',
  ],
})
@withRouter
@connect(({ rpExecuteProgram }) => ({ rpExecuteProgram }))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headerLoading: false,
      returnOverlayHidden: true,
      addOverlayHidden: true,
      currenOverlay: 'outside', // outside、inside
      checkValues: [],
      prHeaderId: this.props.rpExecuteProgram.documentList?.[0]?.prHeaderId ?? '',
      documentList: this.props.rpExecuteProgram.documentList,
      isOnlyPrNum: this.props.rpExecuteProgram.documentList.length === 1,
      btnLoading: false,
    };
    this.baseRef = {};
    this.lineRef = {};
    this.purchaseOrgInfoRef = {};
  }

  componentDidMount = () => {
    const { documentList } = this.props.rpExecuteProgram;
    this.setState({ documentList, isOnlyPrNum: documentList.length === 1 });
    if (documentList.length < 1) {
      return;
    }
    const prHeaderId = this.state.prHeaderId ? this.state.prHeaderId : documentList[0].prHeaderId;
    this.setState({ prHeaderId });
    this.commonUpdate(prHeaderId);
  };

  componentWillUnmount = () => {};

  commonUpdate = (curPrHeaderId) => {
    this.setState({ headerLoading: true });
    Promise.all([
      queryPrDetail({
        prHeaderId: curPrHeaderId,
        unitCode:
          'SPRM.PURCHASE_PLAFORM_CANCEL.BASE,SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASEORGINFO,SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASELINE',
      }),
      this.lineRef.current?.loadLineDate(this.state.prHeaderId || curPrHeaderId),
    ])
      .then(([res1]) => {
        if (getResponse(res1)) {
          // eslint-disable-next-line no-unused-expressions
          this.baseRef.current?.loadCurrentData(res1);
          // eslint-disable-next-line no-unused-expressions
          this.purchaseOrgInfoRef.current?.loadCurrentData(res1);
        }
      })
      .finally(() => {
        setTimeout(() => {
          this.setState({ headerLoading: false });
        }, 100);
      });
  };

  handleDetailField = (dsName, detailField) => {
    let fieldValues = '';
    switch (dsName) {
      case 'purchaseOrgInfoRef':
        fieldValues = this.purchaseOrgInfoRef.current
          ? this.purchaseOrgInfoRef.current?.handleGetDeatial(detailField)
          : '';
        break;
      case 'baseRef':
        fieldValues = this.baseRef.current
          ? this.baseRef.current?.handleGetDeatial(detailField)
          : '';
        break;
      default:
        fieldValues = undefined;
    }
    return fieldValues;
  };

  changeTab = (value) => {
    console.log('changeTab:', value);
    this.setState({ prHeaderId: value }, () => {
      this.commonUpdate(value);
    });
  };

  handleCheckChange = (value) => {
    const { checkValues } = this.state;
    const values = checkValues;
    if (value) {
      values.push(value);
    } else {
      values.splice(values.indexOf(value), 1);
    }
    this.setState({
      checkValues: values,
    });
  };

  batchSelect = (type = 'all') => {
    const { checkValues, documentList } = this.state;
    let values = checkValues;
    switch (type) {
      case 'all':
        documentList.forEach((item) => values.push(item.prHeaderId));
        break;
      case 'reverse':
        documentList.forEach((item) => {
          if (values.indexOf(item.prHeaderId) !== -1) {
            values.splice(values.indexOf(item.prHeaderId), 1);
          } else {
            values.push(item.prHeaderId);
          }
        });
        break;
      case 'empty':
        values = [];
        break;
      default:
        documentList.forEach((item) => values.push(item.prHeaderId));
        break;
    }
    this.setState({
      checkValues: values,
    });
  };

  handleChangeOverlayHidden = async (key, currentBtn) => {
    const { documentList, prHeaderId } = this.state;
    let values = [];

    if (key === 'part') {
      this.setState({ currenOverlay: 'inside' });
      return;
    } else if (key === 'all') {
      documentList.forEach((item) => values.push(item.prHeaderId));
    } else {
      values = [prHeaderId];
    }
    this.setState({ btnLoading: true });

    let res;
    if (currentBtn === 'return') {
      res = await releaseSendBack(values);
    } else {
      res = await releaseSubmit(values);
    }

    if (res && !res.failed) {
      notification.success();
    } else {
      notification.error({
        message: res?.message || intl.get(`${commonPrompt}.requestErrorMsg`).d('操作失败！'),
      });
      this.setState({ btnLoading: false });
      return;
    }

    let newDocumentList = documentList;
    values.forEach((currentPrHeaderId) => {
      newDocumentList = newDocumentList.filter((item) => item.prHeaderId !== currentPrHeaderId);
    });
    if (newDocumentList.length < 1) {
      this.props.history.push({ pathname: '/srpm/rp-execute-platform/list' });
      return;
    }
    this.setState({ documentList: newDocumentList, checkValues: [], btnLoading: false }, () => {
      this.changeOverlayHidden();
      this.changeTab(newDocumentList[0].prHeaderId);
    });
  };

  // /**
  //  * 退回剩余单据
  //  */
  // releaseSendBackRemaind = async() => {
  //    const values = [];
  //    const { documentList } = this.state;
  //    documentList.forEach((item) => values.push(item.prHeaderId));
  //    const res = await releaseSendBack(values);
  //    if (res && !res.failed) {
  //      notification.success();
  //    } else {
  //      notification.error({
  //        message: res?.message || intl.get(`${commonPrompt}.requestErrorMsg`).d('操作失败！'),
  //      });
  //    }
  // }

  changeOverlayHidden = (currentBtn = '') => {
    if (currentBtn === 'return' && this.state.returnOverlayHidden) {
      this.setState(
        {
          addOverlayHidden: true,
          currenOverlay: 'outside',
        },
        () => {
          this.setState({ returnOverlayHidden: !this.state.returnOverlayHidden });
        }
      );
    } else if (currentBtn === 'add' && this.state.addOverlayHidden) {
      this.setState({ returnOverlayHidden: true, currenOverlay: 'outside' }, () => {
        this.setState({ addOverlayHidden: !this.state.addOverlayHidden });
      });
    } else {
      this.setState(
        {
          addOverlayHidden: true,
          returnOverlayHidden: true,
        },
        () => {
          this.setState({ currenOverlay: 'outside' });
        }
      );
    }
  };

  handleRelease = async (currentBtn) => {
    const { checkValues, documentList } = this.state;
    if (checkValues.length < 1) {
      notification.info({
        message: intl.get(`${commonPrompt}.handleReleaseCheckMsg`).d('请选中之后点击！'),
      });
      return;
    }

    this.setState({ btnLoading: true });
    let res;
    if (currentBtn === 'return') {
      res = await releaseSendBack(checkValues);
    } else {
      res = await releaseSubmit(checkValues);
    }

    if (res && !res.failed) {
      notification.success();
    } else {
      notification.error({
        message: res?.message || intl.get(`${commonPrompt}.requestErrorMsg`).d('操作失败！'),
      });
      this.setState({ btnLoading: false });
      return;
    }

    let newDocumentList = documentList;
    checkValues.forEach((currentPrHeaderId) => {
      newDocumentList = newDocumentList.filter((item) => item.prHeaderId !== currentPrHeaderId);
    });
    if (newDocumentList.length < 1) {
      this.props.history.push({ pathname: '/srpm/rp-execute-platform/list' });
      return;
    }
    this.setState({ documentList: newDocumentList, btnLoading: false }, () =>
      this.changeTab(newDocumentList[0].prHeaderId)
    );
  };

  Overlay = (currentBtn) => {
    const { currenOverlay, checkValues, documentList } = this.state;

    const menuItemName =
      currentBtn === 'add'
        ? intl.get(`hzero.common.button.creat`).d('新建')
        : intl.get(`hzero.common.button.return`).d('退回');
    const menuItemNameIntl = currentBtn === 'add' ? 'new' : 'return';

    if (currenOverlay === 'outside') {
      return (
        <Menu
          className={styles.outsideMenu}
          onClick={(e) => this.handleChangeOverlayHidden(e?.key, currentBtn)}
        >
          <Menu.Item key="current" disabled={this.state.btnLoading}>
            {intl
              .get(`${commonPrompt}.${menuItemNameIntl}CurrentDocument`)
              .d(`${menuItemName}当前单据`)}
          </Menu.Item>
          <Menu.Item key="all" disabled={this.state.btnLoading}>
            {intl.get(`${commonPrompt}.${menuItemNameIntl}All`).d(`${menuItemName}全部`)}
          </Menu.Item>
          <Menu.Item key="part" disabled={this.state.btnLoading}>
            <span>
              {intl
                .get(`${commonPrompt}.${menuItemNameIntl}PartDocument`)
                .d(`${menuItemName}部分单据`)}
            </span>

            <Icon type="navigate_next" />
          </Menu.Item>
        </Menu>
      );
    } else {
      return (
        <Menu left={400} className={`${styles.insideMenu}`}>
          <Menu.Item className={`${styles.menuBtnBox} ${styles.menuTopBtn}`}>
            <Button
              funcType="flat"
              onClick={() => {
                this.batchSelect('all');
              }}
            >
              {intl.get(`${commonPrompt}.selectAll`).d('全选')}
            </Button>
            <Button
              funcType="flat"
              onClick={() => {
                this.batchSelect('reverse');
              }}
            >
              {intl.get(`${commonPrompt}.reverseElection`).d('反选')}
            </Button>
            <Button
              funcType="flat"
              onClick={() => {
                this.batchSelect('empty');
              }}
            >
              {intl.get(`${commonPrompt}.empty`).d('清空')}
            </Button>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item>
            <div className={`${styles.checkBox}`}>
              {documentList.map((item) => (
                <CheckBox
                  key={item.prNum}
                  name={item.prNum}
                  value={item.prHeaderId}
                  checked={checkValues.indexOf(item.prHeaderId) !== -1}
                  onChange={this.handleCheckChange}
                >
                  {item.prNum}
                </CheckBox>
              ))}
            </div>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item className={`${styles.menuBtnBox} ${styles.menuBottomBtn}`}>
            <Button
              color="primary"
              onClick={() => {
                this.handleRelease(currentBtn);
              }}
              disabled={this.state.btnLoading}
            >
              {currentBtn === 'return'
                ? intl.get(`${commonPrompt}.return`).d('退回')
                : intl.get(`${commonPrompt}.submit`).d('提交')}
            </Button>
            <Button
              type="dashed"
              onClick={() => {
                this.setState({ currenOverlay: 'outside' });
                // this.changeOverlayHidden
              }}
            >
              {intl.get(`${commonPrompt}.cancel`).d('取消')}
            </Button>
          </Menu.Item>
        </Menu>
      );
    }
  };

  render() {
    return (
      <Fragment>
        <Header
          id="header"
          title={intl.get(`${commonPrompt}.editApplication`).d('编辑申请')}
          backPath="/srpm/rp-execute-platform/list"
          isChange
          releaseSendBackRemaind={this.handleChangeOverlayHidden}
          btns={() =>
            this.state.isOnlyPrNum ? (
              <>
                <Button
                  icon="add"
                  color="primary"
                  onClick={() => this.handleChangeOverlayHidden('current', 'add')}
                  className={`${styles.dropdownBtn} ${styles.addBtn}`}
                >
                  {intl.get(`${commonPrompt}.newApplication`).d('新建申请')}
                </Button>
                <Button
                  icon="reply"
                  funcType="flat"
                  onClick={() => this.handleChangeOverlayHidden('current', 'return')}
                  className={styles.dropdownBtn}
                >
                  {intl.get(`${commonPrompt}.returnToReady`).d('退回至待发放')}
                </Button>
              </>
            ) : (
              <>
                <Dropdown
                  // placement="bottomRight"
                  overlay={() => this.Overlay('add')}
                  trigger={['click']}
                  hidden={this.state.addOverlayHidden}
                  onOverlayClick={this.onOverlayClick}
                  getPopupContainer={() => document.getElementById('addBtn')}
                >
                  <Button
                    icon="add"
                    color="primary"
                    onClick={() => this.changeOverlayHidden('add')}
                    id="addBtn"
                    className={`${styles.dropdownBtn} ${styles.addBtn}`}
                  >
                    {intl.get(`${commonPrompt}.newApplication`).d('新建申请')}
                    <Icon type="expand_more" />
                  </Button>
                </Dropdown>
                <Dropdown
                  // placement="bottomRight"
                  overlay={() => this.Overlay('return')}
                  hidden={this.state.returnOverlayHidden}
                  trigger={['click']}
                  onOverlayClick={this.onOverlayClick}
                  getPopupContainer={() => document.getElementById('reutrnBtn')}
                >
                  <Button
                    icon="reply"
                    funcType="flat"
                    onClick={() => this.changeOverlayHidden('return')}
                    id="reutrnBtn"
                    className={styles.dropdownBtn}
                  >
                    {intl.get(`${commonPrompt}.returnToReady`).d('退回至待发放')}
                    <Icon type="expand_more" />
                  </Button>
                </Dropdown>
              </>
            )
          }
        />
        <Row
          type="flex"
          className={`${styles.block} ${this.state.isOnlyPrNum ? styles.onlyPrNumBlock : ''}`}
        >
          <Col className={styles.left}>
            <Content>
              <div className={styles.leftTitle}>
                <h3>{intl.get(`${commonPrompt}.preview`).d('申请预览')}</h3>
                <div>{intl.get(`${commonPrompt}.switchNumberPreview`).d('快速切换单号预览')}</div>
              </div>
              <div className={styles.leftTabs}>
                <Tabs
                  defaultActiveKey={this.state.prHeaderId}
                  tabPosition="left"
                  onChange={(value) => {
                    this.changeTab(value);
                  }}
                >
                  {this.state.documentList.length > 0
                    ? this.state.documentList.map((item) => (
                        <TabPane
                          tab={() => {
                            return (
                              <div className={styles.tabTitle}>
                                <div>{item.prNum}</div>
                                {/* <div>{item.title}</div> */}
                              </div>
                            );
                          }}
                          key={item.prHeaderId}
                        />
                      ))
                    : null}
                </Tabs>
              </div>
            </Content>
            {/* <Content>1222222222</Content> */}
          </Col>
          <Col className={styles.right}>
            <div
              className={classnames(
                'ued-detail-wrapper',
                maintainStyles['update-container'],
                'sprm-query'
              )}
              // style={{ overflowY: 'auto' }}
            >
              <ChoerodonSpin spinning={this.state.headerLoading || false}>
                <div className={maintainStyles['ued-detail-container']}>
                  <div className={classnames(maintainStyles['rfx-detail-list-card'])}>
                    <Content className={maintainStyles['custom-page-content']}>
                      <h3
                        id="sprm-workSpace-detail-content-basicInfo"
                        className={maintainStyles['rfx-card-item-title']}
                      >
                        {intl.get('sprm.common.title.baseInfo').d('申请基本信息')}
                      </h3>
                      <Base
                        ref={this.baseRef}
                        handleDetailField={this.handleDetailField}
                        customizeForm={this.props.customizeForm}
                        getLineDs={() => this.lineRef.current?.saveCurrentData()}
                        code="SPRM.PURCHASE_PLAFORM_CANCEL.BASE"
                      />
                    </Content>
                  </div>
                  <div className={classnames(maintainStyles['rfx-detail-list-card'])}>
                    <Content className={maintainStyles['custom-page-content']}>
                      <h3
                        id="sprm-workSpace-detail-content-organizationInfo"
                        className={maintainStyles['rfx-card-item-title']}
                      >
                        {intl.get('sprm.common.title.purchaseOrgInfo').d('采购方及采买组织信息')}
                      </h3>
                      <PurchaseOrgInfo
                        ref={this.purchaseOrgInfoRef}
                        handleDetailField={this.handleDetailField}
                        customizeForm={this.props.customizeForm}
                        code="SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASEORGINFO"
                      />
                    </Content>
                  </div>
                  <div className={classnames(maintainStyles['rfx-detail-list-card'])}>
                    <Content className={maintainStyles['custom-page-content']}>
                      <h3
                        id="sprm-workSpace-detail-content-detailInfo"
                        className={maintainStyles['rfx-card-item-title']}
                      >
                        {intl.get('sprm.common.title.detailLineInfo').d('申请明细信息')}
                      </h3>
                      <PurchaseLine
                        prHeaderId={this.state.prHeaderId}
                        ref={this.lineRef}
                        handleDetailField={this.handleDetailField}
                        customizeTable={this.props.customizeTable}
                        code="SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASELINE"
                      />
                    </Content>
                  </div>
                </div>
              </ChoerodonSpin>
            </div>
          </Col>
        </Row>
      </Fragment>
    );
  }
}
