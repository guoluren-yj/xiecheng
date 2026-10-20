/**
 * RoleManagement - 接口授权
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { DataSet, Lov, Modal, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
import { Content, Header } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { isEmpty } from 'lodash';
import { HZERO_HITF, VERSION_IS_OP } from 'hzero-front/lib/utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentRole,
} from 'hzero-front/lib/utils/utils';
import { operatorRender, enableRender, TagRender } from 'hzero-front/lib/utils/renderer';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import ExcelExport from 'hzero-front/lib/components/ExcelExport';
import { openTab } from 'hzero-front/lib/utils/menuTab';
import { PERMISSION_ROLE } from '@/constants/CodeConstants';
import { SOURCE_TAGS } from '@/constants/constants';
import { tableDS, copyAuthDS } from '@/stores/ClientRole/ClientRoleDS';
import getLang from '@/langs/clientRoleLang';
import AuthDrawer from './AuthDrawer';

const currentRoleId = getCurrentRole().id;

@formatterCollections({ code: ['hzero.common', 'hitf.clientRole'] })
export default class ClientRole extends React.Component {
  constructor(props) {
    super(props);
    this.lovBtnDS = new DataSet({
      fields: [
        {
          name: 'roleIds',
          type: 'object',
          lovCode: PERMISSION_ROLE,
          lovPara: {
            enabled: true,
            tenantId: isTenantRoleLevel() ? getCurrentOrganizationId() : null,
          },
        },
      ],
      events: {
        update: this.handleCopyAuth,
      },
    });
    this.tableDS = new DataSet(
      tableDS({
        onLoad: this.handleLoad,
        onSelect: this.handleSelect,
        onUnselect: this.handleUnselect,
        onSelectAll: this.handleSelectAll,
        onUnSelectAll: this.handleUnSelectAll,
      })
    );
    this.state = {
      copyAuthLoading: false,
      selectedRecords: [], // 选中的行数据
    };
  }

  @Bind()
  handleLoad({ dataSet }) {
    dataSet.forEach((record) => {
      const tempRecord = record;
      tempRecord.selectable = this.isAuth(tempRecord, 'COPY');
    });
  }

  isAuth(record, type) {
    const { assignedFlag, adminFlag, haveAdminFlag, enabled, id } = record.toData();
    const branch =
      (assignedFlag === 1 ? 4 : 0) + (adminFlag === 1 ? 2 : 0) + (haveAdminFlag === 1 ? 1 : 0);
    const showBranchArr = [7, 5, 1];

    // 分配&管理&父级管理角色/分配&父级管理角色/父级管理角色 同时角色是启用状态，不能给当前角色本身授权
    let isAuth = showBranchArr.includes(branch) && enabled && currentRoleId !== id;
    if (type === 'AUTH') {
      // 复制授权
      // 分配&管理&父级管理角色/分配&父级管理角色/父级管理角色 同时角色是启用状态，当前角色本身可以查看授权
      isAuth = showBranchArr.includes(branch) && enabled;
    }
    return isAuth;
  }

  @Bind()
  handleSelect({ dataSet }) {
    this.setState({
      selectedRecords: dataSet.selected,
    });
  }

  @Bind()
  handleUnselect({ dataSet }) {
    this.setState({
      selectedRecords: dataSet.selected,
    });
  }

  @Bind()
  handleSelectAll({ dataSet }) {
    this.setState({
      selectedRecords: dataSet.selected,
    });
  }

  @Bind()
  handleUnSelectAll() {
    this.setState({
      selectedRecords: [],
    });
  }

  @Bind()
  openAuthDrawer(record) {
    const {
      match: { path },
    } = this.props;
    const modalProps = {
      path,
      roleId: record.get('id'),
    };
    Modal.open({
      title: getLang('HEADER'),
      drawer: true,
      style: { width: 800 },
      okText: getLang('CLOSE'),
      children: <AuthDrawer {...modalProps} />,
      footer: (okBtn) => okBtn,
    });
  }

  /**
   * 导入客户端授权
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/hpfm/prompt/import-data/HITF.ROLE_PERMISSION`,
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
    const fieldsValue = this.tableDS.queryDataSet.current.toData();
    return fieldsValue;
  }

  /**
   * 复制授权
   */
  @Bind()
  handleCopyAuth({ value }) {
    const selectedData = this.tableDS.selected.map((record) => record.get('id'));
    const tempCopyAuthDS = new DataSet(copyAuthDS({ roleId: value.id }));
    tempCopyAuthDS.create({ submittedData: selectedData });
    this.setState({ copyAuthLoading: true });
    return tempCopyAuthDS
      .submit()
      .then((res) => {
        if (res && !res.failed) {
          this.tableDS.query();
          this.lovBtnDS.current.init('roleIds');
          this.setState({ selectedRecords: [] });
        }
      })
      .finally(() => {
        this.setState({ copyAuthLoading: false });
      });
  }

  get columns() {
    return [
      !VERSION_IS_OP &&
        !isTenantRoleLevel() && {
          name: 'tenantName',
          width: 180,
        },
      {
        name: 'name',
        width: 200,
      },
      {
        name: 'code',
        width: 300,
      },
      !VERSION_IS_OP &&
        !isTenantRoleLevel() && {
          name: 'level',
          width: 80,
        },
      {
        name: 'parentRoleName',
      },
      !isTenantRoleLevel() && {
        name: 'roleSource',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, SOURCE_TAGS, record.get('roleSourceMeaning')),
      },
      {
        name: 'inheritedRoleName',
        width: 180,
      },
      {
        name: 'enabled',
        width: 80,
        align: 'center',
        renderer: ({ value }) => enableRender(value ? 1 : 0),
      },

      {
        name: 'levelPath',
        width: 500,
      },
      {
        header: getLang('OPERATOR'),
        width: 80,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            this.isAuth(record, 'AUTH') && {
              ele: (
                <ButtonPermission type="text" onClick={() => this.openAuthDrawer(record)}>
                  {getLang('AUTH')}
                </ButtonPermission>
              ),
              key: 'auth',
              len: 2,
              title: this.isAuth(record, 'AUTH_TIP') ? getLang('AUTH') : getLang('AUTH_TIP'),
            },
          ];
          return operatorRender(actions, record);
        },
      },
    ];
  }

  /**
   * render
   * @return React.element
   */
  render() {
    const {
      match: { path },
    } = this.props;
    const { selectedRecords, copyAuthLoading } = this.state;
    const organizationId = getCurrentOrganizationId();

    return (
      <>
        <Header title={getLang('HEADER')}>
          {/** Lov在按钮模式下，如果为disabled状态，会被渲染成span而不是button,因此采用一下方式临时解决样式问题 */}
          {!isEmpty(selectedRecords) && (
            <Lov
              name="roleIds"
              mode="button"
              icon="content_copy"
              color="primary"
              clearButton={false}
              dataSet={this.lovBtnDS}
              loading={copyAuthLoading}
            >
              {getLang('COPY_AUTH')}
            </Lov>
          )}
          {isEmpty(selectedRecords) && (
            <ButtonPermission disabled type="c7n-pro" icon="content_copy" color="primary">
              {getLang('COPY_AUTH')}
            </ButtonPermission>
          )}
          <ExcelExport
            exportAsync
            requestUrl={`${HZERO_HITF}/v1/${
              isTenantRoleLevel() ? `${organizationId}/client-roles/export` : 'client-roles/export'
            }`}
            otherButtonProps={{ icon: 'file_upload', type: 'c7n-pro' }}
            queryParams={this.getExportQueryParams}
          />
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.Import`,
                type: 'button',
                meaning: '接口角色授权-导入',
              },
            ]}
            type="c7n-pro"
            icon="get_app"
            onClick={this.handleImport}
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
