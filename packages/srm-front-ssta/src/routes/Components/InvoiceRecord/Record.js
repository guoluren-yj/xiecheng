/* eslint-disable global-require */
import React, { Component } from 'react';
import { Icon, Timeline, Spin, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import FilterBar from '_components/FilterBarTable/FilterBar';
import ExcelExportPro from 'components/ExcelExportPro';

import style from './index.less';

const { Item } = Timeline;
export default class Record extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operateData: [],
    };
  }

  handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}</span>
      </div>
    );
  };

  async componentDidMount() {
    this.handleSearchOperateList();
  }

  handleSearchOperateList = async(fields) => {
    const { operationDs } = this.props;
    const params = fields?.params || {};
    // eslint-disable-next-line no-unused-expressions
    operationDs?.queryDataSet?.current?.reset();
    // eslint-disable-next-line no-unused-expressions
    operationDs?.queryDataSet?.current?.set(params);
    this.updateFooterBtn();
    const res = getResponse(await operationDs.query());
    this.setState({
      loading: true,
    });
    if (res && !res.failed && res.content) {
      this.setState({
        operateData: res.content,
        loading: false,
      });
    }
  }

  updateFooterBtn = () => {
    const { modal, operationDs, isFilter, invoiceHeaderId } = this.props;
    if (modal && isFilter) {
      const params = operationDs?.queryDataSet?.current?.toData();
      modal.update({
        footer: (okBtn) => [
          okBtn,
          <ExcelExportPro
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            templateCode="SRM_C_SSTA_INVOICE_ACTION_EXPORT" // 导出模板编码
            exportAsync
            otherButtonProps={{
              type: 'c7n-pro',
            }}
            requestUrl={`/ssta/v1/${getCurrentOrganizationId()}/invoice-action/invoice/action/export`}
            queryParams={{
              ...params,
              invoiceHeaderId,
            }}
            allBody
            method="POST"
          />,
        ],
      });
    }
  };

  getIcon(processStatus) {
    let icon = 'autorenew';
    if (processStatus === 'CANCEL') {
      icon = 'cancel';
    } else if (processStatus === 'PC_CREATE') {
      icon = 'how_to_vote-o';
    } else if (processStatus === 'UPLOAD_ATTACHMENT') {
      icon = 'attach_file';
    }
    return icon;
  }

  formatRemark = (t) => {
    if (t.processRemark) {
      return (
        <div className="reamks">
          <span className="gray">{t.processUser}</span>
          <span className="status gray">
            {intl.get('ssta.costSheet.model.reamked').d('备注了')}
          </span>
          <span className="result comment gray">{t.processRemark}</span>
        </div>
      );
    }
    if (t.invoiceImportMethod) {
      return (
        <div className="reamks">
          <span className="gray">
            {intl.get('ssta.common.model.common.importType').d('导入方式')}:
          </span>
          <span className="result comment gray">{t.invoiceImportMethodMeaning}</span>
        </div>
      );
    }
    return null;
  };

  render() {
    const { operateData, loading } = this.state;
    const { isFilter, operationDs } = this.props;
    return (
      <Spin spinning={loading}>
        <div className={style.operating}>
          {isFilter && <FilterBar dataSet={[operationDs]} onQuery={this.handleSearchOperateList} autoQuery={false} expandable={false} />}
          <Timeline className="operating-timeline">
            {operateData?.length > 0 &&
              operateData.map((t) => {
                return (
                  <Item color="#E5E5E5">
                    <Icon type={this.getIcon(t.processStatus)} className="record-icon" />
                    <Tooltip placement="topLeft" title={t.processUser}>
                      <span className="operator">{t.processUser}</span>
                    </Tooltip>
                    {/* <span className="result" style={{ paddingLeft: '12px' }}>
                      {t.processStatusMeaning}
                    </span> */}
                    <span className="status">
                      {intl
                        .get('ssta.common.view.message.alreadyOperated', {
                          operationName: t.processStatusMeaning,
                        })
                        .d('{operationName}了')}
                    </span>
                    <span className="result expenseSheets">
                      【
                      {['CREATE_LINE', 'DELETE_LINE', 'UPDATE_LINE'].includes(t.processStatus)
                        ? intl.get(`ssta.costSheet.model.invoiceLine`).d('发票行')
                        : intl.get('ssta.costSheet.model.invoice').d('发票')}
                      】
                    </span>
                    {this.formatRemark(t)}
                    <div className="date gray">{dateTimeRender(t.processDate)}</div>
                    <div className="line" />
                  </Item>
                );
              })}
            {!operateData?.length && this.handleNoData()}
          </Timeline>
        </div>
      </Spin>
    );
  }
}
