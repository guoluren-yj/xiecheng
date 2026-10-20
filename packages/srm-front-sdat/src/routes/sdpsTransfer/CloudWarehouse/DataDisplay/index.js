/**
 * 云仓一体数据看板功能 平台级
 * @author qingxiang.luo@going-link.com
 * @date 2022-02-10
 */

import React, { useState, useEffect } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Header } from 'components/Page';
import { DataSet, Lov, Icon } from 'choerodon-ui/pro';
import { Popover, Tabs } from 'choerodon-ui';
import { queryMapIdpValue } from 'services/api';
import { getOpenService } from '@/services/sdpsTransfer/dataDisplayService';

import { DataDisplayDS, DataDisplayLovDS, FileSyncDS } from '../stores/dataDisplayDS';

import DataSync from './DataSync';
import FilesSync from './FilesSync';
import './index.less';

const { TabPane } = Tabs;

const DataDisplay = (props) => {
  const { listDS, lovDS, filesSyncDS } = props;

  const [customizeArr, setArray] = useState([]);
  const [isEnhance, setEnhance] = useState(0); // 0 未开通，1 常规，2 增强
  const [localRecord, setLocalRecord] = useState({});
  const [fileService, setFileService] = useState(false); // 是否开通文件同步服务
  const [listService, setListService] = useState(false); // 是否开通数据同步服务
  const [activeKey, setActiveKey] = useState('1');

  useEffect(() => {
    queryMapIdpValue({
      customizeList: 'SDPD.VERSION_CUSTOMIZ_TYPE',
    }).then((res) => {
      if (res) {
        setArray(res?.customizeList ?? []);
      }
    });
  }, []);

  const handleChangeTenant = (record = {}) => {
    setFileService(false);
    setListService(false);

    if (record.tenantId) {
      getOpenService({ organizationId: record.tenantId }).then((res) => {
        if (getResponse(res) && Array.isArray(res) && res.length) {
          if (res.indexOf('ZY_CLOUD_DATA_SYNC_V1') >= 0) {
            // 常规版
            setEnhance(1);
            setListService(true);
            setActiveKey('1');
          }

          if (res.indexOf('ZY_CLOUD_DATA_SYNC_PLUS_V1') >= 0) {
            // 增强版
            setEnhance(2);
            setListService(true);
            setActiveKey('1');
          }

          if (res.indexOf('ZY_CLOUD_FILE_SYNC_V1') >= 0) {
            // 文件同步服务
            setFileService(true);
            setActiveKey('2');
          }
        } else {
          setEnhance(0);
          setFileService(false);
          setListService(false);
          setActiveKey('1');
        }
      });
      setLocalRecord(record);
    }
  };

  /**
   * 绘制版本介绍内容
   */
  const drawList = () => {
    const dataList = []; // 过滤后的数据列表

    if (customizeArr.length) {
      customizeArr.forEach((item) => {
        if (isEnhance === 1 && !item.tag) {
          dataList.push({ ...item });
        }

        if (isEnhance === 2 && item.tag) {
          dataList.push({ ...item });
        }
      });
    }

    return dataList.map((record) => {
      return (
        <div className="card-item" key={record.value}>
          <Icon
            type="check_circle"
            style={{ color: '#47B881', marginRight: '12px', marginTop: '-3px' }}
          />
          <span>{record.meaning}</span>
        </div>
      );
    });
  };

  /**
   * popover 内容
   * @returns
   */
  const content = () => {
    return (
      <div>
        <div className={isEnhance === 1 ? 'card-border-normal' : 'card-border-enhance'} />
        <div style={{ padding: '16px 20px 20px 20px' }}>
          <p className="card-title-normal">
            {isEnhance === 1
              ? intl.get('sdps.cloudWarehouse.view.title.normalVersion').d('标准版 (T+1)')
              : intl.get('sdps.cloudWarehouse.view.title.enhanceVersion').d('增强版 (T+7)')}
          </p>
          <div
            className="card-item-panel"
            style={{ background: isEnhance === 1 ? '#F5F8FB' : '#FFFAF3' }}
          >
            {drawList()}
          </div>
        </div>
      </div>
    );
  };

  const handleChangeTab = (key) => {
    setActiveKey(key);
  };

  return (
    <div className="data-display-content">
      <Header title={intl.get('sdps.cloudWarehouse.view.title.monitorAnalysis').d('监控与分析')}>
        {isEnhance > 0 && (
          <Popover
            content={content()}
            title=""
            placement="bottomLeft"
            popupClassName="display-popover-card"
          >
            <span
              className={`basic-popover ${
                isEnhance === 1 ? 'basic-popover-normal' : 'basic-popover-enhance'
              }`}
            >
              {isEnhance === 1
                ? intl.get('sdps.cloudWarehouse.view.title.normalVersionT').d('标准版 T+1')
                : intl.get('sdps.cloudWarehouse.view.title.enhanceVersionT').d('增强版 T+7')}
            </span>
          </Popover>
        )}

        <div className="data-display-header" style={{ left: isEnhance === 0 ? '120px' : '220px' }}>
          <span style={{ color: 'rgba(0,0,0,0.65)', fontWeight: '400' }}>
            {intl.get('sdps.cloudWarehouse.view.title.tenant').d('租户')}
          </span>
          <span>
            <Lov
              isFlat
              name="tenantVal"
              clearButton={false}
              searchable
              placeholder={intl.get('sdps.cloudWarehouse.view.title.selectTenant').d('请选择租户')}
              onChange={handleChangeTenant}
              dataSet={lovDS}
            />
          </span>
        </div>
      </Header>
      <div className="page-content-card" style={{ padding: '16px 8px' }}>
        <Tabs activeKey={activeKey} onChange={handleChangeTab}>
          {(listService || (!listService && !fileService)) && (
            <TabPane
              tab={intl.get('sdps.cloudWarehouse.view.title.dataSync').d('数据同步')}
              key="1"
            >
              <DataSync listDS={listDS} tenantRecord={localRecord} />
            </TabPane>
          )}
          {(fileService || !(localRecord && localRecord.tenantId > 0)) && (
            <TabPane
              tab={intl.get('sdps.cloudWarehouse.view.title.filesSync').d('文件同步')}
              key="2"
            >
              <FilesSync listDS={filesSyncDS} tenantRecord={localRecord} />
            </TabPane>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['sdps.cloudWarehouse', 'srm.filterBar', 'sdps.dataSheet'],
})(
  withProps(
    () => {
      const listDS = new DataSet(DataDisplayDS());
      const lovDS = new DataSet(DataDisplayLovDS());
      const filesSyncDS = new DataSet(FileSyncDS());
      return { listDS, lovDS, filesSyncDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(DataDisplay)
);
