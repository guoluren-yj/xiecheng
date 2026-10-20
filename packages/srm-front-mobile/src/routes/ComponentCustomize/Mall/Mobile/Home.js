import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import defaultBanner from './image/default_banner@2x.png';

export default class Home extends Component {
  render() {
    const { configs } = this.props;
    const shops = [
      {
        name: '商品1',
        price: '11.99',
      },
      {
        name: '商品2',
        price: '22.00',
      },
      {
        name: '商品3',
        price: '¥9999.00',
      },
    ];
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            height: '40px',
            justifyContent: 'space-between',
            padding: '6px 12px',
            background: 'white',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#F56349' }}>上海市</span>
          <span
            style={{
              background: '#F0F2F5',
              lineHeight: '28px',
              borderRadius: '14px',
              flexGrow: 1,
              padding: '0 12px',
              margin: '0 6px',
              display: configs['1'] ? 'none' : 'block',
              color: '#AFAFAF',
            }}
          >
            请输入搜索信息
          </span>
          <Icon style={{ color: '#AFAFAF' }} type="dashboard_customize-o" />
        </div>
        <div
          className="mall-mobile-scroll"
          style={{
            width: '100%',
            flexGrow: 1,
            overflow: 'scroll',
            padding: '0 12px',
          }}
        >
          {configs['2'] ? null : (
            <img
              src={defaultBanner}
              alt=""
              style={{ width: '100%', height: '100px', margin: '6px 0' }}
            />
          )}
          <div
            style={{
              width: '100%',
              background: 'white',
              borderRadius: '6px',
              padding: '0 12px',
              margin: '6px 0',
              display: configs['3'] ? 'none' : 'block',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>商品推荐</span>
              <span style={{ fontSize: '12px' }}>更多商品</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {shops.map((i) => {
                return (
                  <div
                    style={{
                      width: 'calc(33% - 4px)',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '70px',
                        lineHeight: '70px',
                        textAlign: 'center',
                        background: '#fafafa',
                      }}
                    >
                      商品图片
                    </div>
                    <div style={{ padding: '3px 0' }}>{i.name}</div>
                    <div style={{ paddingBottom: '10px', color: '#F56349' }}>{i.price}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
