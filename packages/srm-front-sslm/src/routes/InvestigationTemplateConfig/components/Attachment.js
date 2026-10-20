/**
 * Attachment - 附件信息
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Tabs, Form, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

import FormField from '@/routes/components/FormField';

import styles from '../index.less';
import FieldTable from './FieldTable';
import AttachmentTemplate from './AttachmentTemplate';
import { getAttachmentTemplateDS } from '../Detail/stores/attachmentTemplateDS';

const TabBarExtraContent = ({ isEdit, headerDs }) => {
  return isEdit ? (
    <Form
      columns={1}
      useColon={false}
      dataSet={headerDs}
      labelLayout="float"
      className={styles['template-tabs-enable-switch']}
      style={{ width: 154, marginLeft: 'auto', overflow: 'hidden' }}
    >
      <FormField isEdit name="investigateFlag" componentType="CHECKBOX" />
    </Form>
  ) : null;
};

export default class Attachment extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.attachmentTemplateDs = new DataSet(getAttachmentTemplateDS());
    this.state = {
      activeKey: 'attachment',
    };
  }

  /**
   * tab切换的回调
   */
  @Bind()
  handleTabChange(key) {
    this.setState({
      activeKey: key,
    });
  }

  render() {
    const { activeKey } = this.state;
    const {
      tableDs,
      headerDs,
      isEdit,
      configName,
      handleRefresh,
      queryTemplateConfig,
      oldInvestigateTemplateId,
      newInvestigateTemplateId,
    } = this.props;
    return (
      <React.Fragment>
        <Tabs
          animated={false}
          activeKey={activeKey}
          onChange={this.handleTabChange}
          className={styles['template-tabs-attachment']}
          tabBarExtraContent={
            activeKey === 'attachment' ? (
              <TabBarExtraContent isEdit={isEdit} headerDs={headerDs} />
            ) : null
          }
        >
          <Tabs.TabPane
            tab={intl.get(`spfm.investigationDefinition.view.message.tab.attachment`).d('附件信息')}
            key="attachment"
          >
            <FieldTable
              tableDs={tableDs}
              headerDs={headerDs}
              isEdit={isEdit}
              configName={configName}
              handleRefresh={handleRefresh}
              queryTemplateConfig={queryTemplateConfig}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl
              .get(`spfm.investigationDefinition.view.title.attachmentTemplate`)
              .d('附件模板定义')}
            key="attachmentTemplate"
          >
            <AttachmentTemplate
              isEdit={isEdit}
              tableDs={this.attachmentTemplateDs}
              oldInvestigateTemplateId={oldInvestigateTemplateId}
              newInvestigateTemplateId={newInvestigateTemplateId}
            />
          </Tabs.TabPane>
        </Tabs>
      </React.Fragment>
    );
  }
}
