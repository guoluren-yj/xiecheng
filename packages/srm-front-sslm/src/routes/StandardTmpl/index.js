/**
 * StandardTmpl - 标准模板指标定义
 * @date: 2018-08-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Modal, Table, InputNumber, Row, Col } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import Debounce from 'lodash-decorators/debounce';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import Switch from 'components/Switch';
import notification from 'utils/notification';
import cacheComponent from 'components/CacheComponent';
import { enableRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;

/**
 * modal的侧滑属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

/**
 * 维护评分指标弹出框
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} modalVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} onHandleAdd - 数据保存
 * @reactPropss {Object} editRowData - 当前编辑数据
 * @reactPropss {Object} loading - 加载状态
 * @reactProps {Function} showEditModal - 控制modal显示隐藏方法
 * @reactPropss {Object} currentRowData 当前行数据
 * @return React.element
 */
const CreateForm = Form.create({ fieldNameProp: null })(props => {
  const {
    form,
    modalVisible,
    onHandleAdd,
    onShowEditModal,
    editRowData,
    currentRowData,
    loading,
  } = props;
  const {
    indicateId,
    indicateCode,
    description,
    scoreFrom,
    scoreTo,
    defaultScore,
    enabledFlag,
  } = editRowData;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (fieldsValue.scoreFrom < fieldsValue.scoreTo) {
          onHandleAdd(fieldsValue, form);
        } else {
          notification.error({
            message: intl.get('sslm.standardTmpl.view.option.error').d('分值从不能大于分值至！'),
          });
        }
      }
    });
  };
  const cancelHandle = () => {
    onShowEditModal(false, {});
  };
  const formLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 15 },
  };
  return (
    <Modal
      title={intl.get('sslm.standardTmpl.view.message.title.modal').d('评分要素维护')}
      visible={modalVisible}
      onOk={okHandle}
      confirmLoading={loading}
      destroyOnClose
      onCancel={() => cancelHandle()}
      {...otherProps}
    >
      <React.Fragment>
        <FormItem
          {...formLayout}
          label={intl.get('sslm.standardTmpl.model.standardTmpl.indicateCode').d('指标编码')}
        >
          {form.getFieldDecorator('indicateCode', {
            initialValue: indicateCode,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('sslm.standardTmpl.model.standardTmpl.indicateCode').d('指标编码'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input typeCase="upper" trim inputChinese={false} disabled={indicateId} />)}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('sslm.standardTmpl.model.standardTmpl.description').d('指标描述')}
        >
          {form.getFieldDecorator('description', {
            initialValue: description,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('sslm.standardTmpl.model.standardTmpl.description').d('指标描述'),
                }),
              },
              {
                max: 40,
                message: intl.get('hzero.common.validation.max', {
                  max: 40,
                }),
              },
            ],
          })(<Input maxLength={30} />)}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('sslm.standardTmpl.model.standardTmpl.scoreFrom').d('分值从')}
        >
          {form.getFieldDecorator('scoreFrom', {
            initialValue: scoreFrom,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('sslm.standardTmpl.model.standardTmpl.scoreFrom').d('分值从'),
                }),
              },
            ],
          })(<InputNumber min={0} disabled={editRowData.children} style={{ width: '100%' }} />)}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('sslm.standardTmpl.model.standardTmpl.scoreTo').d('分值至')}
        >
          {form.getFieldDecorator('scoreTo', {
            initialValue: scoreTo,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('sslm.standardTmpl.model.standardTmpl.scoreTo').d('分值至'),
                }),
              },
            ],
          })(<InputNumber min={0} disabled={editRowData.children} style={{ width: '100%' }} />)}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('sslm.standardTmpl.model.standardTmpl.defaultScore').d('缺省分值')}
        >
          {form.getFieldDecorator('defaultScore', {
            initialValue: defaultScore,
          })(<InputNumber min={0} style={{ width: '100%' }} />)}
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('sslm.standardTmpl.view.message.form.root').d('父级评分要素')}
        >
          {form.getFieldDecorator('parentIndicateId', {
            initialValue: currentRowData.parentIndicateId,
          })(
            <Lov
              code="SSLM.SCORE.NOSELF_INDICATOR"
              queryParams={{
                organizationId: getCurrentOrganizationId(),
                templateId: 0,
                excludeIndicateId: indicateId,
              }}
              textValue={
                currentRowData.parentIndicateDescription ||
                intl.get('sslm.standardTmpl.view.message.lov.textValue.parentIndId').d('根节点')
              }
              disabled={!indicateId}
            />
          )}
        </FormItem>
        {enabledFlag === undefined && (
          <FormItem {...formLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
            {form.getFieldDecorator('enabledFlag', {
              initialValue: 1,
            })(<Switch />)}
          </FormItem>
        )}
      </React.Fragment>
    </Modal>
  );
});

