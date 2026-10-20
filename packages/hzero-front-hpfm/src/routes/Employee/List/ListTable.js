import React, { PureComponent } from 'react';
import { Input, Form, Select } from 'hzero-ui';
import classNames from 'classnames';
import { map } from 'lodash';

import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';

import { Button as PermissionButton } from 'components/Permission';

import { enableRender } from 'utils/renderer';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
// import { withTableFlexColumns, getFlexFormItemComponent, withListDataSourceFlex } from '@/components/FlexFields/utils';
import styles from './index.less';

/**
 * 员工定义-数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onClean - 清除新增员工行
 * @reactProps {Function} onEdit - 编辑员工信息
 * @reactProps {Function} onSearch - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class ListTable extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   *
   * 区号改变 需要 重置手机号的校验状态
   */
  reValidationPhone = (value, record) => {
    const prevInternationalTelCode = record.$form.getFieldValue('internationalTelCode');
    if (value === '+86' || prevInternationalTelCode === '+86') {
      // 只要 +86 出现在 中间态 就需要重新手动校验 phone
      const curPhone = record.$form.getFieldValue('mobile');
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
              name: intl.get('hzero.common.cellphone').d('手机号'),
            })
          ),
        ];
      }
      record.$form.setFields({
        mobile: {
          value: curPhone,
          errors,
        },
      });
    }
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource,
      pagination,
      onSearch,
      onClean,
      onEdit,
      employeeStatus = [],
      employeeGender = [],
      customizeTable,
      idd,
      // flexFieldsTriggers = [],
    } = this.props;
    // const flexFieldsColumns = getFlexFieldsTableColumns(flexFieldsTriggers); // .map(n => ({ ...n, render: (val, record) => {} }));
    // flexFieldsColumns[0] = { title: 'test', width: 100, dataIndex: 'attribute1', fieldType: 'INPUT', seq: 2 };
    const columns = [
      {
        title: intl.get('entity.employee.code').d('员工编码'),
        dataIndex: 'employeeNum',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`employeeNum`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.employee.code').d('员工编码'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                  {
                    pattern: /^[a-zA-Z0-9][a-zA-Z0-9_./-]*$/,
                    message: intl
                      .get('hzero.common.validation.newCodeUpper')
                      .d('大小写字母及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                  },
                ],
              })(<Input trim inputChinese={false} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('entity.employee.name').d('员工姓名'),
        dataIndex: 'name',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`name`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.employee.name').d('员工姓名'),
                    }),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hpfm.employee.model.employee.superiorEmployeeNum').d('员工上级编码'),
        dataIndex: 'superiorEmployeeNum',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`superiorEmployeeId`)(
                <Lov
                  code="LOV_EMPLOYEE"
                  queryParams={{ tenantId: getCurrentOrganizationId() }}
                  lovOptions={{ displayField: 'employeeNum', valueField: 'employeeId' }}
                  onChange={(_, value) => {
                    const { employeeName } = value || {};
                    record.$form.setFieldsValue({
                      superiorEmployeeName: employeeName,
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hpfm.employee.model.employee.superiorEmployeeName').d('员工上级名称'),
        dataIndex: 'superiorEmployeeName',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`superiorEmployeeName`, {
                rules: [
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hpfm.employee.model.employee.gender').d('性别'),
        dataIndex: 'gender',
        width: 150,
        render: (val, record) => {
          return record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`gender`, {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.employee.gender').d('性别'),
                    }),
                  },
                ],
              })(
                <Select className={styles['full-width']} allowClear>
                  {employeeGender.map((item) => {
                    return (
                      <Select.Option key={item.value} value={Number(item.value)}>
                        {item.meaning}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          ) : (
            record.genderMeaning
          );
        },
      },
      {
        title: intl.get('hpfm.employee.model.employee.quickIndex').d('快速索引'),
        dataIndex: 'quickIndex',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`quickIndex`, {
                rules: [
                  {
                    max: 240,
                    message: intl.get('hzero.common.validation.max', {
                      max: 240,
                    }),
                  },
                  {
                    pattern: /^[a-zA-Z0-9]*$/,
                    message: intl
                      .get('hpfm.employee.view.validation.quickIndex')
                      .d('快速索引只能由字母和数字组成'),
                  },
                ],
              })(<Input trim typeCase="upper" inputChinese={false} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hpfm.employee.model.employee.phoneticize').d('拼音'),
        dataIndex: 'phoneticize',
        width: 200,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`phoneticize`, {
                rules: [
                  {
                    max: 240,
                    message: intl.get('hzero.common.validation.max', {
                      max: 240,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.email').d('邮箱'),
        dataIndex: 'email',
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`email`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.email').d('邮箱'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            record?.emailDesensitize || val
          ),
      },
      {
        title: intl.get('hzero.common.cellphone').d('手机号'),
        dataIndex: 'mobile',
        width: 250,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`mobile`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.cellphone').d('手机号'),
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
                <Input
                  addonBefore={record.$form.getFieldDecorator('internationalTelCode', {
                    initialValue: (idd[0] && idd[0].value) || '+86',
                  })(
                    <Select onChange={(value) => this.reValidationPhone(value, record)}>
                      {map(idd, (r) => {
                        return (
                          <Select.Option key={r.value} value={r.value}>
                            {r.meaning}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                />
              )}
            </Form.Item>
          ) : record.internationalTelMeaning && (record.mobileDesensitize || val) ? (
            `${record.internationalTelMeaning} |${record.mobileDesensitize || val}`
          ) : (
            record.mobileDesensitize || val
          ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: val,
                valuePropName: 'checked',
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: intl.get('hpfm.employee.model.employee.unitCompanyName').d('所属公司'),
        dataIndex: 'unitCompanyName',
        width: 120,
      },
      {
        title: intl.get('hpfm.employee.model.employee.unitName').d('所属部门'),
        dataIndex: 'unitName',
        width: 120,
        // render: (val, record) =>
        //   record._status === 'create' ? (
        //     <Form.Item>
        //       {record.$form.getFieldDecorator(`positionUnitId`)(
        //         <Lov
        //           code="SPRM.USER_DEPARTMENT"
        //           queryParams={{ tenantId: getCurrentOrganizationId() }}
        //           // lovOptions={{ displayField: 'employeeNum', valueField: 'employeeId' }}
        //           // onChange={(_, value) => {
        //           //   const { employeeName } = value;
        //           //   record.$form.setFieldsValue({
        //           //     superiorEmployeeName: employeeName,
        //           //   });
        //           // }}
        //         />
        //       )}
        //     </Form.Item>
        //   ) : (
        //     val
        //   ),
      },
      {
        title: intl.get('hpfm.employee.model.employee.status').d('员工状态'),
        dataIndex: 'status',
        width: 150,
        render: (val, record) => {
          return record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`status`, {
                initialValue: val,
              })(
                <Select className={styles['full-width']} allowClear>
                  {employeeStatus.map((item) => {
                    return (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          ) : (
            record.statusMeaning
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 120,
        fixed: 'right',
        render: (val, record) =>
          record._status === 'create' ? (
            <PermissionButton
              type="c7n-pro"
              color="primary"
              funcType="flat"
              onClick={() => onClean(record)}
              permissionList={[
                {
                  code: `hzero.organization.staff.hpfm.hr.staff.list.button.clean`,
                  type: 'button',
                  meaning: '清除',
                },
              ]}
            >
              {intl.get('hzero.common.button.clean').d('清除')}
            </PermissionButton>
          ) : (
            <PermissionButton
              type="c7n-pro"
              color="primary"
              funcType="flat"
              onClick={() => onEdit(record.employeeId, record.employeeNum)}
              permissionList={[
                {
                  code: `hzero.organization.staff.hpfm.hr.staff.list.button.edit`,
                  type: 'button',
                  meaning: '编辑',
                },
              ]}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </PermissionButton>
          ),
      },
    ];

    return customizeTable(
      { code: 'HPFM.EMPLOYEE_DEFINITION.LINE.GRID' },
      <EditTable
        bordered
        scroll={{ x: tableScrollWidth(columns, 200) }}
        rowKey="employeeId"
        loading={loading}
        className={classNames(styles['hpfm-hr-list'])}
        columns={columns} // withTableFlexColumns(columns)(flexFieldsTriggers, flexFieldsColumns => flexFieldsColumns.map(n => ({ ...n, render: (val, record) => record._status === 'create' ? getFlexFormItemComponent(n.fieldType, record.$form)({ fieldName: `FLEX_${n.dataIndex}`, fieldDecoratorOptions: { initialValue: val, ...n.fieldDecoratorOptions }, fieldItemProps: n.fieldItemProps }) : val })))}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onSearch(page)}
      />
    );
  }
}
