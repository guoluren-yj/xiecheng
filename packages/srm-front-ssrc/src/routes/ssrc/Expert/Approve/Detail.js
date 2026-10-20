/**
 * Detail - 专家注册审批、专家注册查询
 * @date: 2019-1-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Spin, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import moment from 'moment';

import { Header, Content } from 'components/Page';
// import { enableRender, numberRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { DATETIME_MIN } from 'utils/constants';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import mixCustomize from 'srm-front-cuz/lib/mixCustomize';
import remote from 'hzero-front/lib/utils/remote';

import DetailForm from './DetailForm';
import AchievementTable from '../Components/AchievementTable';
import CareerPortfolioTable from '../Components/CareerPortfolioTable';
import EducationExperienceTable from '../Components/EducationExperienceTable';
import EnclosureTable from '../Components/EnclosureTable';
import TenderingTable from '../Components/TenderingTable';
import FieldTable from '../Components/FieldTable';
import BankInfoTable from '../Components/BankInfoTable';
import { getCustomizeUnitCode } from '../utils/utils';

const { confirm } = Modal;
const promptCode = 'ssrc.expert.view.message';

/**
 * 专家注册审批、专家注册查询
 * @extends {Component} - Component
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} taxRateOrg - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {boolean} saving - 保存按钮是否提交成功
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch= e=>e ] - redux dispatch方法
 * @return React.element
 */

