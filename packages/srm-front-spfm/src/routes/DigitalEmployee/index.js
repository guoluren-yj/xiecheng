/**
 * digitalEmployee - 数字员工管理
 * @date: 2026-05-19
 * @version: 0.0.1
 */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  DataSet,
  Button,
  Form,
  TextField,
  Select,
  IntlField,
  TextArea,
  Modal,
  NumberField,
  CheckBox,
  TimePicker,
  DateTimePicker,
  Lov,
  Icon,
  Dropdown,
  Menu,
  Spin,
  Output,
} from 'choerodon-ui/pro';
import { pick } from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import { Steps } from 'choerodon-ui';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { CODE_UPPER } from 'utils/regExp';
import notification from 'utils/notification';
import { SRM_PLATFORM } from '_utils/config';
import { isTenantRoleLevel, getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';
import { Header, Content } from 'components/Page';
import iconPrAnalyze from '@/assets/digitalEmployee/pr-analyze.png';
import iconPrice from '@/assets/digitalEmployee/price.png';
import iconContract from '@/assets/digitalEmployee/contract.png';
import iconSupplierManagement from '@/assets/digitalEmployee/supplier-management.png';
import iconAccountReconciliation from '@/assets/digitalEmployee/account-reconciliation.png';
import iconBill from '@/assets/digitalEmployee/bill.png';
import iconOrderFollowing from '@/assets/digitalEmployee/order-following.png';
import iconOrderTransfer from '@/assets/digitalEmployee/order-transfer.png';
import {
  saveDigitalEmployee,
  fetchDigitalEmployeeDetail,
  deleteDigitalEmployee,
} from '@/services/digitalEmployeeService';
import AdminLovContent, { transAdminItem } from './AdminLov';
import QueryBarMore from '../../components/QueryBarMore';
import styles from './index.less';

const { Step } = Steps;

const ICON_OPTIONS = [
  { value: 'pr-analyze', image: iconPrAnalyze },
  { value: 'price', image: iconPrice },
  { value: 'contract', image: iconContract },
  { value: 'supplier-management', image: iconSupplierManagement },
  { value: 'account-reconciliation', image: iconAccountReconciliation },
  { value: 'bill', image: iconBill },
  { value: 'order-following', image: iconOrderFollowing },
  { value: 'order-transfer', image: iconOrderTransfer },
];

export const getDigitalEmployeeIcon = icon => {
  const item = ICON_OPTIONS.find(f => f.value === icon);
  if (item) {
    return item.image;
  }
};

const HM_FORMAT = 'HH:mm';
const YMD_HM_FORMAT = 'YYYY-MM-DD HH:mm';

function isValidJSONObject(str) {
  try {
    const parsed = JSON.parse(str);
    // 要求解析后必须是对象或数组，而不是字符串、数字等
    return parsed !== null && typeof parsed === 'object';
  } catch (e) {
    return false;
  }
}

function Card(props) {
  const { children, title, style = {}, cardBodyStyle = {} } = props;
  return (
    <div className={styles['card-container']} style={style}>
      <div className={styles['card-header']}>
        <div className={styles['card-title']}>{title}</div>
      </div>
      <div className={styles['card-body']} style={cardBodyStyle}>
        {children}
      </div>
    </div>
  );
}

// ====== 触发方式表单（含动态执行时间） ======

const ExecutionTimeForm = observer(({ formDs, readOnly }) => {
  const record = formDs.current;
  const frequency = record ? record.get('scheduleFrequency') : undefined;
  const scheduledTriggerFlag = record ? record.get('scheduledTriggerFlag') : undefined;

  // 根据频率计算执行时间占用的表单元素个数
  const execElementCount =
    !frequency || frequency === 'MANUAL'
      ? 0
      : frequency === 'WEEKLY' || frequency === 'MONTHLY'
      ? 2
      : 1;
  // 入参前需要补的 span 占位个数（保证每行4列布局不乱）
  const spanCount = scheduledTriggerFlag ? Math.max(0, 2 - execElementCount) : 3;

  const renderFormField = (name, defaultRender) => {
    return readOnly ? <Output name={name} /> : defaultRender();
  };

  /**
   * 根据频率渲染执行时间字段
   */
  const renderExecutionTime = () => {
    switch (frequency) {
      case 'HALF_HOUR':
      case 'HOURLY':
        return renderFormField('executionTime', () => (
          <NumberField
            name="executionTime"
            placeholder={intl
              .get('spfm.digitalEmployee.view.placeholder.minute')
              .d('请选择时间（分）')}
          />
        ));
      case 'WEEKLY':
      case 'MONTHLY':
        return (
          <>
            {renderFormField('fixedValues', () => (
              <Select name="fixedValues" />
            ))}
            {renderFormField('executionTime', () => (
              <TimePicker
                name="executionTime"
                placeholder={intl
                  .get('spfm.digitalEmployee.view.placeholder.hourMinute')
                  .d('请选择时间（时分）')}
              />
            ))}
          </>
        );
      case 'DAILY':
        return renderFormField('executionTime', () => (
          <TimePicker
            name="executionTime"
            placeholder={intl
              .get('spfm.digitalEmployee.view.placeholder.hourMinute')
              .d('请选择时间（时分）')}
          />
        ));
      case 'ONCE':
        return renderFormField('executionTime', () => (
          <DateTimePicker
            name="executionTime"
            placeholder={intl.get('spfm.digitalEmployee.view.placeholder.time').d('请选择时间')}
          />
        ));
      default:
        return null;
    }
  };

  const handleOpenAdmin = useCallback(() => {
    const adminList = record ? record.get('adminList') : [];
    Modal.open({
      key: 'admin-lov-modal',
      title: intl.get('spfm.digitalEmployee.model.admin').d('关联管理员'),
      style: { width: 800 },
      border: true,
      destroyOnClose: true,
      closable: true,
      children: (
        <AdminLovContent
          defaultSelected={adminList}
          onOk={newSelected => {
            if (record) {
              record.set('adminList', newSelected);
            }
          }}
        />
      ),
    });
  }, [record]);

  return (
    <Form
      dataSet={formDs}
      columns={4}
      labelLayout={readOnly ? 'vertical' : 'float'}
      className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
    >
      {renderFormField('scheduledTriggerFlag', () => (
        <CheckBox
          name="scheduledTriggerFlag"
          colSpan={1}
          onChange={value => {
            if (!value && record) {
              record.set('scheduleFrequency', null);
              record.set('fixedValues', null);
              record.set('executionTime', null);
            }
          }}
        />
      ))}
      {renderFormField('manualTriggerFlag', () => (
        <CheckBox name="manualTriggerFlag" colSpan={1} />
      ))}
      <span colSpan={2} />
      {scheduledTriggerFlag &&
        renderFormField('scheduleFrequency', () => (
          <Select
            name="scheduleFrequency"
            colSpan={1}
            onChange={() => {
              if (record) {
                if (record.get('fixedValues')) {
                  record.set('fixedValues', null);
                }
                if (record.get('executionTime')) {
                  record.set('executionTime', null);
                }
              }
            }}
          />
        ))}
      {frequency && frequency !== 'MANUAL' && renderExecutionTime()}
      {renderFormField('adminList', () => (
        <Lov
          name="adminList"
          colSpan={1}
          maxTagCount={1}
          suffix={
            <span>
              <Icon type="search" onClick={handleOpenAdmin} />
            </span>
          }
        />
      ))}
      {spanCount > 0 && <span colSpan={spanCount} />}
      {renderFormField('inputParams', () => (
        <TextArea name="inputParams" colSpan={2} resize="vertical" />
      ))}
    </Form>
  );
});

// ====== Modal 内容组件 ======

function CreateDigitalEmployeeContent({ modal, status, id, onRefresh }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const readOnly = status === 'view';
  const isTenant = isTenantRoleLevel();

  const stepTitles = [
    intl.get('spfm.digitalEmployee.step.basicInfo').d('基础信息'),
    intl.get('spfm.digitalEmployee.step.triggerMethod').d('触发方式'),
  ];

  const formDs = useMemo(
    () =>
      new DataSet({
        primaryKey: 'digitalEmployeeInfoId',
        autoCreate: !id,
        dataToJSON: 'dirty',
        fields: [
          // 第一步：基础信息
          {
            name: 'code',
            label: intl.get('spfm.digitalEmployee.model.applicationCode').d('应用编码'),
            required: true,
            type: 'string',
            pattern: CODE_UPPER,
            defaultValidationMessages: {
              patternMismatch: intl
                .get('hzero.common.validation.codeUpper')
                .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
            },
            disabled: status === 'edit',
          },
          {
            name: 'name',
            label: intl.get('spfm.digitalEmployee.model.applicationName').d('应用名称'),
            type: 'intl',
            required: true,
          },
          {
            name: 'icon',
            label: intl.get('spfm.digitalEmployee.model.applicationIcon').d('应用图标'),
            required: true,
            type: 'string',
          },
          {
            name: 'systemUser',
            label: intl.get('spfm.digitalEmployee.model.systemUser').d('系统用户'),
            type: 'object',
            ignore: 'always',
            required: isTenant,
            lovCode: isTenant ? 'HIAM.TENANT.USER' : 'HIAM.USER',
            textField: 'realName',
            valueField: 'id',
            disabled: !isTenant,
          },
          {
            name: 'systemUserId',
            type: 'string',
            bind: 'systemUser.id',
          },
          {
            name: 'systemUserName',
            type: 'string',
            bind: 'systemUser.realName',
          },
          {
            name: 'agentInfo',
            type: 'object',
            label: intl.get('spfm.digitalEmployee.model.agent').d('agent'),
            required: true,
            lovCode: isTenant ? 'SPFM.DIGITAL_EMPLOYEE_AGENT' : 'SPFM.SITE_DIGITAL_EMPLOYEE_AGENT',
            textField: 'appName',
            valueField: 'appCode',
            optionsProps: {
              paging: false,
            },
          },
          {
            name: 'description',
            label: intl.get('spfm.digitalEmployee.model.description').d('应用说明'),
            type: 'intl',
          },
          // 第二步：触发方式
          {
            name: 'scheduledTriggerFlag',
            label: intl.get('spfm.digitalEmployee.model.timedTrigger').d('定时触发'),
            type: 'boolean',
            trueValue: 1,
            falseValue: 0,
            defaultValue: 0,
          },
          {
            name: 'manualTriggerFlag',
            label: intl.get('spfm.digitalEmployee.model.manualTrigger').d('支持管理员工手工触发'),
            type: 'boolean',
            trueValue: 1,
            falseValue: 0,
            defaultValue: 0,
          },
          {
            name: 'scheduleFrequency',
            label: intl.get('spfm.digitalEmployee.model.frequency').d('频率'),
            required: true,
            type: 'string',
            lookupCode: 'SPFM.AGENT_SCHEDULE_FREQUENCY',
            computedProps: {
              required({ record }) {
                return !!record.get('scheduledTriggerFlag');
              },
            },
          },
          {
            name: 'fixedValues',
            label: intl.get('spfm.digitalEmployee.model.fixedDays').d('固定值'),
            type: 'string',
            multiple: true,
            computedProps: {
              required({ record }) {
                if (!record.get('scheduledTriggerFlag')) {
                  return false;
                }
                return (
                  record.get('scheduleFrequency') === 'WEEKLY' ||
                  record.get('scheduleFrequency') === 'MONTHLY'
                );
              },
              lookupCode({ record }) {
                if (record.get('scheduleFrequency') === 'WEEKLY') {
                  return 'SPFM.AGENT_WEEKLY_FIXED_VALUE';
                }
                return 'SPFM.AGENT_MONTHLY_FIXED_VALUE';
              },
            },
          },
          {
            name: 'executionTime',
            label: intl.get('spfm.digitalEmployee.model.executionTime').d('执行时间'),
            type: 'string',
            computedProps: {
              required({ record }) {
                if (!record.get('scheduledTriggerFlag')) {
                  return false;
                }
                const freq = record.get('scheduleFrequency');
                return !!freq && freq !== 'MANUAL';
              },
              format({ record }) {
                const freq = record.get('scheduleFrequency');
                if (['DAILY', 'WEEKLY', 'MONTHLY'].includes(freq)) {
                  return HM_FORMAT;
                } else if (freq === 'ONCE') {
                  return YMD_HM_FORMAT;
                }
              },
              min({ record }) {
                const freq = record.get('scheduleFrequency');
                if (['HALF_HOUR', 'HOURLY'].includes(freq)) {
                  return 0;
                }
              },
              max({ record }) {
                const freq = record.get('scheduleFrequency');
                if (freq === 'HALF_HOUR') {
                  return 29;
                } else if (freq === 'HOURLY') {
                  return 59;
                }
              },
              step({ record }) {
                const freq = record.get('scheduleFrequency');
                if (['HALF_HOUR', 'HOURLY'].includes(freq)) {
                  return 1;
                }
              },
            },
          },
          {
            name: 'adminList',
            ignore: 'always',
            label: intl.get('spfm.digitalEmployee.model.admin').d('管理员'),
            type: 'object',
            multiple: true,
            required: isTenant,
            textField: 'text',
            valueField: 'key',
            disabled: !isTenant,
          },
          {
            name: 'inputParams',
            label: intl.get('spfm.digitalEmployee.model.params').d('入参'),
            type: 'string',
            validator(value) {
              if (value && !isValidJSONObject(value)) {
                return intl.get('spfm.digitalEmployee.view.paramsMsg').d('请输入合法的入参');
              }
            },
          },
        ],
      }),
    [status, isTenant]
  );

  const initData = async digitalEmployeeInfoId => {
    setLoading(true);
    try {
      const result = getResponse(await fetchDigitalEmployeeDetail(digitalEmployeeInfoId));
      if (result) {
        const transformedData = (() => {
          const { adminInfoObject, agentInfo, fixedValues, ...others } = result;
          try {
            const { roles = [], users = [] } = adminInfoObject || {};
            const adminList = [];
            roles.forEach(role => {
              adminList.push(transAdminItem(role, 'ROLE'));
            });
            users.forEach(user => {
              adminList.push(transAdminItem(user, 'USER'));
            });
            const data = {
              ...others,
            };
            if (agentInfo) {
              data.agentInfo = JSON.parse(agentInfo);
            }
            if (others.executionTime) {
              if (['DAILY', 'WEEKLY', 'MONTHLY'].includes(others.scheduleFrequency)) {
                data.executionTime = moment(others.executionTime, HM_FORMAT).format(
                  DEFAULT_DATETIME_FORMAT
                );
              } else if (others.scheduleFrequency === 'ONCE') {
                data.executionTime = moment(others.executionTime, YMD_HM_FORMAT).format(
                  DEFAULT_DATETIME_FORMAT
                );
              }
            }
            if (fixedValues) {
              data.fixedValues = fixedValues.split(',');
            }
            if (adminList.length) {
              data.adminList = adminList;
            }
            return data;
          } catch {
            return {};
          }
        })();
        if (status === 'create') {
          formDs.create({
            ...pick(transformedData, [
              'icon',
              'systemUserId',
              'systemUserName',
              'agentInfo',
              'description',
              'scheduledTriggerFlag',
              'manualTriggerFlag',
              'scheduleFrequency',
              'fixedValues',
              'executionTime',
              'adminList',
              'inputParams',
            ]),
            code: `${transformedData.code}_COPY`,
            name: `${transformedData.name}（copy）`,
          });
        } else {
          formDs.loadData([transformedData]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      initData(id);
    }
  }, []);

  const validateFields = async fields => {
    const record = formDs.current;
    if (!record || !fields || !fields.length) return true;
    const results = await Promise.all(
      fields.map(name => {
        const field = record.getField(name);
        return field ? field.checkValidity(record) : Promise.resolve(true);
      })
    );
    return results.every(r => r === true);
  };

  const validateStep1 = () => {
    return validateFields(['code', 'name', 'icon', 'systemUser', 'agentInfo']);
  };

  const validateStep2 = () => {
    return validateFields([
      'scheduleFrequency',
      'fixedValues',
      'executionTime',
      'adminList',
      'inputParams',
    ]);
  };

  /**
   * 下一步 - 先校验当前步骤字段再跳转
   */
  const handleNext = useCallback(async () => {
    const record = formDs.current;
    if (!record) return;
    const validPromise = currentStep === 0 ? validateStep1() : validateStep2();
    const valid = await validPromise;
    if (valid) {
      setCurrentStep(p => p + 1);
    }
  }, [formDs, currentStep]);

  const handleSubmit = useCallback(async () => {
    const flag1 = await validateStep1();
    if (!flag1) {
      setCurrentStep(0);
      return;
    }
    const flag2 = await validateStep2();
    if (!flag2) {
      setCurrentStep(1);
      return;
    }
    const jsonData = formDs.toJSONData();
    if (jsonData.length) {
      const { agentInfo, fixedValues, ...others } = jsonData[0];
      const record = formDs.current;
      const adminList = record.get('adminList');
      const scheduleFrequency = record.get('scheduleFrequency');
      const adminInfo = adminList.reduce(
        (result, item) => {
          if (item.type === 'ROLE') {
            result.roles.push(item.code);
          } else if (item.type === 'USER') {
            result.users.push(item.code);
          }
          return result;
        },
        { roles: [], users: [] }
      );

      const submitData = {
        ...others,
        adminInfo: JSON.stringify(adminInfo),
      };

      if (agentInfo) {
        submitData.agentInfo = JSON.stringify(agentInfo);
      }

      if (fixedValues && fixedValues.length) {
        submitData.fixedValues = fixedValues.join(',');
      }

      if ('executionTime' in submitData) {
        if (['DAILY', 'WEEKLY', 'MONTHLY'].includes(scheduleFrequency)) {
          submitData.executionTime = moment(submitData.executionTime).format(HM_FORMAT);
        } else if (scheduleFrequency === 'ONCE') {
          submitData.executionTime = moment(submitData.executionTime).format(YMD_HM_FORMAT);
        }
      }

      const result = await saveDigitalEmployee(submitData);

      if (getResponse(result)) {
        onRefresh();
        notification.success();
        formDs.reset();
        modal.close();
      }
    } else {
      formDs.reset();
      modal.close();
    }
  }, [formDs, modal]);

  /**
   * 更新 Modal footer
   */
  const refreshFooter = useCallback(
    step => {
      modal.update({
        footer: () => {
          const showOkBtn = status !== 'create' || step >= stepTitles.length - 1;
          if (readOnly) {
            return (
              <div className={styles['modal-footer']}>
                <Button
                  onClick={() => {
                    formDs.reset();
                    modal.close();
                  }}
                  color="primary"
                >
                  {intl.get('hzero.common.button.close').d('关闭')}
                </Button>
              </div>
            );
          }
          return (
            <div className={styles['modal-footer']}>
              <Button
                onClick={() => {
                  formDs.reset();
                  modal.close();
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
              {step > 0 && (
                <Button onClick={() => setCurrentStep(p => p - 1)}>
                  {intl.get('hzero.common.button.previous').d('上一步')}
                </Button>
              )}
              {step < stepTitles.length - 1 && (
                <Button color={showOkBtn ? 'default' : 'primary'} onClick={handleNext}>
                  {intl.get('hzero.common.button.next').d('下一步')}
                </Button>
              )}
              {showOkBtn && (
                <Button color="primary" onClick={handleSubmit}>
                  {intl.get('hzero.common.button.confirm').d('确认')}
                </Button>
              )}
            </div>
          );
        },
      });
    },
    [formDs, modal, handleNext, handleSubmit, readOnly]
  );

  // 每次 step 变化时刷新 footer
  useEffect(() => {
    refreshFooter(currentStep);
  }, [currentStep, refreshFooter]);

  const iconRender = useCallback(({ value }) => {
    const icon = ICON_OPTIONS.find(opt => opt.value === value);
    return (
      <span>
        {icon && (
          <img
            src={icon.image}
            alt=""
            style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }}
          />
        )}
        {value}
      </span>
    );
  }, []);

  /**
   * 渲染步骤内容
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form dataSet={formDs} columns={4} labelLayout="float">
            <IntlField name="name" colSpan={1} />
            <TextField name="code" colSpan={1} />
            <Select name="icon" colSpan={1} renderer={iconRender}>
              {ICON_OPTIONS.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>
                  <img
                    src={opt.image}
                    alt={opt.value}
                    style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }}
                  />
                  {opt.value}
                </Select.Option>
              ))}
            </Select>
            <Lov name="systemUser" />
            <Lov name="agentInfo" colSpan={1} />
            <span colSpan={3} />
            <IntlField name="description" colSpan={2} resize="vertical" type="multipleLine" />
          </Form>
        );
      case 1:
        return <ExecutionTimeForm formDs={formDs} />;
      default:
        return null;
    }
  };

  const renderViewContent = () => {
    return (
      <div>
        <Card title={stepTitles[0]}>
          <Form
            dataSet={formDs}
            columns={4}
            labelLayout="vertical"
            className="c7n-pro-vertical-form-display"
          >
            <Output name="name" />
            <Output name="code" />
            <Output name="icon" renderer={iconRender} />
            <Output name="systemUser" />
            <Output name="agentInfo" />
            <span colSpan={3} />
            <Output name="description" colSpan={2} />
          </Form>
        </Card>
        <Card title={stepTitles[1]}>
          <ExecutionTimeForm formDs={formDs} readOnly={readOnly} />
        </Card>
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <Steps current={currentStep} style={{ marginBottom: 16 }} hidden={readOnly}>
        {stepTitles.map(title => (
          <Step key={title} title={title} />
        ))}
      </Steps>
      <div className={styles['step-content']}>
        {readOnly ? renderViewContent() : renderStepContent()}
      </div>
    </Spin>
  );
}

// ====== 主页面 ======

function DigitalEmployee() {
  const isTenant = isTenantRoleLevel();
  const digitalDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        paging: false,
        primaryKey: 'digitalEmployeeInfoId',
        fields: [
          {
            name: 'code',
          },
          {
            name: 'name',
          },
          {
            name: 'icon',
          },
        ],
        queryFields: [
          {
            name: 'code',
            label: intl.get('spfm.digitalEmployee.model.applicationCode').d('应用编码'),
          },
          {
            name: 'name',
            label: intl.get('spfm.digitalEmployee.model.applicationName').d('应用名称'),
          },
          {
            name: 'creationDate',
            label: intl.get('spfm.digitalEmployee.model.creationDate').d('创建时间'),
            type: 'date',
          },
        ],
        transport: {
          read: ({ params }) => ({
            url: isTenant
              ? `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/digital-employee-infos/list`
              : `${SRM_PLATFORM}/v1/digital-employee-infos/list`,
            method: 'GET',
            params,
          }),
        },
      }),
    []
  );

  /**
   * 打开新建 Modal（Modal.open 方式）
   */
  const handleOpenModal = useCallback((status, record) => {
    const title =
      status === 'view'
        ? intl.get('spfm.digitalEmployee.title.viewDigitalEmployee').d('查看数字员工')
        : status === 'create'
        ? intl.get('spfm.digitalEmployee.title.createDigitalEmployee').d('新建数字员工')
        : intl.get('spfm.digitalEmployee.title.editDigitalEmployee').d('编辑数字员工');
    let refresh = false;
    Modal.open({
      key: Modal.key(),
      title,
      style: { width: 1080 },
      border: true,
      destroyOnClose: true,
      closable: true,
      onClose() {
        if (refresh) {
          digitalDs.query();
        }
      },
      children: (
        <CreateDigitalEmployeeContent
          status={status}
          id={record && record.get('digitalEmployeeInfoId')}
          onRefresh={() => {
            refresh = true;
          }}
        />
      ),
    });
  }, []);

  const handleDelete = m => {
    const hasRecord = m.get('existExecuteChatRecordFlag');
    Modal.confirm({
      title: hasRecord
        ? intl
            .get('spfm.digitalEmployee.message.confirmDeleteHasRecord')
            .d('该数字员工已经有执行记录，确定删除该数字员工？')
        : intl.get('spfm.digitalEmployee.message.confirmDelete').d('确定删除该数字员工？'),
      async onOk() {
        const result = getResponse(await deleteDigitalEmployee(m.get('digitalEmployeeInfoId')));
        if (result) {
          digitalDs.query();
          notification.success();
        }
      },
    });
  };

  const queryFields = useMemo(() => {
    return [
      <TextField name="code" />,
      <TextField name="name" />,
      // <DateTimePicker name="creationDate" />,
    ];
  }, []);

  const renderCreateItem = () => {
    return (
      <div className={styles['item-create']} onClick={() => handleOpenModal('create')}>
        <Icon type="add" />
        <span>
          {intl.get('spfm.digitalEmployee.button.createDigitalEmployee').d('新建数字员工')}
        </span>
      </div>
    );
  };

  const isEmpty = digitalDs.length < 1;

  return (
    <>
      <Header title={intl.get('spfm.digitalEmployee.view.digitalEmployee.title').d('数字员工管理')}>
        <Button color="primary" icon="add" onClick={() => handleOpenModal('create')}>
          {intl.get('spfm.digitalEmployee.button.createDigitalEmployee').d('新建数字员工')}
        </Button>
      </Header>
      <Content className={styles.content}>
        <QueryBarMore
          dataSet={digitalDs}
          queryDataSet={digitalDs.queryDataSet}
          queryFields={queryFields}
        />
        <div className={classNames(styles.list, { [styles['list-empty']]: isEmpty })}>
          {digitalDs.map(m => {
            const description = m.get('description');
            const publishedDate = m.get('publishedDate');
            const isCustom = isTenant && m.get('tenantId') !== 0;
            const isPredifined = isTenant && m.get('tenantId') === 0;
            const menu = (
              <Menu style={{ width: 145 }}>
                <Menu.Item
                  onClick={e => {
                    e.domEvent.stopPropagation();
                    return handleOpenModal('create', m);
                  }}
                >
                  {intl.get('spfm.digitalEmployee.button.copy').d('复制')}
                </Menu.Item>
                {!isPredifined && (
                  <Menu.Item
                    onClick={e => {
                      e.domEvent.stopPropagation();
                      return handleDelete(m);
                    }}
                  >
                    {intl.get('spfm.digitalEmployee.button.delete').d('删除')}
                  </Menu.Item>
                )}
              </Menu>
            );
            return (
              <div key={m.get('id')} className={styles['item-wrapper']}>
                <div className={styles.item} onClick={() => handleOpenModal('view', m)}>
                  <div className={styles['item-base']}>
                    <div className={styles['item-main']}>
                      <img
                        src={getDigitalEmployeeIcon(m.get('icon'))}
                        alt=""
                        className={styles['item-icon']}
                      />
                      <div className={styles['item-text']}>
                        <span className={styles['item-title']}>{m.get('name')}</span>
                        {description && <span className={styles['item-desc']}>{description}</span>}
                      </div>
                    </div>
                    <div className={styles['item-operators']}>
                      {!isPredifined && (
                        <Button
                          funcType="flat"
                          icon="border_color"
                          size="small"
                          color="dark"
                          onClick={e => {
                            e.stopPropagation();
                            return handleOpenModal('edit', m);
                          }}
                        />
                      )}
                      <Dropdown overlay={menu}>
                        <Button
                          funcType="flat"
                          icon="more_horiz"
                          size="small"
                          color="dark"
                          onClick={e => e.stopPropagation()}
                        />
                      </Dropdown>
                    </div>
                  </div>
                  <div className={styles['item-others']}>
                    <span>{m.get('publishedName')}</span>
                    <span className={styles['item-dot']}>.</span>
                    <span>
                      {intl
                        .get('spfm.digitalEmployee.view.digitalEmployee.updateTime', {
                          date: publishedDate,
                        })
                        .d(`编辑于${publishedDate}`)}
                    </span>
                  </div>
                  {isCustom && (
                    <span className={styles['item-tag']}>
                      {intl.get('spfm.digitalEmployee.view.custom').d('自定义')}
                    </span>
                  )}
                  {isPredifined && (
                    <span className={classNames(styles['item-tag'], styles['item-tag-pre'])}>
                      {intl.get('hzero.common.predefined').d('预定义')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div className={styles['item-wrapper']}>{renderCreateItem()}</div>
        </div>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common', 'spfm.digitalEmployee'],
})(observer(DigitalEmployee));
