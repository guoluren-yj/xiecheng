import React, { Fragment, Component } from 'react';

export default class Message extends Component {
  render() {
    return (
      <Fragment>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px',
            background: 'white',
          }}
        >
          <span style={{ color: '#757575' }}>已订阅1频道</span>
          <span style={{ color: 'blue' }}>频道订阅</span>
        </div>
        <div
          style={{
            width: '100%',
            padding: '0 12px',
            height: '50px',
            display: 'flex',
            background: 'white',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '18px',
              background: '#276EF1',
              lineHeight: '36px',
              textAlign: 'center',
              color: 'white',
              fontSize: '16px',
            }}
          >
            图
          </div>
          <div style={{ paddingLeft: '12px', fontSize: '12px' }}>
            <div style={{ color: '#333' }}>系统消息</div>
            <div style={{ color: '#757575' }}>暂无消息</div>
          </div>
        </div>
      </Fragment>
    );
  }
}
