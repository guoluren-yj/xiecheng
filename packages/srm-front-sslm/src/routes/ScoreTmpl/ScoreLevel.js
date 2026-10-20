/**
 * ScoreLevel - 评分等级
 * @date: 2018-08-09
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Table, Icon, InputNumber } from 'hzero-ui';
import qs from 'querystring';
import uuidv4 from 'uuid/v4';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import Checkbox from 'components/Checkbox';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 *评分模板定义 - 评分等级
 * @extends {Component} - React.Component
 * @reactProps {Object} ScoreLevel - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.scoreLevel'],
})
@Form.create({ fieldNameProp: null })
@connect(({ scoreLevel, loading }) => ({
  scoreLevel,
  addLoading: loading.effects['scoreLevel/addScoreLevel'],
  fetchLoading: loading.effects['scoreLevel/fetchScoreLevel'],
}))
export default class ScoreLevel extends PureComponent {
  /**
   * @param {object} props 属性
   */
  constructor(props) {
    super(props);
    this.state = {
      newCreateRows: [],
      templateId: qs.parse(props.location.search.substr(1)),
    };
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    // dispatch({
    //   type: 'scoreLevel/fetchTmplInfo',
    //   payload: this.state.templateId,
    // });
    dispatch({
      type: 'scoreLevel/fetchTmplInfo',
    });
    dispatch({
      type: 'scoreLevel/fetchScoreLevel',
      payload: this.state.templateId,
    });
  }

  /**
   * 生成表格表头和行内编辑控件
   * @returns
   */
  @Bind()
  createColumns() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return [
      {
        title: intl.get('sslm.scoreLevel.model.scoreLevel.levelCode').d('等级编码'),
        dataIndex: 'levelCode',
        width: 100,
        render: (text, record) => {
          return record.isCreate ? (
            <FormItem>
              {getFieldDecorator(`${record.evalLevelId}#levelCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.scoreLevel.model.scoreLevel.levelCode').d('等级编码'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
                initialValue: record.levelCode,
              })(<Input typeCase="upper" trim inputChinese={false} />)}
            </FormItem>
          ) : (
            <div>{text}</div>
          );
        },
      },
      {
        title: intl.get('sslm.scoreLevel.model.scoreLevel.levelDesc').d('等级描述'),
        dataIndex: 'levelDesc',
        render: (text, record) => {
          return record.isEditing ? (
            <FormItem>
              {getFieldDecorator(`${record.evalLevelId}#levelDesc`, {
                initialValue: record.levelDesc,
                rules: [
                  {
                    max: 40,
                    message: intl.get('hzero.common.validation.max', {
                      max: 40,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          ) : (
            <div>{text}</div>
          );
        },
      },
      {
        title: intl.get('sslm.scoreLevel.view.menu.score').d('分值'),
        width: 200,
        children: [
          {
            title: intl.get('sslm.scoreLevel.model.scoreLevel.scoreFrom').d('分值从'),
            dataIndex: 'scoreFrom',
            width: 100,
            align: 'right',
            render: (text, record) => {
              return record.isEditing ? (
                <FormItem>
                  {getFieldDecorator(`${record.evalLevelId}#scoreFrom`, {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('sslm.scoreLevel.model.scoreLevel.scoreFrom').d('分值从'),
                        }),
                      },
                    ],
                    initialValue: record.scoreFrom,
                  })(<InputNumber min={0} />)}
                </FormItem>
              ) : (
                <div>{text}</div>
              );
            },
          },
          {
            title: intl.get('sslm.scoreLevel.model.scoreLevel.scoreTo').d('分值至'),
            dataIndex: 'scoreTo',
            width: 100,
            align: 'right',
            render: (text, record) => {
              return record.isEditing ? (
                <FormItem>
                  {getFieldDecorator(`${record.evalLevelId}#scoreTo`, {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('sslm.scoreLevel.model.scoreLevel.scoreTo').d('分值至'),
                        }),
                      },
                    ],
                    initialValue: record.scoreTo,
                  })(<InputNumber min={0} />)}
                </FormItem>
              ) : (
                <div>{text}</div>
              );
            },
          },
        ],
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        render: (text, record) => {
          return record.isEditing ? (
            <FormItem>
              {getFieldDecorator(`${record.evalLevelId}#remark`, {
                initialValue: record.remark,
                rules: [
                  {
                    max: 190,
                    message: intl.get('hzero.common.validation.max', {
                      max: 190,
                    }),
                  },
                ],
              })(<Input />)}
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
        align: 'center',
        render: (text, record) => {
          return record.isEditing ? (
            <FormItem>
              {getFieldDecorator(`${record.evalLevelId}#enabledFlag`, {
                initialValue: record.enabledFlag === undefined ? 1 : record.enabledFlag,
              })(<Checkbox />)}
            </FormItem>
          ) : (
            <div>{enableRender(text)}</div>
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        align: 'center',
        render: (_, record) => {
          return record.isEditing ? (
            <a onClick={() => this.handlerReset(record)}>
              <Icon type={record.isCreate ? 'delete' : 'rollback'} />{' '}
              {record.isCreate
                ? intl.get('hzero.common.button.clean').d('清除')
                : intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          ) : (
            <a onClick={() => this.handlerEditScoreLevel(record, true)}>
              <Icon type="edit" /> {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
  }

  /**
   * 增加一行
   */
  @Bind()
  handlerAddScoreLevel() {
    const evalLevelId = `evalLevelId${uuidv4()}`;
    const data = {
      evalLevelId,
      isCreate: true,
      isEditing: true,
    };
    this.setState({
      newCreateRows: [...this.state.newCreateRows, data],
    });
  }

  /**
   * 行取消事件
   * @param {object} record 行数据
   */
  @Bind()
  handlerReset(record) {
    const { newCreateRows } = this.state;
    if (record.isCreate) {
      const listData = newCreateRows.filter(item => item.evalLevelId !== record.evalLevelId);
      this.setState({
        newCreateRows: listData,
      });
    } else {
      this.handlerEditScoreLevel(record, false);
    }
  }

  /**
   * 编辑事件
   * @param {object} record 行数据
   * @param {boolean} flag 是否编辑状态标记
   */
  @Bind()
  handlerEditScoreLevel(record, flag) {
    const {
      dispatch,
      scoreLevel: { data = [] },
    } = this.props;
    const index = data.findIndex(item => item.evalLevelId === record.evalLevelId);
    dispatch({
      type: 'scoreLevel/updateState',
      payload: {
        data: [
          ...data.slice(0, index),
          {
            ...record,
            isEditing: flag,
          },
          ...data.slice(index + 1),
        ],
      },
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refresh() {
    const { dispatch } = this.props;
    this.setState({
      newCreateRows: [],
    });
    dispatch({
      type: 'scoreLevel/fetchScoreLevel',
      payload: this.state.templateId,
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  handlerSaveScoreLevel() {
    const {
      form,
      dispatch,
      scoreLevel: { data = {} },
    } = this.props;
    const { newCreateRows, templateId } = this.state;
    const allEditRows = [...data, ...newCreateRows];
    let newData = data;
    form.validateFields((err, values) => {
      if (!err) {
        const arr = [];
        const isNewRowKeys = allEditRows.filter(v => v.isEditing);
        const fieldsArr = ['scoreFrom', 'scoreTo', 'enabledFlag', 'levelDesc', 'remark'];
        isNewRowKeys.forEach(item => {
          const itemObj = {};
          fieldsArr.forEach(_item => {
            itemObj[`${_item}`] = values[`${item.evalLevelId}#${_item}`];
          });
          if (!item.isCreate) {
            itemObj.levelCode = item.levelCode;
            newData = newData.filter(d => d.evalLevelId !== item.evalLevelId);
          } else {
            itemObj.levelCode = lodash.trim(values[`${item.evalLevelId}#levelCode`]);
          }
          arr.push({ ...item, ...itemObj });
        });
        if (arr.filter(a => a.scoreFrom >= a.scoreTo).length > 0) {
          notification.error({
            message: intl.get('sslm.scoreLevel.view.message.error').d('分值从不能大于分值至！'),
          });
        } else {
          dispatch({
            type: 'scoreLevel/addScoreLevel',
            payload: {
              ...templateId,
              scoreLevelList: [...newData, ...arr],
            },
          }).then(response => {
            if (response) {
              this.refresh();
              if (response.validResult) {
                notification.info({
                  message: intl
                    .get('sslm.scoreLevel.view.message.info')
                    .d('录入的分值范围和评分指标的分值范围不一致！'),
                });
              } else {
                notification.success();
              }
            }
          });
        }
      }
    });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  @Bind()
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const {
      scoreLevel: { tmplInfo = {} },
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('sslm.scoreLevel.model.scoreLevel.templateCode').d('评分模板代码')}
        >
          {getFieldDecorator('templateCode', {
            initialValue: tmplInfo.templateCode,
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          label={intl.get('sslm.scoreLevel.model.scoreLevel.templateName').d('评分模板描述')}
        >
          {getFieldDecorator('templateName', {
            initialValue: tmplInfo.templateName,
          })(<Input disabled />)}
        </FormItem>
      </Form>
    );
  }

  /**
   * 渲染事件
   * @returns
   */
  render() {
    const {
      match,
      scoreLevel: { data = [] },
      addLoading,
      fetchLoading,
    } = this.props;
    const { newCreateRows } = this.state;
    const basePath = match.path.substring(0, match.path.indexOf('/score-level'));
    const dataSource = [...data, ...newCreateRows];
    const columns = this.createColumns();
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.scoreLevel.view.message.title').d('评分等级定义')}
          backPath={`${basePath}/list`}
        >
          <Button icon="plus" type="primary" onClick={this.handlerAddScoreLevel}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" loading={addLoading} onClick={this.handlerSaveScoreLevel}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content
          description={intl
            .get('sslm.scoreLevel.view.message.description')
            .d('注意：分值段必须连续且分值段首尾数值相同！')}
        >
          <div className="table-list-search">{this.renderForm()}</div>
          <Table
            loading={fetchLoading}
            rowKey="evalLevelId"
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            onChange={this.handleTableChange}
            bordered
          />
        </Content>
      </React.Fragment>
    );
  }
}
