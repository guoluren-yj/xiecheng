/* eslint-disable no-nested-ternary */
/* eslint-disable eqeqeq */
import React, { Component } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { Record } from 'choerodon-ui/dataset';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray, values } from 'lodash';

import intl from 'hzero-front/lib/utils/intl';
import { SEARCHBAR_RANGE_COMPONENT } from '@/utils/constConfig';

interface FieldEditorProps {
  record: Record;
  originFields: any[];
}

interface FieldEditorState {
  selectOptions: any;
}

export default class FieldEditor extends Component<FieldEditorProps, FieldEditorState> {
  constructor(props) {
    super(props);
    this.state = {
      selectOptions: {},
    };
  }

  @Bind()
  generateDefaultValueText(records, displayField, valueField, multipleFlag) {
    if (!isArray(records) || isEmpty(records)) {
      return null;
    }
    // 若lov查询结果中无配置的displayField，则用原始displayField
    // 多选
    if (multipleFlag === 1) {
      const text = {};
      records.forEach((item) => {
        text[item[valueField] || ''] = item[displayField];
      });
      return text;
    } else {
      return records[0][displayField];
    }
  }

  @Bind()
  generateLovDefaultValue(records, displayField) {
    if (!isArray(records) || isEmpty(records)) {
      return null;
    }
    return records.map((item) => item[displayField]).join(',');
  }

  @Bind()
  renderDefaultValue(record) {
    if (!record) {
      return '-';
    }
    const { fieldAlias, defaultValue, lovValueRecords, proDefaultFlag } =
      record.get(["fieldAlias", "defaultValue", "lovValueRecords", "proDefaultFlag"]);
    if (proDefaultFlag === 1) {
      return defaultValue;
    }
    if (!defaultValue) {
      return null;
    }
    const { originFields = [] } = this.props;
    if (isEmpty(originFields)) {
      return null;
    }
    const targetField = originFields.find((item) => item.fieldAlias === fieldAlias) || {};
    const { widget, displayField } = targetField;
    const { lovInfo, fieldWidget, multipleFlag, lovEnhanceFlag } = widget || {};
    const { displayField: originDisplayField } = lovInfo || {};
    if (fieldWidget === 'LOV') {
      if (lovEnhanceFlag === 1) {
        return undefined;
      }
      if (lovValueRecords) {
        return this.generateLovDefaultValue(lovValueRecords, displayField || originDisplayField);
      }
    } else if (fieldWidget === 'SELECT' && !isEmpty(lovValueRecords)) {
      const meanings = values(lovValueRecords);
      if (meanings.length < defaultValue.split(',').length) {
        return meanings.join(',').concat('...');
      } else {
        return meanings.join(',');
      }
    } else if (
      SEARCHBAR_RANGE_COMPONENT.includes(fieldWidget) &&
      defaultValue &&
      multipleFlag === 1
    ) {
      return defaultValue.split(',').join('~');
    }
    return defaultValue;
  }

  render() {
    const {
      record,
    } = this.props;
    
    return (
      <Form
        className={'c7n-pro-vertical-form-display'}
        labelLayout={LabelLayout.vertical}
        record={record}
        disabled
      >
        <Output name='fieldAlias' label={intl.get('hpfm.searchBar.model.searchBar.fieldCode').d('字段编码')} />
        <Output name='fieldName' label={intl.get('hpfm.searchBar.model.searchBar.fieldName').d('字段名称')} />
        <Output name='widget.fieldWidget' label={intl.get('hpfm.searchBar.model.searchBar.widgetType').d('组件类型')} />
        <Output 
          name='widget.sourceCode'
          label={intl.get('hpfm.searchBar.model.searchBar.sourceCode').d('数据来源值集')}
          hidden={!['LOV', 'SELECT'].includes(record.get('widget.fieldWidget'))}
        />
        <Output
          label={intl.get('hpfm.searchBar.model.searchBar.defaultValue').d('默认值')}
          name='defaultValue'
          renderer={({ record }) => this.renderDefaultValue(record)}
        />
        <Output
          name='fixedFlag'
          label={intl.get('hpfm.searchBar.model.searchBar.fixed').d('冻结')}
        />
      </Form>
    );
  }
}
