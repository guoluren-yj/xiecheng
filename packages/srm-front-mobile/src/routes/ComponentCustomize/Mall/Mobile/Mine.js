import React, { Fragment, Component } from 'react';
import { Icon } from 'choerodon-ui';

export default class Mine extends Component {
  render() {
    const funs1 = ['待审批', '待发货', '待收货', '评价'];
    const funs2 = ['我的收藏', '提报申请', '我的售后', 'SRM'];
    return (
      <Fragment>
        <div
          style={{
            width: '100%',
            height: '80px',
            background: '#F56349',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            fontSize: '14px',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '25px',
              background: 'white',
              color: '#757575',
              lineHeight: '50px',
              textAlign: 'center',
            }}
          >
            头像
          </div>
          <div style={{ margin: '0 6px', flexGrow: 1 }}>
            <div>张三</div>
            <div style={{ fontSize: '12px' }}>上海甄云信息技术有限公司</div>
          </div>
          <Icon type="settings" />
        </div>
        <div
          style={{
            width: '100%',
            fontSize: '12px',
            padding: '6px 10px',
            background: 'white',
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>我的订单</div>
            <div style={{ color: '#AFAFAF' }}>{'全部订单 >'}</div>
          </div>
          <div
            style={{
              display: 'flex',
              width: '100%',
            }}
          >
            {funs1.map((i) => {
              return (
                <div
                  style={{
                    width: '25%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: '6px',
                  }}
                >
                  <div
                    style={{
                      background: '#afafaf',
                      width: '20px',
                      height: '20px',
                      lineHeight: '20px',
                      textAlign: 'center',
                    }}
                  >
                    图
                  </div>
                  <div style={{ padding: '6px 0' }}>{i}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{
            width: '100%',
            fontSize: '12px',
            padding: '6px 10px',
            background: 'white',
            marginTop: '6px',
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>常用功能</div>
          </div>
          <div
            style={{
              display: 'flex',
              width: '100%',
            }}
          >
            {funs2.map((i) => {
              return (
                <div
                  style={{
                    width: '25%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: '6px',
                  }}
                >
                  <div
                    style={{
                      background: '#afafaf',
                      width: '20px',
                      height: '20px',
                      lineHeight: '20px',
                      textAlign: 'center',
                    }}
                  >
                    图
                  </div>
                  <div style={{ padding: '6px 0' }}>{i}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Fragment>
    );
  }
}
