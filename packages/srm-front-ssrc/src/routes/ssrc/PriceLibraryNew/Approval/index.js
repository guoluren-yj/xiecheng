import React, { PureComponent, Fragment } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';

import querystring from 'querystring';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import ApproveRecordSimple from 'srm-front-boot/lib/components/ApproveRecordSimple';
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';
import intl from 'utils/intl';
import remote from 'utils/remote';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import { Button as PermissionButton } from 'components/Permission';
import { revokeWorkflow } from '@/services/priceLibraryNewService';
// import CacheComponentC7n from '@/routes/components/CacheComponentC7n';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { lineManualDS } from './lineDS';
import { renderValidStatu } from '../util';

@remote({
  code: 'SSRC_PRICE_LIBRARY_NEW_APPROVAL',
  name: 'ssrcRemote',
})
@WithCustomizeC7N({
  unitCode: [
    'SSRC.PRICE_LIB_NEW.REQ_QUERY_LIST', // 审批查询
    'SSRC.PRICE_LIB_NEW.REQ_QUERY_LIST.BTN_GROUP',
  ],
})
@formatterCollections({ code: ['ssrc.priceLibraryNew'] })
@withProps(
  () => {
    // eslint-disable-next-line prefer-destructuring
    // const templateCode = props?.match?.params?.templateCode || '';
    const tableManualDs = new DataSet(lineManualDS());
    return {
      tableManualDs,
    };
  },
  { cacheState: true }
)
export default class PriceLibraryNew extends PureComponent {
  isOpenClearCashed = true;

  state = {
    routerParams: querystring.parse(location.search.slice(1)),
    aggregation: true,
  };

