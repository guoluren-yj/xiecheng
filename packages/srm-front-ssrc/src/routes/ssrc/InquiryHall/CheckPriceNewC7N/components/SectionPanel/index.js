/* eslint-disable eqeqeq */
// 分标段切换面板

import React, { Component, Fragment } from 'react';
import { Icon, Checkbox, Modal } from 'hzero-ui';
import { Tooltip, DataSet, Form, Spin } from 'choerodon-ui/pro';
import { Bind, debounce } from 'lodash-decorators';
import { isEmpty, isFunction } from 'lodash';

// BatchEmptySelectedModal
import classnames from 'classnames';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
// import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { numberSeparatorRender } from '@/utils/renderer';
import { INQUIRY, BID, getCheckPriceName } from '@/utils/globalVariable';
import SectionItem from './SectionItem';
import {
  fetchSectionInfo,
  fetchSupplierSectionList,
  fetchSupplierPriceSectionList,
  fetchRoundQuotationSectionList,
} from './services';

import styles from './index.less';

@formatterCollections({
  code: ['ssrc.inquiryHall', 'ssrc.common'],
})
@WithCustomizeC7N({
  unitCode: [
    'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SOURCE_PROJECT',
    'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SOURCE_PROJECT',
  ],
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
      // sectionList: [],
      indeterminate: false,
      checkAll: false, // 是否全选
      checkedList: [], // 标段勾选列表
      currentSourceHeaderId: '', // 当前主键ID
      sourceProject: {}, // 项目信息
      onlySingleProjectLineSection: '',
      loading: true,
    };
  }

  projectDs = new DataSet({ autoCreate: true });

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
    const { parentPage = {}, queryMain = () => {} } = this.props;
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
        case 'checkPrice': // 当前仅针对核价修改此逻辑, 建议 `queryMain` 放至 外层组件
          data = await fetchSectionInfo(params);
          break;
        case 'roundQuotation':
          data = await fetchRoundQuotationSectionList(params);
          break;
        default:
          break;
      }
      data = getResponse(data);

      if (!data || isEmpty(data)) {
        // eslint-disable-next-line no-unused-expressions
        name !== 'checkPrice' && queryMain();
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
    const { parentPage = {}, judgeChooseSectionButton } = this.props;
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
        case 'roundQuotation':
          data = await fetchRoundQuotationSectionList(params);
          break;
        default:
          break;
      }
      data = getResponse(data);

      if (!data || isEmpty(data)) {
        return;
      }
      const activeSection =
        data?.projectLineSectionList?.filter(
          (item) => String(item.sourceHeaderId) === String(queryParams.rfxHeaderId)
        )[0] || data[0];
      this.setState(
        {
          activeSection,
          onlySingleProjectLineSection: data.onlySingleProjectLineSection,
          sectionList: data.projectLineSectionList,
          sourceProject: data.sourceProject,
          currentSourceHeaderId: activeSection?.sourceHeaderId,
        },
        () => {
          // 为了保险起见，这里也加上一个
          if (!isEmpty(data.projectLineSectionList) && isFunction(data.judgeChooseSectionButton)) {
            judgeChooseSectionButton(true);
          }
        }
      );
      this.forceUpdate();
    } catch (e) {
      throw e;
    }
  };

  // 标段查询后查询头行信息
  queryHeaderContent = (data = {}) => {
    const {
      queryMain = () => {},
      queryParams = {},
      parentPage = {},
      judgeChooseSectionButton,
    } = this.props;
    const { name } = parentPage;
    if (isEmpty(data)) {
      // eslint-disable-next-line no-unused-expressions
      name !== 'checkPrice' && queryMain();
      return;
    }

    const { projectLineSectionList = null, sourceProject, onlySingleProjectLineSection } = data;
    this.setState({
      onlySingleProjectLineSection,
      loading: false,
    });
    if (isEmpty(projectLineSectionList)) {
      // eslint-disable-next-line no-unused-expressions
      name !== 'checkPrice' && queryMain();
      return;
    }

    const activeSection = projectLineSectionList.filter(
      (item) => item.sourceHeaderId == queryParams.rfxHeaderId
    )[0];
    const { sourceHeaderId = null } = activeSection || {};
    this.setState(
      {
        sectionList: projectLineSectionList,
        activeSection,
        currentSourceHeaderId: sourceHeaderId,
        sourceProject,
      },
      () => {
        // eslint-disable-next-line no-unused-expressions
        name !== 'checkPrice' &&
          queryMain({
            rfxHeaderId: sourceHeaderId,
          });
        // 判断选择标段是否需要存在
        if (!isEmpty(projectLineSectionList) && isFunction(judgeChooseSectionButton)) {
          judgeChooseSectionButton(true);
        }
      }
    );
  };

  getSourceProject = () => {
    const { sourceProject = {} } = this.state;
    return sourceProject;
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
      currentSourceHeaderId: data.sourceHeaderId,
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
    } = this.props;
    // const { activeSection = {}, currentSourceHeaderId } = this.state;
    const {
      parentPage: { queryParams = {} },
    } = this.props;

    if (queryParams.rfxHeaderId == data.sourceHeaderId) {
      return;
    }

    if (isFunction(beforeOpenSection)) {
      const beforeValite = await beforeOpenSection();

      if (!beforeValite) {
        Modal.confirm({
          content: switchNotification,
          onOk: () => {
            this.setActiveSection(data);
            afterOpenSection(data.sourceHeaderId, false);
          },
        });
      } else {
        this.setActiveSection(data);
        afterOpenSection(data.sourceHeaderId, true);
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
    const currentId = data.sourceHeaderId;

    if (!currentId) {
      return;
    }

    const isChecked = e.target.checked;
    let newCheckedList = checkedList;

    const usefulsectionList = sectionList.filter((item) => {
      return item.redactFlag;
    });

    const index = newCheckedList.findIndex(
      (item = {}) => item.sourceHeaderId && item.sourceHeaderId == currentId
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
      showSectionTitleFlag = true,
      sourceKey = INQUIRY,
      openedSectionTitle = intl.get('ssrc.inquiryHall.view.title.sectionBiding').d('标段'),
      closedSectionTitle = intl.get('ssrc.inquiryHall.view.title.sectionBiding').d('标段'),
    } = this.props;
    const {
      parentPage: { name = '' },
    } = this.props;
    const { openedFlag = 1 } = this.state;
    let subtitle = '';

    if (showSectionTitleFlag) {
      return;
    }

    switch (name) {
      case 'checkPrice':
        subtitle = intl
          .get('ssrc.inquiryHall.model.inquiryHall.commonQuickChangeToCheckPrice', {
            checkPriceName: getCheckPriceName(sourceKey === BID),
          })
          .d('快速切换标段进行{checkPriceName}');
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
    const { bidFlag, customizeForm, children = null, parentPage } = this.props;
    const {
      sectionList = [],
      openedFlag = 1,
      activeSection = {},
      checkedList = [],
      sourceProject,
      loading,
      onlySingleProjectLineSection,
    } = this.state;

    const { sourceProjectNum, sourceProjectName, projectCost } = sourceProject;

    const sectionItemProps = {
      activeSection,
      handleClick: this.handleClick,
      openedFlag,
      checkedList,
      sectionItemCheck: this.sectionItemCheck,
      parentPage,
    };

    if (onlySingleProjectLineSection && !loading) {
      return children;
    }

    return (
      <Spin spinning={loading}>
        {!loading && (
          <Fragment>
            <div className={styles['section-header']}>
              <div className="section-header-title">
                <div className="section-header-title-info">
                  <Tooltip title={`${sourceProjectNum}-${sourceProjectName}`}>
                    {`${sourceProjectNum}-${sourceProjectName}`}
                  </Tooltip>
                  {/* <Tag color="gray">{sourceCategoryMeaning}</Tag>
              <Tag color="gray">{sourceTypeMeaning}</Tag> */}
                </div>
                <div className="section-header-title-amount">
                  {`${intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.projectAllPrice`)
                    .d('寻源项目总金额')}`}
                  <span>
                    {' '}
                    <Tooltip placement="topRight" title={numberSeparatorRender(projectCost) || '-'}>
                      {`${numberSeparatorRender(projectCost) || '-'}`}
                    </Tooltip>
                  </span>
                </div>
              </div>
              {customizeForm(
                {
                  code: bidFlag
                    ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SOURCE_PROJECT'
                    : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SOURCE_PROJECT',
                  dataSet: this.projectDs,
                },
                <Form dataSet={this.projectDs} />
              )}
            </div>
            <div className={styles['new-container']}>
              <div className={styles['ssrc-bid-section-panel']}>
                <div className={styles['section-panel-contain']}>
                  {this.renderSectionTitle()}
                  <div className={styles['section-panel-list']}>
                    {sectionList.map((item = {}) => (
                      <div
                        className={classnames(styles['section-items'], {
                          [styles['closed-panel']]: !openedFlag,
                        })}
                        key={item.sourceHeaderId}
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
                  openedFlag
                    ? styles['section-panel-content']
                    : styles['section-panel-content-collapsed']
                }
              >
                {children}
              </div>
            </div>
          </Fragment>
        )}
      </Spin>
    );
  }
}

export default SectionPanel;
