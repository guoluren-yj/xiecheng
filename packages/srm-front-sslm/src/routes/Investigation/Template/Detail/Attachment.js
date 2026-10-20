/**
 * 附件信息
 * @date: 2018-8-15
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Tabs, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { queryMapIdpValue } from 'services/api';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import AttachmentTemplate from './AttachmentTemplate';
import FieldTable from './spfm/FieldTable';

@formatterCollections({
  code: ['spfm.investigationDefinition'],
})
@Form.create({ fieldNameProp: null })
export default class Attachment extends React.PureComponent {
  state = {
    code: {},
  };

  componentDidMount() {
    queryMapIdpValue({
      updateMethod: 'SSLM_INVESTG_ATT_WRITE_METHOD',
    }).then(response => {
      const res = getResponse(response);
      if (res) {
        this.setState({ code: res });
      }
    });
  }

  /**
   * 保存修改数据
   */
  @Bind()
  onHandleAdd(formData, dataSource) {
    const { onHandleSave } = this.props;
    onHandleSave(formData, dataSource);
  }

  /**
   * 改变是否调查当前页签
   */
  @Bind()
  onHandleChange({ investigateFlag, atLeastOneFlag }) {
    const {
      dataSource: { lines, ...other },
      onHandleSwitchChange,
    } = this.props;
    onHandleSwitchChange({ ...other, investigateFlag, atLeastOneFlag });
  }

  render() {
    const {
      title = intl.get(`spfm.investigationDefinition.view.message.tab.attachment`).d('附件信息'),
      dataSource: { lines, investigateFlag, atLeastOneFlag, gridFlag, configName, ...rest },
      templateProp,
      saving,
      queryTemplateConfig,
    } = this.props;
    const { code } = this.state;

    return (
      <Tabs animated={false}>
        <Tabs.TabPane tab={title} key="attachment">
          <FieldTable
            col={2}
            saving={saving}
            dataSource={lines}
            gridFlag={gridFlag}
            atLeastOneFlag={atLeastOneFlag}
            investigateFlag={investigateFlag}
            configName={configName}
            onHandleAdd={this.onHandleAdd}
            onHandleChange={this.onHandleChange}
            rest={rest}
            code={code}
            queryTemplateConfig={queryTemplateConfig}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl
            .get(`spfm.investigationDefinition.view.title.attachmentTemplate`)
            .d('附件模板定义')}
          key="attachmentTemplate"
        >
          <AttachmentTemplate {...templateProp} />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
