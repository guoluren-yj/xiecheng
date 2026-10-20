/**
 * ScoreIndic - 模板指标定义
 * @date: 2018-08-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Modal, Table, InputNumber, Select } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import Switch from 'components/Switch';
import CopyTmpl from './CopyTmpl';
import '../index.less';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 使用 Select 的组件 Option
 */
const { Option } = Select;

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
 * @reactProps {Function} saveCopyData - 数据保存
 * @reactPropss {Object} editRowData - 当前编辑数据
 * @reactPropss {Object} templateId - 模板id
 * @reactPropss {Object} loading - 加载状态
 * @reactPropss {Object} getCopyTmplRef - 获取ref方法
 * @reactProps {Function} showEditModal - 控制modal显示隐藏方法
 * @reactProps {Function} queryPublishedTmpl - 查询已经发布的模板
 * @reactPropss {Object} tmplData - 模板数据
 * @reactProps {Function} changeCreateForm - 改变form的内容
 * @reactPropss {Object} createForm 是否是新建数据
 * @reactPropss {Object} currentRowData 当前行数据
 * @return React.element
 */
const CreateForm = Form.create({ fieldNameProp: null })(props => {
  const {
    form,
    modalVisible,
    handleAdd,
    showEditModal,
    editRowData,
    templateId,
    changeCreateForm,
    createForm,
    getCopyTmplRef,
    tmplData,
    saveCopyData,
    queryPublishedTmpl,
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
  const tenantId = getCurrentOrganizationId();
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        if (+createForm) {
          saveCopyData(fieldsValue, form);
        } else if (fieldsValue.scoreFrom < fieldsValue.scoreTo) {
          handleAdd(fieldsValue, form);
        } else {
          notification.error({
            message: intl.get('sslm.scoreIndic.view.option.error').d('分值从不能大于分值至！'),
          });
        }
      }
    });
  };
  const cancelHandle = () => {
    showEditModal(false);
    form.resetFields();
  };
  const changeEditMethods = value => {
    changeCreateForm(value);
  };
  const formLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 15 },
  };
  return (
    <Modal
      title={intl.get('sslm.scoreIndic.view.message.title.modal').d('维护指标')}
      confirmLoading={loading}
      visible={modalVisible}
      onOk={okHandle}
      width="50%"
      onCancel={() => cancelHandle()}
      destroyOnClose
      {...otherProps}
    >
      <React.Fragment>
        <FormItem
          {...formLayout}
          label={intl.get('sslm.scoreIndic.view.message.form.select').d('指标生成方式')}
        >
          <Select defaultValue="0" onChange={changeEditMethods} style={{ width: '100%' }}>
            <Option value="0">
              {intl.get('sslm.scoreIndic.view.message.option.self').d('自定义指标')}
            </Option>
            <Option value="1">
              {intl.get('sslm.scoreIndic.view.message.option.copy').d('复制模板生成指标')}
            </Option>
          </Select>
        </FormItem>
        <FormItem
          {...formLayout}
          label={intl.get('sslm.scoreIndic.view.message.form.root').d('父级评分要素')}
        >
          {form.getFieldDecorator('parentIndicateId', {
            initialValue: currentRowData.parentIndicateId || 0,
          })(
            <Lov
              code="SSLM.SCORE.NOSELF_INDICATOR"
              queryParams={{
                organizationId: tenantId,
                ...templateId,
                excludeIndicateId: indicateId,
              }}
              textValue={
                currentRowData.parentIndicateDescription ||
                intl.get('sslm.scoreIndic.view.message.lov.textValue.parentIndicateId').d('根节点')
              }
              disabled={!indicateId}
            />
          )}
        </FormItem>
        {+createForm ? (
          <div>
            <FormItem
              {...formLayout}
              label={intl.get('sslm.scoreIndic.view.message.form.choice').d('选择评分模板')}
            >
              {form.getFieldDecorator('choiceTmpl', {
                initialValue: 'choiceTmpl',
              })(
                <Lov
                  code="SSLM.SCORE.TEMPLATE"
                  queryParams={{ organizationId: getCurrentOrganizationId(), ...templateId }}
                  onChange={queryPublishedTmpl}
                  textValue={intl
                    .get('sslm.scoreIndic.view.message.lov.textValue.choiceTmpl')
                    .d('标准指标模板')}
                />
              )}
            </FormItem>
            <CopyTmpl
              getCopyTmplRef={getCopyTmplRef}
              tmplData={tmplData}
              saveCopyData={saveCopyData}
              templateId={templateId}
              queryPublishedTmpl={queryPublishedTmpl}
            />
          </div>
        ) : (
          <div>
            <FormItem
              {...formLayout}
              label={intl.get('sslm.scoreIndic.model.scoreIndic.indicateCode').d('指标编码')}
            >
              {form.getFieldDecorator('indicateCode', {
                initialValue: indicateCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.scoreIndic.model.scoreIndic.indicateCode').d('指标编码'),
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
              label={intl.get('sslm.scoreIndic.model.scoreIndic.description').d('指标名称')}
            >
              {form.getFieldDecorator('description', {
                initialValue: description,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.scoreIndic.model.scoreIndic.description').d('指标名称'),
                    }),
                  },
                  {
                    max: 40,
                    message: intl.get('hzero.common.validation.max', {
                      max: 40,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('sslm.scoreIndic.model.scoreIndic.scoreFrom').d('分值从')}
            >
              {form.getFieldDecorator('scoreFrom', {
                initialValue: scoreFrom,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.scoreIndic.model.scoreIndic.scoreFrom').d('分值从'),
                    }),
                  },
                ],
              })(<InputNumber min={0} disabled={editRowData.children} />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('sslm.scoreIndic.model.scoreIndic.scoreTo').d('分值至')}
            >
              {form.getFieldDecorator('scoreTo', {
                initialValue: scoreTo,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.scoreIndic.model.scoreIndic.scoreTo').d('分值至'),
                    }),
                  },
                ],
              })(<InputNumber min={0} disabled={editRowData.children} />)}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl.get('sslm.scoreIndic.model.scoreIndic.defaultScore').d('缺省分值')}
            >
              {form.getFieldDecorator('defaultScore', {
                initialValue: defaultScore,
              })(<InputNumber min={0} />)}
            </FormItem>
            {enabledFlag === undefined && (
              <FormItem {...formLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
                {form.getFieldDecorator('enabledFlag', {
                  initialValue: 1,
                })(<Switch />)}
              </FormItem>
            )}
          </div>
        )}
      </React.Fragment>
    </Modal>
  );
});

