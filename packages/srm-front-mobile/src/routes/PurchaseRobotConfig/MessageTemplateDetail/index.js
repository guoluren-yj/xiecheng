import React, { Fragment, Component } from 'react';
import { Header } from 'components/Page';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { TopSection } from '_components/Section';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import TaskLine from './TaskLine';
import BasicInfo from './BasicInfo';
import { basicInfoDS, taskLineDS } from './indexDS';
import { saveMessageTemplate, deleteMessageTemplateApi } from '@/services/MessageTemplateService';
import styles from './index.less';

@formatterCollections({ code: ['smbl.purchaseRobotConfig', 'smbl.common', 'hzero.common'] })
export default class MessageTemplateDetail extends Component {
  constructor(props) {
    super(props);
    const readOnly = !this.props.location.state?.canEidt;
    const templateId = this.props.location.state?.templateId || null;
    const basicInfoDataSet = new DataSet(
      basicInfoDS(templateId, ({ dataSet }) => {
        const enabledFlag = dataSet?.current?.get('enabledFlag');
        this.setState({ enabledFlag });
      })
    );
    if (!templateId) basicInfoDataSet.create({});
    this.state = {
      enabledFlag: null,
      templateId,
      // 基本信息ds
      basicInfoDataSet,
      // 任务行ds
      lineDataSet: templateId
        ? new DataSet(taskLineDS(templateId, readOnly))
        : new DataSet(taskLineDS(null, readOnly)),
    };
  }

  handleDelete = async () => {
    Modal.confirm({
      children: intl
        .get('smbl.purchaseRobotConfig.view.message.deleteTemplate')
        .d('是否确认删除该模板?'),
      onOk: async () => {
        const data = this.state.basicInfoDataSet.current?.toData();
        data.enabledFlag = this.state.enabledFlag;
        const res = await deleteMessageTemplateApi([data]);
        if (getResponse(res)) {
          notification.success();
          this.props.history.goBack();
          return true;
        } else {
          return false;
        }
      },
    });
  };

  @Bind
  async handleSave() {
    const { basicInfoDataSet, lineDataSet } = this.state;
    const headInfo = basicInfoDataSet.toData()[0] || {};
    const lineInfo = lineDataSet.toJSONData();
    const params = {
      ...headInfo,
      tenantId: getCurrentOrganizationId(),
      robotMsgTmplLineList: lineInfo,
    };
    const res = await saveMessageTemplate(params);
    if (getResponse(res)) {
      notification.success();
      basicInfoDataSet.setQueryParameter('templateId', res?.templateId);
      lineDataSet.setQueryParameter('templateId', res?.templateId);
      this.setState({ templateId: res?.templateId });
      basicInfoDataSet.query();
    }
  }

  render() {
    const { basicInfoDataSet, lineDataSet, enabledFlag } = this.state;
    const disabled = !this.props.location.state?.canEidt;
    return (
      <Fragment>
        <Header
          title={intl.get(`hzero.common.view.title.robotMessageTemplate`).d('机器人消息模版')}
          backPath="/smbl/purchase-robot/config/list"
        >
          {!disabled && (
            <Button icon="save" color="primary" onClick={() => this.handleSave()}>
              {intl.get(`hzero.common.button.save`).d('保存')}
            </Button>
          )}
          {!disabled && enabledFlag === 0 ? (
            <Button
              funcType="flat"
              icon="delete"
              style={{ marginRight: '8px' }}
              onClick={() => this.handleDelete()}
            >
              {intl.get('smbl.common.view.button.delete').d('删除')}
            </Button>
          ) : null}
        </Header>
        <TopSection
          className={styles['notice-content']}
          title={intl.get(`hzero.common.view.title.baseInfo`).d('基本信息')}
        >
          <BasicInfo
            basicInfoDataSet={basicInfoDataSet}
            disabled={disabled}
            onEnabledChanged={(val) => this.setState({ enabledFlag: val })}
          />
        </TopSection>
        <TopSection
          className={styles['notice-content']}
          hidden={!this.state.templateId}
          title={intl.get(`hzero.common.view.title.template`).d('模板')}
        >
          <TaskLine lineDataSet={lineDataSet} disabled={disabled} />
        </TopSection>
      </Fragment>
    );
  }
}
