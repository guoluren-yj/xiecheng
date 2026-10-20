/**
 * bidHall - 寻源服务/招标大厅-维护
 * @date: 2018-12-26
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Form, Tabs, Modal, Collapse, Spin, Icon } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import classnames from 'classnames';
import { isEmpty, filter, isUndefined, compose } from 'lodash';
import uuidv4 from 'uuid/v4';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getEditTableData,
  getCurrentUserId,
  addItemToPagination,
  filterNullValueObject,
  getCurrentTenant,
  getResponse,
} from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import remotes from 'hzero-front/lib/utils/remote';
import { openTab } from 'utils/menuTab';

import MatterDetail from '@/routes/components/MatterDetail/EditMatterDetail';
import ExpertSubAccountModal from '@/routes/components/ExpertSubAccount';
import ExpertLibraryModal from '@/routes/components/ExpertLibrary';
import { dateFormate } from '@/utils/utils';
import { fetchSourceMethodConfig } from '@/services/bidHallService';
import bidNotice from '@/assets/bidNotice.svg';
import common from '@/routes/sbid/common.less';
import BidInfoForm from './BidInfoForm';
import BidOtherForm from './BidOtherForm';
import QualificationForm from './QualificationForm';
import BidMemberForm from './BidMemberForm';
import ItemLineTable from './ItemLineTable';
import ProfessionalTable from './ProfessionalTable';
import ScoringElementsTable from './ScoringElementsTable';
import SupplierLineTable from './SupplierLineTable';
import ScoringElementModal from './ScoringElementModal';
import TenderNoticeForm from './TenderNoticeForm';

const { Panel } = Collapse;

@remotes({
  code: 'SSRC_SBID_BID_HALL_UPDATE',
  name: 'remote',
})
class Update extends Component {
  constructor(props) {
    super(props);
    this.ItemLineTable = {};
    const routerParams = querystring.parse(props.location.search.substr(1));
    const { bidRuleType = '', subjectMatterRule = '' } = routerParams;

    this.state = {
      itemLineEditoringId: 0, // 物品行当前操作行id
      itemLineSelectedRows: [], // 物品明细选中行
      itemLineSelectedRowKeys: [], // 物品明细选中ids
      distributeModalVisible: false, // 物品明细分配供应商
      batchSupplierSelectRows: [], // 批量添加供应商选择rows
      batchSupplierSelectRowKeys: [], // 批量添加供应商选择keys
      batchOperateSupplierModelVisible: false, // 批量添加供应商model
      expertLineSelectedRows: [], // 所选择专家行
      expertLineSelectedRowKeys: [], // 所选专家keys
      scoringElementSelectedRows: [], // 评分要素行
      scoringElementSelectedRowKeys: [], // 评分要素行keys
      bidMemberSelectedRows: [], // 招标小组选中
      bidMemberSelectedRowKeys: [], // 招标小组选中keys
      subjectMatterRule, // 标的规则
      sourceMethod: '', // “寻源方式”
      supplierLineSelectedRows: [], // 供应商列表选中行
      supplierLineSelectedRowKeys: [], // 供应商列表选中行keys
      editBidMembersFlag: false, // 招标小组modal
      scoringElementVisible: false, // 招标评分细项modal
      evaluateAssignModalVisible: false, // 评分要素分配专家modal
      scoringSaveType: '', // 评分要素操作的类型-> BUSINESS/TECHNOLOGY/''
      expertSaveType: '', // 保存的类型-> BUSINESS/TECHNOLOGY/''
      bidRuleType: '', // 评标步制
      collapseKeys: ['baseInfos'], // 折叠面板
      localBidRuleType: bidRuleType, // 页面跳转带过来的专家是否区分商务技术
      localSubjectMatterRule: subjectMatterRule, // 页面跳转带过来的是否区分标段
      matterDetail: '', // 招标事项详情
      matterRequireFlag: 0,
      expertModalVisible: false, // 专家子账户弹窗
      expertSource: '', // 专家子账户数据来源 - 'EXPERT_LIBRARY'/'SUB_ACCOUNT'
      rfxTemplateDetail: {}, // 寻源模板配置信息
      allowAddItems: 1,
      allowAddSuppliers: 1,
      allOpenSelectable: false, // 全平台公开是否可以选择
      selectedInfo: {},
    };
  }

  scoringElementsTableRef = null;

  MatterDetail;

  componentDidMount() {
    this.fetchbidHallUpdate();
    this.fetchSetting();
    this.fetchSourceMethodConfig();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'bidHall/updateState',
      payload: {
        header: {},
        bidMembersList: [],
        itemLine: [],
        itemLinePagination: {},
        supplierLine: [],
        scoringElement: [], // 评分要素数据
        scoringNoneTempelate: [], // 模板明细不区分数据
        scoringBusinessTempelate: [], // 模板明细商务组数据
        scoringTechnologyTempelate: [], // 模板明细技术组数据
        evaluateExpertList: [], // none/diff 合并
        itemLineChange: false,
        itemLineExpandedKeys: [],
      },
    });
  }

  /**
   * 单位控制配置项查询
   */

  fetchSetting() {
    const { dispatch } = this.props;

    dispatch({
      type: 'bidHall/querySetting',
      payload: {
        '000112': '000112', // 单位控制
      },
    });
  }

  /**
   * 查询寻源方式配置表
   */
  async fetchSourceMethodConfig() {
    const res = getResponse(
      await fetchSourceMethodConfig({ tenant: getCurrentTenant().tenantNum })
    );
    if (res) {
      this.setState({
        allOpenSelectable: !isEmpty(res),
      });
    }
  }

  /**
   * 查询维护页面信息
   */
  @Bind()
  fetchbidHallUpdate() {
    const {
      match: { params, path },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidHall/fetchBidHeaderDetail',
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        path,
        customizeUnitCode:
          'SSRC.BID_HALL_EDIT.EDIT_HEADER,SSRC.BID_HALL_EDIT.OTHER.INFO,SSRC.BID_HALL_EDIT.EDIT_QUALIFICATION',
      },
    }).then((res = {}) => {
      const { fetchbidHallUpdateLoading } = this.props;
      this.setState({
        fetchbidHallUpdateLoading,
        objectVersionNumber: res.objectVersionNumber,
        matterDetail: res.matterDetail,
        matterRequireFlag: res.matterRequireFlag,
      });
      const {
        expertScoreType = '',
        sourceMethod,
        expertSource = '',
        sourceFrom,
        sourceCategory,
      } = res;
      if (expertScoreType && expertScoreType === 'ONLINE') {
        this.fetchExpert();
        this.fetchScoring();
      }
      if (sourceFrom === 'DEMAND_POOL') {
        this.fetchAllowAddItemSupplier(sourceCategory);
      }
      this.setState({
        sourceMethod,
        expertSource,
      });

      /**
       * @remember
       * 根据模板ID查询模板详情
       */
      this.queryRfxTemplateDetail(res.templateId);
    });
    this.fetchSupplier();

    const lovCodes = {
      quotationTypes: 'SSRC.QUOTATION_TYPE', // 报价方式
      sourceMethods: 'SSRC.SOURCE_METHOD', // 寻源方式
      subjectMatterRules: 'SSRC.SUBJECT_MATTER_RULE', // 标的规则
      reviewMethods: 'SSRC.REVIEW_METHOD', // 审查方式
      bidRoles: 'SSRC.BID_MEMBER_ROLE', // 招标角色
      sourceStages: 'SSRC.SOURCE_STAGE', // 招标阶段
      indicateTypes: 'SSRC.INDICATE_TYPE', // 要素类型
      bidType: 'SSRC.BID_TYPE', // 招标类别
      duty: 'SSRC_NUMBER_DUTY', // 职责
      indicateType: 'SSRC.INDICATE_TYPE', // 评分要素类型
      expertTeam: 'SSRC.EXPERT_TEAM', // 评分类别
      expertDuty: 'SSRC.EXPERT_DUTY', // 专家职责
      calculateTypes: 'SSRC.CALCULATE_TYPE', // 计算方式
      scoreTypes: 'SSRC.SCORE_TYPE', // 评分类型
      benchmarkPriceMethod: 'SSRC.BENCHMARK_PRICE_METHOD', // 基准价计算方法
      formula: 'SSRC.INDIC_FORMULA', // 价格计算公式
      idd: 'HPFM.IDD', // 国际冠码
    };
    dispatch({
      type: 'bidHall/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * 获取物料供应商商
   *
   * @memberof Update
   */
  @Bind()
  fetchAllowAddItemSupplier(sourceCategory) {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/allowAddItemSupplier',
      payload: {
        sourceCategory,
      },
    }).then((res) => {
      if (res && !res.failed) {
        this.setState({
          allowAddItems: Number(res.allowNewItemsFlag),
          allowAddSuppliers: Number(res.allowNewSupplierFlag),
        });
      }
    });
  }

  /**
   * 获取供应商
   *
   * @memberof Update
   */
  @Bind()
  fetchSupplier(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidHall/fetchSupplierLine',
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
        customizeUnitCode: 'SSRC.BID_HALL_EDIT.SUPPLIER.TABLE',
      },
    });
  }

  /**
   * 获取专家数据
   *
   * @memberof Update
   */
  fetchExpert() {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    const { localBidRuleType } = this.state;
    dispatch({
      type: 'bidHall/fetchExpertAllocationData',
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID', // 来源是bid/rfx
        expertStatus: 'SUBMITTED', // 查询提交后的专家数据
        bidRuleType: localBidRuleType,
        customizeUnitCode: 'SSRC.BID_HALL_EDIT.EXPERT_SCORE',
      },
    });
  }

  /**
   * 获取招标小组
   *
   * @memberof Update
   */
  fetchMembers() {
    const {
      dispatch,
      organizationId,
      match: { params = {}, path },
    } = this.props;

    dispatch({
      type: 'bidHall/fetchBidMembers',
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        path,
        customizeUnitCode: 'SSRC.BID_HALL_EDIT.BIDDING_GROUP',
      },
    });
  }

  /**
   * 获取评分要素数据
   *
   * @memberof Update
   */
  @Bind()
  fetchScoring() {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    const { localBidRuleType } = this.state;
    dispatch({
      type: 'bidHall/fetchTempelateDetailData',
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
        bidRuleType: localBidRuleType,
        customizeUnitCode:
          'SSRC.BID_HALL_EDIT.SCORE_INDICS,SSRC.BID_HALL_EDIT.SCORE_INDICS_TECHNOLOGY',
      },
    }).then((res) => {
      if (res?.businessIndicList?.length) {
        this.scoringElementsTableRef.businessWeight = res.businessIndicList[0]?.businessWeight;
      }

      if (res?.technologyIndicList?.length) {
        this.scoringElementsTableRef.technologyWeight =
          res.technologyIndicList[0]?.technologyWeight;
      }
    });
  }

  /**
   * 物品明细 - 查询
   */
  @Bind()
  fetchItemLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    const { localSubjectMatterRule } = this.state;
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        itemLine: [],
        itemLinePagination: {},
      },
    });
    dispatch({
      type: 'bidHall/fetchItemLine',
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
        subjectMatterRule: localSubjectMatterRule,
        customizeUnitCode:
          localSubjectMatterRule === 'PACK'
            ? 'SSRC.BID_HALL_EDIT.EDIT_LINE'
            : 'SSRC.BID_HALL_EDIT.EDIT_LINE_NONE',
      },
    });
  }

  /**
   * 物品明细 - 页面初始化展开
   *
   * @param {*} res
   * @param {*} [result=[]]
   * @memberof Update
   */
  initItemLineExpandKeys(res, result = []) {
    const { dispatch } = this.props;

    const keys = this.updateItemLineExpandedKeys(res, result);
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        itemLineExpandedKeys: keys,
      },
    });
  }

  /**
   * 物品明细 - 更新展开数据的行keys
   *
   * @param {*} [res=[]]
   * @param {*} [keys=[]]
   * @returns keys
   * @memberof Update
   */
  updateItemLineExpandedKeys(res = [], keys = []) {
    if (!res) {
      return;
    }

    if (res instanceof Array) {
      res.forEach((item) => {
        keys.push(item.bidLineItemId);
        this.updateItemLineExpandedKeys(item.children, keys);
      });
    } else if (res instanceof Object) {
      if (!res.bidLineItemId) {
        return;
      }
      keys.push(res.bidLineItemId);
      this.updateItemLineExpandedKeys(res.children, keys);
    } else {
      return [];
    }

    return [...new Set(keys)];
  }

  /**
   * 物品明细 - 点击+操作展开关闭状态
   *
   * @param {*} expanded
   * @param {*} record
   * @memberof Update
   */
  @Bind()
  handleExpandRow(expanded, record) {
    const {
      bidHall: { itemLineExpandedKeys = [] },
    } = this.props;

    if (!expanded) {
      this.unExpandedRow(record, itemLineExpandedKeys);
    } else {
      this.initItemLineExpandKeys(record, itemLineExpandedKeys);
    }
  }

  /**
   * 物品明细 - 页面初始化关闭
   *
   * @param {*} record
   * @param {*} itemLineExpandedKeys
   * @returns
   * @memberof Update
   */
  unExpandedRow(record, itemLineExpandedKeys) {
    if (!record.bidLineItemId) {
      return;
    }

    const { dispatch } = this.props;

    const updateKeys = (key) => {
      dispatch({
        type: 'bidHall/updateState',
        payload: {
          itemLineExpandedKeys: key,
        },
      });
    };

    const oldKeys = [...[], ...itemLineExpandedKeys];

    oldKeys.splice(oldKeys.indexOf(record.bidLineItemId), 1);
    if (!record.chidlren || !Array.isArray(record.children) || !record.chidlren.length) {
      updateKeys(oldKeys);
      return;
    }

    record.children.forEach((child) => {
      oldKeys.splice(oldKeys.indexOf(child.bidLineItemId), 1);
    });

    dispatch({
      type: 'bidHall/updateState',
      payload: {
        itemLineExpandedKeys: oldKeys,
      },
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 改变币种-人民币时汇率为1.0000000
   */
  @Bind()
  changeCurrencyCode(val) {
    const { form } = this.props;
    if (val === 'RMB') {
      form.setFieldsValue({ exchangeRate: 1.0 });
    } else {
      form.setFieldsValue({ exchangeRate: undefined });
    }
  }

  /**
   * 编辑招标小组
   *
   * @memberof Update
   */
  @Bind()
  editBidMembers() {
    this.fetchMembers();

    this.setState({
      bidMemberSelectedRows: [],
      bidMemberSelectedRowKeys: [],
      editBidMembersFlag: true,
    });
  }

  /**
   * 取消操作小组成员
   */
  @Bind()
  handleMembersCancel() {
    this.props.dispatch({
      type: 'bidHall/updateState',
      payload: {
        scoringElement: [],
      },
    });

    this.setState({
      editBidMembersFlag: false,
      bidMemberSelectedRows: [],
      bidMemberSelectedRowKeys: [],
    });
  }

  /**
   * 招标小组 -新增行
   */
  @Bind()
  handleMembersCreate() {
    const {
      dispatch,
      organizationId,
      match: { params },
      bidHall: { bidMembersList = [] },
    } = this.props;
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        bidMembersList: [
          {
            bidHeaderId: params.bidId,
            bidMemberId: uuidv4(),
            tenantId: organizationId,
            bidRole: undefined,
            loginName: undefined,
            userName: undefined,
            sectionName: undefined,
            contactMail: undefined,
            contactMobilephone: undefined,
            objectVersionNumber: 0,
            _status: 'create',
          },
          ...bidMembersList,
        ],
      },
    });
  }

  /**
   * 添加保存小组成员
   *
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  handleMembersSave() {
    const {
      dispatch,
      organizationId,
      match: { params = {} },
      bidHall: { bidMembersList = [] },
    } = this.props;

    const newParams = getEditTableData(bidMembersList, ['bidMemberId']);

    if (!isEmpty(newParams)) {
      dispatch({
        type: 'bidHall/saveBidMembers',
        payload: {
          newParams,
          organizationId,
          bidHeaderId: params.bidId,
          customizeUnitCode: 'SSRC.BID_HALL_EDIT.BIDDING_GROUP',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchMembers();
        }
      });
    }
  }

  // 删除小组成员
  @Bind()
  handleMembersDelete = () => {
    const {
      dispatch,
      organizationId,
      match: { params = {} },
      bidHall: { bidMembersList = [] },
    } = this.props;
    const { bidMemberSelectedRows } = this.state;
    const newMembers = filter(bidMembersList, (item) => {
      return (
        bidMemberSelectedRows &&
        bidMemberSelectedRows.map((r) => r.bidMemberId).indexOf(item.bidMemberId) < 0
      );
    });

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        bidMemberSelectedRows.forEach((item) => {
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });

        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'bidHall/updateState',
            payload: {
              bidMembersList: newMembers,
            },
          });
        } else {
          dispatch({
            type: 'bidHall/deleteBidMembers',
            payload: {
              newParams: remoteDelete,
              organizationId,
              bidHeaderId: params.bidId,
              customizeUnitCode: 'SSRC.BID_HALL_EDIT.BIDDING_GROUP',
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchMembers();
              this.setState({ bidMemberSelectedRows: [], bidMemberSelectedRowKeys: [] });
            }
          });
        }
      },
      onCancel: () => {
        this.handleMembersCancel();
      },
    });
  };

  // 改变标的规则
  @Bind()
  @Debounce(500)
  changeSubjectMatterRule = (val) => {
    const {
      organizationId,
      form,
      dispatch,
      bidHall: { header = {} },
    } = this.props;
    const { subjectMatterRule } = this.state;

    if (!val || subjectMatterRule === val) {
      return;
    }

    Modal.confirm({
      title: intl
        .get(`ssrc.bidHall.view.message.changeSubjectMatterWarning`)
        .d('切换标的规则后，将会清空物品信息，是否继续切换'),
      onOk: () => {
        dispatch({
          type: 'bidHall/changeSubjectMatterRule',
          payload: {
            organizationId,
            bidHeaderId: header.bidHeaderId,
            subjectMatterRule: val,
          },
        }).then((res) => {
          if (!res) {
            return;
          }
          this.setState({
            subjectMatterRule: val,
            objectVersionNumber: res.objectVersionNumber,
            localSubjectMatterRule: val,
          });
          this.fetchItemLine();
        });
      },
      onCancel: () => {
        form.setFieldsValue({
          subjectMatterRule: header.subjectMatterRule,
        });
        this.setState({
          subjectMatterRule: header.subjectMatterRule,
        });

        dispatch({
          type: 'bidHall/updteState',
          payload: {
            header,
          },
        });
      },
    });
  };

  // 改变寻缘方式 lov
  @Bind()
  changeSourceMethod = (val) => {
    const { form } = this.props;

    form.setFieldsValue({
      projectName: '',
      projectId: '',
      projectNum: '',
      bidPlanLineName: '',
      bidPlanId: '',
    });

    let values = '';
    switch (val) {
      case 'OPEN':
        values = 'PARTNER_DISCLOSURE';
        break;
      case 'ALL_OPEN':
        values = 'FULL_PLATFORM_OPEN';
        break;
      default:
        values = val;
        break;
    }

    this.setState({
      sourceMethod: values,
    });
  };

  /**
   * 改变寻源模板
   * overRide 树根互联
   * @param {*} val
   * @param {*} record
   * @returns
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  changeTemplateOnOk(val, record) {
    const {
      form,
      dispatch,
      organizationId,
      match: { params = {} },
    } = this.props;

    const {
      subjectMatterRule = '',
      bidRuleType = '',
      expertScoreType = '',
      sourceMethod = '',
    } = record;
    if (subjectMatterRule === this.state.subjectMatterRule) {
      // 切换寻源模板标的规则没有改变，刷新页面
      this.setState({
        fetchbidHallUpdateLoading: true,
        localBidRuleType: bidRuleType,
        localSubjectMatterRule: subjectMatterRule,
        subjectMatterRule,
        sourceMethod,
        bidRuleType,
      });
      dispatch({
        type: 'bidHall/fetchChangeTemplateData',
        payload: { organizationId, bidHeaderId: params.bidId, sourceTemplateId: record.templateId },
      }).then((res = {}) => {
        if (res) {
          this.setState({
            fetchbidHallUpdateLoading: false,
            matterDetail: res.matterDetail || '',
          });
          dispatch({
            type: 'bidHall/updateState',
            payload: {
              header: res,
            },
          });
          this.fetchItemLine();
          if (expertScoreType && expertScoreType === 'ONLINE') {
            this.fetchExpert();
            this.fetchScoring();
          }
          form.setFieldsValue({
            subjectMatterRule: res.subjectMatterRule, // 标的规则
            sourceMethod: res.sourceMethod, // 寻源方式
            quotationType: res.quotationType, // 报价方式
          });
        }
      });
      // 查询寻源模板配置信息 - 基于寻源模板id查询
      this.queryRfxTemplateDetail(record.templateId);
    } else {
      // 切换寻源模板标的规则改变，需清空已维护的物品行
      Modal.confirm({
        title: intl
          .get(`ssrc.bidHall.view.message.confirmSwitchTemplateYesOrNot`)
          .d('由于标的规则改变，继续操作将清空已维护的物品行，是否确认切换寻源模板？'),
        okText: intl.get('hzero.common.button.yes').d('是'),
        cancelText: intl.get('hzero.common.button.no').d('否'),
        onOk: () => {
          this.setState({
            fetchbidHallUpdateLoading: true,
            localBidRuleType: bidRuleType,
            localSubjectMatterRule: subjectMatterRule,
            subjectMatterRule,
            sourceMethod,
            bidRuleType,
          });
          dispatch({
            type: 'bidHall/fetchChangeTemplateData',
            payload: {
              organizationId,
              bidHeaderId: params.bidId,
              sourceTemplateId: record.templateId,
            },
          }).then((res = {}) => {
            if (res) {
              this.setState({
                fetchbidHallUpdateLoading: false,
                matterDetail: res.matterDetail || '',
              });
              dispatch({
                type: 'bidHall/updateState',
                payload: {
                  header: res,
                },
              });
              this.fetchItemLine();
              if (expertScoreType && expertScoreType === 'ONLINE') {
                this.fetchExpert();
                this.fetchScoring();
              }
              form.setFieldsValue({
                subjectMatterRule: res.subjectMatterRule, // 标的规则
                sourceMethod: res.sourceMethod, // sourceMethod
                quotationType: res.quotationType, // 报价方式
              });
            }
          });

          // 查询寻源模板配置信息 - 基于寻源模板id查询
          this.queryRfxTemplateDetail(record.templateId);
        },
        onCancel: () => {
          this.cancelChangeTemplate();
        },
      });
    }
  }

  /**
   * modal 取消改变寻源模板
   *
   * @memberof Update
   */
  @Bind()
  cancelChangeTemplate() {
    const {
      form,
      bidHall: { header = {} },
    } = this.props;

    form.setFieldsValue({
      templateId: header.templateId,
      templateName: header.templateName,
    });
  }

  /**
   * 改变公司 lov
   *
   * @param {*} val
   * @param {*} record
   * @param {*} tt
   * @memberof Update
   */
  @Bind()
  changeCompanyOnOk(val, record) {
    const {
      dispatch,
      organizationId,
      form,
      match: { params = {} },
    } = this.props;

    // 切换公司后，询问是否切换公司，如果切换调删除接口删除供应商数据
    Modal.confirm({
      title: intl
        .get(`ssrc.bidHall.view.message.continueSwitchCompanyYesOrNot`)
        .d('切换公司后，将会清空对应物品和供应商数据，是否切换？'),
      okText: intl.get('hzero.common.button.yes').d('是'),
      cancelText: intl.get('hzero.common.button.no').d('否'),
      onOk: () => {
        form.setFieldsValue({
          currencyCode: record.currencyCode,
          currencyId: record.currencyId,
        });
        dispatch({
          type: 'bidHall/changeCompany',
          payload: {
            organizationId,
            bidHeaderId: params.bidId,
            companyId: record.companyId,
            companyName: record.companyName,
          },
        }).then((res = {}) => {
          if (res) {
            this.setState({
              objectVersionNumber: res.objectVersionNumber,
            });
            this.fetchItemLine();
            this.fetchSupplier();
          }
        });
        dispatch({
          type: 'bidHall/fetchMatterRequireFlag',
          payload: {
            organizationId,
            companyId: record.companyId,
          },
        }).then((res) => {
          if (res) {
            this.setState({
              matterRequireFlag: res.bidRequireFlag,
            });
          }
        });
      },
      onCancel: () => {
        this.cancelChangeCompany();
      },
    });
  }

  /**
   * 取消改变公司
   *
   * @memberof Update
   */
  @Bind()
  cancelChangeCompany() {
    const {
      form,
      bidHall: { header = {} },
    } = this.props;

    form.setFieldsValue({
      companyId: header.companyId,
      companyName: header.companyName,
    });
  }

  /**
   * 当币种为人民币，汇率为1
   *
   * @param {*} val
   * @param {*} record
   * @memberof Update
   */
  @Bind()
  setValue(val, record) {
    const { form } = this.props;
    this.setState({
      currencyId: record.currencyId,
    });

    if (val === 'RMB') {
      form.setFieldsValue({
        exchangeRate: 1.0,
      });
    } else {
      form.setFieldsValue({
        exchangeRate: null,
      });
    }
  }

  /**
   * 选择寻源计划
   *
   * @param {*} val  当前值
   * @param {*} record 当前记录数据
   * @returns
   * @memberof Update
   */
  @Bind()
  changeBidSourcePlan(val, record) {
    const { form } = this.props;

    const {
      projectName = '',
      projectId = '',
      projectNum = '',
      projectAddress = '',
      bidPlanLineName = '',
      bidPlanId = '',
    } = record;

    form.setFieldsValue({
      projectName,
      projectId,
      projectNum,
      bidLocation: projectAddress,
      bidPlanLineName,
      bidPlanId,
    });
  }

  /**
   * 改变项目编码
   *
   * @param {*} val
   * @param {*} record
   * @returns
   * @memberof Update
   */
  @Bind()
  changeProjectInfo(val, record) {
    const { form } = this.props;

    form.setFieldsValue({
      projectName: val ? record.projectName : '',
      projectId: val ? record.projectId : '',
      projectNum: val ? record.projectNum : '',
      bidLocation: val ? record.projectAddress : '',
    });
  }

  /**
   * 选中付款方式数据
   *
   * @param {*} val -- lov 值
   * @param {*} record
   * @returns
   * @memberof Update
   */
  @Bind()
  changePaymentType(val, record) {
    const { form } = this.props;
    if (!val) {
      return;
    }

    const { typeId: paymentTypeId, typeName: paymentTypeName } = record;

    form.setFieldsValue({
      paymentTypeId,
      paymentTypeName,
    });
  }

  /**
   * 改变审查方式
   * 选择合格制时，合格上限清空置灰
   */
  @Bind()
  changeReviewMethod(value) {
    const {
      form: { setFieldsValue },
    } = this.props;
    if (value === 'QUALIFIED') {
      setFieldsValue({ qualifiedLimit: undefined });
    }
  }

  /**
   * 启用评分细项
   *
   * @param {*} val
   * @memberof Update
   */
  @Bind()
  changeScoreFlag(val) {
    const { form } = this.props;

    form.setFieldsValue({
      enableScoreFlag: val.target.checked,
    });
  }

  /**
   * 编辑-打开评分要素定义模态框
   */
  @Bind()
  showScoringElement() {
    this.setState({
      scoringElementVisible: true,
    });
    this.fetchScoringElementData();
  }

  /**
   * 查询-评分要素定义数据
   */
  @Bind()
  fetchScoringElementData() {
    const {
      dispatch,
      bidHall: { header = {} },
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidHall/fetchScoringElementData',
      payload: { prequalHeaderId: header.prequalHeaderId, organizationId },
    });
  }

  /**
   * 获取选中行-评分要素定义
   */
  @Bind()
  handleScoringElementRowSelectChange(keys = [], selectedRows = []) {
    this.setState({
      scoringElementSelectedRowKeys: keys,
      scoringElementSelectedRows: selectedRows,
    });
  }

  /**
   * 新增行-评分要素定义
   */
  @Bind()
  handleCreateScoringElement() {
    const {
      dispatch,
      bidHall: { scoringElement = [], header = {} },
    } = this.props;
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        scoringElement: [
          {
            prequalHeaderId: header.prequalHeaderId,
            prequalScoreAssignId: uuidv4(),
            indicateId: undefined,
            indicateName: undefined,
            indicateType: undefined,
            minScore: undefined,
            maxScore: undefined,
            mustApprovedFlag: 0,
            qualifiedScore: undefined,
            _status: 'create',
          },
          ...scoringElement,
        ],
      },
    });
  }

  /**
   * 删除-评分要素定义
   */
  @Bind
  handleDeleteScoringElement() {
    const {
      dispatch,
      bidHall: { scoringElement = [] },
      organizationId,
    } = this.props;
    const { scoringElementSelectedRows } = this.state;
    // 过滤出勾选数据的剩下数据
    const newScoringElement = filter(scoringElement, (item) => {
      return (
        scoringElementSelectedRows &&
        scoringElementSelectedRows
          .map((r) => r.prequalScoreAssignId)
          .indexOf(item.prequalScoreAssignId) < 0
      );
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        scoringElementSelectedRows.forEach((item) => {
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'bidHall/updateState',
            payload: {
              scoringElement: newScoringElement,
            },
          });
          this.setState({ scoringElementSelectedRows: [], scoringElementSelectedRowKeys: [] });
        } else {
          dispatch({
            type: 'bidHall/deleteScoringElement',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: 'bidHall/updateState',
                payload: {
                  scoringElement: newScoringElement,
                },
              });
              this.setState({ scoringElementSelectedRows: [], scoringElementSelectedRowKeys: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 保存-评分要素定义
   */
  @Bind()
  @Debounce(500)
  handleSaveScoringElement() {
    const {
      dispatch,
      organizationId,
      bidHall: { scoringElement = [], header = {} },
    } = this.props;
    const { scoringElementSelectedRows = [] } = this.state;
    const params = getEditTableData(scoringElement, ['prequalScoreAssignId']);
    if (!isEmpty(params)) {
      const newParams = params.map((item) => {
        return {
          ...item,
          prequalHeaderId: item.prequalHeaderId,
          prequalScoreAssignId: item.prequalScoreAssignId,
          scoreIndicId: item.indicateId,
          mustApprovedFlag: item.mustApprovedFlag,
          qualifiedScore: item.qualifiedScore,
          objectVersionNumber: item.objectVersionNumber,
        };
      });
      dispatch({
        type: 'bidHall/saveScoringElement',
        payload: { newParams, organizationId, prequalHeaderId: header.prequalHeaderId },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchScoringElementData();
          if (!isEmpty(scoringElementSelectedRows)) {
            this.setState({
              scoringElementSelectedRows: [],
              scoringElementSelectedRowKeys: [],
            });
          }
        }
      });
    }
  }

  /**
   * 招标书维护-取消
   */
  @Bind()
  @Debounce(500)
  handleCancelBidHall() {
    const {
      dispatch,
      match: { params },
      organizationId,
    } = this.props;
    Modal.confirm({
      title: intl
        .get(`ssrc.bidHall.model.bidHall.noSupplier.cancelChange`)
        .d('是否确认取消并关闭该单据？'),
      okText: intl.get('hzero.common.button.ok').d('确定'),
      onOk: () => {
        dispatch({
          type: 'bidHall/cancelbidHallUpdate',
          payload: {
            organizationId,
            bidHeaderId: params.bidId,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.props.history.push({
              pathname: '/ssrc/bid-hall/list',
            });
          }
        });
      },
      onCancel: () => {},
    });
  }

  /**
   * 关闭-评分要素定义模态框
   */
  @Bind()
  handleCancelScoringElement() {
    this.props.dispatch({
      type: 'bidHall/updateState',
      payload: {
        scoringElement: [],
      },
    });
    this.setState({
      scoringElementVisible: false,
      scoringElementSelectedRows: [],
      scoringElementSelectedRowKeys: [],
    });
  }

  /**
   * 选择参考模板回调-评分要素
   */
  @Bind()
  @Debounce(500)
  handleSelectTemplateOk(value) {
    const {
      dispatch,
      bidHall: { header = {} },
      organizationId,
    } = this.props;
    const { scoringElementSelectedRows = [] } = this.state;
    if (value.scoreIndics) {
      dispatch({
        type: 'bidHall/saveScoringElement',
        payload: {
          newParams: value.scoreIndics,
          organizationId,
          prequalHeaderId: header.prequalHeaderId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          if (!isEmpty(scoringElementSelectedRows)) {
            this.setState({
              scoringElementSelectedRows: [],
              scoringElementSelectedRowKeys: [],
            });
          }
          this.fetchScoringElementData();
        }
      });
    } else {
      Modal.confirm({
        title: intl
          .get(`ssrc.bidHall.view.message.confirm.notDefineScoringElement`)
          .d('该模板未定义评分要素'),
        onOk: () => {},
        onCancel: () => {},
      });
    }
  }

  /**
   * 物品明细-新增行-不分标段
   */
  @Bind()
  createItemLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      bidHall: { itemLine = [], itemLinePagination = {} },
    } = this.props;
    const {
      subjectMatterRule,
      rfxTemplateDetail: { taxId, taxCode, taxRate, taxIncludedFlag, freightIncludedFlag },
    } = this.state;

    dispatch({
      type: 'bidHall/updateState',
      payload: {
        itemLine: [
          {
            sectionFlag: 0,
            bidHeaderId: params.bidId,
            bidLineItemId: uuidv4(),
            tenantId: organizationId,
            // 新增税率, 是否含税等字段, 来源寻源模板
            taxId,
            taxCode,
            taxRate,
            taxIncludedFlag,

            // bidLineItemNum: itemLine.length + 1,
            // children: subjectMatterRule === 'NONE' ? null : [{
            //   bidHeaderId: '',
            //   parentSectionId: '',
            //   parentSectionNum: '',
            //   businessUnit: '',
            //   bidLineItemId: '',
            //   bidLineItemNum: '',
            // }],
            children: subjectMatterRule === 'NONE' ? undefined : [],
            sectionNum: undefined,
            sectionName: undefined,
            demandDate: null,
            ouId: undefined,
            inventoryOrg: organizationId,
            itemCode: undefined,
            itemName: undefined,
            itemCategory: undefined,
            itemCategoryId: null,
            itemCategoryName: '',
            bidQuantity: undefined,
            unit: undefined,
            costPrice: undefined,
            lineAttachmentUuid: uuidv4(),
            prNum: undefined,
            lineNum: undefined,
            parentSectionId: null,
            parentSectionNum: null,
            roundFlag: '',
            currentRoundNumber: '',
            freightIncludedFlag, // 从寻源模板中获取含运费标识
            _status: 'create',
          },
          ...itemLine,
        ],
        itemLinePagination: addItemToPagination(itemLine.length, itemLinePagination),
      },
    });
  }

  /**
   * 物品明细-新增物品行-分标段
   */
  @Bind()
  createItemLineSon(val) {
    const {
      dispatch,
      match: { params },
      bidHall: { itemLine = [], itemLineExpandedKeys },
    } = this.props;

    const itemLineSon = itemLine.map((item, index) => {
      if (item.bidLineItemId === val.bidLineItemId) {
        const childrenArr = item.children ? item.children : [];
        const createdLine = this.handleCreateChildren(params, val, item, childrenArr);
        itemLine[index].children = createdLine;
      }
      return item;
    });

    // 打开物品行
    this.initItemLineExpandKeys(val, itemLineExpandedKeys);

    dispatch({
      type: 'bidHall/updateState',
      payload: {
        itemLine: [...itemLineSon],
      },
    });
  }

  /**
   * 物品明细-点击分配按钮
   */
  @Bind()
  onDistributeSupplierForItemLine(record) {
    const { sourceMethod } = this.state;
    if (!record || sourceMethod !== 'INVITE') {
      return;
    }

    const {
      dispatch,
      organizationId,
      bidHall: { supplierLine = [] },
    } = this.props;

    if (!supplierLine.length) {
      notification.warning({
        message: intl.get(`ssrc.bidHall.model.bidHall.noSupplier`).d('没有供应商'),
      });
      return;
    }

    dispatch({
      type: 'bidHall/supplierRecord',
      payload: {
        organizationId,
        bidHeaderId: record.bidHeaderId,
        bidLineItemId: record.bidLineItemId,
      },
    });

    this.setState({ distributeModalVisible: true });
  }

  /**
   * 物品明细-分配招标明细
   */
  @Bind()
  @Debounce(500)
  distributeSupplierForItemLIne() {
    const {
      dispatch,
      organizationId,
      bidHall: { supplierData = [] },
    } = this.props;
    const newSupplierData = getEditTableData(supplierData, ['itemSupAssignId']);

    dispatch({
      type: 'bidHall/saveSupplierRecordLine',
      payload: {
        organizationId,
        other: newSupplierData,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.cancelDistribute();
      }
    });
  }

  /**
   * 明细取消分配供应商,
   * void
   * @memberof Update
   */
  @Bind()
  cancelDistribute() {
    this.setState({ distributeModalVisible: false });

    const { dispatch } = this.props;

    dispatch({
      type: 'bidHall/updateState',
      payload: {
        supplierData: [],
      },
    });
  }

  /**
   * 创建明细子元素
   *
   * @param {*} [children=[]] 子元素数组对象关闭modal
   * @param {*} params
   * @param {*} val 父元素数据
   * @returns
   * @memberof new children object
   */
  handleCreateChildren(params, val, item, childrenArr = []) {
    const {
      rfxTemplateDetail: { taxId, taxCode, taxRate, taxIncludedFlag, freightIncludedFlag },
    } = this.state;
    const childLen = item.children ? item.children.length + 1 : 1;
    const newChildren = [
      {
        // 新增税率, 是否含税等字段, 来源寻源模板
        taxId,
        taxCode,
        taxRate,
        taxIncludedFlag,

        bidHeaderId: params.bidId,
        parentSectionId: val.bidLineItemId,
        parentSectionNum: val.bidLineItemNum,
        bidLineItemId: uuidv4(),
        tenantId: val.tenantId,
        ouId: val.ouId,
        ouName: val.ouName,
        invOrganizationId: val.invOrganizationId,
        invOrganizationName: val.invOrganizationName,
        demandDate: val.demandDate,
        bidLineItemNum: childLen,
        sectionFlag: 0,
        roundFlag: '',
        currentRoundNumber: '',
        freightIncludedFlag, // 从寻源模板中获取含运费标识
        _status: 'create',
      },
      ...childrenArr,
    ];

    return newChildren;
  }

  /**
   * 物品明细-保存
   */
  @Bind()
  @Debounce(500)
  saveItemLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      bidHall: { header = {}, itemLine = [], itemLinePagination = {} },
    } = this.props;
    const { subjectMatterRule } = this.state;
    const newParams = this.getItemLineSaveDate(itemLine);
    if (!isEmpty(newParams)) {
      const newParameters = newParams.map((item) => {
        return {
          ...item,
          demandDate: dateFormate(item.demandDate, DATETIME_MIN),
          subjectMatterRule: subjectMatterRule || header.subjectMatterRule,
        };
      });
      dispatch({
        type: 'bidHall/saveItemLine',
        payload: {
          newParameters,
          organizationId,
          bidHeaderId: params.bidId,
          customizeUnitCode:
            subjectMatterRule === 'PACK'
              ? 'SSRC.BID_HALL_EDIT.EDIT_LINE'
              : 'SSRC.BID_HALL_EDIT.EDIT_LINE_NONE',
        },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'bidHall/updateState',
            payload: {
              itemLine: [],
              itemLinePagination: {},
            },
          });
          notification.success();
          this.fetchItemLine(itemLinePagination);
          this.fetchSupplier();
          if (!isEmpty(this.state.itemLineSelectedRowKeys)) {
            this.setState({
              itemLineSelectedRows: [],
              itemLineSelectedRowKeys: [],
            });
          }
        }
      });
    }
  }

  /**
   * 物品明细-本地删除-筛选不需要删除的数据
   *
   * @returns 本地未删除的数据
   * @memberof Update
   */
  filterBeforeDeleteLineItems() {
    const {
      bidHall: { itemLine = [] },
    } = this.props;

    const { itemLineSelectedRowKeys } = this.state;
    const unDeleteData = [];

    itemLine.forEach((item) => {
      if (item && !itemLineSelectedRowKeys.includes(item.bidLineItemId)) {
        if (item.children && item.children.length) {
          // eslint-disable-next-line no-param-reassign
          item.children = item.children.filter(
            (child) => child && !itemLineSelectedRowKeys.includes(child.bidLineItemId)
          );
        } else {
          // eslint-disable-next-line no-param-reassign
          item.children = null;
        }
        unDeleteData.push(item);
      }
      return unDeleteData;
    });

    return unDeleteData;
  }

  /**
   * 物品明细 - 批量删除
   */
  @Bind()
  deleteItemLines() {
    const {
      dispatch,
      match: { params = {}, path },
      organizationId,
      bidHall: { header = {} },
    } = this.props;

    const { itemLineSelectedRows } = this.state;
    const unDeleteData = this.filterBeforeDeleteLineItems();
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        itemLineSelectedRows.forEach((item) => {
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });

        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'bidHall/updateState',
            payload: {
              itemLine: unDeleteData,
            },
          });
          this.setState({ itemLineSelectedRowKeys: [], itemLineSelectedRows: [] });
        } else {
          dispatch({
            type: 'bidHall/deleteItemLines',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: 'bidHall/fetchItemLine',
                payload: {
                  organizationId,
                  bidHeaderId: params.bidId,
                  path,
                  subjectMatterRule: header.subjectMatterRule,
                  customizeUnitCode:
                    header.subjectMatterRule === 'PACK'
                      ? 'SSRC.BID_HALL_EDIT.EDIT_LINE'
                      : 'SSRC.BID_HALL_EDIT.EDIT_LINE_NONE',
                },
              });
              this.fetchSupplierList();
              this.setState({ itemLineSelectedRowKeys: [], itemLineSelectedRows: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 清除选中行
   */
  @Bind()
  clearSelectedRows() {
    this.setState({
      itemLineSelectedRows: [],
      itemLineSelectedRowKeys: [],
    });
  }

  /**
   * 物品明细-表格内容改变
   */
  @Bind()
  changeItemLineTableData() {
    const {
      dispatch,
      bidHall: { itemLineChange = false },
    } = this.props;
    if (!itemLineChange) {
      dispatch({
        type: 'bidHall/updateState',
        payload: {
          itemLineChange: true,
        },
      });
    }
  }

  /**
   * 供应商列表-新增行
   */
  @Bind()
  createSupplierLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      bidHall: { supplierLine = [], supplierLinePagination = {} },
    } = this.props;
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        supplierLine: [
          {
            bidHeaderId: params.bidId,
            bidLineSupplierId: uuidv4(),
            tenantId: organizationId,
            supplierCompanyNum: undefined,
            supplierCompanyName: undefined,
            lifeCycle: undefined,
            contactName: undefined,
            contactMobilephone: undefined,
            contactMail: '',
            supplierContactId: undefined,
            _status: 'create',
          },
          ...supplierLine,
        ],
        supplierLinePagination: addItemToPagination(supplierLine.length, supplierLinePagination),
      },
    });
  }

  /**
   * 打开批量添加供应商弹窗
   *
   * @memberof Update
   */
  @Bind()
  openBatchAddModel() {
    this.setState({
      batchOperateSupplierModelVisible: true,
    });

    this.fetchSupplierList();
  }

  /**
   * 获取批量添加供应商列表数据
   *
   * @memberof Update
   */
  @Bind()
  fetchSupplierList(page = {}) {
    const {
      dispatch,
      organizationId,
      userId,
      match: { params },
      bidHall: { header = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'bidHall/fetchBulkSupplierData',
      payload: {
        ...fieldValues,
        organizationId,
        userId,
        companyId: header.companyId || '',
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        templateId: header.templateId,
        page,
      },
    });
  }

  /**
   * 批量添加供应商
   *
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  batchAddBidSupplier() {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;

    const { batchSupplierSelectRows } = this.state;

    if (!isEmpty(batchSupplierSelectRows)) {
      dispatch({
        type: 'bidHall/saveSupplierLine',
        payload: { newParams: batchSupplierSelectRows, organizationId, bidHeaderId: params.bidId },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchSupplier();
          this.cancelBatchOperate();
        }
      });
    }
    this.cancelBatchOperate();
  }

  /**
   * 取消供应商批量操作
   *
   * @memberof Update
   */
  @Bind()
  cancelBatchOperate() {
    this.setState({
      batchOperateSupplierModelVisible: false,
      batchSupplierSelectRows: [],
      batchSupplierSelectRowKeys: [],
    });
  }

  /**
   * 供应商列表-保存
   */
  @Bind()
  @Debounce(500)
  saveSupplierLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      bidHall: { supplierLine = [] },
    } = this.props;

    const newParams = getEditTableData(supplierLine, ['bidLineSupplierId']);
    const { supplierLineSelectedRows = [] } = this.state;

    if (!isEmpty(newParams)) {
      dispatch({
        type: 'bidHall/saveSupplierLine',
        payload: {
          newParams,
          organizationId,
          bidHeaderId: params.bidId,
          customizeUnitCode: 'SSRC.BID_HALL_EDIT.SUPPLIER.TABLE',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchSupplier();
          this.setState({ editBidMembersFlag: false });
          if (!isEmpty(supplierLineSelectedRows)) {
            this.onSupplierLineRowChange([], []);
          }
        }
      });
    }
  }

  /**
   * 获取供应商列表数据
   *
   * @memberof Update
   */
  @Bind()
  deleteSupplierLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      bidHall: { supplierLine = [] },
    } = this.props;

    const { supplierLineSelectedRows = [] } = this.state;

    const remoteDelete = [];
    supplierLineSelectedRows.forEach((item) => {
      if (item._status === 'update') {
        remoteDelete.push(item);
      }
    });
    const localeDelete =
      supplierLineSelectedRows &&
      supplierLineSelectedRows.filter((item) => item._status === 'create');
    const sourceData = filter(supplierLine, (item) => {
      return (
        supplierLineSelectedRows &&
        supplierLineSelectedRows.map((r) => r.bidLineSupplierId).indexOf(item.bidLineSupplierId) < 0
      );
    });

    if (!isEmpty(localeDelete)) {
      dispatch({
        type: 'bidHall/updateState',
        payload: {
          supplierLine: sourceData,
        },
      });
      this.setState({
        supplierLineSelectedRows: [],
        supplierLineSelectedRowKeys: [],
      });
    }

    if (!isEmpty(remoteDelete)) {
      dispatch({
        type: 'bidHall/deleteSupplierLines',
        payload: { remoteDelete, organizationId, bidHeaderId: params.bidId },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'bidHall/updateState',
            payload: {
              supplierLineChange: false,
            },
          });
          notification.success();
          this.fetchSupplier();
          if (!isEmpty(supplierLineSelectedRows)) {
            this.setState({
              supplierLineSelectedRows: [],
              supplierLineSelectedRowKeys: [],
            });
          }
        }
      });
    }

    this.setState({
      supplierLineSelectedRows: [],
      supplierLineSelectedRowKeys: [],
    });
  }

  /**
   * 选中招标明细行数据
   *
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   * @memberof Update
   */
  @Bind()
  onItemLineRowChange(selectedRowKeys, selectedRows) {
    this.setState({
      itemLineSelectedRowKeys: selectedRowKeys,
      itemLineSelectedRows: selectedRows,
    });
  }

  /**
   * 多选供应商操作
   *
   * @memberof Update
   */
  onSupplierLineRowChange = (keys = [], rows = []) => {
    this.setState({
      supplierLineSelectedRowKeys: keys,
      supplierLineSelectedRows: rows,
    });
  };

  /**
   * 批量添加供应商选择
   *
   * @param {*} [keys=[]]
   * @param {*} [rows=[]]
   * @memberof Update
   */
  @Bind()
  onBatchSupplierRowChange(keys = [], rows = []) {
    this.setState({
      batchSupplierSelectRowKeys: keys,
      batchSupplierSelectRows: rows,
    });
  }

  /**
   * 多选招标小组
   *
   * @memberof Update
   */
  onBidMemberRowChange = (keys = [], rows = []) => {
    this.setState({
      bidMemberSelectedRowKeys: keys,
      bidMemberSelectedRows: rows,
    });
  };

  /**
   * 专家行选择
   *
   * @param {*} [keys=[]]
   * @param {*} [rows=[]]
   * @memberof Update
   */
  @Bind()
  onExpertRowChange(keys = [], rows = []) {
    this.setState({
      expertLineSelectedRowKeys: keys,
      expertLineSelectedRows: rows,
    });
  }

  /**
   * 整体保存时整理招标明细
   */
  getItemLineSaveDate(itemLine) {
    const bidItemLines = getEditTableData(itemLine, ['bidLineItemId']);
    return bidItemLines;
  }

  /**
   * 校验数据是否必填，统计错误数
   *
   * @param {*} [dataList=[]]
   * @returns
   * @memberof Update
   */
  getDataErrNums(dataList = []) {
    let errNums = 0;
    if (!dataList.length) {
      return errNums;
    }
    dataList.forEach((data) => {
      if (!data.length) {
        return;
      }

      const formData = getEditTableData(data);
      if (!formData.length && data) {
        ++errNums;
      }
    });

    return errNums;
  }

  /**
   * 获取需要保存和发布的data
   *
   * @param {*} values
   * @returns
   * @memberof Update
   */
  getBidAllData(values) {
    const {
      form,
      organizationId,
      bidHall: {
        header = {},
        supplierLine = [],
        itemLine = [],
        evaluateExpertList = [],
        scoringNoneTempelate = [],
        scoringBusinessTempelate = [],
        scoringTechnologyTempelate = [],
      },
    } = this.props;
    const { objectVersionNumber = undefined, subjectMatterRule } = this.state;
    const { bidHeaderId, tenantId, bidStatus, sourceType, priceCategory } = header;
    const {
      prequalEndDate = undefined,
      prequalLocation = '',
      reviewMethod,
      qualifiedLimit = '',
      fileFreeFlag = 0,
      prequalFileExpense,
      prequalRemark,
      enableScoreFlag,
      prequalAttachmentUuid = '',
      noticeNum = '',
      noticeStatus = '',
      noticeAttachmentUuid = '',
      remark = '',
      noticeId = null,
      noticeObjectVersionNumber = 0,
    } = form.getFieldsValue();

    // supplier
    const bidSuppliers = getEditTableData(supplierLine, ['bidLineSupplierId']);

    // bidLineItems
    const oldBidLineItems = this.getItemLineSaveDate(itemLine) || [];
    const bidLineItems = oldBidLineItems.map((item) => {
      return {
        ...item,
        demandDate: dateFormate(item.demandDate, DATETIME_MIN),
        subjectMatterRule: subjectMatterRule || header.subjectMatterRule,
      };
    });

    // const itemLineErrs = bidLineItems.filter(item => !item.bidQuantity);
    // if (itemLineErrs.length) {
    //   notification.warning({
    //     message: intl.get(`ssrc.bidHall.model.bidHall.zeroBidbidQuantity`).d('物品明细不能为０'),
    //   });

    //   return {
    //     errNums: itemLineErrs.length,
    //   };
    // }

    // prequal
    const prequalHeader = {
      rfxHeaderId: bidHeaderId,
      tenantId,
      prequalEndDate: dateFormate(prequalEndDate, DEFAULT_DATETIME_FORMAT),
      prequalLocation,
      reviewMethod,
      qualifiedLimit,
      fileFreeFlag,
      prequalFileExpense,
      prequalRemark,
      enableScoreFlag,
      prequalHeaderId: header.prequalHeaderId,
      prequalAttachmentUuid,
      prequalCategory: 'BID',
      objectVersionNumber: header.prequalObjectVersionNumber,
      prequalUserId: header.prequalUserId,
    };

    // 专家
    const evaluateExperts = !evaluateExpertList.length
      ? {}
      : {
          evaluateExpertList: getEditTableData(evaluateExpertList, ['evaluateExpertId']).map(
            (item) => ({
              ...item,
              evaluateLeaderFlag: +item.evaluateLeaderFlag,
            })
          ),
        };

    // 评分要素
    const evaluateIndics = [
      ...getEditTableData(scoringBusinessTempelate, ['evaluateIndicId']).map((item) => {
        return { ...item, areaFrom: 'NEW' };
      }),
      ...getEditTableData(scoringTechnologyTempelate, ['evaluateIndicId']).map((item) => {
        return { ...item, areaFrom: 'NEW' };
      }),
      ...getEditTableData(scoringNoneTempelate, ['evaluateIndicId']).map((item) => {
        return { ...item, areaFrom: 'NEW' };
      }),
    ];

    // 招标公告
    const sourceNotice = {
      noticeNum,
      noticeStatus,
      noticeAttachmentUuid,
      remark,
      noticeId,
      objectVersionNumber: noticeObjectVersionNumber,
    };

    // 提交错误统计 (新增功能)
    const errNums = this.getDataErrNums([
      itemLine,
      evaluateExpertList,
      scoringBusinessTempelate,
      scoringTechnologyTempelate,
      scoringNoneTempelate,
      supplierLine,
    ]);

    return {
      organizationId,
      bidHeader: {
        ...values,
        objectVersionNumber: objectVersionNumber || header.objectVersionNumber,
        quotationStartDate: dateFormate(values.quotationStartDate, DEFAULT_DATETIME_FORMAT),
        quotationEndDate: dateFormate(values.quotationEndDate, DEFAULT_DATETIME_FORMAT),
        bidOpenDate: dateFormate(values.bidOpenDate, DEFAULT_DATETIME_FORMAT),
        demandDate: dateFormate(values.demandDate, DEFAULT_DATETIME_FORMAT),
        clarifyEndTime: dateFormate(values.clarifyEndTime, DEFAULT_DATETIME_FORMAT),
        bidStatus,
        sourceType,
        priceCategory,
      },
      bidLineSuppliers: bidSuppliers || '',
      bidLineItems,
      prequalHeader,
      evaluateExperts,
      evaluateIndics,
      sourceNotice,
      errNums,
      hostName: location.origin,
    };
  }

  /**
   * 必填字段提示
   *
   * @param {*} [err={}]
   * @returns
   * @memberof Update
   */
  warningRequiredFields(err = {}) {
    const ErrKeys = Object.keys(err);
    if (!ErrKeys.length) {
      return;
    }

    const msgs = [];
    ErrKeys.forEach((key) => {
      const errMsg = err[key].errors[0].message; // 现在只拿错误的第一条消息提醒用户
      if (!errMsg) {
        return;
      }
      msgs.push(errMsg);
    });

    notification.warning({
      message: (
        <>
          {msgs.map((item) => {
            return <div>{item}</div>;
          })}
        </>
      ),
    });
  }

  /**
   * 招标维护全保存
   *
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  handleSaveBidHall() {
    const {
      dispatch,
      form,
      bidHall: { header },
    } = this.props;
    const { matterRequireFlag } = this.state;

    form.validateFieldsAndScroll((err, values) => {
      if (isEmpty(err)) {
        const { errNums = 0, ...others } = this.getBidAllData(values);

        if (errNums) {
          notification.warning({
            message: intl
              .get(`ssrc.bidHall.model.bidHall.theFieldsNotComplete`)
              .d('字段没有全部填写!'),
          });
          return;
        }

        // 二次处理bidBond
        const { bidHeader = {} } = others;
        dispatch({
          type: 'bidHall/savebidHallUpdate',
          payload: {
            ...others,
            bidHeader: {
              ...bidHeader,
              matterDetail: this.MatterDetail
                ? this.MatterDetail.state.changeFlag
                  ? this.MatterDetail.richTextEditor.getContent()
                  : header.matterDetail
                : header.matterDetail,
              matterRequireFlag,
              bidBond:
                bidHeader.bidBond === intl.get('ssrc.bidHall.model.bidHall.free').d('免费')
                  ? 0
                  : bidHeader.bidBond,
              bidFileExpense:
                bidHeader.bidFileExpense === intl.get('ssrc.bidHall.model.bidHall.free').d('免费')
                  ? 0
                  : bidHeader.bidFileExpense,
            },
            customizeUnitCode:
              matterRequireFlag === 'PACK'
                ? 'SSRC.BID_HALL_EDIT.EDIT_LINE,SSRC.BID_HALL_EDIT.EDIT_HEADER,SSRC.BID_HALL_EDIT.OTHER.INFO,SSRC.BID_HALL_EDIT.EXPERT_SCORE,SSRC.BID_HALL_EDIT.SCORE_INDICS,SSRC.BID_HALL_EDIT.SCORE_INDICS_TECHNOLOGY,SSRC.BID_HALL_EDIT.EDIT_QUALIFICATION,SSRC.BID_HALL_EDIT.SUPPLIER.TABLE'
                : 'SSRC.BID_HALL_EDIT.EDIT_LINE_NONE,SSRC.BID_HALL_EDIT.EDIT_HEADER,SSRC.BID_HALL_EDIT.OTHER.INFO,SSRC.BID_HALL_EDIT.EXPERT_SCORE,SSRC.BID_HALL_EDIT.SCORE_INDICS,SSRC.BID_HALL_EDIT.SCORE_INDICS_TECHNOLOGY,SSRC.BID_HALL_EDIT.EDIT_QUALIFICATION,SSRC.BID_HALL_EDIT.SUPPLIER.TABLE',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.refreshCache();
          }
        });
      } else {
        this.warningRequiredFields(err);
      }
    });
  }

  /**
   * 发布招标
   *
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  handleReleaseBidHall() {
    const {
      dispatch,
      form,
      bidHall: { header },
    } = this.props;
    const { matterRequireFlag } = this.state;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        const { errNums = 0, ...others } = this.getBidAllData(values);

        if (errNums) {
          notification.warning({
            message: intl
              .get(`ssrc.bidHall.model.bidHall.theFieldsNotComplete`)
              .d('字段没有全部填写!'),
          });
          return;
        }
        // 二次处理bidBond
        const { bidHeader = {} } = others;
        dispatch({
          type: 'bidHall/releasebidHall',
          payload: {
            ...others,
            bidHeader: {
              ...bidHeader,
              matterDetail: this.MatterDetail
                ? this.MatterDetail.state.changeFlag
                  ? this.MatterDetail.richTextEditor.getContent()
                  : header.matterDetail
                : header.matterDetail,
              matterRequireFlag,
              bidBond:
                bidHeader.bidBond === intl.get('ssrc.bidHall.model.bidHall.free').d('免费')
                  ? 0
                  : bidHeader.bidBond,
              bidFileExpense:
                bidHeader.bidFileExpense === intl.get('ssrc.bidHall.model.bidHall.free').d('免费')
                  ? 0
                  : bidHeader.bidFileExpense,
            },
            customizeUnitCode:
              matterRequireFlag === 'PACK'
                ? 'SSRC.BID_HALL_EDIT.EDIT_LINE,SSRC.BID_HALL_EDIT.EDIT_HEADER,SSRC.BID_HALL_EDIT.OTHER.INFO,SSRC.BID_HALL_EDIT.EXPERT_SCORE,SSRC.BID_HALL_EDIT.SCORE_INDICS,SSRC.BID_HALL_EDIT.SCORE_INDICS_TECHNOLOGY,SSRC.BID_HALL_EDIT.EDIT_QUALIFICATION,SSRC.BID_HALL_EDIT.SUPPLIER.TABLE'
                : 'SSRC.BID_HALL_EDIT.EDIT_LINE_NONE,SSRC.BID_HALL_EDIT.EDIT_HEADER,SSRC.BID_HALL_EDIT.OTHER.INFO,SSRC.BID_HALL_EDIT.EXPERT_SCORE,SSRC.BID_HALL_EDIT.SCORE_INDICS,SSRC.BID_HALL_EDIT.SCORE_INDICS_TECHNOLOGY,SSRC.BID_HALL_EDIT.EDIT_QUALIFICATION,SSRC.BID_HALL_EDIT.SUPPLIER.TABLE',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/ssrc/bid-hall/list`,
              })
            );
          }
        });
      } else {
        notification.warning({
          message: intl
            .get(`ssrc.bidHall.model.bidHall.theFieldsNotComplete`)
            .d('字段没有全部填写!'),
        });
      }
    });
  }

  /**
   * 招标小组 改变用户名
   *
   * @param {*} val
   * @param {*} dataList
   * @param {*} record
   * @returns
   * @memberof Update
   */
  @Bind()
  changeLoginName(val, dataList, record) {
    if (!val) {
      return;
    }

    const {
      email,
      id,
      phone,
      loginName,
      realName,
      internationalTelCode,
      internationalTelCodeMeaning,
    } = dataList;

    record.$form.setFieldsValue({
      email,
      userId: id,
      phone,
      loginName,
      userName: realName,
      internationalTelCode,
      internationalTelCodeMeaning,
    });
  }

  refreshCache() {
    this.fetchbidHallUpdate();
    this.fetchItemLine();
  }

  /**
   * 创建专家评分
   *
   * @param {string} [type='']
   * @memberof Update
   */
  @Bind()
  onCreateLine() {
    // add: 为了批量创建子账户, 在新建前增加子账户弹窗, 可多选
    this.setState({
      expertModalVisible: true,
    });
  }

  /**
   * 保存专家评分
   *
   * @param {*} type
   * @returns
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  onSaveExpert(type) {
    const {
      organizationId,
      dispatch,
      bidHall: { header, evaluateExpertList = [] },
    } = this.props;

    this.setState({
      expertSaveType: type,
    });

    const tempEvaluateExpertList = getEditTableData(evaluateExpertList, ['evaluateExpertId']).map(
      (item) => ({
        ...item,
        evaluateLeaderFlag: +item.evaluateLeaderFlag,
      })
    );

    dispatch({
      type: 'bidHall/saveScoringNoneExpert',
      payload: {
        organizationId,
        evaluateExperts: {
          evaluateExpertList: tempEvaluateExpertList,
          sourceTemplateId: header.templateId,
        },
        customizeUnitCode: 'SSRC.BID_HALL_EDIT.EXPERT_SCORE',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchExpert();
        this.setState({ expertLineSelectedRows: [] });
      }
    });
  }

  /**
   * 评分要素-删除 筛选本地且不删除的数据
   *
   * @param {*} data
   * @returns
   * @memberof Update
   */
  filterExpertsUnSelectedOldData(data) {
    const { expertLineSelectedRows } = this.state;
    const sourceData = filter(data, (item) => {
      return (
        expertLineSelectedRows &&
        expertLineSelectedRows.map((id) => id.evaluateExpertId).indexOf(item.evaluateExpertId) < 0
      );
    });

    return sourceData;
  }

  /**
   * 批量删除专家评分
   *
   * @param {*} types
   * @returns
   * @memberof Update
   */
  @Bind()
  onDeleteExpert() {
    const {
      organizationId,
      dispatch,
      bidHall: { evaluateExpertList = [] },
    } = this.props;

    const { expertLineSelectedRows } = this.state;
    if (isEmpty(expertLineSelectedRows)) {
      return;
    }

    const sourceData = this.filterExpertsUnSelectedOldData(evaluateExpertList);

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        expertLineSelectedRows.forEach((item) => {
          if (item._status === 'update') {
            remoteDelete.push(item.evaluateExpertId);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'bidHall/updateState',
            payload: {
              evaluateExpertList: sourceData,
            },
          });
          this.setState({ expertLineSelectedRows: [], expertLineSelectedRowKeys: [] });
        } else {
          dispatch({
            type: 'bidHall/deleteScoringNoneExpert',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchExpert();
              this.setState({ expertLineSelectedRows: [], expertLineSelectedRowKeys: [] });
            }
          });
        }
      },
      onCancel: () => {
        this.setState({ expertLineSelectedRows: [], expertLineSelectedRowKeys: [] });
      },
    });
  }

  /**
   * EditTable  选择评分要素
   *
   * @param {*} keys
   * @param {*} rows
   * @memberof Update
   */
  @Bind()
  onScoringLineChange(keys, rows, type = 'ALL') {
    const { selectedInfo } = this.state;
    this.setState({
      scoringElementSelectedRowKeys: keys,
      scoringElementSelectedRows: rows,
    });
    if (['TECHNOLOGY', 'BUSINESS', 'ALL'].includes(type)) {
      this.setState({
        selectedInfo: {
          ...selectedInfo,
          [`selected${type}`]: rows,
        },
      });
    }
  }

  @Bind()
  handleRef(ref) {
    // 绑定Ref
    this.scoringElementsTableRef = ref;
  }

  /**
   * 增加评分要素数据段
   *
   * @param {*} type
   * @memberof Update
   */
  @Bind()
  onCreateScoringElements(type, { technologyWeight = null, businessWeight = null }) {
    const {
      organizationId,
      dispatch,
      bidHall: {
        header,
        scoringNoneTempelate,
        scoringBusinessTempelate,
        scoringTechnologyTempelate,
      },
    } = this.props;

    const newPayload = [
      {
        evaluateIndicId: uuidv4(),
        tenantId: header.tenantId,
        indicateId: '',
        indicateCode: '',
        indicateName: '',
        indicateType: 'SCORE', // 默认值为打分制
        indicateRemark: '',
        weight: header.templateScoreType === 'SCORE' ? 100 : '',
        minScore: header.templateScoreType === 'WEIGHT' ? 0 : '',
        maxScore: header.templateScoreType === 'WEIGHT' ? 100 : '',
        sourceFrom: 'BID',
        openBidOrder: header.openBidOrder || 'BUSINESS_FIRST',
        organizationId,
        expertCategory: type,
        sourceHeaderId: header.bidHeaderId,
        indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
        _status: 'create',
        calculateType: '', // 计算方式
        scoreType: '', // 评分类型
        evaluateIndicDetail: null, // 评分细则
        businessWeight: type === 'BUSINESS' ? businessWeight : null,
        technologyWeight: type === 'TECHNOLOGY' ? technologyWeight : null,
      },
    ];

    switch (type) {
      case 'BUSINESS':
        dispatch({
          type: 'bidHall/updateState',
          payload: {
            scoringBusinessTempelate: [...newPayload, ...scoringBusinessTempelate],
          },
        });
        break;

      case 'TECHNOLOGY':
        dispatch({
          type: 'bidHall/updateState',
          payload: {
            scoringTechnologyTempelate: [...newPayload, ...scoringTechnologyTempelate],
          },
        });
        break;

      default:
        dispatch({
          type: 'bidHall/updateState',
          payload: {
            scoringNoneTempelate: [...newPayload, ...scoringNoneTempelate],
          },
        });
        break;
    }
  }

  /**
   * 保存评分要素
   *
   * @param {string} [type='']
   * @returns
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  onSaveScoringElements(type = '') {
    const {
      organizationId,
      dispatch,
      bidHall: {
        header,
        scoringNoneTempelate,
        scoringBusinessTempelate,
        scoringTechnologyTempelate,
      },
    } = this.props;

    this.setState({
      scoringSaveType: type,
    });

    let newParams = [];
    switch (type) {
      case 'BUSINESS':
        newParams = getEditTableData(scoringBusinessTempelate, ['evaluateIndicId']);
        break;
      case 'TECHNOLOGY':
        newParams = getEditTableData(scoringTechnologyTempelate, ['evaluateIndicId']);
        break;
      default:
        newParams = getEditTableData(scoringNoneTempelate, ['evaluateIndicId']);
        break;
    }

    if (!newParams.length) {
      return;
    }

    const elementArray = newParams.map((item) => {
      return { ...item, templateId: header.templateId };
    });

    dispatch({
      type: 'bidHall/saveScoringNoneTempelate',
      payload: {
        organizationId,
        elementArray,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchScoring();
      }
    });
  }

  /**
   * 评分要素参考模板
   *
   * @param {*} values
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  onSelectTemplateOk(values) {
    const {
      organizationId,
      dispatch,
      bidHall: { header },
    } = this.props;

    const commonFields = {
      tenantId: header.tenantId,
      sourceFrom: 'BID',
      sourceHeaderId: header.bidHeaderId,
      openBidOrder: header.openBidOrder || 'SYNC',
    };

    const newParams = values.scoreIndics.map((item) => {
      return { ...item, ...commonFields };
    });

    dispatch({
      type: 'bidHall/saveScoringNoneTempelate',
      payload: {
        organizationId,
        newParams,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchScoring();
      }
    });
  }

  /**
   * 保存评分模板
   *
   * @param {*} record
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  saveAllScoringTemplate(record) {
    const {
      organizationId,
      dispatch,
      bidHall: { header },
    } = this.props;

    dispatch({
      type: 'bidHall/saveAllScoringTemplate',
      payload: {
        organizationId,
        sourceHeaderId: header.bidHeaderId,
        sourceFrom: 'BID',
        templateId: record.templateId,
        indicStatus: 'SUBMITTED',
        templatePurpose: record.templatePurpose,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchScoring();
      }
    });
  }

  /**
   * 评分要素-专家分配 保存
   *
   * @memberof Update
   */
  @Bind()
  @Debounce(500)
  saveScoringAssignExpert() {
    const {
      organizationId,
      dispatch,
      bidHall: { currentScoringExperts = [] },
    } = this.props;

    const newParams = getEditTableData(currentScoringExperts, 'evaluateExpertId');

    if (isEmpty(newParams)) {
      this.cancelAssignExpert();
    } else {
      dispatch({
        type: 'bidHall/saveEvaluateIndicAssign',
        payload: {
          organizationId,
          newParams,
        },
      }).then((res) => {
        if (res) {
          notification.success();
        }
      });
    }
    this.cancelAssignExpert();
  }

  /**
   * 评分要素-专家分配 打开modal
   *
   * @param {*} record
   * @memberof Update
   */
  @Bind()
  openAssignExpertModal(record) {
    const { organizationId, dispatch } = this.props;

    this.setState({
      evaluateAssignModalVisible: true,
    });

    dispatch({
      type: 'bidHall/fetchEvaluateIndicAssign',
      payload: {
        organizationId,
        evaluateIndicId: record.evaluateIndicId || '',
        evaluateIndicCategory: record.team || '',
      },
    });
  }

  /**
   * 评分要素-专家分配 关闭modal
   *
   * @memberof Update
   */
  @Bind()
  cancelAssignExpert() {
    const { dispatch } = this.props;

    this.setState({
      evaluateAssignModalVisible: false,
    });

    dispatch({
      type: 'bidHall/updateState',
      payload: {
        currentScoringExperts: [],
      },
    });
  }

  /**
   * 评分要素-删除 筛选本地且不删除的数据
   *
   * @param {*} data
   * @returns 筛选后的数据
   * @memberof Update
   */
  filterScorinUnSelectedOldData(data) {
    const { scoringElementSelectedRows } = this.state;
    const sourceData = filter(data, (item) => {
      return (
        scoringElementSelectedRows &&
        scoringElementSelectedRows.map((id) => id.evaluateIndicId).indexOf(item.evaluateIndicId) < 0
      );
    });

    return sourceData;
  }

  /**
   * 删除评分要素
   *
   * @param {*} types
   * @returns
   * @memberof Update
   */
  @Bind()
  onDeleteScoringElements(types) {
    const { scoringElementSelectedRows } = this.state;
    if (isEmpty(scoringElementSelectedRows)) {
      return;
    }

    const {
      organizationId,
      dispatch,
      bidHall: { scoringNoneTempelate, scoringBusinessTempelate, scoringTechnologyTempelate },
    } = this.props;
    let sourceData = [];

    switch (types) {
      case 'BUSINESS':
        sourceData = this.filterScorinUnSelectedOldData(scoringBusinessTempelate);
        break;
      case 'TECHNOLOGY':
        sourceData = this.filterScorinUnSelectedOldData(scoringTechnologyTempelate);
        break;
      default:
        sourceData = this.filterScorinUnSelectedOldData(scoringNoneTempelate);
        break;
    }

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        scoringElementSelectedRows.forEach((item) => {
          if (item._status === 'update') {
            remoteDelete.push(item.evaluateIndicId);
          }
        });

        if (isEmpty(remoteDelete)) {
          switch (types) {
            case 'BUSINESS':
              dispatch({
                type: 'bidHall/updateState',
                payload: {
                  scoringBusinessTempelate: sourceData,
                },
              });
              break;
            case 'TECHNOLOGY':
              dispatch({
                type: 'bidHall/updateState',
                payload: {
                  scoringTechnologyTempelate: sourceData,
                },
              });
              break;
            default:
              dispatch({
                type: 'bidHall/updateState',
                payload: {
                  scoringNoneTempelate: sourceData,
                },
              });
              break;
          }
          this.setState({ scoringElementSelectedRows: [], scoringElementSelectedRowKeys: [] });
        } else {
          dispatch({
            type: 'bidHall/deleteScoringNoneTempelate',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              notification.success();
              this.fetchScoring();
              this.setState({ scoringElementSelectedRows: [], scoringElementSelectedRowKeys: [] });
            }
          });
        }
      },
      onCancel: () => {
        this.setState({ scoringElementSelectedRows: [], scoringElementSelectedRowKeys: [] });
      },
    });
  }

  /**
   * 批量导入评分要素
   * @param {*} types
   * @returns
   * @memberof import
   */
  @Bind()
  onImportScoringElements(params) {
    const {
      bidHall: { header = {} },
    } = this.props;
    const { organizationId: tenantId = null } = this.props;
    const { bidHeaderId, templateId } = header || {};

    openTab({
      key: '/ssrc/inquiry-hall/rfx-update/comment-import/SSRC.RFX_EVALUATE_INDIC',
      search: querystring.stringify({
        key: '/ssrc/inquiry-hall/rfx-update/comment-import/SSRC.RFX_EVALUATE_INDIC',
        title: 'hzero.common.title.batchImport',
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
        backPath: `/ssrc/bid-hall/bid-update/${bidHeaderId}`,
        args: JSON.stringify({
          sourceHeaderId: bidHeaderId,
          tenantId,
          templateId,
          expertCategory: params,
          teamWeight: params === 'BUSINESS' || params === 'TECHNOLOGY' ? 50 : 100,
          sourceFrom: 'BID',
        }),
      }),
    });
  }

  form;

  /**
   * 设置Form
   * @param {object} ref - BulkAddSupplier组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 招标公告预览
   */
  @Bind()
  handleNoticePreview() {
    const {
      match: { params },
      bidHall: { header = {} },
    } = this.props;
    openTab({
      key: `/ssrc/bid-hall/bid-notice?sourceHeaderId=${params.bidId}&expertScoreType=${header.expertScoreType}&preQualificationFlag=${header.preQualificationFlag}`,
      path: `/ssrc/bid-hall/bid-notice?sourceHeaderId=${params.bidId}&expertScoreType=${header.expertScoreType}&preQualificationFlag=${header.preQualificationFlag}`,
      // title: intl.get(`ssrc.bidHall.view.message.tab.tenderNotice`).d('招标公告'),
      title: 'srm.common.tab.title.ssrc.tenderNotice',
      closable: true,
    });
  }

  /**
   * 店家物品行报价明细
   *
   * @param {*} [record={}]
   * @memberof Update
   */
  // @Bind()
  // handleQuotationDetail(record = {}, isShowModal = true) {
  //   if (!record || !record.$form) {
  //     this.clearCurrentRowQuotationData();
  //     return;
  //   }
  //   const itemId = record.$form.getFieldValue('itemId') || undefined;
  //   const itemCategoryId = record.$form.getFieldValue('itemCategoryId') || undefined;
  //   const currentRfxLineItemId =
  //     record.bidLineItemId || record.$form.getFieldValue('bidLineItemId') || undefined;
  //
  //   if (!itemId && !itemCategoryId) {
  //     this.settingQuotationDetailStore();
  //     this.updateItemLineQuotationData(currentRfxLineItemId, []);
  //     return;
  //   }
  //
  //   this.setState({
  //     itemLineEditoringId: currentRfxLineItemId,
  //   });
  //
  //   this.fetchItemLineQuotationDetail({
  //     rfxLineItemId: currentRfxLineItemId,
  //     itemId: itemId || null,
  //     itemCategoryId: itemCategoryId || null,
  //     isShowModal,
  //   });
  //
  //   if (isShowModal) {
  //     this.setState({
  //       itemLineQuotationDetailModalVisible: true,
  //     });
  //   }
  // }

  /**
   * 设置报价明细store
   *
   * @memberof Update
   */
  settingQuotationDetailStore(data = []) {
    const { dispatch } = this.props;

    dispatch({
      type: 'bidHall/updateState',
      payload: {
        itemLineQuotationDetail: data,
      },
    });
  }

  /**
   * 清除物品行的报价详情数据
   *
   * @memberof Update
   */
  clearCurrentRowQuotationData() {
    const {
      bidHall: { itemLineQuotationDetail = [] },
    } = this.props;
    this.settingQuotationDetailStore(itemLineQuotationDetail);

    this.setState({
      itemLineEditoringId: undefined,
    });
  }

  /**
   * 报价明细model确认
   *
   * @memberof Update
   */
  // @Bind()
  // sureItemLineQutationDetail(activeTabId, bidLineItemId) {
  //   const { itemLineEditoringId } = this.state;
  //
  //   this.setState({
  //     itemLineQuotationDetailModalVisible: false,
  //   });
  //   const {
  //     dispatch,
  //     bidHall: { itemLine = [] },
  //   } = this.props;
  //
  //   const sectionFlag = itemLine.length > 0 ? itemLine[0].sectionFlag : 0;
  //   if (sectionFlag) {
  //     const filterLine = itemLine.filter(item => item.bidLineItemId === Number(activeTabId));
  //
  //     const recordLine = filterLine.filter(item => {
  //       if (item.children && item.children.length) {
  //         return item.children.map(child => child.bidLineItemId === bidLineItemId);
  //       }
  //       return item;
  //     });
  //     const childLine =
  //       recordLine.length > 0 &&
  //       recordLine.map(item => {
  //         const childObj =
  //           item.children &&
  //           item.children.map(items => {
  //             return {
  //               ...items,
  //               quotationDetails: getEditTableData(item.quotationDetails),
  //             };
  //           });
  //         return {
  //           ...item,
  //           children: childObj,
  //         };
  //       });
  //
  //     let newItemLine = [];
  //     if (childLine) {
  //       for (let i = 0; i < itemLine.length; i++) {
  //         if (itemLine[i].bidLineItemId === Number(activeTabId)) {
  //           newItemLine = [...newItemLine, ...childLine];
  //         } else {
  //           newItemLine.push(itemLine[i]);
  //         }
  //       }
  //     }
  //     dispatch({
  //       type: 'bidHall/updateState',
  //       payload: {
  //         itemLine: newItemLine,
  //       },
  //     });
  //     notification.success();
  //   } else {
  //     const newItemLine = itemLine.map(item => {
  //       if (item.bidLineItemId === itemLineEditoringId) {
  //         return {
  //           ...item,
  //           quotationDetails: getEditTableData(item.quotationDetails),
  //         };
  //       }
  //       return item;
  //     });
  //     dispatch({
  //       type: 'bidHall/updateState',
  //       payload: {
  //         itemLine: newItemLine,
  //       },
  //     });
  //     notification.success();
  //   }
  // }

  /**
   * 报价明细model取消
   *
   * @memberof Update
   */
  // @Bind()
  // cancelItemLineQutationDetail() {
  //   this.setState({
  //     itemLineQuotationDetailModalVisible: false,
  //     itemLineEditoringId: undefined,
  //   });
  //
  //   this.clearCurrentRowQuotationData();
  // }

  /**
   * 物品行查询招标明细数据
   *
   * @param {*} [page={}]
   * @memberof Update
   */
  fetchItemLineQuotationDetail(record = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      bidHall: { itemLine = [] },
    } = this.props;

    const curRfxLineItemId = record.rfxLineItemId;
    const CurrentItemLine = itemLine.filter((item) => item.bidLineItemId === curRfxLineItemId);
    if (record.isShowModal && CurrentItemLine.length === 1 && CurrentItemLine[0].quotationDetails) {
      this.updateItemLineQuotationData(curRfxLineItemId, CurrentItemLine[0].quotationDetails);
      return;
    }

    const sourceFrom = params.rfxId ? 'RFX' : 'BID';
    dispatch({
      type: 'bidHall/fetchItemLineQuotationDetail',
      payload: {
        rfxLineItemId: typeof curRfxLineItemId === 'string' ? undefined : curRfxLineItemId,
        itemId: record.itemId || null,
        itemCategoryId: record.itemCategoryId || null,
        organizationId,
        rfxHeaderId: params.bidId,
        sourceFrom,
      },
    }).then((res) => {
      let result = res;
      if (!res || !Array.isArray(res) || !res.length) {
        result = [];
      }

      this.updateItemLineQuotationData(curRfxLineItemId, result);
    });
  }

  /**
   * 改变行信息 - 物品行查询招标明细数据
   *
   * @returns
   * @memberof Update
   */
  updateItemLineQuotationData(currentRfxLineItemId = '', res = []) {
    const {
      dispatch,
      bidHall: { itemLine = [] },
    } = this.props;
    const { sectionFlag } = itemLine[0];
    let filterLine;
    if (sectionFlag) {
      filterLine = itemLine.filter((item) => {
        if (item.children && item.children.length) {
          return item.children.some((child) => child.bidLineItemId === currentRfxLineItemId);
        }
        return null;
      });
      const ItemLineObj = filterLine.map((item) => {
        const childObj =
          item.children &&
          item.children.map((child) => {
            if (child.bidLineItemId === currentRfxLineItemId) {
              return {
                ...child,
                quotationDetails: res,
              };
            }
            return child;
          });
        return {
          ...item,
          children: childObj,
        };
      });

      let currentItemLineObj = [];
      if (ItemLineObj) {
        for (let i = 0; i < itemLine.length; i++) {
          if (
            itemLine &&
            itemLine.length &&
            itemLine[i].children &&
            itemLine[i].children.length &&
            itemLine[i].children.some((child) => child.bidLineItemId === currentRfxLineItemId)
          ) {
            currentItemLineObj = [...currentItemLineObj, ...ItemLineObj];
          } else {
            currentItemLineObj.push(itemLine[i]);
          }
        }
      }

      dispatch({
        type: 'bidHall/updateState',
        payload: {
          itemLine: currentItemLineObj,
        },
      });
    } else {
      const CurrentItemLineObj = itemLine.map((item) => {
        if (item.bidLineItemId === currentRfxLineItemId) {
          return {
            ...item,
            quotationDetailFlag: res.length ? 1 : 0,
            quotationDetails: res,
          };
        }
        return item;
      });
      dispatch({
        type: 'bidHall/updateState',
        payload: {
          itemLine: CurrentItemLineObj,
        },
      });
    }
  }

  /**
   * 专家子账户弹窗-确定
   * @param {Array} selectRowKeys - 返回的勾选行keys
   * @param {Array} selectRows - 返回的勾选行
   */
  @Bind()
  handleOkSubAccountModal(_, selectRows = []) {
    const {
      organizationId,
      dispatch,
      bidHall: { evaluateExpertList = [], header = {} },
    } = this.props;
    const { expertSource = '' } = this.state;
    const tempArr = []; // 新建行
    // 循环勾选的子账户列表
    selectRows.forEach((item) => {
      let newPayload = [];
      if (expertSource === 'EXPERT_LIBRARY') {
        const {
          expertName,
          expertId,
          objectVersionNumber,
          loginName,
          expertCategory,
          expertTypeMeaning,
          mobilephone,
          telephone,
          email,
          userId,
        } = item;
        if (header.bidRuleType === 'NONE') {
          newPayload = {
            userName: undefined,
            expertName,
            expertId,
            objectVersionNumber,
            loginName,
            expertCategory,
            expertTypeMeaning,
            email,
            phone: mobilephone || telephone,
            expertUserId: userId,
            tenantId: header.tenantId,
            evaluateExpertId: uuidv4(),
            sourceFrom: 'BID',
            leaderFlag: 0,
            evaluateLeaderFlag: '0', // 职责
            openBidOrder: header.openBidOrder,
            organizationId,
            sourceHeaderId: header.bidHeaderId,
            expertStatus: 'SUBMITTED',
            team: '',
            _status: 'create',
          };
        } else {
          newPayload = {
            userName: undefined,
            expertName,
            expertId,
            objectVersionNumber,
            loginName,
            expertCategory,
            expertTypeMeaning,
            email,
            phone: mobilephone || telephone,
            expertUserId: userId,
            tenantId: header.tenantId,
            evaluateExpertId: uuidv4(),
            sourceFrom: 'BID',
            leaderFlag: 0, // 待定 - 询价单没赋值
            evaluateLeaderFlag: '0', // 职责
            openBidOrder: header.openBidOrder,
            organizationId,
            sourceHeaderId: header.bidHeaderId,
            expertStatus: 'SUBMITTED',
            team: expertCategory,
            _status: 'create',
          };
        }
      } else {
        const { objectVersionNumber, loginName, email, id, realName, phone } = item;
        newPayload = {
          userName: undefined,
          expertName: realName,
          objectVersionNumber,
          loginName,
          expertCategory: 'BUSINESS_TECHNOLOGY',
          expertTypeMeaning: intl.get(`ssrc.bidHall.model.bidHall.internalExpert`).d('内部专家'),
          email,
          phone,
          expertUserId: id,
          tenantId: header.tenantId,
          evaluateExpertId: uuidv4(),
          sourceFrom: 'BID',
          leaderFlag: 0, // 待定 - 询价单没赋值
          evaluateLeaderFlag: '0', // 职责
          openBidOrder: header.openBidOrder,
          organizationId,
          sourceHeaderId: header.bidHeaderId,
          expertStatus: 'SUBMITTED',
          team: 'BUSINESS_TECHNOLOGY',
          _status: 'create',
        };
      }
      tempArr.push(newPayload);
    });
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        evaluateExpertList: [...tempArr, ...evaluateExpertList],
      },
    });
    this.setState({
      expertModalVisible: false,
    });
  }

  /**
   * 专家子账户弹窗-取消
   */
  @Bind()
  handleCancelSubAccountModal() {
    this.setState({
      expertModalVisible: false,
    });
  }

  /**
   * 查询寻源模板配置信息 - 基于寻源模板id查询
   * @param {string} templateId - 模板ID
   */
  queryRfxTemplateDetail(templateId) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'bidHall/fetchQueryRfxTemplateDetail',
      payload: {
        templateId,
        tenantId: organizationId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          rfxTemplateDetail: {
            ...res,
          },
        });
      }
    });
  }

  render() {
    const {
      dispatch,
      match,
      form,
      remote,
      customizeForm,
      organizationId,
      userId,
      allLoading,
      fetchItemLineLoading,
      saveItemLineLoading,
      fetchSupplierLineloading,
      fetchBulkSupplierDataLoading,
      saveScoringNoneExpertLoading,
      fetchTempelateDetailDataLoading,
      saveScoringNoneTempelateLoading,
      fetchEvaluateIndicAssignLoading,
      fetchScoringElementLoading,
      saveScoringElementLoading,
      saveBidMembersLoading,
      supplierRecordLoading,
      cancelbidHallUpdateLoading,
      customizeTable,
      bidHall,
      bidHall: {
        settings = [],
        header = {},
        itemLine = [],
        itemLineExpandedKeys = [],
        supplierLine = [],
        supplierLinePagination = {},
        bidMembersList = [],
        supplierData = [],
        code = {},
        code: {
          bidRoles = [],
          indicateType = [],
          subjectMatterRules = [],
          sourceMethods = [],
          quotationTypes = [],
          sourceStages = [],
          reviewMethods = [],
          indicateTypes = [],
          bidType = [],
          expertDuty = [],
          expertTeam = [],
          calculateTypes = [],
          scoreTypes = [],
          idd = [],
        },
        bulkSupplierList = [],
        bulkSupplierListPagination = {},
        evaluateExpertList = [],
        scoringNoneTempelate = [],
        scoringBusinessTempelate = [],
        scoringTechnologyTempelate = [],
        currentScoringExperts = [],
        scoringElement = [],
      },
      customizeBtnGroup,
    } = this.props;

    const {
      bidMemberSelectedRows = [],
      bidMemberSelectedRowKeys = [],
      distributeModalVisible,
      subjectMatterRule,
      sourceMethod,
      itemLineSelectedRows = [],
      itemLineSelectedRowKeys = [],
      supplierLineSelectedRows = [],
      supplierLineSelectedRowKeys = [],
      batchSupplierSelectRowKeys = [],
      batchSupplierSelectRows = [],
      editBidMembersFlag,
      batchOperateSupplierModelVisible,
      expertLineSelectedRows,
      expertLineSelectedRowKeys,
      scoringElementSelectedRows,
      scoringElementSelectedRowKeys,
      evaluateAssignModalVisible,
      scoringElementVisible,
      scoringSaveType,
      expertSaveType,
      collapseKeys,
      fetchbidHallUpdateLoading,
      localSubjectMatterRule,
      itemLineEditoringId = '',
      matterDetail = '',
      matterRequireFlag = 0,
      expertModalVisible = false,
      expertSource = '',
      allowAddItems,
      allowAddSuppliers,
      allOpenSelectable,
      selectedInfo,
    } = this.state;

    // 基本信息props
    const infoProps = {
      header,
      organizationId,
      form,
      customizeForm,
      subjectMatterRules,
      sourceMethods,
      quotationTypes,
      sourceStages,
      bidType,
      allOpenSelectable,
      changeTemplateId: this.changeTemplateOnOk,
      changeSourceMethod: this.changeSourceMethod,
      changeCompany: this.changeCompanyOnOk,
      changeSubjectMatterRule: this.changeSubjectMatterRule,
      editBidMembers: this.editBidMembers,
    };

    // other props
    const otherProps = {
      idd,
      header,
      organizationId,
      form,
      customizeForm,
      changeBidSourcePlan: this.changeBidSourcePlan,
      changeProjectInfo: this.changeProjectInfo,
      setValue: this.setValue,
      changePaymentType: this.changePaymentType,
    };

    // qualification props
    const qualificationProps = {
      header,
      organizationId,
      form,
      reviewMethods,
      match,
      changeReviewMethod: this.changeReviewMethod,
      changeScoreFlag: this.changeReviewMethod,
      showScoringElement: this.showScoringElement,
      customizeForm,
    };

    const itemLineRowSelection = {
      selectedRowKeys: itemLineSelectedRowKeys,
      selectedRows: itemLineSelectedRows,
      onChange: this.onItemLineRowChange,
    };

    const expertLineRowSelection = {
      expertLineSelectedRows,
      expertLineSelectedRowKeys,
      onChange: this.onExpertRowChange,
    };

    // 物品明细
    const companyId = form.getFieldValue('companyId') || header.companyId || null;
    const ItemLineTableProps = {
      settings,
      header,
      companyId,
      sourceMethod,
      match,
      form,
      dispatch,
      organizationId,
      itemLineEditoringId,
      customizeTable,
      allowAddItems,
      sureItemLineQutationDetail: this.sureItemLineQutationDetail,
      cancelItemLineQutationDetail: this.cancelItemLineQutationDetail,
      fetchItemLineQuotationDetailLoading: this.cancelItemLineQutationDetail,
      // handleQuotationDetail: this.handleQuotationDetail,
      subjectMatterRule: subjectMatterRule || header.subjectMatterRule,
      localSubjectMatterRule,
      itemLineRowSelection,
      itemLineSelectedRows,
      itemLineSelectedRowKeys,
      itemLineExpandedKeys,
      handleExpandRow: this.handleExpandRow,
      loading: fetchItemLineLoading,
      saveLoading: saveItemLineLoading || fetchItemLineLoading,
      dataSource: itemLine,
      onCreateLine: this.createItemLine,
      onCreateItemLineSon: this.createItemLineSon,
      onDistributeSupplierForItemLine: this.onDistributeSupplierForItemLine,
      distributeSupplierForItemLIne: this.distributeSupplierForItemLIne,
      cancelDistribute: this.cancelDistribute,
      distributeModalVisible,
      supplierData,
      onSaveLine: this.saveItemLine,
      onDeleteLines: this.deleteItemLines,
      onChangeTableData: this.changeItemLineTableData,
      onFetchItemLine: this.fetchItemLine,
      onClearSelectedRows: this.clearSelectedRows,
      supplierRecordLoading,
      customizeBtnGroup,
    };

    // 专家
    const ProfessionalTableProps = {
      header,
      expertDuty,
      expertTeam,
      expertSaveType,
      evaluateExpertList,
      dispatch,
      organizationId,
      match,
      customizeTable,
      subjectMatterRule,
      expertLineSelectedRows,
      expertLineSelectedRowKeys,
      expertSource, // 控制专家子账户来源
      saveLoading: saveScoringNoneExpertLoading,
      fetchbidHallUpdateLoading,
      expertLineRowSelection,
      onSaveExpert: this.onSaveExpert,
      onCreateLine: this.onCreateLine,
      onDeleteExpert: this.onDeleteExpert,
    };

    // 评分要素选择
    const scoringLineRowSelection = {
      scoringElementSelectedRows,
      onChange: this.onScoringLineChange,
    };

    // 评分要素
    const ScoringElementsTableProps = {
      customizeTable,
      loading: fetchTempelateDetailDataLoading,
      header,
      scoringSaveType,
      scoringNoneTempelate,
      scoringBusinessTempelate,
      scoringTechnologyTempelate,
      dispatch,
      evaluateAssignModalVisible,
      organizationId,
      indicateTypes,
      match,
      currentScoringExperts,
      saveLoading: saveScoringNoneTempelateLoading,
      scoringLineRowSelection,
      scoringElementSelectedRowKeys,
      selectedInfo,
      onSaveScoringElements: this.onSaveScoringElements,
      onCreateScoringElements: this.onCreateScoringElements,
      onDeleteScoringElements: this.onDeleteScoringElements,
      onImportScoringElements: this.onImportScoringElements,
      onSelectTemplateOk: this.onSelectTemplateOk,
      saveAllScoringTemplate: this.saveAllScoringTemplate,
      saveScoringAssignExpert: this.saveScoringAssignExpert,
      openAssignExpertModal: this.openAssignExpertModal,
      cancelAssignExpert: this.cancelAssignExpert,
      fetchEvaluateIndicAssignLoading,
      calculateTypes,
      scoreTypes,
      code,
      bidHall,
      onRef: this.handleRef,
      fetchScoring: this.fetchScoring,
    };

    const SupplierLineRowSelection = {
      selectedRowKeys: supplierLineSelectedRowKeys,
      onChange: this.onSupplierLineRowChange,
    };

    // 批量选择供应商
    const batchSupplierRowSelection = {
      selectedRowKeys: batchSupplierSelectRowKeys,
      selectedRows: batchSupplierSelectRows,
      onChange: this.onBatchSupplierRowChange,
    };

    // 供应商
    const SupplierLineTableProps = {
      allowAddSuppliers,
      templateId: form.getFieldValue('templateId') || header.templateId || null,
      dispatch,
      organizationId,
      userId,
      companyId: header.companyId,
      match,
      fetchbidHallUpdateLoading,
      loading: fetchSupplierLineloading,
      loadingSupplierLov: fetchBulkSupplierDataLoading,
      SupplierLineRowSelection,
      batchSupplierSelectRowKeys,
      batchSupplierRowSelection,
      supplierLineSelectedRows,
      supplierLineSelectedRowKeys,
      dataSource: supplierLine,
      onSaveLine: this.saveSupplierLine,
      onDeleteLines: this.deleteSupplierLine,
      sourceMethod: sourceMethod || header.sourceMethod,
      onCreateLine: this.createSupplierLine,
      batchAddBidSupplier: this.batchAddBidSupplier,
      cancelBatchOperate: this.cancelBatchOperate,
      batchOperateSupplierModelVisible,
      openBatchAddModel: this.openBatchAddModel,
      onSearchBulkSupplier: this.fetchSupplierList,
      onRef: this.handleBindRef,
      onSearch: this.fetchSupplier,
      bulkSupplierList,
      bulkSupplierListPagination,
      pagination: supplierLinePagination,
      customizeTable,
    };

    // 选择招标细项
    const scoringElementRowSelection = {
      selectedRowKeys:
        scoringElementSelectedRows &&
        scoringElementSelectedRows.map((item) => item.prequalScoreAssignId),
      onChange: this.handleScoringElementRowSelectChange,
    };

    // 招标细项props
    const scoringElementProps = {
      header,
      indicateType,
      scoringElementSelectedRows,
      rowSelection: scoringElementRowSelection,
      loading: fetchScoringElementLoading,
      visible: scoringElementVisible,
      dataSource: scoringElement,
      saveScoringElementLoading,
      onCreateLine: this.handleCreateScoringElement,
      onDeleteLine: this.handleDeleteScoringElement,
      onSaveLine: this.handleSaveScoringElement,
      onCancel: this.handleCancelScoringElement,
      onSelectTemplateOk: this.handleSelectTemplateOk,
    };

    const bidMemberRowSelection = {
      bidMemberSelectedRows,
      selectedRowKeys: bidMemberSelectedRowKeys,
      onChange: this.onBidMemberRowChange,
      getCheckboxProps: (record) => ({
        disabled: record.defaultFlag,
        defaultFlag: record.defaultFlag,
      }),
    };

    // bid member props
    const bidMemberProps = {
      header,
      organizationId,
      form,
      bidRoles,
      bidMembersList,
      bidMemberRowSelection,
      editBidMembersFlag,
      bidMemberSelectedRowKeys,
      changeLoginName: this.changeLoginName,
      saveBidMembersLoading,
      handleMembersDelete: this.handleMembersDelete,
      handleMembersCreate: this.handleMembersCreate,
      handleMembersCancel: this.handleMembersCancel,
      handleMembersSave: this.handleMembersSave,
      customizeTable,
    };

    // 招标公告
    const TenderNoticeProps = {
      form,
      header,
      organizationId,
    };

    const MatterDetailProps = {
      matterDetail,
      onRef: (ref = {}) => {
        this.MatterDetail = ref;
      },
    };

    // 专家子账户弹窗props
    const expertModalProps = {
      visible: expertModalVisible,
      onOk: this.handleOkSubAccountModal,
      onCancel: this.handleCancelSubAccountModal,
    };

    const standardShowNoticeFlag = sourceMethod && sourceMethod !== 'INVITE';
    const showNoticeFlag = remote
      ? remote?.process?.('SSRC_SBID_BID_HALL_UPDATE_SHOW_NOTICE_FLAG', standardShowNoticeFlag, {
          sourceMethod,
        })
      : standardShowNoticeFlag;
    return (
      <React.Fragment>
        <Header
          backPath="/ssrc/bid-hall/list"
          title={intl.get(`ssrc.bidHall.view.message.title.bidMaintenance`).d('招标书维护')}
        >
          <Button
            icon="rocket"
            type="primary"
            loading={allLoading}
            onClick={this.handleReleaseBidHall}
          >
            {intl.get('hzero.common.button.release').d('发布')}
          </Button>
          <Button icon="save" onClick={this.handleSaveBidHall} loading={allLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="rollback"
            onClick={this.handleCancelBidHall}
            loading={cancelbidHallUpdateLoading}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          {header && header.noticeId && (
            <Button onClick={this.handleNoticePreview}>
              <img src={bidNotice} alt="" style={{ width: 12, height: 12, marginRight: 8 }} />
              {intl.get(`ssrc.bidHall.view.button.noticePreview`).d('招标公告预览')}
            </Button>
          )}
        </Header>
        <Content
          className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}
          style={{ minHeight: 'calc(100% - 16px - 16px)' }}
        >
          <Spin spinning={fetchbidHallUpdateLoading}>
            <Collapse
              className="form-collapse"
              onChange={this.onCollapseChange}
              defaultActiveKey={['baseInfos']}
            >
              <Panel
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>
                      {header.bidNum} —
                      {intl.get(`ssrc.bidHall.view.message.tab.biddingMaintain`).d('招标维护')}
                    </h3>
                    <a>
                      {collapseKeys.includes('baseInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="baseInfos"
              >
                <Tabs defaultActiveKey="baseInfos" animated={false}>
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.bidHall.view.message.tab.baseInfos`).d('基本信息')}
                    key="baseInfos"
                  >
                    <BidInfoForm {...infoProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.bidHall.view.message.tab.otherInfos`).d('其他信息')}
                    key="otherInfos"
                    forceRender
                  >
                    <BidOtherForm {...otherProps} />
                  </Tabs.TabPane>
                  {header.preQualificationFlag ? (
                    <Tabs.TabPane
                      tab={intl.get(`ssrc.bidHall.view.message.tab.preQualification`).d('资格预审')}
                      key="preQualification"
                      forceRender
                    >
                      <QualificationForm {...qualificationProps} />
                    </Tabs.TabPane>
                  ) : (
                    ''
                  )}
                  {header.expertScoreType && header.expertScoreType === 'ONLINE' ? (
                    <Tabs.TabPane
                      tab={intl.get(`ssrc.bidHall.view.message.tab.professional`).d('专家')}
                      key="professional"
                      forceRender
                    >
                      <ProfessionalTable {...ProfessionalTableProps} />
                    </Tabs.TabPane>
                  ) : (
                    ''
                  )}
                  {header.expertScoreType && header.expertScoreType === 'ONLINE' ? (
                    <Tabs.TabPane
                      tab={intl.get(`ssrc.bidHall.view.message.tab.scoringElements`).d('评分要素')}
                      key="scoringElements"
                      forceRender
                    >
                      <ScoringElementsTable {...ScoringElementsTableProps} />
                    </Tabs.TabPane>
                  ) : (
                    ''
                  )}
                  {!['PARTNER_DISCLOSURE', 'OPEN'].includes(sourceMethod) && (
                    <Tabs.TabPane
                      tab={intl.get(`ssrc.bidHall.view.message.tab.supplierList`).d('供应商列表')}
                      key="supplierList"
                      forceRender
                    >
                      <SupplierLineTable {...SupplierLineTableProps} />
                    </Tabs.TabPane>
                  )}
                  {matterRequireFlag === 1 && (
                    <Tabs.TabPane
                      tab={intl.get(`ssrc.bidHall.view.message.tab.matterDetail`).d('招标事项说明')}
                      key="matterDetail"
                      forceRender
                    >
                      <MatterDetail {...MatterDetailProps} />
                    </Tabs.TabPane>
                  )}
                  {showNoticeFlag ? (
                    <Tabs.TabPane
                      tab={intl.get(`ssrc.bidHall.view.message.tab.tenderNotice`).d('招标公告')}
                      key="tenderNotice"
                      forceRender
                    >
                      <TenderNoticeForm {...TenderNoticeProps} />
                    </Tabs.TabPane>
                  ) : (
                    ''
                  )}
                </Tabs>
              </Panel>
            </Collapse>
          </Spin>
          <ItemLineTable {...ItemLineTableProps} />
        </Content>

        {/* 招标小组modal */}
        <BidMemberForm {...bidMemberProps} />
        {/* 评分要素modal */}
        <ScoringElementModal {...scoringElementProps} />
        {/* 专家子账户弹窗 */}
        {expertModalVisible &&
          (expertSource === 'EXPERT_LIBRARY' ? (
            <ExpertLibraryModal {...expertModalProps} />
          ) : (
            <ExpertSubAccountModal {...expertModalProps} />
          ))}
      </React.Fragment>
    );
  }
}

