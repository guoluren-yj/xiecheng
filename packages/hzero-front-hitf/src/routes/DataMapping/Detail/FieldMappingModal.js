import React, { PureComponent } from 'react';
import { Card } from 'choerodon-ui';
import { DataSet, Form, TextField } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import { fieldMappingTableDS, onlyReadFormDS } from '@/stores/DataMapping/DataMappingDS';
import getLang from '@/langs/dataMappingLang';
import LogicOperation from '@/components/LogicOperation';

export default class MappingDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.fieldMappingTableDS = new DataSet({
      ...fieldMappingTableDS(),
    });
    this.onlyReadFormDS = new DataSet({
      ...onlyReadFormDS(),
    });
  }

  componentDidMount() {
    this.handleUpdateModalProp();
    this.init();
  }

  init() {
    const { fieldMappingData = {} } = this.props;
    this.onlyReadFormDS.loadData([fieldMappingData]);
    this.fieldMappingTableDS.loadData([fieldMappingData]);
  }

  /**
   * 更新当前Modal的属性
   */
  @Bind()
  handleUpdateModalProp() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const validate = await this.fieldMappingTableDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    return this.fieldMappingTableDS.submit().then((res) => {
      if (res && res.success) {
        this.props.onFetchLine();
      }
    });
  }

  @Bind()
  getFormat(format) {
    const { jsonLogicFormat: conditionJson, stringFormat: evaluateExpression } = format;
    const { current } = this.fieldMappingTableDS;
    current.set('conditionJson', conditionJson);
    current.set('evaluateExpression', evaluateExpression);
  }

  render() {
    // const { formItems } = this.state;
    const { logicValue, readOnly } = this.props;
    const logicOperationProps = {
      readOnly,
      value: logicValue,
      onGetFormat: this.getFormat,
    };
    return (
      <>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<h3>{getLang('BASIC_INFO')}</h3>}
        >
          <Form dataSet={this.onlyReadFormDS} columns={2} disabled>
            <TextField name="castField" />
          </Form>
        </Card>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<h3>{getLang('CONDITION_MAINTAIN')}</h3>}
        >
          <LogicOperation {...logicOperationProps} />
        </Card>
      </>
    );
  }
}