@mixCustomize({
  unitCode: [
    // 查询
    getCustomizeUnitCode('regisQueryBaseForm'), // 注册申请查询-基本信息
    getCustomizeUnitCode('regisQueryBankInfoDetail'), // 注册申请查询-银行信息
    getCustomizeUnitCode('regisQueryFieldDetail'), // 注册申请查询-专业领域表格
    getCustomizeUnitCode('regisQueryAchievementDetail'), // 注册申请查询-专业成果表格
    getCustomizeUnitCode('regisQueryCareerDetail'), // 注册申请查询-职业履历表格
    getCustomizeUnitCode('regisQueryEducationDetail'), // 注册申请查询-教育经历表格
    getCustomizeUnitCode('regisQueryEnclosureDetail'), // 注册申请查询-上传附件表格
    // 审批
    getCustomizeUnitCode('regisApprovalBaseForm'), // 注册申请审批-基本信息
    getCustomizeUnitCode('regisApprovalBankInfoDetail'), // 注册申请审批-银行信息
    getCustomizeUnitCode('regisApprovalFieldDetail'), // 注册申请审批-专业领域表格
    getCustomizeUnitCode('regisApprovalAchievementDetail'), // 注册申请审批-专业成果表格
    getCustomizeUnitCode('regisApprovalCareerDetail'), // 注册申请审批-职业履历表格
    getCustomizeUnitCode('regisApprovalEducationDetail'), // 注册申请审批-教育经历表格
    getCustomizeUnitCode('regisApprovalEnclosureDetail'), // 注册申请审批-上传附件表格
  ],
  c7nUnit: [
    // 只是区分哪些属于c7n个性化
    getCustomizeUnitCode('regisQueryBankInfoDetail'), // 注册申请查询-银行信息
    getCustomizeUnitCode('regisApprovalBankInfoDetail'), // 注册申请审批-银行信息
  ],
})
@connect(({ expert, user: { currentUser }, loading }) => ({
  expert,
  currentUser,
  loading: loading.effects['expert/fetchExpertReq'],
  approveLoading: loading.effects['expert/approveExpert'],
  rejectLoading: loading.effects['expert/rejectExpert'],
}))
@formatterCollections({ code: ['ssrc.expert', 'ssrc.scux'] })
@remote({
  code: 'SSRC_EXPERT_REGISTER_APPROVE',
  name: 'expertApproveRemote',
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        path,
        params: { expertReqId },
      },
    } = props;
    let isApproval;
    switch (path) {
      case '/ssrc/expert-approve/detail/:expertReqId':
        isApproval = true;
        break;
      case '/ssrc/expert-reqQuery/detail/:expertReqId':
        isApproval = false;
        break;
      case '/pub/ssrc/expert-reqQuery/detail/:expertReqId':
        isApproval = false;
        break;
      default:
        isApproval = true;
        break;
    }
    this.state = {
      isApproval,
      isEdit: false,
      expertReqId,
    };
  }

  componentDidMount() {
    this.handleSearchExpertReq();
  }

  // 判断是否/pub 页面
  isPubPage = () => {
    const {
      match: { path = null },
    } = this.props;
    const IsPublic = path && path.includes('/pub'); // /pub/ssrc/inquiry-hall/rfx-detail/:rfxId
    return IsPublic;
  };

  /**
   * 查询详情
   */
  @Bind()
  handleSearchExpertReq() {
    const { dispatch } = this.props;
    const { expertReqId } = this.state;
    dispatch({
      type: 'expert/fetchExpertReq',
      payload: {
        expertReqId,
        customizeUnitCode: getCustomizeUnitCode([
          'regisApprovalBaseForm',
          'regisQueryBaseForm',
          'regisQueryBankInfoDetail',
          'regisQueryFieldDetail',
          'regisQueryAchievementDetail',
          'regisQueryCareerDetail',
          'regisQueryEducationDetail',
          'regisQueryEnclosureDetail',
          'regisApprovalBankInfoDetail',
          'regisApprovalFieldDetail',
          'regisApprovalAchievementDetail',
          'regisApprovalCareerDetail',
          'regisApprovalEducationDetail',
          'regisApprovalEnclosureDetail',
        ]),
      },
    });
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = ref.props.form;
  }

  /**
   * 审批专家注册申请
   * @param {Boolean} flag true-审批通过
   */
  @Bind()
  handleApproval(flag) {
    const { expertReqId } = this.state;
    const {
      dispatch,
      history,
      expert: { [expertReqId]: { expertReqFormData = {} } = {} },
    } = this.props;
    const { registeredDate } = expertReqFormData;
    const form = isUndefined(this.form) ? {} : this.form;
    form.validateFields((err) => {
      if (!err) {
        const formData = {
          ...expertReqFormData,
          ...form.getFieldsValue(),
          registeredDate: registeredDate && moment(registeredDate).format(DATETIME_MIN),
          processRemark: form.getFieldValue('processRemark'),
          customizeUnitCode: getCustomizeUnitCode([
            'regisQueryBaseForm',
            'regisQueryBankInfoDetail',
            'regisQueryFieldDetail',
            'regisQueryAchievementDetail',
            'regisQueryCareerDetail',
            'regisQueryEducationDetail',
            'regisQueryEnclosureDetail',
            'regisApprovalBaseForm',
            'regisApprovalBankInfoDetail',
            'regisApprovalFieldDetail',
            'regisApprovalAchievementDetail',
            'regisApprovalCareerDetail',
            'regisApprovalEducationDetail',
            'regisApprovalEnclosureDetail',
          ]),
        };
        confirm({
          title: flag
            ? intl.get(`${promptCode}.title.approvePassFlag`).d('是否确认审批通过专家注册申请?')
            : intl.get(`${promptCode}.title.approveRejectFlag`).d('是否确认审批拒绝专家注册申请?'),
          onOk() {
            const type = flag ? 'expert/approveExpert' : 'expert/rejectExpert';
            dispatch({
              type,
              payload: formData,
            }).then((res) => {
              if (res) {
                notification.success();
                history.push('/ssrc/expert-approve/list');
              }
            });
          },
        });
      }
    });
  }

  render() {
    const { isApproval, isEdit, expertReqId } = this.state;
    const {
      loading,
      approveLoading,
      rejectLoading,
      expert: {
        [expertReqId]: {
          expertReqFormData = {},
          bankInfoReqList = [], // 银行信息
        } = {},
        code: {
          idTypeList = [],
          expertLevelList = [],
          expertTypeList = [],
          expertCategoryList = [],
        },
      },
      h0: { customizeForm, customizeTable },
      c7n: { custTable },
      expertApproveRemote,
    } = this.props;
    const formProps = {
      isApproval,
      formData: expertReqFormData,
      idTypeList,
      expertLevelList,
      expertTypeList,
      expertCategoryList,
      onRef: this.handleBindRef,
      customizeForm,
    };

    const fieldProps = {
      isEdit,
      expertReqId,
      customizeTable,
      fieldTableCode: isApproval
        ? getCustomizeUnitCode('regisApprovalFieldDetail')
        : getCustomizeUnitCode('regisQueryFieldDetail'),
    };

    const achievementProps = {
      isEdit,
      expertReqId,
      customizeTable,
      achievemenTableCode: isApproval
        ? getCustomizeUnitCode('regisApprovalAchievementDetail')
        : getCustomizeUnitCode('regisQueryAchievementDetail'),
    };

    const careerPortfolioProps = {
      isEdit,
      expertReqId,
      customizeTable,
      careerTableCode: isApproval
        ? getCustomizeUnitCode('regisApprovalCareerDetail')
        : getCustomizeUnitCode('regisQueryCareerDetail'),
    };

    const educationExperienceProps = {
      isEdit,
      expertReqId,
      customizeTable,
      educationTableCode: isApproval
        ? getCustomizeUnitCode('regisApprovalEducationDetail')
        : getCustomizeUnitCode('regisQueryEducationDetail'),
    };

    // 银行信息props
    const bankInfoProps = {
      isEdit,
      bankInfoList: bankInfoReqList,
      customizeTable: custTable,
      bankInfoTableCode: isApproval
        ? getCustomizeUnitCode('regisApprovalBankInfoDetail')
        : getCustomizeUnitCode('regisQueryBankInfoDetail'),
    };

    const enclosureProps = {
      isEdit,
      expertReqId,
      customizeTable,
      enclosureTableCode: isApproval
        ? getCustomizeUnitCode('regisApprovalEnclosureDetail')
        : getCustomizeUnitCode('regisQueryEnclosureDetail'),
    };

    const isPub = this.isPubPage();
    let hearderProps = {};
    if (isApproval) {
      hearderProps = {
        backPath: '/ssrc/expert-approve/list',
        title: intl.get(`${promptCode}.title.regApprove`).d('专家注册申请审批'),
      };
    } else if (isPub) {
      hearderProps = {
        backPath: null,
        title: expertApproveRemote
          ? expertApproveRemote.process(
              'SSRC_EXPERT_REGISTER_APPROVE_PROCESS_PUB_TITLE',
              intl.get(`ssrc.expert.view.title.requisition`).d('专家注册申请'),
              {
                expertReqFormData,
              }
            )
          : intl.get(`ssrc.expert.view.title.requisition`).d('专家注册申请'),
      };
    } else {
      hearderProps = {
        backPath: '/ssrc/expert-reqQuery/list',
        title: intl.get(`${promptCode}.title.reqQuery`).d('专家注册申请查询'),
      };
    }

    // 所有页签tabs
    const allTabs = [
      !isPub ? (
        <Tabs.TabPane
          tab={intl.get(`${promptCode}.tab.tenderingTable`).d('参与历史寻源')}
          key="tenderingTable"
        >
          <TenderingTable />
        </Tabs.TabPane>
      ) : null,
      <Tabs.TabPane tab={intl.get(`${promptCode}.tab.fieldTable`).d('专业领域')} key="fieldTable">
        <FieldTable {...fieldProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`${promptCode}.tab.achievementTable`).d('专业成果')}
        key="achievementTable"
      >
        <AchievementTable {...achievementProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`${promptCode}.tab.careerPortfolioTable`).d('职业履历')}
        key="careerPortfolioTable"
      >
        <CareerPortfolioTable {...careerPortfolioProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`${promptCode}.tab.educationExperienceTable`).d('教育经历')}
        key="educationExperienceTable"
      >
        <EducationExperienceTable {...educationExperienceProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`${promptCode}.view.message.tab.bankInfoTable`).d('银行信息')}
        key="bankInfoTable"
      >
        <BankInfoTable {...bankInfoProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get('hzero.common.upload.modal.title').d('附件')}
        key="enclosureTable"
      >
        <EnclosureTable {...enclosureProps} />
      </Tabs.TabPane>,
    ].filter(Boolean);

    // protected 埋点 勿删！！！
    const processAllTabs = expertApproveRemote
      ? expertApproveRemote.process('SSRC_EXPERT_REGISTER_APPROVE_PROCESS_TABS', allTabs, {
          that: this,
          TabPane: Tabs.TabPane,
          isEdit,
          isApproval,
          expertReqId,
        })
      : allTabs;
    // protected 埋点 勿删！！！
    const defaultKey = 'tenderingTable';
    const processDefaultKey = expertApproveRemote
      ? expertApproveRemote.process(
          'SSRC_EXPERT_REGISTER_APPROVE_PROCESS_TABS_DEFAULT_KEY',
          defaultKey,
          {
            defaultKey,
          }
        )
      : defaultKey;

    return (
      <React.Fragment>
        <Header {...hearderProps}>
          {isApproval && (
            <React.Fragment>
              <Button
                type="primary"
                icon="check"
                loading={approveLoading || loading}
                onClick={() => this.handleApproval(true)}
              >
                {intl.get('ssrc.expert.view.button.approve').d('审批通过')}
              </Button>
              <Button
                icon="close"
                loading={rejectLoading || loading}
                onClick={() => this.handleApproval(false)}
              >
                {intl.get('ssrc.expert.view.button.reject').d('审批拒绝')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        <Content>
          <Spin spinning={loading}>
            <div className="table-list-search">
              <DetailForm {...formProps} />
            </div>
            <Tabs
              defaultActiveKey={processDefaultKey}
              animated={false}
              style={{ marginTop: '-5px' }}
            >
              {processAllTabs}
            </Tabs>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
