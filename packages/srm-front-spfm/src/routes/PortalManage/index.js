/**
 * PortalManage - 门户管理
 * @date: 2021-06-03
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import { compose } from 'lodash';
import React, { Fragment, useState, useCallback, useMemo } from 'react';
import { Button, DataSet, Modal } from 'choerodon-ui/pro';

import { routerRedux } from 'dva/router';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import { updatePortalAssign } from '@/services/portalService';
import getProtalDs, { layoutDs } from './store/portalDs';

import './index.less';
import Drawer from './Drawer';

function PortalManage(props) {
  const { dispatch, protalDsObject } = props;
  const layoutDsObject = useMemo(() => new DataSet(layoutDs()), []);
  const [tenantId] = useState(getCurrentOrganizationId());

  const [isTenant] = useState(isTenantRoleLevel());

  /**
   * 启动或禁用
   * @param {Boolean} value
   */
  const renderStatus = useCallback(({ value }) => {
    return (
      <div className={value === 1 ? 'tag tag-enable' : 'tag tag-disable'}>
        {value === 1
          ? intl.get(`hzero.common.status.enable`).d('启用')
          : intl.get('hzero.common.status.disable').d('禁用')}
      </div>
    );
  }, []);

  const handleLayout = (record) => {
    dispatch(
      routerRedux.push({
        pathname: `/spfm/portal-manage/edit/${record.get('layoutId')}`,
      })
    );
  };

  // 启用、禁用
  const handleEnable = (record) => {
    const { enabledFlag } = record?.get(['enabledFlag']) || {};
    updatePortalAssign({
      ...(record?.toData() || {}),
      enabledFlag: enabledFlag ? 0 : 1,
    }).then((response) => {
      const res = getResponse(response);
      if (res) {
        notification.success();
        protalDsObject.query(protalDsObject.currentPage);
      }
    });
  };

  /**
   * 操作按钮
   * @param {record} 行信息
   */
  const renderOpr = useCallback(
    ({ record }) => {
      const status = +record.get('layoutTenantId') === tenantId;
      const { enabledFlag } = record?.get(['enabledFlag']) || {};
      return (
        <Fragment>
          {!isTenant && (
            <Button
              wait={200}
              funcType="link"
              waitType="throttle"
              style={{ marginRight: 8 }}
              onClick={() => handleEnable(record)}
            >
              {enabledFlag
                ? intl.get('hzero.common.status.disable').d('禁用')
                : intl.get('hzero.common.status.enable').d('启用')}
            </Button>
          )}
          <Button
            wait={200}
            funcType="link"
            waitType="throttle"
            style={{ marginRight: 8 }}
            onClick={() => openManageModal(false, record)}
          >
            {intl.get('hptl.portalAssign.view.option.template').d('选择模板')}
          </Button>
          <Button
            wait={200}
            funcType="link"
            waitType="throttle"
            hidden={!record.get('layoutId')}
            onClick={() => handleLayout(record)}
          >
            {status
              ? intl.get('hptl.portalAssign.view.option.setting').d('配置布局')
              : intl.get('hptl.portalAssign.view.option.settingview').d('查看布局')}
          </Button>
        </Fragment>
      );
    },
    [isTenant]
  );

  /**
   * 打开弹窗
   * @param {isCreate} 是否是新建项
   * @param {record} 行信息
   */
  const openManageModal = (isCreate, record) => {
    const dataSet = new DataSet(getProtalDs());
    if (!isCreate) {
      dataSet.loadData([record.toData()]);
    }
    const fieldFormDs = isCreate ? dataSet.create({}) : dataSet.current;

    Modal.open({
      title: intl.get('hptl.portalAssign.view.option.template').d('选择模板'),
      key: Modal.key(),
      drawer: true,
      style: {
        width: 380,
      },
      children: (
        <Drawer
          isCreate={isCreate}
          fieldFormDs={fieldFormDs}
          isTenant={isTenant}
          layoutDs={layoutDsObject}
          history={props.history}
        />
      ),
      onOk: async () => {
        const validate = await fieldFormDs.validate();
        if (!validate) return false;
        const res = await dataSet.submit();
        if (res) {
          protalDsObject.query(protalDsObject.currentPage);
        }
      },
    });
  };

  // 列表信息
  const columns = useMemo(() => {
    return [
      { name: 'enabledFlag', width: 80, renderer: renderStatus },
      { name: 'groupNum', width: 150 },
      { name: 'groupName', width: 200 },
      { name: 'webUrl', width: 280 },
      { name: 'layoutName', width: 200 },
      !isTenant && {
        name: 'interBusinessShield',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value || 0),
      },
      !isTenant && {
        name: 'tenantApproval',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value || 0),
      },
      { name: 'domainNameUser', width: 100 },
      { name: 'sendMessageFlag', width: 100, renderer: ({ value }) => yesOrNoRender(value || 0) },
      { name: 'action', width: 160, renderer: renderOpr, lock: 'right' },
    ];
  }, []);

  return (
    <>
      <Header title={intl.get('hptl.portalAssign.view.title.managelist').d('门户管理')}>
        {!isTenant && (
          <Button icon="add" color="primary" onClick={() => openManageModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        )}
      </Header>
      <Content>
        <SearchBarTable
          searchCode={
            isTenant ? 'SPFM.PORTAL.MANAGE.TENANT.SEARCH_BAR' : 'PORTAL.ASSIGN.SEARCH_BAR'
          } // 筛选器个性化单元编码
          selectionMode="none"
          // buttons={['delete']}
          columns={columns}
          dataSet={protalDsObject}
          cacheState
          style={{ maxHeight: 'calc(100vh - 220px)' }}
          customizedCode="SPFM.PORTAL_MANAGE.LIST"
          searchBarConfig={
            isTenant
              ? {
                  fieldProps: {
                    groupId: {
                      lovPara: {
                        tenantId,
                      },
                    },
                  },
                }
              : {}
          }
        />
      </Content>
    </>
  );
}

export default compose(
  formatterCollections({
    code: ['hzero.common', 'hptl.portalAssign'],
  }),
  withProps(
    () => {
      const protalDsObject = new DataSet(getProtalDs());
      return {
        protalDsObject,
      };
    },
    { cacheState: true }
  )
)(PortalManage);
