import React from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Input, Button, Spin } from 'hzero-ui';
import uuid from 'uuid/v4';
import qs from 'querystring';
import { isEmpty } from 'lodash';
import { Bind, debounce } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';

import { Content, Header } from 'components/Page';
import Checkbox from 'components/Checkbox';

import intl from 'utils/intl';
import { getEditTableData } from 'utils/utils';
import notification from 'utils/notification';

import TemplateForm from './TemplateForm';
import CompanyLink from './CompanyLink';
import ContactCompany from './ContactCompany';
import style from './index.less';
import Banner from './Banner';

const { TextArea } = Input;
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@connect(({ templatesConfig, portalAssign, loading }) => ({
  templatesConfig,
  portalAssign,
  fetchLoading: loading.effects['templatesConfig/fetchTemplateDetail'],
  fetchInfoLoading: loading.effects['templatesConfig/fetchTemplateInfo'],
  savingLoading: loading.effects['templatesConfig/saveTemplateDetailNoTenantId'],
}))
@formatterCollections({
  code: [
    'hptl.common',
    'hptl.portalAssign',
    'entity.group',
    'entity.company',
    'spfm.portalAssign',
    'spfm.common',
    'hptl.common',
    'spfm.protalAssign',
  ],
})
export default class Template extends React.PureComponent {
  constructor(props) {
    super(props);
    const { webUrl } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      webUrl,
    };
  }

  componentDidMount() {
    this.fetchTemplateInfo();
    this.fetchTemplateDeatil();
  }

  @Bind()
  fetchTemplateInfo() {
    const { dispatch } = this.props;
    const { webUrl } = this.state;
    dispatch({
      type: 'templatesConfig/fetchTemplateInfo',
      payload: { webUrl },
    });
  }

  /**
   * 查询门户模版配置详细
   */
  @Bind()
  fetchTemplateDeatil() {
    const {
      dispatch,
      match: {
        params: { configId },
      },
    } = this.props;
    dispatch({
      type: 'templatesConfig/fetchTemplateDetail',
      payload: { configId },
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
      match: {
        params: { configId },
      },
    } = this.props;
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
    dispatch({
      type: 'portalAssign/deleteSeleteRows',
      payload: seleteRows,
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchTemplateDeatil();
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
        // eslint-disable-next-line no-param-reassign
        item = newDataItem;
      }
      // 去除新建数据的临时主键
      if (item._status === 'create') {
        // eslint-disable-next-line no-param-reassign
        delete item[key];
      }
      // 如果有排序标识，则从0开始更新
      // 如果没有排序标识，则从已有数据的长度开始递增
      if (item.orderSeq) {
        oldIndex++;
        // eslint-disable-next-line no-param-reassign
        item.orderSeq = oldIndex;
      } else {
        newIndex++;
        // eslint-disable-next-line no-param-reassign
        item.orderSeq = newIndex;
      }
      // eslint-disable-next-line no-param-reassign
      originData[index] = item;
    });
    return originData;
  }

  /**
   * 不带租户id保存
   */
  @Bind()
  @debounce(500)
  handleSaveNoTenantId() {
    const {
      dispatch,
      form,
      templatesConfig: { templateDetail = {} },
      match: {
        params: { configId },
      },
    } = this.props;
    const {
      logo = [],
      carousel = [],
      introduction = [],
      link = [],
      contact = [],
      footer = [{}],
      record = [],
      navbar = [],
      loginconfig = [],
    } = templateDetail;
    const mallLink = navbar.find((m) => m.content === 'mallLink') || {};
    const financialLink = navbar.find((m) => m.content === 'financialLink') || {};
    const registerLink = navbar.find((m) => m.content === 'registerLink') || {};
    const skipAfterLogin = loginconfig.find((m) => m.content === 'skipafterloginflag') || {};

    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (!isEmpty(logo) && typeof logo[0].configItemId === 'string') {
          delete logo[0].configItemId;
        }
        // carousel.forEach((_, index) => {
        //   if (!isEmpty(carousel) && typeof carousel[index].configItemId === 'string') {
        //     delete carousel[index].configItemId;
        //   }
        // });

        // console.log(carousel);
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
            type: 'templatesConfig/saveTemplateDetailNoTenantId',
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
              this.fetchTemplateDeatil();
            }
          });
        }
      }
    });
  }

  render() {
    const {
      fetchLoading = false,
      savingLoading = false,
      fetchInfoLoading = false,
      match: {
        params: { configId },
      },
      templatesConfig: { templateDetail = {}, groupName, companyName, webUrl },
      form: { getFieldDecorator },
    } = this.props;
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
    const tableProps = {
      onCreateRow: this.handleCreateRow,
      onEditRow: this.handleEditRow,
      onCancelRow: this.handleCancelRow,
      onDeleteRow: this.handleDeleteRow,
      onDeleteSelectRows: this.handleDeleteSeleteRows,
    };
    const mallLink = navbar.find((m) => m.content === 'mallLink') || {};
    const financialLink = navbar.find((m) => m.content === 'financialLink') || {};
    const registerLink = navbar.find((m) => m.content === 'registerLink') || {};
    const skipAfterLogin = loginconfig.find((m) => m.content === 'skipafterloginflag') || {};

    return (
      <React.Fragment>
        <Header
          title={`${intl.get(`spfm.protalAssign.view.template.edit`).d('门户配置')}`}
          backPath="/spfm/portal-assign/list"
        >
          <Button
            type="primary"
            icon="save"
            loading={savingLoading}
            onClick={this.handleSaveNoTenantId}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={fetchLoading || savingLoading || fetchInfoLoading}>
            <Row gutter={24}>
              <Col className={style['template-info-title']} span={3}>
                {intl.get('entity.group.name').d('集团名称')}：
              </Col>
              <Col className={style['template-info-desc']} span={4}>
                {groupName}
              </Col>
              <Col className={style['template-info-title']} span={3}>
                {intl.get('entity.company.name').d('公司名称')}：
              </Col>
              <Col className={style['template-info-desc']} span={4}>
                {companyName}
              </Col>
              <Col className={style['template-info-title']} span={3}>
                {intl.get('hptl.portalAssign.model.portalAssign.webUrl').d('企业门户域名')}:
              </Col>
              <Col className={style['template-info-desc']} span={7}>
                {webUrl}
              </Col>
            </Row>
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
                            registerLink.description === undefined ? 1 : +registerLink.description,
                        })(
                          <Checkbox>
                            {intl.get('spfm.common.view.checkbox.register').d('注册')}
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
                      '门户图片，登录栏背景图片设置，图片格式为JPEG/PNG，图片大小1200*320或2400*640,2M以内'
                    )}
                </p>
                <Row className={style['template-content']}>
                  <Col>
                    <Banner {...tableProps} bannerList={carousel} configId={configId} />
                  </Col>
                </Row>
              </Col>
            </Row>
            {/* 登录配置 */}
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
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
