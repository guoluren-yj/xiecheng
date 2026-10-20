import React, { Component } from 'react';
import { Spin } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
// import ApproveRecord from '_components/ApproveRecord';
import ApproveRecordGroup from '_components/ApproveRecordGroup';
import { fetchApprovalData } from '@/services/costSheetService';
import { queryUnifyIdpValue } from 'services/api';
import style from './index.less';

class SideDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      ApporvalData: [],
    };
  }

  componentDidMount() {
    this.init();
    this.updateFooterBtn();
  }

  componentDidUpdate(prevProps) {
    // 切换到审批记录不显示导出按钮
    const { tabKey } = this.props;
    if (tabKey !== prevProps.tabKey) {
      this.updateFooterBtn();
    }
  }

  updateFooterBtn = () => {
    const { modal, isFilter } = this.props;
    if (modal && isFilter) {
      modal.update({
        footer: (okBtn) => [okBtn],
      });
    }
  };

  @Bind()
  init = async () => {
    const { headerId, documentType } = this.props;
    this.setState({
      loading: true,
    });
    let ApporvalData = getResponse(await queryUnifyIdpValue('SSTA.PROCESS_DEFINITION'));
    const resApporvalData =
      getResponse(
        await fetchApprovalData({
          primaryId: headerId,
          documentType,
        })
      ) || {};
    if (ApporvalData && ApporvalData.length) {
      // 多个审批节点时需要把最新的放到上面
      ApporvalData = ApporvalData.filter((item) => {
        if (resApporvalData[item.value]) {
          const historicTaskExtList = [];
          resApporvalData[item.value].map((val, index) => {
            if (index === 0) {
              // eslint-disable-next-line
              item.id = val.id;
            }
            val.historicTaskExtList.map((n) => {
              // eslint-disable-next-line
              n.nodeStatusCode = n.action;
            });
            historicTaskExtList.push(...val.historicTaskExtList);
          });
          // eslint-disable-next-line
          item.historicTaskExtList = historicTaskExtList;
          // eslint-disable-next-line
          item.collapseIcon = true;
          return item;
        }
      }).sort((a, b) => {
        return b.id - a.id;
      });
    }
    this.setState({
      ApporvalData,
      loading: false,
    });
  };

  render() {
    const { ApporvalData, loading } = this.state;
    const group = ApporvalData?.map((item) => ({
      title: item.meaning,
      children: item.historicTaskExtList,
    }));
    return (
      <div className={style['ssta-settle-apporval-wrapper']}>
        <Spin spinning={loading}>
          {isEmpty(ApporvalData) ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
            >
              {intl.get('ssta.costSheet.model.noData').d('暂无数据')}
            </div>
          ) : (
            <ApproveRecordGroup group={group} />
          )}
        </Spin>
      </div>
    );
  }
}
export default SideDrawer;
