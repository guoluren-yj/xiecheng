/**
 * CustomerUnit - 部门
 * @date: 2018-7-31
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import lodash, { isNil, isEmpty, isUndefined, isFunction } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { HZERO_IAM } from 'utils/config';
import { Button, Drawer, Form, Input, Row, Col, Icon, Checkbox, Tooltip, Switch } from 'hzero-ui';
import Table from '@/components/VirtualTable';
import { enableRender } from 'utils/renderer';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { Table as C7NTable, DataSet, Modal } from 'choerodon-ui/pro';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import { Button as ButtonPermission } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

import { queryAuthorityUnit } from '@/services/authorityManagementService';

import styles from './index.less';

const AuthorityViewModal = Form.create({ fieldNameProp: null })((props) => {
  const { form, userId } = props;

  const { getFieldDecorator } = form;

  const [loading, setLoading] = React.useState(false);
  const [dataSource, setDataSource] = React.useState([]);
  React.useEffect(() => {
    queryValue();
  }, []);
  const columns = React.useMemo(() => {
    return [
      {
        title: intl.get('hiam.authorityManagement.model.authorityUnit.unitName').d('部门名称'),
        dataIndex: 'dataName',
        flexGrow: 1,
      },
      {
        title: intl.get('hiam.authorityManagement.model.authorityUnit.unitNum').d('部门编码'),
        dataIndex: 'dataCode',
        width: 200,
        resizable: true,
      },
      {
        title: intl.get('hiam.authorityManagement.model.authorityUnit.unitStatus').d('部门状态'),
        dataIndex: 'enabledFlag',
        width: 200,
        render: ({ rowData }) => enableRender(rowData.enabledFlag),
        resizable: true,
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityCustomer.unitCompanyName')
          .d('组织'),
        dataIndex: 'unitCompanyName',
        width: 300,
        resizable: true,
      },
    ];
  }, []);

  const queryValue = (payload = {}) => {
    setLoading(true);
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    queryAuthorityUnit({
      userId,
      page: isEmpty(payload) ? {} : payload,
      ...filterValues,
    })
      .then((res) => {
        if (getResponse(res)) {
          setDataSource(res);
          // setPagination(createPagination(res));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFormReset = () => {
    form.resetFields();
  };

  return (
    <div>
      <Form layout="inline">
        <Row gutter={24}>
          <Col span={20}>
            <Row>
              <FormItem
                label={intl
                  .get('hiam.authorityManagement.model.authorityUnit.unitName')
                  .d('部门名称')}
              >
                {getFieldDecorator('dataName')(<Input />)}
              </FormItem>
              <FormItem
                label={intl
                  .get('hiam.authorityManagement.model.authorityUnit.unitNum')
                  .d('部门编码')}
              >
                {getFieldDecorator('dataCode')(<Input trim inputChinese={false} />)}
              </FormItem>
              <FormItem
                label={intl
                  .get('hiam.authorityManagement.model.authorityCustomer.unitCompanyName')
                  .d('组织')}
              >
                {getFieldDecorator('unitCompanyId')(
                  <Lov
                    code="HPFM.UNIT.COMPANY"
                    queryParams={{ tenantId: getCurrentOrganizationId() }}
                  />
                )}
              </FormItem>
              <FormItem
                label={intl
                  .get('hiam.authorityManagement.model.authorityUnit.unitStatus')
                  .d('部门状态')}
              >
                {getFieldDecorator('enabledFlag')(
                  <ValueList lovCode="HPFM.ENABLED_FLAG" allowClear style={{ width: 150 }} />
                )}
              </FormItem>
            </Row>
          </Col>
          <Col span={4} style={{ padding: 0 }}>
            <Row>
              <FormItem>
                <Button style={{ marginRight: 0 }} onClick={handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
              </FormItem>
              <FormItem style={{ marginRight: 0 }}>
                <Button
                  type="primary"
                  onClick={() => queryValue()}
                  htmlType="submit"
                  style={{ marginRight: 0 }}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Row>
          </Col>
        </Row>
      </Form>
      <Table
        // isTree
        bordered
        rowKey="dataId"
        pagination={false}
        loading={loading}
        data={dataSource}
        expandedRowKeys={[]}
        columns={columns}
        height={600}
        onExpandChange={() => { }}
      />
    </div>
  );
});

const unitDs = ({ userId, assignedFlag }) => ({
  autoQuery: false,
  autoQueryAfterSubmit: false,
  dataToJSON: 'selected',
  fields: [
    {
      label: intl.get('hiam.authorityManagement.model.authorityUnit.unitName').d('部门名称'),
      name: 'dataName',
    },
    {
      label: intl.get('hiam.authorityManagement.model.authorityUnit.unitNum').d('部门编码'),
      name: 'dataCode',
    },
    {
      label: intl.get('hiam.authorityManagement.model.authorityUnit.unitStatus').d('部门状态'),
      name: 'enabledFlag',
    },
    {
      label: intl
        .get('hiam.authorityManagement.model.authorityCustomer.unitCompanyName')
        .d('组织'),
      name: 'unitCompanyName',
    },
  ],
  queryFields: assignedFlag === '0' ? [
    {
      label: intl.get('hiam.authorityManagement.model.authorityUnit.unitName').d('部门名称'),
      name: 'dataName',
    },
    {
      label: intl.get('hiam.authorityManagement.model.authorityUnit.unitNum').d('部门编码'),
      name: 'dataCode',
    },
    {
      label: intl.get('hiam.authorityManagement.model.authorityUnit.unitStatus').d('部门状态'),
      name: 'enabledFlag',
    },
    {
      label: intl
        .get('hiam.authorityManagement.model.authorityCustomer.unitCompanyName')
        .d('组织'),
      type: 'object',
      name: 'unitCompanyId',
      lovCode: "HPFM.UNIT.COMPANY",
      lovPara: { tenantId: getCurrentOrganizationId() },
      transformRequest: (value) => value?.unitId,
    },
  ] : [],
  transport: {
    read: ({ dataSet, data }) => {
      const fieldsValue = dataSet?.getState('fieldsValue') || {};
      if (assignedFlag === '0') {
        return {
          url: `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/users/${userId}/data/units`,
          method: 'GET',
          data: { userId, ...data },
        };
      } else {
        return {
          url: `${HZERO_IAM}/v1/${getCurrentOrganizationId()}/users/${userId}/authority/units`,
          method: 'GET',
          data: { userId, ...filterNullValueObject(fieldsValue) },
        };
      }
    },
  }
});

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 租户级权限管理 - 客户业务实体
 * @extends {Component} - React.Component
 * @reactProps {Object} authorityCompany - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hiam.authorityManagement', 'hiam.authority'] })
@cuxRemote(
  {
    code: 'HIAM_AUTHORITY_UNIT_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      renderCuxBtn: undefined,
      handleCuxShowSaveBtn: undefined,
    },
  }
)
@connect(({ authorityUnit, loading }) => ({
  authorityUnit,
  updateLoading: loading.effects['authorityUnit/updateAuthorityUnit'],
  fetchLoading: loading.effects['authorityUnit/fetchAuthorityUnitAndExpand'],
  fetchHeaderLoading: loading.effects['authorityUnit/fetchHeader'],
  updateFlagLoading: loading.effects['authorityUnit/addAuthorityUnit'],
  refreshLoading: loading.effects['authorityUnit/fetchAuthorityUnit'],
}))
export default class CustomerUnit extends React.Component {
  /**
   *Creates an instance of CustomerUnit.
   * @param {Object} props 属性
   * @memberof CustomerUnit
   */
  constructor(props) {
    super(props);
    this.state = {
      expanded: true,
      queryParams: {},
      checkListState: [],
      tableType: 'tree',
      settingTableType: 'tree',
      checkSubsetFlag: 0,
    };
    this.preAuthRoleId = '';
    const {
      authRoleId,
      queryParams: { userId },
    } = this.props;
    console.log(authRoleId)
    this.dataSet = new DataSet(unitDs({ roleId: authRoleId, userId }))
  }

  componentDidMount() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
      dispatch,
    } = this.props;
    dispatch({
      type: 'authorityUnit/fetchAuthorityUnitSetting',
    }).then((res) => {
      console.log(res)
      this.setState(() => ({
        tableType: ['1', 1]?.includes(res) ? "tree" : 'tile',
        settingTableType: ['1', 1]?.includes(res) ? 'tree' : 'tile',
      }));
      if (this.preAuthRoleId !== authRoleId && activeKey === 'UNIT' && !isNil(userId)) {
        this.preAuthRoleId = authRoleId;
        if (!['1', 1]?.includes(res)) {
          this.queryValue();
          this.dataSet.query()
        } else {
          this.dataSet.query()
        }
      }
    });
  }

  componentDidUpdate() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
    } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'UNIT' && !isNil(userId)) {
      this.preAuthRoleId = authRoleId;
      this.queryValue();
    }
  }

  /**
   *刷新数据
   */
  @Bind()
  refreshValue() {
    const {
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;

    const staticData = {
      userId,
      authorityTypeCode: 'UNIT',
    };

    const { queryParams, settingTableType } = this.state;
    dispatch({
      type: 'authorityUnit/fetchHeader',
      payload: {
        authorityTypeCode: 'UNIT',
        userId,
      },
    });
    if (settingTableType === 'tree') {
      dispatch({
        type: 'authorityUnit/fetchAuthorityUnit',
        payload: {
          authRoleId,
          ...queryParams,
          ...staticData,
        },
      }).then(() => {
        const {
          authorityUnit: { checkList = [] },
        } = this.props;
        this.setState({
          checkListState: checkList,
        });
      });
    }
  }

  /**
   *保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      authorityUnit: { initCheckList = [], checkList = [], originList = [] },
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const { queryParams } = this.state;
    let allCheckList = [];
    if (queryParams.dataCode || queryParams.dataName || queryParams.unitCompanyId) {
      const allDataKey = originList.map((e) => e.dataId);
      allCheckList = initCheckList
        .filter((item) => !allDataKey.includes(item.dataId))
        .concat(checkList);
    } else {
      allCheckList = checkList;
    }
    dispatch({
      type: 'authorityUnit/updateAuthorityUnit',
      payload: {
        checkList: allCheckList,
        userId,
        authRoleId,
      },
    }).then((response) => {
      if (response) {
        this.refreshValue();
        this.dataSet.query()
        notification.success();
      }
    });
  }

  /**
   *查询数据
   */
  @Bind()
  queryValue() {
    const {
      form,
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const { settingTableType } = this.state
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        this.setState({
          queryParams: fieldsValue,
          expanded: false,
        });
        this.dataSet?.setState('fieldsValue', fieldsValue);
        this.dataSet.query();
        dispatch({
          type: 'authorityUnit/fetchHeader',
          payload: {
            authorityTypeCode: 'UNIT',
            userId,
          },
        });
        if (settingTableType === 'tree') {
          dispatch({
            type: 'authorityUnit/fetchAuthorityUnitAndExpand',
            payload: {
              ...fieldsValue,
              userId,
              authRoleId,
            },
          }).then(() => {
            const {
              authorityUnit: { checkList = [] },
            } = this.props;
            this.setState({
              checkListState: checkList,
            });
          });
        }
      }
    });
  }

  /**
   *设置选中
   *
   * @param {* Array} rows 选中的行
   */
  @Bind()
  setSelectRows(rows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'authorityUnit/updateCheckList',
      payload: { checkList: lodash.uniqBy(rows, 'dataId') },
    });
  }

  /**
   *表格选中事件
   *
   * @param {*} _ 占位
   * @param {* Array} rows 选中行数据
   */
  @Bind()
  handleSelectRows(_, rows) {
    this.setSelectRows(rows);
  }

  /**
   *点击展开节点触发方法
   *
   * @param {* Boolean} expanded 展开收起标志
   * @param {* Object} record 行记录
   */
  @Bind()
  onExpand(expanded, record = {}) {
    const {
      dispatch,
      authorityUnit: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'authorityUnit/updateExpanded',
      payload: expanded
        ? expandedRowKeys.concat(record.dataId)
        : expandedRowKeys.filter((o) => o !== record.dataId),
    });
  }

  /**
   *全部展开和收起
   */
  @Bind()
  handleExpand() {
    const {
      dispatch,
      authorityUnit: { originList = [] },
    } = this.props;
    const { expanded } = this.state;
    dispatch({
      type: 'authorityUnit/updateExpanded',
      payload: expanded ? originList.map((list) => list.dataId) : [],
    });
    this.setState({
      expanded: !expanded,
    });
  }

  /**
   *点击加入全部后触发事件
   *
   * @param {Boolean} checked switch的value值
   */
  @Bind()
  includeAllFlag(checked) {
    const {
      dispatch,
      queryParams: { userId },
      authorityUnit: { header = {} },
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityUnit/addAuthorityUnit',
      payload: {
        authorityTypeCode: 'UNIT',
        userId,
        userAuthority: {
          ...header,
          includeAllFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
      },
    }).then((response) => {
      if (response) {
        dispatch({
          type: 'authorityUnit/fetchHeader',
          payload: {
            authorityTypeCode: 'UNIT',
            userId,
          },
        });
        notification.success();
      }
    });
  }

  /**
   *点击包含空值后触发事件
   *
   * @param {Boolean} checked switch的value值
   */
  @Bind()
  @Debounce(500)
  includeNullFlag(e) {
    const { checked } = e.target;
    const {
      dispatch,
      queryParams: { userId },
      authorityUnit: { header = {} },
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityUnit/addAuthorityUnit',
      payload: {
        authorityTypeCode: 'UNIT',
        userId,
        userAuthority: {
          ...header,
          includeNullFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
      },
    }).then((response) => {
      if (response) {
        dispatch({
          type: 'authorityUnit/fetchHeader',
          payload: {
            authorityTypeCode: 'UNIT',
            userId,
          },
        });
        notification.success();
      }
    });
  }

  @Bind()
  fetchHeaderData() {
    const {
      dispatch,
      queryParams: { userId },
    } = this.props;
    dispatch({
      type: 'authorityUnit/fetchHeader',
      payload: {
        authorityTypeCode: 'UNIT',
        userId,
      },
    });
  }

  /**
 *删除方法
 */
  @Bind()
  remove() {
    const {
      dispatch,
      authRoleId,
      queryParams: { userId },
    } = this.props;
    const onOk = () => {
      const selectRows = this.dataSet.toJSONData();
      return new Promise((resolve) => {
        dispatch({
          type: 'authorityUnit/deleteAuthorityUnit',
          payload: {
            userId,
            authRoleId,
            deleteRows: selectRows,
          },
        }).then((response) => {
          if (response) {
            resolve();
            this.dataSet.query();
            this.refreshValue();
            notification.success();
          }
        });
      })
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  @Bind()
  onShowAddModal() {
    const {
      dispatch,
      queryParams: { userId },
      authorityUnit: { header = {} },
    } = this.props;
    const unAssiginedDs = new DataSet(unitDs({ userId, assignedFlag: '0' }));
    unAssiginedDs.query();
    Modal.open({
      closable: true,
      title: intl.get('hiam.authorityManagement.view.button.table.create.unit').d('新建部门权限'),
      drawer: true,
      style: {
        width: 1020,
      },
      children: <C7NTable dataSet={unAssiginedDs} columns={[{
        name: 'dataName',
      },
      {
        name: 'dataCode',
      },
      {
        name: 'enabledFlag', renderer: ({ value }) => enableRender(value),
      },
      {
        name: 'unitCompanyName',
        width: 400,
      }]} />,
      onOk: async () => {
        const data = unAssiginedDs.toJSONData();
        if (data?.length > 0) {
          console.log(dispatch)
          return new Promise((resolve, reject) => {
            dispatch({
              type: 'authorityUnit/addAuthorityUnit',
              payload: {
                userId,
                authorityTypeCode: 'UNIT',
                userAuthority: {
                  ...header,
                },
                userAuthorityLineList: data,
              },
            }).then((response) => {
              if (response) {
                this.dataSet.query();
                this.refreshValue();
                notification.success();
                resolve();
              } else {
                return reject();
              }
            })
          });
        } else {
          notification.warning({
            message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
          });
        }
      },
    });
  }


  /**
   *渲染查询结构
   *
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const {
      updateLoading,
      fetchLoading,
      updateFlagLoading,
      fetchHeaderLoading,
      authorityUnit,
      remote,
      dispatch,
    } = this.props;
    const { header = {} } = authorityUnit || {};
    const { expanded, tableType, settingTableType, checkSubsetFlag } = this.state;
    const { renderCuxBtn, handleCuxShowSaveBtn } = remote.props?.process || {};
    return (
      <Form layout="inline">
        <Row gutter={24} {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityUnit.unitName')
                    .d('部门名称')}
                >
                  {getFieldDecorator('dataName')(<Input />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityUnit.unitNum')
                    .d('部门编码')}
                >
                  {getFieldDecorator('dataCode')(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityCustomer.unitCompanyName')
                    .d('组织')}
                >
                  {getFieldDecorator('unitCompanyId')(
                    <Lov
                      code="HPFM.UNIT.COMPANY"
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityUnit.unitStatus')
                    .d('部门状态')}
                >
                  {getFieldDecorator('enabledFlag')(
                    <ValueList lovCode="HPFM.ENABLED_FLAG" allowClear style={{ width: 150 }} />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem>
                  <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormItem className={styles['right-btn-group']}>
              {isFunction(renderCuxBtn)
                ? renderCuxBtn({
                  fetchHeaderData: this.fetchHeaderData,
                  header,
                  dispatch,
                  loading:
                    updateLoading || fetchLoading || updateFlagLoading || fetchHeaderLoading,
                })
                : null}
              {tableType === 'tree' && <div style={{ display: 'inline-block', margin: '0 24px 0 0' }}>
                <Tooltip
                  title={intl
                    .get('hiam.authority.view.message.checkSubset.tooltip')
                    .d('启用后，勾选父级自动勾选子级，取消勾选亦然，勾选子级不会联动勾选父级；不启用，需逐个勾选')}
                >
                  <span style={{ marginRight: '8px' }}>
                    {intl.get('hiam.authority.view.message.checkSubset').d('是否默认勾选子级')}
                    <Icon type="question-circle" style={{ margin: '0 4px' }} />:
                  </span>
                  <Checkbox
                    onChange={() => { this.setState({ checkSubsetFlag: !checkSubsetFlag }) }}
                    checked={checkSubsetFlag || 0}
                  />
                </Tooltip>
              </div>}
              <div style={{ display: 'inline-block', margin: '0 24px 0 0' }}>
                <Tooltip
                  title={intl
                    .get('hiam.authority.view.message.nullValue.tooltip')
                    .d('勾选后，单据中该维度字段为空该用户可查询到')}
                >
                  <span style={{ marginRight: '8px' }}>
                    {intl.get('hiam.authority.view.message.nullValue').d('包含空值')}
                    <Icon type="question-circle" style={{ margin: '0 4px' }} />:
                  </span>
                  <Checkbox
                    onChange={this.includeNullFlag}
                    checked={(header || {}).includeNullFlag || 0}
                  />
                </Tooltip>
              </div>
              {tableType === 'tree' && <Button onClick={() => this.handleExpand()}>
                {expanded
                  ? intl.get('hzero.common.button.expand').d('展开')
                  : intl.get('hzero.common.button.up').d('收起')}
              </Button>
              }
              {String(header.includeAllFlag) !== '1' && tableType === 'tree' &&
                (isFunction(handleCuxShowSaveBtn) ? handleCuxShowSaveBtn({ header }) : true) && (
                  <ButtonPermission
                    // permissionList={[
                    //   {
                    //     code: 'hiam.sub-account-org.authority-management.button.saveCompany',
                    //     type: 'button',
                    //     meaning: '权限维护-保存公司',
                    //   },
                    // ]}
                    type="primary"
                    loading={updateLoading}
                    onClick={() => this.handleSave()}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </ButtonPermission>
                )}
              <div style={{ display: 'inline-block', margin: '0 8px 0' }}>
                <span style={{ marginRight: '8px' }}>
                  {intl.get('hiam.authority.view.message.label').d('加入全部:')}
                </span>
                <Tooltip
                  title={intl
                    .get('hiam.authority.view.message.title.tooltip.includeAllCustomerUnit')
                    .d('“加入全部”即将所有客户权限自动添加至当前账户，无需再手工添加。')}
                  placement="right"
                >
                  <Switch
                    loading={
                      updateLoading || updateFlagLoading || fetchHeaderLoading
                    }
                    checked={String(header.includeAllFlag) === '1'}
                    disabled={updateFlagLoading}
                    onChange={this.includeAllFlag}
                  />
                </Tooltip>
                {!header.includeAllFlag && tableType === 'tile' && (
                  <React.Fragment>
                    <Button style={{ margin: '0 8px 16px 8px' }} onClick={() => this.onShowAddModal()}>
                      {intl
                        .get('hiam.authorityManagement.view.button.table.create.unit')
                        .d('新建部门权限')}
                    </Button>
                    <Button
                      style={{ margin: '0 8px 16px 16px' }}
                      // disabled={selectRows.length <= 0}
                      onClick={() => this.remove()}
                    >
                      {intl
                        .get('hiam.authorityManagement.view.button.table.delete.unit')
                        .d('删除部门权限')}
                    </Button>
                  </React.Fragment>
                )}
              </div>
              {settingTableType === 'tree' && <div className={styles['rightTabs']}>
                <div
                  className={tableType === 'tree' ? 'active' : ''}
                  disabled={settingTableType !== 'tree'}
                  onClick={() => this.setState({ tableType: 'tree' })}
                >
                  <span>{intl.get(`hiam.authority.view.message.label.tree`).d('树状')}</span>
                </div>
                <div
                  className={tableType !== 'tree' ? 'active' : ''}
                  onClick={() => this.setState({ tableType: 'tile' })}
                >
                  <span>{intl.get(`hiam.authority.view.message.label.tile`).d('平铺')}</span>
                </div>
              </div>}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  handleChangeViewModalVisible() {
    const {
      queryParams: { userId },
    } = this.props;
    Modal.open({
      drawer: true,
      closable: true,
      style: { width: '900px' },
      title: intl
        .get('hiam.authority.model.authorityManagement.authorityViewUnit')
        .d('查询已分配的部门权限'),
      children: <AuthorityViewModal userId={userId} />,
      footer: okBtn => okBtn,
      okText: intl.get('hzero.common.button.close').d('关闭')
    });
  }

  /**
   *渲染方法
   *
   * @returns
   */
  render() {
    const {
      queryParams: { userId },
    } = this.props;
    if (isNil(userId)) {
      return (
        <h3 style={{ color: 'gray', marginTop: '10%', textAlign: 'center' }}>
          {intl
            .get('hiam.authorityManagement.model.authorityManagement.noSupport')
            .d('此功能不适用')}
        </h3>
      );
    }
    const {
      fetchLoading = false,
      refreshLoading = false,
      authorityUnit: { data = [], checkList = [], expandedRowKeys = [] },
    } = this.props;
    const columns = [
      {
        title: intl.get('hiam.authorityManagement.model.authorityUnit.unitName').d('部门名称'),
        dataIndex: 'dataName',
        flexGrow: 1,
      },
      {
        title: intl.get('hiam.authorityManagement.model.authorityUnit.unitNum').d('部门编码'),
        dataIndex: 'dataCode',
        width: 300,
        resizable: true,
      },
      {
        title: intl.get('hiam.authorityManagement.model.authorityUnit.unitStatus').d('部门状态'),
        dataIndex: 'enabledFlag',
        width: 200,
        render: ({ rowData }) => enableRender(rowData.enabledFlag),
        resizable: true,
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityCustomer.unitCompanyName')
          .d('组织'),
        dataIndex: 'unitCompanyName',
        width: 400,
        resizable: true,
      },
    ];
    const c7nCol = [
      {
        name: 'dataName',
      },
      {
        name: 'dataCode',
      },
      {
        name: 'enabledFlag', renderer: ({ value }) => enableRender(value),
      },
      {
        name: 'unitCompanyName',
        width: 400,
      },

    ]
    const { tableType, checkSubsetFlag } = this.state;
    const rowSelection = {
      selectedRowKeys: checkList.map((n) => n.dataId),
      onChange: this.handleSelectRows,
      onSelect: () => { },
    };

    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        {tableType === 'tree' && <a style={{ marginBottom: '8px' }} onClick={() => this.handleChangeViewModalVisible()}>
          {intl.get('hiam.authority.model.authorityManagement.authorityView').d('查询已分配权限')}
        </a>
        }
        {tableType === 'tree' && <Table
          isTree
          bordered
          rowKey="dataId"
          pagination={false}
          loading={fetchLoading || refreshLoading}
          data={data}
          rowSelection={rowSelection}
          expandedRowKeys={expandedRowKeys}
          columns={columns}
          height={600}
          checkSubsetFlag={checkSubsetFlag}
          // autoHeight
          // scroll={{ x: tableScrollWidth(columns) }}
          // rowClassName={record =>
          //   checkList.find(list => list.dataId === record.dataId) ? 'row-active' : 'row-noactive'
          // }
          onExpandChange={this.onExpand}
        />
        }
        {tableType !== 'tree' && <C7NTable columns={c7nCol} dataSet={this.dataSet} queryBar='none' />}
        {/* <AuthorityViewModal {...authorityViewModalProps} /> */}
      </div>
    );
  }
}
