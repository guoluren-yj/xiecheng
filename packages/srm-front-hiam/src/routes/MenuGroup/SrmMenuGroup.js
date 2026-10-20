/**
 * 菜单组配置-平台
 * @date: 2022-05-25
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useCallback, memo, useMemo, useEffect, useState } from 'react';
import { DataSet, Tabs, Table, Switch, Modal } from 'choerodon-ui/pro';
import { Link } from 'dva/router';
import { omit } from 'lodash';
import { observer } from 'mobx-react';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import request from 'utils/request';
import withProps from 'utils/withProps';
import { HZERO_IAM } from 'utils/config';
import { getResponse, getCurrentUser } from 'utils/utils';
import notification from 'utils/notification';

import { getMenuGroup } from './store';
import MenuGroupModal from './MenuGroupModal';

import styles from './index.less';

const { TabPane } = Tabs;
const { Column } = Table;

export const platform = 'PLATFORM';
export const tenant = 'TENANT';

const SrmTabPane = memo((props) => {
  const { dataSet, type, queryTenantId } = props;
  const { loginName } = getCurrentUser();

  const titleRenderer = useCallback(
    ({ value, record }) => {
      const fdLevel = type === tenant ? 'organization' : 'site';
      return (
        <Link
          to={`/hiam/menu-group/detail/${fdLevel}/${record.get('code')}/${record.get(
            'tenantId'
          )}?groupName=${value}`}
        >
          {value}
        </Link>
      );
    },
    [type]
  );

  const switchRender = useCallback(({ value, record }) => {
    return <Switch checked={value} disabled={value} onChange={() => handleDefaultTemp(record)} />;
  }, []);

  const modalRender = useCallback(({ record }) => {
    return (
      <span className={styles['menu-operator']} onClick={() => handleModal(record)}>
        {intl.get('hzero.common.button.edit').d('编辑')}
      </span>
    );
  }, []);

  // 开启默认菜单
  const handleDefaultTemp = useCallback((record) => {
    try {
      request(`${HZERO_IAM}/v1/function/group/change/default`, {
        method: 'POST',
        body: omit(record.toData(), ['__dirty']),
      }).then((res) => {
        if (getResponse(res)) {
          dataSet.query();
        }
      });
    } catch (error) {
      return false;
    }
  }, []);

  // 编辑弹窗
  const handleModal = useCallback((record) => {
    const modalProps = {
      record,
    };
    Modal.open({
      drawer: true,
      style: { width: 800 },
      title: intl.get('hiam.menuConfig.modal.title.edit.menuGroup').d('编辑目录组'),
      children: <MenuGroupModal {...modalProps} />,
      closable: true,
      footer: record.get('alreadyUsed')
        ? null
        : (okBtn, cancelBtn) => (
            <>
              {okBtn}
              {cancelBtn}
            </>
          ),
      onOk: () => handleEditMenu(record),
      onCancel: () => {
        record.reset();
      },
    });
  }, []);

  // 弹窗保存
  const handleEditMenu = useCallback((record) => {
    try {
      request(`${HZERO_IAM}/v1/function/group/update`, {
        method: 'POST',
        body: omit(record.toData(), ['__dirty']),
      }).then((res) => {
        const result = getResponse(res);
        if (result) {
          notification.success();
          dataSet.query();
        } else {
          record.reset();
          return false;
        }
      });
    } catch (error) {
      record.reset();
      return false;
    }
  }, []);

  return (
    <Table dataSet={dataSet} selectionMode="none">
      <Column name="name" renderer={titleRenderer} />
      <Column name="code" />
      <Column name="tenantName" />
      {loginName === 'admin' &&
        type === 'TENANT' &&
        queryTenantId &&
        (queryTenantId === '0' ? (
          <Column name="defaultFlag" renderer={switchRender} />
        ) : (
          <>
            <Column name="functionGroupTemplate" />
            <Column name="operator" renderer={modalRender} />
          </>
        ))}
    </Table>
  );
});

const SrmMenuGroup = (props) => {
  const { dispatch, tabDs, platformGroupDs, tenantGroupDs } = props;
  const initTenantId =
    tenantGroupDs.queryDataSet &&
    tenantGroupDs.queryDataSet.current &&
    tenantGroupDs.queryDataSet.current.get('tenantLov') &&
    tenantGroupDs.queryDataSet.current.get('tenantLov').tenantId
      ? tenantGroupDs.queryDataSet.current.get('tenantLov').tenantId.toString()
      : '0';
  const [queryTenantId, setQueryTenantId] = useState(initTenantId);
  // const [activeTabKey, setActiveTabKey] = useState(platform);
  const activeTabKey = useMemo(() => {
    return tabDs.getState('key') || platform;
  }, [tabDs.getState('key')]);

  useEffect(() => {
    platformGroupDs.queryDataSet.addEventListener('update', handleSRMQueryDsUpdate);
    tenantGroupDs.queryDataSet.addEventListener('update', handleQueryDsUpdate);
    return () => {
      platformGroupDs.queryDataSet.removeEventListener('update', handleSRMQueryDsUpdate);
      tenantGroupDs.queryDataSet.removeEventListener('update', handleQueryDsUpdate);
    };
  }, []);

  const handleSRMQueryDsUpdate = useCallback(() => {
    platformGroupDs.query();
  }, [platformGroupDs]);

  const handleQueryDsUpdate = useCallback(
    ({ name, value }) => {
      if (name === 'tenantLov') {
        setQueryTenantId(value ? value.tenantId : '');
      }
      tenantGroupDs.query();
    },
    [tenantGroupDs]
  );

  const handleChangeTab = useCallback(
    (key) => {
      tabDs.setState('key', key);
    },
    [tabDs]
  );

  return (
    <>
      <Header title={intl.get('hiam.menuConfig.view.title.header.menuGroup').d('目录组配置')} />
      <Content>
        <Tabs activeKey={activeTabKey} onChange={handleChangeTab}>
          <TabPane tab={intl.get('hiam.menuConfig.view.message.platform').d('平台')} key={platform}>
            <SrmTabPane dataSet={platformGroupDs} dispatch={dispatch} type={platform} />
          </TabPane>
          <TabPane tab={intl.get('hiam.menuConfig.view.message.tenant').d('租户')} key={tenant}>
            <SrmTabPane
              dataSet={tenantGroupDs}
              dispatch={dispatch}
              type={tenant}
              queryTenantId={queryTenantId}
            />
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['hiam.menuConfig', 'hiam.subAccount'],
})(
  memo(
    withProps(
      () => {
        const platformGroupDs = new DataSet(getMenuGroup(platform));
        const tenantGroupDs = new DataSet(getMenuGroup(tenant));
        const tabDs = new DataSet();
        return {
          tabDs,
          platformGroupDs,
          tenantGroupDs,
        };
      },
      { cacheState: true }
    )(observer(SrmMenuGroup))
  )
);
