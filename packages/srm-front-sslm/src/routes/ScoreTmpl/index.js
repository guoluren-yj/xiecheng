/**
 * ScoreTmpl - 评分模板定义
 * @date: 2018-08-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Modal,
  Table,
  Select,
  Menu,
  Icon,
  Dropdown,
  InputNumber,
  Row,
  Col,
} from 'hzero-ui';
import uuidv4 from 'uuid/v4';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import Checkbox from 'components/Checkbox';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { enableRender } from 'utils/renderer';
import cacheComponent from 'components/CacheComponent';
import ScoreCompany from './ScoreCompany';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 使用 Select 的组件 Option
 */
const { Option } = Select;

/**
 * 分配公司编辑框
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} companyVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} onSaveCompany - 数据保存
 * @reactPropss {Object} coreCompany - 已经分配的公司数据
 * @reactPropss {Object} loading - 加载状态
 * @reactPropss {Object} getCompanyRef - 获取ref方法
 * @reactProps {Function} showCreateModal - 控制modal显示隐藏方法
 * @return React.element
 */
const CompanyModal = props => {
  const {
    companyVisible,
    onHandleCompanyVisible,
    scoreCompany,
    onSaveCompany,
    loading,
    getCompanyRef,
    modalLoading,
  } = props;
  const companyData = props.companyData.filter(company => company.enabledFlag);
  this.cancel = () => {
    onHandleCompanyVisible(false);
  };
  return (
    <Modal
      title={intl.get('sslm.scoreTmpl.view.menu.scoreCompany').d('分配适用公司')}
      confirmLoading={modalLoading}
      visible={companyVisible}
      onCancel={() => this.cancel()}
      onOk={onSaveCompany}
      width={800}
    >
      <ScoreCompany
        loading={loading}
        scoreCompany={scoreCompany}
        companyData={companyData}
        saveCompany={onSaveCompany}
        getCompanyRef={getCompanyRef}
      />
    </Modal>
  );
};

