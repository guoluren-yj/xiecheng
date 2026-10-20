/* eslint-disable global-require */
import React, { Component } from 'react';
import { Icon, Timeline, Spin, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import FilterBar from '_components/FilterBarTable/FilterBar';
import ExcelExportPro from 'components/ExcelExportPro';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import style from './index.less';

const { Item } = Timeline;
const statusIcons = {
  NEW: 'add',
  RETURN_TO_EC: 'reply',
  RETURENING_TO_EC: 'reply',
  BILL_CONFIRM: 'check_circle',
  BILLED: 'publish2',
  BILL_RETURN: 'reply',
  RETURN_TO_EC_FAIl: 'cancel',
  BILL_CONFIRM_FAIL: 'cancel',
  UPDATE: 'autorenew',
  AUTO_BILL_FAIL: 'cancel',
  EC_BILL_FAILED: 'cancel',
};
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

  handleSearchOperateList = async (fields) => {
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
  };

  updateFooterBtn = () => {
    const { modal, operationDs, isFilter, autoBillId } = this.props;
    if (modal && isFilter) {
      const params = operationDs?.queryDataSet?.current?.toData();
      modal.update({
        footer: (okBtn) => [
          okBtn,
          <ExcelExportPro
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            templateCode="SRM_C_SSTA_AUTO_BILL_ACTION_EXPORT" // 导出模板编码
            exportAsync
            otherButtonProps={{
              type: 'c7n-pro',
            }}
            requestUrl={`/ssta/v1/${getCurrentOrganizationId()}/auto-bill-actions/autoBill/action/export`}
            queryParams={{
              ...params,
              autoBillId,
            }}
            allBody
            method="POST"
          />,
        ],
      });
    }
  };

  render() {
    const { operateData, loading } = this.state;
    const { isFilter, operationDs } = this.props;
    return (
      <Spin spinning={loading}>
        <div className={style.operating}>
          {isFilter && (
            <FilterBar
              dataSet={[operationDs]}
              onQuery={this.handleSearchOperateList}
              autoQuery={false}
              expandable={false}
            />
          )}
          <Timeline className="operating-timeline">
            {operateData?.length > 0 &&
              operateData.map((t) => {
                return (
                  <Item color="#E5E5E5">
                    <Icon type={statusIcons[t.processStatus]} />
                    <Tooltip placement="topLeft" title={t.processUser}>
                      <span className="operator">{t.processUser}</span>
                    </Tooltip>
                    <span className="status gray" style={{ paddingLeft: '12px' }}>
                      {intl
                        .get('ssta.common.view.message.alreadyOperated', {
                          operationName: t.processStatusMeaning,
                        })
                        .d('{operationName}了')}
                    </span>

                    <span className="result accountStatement">
                      【
                      {intl
                        .get('ssta.ecAutoBill.model.ecAutoBill.accountStatementRecord')
                        .d('对账记录单')}
                      】
                    </span>
                    {t.processRemark && (
                      <div className="reamks">
                        <div className="status gray">
                          {intl
                            .get('hzero.common.components.operationAudit.operationRemark')
                            .d('操作说明')}
                          :
                        </div>
                        <div>
                          <div className="result comment gray">{t.processRemark}</div>
                        </div>
                      </div>
                    )}
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
