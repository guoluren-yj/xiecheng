import React, { useMemo, useEffect, useImperativeHandle } from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { DataSet, Form, TextField, Select, IntlField, NumberField, Tooltip, CheckBox } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import intl from 'srm-front-boot/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { LabelAlign, LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { omit, isNil } from 'lodash';
import { RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';

interface IProps {
  // importDS?: DataSet;
  record: any;
  type: string;
  col: number;
  [x: string]: any;
  isTenant?: boolean;
  isCopy?: boolean;
}

function App(props: IProps) {
  const { col, record, importTemplateRef, businessObjectCode, type, isTenant = false, isCopy = false } = props;

  // const formProps: any = {};
  // if (importDS) {
  //   formProps.dataSet = importDS;
  // } else {
  //   formProps.record = record;
  // }

  const formDs = useMemo(
    () =>
      new DataSet({
        autoCreate: type === 'create',
        fields: [
          {
            name: 'templateCode',
            type: 'string',
            label: intl.get('hmde.common.templateCode').d('模板编码'),
            pattern: /^([a-zA-Z/_.]*)(?=.*[a-zA-Z]).+$/,
            maxLength: 90,
            validator: value => {
              if (value === `${businessObjectCode}_`) {
                return intl.get('hzero.common.validation.requireInput', {
                  name: intl.get('hmde.common.templateCode').d('模板编码'),
                  }).d('请输入模板编码');
              }
            },
            required: true,
            defaultValue: type === 'create' ? `${businessObjectCode}_` : undefined,
          },
          {
            maxLength: 60,
            name: 'templateName',
            type: 'intl',
            label: intl.get('hmde.common.templateName').d('模板名称'),
            required: true,
          },
          {
            name: 'remark',
            type: 'intl',
            label: intl.get('hmde.common.remark').d('描述'),
          },
          {
            name: 'templateCategory',
            type: 'string',
            required: true,
            textField: 'meaning',
            valueField: 'value',
            label: intl.get('hmde.common.templateCategory').d('模板类型'),
            lookupCode: 'HMDE.BUSINESS_OBJECT.IMPORT.TEMPLATE_TYPE',
            defaultValue: type === 'create' ? 'COMMON' : undefined,
          },
          {
            name: 'importMaxSize',
            label: intl.get('hmde.common.importMaxSize').d('最大导入数量'),
            min: 1,
            step: 1,
            max: 50000,
          },
          {
            name: 'businessObjectImportTemplateId',
            type: 'string',
          },
          {
            name: 'templateSource',
            label: intl.get('hmde.boComposition.importTemplate.templateSource').d('模板来源'),
            lookupCode: 'HMDE.IMPORT_TEMPLATE_SOURCE',
            defaultValue: isTenant ? 'CUSTOM' : 'PREDEFINED',
          },
          {
            name: 'sceneCode',
            label: intl.get('hmde.boComposition.importTemplate.senceCode').d('场景编码'),
            validator: value => {
              if (value && !/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(value)) {
                return intl.get('hmde.boComposition.importTemplate.senceCode.pattern').d('必须以大小写字母开头，支持大小写字母、数字、_、.');
              }
            },
          },
          {
            label: intl.get('hmde.bo.model.status.labelCode').d('模板使用方'),
            name: 'labelCode',
            type: 'string',
            lookupCode: 'AUTH_LABEL',
            required: type === 'create' || isCopy,
            disabled: type === 'edit' && !isCopy,
            help: intl.get('hmde.bo.model.status.labelCode.help').d('请根据实际模板使用方维护，采购方：内部用户(如采购员等)使用；供应方：供应商用户切换到当前租户下可使用的模板；全部：不限制，供应商和采购方都可用的模板'),
          },
          {
            label: intl.get('hmde.bo.model.status.enableGroup').d('开启分组异步导入'),
            name: 'enableGroup',
            type: 'boolean',
          },
          {
            label: intl.get('hmde.bo.model.status.groupFlag').d('分组异步导入启用策略'),
            name: 'groupFlag',
            options: new DataSet({
              data: [
                { value: 0, meaning: intl.get('hmde.bo.model.status.groupFlag.tenant').d('按租户开启') },
                { value: 1, meaning: intl.get('hmde.bo.model.status.groupFlag.platform').d('全平台开启') },
              ],
            }),
          },
          {
            label: intl.get('hmde.bo.model.status.groupFields').d('分组异步导入主键字段'),
            name: 'groupFields',
            type: 'string',
            disabled: isTenant,
            help: intl.get('hmde.bo.model.status.groupFields.help').d('导入sheet页签中分组字段编码，同样字段值的分为一组内，如订单头行导入，同一个订单序号字段分为一组，多组并发导入系统，提升导入性能'),
            dynamicProps: {
              required: ({ record: current }) => current.get('enableGroup'),
            },
          },
        ],
        events: {
          update: ({ name, record: current, value }) => {
            if (name === 'enableGroup' && !value) {
              current.set('groupFlag', 0);
              current.set('groupFields', undefined);
            }
            if (name === 'groupFlag') {
              current.set('groupFlagUpdated', 1);
            }
          },
        },
      } as DataSetProps),
    [businessObjectCode, type]
  );

  useImperativeHandle(importTemplateRef, () => ({
    formDs,
  }));

  useEffect(() => {
    initData();
  }, []);

  const initData = async() => {
    if (type !== 'create') {
      let data = { ...record };
      if (data.groupFlag || data.groupFields) {
        data.enableGroup = true;
      } else {
        data.enableGroup = false;
      }
      // 复制时前端查多语言， 后端处理麻烦
      if (isCopy) {
        // 复制预定义模板，将模板编码作为默认场景编码
        if (data.templateSource === 'PREDEFINED') {
          data.sceneCode = data.templateCode;
        }
        data.templateSource = 'COPY';
        data.templateCode = `${businessObjectCode}_`;
        data = omit(data, ['templateName', 'remark', '_token', 'labelCode']);
      }
      const current = formDs.create(data);
      current.status = RecordStatus.update;
    }
  };

  const enableGroup = formDs && formDs.current && formDs.current.get(isTenant ? 'groupFlag' : 'enableGroup');
  return (
    <Form dataSet={formDs} columns={1} labelAlign={LabelAlign.left} labelLayout={LabelLayout.float}>
      <TextField
        name="templateCode"
        disabled={!isCopy && !(type === 'create')}
        addonBefore={isTenant && (isCopy || type === 'create') ? 'CUS.' : undefined}
      />
      <IntlField name="templateName" suffix={<Icon type="language" />} />
      <IntlField name="remark" colSpan={col} suffix={<Icon type="language" />} />
      <Select name="templateCategory" disabled={isCopy || getCurrentOrganizationId() !== record?.tenantId} />
      <NumberField name="importMaxSize" disabled={!isCopy && type === 'edit' && getCurrentOrganizationId() !== record?.tenantId} />
      <TextField name="templateSource" hidden={!isTenant} disabled />
      <TextField
        name="sceneCode"
        hidden={!isTenant || (formDs.current && formDs.current.get('templateSource') === 'PREDEFINED')}
        disabled={!isCopy && type === 'edit' && getCurrentOrganizationId() !== record?.tenantId}
        addonAfter={(
          <Tooltip
            title={(
              <>
                <div>{intl.get('hmde.boComposition.importTemplate.senceCode.help1').d('该编码用于：')}</div>
                <div>{intl.get('hmde.boComposition.importTemplate.senceCode.help2').d('导入模板在同一场景下，需结合业务规则定义判断使用不同模板的需求，如申请行导入、协议标的导入等；')}</div>
                <div>{intl.get('hmde.boComposition.importTemplate.senceCode.help3').d('同一个导入模板的下载场景，场景编码需保持一；')}</div>
                <div>{intl.get('hmde.boComposition.importTemplate.senceCode.help4').d('如无需指定场景使用，可选择性填写该字段。')}</div>
              </>
            )}
          >
            <Icon type='help' style={{ color: '#868d9c', fontSize: '16px' }} />
          </Tooltip>
        )}
      />
      <Select name='labelCode' showHelp={ShowHelp.tooltip} />
      {!isTenant && (
        <>
          <CheckBox name='enableGroup' />
          {enableGroup && <Select name='groupFlag' />}
        </>
      )}
      <TextField name="groupFields" showHelp={ShowHelp.tooltip} />
      {isTenant && formDs.current && !isNil(formDs.current.get('groupFields')) && (
        <CheckBox name='groupFlag' label={intl.get('hmde.bo.model.status.enableGroup').d('开启分组异步导入')} />
      )}
    </Form>
  );
}

export default formatterCollections({ code: ['hmde.common', 'hmde.boComposition'] })(observer(App));
