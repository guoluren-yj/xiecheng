/**
 * MessageTemplate - 消息模板明细维护
 * @date: 2018-7-26
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @description: 弃用准备删除 如果有问题，请联系 kan.li01@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Form, Input, Button, Row, Col, Select, Tabs, Spin, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, includes, isEmpty, uniqWith, isEqual, uniq, compact } from 'lodash';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import classNames from 'classnames';
import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import TinymceEditor from 'components/TinymceEditor';
import notification from 'utils/notification';
import { getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
/**
 * 消息模板明细组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} messageTemplate - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: 'spfm.messageTemplate' })
@connect(({ spfmMessageTemplate, loading }) => ({
  spfmMessageTemplate,
  loading: loading.effects['spfmMessageTemplate/updateDetail'],
  detailLoading: loading.effects['spfmMessageTemplate/fetchDetail'],
}))
export default class Detail extends PureComponent {
  /**
   * 初始化state
   * @param {object} props 组件props
   */
  constructor(props) {
    super(props);
    this.state = {
      flag: [],
      currentLanguage: getCurrentLanguage(), // 当前系统设置的语言编码
      currentType: '',
      selectedType: '',
      selectedLanguage: '',
    };
  }

  /**
   * componentDidMount
   * render()调用后获取页面数据信息
   */
  componentDidMount() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'spfmMessageTemplate/fetchTemplate',
      payload: { templateId: id },
    }).then(result => {
      if (result) {
        dispatch({
          type: 'spfmMessageTemplate/fetchDetail',
          payload: {
            templateId: id,
          },
        }).then(res => {
          if (res) {
            let messageType = [];
            if (res.length === 0) {
              const { sysMessageType, language, template } = this.props.spfmMessageTemplate;
              const currentLang = getCurrentLanguage();
              const languageName = (language.find(item => item.code === currentLang) || {}).name;
              for (let i = 0; i < sysMessageType.length; i++) {
                const temp = sysMessageType[i];
                res.push({
                  ...template,
                  languageName,
                  templateTypeCode: temp.value,
                  templateTypeMeaning: temp.meaning,
                  lang: currentLang,
                  isNew: true,
                });
              }
              messageType = res.map(item => ({
                value: item.templateTypeCode,
                meaning: item.templateTypeMeaning,
                isNew: true,
              }));
            } else {
              messageType = res.map(item => ({
                value: item.templateTypeCode,
                meaning: item.templateTypeMeaning,
                isNew: false,
              }));
            }
            dispatch({
              type: 'spfmMessageTemplate/updateDetailState',
              payload: {
                messageType: uniqWith(messageType, isEqual),
                detail: res,
              },
            });
            this.init(res[0].templateTypeCode, res[0].lang);
          }
        });
      }
    });
  }

  init(type, lang) {
    this.setState({
      currentType: type,
      currentLanguage: lang,
      // flag: list.map(item => `${item.templateTypeCode}.${item.lang}.templateContent`),
    });
  }

  /**
   *
   * @param {object} data
   */
  parse(data, typeToLang, detailList) {
    const source = [];
    const types = Object.keys(typeToLang); // 消息明细包含信息类型
    for (let i = 0; i < types.length; i++) {
      const messageType = types[i];
      const languages = typeToLang[messageType] || []; // 信息类型下包含语言类型
      const message = data[messageType] || {};
      const { receiverTypeCode, receiverTypeName, receiverTypeTenantId, ...langList } = message;
      for (let j = 0; j < languages.length; j++) {
        const lang = languages[j].code;
        const temp = detailList.find(
          item => item.templateTypeCode === messageType && item.lang === lang
        );
        const { isNew, ...others } = temp;
        source.push({
          ...others,
          ...langList[lang],
          receiverTypeCode,
          receiverTypeName,
          receiverTypeTenantId,
        });
      }
    }

    return source;
  }

  /**
   * 保存
   */
  @Bind()
  saveDetail() {
    const { form, dispatch, match, spfmMessageTemplate } = this.props;
    const { typeToLanguage, templateDetail } = spfmMessageTemplate;
    const { flag } = this.state;
    form.validateFields((err, values) => {
      const detailList = this.parse(values, typeToLanguage, templateDetail);
      const undefinedContent = compact(
        detailList.map(item =>
          isUndefined(item.templateContent)
            ? `${item.templateTypeCode}.${item.lang}.templateContent`
            : null
        )
      );
      const newFlag = [...flag, ...undefinedContent];

      if (!err && isEmpty(newFlag.length)) {
        // 校验通过，进行保存操作
        dispatch({
          type: 'spfmMessageTemplate/updateDetail',
          payload: {
            templateId: match.params.id,
            detail: detailList,
          },
        }).then(res => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/spfm/message-template/detail/${match.params.id}`,
              })
            );
          }
        });
      } else {
        this.setState({ flag: uniq(newFlag) });
        notification.warning({
          message: intl
            .get('spfm.messageTemplate.view.message.not.null')
            .d('必输字段不能为空，请确认'),
        });
      }
    });
  }

  @Bind()
  onRichTextEditorChange(data, field) {
    const { form } = this.props;
    form.setFieldsValue({ field: data });
    const { flag } = this.state;
    if (isEmpty(data)) {
      // push
      uniq(flag.push(field));
    } else {
      // pop
      flag.pop(field);
    }

    this.setState({ flag });
  }

  /**
   * 添加消息收件人
   */
  @Bind()
  handleAddReceiver() {}

  /**
   * 切换消息类型Tabs
   * @param {string} key - 消息类型编码
   */
  @Bind()
  handleChangeTypePane(key) {
    const { typeToLanguage } = this.props.spfmMessageTemplate;
    const targetLang = typeToLanguage[key][0] || {};
    this.setState({ currentType: key, currentLanguage: targetLang.code });
  }

  /**
   *切换语言Tabs
   * @param {string} key  - 语言编码
   */
  @Bind()
  handleChangeLanguage(key) {
    this.setState({ currentLanguage: key });
  }

  /**
   * 消息类型选择框中选中的类型编码
   * @param {string} key - 类型编码
   */
  @Bind()
  handleSelectedType(key) {
    this.setState({ selectedType: key });
  }

  @Bind()
  handleSelectedLanguage(key) {
    this.setState({ selectedLanguage: key });
  }

  /**
   * 新增/删除TabPane
   * @param {object} target - TabPane对象
   * @param {string} action - 操作类型：add/remove
   */
  @Bind()
  handleEditType(target, action) {
    const { currentType } = this.state;
    const { dispatch, spfmMessageTemplate } = this.props;
    const { templateDetail, messageType, typeToLanguage, sysMessageType } = spfmMessageTemplate;
    if (action === 'remove') {
      // 移除时，将该类型的数据从templateDetail中移除
      if (messageType.length === 1) {
        // 1. 若当前消息模板，仅维护一个消息类型(TabPane)时,跳转到列表页
        dispatch(
          routerRedux.push({
            pathname: `/spfm/message-template/list`,
          })
        );
      }
      const existType = messageType.filter(item => item.value !== target);
      if (target === currentType) {
        // 2. 当 target === currentyType时(移除当前的激活的类型TabPane), 切换TabPane,防止页面白屏
        const type = existType[0].value; // 移除后要切换的消息类型编码
        const lang = typeToLanguage[type][0] || {}; // 待激活消息类型中存在的语言类型(默认取第一个)
        this.setState({ currentType: type, currentLanguage: lang.code });
      }
      dispatch({
        type: 'spfmMessageTemplate/updateDetailState',
        payload: {
          detail: templateDetail.filter(item => item.templateTypeCode !== target),
          messageType: existType,
        },
      });
    } else if (action === 'add') {
      // 校验： 系统支持消息类型数量与已维护的消息类型数量相等时，不再允许添加
      if (messageType.lenght === sysMessageType.length) {
        notification.warning({
          message: intl
            .get('spfm.messageTemplate.view.message.maintain.type')
            .d('已维护系统支持的所有消息类型'),
        });
      } else {
        // 新增时，创建一个空对象，插入到templateDetail中
        this.handleAddMessageType();
      }
    }
  }

  @Bind()
  handleAddMessageType() {
    const { dispatch, spfmMessageTemplate, match } = this.props;
    const { sysMessageType, messageType, language, templateDetail, template } = spfmMessageTemplate;
    const existType = messageType.map(item => item.value);
    Modal.confirm({
      title: intl.get('spfm.messageTemplate.view.message.template.type').d('消息类型'),
      iconType: null,
      maskClosable: true,
      content: (
        <Form>
          <Form.Item
            label={intl.get('spfm.messageTemplate.view.message.template.type').d('消息类型')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
          >
            <Select onChange={this.handleSelectedType} style={{ width: 120 }}>
              {sysMessageType.map(item => (
                <Select.Option
                  key={item.value}
                  value={item.value}
                  disabled={includes(existType, item.value)}
                >
                  {item.meaning}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      ),
      // okText: intl.get('hzero.common.button.ok').d('确定'),
      // cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        const { selectedType } = this.state;
        // 校验： 是否选择了消息类型
        if (isEmpty(selectedType)) {
          notification.warning({
            message: intl
              .get('spfm.messageTemplate.view.message.not.selected.type')
              .d('未选择任何消息类型'),
          });
          return;
        }
        const lang = getCurrentLanguage();
        const selectedTypeMeaning = sysMessageType.find(item => item.value === selectedType)
          .meaning;
        const newItem = {
          ...template,
          lang,
          languageName: language.find(item => item.code === lang).name,
          templateTypeCode: selectedType,
          templateTypeMeaning: selectedTypeMeaning,
          templateId: match.params.id,
          isNew: true, // 是否为新增标记
        };
        dispatch({
          type: 'spfmMessageTemplate/updateDetailState',
          payload: {
            detail: [...templateDetail, { ...newItem }],
            messageType: [
              ...messageType,
              { value: selectedType, meaning: selectedTypeMeaning, isNew: true },
            ],
          },
        });
        this.setState({ currentType: selectedType, currentLanguage: lang, selectedType: '' });
      },
      onCancel: () => {
        this.setState({ selectedType: '' });
      },
    });
  }

  /**
   * 为当前类型的消息下，增加/移除一种语言描述
   * @param {*} targetKey
   * @param {string} action - 操作类型：add/remove
   */
  @Bind()
  handleAddLanguage(targetKey, action) {
    const { dispatch, spfmMessageTemplate, match, form } = this.props;
    const { templateDetail, language, messageType, typeToLanguage, template } = spfmMessageTemplate;
    const { currentType } = this.state;
    const enabledFlag = form.getFieldValue(`${currentType}.enabledFlag`);
    if (enabledFlag === 0) {
      notification.warning({
        message: intl
          .get('spfm.messageTemplate.view.message.maintail.disabled')
          .d('禁用的消息类型不可变更数据'),
      });
      return;
    }
    // 当前消息类型下，已维护的语言类别
    const existLang = typeToLanguage[currentType].map(item => item.code);
    if (action === 'add') {
      // 校验： 系统支持语言类型数量与已维护的语言类型数量相等时，不再允许添加
      if (language.length === existLang.length) {
        notification.warning({
          message: intl
            .get('spfm.messageTemplate.view.message.maintail.lang')
            .d('当前类型已维护系统支持的所有语言类型'),
        });
        return;
      }
      // 添加语言
      Modal.confirm({
        title: intl.get('spfm.messageTemplate.view.message.language.type').d('语言类型'),
        iconType: '',
        maskClosable: true,
        content: (
          <div>
            <Form>
              <Form.Item
                label={intl.get('spfm.messageTemplate.view.message.language.type').d('语言类型')}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
              >
                <Select onChange={this.handleSelectedLanguage} style={{ width: 120 }}>
                  {language.map(item => (
                    <Select.Option
                      key={item.code}
                      value={item.code}
                      disabled={includes(existLang, item.code)}
                    >
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </div>
        ),
        // okText: intl.get('hzero.common.button.ok').d('确定'),
        // cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          const { selectedLanguage } = this.state;
          // 校验： 是否选择了语言类型
          if (isEmpty(selectedLanguage)) {
            notification.warning({
              message: intl
                .get('spfm.messageTemplate.view.message.not.selected.lang')
                .d('未选择任何语言类型'),
            });
            return;
          }
          const newItem = {
            ...template,
            lang: selectedLanguage,
            languageName: language.find(item => item.code === selectedLanguage).name,
            templateTypeCode: currentType,
            templateTypeMeaning: messageType.find(item => item.value === currentType).meaning,
            templateId: match.params.id,
            isNew: true, // 是否为新增语言标记
          };
          dispatch({
            type: 'spfmMessageTemplate/updateDetailState',
            payload: {
              messageType,
              detail: [...templateDetail, newItem],
            },
          });
          // 更新当前消息类型的激活语言类型
          this.setState({ currentLanguage: selectedLanguage, selectedLanguage: '' });
        },
        onCancel: () => {
          this.setState({ selectedLanguage: '' });
        },
      });
    } else if (action === 'remove') {
      // 移除语言
      let newMessageType = [...messageType];
      if (typeToLanguage[currentType].length === 1 && messageType.length === 1) {
        // 1、 如果当前消息类型下，仅维护了一种语言类型的内容, 且当前消息明细仅维护一种消息类型 ,跳转到列表页
        dispatch(
          routerRedux.push({
            pathname: `/spfm/message-template/list`,
          })
        );
      }
      if (typeToLanguage[currentType].length === 1 && messageType.length !== 1) {
        // 移除语言，类型的的TabPane也要移除
        newMessageType = messageType.filter(item => item.value !== currentType);
        this.setState({ currentLanguage: newMessageType[0].value });
      }
      const index = templateDetail.findIndex(
        item => item.templateTypeCode === currentType && item.lang === targetKey
      );
      dispatch({
        type: 'spfmMessageTemplate/updateDetailState',
        payload: {
          messageType: [...newMessageType],
          detail: [...templateDetail.slice(0, index), ...templateDetail.slice(index + 1)],
        },
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      spfmMessageTemplate,
      detailLoading,
      loading,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;
    const {
      templateShowDetail = {},
      typeToLanguage = {},
      messageType = [],
      template = {},
    } = spfmMessageTemplate;
    const { flag, currentLanguage = 'zh_CN', currentType } = this.state;

    return (
      <Fragment>
        <Header
          title={intl.get('spfm.messageTemplate.view.message.title.detail').d('消息模板明细')}
          backPath="/spfm/message-template/list"
        >
          <Button onClick={this.saveDetail} type="primary" icon="save" loading={loading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button onClick={this.handleAddMessageType} type="primary" icon="plus">
            {intl.get('spfm.messageTemplate.view.option.add.line').d('添加消息行模板')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={detailLoading && isEmpty(messageType)}>
            <Tabs
              hideAdd
              activeKey={currentType}
              type="editable-card"
              onChange={this.handleChangeTypePane}
              onEdit={this.handleEditType}
              className={classNames(styles['type-pane'])}
            >
              {messageType.map(type => {
                const targetType = templateShowDetail[type.value] || {};
                return (
                  <Tabs.TabPane
                    tab={type.meaning}
                    key={type.value}
                    closable={type.isNew}
                    forceRender
                  >
                    <Form className={classNames(styles['template-form'])}>
                      <Row gutter={24}>
                        <Col span={18}>
                          <Form.Item
                            label={intl
                              .get('spfm.messageTemplate.model.template.receiver')
                              .d('收件人')}
                            {...formLayout}
                          >
                            {getFieldDecorator(`${type.value}.receiverTypeTenantId`, {
                              initialValue: targetType.receiverTypeTenantId,
                            })}
                            {getFieldDecorator(`${type.value}.receiverTypeName`, {
                              initialValue: targetType.receiverTypeName,
                            })}
                            {getFieldDecorator(`${type.value}.receiverTypeCode`, {
                              rules: [
                                {
                                  required: true,
                                  message: intl.get('hzero.common.validation.notNull', {
                                    name: intl
                                      .get('spfm.messageTemplate.model.template.receiver')
                                      .d('收件人'),
                                  }),
                                },
                              ],
                              initialValue: targetType.receiverTypeCode,
                            })(
                              <Lov
                                code="SPFM.RECEIVER_TYPE"
                                textValue={targetType.receiverTypeName}
                                queryParams={{ tenantId: template.tenantId }}
                                disabled={getFieldValue(`${currentType}.enabledFlag`) === 0}
                                onChange={(val, target) => {
                                  setFieldsValue({
                                    [`${type.value}.receiverTypeTenantId`]: target.receiverTypeTenantId,
                                    [`${type.value}.receiverTypeCode`]: target.typeCode,
                                    [`${type.value}.receiverTypeName`]: target.typeName,
                                  });
                                }}
                              />
                            )}
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={24}>
                        <Col span={18}>
                          <Form.Item
                            label={intl.get('hzero.common.status.enable').d('启用')}
                            {...formLayout}
                          >
                            {getFieldDecorator(`${type.value}.enabledFlag`, {
                              initialValue: targetType.enabledFlag,
                            })(<Switch />)}
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={24}>
                        <Col span={18}>
                          <Form.Item
                            label={intl.get('spfm.messageTemplate.model.template.lang').d('语言')}
                            {...formLayout}
                          >
                            <Tabs
                              type="editable-card"
                              activeKey={currentLanguage}
                              onChange={this.handleChangeLanguage}
                              onEdit={this.handleAddLanguage}
                            >
                              {(typeToLanguage[type.value] || []).map(lang => (
                                <Tabs.TabPane
                                  forceRender
                                  key={lang.code}
                                  tab={lang.name}
                                  closable={lang.isNew}
                                />
                              ))}
                            </Tabs>
                          </Form.Item>
                        </Col>
                      </Row>
                      {(typeToLanguage[type.value] || []).map(lang => {
                        const targetLang = (targetType.masterContent || {})[lang.code] || {};
                        return (
                          <Row
                            gutter={24}
                            style={{ display: lang.code === currentLanguage ? 'block' : 'none' }}
                          >
                            <Col span={18}>
                              <Form.Item
                                label={intl
                                  .get('spfm.messageTemplate.model.template.title')
                                  .d('主题')}
                                {...formLayout}
                              >
                                {getFieldDecorator(`${type.value}.${lang.code}.templateTitle`, {
                                  rules: [
                                    {
                                      required: true,
                                      message: intl.get('hzero.common.validation.notNull', {
                                        name: intl
                                          .get('spfm.messageTemplate.model.template.title')
                                          .d('主题'),
                                      }),
                                    },
                                  ],
                                  initialValue: targetLang.templateTitle,
                                })(
                                  <Input
                                    disabled={getFieldValue(`${currentType}.enabledFlag`) === 0}
                                  />
                                )}
                              </Form.Item>
                            </Col>
                            <Col span={18}>
                              <Form.Item
                                label={
                                  <span className={styles.templateContentLabel}>
                                    {intl
                                      .get('spfm.messageTemplate.model.template.content')
                                      .d('消息模板内容')}
                                  </span>
                                }
                                {...formLayout}
                                className={
                                  includes(flag, `${type.value}.${lang.code}.templateContent`)
                                    ? styles.templateContent
                                    : ''
                                }
                              >
                                {getFieldDecorator(`${type.value}.${lang.code}.templateContent`, {
                                  initialValue: targetLang.templateContent,
                                })(
                                  <TinymceEditor
                                    content={targetLang.templateContent || ''}
                                    disabled={getFieldValue(`${currentType}.enabledFlag`) === 0}
                                    onChange={data =>
                                      this.onRichTextEditorChange(
                                        data,
                                        `${type.value}.${lang.code}.templateContent`
                                      )
                                    }
                                  />
                                )}
                                <span
                                  hidden={
                                    !includes(flag, `${type.value}.${lang.code}.templateContent`)
                                  }
                                  className={styles.templateContentError}
                                >
                                  {intl
                                    .get('spfm.messageTemplate.view.message.not.null.content')
                                    .d('消息模板内容不能为空')}
                                </span>
                              </Form.Item>
                              <div
                                className={classNames({
                                  [styles['content-mask']]: true,
                                  [styles['mask-none']]:
                                    getFieldValue(`${currentType}.enabledFlag`) === 1,
                                })}
                              />
                            </Col>
                            <Col span={18}>
                              <Form.Item
                                label={intl
                                  .get('spfm.messageTemplate.model.template.sqlValue')
                                  .d('SQL')}
                                {...formLayout}
                              >
                                {getFieldDecorator(`${type.value}.${lang.code}.sqlValue`, {
                                  initialValue: targetLang.sqlValue,
                                })(
                                  <Input.TextArea
                                    autosize={{ minRows: 5, maxRows: 7 }}
                                    disabled={getFieldValue(`${currentType}.enabledFlag`) === 0}
                                  />
                                )}
                              </Form.Item>
                            </Col>
                          </Row>
                        );
                      })}
                    </Form>
                  </Tabs.TabPane>
                );
              })}
            </Tabs>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
