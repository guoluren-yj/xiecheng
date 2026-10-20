import React, { Component } from 'react';
import { Popover, Spin, Table, Checkbox, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import BigNumber from 'bignumber.js';

import { approveNameRender } from '@/utils/util';
import intl from 'utils/intl';
import request from 'utils/request';
import { getAccessToken } from 'utils/utils';
import { HZERO_HWFP, API_HOST } from 'utils/config';
import LegendCard from '../LegendCard';

const prefix = `${HZERO_HWFP}/v1`;

export default class FlowChart extends Component {
  processImage;

  // 图片 dom
  imageEl;

  // 拖动起始位置
  moveStartPos = { x: 0, y: 0 };

  // 拖动距离
  moveDiff = { x: 0, y: 0 };

  // 拖动状态
  isMoving = false;

  state = {
    // forecastData: {},
    moveOffset: {
      x: 0,
      y: 0,
    },
  };

  @Bind()
  renderMorePosition(positionData) {
    const columns = [
      {
        title: intl.get('hwfp.common.model.approval.position').d('岗位'),
        dataIndex: 'positionName',
        width: 150,
      },
      {
        title: intl.get('hwfp.common.model.approval.department').d('所属部门'),
        dataIndex: 'unitName',
        width: 150,
      },
      {
        title: intl.get('hwfp.common.model.approval.isPrimaryPosition').d('是否主岗'),
        dataIndex: 'primaryPositionFlag',
        width: 150,
        render: (value) => <Checkbox checked={value === 1} disabled />,
      },
    ];
    return <Table columns={columns} dataSource={positionData} pagination={false} />;
  }

  @Bind()
  getForecastDiagramTRs(data) {
    const dataSource = [];
    const historyList = data.history || [];
    const forecastList = data.forecast;
    if (data.executed || historyList) {
      for (let i = 0; i < historyList.length; i += 1) {
        const assigneeName = historyList[i].assigneeName || '';
        const positionName = historyList[i].positionName || '';
        const unitName = historyList[i].unitName || '';
        dataSource.push({
          assigneeName,
          positionName,
          unitName,
          action: historyList[i].action,
          endTime: historyList[i].endTime,
          startTime: historyList[i].startTime,
          id: historyList[i].id,
          flag: true,
          employeeAssignList: historyList[i].employeeAssignList,
        });
      }
    }
    if (forecastList) {
      for (let i = 0; i < forecastList.length; i += 1) {
        const employeeCode = forecastList[i].employeeCode || '';
        const positionName = forecastList[i].positionName || '';
        const unitName = forecastList[i].unitName || '';
        dataSource.push({
          assigneeName: forecastList[i].name,
          employeeCode,
          positionName,
          unitName,
          action: '',
          endTime: '',
          flag: false,
          employeeAssignList: forecastList[i].employeeAssignList,
        });
      }
    }
    return dataSource;
  }

  @Bind()
  getForecastDiagramContent(data) {
    const dataSource = this.getForecastDiagramTRs(data);
    const columns = [
      {
        title: intl.get('hwfp.common.model.approval.owner').d('审批人'),
        dataIndex: 'assigneeName',
        render: (_, record) => <span>{record.assigneeName}</span>,
      },
      {
        title: intl.get('entity.position.name').d('岗位名称'),
        dataIndex: 'positionName',
        render: (value, record) => {
          const { employeeAssignList } = record;
          return (
            <span>
              {value}
              {employeeAssignList && employeeAssignList.length > 0 && (
                <Popover
                  content={this.renderMorePosition(employeeAssignList)}
                  placement="bottomLeft"
                >
                  <a style={{ marginLeft: '8px' }}>
                    {intl.get('hzero.common.button.option').d('更多')}
                    <Icon type="down" style={{ verticalAlign: 'middle', marginLeft: '2px' }} />
                  </a>
                </Popover>
              )}
            </span>
          );
        },
      },
      {
        title: intl.get('entity.department.name').d('部门名称'),
        dataIndex: 'unitName',
      },
      {
        title: intl.get('hwfp.common.model.approval.action').d('审批动作'),
        dataIndex: 'action',
        render: approveNameRender,
      },
      {
        title: intl.get('hwfp.common.model.approval.startTime').d('流程开始时间'),
        dataIndex: 'startTime',
      },
      {
        title: intl.get('hwfp.common.model.approval.time').d('审批时间'),
        dataIndex: 'endTime',
      },
    ];
    return (
      <div key={data.taskId}>
        <Table bordered columns={columns} dataSource={dataSource} pagination={false} />
      </div>
    );
  }

  @Bind()
  getForecastDiagram(offsetLeft, offsetTop, data) {
    const { moveOffset } = this.state;
    const grapINfo = data.graphicInfo;
    const left = BigNumber.isBigNumber(grapINfo.x)
      ? grapINfo.x.toNumber() + offsetLeft
      : grapINfo.x + offsetLeft + moveOffset.x;
    const top = BigNumber.isBigNumber(grapINfo.y)
      ? grapINfo.y.toNumber()
      : grapINfo.y + moveOffset.y;
    const width = BigNumber.isBigNumber(grapINfo.width)
      ? grapINfo.width.toNumber()
      : grapINfo.width;
    const height = BigNumber.isBigNumber(grapINfo.height)
      ? grapINfo.height.toNumber()
      : grapINfo.height;
    if (data.forecastErrorFlag) {
      return (
        <Tooltip
          key={data.taskId}
          theme="light"
          title={intl.get('hwfp.common.view.message.forecastError').d('当前节点预测失败')}
        >
          <div
            id={data.taskId}
            name="svgDiv"
            style={{
              width,
              height,
              position: 'absolute',
              left,
              top,
            }}
          />
        </Tooltip>
      );
    }
    return (
      <Popover
        content={this.getForecastDiagramContent(data)}
        title={intl.get('hwfp.common.model.approval.record').d('审批记录')}
        key={data.taskId}
      >
        <div
          id={data.taskId}
          name="svgDiv"
          style={{
            width,
            height,
            position: 'absolute',
            left,
            top,
          }}
        />
      </Popover>
    );
  }

  getForecastData = (data) => {
    const forecastDiagrams = [];
    if (data) {
      const { offsetTop = 0 } = this.processImage || {};
      for (let i = 0; i < data.length; i += 1) {
        const div = this.getForecastDiagram(0, offsetTop, data[i]);
        forecastDiagrams.push(div);
      }
    }
    return forecastDiagrams;
  };

  /**
   * 获取流程预览及预测图路径.
   * @returns {*} 流程预览及预测图路径
   */
  @Bind()
  processImageSrc() {
    const { tenantId, match, uselessParam } = this.props;
    const accessToken = getAccessToken('access_token');
    return `${API_HOST}${prefix}/${tenantId}/process/instance/diagram/${match.params.id}?access_token=${accessToken}&t=${uselessParam}`;
  }

  componentDidMount = () => {
    const { autoRequest, tenantId, match, processInstanceId } = this.props;
    if (!autoRequest) {
      return;
    }
    request(
      `${API_HOST}${prefix}/${tenantId}/process/instance/forecast/${
        processInstanceId || match.params.processInstanceId
      }`,
      { method: 'GET' }
    ).then((res) => this.setState({ forecastData: res || [] }));
  };

  handleMouseDown = (event) => {
    event.preventDefault();
    if (!this.imageEl) {
      return;
    }
    this.moveStartPos = {
      x: event.clientX - this.imageEl.offsetLeft,
      y: event.clientY - this.imageEl.offsetTop,
    };
    this.isMoving = true;
    event.target.addEventListener('mousemove', this.handleMouseMove);
  };

  handleMouseMove = (event) => {
    if (this.isMoving) {
      const newX = event.clientX - this.moveStartPos.x;
      const newY = event.clientY - this.moveStartPos.y;
      this.imageEl.style.left = `${newX}px`;
      this.imageEl.style.top = `${newY}px`;
      this.moveDiff = {
        x: newX,
        y: newY,
      };
    }
  };

  handleMouseUp = (event) => {
    this.isMoving = false;
    this.setState({
      moveOffset: {
        x: this.moveDiff.x,
        y: this.moveDiff.y,
      },
    });
    event.target.removeEventListener('mousemove', this.handleMouseMove);
  };

  handleMouseLeave = () => {
    this.isMoving = false;
    this.setState({
      moveOffset: {
        x: this.moveDiff.x,
        y: this.moveDiff.y,
      },
    });
    event.target.removeEventListener('mousemove', this.handleMouseMove);
  };

  render() {
    const { autoRequest, loading = false, canMove = false } = this.props;
    const forecastData = autoRequest ? this.state.forecastData : this.props.forecastData;
    return (
      <Spin spinning={loading}>
        <div
          style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}
          onMouseDown={canMove ? this.handleMouseDown : undefined}
          onMouseUp={canMove ? this.handleMouseUp : undefined}
          onMouseLeave={canMove ? this.handleMouseLeave : undefined}
        >
          <LegendCard />
          <div
            id="processImg"
            style={{
              // overflow: 'auto',
              width: '100%',
              height: '100%',
              marginTop: '0.16rem',
              position: 'relative',
              cursor: canMove ? 'grab' : 'default',
              overflow: canMove ? 'hidden' : 'auto',
            }}
            ref={(ref) => {
              this.processImage = ref;
            }}
          >
            <img
              alt={intl.get('hwfp.common.model.process.graph').d('流程图')}
              id="svg"
              type="image/svg+xml"
              src={this.processImageSrc()}
              style={{ position: canMove ? 'absolute' : 'relative' }}
              ref={(ref) => {
                this.imageEl = ref;
              }}
            />
            {this.getForecastData(forecastData)}
          </div>
        </div>
      </Spin>
    );
  }
}
