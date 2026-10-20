/**
 * inquiryHall - 寻源服务/询价大厅-创建
 * @date: 2018-12-29
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Form, Row, Col, Input, Select, InputNumber, Tabs } from 'hzero-ui';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray, isObject } from 'lodash';
import classnames from 'classnames';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import Lov from 'components/Lov';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import QuotationDirectLable from '@/utils/constants';
import { fetchIndustyType, fetchIndustyCategory } from '@/services/commonService';

import common from '@/routes/ssrc/common.less';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const { Option, OptGroup } = Select;

@withCustomize({
  unitCode: ['SSRC.INQUIRY_HALL_CREATE.HEADER'],
})
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
@connect(({ inquiryHall, loading }) => ({
  inquiryHall,
  saveLoading: loading.effects['inquiryHall/createRfx'],
  organizationId: getCurrentOrganizationId(),
}))
export default class Create extends PureComponent {
  state = {
    currencyCode: '',
    companyName: null,
    sourceType: null,
    priceCategory: null,
    bidRuleType: null,
    expertScoreType: null,
    matchRestrictFlag: null, // 供应商能力清单匹配限制
    setCurrentValueFlag: false, // 是否选择过币种
    industry: [], // 行内关系
    industryCategory: [], // 主营品类
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const lovCodes = {
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 竞价方式
      quotationType: 'SSRC.QUOTATION_TYPE', // 报价方式
      organizationType: 'SSRC.ORGANIZATION_TYPE', // 境内外关系
    };
    dispatch({
      type: 'inquiryHall/batchCode',
      payload: { lovCodes },
    });
    this.handleSearch();
  }

  /**
   * 查询创建部门
   */
  @Bind()
  handleSearch() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'inquiryHall/fetchCreatedUnitName',
      payload: {
        organizationId,
      },
    });
  }

  // 查询行业类型
  @Bind()
  async fetchIndustyType(params = {}) {
    let result = null;
    try {
      result = await fetchIndustyType({
        ...params,
      });
      result = getResponse(result);
      if (!result || isEmpty(result)) {
        return;
      }
      this.setState({
        industry: result,
      });
    } catch (e) {
      throw e;
    }
  }

  // 主营品类
  @Bind()
  async fetchIndustyCategory(params = {}) {
    let result = null;
    try {
      result = await fetchIndustyCategory({
        ...params,
        enabledFlag: 1,
      });
      result = getResponse(result);
      this.setState({
        industryCategory: result,
      });
    } catch (e) {
      throw e;
    }
  }

  // 获取行业类型 主营品类
  @Bind()
  getIndustryAndCategoryData(headerData = {}) {
    const { industryData = null, industryCategoryData = null, sourceMethod = null } = headerData;
    if (sourceMethod === 'INVITE') {
      return;
    }

    const { industry = [], industryCategory = [] } = this.state || {};

    const compareAndIntegrateData = (allData = null, currentData = null, idName = '') => {
      let list = [];

      if (!isEmpty(allData) && !isEmpty(currentData)) {
        allData.forEach((item) => {
          const { children = null } = item;
          if (isEmpty(children)) {
            return;
          }
          children.forEach((record) => {
            const { [idName]: dataId = null } = record || {};
            const dataIndex = currentData.findIndex((id) => dataId && id === dataId);
            if (dataIndex >= 0) {
              list.push(record);
            }
          });
        });
      }
      list = JSON.stringify(list);
      return list;
    };

    return {
      industryData: compareAndIntegrateData(industry, industryData, 'industryId'),
      industryCategoryData: compareAndIntegrateData(
        industryCategory,
        industryCategoryData,
        'categoryId'
      ),
    };
  }

  /**
   * 创建
   */
  @Bind()
  rfxCreate() {
    const { dispatch, organizationId, form } = this.props;
    const {
      currencyCode,
      companyName,
      sourceType,
      priceCategory,
      sourceCategory,
      bidRuleType,
      expertScoreType,
    } = this.state;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        const { industryData = null, industryCategoryData = null } =
          this.getIndustryAndCategoryData(values) || {};
        dispatch({
          type: 'inquiryHall/createRfx',
          payload: {
            values: {
              sourceCategory,
              currencyCode,
              sourceType,
              priceCategory,
              companyName,
              rfxStatus: 'NEW',
              sourceFrom: 'MANUAL',
              bidRuleType,
              expertScoreType,
              ...values,
              industryData,
              industryCategoryData,
            },
            organizationId,
            customizeUnitCode: 'SSRC.INQUIRY_HALL_CREATE.HEADER',
          },
        }).then((res) => {
          if (res) {
            notification.success();

            dispatch(
              routerRedux.push({
                pathname: `/ssrc/inquiry-hall/rfx-update/${res.rfxHeaderId}`,
              })
            );
          }
        });
      }
    });
  }

  /**
   * 获取companyName公司名称
   */
  setCompanyName(val, record) {
    const { form } = this.props;
    const { setCurrentValueFlag } = this.state;
    this.setState({
      companyName: record.companyName,
    });
    if (setCurrentValueFlag) {
      form.setFieldsValue({
        unitId: undefined,
      });
    } else if (record.currencyCode) {
      form.setFieldsValue({
        unitId: undefined,
        currencyId: record.currencyId,
        currencyCode: record.currencyCode,
      });
    }
  }

  /**
   * 根据规则改变值
   */
  @Bind()
  setValue(val, record) {
    const { form } = this.props;
    this.setState({
      currencyCode: record.currencyCode,
      setCurrentValueFlag: !isEmpty(record),
    });
    form.setFieldsValue({
      currencyCode: record.currencyCode,
      currencyId: record.currencyId,
    });
  }

  /**
   * 改变寻源模板
   * @param val
   * @param record
   */
  @Bind()
  changeTemplateId(val, record) {
    const { form } = this.props;
    this.setState({
      sourceCategory: record.sourceCategory,
      sourceType: record.sourceType,
      priceCategory: record.priceCategory,
      bidRuleType: record.bidRuleType,
      expertScoreType: record.expertScoreType,
      matchRestrictFlag: record.matchRestrictFlag,
    });
    form.setFieldsValue({
      sourceCategory: record.sourceCategory,
      sourceMethod: record.sourceMethod,
      auctionDirection: record.auctionDirection,
      quotationType: record.quotationType,
      bidRuleType: record.bidRuleType,
      expertScoreType: record.expertScoreType,
    });
  }

  /**
   * 改变寻源方式
   * @param val
   * @param record
   */
  @Bind()
  changeSourceMethod() {
    const { form } = this.props;
    // 清空【境内外关系】【行业类型】【主营类型】
    form.setFieldsValue({
      organizationType: null,
      industryData: null,
      industryCategoryData: null,
    });
  }

  // 判断是境内(1)/境外(0)标识
  @Bind()
  isDomesTic(organizationType = null) {
    return organizationType && organizationType === 'DOMESTIC' ? 1 : 0;
  }

  /**
   * 改变境内外关系
   * @param val
   * @param record
   */
  @Bind()
  changeOrganizationType(value) {
    const { form } = this.props;

    this.setState({
      industryCategory: [],
      industry: [],
    });

    // 清空【行业类型】【主营类型】
    form.setFieldsValue({
      industryData: null,
      industryCategoryData: null,
    });

    const domesticFlag = this.isDomesTic(value);
    this.fetchIndustyType({
      domesticFlag,
    });
  }

  // 改变行业类型-select-change
  @Bind()
  handleChangeIndustry = (data = []) => {
    const { form } = this.props;

    if (isEmpty(data)) {
      this.setState({ industryCategory: [] });
      // 清空【主营类型】
      form.setFieldsValue({
        industryCategoryData: null,
      });
      return;
    }

    const { industryCategory = [] } = this.state;
    const industryCategoryData = form.getFieldValue('industryCategoryData');
    // 所有的industryCategory选项
    let industryCategoryList = [];
    industryCategory.forEach((item) => {
      industryCategoryList = [...industryCategoryList, ...(item.children || [])];
    });
    // 获取industryCategoryData的每一项对象[{}]
    industryCategoryList = industryCategoryList.filter((i) =>
      industryCategoryData?.includes(i?.categoryId)
    );
    const newIndustryCategoryData = industryCategoryList.reduce((groups, item) => {
      if (data.includes(item?.industryId)) {
        groups.push(item?.categoryId);
      }
      return groups;
    }, []);
    // 设置最新的industryCategoryData
    form.setFieldsValue({ industryCategoryData: newIndustryCategoryData });

    this.initAndFetchInductryCategory(data);
  };

  // 查询主营品类
  @Bind()
  initAndFetchInductryCategory(industryData = []) {
    if (isEmpty(industryData)) {
      return;
    }

    const ids = [];
    industryData.forEach((item = {}) => {
      let currentId = item;
      if (isObject(item)) {
        currentId = item?.industryId;
      }
      ids.push(currentId);
    });

    const stringIds = ids.join(',');
    this.fetchIndustyCategory({
      industryIdList: stringIds,
    });
  }

  // select-grouped-render
  @Bind()
  buildGroupSelectOption(
    list = [],
    groupKey = 'id',
    groupLabel = 'name',
    keyName = groupKey,
    labelName = groupLabel
  ) {
    const options =
      isArray(list) &&
      list.map((item) => {
        const { children = [] } = item;
        return (
          <OptGroup key={item[groupKey]} label={item[groupLabel]}>
            {children &&
              children.map((child) => {
                return (
                  <Option key={child[keyName]} value={child[keyName]}>
                    {child[labelName]}
                  </Option>
                );
              })}
          </OptGroup>
        );
      });
    return options;
  }

  /**
   * 表单头
   */
  renderHeaderForm() {
    const {
      form,
      organizationId,
      inquiryHall: { code = {}, cHallHeader = {} },
      customizeForm,
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    const {
      currencyCode = '',
      matchRestrictFlag,
      industry = [],
      industryCategory = [],
    } = this.state;
    const {
      sourceMethod = [],
      auctionDirection = [],
      quotationType = [],
      organizationType = [],
    } = code;

    const industryOptions = this.buildGroupSelectOption(industry, 'industryId', 'industryName');
    const industryCategoryOptions = this.buildGroupSelectOption(
      industryCategory,
      'industryId',
      'industryName',
      'categoryId',
      'categoryName'
    );

    return customizeForm(
      { code: 'SSRC.INQUIRY_HALL_CREATE.HEADER', form, dataSource: cHallHeader },
      <Form className={classnames(common['fixed-form-row'], 'ued-detail-wrapper')}>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.RFXNo.`).d('RFX单号')}
              {...formLayout}
            >
              {getFieldDecorator('rfxNum', {
                rules: [
                  {
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.RFXNo.`).d('RFX单号'),
                    }),
                  },
                ],
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitle`).d('询价单标题')}
              {...formLayout}
            >
              {getFieldDecorator('rfxTitle', {
                // initialValue: '',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitle`)
                        .d('询价单标题'),
                    }),
                  },
                  {
                    max: 150,
                    message: intl.get('hzero.common.validation.max', {
                      max: 150,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板')}
              {...formLayout}
            >
              {getFieldDecorator('templateId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`)
                        .d('寻源模板'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSRC.TEMPLATE_NAME"
                  queryParams={{ sourceCategory: 'RFX' }}
                  onChange={(val, record) => this.changeTemplateId(val, record)}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别')}
              {...formLayout}
            >
              {getFieldDecorator('sourceCategory', {
                rules: [
                  {
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`)
                        .d('寻源类别'),
                    }),
                  },
                ],
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称')}
              {...formLayout}
            >
              {getFieldDecorator('purOrganizationId', {})(<Lov code="SPFM.USER_AUTH.PURORG" />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...formLayout}>
              {getFieldDecorator('companyId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('ssrc.common.company').d('公司'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  onChange={(val, record) => this.setCompanyName(val, record)}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门')}
              {...formLayout}
            >
              {getFieldDecorator(
                'unitId',
                {}
              )(
                <Lov
                  code="SPRM.USER_DEPARTMENT"
                  textField="unitName"
                  disabled={!form.getFieldValue('companyId')}
                  queryParams={{
                    tenantId: organizationId,
                    companyId: form.getFieldValue('companyId'),
                  }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.createdUnitName`).d('创建人部门')}
              {...formLayout}
            >
              {getFieldDecorator('createdUnitName', {
                initialValue: cHallHeader.unitName,
              })(<Input disabled />)}
              {getFieldDecorator('createdUnitId', {
                initialValue: cHallHeader.unitId,
              })}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式')}
              {...formLayout}
            >
              {getFieldDecorator('sourceMethod', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`)
                        .d('寻源方式'),
                    }),
                  },
                ],
              })(
                <Select onChange={this.changeSourceMethod}>
                  {sourceMethod.map((item) => (
                    <Select.Option
                      value={item.value}
                      key={item.value}
                      disabled={matchRestrictFlag && item.value !== 'INVITE'}
                    >
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式')}
              {...formLayout}
            >
              {getFieldDecorator('quotationType', {
                initialValue: form.getFieldValue('sourceCategory') === 'RFA' ? 'ONLINE' : null,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.quotationType`)
                        .d('报价方式'),
                    }),
                  },
                ],
              })(
                <Select>
                  {quotationType.map((item) => (
                    <Select.Option
                      value={item.value}
                      key={item.value}
                      disabled={
                        form.getFieldValue('sourceCategory') === 'RFA' && item.value === 'ON_OFF'
                      }
                    >
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={<QuotationDirectLable />} {...formLayout}>
              {getFieldDecorator('auctionDirection', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.biddingDirection`)
                        .d('报价方向'),
                    }),
                  },
                ],
              })(
                <Select>
                  {auctionDirection.map((item) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额')}
              {...formLayout}
            >
              {getFieldDecorator(
                'budgetAmount',
                {}
              )(<InputNumber style={{ width: '100%' }} disabled precision={2} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种')}
              {...formLayout}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: currencyCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM.EXCHANGE_RATE.CURRENCY"
                  textField="currencyCode"
                  onChange={(val, record) => this.setValue(val, record)}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期')}
              {...formLayout}
            >
              {getFieldDecorator('creationDate', {
                rules: [
                  {
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.creationDate`)
                        .d('创建日期'),
                    }),
                  },
                ],
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员')}
              {...formLayout}
            >
              {getFieldDecorator('purchaserId', {
                initialValue: cHallHeader.purchaseAgentId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PURCHASE_AGENT"
                  lovOptions={{
                    displayField: 'purchaseAgentName',
                    valueField: 'purchaseAgentId',
                  }}
                  textValue={cHallHeader.purchaseAgentName}
                  queryParams={{ organizationId }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.organizationType`)
                .d('境内外关系')}
              {...formLayout}
            >
              {getFieldDecorator(
                'organizationType',
                {}
              )(
                <Select
                  onChange={this.changeOrganizationType}
                  disabled={form.getFieldValue('sourceMethod') === 'INVITE'}
                  allowClear
                >
                  {organizationType.map((item) => (
                    <Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.industryData`).d('行业类型')}
              {...formLayout}
            >
              {getFieldDecorator(
                'industryData',
                {}
              )(
                <Select
                  allowClear
                  mode="multiple"
                  onChange={this.handleChangeIndustry}
                  notFoundContent={intl
                    .get('ssrc.inquiryHall.view.message.selectOrgTypeDataFirst')
                    .d('请先选择境内外关系')}
                  disabled={form.getFieldValue('sourceMethod') === 'INVITE'}
                  optionFilterProp="children"
                >
                  {industryOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.industryCategoryData`)
                .d('主营品类')}
              {...formLayout}
            >
              {getFieldDecorator(
                'industryCategoryData',
                {}
              )(
                <Select
                  allowClear
                  mode="multiple"
                  notFoundContent={intl
                    .get('ssrc.inquiryHall.view.message.selectIndustryDataFirst')
                    .d('请先选择行业类型')}
                  disabled={form.getFieldValue('sourceMethod') === 'INVITE'}
                  optionFilterProp="children"
                >
                  {industryCategoryOptions}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={8}>
            <Form.Item label={intl.get(`hzero.common.remark`).d('备注')} {...formLayout}>
              {getFieldDecorator('rfxRemark')(
                <Input.TextArea style={{ marginLeft: '-4px' }} maxLength={1000} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.remarkInside`).d('备注(内部)')}
            >
              {getFieldDecorator('internalRemark', {
                rules: [
                  {
                    max: 1000,
                    message: intl
                      .get('ssrc.inquiryHall.model.inquiryHall.overLength')
                      .d('最多不能超过1000个字符'),
                  },
                ],
              })(<Input.TextArea style={{ marginLeft: '-4px' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.common.model.common.documentCreationDate`).d('单据创建时间')}
              {...formLayout}
            >
              {getFieldDecorator('sourceCreationDate', {
                rules: [
                  {
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.common.model.common.documentCreationDate`).d('单据创建时间'),
                    }),
                  },
                ],
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { saveLoading } = this.props;
    return (
      <React.Fragment>
        <Header
          backPath="/ssrc/inquiry-hall/list"
          title={intl.get(`ssrc.inquiryHall.view.message.title.RFXCreate`).d('RFx创建')}
        >
          <Button icon="save" type="primary" onClick={this.rfxCreate} loading={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Tabs defaultActiveKey="baseInfos" animated={false}>
            <Tabs.TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.panel.baseInfos`).d('基本信息')}
              key="baseInfos"
            >
              {this.renderHeaderForm()}
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
