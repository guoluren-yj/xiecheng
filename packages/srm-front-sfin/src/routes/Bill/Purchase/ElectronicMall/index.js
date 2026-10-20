import React, { Component, Fragment } from 'react';
import { Table, DataSet, Button, Tabs } from 'choerodon-ui/pro';
import { Collapse, Icon } from 'choerodon-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { synchronousEcommerce } from '@/services/billService';
import ActionHistory from '../../Components/ActionHistory';

import styles from './index.less';
import HeaderInfo from './HeaderInfo';
import { automatic, notAutomatic, filterFormDs } from './fieldsInitalValue';

const { Panel } = Collapse;
const promptCode = 'sfin.invoiceBill';
@connect(({ bill, loading }) => ({
  bill,
  printLoading: loading.effects['bill/retailersPrint'],
}))
@formatterCollections({
  code: [
    'sfin.common',
    'entity.supplier',
    'entity.company',
    'sfin.invoiceBill',
    'sfin.commom.model',
    'sfin.commom',
  ],
})
export default class Update extends Component {
  constructor(props) {
    super(props);
    const { billHeaderId } = props.match.params;
    this.state = {
      collapsed: true,
      activeKey: 'automatic',
      billHeaderId,
      operateRecordVisible: false,
    };
  }

  automaticLine = new DataSet(automatic());

  notAutomaticLine = new DataSet(notAutomatic());

  formDs = new DataSet(filterFormDs());

  componentDidMount() {
    const { billHeaderId } = this.state;
    this.automaticLine.setQueryParameter('billHeaderId', billHeaderId);
    this.notAutomaticLine.setQueryParameter('billHeaderId', billHeaderId);
    this.formDs.setQueryParameter('billHeaderId', billHeaderId);
  }

  @Bind()
  handleCollapse() {
    this.setState((state) => ({
      collapsed: !state.collapsed,
    }));
  }

  @Bind()
  handleTabsChange(key) {
    this.setState({ activeKey: key === 'automatic' ? 'automatic' : 'notAutomatic' });
  }

  @Bind()
  operateRecord() {
    const { operateRecordVisible } = this.state;
    this.setState({ operateRecordVisible: !operateRecordVisible }, () => {
      this.historyModal.handleSearch();
    });
  }

