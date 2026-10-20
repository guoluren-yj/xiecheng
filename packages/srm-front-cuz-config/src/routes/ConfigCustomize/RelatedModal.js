import React from 'react';
import { Form, Modal, Popconfirm, Icon, Input, Tooltip, Alert } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import styles from './index.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class RelatedModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // loading: false,
      fieldLovMaps: [],
    };
  }

  componentDidMount() {
    const { fieldLovMaps } = this.props;
    this.setState({ fieldLovMaps: [...fieldLovMaps] });
  }

  @Bind()
  onOk() {
    const { record, form, onClose, updateLovMappings } = this.props;
    const { fieldLovMaps } = this.state;
    form.validateFields((err, values) => {
      if (err) return;
      const newFieldLovMaps = fieldLovMaps
        .map((_, index) => {
          if (!_) return false;
          return {
            ..._,
            sourceModelId: values[`sourceModelId#${index}`],
            modelName: values[`modelName#${index}`],
            sourceFieldAlias: values[`sourceFieldAlias#${index}`],
            sourceModelFieldCode: values[`sourceModelFieldCode#${index}`],
            sourceFieldCode: values[`sourceFieldCode#${index}`],
            sourceModelCode: values[`sourceModelCode#${index}`],
            sourceFieldId: values[`sourceFieldId#${index}`],
            sourceFieldName: values[`sourceFieldName#${index}`],
            targetModelCode: values[`targetModelCode#${index}`],
            targetFieldId: values[`targetFieldId#${index}`],
            targetFieldCode: values[`targetFieldCode#${index}`],
            targetModelFieldCode: values[`targetModelFieldCode#${index}`],
            targetFieldName: values[`targetFieldName#${index}`],
          };
        })
        .filter(Boolean);
      record.fieldLovMaps = newFieldLovMaps;
      updateLovMappings(newFieldLovMaps);
      onClose();
    });
  }

  setFieldInfo(record, i) {
    const { form } = this.props;
    const { fieldCode, fieldName } = record;
    form.setFieldsValue({
      [`sourceFieldAlias#${i}`]: fieldCode,
      [`sourceFieldName#${i}`]: fieldName,
    });
  }

  setModel(record, i) {
    const { form } = this.props;
    const { modelName, modelCode } = record;
    form.setFieldsValue({
      [`modelName#${i}`]: modelName,
      [`sourceModelCode#${i}`]: modelCode,
    });
  }

  setTargetField(record, i) {
    const { form } = this.props;
    const { fieldId, fieldName, fieldCode, modelCode } = record;
    form.setFieldsValue({
      [`targetFieldId#${i}`]: fieldId,
      [`targetFieldName#${i}`]: fieldName,
      [`targetFieldCode#${i}`]: fieldCode,
      [`targetModelFieldCode#${i}`]: fieldCode,
      [`targetModelCode#${i}`]: modelCode,
    });
  }

  onDelete(index) {
    const { fieldLovMaps } = this.state;
    this.setState({ fieldLovMaps: fieldLovMaps.map((_, i) => (i === index ? undefined : _)) });
  }

  @Bind()
  addMap() {
    const { fieldLovMaps } = this.state;
    fieldLovMaps.push({});
    this.setState({ fieldLovMaps });
  }

  render() {
    const { fieldLovMaps } = this.state;
    const { visible, onClose, form, id, lovViewCode } = this.props;

    return (
      <Modal
        destroyOnClose
        maskClosable
        width={780}
        visible={visible}
        onCancel={onClose}
        onOk={this.onOk}
        bodyStyle={{ padding: '12px' }}
        title={intl.get('hpfm.individual.view.message.title.relatedField').d('设置关联字段')}
      >
        <Alert
          type="info"
          showIcon
          style={{ display: 'block', marginLeft: '18px', marginBottom: '8px' }}
          message={
            <>
              {intl.get('hpfm.individual.view.setRelatedField.tip1').d('请在左侧选择')}
              <a
                rel="noopener noreferrer"
                target="_blank"
                href={`${window.location.origin}${
                  window.$$env.BASE_PATH ? window.$$env.BASE_PATH : ''
                }hpfm/lov-view/lov-view-list?viewCode=${lovViewCode}`}
              >
                {intl.get('hpfm.individual.view.message.lovView').d('值集视图')}
              </a>
              {intl
                .get('hpfm.individual.view.setRelatedField.tip2')
                .d('已有字段（可选范围包括非表格列非查询列字段），将值带至右侧选择的个性化字段中')}
            </>
          }
        />
        {fieldLovMaps.map((i, index) => {
          if (!i) return null;
          return (
            <div className={styles['lov-map-wrap']}>
              <div className="container">
                <FormItem>
                  {form.getFieldDecorator(`sourceFieldCode#${index}`, {
                    initialValue: i.sourceFieldCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hpfm.individual.model.config.sourceGridField')
                            .d('Lov表字段'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="HPFM.CUST.RELATE.FIELD.LIST"
                      queryParams={{ viewCode: lovViewCode }}
                      textValue={i.sourceFieldName}
                      onChange={(_, r) => this.setFieldInfo(r, index)}
                      placeHolder={intl
                        .get('hpfm.individual.model.config.sourceGridField')
                        .d('Lov表字段')}
                    />
                  )}
                  {form.getFieldDecorator(`sourceFieldName#${index}`, {
                    initialValue: i.sourceFieldName,
                  })}
                </FormItem>
                <FormItem>
                  {form.getFieldDecorator(`sourceFieldAlias#${index}`, {
                    initialValue: i.sourceFieldAlias,
                  })(
                    <Input
                      placeHolder={intl
                        .get('hpfm.individual.model.config.sourceFieldAlias')
                        .d('Lov表字段别名')}
                    />
                  )}
                </FormItem>
              </div>
              <Icon type="arrow-right" />
              <div className="container">
                <FormItem>
                  {form.getFieldDecorator(`targetField#${index}`, {
                    initialValue: i.targetFieldId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hpfm.individual.model.config.targetField')
                            .d('映射字段编码'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="HPFM.CUST.CONFIG_FIELD_VIEW"
                      queryParams={{ unitId: id }}
                      lovOptions={{ valueField: 'bizKey', displayField: 'fieldName' }}
                      onChange={(_, r) => this.setTargetField(r, index)}
                      textValue={i.targetFieldName}
                      placeHolder={intl
                        .get('hpfm.individual.model.config.targetField')
                        .d('映射字段编码')}
                    />
                  )}
                  {form.getFieldDecorator(`targetFieldId#${index}`, {
                    initialValue: i.targetFieldId,
                  })}
                  {form.getFieldDecorator(`targetFieldName#${index}`, {
                    initialValue: i.targetFieldName,
                  })}
                  {form.getFieldDecorator(`targetFieldCode#${index}`, {
                    initialValue: i.targetFieldCode,
                  })}
                  {form.getFieldDecorator(`targetModelFieldCode#${index}`, {
                    initialValue: i.targetModelFieldCode,
                  })}
                  {form.getFieldDecorator(`targetModelCode#${index}`, {
                    initialValue: i.targetModelCode,
                  })}
                </FormItem>
              </div>
              <Popconfirm
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                okText={intl.get('hzero.common.status.yes').d('是')}
                cancelText={intl.get('hzero.common.status.no').d('否')}
                onConfirm={() => this.onDelete(index)}
              >
                <Tooltip
                  placement="topRight"
                  title={intl.get('hzero.common.button.delete').d('删除')}
                >
                  <div className="delete">
                    <Icon type="delete" />
                  </div>
                </Tooltip>
              </Popconfirm>
            </div>
          );
        })}
        <Tooltip placement="right" title={intl.get('hzero.common.button.new').d('新建')}>
          <div className={styles['plus-container']} onClick={this.addMap}>
            <Icon type="plus-circle-o" />
          </div>
        </Tooltip>
      </Modal>
    );
  }
}
