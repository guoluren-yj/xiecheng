import React, { PureComponent } from 'react';
import { Form, Button, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const FormItem = Form.Item;
const { Option } = Select;

/**
 * 供应商管控维度查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@formatterCollections({
  code: 'sslm.dimConfig',
})
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator },
      dimConfig: { dimensionType = [], dimension = {} },
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('sslm.dimConfig.model.dimConfig.dimensionCode').d('生命周期管控维度')}
        >
          {getFieldDecorator('dimensionCode', {
            initialValue: dimension.dimensionCode !== 'BOTH' ? dimension.dimensionCode : '',
          })(
            <Select style={{ width: 150 }} disabled={dimension.dimensionCode !== 'BOTH'} allowClear>
              {dimensionType
                .filter((m) => m.value !== 'BOTH')
                .map((m) => {
                  return (
                    <Option key={m.value} value={m.value}>
                      {m.meaning}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
        <FormItem
          label={intl.get('sslm.dimConfig.model.dimConfig.ablilityDimension').d('供货能力管控维度')}
        >
          {getFieldDecorator('supplyListDimensionCode', {
            initialValue:
              dimension.supplyListDimensionCode !== 'BOTH' ? dimension.supplyListDimensionCode : '',
          })(
            <Select
              style={{ width: 150 }}
              disabled={dimension.supplyListDimensionCode !== 'BOTH'}
              allowClear
            >
              {dimensionType
                .filter((m) => m.value !== 'BOTH')
                .map((m) => {
                  return (
                    <Option key={m.value} value={m.value}>
                      {m.meaning}
                    </Option>
                  );
                })}
            </Select>
          )}
        </FormItem>
        <FormItem label={intl.get('sslm.dimConfig.model.dimConfig.condition').d('供应商')}>
          {getFieldDecorator('condition')(<Input style={{ width: 150 }} />)}
        </FormItem>
        <FormItem>
          <Button onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginLeft: 8 }}
            onClick={() => this.handleSearch()}
          >
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
