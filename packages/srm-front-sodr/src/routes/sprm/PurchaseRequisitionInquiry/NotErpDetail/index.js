/**
 * NotErpDetail - 需求明细(非ERP)
 * @date: 2019-01-22
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Button, Collapse, Spin, Icon } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isNumber } from 'lodash';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import { createPagination, getCurrentOrganizationId } from 'utils/utils';
import UploadModal from 'components/Upload/index';
import formatterCollections from 'utils/intl/formatterCollections';

import OperationRecord from '../../components/OperationRecord/OperationRecord';
import HeadInfo from './HeadInfo';
import ReceiveInfo from './ReceiveInfo';
import InvoiceInfo from './InvoiceInfo';
import LineInfo from './LineInfo';
import { BUCKET_NAME } from '@/routes/components/utils/constant';
import styles from './index.less';

const { Panel } = Collapse;
const titlePrompt = 'sprm.purchaseRequisitionInquiry.view.title';
const buttonPrompt = 'sprm.purchaseRequisitionInquiry.view.button';

@formatterCollections({
  code: [
    'sprm.purchaseRequisitionInquiry',
    'sprm.purchaseRequisitionApproval',
    'sprm.common',
    'entity.roles',
    'entity.business',
    'entity.company',
    'entity.organization',
    'sodr.common',
    'entity.attachment',
    'entity.item',
    'entity.supplier',
  ],
})
@connect(({ purchaseRequisitionInquiry, loading }) => ({
  purchaseRequisitionInquiry,
  fetchingHeader: loading.effects['purchaseRequisitionInquiry/fetchNotErpDetail'],
  fetchingLines: loading.effects['purchaseRequisitionInquiry/fetchNotErpLines'],
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionInquiry/fetchOperationRecordList'],
  tenantId: getCurrentOrganizationId(),
}))
export default class NotErpDetail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
    } = this.props;
    const prHeaderId = params.id;
    this.state = {};
    if (isNumber(Number(prHeaderId))) {
      this.setState({
        prHeaderId,
      });
    }
    this.state = {
      prHeaderId,
      operationRecordList: [],
      operationRecordPagination: {},
      operationRecordModalVisible: false,
      collapseKeys: ['orderHeaderInfo', 'purchaseLineInfo'], // 扩展的Panel key, 'deliveryInformationHeader', 'billingInformation'
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询详情页数据
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    const types = ['fetchNotErpDetail', 'fetchNotErpLines'];
    if (!isUndefined(id)) {
      types.forEach((type) =>
        dispatch({
          type: `purchaseRequisitionInquiry/${type}`,
          payload: {
            tenantId,
            prHeaderId: id,
            page,
          },
        })
      );
    }
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId } = this.state;
    dispatch({
      type: 'purchaseRequisitionInquiry/fetchOperationRecordList',
      payload: {
        prHeaderId,
        page,
      },
    }).then((result) => {
      if (result) {
        this.setState({
          operationRecordList: result.content,
          operationRecordPagination: createPagination(result),
        });
      }
    });
  }

  /**
   * reImportERP - 采购申请同步到ERP
   */
  @Bind()
  reImportERP() {
    const { dispatch } = this.props;
    const { prHeaderId } = this.state;
    const data = Number(prHeaderId);
    dispatch({
      type: 'purchaseRequisitionInquiry/reImportERP',
      data,
    }).then((result) => {
      if (result) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(record) {
    this.setState({
      operationRecordModalVisible: true,
      prHeaderId: record.prHeaderId,
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({ collapseKeys });
  }

  /**
   * getPanelHeader - 获取 Panel 的 Header 信息
   * @param {*} title - Title
   * @param {boolean} [isExpand=false] - 是否展开
   */
  @Bind()
  getPanelHeader(title, isExpand = false) {
    return (
      <Fragment>
        <h3>{title}</h3>
        <a>
          {isExpand
            ? intl.get(`hzero.common.button.up`).d('收起')
            : intl.get(`hzero.common.button.expand`).d('展开')}
        </a>
        <Icon type={isExpand ? 'up' : 'down'} />
      </Fragment>
    );
  }

  render() {
    const {
      purchaseRequisitionInquiry: { notErpDetailSource = {}, notErpLines, notErpLinesPage } = {},
      fetchingHeader,
      fetchingLines,
      fetchOperationRecordListLoading,
      match: { path },
    } = this.props;
    const listTableProps = {
      onChange: this.handleSearch,
      prSourcePlatform: notErpDetailSource.prSourcePlatform,
      dataSource: notErpLines,
      pagination: notErpLinesPage,
    };
    const { syncStatus } = notErpDetailSource;
    const {
      operationRecordList,
      operationRecordPagination,
      operationRecordModalVisible,
      collapseKeys,
    } = this.state;
    const operationRecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    const uploadProps = {
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sprm-pr',
      btnText: intl.get(`entity.attachment.view`).d('附件查看'),
      attachmentUUID: notErpDetailSource.attachmentUuid,
      viewOnly: true,
      showFilesNumber: false,
      btnProps: {
        icon: 'paper-clip',
      },
    };
    const { prSourcePlatform } = notErpDetailSource;
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${titlePrompt}.requirementDetail`).d('需求明细')}
          backPath={
            path.indexOf('/sodr/purchase-order-maintain/quote-purchase-requisition/detail') === 0
              ? '/sodr/purchase-order-maintain/quote-purchase-requisition/list'
              : '/sprm/purchase-requisition-inquiry/list'
          }
        >
          <Button
            icon="clock-circle-o"
            type="primary"
            onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
          >
            {intl.get('sodr.common.view.button.operationRecord').d('操作记录')}
          </Button>
          <UploadModal {...uploadProps} />
          <Button icon="sync" onClick={this.reImportERP} disabled={syncStatus !== 'SYNC_FAILURE'}>
            {intl.get(`${buttonPrompt}.resync`).d('重新同步')}
          </Button>
        </Header>
        <Content>
          <Spin
            spinning={fetchingHeader || fetchingLines || false}
            wrapperClassName={DETAIL_DEFAULT_CLASSNAME}
          >
            <Collapse defaultActiveKey={collapseKeys} onChange={this.onCollapseChange}>
              <Panel
                header={this.getPanelHeader(
                  intl.get(`${titlePrompt}.orderHeaderInfo`).d('采购申请头信息'),
                  collapseKeys.includes('orderHeaderInfo')
                )}
                showArrow={false}
                key="orderHeaderInfo"
              >
                <HeadInfo dataSource={notErpDetailSource} />
              </Panel>
              {prSourcePlatform === 'E-COMMERCE' && (
                <Panel
                  header={this.getPanelHeader(
                    intl.get(`${titlePrompt}.deliveryInfo`).d('收货/收单信息'),
                    collapseKeys.includes('deliveryInformationHeader')
                  )}
                  showArrow={false}
                  key="deliveryInformationHeader"
                >
                  <ReceiveInfo dataSource={notErpDetailSource} />
                </Panel>
              )}
              {prSourcePlatform === 'E-COMMERCE' && (
                <Panel
                  header={this.getPanelHeader(
                    intl.get(`${titlePrompt}.billingInfo`).d('开票信息'),
                    collapseKeys.includes('billingInformation')
                  )}
                  showArrow={false}
                  key="billingInformation"
                >
                  <InvoiceInfo dataSource={notErpDetailSource} />
                </Panel>
              )}
              <Panel
                header={this.getPanelHeader(
                  intl.get(`${titlePrompt}.purchaseLineInfo`).d('采购申请行信息'),
                  collapseKeys.includes('purchaseLineInfo')
                )}
                showArrow={false}
                key="purchaseLineInfo"
                className={styles.line}
              >
                <LineInfo {...listTableProps} />
              </Panel>
            </Collapse>
            <OperationRecord {...operationRecordProps} />
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
