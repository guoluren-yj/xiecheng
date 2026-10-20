import React, { Fragment, Component } from 'react';
import { Header } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import { Button, DataSet, Modal } from 'choerodon-ui/pro';
import { TopSection } from '_components/Section';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import BasicInfo from './BasicInfo';
import TaskLine from './TaskLine';
import { basicInfoDS, taskLineDS } from './indexDS';
import styles from './index.less';
import { onlineSkill, offlineSkill } from '@/services/SkillTreeService';

const organizationId = getCurrentOrganizationId();
@formatterCollections({ code: ['smbl.purchaseRobotConfig', 'hzero.common', 'smbl.common'] })
export default class SkillTreeDetail extends Component {
  constructor(props) {
    super(props);
    // 可否编辑控制（整体）
    let skillId = this.props.match.params.skillId || null;
    if (skillId === 'new') {
      skillId = null;
    }
    this.state = {
      skillId,
      baseInfo: {},
      // 基本信息ds
      skillBasicInfoDataSet: null,
      // 任务行ds
      taskLineDataSet: null,
    };
  }

  componentDidMount() {
    const { skillId } = this.state;
    const taskLineDataSet = skillId ? new DataSet(taskLineDS(skillId)) : null;
    const skillBasicInfoDataSet = new DataSet(basicInfoDS(skillId, this, taskLineDataSet));
    this.setState({
      skillBasicInfoDataSet,
      taskLineDataSet,
    });
  }

  // 任务列表操作按钮
  headerButtons(baseInfo, skillId) {
    return [
      // 技能id存在（任务已创建），并且是自定义技能，才可以操作上下线
      skillId && baseInfo.skillStatus && Number(organizationId) === Number(baseInfo.tenantId)
        ? {
            name: 'publish',
            noNest: true,
            btnProps: {
              onClick: () => {
                const datas = this.state.skillBasicInfoDataSet.toData();
                const data = datas.length && datas[0];
                if (baseInfo.skillStatus === 'ONLINE') {
                  // 下线操作
                  Modal.confirm({
                    title: intl.get('smbl.common.message.tip').d('提示'),
                    children: intl
                      .get('smbl.purchaseRobotConfig.view.message.offlineSkillNotice')
                      .d('是否确认下线该技能?'),
                    onOk: async () => {
                      const res = await offlineSkill(data);
                      if (getResponse(res)) {
                        notification.success();
                      }
                      this.state.skillBasicInfoDataSet.query();
                      this.state.taskLineDataSet.query();
                    },
                  });
                } else {
                  // 上线操作
                  Modal.confirm({
                    title: intl.get('smbl.common.message.tip').d('提示'),
                    children: intl
                      .get('smbl.purchaseRobotConfig.view.message.onlineSkillNotice')
                      .d('是否确认上线该技能?'),
                    onOk: async () => {
                      const res = await onlineSkill(data);
                      if (getResponse(res)) {
                        notification.success();
                      }
                      this.state.skillBasicInfoDataSet.query();
                      this.state.taskLineDataSet.query();
                    },
                  });
                }
              },
            },
            child: (
              <Button
                type="c7n-pro"
                onClick={() => console.log('123456786543')}
                color="primary"
                permissionList={[]}
                icon={baseInfo.skillStatus === 'ONLINE' ? 'get_app' : 'publish'}
              >
                {baseInfo.skillStatus === 'ONLINE'
                  ? intl.get('smbl.purchaseRobotConfig.skillTree.view.button.offline').d('下线')
                  : intl.get('smbl.purchaseRobotConfig.skillTree.view.button.online').d('上线')}
              </Button>
            ),
          }
        : undefined,
      // 仅自定义技能，显示保存
      Number(organizationId) === Number(baseInfo.tenantId)
        ? {
            name: 'save',
            noNest: true,
            btnType: 'c7n-pro',
            btnProps: {
              onClick: () => {
                if (!this.state.skillId) {
                  this.state.skillBasicInfoDataSet.submit().then((res) => {
                    if (res.success) {
                      const info = (res.content || [])[0];
                      if (info) {
                        const taskLineDataSet = new DataSet(taskLineDS(info.skillId));
                        const skillBasicInfoDataSet = new DataSet(
                          basicInfoDS(info.skillId, this, taskLineDataSet)
                        );
                        // 创建成功，根据技能id创建新的dataSet
                        this.setState({
                          skillId: info.skillId,
                          taskLineDataSet,
                          skillBasicInfoDataSet,
                        });
                        this.props.history.replace(
                          `/smbl/purchase-robot/config/skill/detail/${info.skillId}`
                        );
                      }
                    }
                  });
                } else {
                  this.state.skillBasicInfoDataSet.submit();
                }
              },
              icon: 'save',
              funcType: 'flat',
            },
            child: intl.get('smbl.purchaseRobotConfig.view.button.save').d('保存'),
          }
        : undefined,
    ];
  }

  render() {
    const { baseInfo, skillBasicInfoDataSet, skillId, taskLineDataSet } = this.state;
    return (
      <Fragment>
        <Header
          title={intl.get('smbl.purchaseRobotConfig.view.tab.robotSkillTree').d('机器人技能树')}
          backPath="/smbl/purchase-robot/config/list"
        >
          <DynamicButtons buttons={this.headerButtons(baseInfo, skillId)} />
        </Header>
        <TopSection className={styles['notice-content']}>
          {skillBasicInfoDataSet ? (
            <BasicInfo
              skillBasicInfoDataSet={skillBasicInfoDataSet}
              canEdit={baseInfo.skillStatus !== 'ONLINE'}
              skillId={skillId}
            />
          ) : null}
        </TopSection>
        <TopSection
          className={styles['notice-content']}
          title={intl
            .get('smbl.purchaseRobotConfig.view.tab.robotSkillMission')
            .d('机器人技能任务')}
          hidden={!skillId}
        >
          <TaskLine
            taskLineDataSet={taskLineDataSet}
            skillId={skillId}
            canEdit
            skillType={baseInfo.skillType}
            isSkillSelfDefine={Number(baseInfo.tenantId) === Number(organizationId)}
          />
        </TopSection>
      </Fragment>
    );
  }
}
