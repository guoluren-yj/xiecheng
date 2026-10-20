import React, { Fragment, Component } from 'react';
import noInfo from './image/no_info.png';

export default class Contact extends Component {
  render() {
    const SectionTitle = ({ title }) => {
      return (
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            padding: '12px 12px 6px 12px',
            background: 'white',
          }}
        >
          {title}
        </div>
      );
    };
    return (
      <Fragment>
        <div
          style={{
            width: '100%',
            height: '38px',
            background: 'white',
            lineHeight: '26px',
            padding: '6px 12px',
          }}
        >
          <div style={{ background: '#f2f2f2', paddingLeft: '6px' }}>搜索联系人</div>
        </div>
        <div
          style={{ width: '100%', height: 'calc(100% - 18px)', overflow: 'scroll' }}
          className="srm-mobile-scroll"
        >
          <SectionTitle title="公司架构" />
          <div
            style={{
              display: 'flex',
              padding: '12px',
              background: 'white',
              alignItems: 'center',
              borderBottom: '6px solid #f2f2f2',
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
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginLeft: '6px' }}>
              上海甄云科技有限公司
            </div>
          </div>
          <SectionTitle title="合作伙伴" />
          <div
            style={{
              display: 'flex',
              padding: '12px',
              background: 'white',
              alignItems: 'center',
              borderBottom: '6px solid #f2f2f2',
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
                fontSize: '12px',
              }}
            >
              图
            </div>
            <div style={{ fontSize: '14px', marginLeft: '10px' }}>外部联系人</div>
          </div>
          <SectionTitle title="常用联系人" />
          <div style={{ width: '100%', background: 'white', paddingBottom: '40px' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <img src={noInfo} alt="" style={{ width: '250px', height: '150px' }} />
            </div>
            <div style={{ textAlign: 'center' }}>暂无常用联系人</div>
          </div>
        </div>
      </Fragment>
    );
  }
}
