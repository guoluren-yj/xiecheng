/**
 * index - 接口平台-授权客户端
 * @date: 2019-6-06
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import ExcelExport from 'hzero-front/lib/components/ExcelExport';
import { openTab } from 'hzero-front/lib/utils/menuTab';
import { omit } from 'lodash';
import { operatorRender, yesOrNoRender, TagRender } from 'hzero-front/lib/utils/renderer';
import getLang from '@/langs/clientAuthLang';
import { tableDS } from '@/stores/ClientAuth/ClientAuthDS';
import { STATISTIC_LEVEL_TAGS } from '@/constants/constants';
import AuthDrawer from './AuthDrawer';
import EditDrawer from './EditDrawer';

@formatterCollections({ code: ['hzero.common', 'hitf.clientAuth'] })
export default class ClientAuth extends PureComponent {
  constructor(props) {
    super(props);
    this.tableDS = new DataSet(tableDS());
  }

  /**
   * 导入客户端授权
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/hpfm/prompt/import-data/HITF.CLIENT_AUTH`,
      title: 'hzero.common.button.import',
      search: queryString.stringify({
        action: 'hzero.common.button.import',
        prefixPatch: HZERO_HITF,
      }),
    });
  }

  /**
   * 获取导出字段查询参数
   */
  @Bind()
  getExportQueryParams() {
    const fieldsValue = omit(this.tableDS.queryDataSet.current.toData(), ['__dirty']);
    return fieldsValue;
  }

  openEditDrawer(record) {
    const drawerProps = {
      clientOauthId: record.get('id'),
      currentOrganizationId: record.get('organizationId'),
      currentTenantId: record.get('tenantId'),
    };
    Modal.open({
      title: getLang('HEADER'),
      drawer: true,
      style: { width: 800 },
      okText: getLang('SAVE'),
      children: <EditDrawer {...drawerProps} />,
    });
  }

  openAuthDrawer(record) {
    const drawerProps = {
      clientId: record.get('name'),
    };
    Modal.open({
      title: getLang('AUTHED_INTERFACE'),
      drawer: true,
      style: { width: 800 },
      okText: getLang('CLOSE'),
      children: <AuthDrawer {...drawerProps} />,
      footer: (okBtn) => okBtn,
    });
  }

  get columns() {
    return [
      !isTenantRoleLevel() && {
        name: 'clientTenantName',
        width: 180,
      },
      {
        name: 'name',
        width: 180,
      },
      {
        name: 'statisticsLevel',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, STATISTIC_LEVEL_TAGS, record.get('statisticsLevelMeaning')),
      },
      {
        name: 'remark',
      },
      {
        name: 'authFlag',
        width: 100,
        align: 'center',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        header: getLang('OPERATOR'),
        width: 120,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            {
              ele: (
                <ButtonPermission type="text" onClick={() => this.openEditDrawer(record)}>
                  {getLang('EDIT')}
                </ButtonPermission>
              ),
              key: 'edit',
              len: 2,
              title: getLang('EDIT'),
            },
            {
              ele: (
                <ButtonPermission type="text" onClick={() => this.openAuthDrawer(record)}>
                  {getLang('VIEW_AUTH')}
                </ButtonPermission>
              ),
              key: 'viewAuth',
              len: 4,
              title: getLang('VIEW_AUTH'),
            },
          ];
          return operatorRender(actions, record);
        },
      },
    ];
  }

  render() {
    const {
      match: { path },
    } = this.props;
    const organizationId = getCurrentOrganizationId();
    return (
      <>
        <Header title={getLang('HEADER')}>
          <ExcelExport
            requestUrl={`${HZERO_HITF}/v1/${
              isTenantRoleLevel() ? `${organizationId}/client-auths/export` : '/client-auths/export'
            }`}
            otherButtonProps={{ icon: 'file_upload', type: 'c7n-pro' }}
            queryParams={this.getExportQueryParams}
          />
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.Import`,
                type: 'button',
                meaning: '授权客户端-导入',
              },
            ]}
            type="c7n-pro"
            icon="get_app"
            onClick={this.handleImport.bind(this)}
          >
            {getLang('IMPORT')}
          </ButtonPermission>
        </Header>
        <Content>
          <Table dataSet={this.tableDS} columns={this.columns} />
        </Content>
      </>
    );
  }
}
