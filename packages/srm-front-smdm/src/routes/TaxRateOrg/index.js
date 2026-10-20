/**
 * taxRateOrg - 税率-租户级
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Table, Tabs, Checkbox, Form } from 'hzero-ui';
import { isUndefined, isEmpty } from 'lodash';
import { Bind, debounce } from 'lodash-decorators';
import uuid from 'uuid/v4';

import { Header, Content } from 'components/Page';
import { enableRender, numberRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import { filterNullValueObject, addItemToPagination, getEditTableData } from 'utils/utils';
import Lov from 'components/Lov';

import FilterForm from './FilterForm';
import TaxOrgForm from './TaxOrgForm';
import TaxRateService from './TaxRateService';
/**
 * 税率--租户级
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} taxRateOrg - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {boolean} saving - 保存按钮是否提交成功
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch= e=>e ] - redux dispatch方法
 * @return React.element
 */

@withCustomize({
  unitCode: ['SMDM_TAXRATE_ORG.EDIT_FORM', 'SMDM_TAXRATE_ORG.LIST', 'SMDM_TAXRATE_ORG.SEARCH'],
})
@connect(({ taxRateOrg, global: { language }, loading }) => ({
  taxRateOrg,
  language,
  fetchTaxRateServiceLoading: loading.effects['taxRateOrg/fetchTaxRateService'],
  fetchFieldsLoading: loading.effects['taxRateOrg/fetchFields'],
  fetchTaxRateServiceSaveLoading: loading.effects['taxRateOrg/dataSave'],
  loading: loading.effects['taxRateOrg/fetchTaxRate'],
  saving: loading.effects['taxRateOrg/addTaxRate'] || loading.effects['taxRateOrg/updateTaxRate'],
  fields: taxRateOrg.fields,
}))
@formatterCollections({ code: ['smdm.taxRateOrg', 'smdm.common', 'entity.supplier'] })
export default class TaxRateOrg extends PureComponent {
  /**
   * state初始化
   * @param {objet} props - 组件props
   */
  constructor(props) {
    super(props);
    this.state = {
      taxRateSrouce: {},
      tabType: 'basicDefinition',
    };
  }

  taxOrgForm;

  taxRateForm;

  /**
   * 生命周期函数，render()调用后获取渲染数据
   */
  componentDidMount() {
    this.init();
    this.handleSearchTaxRate();
    this.handleFetchFields();
  }

  @Bind()
  init() {
    const { dispatch } = this.props;
    dispatch({
      type: 'taxRateOrg/init',
    });
  }

  /**
   * 税率数据查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearchTaxRate(fields = {}) {
    const { dispatch } = this.props;
    const { form } = this.state;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'taxRateOrg/fetchTaxRate',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
        customizeUnitCode: 'SMDM_TAXRATE_ORG.LIST,SMDM_TAXRATE_ORG.SEARCH',
      },
    });
  }

  /**
   * 字段查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleFetchFields(params = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'taxRateOrg/fetchFields',
      payload: params,
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.setState({ form: ref.props.form });
  }

  /**
   * 引用云级数据
   */
  @Bind()
  @debounce(500)
  handleQuoteTaxRate(flag) {
    const { dispatch } = this.props;
    const type =
      flag === 'demision' ? 'taxRateOrg/fetchQuoteDemision' : 'taxRateOrg/fetchQuoteDemisionMap';
    dispatch({
      type,
    }).then((res) => {
      if (res) {
        notification.success();
        if (flag === 'demision') this.handleFetchFields();
        this.handleSearchTaxRateService();
      }
    });
  }

  /**
   * 税率行信息编辑
   * @param {object} taxRateSrouce - 税率行数据对象
   */
  @Bind()
  handleEditTaxRate(record) {
    const { tabType } = this.state;
    if (tabType === 'basicDefinition') {
      this.setState({ taxRateSrouce: record, modalVisible: true });
    } else if (tabType === 'taxRateService') {
      this.handleUpdateTaxService(record, { _status: 'update' });
    }
  }

