import React, { Fragment, Component } from 'react';
import { Icon } from 'choerodon-ui';

export default class Mine extends Component {
  render() {
    const MineItem = ({ title, subtitle, arrow = true }) => {
      return (
        <div
          style={{
            height: '40px',
            width: '100%',
            padding: '0 10px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f2f2f2',
          }}
        >
          <div style={{ color: '#333', fontSize: '13px', flexGrow: 1 }}>{title}</div>
          <div style={{ color: '#757575', fontSize: '12px' }}>{subtitle}</div>
          {arrow ? <Icon type="keyboard_arrow_right" style={{ fontSize: '12px' }} /> : null}
        </div>
      );
    };

    const { configs } = this.props;

    return (
      <Fragment>
        <div
          style={{ width: '100%', height: '100%', overflow: 'scroll' }}
          className="srm-mobile-scroll"
        >
          <div
            style={{
              width: '100%',
              background: '#276EF1',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                margin: '0 10px',
                background: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                color: '#333',
                textAlign: 'center',
                lineHeight: '40px',
              }}
            >
              头像
            </div>
            <div style={{ color: 'white' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>张三</div>
              <div>上海甄云信息技术有限公司</div>
            </div>
          </div>
          <div style={{ width: '100%', borderBottom: '4px solid #f2f2f2' }}>
            <MineItem title="解除绑定/退出登录" />
            <MineItem title="语言" subtitle="简体中文" />
            <MineItem title="时区" subtitle="北京" />
          </div>
          <div style={{ width: '100%', borderBottom: '4px solid #f2f2f2' }}>
            <MineItem title="更改密码" />
            <MineItem title="绑定手机" subtitle="1xxxxxxxxxx" />
          </div>
          {configs['11'] ? null : (
            <div style={{ width: '100%', borderBottom: '4px solid #f2f2f2' }}>
              <MineItem title="关于甄采云" subtitle="当前版本 1.0.0" arrow={false} />
            </div>
          )}
        </div>
      </Fragment>
    );
  }
}
