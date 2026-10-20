import React, { PureComponent } from 'react';
import { Table, DataSet, Tooltip } from 'choerodon-ui/pro';
import { Drawer, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { fetchScoreDetailCurrent, fetchScoreDetailHistory } from '@/services/inquiryHallNewService';
import { ScoreEleDetailDS } from './ScoreEleDetailDS';
import { renderCompareSymbol } from '../NewDetail/utils';


export default class ScoreEleDetailModal extends PureComponent {
  constructor(props) {
    super(props);

    this.organizationId = getCurrentOrganizationId();
  }

  ScoreEleDetailDS = new DataSet(ScoreEleDetailDS());

  componentDidMount() {
    this.initPage();
  }

  componentWillUnmount() {
    this.clearAllData();
  }

  initPage = () => {
    this.initDS();
    this.fetchData();
  };

  initDS = () => {
    const { currentMode = null, elementRecord = {}, header = {} } = this.props;
    const {
      evaluateIndicAdjustId: parentIndicateAdjustId = null,
      evaluateIndicId: parentIndicateId = null,
    } = elementRecord;
    const { sourceType = null } = header;

    const queryParams = {
      currentMode,
      indicateLevel: 'TWO',
      sourceType,
      templateEleDetailFlag: 1, // 模板评分要素下的评分要素细项标志
      organizationId: this.organizationId,
      parentIndicateAdjustId,
      parentIndicateId,
    };
    this.ScoreEleDetailDS.setQueryParameter('commonProps', queryParams);
  };

  fetchData = async () => {
    const { currentMode = null, elementRecord = {}, header = {} } = this.props;
    const {
      evaluateIndicAdjustId: parentIndicateAdjustId = null,
      evaluateIndicId: parentIndicateId = null,
      adjustRecordId = null,
    } = elementRecord;
    const { sourceType = null, tenantId } = header;

    const queryParams = {
      indicateLevel: 'TWO',
      sourceType,
      templateEleDetailFlag: 1, // 模板评分要素下的评分要素细项标志
      organizationId: this.organizationId,
      parentIndicateAdjustId,
      parentIndicateId,
      tenantId,
      adjustRecordId,
    };

    try {
      let data = null;
      if (!currentMode || currentMode === 'current') {
        data = await fetchScoreDetailCurrent(queryParams);
      }
      if (currentMode === 'history') {
        data = await fetchScoreDetailHistory(queryParams);
      }
      data = getResponse(data);
      const { content = [] } = data || {};
      if (!data || isEmpty(content)) {
        return;
      }

      this.ScoreEleDetailDS.loadData(content);
    } catch (e) {
      throw e;
    }
  };

  clearAllData = () => {
    this.ScoreEleDetailDS.reset();
    this.ScoreEleDetailDS.loadData();
  };

  handleModalHide = () => {
    const { onHideModal = () => {} } = this.props;
    this.clearAllData();

    onHideModal();
  };

  /**
   * 评分要素-行-查询
   * @param {Object} page
   */
  @Bind()
  fetchElementsDetailLine(page = {}) {
    const { dispatch, elementRecord } = this.props;
    dispatch({
      type: 'inquiryHall/fetchScoreDetailLevelTwoOfQuotationController',
      payload: {
        page,
        indicateLevel: 'TWO',
        templateEleDetailFlag: 1, // 模板评分要素下的评分要素细项标志
        ...this.renderQueryParams(elementRecord),
      },
    });
  }

  render() {
    const { visible, currentMode = null, header } = this.props;

    const columns = [
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.indicateDetailCode`)
          .d('评分要素细项编码'),
        name: 'indicateCode',
        width: 150,
        renderer: (props) => renderCompareSymbol(props, currentMode),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.indicateDetailName`)
          .d('评分要素细项名称'),
        name: 'indicateName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.elements.remark`).d('评分细则'),
        name: 'remark',
        width: 150,
        renderer: ({ value }) => {
          return (
            <Tooltip
              popupStyle={{
                whiteSpace: 'pre-wrap',
                minWidth: '400',
              }}
              title={() => <span>{value}</span>}
              placement="left"
            >
              {value}
            </Tooltip>
          );
        },
        tooltip: 'none',
      },
      !['SCORE', 'SCORE_NEW'].includes(header.templateScoreType)
        ? {
            title: <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}%</span>,
            name: 'weight',
            width: 100,
          }
        : null,
      header.templateScoreType !== 'WEIGHT'
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minScore`).d('最低分'),
            name: 'minScore',
            width: 100,
          }
        : null,
      header.templateScoreType !== 'WEIGHT'
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScore`).d('最高分'),
            name: 'maxScore',
            width: 100,
          }
        : null,
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.defaultScore`).d('缺省分'),
        name: 'defaultScore',
        width: 100,
      },
    ].filter(Boolean);

    // 这里有bug，漏了个性化

    return (
      <React.Fragment>
        <Drawer
          destroyOnClose
          width="1090px"
          visible={visible}
          // onClose={this.handleModalHide}
          closable={false}
          footer={null}
          title={intl.get('ssrc.inquiryHall.view.title.elementsDetail').d('评分要素细项')}
        >
          <Table
            dataSet={this.ScoreEleDetailDS}
            bordered
            rowKey="indicateAdjustId"
            columns={columns}
            onChange={(page) => this.fetchData(page)}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'left',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button onClick={() => this.handleModalHide()}>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭')}
            </Button>
          </div>
        </Drawer>
      </React.Fragment>
    );
  }
}
