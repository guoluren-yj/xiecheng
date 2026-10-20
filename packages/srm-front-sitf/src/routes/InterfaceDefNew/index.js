/**
 * @description 接口定义
 * @export InterfaceDef
 * @class InterfaceDef
 * @extends {Component}
 */

import React, { Fragment, useMemo, useCallback } from 'react';
import {
  DataSet,
  Button,
  Table,
  Dropdown,
  Menu,
  Modal,
  Tooltip,
  Icon,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { Link } from 'dva/router';
import { isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse, isTenantRoleLevel } from 'utils/utils';

import { quoteInterface } from '@/services/interfaceDefNewService';
import { tableData, modalData, filterConditionDs } from './initialDataDs';
import InterfaceDefEditModal from './InterfaceDefEditModal';

const prefix = 'sitf.interfaceDef';
const organizationRole = isTenantRoleLevel();
const tenantId = getCurrentOrganizationId();
const { Item } = Menu;

const InterfaceDef = () => {
  const tableDataDs = useMemo(() => new DataSet(tableData()), []);

  const modalDataDs = useMemo(() => new DataSet(modalData()), []);

  const handleQuoteData = async () => {
    const response = await quoteInterface();
    try {
      if (getResponse(response)) {
        notification.success();
        tableDataDs.query();
      }
    } catch (error) {
      throw error;
    }
  };

  const filterConditionColumns = useMemo(() => {
    return [
      {
        name: 'orderSeq',
      },
      {
        name: 'conditionCode',
        editor: record => record.getState('editing'),
      },
      {
        name: 'conditionRelation',
        editor: record => record.getState('editing'),
      },
      {
        name: 'conditionValue',
        editor: record => record.getState('editing'),
      },
      {
        name: 'enabledFlag',
        editor: record => record.getState('editing'),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 120,
        align: 'left',
        command: ({ record }) => {
          return [['edit', { onClick: () => record.setState('editing', true) }], 'delete'];
        },
      },
    ];
  }, []);

  const filterConditions = useCallback(interfaceId => {
    const filterConditionDS = new DataSet(filterConditionDs({ interfaceId }));

    Modal.open({
      key: Modal.key,
      title: (
        <Fragment>
          {intl.get(`${prefix}.model.rerun.filterConditions`).d('重跑过滤条件')}
          &nbsp;
          <Tooltip
            placement="bottom"
            title={
              <Fragment>
                {intl
                  .get(`${prefix}.model.alert.message1`)
                  .d('关系为包含时，表示属性只要包含有这个值的数据将过滤掉不进行重跑')}
                <br />
                {intl
                  .get(`${prefix}.model.alert.message2`)
                  .d('关系为等于时，表示属性精准等于这个值的数据将过滤掉不进行重跑')}
              </Fragment>
            }
          >
            <Icon type="help_outline" style={{ marginTop: '-3px' }} />
          </Tooltip>
        </Fragment>
      ),
      drawer: true,
      closable: true,
      style: { width: 900 },
      children: (
        <Table
          dataSet={filterConditionDS}
          columns={filterConditionColumns}
          buttons={[
            [
              'add',
              {
                onClick: () => {
                  let data = filterConditionDS.toData() || [];
                  let record = '';
                  if (isEmpty(data)) {
                    record = filterConditionDS.create({interfaceId, orderSeq: 1 }, 0);
                  } else {
                    data =
                      data.reduce((a, b) => (Number(a.orderSeq) > Number(b.orderSeq) ? a : b)) ||
                      {};
                    record = filterConditionDS.create({interfaceId, orderSeq: Number(data.orderSeq) + 1 }, 0);
                  }
                  record.setState('editing', true);
                },
              },
            ],
            'delete',
            <Button
              onClick={() => {
                filterConditionDS.submit().then(() => {
                  filterConditionDS.forEach(item => {
                    item.setState('editing', false);
                  });
                });
              }}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>,
          ]}
        />
      ),
    });
  }, []);

  const menu = (record, interfaceId, interfaceCode, interfaceName) => (
    <Menu>
      <Item>
        <a
          style={{ borderBottom: '2px solid #fff' }}
          onClick={() =>
            InterfaceDefEditModal(modalDataDs, 'update', record.toData(), tableDataDs, tenantId)
          }
        >
          {intl.get('hzero.common.button.edit').d('编辑')}
        </a>
      </Item>
      {record.get('rerunErrorFlag') && Number(record.get('rerunErrorFlag')) === 1 && (
        <Item>
          <a
            style={{ borderBottom: '2px solid #fff' }}
            onClick={() => filterConditions(interfaceId)}
          >
            {intl.get(`${prefix}.model.rerun.filterConditions`).d('重跑过滤条件')}
          </a>
        </Item>
      )}
      <Item>
        <Link
          to={
            organizationRole
              ? `/sitf/interface-def-org/table?interfaceId=${interfaceId}&interfaceCode=${interfaceCode}&interfaceName=${interfaceName}`
              : `/sitf/interface-def/table?interfaceId=${interfaceId}&interfaceCode=${interfaceCode}&interfaceName=${interfaceName}`
          }
        >
          {intl.get('sitf.interfaceDef.view.interfaceDef.interfaceTableDef').d('关键字段提取')}
        </Link>
      </Item>
      <Item>
        <Link
          to={
            organizationRole
              ? `/sitf/interface-def-org/cate?interfaceId=${interfaceId}&interfaceCode=${interfaceCode}&interfaceName=${interfaceName}`
              : `/sitf/interface-def/cate?interfaceId=${interfaceId}&interfaceCode=${interfaceCode}&interfaceName=${interfaceName}`
          }
        >
          {intl.get('sitf.interfaceDef.view.interfaceDef.marmot').d('关联Marmot脚本')}
        </Link>
      </Item>
      {organizationRole && Number(record.get('multiReceiverTypeFlag')) === 1 && (
        <Item>
          <Link
            to={`/sitf/interface-def-org/multiReceiver?interfaceId=${interfaceId}`}
          >
            {intl.get(`${prefix}.model.rerun.multiReceiverTypeFlag`).d('多告警接收组配置')}
          </Link>
        </Item>
      )}
    </Menu>
  );

  const columns = [
    {
      name: 'interfaceCategoryName',
      width: 100,
    },
    {
      name: 'interfaceCode',
      width: 200,
    },
    {
      name: 'interfaceName',
      width: 150,
    },
    {
      name: 'interfaceTypeMeaning',
      width: 100,
    },
    {
      name: 'individualFlag',
      width: 80,
      renderer: ({ value }) => {
        return value === 1 ? (
          <span>{intl.get('sitf.interfaceDef.model.interfaceDef.individualFlag').d('二开')}</span>
        ) : (
          <span>{intl.get('sitf.interfaceDef.view.interfaceDef.normal').d('标准')}</span>
        );
      },
    },
    {
      name: 'pushFlag',
      width: 130,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'handleFunction',
      width: 120,
    },
    {
      name: 'rerunErrorFlag',
      width: 100,
      renderer: ({ value }) => enableRender(value),
    },
    {
      name: 'asyncFlag',
      width: 100,
      renderer: ({ value }) => enableRender(value),
    },
    organizationRole && {
      name: 'abnormalAlarmFlag',
      width: 80,
      renderer: ({ value }) => enableRender(value),
    },
    {
      name: 'enabledFlag',
      width: 80,
      renderer: ({ value }) => enableRender(value),
    },
    {
      name: 'comments',
      width: 80,
    },
    {
      header: intl.get(`${prefix}.model.interfaceDef.operation`).d('操作'),
      align: 'center',
      lock: 'right',
      width: 80,
      renderer: ({ record }) => {
        const interfaceId = record.get('interfaceId');
        const interfaceCode = record.get('interfaceCode');
        const interfaceName = record.get('interfaceName');
        return (
          <Dropdown
            overlay={menu(record, interfaceId, interfaceCode, interfaceName)}
            placement="bottomCenter"
          >
            <a>{intl.get(`${prefix}.model.interfaceDef.operation`).d('操作')}</a>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Fragment>
      <Header title={intl.get(`${prefix}.view.title.interfaceDef`).d('接口定义')}>
        <Button
          color="primary"
          icon="add"
          onClick={() => InterfaceDefEditModal(modalDataDs, 'create', {}, tableDataDs, tenantId)}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        {organizationRole && (
          <Button icon="fork" wait={500} waitType="debounce" onClick={handleQuoteData}>
            {intl.get('sitf.common.button.option.quote').d('引用云级接口')}
          </Button>
        )}
      </Header>
      <Content>
        <Table dataSet={tableDataDs} columns={columns} />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({ code: ['sitf.interfaceDef', 'sitf.common', 'hzero.common'] })(
  observer(InterfaceDef)
);
