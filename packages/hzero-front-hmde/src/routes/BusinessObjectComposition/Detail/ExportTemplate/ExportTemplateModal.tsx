import React, { useMemo, useEffect, useImperativeHandle, useCallback } from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import {
  DataSet,
  Form,
  TextField,
  Select,
  IntlField,
  Icon,
  Tooltip,
  Password,
  CheckBox,
} from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { LabelAlign, LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { isTenantRoleLevel, getCurrentUser } from 'hzero-front/lib/utils/utils';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

import ImgIcon from '@/utils/ImgIcon';

interface IProps {
  // importDS?: DataSet;
  // record: Record;
  record: any,
  type: string;
  col: number;
  [x: string]: any;
  isTenant?: boolean;
}

export default formatterCollections({ code: ['hmde.boComposition', 'hzero.common', 'hmde.bo'] })((props: IProps) => {
  const { col, record, importTemplateRef, businessObjectCode, type, isTenant = false } = props;
  const {
    additionInfo: { enableExcelWatermark = false } = {},
  } = getCurrentUser();

  // const formProps: any = {};
  // if (exportDS) {
  //   formProps.dataSet = exportDS;
  // } else {
  //   formProps.record = record;
  // }

  const formDs = useMemo(
    () =>
      new DataSet({
        paging: false,
        autoCreate: true,
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
            name: 'templateName',
            type: 'intl',
            maxLength: 60,
            label: intl.get('hmde.common.templateName').d('模板名称'),
            required: true,
          },
          {
            name: 'remark',
            type: 'intl',
            label: intl.get('hmde.common.remark').d('描述'),
          },
          {
            name: 'maxDataCount',
            type: 'number',
            defaultValue: type === 'create' ? 250000 : undefined,
            disabled: isTenantRoleLevel(),
            // label: intl.get('hmde.maxDataCount').d('导出最大条数'),
            labelWidth: 130,
            label: (
              <>
                {intl.get('hmde.bo.modelmaxDataCount').d('导出最大条数')}
                <Tooltip
                  title={intl
                    .get('hmde.bo.model.maxDataCountTip')
                    .d('若任意sheet页内的数据行数超过导出最大条数，则会拆分为多个sheet页进行导出')}
                >
                  <ImgIcon name="help@v4.0.svg" size={14} style={{ margin: '0 8px 0 10px' }} />
                </Tooltip>
              </>
            ),
          },
          {
            name: 'fileType',
            type: 'string',
            label: intl.get('hmde.common.fileType').d('默认文件格式'),
            defaultValue: type === 'create' ? 'EXCEL2007' : undefined,
            textField: 'meaning',
            valueField: 'value',
            lookupCode: 'HMDE.BUSINESS_OBJECT.EXPORT.FILE_TYPE',
            dynamicProps: {
              disabled: ({ record: recordItem }) => {
                // 配置开启且启用水印时，只能选择excel2007
                return enableExcelWatermark && recordItem.get('enabledWatermark');
              },
            },
          },
          {
            name: 'maxSheetCount',
            type: 'number',
            defaultValue: type === 'create' ? 5 : undefined,
            // label: intl.get('hmde.maxSheetCount').d('默认最大页数'),
            labelWidth: 130,
            label: (
              <>
                {intl.get('hmde.common.maxSheetCount').d('默认最大页数')}
                <Tooltip
                  title={intl
                    .get('hmde.bo.model.maxSheetCountTip')
                    .d(
                      '若导出内容sheet页数超过默认最大sheet页数，则会拆分成额外的Excel文件进行导出'
                    )}
                >
                  <ImgIcon name="help@v4.0.svg" size={14} style={{ margin: '0 8px 0 10px' }} />
                </Tooltip>
              </>
            ),
          },
          {
            name: 'exportType',
            type: 'string',
            textField: 'meaning',
            valueField: 'value',
            lookupCode: 'HPFM.EXCEL_EXPORT_TYPE',
            label: intl.get('hmde.common.exportTypeObject').d('导出类型'),
            required: true,
          },
          {
            name: 'enabledFlag',
            type: 'boolean',
            label: intl.get('hmde.bo.model.status.enabledFlag').d('启用'),
            defaultValue: type === 'create',
            disabled: isTenantRoleLevel(),
          },
          {
            name: 'enabledWatermark',
            type: 'boolean',
            label: intl.get('hmde.common.enableFlag.waterMarking.or.encryption').d('启用水印/加密'),
            defaultValue: false,
          },
          {
            label: intl.get('hmde.bo.model.status.labelCode').d('模板使用方'),
            name: 'labelCode',
            type: 'string',
            required: type === 'create',
            disabled: type === 'edit',
            lookupCode: 'AUTH_LABEL',
            help: intl.get('hmde.bo.model.status.labelCode.help').d('请根据实际模板使用方维护，采购方：内部用户(如采购员等)使用；供应方：供应商用户切换到当前租户下可使用的模板；全部：不限制，供应商和采购方都可用的模板'),
          },
          {
            name: 'encryptPassword',
            type: 'string',
            label: intl.get('hmde.common.encrypted.password').d('加密密码'),
            validator: (value) => {
              const pattern = /^[A-Za-z0-9]*$/;
              if (!pattern.test(value)) {
                return intl
                  .get('hzero.common.validation.support.numberAndLetter')
                  .d('只支持输入字母和数字');
              }
            },
            dynamicProps: {
              required: ({ record: recordItem }) => {
                // 配置开启且启用水印时，必填
                return enableExcelWatermark && recordItem.get('enabledWatermark');
              },
            },
          },
        ],
        transport: {
          read: () => {
            return {
              url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-objects-export-templates/${record.businessObjectExportTemplateId}`,
              method: 'GET',
            };
          },
        },
      } as DataSetProps),
    [businessObjectCode, type]
  );

  useImperativeHandle(importTemplateRef, () => ({
    formDs,
  }));

  useEffect(() => {
    if (type !== 'create') {
      if (isTenantRoleLevel()) {
        formDs.query();
      } else {
        formDs.loadData([record]);
      }
    }
  }, []);

  const handleWaterMark = useCallback((value) => {
    if (value && formDs.current) {
      // 开启水印，限制文件格式为excel2007
      formDs.current.set('fileType', 'EXCEL2007');
    }
  }, [formDs]);

  return (
    <Form dataSet={formDs} columns={1} labelAlign={LabelAlign.left} labelLayout={LabelLayout.float}>
      <TextField
        name="templateCode"
        disabled={!(type === 'create')}
        addonBefore={isTenant && type === 'create' ? 'CUS.' : undefined}
      />
      <IntlField name="templateName" suffix={<Icon type="language" />} />
      <IntlField name="remark" colSpan={col} suffix={<Icon type="language" />} />
      <TextField name="maxDataCount" />
      <Select name="fileType" />
      <Select name="exportType" />
      <TextField name="maxSheetCount" />
      {enableExcelWatermark && (
        <>
          <CheckBox name="enabledWatermark" onChange={handleWaterMark} />
          <Password name="encryptPassword" autoComplete="new-password" />
        </>
      )}
      <Select name='labelCode' clearButton={false} showHelp={ShowHelp.tooltip} />
    </Form>
  );
});
