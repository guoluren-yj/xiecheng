/* eslint-disable no-unused-expressions */
/**
 * 数据字典页面 租户级
 * @author qingxiang.luo@going-link.com
 * @date 2022-02-10
 */
import React, { useEffect, useState } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import withProps from 'utils/withProps';
import { Header } from 'components/Page';
import intl from 'utils/intl';
// import notification from 'utils/notification';
import { notification as HzeroNotification } from 'hzero-ui';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SRM_DATA_PROCESS } from '_utils/config';
import { DataSet, Form, Output, Button, Modal } from 'choerodon-ui/pro';
import { Tabs, Icon } from 'choerodon-ui';

import { SourceManagerProvider } from './ERFigure/store.tsx';

import {
  fetchOrderStatus,
  getPendingCount,
  getRejectedCount,
  getAllCount,
  getMetaConfig,
  // saveSubscribeTopic,
  fetchLovConfig,
  // fetchLovConfigPlatform,
} from '@/services/dataDictionaryService';

import NoneSvg from '@/assets/none.svg';

import {
  DataFormDS,
  ColumnsAttrDS,
  SubHistoryDS,
  LovDS,
  LovListDS,
  IdpLovTableDS,
} from './stores/dataDictionaryDS';
import LeftMenuClassify from '@/components/LeftMenuClassify';

import './index.less';
import TabsPanel from './TabsPanel';
import TopicSubscriptionModal from './TopicSubscriptionModal';

const organizationId = getCurrentOrganizationId();
const { TabPane } = Tabs;

let lastFilterVal = null;
let setOpen = null;
let refreshSubscr = null;
let refreshReject = null;
let initSubscr = null;
let initPending = null;
let initReject = null;
let pendingCouont = 0;
let allCount = 0;
let rejectCouont = 0;

let lovCodeCache = {};

