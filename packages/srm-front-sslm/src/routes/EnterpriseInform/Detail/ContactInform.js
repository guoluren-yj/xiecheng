/**
 * ContactInform - 联系人信息
 * @date: 2019-10-31
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { isNumber, sum, isFunction, isEmpty } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Input, Select, Form, Button } from 'hzero-ui';

import intl from 'utils/intl';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import { yesOrNoRender } from 'utils/renderer';

import GlobalPhone from '@/routes/components/GlobalPhone';
import { formatInternationalTel } from '@/routes/components/utils';

const FormItem = Form.Item;
const { Option } = Select;

@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  queryLoading: loading.effects[`enterpriseInform/queryPlatformContact`],
  saveLoading:
    loading.effects[`enterpriseInform/savePlatformContact`] ||
    loading.effects[`enterpriseInform/queryPlatformContact`],
}))
@Form.create({ fieldNameProp: null })
export default class ontactInform extends Component {
  constructor(props) {
    super(props);
    const { supplierFlag = 1 } = this.props;
    // 当supplierFlag为0 代表是企业信息变更，并且对应变更采购方的值为空，则走平台接口，无需更换主键ID
    this.defaultRowKey = supplierFlag === 0 ? 'comContactsReqId' : 'contactReqId';
  }

  state = {
    platformContactList: [],
  };

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handlePlatformContact();
  }

  /**
   * 查询平台级联系人
   */
  @Bind()
  handlePlatformContact() {
    const {
      dispatch,
      changeReqId,
      companyId,
      supplierCompanyId,
      supplierFlag = 1,
      source = '',
      customizeUnitCode,
      customizeTenantId = null,
    } = this.props;
    dispatch({
      type: 'enterpriseInform/queryPlatformContact',
      payload: {
        changeReqId,
        companyId,
        supplierCompanyId,
        supplierFlag,
        dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
        customizeUnitCode,
        customizeTenantId,
        desensitize: false,
      },
    }).then(res => {
      if (res) {
        this.setState({ platformContactList: res });
      }
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const { platformContactList } = this.state;
    const { partnerTenantId = '-1' } = this.props;
    const hasDefaultFlag = isEmpty(platformContactList);
    const newLine =
      partnerTenantId !== '-1'
        ? {
            _status: 'create',
            [this.defaultRowKey]: uuidv4(),
            tenantId: partnerTenantId,
            defaultFlag: hasDefaultFlag ? 1 : 0,
          }
        : {
            _status: 'create',
            [this.defaultRowKey]: uuidv4(),
            defaultFlag: hasDefaultFlag ? 1 : 0,
          };
    this.setState({
      platformContactList: [newLine, ...platformContactList],
    });
  }

  /**
   * 清除
   */
  @Bind()
  handleClean(record) {
    const { platformContactList } = this.state;
    const newPlatformContactList = platformContactList.filter(
      n => n[this.defaultRowKey] !== record[this.defaultRowKey]
    );
    this.setState({ platformContactList: newPlatformContactList });
  }

  /**
   * 编辑/取消
   */
  @Bind()
  handleEdit(flag, record) {
    const { platformContactList } = this.state;
    const newPlatformContactList = platformContactList.map(item => {
      if (item[this.defaultRowKey] === record[this.defaultRowKey]) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    this.setState({ platformContactList: newPlatformContactList });
  }

  /**
   * 校验数据
   */
  @Bind()
  checkData() {
    const { platformContactList } = this.state;
    const tableValues = getEditTableData(platformContactList, [this.defaultRowKey]);
    const isEditing = !!platformContactList.find(
      d => d._status === 'create' || d._status === 'update'
    );

    if (isEditing) {
      if (Array.isArray(tableValues) && tableValues.length !== 0) {
        return tableValues;
      } else {
        notification.warning({
          message: intl.get('sslm.common.view.message.contactRequiredMsg').d('联系人信息填写有误'),
        });
        return false;
      }
    } else {
      return [];
    }
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dispatch, changeReqId, companyId, source = '', supplierFlag = 1 } = this.props;
    const comContactsReqs = this.checkData();

    if (comContactsReqs) {
      dispatch({
        type: 'enterpriseInform/savePlatformContact',
        payload: {
          supplierFlag,
          [supplierFlag === 0 ? 'comContactsReqs' : 'supContactsReqs']: comContactsReqs,
          changeReqId,
          companyId,
          dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
          desensitize: false,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.handlePlatformContact();
        }
      });
    }
  }

  // @Bind()
  // handleSelectChange(selectedRowKeys) {
  //   this.setState({ selectedRowKeys });
  // }

  render() {
    // const { selectedRowKeys } = this.state;
    const {
      queryLoading,
      changFlag,
      pubEdit,
      code,
      customizeTable,
      customizeUnitCode,
      supplierFlag = 1,
      saveLoading,
      savePermissionFlag = true,
      changeLevel,
    } = this.props;
    const { platformContactList } = this.state;
    // const rowSelection = {
    //   selectedRowKeys,
    //   onChange: this.handleSelectChange,
    // };
    const columns = [
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.name').d('姓名'),
        dataIndex: 'name',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('name', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.enterpriseInform.view.model.contactPerson.name')
                        .d('姓名'),
                    }),
                  },
                ],
              })(<Input disabled={changFlag} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      ...(changeLevel === 'PLATFORM'
        ? []
        : [
            {
              title: intl.get('sslm.enterpriseInform.view.model.contactPerson.gender').d('性别'),
              dataIndex: 'gender',
              width: 120,
              render: (val, record) =>
                ['create', 'update'].includes(record._status) ? (
                  <FormItem>
                    {record.$form.getFieldDecorator('gender', {
                      initialValue: isNaN(record.gender) ? undefined : `${record.gender}`,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('sslm.enterpriseInform.view.model.contactPerson.gender')
                              .d('性别'),
                          }),
                        },
                      ],
                    })(
                      <Select disabled={changFlag} style={{ width: '100%' }}>
                        {code.gender &&
                          code.gender.map(n => <Option value={n.value}>{n.meaning}</Option>)}
                      </Select>
                    )}
                  </FormItem>
                ) : (
                  record.genderMeaning
                ),
            },
          ]),
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.mail').d('邮箱'),
        dataIndex: 'mail',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('mail', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.enterpriseInform.view.model.contactPerson.mail')
                        .d('邮箱'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<Input disabled={changFlag} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.mobilephone').d('手机号码'),
        dataIndex: 'mobilephone',
        width: 300,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('mobilephone', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.enterpriseInform.view.model.contactPerson.mobilephone')
                        .d('手机号码'),
                    }),
                  },
                  {
                    pattern:
                      record.$form.getFieldValue('internationalTelCode') === '+86'
                        ? PHONE
                        : NOT_CHINA_PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                  },
                ],
              })(
                <GlobalPhone
                  form={record.$form}
                  disabled={changFlag}
                  phoneField="mobilephone"
                  telCodeField="internationalTelCode"
                  initialValue={record.internationalTelCode}
                />
              )}
            </FormItem>
          ) : (
            formatInternationalTel(record.internationalTelMeaning, val)
          ),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.department').d('部门'),
        dataIndex: 'department',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('department', {
                initialValue: val,
              })(<Input disabled={changFlag} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.position').d('职位'),
        dataIndex: 'position',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('position', {
                initialValue: val,
              })(<Input disabled={changFlag} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.telephone').d('固定电话'),
        dataIndex: 'telephone',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('telephone', {
                initialValue: val,
              })(<Input disabled={changFlag} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.description').d('备注'),
        dataIndex: 'description',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('description', {
                initialValue: val,
              })(<Input disabled={changFlag} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl
          .get('sslm.enterpriseInform.view.model.contactPerson.defaultFlag')
          .d('默认联系人'),
        dataIndex: 'defaultFlag',
        width: 80,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('defaultFlag', {
                initialValue: val || 0,
              })(<Checkbox disabled={changFlag} />)}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.enabledFlag').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('enabledFlag', {
                initialValue: val === 0 ? 0 : 1,
              })(<Checkbox disabled={changFlag} />)}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 100,
        render: (_, record) => (
          <Fragment>
            {record._status === 'create' && (
              <a disabled={changFlag} onClick={() => this.handleClean(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            )}
            {record._status === 'update' && (
              <a onClick={() => this.handleEdit(false, record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record._status !== 'create' && record._status !== 'update' && (
              <a
                disabled={pubEdit ? !pubEdit : changFlag || !savePermissionFlag}
                onClick={() => this.handleEdit(true, record)}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </Fragment>
        ),
      },
    ];

    if (supplierFlag === 1) {
      columns.splice(6, 0, {
        title: intl
          .get('sslm.enterpriseInform.view.model.contactPerson.contactType')
          .d('联系人类型'),
        dataIndex: 'contactTypeMeaning',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('contactType', {
                initialValue: record.contactType,
              })(
                <Select disabled={changFlag} style={{ width: '100%' }}>
                  {code.contactType &&
                    code.contactType.map(n => <Option value={n.value}>{n.meaning}</Option>)}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      });
    }

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));

    return (
      <Fragment>
        <div
          style={{
            textAlign: 'right',
            paddingBottom: 16,
            display: changFlag || !savePermissionFlag ? 'none' : 'block',
          }}
        >
          <Button onClick={this.handleSave} loading={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            type="primary"
            style={{ marginLeft: 8 }}
            onClick={this.handleAdd}
            loading={saveLoading}
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
        </div>
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: customizeUnitCode,
              clearCache: (a, b, cb) => {
                if (a !== b) cb(a);
              },
              useNewValid: true,
            },
            <EditTable
              bordered
              rowKey={this.defaultRowKey}
              scroll={{ x: scrollX }}
              columns={columns}
              // rowSelection={rowSelection}
              dataSource={platformContactList}
              pagination={false}
              loading={queryLoading}
            />
          )
        ) : (
          <EditTable
            bordered
            rowKey={this.defaultRowKey}
            scroll={{ x: scrollX }}
            columns={columns}
            // rowSelection={rowSelection}
            dataSource={platformContactList}
            pagination={false}
            loading={queryLoading}
          />
        )}
      </Fragment>
    );
  }
}
