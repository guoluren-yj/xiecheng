/* eslint-disable eqeqeq */
// 分标段切换面板

import React, { Component } from 'react';
import { Icon, Checkbox, Spin } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { Bind, debounce } from 'lodash-decorators';
import { isEmpty, isFunction } from 'lodash';
import classnames from 'classnames';

// BatchEmptySelectedModal
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
// import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import SectionItem from './SectionItem';
import { fetchSectionInfo, fetchApprovalSectionInfo } from './services';

import styles from './index.less';

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
    const openedFlag = sessionStorage.getItem('openedFlag');
    this.state = {
      openedFlag: !!(openedFlag === null || openedFlag === 'true'), // 打开折叠面板
      activeSection: {},
      indeterminate: false,
      checkAll: false, // 是否全选
      checkedList: [], // 标段勾选列表
      currentadjustRecordId: '', // 当前主键ID
      sourceProject: {}, // 项目信息
      sectionList: [],
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

  // 查询标段
  async fetchSection() {
    const { parentPage = {} } = this.props;
    const { queryParams = {} } = parentPage;
    const params = {
      organizationId: this.organizationId,
      ...queryParams,
    };

    let data = [];

    try {
      // switch (name) {
      //   case 'checkPrice':
      //     data = await fetchSectionInfo(params);
      //     break;
      //   default:
      //     break;
      // }

      if (queryParams.type === 'approval') {
        data = getResponse(await fetchApprovalSectionInfo(params));
      } else {
        data = getResponse(await fetchSectionInfo(params));
      }

      if (!data || isEmpty(data)) {
        return;
      }
      this.queryHeaderContent(data);
    } catch (e) {
      throw e;
    }
  }

  // 重查列表
  /**
   * 标段ID
   */
  refreshSectionList = async () => {
    const { parentPage = {} } = this.props;
    const { queryParams = {} } = parentPage;
    const params = {
      organizationId: this.organizationId,
      ...queryParams,
    };

    let data = [];
    try {
      data = getResponse(await fetchSectionInfo(params));
      if (!data || isEmpty(data)) {
        return;
      }
      const activeSection =
        data?.projectLineSectionList?.filter(
          (item) => String(item.adjustRecordId) === String(queryParams.adjustRecordId)
        )[0] || data[0];
      this.setState({
        activeSection,
        sectionList: data.projectLineSectionList,
        sourceProject: data.sourceProject,
        currentadjustRecordId: activeSection.adjustRecordId,
      });
      this.forceUpdate();
    } catch (e) {
      throw e;
    }
  };

  /**
   * @description: 标段排序
   * @param {*}
   */
  compareBid = (propertyName) => {
    return (object1, object2) => {
      const value1 = object1[propertyName];
      const value2 = object2[propertyName];
      if (value1 < value2) {
        return -1;
      } else if (value1 > value2) {
        return 1;
      } else {
        return 0;
      }
    };
  };

  // 标段查询后查询头行信息
  queryHeaderContent = (data = {}) => {
    const {
      parentPage: { queryParams = {} },
    } = this.props;

    const { projectLineSectionList = null, sourceProject } = data;
    if (isEmpty(projectLineSectionList)) {
      return;
    }

    const activeSection = projectLineSectionList
      .sort(this.compareBid('sectionNum'))
      .filter((item) => item.adjustRecordId == queryParams.adjustRecordId)[0];
    const { adjustRecordId = null } = activeSection || {};
    this.setState({
      sectionList: projectLineSectionList.sort(this.compareBid('sectionNum')),
      activeSection,
      currentadjustRecordId: adjustRecordId,
      sourceProject,
    });
  };

  // 外部更新数据
  outUpdateSectionList = (data = {}) => {
    const { adjustRecordId = null, sourceHeaderId = null } = data;
    const { sectionList = [] } = this.state;
    let currentSection = null;

    if (isEmpty(sectionList) || !adjustRecordId) {
      return;
    }

    const newSectionList = sectionList.map((item = {}) => {
      const { sourceHeaderId: sectionHeaderId = null } = item;
      if (sourceHeaderId === sectionHeaderId) {
        const newItem = {
          ...item,
          adjustRecordId,
        };
        currentSection = newItem;
        return newItem;
      }

      return item;
    });

    this.setState({
      activeSection: currentSection,
      sectionList: newSectionList,
    });
  };

  getSourceProject = () => {
    const { sourceProject = {} } = this.state;
    return sourceProject;
  };

  // 当前的主键id
  getCurrentadjustRecordId = () => {
    return this.state.currentadjustRecordId;
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

  getAllSectionList = () => {
    const { sectionList = [] } = this.state;
    return sectionList;
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
  @Bind()
  setActiveSection(data = {}) {
    this.setState({
      activeSection: data,
      currentadjustRecordId: data.adjustRecordId,
    });
  }

  // 点击标段事件
  @Bind()
  async handleClick(e, data = {}) {
    e.stopPropagation();

    const {
      beforeOpenSection = null,
      switchNotification = intl
        .get('ssrc.common.view.message.pageInvalidToSureInput')
        .d('有必填项未填，无法保存当前页面信息，是否确认切换页面'),
      afterOpenSection,
      toggleSectionLoading,
    } = this.props;
    // const { activeSection = {}, currentadjustRecordId } = this.state;
    const {
      parentPage: { queryParams = {} },
    } = this.props;

    if (queryParams.adjustRecordId == data.adjustRecordId) {
      return;
    }

    if (isFunction(beforeOpenSection)) {
      const beforeValite = await beforeOpenSection();

      if (!beforeValite) {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: switchNotification,
          onOk: () => {
            this.setActiveSection(data);
            afterOpenSection(data.sourceHeaderId, false, data.adjustRecordId);
          },
          onCancel: () => {
            if (isFunction(toggleSectionLoading)) {
              toggleSectionLoading(false);
            }
          },
        });
      } else {
        this.setActiveSection(data);
        afterOpenSection(data.sourceHeaderId, true, data.adjustRecordId);
      }
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
    const { sectionList = [], checkedList = [] } = this.state;
    const currentId = data.adjustRecordId;

    if (!currentId) {
      return;
    }

    const isChecked = e.target.checked;
    let newCheckedList = checkedList;

    const usefulsectionList = sectionList.filter((item) => {
      return item.redactFlag;
    });

    const index = newCheckedList.findIndex(
      (item = {}) => item.adjustRecordId && item.adjustRecordId == currentId
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
  }

  // 全选
  onCheckAllChange = (e) => {
    const value = e.target.checked;
    const { sectionList = [] } = this.state;
    const usefulsectionList = sectionList.filter((item) => {
      return item.redactFlag;
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
      openedSectionTitle = intl.get('ssrc.inquiryHall.view.title.sectionBiding').d('标段'),
      closedSectionTitle = intl.get('ssrc.inquiryHall.view.title.sectionBiding').d('标段'),
    } = this.props;
    const {
      parentPage: { name = '' },
    } = this.props;
    const { openedFlag = 1 } = this.state;
    let subtitle = '';

    switch (name) {
      case 'checkPrice':
        subtitle = intl
          .get('ssrc.inquiryHall.model.inquiryHall.quickChangeToCheckPrice')
          .d('快速切换标段进行核价');
        break;
      case 'roundQuotation':
        subtitle = intl
          .get('ssrc.inquiryHall.model.inquiryHall.quickChangeToRoundQuotation')
          .d('快速切换标段进行多轮报价');
        break;
      default:
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
      isBatchMaintainSection = false,
      parentPage,
      sectionLoading = false,
    } = this.props;
    const { sectionList = [], openedFlag = 1, activeSection = {}, checkedList = [] } = this.state;
    if (isEmpty(sectionList) || !isSection) {
      return children;
    }

    const sectionItemProps = {
      isBatchMaintainSection,
      activeSection,
      handleClick: this.handleClick,
      openedFlag,
      checkedList,
      sectionItemCheck: this.sectionItemCheck,
      parentPage,
    };

    return (
      <div className="page-content-wrap">
        <div className={styles['new-container']}>
          <div className={styles['ssrc-bid-section-panel']}>
            <div className={styles['section-panel-contain']}>
              {this.renderSectionTitle()}
              <Spin spinning={sectionLoading}>
                {isBatchMaintainSection && openedFlag && this.renderChecking()}
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
              </Spin>
            </div>
          </div>
          {this.renderDirect()}
          <div
            className={
              openedFlag
                ? styles['section-panel-content']
                : styles['section-panel-content-collapsed']
            }
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default SectionPanel;
