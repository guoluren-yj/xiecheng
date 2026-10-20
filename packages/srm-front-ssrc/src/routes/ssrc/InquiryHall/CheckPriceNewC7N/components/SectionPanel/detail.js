/* eslint-disable eqeqeq */
// 分标段切换面板

import React, { Component } from 'react';
import { Modal } from 'hzero-ui';
import { DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty, isFunction } from 'lodash';

// BatchEmptySelectedModal
import classnames from 'classnames';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
// import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
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
    };
  }

  projectDs = new DataSet({ autoCreate: true });

  componentDidMount() {
    const { sectionList, queryParams, rfxHeaderIds = [] } = this.props;
    if (sectionList?.length) {
      let activeSection = {};
      const newSectionList = [];
      sectionList.forEach((item) => {
        if (String(item.sourceHeaderId) === String(queryParams.rfxHeaderId)) {
          activeSection = item;
        }
        newSectionList.push({ ...item, disabled: !rfxHeaderIds.includes(item.sourceHeaderId) });
      });
      this.setState({ sectionList: newSectionList, activeSection });
    } else {
      this.fetchSection();
    }
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

    const { projectLineSectionList = null, sourceProject } = data;
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

  getAllSectionList = () => {
    const { sectionList = [] } = this.state;
    return sectionList;
  };

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

  render() {
    const { isSection = false, children = null, parentPage } = this.props;
    const { sectionList = [], openedFlag = 1, activeSection = {}, checkedList = [] } = this.state;
    if (isEmpty(sectionList) || !isSection) {
      return children;
    }

    const sectionItemProps = {
      activeSection,
      handleClick: this.handleClick,
      openedFlag,
      checkedList,
      sectionItemCheck: this.sectionItemCheck,
      parentPage,
    };

    return (
      <div className={styles['detail-container']}>
        <div className={styles['ssrc-bid-section-panel-detail']}>
          <div className={styles['section-panel-contain']}>
            {sectionList.map((item = {}) => (
              <div
                className={classnames(styles['section-items'], item.disabled && styles.disabled)}
                key={item.sourceHeaderId}
              >
                <SectionItem data={item} {...sectionItemProps} />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    );
  }
}

export default SectionPanel;