/**
 * 评分模板定义
 * @extends {Component} - React.Component
 * @reactProps {Object} scoreTmpl - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.scoreTmpl', 'sslm.common'],
})
@Form.create({ fieldNameProp: null })
@connect(({ scoreTmpl, loading }) => ({
  scoreTmpl,
  saveLoading: loading.effects['scoreTmpl/saveScoreTmpl'],
  fetchLoading: loading.effects['scoreTmpl/fetchScoreTmpl'],
  fetchCompanyLoading: loading.effects['scoreTmpl/fetchCompany'],
  saveCompanyLoading: loading.effects['scoreTmpl/saveCompany'],
}))
@withRouter
@cacheComponent({ cacheKey: '/sslm/scoreTmpl' })
export default class ScoreTmpl extends PureComponent {
  /**
   * @param {object} props 属性
   */
  constructor(props) {
    super(props);
    this.state = {
      //   selectedRows: [],
      newCreateRows: [],
      editingRows: [],
      currentRow: {},
      companyVisible: false,
      organizationId: getCurrentOrganizationId(),
    };
  }

  /**
   * 公司的ref
   */
  companyRef;

  /**
   * 供应商ref
   */
  supplierRef;

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const {
      dispatch,
      scoreTmpl: { data = {} },
      location: { state: { _back } = {} },
    } = this.props;
    const { organizationId } = this.state;
    const code = {
      scoreTmplType: 'SSLM.SCORE_TMPL_TYPE',
      scoreTmplStatus: 'SSLM.SCORE_TMPL_STATUS',
      tenantId: organizationId,
    };
    const page = lodash.isUndefined(_back) ? {} : data.pagination;
    dispatch({
      type: 'scoreTmpl/fetchCode',
      payload: code,
    });
    this.fetchData({ page });
  }

  @Bind()
  publishScore(templateId) {
    const { dispatch } = this.props;
    const { organizationId } = this.state;

    dispatch({
      type: 'scoreTmpl/publishScoreTemplate',
      payload: {
        templateId,
        organizationId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchData();
      }
    });
  }

  /**
   * 生成表格表头和行内编辑控件
   * @returns
   */
  @Bind()
  createColumns() {
    const {
      history,
      form: { getFieldDecorator },
      scoreTmpl: {
        code: { scoreTmplType = [] },
      },
    } = this.props;
    return [
      {
        title: intl.get('sslm.scoreTmpl.model.scoreTmpl.templateCode').d('评分模板编码'),
        dataIndex: 'templateCode',
        width: 110,
        render: (text, record) => {
          return record.isCreate ? (
            <FormItem>
              {getFieldDecorator(`${record.templateId}#templateCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.scoreTmpl.model.scoreTmpl.templateCode')
                        .d('评分模板编码'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
              })(<Input typeCase="upper" trim inputChinese={false} maxLength={30} />)}
            </FormItem>
          ) : (
            <div>{text}</div>
          );
        },
      },
      {
        title: intl.get('sslm.scoreTmpl.model.scoreTmpl.templateName').d('评分模板描述'),
        dataIndex: 'templateName',
        render: (text, record) => {
          return record.isEditing ? (
            <FormItem>
              {getFieldDecorator(`${record.templateId}#templateName`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.scoreTmpl.model.scoreTmpl.templateName')
                        .d('评分模板描述'),
                    }),
                  },
                  {
                    max: 40,
                    message: intl.get('hzero.common.validation.max', {
                      max: 40,
                    }),
                  },
                ],
                initialValue: record.templateName,
              })(<Input maxLength={30} />)}
            </FormItem>
          ) : (
            <div>{text}</div>
          );
        },
      },
      {
        title: intl.get('sslm.scoreTmpl.model.scoreTmpl.objectVersionNumber').d('版本'),
        width: 80,
        dataIndex: 'versionNumber',
      },
      {
        title: intl.get('sslm.scoreTmpl.model.scoreTmpl.statusMeaning').d('生效状态'),
        width: 90,
        dataIndex: 'statusMeaning',
        // render: (val, record) => {
        //   return record.statusCode === 'PUBLISHED' ? (
        //     <span>{val}</span>
        //   ) : (
        //     <a onClick={() => this.publishScore(record.templateId)}>{val}</a>
        //   );
        // },
        // render: (val, record) => {
        //   return record.statusCode === 'PUBLISHED' ? (
        //     <span>{val}</span>
        //   ) : (
        //     <a onClick={() => this.publishScore(record.templateId)}>{val}</a>
        //   );
        // },
      },
      {
        title: intl.get('sslm.scoreTmpl.view.message.title.table').d('分配模板指标'),
        width: 110,
        render: (_, record) => {
          return (
            !record.isEditing && (
              <a
                onClick={() =>
                  history.push(`/sslm/score-tmpl/score-indic?templateId=${record.templateId}`)
                }
              >
                {intl.get('sslm.scoreTmpl.view.message.title.table').d('分配模板指标')}
              </a>
            )
          );
        },
      },
      {
        title: intl.get('sslm.scoreTmpl.model.scoreTmpl.templateTypeMeaning').d('模板类型'),
        width: 150,
        dataIndex: 'templateTypeMeaning',
        render: (text, record) => {
          return record.isCreate ? (
            <FormItem>
              {getFieldDecorator(`${record.templateId}#templateTypeCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.scoreTmpl.model.scoreTmpl.templateTypeMeaning')
                        .d('模板类型'),
                    }),
                  },
                ],
                initialValue: record.templateTypeCode,
              })(
                <Select style={{ width: '120px' }}>
                  {scoreTmplType &&
                    scoreTmplType.map(type => {
                      return (
                        type.tag !== 'STD' && (
                          <Option value={type.value} key={type.tag}>
                            {type.meaning}
                          </Option>
                        )
                      );
                    })}
                </Select>
              )}
            </FormItem>
          ) : (
            <div>{text}</div>
          );
        },
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: (text, record) => {
          return record.isEditing ? (
            <FormItem>
              {getFieldDecorator(`${record.templateId}#enabledFlag`, {
                initialValue: record.enabledFlag === undefined ? 1 : record.enabledFlag,
              })(<Checkbox />)}
            </FormItem>
          ) : (
            <div>{enableRender(text)}</div>
          );
        },
      },
      {
        title: intl.get('hzero.common.priority').d('优先级'),
        dataIndex: 'orderSeq',
        width: 120,
        render: (text, record) => {
          return record.isEditing ? (
            <FormItem>
              {getFieldDecorator(`${record.templateId}#orderSeq`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.priority').d('优先级'),
                    }),
                  },
                ],
                initialValue: record.orderSeq,
              })(<InputNumber min={0} />)}
            </FormItem>
          ) : (
            <div>{text}</div>
          );
        },
      },
      {
        title: intl.get('sslm.scoreTmpl.view.menu.more').d('更多操作'),
        width: 100,
        render: (_, record) => {
          const menu = (
            <Menu>
              <Menu.Item>
                {record.isEditing ? (
                  <a onClick={() => this.cancel(record)}>
                    {intl.get('hzero.common.button.clean').d('清除')}
                  </a>
                ) : (
                  <a onClick={() => this.edit(record, true)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                <a
                  onClick={() => {
                    Modal.confirm({
                      title: intl.get('hzero.common.message.confirm.release').d('是否确认发布？'),
                      onOk: () => {
                        this.publishScore(record.templateId);
                      },
                    });
                  }}
                >
                  {record.statusCode === 'PUBLISHED'
                    ? intl.get('sslm.scoreTmpl.view.menu.rePublish').d('重新发布')
                    : intl.get('sslm.scoreTmpl.view.menu.publish').d('发布')}
                </a>
              </Menu.Item>
              <Menu.Item>
                <a
                  onClick={() => {
                    history.push(`/sslm/score-tmpl/score-category?templateId=${record.templateId}`);
                  }}
                >
                  {intl.get('sslm.scoreTmpl.view.menu.scoreCategory').d('分配采购品类')}
                </a>
              </Menu.Item>
              <Menu.Item>
                <a
                  onClick={() => {
                    history.push(`/sslm/score-tmpl/score-level?templateId=${record.templateId}`);
                  }}
                >
                  {intl.get('sslm.scoreTmpl.view.menu.scoreLevel').d('定义评分等级')}
                </a>
              </Menu.Item>
              <Menu.Item>
                <a
                  onClick={() => {
                    this.handleCompanyVisible(true, record);
                  }}
                >
                  {intl.get('sslm.scoreTmpl.view.menu.scoreCompany').d('分配适用公司')}
                </a>
              </Menu.Item>
              {record.templateTypeCode === 'GYSKP' && (
                <Menu.Item>
                  <a
                    onClick={() => {
                      history.push(
                        `/sslm/score-tmpl/score-supplier?templateId=${record.templateId}`
                      );
                    }}
                  >
                    {intl.get('sslm.scoreTmpl.view.menu.scoreSupplier').d('分配供应商')}
                  </a>
                </Menu.Item>
              )}
            </Menu>
          );
          return record.isEditing ? (
            <a onClick={() => this.cancel(record)}>
              {record.isCreate
                ? intl.get('hzero.common.button.clean').d('清除')
                : intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          ) : (
            <Dropdown overlay={menu} placement="bottomRight" trigger="click">
              <a className="ant-dropdown-link">
                {intl.get('sslm.scoreTmpl.view.menu.more').d('更多操作')} <Icon type="down" />
              </a>
            </Dropdown>
          );
        },
      },
    ];
  }

  /**
   *增加一行
   */
  @Bind()
  handlerAddScoreTmpl() {
    const { dispatch } = this.props;
    const templateId = `templateId${uuidv4()}`;
    const data = {
      templateId,
      isCreate: true,
      isEditing: true,
    };
    this.setState({
      newCreateRows: [...this.state.newCreateRows, data],
    });
    dispatch({
      type: 'scoreTmpl/addPagination',
      payload: data,
    });
  }

  /**
   * 行取消事件
   * @param {object} record 行数据
   */
  @Bind()
  cancel(record) {
    const { dispatch } = this.props;
    const { newCreateRows } = this.state;
    if (record.isCreate) {
      const listData = newCreateRows.filter(item => item.templateId !== record.templateId);
      this.setState({
        newCreateRows: listData,
      });
      dispatch({
        type: 'scoreTmpl/removePagination',
        payload: {},
      });
    } else {
      this.edit(record, false);
    }
  }

  /**
   * 编辑事件
   * @param {object} record 行数据
   * @param {boolean} flag 是否编辑状态标记
   */
  @Bind()
  edit(record, flag) {
    const {
      dispatch,
      scoreTmpl: { data = {} },
    } = this.props;
    const index = data.list.findIndex(item => item.templateId === record.templateId);
    this.setState({
      editingRows: [...this.state.editingRows, record],
    });
    dispatch({
      type: 'scoreTmpl/editRow',
      payload: [
        ...data.list.slice(0, index),
        {
          ...record,
          isEditing: flag,
        },
        ...data.list.slice(index + 1),
      ],
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refresh() {
    this.fetchData();
    this.setState({
      //   selectedRows: [],
      newCreateRows: [],
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  handlerSaveScoreTmpl() {
    const {
      form,
      dispatch,
      scoreTmpl: { data = {} },
    } = this.props;
    const { newCreateRows } = this.state;
    const allEditRows = [...data.list, ...newCreateRows];
    form.validateFields((err, values) => {
      if (!err) {
        const arr = [];
        const isNewRowKeys = allEditRows.filter(v => v.isEditing);
        const fieldsArr = ['templateName', 'templateTypeCode', 'orderSeq', 'enabledFlag'];
        isNewRowKeys.forEach(item => {
          let itemObj = {};
          fieldsArr.forEach(_item => {
            itemObj[`${_item}`] = values[`${item.templateId}#${_item}`];
          });
          if (!item.isCreate) {
            if (item.statusCode === 'PUBLISHED') {
              itemObj = { ...item };
              itemObj.enabledFlag = lodash.trim(values[`${item.templateId}#enabledFlag`]);
            } else {
              itemObj.templateId = item.templateId;
              itemObj.objectVersionNumber = item.objectVersionNumber;
            }
          } else {
            itemObj.templateCode = lodash.trim(values[`${item.templateId}#templateCode`]);
          }
          arr.push(itemObj);
        });
        dispatch({
          type: 'scoreTmpl/saveScoreTmpl',
          payload: arr,
        }).then(response => {
          if (response) {
            this.refresh();
            notification.success();
          }
        });
      }
    });
  }

  /**
   * 控制分配公司弹出框显示/影藏
   * @param {boolean} flag 显示隐藏标记
   * @param {object} record 行数据
   */
  @Bind()
  handleCompanyVisible(flag, record) {
    const { dispatch } = this.props;
    this.setState({
      companyVisible: flag,
    });
    if (flag) {
      dispatch({
        type: 'scoreTmpl/fetchCompany',
        payload: {},
      });
      dispatch({
        type: 'scoreTmpl/fetchScoreCompany',
        payload: {
          templateId: record.templateId,
        },
      });
      this.setState({
        currentRow: record,
      });
    } else {
      this.setState({
        currentRow: {},
      });
      this.clearCompanyStatus();
    }
  }

  /**
   * 分配公司保存
   */
  @Bind()
  saveCompany() {
    const { dispatch } = this.props;
    const { currentRow } = this.state;
    const { createList, deleteList } = this.companyRef.state;
    dispatch({
      type: 'scoreTmpl/saveCompany',
      payload: {
        templateId: currentRow.templateId,
        scoreCompany: {
          createList,
          deleteList,
        },
      },
    }).then(response => {
      if (response) {
        dispatch({
          type: 'scoreTmpl/fetchCompany',
          payload: {},
        });
        dispatch({
          type: 'scoreTmpl/fetchScoreCompany',
          payload: {
            templateId: currentRow.templateId,
          },
        });
        notification.success();
        this.clearCompanyStatus();
      }
    });
  }

  /**
   * 查询数据
   * @param {object} pageData
   */
  @Bind()
  fetchData(pageData) {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'scoreTmpl/fetchScoreTmpl',
          payload: {
            latestFlag: 'P',
            authorityTypeCode: 'ScoreTmpl',
            ...fieldsValue,
            ...pageData,
          },
        });
      }
    });
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  fetchScoreTmpl() {
    this.fetchData();
  }

  /**
   * 获取ScoreCompany的ref
   * @param {object} companyRef
   * @memberof ScoreTmpl
   */
  @Bind()
  getCompanyRef(companyRef) {
    this.companyRef = companyRef;
  }

  /**
   * 弹出框关闭后清除相关数据
   */
  @Bind()
  clearCompanyStatus() {
    this.companyRef.props.form.resetFields();
    this.companyRef.setState({
      createList: [],
      deleteList: [],
    });
  }

  /**
   * 重置form表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.setFieldsValue({ templateCode: '' });
    form.setFieldsValue({ templateName: '' });
  }

  /**
   * 分页change事件
   * @param {object} pagination 分页信息
   */
  @Bind()
  handleTableChange(pagination = {}) {
    this.fetchData({
      page: pagination,
    });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 16,
      },
      style: {
        width: '100%',
      },
    };
    return (
      <Form layout="inline">
        <Row gutter={12}>
          <Col span={8}>
            <FormItem
              label={intl.get('sslm.scoreTmpl.model.scoreTmpl.templateCode').d('评分模板编码')}
              {...formItemLayout}
            >
              {getFieldDecorator('templateCode')(
                <Input trim typeCase="upper" inputChinese={false} />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('sslm.scoreTmpl.model.scoreTmpl.templateName').d('评分模板描述')}
              {...formItemLayout}
            >
              {getFieldDecorator('templateName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              <Button style={{ marginLeft: 18 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                type="primary"
                onClick={() => this.fetchScoreTmpl()}
                htmlType="submit"
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
   * 渲染事件
   * @returns
   */
  render() {
    const {
      scoreTmpl: { data = {}, companyData = [], scoreCompany = [] },
      saveLoading,
      fetchLoading,
      fetchCompanyLoading,
      saveCompanyLoading,
    } = this.props;
    const { newCreateRows, companyVisible } = this.state;
    const dataSource = [...data.list, ...newCreateRows];
    const columns = this.createColumns();
    // const rowSelection = {
    //   selectedRowKeys: selectedRows.map(n => n.templateId),
    //   onChange: this.handleSelectRows,
    //   getCheckboxProps: record => ({
    //     disabled: record.statusCode === 'PUBLISHED',
    //   }),
    // };
    const pagination = {
      ...data.pagination,
      onShowSizeChange: (_, size) => {
        this.PageSize = size;
      },
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.scoreTmpl.view.message.title.scoreTmpl.head').d('评分模板定义')}
        >
          <Button icon="plus" type="primary" onClick={this.handlerAddScoreTmpl}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" loading={saveLoading} onClick={this.handlerSaveScoreTmpl}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {/* {selectedRows.length > 0 && (
            <Button icon="delete" onClick={this.handlerDeleteScoreTmpl}>
              {intl.get('hzero.common.button.remove').d('删除')}
            </Button>
          )} */}
        </Header>
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          <Table
            loading={fetchLoading}
            rowKey="templateId"
            dataSource={dataSource}
            columns={columns}
            pagination={pagination}
            onChange={this.handleTableChange}
            bordered
          />
          <CompanyModal
            loading={fetchCompanyLoading}
            modalLoading={saveCompanyLoading}
            companyVisible={companyVisible}
            companyData={companyData}
            scoreCompany={scoreCompany}
            onHandleCompanyVisible={this.handleCompanyVisible}
            onSaveCompany={this.saveCompany}
            getCompanyRef={this.getCompanyRef}
          />
        </Content>
      </React.Fragment>
    );
  }
}
