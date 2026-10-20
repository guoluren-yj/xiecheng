/*
 * Partnership - 合作关系查询
 * @date: 2018-8-7
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Tabs, Tooltip, Modal, Tag } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty, isFunction } from 'lodash';

import { getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN } from 'utils/constants';
import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { Button as PermissionButton } from 'components/Permission';
import notification from 'utils/notification';

import GroupQuery from './GroupQuery';
import CompanyQuery from './CompanyQuery';
import Partner from './PartnerQuery';

const { TabPane } = Tabs;

@connect(({ partnership, loading }) => ({
  partnerQueryProps: {
    partnership,
    loading: loading.effects['partnership/queryPartnership'],
    loadingDetail: loading.effects['partnership/queryActionDetail'],
    tenantId: getCurrentOrganizationId(),
  },
  groupQueryProps: {
    partnership,
    loading: loading.effects['partnership/queryGroupData'],
    saving: loading.effects['partnership/updateGroupData'],
  },
  companyQueryProps: {
    partnership,
    loading: loading.effects['partnership/queryCompanyData'],
    saving: loading.effects['partnership/updateCompanyData'],
  },
}))
@formatterCollections({ code: ['spfm.partnership', 'spfm.supplier', 'sslm.common'] })
export default class Partnership extends React.Component {
  groupFormRef;

  companyFormRef;

  partnerFormRef;

  constructor(props) {
    super(props);
    this.state = {
      tabFlag: 'group',
      tenantId: getCurrentOrganizationId(),
      requestUrl: `${SRM_PLATFORM}/v1/groups/export`,
      selectedRows: [],
      reclaimAdminLoading: false,
    };
  }

  componentDidMount() {
    this.queryIdpValue();
    this.handleGroupRef();
  }

  /**
   * 初始化查询值集
   */
  @Bind()
  queryIdpValue() {
    const { dispatch } = this.props;
    dispatch({
      type: 'partnership/queryIdpValue',
    });
  }

  @Bind()
  changTab(key) {
    const state = {
      tabFlag: key,
      requestUrl: '',
    };
    // 判断是哪一个Tab
    switch (key) {
      case 'company':
        state.requestUrl = `${SRM_PLATFORM}/v1/companies/site/export`;
        break;
      case 'group':
        state.requestUrl = `${SRM_PLATFORM}/v1/groups/export`;
        break;
      case 'relation':
        state.requestUrl = `${SRM_PLATFORM}/v1/partners/export`;
        break;
      default:
        state.requestUrl = `${SRM_PLATFORM}/v1/groups/export`;
        break;
    }
    this.setState(state);
  }

  @Bind()
  handleGroupRef(ref = {}) {
    this.groupFormRef = ref;
  }

  @Bind()
  handleCompanyRef(ref = {}) {
    this.companyFormRef = ref;
  }

  @Bind()
  handlePartnerRef(ref = {}) {
    this.partnerFormRef = ref;
  }

  // 装换查询参数,主要考虑导出与导入
  @Bind()
  parseParams(params = {}) {
    const { page = {}, sort = {}, ...otherValues } = params;
    if (sort.order === 'ascend') {
      sort.order = 'asc';
    }
    if (sort.order === 'descend') {
      sort.order = 'desc';
    }
    const sortObj = {};
    if (!isEmpty(sort)) sortObj.sort = `${sort.field},${sort.order}`;
    return {
      ...page,
      ...sortObj,
      ...otherValues,
    };
  }

  @Bind()
  getQueueParams() {
    const { tabFlag = 'group', tenantId } = this.state;
    let queryParams = {};
    let partnerParams = {};
    switch (tabFlag) {
      case 'company':
        queryParams = this.companyFormRef && this.companyFormRef.companyForm;
        break;
      case 'group':
        queryParams = this.groupFormRef && this.groupFormRef.groupForm;
        break;
      case 'relation':
        partnerParams = this.partnerFormRef && this.partnerFormRef.filterForm.props.form;
        break;
      default:
        queryParams = this.groupFormRef && this.groupFormRef.groupForm;
    }

    if (!isUndefined(queryParams) && !isEmpty(queryParams)) {
      const formParams = queryParams.getFieldsValue();
      const { sort = {} } = queryParams;
      const { registerTimeFrom, registerTimeTo, coreFlag } = formParams;
      const params = {
        ...formParams,
        sort,
        registerTimeFrom: registerTimeFrom ? registerTimeFrom.format(DATETIME_MIN) : undefined,
        registerTimeTo: registerTimeTo ? registerTimeTo.format(DATETIME_MIN) : undefined,
        coreFlag: isUndefined(coreFlag) ? '' : coreFlag ? 1 : 0,
      };
      return this.parseParams(params);
    } else if (!isUndefined(partnerParams) && !isEmpty(partnerParams)) {
      const partParams = partnerParams.getFieldsValue();
      const { inviteDateFrom, inviteDateTo } = partParams;
      const partnerQueueParam = {
        ...partParams,
        tenantId,
        inviteDateFrom: inviteDateFrom ? inviteDateFrom.format(DATETIME_MIN) : undefined,
        inviteDateTo: inviteDateTo ? inviteDateTo.format(DATETIME_MIN) : undefined,
      };
      return this.parseParams(partnerQueueParam);
    } else {
      return {
        page: 0,
        size: 10,
      };
    }
  }

  @Bind()
  handleReclaimTenantAdmin() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    this.setState({
      reclaimAdminLoading: true,
    });
    if (selectedRows.length < 1) {
      notification.warning({
        message: intl.get('spfm.partnership.view.message.noDataWaring').d('请选择需要回收的供应商'),
      });
      this.setState({
        reclaimAdminLoading: false,
      });
    } else {
      Modal.confirm({
        title: intl
          .get(`spfm.partnership.view.message.reclaimTenantAdminContent`)
          .d('操作无法撤回，请确认是否回收'),
        onOk: () => {
          dispatch({
            type: 'partnership/recycleAdminRole',
            payload: [...selectedRows],
          }).then((res) => {
            if (res && res.failed) {
              notification.error({ description: res.message });
              this.setState({
                reclaimAdminLoading: false,
              });
            } else {
              this.setState({
                selectedRows: [],
                reclaimAdminLoading: false,
              });
              if (isFunction(this.handleQuery)) {
                this.handleQuery();
              }
              notification.success();
            }
          });
        },
        onCancel: () => {
          this.setState({
            reclaimAdminLoading: false,
          });
        },
      });
    }
  }

  /**
   * handleSelectChange - 选择列表行
   * @param {object[]} selectedRows - 已选择的行
   */
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 获取查询数据方法
   */
  getHandleQuery = (getQuery) => {
    this.handleQuery = getQuery;
  };

  render() {
    const {
      partnerQueryProps,
      groupQueryProps,
      companyQueryProps,
      ...otherCommonProps
    } = this.props;
    const { requestUrl, tabFlag, selectedRows, reclaimAdminLoading } = this.state;
    const groupParams = {
      onRef: this.handleGroupRef,
    };
    const companyParams = {
      onRef: this.handleCompanyRef,
    };
    const partnerParams = {
      onRef: this.handlePartnerRef,
    };
    const rowSelection = {
      selectedRows,
      selectedRowKeys: selectedRows.map((n) => n.inviteId),
      onChange: this.handleSelectChange,
      getCheckboxProps: (record) => {
        return {
          disabled: ['INVITING'].includes(record.inviteStatus),
        };
      },
    };
    const reclaimTenantAdminTip = intl
      .get('spfm.partnership.view.message.reclaimTenantAdminTip')
      .d(
        '批量回收供应商的租户管理员角色，并分配仅供应商使用的新的管理员角色。同时按钮需要做权限集'
      );

    return (
      <React.Fragment>
        <Header title={intl.get('spfm.partnership.view.message.title').d('合作关系查询')}>
          <ExcelExport
            requestUrl={requestUrl}
            queryParams={this.getQueueParams()}
            otherButtonProps={{ icon: 'export', type: 'primary' }}
          />
          {tabFlag === 'relation' && (
            <Tooltip title={reclaimTenantAdminTip}>
              <PermissionButton
                onClick={() => this.handleReclaimTenantAdmin()}
                style={{ marginLeft: 8 }}
                loading={reclaimAdminLoading}
                permissionList={[
                  {
                    code: `srm.partner-mgmt.rel.partnership-list.api.admin-role.recycle`,
                    type: 'button',
                    meaning: '回收租户管理员',
                  },
                ]}
              >
                {intl
                  .get('spfm.partnership.view.btn.reclaimTenantAdministrator')
                  .d('回收租户管理员')}
              </PermissionButton>
            </Tooltip>
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <Tabs defaultActiveKey="group" animated={false} onChange={this.changTab}>
              <TabPane tab={intl.get('spfm.partnership.view.message.group').d('集团')} key="group">
                <GroupQuery {...groupQueryProps} {...otherCommonProps} {...groupParams} />
              </TabPane>
              <TabPane
                tab={intl.get('spfm.partnership.view.message.company').d('企业')}
                key="company"
              >
                <CompanyQuery {...companyQueryProps} {...otherCommonProps} {...companyParams} />
              </TabPane>
              <TabPane
                tab={intl.get('spfm.partnership.view.message.relation').d('合作关系')}
                key="relation"
              >
                <Tag
                  color="blue"
                  style={{
                    fontSize: 14,
                    padding: 6,
                    marginBottom: 16,
                    whiteSpace: 'break-spaces',
                    height: 'auto',
                  }}
                >
                  {intl
                    .get('spfm.partnership.view.message.relationMsg')
                    .d(
                      '查询条件为精确查询，需要输入准确的名称或编码。可以先在【企业】页签模糊查询获取平台内准确的名称和编码，确保企业已经注册过，再以准确的名称或编码作为本页签输入的查询条件。'
                    )}
                </Tag>
                <Partner
                  {...partnerQueryProps}
                  {...otherCommonProps}
                  {...partnerParams}
                  rowSelection={rowSelection}
                  onHandleQueryHook={this.getHandleQuery}
                />
              </TabPane>
            </Tabs>
          </div>
        </Content>
      </React.Fragment>
    );
  }
}
