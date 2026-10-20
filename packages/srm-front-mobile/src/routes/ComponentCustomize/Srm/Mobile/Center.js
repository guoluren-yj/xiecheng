import React, { Fragment, Component } from 'react';
import { Icon } from 'choerodon-ui';

import banner from './image/default_banner.png';
import noInfo from './image/no_info.png';

export default class Center extends Component {
  constructor(props) {
    super(props);
    this.state = {
      announcementKey: 0,
    };
  }

  render() {
    const { announcementKey } = this.state;

    const { configs } = this.props;

    const SearchView = () => {
      return (
        <div
          style={{
            background: '#eee',
            flexGrow: 1,
            height: '26px',
            borderRadius: '6px',
            padding: '6px 12px',
            lineHeight: '12px',
          }}
        >
          搜索联系人
        </div>
      );
    };

    const subApps = [
      {
        name: '审批',
        icon: 'shopping_bag-o',
      },
      {
        name: '供应商',
        icon: 'person_add-o',
      },
      {
        name: '调查表',
        icon: 'contact_page-o',
      },
      {
        name: '更多应用',
        icon: 'content_copy-o',
      },
    ];

    return (
      <Fragment>
        <div className="srm-mobile-page-center">
          {configs['1'] && configs['2'] ? null : (
            <div className="srm-mobile-page-center-title">
              {configs['1'] ? null : <SearchView />}
              {configs['2'] ? null : (
                <Icon type="crop_free" style={{ flexShrink: 0, marginLeft: '6px' }} />
              )}
            </div>
          )}
          <div
            className="srm-mobile-scroll"
            style={{
              flexFlow: 1,
              overflow: 'scroll',
              width: '100%',
            }}
          >
            {configs['3'] ? null : (
              <img
                src={banner}
                alt=""
                style={{ width: '100%', height: '120px', padding: '6px 12px' }}
              />
            )}
            {configs['4'] ? null : (
              <div
                style={{
                  width: 'calc(100% - 24px)',
                  height: '55px',
                  margin: '6px 12px',
                  padding: '0 12px',
                  display: 'flex',
                  background: 'white',
                  alignItems: 'center',
                  borderRadius: '6px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '18px',
                    background: '#276EF1',
                    fontSize: '16px',
                    lineHeight: '36px',
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  张
                </div>
                <div
                  style={{
                    flexGrow: 1,
                    marginLeft: '12px',
                  }}
                >
                  <div
                    style={{
                      color: '#333',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    张三 租户管理员
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#333',
                    }}
                  >
                    上海甄云信息技术有限公司
                  </div>
                </div>
                <div
                  style={{
                    color: '#276EF1',
                    fontSize: '12px',
                    lineHeight: '32px',
                    fontWeight: 'bold',
                  }}
                >
                  切换
                </div>
              </div>
            )}
            {configs['5'] ? null : (
              <div
                style={{
                  height: '64px',
                  width: 'calc(100% - 24px)',
                  margin: '6px 12px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}
              >
                {subApps.map((subApp) => (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 'calc(25% - 5px)',
                      flexShrink: 0,
                      background: 'white',
                      borderRadius: '5px',
                    }}
                  >
                    <Icon type={subApp.icon} style={{ color: '#276EF1', fontSize: '20px' }} />
                    <div style={{ fontSize: '12px' }}>{subApp.name}</div>
                  </div>
                ))}
              </div>
            )}
            {configs['12'] ? null : (
              <div
                style={{
                  margin: '6px 12px',
                  width: 'calc(100% - 24px)',
                  background: 'white',
                  borderRadius: '6px',
                  height: '45px',
                  lineHeight: '45px',
                  padding: '0 12px',
                  fontSize: '12px',
                }}
              >
                当前有<span style={{ color: 'red' }}>99</span>条待办未处理，请及时处理
              </div>
            )}
            {configs['10'] ? null : (
              <div
                style={{
                  width: 'calc(100% - 24px)',
                  background: 'white',
                  borderRadius: '6px',
                  margin: '6px 12px',
                  height: '220px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'end',
                    height: '30px',
                  }}
                >
                  <div
                    style={{
                      color: '#333',
                      fontSize: announcementKey === 0 ? '14px' : '12px',
                      fontWeight: announcementKey === 0 ? 'bold' : '400',
                      marginLeft: '12px',
                    }}
                    onClick={() => this.setState({ announcementKey: 0 })}
                  >
                    企业公告
                  </div>
                  <div
                    style={{
                      color: '#333',
                      fontSize: announcementKey === 1 ? '14px' : '12px',
                      fontWeight: announcementKey === 1 ? 'bold' : '400',
                      marginLeft: '16px',
                    }}
                    onClick={() => this.setState({ announcementKey: 1 })}
                  >
                    平台公告
                  </div>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '150px',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <img src={noInfo} alt="" style={{ width: '250px', height: '150px' }} />
                </div>
                <div style={{ width: '100%', textAlign: 'center' }}>暂无公告信息</div>
              </div>
            )}
          </div>
        </div>
      </Fragment>
    );
  }
}
