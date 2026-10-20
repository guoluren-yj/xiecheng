import React, { Fragment, Component } from 'react';
import { Icon } from 'choerodon-ui';

export default class Classify extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentKey: null,
      currentSubDatas: null,
    };
  }

  render() {
    const subDatas = [
      {
        title: '绘画/摄影',
        list: ['华为', '摄影', '艺术画', '袋料画', '水墨画', '版画', '油画'],
      },
      {
        title: '书法',
        list: ['书法'],
      },
      {
        title: '雕塑',
        list: ['雕塑'],
      },
    ];
    const datas = [
      {
        title: '艺术品',
        key: '0',
        subDatas,
      },
      {
        title: '手机通讯',
        key: '1',
        subDatas: [{ title: '品牌', list: ['品牌1', '品牌2', '品牌3'] }],
      },
      {
        title: '测试',
        key: '2',
        subDatas,
      },
      {
        title: '邮币',
        key: '3',
        subDatas,
      },
      {
        title: '社群运营',
        key: '5',
        subDatas,
      },
    ];

    const { currentKey, currentSubDatas } = this.state;
    const key = currentKey || datas[0].key;
    const content = currentSubDatas || datas[0].subDatas;

    return (
      <Fragment>
        <div style={{ width: '100%', height: '100%' }}>
          <div
            style={{
              width: '100%',
              height: '40px',
              padding: '6px 12px',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                background: '#F0F2F5',
                lineHeight: '28px',
                borderRadius: '14px',
                flexGrow: 1,
                padding: '0 12px',
                margin: '0 6px',
                color: '#AFAFAF',
              }}
            >
              请输入搜索信息
            </span>
            <Icon style={{ color: '#AFAFAF' }} type="dashboard_customize-o" />
          </div>
          <div
            style={{
              widht: '100%',
              height: 'calc(100% - 40px)',
              display: 'flex',
              borderTop: '6px #F0F2F5 solid',
            }}
          >
            <div style={{ width: '80px', flexShrink: 0, background: '#F0F2F5' }}>
              {datas.map((i) => {
                const isActive = i.key === key;
                return (
                  <div
                    style={{
                      width: '100%',
                      lineHeight: '34px',
                      textAlign: 'center',
                      background: isActive ? 'white' : '#F0F2F5',
                      color: isActive ? '#F56349' : '#757575',
                      fontSize: '13px',
                    }}
                    onClick={() => {
                      this.setState({
                        currentKey: i.key,
                        currentSubDatas: i.subDatas,
                      });
                    }}
                  >
                    {i.title}
                  </div>
                );
              })}
            </div>
            <div
              style={{
                background: 'white',
                flexGrow: 1,
              }}
            >
              {content.map((i) => {
                return (
                  <div style={{ width: '100%', paddingBottom: '40px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginLeft: '10px' }}>
                      {i.title}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                      }}
                    >
                      {i.list.map((n) => {
                        return (
                          <div
                            style={{
                              width: '33%',
                              lineHeight: '32px',
                              textAlign: 'center',
                              fontSize: '12px',
                            }}
                          >
                            {n}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
