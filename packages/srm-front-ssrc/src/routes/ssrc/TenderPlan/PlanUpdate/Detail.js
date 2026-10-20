/**
 * Detail - 项目整体寻源计划维护
 * @date: 2019-04-16
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Spin } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, isUndefined, compose, noop } from 'lodash';
import moment from 'moment';

import { Header, Content } from 'components/Page';
import { getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN } from 'utils/constants';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ExcelExport from 'components/ExcelExport';
import remote from 'hzero-front/lib/utils/remote';

import DetailForm from './DetailForm';
import DetailTable from './DetailTable';
import styles from './index.less';

const viewMessagePrompt = 'ssrc.tenderPlan.view.message';
const organizationId = getCurrentOrganizationId();

class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { bidPlanId },
      },
    } = props;
    // const isEdit = path === '/ssrc/plan-update/create';
    this.state = {
      bidPlanId,
      // isEdit,
      tenantId: getCurrentOrganizationId(),
      operationLoading: false,
    };
  }

  tableRef;

  componentDidMount() {
    const { bidPlanId } = this.state;
    if (bidPlanId) {
      this.handleSearchPlan();
    } else {
      const { dispatch } = this.props;
      dispatch({
        type: 'tenderPlan/updateState',
        payload: {
          planUpdateHeader: {},
          planUpdateTable: [],
        },
      });
    }
  }

  /**
   * 查询详情
   */
  @Bind()
  handleSearchPlan() {
    const { dispatch, remote: remoteFunc } = this.props;
    const { bidPlanId } = this.state;
    dispatch({
      type: 'tenderPlan/fetchPlanUpdate',
      payload: {
        bidPlanId,
        customizeUnitCode: 'SSRC.PLAN_UPDATE_DETAIL.FORM',
      },
    });

    if (remoteFunc?.event) {
      remoteFunc.event.fireEvent('searchTable', {
        searchTable: this.searchTable,
        state: this.tableRef.state,
      });
    } else {
      this.searchTable();
    }
  }

  // 表格查询
  @Bind()
  searchTable(orderByField, orderDesc) {
    const { dispatch } = this.props;
    const { bidPlanId } = this.state;
    dispatch({
      type: 'tenderPlan/fetchPlanUpdateLine',
      payload: {
        bidPlanId,
        orderDesc: orderDesc || undefined,
        orderByField: orderByField || undefined,
        customizeUnitCode: 'SSRC.PLAN_UPDATE_DETAIL.TABLE',
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

  // 按钮增加loading
  @Bind()
  toggleLoading(flag = false) {
    this.setState({
      operationLoading: flag,
    });
  }

  @Bind()
  handleTableRef(ref = {}) {
    this.tableRef = ref;
  }

  /**
   * 保存或提交
   * @param {Boolean} flag true-保存
   */
  @Debounce(800)
  @Bind()
  handleSaveOrSubmit(flag) {
    const { bidPlanId, tenantId } = this.state;
    const {
      dispatch,
      history,
      remote: remoteFunc,
      tenderPlan: { planUpdateHeader = {}, planUpdateTable = [] } = {},
    } = this.props;
    const form = isUndefined(this.form) ? {} : this.form;
    form.validateFields((err, formData) => {
      if (!err) {
        this.toggleLoading(true);
        const newFormData = {
          ...planUpdateHeader,
          ...formData,
          tenantId,
        };
        const planUpdateData = getEditTableData(planUpdateTable, ['bidPlanLineId']);
        // 保存方法
        if (flag) {
          const saveData = (list) => {
            const params = list.length
              ? {
                  ...newFormData,
                  customizeUnitCode: 'SSRC.PLAN_UPDATE_DETAIL.FORM,SSRC.PLAN_UPDATE_DETAIL.TABLE',
                  projectBidPlanLnList: list,
                }
              : {
                  ...newFormData,
                  customizeUnitCode: 'SSRC.PLAN_UPDATE_DETAIL.FORM,SSRC.PLAN_UPDATE_DETAIL.TABLE',
                };
            dispatch({
              type: 'tenderPlan/savePlanUpdate',
              payload: params,
            })
              .then((res) => {
                if (res) {
                  notification.success();
                  this.tableRef.setState({selectedRows: []});
                  if (bidPlanId) {
                    this.handleSearchPlan();
                  } else {
                    history.push(`/ssrc/plan-update/detail/${res.bidPlanId}`);
                  }
                }
              })
              .finally(() => {
                this.toggleLoading(false);
              });
          };
          if (planUpdateTable.length === 0 && isEmpty(planUpdateData)) {
            if (remoteFunc?.event) {
              remoteFunc.event.fireEvent('saveData', {
                saveData,
                bidPlanId,
                history,
                newFormData,
                newPlanUpdateData: [],
                toggleLoading: this.toggleLoading,
                handleSearchPlan: this.handleSearchPlan,
                customizeUnitCode: 'SSRC.PLAN_UPDATE_DETAIL.FORM,SSRC.PLAN_UPDATE_DETAIL.TABLE',
              });
            } else {
              saveData([]);
            }
          } else {
            this.toggleLoading(false);
          }
          if (!isEmpty(planUpdateData)) {
            const newPlanUpdateData = planUpdateData.map((item) => {
              const { startDate, endDate } = item;
              return {
                ...item,
                startDate: startDate ? moment(startDate).format(DATETIME_MIN) : undefined,
                endDate: endDate ? moment(endDate).format(DATETIME_MIN) : undefined,
              };
            });
            if (remoteFunc?.event) {
              remoteFunc.event.fireEvent('saveData', {
                saveData,
                bidPlanId,
                history,
                newFormData,
                newPlanUpdateData,
                toggleLoading: this.toggleLoading,
                handleSearchPlan: this.handleSearchPlan,
                customizeUnitCode: 'SSRC.PLAN_UPDATE_DETAIL.FORM,SSRC.PLAN_UPDATE_DETAIL.TABLE',
              });
            } else {
              saveData(newPlanUpdateData);
            }
            // dispatch({
            //   type: 'tenderPlan/savePlanUpdate',
            //   payload: {
            //     ...newFormData,
            //     projectBidPlanLnList: newPlanUpdateData,
            //     customizeUnitCode: 'SSRC.PLAN_UPDATE_DETAIL.FORM,SSRC.PLAN_UPDATE_DETAIL.TABLE',
            //   },
            // }).then((res) => {
            //   if (res) {
            //     notification.success();
            //     if (bidPlanId) {
            //       this.handleSearchPlan();
            //     } else {
            //       history.push(`/ssrc/plan-update/detail/${res.bidPlanId}`);
            //     }
            //   }
            // });
          } else {
            this.toggleLoading(false);
          }
        } else {
          const newPlanUpdateData = planUpdateData.map((item) => {
            const { startDate, endDate } = item;
            return {
              ...item,
              startDate: startDate ? moment(startDate).format(DATETIME_MIN) : undefined,
              endDate: endDate ? moment(endDate).format(DATETIME_MIN) : undefined,
            };
          });
          if (!isEmpty(planUpdateData)) {
            const submitData = () => {
              dispatch({
                type: 'tenderPlan/submitPlanUpdate',
                payload: {
                  ...newFormData,
                  projectBidPlanLnList: newPlanUpdateData,
                  customizeUnitCode: 'SSRC.PLAN_UPDATE_DETAIL.FORM,SSRC.PLAN_UPDATE_DETAIL.TABLE',
                },
              })
                .then((res) => {
                  if (res) {
                    notification.success();
                    history.push('/ssrc/plan-update/list');
                  }
                })
                .finally(() => {
                  this.toggleLoading(false);
                });
            };
            if (remoteFunc?.event) {
              remoteFunc.event.fireEvent('submitData', {
                submitData,
                bidPlanId,
                history,
                newFormData,
                newPlanUpdateData,
                toggleLoading: this.toggleLoading,
                customizeUnitCode: 'SSRC.PLAN_UPDATE_DETAIL.FORM,SSRC.PLAN_UPDATE_DETAIL.TABLE',
              });
            } else {
              submitData();
            }
          } else {
            this.toggleLoading(false);
            notification.warning({
              message: intl
                .get(`${viewMessagePrompt}.fail.warning`)
                .d('提交失败，至少存在一条行信息！'),
            });
          }
        }
      }
    });
  }

  render() {
    const { bidPlanId, operationLoading } = this.state;
    const {
      loading,
      dispatch,
      // saveLoading,
      // submitLoading,
      customizeForm,
      customizeTable,
      remote: remoteFunc,
      tenderPlan: { planUpdateHeader = {}, planUpdateTable = [] } = {},
    } = this.props;
    const formProps = {
      // isEdit,
      customizeForm,
      planUpdateHeader,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      // isEdit,
      bidPlanId,
      dispatch,
      remoteFunc,
      customizeTable,
      isDetail: planUpdateHeader.haveSubmitted,
      planUpdateTable,
      onReload: this.handleSearchPlan,
      searchTable: this.searchTable,
      onRef: this.handleTableRef,
      form: this.form,
    };
    return (
      <React.Fragment>
        <Header
          backPath="/ssrc/plan-update/list"
          title={intl.get(`${viewMessagePrompt}.title.requisition`).d('项目整体寻源计划维护')}
        >
          <React.Fragment>
            <Button
              type="primary"
              icon="check"
              loading={operationLoading || loading}
              disabled={planUpdateHeader.haveSubmitted}
              onClick={() => this.handleSaveOrSubmit(false)}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
            <Button
              icon="save"
              loading={operationLoading || loading}
              onClick={() => this.handleSaveOrSubmit(true)}
              disabled={planUpdateHeader.haveSubmitted}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            {planUpdateHeader.processStatus === 'RELEASED' && (
              <ExcelExport
                requestUrl={`/ssrc/v1/${organizationId}/bid-plan/export`}
                queryParams={{ bidPlanId: planUpdateHeader.bidPlanId }}
              />
            )}
          </React.Fragment>
        </Header>
        <Content className={styles.overflowHidden}>
          <Spin spinning={bidPlanId ? loading : null}>
            <DetailForm {...formProps} />
            <DetailTable {...tableProps} />
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return compose(
    withCustomize({
      unitCode: ['SSRC.PLAN_UPDATE_DETAIL.FORM', 'SSRC.PLAN_UPDATE_DETAIL.TABLE'],
    }),
    connect(({ tenderPlan, loading }) => ({
      tenderPlan,
      loading: loading.effects['tenderPlan/fetchPlanUpdate'],
      saveLoading: loading.effects['tenderPlan/savePlanUpdate'],
      submitLoading: loading.effects['tenderPlan/submitPlanUpdate'],
    })),
    formatterCollections({ code: ['ssrc.tenderPlan'] }),
    remote(
      {
        code: 'SSRC_TENDER_PLAN_UPDATE_DETAIL',
        name: 'remote',
      },
      {
        events: {
          saveData(eventProps) {
            const { saveData = noop, newPlanUpdateData = [] } = eventProps;
            saveData(newPlanUpdateData);
          },
          submitData(eventProps) {
            const { submitData } = eventProps;
            submitData();
          },
          searchTable(eventProps) {
            const { searchTable } = eventProps;
            searchTable();
          },
        },
      }
    )
  )(Comp);
};

export default HOCComponent(Detail);
