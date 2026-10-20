import React from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Input, Button, Spin } from 'hzero-ui';
import uuid from 'uuid/v4';
import { isEmpty } from 'lodash';
import { Bind, debounce } from 'lodash-decorators';

import { Content, Header } from 'components/Page';
import Checkbox from 'components/Checkbox';

import intl from 'utils/intl';
import { getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import Lov from 'components/Lov';

import TemplateForm from './TemplateForm';
import CompanyLink from './CompanyLink';
import ContactCompany from './ContactCompany';
import style from './index.less';
import Banner from './Banner';

const { TextArea } = Input;
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@connect(({ templatesConfig, loading }) => ({
  templatesConfig,
  fetchLoading: loading.effects['templatesConfig/fetchTemplateDetail'],
  savingLoading: loading.effects['templatesConfig/saveTemplateDetail'],
  fetchInfoLoading: loading.effects['templatesConfig/fetchTemplateDetailByAssignId'],
}))
@formatterCollections({
  code: [
    'hzero.common',
    'spfm.portalAssign',
    'spfm.common',
    'entity.group',
    'entity.company',
    'hptl.common',
    'spfm.protalAssign',
  ],
})
export default class Template extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
      assignId: undefined,
      configId: undefined,
      companyId: undefined,
      webUrl: undefined,
      configVisible: false,
    };
  }

  componentDidMount() {
    this.fetchInfo();
  }

  @Bind()
  fetchInfo() {
    const { dispatch } = this.props;
    dispatch({
      type: 'templatesConfig/getGroupInfo',
      payload: {},
    });
  }

  /**
   * @function 获取模板数据
   * @param {Object} params - 请求参数
   */
  fetchTemplateList(params = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'templatesConfig/fetchTemplateConfigList',
      payload: params,
    }).then((res) => {
      if (res) {
        this.setState({
          configId: res[0].configId,
        });
      }
    });
  }

  /**
   * 查询门户模版配置详细
   */
  @Bind()
  fetchTemplateDetailByAssignId(assignId) {
    const { dispatch } = this.props;
    const { organizationId } = this.state;
    dispatch({
      type: 'templatesConfig/fetchTemplateDetailByAssignId',
      payload: { assignId, organizationId },
    });
  }

  /**
   * 新建行
   */
  @Bind()
  handleCreateRow(type) {
    const {
      dispatch,
      templatesConfig: { templateDetail },
      // match: {
      //   params: { configId },
      // },
    } = this.props;
    const { configId } = this.state;
    const { link = [], contact = [], carousel = [] } = templateDetail;
    const companyLinkRow = {
      configId,
      configItemId: uuid(),
      configCode: 'link',
      description: '',
      linkUrl: '',
      enabledFlag: 1,
      _status: 'create',
    };
    const contactCompanyRow = {
      configId,
      configItemId: uuid(),
      configCode: 'contact',
      description: '',
      enabledFlag: 1,
      _status: 'create',
    };
    const carouselRow = {
      // number:carousel.length+1,
      configId,
      configItemId: uuid(),
      configCode: 'carousel',
      description: '',
      enabledFlag: 1,
      _status: 'create',
    };

    let payload =
      type === 'companyLink'
        ? { templateDetail: { ...templateDetail, link: [companyLinkRow, ...link] } }
        : { templateDetail: { ...templateDetail, contact: [contactCompanyRow, ...contact] } };
    if (type === 'carousel') {
      payload = { templateDetail: { ...templateDetail, carousel: [carouselRow, ...carousel] } };
    }
    dispatch({
      type: 'templatesConfig/updateState',
      payload,
    });
  }

  /**
   * 编辑行
   */
  @Bind()
  handleEditRow(record, type) {
    const {
      dispatch,
      templatesConfig: { templateDetail },
    } = this.props;
    const { link = [], contact = [], carousel = [] } = templateDetail;
    const newCompanyLink = link.map((item) =>
      record.configItemId === item.configItemId ? { ...item, _status: 'update' } : item
    );
    const newContactCompany = contact.map((item) =>
      record.configItemId === item.configItemId ? { ...item, _status: 'update' } : item
    );
    const newCarouselRow = carousel.map((item) =>
      record.configItemId === item.configItemId ? { ...item, _status: 'update' } : item
    );
    let payload =
      type === 'companyLink'
        ? { templateDetail: { ...templateDetail, link: newCompanyLink } }
        : { templateDetail: { ...templateDetail, contact: newContactCompany } };
    if (type === 'carousel') {
      payload = { templateDetail: { ...templateDetail, carousel: newCarouselRow } };
    }
    dispatch({
      type: 'templatesConfig/updateState',
      payload,
    });
  }

  /**
   * 取消编辑行
   */
  @Bind()
  handleCancelRow(record, type) {
    const {
      dispatch,
      templatesConfig: { templateDetail },
    } = this.props;
    const { link = [], contact = [], carousel = [] } = templateDetail;
    const newCompanyLink = link.map((item) => {
      if (item.configItemId === record.configItemId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    const newContactCompany = contact.map((item) => {
      if (item.configItemId === record.configItemId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    const newCarousel = carousel.map((item) => {
      if (item.configItemId === record.configItemId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    let payload =
      type === 'companyLink'
        ? { templateDetail: { ...templateDetail, link: newCompanyLink } }
        : { templateDetail: { ...templateDetail, contact: newContactCompany } };
    if (type === 'carousel') {
      payload = { templateDetail: { ...templateDetail, carousel: newCarousel } };
    }
    dispatch({
      type: 'templatesConfig/updateState',
      payload,
    });
  }

  /**
   * 删除新建行
   */
  @Bind()
  handleDeleteRow(record, type) {
    const {
      dispatch,
      templatesConfig: { templateDetail },
    } = this.props;
    const { link = [], contact = [], carousel = [] } = templateDetail;
    const newCompanyLink = link.filter((item) => item.configItemId !== record.configItemId);
    const newContactCompany = contact.filter((item) => item.configItemId !== record.configItemId);
    const newCarousel = carousel.filter((item) => item.configItemId !== record.configItemId);
    let payload =
      type === 'companyLink'
        ? { templateDetail: { ...templateDetail, link: newCompanyLink } }
        : { templateDetail: { ...templateDetail, contact: newContactCompany } };
    if (type === 'carousel') {
      payload = { templateDetail: { ...templateDetail, carousel: newCarousel } };
    }
    dispatch({
      type: 'templatesConfig/updateState',
      payload,
    });
  }

  @Bind()
  handleDeleteSeleteRows(seleteRows) {
    const { dispatch } = this.props;
    const { assignId } = this.state;
    dispatch({
      type: 'templatesConfig/deleteSeleteRows',
      payload: seleteRows,
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchTemplateDetailByAssignId(assignId);
      }
    });
  }

  /** 给数据加排序标识orderSeq
   *
   * @param {*} originData 原始数据集合
   * @param {*} newData 编辑过的数据集合
   * @param {*} key 根据主键筛选
   */
  addOrderSeq(originData, newData, key) {
    // 新增数据排序标识起始
    let newIndex = originData.filter((item) => item._status !== 'create').length;
    // 已有数据排序标识更新，防止删除数据后在增加数据会产生bug
    let oldIndex = 0;
    originData.forEach((item, index) => {
      const newDataItem = newData.find((newItem) => item[key] === newItem[key]);
      if (newDataItem) {
        // eslint-disable-next-line
        item = newDataItem;
      }
      // 去除新建数据的临时主键
      if (item._status === 'create') {
        // eslint-disable-next-line
        delete item[key];
      }
      // 如果有排序标识，则从0开始更新
      // 如果没有排序标识，则从已有数据的长度开始递增
      if (item.orderSeq) {
        oldIndex++;
        // eslint-disable-next-line
        item.orderSeq = oldIndex;
      } else {
        newIndex++;
        // eslint-disable-next-line
        item.orderSeq = newIndex;
      }
      // eslint-disable-next-line
      originData[index] = item;
    });
    return originData;
  }

  @Bind()
  @debounce(100)
  handleSave() {
    const {
      dispatch,
      form,
      templatesConfig: { templateDetail = {} },
      // match: {
      //   params: { configId },
      // },
    } = this.props;
    const { assignId, configId } = this.state;
    const {
      logo = [],
      carousel = [],
      introduction = [],
      link = [],
      contact = [],
      footer = [{}],
      navbar = [],
      record = [],
      loginconfig = [],
    } = templateDetail;
    const mallLink = navbar.find((m) => m.content === 'mallLink') || {};
    const financialLink = navbar.find((m) => m.content === 'financialLink') || {};
    const registerLink = navbar.find((m) => m.content === 'registerLink') || {};
    const preSalesAssistantLink = navbar.find((m) => m.content === 'preSalesAssistantLink') || {};
    const skipAfterLogin = loginconfig.find((m) => m.content === 'skipafterloginflag') || {};

    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (!isEmpty(logo) && logo[0]) {
          logo[0].configItemId = null;
        }

        const filterLink = link.filter((n) => ['create', 'update'].includes(n._status));
        const filterContact = contact.filter((n) => ['create', 'update'].includes(n._status));
        const filterCarousel = carousel.filter((n) => ['create', 'update'].includes(n._status));
        /*
        const newLink = getEditTableData(filterLink).map(item => {
          const { ...newItem } = item;
          if (newItem._status === 'create') {
            delete newItem.configItemId;
          }
          return newItem;
        });
        */
        /*
        const newContact = getEditTableData(filterContact).map(item => {
          const { ...newItem } = item;
          if (newItem._status === 'create') {
            delete newItem.configItemId;
          }
          return newItem;
        });
        */
        let newLink = getEditTableData(filterLink);
        let newContact = getEditTableData(filterContact);
        let newCarousel = getEditTableData(filterCarousel);
        if (
          (filterLink.length === 0 || !isEmpty(newLink)) &&
          (filterContact.length === 0 || !isEmpty(newContact)) &&
          (filterCarousel.length === 0 || !isEmpty(newCarousel))
        ) {
          // 增加排序标识
          newLink = this.addOrderSeq(link, newLink, 'configItemId');
          newContact = this.addOrderSeq(contact, newContact, 'configItemId');
          newCarousel = this.addOrderSeq(carousel, newCarousel, 'configItemId');
          dispatch({
            type: 'templatesConfig/saveTemplateDetail',
            payload: {
              logo,
              carousel: newCarousel,
              link: newLink,
              contact: newContact,
              introduction: [
                {
                  ...introduction[0],
                  configId,
                  configCode: 'introduction',
                  description: fieldsValue.description ? fieldsValue.description : '',
                  enabledFlag: 1,
                },
              ],
              footer: [
                {
                  ...footer[0],
                  configId,
                  configCode: 'footer',
                  enabledFlag: fieldsValue.enabledFlag,
                },
              ],
              record: [
                {
                  ...record[0],
                  configId,
                  configCode: 'record',
                  enabledFlag: fieldsValue.recordEnabledFlag,
                  description: fieldsValue.recordDescription,
                },
              ],
              navbar: [
                {
                  ...mallLink,
                  configId,
                  content: 'mallLink',
                  configCode: 'navbar',
                  description: fieldsValue.mallLink,
                  orderSeq: 1,
                },
                {
                  ...financialLink,
                  configId,
                  content: 'financialLink',
                  configCode: 'navbar',
                  orderSeq: 1,
                  description: fieldsValue.financialLink,
                },
                {
                  ...registerLink,
                  configId,
                  content: 'registerLink',
                  configCode: 'navbar',
                  orderSeq: 2,
                  description: fieldsValue.registerLink,
                },
                {
                  ...preSalesAssistantLink,
                  configId,
                  content: 'preSalesAssistantLink',
                  configCode: 'navbar',
                  orderSeq: 3,
                  description: fieldsValue.preSalesAssistantLink,
                },
              ],
              loginconfig: [
                {
                  ...skipAfterLogin,
                  configId,
                  content: 'skipafterloginflag',
                  configCode: 'loginconfig',
                  description: fieldsValue.skipAfterLoginFlag,
                  orderSeq: 1,
                  enabledFlag: 1,
                },
              ],
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchTemplateDetailByAssignId(assignId);
            }
          });
        }
      }
    });
  }

  @Bind()
  setCompany(index, record = {}) {
    const { form } = this.props;
    form.setFieldsValue({ webUrl: undefined });
    this.setState({
      companyId: record.companyId,
      configVisible: false,
    });
  }

  @Bind()
  setUrls(index, record = {}) {
    // console.log(record.webUrl);
    this.setState({
      webUrl: record.webUrl,
      configVisible: false,
    });
  }

  @Bind()
  handleSearch() {
    const {
      dispatch,
      form,
      templatesConfig: { templateConfigData },
    } = this.props;
    const { groupId } = templateConfigData;
    const { organizationId } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'templatesConfig/fetchTemplatesConfigData',
          payload: { groupId, organizationId, ...fieldsValue },
        }).then((res) => {
          if (res) {
            this.setState({
              assignId: res.assignId,
              configVisible: true,
            });
            this.fetchTemplateDetailByAssignId(res.assignId);
            this.fetchTemplateList({ assignId: res.assignId });
          }
        });
      }
    });
  }

  render() {
    const {
      fetchLoading = false,
      savingLoading = false,
      fetchInfoLoading = false,
      // match: {
      //   params: { configId },
      // },
      templatesConfig: { templateDetail = {}, templateConfigData = {} },
      form: { getFieldDecorator },
    } = this.props;
    const { configId } = this.state;
    const {
      logo = [
        {
          configItemId: uuid(),
          configCode: 'logo',
          description: '',
          imageUrl: '',
          orderSeq: 0,
          isCreate: true,
        },
      ],
      carousel = [],
      introduction = [],
      link = [],
      contact = [],
      footer = [],
      record = [
        {
          recordDescription: '',
          recordEnabledFlag: 0,
        },
      ],
      navbar = [],
      loginconfig = [],
    } = templateDetail;
    const { groupName = undefined, tenantId, groupId } = templateConfigData;
    const tableProps = {
      onCreateRow: this.handleCreateRow,
      onEditRow: this.handleEditRow,
      onCancelRow: this.handleCancelRow,
      onDeleteRow: this.handleDeleteRow,
      onDeleteSelectRows: this.handleDeleteSeleteRows,
    };
    const { companyId, configVisible, webUrl } = this.state;
    const mallLink = navbar.find((m) => m.content === 'mallLink') || {};
    const financialLink = navbar.find((m) => m.content === 'financialLink') || {};
    const registerLink = navbar.find((m) => m.content === 'registerLink') || {};
    const preSalesAssistantLink = navbar.find((m) => m.content === 'preSalesAssistantLink') || {};
    const skipAfterLogin = loginconfig.find((m) => m.content === 'skipafterloginflag') || {};

    return (
      <React.Fragment>
        <Header title={intl.get(`spfm.protalAssign.view.template.templateEdit`).d('模版配置')}>
          <Button
            type="primary"
            icon="save"
            disabled={!webUrl || !configVisible}
            loading={savingLoading}
            onClick={this.handleSave}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={fetchLoading || savingLoading || fetchInfoLoading}>
            <Row style={{ marginBottom: '30px' }}>
              <Form layout="inline">
                <FormItem label={intl.get('entity.group.name').d('集团名称')}>
                  {getFieldDecorator('groupName', {
                    initialValue: groupName,
                  })(<Input disabled style={{ width: '200px' }} />)}
                </FormItem>
                <FormItem label={intl.get('entity.company.name').d('公司名称')}>
                  {getFieldDecorator('companyName')(
                    <Lov
                      style={{ width: '200px' }}
                      code="HPFM.COMPANY"
                      queryParams={{ tenantId }}
                      onChange={this.setCompany}
                    />
                  )}
                </FormItem>
                <FormItem
                  label={intl.get('spfm.portalAssign.model.portalAssign.webUrl').d('企业门户域名')}
                >
                  {getFieldDecorator('webUrl', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.requireSelect', {
                          name: intl
                            .get('spfm.portalAssign.model.portalAssign.webUrl')
                            .d('企业门户域名'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SPFM.GROUP_COMPANY.WEBURL"
                      style={{ width: '250px' }}
                      queryParams={{ tenantId, companyId, groupId }}
                      onChange={this.setUrls}
                    />
                  )}
                </FormItem>
                <FormItem>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.handleSearch}
                  >
                    {intl.get(`hzero.common.button.search`).d('查询')}
                  </Button>
                  {/* <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                    {intl.get(`hzero.common.button.reset`).d('重置')}
                  </Button> */}
                </FormItem>
              </Form>
            </Row>
            {configVisible && (
              <React.Fragment>
                <Row>
                  <Col span={12}>
                    <div>
                      <p className={style['template-title']}>
                        {intl.get('spfm.common.view.message.title.navbar').d('导航栏配置')}
                      </p>
                      <Row className={style['template-content']}>
                        <Col span={4}>
                          <FormItem>
                            {getFieldDecorator('mallLink', {
                              initialValue:
                                mallLink.description === undefined ? 1 : +mallLink.description,
                            })(
                              <Checkbox>
                                {intl.get('spfm.common.view.checkbox.mallLink').d('企业商城')}
                              </Checkbox>
                            )}
                          </FormItem>
                        </Col>
                        <Col span={4}>
                          <FormItem>
                            {getFieldDecorator('financialLink', {
                              initialValue:
                                financialLink.description === undefined
                                  ? 1
                                  : +financialLink.description,
                            })(
                              <Checkbox>
                                {intl.get('spfm.common.view.checkbox.financialLink').d('金融超市')}
                              </Checkbox>
                            )}
                          </FormItem>
                        </Col>
                        <Col span={4}>
                          <FormItem>
                            {getFieldDecorator('registerLink', {
                              initialValue:
                                registerLink.description === undefined
                                  ? 1
                                  : +registerLink.description,
                            })(
                              <Checkbox>
                                {intl.get('spfm.common.view.checkbox.register').d('注册')}
                              </Checkbox>
                            )}
                          </FormItem>
                        </Col>
                        <Col span={4}>
                          <FormItem>
                            {getFieldDecorator('preSalesAssistantLink', {
                              initialValue:
                              preSalesAssistantLink.description === undefined
                                  ? 1
                                  : +preSalesAssistantLink.description,
                            })(
                              <Checkbox>
                                {intl.get('spfm.common.view.checkbox.preSalesAssistant').d('售前助手')}
                              </Checkbox>
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <div>
                      <p className={style['template-title']}>
                        {intl
                          .get('spfm.common.view.message.title.logo1')
                          .d('上传Logo，图片格式为JPEG/PNG')}
                        <TemplateForm
                          initData={logo[0]}
                          type="logo"
                          configId={configId}
                          key={logo[0].configItemId}
                        />
                      </p>
                    </div>
                  </Col>
                </Row>
                <Row style={{ marginBottom: '15px' }}>
                  <Col span={24}>
                    <p className={style['template-title']}>
                      {intl
                        .get('hptl.common.view.message.title.banner1')
                        .d(
                          '门户图片，登录栏背景图片设置，图片格式为JPEG/PNG，图片大小1200*320或2400*640'
                        )}
                    </p>
                    <Row className={style['template-content']}>
                      <Col>
                        <Banner {...tableProps} bannerList={carousel} configId={configId} />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <FormItem>
                    {getFieldDecorator('skipAfterLoginFlag', {
                      initialValue: skipAfterLogin.description === undefined ? 0 : +skipAfterLogin.description,
                    })(
                      <Checkbox className={style['template-footer']}>
                        {intl
                          .get('spfm.common.view.message.title.skipMiddlePage')
                          .d('跳过 中间页')}
                      </Checkbox>
                    )}
                  </FormItem>
                </Row>
                <Row>
                  <Col span={12}>
                    <p className={style['template-title']}>
                      {intl.get('spfm.common.view.message.title.company.introduce').d('企业介绍')}
                    </p>
                    <Row className={style['template-content']}>
                      <Col>
                        <FormItem>
                          {getFieldDecorator('description', {
                            initialValue: introduction[0] && introduction[0].description,
                            rules: [
                              {
                                max: 500,
                                message: intl
                                  .get(`hzero.common.validation.max`, {
                                    max: 500,
                                  })
                                  .d(`长度不能超过${500}个字符`),
                              },
                            ],
                          })(<TextArea className={style['template-comdes']} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row style={{ marginBottom: '15px' }}>
                  <Col span={24}>
                    <p className={style['template-title']}>
                      {intl
                        .get('hptl.common.view.message.title.link')
                        .d('企业链接(仅限4个企业链接，链接地址示例格式: https://www.baidu.com/)')}
                    </p>
                    <Row className={style['template-content']}>
                      <Col>
                        <CompanyLink {...tableProps} companyLinkList={link} />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row style={{ marginBottom: '15px' }}>
                  <Col span={24}>
                    <p className={style['template-title']}>
                      {intl
                        .get('spfm.common.view.message.title.company.contact')
                        .d('联系企业(仅限4条记录，联系方式示例格式，客服: 400-900-9298)')}
                    </p>
                    <Row className={style['template-content']}>
                      <Col>
                        <ContactCompany {...tableProps} contactCompanyList={contact} />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <FormItem>
                    {getFieldDecorator('enabledFlag', {
                      initialValue: footer[0] && footer[0].enabledFlag,
                    })(
                      <Checkbox className={style['template-footer']}>
                        {intl
                          .get('spfm.common.view.message.title.company.foot')
                          .d('展示 甄云信息 底层信息栏')}
                      </Checkbox>
                    )}
                  </FormItem>
                </Row>
                <Row>
                  <FormItem>
                    {getFieldDecorator('recordEnabledFlag', {
                      initialValue: record[0] && record[0].enabledFlag,
                    })(
                      <Checkbox className={style['template-footer']}>
                        {intl
                          .get('spfm.common.view.message.title.company.record')
                          .d('展示 自定义配置备案信息 ')}
                      </Checkbox>
                    )}
                  </FormItem>
                  <Row className={style['template-content']}>
                    <Col span={12}>
                      <FormItem>
                        {getFieldDecorator('recordDescription', {
                          initialValue: record[0] && record[0].description,
                          rules: [
                            {
                              max: 500,
                              message: intl
                                .get(`hzero.common.validation.max`, {
                                  max: 500,
                                })
                                .d(`长度不能超过${500}个字符`),
                            },
                          ],
                        })(<TextArea className={style['template-comdes']} />)}
                      </FormItem>
                    </Col>
                  </Row>
                </Row>
              </React.Fragment>
            )}
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
