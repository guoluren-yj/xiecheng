/**
 * Orgination - 员工定义
 * @date: 2018-6-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Menu, Dropdown, Icon } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import queryString from 'querystring';
import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from 'hzero-front/lib/components/Import';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { Button as PermissionButton } from 'components/Permission';
import {
  addItemToPagination,
  delItemToPagination,
  filterNullValueObject,
  getCurrentOrganizationId,
  getEditTableData,
} from 'utils/utils';
import {
  // withFlexFieldsQueryParams,
  withFormDataFlex,
} from '@/components/Flex/FlexFields/utils';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { openTab } from 'utils/menuTab';
// import withFlexFields from '@/routes/components/Flex/FlexFields/withFlexFields';
import { queryPermissions } from '@/services/employeeService';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import styles from './index.less';

// const flexModelCode = 'HPFM.EMPLOYEE';

/**
 * 业务组件 - 员工定义
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} employee - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {!String} tenantId - 租户ID
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
// @withFlexFields(flexModelCode)
@connect(({ employee, loading }) => ({
  employee,
  loading: loading.effects['employee/fetchEmployeeData'],
  saveLoading: loading.effects['employee/saveEmployee'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hpfm.employee', 'entity.employee'] })
@withCustomize({
  unitCode: ['HPFM.EMPLOYEE_DEFINITION.HEADER_FILTER', 'HPFM.EMPLOYEE_DEFINITION.LINE.GRID', 'HPFM.EMPLOYEE_DEFINITION.BTNS'],
})
export default class List extends Component {
  /**
   * state初始化
   * @param {object} props - 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {
      // flexFieldsConfig: [],
      importPermissions: {},
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      employee: { pagination = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = _back === -1 ? pagination : {};
    this.fetchEnum();
    this.handleSearchEmployee(page);
    // getFlexFieldsConfig(ruleCode).then(flexFieldsConfig => {
    //   this.setState({
    //     flexFieldsConfig,
    //   });
    // });
    this.getImportPermissions();
  }

  getImportPermissions = () => {
    const importCodeList = [
      'hzero.organization.staff.ps.new.employee.list.import',
      'hzero.organization.staff.ps.new.employee.assign.import',
      'hzero.organization.staff.ps.new.position.assign.import',
    ];

    queryPermissions(importCodeList).then((res) => {
      if (res && !res.failed) {
        const importPermissions = {};
        res.forEach((item) => {
          if (item.code === 'hzero.organization.staff.ps.new.employee.list.import') {
            importPermissions.list = item;
          } else if (item.code === 'hzero.organization.staff.ps.new.employee.assign.import') {
            importPermissions.assignItem = item;
          } else if (item.code === 'hzero.organization.staff.ps.new.position.assign.import') {
            importPermissions.assign = item;
          }
        });
        this.setState({ importPermissions });
      }
    });
  };

  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'employee/fetchEnum',
    });
  }

  /**
   * 查询
   * @param {Object} fields 查询参数
   */
  @Bind()
  handleSearchEmployee(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'employee/fetchEmployeeData',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        customizeUnitCode:
          'HPFM.EMPLOYEE_DEFINITION.LINE.GRID,HPFM.EMPLOYEE_DEFINITION.HEADER_FILTER',
        ...fieldValues, // 表单查询值
      },
    });
  }

  /**
   * 新增员工信息
   */
  @Bind()
  handleAddEmployee() {
    const {
      dispatch,
      tenantId,
      employee: { list = [], pagination = {} },
    } = this.props;
    const newItem = {
      tenantId,
      cid: '',
      employeeNum: '',
      name: '',
      superiorEmployeeId: '',
      superiorEmployeeNum: '',
      superiorEmployeeName: '',
      email: '',
      mobile: '',
      employeeId: uuidv4(),
      enabledFlag: 1, // 启用标记
      _status: 'create', // 新建员工标记位
    };
    dispatch({
      type: 'employee/updateState',
      payload: {
        list: [newItem, ...list],
        pagination: addItemToPagination(list.length, pagination),
      },
    });
  }

  /**
   * 员工信息批量保存
   * 保存对象: 新增数据
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      tenantId,
      employee: { list = [], pagination = {} },
    } = this.props;
    const params = getEditTableData(list, ['employeeId']);
    if (Array.isArray(params) && params.length !== 0) {
      dispatch({
        type: 'employee/saveEmployee',
        payload: {
          tenantId,
          customizeUnitCode: 'HPFM.EMPLOYEE_DEFINITION.LINE.GRID',
          saveData: [...params].map((o) => withFormDataFlex(o)),
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearchEmployee(pagination);
        }
      });
    }
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchImport() {
    openTab({
      key: '/hpfm/hr/staff/data-import/HPFM.EMPLOYEE',
      search: queryString.stringify({
        key: '/hpfm/hr/staff/data-import/HPFM.EMPLOYEE',
        title: 'hzero.common.title.batchImport',
        action: 'hzero.common.title.batchImport',
        // auto: true,
      }),
    });
  }

  @Bind()
  handleImport(code) {
    let retitle = '';
    if (code === 'SPFM.EMPLOYEE_USER.IMPORT') {
      retitle = 'hzero.common.title.userImport';
    } else {
      retitle = 'hzero.common.title.stationImport';
    }
    openTab({
      key: `/hpfm/hr/staff/sub-import/${code}`,
      title: retitle,
      search: queryString.stringify({
        key: `/hpfm/hr/staff/sub-import/${code}`,
        action: retitle,
      }),
    });
  }

  /**
   * 清除新增员工信息
   * @param {Object} record 员工信息
   */
  @Bind()
  handleCleanLine(record) {
    const {
      dispatch,
      employee: { list = [], pagination = {} },
    } = this.props;
    const newList = list.filter((item) => item.employeeId !== record.employeeId);
    dispatch({
      type: 'employee/updateState',
      payload: {
        list: [...newList],
        pagination: delItemToPagination(list.length, pagination),
      },
    });
  }

  /**
   * 获取员工明细，跳转明细页面
   * @param {number} employeeId - 员工Id
   * @param {number} employeeNum - 员工编码
   */
  @Bind()
  handleEditEmployee(employeeId, employeeNum) {
    const { dispatch } = this.props;
    // 清除明细缓存
    dispatch({
      type: 'employee/updateState',
      payload: {
        positionList: [],
        userList: [],
      },
    });
    dispatch(
      routerRedux.push({
        pathname: `/hpfm/hr/staff/detail/${employeeId}/${encodeURIComponent(employeeNum)}`,
      })
    );
  }

  /**
   * 设置form对象
   * @param {object} ref - FilterForm子组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  getSaveBtnDisabled() {
    const {
      employee: { list = [] },
    } = this.props;
    return !list.some((record) => record._status === 'create');
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      saveLoading,
      employee: {
        list = [],
        pagination = {},
        lov: { employeeStatus = [], employeeGender = [], idd = [] },
      },
      // flexFieldsMiddleware = {},
      tenantId,
      customizeFilterForm,
      customizeTable,
      customizeBtnGroup,
    } = this.props;
    const { importPermissions } = this.state;
    // const { flexFieldsConfig } = this.state;
    // const { FlexFieldsButton } = flexFieldsMiddleware;

    const filterProps = {
      customizeFilterForm,
      onSearch: this.handleSearchEmployee,
      onRef: this.handleBindRef,
      // flexFieldsMiddleware,
    };
    const listProps = {
      pagination,
      loading,
      dataSource: list,
      onClean: this.handleCleanLine,
      onEdit: this.handleEditEmployee,
      onSearch: this.handleSearchEmployee,
      employeeStatus,
      employeeGender,
      idd,
      customizeTable,
      // flexFieldsTriggers: flexFieldsMiddleware.flexFieldsTriggers || [],
      onRef: (node) => {
        this.list = node;
      },
    };
    const params = this.form && this.form.getFieldsValue();

    return (
      <Fragment>
        <Header title={intl.get('hpfm.employee.view.message.title.define').d('员工定义')}>
          {customizeBtnGroup({ code: 'HPFM.EMPLOYEE_DEFINITION.BTNS' }, [
            <PermissionButton
              data-name="save"
              icon="save"
              type="primary"
              onClick={this.handleSave}
              loading={saveLoading}
              disabled={loading || this.getSaveBtnDisabled()}
              permissionList={[
                {
                  code: `hzero.organization.staff.hpfm.hr.staff.list.button.save`,
                  type: 'button',
                  meaning: '保存',
                },
              ]}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </PermissionButton>,
            <PermissionButton
              data-name="create"
              icon="plus"
              onClick={this.handleAddEmployee}
              permissionList={[
                {
                  code: `hzero.organization.staff.hpfm.hr.staff.list.button.create`,
                  type: 'button',
                  meaning: '新建',
                },
              ]}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </PermissionButton>,
            <ExcelExportPro
              data-name="newExport"
              templateCode="HPFM_EMPLOYEE_LIST_EXPORT"
              buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
              requestUrl={`/hpfm/v1/${tenantId}/employees/export`}
              queryParams={params}
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: `hzero.organization.staff.ps.new.employee.list.export`,
                    type: 'button',
                  },
                ],
              }}
            />,
          importPermissions?.list?.controllerType === 'hidden' &&
            importPermissions?.assignItem?.controllerType === 'hidden' &&
            importPermissions?.assign?.controllerType === 'hidden' ? (
              <></>
          ) : (
            <Dropdown
              data-name="newImport"
              overlay={
                <Menu className={styles.menu}>
                  {importPermissions?.list &&
                    importPermissions?.list?.approve === false &&
                    importPermissions?.list?.controllerType === 'hidden' ? (
                      <></>
                  ) : (
                    <Menu.Item>
                      <CommonImport
                        prefixPatch="/hpfm"
                        businessObjectTemplateCode="HPFM.EMPLOYEE"
                        buttonText={intl.get('hzero.common.title.batchImport').d('批量导入')}
                        buttonProps={{
                          disabled:
                            importPermissions?.list &&
                            importPermissions?.list?.approve === false &&
                            importPermissions?.list?.controllerType !== 'hidden',
                          // permissionList: [
                          //   {
                          //     code: `hzero.organization.staff.ps.new.employee.list.import`,
                          //     type: 'button',
                          //     meaning: '批量导入',
                          //   },
                          // ],
                        }}
                      />
                    </Menu.Item>
                  )}

                  {importPermissions?.assignItem &&
                    importPermissions?.assignItem?.approve === false &&
                    importPermissions?.assignItem?.controllerType === 'hidden' ? (
                      <></>
                  ) : (
                    <Menu.Item>
                      <CommonImport
                        prefixPatch="/hpfm"
                        businessObjectTemplateCode="SPFM.EMPLOYEE_USER.IMPORT"
                        buttonText={intl
                          .get('hpfm.employee.view.message.title.employeeAssign')
                          .d('用户分配')}
                        buttonProps={{
                          disabled:
                            importPermissions?.assignItem &&
                            importPermissions?.assignItem?.approve === false &&
                            importPermissions?.assignItem?.controllerType !== 'hidden',
                          // permissionList: [
                          //   {
                          //     code: `hzero.organization.staff.ps.new.employee.assign.import`,
                          //     type: 'button',
                          //     meaning: '用户分配',
                          //   },
                          // ],
                        }}
                      />
                    </Menu.Item>
                  )}

                  {importPermissions?.assign &&
                    importPermissions?.assign?.approve === false &&
                    importPermissions?.assign?.controllerType === 'hidden' ? (
                      <></>
                  ) : (
                    <Menu.Item>
                      <CommonImport
                        prefixPatch="/hpfm"
                        businessObjectTemplateCode="SPFM.EMPLOYEE_ASSIGN"
                        buttonText={intl
                          .get('hpfm.employee.view.message.title.subAccountImport')
                          .d('岗位分配')}
                        buttonProps={{
                          disabled:
                            importPermissions?.assign &&
                            importPermissions?.assign?.approve === false &&
                            importPermissions?.assign?.controllerType !== 'hidden',
                          // permissionList: [
                          //   {
                          //     code: `hzero.organization.staff.ps.new.position.assign.import`,
                          //     type: 'button',
                          //     meaning: '岗位分配',
                          //   },
                          // ],
                        }}
                      />
                    </Menu.Item>
                  )}
                </Menu>
              }
            >
              <PermissionButton
                data-name="newImport"
                type="c7n-pro"
                icon="archive"
                className={styles['srm-common-new-button']}
              >
                {intl.get(`hzero.common.import.new`).d('(新)导入')}
                <Icon type="expand_more" />
                <span className={styles['srm-common-export-button-tag']}> NEW </span>
              </PermissionButton>
            </Dropdown>
          ),
            <ExcelExport
              data-name="export"
              requestUrl={`/hpfm/v1/${tenantId}/employees/export`}
              queryParams={params}
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: 'hzero.organization.staff.ps.employee.list.export',
                    type: 'button',
                  },
                ],
              }}
            />,
            <PermissionButton
              data-name="batchImport"
              type="c7n-pro"
              icon="archive"
              onClick={this.handleBatchImport}
              permissionList={[
                {
                  code: `hzero.organization.staff.ps.employee.list.import`,
                  type: 'button',
                  meaning: '批量导入',
                },
              ]}
            >
              {intl.get('hzero.common.title.batchImport').d('批量导入')}
            </PermissionButton>,
            <PermissionButton
              data-name="employeeAssign"
              type="c7n-pro"
              icon="archive"
              onClick={() => this.handleImport('SPFM.EMPLOYEE_USER.IMPORT')}
              permissionList={[
                {
                  code: `hzero.organization.staff.ps.employee.assign.import`,
                  type: 'button',
                  meaning: '用户分配',
                },
              ]}
            >
              {intl.get('hpfm.employee.view.message.title.employeeAssign').d('用户分配')}
            </PermissionButton>,
            <PermissionButton
              data-name="subAccountImport"
              type="c7n-pro"
              icon="archive"
              onClick={() => this.handleImport('SPFM.EMPLOYEE_ASSIGN')}
              permissionList={[
                {
                  code: `hzero.organization.staff.ps.position.assign.import`,
                  type: 'button',
                  meaning: '岗位分配',
                },
              ]}
            >
              {intl.get('hpfm.employee.view.message.title.subAccountImport').d('岗位分配')}
            </PermissionButton>,
          ])}
          {/* <FlexFieldsButton /> */}
        </Header>
        <Content>
          <div>
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
