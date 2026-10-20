import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { getResponse } from 'utils/utils';
import { queryChangeInfo } from '@/services/purchaseContractViewService';

import CollapseRender from './CollapseRender';

@connect()
export default class CatelogRender extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      newData: [],
      oldData: [],
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  @Bind()
  fetchData() {
    const {
      // dispatch,
      queryPayload: { dataRender, ...payload },
      oldKey,
      newKey,
    } = this.props;
    // 此处不用dispatch,因为这个组件采/供双方都会使用，不想在routes给我收到的协议/协议签署里增加purchaseContractView
    // 的models了，继承二开的路由要扫描比较麻烦，所以这里直接使用services。
    queryChangeInfo(payload).then((res) => {
      let state = {
        loading: false,
      };
      if (getResponse(res)) {
        const data = dataRender ? dataRender(res) : res;
        state = {
          ...state,
          newData: data[newKey],
          oldData: data[oldKey],
        };
      }
      this.setState(state);
    });
  }

  render() {
    const { loading, newData, oldData } = this.state;
    const {
      width = '100vw',
      catelogId,
      catelogTitle,
      anchorId,
      tab = false,
      fields = [],
      ...rest
    } = this.props;

    const oldProps = {
      loading,
      data: oldData,
      catelogId,
      catelogTitle,
      tab,
      fields,
      ...rest,
    };

    const newProps = {
      loading,
      data: newData,
      catelogId,
      catelogTitle,
      tab,
      fields,
      isNewFlag: true,
      ...rest,
    };

    return (
      <div
        id={anchorId}
        key={catelogId}
        className="catelog-wrapper"
        style={{ width: `${width}px` }}
      >
        <CollapseRender {...oldProps} />
        <div style={{ width: '20px' }} />
        <CollapseRender {...newProps} />
      </div>
    );
  }
}
