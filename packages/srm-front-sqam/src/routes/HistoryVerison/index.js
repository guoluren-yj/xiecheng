/**
 * 特定8D问题单 - 特定版本明细
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Spin, Collapse } from 'hzero-ui';
import classNames from 'classnames';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import BasicInfoPanel from '../components/BasicInfoPanel';
import QuestionPanel from '../components/QuestionPanel';
import GroupMemberPanel from '../components/GroupMemberPanel';
import ContinueSupplyPanel from '../components/ContinueSupplyPanel';
import SubsequentProductionPanel from '../components/SubsequentProductionPanel';
import RootCauseAnalysisPanel from '../components/RootCauseAnalysisPanel';
import RemedialActionPanel from '../components/RemedialActionPanel';
import StandardizingPanel from '../components/StandardizingPanel';
import CongratulationPanel from '../components/CongratulationPanel';
import styles from './index.less';

const prefix = `sqam.common.view.message.title.panel`;

@formatterCollections({
  code: [
    'sqam.common',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
  ],
})
@connect(({ history8D, loading }) => ({
  history8D,
  loading: {
    detail: loading.effects['history8D/fetch8DHisBasicInfo'],
  },
  tenantId: getCurrentOrganizationId(),
}))
export default class Detail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    this.handleSearch();
    dispatch({ type: 'history8D/fetchLov' });
  }

  /**
   * 查询8D历史详细信息
   */
  @Bind()
  handleSearch() {
    const { dispatch, tenantId, match } = this.props;
    const { historyId } = match.params;
    dispatch({
      type: 'history8D/fetch8DHisBasicInfo',
      payload: {
        tenantId,
        problemHeaderHisId: historyId,
      },
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      history8D: { basicHisInfo = {}, icaActions = [], zeroOneOption = [], causeType = [] },
      match,
    } = this.props;
    // 获取上一个页面数据的problemHeaderId
    const {
      path,
      params: { preHeaderId },
    } = match;
    // 根据当前路径获取本历史页面是从哪个模块跳转过来的，例如：/sqam/audit8D/detail，经如下处理后结果为audit8D
    const moduleOf8D = path.split('/')[2];
    const { edProblemActionHis = {}, edProblemTeamHisList = [], ...basic } = basicHisInfo;
    const edProblemInfo = edProblemActionHis || {};
    const basicInfoProps = { basicInfo: basic };
    const questionProps = { problemDesc: basic };
    const groupMemberProps = {
      readOnly: true,
      selectedRowKeys: [],
      groupMember: edProblemTeamHisList,
      onCleanLine: (e) => e,
      onChangeFlag: (e) => e,
      onAdd: (e) => e,
      match,
    };
    const continueSupplyProps = {
      icaActions,
      zeroOneOption,
      onRef: (e) => e,
      continueSupplyData: edProblemInfo,
      readOnly: true,
    };
    const subsequentProductionProps = {
      subsequentProduction: edProblemInfo,
      onRef: (e) => e,
      readOnly: true,
    };
    const remedialActionProps = {
      zeroOneOption,
      remedialAction: edProblemInfo,
      onRef: (e) => e,
      readOnly: true,
    };
    const rootCauseAnalysisProps = {
      causeType,
      rootCause: edProblemInfo,
      onRef: (e) => e,
      readOnly: true,
    };
    const standardizingProps = {
      zeroOneOption,
      standardizingData: edProblemInfo,
      onRef: (e) => e,
      readOnly: true,
    };
    const congratulationProps = {
      congratulations: edProblemInfo,
      onRef: (e) => e,
      readOnly: true,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sqam.common.view.message.title.detail`).d('8D详情')}
          backPath={`/sqam/${moduleOf8D}/detail/${preHeaderId}`}
        />
        <Content className={classNames(styles['page-content'])}>
          <Spin spinning={false}>
            <Collapse
              bordered={false}
              defaultActiveKey={['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']}
            >
              <Collapse.Panel header={<h3>{intl.get(`${prefix}.basic`).d('基本信息')}</h3>} key="B">
                <BasicInfoPanel {...basicInfoProps} />
              </Collapse.Panel>
              <Collapse.Panel
                header={<h3>{intl.get(`${prefix}.question`).d('问题描述')}</h3>}
                key="C"
              >
                <QuestionPanel {...questionProps} />
              </Collapse.Panel>
              <Collapse.Panel
                header={<h3>{intl.get(`${prefix}.groupMember`).d('小组成员')}</h3>}
                key="D"
              >
                <GroupMemberPanel {...groupMemberProps} />
              </Collapse.Panel>
              <Collapse.Panel
                header={
                  <h3>
                    {intl.get(`${prefix}.promiseMaintainProvide`).d('临时围堵措施—保证持续供货')}
                  </h3>
                }
                key="E"
              >
                <ContinueSupplyPanel {...continueSupplyProps} />
              </Collapse.Panel>
              <Collapse.Panel
                header={<h3>{intl.get(`${prefix}.shortMeature`).d('短期措施')}</h3>}
                key="F"
              >
                <SubsequentProductionPanel {...subsequentProductionProps} />
              </Collapse.Panel>
              <Collapse.Panel
                header={<h3>{intl.get(`${prefix}.analyzeReason`).d('根本原因分析')}</h3>}
                key="G"
              >
                <RootCauseAnalysisPanel {...rootCauseAnalysisProps} />
              </Collapse.Panel>
              <Collapse.Panel
                header={<h3>{intl.get(`${prefix}.foreverDealSolution`).d('永久纠正措施')}</h3>}
                key="H"
              >
                <RemedialActionPanel {...remedialActionProps} />
              </Collapse.Panel>
              <Collapse.Panel
                header={<h3>{intl.get(`${prefix}.standard`).d('相关标准化')}</h3>}
                key="I"
              >
                <StandardizingPanel {...standardizingProps} />
              </Collapse.Panel>
              <Collapse.Panel
                header={<h3>{intl.get(`${prefix}.congratulation`).d('小组祝贺')}</h3>}
                key="J"
              >
                <CongratulationPanel {...congratulationProps} />
              </Collapse.Panel>
            </Collapse>
          </Spin>
        </Content>
        {/* {infoSupplementVisible && <LogisticsInfoModal {...infoSupplementProps} />} */}
      </React.Fragment>
    );
  }
}
