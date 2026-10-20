/**
 * 接口基础配置
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/8/24
 * @copyright HAND ® 2021
 */
import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { DataSet, Form, Select, Spin, Lov } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { applyConfigFormDS } from '@/stores/BasicConfig/BasicConfigDS';
import getLang from '@/langs/basicConfigLang';
import CollapsePanel from '@/components/CollapsePanel';
import { APPROVAL_TYPE_CONSTANTS } from '@/constants/constants';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class BasicConfig extends React.Component {
  constructor(props) {
    super(props);
    this.applyConfigFormDS = new DataSet(
      applyConfigFormDS({
        onFieldUpdate: this.handleFieldUpdate,
        onLoad: this.handleDataLoad,
      })
    );
    this.state = {
      approvalType: APPROVAL_TYPE_CONSTANTS.FUNCTION,
    };
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const validate = await this.applyConfigFormDS.validate();
    if (!validate) {
      return notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
    }
    return this.applyConfigFormDS.submit();
  }

  @Bind()
  handleFieldUpdate({ name, value, record }) {
    if (name === 'approvalType') {
      if (value === APPROVAL_TYPE_CONSTANTS.WORKFLOW) {
        record.set('messageLov', undefined);
      } else {
        record.set('workflowLov', undefined);
      }
      this.setState({ approvalType: value });
    }
  }

  @Bind()
  handleDataLoad({ dataSet }) {
    const { approvalType } = dataSet?.records[0]?.toData();
    this.setState({ approvalType });
  }

  render() {
    const { match } = this.props;
    const { approvalType } = this.state;
    const { path } = match;
    return (
      <>
        <Header title={getLang('HEADER')}>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.save`,
                type: 'button',
                meaning: '接口基础配置-保存',
              },
            ]}
            icon="save"
            type="c7n-pro"
            color="primary"
            onClick={() => this.handleSave()}
          >
            {getLang('SAVE')}
          </ButtonPermission>
        </Header>
        <Content>
          <Spin dataSet={this.applyConfigFormDS}>
            <CollapsePanel
              eles={[
                {
                  key: 'applyConfig',
                  title: getLang('APPLY_CONFIG'),
                  ele: (
                    <Form dataSet={this.applyConfigFormDS} columns={3}>
                      <Select name="approvalType" />
                      {approvalType === APPROVAL_TYPE_CONSTANTS.FUNCTION && (
                        <Lov name="messageLov" />
                      )}
                      {approvalType === APPROVAL_TYPE_CONSTANTS.WORKFLOW && (
                        <Lov name="workflowLov" />
                      )}
                    </Form>
                  ),
                },
              ]}
            />
          </Spin>
        </Content>
      </>
    );
  }
}
