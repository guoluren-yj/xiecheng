/**
 * Detail - 专家库信息维护(个人/管理员)、专家信息查询
 * @date: 2019-1-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
// import { enableRender, numberRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import mixCustomize from 'srm-front-cuz/lib/mixCustomize';
import remote from 'hzero-front/lib/utils/remote';

import DetailForm from './DetailForm';
import AchievementTable from './AchievementTable';
import CareerPortfolioTable from './CareerPortfolioTable';
import EducationExperienceTable from './EducationExperienceTable';
import EnclosureTable from './EnclosureTable';
import TenderingTable from '../Components/TenderingTable';
import FieldTable from './FieldTable';
import BankInfoTable from '../Components/BankInfoTable';
import { getCustomizeUnitCode } from '../utils/utils';

const promptCode = 'ssrc.expert.view.message';

/**
 * 专家库信息维护
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
    getCustomizeUnitCode('expertQueryBaseForm'), // 基本信息
    getCustomizeUnitCode('expertQueryBankInfoDetail'), // 银行信息
    getCustomizeUnitCode('expertQueryFieldDetail'), // 专业领域
    getCustomizeUnitCode('expertQueryAchievementDetail'), // 专业成果
    getCustomizeUnitCode('expertQueryCareerDetail'), // 职业履历
    getCustomizeUnitCode('expertQueryEducationDetail'), // 教育经历
    getCustomizeUnitCode('expertQueryEnclosureDetail'), // 上传附件
  ],
  c7nUnit: [
    // 只是区分哪些属于c7n个性化
    getCustomizeUnitCode('expertQueryBankInfoDetail'),
  ],
})
@connect(({ expert, expertQuery, user: { currentUser }, loading }) => ({
  expert,
  expertQuery,
  currentUser,
  loading: loading.effects['expertQuery/fetchDetailAdmin'],
  saving: loading.effects['expertQuery/saveDetailPersonal'],
}))
@formatterCollections({ code: ['ssrc.expert', 'ssrc.scux'] })
@remote({
  code: 'SSRC_EXPERT_INFO_QUERY',
  name: 'expertQueryRemote',
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { expertId },
      },
    } = props;
    this.state = {
      expertId,
      isEdit: false,
      isReq: false,
    };
  }

  componentDidMount() {
    this.handleSearchDetailAdmin();
  }

  /**
   * 查询详情 - 个人
   */
  @Bind()
  handleSearchDetailPersonal() {
    const {
      dispatch,
      currentUser: { id },
    } = this.props;
    dispatch({
      type: 'expertQuery/fetchDetailPersonal',
      payload: {
        userId: id,
      },
    });
  }

  /**
   * 查询详情 - 管理员
   */
  @Bind()
  handleSearchDetailAdmin() {
    const { dispatch } = this.props;
    const { expertId } = this.state;
    dispatch({
      type: 'expertQuery/fetchDetailAdmin',
      payload: {
        expertId,
        customizeUnitCode: getCustomizeUnitCode([
          'expertQueryBaseForm',
          'expertQueryBankInfoDetail',
          'expertQueryFieldDetail',
          'expertQueryAchievementDetail',
          'expertQueryCareerDetail',
          'expertQueryEducationDetail',
          'expertQueryEnclosureDetail',
        ]),
      },
    });
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'expertQuery/queryValueCode',
      payload: {
        expertLevelList: 'SSRC.EXPERT_LEVEL', // 专家级别
        expertTypeList: 'SSRC.EXPERT_TYPE', // 专家类型
        expertCategoryList: 'SSRC.EXPERT_CATEGORY', // 专家类别
        genderList: 'SPFM.CONTACTS_SEX', // 性别
        idTypeList: 'SPFM.ID_TYPE', // 证件类型
        crownCodeList: 'HPFM.IDD', // 国际冠码
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

  // 判断是否/pub 页面 【山鹰pdd】新增二开审批表单
  @Bind()
  isPubPage = () => {
    const {
      match: { path = null },
    } = this.props;
    let isPub = false;
    if (path) {
      isPub = path.includes('/pub');
    }
    return isPub;
  };

  render() {
    const { isEdit, isReq, expertId } = this.state;
    const {
      loading,
      expertQuery: {
        [expertId]: { expertFormData = {}, bankInfoList = [] } = {},
        code: {
          idTypeList = [],
          expertLevelList = [],
          expertTypeList = [],
          expertCategoryList = [],
          crownCodeList = [],
        },
      },
      h0: { customizeForm, customizeTable },
      c7n: { custTable },
      expertQueryRemote,
    } = this.props;
    const formProps = {
      formData: expertFormData,
      idTypeList,
      expertLevelList,
      expertTypeList,
      expertCategoryList,
      crownCodeList,
      onRef: this.handleBindRef,
      customizeForm,
    };

    const fieldProps = {
      isEdit,
      isReq,
      expertId,
      customizeTable,
      fieldTableCode: getCustomizeUnitCode('expertQueryFieldDetail'),
    };

    const achievementProps = {
      isEdit,
      isReq,
      expertId,
      customizeTable,
      achievemenTableCode: getCustomizeUnitCode('expertQueryAchievementDetail'),
    };

    const careerPortfolioProps = {
      isEdit,
      isReq,
      expertId,
      customizeTable,
      careerTableCode: getCustomizeUnitCode('expertQueryCareerDetail'),
    };

    const educationExperienceProps = {
      isEdit,
      isReq,
      expertId,
      customizeTable,
      educationTableCode: getCustomizeUnitCode('expertQueryEducationDetail'),
    };

    // 银行信息props
    const bankInfoProps = {
      isEdit,
      bankInfoList,
      customizeTable: custTable,
      bankInfoTableCode: getCustomizeUnitCode('expertQueryBankInfoDetail'),
      // onRef: this.setBankInfoTableRef,
      // bankInfoTableDS: this.bankInfoTableDS,
    };

    const enclosureProps = {
      isEdit,
      isReq,
      expertId,
      customizeTable,
      enclosureTableCode: getCustomizeUnitCode('expertQueryEnclosureDetail'),
    };

    // 所有页签tabs
    const allTabs = [
      <Tabs.TabPane
        tab={intl.get(`${promptCode}.tab.tenderingTable`).d('参与历史寻源')}
        key="tenderingTable"
      >
        <TenderingTable />
      </Tabs.TabPane>,
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
    const processAllTabs = expertQueryRemote
      ? expertQueryRemote.process('SSRC_EXPERT_INFO_QUERY_PROCESS_TABS', allTabs, {
          that: this,
          TabPane: Tabs.TabPane,
          isEdit,
          expertId,
        })
      : allTabs;
    // protected 埋点 勿删！！！
    const defaultKey = 'tenderingTable';
    const processDefaultKey = expertQueryRemote
      ? expertQueryRemote.process('SSRC_EXPERT_INFO_QUERY_PROCESS_TABS_DEFAULT_KEY', defaultKey)
      : defaultKey;

    return (
      <React.Fragment>
        <Header
          backPath={this.isPubPage() ? null : '/ssrc/expert-query/list'}
          title={intl.get(`${promptCode}.title.expertInfoQuery`).d('专家信息查询')}
        />
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
