import { Icon } from 'choerodon-ui';
import React, { Fragment, Component } from 'react';

export default class MobileContainer extends Component {
  render() {
    return (
      <Fragment>
        <div
          style={{
            width: '280px',
            height: '520px',
            background: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '45px',
          }}
        >
          <div
            style={{
              width: 'calc(100% - 20px)',
              height: 'calc(100% - 20px)',
              background: 'white',
              borderRadius: '35px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '40px',
                display: 'flex',
                flexShrink: 0,
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '25%',
                  textAlign: 'right',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  paddingRight: '15px',
                }}
              >
                9:00
              </div>
              <div style={{ paddingRight: '12px' }}>
                <Icon
                  type="battery_charging_full"
                  style={{
                    fontSize: '20px',
                    '-ms-transform': 'rotate(90deg)' /* IE 9 */,
                    '-webkit-transform': 'rotate(90deg)' /* Safari and Chrome */,
                    transform: 'rotate(90deg)',
                  }}
                />
              </div>
              <div
                style={{
                  width: '100%',
                  height: '26px',
                  borderBottomRightRadius: '18px',
                  borderBottomLeftRadius: '18px',
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '50%',
                    height: '26px',
                    borderBottomRightRadius: '18px',
                    borderBottomLeftRadius: '18px',
                    background: 'black',
                  }}
                />
              </div>
            </div>
            <div
              style={{
                width: '100%',
                flexGrow: 1,
                height: '377px',
              }}
            >
              {this.props.children}
            </div>
            <div
              style={{
                width: '100%',
                height: '34px',
                flexShrink: 0,
                display: 'flex',
                position: 'relative',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '4px',
                  borderRadius: '2px',
                  position: 'absolute',
                  background: 'black',
                  marginTop: '20px',
                }}
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
