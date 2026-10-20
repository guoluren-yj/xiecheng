import React, { Component } from 'react';
import { notification, Button, Icon, Tooltip } from 'choerodon-ui';
import { Throttle } from 'lodash-decorators';
import { isEmpty, isFunction } from 'lodash';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
// import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  fetchBiddingSectionSupplier,
  fetchBiddingSectionPurchase,
} from '@/services//biddingHallService.js';

import styles from './index.less';

@formatterCollections({
  code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.biddingHall'],
})
@observer
class Section extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }

    this.organizationId = getCurrentOrganizationId();

    this.pageLoading = false;

    this.state = {
      activeSection: {},
      sectionList: [],
      sourceProject: {}, // 项目信息
      loading: false,
    };
  }

  toggleLoading = (loading = false) => {
    this.pageLoading = loading;
    this.setState({
      loading,
    });
  };

  // 获取父传递props
  getParentProps(key = null) {
    const { props = {} } = this;
    if (!key) {
      return props;
    }

    return props[key];
  }

  componentDidMount() {
    this.fetchSection();
  }

  componentWillUnmount() {}

  fetchCurrentPageSection = async () => {
    const { name = null, queryParam = {} } = this.props;
    const { loading } = this.state;
    const params = {
      organizationId: this.organizationId,
      ...queryParam,
    };

    if (this.pageLoading || loading) {
      return;
    }

    let data = {};

    this.toggleLoading(true);
    try {
      switch (name) {
        case 'BIDDING_SUPPLIER':
          data = await fetchBiddingSectionSupplier(params);
          break;
        case 'BIDDING_PURCHASE':
          data = await fetchBiddingSectionPurchase(params);
          break;
        default:
          break;
      }
      data = getResponse(data);
      this.toggleLoading(false);
    } catch (e) {
      throw e;
    }

    return data;
  };

  // 查询标段
  fetchSection = async () => {
    const { projectLineSectionId = null, queryMain = () => {} } = this.props;
    if (!projectLineSectionId || projectLineSectionId === 'null') {
      return;
    }

    const data = await this.fetchCurrentPageSection();
    const { projectLineSectionList = null, sourceProject = {} } = data || {};
    if (isEmpty(data) || isEmpty(projectLineSectionList)) {
      queryMain();
      return;
    }

    const activeSection =
      projectLineSectionList.filter(
        (item) => item.projectLineSectionId === projectLineSectionId
      )[0] || projectLineSectionList[0];

    this.setState({
      sectionList: projectLineSectionList,
      activeSection,
      sourceProject,
    });

    // this.queryHeaderContent(activeSection);
  };

  // 重查标段和主数据
  refreshSectionAndMain = async () => {
    const { isSection = false, queryMain = () => {} } = this.props;
    const { activeSection = {} } = this.state;

    if (!isSection) {
      queryMain();
      return;
    }

    if (!isEmpty(activeSection)) {
      const data = await this.fetchCurrentPageSection();
      const { projectLineSectionList = [] } = data || {};
      if (isEmpty(projectLineSectionList)) {
        return;
      }
      this.setState({
        sectionList: projectLineSectionList,
      });
      const { projectLineSectionId = null } = activeSection;
      this.activeItemOne(projectLineSectionId);
      // return;
    }

    // const data = await this.fetchCurrentPageSection();
    // this.queryHeaderContent(data?.sourceProject);
  };

  // 重查标段下的主数据
  refreshSectionOfMain = () => {
    const { isBatchMaintainSection = false } = this.props;
    const { activeSection = {} } = this.state;
    if (isBatchMaintainSection && !this.isSectionListEmpty()) {
      this.fetchSection();
      return;
    }

    const { projectLineSectionId = null } = activeSection;
    this.activeItemOne(projectLineSectionId);
  };

  // 激活某一行数据
  activeItemOne = (id = null) => {
    const { queryMain = () => {}, toggleOperationLoading = () => {} } = this.props;
    const { sectionList = [] } = this.state;
    if (!id || isEmpty(sectionList)) {
      return;
    }

    let data = (sectionList.filter((item) => item.projectLineSectionId === id) || [])?.[0];
    if (!data || isEmpty(data)) {
      // eslint-disable-next-line prefer-destructuring
      data = sectionList[0];
      this.setActiveSection(data);
    }
    const param = this.getDataFromSectionItem(data);

    this.setState({
      activeSection: data,
    });

    queryMain(param);
    toggleOperationLoading();
  };

  // 从标段中获取数据查询
  getDataFromSectionItem = (data = {}) => {
    const { paramKeys = [] } = this.props;
    let dataValueObj = {};
    if (isEmpty(data) || isEmpty(paramKeys)) {
      return dataValueObj;
    }

    paramKeys.forEach((key) => {
      if (key === 'sourceHeaderId') {
        const { sourceHeaderId = null } = data;
        dataValueObj = Object.assign(dataValueObj, {
          sourceHeaderId,
          rfxHeaderId: sourceHeaderId,
        });
        return;
      }

      dataValueObj = Object.assign(dataValueObj, {
        [key]: data[key],
      });
    });

    return dataValueObj;
  };

  // 标段查询后查询头行信息
  // queryHeaderContent = (activeSection = {}) => {
  //   const { queryMain = () => {} } = this.props;
  //
  //   if (isEmpty(activeSection)) {
  //     queryMain();
  //     return;
  //   }
  //
  //   const param = this.getDataFromSectionItem(activeSection);
  //   queryMain(param);
  // };

  getSourceProject = () => {
    const { sourceProject = {} } = this.state;
    return sourceProject;
  };

  // 标段数据是否为空
  isSectionListEmpty = () => {
    const { sectionList = [] } = this.state;
    return isEmpty(sectionList);
  };

  // 标段数据是否勾选为空
  isCheckedSectionListEmpty = () => {
    const listData = this.getSectionList();
    return isEmpty(listData);
  };

  // 获取标段数据
  getSectionList = () => {
    const { sectionList = [] } = this.state;
    return sectionList || [];
  };

  // 获取当前标段
  getCurrentSection = () => {
    const { activeSection = {} } = this.state;
    return activeSection;
  };

  // 设置当前激活面板
  setActiveSection(data = {}) {
    if (isEmpty(data)) {
      return;
    }

    const { locatedCurrentUrl = () => {} } = this.props;
    locatedCurrentUrl(data);

    this.setState({
      activeSection: data,
    });
  }

  // 点击标段事件
  @Throttle(2000)
  activeCurrentItem = async (data = {}) => {
    const {
      // changeSectionValidate,
      couldSectionSwitch = null,
      beforeChangeSection,
      // operationLoading = false,
      // beforeOpenSection = null,
      // switchNotification = intl
      //   .get('ssrc.common.view.message.pageInvalidToSureInput')
      //   .d('有必填项未填，无法保存当前页面信息，是否确认切换页面'),
      // handleDisabledSwitch = () => {},
    } = this.props;
    const { projectLineSectionId: prevId = null } = data || {};
    const { activeSection = {} } = this.state;

    if (this.pageLoading) {
      return;
    }

    const currentId = activeSection.projectLineSectionId;
    if (currentId && currentId === prevId) {
      return;
    }

    // 标段放弃禁用不可切换
    // const disabledSectionItemFlag = isFunction(handleDisabledSwitch)
    //   ? handleDisabledSwitch(data) || false
    //   : false;
    // if (disabledSectionItemFlag) {
    //   return;
    // }

    if (isFunction(couldSectionSwitch)) {
      const couldSwitch = couldSectionSwitch();
      if (couldSwitch) {
        notification.warning({
          message: intl
            .get('ssrc.common.waittingForSectionOperation')
            .d('当前标段操作未完成, 请稍等'),
          placement: 'bottomLeft',
          duration: 1.0,
        });
        return;
      }
    }

    // 切换标段前清空上个标段
    if (isFunction(beforeChangeSection)) {
      await beforeChangeSection();
    }

    //
    // if (changeSectionValidate && isFunction(changeSectionValidate)) {
    //   const changeSectionFlag = await changeSectionValidate();
    //   if (!changeSectionFlag) {
    //     notification.warning({
    //       message: intl
    //         .get('ssrc.supplierQuotation.view.message.validateFill')
    //         .d('有必填字段没填，不可切换标段'),
    //       placement: 'bottomRight',
    //       duration: 1.0,
    //     });
    //     return;
    //   }
    // }
    //
    // // 切换标段前操作
    // if (beforeOpenSection && isFunction(beforeOpenSection)) {
    //   const validateFlag = await beforeOpenSection(true);
    //
    //   if (!validateFlag) {
    //     C7NModal.confirm({
    //       content: switchNotification,
    //       onOk: () => {
    //         this.setActiveSection(data);
    //         this.handleAfterOpenSection(data);
    //       },
    //     });
    //   } else {
    //     this.setActiveSection(data);
    //     this.handleAfterOpenSection(data);
    //   }
    //   return;
    // }

    this.setActiveSection(data);

    this.handleAfterOpenSection(data);
  };

  // 切换标段后
  handleAfterOpenSection(data = {}, refreshFlag = true) {
    const { afterOpenSection = null, queryMain = () => {} } = this.props;
    if (refreshFlag) {
      const param = this.getDataFromSectionItem(data);
      queryMain(param);
    }

    if (afterOpenSection && isFunction(afterOpenSection)) {
      afterOpenSection();
    }
  }

  @Throttle(2000)
  handleSectionMenuItemClick = ({ key }) => {
    const { sectionList = [] } = this.state;
    if (!key) {
      return;
    }

    const data = sectionList.find((s) => s.sourceHeaderId === key);
    if (!data) {
      return;
    }

    this.activeCurrentItem(data);
  };

  renderMainList = (list = []) => {
    const { activeSection } = this.state;
    const { projectLineSectionId } = activeSection || {};
    if (isEmpty(list)) {
      return '';
    }

    return list.map((sectionItem) => {
      const { sourceHeaderId, sourceHeaderNum, projectLineSectionId: sectionLineId } =
        sectionItem || {};

      return (
        <div
          onClick={() => this.activeCurrentItem(sectionItem)}
          key={sourceHeaderId}
          className={classnames(styles['section-item-main-wrap'], {
            [styles['section-item-main-active']]: sectionLineId === projectLineSectionId,
          })}
        >
          {sourceHeaderNum}
          <div className={styles['section-item-main-divide']} />
        </div>
      );
    });
  };

  renderMore = (list = []) => {
    const { activeSection } = this.state;
    const { projectLineSectionId } = activeSection || {};
    if (isEmpty(list)) {
      return '';
    }

    return (
      <div>
        {list.map((sectionItem) => {
          const { sourceHeaderId, sourceHeaderNum, projectLineSectionId: sectionLineId } =
            sectionItem || {};

          return (
            <div
              onClick={() => this.activeCurrentItem(sectionItem)}
              key={sourceHeaderId}
              className={classnames(styles['section-item-more-wrap'], {
                [styles['section-item-more-active']]: sectionLineId === projectLineSectionId,
              })}
            >
              {sourceHeaderNum}
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    const { sectionList = [] } = this.state;

    if (isEmpty(sectionList)) {
      return '';
    }

    return (
      <div className={classnames(styles['ssrc-bidding-hall-section-container'], '')}>
        {this.renderMainList(sectionList.slice(0, 6))}
        {/* {this.renderMore(sectionList.slice(6))} */}

        {sectionList?.length > 6 ? (
          <Tooltip
            popupStyle={{ width: '200px', maxHeight: '300px', overflowY: 'auto' }}
            trigger={['', 'click']}
            overlayClassName={styles['ssrc-bidding-hall-section-list-more-tooltip-wrap']}
            overlayStyle={{
              padding: 0,
              fontSize: '18px',
            }}
            placement="bottomLeft"
            theme="light"
            title={() => this.renderMore(sectionList.slice(6))}
          >
            <Button>
              <Icon type="more_horiz" style={{ color: '#fff' }} />
            </Button>
          </Tooltip>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default Section;
