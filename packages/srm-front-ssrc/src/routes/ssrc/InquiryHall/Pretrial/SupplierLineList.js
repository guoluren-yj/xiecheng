import React, { Component } from 'react';
import { Collapse, Tag, Pagination, Spin, Form, Button, Modal, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { difference, isEmpty, isFunction } from 'lodash';
import { connect } from 'dva';

import Checkbox from 'components/Checkbox';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import SVGIcon from '@/routes/components/SvgIcon';
import annexImg from '@/assets/supplier-icon.svg';
import { phoneRender } from '@/utils/renderer';
import { INQUIRY } from '@/utils/globalVariable';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';
import styles from './index.less';
import SupplierLineTable from './SupplierLineTable';
import Attachment from '../../components/Attachment';
import LadderLevel from '../../components/LadderLevelDoubleUnit';
import PriceCharts from '../../components/PriceCharts';

const { Panel } = Collapse;
const AttachIcon = require('@/assets/d-attachment.svg');

@connect(({ inquiryHall }) => ({
  inquiryHall,
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
export default class SupplierLineList extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      prevOpenKeys: [], // 之前打开的 Pane
      loadingObj: {},
      expand: {},
      updateState: false,
      attachmentVisible: false,
      AttachmentsProps: {},
      rfxLineSupplierId: undefined, // 最后一次展开的行id
    };
    this.supplierLineTable = {}; // 初始化this.supplierLineTable为对象
  }

  // 在元素被渲染并写入 DOM 之前调用
  getSnapshotBeforeUpdate(preProps) {
    const {
      inquiryHall: { supplierQuoteLine },
    } = this.props;
    const {
      inquiryHall: { supplierQuoteLine: preLine },
    } = preProps;
    if (supplierQuoteLine !== preLine) {
      return true;
    }
    return null;
  }

  componentDidUpdate(preProps, preState, snap) {
    const {
      inquiryHall: { supplierQuoteLine },
      form,
    } = this.props;
    const { rfxLineSupplierId } = this.state;
    if (snap !== null) {
      let wholePackageList = {};
      if (!isEmpty(supplierQuoteLine)) {
        const selectedSupplierQuoteLine = supplierQuoteLine.filter(
          // eslint-disable-next-line
          (val) => val.rfxLineSupplierId == rfxLineSupplierId
        );
        // 根据对应的rfxLineSupplierId的整包推荐值，设置必填项
        if (form.getFieldValue(`value#${rfxLineSupplierId}`)) {
          selectedSupplierQuoteLine.forEach(
            (item) => item.$form && item.$form.setFieldsValue({ suggestedFlag: 1 })
          );
        }
        selectedSupplierQuoteLine.forEach((item) => {
          wholePackageList = {
            ...wholePackageList,
            [`${item.quotationLineId}#${item.rfxLineSupplierId}`]:
              item.$form && item.$form.getFieldValue('suggestedFlag'),
          };
        });
        this.supplierLineTable[rfxLineSupplierId].setState({
          suggestedFlagValue: {
            ...this.supplierLineTable[rfxLineSupplierId].state.suggestedFlagValue,
            ...wholePackageList,
          },
        });
      }
    }
  }

  /**
   * showUploadModal - 打开头附件上传弹窗
   */
  @Bind()
  showUploadModal(businessAttachmentUuid, techAttachmentUuid) {
    this.setState({
      AttachmentsProps: {
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        viewOnly: true,
        businessUuid: businessAttachmentUuid,
        techUuid: techAttachmentUuid,
      },
      attachmentVisible: true,
    });
  }

  /**
   * hideAttachmentsProps -  关闭头附件上传弹窗
   */
  @Bind()
  hideAttachmentsProps() {
    this.setState({ attachmentVisible: false });
  }

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
   *
   * @param {string[]} openKeys - 新打开的 Pane
   */
  @Bind()
  handleCollapseChange(openKeys) {
    const {
      dispatch,
      inquiryHall: { supplierQuoteLine = [], supplierLinePagination = {} },
    } = this.props;
    const { prevOpenKeys = [] } = this.state;
    const newOpenKeys = difference(openKeys, prevOpenKeys);
    if (isEmpty(newOpenKeys)) {
      // 关闭 Pane 不管
      const closeKeys = difference(prevOpenKeys, openKeys);
      if (!isEmpty(supplierQuoteLine)) {
        const newSupplierQuoteLine = supplierQuoteLine.filter(
          (item) => item.rfxLineSupplierId !== closeKeys[0]
        );
        delete supplierLinePagination[closeKeys[0]];
        dispatch({
          type: 'inquiryHall/updateState',
          payload: { supplierQuoteLine: newSupplierQuoteLine, supplierLinePagination },
        });
      }
    } else {
      // 打开新的 Pane
      this.fetchSupplierLineTableList({}, newOpenKeys[0]);
      this.setState({ rfxLineSupplierId: newOpenKeys[0] });
    }
    this.setState({ prevOpenKeys: openKeys });
  }

  /**
   * 获取表格数据
   */
  @Bind()
  clickCollapseChange(e, item) {
    const {
      dispatch,
      inquiryHall: { supplierQuoteLine = [], supplierLinePagination = {} },
    } = this.props;
    const { expand } = this.state;
    if (!expand[item.rfxLineSupplierId]) {
      this.fetchSupplierLineTableList({}, item.rfxLineSupplierId);
      this.setState({ rfxLineSupplierId: item.rfxLineSupplierId });
    } else if (!isEmpty(supplierQuoteLine)) {
      const newSupplierQuoteLine = supplierQuoteLine.filter(
        (a) => a.rfxLineSupplierId !== item.rfxLineSupplierId
      );
      delete supplierLinePagination[item.rfxLineSupplierId];
      dispatch({
        type: 'inquiryHall/updateState',
        payload: { supplierQuoteLine: newSupplierQuoteLine, supplierLinePagination },
      });
    }
    this.setState({
      expand: {
        ...expand,
        [item.rfxLineSupplierId]: !expand[item.rfxLineSupplierId],
      },
    });
  }

  /**
   * 供应商列表-表格内容改变
   */
  @Bind()
  changeTableData() {
    const {
      dispatch,
      inquiryHall: { supplierLineChange = false },
    } = this.props;
    if (!supplierLineChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          supplierLineChange: true,
        },
      });
    }
  }

  /**
   * 获取表格数据
   */
  @Bind()
  fetchSupplierLineTableList(page = {}, rfxLineSupplierId) {
    const { dispatch, organizationId, rfxHeaderId, sourceKey = INQUIRY } = this.props;
    const loadingObj = {
      [rfxLineSupplierId]: { fetchItemQuoteLineLoading: true },
    };
    this.setState({ loadingObj });
    dispatch({
      type: 'inquiryHall/fetchSupplierQuoteLine',
      payload: {
        page,
        organizationId,
        rfxLineSupplierId,
        rfxHeaderId,
        customizeUnitCode: `SSRC.${sourceKey}_HALL_PRETRIAL.SUPPLIER_DETAIL`,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          loadingObj: { [rfxLineSupplierId]: { fetchItemQuoteLineLoading: false } },
        });
        // eslint-disable-next-line
        // const newDataSource = res.filter(r => r.rfxLineSupplierId == rfxLineSupplierId);
        // if (isArray(res)) {
        //   let wholePackageList = {};
        //   res.forEach(item => {
        //     wholePackageList = {
        //       ...wholePackageList,
        //       [`${item.quotationLineId}#${item.rfxLineSupplierId}`]: item.$form.getFieldValue(
        //         'suggestedFlag'
        //       ),
        //     };
        //   });
        //   this.supplierLineTable.setState({
        //     suggestedFlagValue: {
        //       ...this.supplierLineTable.state.suggestedFlagValue,
        //       ...wholePackageList,
        //     },
        //   });
        // }
      }
    });
  }

  /**
   * 供应商-分页改变
   */
  @Bind()
  changePagination(page = {}, rfxLineSupplierId) {
    const {
      dispatch,
      inquiryHall: { supplierQuoteLine, supplierQuoteLinePagination = {} },
    } = this.props;
    const { updateState } = this.state;
    // 改变分页，先把对应得rfxLineSupplierId得数据清空，再重新查询
    const newSupplierQuoteLine = supplierQuoteLine.filter(
      (item) => +item.rfxLineSupplierId !== rfxLineSupplierId
    );
    delete supplierQuoteLinePagination[rfxLineSupplierId];
    dispatch({
      type: 'inquiryHall/updateState',
      payload: { supplierQuoteLine: newSupplierQuoteLine, supplierQuoteLinePagination },
    });
    this.setState({ updateState: true }, () => {
      this.fetchSupplierLineTableList(page, rfxLineSupplierId, updateState);
    });
  }

  /**
   * 设置整包推荐的值，为1
   */
  @Bind()
  setWholePackageFlag(rfxLineSupplierId) {
    const { form } = this.props;
    form.setFieldsValue({ [`value#${rfxLineSupplierId}`]: 1 });
  }

  /**
   * 设置整包推荐的值，为0
   */
  @Bind()
  setWholePackageFlagFalse(rfxLineSupplierId) {
    const { form } = this.props;
    form.setFieldsValue({ [`value#${rfxLineSupplierId}`]: 0 });
  }

  /**
   * 改变整包推荐，设置选用的值
   */
  @Bind()
  changeWholePackage(e, rfxLineSupplierId) {
    const {
      inquiryHall: { supplierQuoteLine = [] },
    } = this.props;
    // 根据rfxLineSupplierId，在dataSource中找出对应的供应商行数据
    // eslint-disable-next-line
    const newDataSource = supplierQuoteLine.filter((r) => r.rfxLineSupplierId == rfxLineSupplierId);
    if (!isEmpty(newDataSource)) {
      // 勾选了整包推荐，对应的供应商行数据，勾选为1，否则为0
      if (!e.target.value) {
        newDataSource.forEach(
          (item) => item.$form && item.$form.setFieldsValue({ suggestedFlag: 1 })
        );
      } else {
        newDataSource.forEach(
          (item) => item.$form && item.$form.setFieldsValue({ suggestedFlag: 0 })
        );
      }
      let wholePackageList = {};
      newDataSource.forEach((item) => {
        wholePackageList = {
          ...wholePackageList,
          [`${item.quotationLineId}#${item.rfxLineSupplierId}`]: item.$form.getFieldValue(
            'suggestedFlag'
          ),
        };
      });
      // 根据整包推荐的勾选，设置表格中对应字段的必填项
      this.supplierLineTable[rfxLineSupplierId].setState({
        suggestedFlagValue: {
          ...this.supplierLineTable[rfxLineSupplierId].state.suggestedFlagValue,
          ...wholePackageList,
        },
      });
    }
  }

  /**
   * 点击小图打开缩略图
   */
  @Bind()
  openPriceCharts(e, chartFlag, id) {
    const { onPriceCharts } = this.props;
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
    onPriceCharts(chartFlag, id);
  }

  renderHeaderInfo(item) {
    const { newQuotationFlag } = this.props;
    const { expand } = this.state;

    return (
      <div className={styles.itemList} onClick={(e) => this.clickCollapseChange(e, item)}>
        <div className={styles.itemListImg}>
          <img src={annexImg} alt="" style={{ width: 44, height: 44 }} />
        </div>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader}>
            <span className={styles.itemListNum}>
              {item.supplierCompanyNum
                ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                : item.supplierCompanyName}
            </span>
            <span className={styles.itemListNumRight}>
              <Icon
                className={styles.arrowIcon}
                type={!expand[`${item.rfxLineSupplierId}`] ? 'down' : 'up'}
                // onClick={e => this.handleCollapseChange(e, item)}
              />
            </span>
            <span>
              {item.candidateFlag === 1 && (
                <span className={styles.allcandidate}>
                  <img src={require('@/assets/candidate.svg')} alt="" />
                  <span className={styles.candidate}>
                    {intl.get(`ssrc.inquiryHall.model.inquiryHall.candidate`).d('候选人')}
                  </span>
                </span>
              )}
            </span>
            <span className={styles.lineTag}>
              <Tag className={styles.feedbackStatus}>{item.feedbackStatusMeaning}</Tag>
              <Tag className={styles.lineNumber}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationNumber`).d('报价行数')}：
                {`${item.quotedCount}/${item.totalQuotationNumber}`}
              </Tag>
              {item.supplierTotalAmount && (
                <Tag className={styles['supplierTotalAmount-invalid']}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmount`).d('报价总价')}
                  ：{item.supplierTotalAmount}
                </Tag>
              )}
            </span>
            <div style={{ clear: 'both' }} />
          </div>
          <p className={styles.itemListDes}>
            <span className={styles.itemListDesItem} onClick={(e) => this.rfxLineTag(e)}>
              {!newQuotationFlag ? (
                <span>
                  <a
                    onClick={() =>
                      this.showUploadModal(item.businessAttachmentUuid, item.techAttachmentUuid)
                    }
                  >
                    <SVGIcon path={AttachIcon} style={{ verticalAlign: 'middle' }} />
                    <span style={{ marginLeft: '7px' }}>
                      {intl.get('hzero.common.upload.modal.title').d('附件')}
                      <RenderFileTotalCount uiType="h0" record={item} />
                    </span>
                  </a>
                </span>
              ) : (
                <FileGroup name="attachmentUuid" record={item} uiType="h0" fileType="HEADER" />
              )}
            </span>
            <span className={styles.itemListDesItem}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人')}：
              {item.contactName}
            </span>
            <span className={styles.itemListDesItem}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话')}：
              {phoneRender(item.internationalTelCodeMeaning, item.contactMobilephone)}
            </span>
            <span className={styles.itemListDesItem}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件')}：
              {item.contactMail}
            </span>
          </p>
        </div>
      </div>
    );
  }

  renderHeraderInfo(item) {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const chartFlag = 's';
    return (
      <div className={styles.itemList}>
        <div
          className={styles.itemListImg}
          onClick={(e) => this.openPriceCharts(e, chartFlag, item.rfxLineSupplierId)}
        >
          <img src={annexImg} alt="" style={{ width: 70, height: 70 }} />
        </div>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader}>
            <span className={styles.itemListNum}>
              {item.supplierCompanyNum
                ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                : item.supplierCompanyName}
            </span>
            <Tag>{item.feedbackStatusMeaning}</Tag>
            <Tag>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationLineNumber`).d('报价行数')}：
              {item.quotationLineNumber}
            </Tag>
            <span className={styles.itemListTag} onClick={(e) => this.rfxLineTag(e)}>
              <Tag>
                <Form.Item
                  className={styles.wholePackageStyle}
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.wholePackage`).d('整包推荐')}
                >
                  {getFieldDecorator(
                    `value#${item.rfxLineSupplierId}`,
                    {}
                  )(
                    <Checkbox
                      onChange={(e) => this.changeWholePackage(e, item.rfxLineSupplierId)}
                    />
                  )}
                </Form.Item>
              </Tag>
            </span>
            <div style={{ clear: 'both' }} />
          </div>
          <p className={styles.itemListDes}>
            <span className={styles.itemListDesItem} onClick={(e) => this.rfxLineTag(e)}>
              {(item.businessAttachmentUuid || item.techAttachmentUuid) && (
                <Button
                  icon="upload"
                  onClick={() =>
                    this.showUploadModal(item.businessAttachmentUuid, item.techAttachmentUuid)
                  }
                >
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.viewAttachments`).d('查看附件')}
                </Button>
              )}
            </span>
            <span className={styles.itemListDesItem}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人')}：
              {item.contactName}
            </span>
            <span className={styles.itemListDesItem}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话')}：
              {item.contactMobilephone}
            </span>
            <span className={styles.itemListDesItem}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件')}：
              {item.contactMail}
            </span>
          </p>
        </div>
      </div>
    );
  }

  render() {
    const {
      headerList = [],
      organizationId,
      loading,
      inquiryHall: {
        supplierQuoteLine = [],
        supplierQuoteLinePagination = {},
        header = {},
        supplierLinePagination,
      },
      onChangePagination,
      form,
      hideModal,
      viewLadderLevel,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      onHidePriceCharts,
      priceChartsvisible,
      customizeTable,
      sourceKey = INQUIRY,
      doubleUnitFlag = false,
      newQuotationFlag = 0,
    } = this.props;
    const { loadingObj, AttachmentsProps, attachmentVisible } = this.state;
    const priceChartsProps = {
      organizationId,
      hideModal: onHidePriceCharts,
      visible: priceChartsvisible,
    };
    const tableProps = {
      header,
      organizationId,
      form,
      loadingObj,
      sourceKey,
      viewLadderLevel,
      dataSource: supplierQuoteLine,
      pagination: supplierQuoteLinePagination,
      onRef: (calKey, node) => {
        this.supplierLineTable[calKey] = node; // 对应的[rfxLineSupplierId]的supplierLineTable
      },
      onChange: this.changePagination,
      onChangeTableData: this.changeTableData,
      onSetWholePackageFlag: this.setWholePackageFlag,
      onSetWholePackageFlagFalse: this.setWholePackageFlagFalse,
      customizeTable,
      doubleUnitFlag,
      newQuotationFlag,
    };
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
      doubleUnitFlag,
    };
    return (
      <React.Fragment>
        <Spin spinning={loading}>
          <Collapse bordered={false}>
            {headerList &&
              headerList.map((item) => (
                <Panel
                  header={this.renderHeaderInfo(item)}
                  key={item.rfxLineSupplierId}
                  className={styles.arrowStyle}
                  showArrow={false}
                >
                  <SupplierLineTable {...tableProps} rfxLineSupplierId={item.rfxLineSupplierId} />
                </Panel>
              ))}
          </Collapse>
        </Spin>
        <Pagination
          className={styles.pagination}
          {...supplierLinePagination}
          onChange={(page, pageSize) => onChangePagination(page, pageSize)}
          onShowSizeChange={(current, size) => onChangePagination(current, size)}
        />
        <Modal
          destroyOnClose
          visible={attachmentVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={800}
        >
          <Attachment {...AttachmentsProps} />
        </Modal>
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
        {priceChartsvisible && <PriceCharts {...priceChartsProps} />}
      </React.Fragment>
    );
  }
}
