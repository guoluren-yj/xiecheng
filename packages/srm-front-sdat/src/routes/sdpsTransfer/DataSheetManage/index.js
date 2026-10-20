/* eslint-disable no-unused-expressions */
/**
 * 数据表管理页面 平台级
 * @author qingxiang.luo@going-link.com
 * @date 2022-03-07
 */
import React, { useState, useEffect } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Header } from 'components/Page';
import { DataSet, Button, Tooltip, Modal } from 'choerodon-ui/pro';
import { Tabs, notification, Icon } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import { refreshTab } from 'utils/menuTab';

import { SRM_DATA_SDAT } from '@/utils/config';
import LeftMenu from '@/components/LeftMenuPanel';
import {
  fetchCollection,
  getCollecStatus,
  getMetaConfig,
  fetchSaveConfig,
  fetchLovConfig,
} from '@/services/sdpsTransfer/dataSheetService';

import NoneSvg from '@/assets/none.svg';

import { SubscribeFormDS, LovDS, TentantLovDS, AddTopicDS, TopicLovDS } from './stores/dataSheetDS';
import {
  MetadataDS,
  ColumnPropDS,
  TenantSubscripDS,
  StandarDS,
  StandarPlatFormDS,
  SubHistoryDS,
  LovListDS,
  IdpLovTableDS,
} from './stores/commonDS';

import OrgSubscribForm from './OrgSubscribForm';
import DateSheetForm from './DateSheetForm';
import TopicModal from './TopicModal';
import LeftMenuClassify from './LeftMenuClassify';
import './index.less';

const { TabPane } = Tabs;

let collectStatus = 1; // 1 采集完成, 0 true 正在执行， 2 失败
let timer = null; // 计时器
let syncData = {};
let count = 0;

let setOpen = null;
let handleInitTenants = null;
let handleInitMenu = null;
let topicNumCache = '';

let lovCodeCache = {};

