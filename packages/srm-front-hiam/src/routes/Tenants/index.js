/**
 * tenants - 租户维护
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Tag, Tooltip } from 'hzero-ui';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';
import { Button as ButtonPermission } from 'components/Permission';

import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender, operatorRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { filterNullValueObject, getResponse } from 'utils/utils';
import request from 'utils/request';
import { HZERO_IAM } from 'utils/config';
import { saveTenantLanguage } from '@/services/tenantsService';

import SearchForm from './SearchForm';
import TenantForm from './TenantForm';
import EnterpriseForm from './EnterpriseForm';
import LanguageTable from './LanguageTable';
import BuryingPointForm from './BuryingPointForm';

// const promptCode = 'hiam.tenants';
/**
 * 租户信息维护
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} tenants - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {boolean} saving - 保存操作是否完成
 * @reactProps {boolean} converting - 转为核企操作是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ tenants, loading }) => ({
  tenants,
  loading: loading.effects['tenants/queryTenant'],
  saving: loading.effects['tenants/updateTenant'] || loading.effects['tenants/addTenant'],
  queryLanguageLoading: loading.effects['tenants/queryLanguage'],
  converting: loading.effects['tenants/convertCoreEnterprise'],
}))
@formatterCollections({
  code: ['entity.tenant', 'hiam.tenants', 'hzero.common', 'hiam.menuConfig'],
})
export default class Tenants extends PureComponent {
  state = {
    modalVisible: false,
    newFunctionGroupTemplate: '',
    enterpriseModalVisible: false,
    selectRows: [],
  };

  tenantForm;

  enterpriseForm;

  searchForm = React.createRef();

  componentDidMount() {
    this.updateFormAndSearch();
    this.queryTenantDefaultTemp();
    this.queryLanguage();
  }

  componentDidUpdate(prevProps) {
    const {
      location: { state },
    } = this.props;
    const {
      location: { state: prevState },
    } = prevProps;
    if (state !== prevState) {
      this.updateFormAndSearch();
    }
  }

  /**
   * 检查 location.search 是否发生变化, 发生变化后 设置查询表单+查询
   */
  updateFormAndSearch() {
    const {
      location: { state },
    } = this.props;
    if (isEmpty(state)) {
      this.handleSearchTenant();
    } else if (state.tenantName) {
      // TODO: 租户维护这边 暂时只支持 tenantName 更改
      if (this.searchForm.current) {
        this.searchForm.current.props.form.setFieldsValue({ tenantName: state.tenantName });
      }
      this.handleSearchTenant();
    }
  }

  // 查询平台目录组中选择的“租户目录组默认模板”
  queryTenantDefaultTemp() {
    try {
      request(`${HZERO_IAM}/v1/function/group/select/default`, {
        method: 'GET',
      }).then((res) => {
        const result = getResponse(res);
        if (result) {
          this.setState({ newFunctionGroupTemplate: result.name || '' });
        }
      });
    } catch (error) {
      return false;
    }
  }

  @Bind()
  queryLanguage() {
    this.props.dispatch({
      type: 'tenants/queryLanguage',
    });
  }

  /**
   * 按条件查询
   */
  @Bind()
  handleSearchTenant(payload = {}) {
    const { dispatch } = this.props;
    const form =
      this.searchForm.current &&
      this.searchForm.current.props &&
      this.searchForm.current.props.form;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'tenants/queryTenant',
      payload: {
        page: isEmpty(payload) ? {} : payload,
        ...filterValues,
      },
    });
    // 清空勾选数据
    this.setState({
      selectRows: [],
    });
  }

  @Bind()
  showEditModal(tenantSrouce) {
    const { dispatch } = this.props;
    dispatch({
      type: 'tenants/queryTenantDetail',
      payload: {
        ...tenantSrouce,
      },
    }).then((res) => {
      this.setState({ tenantSrouce: res }, () => {
        this.handleModalVisible(true);
      });
    });
  }

  @Bind()
  showEditBuryingPoint(record) {
    const { tenantId } = record || {};
    const ds = new DataSet({
      paging: false,
      selection: false,
      autoCreate: true,
      autoQuery: true,
      transport: {
        read: {
          url: `${HZERO_IAM}/v1/tenants/extend-info/query?tenantId=${tenantId}`,
          method: 'GET',
          transformResponse(resp) {
            try {
              const data = JSON.parse(resp);
              return [data];
            } catch (e) {
              return [];
            }
          },
        },
        submit: ({ data: [data] }) => {
          return {
            url: `${HZERO_IAM}/v1/tenants/extend-info/tracking/change`,
            method: 'POST',
            data: {
              tenantId,
              ...data,
            },
          };
        },
      },
      fields: [
        {
          name: 'scriptTracking',
          label: intl.get('hiam.tenants.model.buryingPoint.script').d('脚本'),
        },
        {
          type: 'boolean',
          name: 'scriptTrackingFlag',
          label: intl.get('hzero.common.enable').d('启用'),
          trueValue: 1,
          falseValue: 0,
        },
      ],
    });
    Modal.open({
      title: intl.get('hiam.tenants.view.button.configurationBuryingPoint').d('埋点配置'),
      drawer: true,
      children: <BuryingPointForm tenantId={tenantId} dataSet={ds} />,
      onOk: async () => {
        return ds.submit();
      },
    });
  }

  @Bind()
  showEditLanguageModal(record) {
    const {
      tenants: { languageList = [] },
    } = this.props;
    const { tenantId, tenantLanguages } = record || {};
    const ds = new DataSet({
      paging: false,
      selection: false,
      fields: [
        {
          name: 'lang',
          required: true,
          label: intl.get('hiam.tenants.model.tenants.lang').d('语言'),
          options: new DataSet({
            selection: 'single',
            paging: false,
            data: languageList,
          }),
        },
        {
          name: 'langRequiredFlag',
          required: true,
          label: intl.get('hiam.tenants.view.title.langRequiredFlag').d('多语言必输校验'),
          type: 'boolean',
          defaultValue: false,
        },
      ],
      data:
        tenantLanguages && tenantLanguages.length
          ? tenantLanguages.map((lang) => ({
              id: lang.id,
              lang: lang.code,
              langRequiredFlag: lang.langRequiredFlag,
              ...lang,
            }))
          : [],
    });
    const languageMap = {};
    languageList.forEach((lang) => {
      languageMap[lang.value] = lang;
    });
    Modal.open({
      title: intl.get('hiam.tenants.view.button.configurationLanguage').d('维护语言'),
      drawer: true,
      children: <LanguageTable tenantId={tenantId} maxSize={languageList.length} tableDs={ds} />,
      onOk: async () => {
        const flag = await ds.validate();
        if (!flag) {
          return false;
        }
        const { created, updated } = ds;
        const data = created
          .map((i) => ({
            tenantId,
            languageId: (languageMap[i.get('lang')] || {}).id,
            langRequiredFlag: i.get('langRequiredFlag'),
          }))
          .concat(updated.map((i) => i.toJSONData()));
        const res = await saveTenantLanguage(data);
        if (getResponse(res)) {
          notification.success();
          return true;
        }
        return false;
      },
      onClose: () => {
        this.handleSearchTenant();
      },
      onCancel: () => {
        this.handleSearchTenant();
      },
    });
  }

  @Bind()
  showAddModal() {
    this.setState(
      {
        tenantSrouce: { enabledFlag: 1, ebankAccountFlag: 1, smallEnableMultiLanguage: 1 },
      },
      () => {
        this.handleModalVisible(true);
      }
    );
  }

  @Bind()
  showConverteEnterpriseModal() {
    const { selectRows } = this.state;
    const { dispatch } = this.props;
    const enterpriseParams = selectRows[0] || {};
    dispatch({
      type: 'tenants/queryTenantDetail',
      payload: {
        ...enterpriseParams,
      },
    }).then((res) => {
      const enterpriseSrouceMap = {
        oldTenantNum: res.tenantNum,
        newTenantNum: res.tenantNum,
      };
      this.setState({ enterpriseSrouce: { ...res, ...enterpriseSrouceMap } }, () => {
        this.handleEnterpriseModalVisible(true);
      });
    });
  }

  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  @Bind()
  hideEnterpriseModal() {
    const { converting = false } = this.props;
    if (!converting) {
      this.handleEnterpriseModalVisible(false);
    }
  }

  /**
   *是否打开模态框
   *
   * @param {*} flag true--打开 false--关闭
   * @memberof Tenants
   */
  handleModalVisible(flag) {
    if (flag === false && this.tenantForm) {
      this.tenantForm.resetForm();
    }
    this.setState({ modalVisible: !!flag });
  }

  /**
   *是否打开转为核企模态框
   *
   * @param {*} flag true--打开 false--关闭
   * @memberof Tenants
   */
  handleEnterpriseModalVisible(flag) {
    if (flag === false && this.enterpriseForm) {
      this.enterpriseForm.resetForm();
    }
    this.setState({ enterpriseModalVisible: !!flag });
  }

  /**
   *新增或者编辑
   *
   * @param {*} fieldsValue 表单数据
   * @memberof tenants
   */
  @Bind()
  handleAdd(fieldsValue) {
    const {
      dispatch,
      tenants: { pagination = {} },
    } = this.props;
    const { tenantSrouce = {} } = this.state;
    const { _token } = tenantSrouce;
    const { tenantExtend } = fieldsValue;
    const params = {
      ...fieldsValue,
      tenantExtend: {
        ...((tenantSrouce && tenantSrouce.tenantExtend) || {}),
        ...(tenantExtend || {}),
      },
    };
    if (tenantSrouce.tenantId || String(tenantSrouce.tenantId) === '0') {
      dispatch({
        type: 'tenants/updateTenant',
        payload: {
          _token,
          tenantId: tenantSrouce.tenantId,
          objectVersionNumber: tenantSrouce.objectVersionNumber,
          ...params,
        },
      }).then((res) => {
        if (res) {
          this.hideModal();
          this.handleSearchTenant(pagination);
          notification.success();
        }
      });
    } else {
      dispatch({
        type: 'tenants/addTenant',
        payload: {
          ...params,
        },
      }).then((res) => {
        if (res) {
          this.hideModal();
          this.handleSearchTenant(pagination);
          notification.success();
        }
      });
    }
  }

  /**
   *转为核企处理逻辑
   *
   * @param {*} fieldsValue 表单数据
   * @memberof tenants
   */
  @Bind()
  handleConverteEnterprise(fieldsValue) {
    const {
      dispatch,
      tenants: { pagination = {} },
    } = this.props;
    const { enterpriseSrouce = {} } = this.state;
    const { oldTenantNum } = enterpriseSrouce;
    dispatch({
      type: 'tenants/convertCoreEnterprise',
      payload: {
        oldTenantNum,
        ...fieldsValue,
      },
    }).then((res) => {
      if (res && res.failed) {
        notification.error({
          message: res.message,
        });
      } else if (res && !res.failed) {
        this.hideEnterpriseModal();
        this.handleSearchTenant(pagination);
        notification.success();
      }
    });
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRow 选中行
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectRows: selectedRows });
  }

  multipleLangRender = (v, record) => {
    const { tenantLanguages } = record || {};
    const nodes = [];
    if (tenantLanguages && tenantLanguages.length) {
      tenantLanguages.forEach((lang) => {
        if (lang && lang.langRequiredFlag) {
          nodes.push(
            <Tag style={{ marginRight: '4px' }} color="blue">
              {lang.name}
            </Tag>
          );
        }
      });
    }
    return nodes;
  };

  render() {
    const {
      tenants: { tenantData = {}, pagination },
      match: { path },
      loading,
      saving,
      converting,
      queryLanguageLoading,
    } = this.props;
    const { selectRows } = this.state;
    const { content = [] } = tenantData;
    const {
      tenantSrouce = {},
      modalVisible,
      newFunctionGroupTemplate,
      enterpriseModalVisible,
      enterpriseSrouce = {},
    } = this.state;
    const { tenantId } = tenantSrouce;
    const filterProps = {
      onSearch: this.handleSearchTenant,
      wrappedComponentRef: this.searchForm,
    };
    const columns = [
      {
        title: intl.get('entity.tenant.code').d('租户编码'),
        width: 200,
        dataIndex: 'tenantNum',
      },
      {
        title: intl.get('entity.tenant.name').d('租户名称'),
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('hiam.tenants.model.tenant.enableLanguage').d('启用语言'),
        dataIndex: 'languageList',
        render: (_, record) => {
          if (!record) {
            return;
          }
          const { tenantLanguages } = record;
          if (!tenantLanguages || !tenantLanguages.length) {
            return;
          }
          return tenantLanguages.map((lang) => <Tag key={lang.code}>{lang.name}</Tag>);
        },
      },
      {
        title: intl.get('hiam.tenants.model.tenant.limitUserQty').d('限制用户数'),
        width: 120,
        dataIndex: 'limitUserQty',
      },
      {
        title: intl.get('hiam.tenants.model.coreEnterprise').d('核心企业'),
        width: 100,
        dataIndex: 'coreEnterprise',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hiam.tenants.model.tenant.langRequiredFlag').d('多语言必输校验'),
        width: 150,
        dataIndex: 'langRequiredFlag',
        render: this.multipleLangRender,
      },
      {
        title: intl.get('hiam.tenants.model.tenant.daylightFlag').d('冬夏令时'),
        dataIndex: 'daylightFlag',
        width: 150,
        render: (value) => enableRender(value || 0),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hiam.tenants.model.creationDate').d('创建时间'),
        width: 160,
        dataIndex: 'creationDate',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 200,
        dataIndex: 'option',
        fixed: 'right',
        render: (_, record) => {
          const operators = [
            {
              key: 'edit',
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.edit`,
                      type: 'button',
                      meaning: '租户维护-编辑',
                    },
                  ]}
                  onClick={() => {
                    this.showEditModal(record);
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </ButtonPermission>
              ),
              len: 2,
              title: intl.get('hzero.common.button.edit').d('编辑'),
            },
            {
              key: 'language',
              ele: (
                <ButtonPermission
                  type="text"
                  loading={queryLanguageLoading}
                  onClick={() => {
                    this.showEditLanguageModal(record);
                  }}
                >
                  {intl.get('hiam.tenants.view.button.configurationLanguage').d('维护语言')}
                </ButtonPermission>
              ),
              len: 4,
              title: intl.get('hiam.tenants.view.button.configurationLanguage').d('维护语言'),
            },
            {
              key: 'buryingPoint',
              ele: (
                <ButtonPermission
                  type="text"
                  onClick={() => {
                    this.showEditBuryingPoint(record);
                  }}
                >
                  {intl.get('hiam.tenants.view.button.configurationBuryingPoint').d('埋点配置')}
                </ButtonPermission>
              ),
              len: 4,
              title: intl.get('hiam.tenants.view.button.configurationBuryingPoint').d('埋点配置'),
            },
          ];
          return operatorRender(operators);
        },
      },
    ];

    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: selectRows.map((n) => n.tenantId),
      type: 'radio',
      getCheckboxProps: (record) => ({
        disabled: record.coreEnterprise === 1,
      }),
    };

    return (
      <>
        <Header title={intl.get('entity.tenant.maintain').d('租户维护')}>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.create`,
                type: 'button',
                meaning: '租户维护-新建',
              },
            ]}
            icon="plus"
            type="primary"
            onClick={this.showAddModal}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </ButtonPermission>
          <Tooltip
            title={intl
              .get('entity.tenant.view.message.tooltip.converteEnterpriseTip')
              .d(
                '多云或本地项目可使用此按钮将采购方租户操作转为系统核心企业,公有云项目请按流程提交企业微信申请。'
              )}
          >
            <ButtonPermission
              permissionList={[
                {
                  code: `hzero.site.sys.tenant.tenant-maintain.api.ps.converte_enterprise`,
                  type: 'button',
                  meaning: '租户维护-转为核企',
                },
              ]}
              icon="swap"
              disabled={selectRows.length < 1}
              onClick={this.showConverteEnterpriseModal}
            >
              {intl.get('hzero.common.button.converteEnterprise').d('转为核企')}
            </ButtonPermission>
          </Tooltip>
        </Header>
        <Content>
          <div className="table-list-search">
            <SearchForm {...filterProps} />
          </div>
          <Table
            bordered
            rowKey="tenantId"
            loading={loading}
            dataSource={content}
            columns={columns}
            pagination={pagination}
            onChange={this.handleSearchTenant}
            rowSelection={rowSelection}
          />
        </Content>
        <TenantForm
          sideBar
          destroyOnClose
          title={
            tenantId !== undefined
              ? intl.get('entity.tenant.edit').d('租户编辑')
              : intl.get('entity.tenant.create').d('租户新建')
          }
          tenantId={tenantId}
          onRef={(ref) => {
            this.tenantForm = ref;
          }}
          width={600}
          data={tenantSrouce}
          handleAdd={this.handleAdd}
          confirmLoading={saving}
          modalVisible={modalVisible}
          hideModal={this.hideModal}
          defaultValue={newFunctionGroupTemplate}
        />
        <EnterpriseForm
          sideBar
          destroyOnClose
          title={intl.get('entity.tenant.converteEnterprise').d('转为核企')}
          onRef={(ref) => {
            this.enterpriseForm = ref;
          }}
          data={enterpriseSrouce}
          handleAdd={this.handleConverteEnterprise}
          confirmLoading={converting}
          modalVisible={enterpriseModalVisible}
          hideModal={this.hideEnterpriseModal}
        />
      </>
    );
  }
}