  /**
   * 税率新增
   */
  @Bind()
  handleAddTaxRate() {
    const { tabType } = this.state;
    if (tabType === 'basicDefinition') {
      this.setState({
        taxRateSrouce: { enabledFlag: 1 },
        modalVisible: true,
      });
    } else if (tabType === 'taxRateService') {
      const { taxRateOrg = {}, dispatch } = this.props;
      const { serviceContent = [], servicePagination = {} } = taxRateOrg;
      dispatch({
        type: 'taxRateOrg/updateState',
        payload: {
          serviceContent: [
            {
              _status: 'create',
              key: uuid(),
              enabledFlag: 1,
            },
            ...serviceContent,
          ],
          servicePagination: addItemToPagination(serviceContent.length, servicePagination),
        },
      });
    }
  }

  /**
   * 税率行数据编辑滑窗关闭
   */
  @Bind()
  handleModalClose(record) {
    const { saving = false } = this.props;
    const { tabType } = this.state;
    if (tabType === 'basicDefinition') {
      if (!saving) {
        this.setState({ modalVisible: false });
        this.taxOrgForm.resetForm();
      }
    } else if (tabType === 'taxRateService') {
      this.handleUpdateTaxService(record, { _status: null });
    }
  }

  /**
   * 数据保存
   * @param {object} fieldsValue - 待保存的税率数据
   * @memberof TaxRateOrg
   */
  @Bind()
  @debounce(500)
  handleSaveOption(fieldsValue) {
    const {
      dispatch,
      taxRateOrg: { pagination = {} },
    } = this.props;
    const { taxRateSrouce = {} } = this.state;
    let type = 'taxRateOrg/addTaxRate'; // 默认操作：新增税率
    let taxRateItem = { ...fieldsValue };
    if (taxRateSrouce.taxId) {
      type = 'taxRateOrg/updateTaxRate';
      taxRateItem = {
        ...taxRateSrouce,
        ...fieldsValue,
        // taxId: taxRateSrouce.taxId,
        // objectVersionNumber: taxRateSrouce.objectVersionNumber,
        // tenantId: taxRateSrouce.tenantId,
        // sourceCode: taxRateSrouce.sourceCode,
      };
    }
    dispatch({
      type,
      payload: {
        ...taxRateItem,
        customizeUnitCode: 'SMDM_TAXRATE_ORG.EDIT_FORM,SMDM_TAXRATE_ORG.LIST',
      },
    }).then((res) => {
      if (res) {
        this.handleModalClose();
        this.handleSearchTaxRate(pagination);
        notification.success();
      }
    });
  }

  @Bind()
  handleChangeTab(e) {
    this.setState({
      tabType: e,
    });
  }

  /**
   * 税率服务数据查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearchTaxRateService(fields = {}) {
    const { dispatch } = this.props;
    // const { servicePagination = {} } = taxRateOrg;
    const queryParams = this.taxRateForm ? this.taxRateForm.getFieldsValue() : null;
    dispatch({
      type: 'taxRateOrg/fetchTaxRateService', // 自己修改一下-税率服务接口。。注释的这个不是
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...queryParams,
      },
    });
  }

  /**
   * 数据保存-税率服务
   * @param {object} fieldsValue - 待保存的税率数据
   * @memberof TaxService
   */
  @Bind()
  handleSaveTaxService(fieldsValue = {}) {
    const { dispatch } = this.props;
    const { taxServiceSrouce = {} } = this.state;
    dispatch({
      type: 'taxRateOrg/fetchTaxRateServiceSave',
      payload: { ...taxServiceSrouce, ...fieldsValue },
    }).then((res) => {
      if (res) {
        this.handleModalClose();
        this.handleSearchTaxRateService();
        notification.success();
      }
    });
  }

