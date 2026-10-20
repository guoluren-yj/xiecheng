/* eslint-disable react/jsx-filename-extension */
/**
 * @description 平台限制规则
 * @export PlatformRestriction
 * @class PlatformRestriction
 * @extends {Component}
 */

import React, { memo, useState, useMemo, useEffect, useCallback } from 'react';
import { Tabs } from 'choerodon-ui';
import { DataSet, useModal } from 'choerodon-ui/pro';

import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';

import { platformResData } from './initialDataDs';
import InterfaceFlowControlDetails from './InterfaceFlowControlDetails';

const { TabPane } = Tabs;

const queryFields = () => [
  {
    name: 'interfaceCode',
    type: FieldType.string,
    label: intl
      .get(`scux.interfaceFlowControl.model.interfaceFlowControl.interfaceCode`)
      .d('接口编码'),
    display: true,
  },
  {
    name: 'interfaceName',
    type: FieldType.string,
    label: intl
      .get(`scux.interfaceFlowControl.model.interfaceFlowControl.interfaceName`)
      .d('接口名称'),
    display: true,
  },
  {
    name: 'module',
    type: FieldType.string,
    label: intl
      .get(`scux.interfaceFlowControl.model.interfaceFlowControl.module`)
      .d('所属模块'),
    display: true,
    lookupCode: 'SADA.MODULE',
  },
  {
    name: 'cnfStatus',
    type: FieldType.string,
    label: intl.get(`scux.interfaceFlowControl.model.interfaceFlowControl.cnfStatus`).d('状态'),
    lookupCode: 'SITF.REQUEST_LIMIT_CNF_STATUS_SITE',
    display: true,
  },
];

const PlatformRestriction = () => {
  const [tabKey, setTabKey] = useState('interfacePlatform');
  const platformResDataDs = useMemo(() => new DataSet(platformResData()), []);
  const openResDataDs = useMemo(() => new DataSet(platformResData()), []);

  const _modal = useModal();

  useEffect(() => {
    fetchData(tabKey);
  }, [tabKey]);

  const fetchData = key => {
    if (key === 'interfacePlatform') {
      platformResDataDs.setQueryParameter('itfSrcPlatform', 'SITF');
      platformResDataDs.setQueryParameter('tenantId', 0);
      platformResDataDs.query();
    } else {
      openResDataDs.setQueryParameter('itfSrcPlatform', 'HITF_OPEN');
      openResDataDs.setQueryParameter('tenantId', 0);
      openResDataDs.query();
    }
  };

  const columns = useMemo(
    () => [
      {
        name: 'cnfStatus',
      },
      {
        name: 'interfaceCode',
      },
      {
        name: 'interfaceName',
      },
      {
        name: 'module',
      },
      {
        header: intl
          .get(`scux.interfaceFlowControl.model.interfaceFlowControl.details`)
          .d('接口限流详情'),
        renderer: ({ record }) => (
          <a onClick={() => handleOpenInterfaceDetails(record)}>
            {intl
              .get(`scux.interfaceFlowControl.model.interfaceFlowControl.details`)
              .d('接口限流详情')}
          </a>
        ),
      },
      {
        name: 'createdRealName',
      },
      {
        name: 'creationDate',
      },
      {
        name: 'lastUpdatedRealName',
      },
      {
        name: 'lastUpdateDate',
      },
    ],
    [tabKey]
  );

  const handleOpenInterfaceDetails = useCallback(
    record => {
      _modal.open({
        title: intl
          .get(`scux.interfaceFlowControl.model.interfaceFlowControl.details`)
          .d('接口限流详情'),
        drawer: true,
        footer: null,
        style: { width: 800 },
        children: (
          <InterfaceFlowControlDetails
            dataSource={record.toData()}
            dataSetSource={tabKey === 'interfacePlatform' ? platformResDataDs : openResDataDs}
            itfSrcPlatform={tabKey === 'interfacePlatform' ? 'SITF' : 'HITF_OPEN'}
            modal={_modal}
          />
        ),
      });
    },
    [_modal, tabKey, platformResDataDs, openResDataDs]
  );

  return (
    <>
      <div style={{ color: '#29BEDB', marginBottom: '10px' }}>
        {intl
          .get('scux.interfaceFlowControl.view.title.platformRestriction.message')
          .d(
            '定义平台统一的限流规则，如租户未按接口维度进行配置，则根据平台预定义限制进行接口限流'
          )}
      </div>
      <Tabs
        activeKey={tabKey}
        animated={false}
        onChange={key => {
          setTabKey(key);
        }}
      >
        <TabPane
          key="interfacePlatform"
          tab={intl.get('scux.interfaceFlowControl.view.tab.interfacePlatform').d('接口平台')}
        >
          <FilterBarTable
            key="interfacePlatform"
            cacheState
            border={false}
            filterBarConfig={{
              cacheKey: 'interfacePlatform',
              fields: queryFields(),
            }}
            customizable
            customizedCode="SITF.CUSTOMIZABLE.INTERFACEPLATFORM"
            dataSet={platformResDataDs}
            columns={columns}
          />
        </TabPane>
        <TabPane
          key="openPlatform"
          tab={intl.get('scux.interfaceFlowControl.view.tab.openPlatform').d('开放平台')}
        >
          <FilterBarTable
            key="openPlatform"
            cacheState
            border={false}
            filterBarConfig={{
              cacheKey: 'openPlatform',
              fields: queryFields(),
              autoQuery: false,
            }}
            customizable
            customizedCode="SITF.CUSTOMIZABLE.OPENPLATFORM"
            dataSet={openResDataDs}
            columns={columns}
          />
        </TabPane>
      </Tabs>
    </>
  );
};

export default memo(PlatformRestriction);
