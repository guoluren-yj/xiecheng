import React, { PureComponent } from 'react';
import { Card } from 'choerodon-ui';
import { DataSet, Form, TextField, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import { isEmpty } from 'lodash';
import { fieldMappingTableDS, onlyReadFormDS } from '@/stores/DataMapping/DataMappingDS';
import getLang from '@/langs/mappingDebugLang';
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
    const { modal } = this.props;
    modal.update({
      footer: (_okBtn, cancelBtn) => (
        <div style={{ textAlign: 'right' }}>
          <Button color="primary" onClick={this.handleSave}>
            {getLang('SURE')}
          </Button>
          {cancelBtn}
        </div>
      ),
    });
  }

  /**
   * 确定
   */
  @Bind()
  async handleSave() {
    const { modal, onUpdateCondition } = this.props;
    const validate = await this.fieldMappingTableDS.validate();
    if (validate) {
      onUpdateCondition(this.fieldMappingTableDS.current.toData());
      modal.close();
    } else {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
    }
  }

  @Bind()
  getFormat(format) {
    const { jsonLogicFormat: conditionJson, stringFormat: evaluateExpression } = format;
    const { current } = this.fieldMappingTableDS;
    const sourceMappingFields = this.formatExpression(evaluateExpression);
    current.set('conditionJson', conditionJson);
    current.set('evaluateExpression', evaluateExpression);
    current.set('sourceMappingFields', sourceMappingFields);
  }

  /**
   * 格式化条件字符串
   */
  formatExpression(expression) {
    let temp = expression;
    if (isEmpty(temp)) {
      return '';
    }
    // 匹配浮点数或整数正则
    const pattern = /([+]\d+[.]\d+|[-]\d+[.]\d+|\d+[.]\d+|[+]\d+|[-]\d+|\d+)/gi;
    // 删除原字符串首个双引号
    temp = temp.replace(/"/, '');
    // 删除原字符串最后一个双引号
    temp = temp.replace(/(.*)"/, '$1');
    // 原字符串中所有的双引号替换为单引号
    temp = temp.replace(/\\"/g, "'");
    const matchList = temp.match(pattern);
    // 把字符串中的数字字符串的单引号删掉
    matchList.forEach((str) => {
      let formatedStr = str.replace(/"/, '');
      formatedStr = formatedStr.replace(/(.*)"/, '$1');
      const macther = new RegExp(`'${formatedStr}'`);
      temp = temp.replace(macther, formatedStr);
    });
    return temp;
  }

  render() {
    const { logicValue } = this.props;
    const logicOperationProps = {
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