  @Bind()
  handleUpdateTaxService(record, json = {}, flag) {
    const { taxRateOrg = {}, dispatch } = this.props;
    const { serviceContent = [] } = taxRateOrg;
    let newServiceContent = [];
    if (flag) {
      newServiceContent = serviceContent.filter((item) => item.key !== record.key);
    } else {
      newServiceContent = serviceContent.map((item) => {
        if (
          (item.taxServiceId && item.taxServiceId === record.taxServiceId) ||
          (item.key && item.key === record.key)
        ) {
          return { ...item, ...json };
        } else {
          return item;
        }
      });
    }
    dispatch({
      type: 'taxRateOrg/updateState',
      payload: {
        serviceContent: newServiceContent,
      },
    });
  }

  @Bind()
  @debounce(500)
  dataSave() {
    const { taxRateOrg = {}, dispatch } = this.props;
    const { serviceContent = [] } = taxRateOrg;
    const payload = getEditTableData(serviceContent);
    if (payload.length > 0) {
      dispatch({
        type: 'taxRateOrg/fetchTaxRateServiceSave',
        payload,
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearchTaxRateService();
        }
      });
    }
  }

  @Bind()
  taxRateColumns() {
    const { language, fields = [] } = this.props;
    const columns =
      fields.length <= 0
        ? []
        : fields
          .filter((item) => !!parseInt(item.enabledFlag, 0))
          .sort((firstEl, secondEl) => {
            return firstEl.orderSeq >= secondEl.orderSeq ? 1 : -1;
          })
          .map((item) => {
            const { field, name, multiLanguage, tenantId, selectLov } = item;
            const { lovCode, textField, valueField, displayField } = JSON.parse(selectLov);
            return {
              title: multiLanguage ? intl.get(multiLanguage).d(name) : name,
              width: 150,
              dataIndex: field,
              render: (val, record) => {
                // 默认为启用, 所以判断 是不是为 0
                const { $form, _status } = record;
                let companyParams = null;
                // let rules = null;
                if (field === 'supplierId') {
                  companyParams = $form && {
                    companyId: $form.getFieldValue('companyId') || record.companyId,
                  };
                  // rules = {
                  //   rules: [
                  //     {
                  //       required: true,
                  //       message: intl.get('hzero.common.validation.notNull', {
                  //         name: intl.get('entity.supplier.tag').d('供应商'),
                  //       }),
                  //     },
                  //   ],
                  // };
                }
                // if (field === 'companyId') {
                //   rules = {
                //     rules: [
                //       {
                //         required: true,
                //         message: intl.get('hzero.common.validation.notNull', {
                //           name: intl.get(`smdm.common.model.project.companyName`).d('公司'),
                //         }),
                //       },
                //     ],
                //   };
                // }
                const lovOption =
                  fields.length <= 0
                    ? null
                    : {
                      lovOptions: {
                        displayField: displayField || textField,
                        valueField: valueField || field,
                      },
                    };
                return _status === 'update' || _status === 'create' ? (
                  <Form.Item>
                    {$form.getFieldDecorator(field, {
                      // ...rules,
                      initialValue: val,
                    })(
                      <Lov
                        code={lovCode}
                        queryParams={{ tenantId, ...companyParams }}
                        textField={textField}
                        textValue={record[textField]}
                        {...lovOption}
                      />
                    )}
                  </Form.Item>
                ) : (
                  record[textField]
                );
              },
            };
          })
          .concat([
            {
              title: intl.get(`smdm.taxRateOrg.model.taxRate.taxCode`).d('税率代码'),
              width: 150,
              dataIndex: 'taxCode',
              render: (val, record) => {
                const { $form, _status } = record;
                return _status === 'update' || _status === 'create' ? (
                  <Form.Item>
                    {$form.getFieldDecorator('taxId', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`smdm.taxRateOrg.model.taxRate.taxCode`).d('税率代码'),
                          }),
                        },
                      ],
                      initialValue: record.taxId,
                    })(
                      <Lov
                        code="SMDM.TAX"
                        textValue={record.taxCode}
                        queryParams={{ enabledFlag: 1, lang: language, taxFrom: 'RATIO' }}
                        lovOptions={{ displayField: 'taxCode', valueField: 'taxId' }}
                        onChange={(text, lovRecord) => {
                          const { taxId, taxCode, taxRate } = lovRecord;
                          this.handleUpdateTaxService(record, { taxId, taxCode, taxRate });
                        }}
                      />
                    )}
                  </Form.Item>
                ) : (
                  val
                );
              },
            },
            // {
            //   title: intl.get(`smdm.taxRateOrg.model.taxRate.taxFrom`).d('税率形式'),
            //   width: 150,
            //   dataIndex: 'taxFromMeaning',
            // },
            // {
            //   title: `${intl.get(`smdm.taxRateOrg.model.taxRate.quotaValue`).d('定额税值')}`,
            //   width: 120,
            //   dataIndex: 'quotaValue',
            // },
            // {
            //   title: `${intl
            //     .get(`smdm.taxRateOrg.model.taxRate.quotaCurrencyId`)
            //     .d('定额税币种')}`,
            //   width: 120,
            //   dataIndex: 'currencyName',
            // },
            // {
            //   title: `${intl.get(`smdm.taxRateOrg.model.taxRate.quotaUomId`).d('定额税单位')}`,
            //   width: 120,
            //   dataIndex: 'uomName',
            // },
            {
              title: `${intl.get(`smdm.taxRateOrg.model.taxRate.taxRate`).d('税率')}（%）`,
              // align: 'right',
              width: 100,
              dataIndex: 'taxRate',
              render: (value) => numberRender(value, 3, false),
            },
            {
              title: intl.get('hzero.common.status').d('状态'),
              width: 75,
              // align: 'center',
              dataIndex: 'enabledFlag',
              render: (val, record) => {
                // 默认为启用, 所以判断 是不是为 0
                const { $form, _status } = record;
                return _status === 'update' || _status === 'create'
                  ? $form.getFieldDecorator('enabledFlag', {
                    initialValue: val,
                  })(<Checkbox checkedValue={1} unCheckedValue={0} />)
                  : enableRender(val, record);
              },
            },
            {
              title: intl.get('smdm.taxRateOrg.model.taxRate.isDefaultTax').d('是否默认税率'),
              width: 120,
              // align: 'center',
              dataIndex: 'defaultFlag',
              render: (val, record) => {
                // 默认为启用, 所以判断 是不是为 0
                const { $form, _status } = record;
                return _status === 'update' || _status === 'create'
                  ? $form.getFieldDecorator('defaultFlag', {
                    initialValue: val,
                  })(<Checkbox checkedValue={1} unCheckedValue={0} />)
                  : yesOrNoRender(val, record);
              },
            },
            {
              title: intl.get('hzero.common.button.action').d('操作'),
              width: 75,
              // align: 'center',
              dataIndex: 'option',
              render: (_, record) => {
                return !record._status ? (
                  <a onClick={() => this.handleEditTaxRate(record)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                ) : record._status === 'create' ? (
                  <a onClick={() => this.handleUpdateTaxService(record, null, true)}>
                    {intl.get('hzero.common.button.clean').d('清除')}
                  </a>
                ) : (
                  record._status === 'update' && (
                    <a onClick={() => this.handleUpdateTaxService(record, { _status: null })}>
                      {intl.get('hzero.common.button.cancel').d('取消')}
                    </a>
                  )
                );
              },
            },
          ]);
    columns.unshift({
      title: intl.get(`smdm.taxRateOrg.model.taxRate.taxServiceNum`).d('税率服务代码'),
      width: 150,
      dataIndex: 'taxServiceNum',
    });

    return columns;
  }

  /**
   * Render
   * @returns React.element
   */
  render() {
    const {
      loading,
      language,
      taxRateOrg: {
        data = {},
        pagination = {},
        serviceContent = {},
        servicePagination = {},
        taxTypeList = [], // 税种值集
        taxFromList = [], // 税率形式
        taxRateTypeList = [], // 税率类型
      },
      fields = [],
      fetchTaxRateServiceLoading = false,
      fetchFieldsLoading = false,
      saving = false,
      fetchTaxRateServiceSaveLoading = false,
      customizeForm,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const { content } = data;
    const { taxRateSrouce = {}, modalVisible = false, tabType } = this.state;
    const filterProps = {
      customizeFilterForm,
      onSearch: this.handleSearchTaxRate,
      onRef: this.handleBindRef,
    };
    const columns = [
      {
        title: intl.get(`smdm.taxRateOrg.model.taxRate.taxCode`).d('税率代码'),
        width: 150,
        dataIndex: 'taxCode',
      },
      {
        title: intl.get(`smdm.taxRateOrg.model.taxRate.description`).d('税率描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get(`smdm.taxRateOrg.model.taxRate.taxType`).d('税种'),
        width: 150,
        dataIndex: 'taxTypeMeaning',
      },
      {
        title: intl.get(`smdm.taxRateOrg.model.taxRate.taxFrom`).d('税率形式'),
        width: 150,
        dataIndex: 'taxFromMeaning',
      },
      {
        title: intl.get(`smdm.taxRateOrg.model.taxRate.company`).d('公司'),
        width: 150,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`smdm.taxRateOrg.model.taxRate.taxRateType`).d('税率类型'),
        width: 150,
        dataIndex: 'taxRateTypeMeaning',
      },
      {
        title: intl.get(`smdm.taxRateOrg.model.taxRate.refTaxCode`).d('平台税率代码'),
        width: 150,
        dataIndex: 'refTaxCode',
      },
      {
        title: intl.get(`smdm.taxRateOrg.model.taxRate.refDescription`).d('平台税率描述'),
        dataIndex: 'refDescription',
      },
      {
        title: `${intl.get(`smdm.taxRateOrg.model.taxRate.taxRate`).d('税率')}（%）`,
        // align: 'right',
        width: 100,
        dataIndex: 'taxRate',
        render: (value) => numberRender(value, 3, false),
      },
      {
        title: `${intl.get(`smdm.taxRateOrg.model.taxRate.refTaxRate`).d('平台税率')}（%）`,
        // align: 'right',
        width: 120,
        dataIndex: 'refTaxRate',
        render: (value) => numberRender(value, 3, false),
      },
      {
        title: `${intl.get(`smdm.taxRateOrg.model.taxRate.quotaValue`).d('定额税值')}`,
        width: 120,
        dataIndex: 'quotaValue',
      },
      {
        title: `${intl.get(`smdm.taxRateOrg.model.taxRate.quotaCurrencyId`).d('定额税币种')}`,
        width: 120,
        dataIndex: 'currencyName',
      },
      {
        title: `${intl.get(`smdm.taxRateOrg.model.taxRate.quotaUomId`).d('定额税单位')}`,
        width: 120,
        dataIndex: 'uomName',
      },
      {
        title: `${intl.get(`smdm.taxRateOrg.model.taxRate.orderSeq`).d('排序号')}`,
        width: 120,
        dataIndex: 'orderSeq',
      },
      {
        title: intl.get('smdm.common.model.common.externalSystemCode').d('来源系统'),
        width: 100,
        // align: 'center',
        dataIndex: 'externalSystemCode',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 75,
        // align: 'center',
        dataIndex: 'enabledFlag',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get('smdm.common.model.common.includedTaxFlag').d('是否含税'),
        width: 75,
        dataIndex: 'includedTaxFlag',
        render: (val, record) => yesOrNoRender(val, record),
      },
      {
        title: intl.get('smdm.common.model.common.consumptionTaxFlag').d('是否记消费税'),
        width: 75,
        dataIndex: 'consumptionTaxFlag',
        render: (val, record) => yesOrNoRender(val, record),
      },
      {
        title: intl.get('smdm.taxRateOrg.model.taxRate.isDefault').d('是否默认'),
        width: 100,
        // align: 'center',
        dataIndex: 'defaultFlag',
        render: (val, record) => yesOrNoRender(val, record),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 75,
        // align: 'center',
        dataIndex: 'option',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleEditTaxRate(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    const taxRateServiceProps = {
      language,
      loading: fields.length <= 0 ? false : fetchTaxRateServiceLoading || fetchFieldsLoading,
      columns: this.taxRateColumns(),
      content: fields.length <= 0 ? [] : serviceContent,
      pagination: fields.length > 0 && servicePagination,
      onSearch: this.handleSearchTaxRateService,
      fields,
      onRef: (ref) => {
        this.taxRateForm = ref;
      },
    };

    return (
      <React.Fragment>
        <Header title={intl.get(`smdm.taxRateOrg.view.message.title`).d('税率定义')}>
          {/* <Button
            icon="fork"
            type="primary"
            style={{ marginRight: 8 }}
            onClick={this.handleQuoteData}
          >
            {intl.get(`smdm.materiel.view.option.quote`).d('引用云级数据')}
          </Button> */}
          {tabType === 'taxRateService' && (
            <>
              <Button
                type="primary"
                icon="save"
                onClick={this.dataSave}
                disabled={fetchTaxRateServiceLoading || fields.length <= 0}
                loading={fetchTaxRateServiceSaveLoading}
              >
                {intl.get(`hzero.common.save`).d('保存')}
              </Button>
              <Button
                icon="plus"
                onClick={this.handleAddTaxRate}
                disabled={fetchTaxRateServiceLoading || fields.length <= 0}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <Button
                icon="fork"
                onClick={() => this.handleQuoteTaxRate()}
                disabled={fetchTaxRateServiceLoading}
              >
                {intl.get('smdm.taxRateOrg.model.taxRate.quoteDemisionMap').d('引用云级维度映射')}
              </Button>
              <Button
                icon="fork"
                onClick={() => this.handleQuoteTaxRate('demision')}
                disabled={fetchTaxRateServiceLoading}
              >
                {intl.get('smdm.taxRateOrg.model.taxRate.quoteDemision').d('引用云级维度')}
              </Button>
            </>
          )}
          {tabType !== 'taxRateService' && (
            <Button
              icon="plus"
              type="primary"
              // disabled={fields.length <= 0}
              onClick={this.handleAddTaxRate}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )}
        </Header>
        <Content>
          <Tabs defaultActiveKey="basicDefinition" onChange={this.handleChangeTab} animated={false}>
            <Tabs.TabPane
              tab={intl.get(`smdm.taxRateOrg.model.taxRate.basicDefinition`).d('基础定义')}
              key="basicDefinition"
            >
              <div>
                <div className="table-list-search">
                  <FilterForm {...filterProps} />
                </div>
                {customizeTable(
                  {
                    code: 'SMDM_TAXRATE_ORG.LIST',
                  },
                  <Table
                    bordered
                    rowKey="taxId"
                    loading={loading}
                    dataSource={content}
                    columns={columns}
                    pagination={pagination}
                    onChange={this.handleSearchTaxRate}
                  />
                )}
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`smdm.taxRateOrg.model.taxRate.taxRateService`).d('税率服务')}
              key="taxRateService"
            >
              <TaxRateService {...taxRateServiceProps} />
            </Tabs.TabPane>
          </Tabs>
        </Content>
        <TaxOrgForm
          sideBar
          destroyOnClose
          title={
            taxRateSrouce.taxId
              ? intl.get(`smdm.taxRateOrg.view.message.title.madal.edit`).d('编辑租户级税率')
              : intl.get(`smdm.taxRateOrg.view.message.title.madal.create`).d('新建租户级税率')
          }
          onRef={(ref) => {
            this.taxOrgForm = ref;
          }}
          data={taxRateSrouce}
          language={language}
          handleAdd={this.handleSaveOption}
          confirmLoading={saving}
          modalVisible={modalVisible}
          hideModal={this.handleModalClose}
          taxTypeList={taxTypeList}
          taxFromList={taxFromList}
          taxRateTypeList={taxRateTypeList}
          customizeForm={customizeForm}
        />
      </React.Fragment>
    );
  }
}
