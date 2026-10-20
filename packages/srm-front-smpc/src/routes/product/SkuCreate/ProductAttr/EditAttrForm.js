import React, { Component } from 'react';
import { observer } from 'mobx-react-lite';
import { Row, Col, Select, TextField, NumberField, Icon, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import AttrValueSelect from '../MoreSelect';
import style from './index.less';

const commonStyle = { lineHeight: '35px', textAlign: 'center' };

const AttrsForm = observer(({ record, renderer = (e) => e }) => {
  return renderer(record);
});

export default class BaseAttrs extends Component {
  getAfterUom = (record, code) => {
    // lovPara: {
    //   categoryId,
    //   attrValueName,
    //   attrId: record.get('attrId'),
    //   enabledFlag: 1,
    // },
    // lookupUrl: `${SRM_SMPC}/v1/${organizationId}/skus/query-category-attr-value`,
    const attrPlaceholder = record.get('valueCustom')
      ? intl
          .get('smpc.product.view.chooseInputValuesName', {
            name: record.get('attributeName'),
          })
          .d(`可输入或选择${record.get('attributeName')}`)
      : intl
          .get('smpc.product.view.chooseValuesName', {
            name: record.get('attributeName'),
          })
          .d(`请选择${record.get('attributeName')}`);

    switch (code) {
      case '000000000008': // 税率
        return (
          <Row gutter={12}>
            <Col span={22}>
              <AttrValueSelect
                id={this.props.id}
                searchable
                record={record}
                clearButton={false}
                custom={record.get('valueCustom')}
                name="singAttrValue"
                mappingKey="singleAttrValLov"
                multiple={false}
                placeholder={attrPlaceholder}
              />
            </Col>
            <Col span={2} style={{ lineHeight: '35px' }}>
              %
            </Col>
          </Row>
        );
      case '000000000006': // 重量
        return (
          <Row className={style['inline-group-fields']}>
            <Col span={14}>
              <NumberField min={0} name="weight" label={record.get('attributeName')} />
            </Col>
            <Col span={7}>
              <Select name="weightUom" />
            </Col>
            <Col span={3} className={style['icon-help']}>
              <Tooltip
                placement="top"
                title={intl
                  .get('smpc.product.view.weightHelp')
                  .d('运费计价方式为按重量计费时请维护重量和单位属性')}
              >
                <Icon type="help" />
              </Tooltip>
            </Col>
          </Row>
        );
      case '000000000007': // 包装尺寸
        return (
          <Row gutter={6}>
            <Col span={6}>
              <NumberField name="length" label={record.get('attributeName')} min={0} />
            </Col>
            <Col span={2} style={commonStyle}>
              -
            </Col>
            <Col span={6}>
              <NumberField name="width" min={0} />
            </Col>
            <Col span={2} style={commonStyle}>
              -
            </Col>
            <Col span={6}>
              <NumberField name="height" min={0} />
            </Col>
            <Col span={2} style={commonStyle}>
              mm
            </Col>
          </Row>
        );
      default:
        return (
          <Row gutter={12}>
            <Col span={24}>
              {record.get('operationType') === 0 ? ( // 多选
                <AttrValueSelect
                  id={this.props.id}
                  searchable
                  record={record}
                  clearButton={false}
                  name="multiAttrValues"
                  mappingKey="multiAttrValLov"
                  custom={record.get('valueCustom')}
                  placeholder={attrPlaceholder}
                />
              ) : record.get('operationType') === 1 || record.get('operationType') === 3 ? ( // 单选
                <AttrValueSelect
                  record={record}
                  id={this.props.id}
                  searchable
                  clearButton={false}
                  multiple={false}
                  name="singAttrValue"
                  mappingKey="singleAttrValLov"
                  custom={record.get('valueCustom')}
                  placeholder={attrPlaceholder}
                />
              ) : (
                <TextField
                  name="description"
                  // label={record.get('attributeName')}
                />
              )}
            </Col>
          </Row>
        );
    }
  };

  render() {
    const { record } = this.props;
    return (
      <AttrsForm record={record} renderer={(r) => this.getAfterUom(r, r.get('attributeCode'))} />
    );
  }
}
