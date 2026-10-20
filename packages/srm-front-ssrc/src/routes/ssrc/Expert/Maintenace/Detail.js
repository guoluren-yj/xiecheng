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
import { isUndefined } from 'lodash';
import moment from 'moment';

import { Header, Content } from 'components/Page';
// import { enableRender, numberRender } from 'utils/renderer';
import { getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATE_FORMAT, DATETIME_MIN } from 'utils/constants';
import notification from 'utils/notification';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import mixCustomize from 'srm-front-cuz/lib/mixCustomize';

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
    getCustomizeUnitCode('manageAdmBaseForm'), // 基本信息
    getCustomizeUnitCode('manageAdmBankInfoUpdate'), // 银行信息
    getCustomizeUnitCode('manageAdmFieldUpdate'), // 专业领域表格
    getCustomizeUnitCode('manageAdmAchievementUpdate'), // 专业成果表格
    getCustomizeUnitCode('manageAdmCareerUpdate'), // 职业履历表格
    getCustomizeUnitCode('manageAdmEducationUpdate'), // 教育经历表格
    getCustomizeUnitCode('manageAdmEnclosureUpdate'), // 上传附件表格
  ],
  c7nUnit: [getCustomizeUnitCode('manageAdmBankInfoUpdate')], // 银行信息
})
@connect(({ expert, expertMaintence, loading }) => ({
  expert,
  expertMaintence,
  loading: loading.effects['expertMaintence/fetchDetailAdmin'],
  saving: loading.effects['expertMaintence/saveDetailAdmin'],
}))
@formatterCollections({ code: ['ssrc.expert'] })
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
      isReq: false, // 是否为注册
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.queryValueCode();
    this.handleSearchDetailAdmin();
  }

  /**
   * 查询详情 - 管理员
   */
  @Bind()
  handleSearchDetailAdmin() {
    const { dispatch } = this.props;
    const { expertId } = this.state;
    dispatch({
      type: 'expertMaintence/fetchDetailAdmin',
      payload: {
        expertId,
        customizeUnitCode: getCustomizeUnitCode([
          'manageAdmBaseForm',
          'manageAdmBankInfoUpdate',
          'manageAdmFieldUpdate',
          'manageAdmAchievementUpdate',
          'manageAdmCareerUpdate',
          'manageAdmEducationUpdate',
          'manageAdmEnclosureUpdate',
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
      type: 'expertMaintence/queryValueCode',
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
   * 保存数据
   */
  @Bind()
  handleSave() {
    const { tenantId, expertId } = this.state;
    const {
      dispatch,
      expertMaintence: {
        [expertId]: {
          expertFormData = {},
          achievementList = [],
          careerPortfolioList = [],
          educationExperienceList = [],
          enclosureList = [],
          bankInfoList = [],
          fieldList = [],
        },
      },
    } = this.props;
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
                  {intl.get(`${promptCode}.view.message.tab.bankInfoTable`).d('银行信息')}:
                  {errorMessage}
                </span>
              ),
            });
          }
          return;
        }
        const bankInfoData = bankInfoTableDS?.toData() ?? bankInfoList; // 如果表格没加载，则直接传后端返回的数据

        // 处理 moment格式的时间
        const { birthday, registeredDate } = formData;
        const newFormData = {
          ...expertFormData,
          ...formData,
          tenantId,
          birthday: birthday ? moment(birthday).format(DEFAULT_DATE_FORMAT) : undefined,
          registeredDate: registeredDate ? moment(registeredDate).format(DATETIME_MIN) : undefined,
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
          type: 'expertMaintence/saveDetailAdmin',
          payload: {
            expert: newFormData,
            expertAchievements: achievementdata,
            expertCareers: newCareerPortfolioData,
            expertEducations: newEducationExperienceData,
            expertAttachments: enclosureData,
            expertFields: fieldData,
            expertBanks: bankInfoData,
            customizeUnitCode: getCustomizeUnitCode([
              'manageAdmBaseForm',
              'manageAdmBankInfoUpdate',
              'manageAdmFieldUpdate',
              'manageAdmAchievementUpdate',
              'manageAdmCareerUpdate',
              'manageAdmEducationUpdate',
              'manageAdmEnclosureUpdate',
            ]),
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.handleSearchDetailAdmin();
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
    const { isReq, expertId } = this.state;
    const {
      loading,
      saving,
      expertMaintence: {
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
      isReq,
      expertId,
      customizeTable,
      onReload: this.handleSearchDetailAdmin,
      fieldTableCode: getCustomizeUnitCode('manageAdmFieldUpdate'),
    };

    const achievementProps = {
      isReq,
      expertId,
      customizeTable,
      onReload: this.handleSearchDetailAdmin,
      achievemenTableCode: getCustomizeUnitCode('manageAdmAchievementUpdate'),
    };

    const careerPortfolioProps = {
      isReq,
      expertId,
      customizeTable,
      onReload: this.handleSearchDetailAdmin,
      careerTableCode: getCustomizeUnitCode('manageAdmCareerUpdate'),
    };

    const educationExperienceProps = {
      isReq,
      expertId,
      customizeTable,
      onReload: this.handleSearchDetailAdmin,
      educationTableCode: getCustomizeUnitCode('manageAdmEducationUpdate'),
    };

    // 银行信息props
    const bankInfoProps = {
      isReq,
      bankInfoList,
      customizeTable: custTable,
      bankInfoTableCode: getCustomizeUnitCode('manageAdmBankInfoUpdate'),
      onRef: this.setBankInfoTableRef,
    };

    const enclosureProps = {
      isReq,
      expertId,
      customizeTable,
      onReload: this.handleSearchDetailAdmin,
      enclosureTableCode: getCustomizeUnitCode('manageAdmEnclosureUpdate'),
    };

    return (
      <React.Fragment>
        <Header
          backPath="/ssrc/expert-maintenace/list"
          title={intl.get(`${promptCode}.view.message.title.admin`).d('专家信息维护(管理员)')}
        >
          <Button type="primary" icon="save" loading={saving || loading} onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={loading}>
            <div className="table-list-search">
              <DetailForm {...formProps} />
            </div>
            <Tabs defaultActiveKey="tenderingTable" animated={false} style={{ marginTop: '-5px' }}>
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
                tab={intl.get(`${promptCode}.view.message.tab.enclosureTable`).d('附件上传')}
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
