// 分标段切换面板

import React, { Component } from 'react';
import { Icon, Checkbox, Modal } from 'hzero-ui';
import { Bind, debounce } from 'lodash-decorators';
import { isEmpty, isFunction } from 'lodash';
import classnames from 'classnames';

// BatchEmptySelectedModal
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
// import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import SectionItem from './SectionItem';
import {
  fetchSectionInfo,
  fetchSupplierSectionList,
  fetchSupplierPriceSectionList,
  fetchExpertScoringSectionList,
  fetchExpertScoredSectionList,
} from './services';

import styles from './index.less';

@formatterCollections({
  code: ['ssrc.inquiryHall', 'ssrc.common'],
})
class SectionPanel extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      openedFlag: 1, // 打开折叠面板
      activeSection: {},
      sectionList: [],
      // sectionList: [],
      indeterminate: false,
      checkAll: false, // 是否全选
      checkedList: [], // 标段勾选列表
      currentSourceHeaderId: '', // 当前主键ID
      sourceProject: '', // 项目信息
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

  getInternalState(key = null) {
    if (!key) {
      return this.state;
    }
    return this.state[key];
  }

  componentDidMount() {
    this.fetchSection();
  }

  // 查询标段
  async fetchSection() {
    const { parentPage = {}, queryMain = () => {} } = this.props;
    const { name = null, queryParams = {} } = parentPage;
    const params = {
      organizationId: this.organizationId,
      ...queryParams,
    };

    let data = [];

    // 此逻辑后续优化为从入口处传递
    try {
      switch (name) {
        case 'participation':
          data = await fetchSupplierSectionList(params);
          break;
        case 'supplierQuotation':
          data = await fetchSupplierPriceSectionList(params);
          break;
        case 'checkPrice':
          data = await fetchSectionInfo(params);
          break;
        case 'expertScoring':
          data = await fetchExpertScoringSectionList(params);
          break;
        case 'expertScored':
          data = await fetchExpertScoredSectionList(params);
          break;
        default:
          break;
      }
      data = getResponse(data);

      if (!data || isEmpty(data)) {
        queryMain();
        return;
      }
      this.queryHeaderContent(data);
    } catch (e) {
      throw e;
    }
  }

  // 激活某一行数据
  activeItemOne(id = null) {
    const { rowKey, queryMain = () => {} } = this.props;
    const { sectionList = [] } = this.state;
    if (!id || isEmpty(sectionList)) {
      return;
    }

    let data = sectionList?.filter((item) => item[rowKey] === id) || [];
    data = !isEmpty(data[0]) ? data[0] : sectionList[0];
    const { sourceHeaderId = null, supplierCompanyId = null } = data;

    this.setState({
      activeSection: data,
    });

    queryMain({
      rfxHeaderId: sourceHeaderId,
      supplierCompanyId,
    });
  }

  // 重查列表
  /**
   * 标段ID
   */
  refreshSectionList = async () => {
    const { rowKey, activeRowId, parentPage = {} } = this.props;
    const { name = null, queryParams = {} } = parentPage;
    const params = {
      organizationId: this.organizationId,
      ...queryParams,
    };

    let data = [];
    try {
      switch (name) {
        case 'participation':
          data = await fetchSupplierSectionList(params);
          break;
        case 'supplierQuotation':
          data = await fetchSupplierPriceSectionList(params);
          break;
        case 'checkPrice':
          data = await fetchSectionInfo(params);
          break;
        default:
          break;
      }
      data = getResponse(data);

      if (!data || isEmpty(data)) {
        return;
      }
      const activeSection =
        data?.projectLineSectionList?.filter((item) => item[rowKey] === activeRowId)[0] ||
        data?.projectLineSectionList[0];
      this.setState({
        activeSection,
        sectionList: data.projectLineSectionList,
        sourceProject: data.sourceProject,
        currentSourceHeaderId: activeSection.sourceHeaderId,
      });
    } catch (e) {
      throw e;
    }
  };

  // 标段查询后查询头行信息
  queryHeaderContent = (data = {}) => {
    const { rowKey, activeRowId, queryMain = () => {} } = this.props;

    if (isEmpty(data)) {
      queryMain();
      return;
    }

    const { projectLineSectionList = [], sourceProject } = data;
    if (isEmpty(projectLineSectionList)) {
      queryMain();
      return;
    }

    const activeSection =
      projectLineSectionList?.filter((item) => item[rowKey] === activeRowId)[0] ||
      projectLineSectionList[0];
    const { sourceHeaderId = null, supplierCompanyId } = activeSection;
    queryMain({
      rfxHeaderId: sourceHeaderId,
      supplierCompanyId,
    });

    this.setState({
      sectionList: projectLineSectionList,
      activeSection,
      currentSourceHeaderId: activeSection.sourceHeaderId,
      sourceProject,
    });
  };

  // 当前的主键id
  getCurrentSourceHeaderId = () => {
    return this.state.currentSourceHeaderId;
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
  toggleOpened() {
    this.setState((preStatus) => {
      const { openedFlag = 1 } = preStatus;
      return {
        openedFlag: !openedFlag,
      };
    });
  }

  // 设置当前激活面板
  setActiveSection(data = {}) {
    this.setState({
      activeSection: data,
    });
  }

  // 点击标段事件
  @Bind()
  async handleClick(e, data = {}) {
    e.stopPropagation();

    const {
      rowKey,
      beforeOpenSection = null,
      switchNotification = intl
        .get('ssrc.common.view.message.pageInvalidToSureInput')
        .d('有必填项未填，无法保存当前页面信息，是否确认切换页面'),
    } = this.props;
    const currentId = data[rowKey];
    const { activeSection = {} } = this.state;

    const id = activeSection[rowKey];
    if (currentId && id === data[rowKey]) {
      return;
    }

    // 切换标段前操作
    if (beforeOpenSection && isFunction(beforeOpenSection)) {
      const validateFlag = await beforeOpenSection();
      if (!validateFlag) {
        // 必输未填
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
    } else {
      this.setState({
        activeSection: data,
        currentSourceHeaderId: activeSection.sourceHeaderId,
      });
      this.handleAfterOpenSection(data);
    }
  }

  // 切换标段后
  handleAfterOpenSection(data = {}) {
    const { afterOpenSection = null, queryMain = () => {} } = this.props;
    const { sourceHeaderId = null, supplierCompanyId } = data;
    queryMain({
      rfxHeaderId: sourceHeaderId,
      supplierCompanyId,
    });
    if (afterOpenSection && isFunction(afterOpenSection)) {
      afterOpenSection(data);
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

  // 标段勾选
  @Bind()
  sectionItemCheck(e, data = {}) {
    e.stopPropagation();
    const { rowKey } = this.props;
    const { sectionList = [], checkedList = [] } = this.state;
    const currentId = data[rowKey];

    if (!currentId) {
      return;
    }

    const isChecked = e.target.checked;
    let newCheckedList = checkedList;

    const usefulsectionList = sectionList?.filter((item) => {
      const { redactFlag = true } = item;
      return redactFlag;
    });

    const index = newCheckedList.findIndex((item = {}) => item[rowKey] === currentId);
    if (!isChecked) {
      if (index > -1) {
        newCheckedList = newCheckedList?.filter((_, currentIndex) => currentIndex !== index);
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
  }

  // 全选
  onCheckAllChange = (e) => {
    const value = e.target.checked;
    const { sectionList = [] } = this.state;
    const usefulsectionList = sectionList?.filter((item) => {
      const { redactFlag = true } = item;
      return redactFlag;
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
      subTitle = intl.get('ssrc.common.view.title.quickChangeSectionTips').d('快速切换标段'),
      openedSectionTitle = intl.get('ssrc.inquiryHall.view.title.sectionBiding').d('标段'),
      closedSectionTitle = intl.get('ssrc.inquiryHall.view.title.sectionBiding').d('标段'),
    } = this.props;
    const { openedFlag = 1 } = this.state;

    const title = openedFlag ? openedSectionTitle : closedSectionTitle;
    return (
      <div className={openedFlag ? styles['section-title'] : styles['section-title-collapsed']}>
        {title}
        <div className={styles['section-sub-title']}>{openedFlag && subTitle}</div>
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
      displayName,
      rowKey,
      isSection = false,
      children = null,
      showTag = false,
      isBatchMaintainSection = false,
      sectionTagMap = {},
      className = '',
    } = this.props;
    const { sectionList = [], openedFlag = 1, activeSection = {}, checkedList = [] } = this.state;

    if (isEmpty(sectionList) || !isSection) {
      return children;
    }

    const sectionItemProps = {
      showTag,
      sectionTagMap,
      displayName,
      rowKey,
      isBatchMaintainSection,
      activeSection,
      handleClick: this.handleClick,
      openedFlag,
      checkedList,
      sectionItemCheck: this.sectionItemCheck,
    };

    return (
      <div className={styles['new-container']}>
        <div className={classnames(styles[className], styles['ssrc-bid-section-panel'])}>
          <div className={styles['section-panel-contain']}>
            {this.renderSectionTitle()}
            {isBatchMaintainSection && openedFlag && this.renderChecking()}
            <div className={styles['section-panel-list']}>
              {sectionList.map((item = {}, index) => (
                <div
                  className={classnames(styles['section-items'], {
                    [styles['closed-panel']]: !openedFlag,
                  })}
                  key={item[rowKey]}
                >
                  <SectionItem data={item} index={index} {...sectionItemProps} />
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
