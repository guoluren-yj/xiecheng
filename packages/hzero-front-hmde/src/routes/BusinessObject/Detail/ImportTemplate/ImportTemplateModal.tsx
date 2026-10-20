import React, { useMemo, useEffect, useImperativeHandle } from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { DataSet, Form, TextField, Select, IntlField, Icon } from 'choerodon-ui/pro';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import intl from 'srm-front-boot/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { LabelAlign } from 'choerodon-ui/pro/lib/form/enum';

interface IProps {
  // importDS?: DataSet;
  record: Record;
  type: string;
  col: number;
  [x: string]: any;
}

export default formatterCollections({ code: ['hmde.common', 'hmde.boComposition'] })(
  (props: IProps) => {
    const { col, record, importTemplateRef, businessObjectCode, type } = props;

    // const formProps: any = {};
    // if (importDS) {
    //   formProps.dataSet = importDS;
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
              name: 'businessObjectImportTemplateId',
              type: 'string',
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
          // addonBefore={importDS && `${domainCode}_`}
        />
        <IntlField name="templateName" suffix={<Icon type="language" />} />
        <IntlField name="remark" colSpan={col} suffix={<Icon type="language" />} />
        <Select name="templateCategory" />
      </Form>
    );
  }
);
