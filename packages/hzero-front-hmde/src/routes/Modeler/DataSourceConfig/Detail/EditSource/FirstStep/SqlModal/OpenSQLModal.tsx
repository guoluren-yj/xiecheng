import React from 'react';
import { DataSet, Form, TextArea } from 'choerodon-ui/pro';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import styles from './sqlModal.less';

const variableData = [
  [
    { value: 'userId', meaning: '用户ID', type: 'Long' },
    { value: 'realName', meaning: '用户真实名称', type: 'String' },
    { value: 'email', meaning: '用户邮箱', type: 'String' },
  ],
  [
    { value: 'timeZone', meaning: '用户当前使用时区', type: 'String' },
    { value: 'language', meaning: '用户当前使用语言', type: 'String' },
    { value: 'userType', meaning: '用户类型, PC端/APP端', type: 'String' },
  ],
  [
    { value: 'roleId', meaning: '当前角色Id', type: 'Long' },
    { value: 'roleAssignLevel', meaning: '当前角色的分配层级', type: 'String' },
    { value: 'roleAssignValue', meaning: '当前角色的分配层级值', type: 'Long' },
  ],
  [
    { value: 'roleMergeFlag', meaning: '角色合并标记', type: 'Boolean' },
    { value: 'tenantId', meaning: '当前租户ID', type: 'Long' },
    { value: 'tenantNum', meaning: '当前租户编码', type: 'String' },
  ],
  [
    { value: 'imageUrl', meaning: '用户头像地址', type: 'String' },
    { value: 'organizationId', meaning: '所属租户ID', type: 'Long' },
    { value: 'isAdmin', meaning: '是否为超级管理员账号', type: 'Boolean' },
  ],
  [
    { value: 'clientId', meaning: '关联OAuth客户端ID', type: 'Long' },
    { value: 'clientName', meaning: '关联OAuth客户端名称', type: 'String' },
    { value: '', meaning: '', type: '' },
  ],
];

const SqlDataSet = () =>
  ({
    fields: [
      {
        name: 'sql',
        type: 'string',
        required: true,
      },
    ],
  } as DataSetProps);

const SqlForm = ({ dataSet }: { dataSet: DataSet }) => (
  <div className={styles['sql-contain']}>
    <div className={styles['info-tip']}>请输入自定义sql表达式</div>
    <Form
      dataSet={dataSet}
      // labelLayout="vertical"
      // columns={1}
      className={styles['form-style']}
    >
      <TextArea name="sql" style={{ height: '150px' }} />
    </Form>
    <div className={styles['operate-explain']}>
      <p>1. 动态SQL 作为一个字段的条件查询，可嵌套SQL。</p>
      <p>
        2. 支持动态参数 #&#123;&#125;(参数必须在CustomUserDetails中，参数形式为 userInfo.xxx)
        示例：select a.columnA from tableA a where a.columnB = #&#123;userInfo.userId&#125;。
      </p>
      <p>3. 目前支持的 userDetail 的可使用变量列举如下:</p>
      <div className={styles['variable-info']}>
        <table>
          <thead>
            <tr>
              <th>变量名称</th>
              <th>变量含义</th>
              <th>变量名称</th>
              <th>变量含义</th>
              <th>变量名称</th>
              <th>变量含义</th>
            </tr>
          </thead>
          <tbody>
            {variableData.map((ele) => (
              <tr style={{ marginBottom: '8px' }}>
                {ele.map((item) => (
                  <>
                    <td>{item.value}</td>
                    <td>{item.meaning}</td>
                  </>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export { SqlDataSet, SqlForm };
