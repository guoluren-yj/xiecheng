import React, { useMemo, useEffect, useImperativeHandle } from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import {
  DataSet,
  Form,
  TextField,
  Switch,
  Select,
  IntlField,
  Icon,
  Tooltip,
} from 'choerodon-ui/pro';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import intl from 'srm-front-boot/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { LabelAlign } from 'choerodon-ui/pro/lib/form/enum';

import ImgIcon from '@/utils/ImgIcon';

interface IProps {
  // importDS?: DataSet;
  record: Record;
  type: string;
  col: number;
  [x: string]: any;
}

export default formatterCollections({ code: ['hmde.bo'] })((props: IProps) => {
  const { col, record, importTemplateRef, businessObjectCode, type } = props;

  // const formProps: any = {};
  // if (exportDS) {
  //   formProps.dataSet = exportDS;
  // } else {
  //   formProps.record = record;
  // }

  const formDs = useMemo(
    () =>
      new DataSet({
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
            label: intl.get('hmde.common.enableFlag').d('是否启用'),
            defaultValue: type === 'create',
          },
        ],
      } as DataSetProps),
    [businessObjectCode, type]
  );

  useImperativeHandle(importTemplateRef, () => ({
    formDs,
  }));

  useEffect(() => {
    if (type !== 'create') {
      formDs.loadData([record]);
    }
  }, []);

  return (
    <Form dataSet={formDs} columns={col} labelAlign={LabelAlign.left}>
      <TextField
        name="templateCode"
        disabled={!(type === 'create')}
        // addonBefore={exportDS && `${domainCode}_`}
      />
      <IntlField name="templateName" suffix={<Icon type="language" />} />
      <IntlField name="remark" colSpan={col} suffix={<Icon type="language" />} />
      <TextField name="maxDataCount" />
      <Select name="fileType" />
      <Select name="exportType" />
      <TextField name="maxSheetCount" />
      <Switch name="enabledFlag" />
    </Form>
  );
});
