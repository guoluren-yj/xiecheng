import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { Lov, DataSet } from 'choerodon-ui/pro';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
import H0Lov from 'components/Lov';

// import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import styles from './index.less';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
  }

  state = {
    display: false,
  };

  componentDidMount() {
    this.SsrcRefreshApplyToInquiry();
  }

  // 组件卸载清空数据
  componentWillUnmount() {
    window.SsrcRefreshApplyToInquiry = null;
  }

  /**
   * 挂载全局刷新列表方法 此方法被 [58同城] 调用, 严禁删除/修改方法名
   * @protected
   */
  SsrcRefreshApplyToInquiry = () => {
    window.SsrcRefreshList = () => {
      this.handleSearch();
    };
  };

  /**
   * 提交查询表单
   */
  @Bind()
  handleSearch() {
    const {
      onSearch,
      form: { getFieldsValue },
      dispatch,
    } = this.props;
    const value = getFieldsValue();
    const values = {
      ...value,
      ouIdString: value.ouId?.map((ele) => ele.ouId).join(','),
      categoryIdString: value.categoryId?.map((ele) => ele.categoryId).join(','),
      purchaseAgentIdString: value.purchaseAgentId?.map((ele) => ele.purchaseAgentId).join(','),
      itemIdString: value.itemId?.map((ele) => ele.itemId).join(','),
      invOrganizationIdString: value.invOrganizationId?.map((ele) => ele.organizationId).join(','),
      executorBysString: value.executorBys?.map((ele) => ele.userId).join(','),
      prTypeIdString: value.prTypeId?.map((ele) => ele.prTypeId).join(','),
    };
    values.requestDateStart = values.requestDateStart
      ? values.requestDateStart.format('YYYY-MM-DD 00:00:00')
      : undefined; // 格式化时间
    values.requestDateEnd = values.requestDateEnd
      ? values.requestDateEnd.format('YYYY-MM-DD 00:00:00')
      : undefined; // 格式化时间
    values.neededDateStart = values.neededDateStart
      ? values.neededDateStart.format('YYYY-MM-DD 00:00:00')
      : undefined;
    values.neededDateEnd = values.neededDateEnd
      ? values.neededDateEnd.format('YYYY-MM-DD 00:00:00')
      : undefined;
    dispatch({
      type: `${this.props.modelName}/updateApplyToInquirySearchData`,
      payload: {
        type: 'search',
        params: values,
      },
    });
    this.deleteAttr(values, [
      'ouId',
      'categoryId',
      'purchaseAgentId',
      'itemId',
      'invOrganizationId',
      'executorBys',
      'prTypeId',
    ]);
    onSearch(values);
    // 保存查询的数据，下次刷新tab时直接取值
  }

  @Bind()
  deleteAttr(obj, keys) {
    keys.forEach((key) => {
      if (obj[key]) {
        // eslint-disable-next-line no-param-reassign
        delete obj[key];
      }
    });
    return obj;
  }

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    const { dispatch } = this.props;
    this.props.form.resetFields();
    this.ds.reset();
    // 保存查询的数据，下次刷新tab时直接取值
    dispatch({
      type: `${this.props.modelName}/updateApplyToInquirySearchData`,
      payload: {
        type: 'reset',
        params: {},
      },
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

  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'ouLov',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.OU',
        ignore: 'always',
        multiple: true,
      },
      {
        name: 'categoryLov',
        type: 'object',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        ignore: 'always',
        multiple: true,
        optionsProps: {
          paging: 'server',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
          // childrenField: 'children',
        },
        lovPara: {
          businessObjectCode: 'SRM_C_SRM_SSRC_RFX_HEADER',
        },
        lovDefineAxiosConfig: (code) => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  treeFlag: 'Y',
                  idField: 'categoryId',
                  parentIdField: 'parentCategoryId',
                };
              },
            ],
          };
        },
      },
      {
        name: 'itemCategoryId',
        bind: 'itemCategoryIdLov.categoryId',
        multiple: ',',
      },
      {
        name: 'itemCategoryName',
        bind: 'itemCategoryIdLov.categoryName',
        multiple: ',',
      },
      {
        name: 'purchaseAgentLov',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
        ignore: 'always',
        lovPara: { organizationId: this.props.organizationId },
        multiple: true,
      },
      {
        name: 'itemLov',
        type: 'object',
        lovCode: 'SSRC.CUSTOMER_ITEM',
        ignore: 'always',
        multiple: true,
      },
      {
        name: 'invOrganizationLov',
        type: 'object',
        lovCode: 'HPFM.INV_ORG',
        ignore: 'always',
        multiple: true,
        lovPara: { organizationId: this.props.organizationId, enabledFlag: 1 },
      },
      {
        name: 'executorBysLov',
        type: 'object',
        lovCode: 'SSLM.KPI_USER',
        ignore: 'always',
        multiple: true,
        textField: 'userName',
        lovPara: { tenantId: this.props.organizationId },
      },
      {
        name: 'prTypeLov',
        type: 'object',
        lovCode: 'SPUC.PR_DEMAND_TYPE',
        ignore: 'always',
        multiple: true,
      },
    ],
  });

  render() {
    const {
      form = {},
      bidFlag = false,
      sourceKey = 'INQUIRY',
      customizeFilterForm = () => {},
      form: { getFieldDecorator },
      projectCategoryCode = [],
      applyToInquirySearchData = {},
    } = this.props;
    const { display } = this.state;

    return customizeFilterForm(
      {
        form,
        expand: display,
        code: `SSRC.${sourceKey}_HALL.APPLY_TO_INQUIRY.FILTER`,
      },
      <Form layout="inline" className={classnames('more-fields-form', styles['apply-form'])}>
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.applicationNum`)
                    .d('申请编号')}
                  {...formLayout}
                >
                  {getFieldDecorator('displayPrNum', {
                    initialValue: applyToInquirySearchData?.displayPrNum,
                  })(<Input maxLength={40} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体')}
                  {...formLayout}
                >
                  {getFieldDecorator('ouId', {
                    initialValue: applyToInquirySearchData?.ouId,
                  })(<Lov dataSet={this.ds} name="ouLov" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`ssrc.common.goodsSorts`).d('物品分类')} {...formLayout}>
                  {getFieldDecorator('categoryId', {
                    initialValue: applyToInquirySearchData?.categoryId,
                  })(
                    <Lov
                      dataSet={this.ds}
                      name="categoryLov"
                      searchFieldProps={{ multiple: true }}
                      tableProps={{
                        virtual: true,
                        maxHeight: '500px',
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: display ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`)
                    .d('采购员')}
                  {...formLayout}
                >
                  {getFieldDecorator('purchaseAgentId', {
                    initialValue: applyToInquirySearchData?.purchaseAgentId,
                  })(<Lov dataSet={this.ds} name="purchaseAgentLov" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('itemId', {
                    initialValue: applyToInquirySearchData?.itemId,
                  })(<Lov dataSet={this.ds} name="itemLov" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.projectCategory`)
                    .d('项目类别')}
                  {...formLayout}
                >
                  {getFieldDecorator('projectCategory', {
                    initialValue: applyToInquirySearchData?.projectCategory,
                  })(
                    <Select
                      style={{ width: '100%' }}
                      value={applyToInquirySearchData?.projectCategory}
                    >
                      {(projectCategoryCode || []).map((item = {}) => (
                        <Select.Option key={item?.value} value={item?.value}>
                          {item?.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`)
                    .d('库存组织')}
                  {...formLayout}
                >
                  {getFieldDecorator('invOrganizationId', {
                    initialValue: applyToInquirySearchData?.invOrganizationId,
                  })(<Lov dataSet={this.ds} name="invOrganizationLov" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.prRequestedNam`).d('申请人')}
                  {...formLayout}
                >
                  {getFieldDecorator('prRequestedName', {
                    initialValue: applyToInquirySearchData?.prRequestedName,
                  })(<Input />)}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.referencePriceDisplayFlag`).d('是否有参考价格')}
                  {...formLayout}
                >
                  {getFieldDecorator('referencePriceDisplayFlag')(<Input />)}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('itemName', {
                    initialValue: applyToInquirySearchData?.itemName,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.projectsName`).d('项目名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('projectName', {
                    initialValue: applyToInquirySearchData?.projectName,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.projectNumber`).d('项目号')}
                  {...formLayout}
                >
                  {getFieldDecorator('projectNum', {
                    initialValue: applyToInquirySearchData?.projectNum,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.prTypeName`).d('申请类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('prTypeId', {
                    initialValue: applyToInquirySearchData?.prTypeId,
                  })(<Lov name="prTypeLov" dataSet={this.ds} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.executorName`)
                    .d('需求执行人')}
                  {...formLayout}
                >
                  {getFieldDecorator('executorBys', {
                    initialValue: applyToInquirySearchData?.executorBys,
                  })(<Lov dataSet={this.ds} name="executorBysLov" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.requestDateStart`)
                    .d('申请日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('requestDateStart', {
                    initialValue:
                      applyToInquirySearchData?.requestDateStart &&
                      moment(applyToInquirySearchData?.requestDateStart),
                  })(<DatePicker />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.requestDateEnd`)
                    .d('申请日期至')}
                  {...formLayout}
                >
                  {getFieldDecorator('requestDateEnd', {
                    initialValue:
                      applyToInquirySearchData?.requestDateEnd &&
                      moment(applyToInquirySearchData?.requestDateEnd),
                  })(<DatePicker />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('hzero.common.date.need.from').d('需求日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('neededDateStart', {
                    initialValue:
                      applyToInquirySearchData?.neededDateStart &&
                      moment(applyToInquirySearchData?.neededDateStart),
                  })(<DatePicker format={getDateFormat()} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('hzero.common.date.need.to').d('需求日期至')}
                  {...formLayout}
                >
                  {getFieldDecorator('neededDateEnd', {
                    initialValue:
                      applyToInquirySearchData?.neededDateEnd &&
                      moment(applyToInquirySearchData?.neededDateEnd),
                  })(<DatePicker format={getDateFormat()} />)}
                </FormItem>
              </Col>
              {bidFlag ? null : (
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.suggestedSupplier`)
                      .d('建议供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator(
                      'supplierQueryParamStr',
                      {}
                    )(<H0Lov code="SSRC.TEMPLATE_NAME" />)}
                  </FormItem>
                </Col>
              )}
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ display: display ? 'none' : 'inline-block' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ display: display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}

const HOCComponent = (Com) => {
  return connect(({ inquiryHall }) => ({
    inquiryHall,
    applyToInquirySearchData: inquiryHall.applyToInquirySearchData,
    modelName: 'inquiryHall',
  }))(Form.create({ fieldNameProp: null })(Com));
};

export default HOCComponent(FilterForm);
export { FilterForm };
