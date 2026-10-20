/**
 * MessageTemplate - 消息模板明细维护
 * @date: 2018-7-26
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Col, Form, Input, Row, Spin, Modal, Button, Tabs, Icon, Select } from 'hzero-ui';
import { DataSet, Modal as C7nModal, Tooltip } from 'choerodon-ui/pro';
import { Text } from 'choerodon-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty, isUndefined, omit, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import ReactMarkdown from 'react-markdown';

import { Content, Header } from 'components/Page';
// import TinymceEditor from 'components/TinymceEditor';
import Lov from 'components/Lov';
import { Button as ButtonPermission } from 'components/Permission';

import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { isTenantRoleLevel, getResponse } from 'utils/utils';
import { CODE_UPPER } from 'utils/regExp';
import {
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
  ROW_HALF_WRITE_ONLY_CLASSNAME,
  ROW_LAST_CLASSNAME,
  SEARCH_FORM_CLASSNAME,
} from 'utils/constants';
import { fetchSupportLanguageList } from 'hzero-front/lib/services/api';
import StaticTextEditor from './StaticTextEditor';

import Drawer from './Drawer';
import AddTab from './AddTab';
import styles from './index.less';

const { TabPane } = Tabs;

const formItemLayout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const formItemLayout3 = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 21,
  },
};

function getFieldsValueByWrappedComponentRef(ref) {
  if (ref.current) {
    const { form } = ref.current.props;
    return form.getFieldsValue();
  }
  return {};
}

/**
 * 消息模板明细组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} messageTemplate - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {!boolean} detailLoading - 明细数据加载
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ messageTemplate, loading }) => ({
  messageTemplate,
  loading:
    loading.effects['messageTemplate/updateTemplate'] ||
    loading.effects['messageTemplate/addTemplate'],
  detailLoading:
    !!loading.effects['messageTemplate/fetchCopyDetail'] ||
    !!loading.effects['messageTemplate/fetchDetail'],
  detailParaLoading:
    loading.effects['messageTemplate/fetchDetailPara'] ||
    loading.effects['messageTemplate/editPara'] ||
    loading.effects['messageTemplate/deletePara'],
  detailParaInitLoading: loading.effects['messageTemplate/initPara'],
  tenantRoleLevel: isTenantRoleLevel(),
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hmsg.messageTemplate', 'entity.tenant', 'entity.lang'] })
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    this.filterFormRef = React.createRef();
    this.staticTextEditor_zh_CN = React.createRef();
    this.staticTextEditor_en_US = React.createRef();
    const {
      // messageTemplate: {
      //   detail: { templateContent },
      // },
      match: {
        params: { type, id },
      },
    } = this.props;
    this.state = {
      flag: '',
      spinning: !isUndefined(id) && type !== 'copy',
      modalVisible: false,
      systemLanguageList: [], // 系统语言列表
      activeTab: '',
      langTab: [], // 当前展示的语言tab
      contentObj: {}, // 当前消息模板内容及类型
    };
  }

  /**
   * componentDidMount
   * render()调用后获取页面数据信息
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const {
      dispatch,
      match,
      history: {
        location: { payload = {} },
      },
    } = this.props;
    const { code, isCopy } = payload;
    const { id, tenantId } = match.params;
    if (!isUndefined(id) || isCopy) {
      dispatch({
        type: isCopy ? 'messageTemplate/fetchCopyDetail' : 'messageTemplate/fetchDetail',
        payload: {
          code: isCopy ? code : id,
          tenantId,
        },
      }).finally(() => {
        this.handleLanguage();
      });
    } else {
      // 新建时也查询
      this.handleLanguage();
    }
    dispatch({
      type: 'messageTemplate/fetchType',
    });
    dispatch({
      type: 'messageTemplate/fetchLanguage',
    });
    dispatch({
      type: 'messageTemplate/fetchDateFormat',
    });
  }

  // 查询当前系统语言
  @Bind()
  handleLanguage() {
    fetchSupportLanguageList().then(res => {
      if (getResponse(res)) {
        const list = [];
        res.forEach(item => {
          list.push({
            code: item.code,
            name: item.name,
            langRequiredFlag: item.langRequiredFlag,
          });
          if (item.code !== 'zh_CN' && item.code !== 'en_US') {
            this[`staticTextEditor_${item.code}`] = React.createRef();
          }
        });
        this.setState(
          {
            systemLanguageList: list,
            activeTab: list[0] ? list[0].code : '',
          },
          this.handleFormDs
        );
      }
    });
  }

  /**
   * 查询模板参数
   */
  @Bind()
  handleSearchArg(params = {}) {
    const { dispatch, messageTemplate } = this.props;
    const { activeTab } = this.state;
    const { page } = params;
    const { detail = {} } = messageTemplate;
    const { messageTemplates = [] } = detail;
    const currentTemplate = messageTemplates.find(item => item.lang === activeTab);
    const fieldValues = getFieldsValueByWrappedComponentRef(this.filterFormRef);
    dispatch({
      type: 'messageTemplate/fetchDetailPara',
      payload: {
        argName: fieldValues.argName,
        templateId: currentTemplate ? currentTemplate.templateId : '',
        page,
      },
    });
  }

  /**
   * 模板参数初始化
   */
  @Bind()
  handleInit() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'messageTemplate/initPara',
      payload: {
        templateId: id,
      },
    }).then(res => {
      if (res) {
        this.handleSearchArg();
      }
    });
  }

  /**
   * 模板参数编辑
   */
  @Bind()
  handleEdit(data, flag) {
    const { dispatch, messageTemplate: { paraList = [] } = {} } = this.props;
    const newList = paraList.map(item => {
      if (data.argId === item.argId) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return { ...item, _status: '' };
      }
    });
    dispatch({
      type: 'messageTemplate/updateState',
      payload: { paraList: newList },
    });
  }

  /**
   * 模板参数删除
   */
  @Bind()
  handleDelete(data) {
    const {
      dispatch,
      messageTemplate: { paraPagination = {} },
    } = this.props;
    const params = data;
    delete params._status;
    delete params.$form;
    dispatch({
      type: 'messageTemplate/deletePara',
      payload: data,
    }).then(res => {
      if (res) {
        this.handleSearchArg({ page: paraPagination });
      }
    });
  }

  /**
   * 模板参数保存
   */
  @Bind()
  handleSave(record) {
    const {
      dispatch,
      messageTemplate: { paraPagination = [] },
    } = this.props;
    const temp = record;
    delete temp._status;
    dispatch({
      type: 'messageTemplate/editPara',
      payload: temp,
    }).then(res => {
      if (res) {
        this.handleSearchArg({ page: paraPagination });
      }
    });
  }

  @Bind()
  saveTemplate({ detail, values }) {
    const {
      dispatch,
      match: { params: tempType },
      history: {
        location: { payload = {} },
      },
      messageTemplate,
    } = this.props;
    const { copyDetail = {} } = messageTemplate;
    const { isCopy } = payload;
    const { langTab, contentObj } = this.state;
    // 校验通过，进行保存操作
    let type = 'messageTemplate/updateTemplate'; // 默认操作：更新
    if (!detail.code || tempType.type) {
      // 新建
      type = 'messageTemplate/addTemplate';
    }
    const { tenantId, code } = values;
    // 定义保存要传的参数
    const params = {
      ...detail,
      tenantId: isCopy ? copyDetail.tenantId : tenantId || detail.tenantId,
      code,
    };

    // 全部出现在多语言tab下的字段
    const fields = [
      'templateName',
      'templateTitle',
      'externalCode',
      'enabledFlag',
      'templateContent',
      'sqlValue',
      'editorType',
      'dateFormat',
    ];
    const newTemplates = [];
    langTab.forEach(item => {
      const oldTemplate =
        detail && detail.messageTemplates
          ? detail.messageTemplates.find(i => i.lang === item.code) || {}
          : {};
      // 若是新增的语言tab,没有lang值，所以这边设置lang
      let newTemplate = { ...oldTemplate, lang: item.code, tenantId, templateCode: code };
      fields.forEach(i => {
        newTemplate = omit(newTemplate, [`${i}_${item.code}`]);
        if (i === 'enabledFlag') {
          // 当前tab下展示的语言，enabledFlag都为1
          newTemplate[i] = 1;
        } else if (i !== 'templateContent' && i !== 'editorType') {
          newTemplate[i] = values[`${i}_${item.code}`];
        } else if (i === 'editorType') {
          newTemplate[i] = contentObj[item.code].editorType;
        } else if (i === 'templateContent') {
          newTemplate[i] = contentObj[item.code].content;
        }
      });
      newTemplates.push(newTemplate);
    });
    if (detail && detail.messageTemplates) {
      // 原来存在的多语言但是未在tab展示，即禁用该语言时，enabledFlag改为0
      detail.messageTemplates.forEach(item => {
        if (!langTab.find(i => i.code === item.lang)) {
          newTemplates.push({ ...item, enabledFlag: 0 });
        }
      });
    }
    params.messageTemplates = newTemplates;
    dispatch({
      type,
      payload: {
        ...params,
      },
    }).then(res => {
      if (res) {
        notification.success();
        if (!detail.templateId) {
          dispatch(
            routerRedux.push({
              pathname: `/hmsg/message-template/detail/${res.code}/${res.tenantId}`,
            })
          );
        }
        dispatch({
          type: 'messageTemplate/updateState',
          payload: { detail: res },
        });
      }
    });
    this.setState({
      flag: '',
    });
  }

  /**
   * 保存
   */
  @Bind()
  handelSaveOption() {
    const { form, messageTemplate } = this.props;
    const { detail = {} } = messageTemplate;
    const { langTab } = this.state;
    // 获取最新消息模板内容，防止新添加Tab直接保存的情况下，拿不到新tab下的消息模板内容
    const contentObj = this.handleContext();
    form.validateFields((err, values) => {
      if (!err) {
        // 处理消息内容
        const contentIsNull = langTab.find(item => item.langRequiredFlag && isNil(contentObj[item.code].content));
        // 模板内容为空则不准保存，弹窗提醒
        if (contentIsNull) {
          this.setState({
            flag: contentIsNull.code,
          });
          return notification.warning({
            message: intl
              .get('hmsg.messageTemplate.view.message.alert.contentRequiredMd.or.rt')
              .d('请输入模板内容'),
          });
        }
        // 富文本类型模板内容校验提醒
        const confirmFlag = langTab.find(
          item =>
            contentObj[item.code].editorType !== 'MD' &&
            /(&lt;|&gt;)/.test(contentObj[item.code].content)
        );
        if (confirmFlag) {
          Modal.confirm({
            title: intl
              .get('hmsg.messageTemplate.view.message.confirmTemplateContent')
              .d('模板内容包含>或<，建议切换成markdown编辑，确定保存吗？'),
            onOk: () => {
              this.saveTemplate({ detail, values });
            },
          });
        } else {
          // 保存所有语言分类下的值
          this.saveTemplate({ detail, values });
        }
      } else {
        this.setState({
          flag: '',
        });
        notification.warning({
          message: intl
            .get('hmsg.messageTemplate.view.message.alert.required.field')
            .d('请输入每个语言分类下的必填字段'),
        });
      }
    });
  }

  @Bind()
  handleFormDs() {
    const {
      messageTemplate,
      history: {
        location: { payload = {} },
      },
      form,
    } = this.props;
    const { detail: originDetail = {}, copyDetail: originCopyDetail = {} } = messageTemplate;
    const { messageTemplates = [] } = originDetail;
    const { messageTemplates: copyMessageTemplates = [] } = originCopyDetail;
    const { isCopy } = payload;
    const { systemLanguageList } = this.state;
    // 当前展示的消息模板语言tab
    const langTab = [];
    // 不同tab下的消息内容及类型
    const contentObj = {};
    // formDs默认值
    const formDsInitialValue = {};
    const detailLang = isCopy ? copyMessageTemplates : messageTemplates;
    systemLanguageList.forEach(item => {
      const detail = detailLang.find(i => i.lang === item.code);
      // 平台层中英必填，租户级中文必填
      if (item.langRequiredFlag) {
        langTab.push(item);
        formDsInitialValue[item.code] = 1;
      } else if (detail) {
        if (detail.enabledFlag) {
          langTab.push(item);
        }
        formDsInitialValue[item.code] = detail.enabledFlag || 0;
      } else {
        formDsInitialValue[item.code] = 0;
      }
      // 消息模板内容和对应类型，当前未展示的tab，默认类型为富文本，内容为空
      contentObj[item.code] = {
        editorType: detail && detail.editorType === 'MD' ? 'MD' : 'RT',
        content: detail ? detail.templateContent : '',
      };
    });
    // 语言模板弹窗
    const fieldsArr = systemLanguageList.map(item => {
      return {
        name: item.code,
        type: 'boolean',
        label: item.name,
        trueValue: 1,
        falseValue: 0,
        defaultValue: langTab.find(i => i.code === item.code) ? 1 : 0,
      };
    });
    const detailFormDS = new DataSet({
      autoCreate: true,
      fields: fieldsArr,
      data: [formDsInitialValue],
    });
    this.setState(
      {
        formDs: detailFormDS,
        langTab,
        contentObj,
      },
      () => {
        // 设置所有语言tab下的form值
        const { setFieldsValue } = form;
        const fields = [
          'templateName',
          'templateTitle',
          'externalCode',
          'templateContent',
          'sqlValue',
          'editorType',
          'dateFormat',
        ];
        langTab.forEach(item => {
          const detail = detailLang.find(i => i.lang === item.code) || {};
          fields.forEach(i => {
            setFieldsValue({ [`${i}_${item.code}`]: detail[i] || '' });
          });
        });
      }
    );
  }

  // 处理多语言tab的显示
  @Bind()
  handleTabShow() {
    const { systemLanguageList, formDs } = this.state;
    const value = omit(formDs.current?.toData(), ['__dirty']);
    const newLangTab = [];
    systemLanguageList.forEach(item => {
      if (value[item.code] || item.langRequiredFlag) {
        newLangTab.push(item);
      }
    });
    this.setState({
      langTab: newLangTab,
    });
  }

  // 添加语言tab
  @Bind()
  handleLanguageDrawer() {
    const { systemLanguageList, formDs, langTab } = this.state;
    const currentValue = {};
    // 存储当前tab值
    systemLanguageList.forEach(item => {
      if (langTab.find(i => i.code === item.code)) {
        currentValue[item.code] = 1;
      } else {
        currentValue[item.code] = 0;
      }
    });
    C7nModal.open({
      title: intl.get('hmsg.messageTemplate.view.message.language').d('语言模板'),
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      children: <AddTab languageList={systemLanguageList} formDs={formDs} />,
      onOk: this.handleTabShow,
      onCancel: () => {
        formDs.loadData([currentValue]);
      },
    });
  }

  @Bind()
  handleOpen() {
    const { dispatch } = this.props;
    const { modalVisible } = this.state;
    if (modalVisible) {
      dispatch({
        type: 'messageTemplate/updateState',
        payload: {
          paraList: [],
          paraPagination: {},
        },
      });
    } else {
      this.handleSearchArg();
    }
    this.setState({ modalVisible: !modalVisible });
  }

  @Bind()
  handleContext(oldKey) {
    const { langTab, contentObj } = this.state;
    const newContentObj = { ...contentObj };
    if (oldKey) {
      // 切换tab时存储当前富文本内容
      if (newContentObj[oldKey].editorType !== 'MD') {
        const { editor } =
          (this[`staticTextEditor_${oldKey}`]?.staticTextEditor || {}).current || {};
        // 存储富文本值
        newContentObj[oldKey].content = !editor || !editor.getData() ? '' : editor.getData();
      }
    } else {
      langTab.forEach(item => {
        if (newContentObj[item.code].editorType !== 'MD') {
          const { editor } =
            (this[`staticTextEditor_${item.code}`]?.staticTextEditor || {}).current || {};
          // 存储富文本值
          newContentObj[item.code].content = !editor || !editor.getData() ? '' : editor.getData();
        }
      });
    }
    return newContentObj;
  }

  @Bind()
  changeTab(oldKey, key) {
    // 切换tab前先存储当前富文本值
    const contentValue = this.handleContext(oldKey);
    this.setState({
      contentObj: contentValue,
      activeTab: key,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      messageTemplate,
      loading,
      detailLoading,
      detailParaLoading,
      detailParaInitLoading,
      tenantRoleLevel,
      match: {
        params: { id },
        path,
      },
      history: {
        location: { payload = {} },
      },
    } = this.props;
    const {
      paraList = [],
      paraPagination = {},
      detail: originDetail = {},
      copyDetail: originCopyDetail = {},
      dateFormatList = [],
    } = messageTemplate;
    const { messageTemplates = [] } = originDetail;
    const { messageTemplates: copyMessageTemplates = [] } = originCopyDetail;
    const { isCopy } = payload;
    const {
      flag,
      spinning,
      modalVisible,
      contentObj,
      systemLanguageList,
      activeTab,
      langTab,
    } = this.state;
    messageTemplates.forEach(item => {
      // eslint-disable-next-line no-param-reassign
      item[`templateName_${item.lang}`] = item.templateName;
      // eslint-disable-next-line no-param-reassign
      item[`templateTitle_${item.lang}`] = item.templateTitle;
      // eslint-disable-next-line no-param-reassign
      // item[`templateContent_${item.lang}`] = item.templateContent;
      // eslint-disable-next-line no-param-reassign
      item[`externalCode_${item.lang}`] = item.externalCode;
      // eslint-disable-next-line no-param-reassign
      item[`sqlValue_${item.lang}`] = item.sqlValue;
      // eslint-disable-next-line no-param-reassign
      item[`dateFormat_${item.lang}`] = item.dateFormat;
    });
    copyMessageTemplates.forEach(item => {
      // eslint-disable-next-line no-param-reassign
      item[`templateName_${item.lang}`] = item.templateName;
      // eslint-disable-next-line no-param-reassign
      item[`templateTitle_${item.lang}`] = item.templateTitle;
      // eslint-disable-next-line no-param-reassign
      // item[`templateContent_${item.lang}`] = item.templateContent;
      // eslint-disable-next-line no-param-reassign
      item[`externalCode_${item.lang}`] = item.externalCode;
      // eslint-disable-next-line no-param-reassign
      item[`sqlValue_${item.lang}`] = item.sqlValue;
      // eslint-disable-next-line no-param-reassign
      item[`dateFormat_${item.lang}`] = item.dateFormat;
    });
    const detailTemplate = messageTemplates.find(item => item.lang === activeTab) || {};
    const copyDetailTemplate = copyMessageTemplates.find(item => item.lang === activeTab) || {};

    return (
      <div className={styles['message-template-detail']}>
        <Header
          title={intl.get('hmsg.messageTemplate.view.message.title.detail').d('消息模板明细')}
          backPath="/hmsg/message-template/list"
        >
          <ButtonPermission
            permissionList={[
              {
                code: `hmsg.message-template.detail.-id.button.save`,
                type: 'button',
                meaning: '消息模板-保存',
              },
            ]}
            onClick={this.handelSaveOption}
            type="primary"
            icon="save"
            loading={loading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </ButtonPermission>
          <Button onClick={this.handleLanguageDrawer} type="primary" icon="add" loading={loading}>
            {intl.get('hmsg.messageTemplate.view.message.language.add').d('添加语言模板')}
          </Button>
          <ButtonPermission
            permissionList={[
              {
                code: `hmsg.message-template.detail.-id.button.params`,
                type: 'button',
                meaning: '消息模板-查看模板参数',
              },
            ]}
            onClick={this.handleOpen}
            icon="eye"
            loading={loading}
            disabled={isEmpty(id)}
          >
            {intl.get('hmsg.messageTemplate.model.template.templateParam').d('模板参数')}
          </ButtonPermission>
        </Header>
        <Content>
          <Spin spinning={spinning ? detailLoading : null}>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              {!tenantRoleLevel && (
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...formItemLayout}
                    label={intl.get(`entity.tenant.tag`).d('租户')}
                    required={isUndefined(originDetail.tenantId)}
                  >
                    {getFieldDecorator('tenantId', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`entity.tenant.tag`).d('租户'),
                          }),
                        },
                      ],
                      initialValue: originDetail.tenantId,
                    })(
                      isUndefined(originDetail.tenantId) ? (
                        <Lov code="HPFM.TENANT" textValue={originDetail.tenantName} />
                      ) : (
                        <>{originDetail.tenantName}</>
                      )
                    )}
                  </Form.Item>
                </Col>
              )}
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('hmsg.messageTemplate.model.template.templateCode')
                    .d('消息模板代码')}
                  required={isUndefined(originDetail.code)}
                >
                  {getFieldDecorator('code', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hmsg.messageTemplate.model.template.templateCode')
                            .d('消息模板代码'),
                        }),
                      },
                      {
                        pattern: CODE_UPPER,
                        message: intl
                          .get('hzero.common.validation.codeUpper')
                          .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                      },
                    ],
                    initialValue: isCopy ? originCopyDetail.code : originDetail.code,
                  })(
                    isUndefined(originDetail.code) || isCopy ? (
                      <Input trim typeCase="upper" inputChinese={false} />
                    ) : (
                      <span style={{ overflowWrap: 'break-word' }}>{originDetail.code}</span>
                    )
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Tabs
              defaultActiveKey={systemLanguageList[0] ? systemLanguageList[0].code : ''}
              onChange={key => this.changeTab(activeTab, key)}
              forceRender
            >
              {langTab.map(item => (
                <TabPane tab={item.name} key={item.code} forceRender>
                  <Form className={classNames(styles['template-form'], SEARCH_FORM_CLASSNAME)}>
                    <Row {...EDIT_FORM_ROW_LAYOUT}>
                      <Col {...FORM_COL_3_LAYOUT}>
                        <Form.Item
                          {...formItemLayout}
                          label={intl
                            .get('hmsg.messageTemplate.model.template.templateName')
                            .d('消息模板名称')}
                        >
                          {getFieldDecorator(`templateName_${item.code}`, {
                            rules: [
                              {
                                required: true,
                                message: intl.get('hzero.common.validation.notNull', {
                                  name: intl
                                    .get('hmsg.messageTemplate.model.template.templateName')
                                    .d('消息模板名称'),
                                }),
                              },
                            ],
                            initialValue: isCopy
                              ? copyDetailTemplate[`templateName_${item.code}`]
                              : detailTemplate[`templateName_${item.code}`],
                          })(<Input />)}
                        </Form.Item>
                      </Col>
                      <Col {...FORM_COL_3_LAYOUT}>
                        <Form.Item
                          {...formItemLayout}
                          label={intl
                            .get('hmsg.messageTemplate.model.template.templateTitle')
                            .d('消息模板标题')}
                        >
                          {getFieldDecorator(`templateTitle_${item.code}`, {
                            rules: [
                              {
                                required: true,
                                message: intl.get('hzero.common.validation.notNull', {
                                  name: intl
                                    .get('hmsg.messageTemplate.model.template.templateTitle')
                                    .d('消息模板标题'),
                                }),
                              },
                            ],
                            initialValue: isCopy
                              ? copyDetailTemplate[`templateTitle_${item.code}`]
                              : detailTemplate[`templateTitle_${item.code}`],
                          })(<Input />)}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row {...EDIT_FORM_ROW_LAYOUT}>
                      <Col {...FORM_COL_3_LAYOUT}>
                        <Form.Item
                          {...formItemLayout}
                          label={intl
                            .get('hmsg.messageTemplate.model.template.externalCode')
                            .d('外部编码')}
                        >
                          {getFieldDecorator(`externalCode_${item.code}`, {
                            rules: [
                              {
                                required: getFieldValue('templateTypeCode') === 'SMS',
                                message: intl.get('hzero.common.validation.notNull', {
                                  name: intl
                                    .get('hmsg.messageTemplate.model.template.externalCode')
                                    .d('外部编码'),
                                }),
                              },
                            ],
                            initialValue: detailTemplate[`externalCode_${item.code}`],
                          })(<Input trim />)}
                        </Form.Item>
                      </Col>
                      <Col {...FORM_COL_3_LAYOUT}  className={styles['label-with-help']}>
                        <Form.Item
                          {...formItemLayout}
                          label={(
                            <>
                            <Text style={{ maxWidth: 'calc(100% - 40px)' }}>
                              {intl
                              .get('hmsg.messageTemplate.model.template.dateFormat')
                              .d('日期格式')}
                            </Text>
                            <Tooltip
                              title={(
                                <>
                                  <div>
                                    {intl
                                    .get('hmsg.messageTemplate.model.template.dateFormat.help1')
                                    .d('1、该配置仅影响日期格式，不影响时间格式，时间格式默认为hh:mm:ss')}
                                  </div>
                                  <div>
                                    {intl
                                    .get('hmsg.messageTemplate.model.template.dateFormat.help2')
                                    .d('2、该配置仅针对带有TZC时间变量函数的字段生效')}
                                  </div>
                                  <div>
                                    {intl
                                    .get('hmsg.messageTemplate.model.template.dateFormat.help3')
                                    .d('3、若TZC函数指定了日期时间格式，则当前配置不生效')}
                                  </div>
                                </>
                              )}
                            >
                              <Icon type='question-circle-o' style={{ marginLeft: '4px', verticalAlign: 'baseline' }} />
                            </Tooltip>
                            </>  
                          )}
                        >
                          {getFieldDecorator(`dateFormat_${item.code}`, {
                            initialValue: detailTemplate[`dateFormat_${item.code}`] || 'YYYY-MM-DD',
                          })(<Select allowClear={false}>
                            {!dateFormatList
                              ? undefined
                              : dateFormatList.map(i => <Select.Option key={i.value} value={i.value}>{i.meaning}</Select.Option>)
                            }
                          </Select>)}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row
                      {...EDIT_FORM_ROW_LAYOUT}
                      className={classNames(styles['row-item2'], ROW_HALF_WRITE_ONLY_CLASSNAME)}
                    >
                      <div style={{ float: 'right' }}>
                        {contentObj[item.code].editorType &&
                          (contentObj[item.code].editorType === 'RT' ? (
                            <ButtonPermission
                              permissionList={[
                                {
                                  code: `hmsg.message-template.detail.-id.button.markdown`,
                                  type: 'button',
                                  meaning: '消息模板-切换MarkDown',
                                },
                              ]}
                              onClick={() => {
                                const newContentObj = { ...contentObj };
                                newContentObj[item.code].editorType = 'MD';
                                const value = isCopy ? copyDetailTemplate : detailTemplate;
                                if (value.editorType === 'MD') {
                                  // 原来就是md格式，那切换至md时取接口数据
                                  newContentObj[item.code].content = value.templateContent;
                                } else {
                                  // 原来是富文本，切换md时值置空
                                  newContentObj[item.code].content = '';
                                }
                                this.setState({ contentObj: newContentObj });
                              }}
                              icon="switcher"
                              loading={loading}
                            >
                              {intl
                                .get('hmsg.messageTemplate.model.template.markdown')
                                .d('切换MarkDown')}
                            </ButtonPermission>
                          ) : (
                            <ButtonPermission
                              permissionList={[
                                {
                                  code: `hmsg.message-template.detail.-id.button.richTextEditor`,
                                  type: 'button',
                                  meaning: '消息模板-切换富文本编辑器',
                                },
                              ]}
                              onClick={() => {
                                const newContentObj = { ...contentObj };
                                newContentObj[item.code].editorType = 'RT';
                                const value = isCopy ? copyDetailTemplate : detailTemplate;
                                if (value.editorType === 'RT') {
                                  // 原来就是富文本格式，那切换至富文本时取接口数据
                                  newContentObj[item.code].content = value.templateContent;
                                } else {
                                  // 原来是md，切换富文本时值置空
                                  newContentObj[item.code].content = '';
                                }
                                this.setState({ contentObj: newContentObj });
                              }}
                              icon="switcher"
                              loading={loading}
                            >
                              {intl
                                .get('hmsg.messageTemplate.model.template.richTextEditor')
                                .d('切换富文本编辑器')}
                            </ButtonPermission>
                          ))}
                      </div>
                      <Col style={{ width: '82%' }}>
                        <Form.Item
                          {...formItemLayout3}
                          label={
                            <span className={styles.templateContentLabel}>
                              {intl
                                .get('hmsg.messageTemplate.model.template.templateContent')
                                .d('消息模板内容')}
                            </span>
                          }
                          className={flag === item.code ? styles.templateContent : ''}
                        >
                          {contentObj[item.code].editorType === 'MD' ? (
                            <MdEditor
                              config={{
                                view: {
                                  menu: false,
                                  md: true,
                                  html: true,
                                },
                              }}
                              value={contentObj[item.code].content}
                              onChange={html => {
                                const newContentObj = { ...contentObj };
                                newContentObj[item.code].content = html.text;
                                this.setState({ contentObj: newContentObj });
                              }}
                              style={{ height: '500px' }}
                              renderHTML={text => <ReactMarkdown source={text} />}
                            />
                          ) : (
                            (!detailLoading ||
                              (isCopy ? false : id === undefined) ||
                              // copyDetailTemplate[`templateContent_${item.code}`] ||
                              // detailTemplate[`templateContent_${item.code}`] ||
                              contentObj[item.code].content) && (
                              <StaticTextEditor
                                key={id === undefined ? `new-${item.code}` : `id-${item.code}`}
                                content={
                                  id === undefined
                                    ? isCopy
                                      ? contentObj[item.code].content
                                      : undefined
                                    : contentObj[item.code].content
                                }
                                readOnly={false}
                                onRef={staticTextEditor => {
                                  this[`staticTextEditor_${item.code}`] = staticTextEditor;
                                }}
                              />
                            )
                          )}
                          {flag === item.code ? (
                            <span className={styles.templateContentError}>
                              {intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get(`hmsg.messageTemplate.model.template.templateContent`)
                                  .d('消息模板内容'),
                              })}
                            </span>
                          ) : null}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row
                      {...EDIT_FORM_ROW_LAYOUT}
                      className={classNames(
                        styles['row-item2'],
                        ROW_HALF_WRITE_ONLY_CLASSNAME,
                        ROW_LAST_CLASSNAME
                      )}
                    >
                      <Col style={{ width: '82%' }}>
                        <Form.Item
                          {...formItemLayout3}
                          label={intl.get('hmsg.messageTemplate.model.template.sqlValue').d('SQL')}
                        >
                          {getFieldDecorator(`sqlValue_${item.code}`, {
                            initialValue: isCopy
                              ? copyDetailTemplate[`sqlValue_${item.code}`]
                              : detailTemplate[`sqlValue_${item.code}`],
                          })(<Input.TextArea autosize={{ minRows: 5, maxRows: 7 }} />)}
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </TabPane>
              ))}
            </Tabs>
            <Drawer
              visible={modalVisible}
              id={id}
              path={path}
              dataSource={paraList}
              pagination={paraPagination}
              loading={detailParaInitLoading}
              fetchLoading={detailParaLoading}
              wrappedComponentRef={this.filterFormRef}
              onInit={this.handleInit}
              onCancel={this.handleOpen}
              onEdit={this.handleEdit}
              onDelete={this.handleDelete}
              onSearch={this.handleSearchArg}
              onOk={this.handleSave}
            />
          </Spin>
        </Content>
      </div>
    );
  }
}