const DataSheetManage = props => {
  const {
    subscribeFormDS,
    lovDS,
    tentantLovDS,
    formDS,
    columnPropDS,
    tenantSubscriDS,
    formTDS,
    standarDS,
    columnTPropDS,
    standarPlatFormDS,
    subHistoryDS,
    addTopicDS,
    topicLovDS,
    lovListDS,
    idpLovTableDS,
  } = props;

  const [activeKey, setActiveKey] = useState('1');
  const [selectedItem, setSelected] = useState({});
  const [tenantItem, setTenant] = useState({});
  const [visible, setVisible] = useState(false);
  const [showTopicModal, setShow] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    // 监听列属性表的加载事件，查询赋值字段值集项
    columnPropDS.addEventListener('load', handleListener);
    return () => {
      columnPropDS.removeEventListener('load', handleListener);
      lovCodeCache = {};
    };
  }, []);

  useEffect(() => {
    // 查询执行状态，如果是采集中状态，进行轮询，采集完成状态不受影响
    getSyncStatus();
    return () => {
      clearTimeout(timer);
      timer = null;
      count = 0;
      setOpen = null;
      handleInitTenants = null;
      handleInitMenu = null;
      topicNumCache = '';
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(!refresh);
    }
  }, [refresh]);

  // 监听函数
  const handleListener = () => {
    columnPropDS.forEach(record => {
      const { lovId = undefined } = record?.get(['lovType', 'lovId']);
      if (!lovId) return;
      // LovCode存在则访问接口
      // 先检查是否已经缓存
      if (lovCodeCache[lovId]) {
        if ((lovCodeCache[lovId]?.numberOfElements ?? 0) > 1) {
          record?.setState('fieldLovNum', 'multiple');
        } else if ((lovCodeCache[lovId]?.numberOfElements ?? 0) === 1) {
          record?.setState('fieldLovNum', 'single');
          record?.setState('lovMessage', lovCodeCache[lovId]?.content[0] ?? {});
        } else if (lovCodeCache[lovId]?.numberOfElements === 0) {
          record?.setState('fieldLovNum', 'zero');
        }
        return;
      }
      // 如果没有则查询，同时缓存起来
      fetchLovConfig({ lovId }).then(resObj => {
        // 处理一下content数组
        const { content = [] } = resObj || {};
        const filterContent = content?.filter(i => i.enabledFlag === 1) || [];
        const res = { ...resObj, content: filterContent, numberOfElements: filterContent.length };
        lovCodeCache[lovId] = res;
        if ((res?.numberOfElements ?? 0) > 1) {
          record?.setState('fieldLovNum', 'multiple');
        } else if ((res?.numberOfElements ?? 0) === 1) {
          record?.setState('fieldLovNum', 'single');
          record?.setState('lovMessage', res?.content[0] ?? {});
        } else if (res?.numberOfElements === 0) {
          record?.setState('fieldLovNum', 'zero');
        }
      });
    });
  };

  const handleRefresh = () => {
    refreshTab('/sdps/data-sheet-manage');
  };

  /**
   * 查询采集状态
   */
  const getSyncStatus = () => {
    clearTimeout(timer);
    timer = null;
    getCollecStatus().then(res => {
      if (getResponse(res)) {
        collectStatus = res?.status ?? 1;
        syncData = res;

        if (collectStatus === 0 || collectStatus === '0') {
          // true 正在执行，进行轮询
          if (count <= 0) {
            setVisible(true);
          }

          count++;
          timer = setTimeout(() => {
            getSyncStatus();
          }, 5000);
        } else {
          if (count > 0) {
            openSuccessNotification(res);
            count = 0;
            setVisible(false);
          }
          clearTimeout(timer);
          timer = null;
        }
      } else {
        clearTimeout(timer);
        timer = null;
      }
      setRefresh(true);
    });
  };

  const openSuccessNotification = (res = {}) => {
    count = 0;
    const modalKey = `open${Date.now()}`;
    notification.open({
      message: intl.get('sdps.dataSheet.view.message.collecSuccess').d('采集成功'),
      description: (
        <span>
          {res?.syncNumber ?? ''}
          {intl.get('sdps.dataSheet.view.message.successLeft').d('条数据已经完成采集，请')}
          <a onClick={handleRefresh}>{intl.get('hzero.common.button.refresh').d('刷新')}</a>
          {intl.get('sdps.dataSheet.view.message.successRight').d('页面')}
        </span>
      ),
      key: modalKey,
    });
  };

  /**
   * 执行数据采集
   */
  const handleCollection = () => {
    Modal.confirm({
      title: intl.get('sdps.dataSheet.view.message.confimCollect').d('是否确认进行数据采集'),
      children: <></>,
    }).then(async button => {
      if (button === 'ok') {
        fetchCollection().then(res => {
          if (getResponse(res)) {
            collectStatus = 0;
            setRefresh(true); // 刷新页面
            // 执行采集 接口响应成功，查询同步状态，进行轮询
            getSyncStatus();
          }
        });
      }
    });
  };

  const handleChangeTab = key => {
    setActiveKey(key);
    subscribeFormDS.queryDataSet.data = [];
    if (key === '1' && handleInitMenu) {
      setSelected({});
      handleInitMenu();
    }

    if (key === '2' && handleInitTenants) {
      setTenant({});
      handleInitTenants();
    }
  };

  const handleSelectItem = (item = {}) => {
    setSelected(item);
  };

  const handleSelectOrg = (item = {}) => {
    setTenant(item);
  };

  /**
   * 采集中状态点击
   */
  const handleCollecting = () => {
    if (collectStatus === 0 || collectStatus === '0') {
      // 正在执行
      setVisible(true);
    }
  };

  /**
   * menu 列表操作事件
   * @param {*} type 操作类型
   * @param {*} id 主键id
   */
  const handeOperate = (type = '', item) => {
    if (['add', 'change'].includes(type)) {
      setShow(true);
    } else {
      // 移除操作
      Modal.confirm({
        title: intl
          .get('sdps.dataSheet.view.message.confimRemove')
          .d('请确认是否移除当前数据的主题'),
        children: <></>,
      }).then(async button => {
        if (button === 'ok') {
          // 执行移除主题操作
          const { tableName, metaId } = item;
          if (metaId) {
            const res = await getMetaConfig({ metaId });
            if (getResponse(res) && res) {
              delete res?.topicNum;
              delete res?.topicName;
              fetchSaveConfig({
                ...res,
                sourceTableId: metaId,
              }).then(result => {
                if (
                  result &&
                  result.failed &&
                  result.code === 'sdps.data.collection.is.being.performed.in.the.background'
                ) {
                  setVisible(true);
                  getSyncStatus();
                  return;
                }
                if (getResponse(result)) {
                  if (setOpen) {
                    topicNumCache = 'unattributed';
                    setOpen({ metaId, topicNum: 'unattributed', tableName });
                  }
                }
              });
            }
          }
        }
      });
    }
  };

  const handleAddOrEditTopic = async (item = {}) => {
    const { topicNum } = item; // topicName
    const { tableName, metaId } = selectedItem;
    if (metaId) {
      // const res = await getMetaConfig({ metaId });
      // if (getResponse(res)) {
      //   fetchSaveConfig({
      //     ...res,
      //     sourceTableId: metaId,
      //     topicNum,
      //     topicName,
      //   }).then((result) => {
      //     if (
      //       result.failed &&
      //       result.code === 'sdps.data.collection.is.being.performed.in.the.background'
      //     ) {
      //       setVisible(true);
      //       addTopicDS.query();
      //       return;
      //     }

      //     if (getResponse(result)) {
      //       setShow(false);
      //       if (setOpen) {
      //         setOpen({ metaId, topicNum, tableName });
      //       }
      //     }
      //   });
      // }
      setShow(false);
      if (setOpen) {
        topicNumCache = topicNum;
        setOpen({ metaId, topicNum, tableName });
      }
    }
  };

  const handleOpenPending = () => {
    collectStatus = 0;
    setVisible(true);
    setRefresh(true);
  };

  const topicModalProps = {
    visible: showTopicModal,
    lovDS: addTopicDS,
    onSelect: handleAddOrEditTopic,
    selectedItem,
    openPending: handleOpenPending,
    fetchSyncStatus: getSyncStatus,
    onCancel: () => {
      setShow(false);
    },
  };

  const refreshMenuList = () => {
    if (handleInitMenu) {
      handleInitMenu();
    }

    if (setOpen) {
      const { tableName, metaId } = selectedItem;
      setOpen({ metaId, topicNum: topicNumCache, tableName });
    }
  };

  return (
    <>
      <Header title={intl.get('sdps.dataSheet.view.title.dataSheetManage').d('数据表管理')}>
        {(collectStatus === '1' || collectStatus === 1) && (
          <Tooltip
            placement="bottomRight"
            title={`${intl
              .get('sdps.dataSheet.view.message.lastCollecTime')
              .d('最近采集时间')}: ${syncData?.syncTime ?? ''}`}
          >
            <Button color="primary" icon="downloading" onClick={handleCollection}>
              {intl.get('sdps.dataSheet.view.button.dataCollection').d('数据采集')}
            </Button>
          </Tooltip>
        )}
        {(collectStatus === '2' || collectStatus === 2) && (
          <Tooltip
            theme="light"
            placement="bottomRight"
            title={
              <span style={{ color: 'red' }}>
                {`${intl
                  .get('sdps.dataSheet.view.message.collecFieldTime')
                  .d('采集失败时间')}: ${syncData?.syncTime ?? ''}`}
              </span>
            }
          >
            <Button color="primary" icon="downloading" onClick={handleCollection}>
              {intl.get('sdps.dataSheet.view.button.dataCollection').d('数据采集')}
            </Button>
          </Tooltip>
        )}
        {(collectStatus === 0 || collectStatus === '0') && (
          <Button
            color="primary"
            icon="downloading"
            onClick={handleCollecting}
            style={{ background: '#1e3255', opacity: '0.8' }}
          >
            {intl.get('sdps.dataSheet.view.button.collecting').d('数据采集中')}
          </Button>
        )}
      </Header>
      <div className="datasheet-page-content">
        <div className="datasheet-left-panel">
          <Tabs animated={false} activeKey={activeKey} onChange={handleChangeTab}>
            <TabPane tab={intl.get('sdps.dataSheet.view.title.dataTable').d('数据表')} key="1">
              <LeftMenuClassify
                key="tables"
                isCanEdit
                placeholder={intl
                  .get('sdps.dataSheet.view.title.tablePlaceHolder')
                  .d('请输入数据表编码、名称查询')}
                nodataMsg={intl.get('sdps.dataSheet.view.message.noData').d('当前主题下暂无数据')}
                fetchUrl={`${SRM_DATA_SDAT}/v1/data-table-manages/all-topic`}
                fetchTabsUrl={`${SRM_DATA_SDAT}/v1/meta-table/meta-tables`}
                onSelect={handleSelectItem}
                onOperate={handeOperate}
                onInit={fun => {
                  handleInitMenu = fun;
                }}
                onRef={fun => {
                  setOpen = fun;
                }}
              />
            </TabPane>
            <TabPane tab={intl.get('sdps.dataSheet.view.title.tenantTab').d('租户')} key="2">
              <LeftMenu
                key="tenants"
                placeholder={intl
                  .get('sdps.dataSheet.view.title.tenantPlaceHolder')
                  .d('请输入租户编码、名称查询')}
                fetchUrl={`${SRM_DATA_SDAT}/v1/data-table-manages/tenant-list`}
                onSelect={handleSelectOrg}
                config={{
                  itemName: 'tenantNum',
                  itemTitle: 'tenantName',
                  itemKey: 'tenantId',
                  searchField: 'searchTerm',
                }}
                onInit={fun => {
                  handleInitTenants = fun;
                }}
              />
            </TabPane>
          </Tabs>
        </div>
        <div className="datasheet-right-box">
          <div className="datasheet-right-center">
            {activeKey === '1' ? (
              <>
                {selectedItem && selectedItem.metaId ? (
                  <DateSheetForm
                    localRecord={selectedItem}
                    lovDS={tentantLovDS}
                    formDS={formDS}
                    standarDS={standarPlatFormDS}
                    columnPropDS={columnPropDS}
                    subHistoryDS={subHistoryDS}
                    tenantSubscriDS={tenantSubscriDS}
                    lovListDS={lovListDS}
                    idpLovTableDS={idpLovTableDS}
                    openPending={handleOpenPending}
                    fetchSyncStatus={getSyncStatus}
                    refreshMenuList={refreshMenuList}
                  />
                ) : (
                  <div
                    style={{
                      height: 'calc(100vh - 214px)',
                      width: 'calc(100vw - 514px)',
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
              </>
            ) : (
              <OrgSubscribForm
                dataSet={subscribeFormDS}
                lovDS={lovDS}
                localRecord={tenantItem}
                formDS={formTDS}
                columnPropDS={columnTPropDS}
                standarDS={standarDS}
                topicLovDS={topicLovDS}
                openPending={handleOpenPending}
                fetchSyncStatus={getSyncStatus}
              />
            )}
          </div>
        </div>
      </div>

      {showTopicModal && <TopicModal {...topicModalProps} />}

      {visible && (
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
            <Button size="small" onClick={() => setVisible(false)}>
              {intl.get('sdps.dataSheet.view.button.gotIt').d('知道了')}
            </Button>
          </p>
        </Modal>
      )}
    </>
  );
};

export default connect(({ dataSheetManage }) => ({
  dataSheetManage,
}))(
  formatterCollections({
    code: ['sdps.dataSheet', 'sdps.dataDictionary', 'srm.filterBar', 'sdps.common'],
  })(
    withProps(
      () => {
        const subscribeFormDS = new DataSet(SubscribeFormDS());
        const lovDS = new DataSet(LovDS());
        const tentantLovDS = new DataSet(TentantLovDS());
        const standarPlatFormDS = new DataSet({ ...StandarPlatFormDS() });

        const formDS = new DataSet({ ...MetadataDS() });
        const columnPropDS = new DataSet({ ...ColumnPropDS() });
        const tenantSubscriDS = new DataSet({ ...TenantSubscripDS() });

        const formTDS = new DataSet({ ...MetadataDS() });
        const standarDS = new DataSet({ ...StandarDS() });
        const columnTPropDS = new DataSet({ ...ColumnPropDS() });

        const subHistoryDS = new DataSet({ ...SubHistoryDS() });
        const addTopicDS = new DataSet({ ...AddTopicDS() });

        const topicLovDS = new DataSet({ ...TopicLovDS() });

        const lovListDS = new DataSet({ ...LovListDS() });
        const idpLovTableDS = new DataSet({ ...IdpLovTableDS() });

        return {
          subscribeFormDS,
          lovDS,
          tentantLovDS,

          formDS,
          columnPropDS,
          tenantSubscriDS,
          standarPlatFormDS,

          formTDS,
          standarDS,
          columnTPropDS,

          subHistoryDS,
          addTopicDS,
          topicLovDS,

          lovListDS,
          idpLovTableDS,
        };
      },
      { cacheState: true, keepOriginDataSet: true }
    )(DataSheetManage)
  )
);
