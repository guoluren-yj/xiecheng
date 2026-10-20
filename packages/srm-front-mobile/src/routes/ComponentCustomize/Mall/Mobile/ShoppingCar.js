import React, { Fragment, Component } from 'react';
import { Icon } from 'choerodon-ui';

export default class ShoppingCar extends Component {
  render() {
    const ShopItem = ({ shop }) => {
      return (
        <div style={{ width: '100%', background: 'white' }}>
          <div
            style={{
              display: 'flex',
              padding: '0 10px',
              margin: '3px 0px',
              lineHeight: '28px',
              alignItems: 'center',
            }}
          >
            <Icon type="radio_button_unchecked" style={{ color: '#AFAFAF' }} />
            <div style={{ marginLeft: '6px', fontWeight: 'bold' }}>{shop.company}</div>
          </div>
          {shop.list.map((i) => {
            return (
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderBottom: '1px #FAFAFA solid',
                }}
              >
                <Icon type="radio_button_unchecked" style={{ color: '#AFAFAF', flexShrink: 0 }} />
                <div
                  style={{
                    width: '80px',
                    lineHeight: '80px',
                    background: '#FAFAFA',
                    marginLeft: '6px',
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  商品图片
                </div>
                <div
                  style={{
                    color: '#757575',
                    flexGrow: 1,
                    height: '80px',
                    paddingLeft: '6px',
                  }}
                >
                  <div>{i.name}</div>
                  <div style={{ color: '#F56349' }}>{i.price}</div>
                </div>
                <div
                  style={{
                    lineHeight: '24px',
                    fontSize: '16px',
                    flexShrink: 0,
                    display: 'flex',
                  }}
                >
                  -
                  <div
                    style={{
                      background: '#f2f2f2',
                      fontSize: '12px',
                      padding: '0 6px',
                      margin: '0 3px',
                      borderRadius: '6px',
                    }}
                  >
                    {i.num}
                  </div>
                  +
                </div>
              </div>
            );
          })}
        </div>
      );
    };
    const datas = [
      {
        company: '上海甄云信息技术有限公司',
        list: [
          {
            name: '商品1',
            price: '6.66',
            num: 1,
          },
        ],
      },
      {
        company: '汉得信息',
        list: [
          {
            name: '商品2',
            price: '999.00',
            num: 100,
          },
          {
            name: '商品3',
            price: '876.00',
            num: 99,
          },
          {
            name: '商品4',
            price: '876.00',
            num: 10,
          },
        ],
      },
    ];
    return (
      <Fragment>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              width: '100%',
              lineHeight: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              flexShrink: 0,
              padding: '0 10px',
              background: 'white',
            }}
          >
            <span style={{ flexGrow: 1 }}>
              当前共有<span style={{ color: '#F56349' }}>1</span>件商品
            </span>
            <span style={{ color: '#F56349', padding: '0 6px' }}>编辑</span>
            <span style={{ color: '#F56349', padding: '0 6px' }}>更多</span>
          </div>
          <div
            className="mall-mobile-scroll"
            style={{
              width: '100%',
              flexGrow: 1,
              overflow: 'scroll',
            }}
          >
            {datas.map((i) => {
              return <ShopItem shop={i} />;
            })}
          </div>
          <div
            style={{
              width: '100%',
              background: 'white',
              display: 'flex',
              lineHeight: '40px',
              alignItems: 'center',
              padding: '0 10px',
              fontSize: '12px',
            }}
          >
            <div style={{ color: '#AFAFAF', display: 'flex', alignItems: 'center' }}>
              <Icon type="radio_button_unchecked" />
              <span style={{ marginLeft: '6px' }}>全选</span>
            </div>
            <div
              style={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                paddingRight: '10px',
              }}
            >
              <div style={{ fontSize: '12px', lineHeight: '12px' }}>合计: ¥0</div>
              <div style={{ fontSize: '12px', lineHeight: '12px', marginTop: '6px' }}>
                共0件商品
              </div>
            </div>
            <div
              style={{
                padding: '0 10px',
                height: '24px',
                borderRadius: '12px',
                background: '#F56349',
                color: 'white',
                lineHeight: '24px',
              }}
            >
              下一步
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
