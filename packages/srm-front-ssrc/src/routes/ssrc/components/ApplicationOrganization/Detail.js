import React, { PureComponent } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { getResponse } from 'utils/utils';

// import QueryBar from './QueryBar';
import { queryLovInfo } from '@/services/commonService';
import { fetchApplicationScoreUnitList } from './services';

import { SelectedTableDS } from './DS';

import styles from './index.less';

const { TabPane } = Tabs;
const { Column } = Table;

export default class ApplicationScopeDetail extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef = null } = props;
    if (onRef) {
      if (typeof onRef === 'function') {
        onRef(this);
      } else {
        onRef.current = this;
      }
    }

    this.state = {
      tabsData: [],
      // lovConfig: {},
      // loading: false, // 启用/禁用loading
      currentTab: {},
    };
  }

  componentDidMount() {
    this.initDs();
    this.initPage();
  }

  initDs = () => {
    // this.queryTableDS = new DataSet(QueryTableDS());
    this.selectedTableDS = new DataSet(
      SelectedTableDS({
        readOnly: true,
      })
    );
  };

  // togglePageLoading = (loading = false) => {
  //   this.setState({
  //     loading,
  //   });
  // };

  initPage = async () => {
    const { queryParams = {} } = this.props;

    try {
      let result = await fetchApplicationScoreUnitList({
        ...queryParams,
      });
      result = getResponse(result);
      if (!result) {
        return;
      }
      const firstLine = result[0] || {};
      this.queryLovConfig(firstLine);
      this.querySelectedLine(firstLine);
      this.setState({
        currentTab: firstLine,
        tabsData: result,
      });
    } catch (e) {
      throw e;
    }
  };

  // 查询lov配置
  queryLovConfig = async (data = {}) => {
    if (isEmpty(data)) {
      return;
    }

    const { sourceCode = null } = data;
    try {
      let lovInfo = await queryLovInfo({
        viewCode: sourceCode,
      });
      lovInfo = getResponse(lovInfo);
      if (!lovInfo) {
        return;
      }
      // this.setState({
      //   lovConfig: lovInfo,
      // });
      // this.addFieldForSearchBar(lovInfo);
    } catch (e) {
      throw e;
    }
  };

  // 查询勾选的行
  querySelectedLine = async (data = {}, params = {}) => {
    if (isEmpty(data)) {
      return;
    }

    const { organizationId } = this.props;
    const {
      sourceCode = null,
      sourceCodeType = '',
      sourceAppScopeId = null,
      sourceCodeUniqueKey,
    } = data;
    const commonProps = {
      sourceCode,
      organizationId,
      sourceCodeType,
      sourceAppScopeId,
      sourceCodeUniqueKey,
      ...params,
    };
    this.selectedTableDS.setQueryParameter('commonProps', commonProps);
    this.selectedTableDS.query();
  };

  // tab 被点击的回调
  @Bind()
  clickTab(newActiveKey) {
    const { tabsData } = this.state;
    const currentTab = tabsData.find((item) => item.dimensionName === newActiveKey);
    if (isEmpty(currentTab)) {
      return;
    }
    this.queryLovConfig(currentTab);
    this.querySelectedLine(currentTab);
    this.setState({
      currentTab,
    });
  }

  // 表格筛选器查询
  // tableQueryBarQuery = () => {
  //   const { currentTab = {} } = this.state;
  //   const data = this.queryTableDS.toData();

  //   const dataStringify = JSON.stringify(data[0] || {});
  //   const params = {
  //     sourceCodeQueryParams: dataStringify,
  //   };
  //   this.querySelectedLine(currentTab, params);
  // };

  // // 表格头部查询框
  // renderQueryBar = () => {
  //   const { lovConfig = {} } = this.state;
  //   const { queryFields = [] } = lovConfig || {};
  //   const queryFieldList = [];

  //   if (!isEmpty(queryFields)) {
  //     queryFields.forEach((item = {}) => {
  //       const { field } = item;
  //       // TODO 后期可以随着功能增加判定LOV查询组件类型
  //       queryFieldList.push(<TextField name={field} maxLength={100} />);
  //     });
  //   }

  //   const Props = {
  //     queryDataSet: this.queryTableDS,
  //     queryFields: queryFieldList,
  //     handleQuery: this.tableQueryBarQuery,
  //   };
  //   return <QueryBar {...Props} />;
  // };

  render() {
    const { tabsData = [], currentTab = {} } = this.state;

    return (
      <div className={styles['ssrc-application-scope-container']}>
        <Tabs
          defaultActiveKey={currentTab?.dimensionCode}
          onTabClick={this.clickTab}
          tabPosition="left"
        >
          {!isEmpty(tabsData) &&
            tabsData.map((item) => {
              return (
                <TabPane tab={item.dimensionName} key={item.dimensionCode}>
                  {/* {!isEmpty(lovConfig) ? this.renderQueryBar() : null} */}
                  <Table
                    dataSet={this.selectedTableDS}
                    style={{ maxHeight: 'calc(100vh - 300px)' }}
                    customizedCode="SSRC.NEW_INQUIRY_HALL.APPLICATION_SCOPE_DETAIL"
                  >
                    <Column name="dataName" header={item.dimensionName} />
                    <Column name="dataCode" />
                  </Table>
                </TabPane>
              );
            })}
        </Tabs>
      </div>
    );
  }
}
