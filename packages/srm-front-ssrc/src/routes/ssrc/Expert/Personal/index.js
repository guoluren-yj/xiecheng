/**
 * Detail - 专家库信息维护(个人/管理员)、专家信息查询
 * @date: 2019-1-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty, isFunction } from 'lodash';
import moment from 'moment';

import { Header, Content } from 'components/Page';
// import { enableRender, numberRender } from 'utils/renderer';
import { getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import mixCustomize from 'srm-front-cuz/lib/mixCustomize';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { getErrors } from '@/routes/ssrc/RFSupplierQuotation/Quotation/utils/getDSError';

import DetailForm from './DetailForm';
import AchievementTable from './AchievementTable';
import CareerPortfolioTable from './CareerPortfolioTable';
import EducationExperienceTable from './EducationExperienceTable';
import EnclosureTable from './EnclosureTable';
import TenderingTable from '../Components/TenderingTable';
import FieldTable from './FieldTable';
import BankInfoTable from '../Components/BankInfoTable';
import { getCustomizeUnitCode } from '../utils/utils';

const promptCode = 'ssrc.expert';

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
    getCustomizeUnitCode('managePerBaseForm'), // 基本信息
    getCustomizeUnitCode('managePerBankInfoUpdate'), // 银行信息
    getCustomizeUnitCode('managePerFieldUpdate'),
    getCustomizeUnitCode('managePerAchievementUpdate'),
    getCustomizeUnitCode('managePerCareerUpdate'),
    getCustomizeUnitCode('managePerEducationUpdate'),
    getCustomizeUnitCode('managePerEnclosureUpdate'),
  ],
  c7nUnit: [
    // 只是区分哪些属于c7n个性化
    getCustomizeUnitCode('managePerBankInfoUpdate'),
  ],
})
@connect(({ expert, expertPersonal, user: { currentUser }, loading }) => ({
  expert,
  currentUser,
  expertPersonal,
  loading: loading.effects['expertPersonal/fetchDetailPersonal'],
  saving: loading.effects['expertPersonal/saveDetailPersonal'],
}))
@cuxRemote(
  {
    code: 'SSRC_EXPERT_PERSONAL',
    name: 'processRemote',
  },
  {
    events: {
      handleInitFieldCux() {},
      handleRefreshFieldAfterOperateFieldCux() {},
    },
  }
)
@formatterCollections({ code: ['ssrc.expert'] })
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReq: false,
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.queryValueCode();
    this.handleSearchDetailPersonal();
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
      type: 'expertPersonal/fetchDetailPersonal',
      payload: {
        userId: id,
        customizeUnitCode: getCustomizeUnitCode([
          'managePerBaseForm',
          'managePerBankInfoUpdate',
          'managePerFieldUpdate',
          'managePerAchievementUpdate',
          'managePerCareerUpdate',
          'managePerEducationUpdate',
          'managePerEnclosureUpdate',
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
      type: 'expertPersonal/queryValueCode',
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

  /**
   * 保存数据(个人)
   */
  @Bind()
  handleSavePersonal() {
    const {
      dispatch,
      expertPersonal: {
        person: {
          expertFormData = {},
          achievementList = [],
          careerPortfolioList = [],
          educationExperienceList = [],
          enclosureList = [],
          bankInfoList = [],
          fieldList = [],
        } = {},
      },
    } = this.props;
    const { tenantId } = this.state;
    const form = isUndefined(this.form) ? {} : this.form;
    form.validateFields(async (err, formData) => {
      if (!err) {
        const achievementdata = getEditTableData(achievementList, ['expertAchievementId']);
        const careerPortfolioData = getEditTableData(careerPortfolioList, ['expertCareerId']);
        const educationExperienceData = getEditTableData(educationExperienceList, [
          'expertEducationId',
        ]);
        const enclosureData = getEditTableData(enclosureList, ['expertAttachmentId']);
        const fieldData = getEditTableData(fieldList, ['expertFieldId']);

        // 银行信息表格数据
        const bankInfoTableDS = this.bankInfoTableRef?.bankInfoTableDS;
        if (bankInfoTableDS?.validate && !(await bankInfoTableDS.validate())) {
          const tableError = await bankInfoTableDS.getValidationErrors();
          const errorMessage = getErrors({ data: tableError }) || '';
          if (errorMessage) {
            notification.warning({
              message: (
                <span>
                  {intl.get(`${promptCode}.view.message.tab.bankInfoTable`).d('银行信息')}:{' '}
                  {errorMessage}
                </span>
              ),
            });
          }
          return;
        }
        const bankInfoData = bankInfoTableDS?.toData() ?? bankInfoList; // 如果表格没加载，则直接传后端返回的数据

        // 处理 moment格式的时间
        const { birthday } = formData;
        const newFormData = {
          ...expertFormData,
          ...formData,
          tenantId,
          birthday: birthday ? moment(birthday).format(DEFAULT_DATE_FORMAT) : undefined,
        };
        const newCareerPortfolioData = careerPortfolioData.map((item) => {
          const { startDate, endDate } = item;
          return {
            ...item,
            startDate: startDate ? moment(startDate).format(DEFAULT_DATE_FORMAT) : undefined,
            endDate: endDate ? moment(endDate).format(DEFAULT_DATE_FORMAT) : undefined,
          };
        });
        const newEducationExperienceData = educationExperienceData.map((item) => {
          const { startDate, endDate } = item;
          return {
            ...item,
            startDate: startDate ? moment(startDate).format(DEFAULT_DATE_FORMAT) : undefined,
            endDate: endDate ? moment(endDate).format(DEFAULT_DATE_FORMAT) : undefined,
          };
        });
        dispatch({
          type: 'expertPersonal/saveDetailPersonal',
          payload: {
            expert: newFormData,
            expertAchievements: achievementdata,
            expertCareers: newCareerPortfolioData,
            expertEducations: newEducationExperienceData,
            expertAttachments: enclosureData,
            expertFields: fieldData,
            expertBanks: bankInfoData,
            customizeUnitCode: getCustomizeUnitCode([
              'managePerBaseForm',
              'managePerBankInfoUpdate',
              'managePerFieldUpdate',
              'managePerAchievementUpdate',
              'managePerCareerUpdate',
              'managePerEducationUpdate',
              'managePerEnclosureUpdate',
            ]),
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.handleSearchDetailPersonal();
          }
        });
      }
    });
  }

  // 设置银行信息ref
  @Bind()
  setBankInfoTableRef(ref) {
    this.bankInfoTableRef = ref;
  }

  render() {
    const {
      processRemote,
      loading,
      saving,
      expertPersonal,
      expertPersonal: {
        person: { expertFormData = {}, bankInfoList = [] } = {},
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
    } = this.props;
    const { headerButtonReander = undefined } = processRemote.props?.process || {};
    const { isReq } = this.state;
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
      isReq,
      customizeTable,
      expertId: 'person',
      onReload: this.handleSearchDetailPersonal,
      fieldTableCode: getCustomizeUnitCode('managePerFieldUpdate'),
      remote: processRemote,
      remotePrefixCode: 'SSRC_EXPERT_PERSONAL',
    };

    const achievementProps = {
      isReq,
      customizeTable,
      expertId: 'person',
      onReload: this.handleSearchDetailPersonal,
      achievemenTableCode: getCustomizeUnitCode('managePerAchievementUpdate'),
    };

    const careerPortfolioProps = {
      isReq,
      customizeTable,
      expertId: 'person',
      onReload: this.handleSearchDetailPersonal,
      careerTableCode: getCustomizeUnitCode('managePerCareerUpdate'),
    };

    const educationExperienceProps = {
      isReq,
      customizeTable,
      expertId: 'person',
      onReload: this.handleSearchDetailPersonal,
      educationTableCode: getCustomizeUnitCode('managePerEducationUpdate'),
    };

    // 银行信息props
    const bankInfoProps = {
      isReq,
      bankInfoList,
      customizeTable: custTable,
      bankInfoTableCode: getCustomizeUnitCode('managePerBankInfoUpdate'),
      onRef: this.setBankInfoTableRef,
      // bankInfoTableDS: this.bankInfoTableDS,
    };

    const enclosureProps = {
      isReq,
      customizeTable,
      expertId: 'person',
      onReload: this.handleSearchDetailPersonal,
      enclosureTableCode: getCustomizeUnitCode('managePerEnclosureUpdate'),
    };

    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.personal`).d('专家信息维护(个人)')}
        >
          <Button
            type="primary"
            icon="save"
            loading={saving || loading}
            onClick={this.handleSavePersonal}
            style={{ display: isEmpty(expertFormData) ? 'none' : 'block' }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {isFunction(headerButtonReander)
            ? headerButtonReander({
                loading,
                expertPersonal,
                handleSearchDetailPersonal: this.handleSearchDetailPersonal,
              })
            : null}
        </Header>
        <Content>
          <Spin spinning={loading}>
            <div className="table-list-search">
              <DetailForm {...formProps} />
            </div>
            <Tabs defaultActiveKey="tenderingTable" animated={false}>
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.message.tab.tenderingTable`).d('参与历史寻源')}
                key="tenderingTable"
              >
                <TenderingTable />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.message.tab.fieldTable`).d('专业领域')}
                key="fieldTable"
              >
                <FieldTable {...fieldProps} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.message.tab.achievementTable`).d('专业成果')}
                key="achievementTable"
              >
                <AchievementTable {...achievementProps} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.message.tab.careerPortfolioTable`).d('职业履历')}
                key="careerPortfolioTable"
              >
                <CareerPortfolioTable {...careerPortfolioProps} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl
                  .get(`${promptCode}.view.message.tab.educationExperienceTable`)
                  .d('教育经历')}
                key="educationExperienceTable"
              >
                <EducationExperienceTable {...educationExperienceProps} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.message.tab.bankInfoTable`).d('银行信息')}
                key="bankInfoTable"
                forceRender
              >
                <BankInfoTable {...bankInfoProps} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get(`hzero.common.upload.text`).d('上传附件')}
                key="enclosureTable"
              >
                <EnclosureTable {...enclosureProps} />
              </Tabs.TabPane>
            </Tabs>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
