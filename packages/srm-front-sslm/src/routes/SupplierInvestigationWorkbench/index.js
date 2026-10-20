/*
 * SupplierInvestigationWorkbench - 供应商调查表工作台
 * @date: 2022/11/16 15:12:06
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Fragment, useMemo, useState, useEffect, useCallback } from 'react';
import { DataSet, Tabs, Spin, Tooltip, Button } from 'choerodon-ui/pro';
import { compose, isEmpty } from 'lodash';
import querystring from 'querystring';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { routerRedux } from 'dva/router';
import { getResponse } from 'utils/utils';
import { renderStatus, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';

import MultipleTextField from '@/routes/components/MultipleTextField';
import { getAgreementModal } from '@/routes/components/PrivacyAgreement';
import { handleQueryCount } from '@/services/supplierInvestWorkbenchService';
import { indexDS } from './stores/indexDS';
import { getTabs } from './utils';
import styles from './index.less';

const { TabPane } = Tabs;

const Index = ({
  customizeTabPane,
  customizeTable,
  toFilledTableDs,
  allTableDs,
  custLoading,
  dispatch,
  mixtureObj = {},
}) => {
  const [currentTabKey, setCurrentTabKey] = useState(mixtureObj.activeKey);
  const [count, setCount] = useState({});
  const tabs = useMemo(() => getTabs(), []);
  const [loading, setLoading] = useState(false);
  const [pageCacheState, setPageCacheState] = useState({
    toFilledCache: true,
    allCache: true,
  });

  const { toFilledCache, allCache } = pageCacheState;

  // 查询列表数据
  const queryList = useCallback((newActiveKey) => {
    const activeKey = newActiveKey || currentTabKey;
    switch (activeKey) {
      case 'toFilled':
        toFilledTableDs.setQueryParameter('write', true);
        setLoading(true);
        toFilledTableDs.query(toFilledTableDs.currentPage).finally(() => setLoading(false));
        break;
      default:
        allTableDs.setQueryParameter('write', null);
        allTableDs.query(allTableDs.currentPage).finally(() => setLoading(false));
        break;
    }
  }, []);

  // 切换tab
  const handleTabChange = useCallback(
    (key) => {
      setCurrentTabKey(key);
      // eslint-disable-next-line no-param-reassign
      mixtureObj.activeKey = key;
    },
    [currentTabKey]
  );

  /**
   * 跳转详情页
   */
  const handleJumpDetail = useCallback((record, editStatus) => {
    const {
      data: { tenantNum, investgHeaderId, investigateTemplateId, tenantId, triggerByCode },
    } = record;

    const search = querystring.stringify({
      investigateTemplateId,
      organizationId: tenantId,
      editStatus,
      triggerByCode,
      tenantNum,
    });
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supplier-investigation-workbench/detail/${investgHeaderId}`,
        search,
      })
    );
  }, []);

  // 处理隐私协议并跳转
  const handlePrivacyAgreement = useCallback((record, editStatus) => {
    const triggerByCode = record.get('triggerByCode');
    if (editStatus === 'edit' && triggerByCode === 'INVITE') {
      getAgreementModal({ record, onAgree: () => handleJumpDetail(record, editStatus) });
    } else {
      handleJumpDetail(record, editStatus);
    }
  }, []);

  const getTabCount = useCallback(() => {
    handleQueryCount().then((res) => {
      if (getResponse(res)) {
        setCount(res);
      }
    });
  }, []);

  const columns = [
    {
      name: 'investgNumber',
      width: 120,
      renderer: ({ value, record }) => {
        const {
          processStatus,
          mergerInvestigateFlag,
          mainInvestigateFlag,
          mainInvestigateNum,
        } = record.get([
          'processStatus',
          'mergerInvestigateFlag',
          'mainInvestigateFlag',
          'mainInvestigateNum',
        ]);
        const isView =
          currentTabKey !== 'toFilled' || !['RELEASE', 'REJECT'].includes(processStatus);
        // 副调查表编码置灰,显示提示(发布和拒绝状态下)
        const subSurveyFormFlag =
          !['CANCEL', 'APPROVE'].includes(processStatus) &&
          mergerInvestigateFlag === 1 &&
          mainInvestigateFlag === 0;
        return isView ? (
          subSurveyFormFlag ? (
            <Tooltip
              title={
                intl
                  .get(`sslm.common.view.investigateWrite.investgNumberTip`)
                  .d('当前调查表为合并调查表中的副调查表，无需填写，只需填写其主调查表') +
                mainInvestigateNum
              }
              placement="top"
            >
              {value}
            </Tooltip>
          ) : (
            <a onClick={() => handlePrivacyAgreement(record, 'view')}>{value}</a>
          )
        ) : subSurveyFormFlag ? (
          <Tooltip
            title={
              intl
                .get(`sslm.common.view.investigateWrite.investgNumberTip`)
                .d('当前调查表为合并调查表中的副调查表，无需填写，只需填写其主调查表') +
              mainInvestigateNum
            }
            placement="top"
          >
            {value}
          </Tooltip>
        ) : (
          <a onClick={() => handlePrivacyAgreement(record, 'edit')}>{value}</a>
        );
      },
    },
    currentTabKey !== 'toFilled' && {
      name: 'action',
      width: 80,
      renderer: ({ record }) => {
        const { processStatus, mergerInvestigateFlag, mainInvestigateFlag } = record.get([
          'processStatus',
          'mergerInvestigateFlag',
          'mainInvestigateFlag',
        ]);
        // 副调查表不可填写
        const subSurveyFormFlag =
          !['CANCEL', 'APPROVE'].includes(processStatus) &&
          mergerInvestigateFlag === 1 &&
          mainInvestigateFlag === 0;
        return ['RELEASE', 'REJECT'].includes(processStatus) && !subSurveyFormFlag ? (
          <span className={styles['action-links']}>
            <Button funcType="link" onClick={() => handlePrivacyAgreement(record, 'edit')}>
              {intl.get('sslm.common.button.write').d('填写')}
            </Button>
          </span>
        ) : null;
      },
    },
    {
      name: 'processStatusMeaning',
      width: 100,
      renderer: renderStatus,
    },
    {
      name: 'companyNum',
      width: 120,
    },
    {
      name: 'companyName',
      width: 190,
    },
    {
      name: 'partnerCompanyNum',
      width: 120,
    },
    {
      name: 'partnerCompanyName',
      width: 190,
    },
    {
      name: 'investigateTypeMeaning',
      width: 120,
    },
    {
      name: 'investigateLevelMeaning',
      width: 120,
    },
    {
      name: 'templateName',
      width: 120,
    },
    {
      name: 'realName',
      width: 120,
    },
    {
      name: 'releaseDate',
      width: 140,
    },
    {
      name: 'creationDate',
      width: 140,
    },
  ].filter(Boolean);

  useEffect(() => {
    queryList();
    getTabCount();
  }, []);

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback(
    (queryDataSet) => {
      return (
        <MultipleTextField
          name="investgNumber"
          dataSet={queryDataSet}
          placeholder={intl
            .get('sslm.supplierInvestWorkbench.view.message.investiagteCode')
            .d('请输入调查表编号查询')}
        />
      );
    },
    [currentTabKey]
  );

  // 查询
  const handleQuery = useCallback(
    (queryProps) => {
      const dataSet = currentTabKey === 'toFilled' ? toFilledTableDs : allTableDs;
      const cacheFlag = currentTabKey === 'toFilled' ? toFilledCache : allCache;
      const { params } = queryProps;
      if (dataSet.queryDataSet?.current) {
        const clearParams = {}; // 清理
        const dataObj = dataSet.queryDataSet.current.toData();
        if (dataObj) {
          for (const key in dataObj) {
            if (!['investgNumber'].includes(key)) {
              // 排除掉自定义的查询条件
              if (!Object.prototype.hasOwnProperty.call(params, key)) {
                clearParams[key] = undefined;
              }
            }
          }
        }
        // 处理多单号
        const reqList = params.investgNumber;
        clearParams.investgNumber = isEmpty(reqList) ? null : reqList.join(',');
        dataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        });
        if (cacheFlag) {
          dataSet.query(dataSet.currentPage);
        } else {
          dataSet.query();
        }
      } else {
        dataSet.query(dataSet.currentPage);
      }
    },
    [currentTabKey, toFilledCache, allCache]
  );

  // 清空、重置回调
  const clearValues = useCallback(() => {
    const dataSet = currentTabKey === 'toFilled' ? toFilledTableDs : allTableDs;
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
  }, [currentTabKey]);

  return (
    <Fragment>
      <Header
        title={intl
          .get('sslm.supplierInvestWorkbench.view.title.supplierInvestigationWorkbench')
          .d('供应商调查表工作台')}
      />
      <Content>
        <Spin spinning={loading}>
          {customizeTabPane(
            {
              code: 'SSLM.SUPPLIER_INVEST_WORKBENCH_LIST.TABPANE',
            },
            <Tabs
              activeKey={currentTabKey}
              onChange={(newActiveKey) => {
                handleTabChange(newActiveKey);
                queryList(newActiveKey);
                getTabCount();
              }}
            >
              {tabs.map(({ key, tab, searchBarCode, countCode }) => {
                const tabTotal =
                  count[countCode] && count[countCode] > 99 ? '99+' : count[countCode] || '';
                return (
                  <TabPane tab={`${tab} ${tabTotal}`} key={key}>
                    <div style={{ height: tableHeight.hasTab }}>
                      {customizeTable(
                        {
                          code: 'SSLM.SUPPLIER_INVEST_WORKBENCH_LIST.TABLE_LIST',
                        },
                        <SearchBarTable
                          cacheState
                          dataSet={currentTabKey === 'toFilled' ? toFilledTableDs : allTableDs}
                          columns={columns}
                          custLoading={custLoading}
                          searchCode={searchBarCode}
                          style={{
                            maxHeight: tableMaxHeight.hasTab,
                          }}
                          searchBarConfig={{
                            editorProps: {
                              processStatus: {
                                optionsFilter: (record) => {
                                  if (currentTabKey === 'toFilled') {
                                    return ['RELEASE', 'REJECT'].includes(record.get('value'));
                                  } else {
                                    return !['NEW'].includes(record.get('value'));
                                  }
                                },
                              },
                            },
                            left: {
                              render: (_, queryDataSet) => renderLeftSearchBar(queryDataSet),
                            },
                            onQuery: (queryProps) => handleQuery(queryProps),
                            onReset: () => clearValues(),
                            onClear: () => clearValues(),
                            onFieldChange: () => {
                              setPageCacheState((prevState) => {
                                let newState = {};
                                if (currentTabKey === 'toFilled') {
                                  newState = {
                                    toFilledCache: false,
                                  };
                                } else {
                                  newState = {
                                    allCache: false,
                                  };
                                }
                                return {
                                  ...prevState,
                                  ...newState,
                                };
                              });
                            },
                          }}
                        />
                      )}
                    </div>
                  </TabPane>
                );
              })}
            </Tabs>
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.supplierInvestWorkbench', 'sslm.common'],
  }),
  withCustomize({
    unitCode: [
      'SSLM.SUPPLIER_INVEST_WORKBENCH_LIST.TABPANE', // 列表页-标签页
      'SSLM.SUPPLIER_INVEST_WORKBENCH_LIST.TABLE_LIST', // 列表页
      'SSLM.SUPPLIER_INVEST_WORKBENCH_LIST.SEARCH_TOFILLED', // 筛选器(待填写)
      'SSLM.SUPPLIER_INVEST_WORKBENCH_LIST.SEARCH_ALL', // 筛选器(全部)
    ],
  }),
  withProps(
    () => {
      const mixtureObj = {
        activeKey: 'toFilled',
      };
      const toFilledTableDs = new DataSet(indexDS());
      const allTableDs = new DataSet(indexDS());
      return { toFilledTableDs, allTableDs, mixtureObj };
    },
    { cacheState: true }
  )
)(Index);
