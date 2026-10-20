/**
 * index.js - 供应商分类定义
 * @date: 2018-10-27
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import queryString from 'querystring';
import uuidv4 from 'uuid/v4';
import { cloneDeep, isEmpty, isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Form, Input, Button, Select, Modal, Icon, Tooltip } from 'hzero-ui';

import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import {
  getCurrentOrganizationId,
  getEditTableData,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';
import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import TLEditor from 'components/TLEditor';
import CommonImport from 'components/Import';
import { Button as PerButton } from 'components/Permission';
import { SRM_SSLM } from '_utils/config';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import { openTab } from 'utils/menuTab';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryCurrentSupplierCtgIsEnabled } from '@/services/supplierCategoryService';
import FilterForm from './FilterForm';
import styles from './index.less';

const { Option } = Select;
const { confirm } = Modal;

@connect(({ supplierCategory, loading }) => ({
  supplierCategory,
  tenantId: getCurrentOrganizationId(),
  loading:
    loading.effects['supplierCategory/querySupplierCategory'] ||
    loading.effects['supplierCategory/saveSupplierCategory'],
  saving: loading.effects['supplierCategory/saveSupplierCategory'],
}))
@formatterCollections({
  code: 'sslm.supplierCategory',
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_CATEGORY_LIST.TABLE',
    'SSLM.SUPPLIER_CATEGORY_LIST.SEARCH_FORM',
    'SSLM.SUPPLIER_CATEGORY_LIST.BTN_GROUP',
  ],
})
export default class SupplierCategory extends Component {
  constructor(props) {
    super(props);
    this.filterForm = {}; // 表单搜索对象
    this.state = {
      expandedRowKeys: [], // 当前展开的树
    };
  }

  componentDidMount() {
    const { dispatch, tenantId } = this.props;
    const lovCodes = {
      approveMethodList: 'SPFM.BUSINESS_APV_METHOD',
      labelConfigList: 'SSLM.LABEL_LEVEL_CONFIG',
      tenantId,
    };
    dispatch({
      type: 'supplierCategory/init',
      payload: lovCodes,
    });
    dispatch({
      type: 'supplierCategory/fetchLifeCycleStages',
    });
  }

  getSnapshotBeforeUpdate() {
    if (!this.custFlag && !this.props.custLoading) {
      this.fetchSupplierCategory();
      this.custFlag = true;
    }
  }

  /**
   * 查询供应商分类
   */
  @Bind()
  fetchSupplierCategory(flag) {
    const { dispatch } = this.props;
    const values = this.filterForm.props && this.filterForm.props.form.getFieldsValue();

    dispatch({
      type: 'supplierCategory/querySupplierCategory',
      payload: {
        ...values,
        customizeUnitCode:
          'SSLM.SUPPLIER_CATEGORY_LIST.TABLE,SSLM.SUPPLIER_CATEGORY_LIST.SEARCH_FORM',
      },
    }).then(() => {
      const {
        supplierCategory: { supplierCategoryKeys },
      } = this.props;
      if (flag) {
        this.setState({
          expandedRowKeys: !isEmpty(filterNullValueObject(values)) ? supplierCategoryKeys : [],
        });
      }
    });
  }

  /**
   * 根据节点路径，在树形结构树中的对应节点添加或替换children属性
   * @param {Array} collections 树形结构树
   * @param {Array} cursorList 节点路径
   * @param {Array} data  追加或替换的children数据
   * @returns {Array} 新的树形结构
   */
  findAndSetNodeProps(collections, cursorPath = [], data) {
    let newCursorList = cursorPath;
    const cursor = newCursorList[0];
    const tree = collections.map(n => {
      const m = n;
      if (m.categoryId === cursor) {
        if (newCursorList[1]) {
          if (!m.children) {
            m.children = [];
          }
          newCursorList = newCursorList.filter(o => newCursorList.indexOf(o) !== 0);
          m.children = this.findAndSetNodeProps(m.children, newCursorList, data);
        } else {
          m.children = [...data];
        }
        if (m.children.length === 0) {
          const { children, ...others } = m;
          return { ...others };
        } else {
          return m;
        }
      }
      return m;
    });
    return tree;
  }

  /**
   * 根据节点路径，在树形结构树中的对应节点
   * @param {Array} collections 树形结构树
   * @param {Array} cursorList 节点路径
   * @param {String} keyName 主键名称
   * @returns {Object} 节点信息
   */
  findNode(collection, cursorList = [], keyName) {
    let newCursorList = cursorList;
    const cursor = newCursorList[0];
    for (let i = 0; i < collection.length; i++) {
      if (collection[i][keyName] === cursor) {
        if (newCursorList[1]) {
          newCursorList = newCursorList.slice(1);
          return this.findNode(collection[i].children, newCursorList, keyName);
        }
        return collection[i];
      }
    }
  }

  /**
   * 新增供应商分类
   * @param {Object} record - 新增供应商分类行信息
   */
  @Bind()
  addSupplierCategory(record) {
    const {
      supplierCategory: { supplierCategoryList },
      dispatch,
      tenantId,
    } = this.props;
    const { expandedRowKeys } = this.state;

    if (record.categoryId) {
      const { levelPath, categoryId } = record;
      const newSupplierCategory = {
        tenantId,
        levelPath,
        _status: 'create',
        enabledFlag: 1,
        parentCategoryId: categoryId,
        categoryId: uuidv4(),
        categoryCode: '',
        categoryDescription: '',
        approveMethod: '',
        evaluationLevelFlag: 0,
        evaluationScoreFlag: 0,
      };
      const newChildren = [newSupplierCategory, ...(record.children || [])];
      const levels = levelPath.split('.').map(item => item * 1);

      const newSupplierCategoryList = this.findAndSetNodeProps(
        supplierCategoryList,
        levels,
        newChildren
      );

      this.setState(
        {
          expandedRowKeys: [...expandedRowKeys, levels[levels.length - 1]],
        },
        () => {
          dispatch({
            type: 'supplierCategory/updateState',
            payload: { supplierCategoryList: newSupplierCategoryList },
          });
        }
      );
    } else {
      const newSupplierCategory = {
        _status: 'create',
        enabledFlag: 1,
        tenantId,
        parentCategoryId: 0,
        categoryId: uuidv4(),
        categoryCode: undefined,
        categoryDescription: undefined,
        approveMethod: undefined,
        evaluationLevelFlag: 0,
        evaluationScoreFlag: 0,
      };

      const newSupplierCategoryList = [newSupplierCategory, ...supplierCategoryList];
      dispatch({
        type: 'supplierCategory/updateState',
        payload: { supplierCategoryList: newSupplierCategoryList },
      });
    }
  }

  // 编辑树结构信息
  @Bind()
  editSupplierCategory(record, flag) {
    const { categoryId, levelPath } = record;
    const { supplierCategory: { supplierCategoryList = [] } = {}, dispatch } = this.props;

    let newSupplierCategoryList = supplierCategoryList;

    if (record.parentCategoryId) {
      const parentCursor = levelPath.split('.').map(item => item * 1);
      const parentNode = this.findNode(
        supplierCategoryList,
        parentCursor.splice(0, parentCursor.length - 1),
        'categoryId'
      );
      // 修复端测bug-parentNode为undefined
      if (parentNode) {
        const newChildren = cloneDeep(parentNode.children);
        const index = newChildren.findIndex(item => item.categoryId === categoryId);
        if (flag) {
          newChildren.splice(index, 1, {
            ...record,
            _status: 'update',
          });
        } else {
          const { _status, ...other } = record;
          newChildren.splice(index, 1, other);
          record.$form.setFieldsValue({
            evaluationLevelFlag: record.evaluationLevelFlag,
            evaluationScoreFlag: record.evaluationScoreFlag,
          });
        }
        newSupplierCategoryList = this.findAndSetNodeProps(
          supplierCategoryList,
          parentNode.levelPath.split('.').map(item => item * 1),
          newChildren
        );
      }
    } else {
      const index = newSupplierCategoryList.findIndex(item => item.categoryId === categoryId);
      if (flag) {
        newSupplierCategoryList.splice(index, 1, {
          ...supplierCategoryList[index],
          _status: 'update',
        });
      } else {
        const { _status, ...other } = supplierCategoryList[index];
        newSupplierCategoryList.splice(index, 1, other);
        record.$form.setFieldsValue({
          evaluationLevelFlag: record.evaluationLevelFlag,
          evaluationScoreFlag: record.evaluationScoreFlag,
        });
      }
    }

    // 更新 Modal 供应商分类列表
    dispatch({
      type: 'supplierCategory/updateState',
      payload: { supplierCategoryList: newSupplierCategoryList },
    });
  }

  /**
   * 取消添加供应商分类
   * @param {Object} record - 当前供应商分类行信息
   */
  @Bind()
  cancelAddSupplierCategory(record) {
    const { categoryId, levelPath } = record;
    const { supplierCategory: { supplierCategoryList = [] } = {}, dispatch } = this.props;

    let newSupplierCategoryList = supplierCategoryList;
    if (levelPath) {
      const parentNode = this.findNode(
        supplierCategoryList,
        levelPath.split('.').map(item => item * 1),
        'categoryId'
      );
      const newChildren = parentNode.children.filter(item => item.categoryId !== categoryId);
      newSupplierCategoryList = this.findAndSetNodeProps(
        supplierCategoryList,
        levelPath.split('.').map(item => item * 1),
        newChildren
      );
    } else {
      newSupplierCategoryList = supplierCategoryList.filter(item => item.categoryId !== categoryId);
    }

    // 更新 Modal 权限集列表
    dispatch({
      type: 'supplierCategory/updateState',
      payload: { supplierCategoryList: newSupplierCategoryList },
    });
  }

  /**
   * 保存供应商分类修改
   */
  @Bind()
  saveSupplierCategory() {
    const { dispatch, supplierCategory: { supplierCategoryList = [] } = {} } = this.props;
    const params = getEditTableData(supplierCategoryList, ['children', 'categoryId']);

    if (Array.isArray(params) && params.length !== 0) {
      dispatch({
        type: 'supplierCategory/saveSupplierCategory',
        payload: {
          dataList: params,
          customizeUnitCode: 'SSLM.SUPPLIER_CATEGORY_LIST.TABLE',
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchSupplierCategory();
        }
      });
    }
  }

  /**
   * 展开全部供应商分类
   */
  @Bind()
  expandAll() {
    const { supplierCategory: { supplierCategoryKeys = [] } = {} } = this.props;
    this.setState({
      expandedRowKeys: supplierCategoryKeys,
    });
  }

  /**
   * 收起全部供应商分类
   */
  @Bind()
  collapseAll() {
    this.setState({
      expandedRowKeys: [],
    });
  }

  /**
   * 启用当前节点及其子节点
   * @param {Object} record - 启用的供应商分类
   */
  @Bind()
  enableSupplierCategory(record) {
    const { dispatch } = this.props;
    const { categoryId } = record;
    const params = {
      categoryId,
    };
    const self = this;
    confirm({
      title: intl
        .get('sslm.supplierCategory.view.title.confirmEnable')
        .d('启用时，会将此分类及其下级分类一同启用，确定启用分类吗？'),
      content: null,
      onOk() {
        dispatch({
          type: 'supplierCategory/enableSupplierCategory',
          payload: params,
        }).then(() => {
          self.fetchSupplierCategory();
        });
      },
    });
  }

  /**
   * 禁用当前节点及其子节点
   * @param {Object} record - 禁用的供应商分类
   */
  @Bind()
  async disableSupplierCategory(record) {
    const { dispatch } = this.props;
    const { categoryId } = record;
    const params = {
      categoryId,
    };
    const self = this;

    const isShow = getResponse(await queryCurrentSupplierCtgIsEnabled(params));

    confirm({
      title: `${intl
        .get('sslm.supplierCategory.view.title.confirmDisable')
        .d('禁用时，会将此分类及其下级分类一同禁用，确定禁用分类吗？')}${
        isShow === false
          ? `【${intl
              .get('sslm.supplierCategory.view.title.supplerCtgCheckTip')
              .d('仍有供应商启用该分类，请确认是否要禁用')}】`
          : ''
      }`,
      content: null,
      onOk() {
        dispatch({
          type: 'supplierCategory/disableSupplierCategory',
          payload: params,
        }).then(() => {
          self.fetchSupplierCategory();
        });
      },
    });
  }

  /**
   * 树形结构点击展开收起时的回调
   */
  @Bind()
  onExpand(expanded, record) {
    const { categoryId } = record;
    const { expandedRowKeys } = this.state;

    if (expanded) {
      this.setState({
        expandedRowKeys: [...expandedRowKeys, categoryId],
      });
    } else {
      const newExpandRowKeys = expandedRowKeys.filter(item => item !== categoryId);
      this.setState({
        expandedRowKeys: newExpandRowKeys,
      });
    }
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchImport(code) {
    let retitle = '';
    if (code === 'SSLM.SUPPLIER_CATEGORY') {
      retitle = intl.get('hzero.common.title.batchImport').d('批量导入');
    }
    openTab({
      key: `/sslm/supplier-category/${code}`,
      search: queryString.stringify({
        key: `/sslm/supplier-category/${code}`,
        title: retitle,
        action: retitle,
        args: JSON.stringify({ organizationId: getCurrentOrganizationId() }),
      }),
    });
  }

  /**
   * 远程校验供应商分类编码是否重复
   * @param {*} rule
   * @param {*} value
   * @param {*} callback
   */
  @Bind()
  checkCategoryCode(rule, value, callback) {
    const { dispatch } = this.props;
    const code = value;
    if (code) {
      dispatch({
        type: 'supplierCategory/checkCategoryCode',
        payload: {
          categoryCode: code,
        },
      }).then(res => {
        // console.log(res);
        if (isEmpty(res)) {
          callback();
        } else {
          callback(
            intl
              .get('sslm.supplierCategory.view.validation.uniqueCategoryCode')
              .d('供应商分类代码重复')
          );
        }
      });
    } else {
      callback();
    }
  }

  /**
   * 渲染动态生命周期列
   * @param val
   */
  @Bind()
  renderLifeCycleStageColumn(val, record) {
    const { dispatch } = this.props;
    const { categoryId, categoryDescription } = record;
    const { count, stageId = 'all' } = val || {};
    const values = this.filterForm.props && this.filterForm.props.form.getFieldsValue();
    const { companyId, companyName } = values;
    const stringify = queryString.stringify({
      categoryId,
      categoryDescription,
      stageId,
      companyId,
      companyName,
      skipFlag: 1,
      sourceKey: 'SUPPLIER_CATEGORY',
    });
    if (typeof count === 'number') {
      return (
        <a
          onClick={e => {
            e.preventDefault();
            dispatch(
              routerRedux.push({
                pathname: '/sslm/supplier-manager/list',
                search: stringify,
              })
            );
            return false;
          }}
        >
          {count}
        </a>
      );
    } else {
      return null;
    }
  }

  render() {
    const {
      loading,
      // saving,
      customizeTable,
      supplierCategory: {
        labelConfigList = [], // 标签层级配置
        supplierCategoryList,
        lifeCycleStages,
      },
      customizeFilterForm,
      custLoading,
      customizeBtnGroup,
    } = this.props;
    const { expandedRowKeys = [] } = this.state;
    const multiFlagTip = intl
      .get('sslm.supplierCategory.view.message.multiFlagTip')
      .d('若为是，则在维护供应商的分类时，该供应商在该顶级下可以存在多个分类');
    const importClassifyTip = intl
      .get('sslm.supplierCategory.view.message.importClassifyTip')
      .d('设置为引入分类后，在邀约阶段需要至少维护一条引入分类。');
    const synergyTip = intl
      .get('sslm.supplierCategory.view.message.synergyTip')
      .d('此标识主要作用：判断在后续订单送货对账等业务流程中是否需要供应商参与协同');

    const columns = [
      {
        title: intl
          .get('sslm.supplierCategory.model.supplierCategory.categoryCode')
          .d('供应商分类代码'),
        dataIndex: 'categoryCode',
        className: styles.treeNode,
        render: (value, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('categoryCode', {
                  initialValue: value,
                  rules:
                    record._status === 'create'
                      ? [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.supplierCategory.model.supplierCategory.categoryCode')
                                .d('供应商分类代码'),
                            }),
                          },
                          {
                            validator: this.checkCategoryCode,
                          },
                        ]
                      : [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.supplierCategory.model.supplierCategory.categoryCode')
                                .d('供应商分类代码'),
                            }),
                          },
                        ],
                  validateTrigger: 'onBlur',
                })(
                  <Input
                    trim
                    maxLength={30}
                    inputChinese={false}
                    onPressEnter={this.saveSupplierCategory}
                    disabled={record._status === 'update'}
                  />
                )}
              </Form.Item>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl.get('sslm.supplierCategory.model.supplierCategory.caDesc').d('供应商分类描述'),
        dataIndex: 'categoryDescription',
        width: 150,
        render: (value, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('categoryDescription', {
                  initialValue: value,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.supplierCategory.model.supplierCategory.catDesc')
                          .d('供应商分类描述'),
                      }),
                    },
                  ],
                })(
                  <TLEditor
                    label={intl
                      .get('sslm.supplierCategory.model.supplierCategory.caDesc')
                      .d('供应商分类描述')}
                    field="categoryDescription"
                    token={record._token}
                    maxLength={150}
                    onPressEnter={this.saveSupplierCategory}
                  />
                )}
              </Form.Item>
            );
          } else {
            return value;
          }
        },
      },
      {
        title: intl
          .get('sslm.supplierCategory.model.supplierCategory.evalLevelFlag')
          .d('是否评级项'),
        dataIndex: 'evaluationLevelFlag',
        width: 100,
        render: (value, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('evaluationLevelFlag', {
                  initialValue: value,
                })(
                  <Checkbox
                    disabled={!(record._status === 'create' || record._status === 'update')}
                  />
                )}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(value);
          }
        },
      },
      {
        title: intl
          .get('sslm.supplierCategory.model.supplierCategory.evalScoreFlag')
          .d('是否评分项'),
        dataIndex: 'evaluationScoreFlag',
        width: 100,
        render: (value, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('evaluationScoreFlag', {
                  initialValue: value,
                })(
                  <Checkbox
                    disabled={!(record._status === 'create' || record._status === 'update')}
                  />
                )}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(value);
          }
        },
      },
      {
        title: (
          <Tooltip title={multiFlagTip}>
            {intl
              .get('sslm.supplierCategory.model.supplierCategory.multiFlag')
              .d('是否允许多选末级')}
            <Icon style={{ fontSize: 14, marginLeft: 4 }} type="question-circle" />
          </Tooltip>
        ),
        dataIndex: 'multiFlag',
        width: 150,
        render: (value, record) => {
          if (record.parentCategoryId) {
            return '';
          } else if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('multiFlag', {
                  initialValue:
                    ['create'].includes(record._status) && !record.parentCategoryId ? 1 : value,
                })(
                  <Checkbox
                    disabled={
                      !(record._status === 'create' || record._status === 'update') ||
                      record.parentCategoryId
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(value);
          }
        },
      },
      {
        title: intl.get('sslm.supplierCategory.model.supplierCategory.setLabel').d('设为标签'),
        dataIndex: 'setToLabelFlag',
        width: 100,
        render: (value, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('setToLabelFlag', {
                initialValue: value || 0,
              })(<Switch />)}
            </Form.Item>
          ) : (
            yesOrNoRender(value)
          ),
      },
      {
        title: intl
          .get('sslm.supplierCategory.model.supplierCategory.labelConfig')
          .d('标签层级配置'),
        dataIndex: 'labelLevelConfig',
        width: 150,
        render: (value, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('labelLevelConfig', {
                initialValue: value,
                rules: [
                  {
                    required: record.$form.getFieldValue('setToLabelFlag'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.supplierCategory.model.supplierCategory.labelConfig')
                        .d('标签层级配置'),
                    }),
                  },
                ],
              })(
                <Select
                  style={{ width: '100%' }}
                  disabled={!record.$form.getFieldValue('setToLabelFlag')}
                >
                  {labelConfigList.map(m => {
                    return (
                      <Option key={m.value} value={m.value}>
                        {m.meaning}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          ) : (
            record.labelLevelConfigMeaning
          ),
      },
      {
        title: (
          <Tooltip title={importClassifyTip}>
            {intl.get('sslm.supplierCategory.model.supplierCategory.importClassify').d('引入分类')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        dataIndex: 'introCategoryFlag',
        width: 100,
        render: (value, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('introCategoryFlag', {
                initialValue: value || 0,
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            yesOrNoRender(value)
          ),
      },
      {
        title: (
          <Tooltip title={synergyTip}>
            {intl.get('sslm.supplierCategory.model.supplierCategory.synergyFlag').d('是否协同')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        dataIndex: 'synergyFlag',
        width: 100,
        render: (value, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('synergyFlag', {
                initialValue: value === 0 ? 0 : 1,
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            yesOrNoRender(value)
          ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 260,
        dataIndex: 'option',
        render: (_, record) => {
          const { doEnabledFlag, _status, childrenFlag, enabledFlag } = record;
          const isEdit = _status === 'update';
          const isNew = _status === 'create';
          return isNew ? (
            <a onClick={() => this.cancelAddSupplierCategory(record)}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          ) : (
            <span className="action-link">
              {isEdit ? (
                <a onClick={() => this.editSupplierCategory(record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              ) : (
                <a onClick={() => this.editSupplierCategory(record, 'edit')}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
              {childrenFlag ? (
                <a onClick={() => this.addSupplierCategory(record)}>
                  {intl.get('sslm.supplierCategory.view.button.addChildren').d('新增下级')}
                </a>
              ) : (
                <span style={{ color: '#aaa' }}>
                  {intl.get('sslm.supplierCategory.view.button.addChildren').d('新增下级')}
                </span>
              )}
              {enabledFlag ? (
                <a onClick={() => this.disableSupplierCategory(record)}>
                  {intl.get('sslm.supplierCategory.view.button.disableAll').d('禁用当前及下级')}
                </a>
              ) : doEnabledFlag ? (
                <a onClick={() => this.enableSupplierCategory(record)}>
                  {intl.get('sslm.supplierCategory.view.button.enableAll').d('启用当前及下级')}
                </a>
              ) : (
                <span style={{ color: '#aaa' }}>
                  {intl.get('sslm.supplierCategory.view.button.enableAll').d('启用当前及下级')}
                </span>
              )}
            </span>
          );
        },
      },
    ];
    if (Array.isArray(lifeCycleStages) && lifeCycleStages.length) {
      const lifeCycleStageColumn = [
        {
          title: intl.get(`sslm.supplierCategory.model.supplierCategory.All`).d('全部'),
          dataIndex: 'ALL',
          width: 100,
          isStdDynamic: true, // 个性化动态标准字段标识
          render: this.renderLifeCycleStageColumn,
        },
      ];
      lifeCycleStages.forEach(item => {
        lifeCycleStageColumn.push({
          title: item.stageDescription,
          dataIndex: item.stageCode,
          width: 100,
          isStdDynamic: true, // 个性化动态标准字段标识
          render: this.renderLifeCycleStageColumn,
        });
      });
      columns.splice(2, 0, ...lifeCycleStageColumn);
    }
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.supplierCategory.view.title.supplierCat').d('供应商分类定义')}
        >
          {customizeBtnGroup(
            {
              // code: 'SSLM.SUPPLIER_CATEGORY_LIST.BTN_GROUP',
              code: '',
            },
            [
              <Button
                icon="save"
                loading={loading}
                type="primary"
                onClick={this.saveSupplierCategory}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>,
              <Button icon="plus" onClick={this.addSupplierCategory}>
                {intl.get('sslm.supplierCategory.view.button.addParent').d('新增顶级')}
              </Button>,
              <Button icon="down" onClick={this.expandAll}>
                {intl.get('hzero.common.button.expandAll').d('全部展开')}
              </Button>,
              <Button icon="up" onClick={this.collapseAll}>
                {intl.get('hzero.common.button.collapseAll').d('全部收起')}
              </Button>,
              <CommonImport
                businessObjectTemplateCode="SSLM.SUPPLIER_CATEGORY"
                prefixPatch={SRM_SSLM}
                refreshButton
                args={{ organizationId: getCurrentOrganizationId() }}
                buttonText={intl.get('hzero.common.button.newBatchImport').d('(新)批量导入')}
                successCallBack={() => {
                  this.fetchSupplierCategory();
                }}
                buttonProps={{
                  permissionList: [
                    {
                      code: 'srm.partner.suplier-classify.define.ps.import.model',
                      type: 'button',
                      meaning: '供应商分类定义-批量导入',
                    },
                  ],
                }}
              />,
              <PerButton
                icon="archive"
                type="c7n-pro"
                onClick={() => this.handleBatchImport('SSLM.SUPPLIER_CATEGORY')}
                permissionList={[
                  {
                    code: 'srm.partner.suplier-classify.define.ps.import.model.old',
                    type: 'button',
                    meaning: '供应商分类定义-批量导入',
                  },
                ]}
              >
                {intl.get('hzero.common.title.batchImport').d('批量导入')}
              </PerButton>,
            ]
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm
              onSearch={this.fetchSupplierCategory}
              onRef={ref => {
                this.filterForm = ref;
              }}
              code="SSLM.SUPPLIER_CATEGORY_LIST.SEARCH_FORM"
              customizeFilterForm={customizeFilterForm}
              custLoading={custLoading}
            />
          </div>
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_CATEGORY_LIST.TABLE',
            },
            <EditTable
              bordered
              uncontrolled
              rowKey="categoryId"
              loading={loading}
              dataSource={supplierCategoryList}
              columns={columns}
              pagination={false}
              scroll={{ x: scrollX }}
              onExpand={this.onExpand}
              expandedRowKeys={expandedRowKeys}
            />
          )}
        </Content>
        <Modal />
      </React.Fragment>
    );
  }
}
