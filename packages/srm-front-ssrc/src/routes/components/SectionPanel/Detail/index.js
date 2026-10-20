// SectionPanel 分标段切换面板-只读

import React, { Component } from 'react';
import { Icon, Checkbox, Modal } from 'hzero-ui';
import { notification } from 'choerodon-ui';
import { Bind, debounce } from 'lodash-decorators';
import { isEmpty, isFunction } from 'lodash';
import classnames from 'classnames';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
// import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  fetchCheckPriceApprovalSectionList,
  fetchRfxDetailSection,
} from '@/services/inquiryHallNewService';
import SectionItem from '../SectionItem';

import styles from '../index.less';

@formatterCollections({
  code: ['ssrc.inquiryHall', 'ssrc.common'],
})
class SectionPanel extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      openedFlag: 1, // 打开折叠面板
      activeSection: {},
      sectionList: [],
      indeterminate: false,
      checkAll: false, // 是否全选
      checkedList: [], // 标段勾选列表
      sourceProject: {}, // 项目信息
      currentQueryParams: {}, // 存储当前标段查询参数
    };
  }

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

  fetchCurrentPageSection = async () => {
    const { parentPage = {}, isSection = false } = this.props;
    const { name = null, queryParams = {} } = parentPage;

    const params = {
      organizationId: this.organizationId,
      ...queryParams,
    };

    if (!isSection) {
      return;
    }

    let data = {};

    try {
      switch (name) {
        case 'checkPriceApproval':
          data = await fetchCheckPriceApprovalSectionList(params);
          break;
        case 'rfxDetailAll':
          data = await fetchRfxDetailSection(params);
          break;
        default:
          break;
      }
      data = getResponse(data);
    } catch (e) {
      throw e;
    }

    return data;
  };

  // 查询标段
  fetchSection = async () => {
    const { queryMain = () => {}, projectLineSectionId = null } = this.props;

    if (!projectLineSectionId || projectLineSectionId === 'null') {
      return;
    }

    const data = await this.fetchCurrentPageSection();
    const { projectLineSectionList = null, sourceProject } = data || {};
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

    this.queryHeaderContent(activeSection);
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
      return;
    }

    const data = await this.fetchCurrentPageSection();
    this.queryHeaderContent(data);
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
    const { queryMain = () => {} } = this.props;
    const { sectionList = [] } = this.state;
    if (!id || isEmpty(sectionList)) {
      return;
    }

    let data = sectionList.filter((item) => item.projectLineSectionId === id) || [];
    data = !isEmpty(data[0]) ? data[0] : sectionList[0];
    const param = this.getDataFromSectionItem(data);

    this.setState({
      activeSection: data,
    });

    queryMain(param);
  };

  // 从标段中获取数据查询
  getDataFromSectionItem(data = {}) {
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

    this.setState({
      currentQueryParams: dataValueObj,
    });

    return dataValueObj;
  }

  // 获取当前查询参数
  getCurrentSectionParam = () => {
    const { currentQueryParams = {} } = this.state;
    return currentQueryParams;
  };

  // 标段查询后查询头行信息
  queryHeaderContent = (activeSection = {}) => {
    const { queryMain = () => {} } = this.props;

    if (isEmpty(activeSection)) {
      queryMain();
      return;
    }

    const param = this.getDataFromSectionItem(activeSection);
    queryMain(param);
  };

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
    const { checkedList = [] } = this.state;
    return isEmpty(checkedList);
  };

  // 获取勾选的
  getCheckedSectionList = () => {
    const { checkedList = [] } = this.state;
    return checkedList;
  };

  // 获取当前标段
  getCurrentSection = () => {
    const { activeSection = {} } = this.state;
    return activeSection;
  };

  // 重置勾选逻辑
  resetItemChecked = () => {
    this.setState({
      indeterminate: false,
      checkAll: false, // 是否全选
      checkedList: [], // 标段勾选列表
    });
  };

  @debounce(500)
  @Bind()
  toggleOpened = () => {
    this.setState((preStatus) => {
      const { openedFlag = 1 } = preStatus;
      return {
        openedFlag: !openedFlag,
      };
    });
  };

  // 打开折叠面板，外部调用
  handleToggleOpened = (openedFlag = false) => {
    this.setState({
      openedFlag,
    });
  };

  // 设置当前激活面板
  setActiveSection(data = {}) {
    const { locatedCurrentUrl = () => {} } = this.props;
    locatedCurrentUrl(data);

    this.setState({
      activeSection: data,
    });
  }

  // 点击标段事件
  @Bind()
  async handleClick(e, data = {}) {
    e.stopPropagation();

    const {
      couldSectionSwitch = () => {},
      // operationLoading = false,
      beforeOpenSection = null,
      switchNotification = intl
        .get('ssrc.common.view.message.pageInvalidToSureInput')
        .d('有必填项未填，无法保存当前页面信息，是否确认切换页面'),
    } = this.props;
    const { projectLineSectionId: prevId = null } = data;
    const { activeSection = {} } = this.state;

    const currentId = activeSection.projectLineSectionId;
    if (currentId && currentId === prevId) {
      return;
    }

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

    // 切换标段前操作
    if (beforeOpenSection && isFunction(beforeOpenSection)) {
      const validateFlag = await beforeOpenSection(true); // 保存不通过需要阻断
      if (!validateFlag) {
        Modal.confirm({
          content: switchNotification,
          onOk: () => {
            this.setActiveSection(data);
            this.handleAfterOpenSection(data);
          },
        });
      } else {
        this.setActiveSection(data);
        this.handleAfterOpenSection(data);
      }
      return;
    }

    this.setActiveSection(data);

    this.handleAfterOpenSection(data, true);
  }

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

  @Bind()
  renderChecking() {
    const { indeterminate = false, checkAll = false } = this.state;

    return (
      <div className={styles['item-checked-all']}>
        <Checkbox indeterminate={indeterminate} onChange={this.onCheckAllChange} checked={checkAll}>
          {intl.get('ssrc.common.view.message.chooseAll').d('全选')}
        </Checkbox>
      </div>
    );
  }

  // 如果激活面板不为空，清空
  clearActiveSection = () => {
    const { activeSection = {} } = this.state;
    if (!isEmpty(activeSection)) {
      this.setState({
        activeSection: {},
      });
    }
  };

  // 标段勾选
  @Bind()
  sectionItemCheck = (e, data = {}) => {
    e.stopPropagation();
    const { sectionList = [], checkedList = [] } = this.state;
    const currentId = data.projectLineSectionId;

    if (!currentId) {
      return;
    }

    const isChecked = e.target.checked;
    let newCheckedList = checkedList;

    const usefulsectionList = sectionList.filter((item) => {
      const { redactFlag = -1 } = item;
      return redactFlag === -1 || redactFlag === 1;
    });

    const index = newCheckedList.findIndex(
      (item = {}) => item.projectLineSectionId && item.projectLineSectionId === currentId
    );
    if (!isChecked) {
      if (index > -1) {
        newCheckedList = newCheckedList.filter((_, currentIndex) => currentIndex !== index);
      }
    } else {
      newCheckedList.push(data);
    }

    newCheckedList = newCheckedList.filter(Boolean);

    this.setState({
      checkedList: newCheckedList,
      indeterminate: newCheckedList.length && newCheckedList.length < usefulsectionList.length,
      checkAll: newCheckedList.length === usefulsectionList.length,
    });
  };

  // 全选
  onCheckAllChange = (e) => {
    const value = e.target.checked;
    const { sectionList = [] } = this.state;
    const usefulsectionList = sectionList.filter((item) => {
      const { redactFlag = -1 } = item;
      return redactFlag === 1 || redactFlag === -1;
    });
    if (isEmpty(sectionList)) {
      return;
    }

    this.setState({
      checkedList: value ? usefulsectionList : [],
      indeterminate: false,
      checkAll: value,
    });
  };

  // 标段标题
  renderSectionTitle() {
    const {
      parentPage: { name = '' },
      openedSectionTitle = intl.get('ssrc.inquiryHall.view.title.sectionBiding').d('标段'),
      closedSectionTitle = intl.get('ssrc.inquiryHall.view.title.sectionBiding').d('标段'),
    } = this.props;
    const { openedFlag = 1 } = this.state;

    let subtitle = '';
    switch (name) {
      case 'participation':
        subtitle = intl
          .get('ssrc.inquiryHall.model.inquiryHall.quickChangeToParticiption')
          .d('快速切换标段进行参与');
        break;
      case 'supplierQuotation':
        subtitle = intl
          .get('ssrc.inquiryHall.model.inquiryHall.quickChangeToQuotation')
          .d('快速切换标段进行报价');
        break;
      default:
        subtitle = intl
          .get('ssrc.inquiryHall.model.inquiryHall.quickChangeToViewSection')
          .d('快速切换标段进行查看');
        break;
    }

    const title = openedFlag ? openedSectionTitle : closedSectionTitle;
    return (
      <div className={openedFlag ? styles['section-title'] : styles['section-title-collapsed']}>
        {title}
        {openedFlag ? <div className={styles['sub-section-title']}>{subtitle}</div> : null}
      </div>
    );
  }

  // 打开/折叠指示器
  renderDirect() {
    const { openedFlag = 1 } = this.state;

    return (
      <div
        className={!openedFlag ? styles['anchor-icon-expand'] : styles['anchor-icon-collapsed']}
        onClick={this.toggleOpened}
      >
        {!openedFlag ? <Icon type="caret-right" /> : <Icon type="caret-left" />}
      </div>
    );
  }

  render() {
    const {
      isSection = false,
      children = null,
      customizeStyle = {},
      className = '',
      isPub = false,
    } = this.props;
    const { sectionList = [], openedFlag = 1, activeSection = {} } = this.state;
    if (isEmpty(sectionList) || !isSection) {
      return isPub ? (
        children
      ) : (
        <div
          style={{
            maxHeight: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {children}
        </div>
      );
    }

    const sectionItemProps = {
      // isBatchMaintainSection,
      activeSection,
      handleClick: this.handleClick,
      openedFlag,
      // checkedList,
      // sectionItemCheck: this.sectionItemCheck,
    };

    return (
      <div className={classnames(styles['new-container'], className)} style={customizeStyle}>
        <div className={styles['ssrc-bid-section-panel']} style={{ marginRight: '0px' }}>
          <div className={styles['section-panel-contain']}>
            {this.renderSectionTitle()}
            {/* {isBatchMaintainSection && openedFlag && this.renderChecking()} */}
            <div className={styles['section-panel-list']}>
              {sectionList.map((item = {}) => (
                <div
                  className={classnames(styles['section-items'], {
                    [styles['closed-panel']]: !openedFlag,
                  })}
                  key={item.projectLineSectionId}
                >
                  <SectionItem data={item} {...sectionItemProps} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {this.renderDirect()}
        <div
          className={
            openedFlag ? styles['section-panel-content'] : styles['section-panel-content-collapsed']
          }
        >
          {children}
        </div>
      </div>
    );
  }
}

export default SectionPanel;
