import React, { Fragment, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  DataSet,
  Button,
  Modal,
  Form,
  Select,
  TextArea,
  Lov,
  DateTimePicker,
} from 'choerodon-ui/pro';
import { Tabs, Tag, Badge } from 'choerodon-ui';
import { isEmpty, isArray } from 'lodash';
import moment from 'moment';
import { observer } from 'mobx-react-lite';

import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import ExcelExportPro from 'components/ExcelExportPro';
import notification from 'utils/notification';
import DoubleTabs from '_components/DoubleTabs';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import OperationRecord from '@/routes/components/OperationRecordNew';

import {
  summaryData,
  detailsData,
  changeStatusData,
  fetchChangeStatus,
  detailsSummaryData,
  exportSummaryUrl,
  exportDetailUrl,
  fetchSummaryCount,
  fetchDetailsCount,
} from './initialDataDs';
import Style from './index.less';

const { TabPane } = Tabs;

// 自动生成ds的名字命名 - ${navigationKey}${tabKey}${detailKey}
const dsSummaryTabKeys = [
  'comprehensivesummarypending',
  'comprehensivesummaryprocessed',
  'comprehensivesummaryignore',
  'comprehensivesummaryall',
  'maintenancesummarypending',
  'maintenancesummaryprocessed',
  'maintenancesummaryignore',
  'maintenancesummaryall',
  'technologysummarypending',
  'technologysummaryprocessed',
  'technologysummaryignore',
  'technologysummaryall',
  'productsummarypending',
  'productsummaryprocessed',
  'productsummaryignore',
  'productsummaryall',
];
const dsDetailsTabKeys = [
  'comprehensivedetailpending',
  'comprehensivedetailprocessed',
  'comprehensivedetailignore',
  'comprehensivedetailall',
  'maintenancedetailpending',
  'maintenancedetailprocessed',
  'maintenancedetailignore',
  'maintenancedetailall',
  'technologydetailpending',
  'technologydetailprocessed',
  'technologydetailignore',
  'technologydetailall',
  'productdetailpending',
  'productdetailprocessed',
  'productdetailignore',
  'productdetailall',
];

const issueRoleFollowS = {
  maintenance: 'OPS', // 运维关注
  technology: 'TECH', // 技术关注
  product: 'PRODUCER', // 产品关注
  comprehensive: '', // 综合统计
};

const processStatusS = {
  pending: 'PROCESSING', // 待处理
  processed: 'PROCESSED', // 已处理
  ignore: 'IGNORED', // 已忽略
  all: '', // 全部
};

