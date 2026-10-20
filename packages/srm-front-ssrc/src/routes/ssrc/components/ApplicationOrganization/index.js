import React, { PureComponent } from 'react';
import { DataSet, Table, TextField } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
// import notification from 'utils/notification';

import { queryLovInfo } from '@/services/commonService';
import { fetchApplicationScoreUnitList, submitApplicationScopeLine } from './services';

import QueryBar from './QueryBar';
import { TableDS, QueryTableDS, SelectedTableDS } from './DS';

import styles from './index.less';

const { TabPane } = Tabs;
const { Column } = Table;

export default class ApplicationScope extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }

    this.state = {
      tabsData: [],
      lovConfig: {},
      currentTab: {},
      tabsLineNum: {},
    };
  }

  componentDidMount() {
    this.initDs();
    this.initPage();
    this.watchDSSelect();
  }

  // 监控两个表格勾选事件，彼此互相控制
  watchDSSelect = () => {
    this.tableDs.addEventListener('select', this.handleTableSelect);
    this.tableDs.addEventListener('batchSelect', this.handleTableSelectBatch);
    this.tableDs.addEventListener('unSelect', this.handleTableUnSelect);
    this.tableDs.addEventListener('batchUnSelect', this.handleTableUnSelectBatch);

    this.selectedTableDS.addEventListener('unSelect', this.handleSelectTableUnSelect);
    this.selectedTableDS.addEventListener('batchUnSelect', this.handleSelectTableUnSelectBatch);
  };

  // 所有数据表格-勾选
  handleTableSelect = ({ record }) => {
    if (!record) {
      return;
    }
    this.tableDs.select(record);
    const selectRecord = record.toData();
    const { dataId: selectedDataId } = selectRecord;
    const selectedFlag = this.selectedTableDS.some(
      (item = {}) => item?.get('dataId') === selectedDataId
    );

    if (!selectedFlag) {
      this.selectedTableDS.create(selectRecord, 0);
      const selected = this.selectedTableDS.filter(
        (item = {}) => item?.get('dataId') === selectedDataId
      );
      this.selectedTableDS.select(selected[0]);
      // this.selectedTableDS.select(0);
    }
  };

  // 所有数据表格-批量勾选
  handleTableSelectBatch = ({ records = [] }) => {
    records.forEach((record) => {
      this.handleTableSelect({ record });
    });
  };

  // 所有数据表格-取消勾选
  handleTableUnSelect = ({ record }) => {
    if (!record) {
      return;
    }

    this.tableDs.unSelect(record);
    const tableSelected = this.selectedTableDS.toData();
    const selectedLines = tableSelected.filter((item) => item?.dataId !== record?.get('dataId'));
    this.selectedTableDS.loadData(selectedLines);
    tableSelected.forEach((item = {}) => {
      this.selectedTableDS.select(item);
    });
  };

  // 所有数据表格-批量取消勾选
  handleTableUnSelectBatch = ({ records = [] }) => {
    records.forEach((record) => {
      this.handleTableUnSelect({ record });
    });
  };

  // 勾选缓存表格取消勾选事件
  handleSelectTableUnSelect = ({ record }) => {
    if (!record) {
      return;
    }

    const removeDataId = record?.get('dataId');
    this.selectedTableDS.remove([record]);
    const tableUnSelectedRecords = this.tableDs.filter(
      (item = {}) => item?.get('dataId') === removeDataId
    );
    this.tableDs.unSelect(tableUnSelectedRecords[0] || {});
  };

  // 勾选缓存表格批量取消勾选事件
  handleSelectTableUnSelectBatch = ({ records = [] }) => {
    records.forEach((record) => {
      this.handleSelectTableUnSelect({ record });
    });
  };

  initDs = () => {
    this.queryTableDS = new DataSet(QueryTableDS());
    this.tableDs = new DataSet(
      TableDS({
        readOnly: false,
      })
    );
    this.selectedTableDS = new DataSet(
      SelectedTableDS({
        readOnly: false,
      })
    );
  };

  // togglePageLoading = (loading = false) => {
  //   this.setState({
  //     loading,
  //   });
  // };

  // 保存页面数据整合
  generateData = () => {
    const { organizationId } = this.props;
    const { currentTab = {} } = this.state;

    const line = this.selectedTableDS.toData();

    return {
      ...currentTab,
      organizationId,
      sourceAppScopeLines: line,
    };
  };

  // 适应范围保存
  submitApplicationScopeLine = async () => {
    const { currentTab = {} } = this.state;
    let result = false;
    const data = await this.generateData();
    try {
      let res = await submitApplicationScopeLine({
        ...data,
      });
      res = getResponse(res);
      if (!res) {
        result = false;
        return result;
      }
      result = true;
      this.queryTableLine(currentTab);
      this.querySelectedLine(currentTab);
    } catch (e) {
      throw e;
    }
    return result;
  };

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
      this.queryTableLine(firstLine);
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
      this.setState({
        lovConfig: lovInfo,
      });
      this.addFieldForSearchBar(lovInfo);
    } catch (e) {
      throw e;
    }
  };

  addFieldForSearchBar = (lovInfo = {}) => {
    const { queryFields = [] } = lovInfo || {};
    if (isEmpty(queryFields)) {
      return null;
    }

    queryFields.forEach((item = {}) => {
      const { field, label } = item;
      this.queryTableDS.addField(field, {
        label,
      });
    });
  };

  // 查询表格行数据
  queryTableLine = async (data = {}, params = {}) => {
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
    this.tableDs.setQueryParameter('commonProps', commonProps);
    this.tableDs.query();
  };

  // 查询勾选的行
  querySelectedLine = async (data = {}, params = {}) => {
    if (isEmpty(data)) {
      return;
    }

    const { organizationId } = this.props;
    const { tabsLineNum = {} } = this.state;
    const {
      sourceCode = null,
      sourceCodeType = '',
      sourceAppScopeId = null,
      sourceCodeUniqueKey,
      dimensionCode,
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
    const lines = (await this.selectedTableDS.query()) || [];

    this.setState({
      tabsLineNum: {
        ...tabsLineNum,
        [dimensionCode]: lines.length,
      },
    });
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
    this.queryTableLine(currentTab);
    this.setState({
      currentTab,
    });
  }

  // 表格筛选器查询
  tableQueryBarQuery = () => {
    const { currentTab = {} } = this.state;
    const data = this.queryTableDS.toData();

    const dataStringify = JSON.stringify(data[0] || {});
    const params = {
      sourceCodeQueryParams: dataStringify,
    };
    this.querySelectedLine(currentTab, params);
    this.queryTableLine(currentTab, params);
  };

  // 表格头部查询框
  renderQueryBar = () => {
    const { lovConfig = {} } = this.state;
    const { queryFields = [] } = lovConfig || {};
    const queryFieldList = [];

    if (!isEmpty(queryFields)) {
      queryFields.forEach((item = {}) => {
        const { field } = item;
        // TODO 后期可以随着功能增加判定LOV查询组件类型
        queryFieldList.push(<TextField name={field} maxLength={100} />);
      });
    }

    const Props = {
      queryDataSet: this.queryTableDS,
      queryFields: queryFieldList,
      handleQuery: this.tableQueryBarQuery,
    };
    return <QueryBar {...Props} />;
  };

  render() {
    const { tabsData = [], lovConfig = {}, currentTab = {}, tabsLineNum = {} } = this.state;

    return (
      <div className={styles['ssrc-application-scope-container']}>
        <Tabs
          defaultActiveKey={currentTab?.dimensionCode}
          onTabClick={this.clickTab}
          tabPosition="left"
        >
          {tabsData.map((item = {}) => {
            const { dimensionName = '', dimensionCode = '' } = item;
            const countNum = tabsLineNum[dimensionCode] || 0;
            return (
              <TabPane tab={dimensionName} key={dimensionCode} count={countNum}>
                {!isEmpty(lovConfig) ? this.renderQueryBar() : null}
                {/* 缓存表格只做缓存记录，页面不做实际展示 */}
                <Table
                  dataSet={this.selectedTableDS}
                  header={intl
                    .get('ssrc.inquiryHall.view.title.cacheApplicationScopeRecord')
                    .d('缓存记录')}
                  className={styles['hidden-container']}
                >
                  <Column name="dataName" header={dimensionName} />
                  <Column name="dataCode" />
                </Table>

                <Table
                  dataSet={this.tableDs}
                  // showCachedSelection
                  // header={intl
                  //   .get('ssrc.inquiryHall.view.title.currentPageRecordTableList')
                  //   .d('当前页记录')}
                  style={{ maxHeight: 'calc(100vh - 300px)' }}
                  customizedCode="SSRC.NEW_INQUIRY_HALL.APPLICATION_SCOPE_UPDATE"
                >
                  <Column name="dataName" header={dimensionName} />
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
