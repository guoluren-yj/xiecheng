import React, { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { SelectBox, Form, TextField, CheckBox, Lov, Select, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { TopSection, SecondSection } from '_components/Section';
import { getPlatformVersionApi } from 'utils/utils';
import { Link } from 'dva/router';
import styles from './index.less';

const { Option } = Select;

export default memo(function Drawer(props) {
  const { isCreate, fieldFormDs, isTenant = false } = props;
  const [isSrm] = useState(fieldFormDs && fieldFormDs.get('groupNum') === 'SRM');
  // const [hasCompany] = useState(isSrm);
  const [hasQuestionnaireTemplate, setHasQuestionnaireTemplate] = useState(false);
  const [hasInviteLevel, setHasInviteLevel] = useState(false);
  // const [hasUserIdList, setHasUserIdList] = useState(false);
  const [, setLayout] = useState({});
  const layoutLovCode = isTenant ? 'SPFM.PORTAL.LAYPUT.ORG.VIEW' : 'SPFM.PORTAL.LAYOUT.VIEW';
  const layoutOptionDs = useMemo(
    () =>
      new DataSet({
        // selection: 'single',
        autoQuery: true,
        paging: true,
        pageSize: 100,
        primaryKey: 'layoutId',
        fields: [
          {
            name: 'layoutId',
            transformResponse: (_, object) => {
              return object.id;
            },
          },
        ],
        transport: {
          read() {
            return {
              url: `${SRM_PLATFORM}/v1/${getPlatformVersionApi('portal-layouts')}`,
              method: 'get',
              data: {
                lovCode: layoutLovCode,
                enabledFlag: 1,
              },
            };
          },
        },
      }),
    []
  );
  useEffect(() => {
    const afterRegister = fieldFormDs.get('afterRegister');
    const inviteLevel = fieldFormDs.get('inviteLevel');
    const layoutId = fieldFormDs.get('layoutId');
    const layoutCode = fieldFormDs.get('layoutCode');
    const layoutName = fieldFormDs.get('layoutName');
    // const sendMessageFlag = fieldFormDs.get('sendMessageFlag');
    const userIdList = fieldFormDs.get('userIdList');
    const userNameList = fieldFormDs.get('userNameList');
    if (userIdList.length && userNameList.length) {
      fieldFormDs.set(
        'userIdList',
        userIdList.map((item, index) => {
          return {
            userId: item,
            userName: userNameList[index],
          };
        })
      );
    }
    fieldFormDs.get('userIdList');
    // setHasUserIdList(sendMessageFlag === 1);
    changeAfterRegister(afterRegister, 1);
    fieldFormDs.set('layoutObject', {
      id: layoutId,
      layoutCode,
      layoutName,
    });
    if (!inviteLevel || inviteLevel === undefined) {
      fieldFormDs.set('inviteLevel', 'group');
    }
  }, []);

  /**
   * 清空公司信息
   * @param {record} 行信息
   */
  const clearCompany = (record) => {
    record.set('companyId', null);
    record.set('companyNum', null);
    record.set('companyName', null);
    record.set('inviteCompanyId', null);
    record.set('inviteCompanyObject', null);
  };

  const changeAfterRegister = useCallback((value, isFirstRender) => {
    if (!value || value === undefined) {
      fieldFormDs.set('afterRegister', '0');
      changeAfterRegister('0');
      return;
    }
    setHasQuestionnaireTemplate(value === '3');
    setHasInviteLevel(value !== '0');
    const inviteCompany = fieldFormDs.get('inviteCompanyObject');
    if (inviteCompany && isFirstRender !== 1) {
      fieldFormDs.set('inviteCompanyObject', undefined);
    }
  }, []);

  const renderFormItem = () => {
    const platformItem = [
      <CheckBox name="newRegisterFlag" />,
      <CheckBox
        name="interBusinessShield"
        showHelp="tooltip"
        help={intl
          .get('hptl.portalAssign.model.portalAssign.interMessage')
          .d('开启后，通过该二级域名注册的供应商默认无法被其他企业发现。')}
      />,
      <CheckBox
        name="tenantApproval"
        showHelp="tooltip"
        help={intl
          .get('hptl.portalAssign.model.portalAssign.tenantMessage')
          .d('启用后，供应商经过二级域名审批后，不再经过平台级，而是在租户管理员功能下进行审批。')}
      />,
    ];
    const commonItem = [
      // <div>
      //   <CheckBox name="sendMessageFlag" onChange={changeSendMessageFlag} />
      //   <Tooltip
      //     placement="top"
      //     title={intl
      //       .get('hptl.portalAssign.model.portalAssign.sendMessage')
      //       .d('启用后，维护接受者子账户，通过该域名注册的供应商，采购方子账户将接受到邮件提醒。')}
      //   >
      //     <Icon type="help" className="portal-icon" />
      //   </Tooltip>
      // </div>,
      // hasUserIdList && <Lov name="userIdList" />,
      // !isTenant && <CheckBox name="enabledFlag" />,
      <CheckBox name="skipAfterLoginFlag" />,
    ];
    const platformRelevanceItem = [
      <CheckBox name="personalRegisterFlag" />,
      <Select name="afterRegister" onChange={changeAfterRegister} />,
      hasInviteLevel ? (
        <SelectBox name="inviteLevel" defaultValue="group">
          <Option value="group">
            {intl.get('hptl.portalAssign.model.portalAssign.levelTypeGroup').d('集团级')}
          </Option>
          <Option value="company">
            {intl.get('hptl.portalAssign.model.portalAssign.levelTypeCom').d('公司级')}
          </Option>
        </SelectBox>
      ) : null,
      hasInviteLevel ? <Lov name="inviteCompanyObject" /> : null,
      hasQuestionnaireTemplate ? <Lov name="questionnaireTemplateObject" /> : null,
      <Select name="mustCompanyTabs" reverse={false} selectAllButton={false} />,
    ];
    return isTenant ? commonItem : [...platformItem, ...commonItem, ...platformRelevanceItem];
  };

  // TODO: 取消change事件
  const changeLayout = useCallback((value) => {
    setLayout(value);
  }, []);

  return (
    <TopSection className={styles['choice-template']}>
      <SecondSection title={intl.get('hptl.portalAssign.model.portalAssign.group').d('集团')}>
        <Form record={fieldFormDs} labelLayout="float" style={{ marginBottom: 32 }}>
          <TextField name="groupNum" />
          <Lov
            name="groupObject"
            disabled={!isCreate}
            onChange={() => {
              clearCompany(fieldFormDs);
            }}
          />
        </Form>
      </SecondSection>
      <SecondSection title={intl.get('hptl.portalAssign.model.title.webUrl').d('域名')}>
        <Form record={fieldFormDs} labelLayout="float" style={{ marginBottom: 32 }}>
          <TextField name="webUrl" disabled={!isCreate && isTenant} />
          <Select
            name="domainNameUser"
            className="layout-select"
            showHelp="tooltip"
            help={intl
              .get('hptl.portalAssign.model.portalAssign.domainNameUser.tooltip')
              .d(
                '供应方：供应商用户登录注册使用域名；采购方：内部用户登录使用域名，或用于单点登录映射域名；未维护：表示域名内部用户及供应商均可使用'
              )}
          />
        </Form>
      </SecondSection>
      <SecondSection title={intl.get('hptl.portalAssign.model.portalAssign.layout').d('模板')}>
        <Form record={fieldFormDs} labelLayout="float">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Select
              name="layoutObject"
              searchable
              onChange={changeLayout}
              showHelp="tooltip"
              help={intl
                .get('hptl.portalAssign.model.portalAssign.layout.tooltip')
                .d('不同的域名使用相同的模板即可继承模板下所有配置，样式相同')}
              options={layoutOptionDs}
            />
            {fieldFormDs.get('layoutId') ? (
              <Link
                target="_blank"
                to={`/pub/home/${fieldFormDs.get('layoutId')}`}
                style={{ marginLeft: 10, width: 30 }}
              >
                {intl.get('hzero.common.button.see').d('预览')}
              </Link>
            ) : null}
          </div>
          {!isSrm && renderFormItem()}
        </Form>
      </SecondSection>
    </TopSection>
  );
});
