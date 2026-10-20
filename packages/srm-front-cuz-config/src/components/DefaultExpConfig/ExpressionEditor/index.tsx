import React, { ReactNode } from 'react';
import intl from 'hzero-front/lib/utils/intl';
import { DataSet, Form, Icon, Output, TextField, Tooltip } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

export interface Props {
  res?: string;
  prefix?: string;
  updateHook: Function;
  readOnly?: boolean;
}

export default class ExpressionEditor extends React.Component<Props> {
  static displayName = 'ExpressionEditor';

  static defaultProps = {
    prefix: 'default-exp-config-code-area',
  };

  ds = new DataSet({
    fields: [
      {
        name: 'result',
        label: intl.get('hpfm.customize.common.defaultExpression').d('默认值表达式'),
        type: FieldType.string,
        defaultValue: 'a',
      },
    ],
    events: {
      create: ({ record }) => {
        this.props.updateHook(record.get('result'));
      },
      update: ({ record }) => {
        this.props.updateHook(record.get('result'));
      },
    },
  });

  constructor(props) {
    super(props);
    if (props.res) {
      this.ds.create({ result: props.res });
    } else this.ds.create();
  }

  getValue = () => (this.ds.current as Record).get('result');

  render(): ReactNode {
    const { readOnly } = this.props;
    return (
      <Form dataSet={this.ds} labelLayout={LabelLayout.vertical} style={{ padding: '0 20px' }}>
        {
          readOnly ? (
            <Output
              name="result"
              disabled={readOnly}
            />
          ) : (
            <TextField
              name="result"
              addonAfter={(
                <Tooltip title={intl.get("hpfm.customize.common.expressionEditorHelp").d("如涉及16位以上数字，请使用大数字运算中的函数代替基本运算符号")}>
                  <Icon type="help" />
                </Tooltip>
              )}
            />
          )
        }
      </Form>
    );
  }

  processValue = (value = '') => value.replace(/[\r\n]/, '');
}
