/* eslint-disable react/jsx-filename-extension */
/**
 * @description 租户限制规则
 * @export TenantRestrictions
 * @class TenantRestrictions
 * @extends {Component}
 */

import React, { memo, useState, useMemo, useEffect, useCallback } from 'react';
import { Menu, Icon } from 'choerodon-ui';
import {
  DataSet,
  useModal,
  TextField,
  DateTimePicker,
  Modal,
  Form,
  Lov,
  Select,
  NumberField,
  Table,
  Tooltip,
} from 'choerodon-ui/pro';

import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { queryUnifyIdpValue } from 'services/api';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import temporarily from '@/assets/icons/u455.png';
import {
  tenantRestrictionData,
  tentRestrictionData,
  circuitDetailsData,
  breakerBanData,
  addTenantData,
  drawerTenantData,
  fetchTenantSave,
  fetchTenantDeleteLine,
  fetchTenantBreakerLine,
  fetchDeleteAllLine,
} from './initialDataDs';
import InterfaceFlowControlDetails from './InterfaceFlowControlDetails';

const cicuitColumns = [
  {
    name: 'actionTypeMeaning',
  },
  {
    name: 'limitTypeMeaning',
  },
  {
    name: 'reason',
  },
  {
    name: 'triggerTime',
  },
  {
    name: 'lockingDuration',
  },
  {
    name: 'expiryDate',
  },
  {
    name: 'sourceFromMeaning',
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
];

const TenantRestrictions = () => {
  const [leftNavigation, setLeftNavigation] = useState([]);
  const [recordTenantId, setRecordTenantId] = useState('');
  const [menuKey, setMenuKey] = useState([]);
  const tenantRestrictionDataDs = useMemo(() => new DataSet(tenantRestrictionData()), []);
  const tentRestrictionDataDs = useMemo(() => new DataSet(tentRestrictionData()), []);
  const drawerTenantDataDs = useMemo(() => new DataSet(drawerTenantData()), []);
  const addTenantDataDs = useMemo(() => new DataSet(addTenantData()), []);

  const _modal = useModal();

  const queryFields = useMemo(
    () => [
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
        lookupCode: 'SADA.MODULE',
      },
      {
        name: 'cnfStatus',
        type: FieldType.string,
        label: intl.get(`scux.interfaceFlowControl.model.interfaceFlowControl.cnfStatus`).d('状态'),
        lookupCode: 'SITF.REQUEST_LIMIT_CNF_STATUS_ORG',
        display: true,
      },
    ],
    [recordTenantId]
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = (value = undefined) => {
    queryUnifyIdpValue('SIFC.LIMIT_TENANT_PAGING', { tenantName: value }).then(res => {
      const r = getResponse(res);
      if (r) {
        setLeftNavigation(r);
      }
    });
  };

  const handleDeleteLine = useCallback(
    async record => {
      const response = await fetchTenantDeleteLine([record.toData()]);
      if (getResponse(response)) {
        notification.success();
        tenantRestrictionDataDs.setQueryParameter('tenantId', recordTenantId);
        tenantRestrictionDataDs.query();
      }
    },
    [recordTenantId]
  );

  const handleBreakerBanLine = useCallback(
    record => {
      const breakerBanDataDs = new DataSet(breakerBanData());
      const cnfStatusFlag = record.get('cnfStatus') === 'RUNNING';
      breakerBanDataDs.setState('cnfStatusFlag', cnfStatusFlag);
      if (cnfStatusFlag) {
        breakerBanDataDs.loadData([record]);
      } else {
        const { tenantId, itfSrcPlatform, interfaceId, interfaceCode } = record.get([
          'tenantId',
          'itfSrcPlatform',
          'interfaceId',
          'interfaceCode',
        ]);
        breakerBanDataDs.setQueryParameter('tenantId', tenantId);
        breakerBanDataDs.setQueryParameter('itfSrcPlatform', itfSrcPlatform);
        breakerBanDataDs.setQueryParameter('interfaceId', interfaceId);
        breakerBanDataDs.setQueryParameter('interfaceCode', interfaceCode);
        breakerBanDataDs.query();
      }
      // 手工解禁
      const manualFlag = record.get('sourceFrom') === 'MANUAL';
      Modal.open({
        title: intl.get('scux.interfaceFlowControl.view.title.add.breacker').d('新建熔断'),
        closable: true,
        okText: intl.get('scux.interfaceFlowControl.view.btn.confirm').d('确认'),
        children: (
          <Form dataSet={breakerBanDataDs} labelWidth={130}>
            <Select name="limitType" disabled={manualFlag} />
            <TextField name="lockingReason" disabled={manualFlag} />
            <DateTimePicker name="triggerTime" disabled={manualFlag} />
            {!cnfStatusFlag && <NumberField name="lockingDuration" disabled />}
            <DateTimePicker name="expiryDate" />
            <TextField name="unlockingReason" disabled={cnfStatusFlag} />
          </Form>
        ),
        onOk: async () => {
          let flag = false;
          const validateFlag = await breakerBanDataDs.validate();
          if (validateFlag) {
            const currentData = breakerBanDataDs.toData();
            const newData = cnfStatusFlag
              ? currentData.map(item => ({
                  ...item,
                  cnfLineId: undefined,
                  _token: undefined,
                }))
              : currentData;
            const response = await fetchTenantBreakerLine(newData, cnfStatusFlag);
            if (getResponse(response)) {
              notification.success();
              flag = true;
              tenantRestrictionDataDs.setQueryParameter('tenantId', recordTenantId);
              tenantRestrictionDataDs.query();
            }
          } else {
            notification.warning({
              message: intl.get('scux.interfaceFlowControl.view.message.notNul').d('请填写必填项!'),
            });
          }

          return flag;
        },
      });
    },
    [recordTenantId]
  );

  // 接口限流详情
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
            dataSetSource={tenantRestrictionDataDs}
            itfSrcPlatform={record.get('itfSrcPlatform')}
            modal={_modal}
          />
        ),
      });
    },
    [_modal, tenantRestrictionDataDs]
  );

  // 熔断详情
  const handleOpenCircuitDetails = useCallback(record => {
    const circuitDetailsDataDs = new DataSet(circuitDetailsData());
    const { tenantId, itfSrcPlatform, interfaceId } = record.get([
      'tenantId',
      'itfSrcPlatform',
      'interfaceId',
    ]);
    circuitDetailsDataDs.setQueryParameter('tenantId', tenantId);
    circuitDetailsDataDs.setQueryParameter('itfSrcPlatform', itfSrcPlatform);
    circuitDetailsDataDs.setQueryParameter('interfaceId', interfaceId);
    circuitDetailsDataDs.query();
    Modal.open({
      title: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.circuit.details`)
        .d('熔断详情'),
      closable: true,
      style: { width: 800 },
      drawer: true,
      footer: null,
      children: (
        <>
          <span>{intl.get('scux.interfaceFlowControl.model.number.circuit.breakers').d('熔断次数')} {record.get('limitRecCount')} {intl.get('scux.interfaceFlowControl.model.number.order').d('次')}</span>
          <Table dataSet={circuitDetailsDataDs} columns={cicuitColumns} />
        </>
      ),
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'cnfStatusMeaning',
      },
      {
        header: intl.get('scux.interfaceFlowControl.model.operationNew').d('操作'),
        width: 100,
        renderer: ({ record }) => (
          <>
            <a onClick={() => handleDeleteLine(record)} style={{ marginRight: '8px' }}>
              {intl.get('scux.interfaceFlowControl.model.delete').d('删除')}
            </a>
            {record.get('cnfStatus') === 'RUNNING' ? (
              <a onClick={() => handleBreakerBanLine(record)} style={{ marginRight: '8px' }}>
                {intl.get('scux.interfaceFlowControl.model.add.circuit.breaker').d('加入熔断')}
              </a>
            ) : (
              <a onClick={() => handleBreakerBanLine(record)}>
                {intl.get('scux.interfaceFlowControl.model.left.ban').d('解禁')}
              </a>
            )}
          </>
        ),
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
        header: intl
          .get(`scux.interfaceFlowControl.model.interfaceFlowControl.circuit.details`)
          .d('熔断详情'),
        renderer: ({ record }) => (
          <a onClick={() => handleOpenCircuitDetails(record)}>
            {intl
              .get(`scux.interfaceFlowControl.model.interfaceFlowControl.circuit.details`)
              .d('熔断详情')}
          </a>
        ),
      },
      {
        name: 'limitRecCount',
      },
      {
        name: 'tenantName',
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
    [recordTenantId]
  );

  // 租户导航点击
  const handleClickMenuItem = useCallback(({ key }) => {
    drawerTenantDataDs.getField('tenantName').setLovPara('tenantId', key);
    tenantRestrictionDataDs.setQueryParameter('tenantId', key);
    tenantRestrictionDataDs.query();
    setRecordTenantId(key);
    setMenuKey([key]);
  }, []);

  // 新建租户信息
  const handleAfterClose = () => {
    if (window.sessionStorage.getItem('tenantConfrimFlag')) {
      const currentData = addTenantDataDs.toData();
      leftNavigation.unshift(currentData[0]);
      setMenuKey([leftNavigation[0].tenantId]);
      setRecordTenantId(leftNavigation[0].tenantId);
      setLeftNavigation([...leftNavigation]);
      drawerTenantDataDs.getField('tenantName').setLovPara('tenantId', leftNavigation[0].tenantId);
      window.sessionStorage.removeItem('tenantConfrimFlag');
    }
  };

  const handleAddWhitelist = useCallback(async () => {
    if (window.sessionStorage.getItem('confirmFlag')) {
      const selectedData = drawerTenantDataDs.toData();
      const { tenantName } = selectedData[0] || {};
      const newData = tenantName.map(item => ({ ...item, tenantId: recordTenantId }));
      const response = await fetchTenantSave(newData);
      if (getResponse(response)) {
        notification.success();
        tenantRestrictionDataDs.setQueryParameter('tenantId', recordTenantId);
        tenantRestrictionDataDs.query();
        drawerTenantDataDs.current.set('tenantName', null);
      }
      window.sessionStorage.removeItem('confirmFlag');
    }
  }, [drawerTenantDataDs, recordTenantId]);

  const handleDeleteAll = async data => {
    Modal.confirm({
      title: intl.get('scux.interfaceFlowControl.model.delete').d('删除'),
      children: (
        <span>
          {intl
            .get('scux.interfaceFlowControl.message.delete.currentData')
            .d('确认要删除该数据吗？')}
        </span>
      ),
      onOk: async () => {
        const response = await fetchDeleteAllLine({ tenantId: data.tenantId });
        if (getResponse(response)) {
          notification.success();
          fetchData();
        }
      },
    });
  };

  const Menus = useMemo(() => {
    return (
      <Menu selectedKeys={menuKey}>
        {leftNavigation.map(item => (
          <Menu.Item key={item.tenantId} onClick={handleClickMenuItem}>
            <Tooltip title={item.tenantName}>
              <span className="menuText">{item.tenantName}</span>
            </Tooltip>
            <Icon
              type="delete"
              style={{ color: '#29BEDB' }}
              onClick={() => handleDeleteAll(item)}
            />
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [menuKey, leftNavigation]);

  return (
    <>
      <div style={{ color: '#29BEDB' }}>
        {intl
          .get('scux.interfaceFlowControl.view.title.tenantRestrictions.message')
          .d('租户限制是以接口维度进行处理，已满足不同租户不同接口间不同的流量要求')}
      </div>
      <div className="tentRestrictionRight">
        <div className="tentRestrictionRight_left">
          <div style={{ borderRight: '0.01rem solid #e8e8e8' }}>
            <TextField
              onChange={value => {
                fetchData(value);
              }}
              name="tenantName"
              dataSet={tentRestrictionDataDs}
              placeholder={intl
                .get('scux.interfaceFlowControl.view.tenant.placeholder')
                .d('请输入租户名称进行检索')}
            />
            <div
              style={{
                marginTop: '10px',
                color: '#29BEDB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingRight: '5px',
              }}
            >
              <span>{intl.get('scux.interfaceFlowControl.view.message.all').d('全部')}</span>
              <Lov
                className="tenantRestrictionRight_lov"
                dataSet={addTenantDataDs}
                name="tenantNameLov"
                mode="button"
                viewMode="drawer"
                clearButton={false}
                tableProps={{
                  selectionMode: 'rowbox',
                }}
                modalProps={{
                  style: { width: 600 },
                  onOk: () => {
                    window.sessionStorage.setItem('tenantConfrimFlag', true);
                  },
                  afterClose: handleAfterClose,
                }}
              >
                <Icon type="add" style={{ float: 'right' }} />
              </Lov>
            </div>
          </div>
          {Menus}
        </div>
        <div className="tenantRestrictionRight_right">
          {recordTenantId ? (
            <FilterBarTable
              key="whitelist"
              cacheState
              border={false}
              filterBarConfig={{
                cacheKey: 'whitelist',
                fields: queryFields,
                autoQuery: false,
                right: {
                  render: () => (
                    <Lov
                      dataSet={drawerTenantDataDs}
                      name="tenantName"
                      mode="button"
                      color="primary"
                      viewMode="drawer"
                      clearButton={false}
                      modalProps={{
                        style: { width: 600 },
                        onOk: () => {
                          window.sessionStorage.setItem('confirmFlag', true);
                        },
                        afterClose: handleAddWhitelist,
                      }}

                    >
                      {intl.get('scux.interfaceFlowControl.view.btn.update').d('新建')}
                    </Lov>
                  ),
                },
              }}
              customizable
              customizedCode="SITF.CUSTOMIZABLE.WHITELIST"
              dataSet={tenantRestrictionDataDs}
              columns={columns}
            />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <img
                src={temporarily}
                alt=""
                width={200}
                style={{ display: 'block', margin: '0 auto', marginBottom: '12px' }}
              />
              <span style={{ color: '#ddd' }}>
                {intl
                  .get('scux.interfaceFlowControl.view.click.here.proceed')
                  .d('请先创建一个租户信息，然后在进行接口限流管理，点击此处进行')}
              </span>
              <Lov
                className="tenantRestrictionRight_lov"
                dataSet={addTenantDataDs}
                name="tenantNameLov"
                mode="button"
                viewMode="drawer"
                clearButton={false}
                tableProps={{
                  selectionMode: 'rowbox',
                }}
                modalProps={{
                  style: { width: 600 },
                  onOk: () => {
                    window.sessionStorage.setItem('tenantConfrimFlag', true);
                  },
                  afterClose: handleAfterClose,
                }}
              >
                {intl.get('scux.interfaceFlowControl.view.btn.update.tenant').d('新建租户')}
              </Lov>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default memo(TenantRestrictions);
