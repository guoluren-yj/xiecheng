/* eslint-disable global-require */
/**
 * bidEventQuery - -招标事件查询-预审-定标查看
 * @date: 2020-05-25
 * @author: lvshuo <shuo.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Collapse, Icon, Tabs, Tooltip, Tag, Spin, Modal, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, FORM_COL_2_LAYOUT } from 'utils/constants';
import { map, difference } from 'lodash';
import intl from 'utils/intl';
import { numberSeparatorRender, phoneRender } from '@/utils/renderer';
import ItemPackLineTable from './ItemPackLineTable';
import styles from './index.less';
import SupplierTable from './SupplierTable';
import ItemNoneDetailsList from './ItemNoneDetailsList';
import History from './History';

const { Panel } = Collapse;
class Calibration extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loadingObj: {}, // 展开时重新调用单独查询投标物料行列表数据loading
      expand: {}, // 展开数据
      activeKey: 'supplierLine', // 供应商维度/物料维度的tab标识
      isShow: {},
      collapseActiveKey: [], // tab下的展开key数组
      supplierCompanyId: undefined, // 最后一次展开的行id
    };
  }

  renderFormContent(dataSource = {}) {
    const { UEDDisplayFormItem } = this.props;
    return (
      <Form className="read-row-custom">
        <Row type="flex" justify="start" gutter={48} className="read-row-custom">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.common.company').d('公司')}
              value={dataSource.companyName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别')}
              value={dataSource.sourceCategoryMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式')}
              value={dataSource.sourceMethodMeaning}
            />
          </Col>
        </Row>
        <Row type="flex" justify="start" gutter={48} className="read-row-custom">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.qualiExam.model.qualiExam.maxBidNumber').d('最大中标数')}
              value={dataSource.maxBidNumber}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.calibrationRemark`).d('定标备注')}
              value={dataSource.bidEvaluationRemark}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  renderPrequalHeader() {
    const { header = {}, CalibrationCollapseKeys = [] } = this.props;
    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>
              {header.bidNum}
              {header.bidTitle ? `-${header.bidTitle}` : null}
            </h3>
            <a>
              {CalibrationCollapseKeys.includes('calibrationHeader')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={CalibrationCollapseKeys.includes('calibrationHeader') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="calibrationHeader"
      >
        {this.renderFormContent(header)}
      </Panel>
    );
  }

  /**
   * 浮动文字tabs
   */
  @Bind()
  renderTooTipTabs = (item) => {
    return (
      <Tooltip title={`${item.sectionNum}--${item.sectionName}`} placement="topLeft">
        {item.sectionName}
      </Tooltip>
    );
  };

  /**
   *展开时重新调用单独查询供应商维度-物料行列表数据-区分标段
   */
  expandSupplierItemLine = (e, quotationHeaderId, item) => {
    const { dispatch, organizationId, modelName = 'bidEventQuery' } = this.props;
    e.stopPropagation();
    const { expand } = this.state;
    const currentStatus = expand[`${item.bidLineItemId}#${quotationHeaderId}`];
    if (!currentStatus) {
      const loadingObj = {
        [quotationHeaderId]: { queryCalibrationLoading: true },
      };
      this.setState({ loadingObj });
      // 查询供应商投标物料行
      dispatch({
        type: `${modelName}/fetchCalibrationQuotation`,
        payload: {
          page: {},
          organizationId,
          sectionId: item.bidLineItemId,
          supplierCompanyId: item.supplierCompanyId,
          subjectMatterRule: item.subjectMatterRule,
          quotationHeaderId,
          bidHeaderId: item.bidHeaderId,
          customizeUnitCode: 'SSRC.BID_EVENT_DETAIL.TAB_PACK',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            loadingObj: { [quotationHeaderId]: { queryCalibrationLoading: false } },
          });
        }
      });
    }
    this.setState({
      expand: {
        ...expand,
        [`${item.bidLineItemId}#${item.quotationHeaderId}`]: !expand[
          `${item.bidLineItemId}#${item.quotationHeaderId}`
        ],
      },
    });
  };

  /**
   * 点击头标签-停止折叠面板冒泡行为
   */
  @Bind()
  rfxLineTag(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  /**
   * 获取分页物品维度
   *
   * @memberof search
   */
  @Bind()
  changePage(page = {}, quotationHeaderId, item) {
    const { dispatch, organizationId, modelName = 'bidEventQuery' } = this.props;
    // 查询供应商投标物料行
    dispatch({
      type: `${modelName}/fetchCalibrationQuotation`,
      payload: {
        page,
        organizationId,
        quotationHeaderId,
        sectionId: item.bidLineItemId,
        supplierCompanyId: item.supplierCompanyId,
        subjectMatterRule: item.subjectMatterRule,
        customizeUnitCode: 'SSRC.BID_EVENT_DETAIL.TAB_PACK',
      },
    }).then((res) => {
      if (res) {
        this.setState({ loadingObj: { [quotationHeaderId]: { queryCalibrationLoading: false } } });
      }
    });
  }

  /**
   * 分标段-供应商头部
   */
  @Bind()
  renderPackSupplierHeaderInfo(item) {
    const { expand } = this.state;
    const {
      showUploadModal,
      header: { bidStatus = '' },
    } = this.props;
    return (
      <div className={styles.itemList}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <span className={styles.itemListNum}>
              <span>
                <img src={require('@/assets/supplier.svg')} alt="" />
              </span>
              <span className={styles.itemListNumLeft}>
                <Tooltip
                  title={`${item.supplierCompanyNum}--${item.supplierCompanyName}`}
                  placement="topLeft"
                >
                  {item.supplierCompanyNum ? `${item.supplierCompanyNum}-` : null}
                  {item.supplierCompanyName}
                </Tooltip>
              </span>
              <span className={styles.itemListNumRight}>
                <Icon
                  style={{ marginTop: '10px', color: 'rgba(41, 190, 206, 1)' }}
                  type={!expand[`${item.bidLineItemId}#${item.quotationHeaderId}`] ? 'down' : 'up'}
                  onClick={(e) => this.expandSupplierItemLine(e, item.quotationHeaderId, item)}
                />
              </span>
            </span>
            {item.sumScore ? (
              <Tag className={styles.sumScore}>
                {intl.get(`ssrc.bidEventQuery.model.bidHall.sumScore`).d('总分')}：{item.sumScore}
              </Tag>
            ) : (
              <span style={{ width: '80px', display: 'inline-block' }} />
            )}
            {bidStatus === 'FINISHED' && item.sumPrice ? (
              <Tag className={styles.sumPrice}>
                {intl.get(`ssrc.bidHall.model.bidHall.sumPrice`).d('投标总价')}：
                {numberSeparatorRender(item.sumPrice)}
              </Tag>
            ) : (
              <span style={{ width: '100px', display: 'inline-block' }} />
            )}
            <span style={{ marginLeft: 50 }}>{item.contactName}</span>
            <span style={{ marginLeft: 15 }}>
              {phoneRender(item.internationalTelCodeMeaning, item.contactMobilephone)}
            </span>
            <span style={{ marginLeft: 15 }}>{item.contactMail}</span>
            {bidStatus === 'FINISHED' &&
            (item.validBusinessAttachmentUuid || item.validTechAttachmentUuid) ? (
              <span onClick={(e) => this.rfxLineTag(e)} style={{ float: 'right' }}>
                <a
                  onClick={() =>
                    showUploadModal(item.validBusinessAttachmentUuid, item.validTechAttachmentUuid)
                  }
                >
                  <span>{intl.get(`ssrc.bidEventQuery.model.bidHall.attachment`).d('附件')}</span>
                  <span style={{ marginLeft: '7px' }}>
                    <img src={require('@/assets/file.svg')} alt="" />
                  </span>
                </a>
              </span>
            ) : null}
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }

  /**
   * 渲染区分标段-供应商维度
   *
   */
  @Bind()
  renderSupplier(supplier) {
    const { expand, loadingObj = {} } = this.state;
    const {
      customizeTable,
      bidEventQuery: { calibQuotationList = [] },
      header = {},
    } = this.props;
    const itemLineBidTableProps = {
      header,
      calibQuotationList,
      loadingObj,
      customizeTable,
      onSearch: this.changePage,
      handleQuotationDetail: this.handleQuotationDetail,
      fetchQuotationDetail: this.fetchQuotationDetail,
    };
    return (
      <div>
        {map(supplier.lineSupplierDTOS, (item) => {
          return (
            <div>
              <div
                onClick={(e) => this.expandSupplierItemLine(e, item.quotationHeaderId, item)}
                className={styles.arrowStyle}
              >
                {this.renderPackSupplierHeaderInfo(item)}
              </div>
              <div>
                {expand[`${item.bidLineItemId}#${item.quotationHeaderId}`] && (
                  <ItemPackLineTable
                    {...itemLineBidTableProps}
                    item
                    quotationHeaderId={item.quotationHeaderId}
                    sectionId={item.bidLineItemId}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /**
   * 渲染标段tabs-区分标段
   */
  @Bind()
  renderTabs() {
    const { LinePackList = [] } = this.props;
    return (
      <div>
        <Tabs animated={false}>
          {/* 循环标段数据,渲染tabs标段 */}
          {map(LinePackList, (item) => {
            return (
              <Tabs.TabPane tab={this.renderTooTipTabs(item)} key={[item.sectionId]}>
                {this.renderSupplier(item)}
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }

  /**
   *展开时重新调用单独查询物品明细列表数据-不区分标段
   */
  expandItemLine = (e, bidLineItemId) => {
    const { modelName = 'bidEventQuery' } = this.props;
    // e.stopPropagation();
    const { itemContentChange } = this.props.bidEventQuery;
    const { expand } = this.state;
    const currentStatus = expand[bidLineItemId];
    if (!currentStatus) {
      const loadingObj = {
        [bidLineItemId]: { fetchAloneItemLineLoading: true },
      };
      this.setState({ loadingObj });
      const {
        match: { params },
        dispatch,
        organizationId,
      } = this.props;
      dispatch({
        type: `${modelName}/fetchAloneItemLine`,
        payload: {
          page: {},
          organizationId,
          bidHeaderId: params.bidId,
          bidLineItemId,
          customizeUnitCode: 'SSRC.BID_EVENT_DETAIL.TAB_ITEM',
        },
      }).then(() => {
        this.setState({ loadingObj: { [bidLineItemId]: { fetchAloneItemLineLoading: false } } });
      });
    } else {
      const {
        bidEventQuery: { aloneItemLine = {} },
      } = this.props;
      const dataSource = aloneItemLine[`${bidLineItemId}`]?.list;
      // 获取接口数据中的行ID作为rowKeys
      const quotationLineIdMap = dataSource?.map((item) => {
        return item.quotationLineId;
      });
      const differenceKeys = difference(this.state.itemLineSelectedRowKeys, quotationLineIdMap);
      this.setState({ itemLineSelectedRowKeys: differenceKeys });
    }

    // 有值改变时,关闭时,改变的数据设置为false
    if (this.props.bidEventQuery.itemContentChange[bidLineItemId]) {
      this.props.dispatch({
        type: `${modelName}/updateState`,
        payload: {
          // itemLineChange: true,
          itemContentChange: {
            ...itemContentChange,
            [bidLineItemId]: false,
          },
        },
      });
    } else {
      this.props.dispatch({
        type: `${modelName}/updateState`,
        payload: {
          itemContentChange: {
            ...itemContentChange,
            [bidLineItemId]: false,
          },
        },
      });
    }
    this.setState({
      expand: {
        ...expand,
        [bidLineItemId]: !expand[bidLineItemId],
      },
    });
  };

  /**
   * 物料维度头部明细
   */
  @Bind()
  renderHeaderInfo(item) {
    const { expand } = this.state;
    return (
      <div className={styles.itemList} onClick={(e) => this.expandItemLine(e, item.bidLineItemId)}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <span className={styles.itemListNum}>
              <span>
                <img src={require('@/assets/supplier.svg')} alt="" />
              </span>
              <span className={styles.itemListNumLeft}>
                <Tooltip
                  title={
                    item.itemCode !== null
                      ? `${item.itemCode}--${item.itemName}`
                      : `${item.itemName}`
                  }
                  placement="topLeft"
                >
                  {item.itemCode !== null ? `${item.itemCode}-` : null}
                  {item.itemName}
                </Tooltip>
              </span>
              <span className={styles.itemListNumRight}>
                <Icon
                  style={{ marginTop: '10px', color: 'rgba(41, 190, 206, 1)' }}
                  type={!expand[item.bidLineItemId] ? 'down' : 'up'}
                  onClick={(e) => this.expandItemLine(e, item.bidLineItemId)}
                />
              </span>
            </span>
            <span>
              {intl.get(`ssrc.bidEventQuery.model.bidHall.bidLineItemNum`).d('行号')}
              {item.bidLineItemNum}
            </span>
            {item.taxRate ? (
              <span className={styles.taxRate}>
                {intl.get(`ssrc.bidEventQuery.model.bidHall.taxRate`).d('税率')}
                {item.taxRate}%
              </span>
            ) : (
              <span style={{ width: '50px', display: 'inline-block' }} />
            )}
            {item.bidQuantity ? (
              <Tag className={styles.bidQuantity}>
                {intl.get(`ssrc.bidEventQuery.model.bidHall.bidQuantity(uomName)`).d('需求数量')}
                {numberSeparatorRender(item.bidQuantity)}
                {item.uomName}
              </Tag>
            ) : (
              <span style={{ width: '80px', display: 'inline-block' }} />
            )}
            {item.itemCategoryName && (
              <Tag className={styles.categoryName}>{item.itemCategoryName}</Tag>
            )}
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }

  /**
   * 供应商维度头部-不区分标段
   */
  @Bind()
  renderSupplierHeaderInfo(item) {
    const { expand } = this.state;
    const {
      showUploadModal,
      header: { bidStatus = '' },
    } = this.props;
    const flag = bidStatus === 'FINISHED';
    const scoreName = intl.get(`ssrc.bidHall.model.bidHall.scoreName`).d('总分');
    const sumPrice = intl.get(`ssrc.bidHall.model.bidHall.sumPrice`).d('投标总价');
    const candidate = intl.get(`ssrc.bidHall.model.bidHall.candidate`).d('候选人');

    return (
      <div
        className={classnames(styles.itemList, {
          'invalid-item': !!item.invalidFlag,
        })}
        onClick={() => this.expandSupplier(item.supplierCompanyId)}
      >
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '100%' }}>
            <span className={styles.itemListNum}>
              <span>
                {item.invalidFlag ? (
                  <img src={require('@/assets/supplier-gray.svg')} alt="" />
                ) : (
                  <img src={require('@/assets/supplier.svg')} alt="" />
                )}
              </span>
              <span className={styles.itemListNumLeft}>
                <Tooltip
                  title={`${item.supplierCompanyNum}-${item.supplierCompanyName}`}
                  placement="topLeft"
                >
                  {item.supplierCompanyNum ? `${item.supplierCompanyNum}-` : null}
                  {item.supplierCompanyName}
                </Tooltip>
              </span>
              <span className={styles.itemListNumRight}>
                <Icon
                  style={{
                    marginTop: '10px',
                    color: item.invalidFlag ? 'rgba(0, 0, 0, 0.25)' : 'rgba(41, 190, 206, 1)',
                  }}
                  type={!expand[item.supplierCompanyId] ? 'down' : 'up'}
                  onClick={() => this.expandSupplier(item.supplierCompanyId)}
                />
              </span>
            </span>
            {item.sumScore ? (
              <span>
                <Tag
                  style={{
                    background: item.invalidFlag ? null : 'rgba(241, 49, 49, 0.2)',
                    border: '0',
                    color: item.invalidFlag ? 'rgba(0, 0, 0, 0.25)' : '#F13131',
                  }}
                >
                  {scoreName}
                  {item.sumScore}
                </Tag>
              </span>
            ) : (
              <span />
            )}
            {flag && item.sumPrice ? (
              <Tag
                style={{
                  background: item.invalidFlag ? null : 'rgba(255, 188, 0, 0.2)',
                  border: '0',
                  color: item.invalidFlag ? 'rgba(0, 0, 0, 0.25)' : '#FFBC00',
                }}
              >
                <Popover
                  className={styles.itemListTag}
                  content={numberSeparatorRender(item.sumPrice)}
                >
                  {sumPrice}
                  {numberSeparatorRender(item.sumPrice)}
                </Popover>
              </Tag>
            ) : (
              <span />
            )}
            <span
              style={{
                marginRight: '8px',
                marginLeft: '8px',
                width: '80px',
              }}
            >
              {item.candidateFlag === 1 ? (
                <Popover placement="topLeft" content={item.candidateSuggestion}>
                  <span>
                    <img src={require('@/assets/candidate.svg')} alt="" />
                    <span className={styles.allottedRatio}>{candidate}</span>
                  </span>
                </Popover>
              ) : (
                ''
              )}
              {item.invalidFlag ? (
                <span style={{ color: 'rgba(0, 0, 0, 0.25)' }}>
                  {intl.get('ssrc.common.view.status.invalid').d('无效')}
                </span>
              ) : null}
            </span>
            {item.contactName ? (
              <Tooltip title={`${item.contactName}`} placement="topLeft">
                <span className={`${styles.contactNameStyle} ${!flag ? styles.moreWidth : ''}`}>
                  {item.contactName}
                </span>
              </Tooltip>
            ) : (
              <span style={{ marginRight: '5px' }} />
            )}
            {item.contactMobilephone ? (
              <Tooltip
                title={phoneRender(item.internationalTelCodeMeaning, item.contactMobilephone)}
                placement="topLeft"
              >
                <span className={styles.contactMobilephoneStyle}>
                  {phoneRender(item.internationalTelCodeMeaning, item.contactMobilephone)}
                </span>
              </Tooltip>
            ) : (
              <span style={{ marginRight: '5px' }} />
            )}
            {item.contactMail ? (
              <Tooltip title={`${item.contactMail}`} placement="topLeft">
                <span className={`${styles.contactMailStyle} ${!flag ? styles.moreWidth : ''}`}>
                  {item.contactMail}
                </span>
              </Tooltip>
            ) : (
              <span style={{ marginRight: '5px' }} />
            )}
            {flag && (item.validBusinessAttachmentUuid || item.validTechAttachmentUuid) ? (
              <div onClick={(e) => this.rfxLineTag(e)}>
                <a
                  onClick={() =>
                    showUploadModal(item.validBusinessAttachmentUuid, item.validTechAttachmentUuid)
                  }
                >
                  <div className={styles.attachment}>
                    <div>{intl.get('hzero.common.upload.modal.title').d('附件')}</div>
                    <div style={{ marginLeft: '7px' }}>
                      <img src={require('@/assets/file.svg')} alt="" />
                    </div>
                  </div>
                </a>
              </div>
            ) : (
              <span />
            )}
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }

  /**
   * 切换供应商维度/物料维度tab
   */
  @Bind()
  changeTabs(key) {
    const { dispatch } = this.props;
    const { modelName = 'bidEventQuery' } = this.props;
    const {
      bidEventQuery: { allLineChange, itemContentChange, supplierContentChange },
    } = this.props;
    const itemContentChangeValues = Object.values(itemContentChange).find((n) => n === true);
    const supplierContentChangeValue = Object.values(supplierContentChange).find((n) => n === true);
    // 物料行key变化;
    if (allLineChange || itemContentChangeValues === true || supplierContentChangeValue === true) {
      if (itemContentChangeValues === true) {
        // 物料行
        Modal.confirm({
          title: intl
            .get(`ssrc.bidEventQuery.view.message.confirm.itemDetailsData`)
            .d('请保存物料行页面数据'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
          cancelText: intl
            .get(`ssrc.bidEventQuery.view.message.button.continueToJump`)
            .d('继续跳转'),
          onOk: () => {
            this.setState({ activeKey: 'itemLine' });
          },
          onCancel: () => {
            this.props.form.resetFields();
            this.itemLineList.props.form.resetFields();
            this.expandSupplier();
            this.setState({
              activeKey: key,
              expand: {},
              isShow: {},
              collapseActiveKey: [],
            });
            // 清空当前tab页物料行数据
            dispatch({
              type: `${modelName}/updateState`,
              payload: {
                aloneItemLine: {},
                itemContentChange: {},
                itemLineChange: false,
              },
            });
          },
        });
      }
      if (supplierContentChangeValue === true) {
        // 供应商行
        Modal.confirm({
          title: intl
            .get(`ssrc.bidEventQuery.view.message.confirm.supplierLineData`)
            .d('请保存供应商行页面数据'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
          cancelText: intl
            .get(`ssrc.bidEventQuery.view.message.button.continueToJump`)
            .d('继续跳转'),
          onOk: () => {
            this.setState({ activeKey: 'supplierLine' });
          },
          onCancel: () => {
            this.props.form.resetFields();
            this.supplierLineList.props.form.resetFields();
            this.setState({
              activeKey: key,
              expand: {},
              isShow: {},
              collapseActiveKey: [],
            });
            // 清空当前tab页供应商行数据
            dispatch({
              type: `${modelName}/updateState`,
              payload: {
                aloneSupplierItemLine: {},
                supplierLineChange: false,
                supplierContentChange: {},
              },
            });
          },
        });
      }
    } else {
      this.setState({
        activeKey: key,
        collapseActiveKey: [],
        expand: {},
        isShow: {},
      });
    }
  }

  /**
   * 物料明细列表content切换分页时，先保存数据
   */
  @Bind()
  changeItemLinePage(page, bidLineItemId) {
    // 判断当前table是否改变
    const {
      match: { params },
      dispatch,
      modelName = 'bidEventQuery',
      organizationId,
    } = this.props;
    dispatch({
      type: `${modelName}/fetchAloneItemLine`,
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
        bidLineItemId,
        customizeUnitCode: 'SSRC.BID_EVENT_DETAIL.TAB_ITEM',
      },
    });
  }

  /**
   * 供应商明细列表content切换分页时，先保存数据
   */
  @Bind()
  changeSupplierLinePage(page, supplierCompanyId) {
    // 判断当前table是否改变
    const {
      match: { params },
      dispatch,
      organizationId,
      modelName = 'bidEventQuery',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchAloneSupplierItemLine`,
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
        supplierCompanyId,
        customizeUnitCode: 'SSRC.BID_HALL_DETAIL.TAB_SUPPLIER_READ',
      },
    });
  }

  /**
   *展开时重新调用单独查询供应商明细列表数据-不区分标段
   */
  expandSupplier = (key) => {
    // debugger
    const supplierCompanyId = key;
    const { expand, isShow } = this.state;
    const currentStatus = isShow[supplierCompanyId];
    if (!currentStatus) {
      const loadingObj = {
        [supplierCompanyId]: { fetchAloneSupplierItemLineLoading: true },
      };
      this.setState({ loadingObj });
      const {
        match: { params },
        dispatch,
        organizationId,
        modelName = 'bidEventQuery',
      } = this.props;
      dispatch({
        type: `${modelName}/fetchAloneSupplierItemLine`,
        payload: {
          page: {},
          organizationId,
          bidHeaderId: params.bidId,
          supplierCompanyId,
          customizeUnitCode: 'SSRC.BID_HALL_DETAIL.TAB_SUPPLIER_READ',
        },
      }).then(() => {
        this.setState({
          loadingObj: { [supplierCompanyId]: { fetchAloneSupplierItemLineLoading: false } },
        });
      });
    }
    this.setState({
      expand: {
        ...expand,
        [supplierCompanyId]: !expand[supplierCompanyId],
      },
      isShow: {
        ...isShow,
        [supplierCompanyId]: true,
      },
      supplierCompanyId,
    });
  };

  /**
   * 供应商维度/物料维度的折叠面板onChange
   */
  @Bind()
  onChangeSupplier = (key) => {
    this.setState({ collapseActiveKey: key });
  };

  renderPrequalSupplier() {
    const {
      CalibrationCollapseKeys = [],
      source,
      supplierDimensionHeaderList,
      LineNoneList,
      customizeTable,
      dispatch,
      organizationId,
      header,
      match,
      form,
      fetchQuotationDetail,
      bidEventQuery: {
        aloneSupplierItemLine = {}, // 不区分标段-供应商维度行列表
        aloneItemLine = {}, // 招标事件查询：根据物料头id获取物料明细列表
        itemContentChange,
      },
    } = this.props;
    const { activeKey, collapseActiveKey, supplierCompanyId, loadingObj } = this.state;

    // 供应商
    const SupplierLineTableProps = {
      dataSource: aloneSupplierItemLine,
      dispatch,
      organizationId,
      match,
      header,
      customizeTable,
      supplierCompanyId,
      onSearch: this.changeSupplierLinePage,
      loadingObj,
      fetchQuotationDetail,
      onRef: (node) => {
        this.supplierLineList = node;
      },
    };
    // 物料维度-行信息不分标段
    const itemDimensionProps = {
      header,
      form,
      loadingObj,
      customizeTable,
      organizationId,
      itemContentChange,
      dataSource: aloneItemLine,
      headerList: LineNoneList,
      onSearch: this.changeItemLinePage,
      fetchQuotationDetail,
      onRef: (node) => {
        this.itemLineList = node;
      },
    };
    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>{intl.get('ssrc.bidHall.model.bidHall.calibrationDetails').d('定标详情')}</h3>
            <a>
              {CalibrationCollapseKeys.includes('calibrationDetail')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={CalibrationCollapseKeys.includes('calibrationDetail') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="calibrationDetail"
      >
        {source === 'PACK' && <div style={{ marginTop: '24px' }}>{this.renderTabs()}</div>}
        {source === 'NONE' && (
          <Tabs
            defaultActiveKey="supplierLine"
            activeKey={activeKey}
            onChange={this.changeTabs}
            animated={false}
            className={styles.tabStyle}
          >
            <Tabs.TabPane
              tab={intl.get(`ssrc.bidHall.view.message.tab.supplierDimension`).d('供应商维度')}
              key="supplierLine"
            >
              <Spin spinning={false}>
                <Collapse
                  bordered={false}
                  onChange={this.onChangeSupplier}
                  activeKey={collapseActiveKey}
                >
                  {supplierDimensionHeaderList &&
                    supplierDimensionHeaderList.map((item) => (
                      <Panel
                        header={this.renderSupplierHeaderInfo(item)}
                        key={item.supplierCompanyId}
                        className={styles['header-info']}
                        showArrow={false}
                      >
                        <SupplierTable
                          {...SupplierLineTableProps}
                          itemHeaderData={item}
                          supplierCompanyId={item.supplierCompanyId}
                        />
                      </Panel>
                    ))}
                </Collapse>
              </Spin>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`ssrc.bidEventQuery.view.message.tab.itemDimension`).d('物料维度')}
              key="itemLine"
            >
              <Spin spinning={false}>
                <Collapse
                  bordered={false}
                  onChange={this.onChangeSupplier}
                  activeKey={collapseActiveKey}
                >
                  {LineNoneList &&
                    LineNoneList.map((item) => (
                      <Panel
                        header={this.renderHeaderInfo(item)}
                        key={item.bidLineItemId}
                        className={styles['header-info']}
                        showArrow={false}
                      >
                        <ItemNoneDetailsList
                          bidLineItemId={item.bidLineItemId}
                          {...itemDimensionProps}
                        />
                      </Panel>
                    ))}
                </Collapse>
              </Spin>
            </Tabs.TabPane>
          </Tabs>
        )}
      </Panel>
    );
  }

  render() {
    const { CalibrationCollapseKeys = [], setCollapseByKey, historyRecordProps } = this.props;

    return (
      <Collapse
        onChange={(keys) => setCollapseByKey('CalibrationCollapseKeys', keys)}
        className="form-collapse"
        defaultActiveKey={CalibrationCollapseKeys}
      >
        {this.renderPrequalHeader()}
        {this.renderPrequalSupplier()}
        <History {...historyRecordProps} />
      </Collapse>
    );
  }
}

export default Calibration;
