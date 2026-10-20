/**
 * TaskAction - 招标作业-操作
 * @date: 2019-05-28
 * @author: CTJ <tianjiao.cao@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Form, Tabs, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, filter } from 'lodash';
import uuidv4 from 'uuid/v4';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getEditTableData, getCurrentUserId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ProfessionalTable from './ProfessionalTable';
import ScoringElementsTable from './ScoringElementsTable';
import styles from './index.less';

@withCustomize({
  unitCode: [
    'SSRC.BID_HALL_EDIT.EXPERT_SCORE',
    'SSRC.BID_HALL_EDIT.SCORE_INDICS',
    'SSRC.BID_HALL_EDIT.SCORE_INDICS_TECHNOLOGY',
  ],
})
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidTask', 'ssrc.score'] })
@connect(({ bidTask, loading, user }) => ({
  user,
  bidTask,
  fetchScoringElementLoading: loading.effects['bidTask/fetchScoringElement'],
  fetchScoringAssignLoading: loading.effects['bidTask/fetchScoringAssign'],
  saveScoringLoading: loading.effects['bidTask/fetchScoringElementSave'],
  saveScoringAssignLoading: loading.effects['bidTask/fetchScoringAssignSave'],
  fetchProfessionalLoading: loading.effects['bidTask/fetchProfessional'],
  saveProfessionalLoading: loading.effects['bidTask/fetchProfessionalSave'],
  deleteProfessionalLoading: loading.effects['bidTask/fetchProfessionalDelete'],
  deleteScoringLoading: loading.effects['bidTask/fetchScoringElementDelete'],
  saveTaskActionLoading: loading.effects['bidTask/saveTaskAction'],
  submitTaskActionLoading: loading.effects['bidTask/submitTaskAction'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class TaskAction extends Component {
  constructor(props) {
    super(props);
    this.ItemLineTable = {};
    this.state = {
      businessScoringRowKeys: [], // 评分要素-商务组选中行
      techScoringRowKeys: [], // 评分要素-技术组选中行
      scoringRowKeys: [], // 评分要素-组选中行
      businessProfRowKeys: [], // 专家-商务组选中行
      techProfRowKeys: [], // 专家-技术组选中行
      ProfRowKeys: [], // 专家-组选中行
      saveProfLoading: '', // 保存专家指定按钮loading状态
      deleteProfLoading: '', // 删除专家指定按钮loading状态
      saveScorLoading: '', // 保存评分要素指定按钮loading状态
      deleteScorLoading: '', // 删除评分要素指定按钮loading状态
    };
  }

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.fetchbidTaskUpdate();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'bidTask/updateState',
      payload: {
        ScoringElement: {},
      },
    });
  }

  /**
   * 查询维护页面信息
   */
  @Bind()
  fetchbidTaskUpdate() {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidTask/fetchScoringElement',
      // payload: { organizationId, bidHeaderId: params.bidId, sourceFrom, path },
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        customizeUnitCode:
          'SSRC.BID_HALL_EDIT.SCORE_INDICS,SSRC.BID_HALL_EDIT.SCORE_INDICS_TECHNOLOGY',
      },
    });
    dispatch({
      type: 'bidTask/fetchProfessional',
      // payload: { organizationId, bidHeaderId: params.bidId, sourceFrom, path },
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        customizeUnitCode: 'SSRC.BID_HALL_EDIT.EXPERT_SCORE',
      },
    });
    const lovCodes = {
      expertName: 'SSRC.EXPERT',
      expertTeam: 'SSRC.EXPERT_TEAM', // 评分类别
      expertDuty: 'SSRC.EXPERT_DUTY', // 专家职责
      calculateTypes: 'SSRC.CALCULATE_TYPE', // 计算方式
      scoreTypes: 'SSRC.SCORE_TYPE', // 评分类型
      benchmarkPriceMethod: 'SSRC.BENCHMARK_PRICE_METHOD', // 基准价计算方法
      formula: 'SSRC.INDIC_FORMULA', // 价格计算公式
      indicateTypes: 'SSRC.INDICATE_TYPE', // 要素类型
    };
    dispatch({
      type: 'bidTask/batchCode',
      payload: { lovCodes },
    });
  }

  // 专家
  @Bind()
  handleBusinessProfRowSelectChange(selectedRowKeys) {
    this.setState({ businessProfRowKeys: selectedRowKeys });
  }

  @Bind()
  handleTechProfRowSelectChange(selectedRowKeys) {
    this.setState({ techProfRowKeys: selectedRowKeys });
  }

  @Bind()
  handleProfRowSelectChange(selectedRowKeys) {
    this.setState({ ProfRowKeys: selectedRowKeys });
  }

  /**
   * 专家-商务组 -新增行
   */
  @Bind()
  onCreateProfBusiness() {
    const {
      dispatch,
      organizationId,
      match: { params },
      bidTask: {
        ProfElement: { evaluateExpertList = [] },
      },
    } = this.props;
    const newLine = {
      userName: undefined,
      sourceHeaderId: params.bidId,
      sourceFrom: 'BID',
      evaluateExpertId: uuidv4(),
      evaluateLeaderFlag: '0', // 职责
      expertId: undefined,
      tenantId: organizationId,
      // expertCategory: undefined,
      expertName: undefined,
      leaderFlag: 0,
      scoredFlag: undefined,
      openBidOrder: 'BUSINESS_FIRST',
      organizationId,
      expertCategory: 'BUSINESS',
      team: 'BUSINESS',
      _status: 'create',
    };
    dispatch({
      type: 'bidTask/updateState',
      payload: {
        ProfElement: {
          evaluateExpertList: [newLine, ...evaluateExpertList],
        },
      },
    });
  }

  @Bind()
  onCreateProfTech() {
    const {
      dispatch,
      organizationId,
      match: { params },
      bidTask: {
        ProfElement: { evaluateExpertList = [] },
      },
    } = this.props;
    const newLine = {
      userName: undefined,
      sourceHeaderId: params.bidId,
      sourceFrom: 'BID',
      tenantId: organizationId,
      evaluateExpertId: uuidv4(),
      evaluateLeaderFlag: '0', // 职责
      expertId: undefined,
      expertName: undefined,
      leaderFlag: 0,
      scoredFlag: undefined,
      openBidOrder: 'TECH_FIRST',
      organizationId,
      expertCategory: 'TECHNOLOGY',
      team: 'TECHNOLOGY',
      _status: 'create',
      calculateType: '', // 计算方式
      scoreType: '', // 评分类型
      evaluateIndicDetail: null, // 评分细则
    };
    dispatch({
      type: 'bidTask/updateState',
      payload: {
        ProfElement: {
          evaluateExpertList: [newLine, ...evaluateExpertList],
        },
      },
    });
  }

  @Bind()
  onCreateProfLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      bidTask: {
        ProfElement: { evaluateExpertList = [] },
      },
    } = this.props;
    const newLine = {
      userName: undefined,
      sourceHeaderId: params.bidId,
      sourceFrom: 'BID',
      tenantId: organizationId,
      evaluateExpertId: uuidv4(),
      evaluateLeaderFlag: '0', // 职责
      expertId: undefined,
      expertName: undefined,
      leaderFlag: 0,
      scoredFlag: undefined,
      openBidOrder: 'SYNC',
      organizationId,
      expertCategory: 'BUSINESS_TECHNOLOGY',
      team: 'BUSINESS_TECHNOLOGY',
      _status: 'create',
      calculateType: '', // 计算方式
      scoreType: '', // 评分类型
      evaluateIndicDetail: null, // 评分细则
    };
    dispatch({
      type: 'bidTask/updateState',
      payload: {
        ProfElement: {
          evaluateExpertList: [newLine, ...evaluateExpertList],
        },
      },
    });
  }

  /**
   * 专家-商务组 -保存
   */
  @Bind()
  onSaveProfBusiness() {
    this.setState({ saveProfLoading: 'business' });
    // const { businessProfRowKeys } = this.state;
    const {
      dispatch,
      bidTask: {
        ProfElement: { evaluateExpertList = [] },
      },
      organizationId,
    } = this.props;
    const tempEvaluateExpertList = getEditTableData(evaluateExpertList, ['evaluateExpertId']);
    if (!isEmpty(tempEvaluateExpertList)) {
      dispatch({
        type: 'bidTask/fetchProfessionalSave',
        payload: {
          organizationId,
          evaluateExperts: {
            evaluateExpertList: tempEvaluateExpertList.map((item) => ({
              ...item,
              evaluateLeaderFlag: +item.evaluateLeaderFlag,
            })),
          },
          customizeUnitCode: 'SSRC.BID_HALL_EDIT.SCORE_INDICS',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ businessProfRowKeys: [] });
          this.fetchbidTaskUpdate();
        }
      });
    }
  }

  @Bind()
  onSaveProfTech() {
    this.setState({ saveProfLoading: 'tech' });
    const {
      dispatch,
      bidTask: {
        ProfElement: { evaluateExpertList = [] },
      },
      organizationId,
    } = this.props;
    const tempEvaluateExpertList = getEditTableData(evaluateExpertList, ['evaluateExpertId']);
    if (!isEmpty(tempEvaluateExpertList)) {
      dispatch({
        type: 'bidTask/fetchProfessionalSave',
        payload: {
          organizationId,
          evaluateExperts: {
            evaluateExpertList: tempEvaluateExpertList.map((item) => ({
              ...item,
              evaluateLeaderFlag: +item.evaluateLeaderFlag,
            })),
          },
          customizeUnitCode: 'SSRC.BID_HALL_EDIT.SCORE_INDICS_TECHNOLOGY',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ techProfRowKeys: [] });
          this.fetchbidTaskUpdate();
        }
      });
    }
  }

  @Bind()
  onSaveProfLine() {
    const {
      dispatch,
      bidTask: {
        ProfElement: { evaluateExpertList = [] },
      },
      organizationId,
    } = this.props;
    const tempEvaluateExpertList = getEditTableData(evaluateExpertList, ['evaluateExpertId']);
    if (!isEmpty(tempEvaluateExpertList)) {
      dispatch({
        type: 'bidTask/fetchProfessionalSave',
        payload: {
          organizationId,
          evaluateExperts: {
            evaluateExpertList: tempEvaluateExpertList.map((item) => ({
              ...item,
              evaluateLeaderFlag: +item.evaluateLeaderFlag,
            })),
          },
          customizeUnitCode: 'SSRC.BID_HALL_EDIT.EXPERT_SCORE',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ ProfRowKeys: [] });
          this.fetchbidTaskUpdate();
        }
      });
    }
  }

  /**
   * 专家-商务组 -删除
   */
  @Bind()
  onDeleteProfBusiness() {
    this.setState({ deleteProfLoading: 'business' });
    const {
      dispatch,
      bidTask: {
        ProfElement: { evaluateExpertList = [] },
      },
      organizationId,
    } = this.props;
    const { businessProfRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(evaluateExpertList, (item) => {
      return businessProfRowKeys.indexOf(item.evaluateExpertId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newScoringList = filter(evaluateExpertList, (item) => {
      return businessProfRowKeys.indexOf(item.evaluateExpertId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];

        newParameters.forEach((item) => {
          if (item._status === 'update') {
            remoteDelete.push(item.evaluateExpertId);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'bidTask/updateState',
            payload: {
              ProfElement: {
                evaluateExpertList: newScoringList,
              },
            },
          });
          this.setState({ businessProfRowKeys: [] });
        } else {
          dispatch({
            type: 'bidTask/fetchProfessionalDelete',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              // 删除成功
              notification.success();
              dispatch({
                type: 'bidTask/updateState',
                payload: {
                  ProfElement: {
                    evaluateExpertList: newScoringList,
                  },
                },
              });
              this.setState({ businessProfRowKeys: [] });
            }
          });
        }
      },
    });
  }

  @Bind()
  onDeleteProfTech() {
    this.setState({ deleteProfLoading: 'tech' });
    const {
      dispatch,
      bidTask: {
        ProfElement: { evaluateExpertList = [] },
      },
      organizationId,
    } = this.props;
    const { techProfRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(evaluateExpertList, (item) => {
      return techProfRowKeys.indexOf(item.evaluateExpertId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newScoringList = filter(evaluateExpertList, (item) => {
      return techProfRowKeys.indexOf(item.evaluateExpertId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item.evaluateExpertId);
          }
          if (item._status === 'update') {
            remoteDelete.push(item.evaluateExpertId);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'bidTask/updateState',
            payload: {
              ProfElement: {
                evaluateExpertList: newScoringList,
              },
            },
          });
          this.setState({ techProfRowKeys: [] });
        } else {
          dispatch({
            type: 'bidTask/fetchProfessionalDelete',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              // 删除成功
              notification.success();
              dispatch({
                type: 'bidTask/updateState',
                payload: {
                  ProfElement: {
                    evaluateExpertList: newScoringList,
                  },
                },
              });
              this.setState({ techProfRowKeys: [] });
            }
          });
        }
      },
    });
  }

  @Bind()
  onDeleteProfLine() {
    const {
      dispatch,
      bidTask: {
        ProfElement: { evaluateExpertList = [] },
      },
      organizationId,
    } = this.props;
    const { ProfRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(evaluateExpertList, (item) => {
      return ProfRowKeys.indexOf(item.evaluateExpertId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newScoringList = filter(evaluateExpertList, (item) => {
      return ProfRowKeys.indexOf(item.evaluateExpertId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item.evaluateExpertId);
          }
          if (item._status === 'update') {
            remoteDelete.push(item.evaluateExpertId);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'bidTask/updateState',
            payload: {
              ProfElement: {
                evaluateExpertList: newScoringList,
              },
            },
          });
          this.setState({ ProfRowKeys: [] });
        } else {
          dispatch({
            type: 'bidTask/fetchProfessionalDelete',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              // 删除成功
              notification.success();
              dispatch({
                type: 'bidTask/updateState',
                payload: {
                  ProfElement: {
                    evaluateExpertList: newScoringList,
                  },
                },
              });
              this.setState({ ProfRowKeys: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 评分要素-商务组 -新增行
   */
  @Bind()
  onCreateScoringBusiness() {
    const {
      dispatch,
      organizationId,
      match: { params },
      bidTask: {
        ScoringElement: { businessIndicList = [], technologyIndicList = [], otherIndicList = [] },
      },
    } = this.props;
    const newLine = {
      sourceHeaderId: params.bidId,
      sourceFrom: 'BID',
      evaluateIndicId: uuidv4(),
      tenantId: organizationId,
      indicateId: undefined,
      indicateCode: undefined,
      indicateName: undefined,
      indicateType: undefined,
      remark: undefined,
      weight: undefined,
      minScore: undefined,
      maxScore: undefined,
      expertCategory: 'BUSINESS',
      _status: 'create',
      calculateType: '', // 计算方式
      scoreType: '', // 评分类型
      evaluateIndicDetail: null, // 评分细则
    };
    dispatch({
      type: 'bidTask/updateState',
      payload: {
        ScoringElement: {
          businessIndicList: [newLine, ...businessIndicList],
          technologyIndicList: [...technologyIndicList],
          otherIndicList: [...otherIndicList],
        },
      },
    });
  }

  /**
   * 评分要素-技术组 -新增行
   */
  @Bind()
  onCreateScoringTech() {
    const {
      dispatch,
      organizationId,
      match: { params },
      bidTask: {
        ScoringElement: { businessIndicList = [], technologyIndicList = [], otherIndicList = [] },
      },
    } = this.props;
    const newLine = {
      sourceHeaderId: params.bidId,
      sourceFrom: 'BID',
      evaluateIndicId: uuidv4(),
      tenantId: organizationId,
      indicateId: undefined,
      indicateCode: undefined,
      indicateName: undefined,
      indicateType: undefined,
      remark: undefined,
      weight: undefined,
      minScore: undefined,
      maxScore: undefined,
      expertCategory: 'TECHNOLOGY',
      _status: 'create',
    };
    dispatch({
      type: 'bidTask/updateState',
      payload: {
        ScoringElement: {
          businessIndicList: [...businessIndicList],
          technologyIndicList: [newLine, ...technologyIndicList],
          otherIndicList: [...otherIndicList],
        },
      },
    });
  }

  /**
   * 评分要素-组 -新增行
   */
  @Bind()
  onCreateScoringLine() {
    const {
      dispatch,
      organizationId,
      match: { params },
      bidTask: {
        ScoringElement: { businessIndicList = [], technologyIndicList = [], otherIndicList = [] },
      },
    } = this.props;
    const newLine = {
      sourceHeaderId: params.bidId,
      sourceFrom: 'BID',
      evaluateIndicId: uuidv4(),
      tenantId: organizationId,
      indicateId: undefined,
      indicateCode: undefined,
      indicateName: undefined,
      indicateType: undefined,
      remark: undefined,
      weight: undefined,
      minScore: undefined,
      maxScore: undefined,
      expertCategory: 'OTHER',
      _status: 'create',
    };
    dispatch({
      type: 'bidTask/updateState',
      payload: {
        ScoringElement: {
          businessIndicList: [...businessIndicList],
          technologyIndicList: [...technologyIndicList],
          otherIndicList: [newLine, ...otherIndicList],
        },
      },
    });
  }

  /**
   * 评分要素-商务组 -保存行
   */
  @Bind()
  onSaveScoringBusiness() {
    this.setState({ saveScorLoading: 'business' });
    const {
      dispatch,
      bidTask: {
        ScoringElement: { businessIndicList = [] },
      },
      organizationId,
    } = this.props;
    const businessScoringList = getEditTableData(businessIndicList, ['evaluateIndicId']);
    if (!isEmpty(businessScoringList)) {
      dispatch({
        type: 'bidTask/fetchScoringElementSave',
        payload: {
          organizationId,
          ScoringElementList: businessScoringList,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ businessScoringRowKeys: [] });
          this.fetchbidTaskUpdate();
        }
      });
    }
  }

  /**
   * 评分要素-技术组 -保存行
   */
  @Bind()
  onSaveScoringTech() {
    this.setState({ saveScorLoading: 'tech' });
    const {
      dispatch,
      bidTask: {
        ScoringElement: { technologyIndicList = [] },
      },
      organizationId,
    } = this.props;
    const techScoringList = getEditTableData(technologyIndicList, ['evaluateIndicId']);
    if (!isEmpty(techScoringList)) {
      dispatch({
        type: 'bidTask/fetchScoringElementSave',
        payload: {
          organizationId,
          ScoringElementList: techScoringList,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ techScoringRowKeys: [] });
          this.fetchbidTaskUpdate();
        }
      });
    }
  }

  /**
   * 评分要素-组 -保存行
   */
  @Bind()
  onSaveScoringLine() {
    const {
      dispatch,
      bidTask: {
        ScoringElement: { otherIndicList = [] },
      },
      organizationId,
    } = this.props;
    const otherScoringList = getEditTableData(otherIndicList, ['evaluateIndicId']);
    if (!isEmpty(otherScoringList)) {
      dispatch({
        type: 'bidTask/fetchScoringElementSave',
        payload: {
          organizationId,
          ScoringElementList: otherScoringList,
          customizeUnitCode: 'SSRC.BID_HALL_EDIT.SCORE_INDICS',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({ scoringRowKeys: [] });
          this.fetchbidTaskUpdate();
        }
      });
    }
  }

  /**
   * 评分要素-专家分配 -保存行
   */
  @Bind()
  onScoringAssignSave() {
    const {
      dispatch,
      bidTask: { ScoringAssign = [] },
      organizationId,
    } = this.props;
    const scoringAssignList = getEditTableData(ScoringAssign, ['indicAssginId']);
    if (!isEmpty(scoringAssignList)) {
      dispatch({
        type: 'bidTask/fetchScoringAssignSave',
        payload: {
          organizationId,
          ScoringAssign: scoringAssignList,
        },
      }).then((res) => {
        if (res) {
          notification.success();
        }
      });
    }
  }

  /**
   * 评分要素-商务组 -删除行
   */
  @Bind()
  onDeleteScoringBusiness() {
    this.setState({ deleteScorLoading: 'business' });
    const {
      dispatch,
      bidTask: {
        ScoringElement: { businessIndicList = [], technologyIndicList = [], otherIndicList = [] },
      },
      organizationId,
    } = this.props;
    const { businessScoringRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(businessIndicList, (item) => {
      return businessScoringRowKeys.indexOf(item.evaluateIndicId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newScoringList = filter(businessIndicList, (item) => {
      return businessScoringRowKeys.indexOf(item.evaluateIndicId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item.evaluateIndicId);
          }
          if (item._status === 'update') {
            remoteDelete.push(item.evaluateIndicId);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'bidTask/updateState',
            payload: {
              ScoringElement: {
                businessIndicList: newScoringList,
                technologyIndicList: [...technologyIndicList],
                otherIndicList: [...otherIndicList],
              },
            },
          });
          this.setState({ businessScoringRowKeys: [] });
        } else {
          dispatch({
            type: 'bidTask/fetchScoringElementDelete',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              // 删除成功
              notification.success();
              dispatch({
                type: 'bidTask/updateState',
                payload: {
                  ScoringElement: {
                    businessIndicList: newScoringList,
                    technologyIndicList: [...technologyIndicList],
                    otherIndicList: [...otherIndicList],
                  },
                },
              });
              this.setState({ businessScoringRowKeys: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 评分要素-技术组 -删除行
   */
  @Bind()
  onDeleteScoringTech() {
    this.setState({ deleteScorLoading: 'tech' });
    const {
      dispatch,
      bidTask: {
        ScoringElement: { businessIndicList = [], technologyIndicList = [], otherIndicList = [] },
      },
      organizationId,
    } = this.props;
    const { techScoringRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(technologyIndicList, (item) => {
      return techScoringRowKeys.indexOf(item.evaluateIndicId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newScoringList = filter(technologyIndicList, (item) => {
      return techScoringRowKeys.indexOf(item.evaluateIndicId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item.evaluateIndicId);
          }
          if (item._status === 'update') {
            remoteDelete.push(item.evaluateIndicId);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'bidTask/updateState',
            payload: {
              ScoringElement: {
                businessIndicList: [...businessIndicList],
                technologyIndicList: newScoringList,
                otherIndicList: [...otherIndicList],
              },
            },
          });
          this.setState({ techScoringRowKeys: [] });
        } else {
          dispatch({
            type: 'bidTask/fetchScoringElementDelete',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              // 删除成功
              notification.success();
              dispatch({
                type: 'bidTask/updateState',
                payload: {
                  ScoringElement: {
                    businessIndicList: [...businessIndicList],
                    technologyIndicList: newScoringList,
                    otherIndicList: [...otherIndicList],
                  },
                },
              });
              this.setState({ techScoringRowKeys: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 评分要素-组 -删除行
   */
  @Bind()
  onDeleteScoringLine() {
    const {
      dispatch,
      bidTask: {
        ScoringElement: { businessIndicList = [], technologyIndicList = [], otherIndicList = [] },
      },
      organizationId,
    } = this.props;
    const { scoringRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(otherIndicList, (item) => {
      return scoringRowKeys.indexOf(item.evaluateIndicId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newScoringList = filter(otherIndicList, (item) => {
      return scoringRowKeys.indexOf(item.evaluateIndicId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item.evaluateIndicId);
          }
          if (item._status === 'update') {
            remoteDelete.push(item.evaluateIndicId);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'bidTask/updateState',
            payload: {
              ScoringElement: {
                businessIndicList: [...businessIndicList],
                technologyIndicList: [...technologyIndicList],
                otherIndicList: newScoringList,
              },
            },
          });
          this.setState({ scoringRowKeys: [] });
        } else {
          dispatch({
            type: 'bidTask/fetchScoringElementDelete',
            payload: { remoteDelete, organizationId },
          }).then((res) => {
            if (res) {
              // 删除成功
              notification.success();
              dispatch({
                type: 'bidTask/updateState',
                payload: {
                  ScoringElement: {
                    businessIndicList: [...businessIndicList],
                    technologyIndicList: [...technologyIndicList],
                    otherIndicList: newScoringList,
                  },
                },
              });
              this.setState({ scoringRowKeys: [] });
            }
          });
        }
      },
    });
  }

  /**
   * 专家作业 - 总体保存
   */
  @Bind()
  saveTaskAction(action = '') {
    // const { businessProfRowKeys } = this.state;
    const {
      dispatch,
      bidTask: {
        ProfElement: { evaluateExpertList = [] },
        ScoringElement: { businessIndicList = [], technologyIndicList = [], otherIndicList = [] },
      },
      organizationId,
    } = this.props;
    const tempEvaluateExpertList = getEditTableData(evaluateExpertList, ['evaluateExpertId']); // none/diff 合并
    const businessEvaluateList = getEditTableData(businessIndicList, ['evaluateIndicId']);
    const technologyEvaluateList = getEditTableData(technologyIndicList, ['evaluateIndicId']);
    const otherEvaluateList = getEditTableData(otherIndicList, ['evaluateIndicId']);
    if (isEmpty(evaluateExpertList) || !isEmpty(tempEvaluateExpertList)) {
      if (isEmpty(businessIndicList) || !isEmpty(businessEvaluateList)) {
        if (isEmpty(technologyIndicList) || !isEmpty(technologyEvaluateList)) {
          if (isEmpty(otherIndicList) || !isEmpty(otherEvaluateList)) {
            dispatch({
              // type: 'bidTask/saveTaskAction',
              type: `bidTask/${action}`,
              payload: {
                organizationId,
                ProfElement: {
                  evaluateExpertList: tempEvaluateExpertList.map((item) => ({
                    ...item,
                    evaluateLeaderFlag: +item.evaluateLeaderFlag,
                  })),
                },
                ScoringElement: {
                  businessIndicList: businessEvaluateList,
                  technologyIndicList: technologyEvaluateList,
                  otherIndicList: otherEvaluateList,
                },
                customizeUnitCode:
                  'SSRC.BID_HALL_EDIT.SCORE_INDICS,SSRC.BID_HALL_EDIT.SCORE_INDICS_TECHNOLOGY,SSRC.BID_HALL_EDIT.EXPERT_SCORE',
              },
            }).then((res) => {
              if (res) {
                notification.success();
                this.setState({
                  businessScoringRowKeys: [],
                  techScoringRowKeys: [],
                  scoringRowKeys: [],
                  businessProfRowKeys: [],
                  techProfRowKeys: [],
                  ProfRowKeys: [],
                });
                this.fetchbidTaskUpdate();
              }
            });
          }
        }
      }
    }
  }

  @Bind()
  handleBusinessScoringRowSelectChange(selectedRowKeys) {
    this.setState({ businessScoringRowKeys: selectedRowKeys });
  }

  @Bind()
  handleTechScoringRowSelectChange(selectedRowKeys) {
    this.setState({ techScoringRowKeys: selectedRowKeys });
  }

  @Bind()
  handleScoringRowSelectChange(selectedRowKeys) {
    this.setState({ scoringRowKeys: selectedRowKeys });
  }

  render() {
    const {
      // loading,
      dispatch,
      match,
      // dataSource = [],
      organizationId,
      // userId,
      fetchScoringElementLoading,
      fetchProfessionalLoading,
      saveProfessionalLoading,
      deleteProfessionalLoading,
      saveTaskActionLoading,
      submitTaskActionLoading,
      saveScoringLoading,
      deleteScoringLoading,
      saveScoringAssignLoading,
      bidTask: {
        ScoringElement,
        ScoringAssign,
        ProfElement,
        code,
        code: { expertDuty = [], expertTeam = [] },
      },
      history: {
        location: { search },
      },
      customizeTable,
    } = this.props;
    const {
      businessScoringRowKeys = [],
      techScoringRowKeys = [],
      scoringRowKeys = [],
      businessProfRowKeys = [],
      techProfRowKeys = [],
      ProfRowKeys = [],
      saveProfLoading = '',
      deleteProfLoading = '',
      saveScorLoading = '',
      deleteScorLoading = '',
    } = this.state;
    // 专家
    const businessProfRowSelection = {
      selectedRowKeys: businessProfRowKeys,
      onChange: this.handleBusinessProfRowSelectChange,
    };
    const techProfRowSelection = {
      selectedRowKeys: techProfRowKeys,
      onChange: this.handleTechProfRowSelectChange,
    };
    const ProfRowSelection = {
      selectedRowKeys: ProfRowKeys,
      onChange: this.handleProfRowSelectChange,
    };
    const { expertSource } = querystring.parse(search.substr(1));
    const ProfessionalTableProps = {
      customizeTable,
      expertDuty,
      expertTeam,
      saveProfLoading,
      deleteProfLoading,
      dispatch,
      organizationId,
      match,
      deleteLoading: deleteProfessionalLoading,
      loading: fetchProfessionalLoading,
      saveLoading: saveProfessionalLoading || fetchProfessionalLoading,
      ProfElement,
      businessProfRowSelection,
      businessProfRowKeys,
      techProfRowSelection,
      techProfRowKeys,
      ProfRowSelection,
      ProfRowKeys,
      expertSource,
      onCreateBusiness: this.onCreateProfBusiness,
      onCreateTech: this.onCreateProfTech,
      onCreateLine: this.onCreateProfLine,
      onSaveBusiness: this.onSaveProfBusiness,
      onSaveTech: this.onSaveProfTech,
      onSaveLine: this.onSaveProfLine,
      onDeleteBusiness: this.onDeleteProfBusiness,
      onDeleteTech: this.onDeleteProfTech,
      onDeleteLine: this.onDeleteProfLine,
    };
    // 评分要素
    const businessScoringRowSelection = {
      selectedRowKeys: businessScoringRowKeys,
      onChange: this.handleBusinessScoringRowSelectChange,
    };
    const techScoringRowSelection = {
      selectedRowKeys: techScoringRowKeys,
      onChange: this.handleTechScoringRowSelectChange,
    };
    const scoringRowSelection = {
      selectedRowKeys: scoringRowKeys,
      onChange: this.handleScoringRowSelectChange,
    };
    const ScoringElementsTableProps = {
      code,
      customizeTable,
      saveScorLoading,
      deleteScorLoading,
      deleteScoringLoading,
      dispatch,
      loading: fetchScoringElementLoading,
      organizationId,
      match,
      ScoringElement,
      ScoringAssign,
      onCreateBusiness: this.onCreateScoringBusiness,
      onCreateTech: this.onCreateScoringTech,
      onCreateLine: this.onCreateScoringLine,
      onDeleteBusiness: this.onDeleteScoringBusiness,
      onDeleteTech: this.onDeleteScoringTech,
      onDeleteLine: this.onDeleteScoringLine,
      onSaveBusiness: this.onSaveScoringBusiness,
      onSaveTech: this.onSaveScoringTech,
      onSaveLine: this.onSaveScoringLine,
      onScoringAssignSave: this.onScoringAssignSave,
      businessScoringRowSelection,
      businessScoringRowKeys,
      techScoringRowSelection,
      techScoringRowKeys,
      scoringRowSelection,
      scoringRowKeys,
      saveLoading: saveScoringLoading || fetchScoringElementLoading,
      saveAssignLoading: saveScoringAssignLoading,
    };
    return (
      <React.Fragment>
        <Header
          backPath="/ssrc/bid-task/list"
          title={intl.get(`ssrc.bidTask.view.message.title.bidMaintenance`).d('招标作业')}
        >
          <Button
            icon="rocket"
            type="primary"
            loading={submitTaskActionLoading}
            onClick={() => this.saveTaskAction('submitTaskAction')}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button
            icon="save"
            loading={saveTaskActionLoading}
            onClick={() => this.saveTaskAction('saveTaskAction')}
            type="default"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content className={styles.contentInfo}>
          <Tabs defaultActiveKey="professional" animated={false}>
            <Tabs.TabPane
              tab={intl.get(`ssrc.bidTask.view.message.tab.professional`).d('专家')}
              key="professional"
              forceRender
            >
              <ProfessionalTable {...ProfessionalTableProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`ssrc.bidTask.view.message.tab.scoringElements`).d('评分要素')}
              key="scoringElements"
              forceRender
            >
              <ScoringElementsTable {...ScoringElementsTableProps} />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
