/**
 * EditForm - 子账户管理 - 账号编辑表单
 * @date 2018/11/13
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import { cloneDeep, forEach, isUndefined, join, map, omit, find } from 'lodash';
import {
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Switch,
  Tooltip,
  Icon,
} from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { Button as ButtonPermission } from 'components/Permission';

import { EMAIL, NOT_CHINA_PHONE, PHONE, CODE } from 'utils/regExp';
// import { operatorRender } from 'utils/renderer';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DEFAULT_DATE_FORMAT, FORM_COL_2_LAYOUT, MODAL_FORM_ITEM_LAYOUT } from 'utils/constants';
import { VERSION_IS_OP } from 'utils/config';
import {
  addItemsToPagination,
  createPagination,
  delItemsToPagination,
  getDateFormat,
  getEditTableData,
  tableScrollWidth,
} from 'utils/utils';
import { validatePasswordRule } from '@/utils/validator';

import RoleModal from './RoleModal';
import PermissionModal from './PermissionModal';

import styles from '../../index.less';

/**
 * EditForm-编辑子账户信息
 * @reactProps {Function} fetchUserRoles 获取当前编辑用户已分配的角色
 * @reactProps {Object[]} dataSource 编辑用户已分配的角色
 * @reactProps {Object[]} LEVEL 资源层级的值集
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    onRef(this);
    this.cancelDefaultParams = new Set();
  }

  static propTypes = {
    fetchUserRoles: PropTypes.func.isRequired,
    dataSource: PropTypes.array,
    level: PropTypes.array,
  };

  static defaultProps = {
    dataSource: [],
    level: [],
  };

  state = {
    dataSource: [],
    // TODO: 什么时候重构
    oldDataSource: [], // 存储查询出来的数据 用来比较 以 排出没有更改的数据
    pagination: false,
    roleTableFetchLoading: false,
    level: [],
    selectedRowKeys: [],
    // 选择组织的框是否显示record
    // assignPerVisible: false,
    // stateRecord: {},
  };

  /**
   * @param {Object} nextProps 下一个属性
   * @param {Object} prevState 上一个状态
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = {};
    const { level, isCreate } = nextProps;
    if (isCreate && prevState.pagination !== false) {
      // 新建分页没有 分页
      nextState.pagination = false;
    }
    if (level !== prevState.level) {
      nextState.level = level;
      nextState.levelMap = {};
      forEach(level, (l) => {
        nextState.levelMap[l.value] = l;
      });
    }
    return nextState;
  }

  /**
   * 将 hook 方法传递出去
   */
  componentDidMount() {
    this.init();
  }

  /**
   * 初始化数据
   * 编辑 + 加载用户角色
   * 重置form表单
   */
  init() {
    const { form, isCreate } = this.props;
    form.resetFields();
    this.cancelDefaultParams.clear();
    if (!isCreate) {
      // 在当前是编辑时
      this.handleRoleTableChange();
    }
  }

  /**
   * 检查 确认密码是否与密码一致
   * @param {String} rule
   * @param {String} value
   * @param {Function} callback
   */
  @Bind()
  validatePasswordRepeat(rule, value, callback) {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback(
        intl.get('hiam.subAccount.view.validation.passwordSame').d('确认密码必须与密码一致')
      );
    } else {
      callback();
    }
  }

  /**
   * 检查 有效日期至 大于 有效日期从
   * @param {String} rule
   * @param {String} value
   * @param {Function} callback
   */
  @Bind()
  validateEndDateActive(rule, value, callback) {
    const { form } = this.props;
    // startDateActive 已经保证会有值
    if (value && !value.isAfter(form.getFieldValue('startDateActive'), 'day')) {
      callback(
        intl.get('hiam.subAccount.view.validation.timeRange').d('有效日期至必须大于有效日期从')
      );
    } else {
      callback();
    }
  }

  /**
   * 获取编辑完成的数据
   */
  @Bind()
  getEditFormData() {
    const { form, initialValue, isCreate, organizationId } = this.props;
    const { dataSource, oldDataSource } = this.state;
    let result = {};
    let saveData = {};
    const validateFields = ['realName', 'email', 'phone', 'startDateActive', 'endDateActive'];
    if (isCreate) {
      validateFields.push('password');
      validateFields.push('anotherPassword');
    } else {
      validateFields.push('enabled');
    }
    form.validateFields((err, values) => {
      if (!err) {
        const excludeArray = [];
        const memberRoleList = [];
        const validatingDataSource = dataSource.filter(
          (r) => r._status === 'create' || r._status === 'update'
        );
        const validateDataSource = getEditTableData(validatingDataSource);
        // defaultRoleIds 不使用了, 使用 [ { roleId, tenantId, defaultFlag } ]
        const defaultRoles = [];
        forEach(dataSource, (record) => {
          const r = find(validateDataSource, (or) => or.id === record.id);
          if (r) {
            // 是可以修改的数据
            const { startDateActive, endDateActive } = r;
            const omitRecord = omit(record, [
              'id',
              '_assignLevelValue',
              '_assignLevelValueMeaning',
              'defaultRoleIdUpdate',
            ]);
            if (record.defaultRoleIdUpdate) {
              defaultRoles.push({
                roleId: record.id,
                tenantId: record.tenantId,
                defaultFlag: record.defaultRole === false ? 0 : 1,
              });
            }
            const newRecord = {
              ...omitRecord, // 需要 _token 等字段
              roleId: record.id,
              assignLevel: record.assignLevel,
              assignLevelValue: record.assignLevelValue,
              memberType: record.memberType,
              sourceId: organizationId,
              sourceType: record.sourceType,
              startDateActive: startDateActive && startDateActive.format(DEFAULT_DATE_FORMAT),
              endDateActive: endDateActive && endDateActive.format(DEFAULT_DATE_FORMAT),
            };

            // (VERSION_IS_OP && getCurrentOrganizationId() !== 0)
            // // 只有填写 分配层级 与 分配层级值 的角色才可以保存
            // switch (newRecord.assignLevel) {
            //   case 'org':
            //     newRecord.assignLevelValue = record.assignLevelValue;
            //     break;
            //   case 'organization':
            //   case 'site':
            //     // 如果是别人分配的 就不能修改
            //     newRecord.assignLevelValue = record.assignLevelValue || organizationId;
            //     break;
            //   default:
            //     break;
            // }
            // 由于这种写法 判断不了 哪些数据没有更新 所以全部保存
            if (!isUndefined(newRecord.roleId)) {
              // 只有 当 旧数据修改后 才传给后端
              if (
                !oldDataSource.some(
                  (oldR) =>
                    oldR.id === record.id &&
                    record.assignLevel === oldR.assignLevel &&
                    record.assignLevelValue === oldR.assignLevelValue
                ) ||
                (r._status === 'update' && record.startDateActive !== newRecord.startDateActive) ||
                record.endDateActive !== newRecord.endDateActive
              ) {
                memberRoleList.push(newRecord);
              }
            }
            excludeArray.push(`assignLevel#${record.id}`, `assignLevelValue#${record.id}`);
          }
        });
        const { birthday, startDateActive, endDateActive, ...data } = omit(values, excludeArray);
        result = {
          ...initialValue,
          ...data,
          startDateActive: startDateActive
            ? startDateActive.format(DEFAULT_DATE_FORMAT)
            : undefined,
          endDateActive: endDateActive ? endDateActive.format(DEFAULT_DATE_FORMAT) : undefined,
          birthday: birthday ? birthday.format(DEFAULT_DATE_FORMAT) : undefined,
          defaultRoles,
          memberRoleList,
          organizationId,
        };
        saveData = isCreate
          ? {
              userType: 'P',
              ...result,
            }
          : result;
      }
    });
    return saveData;
  }

  /**
   * 新增角色模态框确认按钮点击
   */
  @Bind()
  handleRoleAddSaveBtnClick(roles) {
    const { isCreate = true } = this.props;
    const { dataSource = [], pagination = {} } = this.state;
    this.setState({
      dataSource: [
        ...map(roles, (r) => ({
          ...omit(r, ['assignLevel', 'assignLevelValue']), // FIXME: 将角色之前的 层级信息 去掉
          memberType: 'user',
          // sourceType: r.level,
          // 租户级 可以分配的 肯定是 租户级的
          assignLevel: 'organization',
          assignLevelValue: r.tenantId,
          assignLevelValueMeaning: r.tenantName,
          _assignLevelValue: r.tenantId,
          _assignLevelValueMeaning: r.tenantName,
          isNew: true,
          // 新加进来的 角色 都是可以管理的
          manageableFlag: 1,
          _status: 'create',
        })),
        ...dataSource,
      ],
      pagination: isCreate
        ? false
        : addItemsToPagination(roles.length, dataSource.length, pagination),
    });
    return Promise.resolve();
  }

  /**
   * 新增角色模态框取消按钮点击
   */
  @Bind()
  handleRoleAddCancelBtnClick() {}

  /**
   * 打开新增角色 选择模态框
   */
  @Bind()
  handleRoleAddBtnClick() {
    // if (isEmpty(noAllocRoles)) {
    //   Modal.warn({
    //     content: intl
    //       .get('hiam.subAccount.view.message.noEnoughRole')
    //       .d('可分配的角色已全部分配完毕'),
    //   });
    //   return;
    // }
    const { isCreate, initialValue = {}, loadingDistributeUsers, labelList } = this.props;
    const { dataSource = [] } = this.state;
    const roleModalProps = {
      excludeRoleIds: [],
      excludeUserIds: [],
    };
    if (!isCreate) {
      roleModalProps.excludeUserIds.push(initialValue.id);
    }
    dataSource.forEach((r) => {
      if (r.isNew) {
        roleModalProps.excludeRoleIds.push(r.id);
      }
    });
    const roleModalRef = createRef();
    Modal.open({
      title: intl.get('hiam.subAccount.view.message.title.roleModal').d('选择角色'),
      style: { width: '720px' },
      movable: false,
      children: (
        <RoleModal
          {...roleModalProps}
          loading={loadingDistributeUsers}
          fetchRoles={this.fetchRoles}
          onSave={this.handleRoleAddSaveBtnClick}
          id={initialValue.id}
          labelList={labelList}
          roleModalRef={roleModalRef}
        />
      ),
      onOk: () => roleModalRef.current.handleSaveBtnClick(),
      onCancel: this.handleRoleAddCancelBtnClick,
    });
  }

  @Bind()
  fetchRoles(fields) {
    const { fetchAllRoles } = this.props;
    return fetchAllRoles(fields);
  }

  /**
   * @param {String[]} selectedRowKeys 选中的rowKey
   */
  @Bind()
  handleRoleSelectionChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 删除选中的角色
   * 由于 租户级这边 删除后 是重新查询, 所以 不需要保存之前的 分页信息
   */
  @Bind()
  handleRoleRemoveBtnClick() {
    const { deleteRoles, initialValue, isCreate = true } = this.props;
    const { dataSource, selectedRowKeys, pagination } = this.state;
    const that = this;
    if (selectedRowKeys.length === 0) {
      Modal.error({
        children: intl
          .get('hiam.subAccount.view.message.chooseRoleFirst')
          .d('请先选择要删除的角色'),
      });
      return;
    }
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get(`hiam.subAccount.view.message.title.content`).d('确定删除吗？'),
    }).then((res) => {
      if (res === 'ok') {
        const ids = [];
        const newDataSource = [];
        dataSource.forEach((item) => {
          if (!item.isNew && selectedRowKeys.indexOf(item.id) >= 0) {
            ids.push({
              roleId: item.id,
              memberId: initialValue.id,
            });
          }
          if (!(item.isNew && selectedRowKeys.indexOf(item.id) >= 0)) {
            newDataSource.push(item);
          }
        });
        if (ids.length > 0) {
          deleteRoles(ids).then((result) => {
            that.setState({
              dataSource: newDataSource,
              selectedRowKeys: [],
              // pagination: isCreate ? false: delItemsToPagination(selectedRowKeys.length, dataSource.length, pagination),
            });
            that.handleRoleTableChange();
            if (result) {
              notification.success();
            }
          });
        } else {
          that.setState({
            dataSource: newDataSource,
            selectedRowKeys: [],
            pagination: isCreate
              ? false
              : delItemsToPagination(selectedRowKeys.length, dataSource.length, pagination),
          });
          notification.success();
        }
      }
    });
  }

  /**
   * 默认角色改变
   * @param {object} record 默认角色 改变
   */
  handleRoleDefaultChange(record) {
    if (record.defaultRole) {
      // 已经是 默认角色了 什么都不做 则取消默认角色并将该租户加入 删除角色租户中
      this.cancelDefaultParams.add(record.tenantId);
    }
    const defaultChangeTo = !record.defaultRole;
    const { dataSource = [] } = this.state;
    this.setState({
      dataSource: dataSource.map((item) => {
        if (item.id === record.id) {
          return {
            ...item,
            defaultRole: defaultChangeTo,
            defaultRoleIdUpdate: true,
          };
        }
        if (defaultChangeTo && item.tenantId === record.tenantId) {
          // item 取消同租户的 defaultRoleId
          if (item.defaultRole) {
            this.cancelDefaultParams.add(item.tenantId);
          }
          return {
            ...item,
            defaultRole: false,
            defaultRoleIdUpdate: item.defaultRole,
          };
        }
        return item;
      }),
    });
  }

  /**
   * 角色 table 分页改变
   * 如果是新增用户 分页是
   * @param {?object} page
   * @param {?object} filter
   * @param {?object} sort
   */
  @Bind()
  handleRoleTableChange(page, _, sort) {
    const { fetchUserRoles, isCreate = true, initialValue = {} } = this.props;
    if (!isCreate) {
      this.showRoleTableLoading();
      fetchUserRoles({ page, sort, userId: initialValue.id })
        .then((roleContent) => {
          // 在前面中已经 getResponse 了
          if (roleContent) {
            const dataSource = roleContent.content.map((r) => ({ ...r, _status: 'update' })) || [];
            this.setState({
              oldDataSource: cloneDeep(dataSource),
              dataSource,
              pagination: createPagination(roleContent),
            });
            // 翻页清空 已取消默认角色的租户
            this.cancelDefaultParams.clear();
          }
        })
        .finally(() => {
          this.hiddenRoleTableLoading();
        });
    }
  }

  @Bind()
  showRoleTableLoading() {
    this.setState({ roleTableFetchLoading: true });
  }

  @Bind()
  hiddenRoleTableLoading() {
    this.setState({ roleTableFetchLoading: false });
  }

  @Bind()
  changeCountryId() {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ regionId: undefined });
  }

  /**
   * @date 2019-06-13
   * 区号改变 需要 重置手机号的校验状态
   */
  @Bind()
  reValidationPhone(value) {
    const { form } = this.props;
    const prevInternationalTelCode = form.getFieldValue('internationalTelCode');
    if (value === '+86' || prevInternationalTelCode === '+86') {
      // 只要 +86 出现在 中间态 就需要重新手动校验 phone
      const curPhone = form.getFieldValue('phone');
      let errors = null;
      if (curPhone) {
        const testReg = value === '+86' ? PHONE : NOT_CHINA_PHONE;
        if (!testReg.test(curPhone)) {
          errors = [new Error(intl.get('hzero.common.validation.phone').d('手机格式不正确'))];
        }
      } else {
        errors = [
          new Error(
            intl.get('hzero.common.validation.notNull', {
              name: intl.get('hiam.subAccount.model.user.phone').d('手机号码'),
            })
          ),
        ];
      }
      form.setFields({
        phone: {
          value: curPhone,
          errors,
        },
      });
    }
  }

  // #region 验证密码修改后 是否和 确认密码一致

  /**
   * 检查 确认密码是否与密码一致
   */
  @Bind()
  validatePasswordRepeatForPassword(e) {
    const { form } = this.props;

    const anotherPassword = form.getFieldValue('anotherPassword');
    const anotherPasswordField = {
      value: anotherPassword,
    };
    if (e.target.value) {
      if (e.target.value === anotherPassword) {
        anotherPasswordField.errors = null;
      } else {
        anotherPasswordField.errors = [
          new Error(
            intl.get('hiam.subAccount.view.validation.passwordSame').d('确认密码必须与密码一致')
          ),
        ];
      }
    } else {
      anotherPasswordField.errors = null;
    }
    form.setFields({
      anotherPassword: anotherPasswordField,
    });
  }

  // #regionend

  /**
   * 渲染新增表单
   */
  renderCreateForm() {
    const { form, passwordTipMsg = {}, customizeForm } = this.props;
    const dateFormat = getDateFormat();
    const { idd = [], gender = [], languageMap = {} } = this.props;
    console.log(languageMap);
    return customizeForm(
      { code: 'HIAM.SUB_ACCOUND.EDIT.FORM_CREATE', form },
      <Form>
        <Row type="flex">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={
                <span>
                  {intl.get('hiam.subAccount.model.user.loginName').d('账号')}&nbsp;
                  <Tooltip
                    title={intl
                      .get('hiam.subAccount.view.message.loginName.tooltip')
                      .d('不输入账户则自动生成')}
                  >
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }
            >
              {form.getFieldDecorator('loginName', {
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                  {
                    pattern: CODE,
                    message: intl
                      .get('hzero.common.validation.code')
                      .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.realName').d('名称')}
            >
              {form.getFieldDecorator('realName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.subAccount.model.user.realName').d('名称'),
                    }),
                  },
                  {
                    max: 128,
                    message: intl.get('hzero.common.validation.max', {
                      max: 128,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.localName').d('本地名称')}
            >
              {form.getFieldDecorator('localName', {
                rules: [
                  {
                    max: 128,
                    message: intl.get('hzero.common.validation.max', {
                      max: 128,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col key="birthday" {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              key="birthday"
              label={intl.get('hiam.subAccount.model.user.birthday').d('出生日期')}
            >
              {form.getFieldDecorator(
                'birthday',
                {}
              )(<DatePicker format={dateFormat} style={{ width: '100%' }} placeholder="" />)}
            </Form.Item>
          </Col>
          <Col key="nickname" {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.nickname').d('昵称')}
            >
              {form.getFieldDecorator('nickname', {
                rules: [
                  {
                    max: 10,
                    message: intl.get('hzero.common.validation.max', {
                      max: 10,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col key="gender" {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hzero.common.gender').d('性别')}
            >
              {form.getFieldDecorator(
                'gender',
                {}
              )(
                <Select allowClear>
                  {map(gender, (item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col key="country" {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.countryId').d('国家')}
            >
              {form.getFieldDecorator(
                'countryId',
                {}
              )(
                <Lov
                  code="HPFM.COUNTRY"
                  onChange={this.changeCountryId}
                  queryParams={{ enabledFlag: 1 }}
                  // textValue={initialValue.countryName}
                  // textField="tenantName"
                  // disabled={!isCreate}
                />
              )}
            </Form.Item>
          </Col>
          <Col key="regionId" {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.regionId').d('地区')}
            >
              {form.getFieldDecorator(
                'regionId',
                {}
              )(
                <Lov
                  code="HPFM.REGION"
                  queryParams={{
                    countryId: form.getFieldValue('countryId'),
                  }}
                  // textValue={initialValue.regionName}
                  // textField="tenantName"
                  // disabled={!isCreate}
                />
              )}
            </Form.Item>
          </Col>
          <Col key="addressDetail" {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.addressDetail').d('详细地址')}
            >
              {form.getFieldDecorator('addressDetail', {
                rules: [
                  {
                    max: 50,
                    message: intl.get('hzero.common.validation.max', {
                      max: 50,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.email').d('邮箱')}
            >
              {form.getFieldDecorator('email', {
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                  {
                    max: 128,
                    message: intl.get('hzero.common.validation.max', { max: 128 }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.phone').d('手机号码')}
            >
              {form.getFieldDecorator('phone', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.subAccount.model.user.phone').d('手机号码'),
                    }),
                  },
                  {
                    pattern:
                      form.getFieldValue('internationalTelCode') === '+86'
                        ? PHONE
                        : NOT_CHINA_PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                  },
                ],
              })(
                <Input
                  addonBefore={form.getFieldDecorator('internationalTelCode', {
                    initialValue: (idd[0] && idd[0].value) || '+86',
                  })(
                    <Select onChange={this.reValidationPhone}>
                      {map(idd, (r) => (
                        <Select.Option key={r.value} value={r.value}>
                          {r.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={
                <span>
                  {intl.get('hiam.subAccount.model.user.password').d('密码')}&nbsp;
                  <Tooltip
                    title={intl
                      .get('hiam.subAccount.view.message.password.tooltip')
                      .d('不输入密码则使用默认密码')}
                  >
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }
            >
              {form.getFieldDecorator('password', {
                rules: [
                  {
                    validator: (_, value, callback) => {
                      validatePasswordRule(value, callback, {
                        ...passwordTipMsg,
                        loginName: form.getFieldValue('loginName'),
                      });
                    },
                  },
                ],
              })(
                <Input
                  type="password"
                  autocomplete="new-password"
                  onChange={this.validatePasswordRepeatForPassword}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hzero.common.date.active.from').d('有效日期从')}
            >
              {form.getFieldDecorator('startDateActive', {
                initialValue: undefined,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.date.active.from').d('有效日期从'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  allowClear={false}
                  format={dateFormat}
                  style={{ width: '100%' }}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    form.getFieldValue('endDateActive') &&
                    moment(form.getFieldValue('endDateActive')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hzero.common.date.active.to').d('有效日期至')}
            >
              {form.getFieldDecorator('endDateActive', {
                rules: [
                  {
                    type: 'object',
                    validator: this.validateEndDateActive,
                  },
                ],
              })(
                <DatePicker
                  format={dateFormat}
                  style={{ width: '100%' }}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    form.getFieldValue('startDateActive') &&
                    moment(form.getFieldValue('startDateActive')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.language').d('语言')}
            >
              {form.getFieldDecorator('language', {
                initialValue: undefined,
              })(
                <Select allowClear>
                  {map(languageMap, (item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.timeZone').d('时区')}
            >
              {form.getFieldDecorator('timeZone', {
                initialValue: undefined,
              })(
                <Lov
                  code="HIAM.TIME_ZONE"
                  // textField="tenantName"
                  // disabled={!isCreate}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 渲染编辑表单
   */
  renderEditForm() {
    const { form, initialValue = {}, customizeForm } = this.props;
    const { idd = [], gender = [], languageMap = [] } = this.props;
    const emailError = form.getFieldError('email');
    const sameEmail = initialValue.email === form.getFieldValue('email');
    const phoneError = form.getFieldError('phone');
    const samePhone = initialValue.phone === form.getFieldValue('phone');
    const dateFormat = getDateFormat();
    return customizeForm(
      { code: 'HIAM.SUB_ACCOUND.EDIT.FORM_EDIT', dataSource: initialValue, form },
      <Form>
        <Row>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={
                <span>
                  {intl.get('hiam.subAccount.model.user.loginName').d('账号')}&nbsp;
                  <Tooltip
                    title={intl
                      .get('hiam.subAccount.view.message.loginName.tooltip')
                      .d('不输入账户则自动生成')}
                  >
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }
            >
              {form.getFieldDecorator('loginName', {
                initialValue: initialValue.loginName,
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                  // {
                  //   pattern: CODE,
                  //   message: intl
                  //     .get('hzero.common.validation.code')
                  //     .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                  // },
                ],
              })(<Input disabled={initialValue.loginName !== undefined} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.realName').d('名称')}
            >
              {form.getFieldDecorator('realName', {
                initialValue: initialValue.realName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.subAccount.model.user.realName').d('名称'),
                    }),
                  },
                  {
                    max: 128,
                    message: intl.get('hzero.common.validation.max', {
                      max: 128,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.localName').d('本地名称')}
            >
              {form.getFieldDecorator('localName', {
                rules: [
                  {
                    max: 128,
                    message: intl.get('hzero.common.validation.max', {
                      max: 128,
                    }),
                  },
                ],
                initialValue: initialValue.localName,
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col key="birthday" {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              key="birthday"
              label={intl.get('hiam.subAccount.model.user.birthday').d('出生日期')}
            >
              {form.getFieldDecorator('birthday', {
                initialValue: initialValue.birthday
                  ? moment(initialValue.birthday, DEFAULT_DATE_FORMAT)
                  : undefined,
              })(<DatePicker format={dateFormat} style={{ width: '100%' }} placeholder="" />)}
            </Form.Item>
          </Col>
          <Col key="nickname" {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.nickname').d('昵称')}
            >
              {form.getFieldDecorator('nickname', {
                initialValue: initialValue.nickname,
                rules: [
                  {
                    max: 10,
                    message: intl.get('hzero.common.validation.max', {
                      max: 10,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col key="gender" {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hzero.common.gender').d('性别')}
            >
              {form.getFieldDecorator('gender', {
                initialValue: isUndefined(initialValue.gender) ? '' : `${initialValue.gender}`,
              })(
                <Select allowClear>
                  {map(gender, (item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col key="country" {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.countryId').d('国家')}
            >
              {form.getFieldDecorator('countryId', {
                initialValue: initialValue.countryId,
              })(
                <Lov
                  code="HPFM.COUNTRY"
                  onChange={this.changeCountryId}
                  textValue={initialValue.countryName}
                  queryParams={{ enabledFlag: 1 }}
                  // textField="tenantName"
                  // disabled={!isCreate}
                />
              )}
            </Form.Item>
          </Col>
          <Col key="regionId" {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              style={{ height: '39px' }}
              label={intl.get('hiam.subAccount.model.user.regionId').d('地区')}
            >
              {form.getFieldDecorator('regionId', {
                initialValue: initialValue.regionId,
              })(
                <Lov
                  code="HPFM.REGION"
                  queryParams={{
                    countryId: form.getFieldValue('countryId'),
                  }}
                  textValue={initialValue.regionName}

                  // textField="tenantName"
                  // disabled={!isCreate}
                />
              )}
            </Form.Item>
          </Col>
          <Col key="addressDetail" {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.addressDetail').d('详细地址')}
            >
              {form.getFieldDecorator('addressDetail', {
                initialValue: initialValue.addressDetail,
                rules: [
                  {
                    max: 50,
                    message: intl.get('hzero.common.validation.max', {
                      max: 50,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              hasFeedback
              help={
                // eslint-disable-next-line no-nested-ternary
                emailError
                  ? join(emailError)
                  : (sameEmail && initialValue.email && initialValue.emailCheckFlag) ||
                    !form.getFieldValue('email')
                  ? ''
                  : intl.get('hiam.subAccount.view.validation.emailNotCheck').d('邮箱未验证')
              }
              validateStatus={
                // eslint-disable-next-line no-nested-ternary
                emailError
                  ? 'error'
                  : // eslint-disable-next-line no-nested-ternary
                  sameEmail && initialValue.email && initialValue.emailCheckFlag
                  ? 'success'
                  : form.getFieldValue('email')
                  ? 'warning'
                  : undefined
              }
              label={intl.get('hiam.subAccount.model.user.email').d('邮箱')}
            >
              {form.getFieldDecorator('email', {
                initialValue: initialValue.email,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.phone').d('手机号码')}
              hasFeedback
              help={
                // eslint-disable-next-line no-nested-ternary
                phoneError
                  ? join(phoneError)
                  : initialValue.phoneCheckFlag
                  ? ''
                  : intl.get('hiam.subAccount.view.validation.phoneNotCheck').d('手机号码未验证')
              }
              validateStatus={
                // eslint-disable-next-line no-nested-ternary
                phoneError
                  ? 'error'
                  : samePhone && initialValue.phoneCheckFlag
                  ? 'success'
                  : 'warning'
              }
            >
              {form.getFieldDecorator('phone', {
                initialValue: initialValue.phone,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.subAccount.model.user.phone').d('手机号码'),
                    }),
                  },
                  {
                    pattern:
                      form.getFieldValue('internationalTelCode') === '+86'
                        ? PHONE
                        : NOT_CHINA_PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                  },
                ],
              })(
                <Input
                  addonBefore={form.getFieldDecorator('internationalTelCode', {
                    initialValue:
                      initialValue.internationalTelCode || (idd[0] && idd[0].value) || '+86',
                  })(
                    <Select onChange={this.reValidationPhone}>
                      {map(idd, (r) => (
                        <Select.Option key={r.value} value={r.value}>
                          {r.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hzero.common.date.active.from').d('有效日期从')}
            >
              {form.getFieldDecorator('startDateActive', {
                initialValue: initialValue.startDateActive && moment(initialValue.startDateActive),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hiam.subAccount.model.subAccount.startDateActive')
                        .d('有效日期从'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  allowClear={false}
                  format={dateFormat}
                  style={{ width: '100%' }}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    form.getFieldValue('endDateActive') &&
                    moment(form.getFieldValue('endDateActive')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hzero.common.date.active.to').d('有效日期至')}
            >
              {form.getFieldDecorator('endDateActive', {
                initialValue: initialValue.endDateActive && moment(initialValue.endDateActive),
              })(
                <DatePicker
                  format={dateFormat}
                  style={{ width: '100%' }}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    form.getFieldValue('startDateActive') &&
                    moment(form.getFieldValue('startDateActive')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.language').d('语言')}
            >
              {form.getFieldDecorator('language', {
                initialValue: initialValue.language,
              })(
                <Select allowClear>
                  {map(languageMap, (item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.timeZone').d('时区')}
            >
              {form.getFieldDecorator('timeZone', {
                initialValue: initialValue.timeZone,
              })(<Lov code="HIAM.TIME_ZONE" textValue={initialValue.timeZoneMeaning} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get('hiam.subAccount.model.user.enabled').d('冻结')}
            >
              {form.getFieldDecorator('enabled', {
                initialValue: !!initialValue.enabled,
              })(<Switch checkedValue={false} unCheckedValue />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 渲染表单
   * 根据 isCreate 选择 渲染不同的表单
   * @return
   */
  @Bind()
  renderForm() {
    const { isCreate } = this.props;
    if (isCreate) {
      return this.renderCreateForm();
    }
    return this.renderEditForm();
  }

  /**
   * 渲染 分配角色Table
   */
  @Bind()
  renderRoleTable() {
    const {
      dataSource = [],
      selectedRowKeys = [],
      roleTableFetchLoading,
      pagination = false,
    } = this.state;
    const paginationOptions = pagination ? { ...pagination, showQuickJumper: false } : false;
    const { initialValue = {}, isCreate, path } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRoleSelectionChange,
      getCheckboxProps: (record) => ({
        disabled: record.removableFlag === 0,
      }),
    };
    const columns = [
      {
        title: intl.get('hiam.subAccount.model.role.name').d('角色名称'),
        dataIndex: 'name',
        render: (v, record) => {
          if (record.tipMessage) {
            return (
              <>
                <span>{v}</span>
                <Tooltip title={record.tipMessage}>
                  &nbsp;
                  <Icon type="exclamation-circle-o" />
                </Tooltip>
              </>
            );
          } else {
            return v;
          }
        },
      },
      !VERSION_IS_OP && {
        title: intl.get('entity.tenant.name').d('租户名称'),
        dataIndex: 'tenantName',
        width: 250,
      },
      {
        title: intl.get('hiam.subAccount.model.role.startDateActive').d('起始时间'),
        key: 'startDateActive',
        width: 140,
        render: (_, record) => {
          const { $form } = record;
          const { getFieldDecorator } = $form;
          const dateFormat = getDateFormat();
          return (
            <Form.Item>
              {getFieldDecorator('startDateActive', {
                initialValue: record.startDateActive
                  ? moment(record.startDateActive, DEFAULT_DATE_FORMAT)
                  : undefined,
              })(
                <DatePicker
                  format={dateFormat}
                  style={{ width: '100%' }}
                  disabled={record.removableFlag === 0 || record.manageableFlag === 0}
                  placeholder={null}
                  disabledDate={(currentDate) => {
                    return (
                      $form.getFieldValue('endDateActive') &&
                      moment($form.getFieldValue('endDateActive')).isBefore(currentDate, 'day')
                    );
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('hiam.subAccount.model.role.endDateActive').d('失效时间'),
        key: 'endDateActive',
        width: 140,
        render: (_, record) => {
          const { $form } = record;
          const { getFieldDecorator } = $form;
          const dateFormat = getDateFormat();
          return (
            <Form.Item>
              {getFieldDecorator('endDateActive', {
                initialValue: record.endDateActive
                  ? moment(record.endDateActive, DEFAULT_DATE_FORMAT)
                  : undefined,
              })(
                <DatePicker
                  format={dateFormat}
                  style={{ width: '100%' }}
                  disabled={record.removableFlag === 0 || record.manageableFlag === 0}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    $form.getFieldValue('startDateActive') &&
                    moment($form.getFieldValue('startDateActive')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('hiam.subAccount.model.role.defaultRoleId').d('默认'),
        key: 'defaultRole',
        width: 100,
        render: (_, record) => {
          const { defaultRole, level } = record;
          if (level === 'organization' || level === 'org' || level === 'site') {
            return (
              <Checkbox
                checked={defaultRole}
                onClick={() => {
                  this.handleRoleDefaultChange(record);
                }}
                disabled={isCreate ? false : initialValue.userType !== 'P'}
              />
            );
          }
          return null;
        },
      },
      !isCreate && {
        key: 'operator',
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 160,
        fixed: 'right',
        render: (_, record) => {
          const operators = [
            <ButtonPermission
              type="text"
              permissionList={[
                {
                  code: `${path}.button.assignPermissions`,
                  type: 'button',
                  meaning: '角色管理-排除权限',
                },
              ]}
              onClick={() => this.handleAssignPermissions(record)}
              disabled={record.removableFlag === 0}
            >
              {intl.get(`hiam.subAccount.model.role.button.assignPermissions`).d('排除权限')}
            </ButtonPermission>,
          ];
          return operators;
        },
      },
    ].filter(Boolean);
    return (
      <EditTable
        bordered
        rowKey="id"
        onChange={this.handleRoleTableChange}
        loading={roleTableFetchLoading}
        rowSelection={rowSelection}
        dataSource={dataSource}
        pagination={paginationOptions}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }

  @Bind()
  handleAssignPermissions(record = {}) {
    // const { assignPerVisible } = this.state;
    // this.setState({
    //   assignPerVisible: !assignPerVisible,
    //   stateRecord: record,
    // });
    // const {
    //   stateRecord,
    // } = this.state;
    const { path, fetchPermission, onShield, memberId } = this.props;
    const permissionModalProps = {
      path,
      memberId,
      handleClose: this.handleAssignPermissions,
      fetchPermissionTree: fetchPermission,
      onShield,
      roleId: record.id,
    };
    Modal.open({
      drawer: true,
      style: { width: 800 },
      title: intl.get('hiam.roleManagement.view.button.assignPermission').d('分配权限'),
      children: <PermissionModal {...permissionModalProps} />,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }

  render() {
    const { selectedRowKeys } = this.state;
    const {
      path,
      isAdmin,
      isCreate,
      initialValue = {},
      deleteRolesLoading = false,
      currentUser: { currentRoleCode = '' },
    } = this.props;
    return (
      <>
        <Form style={{ overflowX: 'hidden' }}>
          {this.renderForm()}
          {
            // eslint-disable-next-line no-nested-ternary
            currentRoleCode === 'role/organization/default/administrator' ? (
              <>
                <Row style={{ textAlign: 'right' }}>
                  <Col span={23}>
                    <Form.Item>
                      <ButtonPermission
                        permissionList={[
                          {
                            code: `${path}.button.deleteEdit`,
                            type: 'button',
                            meaning: '子账户管理-删除账号编辑',
                          },
                        ]}
                        style={
                          initialValue.userType === 'P' || isCreate
                            ? { marginRight: 8 }
                            : { display: 'none' }
                        }
                        onClick={this.handleRoleRemoveBtnClick}
                        disabled={selectedRowKeys.length === 0}
                        loading={deleteRolesLoading}
                      >
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </ButtonPermission>
                      <ButtonPermission
                        permissionList={[
                          {
                            code: `${path}.button.createEdit`,
                            type: 'button',
                            meaning: '子账户管理-新建账号编辑',
                          },
                        ]}
                        type="primary"
                        onClick={() => this.handleRoleAddBtnClick()}
                        style={
                          initialValue.userType !== 'P' && !isCreate
                            ? { display: 'none' }
                            : { marginRight: 10 }
                        }
                      >
                        {intl.get('hzero.common.button.create').d('新建')}
                      </ButtonPermission>
                    </Form.Item>
                  </Col>
                  <Col span={1} />
                </Row>
                <Row type="flex">
                  <Col span={3} />
                  <Col span={20} className={styles['rule-table']}>
                    {this.renderRoleTable()}
                  </Col>
                </Row>
              </>
            ) : isAdmin ? (
              <Row>
                <Col>
                  <Form.Item
                    label={intl.get('hiam.subAccount.view.message.title.role').d('角色')}
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 20 }}
                    className={styles['rule-table']}
                  >
                    {this.renderRoleTable()}
                  </Form.Item>
                </Col>
              </Row>
            ) : (
              <>
                <Row style={{ textAlign: 'right' }}>
                  <Col span={23}>
                    <Form.Item>
                      <ButtonPermission
                        permissionList={[
                          {
                            code: `${path}.button.deleteEdit`,
                            type: 'button',
                            meaning: '子账户管理-删除账号编辑',
                          },
                        ]}
                        style={
                          initialValue.userType === 'P' || isCreate
                            ? { marginRight: 8 }
                            : { display: 'none' }
                        }
                        onClick={this.handleRoleRemoveBtnClick}
                        disabled={selectedRowKeys.length === 0}
                      >
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </ButtonPermission>
                      <ButtonPermission
                        permissionList={[
                          {
                            code: `${path}.button.createEdit`,
                            type: 'button',
                            meaning: '子账户管理-新建账号编辑',
                          },
                        ]}
                        type="primary"
                        onClick={() => this.handleRoleAddBtnClick()}
                        style={
                          initialValue.userType !== 'P' && !isCreate
                            ? { display: 'none' }
                            : { marginRight: 10 }
                        }
                      >
                        {intl.get('hzero.common.button.create').d('新建')}
                      </ButtonPermission>
                    </Form.Item>
                  </Col>
                  <Col span={1} />
                </Row>
                <Row type="flex">
                  <Col span={3} />
                  <Col span={20} className={styles['rule-table']}>
                    {this.renderRoleTable()}
                  </Col>
                </Row>
              </>
            )
          }
        </Form>
      </>
    );
  }
}
