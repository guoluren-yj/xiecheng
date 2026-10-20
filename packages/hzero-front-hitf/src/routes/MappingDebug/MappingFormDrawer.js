import React, { PureComponent } from 'react';
import { Form, TextField, DataSet, Select, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import { mappingLineFormDS } from '@/stores/DataMapping/DataMappingDS';
import getLang from '@/langs/mappingDebugLang';

export default class MappingDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.mappingLineFormDS = new DataSet({
      ...mappingLineFormDS(),
    });
  }

  componentDidMount() {
    this.loadData(this.props);
    this.handleUpdateModalProp();
  }

  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.loadData(nextProps);
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
    const { isNew, modal, onUpdateMappingLine } = this.props;
    const validate = await this.mappingLineFormDS.validate();
    if (validate) {
      modal.close();
      onUpdateMappingLine(isNew, this.mappingLineFormDS.current.toData());
    } else {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
    }
  }

  /**
   * 数据加载
   */
  loadData(data) {
    const { isNew, mappingLine } = data;
    if (!isNew) {
      this.mappingLineFormDS.loadData([mappingLine]);
    }
  }

  render() {
    return (
      <>
        <Form labelLayout="horizontal" dataSet={this.mappingLineFormDS} columns={1}>
          <TextField name="targetValue" />
          <Select name="fieldType" />
          {/* <Select name="conjunction" /> */}
        </Form>
      </>
    );
  }
}
