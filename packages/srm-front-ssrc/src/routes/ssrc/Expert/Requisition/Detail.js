/**
 * Detail - 专家库注册申请
 * @date: 2019-1-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Spin, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isPlainObject, noop } from 'lodash';
import moment from 'moment';

import { Header, Content } from 'components/Page';
import { getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import mixCustomize from 'srm-front-cuz/lib/mixCustomize';
import remote from 'hzero-front/lib/utils/remote';

import { getErrors } from '@/routes/ssrc/RFSupplierQuotation/Quotation/utils/getDSError';

import DetailForm from './DetailForm';
import AchievementTable from '../Components/AchievementTable';
import CareerPortfolioTable from '../Components/CareerPortfolioTable';
import EducationExperienceTable from '../Components/EducationExperienceTable';
import EnclosureTable from '../Components/EnclosureTable';
import FieldTable from '../Components/FieldTable';
import BankInfoTable from '../Components/BankInfoTable';
import { getCustomizeUnitCode } from '../utils/utils';

const promptCode = 'ssrc.expert';
const { confirm } = Modal;

/**
 * 专家库注册申请
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
    getCustomizeUnitCode('regisBaseFormUpdate'), // 基本信息-维护
    getCustomizeUnitCode('regisBaseFormDetail'), // 基本信息-详情
    getCustomizeUnitCode('regisBankInfoUpdate'), // 银行信息-维护
    getCustomizeUnitCode('regisBankInfoDetail'), // 银行信息-详情
    getCustomizeUnitCode('regisFieldUpdate'), // 专业领域表格-维护
    getCustomizeUnitCode('regisFieldDetail'), // 专业领域表格-详情
    getCustomizeUnitCode('regisAchievementUpdate'), // 专业成果表格-维护
    getCustomizeUnitCode('regisAchievementDetail'), // 专业成果表格-详情
    getCustomizeUnitCode('regisCareerUpdate'), // 职业履历表格-维护
    getCustomizeUnitCode('regisCareerDetail'), // 职业履历表格-详情
    getCustomizeUnitCode('regisEducationUpdate'), // 教育经历表格-维护
    getCustomizeUnitCode('regisEducationDetail'), // 教育经历表格-详情
    getCustomizeUnitCode('regisEnclosureUpdate'), // 上传附件表格-维护
    getCustomizeUnitCode('regisEnclosureDetail'), // 上传附件表格-详情
  ],
  c7nUnit: [
    // 只是区分哪些属于c7n个性化
    getCustomizeUnitCode('regisBankInfoUpdate'), // 银行信息-维护
    getCustomizeUnitCode('regisBankInfoDetail'), // 银行信息-详情
  ],
})
@connect(({ expert, loading }) => ({
  expert,
  loading: loading.effects['expert/fetchExpertReq'],
  saving: loading.effects['expert/requisitionSave'],
  submitting: loading.effects['expert/requisitionSubmit'],
  deleting: loading.effects['expert/requisitionDelete'],
  cancelLoaing: loading.effects['expert/requisitionCancel'],
}))
@formatterCollections({ code: ['ssrc.expert', 'ssrc.scux'] })
@remote(
  {
    code: 'SSRC_EXPERT_REQUISITION_UPDATE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'expertRemote',
  },
  {
    events: {
      handleAfterSearchExpertReq() {},
      getContent(props) {
        const { clearContent = noop } = props || {};
        clearContent();
      },
      handleAfterChangeIdType() {},
    },
  }
)
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        path,
        params: { expertReqId },
      },
    } = props;
    const isEdit = path !== '/ssrc/expert-requisition/read-only-detail/:expertReqId';
    this.state = {
      isEdit,
      expertReqId,
      mapKey: expertReqId || 'create',
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    const { expertReqId } = this.state;
    this.queryValueCode();
    if (expertReqId) {
      this.handleSearchExpertReq();
    } else {
      const {
        expertRemote,
        location: { search },
        dispatch,
      } = this.props;
      const clearContent = () => {
        dispatch({
          type: 'expert/updateState',
          payload: {
            create: {
              expertReqFormData: {},
              fieldReqList: [],
              achievementReqList: [],
              careerPortfolioReqList: [],
              educationExperienceReqList: [],
              bankInfoReqList: [], // 银行信息
              enclosureReqList: [],
            },
          },
        });
      };
      if (expertRemote?.event) {
        expertRemote.event.fireEvent('getContent', {
          dispatch,
          search,
          clearContent,
        });
      } else {
        clearContent();
      }
    }
  }

  /**
   * 查询详情
   */
  @Bind()
  handleSearchExpertReq() {
    const { dispatch, expertRemote } = this.props;
    const { expertReqId } = this.state;
    dispatch({
      type: 'expert/fetchExpertReq',
      payload: {
        expertReqId,
        customizeUnitCode: getCustomizeUnitCode([
          'regisBaseFormUpdate',
          'regisBaseFormDetail',
          'regisBankInfoUpdate',
          'regisBankInfoDetail',
          'regisFieldUpdate',
          'regisFieldDetail',
          'regisAchievementUpdate',
          'regisAchievementDetail',
          'regisCareerUpdate',
          'regisCareerDetail',
          'regisEducationUpdate',
          'regisEducationDetail',
          'regisEnclosureUpdate',
          'regisEnclosureDetail',
        ]),
      },
    });
    // protected 埋点 勿删！！！
    if (expertRemote && expertRemote.event) {
      // 和查询并列的二开的一些操作
      expertRemote.event.fireEvent('handleAfterSearchExpertReq', {
        that: this,
      });
    }
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'expert/queryValueCode',
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
   * 保存或提交
   * @param {Boolean} flag true-保存
   */
  @Bind()
  handleSaveOrSubmit(flag) {
    const { tenantId, expertReqId, mapKey } = this.state;
    const {
      dispatch,
      history,
      expert: {
        [mapKey]: {
          expertReqFormData = {},
          achievementReqList = [],
          careerPortfolioReqList = [],
          educationExperienceReqList = [],
          enclosureReqList = [],
          bankInfoReqList = [],
          fieldReqList = [],
        } = {},
      },
      expertRemote,
      location: { search },
    } = this.props;
    const form = isUndefined(this.form) ? {} : this.form;
    form.validateFields(async (err, formData) => {
      if (!err) {
        const achievementdata = getEditTableData(achievementReqList, ['expertAchvReqId']);
        const careerPortfolioData = getEditTableData(careerPortfolioReqList, ['expertCareerReqId']);
        const educationExperienceData = getEditTableData(educationExperienceReqList, [
          'expertEducationReqId',
        ]);
        const enclosureData = getEditTableData(enclosureReqList, ['expertAttachmentReqId']);
        const fieldData = getEditTableData(fieldReqList, ['expertFieldReqId']);

        // 银行信息表格数据
        const bankInfoTableDS = this.bankInfoTableRef?.bankInfoTableDS;
        if (bankInfoTableDS?.validate && !(await bankInfoTableDS.validate())) {
          const tableError = await bankInfoTableDS.getValidationErrors();
          const errorMessage = getErrors({ data: tableError }) || '';
          if (errorMessage) {
            notification.warning({
              message: (
                <span>
                  {intl.get(`${promptCode}.view.message.tab.bankInfoTable`).d('银行信息')} :{' '}
                  {errorMessage}
                </span>
              ),
            });
          }
          return;
        }
        const bankInfoData = bankInfoTableDS?.toData() ?? bankInfoReqList; // 如果表格没加载，则直接传后端返回的数据

        // start  protected 埋点 勿删！！！ -------------------------------------- 开始位置 -------------------------------------
        const remoteCuxOtherDataObj = expertRemote
          ? (await expertRemote.process(
              'SSRC_EXPERT_REQUISITION_UPDATE_PROCESS_SAVE_OR_SUBMIT_DATA',
              {},
              {
                that: this,
                achievementReqList,
                careerPortfolioReqList,
                educationExperienceReqList,
                enclosureReqList,
                fieldReqList,
                search,
              }
            )) || {}
          : {};
        let remoteOtherDataObj = {};
        if (isPlainObject(remoteCuxOtherDataObj)) {
          const { cuxValidate = true, ...surplusPayload } = remoteCuxOtherDataObj || {};
          remoteOtherDataObj = surplusPayload;
          if (!cuxValidate) return; // 二开的数据校验不通过，终止保存或者提交
        }
        // end    protected 埋点 勿删！！！ -------------------------------------- 结束位置 -------------------------------------

        // 处理 moment格式的时间
        const { birthday } = formData;
        const newPreFormData = {
          ...expertReqFormData,
          ...formData,
          tenantId,
          birthday: birthday ? moment(birthday).format(DEFAULT_DATE_FORMAT) : undefined,
        };

        const newFormData = expertRemote
          ? expertRemote.process(
              'SSRC_EXPERT_REQUISITION_UPDATE_PROCESS_FORM_DATA',
              newPreFormData,
              {
                search,
                expertReqId,
              }
            )
          : newPreFormData;
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
        if (flag) {
          dispatch({
            type: 'expert/requisitionSave',
            payload: {
              expertReq: newFormData,
              expertAchvReqs: achievementdata,
              expertCareerReqs: newCareerPortfolioData,
              expertEducationReqs: newEducationExperienceData,
              expertAttachmentReqs: enclosureData,
              expertFieldReqs: fieldData,
              expertBankReqs: bankInfoData,
              ...(remoteOtherDataObj || {}),
              customizeUnitCode: getCustomizeUnitCode([
                'regisBaseFormUpdate',
                'regisBaseFormDetail',
                'regisBankInfoUpdate',
                'regisFieldUpdate',
                'regisAchievementUpdate',
                'regisCareerUpdate',
                'regisEducationUpdate',
                'regisEnclosureUpdate',
              ]),
            },
          }).then((res) => {
            if (res && !res.failed) {
              notification.success();
              if (expertReqId) {
                this.handleSearchExpertReq();
              } else {
                history.push(`/ssrc/expert-requisition/detail/${res.expertReqId}`);
              }
            }
          });
        } else {
          confirm({
            title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
            okText: intl.get('hzero.common.button.confirm').d('确认'),
            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
            onOk: () => {
              dispatch({
                type: 'expert/requisitionSubmit',
                payload: {
                  expertReq: { ...expertReqFormData, ...newFormData },
                  expertAchvReqs: achievementdata,
                  expertCareerReqs: newCareerPortfolioData,
                  expertEducationReqs: newEducationExperienceData,
                  expertAttachmentReqs: enclosureData,
                  expertFieldReqs: fieldData,
                  expertBankReqs: bankInfoData,
                  ...(remoteOtherDataObj || {}),
                  customizeUnitCode: getCustomizeUnitCode([
                    'regisBaseFormUpdate',
                    'regisBaseFormDetail',
                    'regisBankInfoUpdate',
                    'regisFieldUpdate',
                    'regisAchievementUpdate',
                    'regisCareerUpdate',
                    'regisEducationUpdate',
                    'regisEnclosureUpdate',
                  ]),
                },
              }).then((res) => {
                if (res) {
                  notification.success();
                  history.push('/ssrc/expert-requisition/list');
                }
              });
            },
          });
        }
      }
    });
  }

  /**
   * 删除专家注册申请
   */
  @Bind()
  handleDeleteExpert() {
    const { dispatch, history } = this.props;
    const { expertReqId } = this.state;
    confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？'),
      okText: intl.get('hzero.common.button.confirm').d('确认'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'expert/requisitionDelete',
          payload: {
            expertReqId,
            customizeUnitCode: getCustomizeUnitCode([
              'regisBaseFormUpdate',
              'regisBaseFormDetail',
              'regisBankInfoUpdate',
              'regisFieldUpdate',
              'regisAchievementUpdate',
              'regisCareerUpdate',
              'regisEducationUpdate',
              'regisEnclosureUpdate',
            ]),
          },
        }).then((res) => {
          if (res) {
            notification.success();
            history.push('/ssrc/expert-requisition/list');
          }
        });
      },
    });
  }

  /**
   * 取消专家注册申请
   */
  @Bind()
  handleCancelExpert() {
    const { mapKey } = this.state;
    const {
      dispatch,
      history,
      expert: { [mapKey]: { expertReqFormData = {} } = {} },
    } = this.props;
    confirm({
      title: intl.get('hzero.common.message.confirm.cancel').d('是否确认取消?'),
      okText: intl.get('hzero.common.button.confirm').d('确认'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'expert/requisitionCancel',
          payload: expertReqFormData,
        }).then((res) => {
          if (res) {
            notification.success();
            history.push('/ssrc/expert-requisition/list');
          }
        });
      },
    });
  }

  // 设置银行信息ref
  @Bind()
  setBankInfoTableRef(ref) {
    this.bankInfoTableRef = ref;
  }

  render() {
    const { expertReqId, isEdit, mapKey } = this.state;
    const {
      loading,
      saving,
      submitting,
      deleting,
      cancelLoaing,
      expert: {
        [mapKey]: {
          expertReqFormData = {},
          bankInfoReqList = [], // 银行信息
        } = {},
        code: {
          idTypeList = [],
          expertLevelList = [],
          expertTypeList = [],
          expertCategoryList = [],
          genderList = [],
          crownCodeList = [],
        },
      },
      h0: { customizeForm, customizeTable },
      c7n: { custTable },
      expertRemote,
      location,
      match: { path },
    } = this.props;
    const formProps = {
      isEdit,
      formData: expertReqFormData,
      idTypeList,
      expertLevelList,
      expertTypeList,
      expertCategoryList,
      genderList,
      crownCodeList,
      onRef: this.handleBindRef,
      customizeForm,
      expertRemote,
      path,
      location,
    };

    const fieldProps = {
      isEdit,
      customizeTable,
      expertReqId: mapKey,
      onReload: this.handleSearchExpertReq,
      fieldTableCode: isEdit
        ? getCustomizeUnitCode('regisFieldUpdate')
        : getCustomizeUnitCode('regisFieldDetail'),
    };

    const achievementProps = {
      isEdit,
      customizeTable,
      expertReqId: mapKey,
      onReload: this.handleSearchExpertReq,
      achievemenTableCode: isEdit
        ? getCustomizeUnitCode('regisAchievementUpdate')
        : getCustomizeUnitCode('regisAchievementDetail'),
    };

    const careerPortfolioProps = {
      isEdit,
      customizeTable,
      expertReqId: mapKey,
      onReload: this.handleSearchExpertReq,
      careerTableCode: isEdit
        ? getCustomizeUnitCode('regisCareerUpdate')
        : getCustomizeUnitCode('regisCareerDetail'),
    };

    const educationExperienceProps = {
      isEdit,
      customizeTable,
      expertReqId: mapKey,
      onReload: this.handleSearchExpertReq,
      educationTableCode: isEdit
        ? getCustomizeUnitCode('regisEducationUpdate')
        : getCustomizeUnitCode('regisEducationDetail'),
    };

    const enclosureProps = {
      isEdit,
      customizeTable,
      expertReqId: mapKey,
      onReload: this.handleSearchExpertReq,
      enclosureTableCode: isEdit
        ? getCustomizeUnitCode('regisEnclosureUpdate')
        : getCustomizeUnitCode('regisEnclosureDetail'),
    };

    // 银行信息props
    const bankInfoProps = {
      isEdit,
      bankInfoList: bankInfoReqList,
      customizeTable: custTable,
      bankInfoTableCode: isEdit
        ? getCustomizeUnitCode('regisBankInfoUpdate')
        : getCustomizeUnitCode('regisBankInfoDetail'),
      onRef: this.setBankInfoTableRef,
      // bankInfoTableDS: this.bankInfoTableDS,
    };

    // 所有页签tabs
    const allTabs = [
      <Tabs.TabPane
        tab={intl.get(`${promptCode}.view.message.tab.fieldTable`).d('专业领域')}
        key="fieldTable"
      >
        <FieldTable {...fieldProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`${promptCode}.view.message.tab.achievementTable`).d('专业成果')}
        key="achievementTable"
      >
        <AchievementTable {...achievementProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`${promptCode}.view.message.tab.careerPortfolioTable`).d('职业履历')}
        key="careerPortfolioTable"
      >
        <CareerPortfolioTable {...careerPortfolioProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`${promptCode}.view.message.tab.educationExperienceTable`).d('教育经历')}
        key="educationExperienceTable"
      >
        <EducationExperienceTable {...educationExperienceProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`${promptCode}.view.message.tab.bankInfoTable`).d('银行信息')}
        key="bankInfoTable"
        forceRender
      >
        <BankInfoTable {...bankInfoProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={
          isEdit
            ? intl.get(`hzero.common.upload.text`).d('上传附件')
            : intl.get('hzero.common.upload.modal.title').d('附件')
        }
        key="enclosureTable"
      >
        <EnclosureTable {...enclosureProps} />
      </Tabs.TabPane>,
    ].filter(Boolean);

    // protected 埋点 勿删！！！
    const processAllTabs = expertRemote
      ? expertRemote.process('SSRC_EXPERT_REQUISITION_UPDATE_PROCESS_TABS', allTabs, {
          that: this,
          TabPane: Tabs.TabPane,
          expertReqId: mapKey,
          isEdit,
          search: location?.search,
          expertReqFormData,
        })
      : allTabs;
    // protected 埋点 勿删！！！
    const defaultKey = 'fieldTable';
    const processDefaultKey = expertRemote
      ? expertRemote.process('SSRC_EXPERT_REQUISITION_UPDATE_PROCESS_TABS_DEFAULT_KEY')
      : defaultKey;

    const title = expertRemote
      ? expertRemote.process(
          'SSRC_EXPERT_REQUISITION_UPDATE_PROCESS_HEADER_TITLE',
          intl.get(`${promptCode}.view.title.requisition`).d('专家注册申请'),
          {
            search: location?.search,
            expertReqFormData,
          }
        )
      : intl.get(`${promptCode}.view.title.requisition`).d('专家注册申请');

    return (
      <React.Fragment>
        <Header backPath="/ssrc/expert-requisition/list" title={title}>
          {isEdit && (
            <React.Fragment>
              <Button
                icon="check"
                type="primary"
                loading={submitting || loading}
                onClick={() => this.handleSaveOrSubmit(false)}
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>
              <Button
                icon="save"
                loading={saving || loading}
                onClick={() => this.handleSaveOrSubmit(true)}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              {expertReqFormData.expertReqStatus === 'NEW' && (
                <Button
                  icon="delete"
                  loading={deleting || loading}
                  onClick={this.handleDeleteExpert}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              )}
              {expertReqFormData.expertReqStatus === 'REJECTED' && (
                <Button
                  icon="rollback"
                  loading={cancelLoaing || loading}
                  onClick={this.handleCancelExpert}
                >
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </Button>
              )}
            </React.Fragment>
          )}
        </Header>
        <Content>
          <Spin spinning={expertReqId ? loading : null}>
            <div className="table-list-search">
              <DetailForm {...formProps} />
            </div>
            <Tabs
              defaultActiveKey={processDefaultKey}
              animated={false}
              style={{ marginTop: '-5px' }}
            >
              {/* <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.message.tab.tenderingTable`).d('参与历史寻源')}
                key="tenderingTable"
              >
                <div>123</div>
              </Tabs.TabPane> */}
              {processAllTabs}
            </Tabs>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
