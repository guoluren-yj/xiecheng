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
import { DataSet } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { SRM_DATA_SDAT } from '@/utils/config';

import LeftMenu from '@/components/LeftMenuPanel';
import LeftMenuClassify from '@/components/LeftMenuClassify';

import NoneSvg from '@/assets/none.svg';

import { SubscribeFormDS, LovDS, TentantLovDS, AddTopicDS, TopicLovDS } from './stores/dataSheetDS';
import { MetadataDS, TenantSubscripDS, StandarPlatFormDS, SubHistoryDS } from './stores/commonDS';

import OrgSubscribForm from './OrgSubscribForm';
import DateSheetForm from './DateSheetForm';
import styles from './index.less';

const { TabPane } = Tabs;

let timer = null; // 计时器

let handleInitTenants = null;
let handleInitMenu = null;

const DataSheetManage = (props) => {
  const {
    subscribeFormDS,
    lovDS,
    tentantLovDS,
    formDS,
    tenantSubscriDS,
    formTDS,
    standarPlatFormDS,
    subHistoryDS,
    topicLovDS,
  } = props;

  const [activeKey, setActiveKey] = useState('1');
  const [selectedItem, setSelected] = useState({});
  const [tentantItem, setTentant] = useState({});
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    // 查询执行状态，如果是采集中状态，进行轮询，采集完成状态不受影响
    return () => {
      clearTimeout(timer);
      timer = null;
      handleInitTenants = null;
      handleInitMenu = null;
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(!refresh);
    }
  }, [refresh]);

  // const handleRefresh = () => {
  //   refreshTab('/sdps/data-sheet-manage');
  // };

  const handleChangeTab = (key) => {
    setActiveKey(key);
    if (key === '1' && handleInitMenu) {
      setSelected({});
      handleInitMenu();
    }

    if (key === '2' && handleInitTenants) {
      setTentant({});
      handleInitTenants();
    }
  };

  const handleSelectItem = (item = {}) => {
    setSelected(item);
  };

  const handleSelectOrg = (item = {}) => {
    setTentant(item);
  };

  const handleOpenPending = () => {
    setRefresh(true);
  };

  return (
    <>
      <Header
        title={intl.get('sdat.cardsDistribution.view.title.cardsDistribution').d('卡片分发')}
      />
      <div className={styles['datasheet-page-content']}>
        <div className={styles['datasheet-left-panel']}>
          <Tabs animated={false} activeKey={activeKey} onChange={handleChangeTab}>
            <TabPane tab={intl.get('sdat.cardsDistribution.view.title.card').d('卡片')} key="1">
              <LeftMenuClassify
                key="tables"
                isCanEdit
                placeholder={intl
                  .get('sdat.cardsDistribution.view.title.cardPlaceHolder')
                  .d('请输入卡片编码、名称查询')}
                nodataMsg={intl
                  .get('sdat.cardsDistribution.view.message.noData')
                  .d('当前分组下暂无数据')}
                fetchUrl="/hpfm/v1/lovs/data?lovCode=SDAT.REPORT_CARD_GROUP"
                fetchTabsUrl={`${SRM_DATA_SDAT}/v1/report-cards`}
                onSelect={handleSelectItem}
                onInit={(fun) => {
                  handleInitMenu = fun;
                }}
                onRef={() => {
                  // setOpen = fun;
                }}
              />
            </TabPane>
            <TabPane
              tab={intl.get('sdat.cardsDistribution.view.title.tenantTab').d('租户')}
              key="2"
            >
              <LeftMenu
                key="tenants"
                placeholder={intl
                  .get('sdat.cardsDistribution.view.title.tenantPlaceHolder')
                  .d('请输入租户编码、名称查询')}
                fetchUrl={`${SRM_DATA_SDAT}/v1/report-card-distributions/present-tenant-list`}
                onSelect={handleSelectOrg}
                config={{
                  itemName: 'tenantNum',
                  itemTitle: 'tenantName',
                  itemKey: 'tenantId',
                  searchField: 'tenantName',
                }}
                onInit={(fun) => {
                  handleInitTenants = fun;
                }}
              />
            </TabPane>
          </Tabs>
        </div>
        <div className={styles['datasheet-right-box']}>
          <div className={styles['datasheet-right-center']}>
            {activeKey === '1' ? (
              <>
                {selectedItem && selectedItem.cardId ? (
                  <DateSheetForm
                    localRecord={selectedItem}
                    lovDS={tentantLovDS}
                    formDS={formDS}
                    standarDS={standarPlatFormDS}
                    subHistoryDS={subHistoryDS}
                    tenantSubscriDS={tenantSubscriDS}
                    openPending={handleOpenPending}
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
                          .get('sdat.cardsDistribution.view.message.selectTableItem')
                          .d('请在左侧列表选择卡片')}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <OrgSubscribForm
                dataSet={subscribeFormDS}
                lovDS={lovDS}
                localRecord={tentantItem}
                formDS={formTDS}
                historyDS={subHistoryDS}
                topicLovDS={topicLovDS}
                openPending={handleOpenPending}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default connect(({ dataSheetManage }) => ({
  dataSheetManage,
}))(
  formatterCollections({
    code: ['sdat.cardsDistribution', 'srm.filterBar', 'sdat.cardsManage'],
  })(
    withProps(
      () => {
        const subscribeFormDS = new DataSet(SubscribeFormDS());
        const lovDS = new DataSet(LovDS());
        const tentantLovDS = new DataSet(TentantLovDS());
        const standarPlatFormDS = new DataSet({ ...StandarPlatFormDS() });

        const formDS = new DataSet({ ...MetadataDS() });
        const tenantSubscriDS = new DataSet({ ...TenantSubscripDS() });

        const formTDS = new DataSet({ ...MetadataDS() });

        const subHistoryDS = new DataSet({ ...SubHistoryDS() });
        const addTopicDS = new DataSet({ ...AddTopicDS() });

        const topicLovDS = new DataSet({ ...TopicLovDS() });
        return {
          subscribeFormDS,
          lovDS,
          tentantLovDS,

          formDS,
          tenantSubscriDS,
          standarPlatFormDS,

          formTDS,

          subHistoryDS,
          addTopicDS,
          topicLovDS,
        };
      },
      { cacheState: true, keepOriginDataSet: true }
    )(DataSheetManage)
  )
);
