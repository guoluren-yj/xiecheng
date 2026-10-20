/**
 * TemplateHeader - 模板头信息
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import FormField from '@/routes/components/FormField';

export default class TemplateHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { isEdit = false, dataSet, isCreate = false, customizeForm } = this.props;

    return customizeForm ? (
      customizeForm(
        {
          code: 'SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.HEADER_INFO',
        },
        <Form
          useWidthPercent
          dataSet={dataSet}
          columns={3}
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        >
          <FormField isEdit={isEdit} name="templateCode" />
          <FormField isEdit={isEdit} name="templateName" componentType="INTLFIELD" />
          <FormField isEdit={isEdit} name="investigateType" componentType="SELECT" />
          <FormField isEdit={isEdit} name="industryId" componentType="LOV" />
          <FormField isEdit={isEdit} name="remark" />
          <FormField
            isEdit={isEdit}
            name="creationDate"
            componentType="DateTimePicker"
            hidden={isCreate}
          />
          <FormField
            isEdit={isEdit}
            name="reserveFlag"
            componentType="CHECKBOX"
            help={intl
              .get('sslm.investTempConfig.model.investTempConfig.reserveFlagMsg')
              .d(
                '开启此配置时建议检查跨模板或跨版本调查表模板内，同一预留字段是否有代表不同的业务意义或配置了不同的属性'
              )}
            showHelp={isEdit ? 'tooltip' : 'label'}
            renderer={({ value }) => yesOrNoRender(value)}
          />
        </Form>
      )
    ) : (
      <Form
        dataSet={dataSet}
        columns={3}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        style={isEdit ? { width: '75%', maxWidth: 1172 } : {}}
      >
        <FormField isEdit={isEdit} name="templateCode" />
        <FormField isEdit={isEdit} name="templateName" />
        <FormField isEdit={isEdit} name="investigateType" componentType="SELECT" />
        <FormField isEdit={isEdit} name="industryId" componentType="LOV" />
        <FormField isEdit={isEdit} name="remark" />
        <FormField
          isEdit={isEdit}
          name="creationDate"
          componentType="DateTimePicker"
          hidden={isCreate}
        />
        <FormField
          isEdit={isEdit}
          name="reserveFlag"
          componentType="CHECKBOX"
          help={intl
            .get('sslm.investTempConfig.model.investTempConfig.reserveFlagMsg')
            .d(
              '开启此配置时建议检查跨模板或跨版本调查表模板内，同一预留字段是否有代表不同的业务意义或配置了不同的属性'
            )}
          showHelp={isEdit ? 'tooltip' : 'label'}
          renderer={({ value }) => yesOrNoRender(value)}
        />
      </Form>
    );
  }
}
