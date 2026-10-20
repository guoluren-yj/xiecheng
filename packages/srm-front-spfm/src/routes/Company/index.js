import React, { PureComponent } from 'react';
import { Button, Form, Input, Popover, Row, Col, Select, Modal } from 'hzero-ui';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getEditTableData,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';
import { Content, Header } from 'components/Page';
import { enableRender } from 'utils/renderer';
import { openTab } from 'utils/menuTab';
import CommonImport from 'components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { Button as PerButton } from 'components/Permission';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
// import CompanyModal from './CompanyModal';

import { queryMenuPermissions, buildPartner } from '@/services/companyService';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const FormItem = Form.Item;
@withCustomize({
  unitCode: ['SPFM_ORG-INFO_COMPANY.LIST', 'SPFM_ORG-INFO_COMPANY.SEARCH'],
})
@formatterCollections({
  code: [
    'hpfm.company',
    'entity.company',
    'spfm.enterprise',
    'spfm.supplierManage',
    'hptl.portalAssign',
    'spfm.address',
    'spfm.bank',
    'spfm.invoice',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, spfmCompany }) => ({
  spfmCompany,
  loading,
  saving:
    loading.effects['spfmCompany/fetchCompanyInfo'] ||
    loading.effects['spfmCompany/handleEnterpriseChange'] ||
    loading.effects['spfmCompany/enableCompany'] ||
    loading.effects['spfmCompany/disableCompany'],
}))
export default class Company extends PureComponent {
  constructor(props) {
    super(props);
    this.queryPageSize = 10;
    this.state = {
      // modalInitialData: {},
      // modalVisible: false,
      tenantId: getCurrentOrganizationId(),
      display: true,
      menuCode: {},
    };
  }

  componentDidMount() {
    const {
      spfmCompany: { pagination = {} },
    } = this.props;
    this.fetchDataList({}, pagination);
    this.handleMenuPermissions();
  }

  // 查询企业信息变更新菜单
  @Bind()
  handleMenuPermissions() {
    queryMenuPermissions({
      code: ['srm.mdm.firm-info-change-new'].join(),
    }).then((response) => {
      const res = getResponse(response);
      if (res) {
        this.setState({
          menuCode: res,
        });
      }
    });
  }