  /**
   * 打印功能
   */
  @Bind()
  handlePrint() {
    const { billHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/retailersPrint',
      billHeaderId,
    }).then((res) => {
      if (!res) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        try {
          const failedInfo = JSON.parse(content);
          notification.error({
            description: failedInfo.message,
          });
        } catch (e) {
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow?.print) {
            printWindow.print();
          }
        }
      };
      reader.readAsText(res);
    });
  }

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  @Bind()
  batchApprove(tableDs) {
    if (tableDs) {
      const selectedIds = tableDs.selected
        .map((item) => item.toData())
        .map((item) => item.ecLineId);
      const { confirmStatus } = this.formDs.toData() && this.formDs.toData()[0];
      const newList = tableDs.toData().map((item) => {
        if (selectedIds.indexOf(item.ecLineId) !== -1) {
          return { ...item, confirmStatus };
        } else {
          return item;
        }
      });
      tableDs.loadData(newList);
    }
  }

  @Bind()
  synchronousEcommerce() {
    const { billHeaderId } = this.state;
    synchronousEcommerce(billHeaderId).then((res) => {
      if (getResponse(res)) {
        notification.success();
      }
    });
  }

  render() {
    const { dispatch, printLoading = false } = this.props;
    const {
      uuid,
      ouNameDisable,
      invOrganizatainDisabled,
      purchaseOrgDisable,
      activeKey,
      operateRecordVisible,
    } = this.state;
    const columns = [
      {
        name: 'ecLineNum',
        width: 80,
      },
      {
        name: 'confirmStatus',
        width: 150,
      },
      {
        name: 'lineRemark',
        width: 150,
      },
      {
        name: 'matchResultMeaning',
        width: 150,
      },
      {
        name: 'ecPoNum',
        width: 150,
      },
      {
        name: 'ecPoSubNum',
        width: 150,
      },
      {
        name: 'poNumLineNum',
        width: 150,
      },
      {
        name: 'ecProductNum',
        width: 150,
      },
      {
        name: 'ecProductName',
        width: 150,
      },
      {
        name: 'ecProductQuantity',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'nakedPrice',
        width: 150,
      },
      {
        name: 'taxRate',
        width: 150,
      },
      {
        name: 'taxPrice',
        width: 150,
      },
      {
        name: 'taxLineAmount',
        width: 150,
      },
      {
        name: 'autoNakedPrice',
        width: 150,
      },
      {
        name: 'autoTaxRate',
        width: 150,
      },
      {
        name: 'autoActualPrice',
        width: 150,
      },
      {
        name: 'autoTaxLineAmount',
        width: 150,
      },
      {
        name: 'poQuantity',
        width: 150,
      },
      {
        name: 'deliverQuantity',
        width: 150,
      },
      {
        name: 'quantityAccepted',
        width: 150,
      },
      {
        name: 'quantityReturned',
        width: 150,
      },
      {
        name: 'deliverTime',
        width: 150,
      },
      {
        name: 'asnNumLineNum',
        width: 150,
      },
      {
        name: 'trvNumLineNum',
        width: 150,
      },
      {
        name: 'syncStatusMeaning',
        width: 150,
      },
      {
        name: 'syncMsg',
        width: 150,
      },
    ];

    // if (activeKey !== 'automatic') {
    //   columns.splice(-2, 2);
    // }

    const headerInfoProps = {
      formDs: this.formDs,
      openUpload: this.handleOpenUpload,
      uuid,
      lovChange: this.handleChange,
      ouNameDisable,
      ouNameChange: this.handleOuNameChange,
      invOrganizatainDisabled,
      purchaseOrgDisable,
    };

    const operationRecordProps = {
      dispatch,
      visible: operateRecordVisible,
      onRef: this.onRef,
      hideModal: this.operateRecord,
    };

    const { billStatus } = this.formDs.toData().length !== 0 && this.formDs.toData()[0];
    return (
      <Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.billAudit.detail`).d('开票单审核明细')}
          backPath="/sfin/purchase-bill/list"
        >
          <Button onClick={() => this.operateRecord()}>
            {intl.get('sfin.common.view.button.save').d('操作记录')}
          </Button>
          <Button
            // disabled={!['CONFIRMED', 'INFORM_CONFIRMED'].includes(billStatus)}
            onClick={() => Throttle(this.handlePrint(), 2000)}
            icon="print"
            color="primary"
            loading={printLoading}
          >
            {intl.get(`hzero.common.button.print`).d('打印')}
          </Button>
          {billStatus === 'EC_CONFIRM_FAILS' && (
            <Button onClick={() => this.synchronousEcommerce()}>
              {intl.get('sfin.common.view.button.synchronous').d('同步电商')}
            </Button>
          )}
        </Header>
        <Content>
          <div className={styles['detail-form']}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['queryFormKey']}
              onChange={this.handleCollapse}
            >
              <Panel
                forceRender
                key="queryFormKey"
                showArrow={false}
                header={
                  <Fragment>
                    <span>{intl.get(`sfin.common.model.archive.baseInfo`).d('基本信息')}</span>
                    <a style={{ marginLeft: 20 }}>
                      {this.state.collapsed
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                      {<Icon type={this.state.collapsed ? 'expand_less' : 'expand_more'} />}
                    </a>
                  </Fragment>
                }
              >
                <HeaderInfo {...headerInfoProps} />
              </Panel>
            </Collapse>
          </div>
          <Tabs defaultActiveKey={activeKey} onChange={this.handleTabsChange} animated={false}>
            <Tabs.TabPane
              tab={intl.get(`sfin.common.model.confirmStatus`).d('已自动对账行')}
              key="automatic"
            >
              <Table
                dataSet={this.automaticLine}
                columns={columns}
                queryFieldsLimit={3}
                data={[]}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`sfin.common.model.notAutomatic`).d('未自动对账行')}
              key="notAutomatic"
            >
              <Table
                dataSet={this.notAutomaticLine}
                columns={columns}
                queryFieldsLimit={3}
                data={[]}
              />
            </Tabs.TabPane>
          </Tabs>
        </Content>
        <ActionHistory {...operationRecordProps} />
      </Fragment>
    );
  }
}
