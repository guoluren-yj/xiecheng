/*
 * WaitRelease - 待发布-详情
 * @date: 2020/10/26 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { DataSet, Spin, Modal } from 'choerodon-ui/pro';
import { Collapse, Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
// import { isEmpty, isArray, forEach } from 'lodash';
// import qs from 'querystring';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { getResponse } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import TempateDetail from '@/routes/components/Investigation';
import { handleDelete, handleRelease } from '@/services/investigationDetailMaintainService';
import { getDetailHeaderDS } from '../stores/indexDS';

import HeaderBtns from '../../components/HeaderBtns';
import DetailHeaderWrapper from '../../components/DetailHeaderWrapper';
import styles from '../../index.less';

const { Panel } = Collapse;

/**
 * 调查表模板配置-详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.common', 'sslm.investDefOrg', 'sslm.investTempConfig', 'sslm.investigCorrelat'],
})
@WithCustomize({
  unitCode: ['SSLM.INVESTIGATION_WORKBENCH_DETAIL.WAIT_RELEASE_HEADER_BTNS'],
})
@remotes(
  {
    code: 'SSLM_PURCHASER_INVESTIGATE_WAIT_RELEASE_DETAIL',
    name: 'remote',
  },
  {
    events: {
      cuxHanldeSubmit() {}, // 二开提交逻辑
    },
  }
)
export default class WaitRelease extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { investgHeaderId, investigateTemplateId },
      },
    } = props;
    const { location } = props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { type } = routerParams;
    const editFlag = type === 'edit';
    this.state = {
      investgHeaderId,
      investigateTemplateId,
      allLoading: false,
      editFlag,
    };
    this.headerDs = new DataSet(getDetailHeaderDS(editFlag));
    this.headerDs.setQueryParameter('investgHeaderId', investgHeaderId);
  }

  componentDidMount() {
    this.headerDs.query();
  }

  // 变更loading
  @Bind()
  setLoading(flag) {
    this.setState({ allLoading: flag });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { investgHeaderId } = this.state;
    const { dispatch } = this.props;
    Modal.confirm({
      title: intl.get('sslm.investDefOrg.confirm.title.deleteInvestigate').d('提示'),
      children: intl.get('sslm.common.model.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        this.setState({
          allLoading: true,
        });
        const payload = {
          investigateHeaderIdList: [investgHeaderId],
          customizeUnitCode: 'SSLM.INVESTIGATION_WORKBENCH_DETAIL.HEADER',
        };
        return handleDelete(payload)
          .then(res => {
            if (getResponse(res)) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/sslm/purchaser-investigation/list`,
                })
              );
            }
          })
          .finally(() =>
            this.setState({
              allLoading: false,
            })
          );
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    if (this.headerDs.current) {
      const validateFlag = await this.headerDs.current.validate();
      if (validateFlag) {
        this.setState({
          allLoading: true,
        });
        return this.headerDs
          .submit()
          .then(response => {
            const res = getResponse(response);
            if (res) {
              // 查询
              this.headerDs.query();
            }
          })
          .finally(() =>
            this.setState({
              allLoading: false,
            })
          );
      }
    }
  }

  // 发布
  @Bind()
  async handleRelease() {
    const { investgHeaderId } = this.state;
    const { dispatch, remote } = this.props;
    const cuxRes = await remote.event.fireEvent('cuxHanldeSubmit', { _this: this });
    if (!cuxRes) {
      return;
    }
    if (this.headerDs.current) {
      const validateFlag = await this.headerDs.current.validate();
      if (validateFlag) {
        const headerData = this.headerDs.current.toData();
        const payload = {
          investgHeaderId,
          customizeUnitCode: 'SSLM.INVESTIGATION_WORKBENCH_DETAIL.HEADER',
          ...headerData,
        };
        this.setState({
          allLoading: true,
        });
        return handleRelease(payload)
          .then(res => {
            if (getResponse(res)) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/sslm/purchaser-investigation/list`,
                })
              );
            }
          })
          .finally(() =>
            this.setState({
              allLoading: false,
            })
          );
      }
    }
  }

  render() {
    const { investgHeaderId, investigateTemplateId, allLoading, editFlag } = this.state;
    const { customizeBtnGroup } = this.props;
    return (
      <React.Fragment>
        <Header
          title={
            editFlag
              ? intl.get('sslm.investDefOrg.view.title.editInvestigateDetail').d('编辑调查表')
              : intl.get('sslm.investDefOrg.view.title.viewInvestigateDetail').d('查看调查表')
          }
          backPath="/sslm/purchaser-investigation/list"
        >
          <HeaderBtns
            editFlag={editFlag}
            loading={allLoading}
            sourceKey="waitRelease"
            headerDs={this.headerDs}
            customizeBtnGroup={customizeBtnGroup}
            onSave={this.handleSave}
            setLoading={this.setLoading}
            onDelete={this.handleDelete}
            onRelease={this.handleRelease}
            customizeCode="SSLM.INVESTIGATION_WORKBENCH_DETAIL.WAIT_RELEASE_HEADER_BTNS"
          />
        </Header>
        <React.Fragment>
          <Content className={styles['purchaser-investigate-detail-content']}>
            <Spin spinning={allLoading} wrapperClassName={styles['purchaser-investigate-detail']}>
              <Collapse
                bordered={false}
                defaultActiveKey={['investigateInfo']}
                expandIconPosition="text-right"
                trigger="text-icon"
              >
                <Panel
                  header={intl
                    .get('sslm.investTempConfig.view.title.InvestigateInfo')
                    .d('调查表信息')}
                  key="investigateInfo"
                  forceRender
                >
                  <DetailHeaderWrapper
                    editFlag={editFlag}
                    dataSet={this.headerDs}
                    sourcePage="waitRelease"
                  />
                </Panel>
              </Collapse>
              <div className={styles['purchaser-investigate-detail-line']}>
                <Card
                  bordered={false}
                  title={intl.get('sslm.common.view.title.detailInfo').d('详细信息')}
                >
                  <TempateDetail
                    investigateTemplateId={investigateTemplateId}
                    editable={false}
                    showTabBar={false}
                    investgHeaderId={investgHeaderId}
                  />
                </Card>
              </div>
            </Spin>
          </Content>
        </React.Fragment>
      </React.Fragment>
    );
  }
}