/**
 * 标准模板定义
 * @extends {Component} - React.Component
 * @reactProps {Object} standardTmpl - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ standardTmpl, loading }) => ({
  standardTmpl,
  fetchLoading: loading.effects['standardTmpl/fetchTmplList'],
  updateLoading: loading.effects['standardTmpl/updateTmpls'],
}))
@formatterCollections({
  code: ['sslm.standardTmpl', 'sslm.common'],
})
@Form.create({ fieldNameProp: null })
@withRouter
@cacheComponent({ cacheKey: '/sslm/standard-tmpl' })
export default class StandardTmpl extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      editRowData: {},
      currentRowData: {},
      editFlag: 0,
    };
    this.saveData = this.saveData.bind(this);
  }

  /**
   * 控制编辑弹框显示隐藏
   * @param {boolean} flag 显示隐藏标记
   * @param {Object} [record={}] 行数据
   * @param {number} editFlag 编辑/新增标记
   */
  @Bind()
  showEditModal(flag, record = {}, editFlag) {
    this.setState({
      modalVisible: !!flag,
      editFlag: editFlag || 0,
    });
    if (editFlag === 1) {
      this.setState({
        editRowData: {},
        currentRowData: {
          ...record,
          parentIndicateDescription: record.description, // 新建下级时候展示的父级节点应该是当前节点
          parentIndicateId: record.indicateId,
        },
      });
    } else if (editFlag === 2) {
      this.setState({
        editRowData: record,
        currentRowData: {
          parentIndicateDescription: record.parentIndicateDescription,
          parentIndicateId: record.parentIndicateId,
        },
      });
    }
    if (!flag) {
      this.refreshValue();
      this.setState({
        editRowData: {},
        currentRowData: {},
      });
    }
  }

  /**
   * 保存标准模板指标定义
   * @param {Object} data 数据
   * @param {Object} form 表单
   */
  @Debounce(500)
  saveData(data, form) {
    const { dispatch } = this.props;
    dispatch({
      type: 'standardTmpl/saveTmpls',
      payload: data,
    }).then(response => {
      if (response) {
        notification.success();
        this.showEditModal(false);
        form.resetFields();
      }
    });
  }

  /**
   * 更新标准模板指标定义
   * @param {Object} data 数据
   * @param {Object} form 表单
   */
  @Bind()
  updateData(data, form) {
    const { dispatch } = this.props;
    dispatch({
      type: 'standardTmpl/updateTmpls',
      payload: data,
    }).then(response => {
      if (response) {
        notification.success();
        this.showEditModal(false);
        form.resetFields();
      }
    });
  }

  /**
   * 新增标准模板指标定义
   * @param {Object} fieldsValue 传递的filedvalue
   * @param {Object} form 表单
   */
  @Bind()
  handleAdd(fieldsValue, form) {
    const { editRowData, editFlag, currentRowData } = this.state;
    const editValues = {
      indicateCode: lodash.trim(fieldsValue.indicateCode),
      templateId: 0,
    };
    let data = {};
    if (editFlag === 0) {
      data = {
        ...fieldsValue,
        ...editValues,
      };
      this.saveData(data, form);
    } else if (editFlag === 1) {
      data = {
        parentIndicateId: currentRowData.indicateId,
        ...fieldsValue,
        ...editValues,
      };
      this.saveData(data, form);
    } else if (editFlag === 2) {
      data = {
        ...editRowData,
        ...fieldsValue,
        ...editValues,
      };
      this.updateData(data, form);
    }
  }

  /**
   * 禁止/启用方法
   * @param {Object} record 行数据
   */
  @Bind()
  forbidden(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'standardTmpl/isForbidden',
      payload: {
        indicateId: record.indicateId,
        templateId: 0,
        isForbidden: record.enabledFlag ? 'disable' : 'enable',
      },
    }).then(response => {
      if (response) {
        notification.success();
        this.refreshValue();
      }
    });
  }

  /**
   * 刷新标准模板指标定义
   */
  @Bind()
  refreshValue() {
    const { dispatch } = this.props;
    dispatch({
      type: 'standardTmpl/fetchTmplList',
      payload: {
        templateId: 0,
      },
    }).then(
      this.setState({
        editFlag: 0,
      })
    );
    this.handleFormReset();
  }

  /**
   * 查询标准模板指标定义
   */
  @Bind()
  fetchTmpls() {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'standardTmpl/fetchTmplList',
          payload: {
            ...fieldsValue,
            templateId: 0,
          },
        });
      }
    });
  }

  /**
   * 展开事件
   * @param {boolean} expanded 展开/收缩标记
   * @param {Object} record 行数据
   */
  @Bind()
  onExpand(expanded, record) {
    const {
      dispatch,
      standardTmpl: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'standardTmpl/updateCheckedData',
      payload: {
        expandedRowKeys: expanded
          ? expandedRowKeys.concat(record.indicateId)
          : expandedRowKeys.filter(o => o !== record.indicateId),
      },
    });
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'standardTmpl/fetchTmplList',
      payload: {
        templateId: 0,
      },
    });
  }

  /**
   * 重置
   */
  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
  };

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
              label={intl.get('sslm.standardTmpl.model.standardTmpl.indicateCode').d('指标编码')}
              {...formItemLayout}
            >
              {getFieldDecorator('indicateCode')(
                <Input trim typeCase="upper" inputChinese={false} />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('sslm.common.model.indicator.name').d('指标名称')}
              {...formItemLayout}
            >
              {getFieldDecorator('description')(<Input />)}
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
                onClick={() => this.fetchTmpls()}
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
   * 渲染方法
   * @returns
   */
  render() {
    const {
      standardTmpl: { data = [], expandedRowKeys = [] },
      fetchLoading,
      updateLoading,
    } = this.props;
    const { modalVisible, editRowData, editFlag, currentRowData } = this.state;
    const columns = [
      {
        title: intl.get('sslm.standardTmpl.model.standardTmpl.indicateCode').d('指标编码'),
        dataIndex: 'indicateCode',
        width: 300,
      },
      {
        title: intl.get('sslm.common.model.indicator.name').d('指标名称'),
        dataIndex: 'description',
      },
      {
        title: intl.get('sslm.standardTmpl.view.menu.score').d('分值'),
        width: 200,
        children: [
          {
            title: intl.get('sslm.standardTmpl.model.standardTmpl.scoreFrom').d('分值从'),
            dataIndex: 'scoreFrom',
            width: 100,
          },
          {
            title: intl.get('sslm.standardTmpl.model.standardTmpl.scoreTo').d('分值至'),
            dataIndex: 'scoreTo',
            width: 100,
          },
        ],
      },
      {
        title: intl.get('sslm.standardTmpl.model.standardTmpl.defaultScore').d('缺省分值'),
        dataIndex: 'defaultScore',
        width: 100,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 300,
        render: (_, record) =>
          record.enabledFlag === 1 ? (
            <span className="action-link">
              <a onClick={() => this.showEditModal(true, record, 1)}>
                {intl.get('sslm.standardTmpl.view.button.childAddIndic').d('新增下级评分要素')}
              </a>
              <a onClick={() => this.showEditModal(true, record, 2)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a onClick={() => this.forbidden(record)}>
                {intl.get('hzero.common.status.disable').d('禁用')}
              </a>
            </span>
          ) : (
            <a onClick={() => this.forbidden(record)}>
              {intl.get('hzero.common.status.enable').d('启用')}
            </a>
          ),
      },
    ];

    const parentMethods = {
      onHandleAdd: this.handleAdd,
      onShowEditModal: this.showEditModal,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('sslm.standardTmpl.view.message.title').d('标准指标定义')}>
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true, {}, 0)}>
            {intl.get('sslm.standardTmpl.view.button.add').d('新增顶级评分要素')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          <Table
            bordered
            defaultExpandAllRows
            loading={fetchLoading}
            rowKey="indicateId"
            dataSource={data}
            columns={columns}
            pagination={false}
            onExpand={this.onExpand}
            expandedRowKeys={expandedRowKeys}
          />
          <CreateForm
            {...parentMethods}
            modalVisible={modalVisible}
            editFlag={editFlag}
            editRowData={editRowData}
            currentRowData={currentRowData}
            loading={updateLoading}
          />
        </Content>
      </React.Fragment>
    );
  }
}