  getSnapshotBeforeUpdate(prevProps = {}) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const prevId = prevParams?.templateCode || null;
    const id = params?.templateCode || null;
    return id && prevId !== id;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.init();
    }
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    const { match, tableManualDs, location } = this.props;
    console.log('location', location);
    const { templateCode } = match?.params || {};
    if (!tableManualDs) {
      return;
    }

    tableManualDs.setQueryParameter('templateCode', templateCode);
    tableManualDs.query();
    const { state: { _back } = {} } = location;
    if (_back === -1 && this.isOpenClearCashed) {
      tableManualDs.query(tableManualDs.currentPage);
      this.isOpenClearCashed = false;
    } else {
      tableManualDs.query();
    }
  };

  @Bind()
  reDirectRFX(record) {
    const {
      match: { params },
      history,
      tableManualDs,
    } = this.props;
    const {
      data: { requestStatus, requestId, requestNum, isOperation },
    } = record;
    tableManualDs.setState('goTo', 'detail');
    const {
      routerParams: { viewCode = '' },
    } = this.state;
    // 审批拒绝但是行上有不是新建状态的价格
    if (
      requestStatus === 'APPROVING' ||
      requestStatus === 'APPROVE_SUCCESS' ||
      (requestStatus === 'APPROVE_REJECT' && isOperation === 0) ||
      (requestStatus === 'WITHDRAW' && isOperation === 0)
    ) {
      history.push({
        pathname: `/ssrc/price-library-new/${params.templateCode}/detail`,
        search: `?requestId=${requestId}&&viewCode=${viewCode}&&requestStatus=${requestStatus}&&requestNum=${requestNum}`,
      });
    } else if (requestStatus === 'WITHDRAW' || requestStatus === 'APPROVE_REJECT') {
      history.push({
        pathname: `/ssrc/price-library-new/${params.templateCode}/detail-reject`,
        search: `?requestId=${requestId}&&viewCode=${viewCode}&&requestStatus=${requestStatus}&&requestNum=${requestNum}`,
      });
    }
  }

  @Bind()
  handleAggregationChange(aggregation) {
    this.setState({ aggregation });
  }

  @Bind()
  renderHeaderButtons() {
    const { ssrcRemote } = this.props;
    const buttonGroup = [];
    return ssrcRemote
      ? ssrcRemote.process('SSRC_PRICE_LIBRARY_NEW_APPROVAL', buttonGroup, {
          current: this,
        })
      : buttonGroup;
  }

  /**
   * 撤销审批
   */
  @Bind()
  handleRevoke(record) {
    const { tableManualDs } = this.props;
    const requestId = record.get('requestId');
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get(`ssrc.priceLibraryNew.view.message.note.revokeApprove`)
        .d('您确定要撤销审批吗？您可以在撤销后再次提交审批（注意：仅工作流审批发起人可执行撤销）'),
      onOk: async () => {
        const res = await revokeWorkflow({ requestId });
        if (getResponse(res)) {
          notification.success();
          tableManualDs.query(tableManualDs.currentPage);
        }
      },
    });
  }

  /**
   * 审批
   */
  @Bind()
  handleApproval(record) {
    const { tableManualDs } = this.props;
    const approvalByBusKey = record.get('approvalByBusKey') || {};
    const { taskId, processInstanceId } = approvalByBusKey;
    if (taskId && processInstanceId) {
      openApproveModal({
        taskId,
        processInstanceId,
        closable: true,
        onSuccess: () => {
          tableManualDs.query(tableManualDs.currentPage);
        },
      });
    }
  }

  render() {
    const {
      match: { params },
      customizeTable,
      customizeBtnGroup,
      tableManualDs,
    } = this.props;
    const { aggregation = true } = this.state;
    const manualColumns = [
      {
        name: 'requestStatus',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ value, text }) => {
          return renderValidStatu(value, text);
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 200,
        name: 'action',
        renderer: ({ record }) => (
          <span className="action-link">
            {record.get('approvalByBusKey') && (
              <>
                <PermissionButton
                  name="approval"
                  type="c7n-pro"
                  funcType="link"
                  onClick={() => this.handleApproval(record)}
                  permissionList={[
                    {
                      code: `${params.templateCode?.toLocaleLowerCase()}.button.audit`,
                      type: 'button',
                      meaning:
                        intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库') -
                        intl.get('ssrc.priceLibraryNew.view.button.approval').d('审批'),
                    },
                  ]}
                >
                  {intl.get('ssrc.priceLibraryNew.view.button.approval').d('审批')}
                </PermissionButton>
              </>
            )}
            {record.get('revokeByBusKeyFlag') && (
              <>
                <PermissionButton
                  name="revokeApproval"
                  type="c7n-pro"
                  funcType="link"
                  onClick={() => this.handleRevoke(record)}
                  permissionList={[
                    {
                      code: `${params.templateCode?.toLocaleLowerCase()}.button.cancelaudit`,
                      type: 'button',
                      meaning:
                        intl.get('ssrc.priceLibraryNew.view.title.priceLibrary').d('价格库') -
                        intl.get('ssrc.priceLibraryNew.view.button.revokeApproval').d('撤销审批'),
                    },
                  ]}
                >
                  {intl.get('ssrc.priceLibraryNew.view.button.revokeApproval').d('撤销审批')}
                </PermissionButton>
              </>
            )}
          </span>
        ),
      },
      {
        title: intl.get('ssrc.priceLibraryNew.model.library.approvalProgress').d('审批进度'),
        width: 200,
        name: 'approvalProgress',
        renderer: ({ record }) => {
          const data = record.get('approvalProcessByBusKey');
          return data ? <ApproveRecordSimple data={data} /> : '-';
        },
      },
      {
        name: 'requestNum',
        width: 200,
        tooltip: 'overflow',
        renderer: ({ value, record }) => {
          if (
            record.get('requestStatus') === 'NEW' ||
            record.get('requestStatus') === 'APPROVING' ||
            record.get('requestStatus') === 'APPROVE_REJECT' ||
            record.get('requestStatus') === 'APPROVE_SUCCESS' ||
            record.get('requestStatus') === 'WITHDRAW'
          ) {
            return <a onClick={() => this.reDirectRFX(record)}>{value}</a>;
          } else {
            return value;
          }
        },
      },
      {
        name: 'reqType',
        width: 160,
      },
      {
        name: 'realName',
        width: 160,
        tooltip: 'overflow',
      },
      {
        name: 'approveMethod',
        width: 200,
      },
      {
        name: 'creationDate',
        width: 200,
      },
      {
        name: 'approveDate',
        minWidth: 150,
      },
    ];
    const cacheState = tableManualDs.getState('goTo') !== 'list'; // 列表页面进入无需缓存, 详情页面返回需要缓存
    return (
      <Fragment>
        <Header
          title={intl.get('ssrc.priceLibraryNew.view.title.readApproval').d('价格审批查询')}
          backPath={`/ssrc/price-library-new/${params.templateCode}/list`}
          onBack={() => {
            tableManualDs.setState('goTo', 'list');
          }}
        >
          {customizeBtnGroup(
            {
              code: `SSRC.PRICE_LIB_NEW.REQ_QUERY_LIST.BTN_GROUP`,
              pro: true,
            },
            <DynamicButtons buttons={this.renderHeaderButtons()} />
          )}
        </Header>
        <Content>
          {customizeTable(
            {
              code: 'SSRC.PRICE_LIB_NEW.REQ_QUERY_LIST',
              dataSet: tableManualDs,
            },
            <SearchBarTable
              searchCode="SSRC.PRICE_LIBRARY_NEW.FILTER_BAR"
              cacheState={cacheState}
              customizable
              aggregation={aggregation}
              columns={manualColumns}
              dataSet={tableManualDs}
              onAggregationChange={this.handleAggregationChange}
              style={{ maxHeight: `calc(100vh - 300px)` }}
            />
          )}
        </Content>
      </Fragment>
    );
  }
}
