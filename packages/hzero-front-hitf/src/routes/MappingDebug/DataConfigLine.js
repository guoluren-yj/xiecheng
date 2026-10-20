import React, { PureComponent } from 'react';
import { Form, TextField, Select, DataSet, Lov, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import { castLineFormDS } from '@/stores/DataMapping/DataMappingDS';
import getLang from '@/langs/mappingDebugLang';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';

@formatterCollections({ code: ['hzero.common', getLang('PERFIX')] })
export default class DataConfigLineDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      castType: props.castType,
    };
    this.dataConfigLineFormDS = new DataSet({
      ...castLineFormDS(),
    });
  }

  componentDidMount() {
    this.loadData(this.props);
    this.handleUpdateModalProp();
  }

  /**
   * 数据加载
   * @param {*} data
   */
  @Bind()
  loadData(data) {
    const {
      isNew,
      tenantId,
      castRoot,
      castField,
      castType,
      castLovCode,
      castLovField,
      langLov,
      castLovLang,
      castLovLangMeaning,
      desensitizeRuleId,
      desensitizeRuleName,
    } = data;
    const record = {
      tenantId,
      castRoot,
      castField,
      castType,
      castLovCode,
      castLovField,
      langLov,
      castLovLang,
      castLovLangMeaning,
      desensitizeRuleId,
      desensitizeRuleName,
    };
    if (!isNew) {
      this.dataConfigLineFormDS.loadData([record]);
      this.dataConfigLineFormDS.select(record);
    }
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
    const { isNew, onUpdateDataConfig, modal } = this.props;
    const validate = await this.dataConfigLineFormDS.validate();
    if (validate) {
      onUpdateDataConfig(isNew, this.dataConfigLineFormDS.current.toData());
      modal.close();
    } else {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
    }
  }

  render() {
    const { castType } = this.state;
    return (
      <>
        <Form dataSet={this.dataConfigLineFormDS} columns={1}>
          <TextField name="castRoot" restrict="a-zA-Z0-9-_./" />
          <TextField name="castField" restrict="a-zA-Z0-9-_./" />
          <Select name="castType" onChange={(val) => this.setState({ castType: val })} />
          {castType === 'LOV' && <Lov name="castLovCodeLov" />}
          {castType === 'LOV' && <TextField name="castLovField" />}
          {castType === 'LOV' && <Lov name="langLov" />}
          {castType === 'DESENSITIZE' && <Lov name="desensitizeRuleLov" />}
        </Form>
      </>
    );
  }
}
