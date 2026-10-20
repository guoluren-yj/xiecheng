import React, { Component, Fragment } from 'react';
import { DataSet, Tabs } from 'choerodon-ui/pro';
import { noop, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import withProps from 'utils/withProps';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { changeRfxDetailLayout } from '@/services/inquiryHallService';
import { fetchInquiryHallUserMemory } from '@/services/inquiryHallNewService';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';

import Search from './RFContainer/search';
import All from './RFContainer/all';
import WaitPublish from './RFContainer/waitPublish';
import Ongoing from './RFContainer/onGoing';
import Finish from './RFContainer/finish';

import { TableDS } from './RFIDS';

const { TabPane } = Tabs;

class RFIContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'all',
      renderSerchBarFlag: false,
      sourceProjectId: null,
      routerParmas: querystring.parse(props.location.search.substr(1)),
      tabsNum: {
        toBeReleased: '',
        onGoing: '',
        finished: '',
        all: '',
      },
    };
    this.props.rfContainerRef.current = this;
  }

  componentDidMount() {
    this.initData();
  }

  // 页面跳转时监测id是否变化
  getSnapshotBeforeUpdate() {
    const id = querystring.parse(this.props.location.search.substr(1)).sourceProjectId || null;
    const { sourceProjectId = null } = this.state;
    return sourceProjectId !== id;
  }

  componentDidUpdate(...params) {
    const queryParams = querystring.parse(this.props.location.search.substr(1));
    if (params[2] && queryParams.sourceProjectId) {
      this.initData();
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        sourceProjectId: queryParams.sourceProjectId,
      });
    }
  }

  async initData() {
    const { routerParmas } = this.state;
    if (!isEmpty(routerParmas) && this.state.renderSerchBarFlag && this.SearchComponent) {
      const { tabStatus, defaultTabIndex, sourceProjectId, sourceProjectName } = routerParmas;
      this.SearchComponent.setField('sourceProjectId', {
        sourceProjectId,
        sourceProjectName,
      });
      this.setState({
        currentTab: tabStatus || defaultTabIndex,
      });
      this.props.changeRFIContainerCurrentTab(tabStatus || defaultTabIndex);
    }
    this.setState({
      renderSerchBarFlag: true,
    });
    const { organizationId } = this.props;
    const response = getResponse(
      await fetchInquiryHallUserMemory({
        organizationId,
        configKeys: ['currentTab'],
      })
    );
    if (response && !response.failed) {
      this.setState(
        {
          currentTab:
            routerParmas?.tabStatus ||
            routerParmas?.defaultTabIndex ||
            response.currentTab.configValue ||
            'all',
          currentTabObj: response.currentTab,
        },
        () => this.initQuery()
      );
    }
  }

  initQuery() {
    const { currentTab } = this.state;
    const { onGoingDS, waitPublishDS } = this.props;
    this.props.changeRFIContainerCurrentTab(currentTab);
    if (currentTab === 'toBeReleased') {
      onGoingDS.query();
    } else if (currentTab === 'onGoing') {
      waitPublishDS.query();
    } else {
      onGoingDS.query();
      waitPublishDS.query();
    }
  }

  changeTabQuery() {
    const { currentTab } = this.state;
    const { waitPublishDS, onGoingDS, finishDS, allDS } = this.props;
    switch (currentTab) {
      case 'toBeReleased':
        waitPublishDS.query(waitPublishDS.currentPage);
        break;
      case 'onGoing':
        onGoingDS.query(onGoingDS.currentPage);
        break;
      case 'finished':
        finishDS.query(finishDS.currentPage);
        break;
      case 'all':
        allDS.query(allDS.currentPage);
        break;
      default:
        break;
    }
  }

  // @Bind()
  handleAggregationChange = (aggregation, flag) => {
    const { currentTab } = this.state;
    switch (currentTab) {
      case 'toBeReleased':
        if (this.waitPublishRef) {
          this.waitPublishRef.handleAggregationChange(aggregation, flag);
        }
        break;
      case 'onGoing':
        if (this.onGoingRef) {
          this.onGoingRef.handleAggregationChange(aggregation, flag);
        }
        break;
      case 'finished':
        if (this.finishRef) {
          this.finishRef.handleAggregationChange(aggregation, flag);
        }
        break;
      case 'all':
        if (this.allRef) {
          this.allRef.handleAggregationChange(aggregation, flag);
        }
        break;
      default:
        break;
    }
  };

  @Bind()
  changeTab(current) {
    const { organizationId, userId, tableDisplay, changeRFIContainerCurrentTab } = this.props;
    this.setState(
      {
        currentTab: current,
      },
      () => {
        if (tableDisplay !== 'mid') {
          this.handleAggregationChange(tableDisplay === 'wide', true);
        }
      }
    );
    changeRFIContainerCurrentTab(current);
    setTimeout(() => {
      const newInquiryHallTab = this.state.currentTabObj;
      changeRfxDetailLayout({
        ...newInquiryHallTab,
        organizationId,
        userId,
        enabledFlag: 1,
        configDesc: 'currentTab',
        configKey: 'currentTab',
        configValue: current,
      });
      this.changeTabQuery();
    }, 10);
  }

  allRef = null;

  finishRef = null;

  onGoingRef = null;

  waitPublishRef = null;

  @Bind()
  getAllRef(ref) {
    this.allRef = ref || {};
  }

  @Bind()
  getFinishRef(ref) {
    this.finishRef = ref || {};
  }

  @Bind()
  getOnGoingRef(ref) {
    this.onGoingRef = ref || {};
  }

  @Bind()
  getWaitPublishRef(ref) {
    this.waitPublishRef = ref || {};
  }

  @Bind()
  getSearchComponent(ref) {
    this.SearchComponent = ref || {};
  }

  @Bind()
  getTabsNum(tabsNum) {
    this.setState({
      tabsNum,
    });
  }

  render() {
    const { currentTab, renderSerchBarFlag, tabsNum } = this.state;
    const {
      location,
      tableDisplay,
      changeRFParams,
      changeTableDisplay,
      currentType,
      useRF = false,
      useRFContent = 'ALL',
      viewDetailRF = noop,
      changeInquiryType = noop,
      renderRFOperate = noop,
      inquiryDetail = noop,
      changeTypeAggregation,
      customizeTable = noop,
      cancelAggregationChange = noop,
      allDS,
      finishDS,
      onGoingDS,
      waitPublishDS,
    } = this.props;
    const commonProps = {
      viewDetailRF,
      renderRFOperate,
      inquiryDetail,
      changeTypeAggregation,
      customizeTable,
      currentType,
      tableDisplay,
      cancelAggregationChange,
      handleAggregationChange: this.handleAggregationChange,
    };

    const allProps = {
      ...commonProps,
      allDS,
      onRef: this.getAllRef,
    };

    const finishProps = {
      ...commonProps,
      finishDS,
      onRef: this.getFinishRef,
    };

    const onGoingProps = {
      ...commonProps,
      onGoingDS,
      onRef: this.getOnGoingRef,
    };

    const waitPublishProps = {
      ...commonProps,
      waitPublishDS,
      onRef: this.getWaitPublishRef,
    };

    const searchProps = {
      useRF,
      location,
      tableDisplay,
      useRFContent,
      changeTableDisplay,
      currentType,
      changeRFParams,
      changeInquiryType,
      allDS,
      finishDS,
      onGoingDS,
      waitPublishDS,
      onRFRef: (ref) => {
        this.getRFSearchRef = ref;
      },
      onRef: this.getSearchComponent,
      getTabsNum: this.getTabsNum,
    };

    return (
      <Fragment>
        <div style={getTableFixSelfAdaptStyle(true).wrapperStyle}>
          {renderSerchBarFlag && <Search {...searchProps} />}

          {renderSerchBarFlag && (
            <Tabs
              activeKey={currentTab}
              // size="large"
              onChange={this.changeTab}
              customizable
              defaultChangeable={false}
              customizedCode="SSRC.INQUIRY_HALL.RF.NEW_LIST.WORKBENCH_TABS"
              {...getTableFixSelfAdaptStyle(true).tabsProps}
            >
              <TabPane
                tab={intl.get('ssrc.inquiryHall.button.toBeReleased').d('待发布')}
                key="toBeReleased"
                count={tabsNum.toBeReleased}
              >
                <WaitPublish {...waitPublishProps} />
              </TabPane>
              <TabPane
                tab={intl.get('ssrc.inquiryHall.button.onGoing').d('进行中')}
                key="onGoing"
                count={tabsNum.onGoing}
              >
                <Ongoing {...onGoingProps} />
              </TabPane>
              <TabPane
                tab={intl.get('ssrc.inquiryHall.button.finished').d('完成')}
                key="finished"
                showCount={false}
                count={tabsNum.finished}
              >
                <Finish {...finishProps} />
              </TabPane>
              <TabPane
                tab={intl.get('ssrc.inquiryHall.button.all').d('全部')}
                key="all"
                showCount={false}
                count={tabsNum.all}
              >
                <All {...allProps} />
              </TabPane>
            </Tabs>
          )}
        </div>
      </Fragment>
    );
  }
}