  @Bind()
  fetchDataList(params = {}, page = {}) {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'spfmCompany/fetchCompanyInfo',
      payload: {
        tenantId: this.state.tenantId,
        ...form.getFieldsValue(),
        ...params,
        page,
        customizeUnitCode: 'SPFM_ORG-INFO_COMPANY.LIST,SPFM_ORG-INFO_COMPANY.SEARCH',
      },
    });
  }

  @Bind()
  handleSearchCompany() {
    const { form } = this.props;
    form.validateFields((err, fieldValue) => {
      if (isEmpty(err)) {
        this.fetchDataList(fieldValue, {});
      }
    });
  }

  @Bind()
  handleResetSearch() {
    this.props.form.resetFields();
  }

  /**
   * 取消编辑行
   * @param {Obj} record
   * @memberof StoreRoom
   */
  @Bind()
  handleCancel(record) {
    const {
      spfmCompany: { companyList = {} },
      dispatch,
    } = this.props;
    const newList = companyList.map((item) => {
      if (item.sourceKey === record.sourceKey) {
        const { _status, ...other } = item;
        record.$form.resetFields();
        return other;
      } else {
        return item;
      }
    });

    dispatch({
      type: 'spfmCompany/updateState',
      payload: {
        companyList: newList,
      },
    });
  }

  /**
   * 编辑行
   * @param {Obj} record
   */
  @Bind()
  handleEdit(record) {
    const {
      spfmCompany: { companyList = {} },
      dispatch,
    } = this.props;
    const newList = companyList.map((item) =>
      item.sourceKey === record.sourceKey ? { ...item, _status: 'update' } : item
    );

    dispatch({
      type: 'spfmCompany/updateState',
      payload: {
        companyList: newList,
      },
    });
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  // handleModalVisible(flag) {
  //   this.setState({ modalVisible: flag });
  // }

  @Bind()
  showModal(flag, record) {
    const { dispatch } = this.props;
    if (flag === 'create') {
      openTab({
        key: `/spfm/enterprise/register`,
        title: intl.get('hpfm.company.model.company.enterpriseCreate').d('公司信息新建'),
        search: {
          companyId: undefined,
        },
      });
    } else {
      const { enabledFlag, companyId } = record;
      const changFlag = !!(enabledFlag === 1 && companyId);
      openTab({
        key: `/spfm/enterprise/register`,
        title: intl.get('hpfm.company.model.company.enterpriseEdit').d('公司信息'),
        search: {
          companyId: record.sourceKey,
          changFlag: changFlag ? 1 : 0,
        },
      });
    }
    // this.setState({
    // modalInitialData: record,
    // modalVisible: true,
    // });

    dispatch({
      type: 'spfmCompany/saveReducers',
      payload: {
        companyFormKey: uuid(),
      },
    });
  }

  @Bind()
  handleCompanyAble(record, flag) {
    const {
      dispatch,
      spfmCompany: { pagination = {} },
    } = this.props;
    dispatch({
      type: `spfmCompany/${flag ? 'enableCompany' : 'disableCompany'}`,
      payload: {
        ...record,
        tenantId: this.state.tenantId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchDataList({}, pagination);
        // 异步调用，建立合作伙伴
        const { isExistGroupInviteFlag, companyId, companyName, companyNum } = record || {};
        if (isExistGroupInviteFlag) {
          const data = [
            {
              companyNum,
              tenantId: this.state.tenantId,
              companyName,
              remoteCompanyId: companyId,
            },
          ];
          const datatoJson = JSON.stringify(data);
          buildPartner({ data: datatoJson }).then((result) => {
            getResponse(result);
          });
        }
      }
    });
  }

  @Bind()
  handleEnableCompanyCooperate(record) {
    const { isExistGroupInviteFlag } = record || {};
    if (isExistGroupInviteFlag) {
      Modal.confirm({
        title: intl
          .get('spfm.enterprise.view.message.buildCooperate')
          .d('启用后，该公司会和历史所有集团级合作供应商自动建立合作，是否确认？'),
        onOk: () => {
          this.handleCompanyAble(record, true);
        },
      });
    } else {
      this.handleCompanyAble(record, true);
    }
  }

  @Bind()
  handleEnterpriseChange(record) {
    const { dispatch } = this.props;
    const { companyId, companyNum } = record;
    dispatch({
      type: `spfmCompany/handleEnterpriseChange`,
      payload: {
        changeContent: 'PUBLIC',
        companyId,
        companyNum,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleDetails(res);
      }
    });
  }

  /**
   * 跳转至企业信息变更详情
   */
  @Bind()
  handleDetails(record) {
    const { menuCode } = this.state;
    const { history } = this.props;
    const { changeReqId, companyId, partnerTenantId, domesticForeignRelation } = record;
    // 有新企业信息变更菜单
    const enterpriseFlag = menuCode['srm.mdm.firm-info-change-new'];
    const pathname = enterpriseFlag
      ? '/sslm/enterprise-inform-change-new/detail/edit'
      : `/sslm/enterprise-inform-change/detail/${changeReqId}`;
    history.push({
      pathname,
      search: querystring.stringify({
        companyId,
        partnerTenantId,
        domesticForeignRelation,
        tenantId: partnerTenantId,
        changeReqId,
      }),
    });
  }

  /**
   * 保存，校验成功保存新增行和修改行
   * @memberof StoreRoom
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      spfmCompany: { companyList = {}, pagination = {} },
    } = this.props;
    const params = getEditTableData(companyList);
    if (Array.isArray(params) && params.length === 0) {
      return;
    }
    dispatch({
      type: 'spfmCompany/saveCurrency',
      payload: params,
      customizeUnitCode: 'SPFM_ORG-INFO_COMPANY.LIST',
    }).then((res) => {
      if (res) {
        this.fetchDataList({}, pagination);
        notification.success();
      }
    });
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  renderForm() {
    const { form, customizeFilterForm } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { display = true } = this.state;
    const statusMap = [
      {
        value: 1,
        meaning: intl.get('hzero.common.status.enableFlag').d('启用'),
      },
      {
        value: 0,
        meaning: intl.get('hzero.common.status.disable').d('禁用'),
      },
    ];

    return customizeFilterForm(
      {
        code: 'SPFM_ORG-INFO_COMPANY.SEARCH',
        form,
        expand: !display,
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formLayout}
                  label={intl.get('hpfm.company.model.company.organizationCode').d('公司编码')}
                >
                  {getFieldDecorator('companyNum', {
                    initialValue: '',
                  })(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formLayout}
                  label={intl.get('hpfm.company.model.company.companyName').d('公司名称')}
                >
                  {getFieldDecorator('companyName', {
                    initialValue: '',
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formLayout}
                  label={intl.get(`hpfm.company.model.company.currencyType`).d('币种')}
                >
                  {getFieldDecorator(`currencyId`)(
                    <Lov
                      code="SPFM.TENANT_CURRENCY"
                      lovOptions={{ displayField: 'defaultCurrencyCode', valueField: 'currencyId' }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: display ? 'none' : 'block' }}>
              <Col span={8}>
                <FormItem {...formLayout} label={intl.get('hzero.common.status').d('状态')}>
                  {getFieldDecorator('enabledFlag')(
                    <Select allowClear>
                      {statusMap.map((n) => (
                        <Select.Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              {display ? (
                <Button onClick={this.toggleForm}>
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
              ) : (
                <Button onClick={this.toggleForm}>
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
              )}
              <Button onClick={this.handleResetSearch}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginLeft: 8 }}
                onClick={this.handleSearchCompany}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchImport() {
    openTab({
      key: '/spfm/org-info/company/import-component/SPFM.SUBSIDIARY.IMPORT',
      search: querystring.stringify({
        key: '/spfm/org-info/company/import-component/SPFM.SUBSIDIARY.IMPORT',
        title: 'hzero.common.title.batchImport',
        action: intl.get(`hzero.common.title.batchImport`).d('批量导入'),
        backPath: '/spfm/org-info/company',
        isShowImportDataButton: false,
      }),
    });
  }

  render() {
    const { spfmCompany = {}, customizeTable, saving, form } = this.props;
    const { companyList = [], pagination = {} } = spfmCompany;
    // const { modalInitialData, modalVisible } = this.state;
    const hasEdit = companyList.findIndex((item) => !!item._status) !== -1;
    const columns = [
      {
        title: intl.get('hpfm.company.model.company.organizationCode').d('公司编码'),
        width: 150,
        dataIndex: 'companyNum',
      },
      {
        title: intl.get('hpfm.company.model.company.companyName').d('公司名称'),
        dataIndex: 'companyName',
        width: 200,
        render: (text, record) => {
          return (
            <Popover
              content={
                record.ccompanyEnglishName ? `${text} ${record.ccompanyEnglishName}` : `${text}`
              }
            >
              <a
                onClick={() => {
                  this.showModal('edit', record);
                }}
              >
                {record.ccompanyEnglishName ? `${text} ${record.ccompanyEnglishName}` : `${text}`}
              </a>
            </Popover>
          );
        },
      },
      {
        title: intl.get('hpfm.company.model.company.shortName').d('公司简称'),
        width: 200,
        dataIndex: 'shortName',
      },
      {
        title: intl.get(`hpfm.company.model.company.currencyCode`).d('缺省币种'),
        dataIndex: 'defaultCurrencyCode',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`currencyId`, {
                initialValue: record.currencyId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`hpfm.company.model.company.currencyCode`).d('缺省币种'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPFM.DEFAULT_CURRENCY"
                  textField="defaultCurrencyCode"
                  lovOptions={{ displayField: 'defaultCurrencyCode', valueField: 'currencyId' }}
                  textValue={record.defaultCurrencyCode}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.button.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 150,
        render: (text, record) =>
          record.enabledFlag !== null && (
            <span className="action-link">
              {record._status === 'update' && (
                <a onClick={() => this.handleCancel(record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              )}
              {record._status !== 'create' && record._status !== 'update' && (
                <React.Fragment>
                  {record.enabledFlag === 1 ? (
                    <a onClick={() => this.handleCompanyAble(record, false)}>
                      {intl.get('hzero.common.status.disable').d('禁用')}
                    </a>
                  ) : (
                    <a onClick={() => this.handleEnableCompanyCooperate(record)}>
                      {intl.get('hzero.common.status.enable').d('启用')}
                    </a>
                  )}
                  <a onClick={() => this.handleEdit(record)} style={{ marginLeft: 8 }}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                  <PerButton
                    type="text"
                    onClick={() => this.handleEnterpriseChange(record)}
                    style={{ marginLeft: 8 }}
                    disabled={record.enabledFlag === 0 || !record.companyId}
                    permissionList={[
                      {
                        code: `srm.mdm.enterprise.srm-org-info.ps.company.change`,
                        type: 'button',
                        meaning: '变更',
                      },
                    ]}
                  >
                    {intl.get('hzero.common.button.change').d('变更')}
                  </PerButton>
                </React.Fragment>
              )}
            </span>
          ),
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('entity.company.tag').d('公司')}>
          <PerButton
            icon="plus"
            type="primary"
            onClick={() => this.showModal('create', {})}
            permissionList={[
              {
                code: `srm.mdm.enterprise.srm-org-info.button.subsidiary-create`,
                type: 'button',
                meaning: '业务组织信息公司-新建',
              },
            ]}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </PerButton>
          <PerButton
            type="primary"
            icon="save"
            onClick={this.handleSave}
            disabled={!hasEdit}
            permissionList={[
              {
                code: `srm.mdm.enterprise.srm-org-info.button.subsidiary-save`,
                type: 'button',
                meaning: '业务组织信息公司-保存',
              },
            ]}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </PerButton>
          <CommonImport
            refreshButton
            prefixPatch={SRM_PLATFORM}
            autoExecute={false}
            businessObjectTemplateCode="SPFM.SUBSIDIARY.IMPORT"
            buttonText={intl.get('hzero.common.button.import.new').d('(新)导入')}
            buttonProps={{
              icon: 'archive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: `srm.mdm.enterprise.srm-org-info.ps.spfm.org-info.subsidiary-import-new`,
                  type: 'button',
                  meaning: '业务组织信息公司-新导入',
                },
              ],
            }}
          />
          <PerButton
            icon="to-top"
            onClick={this.handleBatchImport}
            permissionList={[
              {
                code: `srm.mdm.enterprise.srm-org-info.ps.spfm.org-info.subsidiary-import`,
                type: 'button',
                meaning: '业务组织信息公司-导入',
              },
            ]}
          >
            {intl.get(`hzero.common.button.import`).d('导入')}
          </PerButton>
          <ExcelExportPro
            templateCode="SRM_C_SRM_SPFM_PARTNER_COMPANY"
            buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
            requestUrl={`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/companies/export`}
            queryParams={filterNullValueObject({
              tenantId: this.state.tenantId,
              customizeUnitCode: 'SPFM_ORG-INFO_COMPANY.LIST',
              ...form.getFieldsValue(),
            })}
            otherButtonProps={{
              permissionList: [
                {
                  code: 'srm.mdm.enterprise.srm-org-info.button.subsidiary-export',
                  type: 'button',
                },
              ],
            }}
          />
        </Header>
        <Content noCard>
          <div className="table-list-search">{this.renderForm()}</div>
          {customizeTable(
            {
              code: 'SPFM_ORG-INFO_COMPANY.LIST',
            },
            <EditTable
              bordered
              rowKey={(record) => `${record.sourceKey}`}
              loading={saving || false}
              dataSource={companyList || []}
              columns={columns}
              pagination={pagination}
              onChange={(page) => {
                this.fetchDataList({}, page);
              }}
            />
          )}
          {/* <CompanyModal
            key={companyFormKey}
            width="1000px"
            bodyStyle={{ padding: 0 }}
            title={`${
              modalInitialData.sourceKey
                ? intl.get('hpfm.company.view.message.title.modal.edit').d('公司信息')
                : intl.get('hpfm.company.view.message.title.modal.create').d('新建公司')
            }`}
            onRef={(ref) => {
              this.CompanyModal = ref;
            }}
            sideBar
            loading={loading}
            modalInitialData={modalInitialData}
            confirmLoading={saving}
            modalVisible={modalVisible}
            hideModal={() => this.handleModalVisible(false)}
            initialList={this.fetchDataList}
            footer={null}
          /> */}
        </Content>
      </React.Fragment>
    );
  }
}