const DataDictionary = (props) => {
  const { formDS, listDS, subHistoryDS, lovDS, lovListDS, idpLovTableDS } = props;

  const [activeKey, setActiveKey] = useState('1');
  const [selectItem, setItem] = useState(null);
  // const [rejectCouont, setRejectCouont] = useState(0);
  // const [pendingCouont, setPendingCouont] = useState(0);
  // const [allCount, setAllCouont] = useState(0);
  const [openOrder, setOrder] = useState(false);

  const [selectOne, setOne] = useState(null);
  const [selectTwo, setTwo] = useState(null);
  const [selectThree, setThree] = useState(null);

  const [visible, setVisible] = useState(false); // 主题订阅弹窗
  const [showPending, setShowPending] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    // 监听列属性表的加载事件，查询赋值字段值集项
    listDS.addEventListener('load', handleListener);
    return () => {
      listDS.removeEventListener('load', handleListener);
      lovCodeCache = {};
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(!refresh);
    }
  }, [refresh]);

  useEffect(() => {
    handleInit();
    fetchOrderStatus().then((res) => {
      if (getResponse(res)) {
        // 用于查询订单是否开通
        setOrder(true);
      }
    });

    return () => {
      lastFilterVal = null;
      refreshSubscr = null;
      setOpen = null;
      refreshReject = null;
      initSubscr = null;
      initPending = null;
      initReject = null;
      pendingCouont = 0;
      allCount = 0;
      rejectCouont = 0;
    };
  }, []);

  // 监听函数
  const handleListener = () => {
    listDS.forEach((record) => {
      // lovId是平台级的lovId
      // orgLovId是租户级的lovId
      const { orgLovId = undefined } = record?.get(['lovType', 'orgLovId', 'lovId']);
      if (!orgLovId) return;
      // LovCode存在则访问接口
      // 先检查是否已经缓存
      if (lovCodeCache[orgLovId]) {
        if ((lovCodeCache[orgLovId]?.numberOfElements ?? 0) > 1) {
          record?.setState('fieldLovNum', 'multiple');
        } else if ((lovCodeCache[orgLovId]?.numberOfElements ?? 0) === 1) {
          record?.setState('fieldLovNum', 'single');
          record?.setState('lovMessage', lovCodeCache[orgLovId]?.content[0] ?? {});
        } else if (lovCodeCache[orgLovId]?.numberOfElements === 0) {
          record?.setState('fieldLovNum', 'zero');
        }
        return;
      }

      // 如果没有则查询，同时缓存起来
      fetchLovConfig({ lovId: orgLovId }).then((resObj) => {
        // 处理一下content数组
        const { content = [] } = resObj || {};
        const filterContent = content?.filter((i) => i.enabledFlag === 1) || [];
        const res = { ...resObj, content: filterContent, numberOfElements: filterContent.length };
        lovCodeCache[orgLovId] = res;
        if ((res?.numberOfElements ?? 0) > 1) {
          // lovCodeCache[orgLovId] = res;
          record?.setState('fieldLovNum', 'multiple');
        } else if ((res?.numberOfElements ?? 0) === 1) {
          // lovCodeCache[orgLovId] = res;
          record?.setState('fieldLovNum', 'single');
          record?.setState('lovMessage', res?.content[0] ?? {});
        } else if (res?.numberOfElements === 0) {
          // 如果是零条，则再访问平台级接口
          // fetchLovConfigPlatform({ lovId }).then(platformResObj => {
          //   const { content: platformContent = [] } = platformResObj || {};
          //   const filterPlatformContent = platformContent?.filter(i => i.enabledFlag === 1) || [];
          //   const platformRes = {
          //     ...platformResObj,
          //     content: filterPlatformContent,
          //     numberOfElements: filterPlatformContent.length,
          //   };
          //   lovCodeCache[orgLovId] = platformRes;
          //   if (platformRes?.numberOfElements > 1) {
          //     record?.setState('fieldLovNum', 'multiple');
          //   } else if ((platformRes?.numberOfElements ?? 0) === 1) {
          //     record?.setState('fieldLovNum', 'single');
          //     record?.setState('lovMessage', platformRes?.content[0] ?? {});
          //   } else if (platformRes?.numberOfElements === 0) {
          //     record?.setState('fieldLovNum', 'zero');
          //   }
          // });
          record?.setState('fieldLovNum', 'zero');
        }
      });
    });
  };

  const handleInit = () => {
    getRejectedCount().then((res) => {
      if (getResponse(res)) {
        rejectCouont = res || 0;
        setRefresh(true); // 手动刷新页面
      } else {
        rejectCouont = 0;
      }
    });
    getAllCount().then((res) => {
      if (getResponse(res)) {
        allCount = res || 0;
        setRefresh(true); // 手动刷新页面
      } else {
        allCount = 0;
      }
    });
    getPendingCount().then((res) => {
      if (getResponse(res)) {
        pendingCouont = res || 0;
        setRefresh(true); // 手动刷新页面
      } else {
        pendingCouont = 0;
      }
    });
  };

  const handleSelect = (item = {}, key) => {
    if (key === '1') {
      setOne(item);
    }
    if (key === '2') {
      setTwo(item);
    }
    if (key === '3') {
      setThree(item);
    }

    setItem(item);

    handleQueryFun(item);
  };

  const handleQueryFun = (item) => {
    if (item && item.metaId) {
      formDS.queryParameter = { metaId: item.metaId || '' };
      listDS.queryParameter = {
        metaId: item.metaId || '',
        tableName: item.tableName || '',
      };
      subHistoryDS.queryParameter = {
        sourceTableId: item.metaId || '',
        tenantId: getCurrentOrganizationId(),
        sort: 'submitDate,desc',
      };

      getMetaConfig({ metaId: item.metaId || '' }).then((res) => {
        if (getResponse(res)) {
          lastFilterVal = { ...res };
          if (formDS.current) {
            formDS.current.set('topicName', res.topicName || '');
          }
        }
      });

      formDS.query().then(() => {
        if (formDS.current) {
          formDS.current.set('topicName', lastFilterVal?.topicName ?? '');
          formDS.current.set('dataSourceType', 'MySQL');
        }
      });
      listDS.query();
      subHistoryDS.query();
    } else {
      formDS.data = [];
      subHistoryDS.data = [];
      listDS.data = [];
    }
  };

  const handleChangeTab = (key) => {
    setActiveKey(key);
    handleInit();

    if (key === '1') {
      setItem(selectOne);
      handleQueryFun(selectOne);
      if (initSubscr) {
        initSubscr();
      }
    }
    if (key === '2') {
      setItem(selectTwo);
      handleQueryFun(selectTwo);
      if (initPending) {
        initPending();
      }
    }
    if (key === '3') {
      setItem(selectThree);
      handleQueryFun(selectThree);
      if (initReject) {
        initReject();
      }
    }
  };

  const queryParams = () => {
    return {};
  };

  /**
   * 打开主题订阅弹窗
   */
  const handleOpenSubscriLov = () => {
    if (!openOrder) {
      HzeroNotification.warning({
        message: intl.get('hzero.common.notification.failed').d('操作失败'),
        description: intl
          .get('sdps.dataDictionary.view.message.notOpenOrder')
          .d('您未开通云仓一体服务或服务已过期，请联系管理员。'),
      });
      return;
    }

    setVisible(true);
  };

  /**
   * 添加主题订阅
   * @param {object} params
   * @returns
   */
  const handleChangeLov = (params = []) => {
    if (params.length) {
      setVisible(false);
      handleInit();
      const { metaId = '', topicNum = '', tableName = '' } = selectItem || {};
      if (setOpen) {
        setOpen({ metaId, topicNum, tableName });
      }
      if (refreshSubscr) {
        refreshSubscr({ metaId, topicNum, tableName });
      }
      if (refreshReject) {
        refreshReject({ metaId, topicNum, tableName });
      }
    }
  };

  const handleOpenPending = () => {
    setShowPending(true);
    setRefresh(true);
  };

  const subscrProps = {
    visible,
    lovDS,
    onSelect: handleChangeLov,
    openPending: handleOpenPending,
    onCancel: () => {
      setVisible(false);
    },
  };

  return (
    <SourceManagerProvider>
      <Header title={intl.get('sdps.dataDictionary.view.title.dataDictionary').d('数据字典')}>
        <Button color="primary" icon="" onClick={handleOpenSubscriLov}>
          {intl.get('sdps.dataDictionary.view.title.themeSubscription').d('按主题订阅')}
        </Button>
        <ExcelExportPro
          otherButtonProps={{
            icon: 'unarchive',
            type: 'c7n-pro',
            style: { border: 'none' },
          }}
          defaultSelectAll
          requestUrl={`${SRM_DATA_PROCESS}/v1/${organizationId}/meta-table/table-export`}
          queryParams={queryParams}
          buttonText={intl.get('hzero.common.button.confirm.export').d('导出')}
        />
      </Header>
      <div className="datadict-page-content">
        <div className="datadict-left-panel">
          <Tabs animated={false} activeKey={activeKey} onChange={handleChangeTab}>
            <TabPane
              tab={`${intl
                .get('sdps.dataDictionary.view.title.subscribed')
                .d('已订阅')} ${allCount}`}
              key="1"
            >
              <LeftMenuClassify
                key="tables"
                isCanEdit={false}
                placeholder={intl
                  .get('sdps.dataDictionary.view.search.placeholder')
                  .d('请输入数据表编码、名称查询')}
                nodataMsg={intl.get('sdps.dataSheet.view.message.noData').d('当前主题下暂无数据')}
                fetchUrl={`${SRM_DATA_PROCESS}/v1/${organizationId}/data-table-manages/subscribed-topic-list`}
                fetchTabsUrl={`${SRM_DATA_PROCESS}/v1/${organizationId}/meta-table/subscribe-tables`}
                onSelect={(e) => handleSelect(e, '1')}
                onRef={(fun) => {
                  refreshSubscr = fun;
                }}
                onInit={(fun) => {
                  initSubscr = fun;
                }}
              />
            </TabPane>
            <TabPane
              tab={`${intl
                .get('sdps.dataDictionary.view.title.approvaling')
                .d('审核中')} ${pendingCouont}`}
              key="2"
            >
              <LeftMenuClassify
                key="pending"
                isCanEdit={false}
                placeholder={intl
                  .get('sdps.dataDictionary.view.search.placeholder')
                  .d('请输入数据表编码、名称查询')}
                nodataMsg={intl.get('sdps.dataSheet.view.message.noData').d('当前主题下暂无数据')}
                fetchUrl={`${SRM_DATA_PROCESS}/v1/${organizationId}/data-table-manages/pending-topic-list`}
                fetchTabsUrl={`${SRM_DATA_PROCESS}/v1/${organizationId}/meta-table/pending-tables`}
                onSelect={(e) => handleSelect(e, '2')}
                onRef={(fun) => {
                  setOpen = fun;
                }}
                onInit={(fun) => {
                  initPending = fun;
                }}
              />
            </TabPane>
            <TabPane
              tab={`${intl.get('sdps.dataDictionary.view.title.reject').d('驳回')} ${rejectCouont}`}
              key="3"
            >
              <LeftMenuClassify
                key="reject"
                isCanEdit={false}
                placeholder={intl
                  .get('sdps.dataDictionary.view.search.placeholder')
                  .d('请输入数据表编码、名称查询')}
                nodataMsg={intl.get('sdps.dataSheet.view.message.noData').d('当前主题下暂无数据')}
                fetchUrl={`${SRM_DATA_PROCESS}/v1/${organizationId}/data-table-manages/rejected-topic-list`}
                fetchTabsUrl={`${SRM_DATA_PROCESS}/v1/${organizationId}/meta-table/reject-tables`}
                onSelect={(e) => handleSelect(e, '3')}
                onRef={(fun) => {
                  refreshReject = fun;
                }}
                onInit={(fun) => {
                  initReject = fun;
                }}
              />
            </TabPane>
          </Tabs>
        </div>
        <div className="dictionary-right-box">
          <div className="page-right-center">
            {selectItem && selectItem.metaId ? (
              <>
                <div className="top-form">
                  <div className="card-title">
                    {intl.get('sdps.dataDictionary.view.title.dataDetail').d('数据详情')}
                  </div>
                  <div className="card-form">
                    <Form
                      dataSet={formDS}
                      columns={3}
                      labelLayout="vertical"
                      className="c7n-pro-vertical-form-display"
                    >
                      <Output name="name" />
                      <Output name="description" />
                      <Output name="tableType" />
                      <Output name="schemaName" />
                      <Output name="dataSourceType" />
                      <Output name="charset" />
                      <Output name="topicName" />
                      <Output name="collation" />
                    </Form>
                  </div>
                </div>
                <div className="bottom-table">
                  <TabsPanel
                    localRecord={selectItem}
                    listDS={listDS}
                    subHistoryDS={subHistoryDS}
                    lovListDS={lovListDS}
                    idpLovTableDS={idpLovTableDS}
                  />
                </div>
              </>
            ) : (
              <div
                style={{
                  height: 'calc(100vh - 200px)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={NoneSvg}
                      alt={intl.get('hpay.checkoutCounter.view.img.safetyCode').d('安全码')}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'rgba(0,0,0,0.65)',
                      lineHeight: '22px',
                      marginTop: '16px',
                    }}
                  >
                    {intl
                      .get('sdps.dataSheet.view.message.selectTableItem')
                      .d('请在左侧列表选择一张数据表')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {visible && <TopicSubscriptionModal {...subscrProps} />}

      {showPending && (
        <Modal
          title=""
          style={{ top: `calc(100vh - 180px)`, right: '30px' }}
          visible={visible}
          closable={false}
          footer={null}
          mask={false}
          movable={false}
          className="pending-modal-style"
        >
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            <Icon type="downloading" />
            <span style={{ marginLeft: '8px' }}>
              {intl.get('sdps.dataSheet.view.message.pendingTitle').d('正在后台执行数据采集')}
            </span>
          </span>
          <p style={{ marginTop: '8px' }}>
            {intl
              .get('sdps.dataSheet.view.message.pendingMessage')
              .d('时间可能需要5-10分钟，采集完成后会自动弹出提示，请耐心等待')}
          </p>
          <p style={{ textAlign: 'right' }}>
            <Button size="small" onClick={() => setShowPending(false)}>
              {intl.get('sdps.dataSheet.view.button.gotIt').d('知道了')}
            </Button>
          </p>
        </Modal>
      )}
    </SourceManagerProvider>
  );
};

export default formatterCollections({
  code: ['sdps.dataDictionary', 'srm.filterBar', 'sdps.dataSheet'],
})(
  withProps(
    () => {
      const listDS = new DataSet(ColumnsAttrDS());
      const formDS = new DataSet(DataFormDS());
      const subHistoryDS = new DataSet({ ...SubHistoryDS() });
      const lovDS = new DataSet({ ...LovDS() });
      const lovListDS = new DataSet({ ...LovListDS() });
      const idpLovTableDS = new DataSet({ ...IdpLovTableDS() });
      return { formDS, listDS, subHistoryDS, lovDS, lovListDS, idpLovTableDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(DataDictionary)
);