const hocComponent = (NewComponent, currentType = 'RFI') => {
  return WithCustomizeC7N({
    unitCode: [
      'SSRC.INQUIRY_HALL.RF_LIST.RFI', // 基本信息
      'SSRC.INQUIRY_HALL.RF_LIST.RFP', // 采购组织及人员-需求方
      'SSRC.INQUIRY_HALL.RF_LIST.RFI_FINISHED',
      'SSRC.INQUIRY_HALL.RF_LIST.RFI_PROCESSING',
      'SSRC.INQUIRY_HALL.RF_LIST.RFI_UNRELEASED',
      'SSRC.INQUIRY_HALL.RF_LIST.RFP_FINISHED',
      'SSRC.INQUIRY_HALL.RF_LIST.RFP_PROCESSING',
      'SSRC.INQUIRY_HALL.RF_LIST.RFP_UNRELEASED',
    ],
  })(
    formatterCollections({
      code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.queryRfq', 'ssrc.qualiExam'],
    })(
      withProps(
        () => {
          const allDS = new DataSet(
            TableDS({
              tab: 'all',
              sourceCategory: currentType,
              customizeUnitCode: `SSRC.INQUIRY_HALL.RF_LIST.${currentType}_FILTER_BAR,SSRC.INQUIRY_HALL.RF_LIST.${currentType}`,
              pageSize: 20,
            })
          );
          const waitPublishDS = new DataSet(
            TableDS({
              tab: 'unreleased',
              sourceCategory: currentType,
              customizeUnitCode: `SSRC.INQUIRY_HALL.RF_LIST.${currentType}_FILTER_BAR,SSRC.INQUIRY_HALL.RF_LIST.${currentType}_UNRELEASED`,
              pageSize: 20,
            })
          );
          const onGoingDS = new DataSet(
            TableDS({
              tab: 'processing',
              sourceCategory: currentType,
              customizeUnitCode: `SSRC.INQUIRY_HALL.RF_LIST.${currentType}_FILTER_BAR,SSRC.INQUIRY_HALL.RF_LIST.${currentType}_PROCESSING`,
              pageSize: 20,
            })
          );
          const finishDS = new DataSet(
            TableDS({
              tab: 'finished',
              sourceCategory: currentType,
              customizeUnitCode: `SSRC.INQUIRY_HALL.RF_LIST.${currentType}_FILTER_BAR,SSRC.INQUIRY_HALL.RF_LIST.${currentType}_FINISHED`,
              pageSize: 20,
            })
          );
          return {
            allDS,
            waitPublishDS,
            onGoingDS,
            finishDS,
          };
        },
        { cacheState: true }
      )(NewComponent)
    )
  );
};

export { hocComponent, RFIContainer };

export default hocComponent(RFIContainer, 'RFI');