const AbnormalCallMonitoring = () => {
  const filterBarRef = useRef({});
  const [tabKey, setTabKey] = useState('summary');
  const [detailKey, setDetailKey] = useState('pending');
  const [navigationKey, setNavigationKey] = useState('comprehensive');
  const currentKey = `${navigationKey}${tabKey}${detailKey}`;
  // const [leftRenderSelect, setLeftRender] = useState({ value: '异常编号', name: 'sumNum' });
  const [summaryCount, setSummaryCount] = useState({
    ignoredNum: 0,
    processedNum: 0,
    processingNum: 0,
    sumNum: 0,
  });
  const sourceSummaryDataDs = useMemo(() => {
    const dataDsArry = {};
    for (let i = 0; i < 16; i++) {
      dataDsArry[dsSummaryTabKeys[i]] = new DataSet(summaryData(dsSummaryTabKeys[i]));
    }
    return dataDsArry;
  }, []);

  const sourceDetailsDataDs = useMemo(() => {
    const dataDsArry = {};
    for (let i = 0; i < 16; i++) {
      dataDsArry[dsDetailsTabKeys[i]] = new DataSet(detailsData(dsDetailsTabKeys[i]));
    }
    return dataDsArry;
  }, []);

  useEffect(() => {
    fetchCount(tabKey, navigationKey);
  }, [tabKey, navigationKey]);

  useEffect(() => {
    fetchData(navigationKey, tabKey, detailKey);
  }, [navigationKey, tabKey, detailKey]);

  const fetchData = useCallback((key1, key2, key3) => {
    const currentKeys = `${key1}${key2}${key3}`;
    if (key2 === 'summary') {
      sourceSummaryDataDs[currentKeys].setQueryParameter('issueRoleFollow', issueRoleFollowS[key1]);
      sourceSummaryDataDs[currentKeys].setQueryParameter('processStatus', processStatusS[key3]);
      sourceSummaryDataDs[currentKeys].query();
    } else {
      sourceDetailsDataDs[currentKeys].setQueryParameter('issueRoleFollow', issueRoleFollowS[key1]);
      sourceDetailsDataDs[currentKeys].setQueryParameter('processStatus', processStatusS[key3]);
      sourceDetailsDataDs[currentKeys].query();
    }
  }, []);

  const fetchCount = useCallback((key1, key2) => {
    if (key1 === 'summary') {
      fetchSummaryCount({ issueRoleFollow: issueRoleFollowS[key2] }).then(res => {
        if (res && !res.failed) {
          setSummaryCount(res);
        }
      });
    } else {
      fetchDetailsCount({ issueRoleFollow: issueRoleFollowS[key2] }).then(res => {
        if (res && !res.failed) {
          setSummaryCount(res);
        }
      });
    }
  }, []);

  // 变更状态
  const handleViewDetails = useCallback(dataProps => {
    const modalDetailsDs = new DataSet(detailsSummaryData());
    let currentID = '';
    if (tabKey === 'summary') {
      currentID = dataProps.get('errSumId');
      modalDetailsDs.setQueryParameter('errSumId', currentID);
    } else {
      currentID = dataProps.get('errDataId');
      modalDetailsDs.setQueryParameter('errDataId', currentID);
    }
    Modal.open({
      title: intl
        .get('sitf.abnormalCallMonitoring.model.abnormalCallMonitoring.details')
        .d('异常明细'),
      drawer: true,
      closable: true,
      style: { width: 1100 },
      children: (
        <FilterBarTable
          key={currentID}
          dataSet={modalDetailsDs}
          cacheState
          border={false}
          filterBarConfig={{
            cacheKey: `${currentID}`,
            expandable: true,
          }}
          columns={columnsDetails}
        />
      ),
      footer: (_, cancelBtn) => cancelBtn,
      cancelProps: {
        color: 'primary',
      },
      cancelText: intl.get('sitf.abnormalCallMonitoring.view.button.close').d('关闭'),
    });
  }, []);

  const tagRender = useCallback((status, value) => {
    let tagColor = '#E5E7EC';
    let fontColor = '#4E5769';
    switch (status) {
      case 'PROCESSING':
        tagColor = 'rgba(242, 128, 26, 0.15)';
        fontColor = '#F06200';
        break;
      case 'PROCESSED':
        tagColor = 'rgba(71, 184, 131, 0.15)';
        fontColor = '#179454';
        break;
      default:
        break;
    }
    return (
      <Tag color={tagColor}>
        <span style={{ color: fontColor }}>{value}</span>
      </Tag>
    );
  }, []);

  /**
   * 问题等级渲染
   * @param {string}
   * @returns ReactNode
   */

  const priorityRender = (key, value) => {
    return isEmpty(key) ? (
      ''
    ) : key === '1' ? (
      <Badge status="error" text={value} />
    ) : key === '2' ? (
      <Badge status="warning" text={value} />
    ) : (
      <Badge status="default" text={value} />
    );
  };

  // 异常汇总
  const columnsSummary = useMemo(
    () => [
      detailKey === 'all' && {
        name: 'processStatusMeaning',
        width: 100,
        renderer: ({ value, record }) => {
          const status = record ? record.get('processStatus') : '';
          return <span>{tagRender(status, value)}</span>;
        },
      },
      {
        name: 'sumNum',
        width: 120,
      },
      {
        name: 'msgCode',
        width: 180,
      },
      {
        name: 'msgDesc',
        width: 180,
      },
      {
        name: 'tenantName',
        width: 180,
      },
      {
        name: 'errCountSum',
        width: 90,
      },
      {
        name: 'errDataCount',
        width: 100,
      },
      {
        name: 'issueLevelMeaning',
        width: 100,
        renderer: ({ record, value }) => priorityRender(record.get('issueLevel'), value),
      },
      {
        name: 'issueModuleMeaning',
        width: 100,
      },
      navigationKey === 'comprehensive' && {
        name: 'issueRoleFollow',
        width: 100,
      },
      {
        name: 'issueSolution',
        width: 150,
      },
      {
        name: 'issueNum',
        width: 100,
      },
      {
        name: 'lastUpdateDate',
        width: 150,
      },
      {
        header: intl
          .get('sitf.abnormalCallMonitoring.model.abnormalCallMonitoring.details')
          .d('异常明细'),
        width: 100,
        align: 'center',
        renderer: ({ record }) => (
          <a onClick={() => handleViewDetails(record)}>
            {intl.get('sitf.abnormalCallMonitoring.model.abnormalCallMonitoring.view').d('查看')}
          </a>
        ),
      },
      {
        header: intl
          .get('sitf.abnormalCallMonitoring.model.abnormalCallMonitoring.record')
          .d('操作记录'),
        width: 100,
        align: 'center',
        renderer: ({ record }) => (
          <OperationRecord modalContentType="tabs" tableOtherParams={{sourceFrom: 'errSumId'}} recordName="看板消息" tablePk={record.get('errSumId')} tableUrl={`/smnd/v1/monitor-opr-recs/${record.get('errSumId')}`} />
        ),
      },
    ],
    [detailKey, navigationKey]
  );

  // 异常明细
  const columnsDetails = useMemo(
    () => [
      detailKey === 'all' && {
        name: 'processStatusMeaning',
        renderer: ({ value, record }) => {
          const status = record ? record.get('processStatus') : '';
          return <span>{tagRender(status, value)}</span>;
        },
      },
      {
        name: 'msgCode',
        width: 180,
      },
      {
        name: 'errorMessage',
        width: 180,
      },
      {
        name: 'documentCode',
        width: 150,
      },
      {
        name: 'callName',
        width: 180,
      },
      {
        name: 'tenantName',
        width: 180,
      },
      {
        name: 'errorTimes',
      },
      {
        name: 'issueLevelMeaning',
        renderer: ({ record, value }) => priorityRender(record.get('issueLevel'), value),
      },
      {
        name: 'issueModuleMeaning',
      },
      navigationKey === 'comprehensive' && {
        name: 'issueRoleFollow',
        width: 100,
      },
      {
        name: 'issueSolution',
      },
      {
        name: 'sourceFromMeaning',
      },
      {
        name: 'traceId',
        width: 120,
      },
      {
        name: 'callKey',
        width: 150,
      },
      {
        name: 'issueNum',
      },
      {
        name: 'lastUpdateDate',
        width: 150,
      },
      {
        header: intl
          .get('sitf.abnormalCallMonitoring.model.abnormalCallMonitoring.record')
          .d('操作记录'),
        width: 100,
        align: 'center',
        renderer: ({ record }) => (
          <OperationRecord modalContentType="tabs" tableOtherParams={{sourceFrom: 'errDataId'}} recordName="看板消息" tablePk={record.get('errDataId')} tableUrl={`/smnd/v1/monitor-opr-recs/${record.get('errDataId')}`} />
        ),
      },
    ],
    [detailKey, navigationKey]
  );

  const renderSunList = useMemo(() => {
    return [
      {
        key: 'pending',
        node: intl.get(`sitf.abnormalCallMonitoring.view.tabPane.pending`).d('待处理'),
        parentKey: tabKey,
        num: summaryCount.processingNum,
      },
      {
        key: 'processed',
        node: intl.get(`sitf.abnormalCallMonitoring.view.tabPane.processed`).d('已处理'),
        parentKey: tabKey,
        num: summaryCount.processedNum,
      },
      {
        key: 'ignore',
        node: intl.get(`sitf.abnormalCallMonitoring.view.tabPane.ignore`).d('已忽略'),
        parentKey: tabKey,
        num: summaryCount.ignoredNum,
      },
      {
        key: 'all',
        node: intl.get(`sitf.abnormalCallMonitoring.view.tabPane.all`).d('全部'),
        parentKey: tabKey,
        num: summaryCount.sumNum,
      },
    ];
  }, [tabKey, summaryCount]);

  const setDefaultValue = useCallback(() => {
    const currentDate = new Date();
    const otherDate = moment(currentDate).format(DATETIME_MAX);
    const threeDateBefore = moment(new Date(currentDate.setDate(currentDate.getDate() - 3))).format(
      DATETIME_MIN
    );
    if (filterBarRef && filterBarRef.current) {
      filterBarRef.current.setField('lastUpdateDateRange', '3D');
      filterBarRef.current.setField('lastUpdateDateFrom', threeDateBefore);
      filterBarRef.current.setField('lastUpdateDateTo', otherDate);
    }
  }, []);

  // const handleChangeSelect = data => {
  //   let currentValue = '';
  //   switch (data) {
  //     case 'msgCode':
  //       currentValue = '消息编码';
  //       break;
  //     case 'msgDesc':
  //       currentValue = '消息描述';
  //       break;
  //     default:
  //       currentValue = '异常编号';
  //       break;
  //   }
  //   setLeftRender({ value: currentValue, name: data });
  // };

  // // 筛选器右侧自定义内容
  // const leftRender = dataDs => {
  //   return (
  //     <Fragment>
  //       <Select
  //         value={leftRenderSelect.value}
  //         onChange={handleChangeSelect}
  //         style={{ width: '100px' }}
  //       >
  //         <Option value="sumNum">
  //           <span>{intl.get(`sitf.abnormalCallMonitoring.model.sumNum`).d('异常编号')}</span>
  //         </Option>
  //         <Option value="msgCode">
  //           <span>{intl.get(`sitf.abnormalCallMonitoring.model.msgCode`).d('消息编码')}</span>
  //         </Option>
  //         <Option value="msgDesc">
  //           <span>{intl.get(`sitf.abnormalCallMonitoring.model.msgDesc`).d('消息描述')}</span>
  //         </Option>
  //       </Select>

  //       <TextField
  //         dataSet={dataDs}
  //         name={leftRenderSelect.name}
  //         valueChangeAction="blur"
  //         style={{ width: 300 }}
  //         prefix={<Icon type="search" />}
  //         placeholder={intl
  //           .get('sitf.abnormalCallMonitoring.model.common.commonMultiSearchRFX', {
  //             categoryCode: leftRenderSelect.value,
  //           })
  //           .d('请输入{categoryCode}查询')}
  //         clearButton
  //       />
  //     </Fragment>
  //   );
  // };

  // 筛选器和表格渲染
  const renderTableContent = () => {
    return (
      <div className="doubleTableStyleSITF">
        <DoubleTabs
          disableActiveFirst
          activeKeys={[tabKey, detailKey]}
          onTabChange={(_, keys) => {
            setTabKey(keys[0]);
            if (!isArray(keys[1]) && !isEmpty(keys[1])) {
              setDetailKey(keys[1]);
            }
          }}
          parentList={[
            {
              node: intl.get('sitf.abnormalCallMonitoring.tab.title.summary').d('异常汇总'),
              key: 'summary',
            },
            {
              node: intl.get('sitf.abnormalCallMonitoring.tab.title.detail').d('异常明细'),
              key: 'detail',
            },
          ]}
          subList={renderSunList}
        />
        <div style={{ height: 'calc(100vh - 241px)' }}>
          <FilterBarTable
            key={currentKey}
            dataSet={
              tabKey === 'summary'
                ? sourceSummaryDataDs[currentKey]
                : sourceDetailsDataDs[currentKey]
            }
            cacheState
            // virtual
            // autoHeight={{
            //   type: 'maxHeight',
            //   diff: 0,
            // }}
            style={{ maxHeight: 'calc(100vh - 245px)' }}
            border={false}
            filterBarRef={ref => {
              filterBarRef.current = ref;
            }}
            filterBarConfig={{
              cacheKey: currentKey,
              expandable: true,
              autoQuery: false,
              defaultExpand: false,
              onFieldChange: ({ record, name, value }) => {
                const currentDate = new Date();
                const otherDate = moment(currentDate).format(DATETIME_MAX);
                if (name === 'lastUpdateDateRange') {
                  if (value) {
                    if (value === '3D') {
                      const threeDate = moment(
                        new Date(currentDate.setDate(currentDate.getDate() - 3))
                      ).format(DATETIME_MIN);
                      record.set({ lastUpdateDateFrom: threeDate, lastUpdateDateTo: otherDate });
                    } else if (value === '1W') {
                      const threeDate = moment(
                        new Date(currentDate.setDate(currentDate.getDate() - 7))
                      ).format(DATETIME_MIN);
                      record.set({ lastUpdateDateFrom: threeDate, lastUpdateDateTo: otherDate });
                    } else {
                      record.set({ lastUpdateDateFrom: undefined, lastUpdateDateTo: undefined });
                    }
                  } else {
                    record.set({ lastUpdateDateFrom: undefined, lastUpdateDateTo: undefined });
                  }
                }
              },

              onClear: setDefaultValue,

              // left: {
              //   render: leftRender,
              // },
            }}
            columns={tabKey === 'summary' ? columnsSummary : columnsDetails}
          />
        </div>
      </div>
    );
  };

  // 变更状态 - 内部表单
  const FormRender = observer(({ dataSetForm }) => {
    const processStatus = dataSetForm.current.get('processStatus');
    return (
      <Form dataSet={dataSetForm} labelLayout="float">
        <Select name="processStatus" />
        <Lov name="processedBy" />
        <DateTimePicker name="processDate" />
        {processStatus === 'PROCESSED' && <TextArea name="issueSolution" />}
        {processStatus === 'IGNORED' && <TextArea name="supplReason" />}
      </Form>
    );
  });

  // 变更状态
  const handleChangeStatus = useCallback(
    data => {
      const changeStatusDataDs = new DataSet(changeStatusData());
      Modal.open({
        title: intl.get('sitf.abnormalCallMonitoring.view.btn.change.status').d('变更状态'),
        closable: true,
        drawer: true,
        children: <FormRender dataSetForm={changeStatusDataDs} />,
        onOk: async () => {
          let falg = false;
          const validateFlag = await changeStatusDataDs.validate();
          if (validateFlag) {
            const selectedData = data.map(item => item.data);
            const currentData = selectedData.map(item => ({
              ...item,
              ...changeStatusDataDs.current.toJSONData(),
            }));
            const response = await fetchChangeStatus(currentData, tabKey);
            if (getResponse(response)) {
              notification.success();
              falg = true;
              if (tabKey === 'summary') {
                sourceSummaryDataDs[currentKey].query();
              } else {
                sourceDetailsDataDs[currentKey].query();
              }

              fetchCount(tabKey, navigationKey);
            }
          } else {
            notification.warning({
              message: intl.get('sitf.abnormalCallMonitoring.view.message.required').d('请填写必填项'),
            });
          }
          return falg;
        },
      });
    },
    [tabKey]
  );

  // 头部按钮 导出、变更状态
  const Buttons = observer(({ dataSet }) => {
    const selectedData = dataSet?.selected || [];
    const primaryKeyIds =
      tabKey === 'summary'
        ? selectedData.map(item => item.get('errSumId'))
        : selectedData.map(item => item.get('errDataId'));
    return (
      <>
        <Button
          icon="change_circle-o"
          color="primary"
          disabled={isEmpty(selectedData)}
          onClick={() => handleChangeStatus(selectedData)}
        >
          {intl.get('sitf.abnormalCallMonitoring.view.btn.change.status').d('变更状态')}
        </Button>
        <ExcelExportPro
          requestUrl={tabKey === 'summary' ? exportSummaryUrl : exportDetailUrl}
          queryParams={{
            ...filterNullValueObject(dataSet?.queryDataSet?.current?.toData()),
            primaryKeyIds,
          }}
          otherButtonProps={{ funcType: 'flat' }}
          method="POST"
          allBody
        />
      </>
    );
  });

  return (
    <Fragment>
      <Header
        title={intl
          .get('sitf.abnormalCallMonitoring.title.abnormalCallMonitoring')
          .d('异常调用记录监控看板')}
      >
        <Buttons
          dataSet={
            tabKey === 'summary' ? sourceSummaryDataDs[currentKey] : sourceDetailsDataDs[currentKey]
          }
        />
      </Header>
      <Content className={Style.contentSITF}>
        <Tabs
          defaultActiveKey="comprehensive"
          tabPosition="left"
          onChange={key => {
            setNavigationKey(key);
          }}
        >
          <TabPane
            tab={intl.get('sitf.abnormalCallMonitoring.view.redio.comprehensive').d('综合统计')}
            key="comprehensive"
          >
            {renderTableContent()}
          </TabPane>
          <TabPane
            tab={intl.get('sitf.abnormalCallMonitoring.view.redio.maintenance').d('运维关注')}
            key="maintenance"
          >
            {renderTableContent()}
          </TabPane>
          <TabPane
            tab={intl.get('sitf.abnormalCallMonitoring.view.redio.technology').d('技术关注')}
            key="technology"
          >
            {renderTableContent()}
          </TabPane>
          <TabPane
            tab={intl.get('sitf.abnormalCallMonitoring.view.redio.product').d('产品关注')}
            key="product"
          >
            {renderTableContent()}
          </TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default formatterCollections({ code: ['sitf.abnormalCallMonitoring', 'hzero.common'] })(
  AbnormalCallMonitoring
);