/**
 * 评分模板定义 - 模板指标定义
 * @extends {Component} - React.Component
 * @reactProps {Object} scoreIndic - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.scoreIndic'],
})
@connect(({ scoreIndic, loading }) => ({
  scoreIndic,
  fetchLoading: loading.effects['scoreIndic/fetchIndicList'],
  updateLoading: loading.effects['scoreIndic/updateIndic'],
  saveCopyLoading: loading.effects['scoreIndic/saveCopy'],
}))
@Form.create({ fieldNameProp: null })
@withRouter
export default class ScoreIndic extends PureComponent {
  /**
   * @param {object} props
   */
  constructor(props) {
    super(props);
    const templateId = qs.parse(props.location.search.substr(1));
    this.state = {
      templateId,
      modalVisible: false,
      editRowData: {},
      currentRowData: {},
      editFlag: 0,
      copyTmplVisible: false,
      createForm: 0,
    };
  }

  /**
   *复制模板的ref
   */
  copyTmplRef;

  /**
   * 控制编辑框的显示和隐藏
   * @param {boolean} flag 显示/隐藏标记
   * @param {object} [record={}] 行数据
   * @param {boolean} editFlag 编辑/新增标记
   */
  @Bind()
  showEditModal(flag, record = {}, editFlag) {
    const state = {
      modalVisible: !!flag,
      editFlag: editFlag || 0,
      editRowData: record || {},
      currentRowData: {
        parentIndicateDescription: '',
        parentIndicateId: '',
      },
      createForm: 0,
    };
    const copyRecord = editFlag === 1 ? record : {};
    state.editRowData = editFlag === 1 ? {} : record;
    state.currentRowData = {
      ...copyRecord,
      parentIndicateDescription:
        editFlag === 1 ? record.description : record.parentIndicateDescription,
      parentIndicateId: editFlag === 1 ? record.indicateId : record.parentIndicateId,
    };
    if (!flag) {
      this.refreshValue();
      state.editRowData = {};
      state.currentRowData = {};
      state.createForm = 0;
    }
    this.setState(state);

    // this.setState({
    //   modalVisible: !!flag,
    //   editFlag: editFlag || 0,
    // });
    // if (editFlag === 1) {
    //   this.setState({
    //     editRowData: {},
    //     currentRowData: {
    //       ...record,
    //       parentIndicateDescription: record.description, // 新建下级时候展示的父级节点应该是当前节点
    //       parentIndicateId: record.indicateId,
    //     },
    //   });
    // } else if (editFlag === 2) {
    //   this.setState({
    //     editRowData: record,
    //     currentRowData: {
    //       parentIndicateDescription: record.parentIndicateDescription,
    //       parentIndicateId: record.parentIndicateId,
    //     },
    //   });
    // }
    // if (!flag) {
    //   this.refreshValue();
    //   this.setState({
    //     editRowData: {},
    //     currentRowData: {},
    //     createForm: 0,
    //   });
    // }
  }

  /**
   * 保存数据
   * @param {object} data 数据
   * @param {object} form 表单
   */
  @Bind()
  handlerSaveIndic(data, form) {
    const { dispatch } = this.props;
    dispatch({
      type: 'scoreIndic/saveIndic',
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
   * 更新数据
   * @param {object} data 数据
   * @param {object} form 表单
   */
  @Bind()
  handlerUpdateIndic(data, form) {
    const { dispatch } = this.props;
    dispatch({
      type: 'scoreIndic/updateIndic',
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
   * 添加模本定义
   * @param {object} fieldsValue 传递的filedvalue
   * @param {object} form 表单
   */
  @Bind()
  handleAddScoreTmpl(fieldsValue, form) {
    const { editRowData, editFlag, currentRowData, templateId } = this.state;
    let data = {};
    const editDataParams = {
      // 添加的元素
      ...fieldsValue,
      indicateCode: lodash.trim(fieldsValue.indicateCode),
      ...templateId,
    };
    if (editFlag === 0) {
      data = {
        ...editDataParams,
      };
      this.handlerSaveIndic(data, form);
    } else if (editFlag === 1) {
      data = {
        parentIndicateId: currentRowData.indicateId,
        ...editDataParams,
      };
      this.handlerSaveIndic(data, form);
    } else if (editFlag === 2) {
      data = {
        ...editRowData,
        ...editDataParams,
      };
      this.handlerUpdateIndic(data, form);
    }
  }

  /**
   * 禁用
   * @param {object} record 行数据
   */
  @Bind()
  forbidden(record) {
    const { dispatch } = this.props;
    const { templateId } = this.state;
    dispatch({
      type: 'scoreIndic/isForbidden',
      payload: {
        ...templateId,
        indicateId: record.indicateId,
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
   * 跳转细项权限
   * @param {object} record 行数据
   */
  @Bind()
  handleIndicVisible(record) {
    const { history } = this.props;
    history.push(
      `/sslm/score-tmpl/score-indic-assign?templateId=${record.templateId}&indicateId=${record.indicateId}`
    );
  }

  /**
   *控制复制节点功能显示
   * @param {boolean} flag
   */
  @Bind()
  handlecopyTmplVisible(flag) {
    const { dispatch } = this.props;
    const { templateId } = this.state;
    if (flag) {
      dispatch({
        type: 'scoreIndic/getStandardTmpl',
        payload: {
          enabledFlag: 1,
        },
      });
    } else {
      this.copyTmplRef.setState({
        selectedRows: [],
      });
      dispatch({
        type: 'scoreIndic/fetchIndicList',
        payload: templateId,
      });
    }
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    const { dispatch } = this.props;
    const { templateId } = this.state;
    dispatch({
      type: 'scoreIndic/fetchIndicList',
      payload: templateId,
    }).then(
      this.setState({
        editFlag: 0,
      })
    );
    this.handleFormReset();
  }

  /**
   * 查询数据
   */
  @Bind()
  queryValue() {
    const { form, dispatch } = this.props;
    const { templateId } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'scoreIndic/fetchIndicList',
          payload: {
            ...fieldsValue,
            ...templateId,
          },
        });
      }
    });
  }

  /**
   * 保存复制模板的数据
   * @param {object} fieldsValue 表单数据
   */
  @Bind()
  saveCopyData(fieldsValue) {
    const { dispatch } = this.props;
    const { templateId, currentRowData } = this.state;
    const checkedData = this.copyTmplRef.state.selectedRows.map(n => n.indicateId);
    dispatch({
      type: 'scoreIndic/saveCopy',
      payload: {
        ...templateId,
        indicateIdList: checkedData,
        parentIndicateId: fieldsValue.parentIndicateId || currentRowData.indicateId || 0,
      },
    }).then(response => {
      if (response) {
        notification.success();
        this.showEditModal(false);
        this.copyTmplRef.setState({
          selectedRows: [],
        });
      }
    });
  }

  /**
   * 手动录入/复制已有节点 切换方法
   * @param {object} value
   */
  @Bind()
  changeCreateForm(value) {
    this.setState({
      createForm: value,
    });
    if (value) {
      this.handlecopyTmplVisible(value);
    }
  }

  /**
   * 获取复制功能组件ref
   * @param {object} self 传递的this
   */
  @Bind()
  getCopyTmplRef(self) {
    this.copyTmplRef = self;
  }

  /**
   * 查询已经发布的模板
   * @param {number} id 模板id
   */
  @Bind()
  queryPublishedTmpl(id) {
    const { dispatch } = this.props;
    dispatch({
      type: 'scoreIndic/fetchPublishedTmpl',
      payload: {
        templateId: id,
        enabledFlag: 1,
      },
    });
  }

  /**
   * 展开方法
   * @param {boolean} expanded 展开/收起标记
   * @param {object} record 行数据
   */
  @Bind()
  onExpand(expanded, record) {
    const {
      dispatch,
      scoreIndic: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'scoreIndic/updateCheckedData',
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
    const { templateId } = this.state;
    dispatch({
      type: 'scoreIndic/fetchIndicList',
      payload: templateId,
    });
    dispatch({
      type: 'scoreIndic/fetchCategory',
      payload: templateId,
    });
  }

  /**
   *重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查询结构渲染
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('sslm.scoreIndic.model.scoreIndic.indicateCode').d('指标编码')}>
          {getFieldDecorator('indicateCode')(<Input trim typeCase="upper" inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get('sslm.scoreIndic.model.scoreIndic.description').d('指标名称')}>
          {getFieldDecorator('description')(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      scoreIndic: { data = [], tmpl = [], expandedRowKeys },
      //  submitLoading,
      fetchLoading,
      updateLoading,
      saveCopyLoading,
      match,
    } = this.props;
    const {
      modalVisible,
      editRowData,
      editFlag,
      copyTmplVisible,
      templateId,
      createForm,
      currentRowData,
    } = this.state;
    const basePath = match.path.substring(0, match.path.indexOf('/score-indic'));
    const columns = [
      {
        title: intl.get('sslm.scoreIndic.model.scoreIndic.indicateCode').d('指标编码'),
        dataIndex: 'indicateCode',
        width: 300,
      },
      {
        title: intl.get('sslm.scoreIndic.model.scoreIndic.description').d('指标名称'),
        dataIndex: 'description',
      },
      {
        title: intl.get('sslm.scoreIndic.view.menu.score').d('分值'),
        width: 200,
        children: [
          {
            title: intl.get('sslm.scoreIndic.model.scoreIndic.scoreFrom').d('分值从'),
            dataIndex: 'scoreFrom',
            width: 100,
            align: 'right',
          },
          {
            title: intl.get('sslm.scoreIndic.model.scoreIndic.scoreTo').d('分值至'),
            dataIndex: 'scoreTo',
            width: 100,
            align: 'right',
          },
        ],
      },
      {
        title: intl.get('sslm.scoreIndic.model.scoreIndic.defaultScore').d('缺省分值'),
        dataIndex: 'defaultScore',
        width: 80,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 350,
        render: (_, record) => {
          return (
            <span className="action-link">
              {record.enabledFlag === 1 ? (
                <React.Fragment>
                  <a onClick={() => this.showEditModal(true, record, 1)}>
                    {intl.get('sslm.scoreIndic.view.button.childAddIndic').d('新增下级评分要素')}
                  </a>
                  <a onClick={() => this.showEditModal(true, record, 2)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                  <a onClick={() => this.forbidden(record)}>
                    {intl.get('hzero.common.status.disable').d('禁用')}
                  </a>
                </React.Fragment>
              ) : (
                <a onClick={() => this.forbidden(record)}>
                  {intl.get('hzero.common.status.enable').d('启用')}
                </a>
              )}
              {!record.children && (
                <a onClick={() => this.handleIndicVisible(record)}>
                  {intl.get('sslm.scoreIndic.view.menu.assign').d('细项权限')}
                </a>
              )}
            </span>
          );
        },
      },
    ];

    const parentMethods = {
      handleAdd: this.handleAddScoreTmpl,
      showEditModal: this.showEditModal,
      changeCreateForm: this.changeCreateForm,
    };
    const copyTmplMethords = {
      handlecopyTmplVisible: this.handlecopyTmplVisible,
      saveCopyData: this.saveCopyData,
      queryPublishedTmpl: this.queryPublishedTmpl,
      getCopyTmplRef: this.getCopyTmplRef,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.scoreIndic.view.message.title').d('定义模板指标')}
          backPath={`${basePath}/list`}
        >
          <div>
            <Button icon="plus" type="primary" onClick={() => this.showEditModal(true, {}, 0)}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </div>
          {/* {!isPublish && (
            <div>
              <Button icon="plus" type="primary" onClick={() => this.showEditModal(true, {}, 0)}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              {data.length > 0 && (
                <Button icon="rocket" loading={submitLoading} onClick={this.submit}>
                  {intl.get('sslm.scoreIndic.view.button.publish').d('发布')}
                </Button>
              )}
            </div>
          )} */}
        </Header>
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          <Table
            loading={fetchLoading}
            rowKey="indicateId"
            dataSource={data}
            columns={columns}
            defaultExpandAllRows
            bordered
            pagination={false}
            onExpand={this.onExpand}
            expandedRowKeys={expandedRowKeys}
          />
          <CreateForm
            {...parentMethods}
            {...copyTmplMethords}
            modalVisible={modalVisible}
            editFlag={editFlag}
            templateId={templateId}
            editRowData={editRowData}
            createForm={createForm}
            copyTmplVisible={copyTmplVisible}
            tmplData={tmpl}
            currentRowData={currentRowData}
            loading={updateLoading || saveCopyLoading}
          />
        </Content>
      </React.Fragment>
    );
  }
}
