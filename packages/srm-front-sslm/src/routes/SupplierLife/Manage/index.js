/**
 * Manage - 供应商生命周期管理
 * @date: 2018-9-7
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Spin, Pagination, Icon, Tooltip } from 'hzero-ui';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import classNames from 'classnames';
import { isUndefined, toString, head, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import remote from 'utils/remote';
import { Header, Content } from 'components/Page';
import { deleteCache } from 'components/CacheComponent';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getCurrentOrganizationId } from 'utils/utils';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import FilterForm from './FilterForm';
import styles from './index.less';

/**
 * 供应商生命周期管理
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} supplierLifeManage - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@withCustomize({
  unitCode: ['SSLM.SUPPLIER_LIFE_MANAGE.LIST_FILTER'],
})
@connect(({ supplierLifeManage, loading }) => ({
  supplierLifeManage,
  loading:
    loading.effects['supplierLifeManage/fetchSuppliersPost'] ||
    loading.effects['supplierLifeManage/querySubsidiary'] ||
    loading.effects['supplierLifeManage/isValidation'],
  tenantId: getCurrentOrganizationId(),
}))
@remote(
  {
    code: 'SSLM.SUPPLIER_LIFE',
    name: 'supplierLifeRemote',
  },
  {
    events: {
      cuxDragEnd: () => {}, // 泳道拖拽增加二开逻辑
    },
  }
)
@formatterCollections({ code: ['sslm.supplierLifeManage', 'sslm.common'] })
export default class Manage extends Component {
  form;

  /**
   * state 初始化
   */
  constructor(props) {
    super(props);
    this.state = {
      dimensionCode: undefined,
      initInfo: {}, // 初始化信息
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierLifeManage/queryCurrentConfig',
    }).then(res => {
      if (res) {
        const { dimensionCode } = res;
        switch (dimensionCode) {
          case 'COMPANY':
            this.querySubsidiary(true);
            break;
          default:
            this.handleSearch({
              dimensionCode: dimensionCode === 'BOTH' ? 'GROUP' : dimensionCode,
            });
            break;
        }
        this.setState({ dimensionCode, initInfo: res });
      }
    });
    dispatch({
      type: 'supplierLifeManage/fetchDimension',
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierLifeManage/updateState',
      payload: {
        stageLane: [],
        dimensionList: [],
      },
    });
  }

  /**
   * 供应商生命周期变更申请跳转
   * @param {Object} queryParams - 详情拼接参数
   * @param {String} redirectPath - 跳转申请单路由
   */
  @Bind()
  redirectForm(queryParams, redirectPath) {
    const { history } = this.props;
    history.push(`${redirectPath}?${qs.stringify(queryParams)}`);
  }

  // 切换分页时滚动到顶部
  @Bind()
  handleScroll(values) {
    const contentContainer = document.getElementById(`draggableWrapper${values?.stageId}`);
    if (contentContainer) {
      contentContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  /**
   * 表单查询
   * @param {object} values - 请求参数
   */
  @Bind()
  handleSearch(values = {}) {
    const { dispatch, tenantId } = this.props;
    const filterValues = isUndefined(this.form) ? {} : this.form.getFieldsValue();
    const { categoryName, itemCategoryIds, ...rest } = filterValues;
    dispatch({
      type: 'supplierLifeManage/fetchSuppliersPost',
      payload: {
        tenantId,
        ...values,
        ...rest,
        itemCategoryIds: itemCategoryIds?.split(','),
        dimensionCode: filterValues.dimensionCode || values.dimensionCode,
        customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.LIST_FILTER',
      },
    }).then(res => {
      if (res) {
        this.handleScroll(values);
      }
    });
  }

  @Bind()
  getItemStyle(isDragging, draggableStyle) {
    return {
      // some basic styles to make the items look a bit nicer
      userSelect: 'none',
      background: isDragging ? '#D9D9D9' : '#FFFFFF',
      // change background colour if dragging
      // transform: isDragging ? `${transform} rotate(7deg)` : 'none',
      // styles we need to apply on draggables
      ...draggableStyle,
    };
  }

  /**
   * 拖动结束回调函数
   */
  async onDragEnd(result) {
    const { supplierLifeRemote } = this.props;
    const { source, destination, draggableId } = result;
    const {
      supplierLifeManage: { stageLane, configId },
      dispatch,
    } = this.props;
    if (!destination) {
      // 被拖动的draggable没有被droppable包含
      return;
    }

    // 跨droppable中拖动
    if (source.droppableId !== destination.droppableId) {
      const sourceIndex = stageLane.findIndex(item => item.stageId === source.droppableId);
      const destinationIndex = stageLane.findIndex(
        item => item.stageId === destination.droppableId
      );
      const {
        stageDescription: sourceDescription,
        stageId: fromStageId,
        stageCode: fromStageCode,
      } = stageLane[sourceIndex]; // 起始阶段
      const {
        stageId: toStageId,
        stageCode: destinationCode,
        stageDescription: destinationDescription,
      } = stageLane[destinationIndex]; // 目标阶段
      let gradeType = 'NO';

      // 校验升级 or 降级
      const isUpgrade =
        stageLane[sourceIndex].stageCode === 'ELIMINATED' ? true : destinationIndex > sourceIndex;
      const isDegrade = stageLane[destinationIndex].stageCode === 'ELIMINATED';

      gradeType = isDegrade ? 'DEGRADE' : isUpgrade ? 'UPGRADE' : 'DEGRADE';

      const sourceSupplier = stageLane[sourceIndex]; // 起始阶段供应商列表
      const destinationSupplier = stageLane[destinationIndex]; // 目标阶段供应商列表

      const { stageId } = sourceSupplier;
      const {
        checkDegradeFlag,
        checkDegradeStageList,
        checkUpgradeFlag,
        checkUpgradeStageList,
      } = destinationSupplier;

      // 当前供应商
      const supplier = sourceSupplier.stageLifeCycles.content.find(
        item => toString(item.supplierCompanyId) === draggableId
      );
      if (isNil(supplier)) {
        return;
      }
      const {
        tenantId,
        companyId,
        supplierTenantId,
        supplierCompanyId: newSupplierCompanyId,
        foreverBlacklistFlag,
        companyName,
      } = supplier || {};
      // srm-118670 永久黑名单不允许拖动
      if (foreverBlacklistFlag) {
        if (gradeType === 'UPGRADE') {
          notification.warning({
            message: `${intl
              .get('sslm.supplierLifeManage.view.message.foreverBlacklist', {
                name: companyName,
              })
              .d(`供应商【${companyName}】为永久黑名单供应商，不可升级至其他生命周期阶段`)}`,
          });
        }
        if (gradeType === 'DEGRADE') {
          notification.warning({
            message: `${intl
              .get('sslm.supplierLifeManage.view.message.foreverBlacklistDegrade', {
                name: companyName,
              })
              .d(`供应商【${companyName}】为永久黑名单供应商，不可降级至其他生命周期阶段`)}`,
          });
        }
        return;
      }
      // 第三方校验失败不允许拖动
      let validateFlag = false;
      const thirdPayload = {
        tenantId,
        companyId,
        supplierTenantId,
        supplierCompanyId: newSupplierCompanyId,
        fromStageId,
        fromStageCode,
        toStageId,
        toStageCode: destinationCode,
        supplierCompanyName: companyName,
      };
      await dispatch({
        type: 'supplierLifeManage/isValidation',
        payload: thirdPayload,
      }).then(res => {
        if (res) {
          validateFlag = true;
        }
      });

      if (!validateFlag) {
        return;
      }

      if (checkUpgradeFlag && gradeType === 'UPGRADE') {
        if (
          (checkUpgradeStageList && !checkUpgradeStageList.includes(toString(stageId))) ||
          !checkUpgradeStageList
        ) {
          notification.warning({
            message: `${sourceDescription}${intl
              .get('sslm.supplierLifeManage.view.message.notAllowUpgradeToPhase', {
                name: destinationDescription,
              })
              .d(`阶段供应商不可升级至${destinationDescription}阶段`)}`,
          });
          return;
        }
      }
      if (checkDegradeFlag && gradeType === 'DEGRADE') {
        if (
          (checkDegradeStageList && !checkDegradeStageList.includes(toString(stageId))) ||
          !checkDegradeStageList
        ) {
          notification.warning({
            message: `${sourceDescription}${intl
              .get('sslm.supplierLifeManage.view.message.notAllowDegradeToPhase', {
                name: destinationDescription,
              })
              .d(`阶段供应商不可降级至${destinationDescription}阶段`)}`,
          });
          return;
        }
      }
      const index = sourceSupplier.stageLifeCycles.content.findIndex(
        item => toString(item.supplierCompanyId) === draggableId
      );
      const currentInfo = {
        ...supplier,
        configId,
        gradeType,
        toStageId,
        destinationCode,
        destinationDescription,
        upgradeEditPath:
          gradeType === 'UPGRADE' ? stageLane[destinationIndex].upgradeEditPath : null,
        degradeEditPath:
          gradeType === 'DEGRADE' ? stageLane[destinationIndex].degradeEditPath : null,
      };
      const newSuplier = [
        ...sourceSupplier.stageLifeCycles.content.slice(0, index),
        { ...currentInfo },
        ...sourceSupplier.stageLifeCycles.content.slice(index + 1),
      ];
      const flag = await supplierLifeRemote.event.fireEvent('cuxDragEnd', {
        ...thirdPayload,
      });
      if (!flag) {
        return;
      }

      dispatch({
        type: 'supplierLifeManage/updateState',
        payload: {
          stageLane: [
            ...stageLane.slice(0, sourceIndex),
            {
              ...sourceSupplier,
              stageLifeCycles: {
                ...sourceSupplier.stageLifeCycles,
                content: [...newSuplier],
              },
            },
            ...stageLane.slice(sourceIndex + 1),
          ],
        },
      });

      const { lifeCycleId, supplierCompanyId } = currentInfo;
      const queryParams = {
        toStageId,
        lifeCycleId,
        supplierCompanyId,
      };
      const dimensionPath =
        currentInfo.gradeType !== 'NO'
          ? currentInfo[`${currentInfo.gradeType.toLowerCase()}EditPath`]
          : '';
      this.redirectForm(queryParams, dimensionPath);
    }
  }

  /**
   * 不同生命周期分页数据查询
   * @param {String} stageCode - 生命周期阶段编码
   * @param {number} current - 页码
   * @param {number} size - 每页条数
   */
  handleStagePageSearch(stageCode, current, pageSize) {
    const page = {
      current,
      pageSize,
    };
    this.handleSearch({ page, stageId: stageCode });
  }

  /**
   * 查看特定阶段申请单
   * @param {string} stageId 阶段Id
   */
  @Bind()
  handleGoToDetail(stageId) {
    deleteCache('/sslm/supplier-life-manage/stage');
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supplier-life-manage/stage/${stageId}`,
      })
    );
  }

  /**
   * 设置form对象
   * @param {object} ref - FilterForm子组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询当前租户下子公司数量，若只有一个则为默认
   * @param {*} defaultQuery 是否默认查询
   */
  @Bind()
  querySubsidiary(defaultQuery) {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierLifeManage/querySubsidiary',
    }).then(res => {
      if (res) {
        const { content } = res;
        if (content.length === 1 && this.form) {
          const company = head(content);
          this.form.setFieldsValue({
            companyId: company.companyId,
            companyName: company.companyName,
          });
          this.handleSearch();
          return;
        }
        if (defaultQuery) this.handleSearch();
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { initInfo, dimensionCode } = this.state;
    const { supplierLifeManage, loading, customizeFilterForm, supplierLifeRemote } = this.props;
    const { stageLane = [], dimensionList = [] } = supplierLifeManage;
    const filterProps = {
      initInfo,
      dimensionList,
      supplierLifeRemote,
      currentDimensionCode: dimensionCode,
      customizeFilterForm,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      onSubsidiary: this.querySubsidiary,
    };

    return (
      <Fragment>
        <Header
          title={intl.get('sslm.supplierLifeManage.view.message.title').d('供应商生命周期管理')}
        />
        <Content>
          <div className="more-fields-search-form">
            <FilterForm {...filterProps} />
          </div>
          <Spin spinning={loading || false}>
            <div className={classNames(styles['supplier-content'])}>
              <DragDropContext
                // onDragStart={this.onDragStart.bind(this)}
                // onDragUpdate={this.onDragUpdate.bind(this)}
                onDragEnd={this.onDragEnd.bind(this)}
              >
                {(stageLane || []).map(stage => (
                  <div className={classNames(styles['droppable-content'])} key={stage?.stageId}>
                    <Droppable droppableId={stage?.stageId}>
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          // style={{
                          //   background: snapshot.isDraggingOver ? '#F8F8F8' : '#F8F8F8',
                          // }}
                          {...provided.droppableProps}
                          className={classNames(styles['droppable-section'])}
                        >
                          <div className={classNames(styles['droppable-top'])}>
                            <span className={classNames(styles['droppable-top-title'])}>
                              {stage?.stageDescription}
                            </span>
                            <a
                              className={classNames(styles['droppable-top-link'])}
                              onClick={() => this.handleGoToDetail(stage?.stageId)}
                            >
                              {intl
                                .get('sslm.supplierLifeManage.view.message.search')
                                .d('查看申请单')}
                            </a>
                          </div>
                          <div
                            className={classNames(styles['droppable-middle'])}
                            id={`draggableWrapper${stage?.stageId}`}
                          >
                            {(stage?.stageLifeCycles.content || []).map((item, index) => (
                              <Draggable
                                draggableId={toString(item.supplierCompanyId)}
                                index={index}
                                key={item.supplierCompanyId}
                                isDragDisabled={item.gradeType !== 'NO'}
                              >
                                {(pro, snap) => (
                                  <div
                                    ref={pro.innerRef}
                                    {...pro.draggableProps}
                                    {...pro.dragHandleProps}
                                    style={this.getItemStyle(
                                      snap.isDragging,
                                      pro.draggableProps.style
                                    )}
                                    className={classNames(styles['droppable-draggable'])}
                                  >
                                    {item.gradeType === 'NO' && (
                                      <span className={classNames(styles['droppable-flag'])}>
                                        <span />
                                      </span>
                                    )}
                                    <a
                                      className={classNames(styles['droppable-draggable-link'])}
                                      onClick={() => handleSupplierDetail(item, true)}
                                    >
                                      {item.companyNum}
                                    </a>
                                    <br />
                                    <span
                                      className={classNames(styles['droppable-draggable-name'])}
                                    >
                                      {item.companyName}
                                    </span>
                                    {item.gradeType === 'UPGRADE' ? (
                                      <a
                                        onClick={() => {
                                          const {
                                            lifeCycleId,
                                            supplierCompanyId,
                                            gradeType,
                                          } = item;
                                          const dimensionPath =
                                            gradeType !== 'NO'
                                              ? item[
                                                  `${gradeType.toLowerCase()}${
                                                    item.editPageFlag ? 'EditPath' : 'ReadPath'
                                                  }`
                                                ]
                                              : '';
                                          const queryParams = {
                                            lifeCycleId,
                                            supplierCompanyId,
                                          };
                                          this.redirectForm(queryParams, dimensionPath);
                                        }}
                                      >
                                        <Tooltip
                                          placement="top"
                                          title={intl
                                            .get('sslm.supplierLifeManage.view.message.upgrade')
                                            .d('查看升级申请单')}
                                        >
                                          <Icon
                                            type="arrow-up"
                                            className={classNames(
                                              styles['upgrade-icon'],
                                              styles['icon-common']
                                            )}
                                          />
                                        </Tooltip>
                                      </a>
                                    ) : item.gradeType === 'DEGRADE' ? (
                                      <a
                                        onClick={() => {
                                          const {
                                            lifeCycleId,
                                            supplierCompanyId,
                                            gradeType,
                                          } = item;
                                          const dimensionPath =
                                            gradeType !== 'NO'
                                              ? item[`${gradeType.toLowerCase()}EditPath`]
                                              : '';
                                          const queryParams = {
                                            lifeCycleId,
                                            supplierCompanyId,
                                          };
                                          this.redirectForm(queryParams, dimensionPath);
                                        }}
                                      >
                                        <Tooltip
                                          placement="top"
                                          title={intl
                                            .get('sslm.supplierLifeManage.view.message.degrade')
                                            .d('查看降级申请单')}
                                        >
                                          <Icon
                                            type="arrow-down"
                                            className={classNames(
                                              styles['down-icon'],
                                              styles['icon-common']
                                            )}
                                          />
                                        </Tooltip>
                                      </a>
                                    ) : (
                                      <span />
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                          <div className={classNames(styles['droppable-bottom'])}>
                            {(stage?.stageLifeCycles.content || []).length === 0 ? (
                              <div style={{ height: 24 }} />
                            ) : (
                              <Pagination
                                showSizeChanger
                                size="small"
                                total={stage?.stageLifeCycles.totalElements}
                                current={stage?.stageLifeCycles.number + 1}
                                onChange={(current, pageSize) =>
                                  this.handleStagePageSearch(stage?.stageId, current, pageSize)
                                }
                                onShowSizeChange={(current, pageSize) =>
                                  this.handleStagePageSearch(stage?.stageId, current, pageSize)
                                }
                                pageSizeOptions={['10', '20', '50', '100']}
                                showTotal={(total, range) =>
                                  intl.get('hzero.common.pagination.total', {
                                    range1: range[0],
                                    range2: range[1],
                                    total,
                                  })
                                }
                                className={classNames(styles['droppable-pagination'])}
                              />
                            )}
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </DragDropContext>
            </div>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