const Hooc = (Com) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.BID_HALL_EDIT.EDIT_LINE',
        'SSRC.BID_HALL_EDIT.EDIT_LINE_NONE',
        'SSRC.BID_HALL_EDIT.EDIT_HEADER',
        'SSRC.BID_HALL_EDIT.OTHER.INFO',
        'SSRC.BID_HALL_EDIT.EDIT_QUALIFICATION', // 资格预审表单
        'SSRC.BID_HALL_EDIT.EXPERT_SCORE',
        'SSRC.BID_HALL_EDIT.SCORE_INDICS',
        'SSRC.BID_HALL_EDIT.SCORE_INDICS_TECHNOLOGY',
        'SSRC.BID_HALL_EDIT.BIDDING_GROUP',
        'SSRC.BID_HALL_EDIT.SUPPLIER.TABLE', // 供应商table
        'SSRC.BID_HALL_EDIT.ITEM.TABLE_HEADER', // 物品明细头部按钮
      ],
    }),
    formatterCollections({
      code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.score'],
    }),
    connect(({ bidHall, loading, user }) => ({
      user,
      bidHall,
      allLoading: loading.global,
      releasebidHallLoading: loading.effects['bidHall/releasebidHall'],
      fetchbidHallUpdateLoading: loading.effects['bidHall/fetchBidHeaderDetail'],
      fetchChangeTemplateDataLoading: loading.effects['bidHall/fetchChangeTemplateData'],
      fetchItemLineLoading: loading.effects['bidHall/fetchItemLine'],
      saveItemLineLoading: loading.effects['bidHall/saveItemLine'],
      fetchSupplierLineloading: loading.effects['bidHall/fetchSupplierLine'],
      fetchBidMembersLoading: loading.effects['bidHall/fetchBidMembers'],
      saveBidMembersLoading: loading.effects['bidHall/saveBidMembers'],
      deleteBidMembersLoading: loading.effects['bidHall/deleteBidMembers'],
      saveSupplierLineLoading: loading.effects['bidHall/saveSupplierLine'],
      savebidHallUpdateLoading: loading.effects['bidHall/savebidHallUpdate'],
      deleteSupplierLinesLoading: loading.effects['bidHall/deleteSupplierLines'],
      supplierRecordLoading: loading.effects['bidHall/supplierRecord'],
      saveSupplierRecordLineLoading: loading.effects['bidHall/saveSupplierRecordLine'],
      fetchBulkSupplierDataLoading: loading.effects['bidHall/fetchBulkSupplierData'],
      fetchExpertAllocationDataLoading: loading.effects['bidHall/fetchExpertAllocationData'],
      saveScoringNoneExpertLoading: loading.effects['bidHall/saveScoringNoneExpert'],
      saveAllScoringTemplateLoading: loading.effects['bidHall/saveAllScoringTemplate'],
      deleteScoringNoneExpertLoading: loading.effects['bidHall/deleteScoringNoneExpert'],
      fetchTempelateDetailDataLoading: loading.effects['bidHall/fetchTempelateDetailData'],
      saveScoringNoneTempelateLoading: loading.effects['bidHall/saveScoringNoneTempelate'],
      deleteScoringNoneTempelateLoading: loading.effects['bidHall/deleteScoringNoneTempelate'],
      fetchEvaluateIndicAssignLoading: loading.effects['bidHall/fetchEvaluateIndicAssign'],
      saveEvaluateIndicAssignLoading: loading.effects['bidHall/saveEvaluateIndicAssign'],
      fetchScoringElementLoading: loading.effects['bidHall/fetchScoringElementData'],
      saveScoringElementLoading: loading.effects['bidHall/saveScoringElement'],
      cancelbidHallUpdateLoading: loading.effects['bidHall/cancelbidHallUpdate'],
      organizationId: getCurrentOrganizationId(),
      userId: getCurrentUserId(),
    })),
    Form.create({ fieldNameProp: null })
  )(Com);
};

export default Hooc(Update);

export { Update, Hooc };
