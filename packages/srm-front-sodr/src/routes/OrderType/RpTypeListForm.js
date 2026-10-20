/*
 * ListForm - 采购订单类型维护表单
 * @date: 2018/10/13 11:15:59
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Form, Input, InputNumber, Modal, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isFunction, isArray } from 'lodash';
import { createPagination, getCurrentRole } from 'utils/utils';
import TLEditor from 'components/TLEditor';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import intl from 'utils/intl';

import LovMult from './LovMult';
import LovModal from './MultipleLov';

const roleInfo = getCurrentRole();

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
@Form.create({ fieldNameProp: null })
export default class DemandListForm extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) props.onRef(this);
    this.state = {
      categoryNames: [], // 需要展示出来的数据
      categorySource: [], // 采购品类的数据
      categoryPagination: {}, // 采购品类的分页参数
      selectDateRow: [], // 采购品类的selectedRows
      // toolTipVisible: false, // 悬浮框是否显示
    };
  }

  @Bind()
  validator(rule, value, callback) {
    const { rpTypeList = [], editValue } = this.props;
    if (!editValue.rpTypeId && rpTypeList.find((item) => item.rpTypeCode === value)) {
      callback(intl.get(`sodr.orderType.view.message.codeRepeat`).d('编码重复'));
    }
    callback();
  }

  componentDidMount() {
    const { editValue } = this.props;
    this.setState({
      selectDateRow: editValue.selectDateRow || [],
      categoryNames: editValue.selectDateRow
        ? editValue.selectDateRow.map((ele) => ele.categoryName)
        : [],
    });
  }

  // 保存
  @Bind()
  saveBtn() {
    const { form, onHandleAdd, editValue } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        const { selectDateRow } = this.state;
        onHandleAdd({
          ...values,
          categoryRelationList: selectDateRow.map((ele) => ({
            sourceId: ele.categoryId,
            sourceMeaning: ele.categoryName,
          })),
          roleRelationList: values.roles
            ? values.roles.map((ele) => ({ sourceId: ele.id, sourceMeaning: ele.name }))
            : editValue.roles
            ? editValue.roles.map((ele) => ({ sourceId: ele.id, sourceMeaning: ele.name }))
            : [],
        });
      }
    });
  }

  @Bind()
  handleModal(modalName, flag) {
    if (modalName === 'addModalVisible' && flag) {
      this.fetchModalData();
    }
    this.setState({ [modalName]: flag });
  }

  @Bind()
  fetchModalData(queryData = {}) {
    const { fetchModalData } = this.props;
    fetchModalData(queryData).then((res) => {
      if (res) {
        this.setState({ categorySource: res.content, categoryPagination: createPagination(res) });
      }
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.lovMultRef = ref;
  }

  @Bind()
  saveCategory(newCategory) {
    this.setState(
      { selectDateRow: newCategory, categoryNames: newCategory.map((ele) => ele.categoryName) },
      () => {
        const {
          form: { registerField, setFieldsValue },
        } = this.props;
        registerField('categoryNames');
        setFieldsValue({
          categoryNames: newCategory.map((ele) => ele.categoryName),
        });
        this.handleModal('addModalVisible', false);
      }
    );
  }

  @Bind()
  emitEmpty() {
    this.setState({ categoryNames: [], selectDateRow: [] });
  }

  render() {
    const {
      form: { getFieldDecorator },
      editValue,
      title,
      anchor,
      visible,
      onCancel,
      confirmLoading,
      fetchCategoryLoading,
      rpTypeList = [],
    } = this.props;
    const {
      categoryNames,
      categorySource = [],
      categoryPagination = {},
      addModalVisible = false,
      // toolTipVisible = false,
      selectDateRow = [],
    } = this.state;
    const suffix = (
      <React.Fragment>
        <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.emitEmpty} />
        <Icon
          key="search"
          type="search"
          onClick={() => this.handleModal('addModalVisible', true)}
          style={{ cursor: 'pointer', color: '#666', marginLeft: '4px' }}
        />
      </React.Fragment>
    );
    const columns = [
      {
        title: intl.get('sodr.orderType.model.materiel.categoryName').d('品类名称'),
        dataIndex: 'categoryName',
      },
      {
        title: intl.get('sodr.orderType.model.materiel.categoryCode').d('品类代码'),
        dataIndex: 'categoryCode',
        width: 300,
      },
    ];
    const lovClassNames = ['lov-input'];
    if (categoryNames) {
      lovClassNames.push('lov-suffix');
    }
    const lovModalOptions = {
      columns,
      loading: fetchCategoryLoading,
      title: intl.get('sodr.orderType.model.materiel.autoCategoryName').d('自主品类'),
      rowKey: 'categoryId',
      queryCode: 'categoryCode',
      queryName: 'categoryName',
      queryCodeDesc: intl.get('sodr.orderType.model.materiel.categoryCode').d('品类代码'),
      queryNameDesc: intl.get('sodr.orderType.model.materiel.categoryName').d('品类名称'),
      dataSource: categorySource,
      pagination: categoryPagination,
      modalVisible: addModalVisible,
      addData: this.saveCategory,
      onHideAddModal: () => this.handleModal('addModalVisible', false),
      fetchModalData: this.fetchModalData,
      onRef: this.handleBindRef,
      selectDate: selectDateRow,
    };
    return (
      <Fragment>
        <Modal
          destroyOnClose
          title={title}
          width={520}
          wrapClassName={`ant-modal-sidebar-${anchor}`}
          transitionName={`move-${anchor}`}
          visible={visible}
          onOk={this.saveBtn}
          onCancel={onCancel}
          confirmLoading={confirmLoading}
          okText={intl.get('hzero.common.button.sure').d('确定')}
          cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        >
          <Form>
            <Form.Item
              {...formLayout}
              label={intl.get(`entity.order.type.requisitionPlanTypeCode`).d('需求计划类型编码')}
            >
              {getFieldDecorator('rpTypeCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`entity.order.type.requisitionPlanTypeCode`)
                        .d('需求计划类型编码'),
                    }),
                  },
                  { validator: this.validator },
                ],
                initialValue: editValue.rpTypeCode,
              })(<Input disabled={!!editValue.rpTypeId} inputChinese={false} />)}
            </Form.Item>
            <Form.Item
              {...formLayout}
              label={intl.get(`entity.order.type.requisitionPlanTypeName`).d('需求计划类型')}
            >
              {getFieldDecorator('rpTypeName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.order.type.requisitionPlanTypeName`).d('需求计划类型'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', {
                      max: 120,
                    }),
                  },
                ],
                initialValue: editValue.rpTypeName,
              })(
                <TLEditor
                  label={intl.get(`entity.order.type.requisitionPlanTypeName`).d('需求计划类型')}
                  field="rpTypeName"
                  token={editValue._token}
                />
              )}
            </Form.Item>
            <Form.Item
              label={intl.get(`sodr.common.model.common.sourceCode`).d('来源系统')}
              {...formLayout}
            >
              {getFieldDecorator('sourcePlatform', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sodr.common.model.common.sourceCode`).d('来源系统'),
                    }),
                  },
                ],
                initialValue: editValue.sourcePlatform || 'SRM',
              })(<Input disabled />)}
            </Form.Item>
            <Form.Item
              {...formLayout}
              label={intl.get(`sodr.orderType.model.orderType.linkrpTypeId`).d('关联申请类型')}
            >
              {getFieldDecorator('prTypeId', {
                initialValue: editValue.prTypeId,
              })(<Lov textValue={editValue.prTypeName} code="SPUC.PR_DEMAND_TYPE" />)}
            </Form.Item>
            <Form.Item
              {...formLayout}
              label={intl.get(`sodr.orderType.model.orderType.categoryIds`).d('采购品类')}
            >
              {getFieldDecorator('categoryIds', {
                initialValue: isArray(categoryNames) ? categoryNames.join(',') : '',
              })(
                <Tooltip
                  placement="left"
                  title={isArray(categoryNames) ? categoryNames.join(',') : ''}
                  // visible={toolTipVisible && !isEmpty(categoryNames)}>
                >
                  <Input
                    readOnly
                    suffix={suffix}
                    className={lovClassNames.join(' ')}
                    allowClear
                    value={isArray(categoryNames) ? categoryNames.join(',') : ''}
                  />
                </Tooltip>
              )}
            </Form.Item>
            <Form.Item
              {...formLayout}
              label={intl.get(`sodr.orderType.model.orderType.visibleRoles`).d('可见角色')}
            >
              {getFieldDecorator('roleIds', {
                initialValue: editValue.roleIds,
              })(
                <LovModal
                  code="HIAM.USER_ROLE_MANAGER_V2"
                  textValue={editValue.roleNames}
                  queryParams={{ adminRoleId: roleInfo.id, enabled: 1 }}
                  lovOptions={{ displayField: 'name' }}
                  oldValueField="roles"
                  oldValue={editValue.roles || []}
                />
              )}
            </Form.Item>
            <Form.Item
              {...formLayout}
              label={intl.get(`sodr.orderType.model.orderType.orderSeq`).d('排序号')}
            >
              {getFieldDecorator('orderSeq', {
                rules: [
                  {
                    pattern: /\d/,
                    message: intl.get(`hzero.common.validation.requireNumber`).d('请输入数字'),
                  },
                ],
                initialValue: editValue.orderSeq,
              })(<InputNumber min={0} style={{ width: '100%' }} />)}
            </Form.Item>
            <Form.Item
              {...formLayout}
              label={intl.get(`sodr.orderType.model.orderType.purAgentRelation`).d('计划员')}
            >
              {getFieldDecorator('purchaseAgentId', {
                initialValue: editValue.purchaseAgentId,
              })(<Lov textValue={editValue.purchaseAgentName} code="SRPM.PURCHASE_AGENT" />)}
            </Form.Item>
            <Form.Item {...formLayout} label={intl.get(`hzero.common.status.enable`).d('启用')}>
              {getFieldDecorator('enabledFlag', {
                initialValue: editValue.enabledFlag === 0 ? 0 : 1,
              })(<Switch />)}
            </Form.Item>
            <Form.Item
              {...formLayout}
              label={intl.get(`sodr.orderType.model.orderType.defaultFlag`).d('是否默认')}
            >
              {getFieldDecorator('defaultFlag', {
                initialValue: rpTypeList.length === 0 || editValue.defaultFlag === 1 ? 1 : 0, // disabled={defaultData.length === 0}
              })(<Switch />)}
            </Form.Item>
          </Form>
        </Modal>
        {addModalVisible && <LovMult {...lovModalOptions} />}
      </Fragment>
    );
  }
}
