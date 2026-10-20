import React, { useEffect, useState } from 'react';
import { externalImportByTenantNum } from 'hzero-boot/lib/utils/remote';
import { getCurrentTenant } from 'utils/utils';
import { EventManager } from 'choerodon-ui/dataset';

export class Expose {
  static IS_REMOTE = true;

  constructor(props = {}) {
    this.props = props;
    const eventManager = new EventManager();
    this.event = eventManager;
    const { events } = props;
    if (events) {
      Object.keys(events).forEach(eventName => {
        eventManager.addEventListener(eventName, events[eventName]);
      });
    }
  }

  render(code, children, renderProps) {
    const { render } = this.props;
    const Renderer = render && render[code];
    if (Renderer) {
      return (
        <Renderer renderProps={renderProps}>
          {children}
        </Renderer>
      );
    }
    return children;
  }

  process(code, target, ...args) {
    const { process } = this.props;
    const processFunc = process && process[code];
    if (processFunc) {
      return processFunc(target, ...args);
    }
    return target;
  }
}

const defaultRemote = new Expose();

function merge(oldProps, newProps) {
  if (newProps) {
    Object.keys(newProps).forEach(key => {
      oldProps[key] = {
        ...oldProps[key],
        ...newProps[key],
      };
    });
  }
  return oldProps;
}

export default function remote({ code, name = 'remote', tenantNum: propsTenantNum }, defaultExposeProps) {
  return (Component) => {
    if (code) {
      return (props) => {

        const [remote, setRemote] = useState(null);

        useEffect(() => {
          const { tenantNum: currentTenantNum } = getCurrentTenant() || {};
          const tenantNum = propsTenantNum || currentTenantNum;
          if (tenantNum) {
            (async () => {
              let module;
              try {
                module = await externalImportByTenantNum(tenantNum, code);
              } catch (e) {
                console.log(e)
              }
              const exposeProps = { ...defaultExposeProps };
              if (module) {
                const expose = module.default || module;
                if (expose) {
                  if (expose.constructor.IS_REMOTE) {
                    setRemote(new Expose(merge(exposeProps, expose.props)));
                    return;
                  } else {
                    throw new Error(`The type of remote<${code}> is not a Expose`);
                  }
                }
              }
              if (defaultExposeProps) {
                setRemote(new Expose(exposeProps));
              } else {
                setRemote(defaultRemote);
              }
            })();
          }
        }, []);

        if (remote === null) {
          return null;
        }
        const p = {
          ...props,
          [name]: remote,
        };

        return <Component {...p} />;
      };
    }
    return Component;
  };
}
