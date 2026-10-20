/* eslint-disable func-names */
/**
 * 个性化组件
 * @date: 2020-3-11
 * @version: 0.0.1
 * @author: zhaotong <tong.zhao@hand-china.com>
 * @copyright Copyright (c) 2020, Hands
 */

import { IntlField, Modal, Tooltip, Icon } from 'choerodon-ui/pro';
import { getConfig } from 'choerodon-ui';
import { HZERO_PLATFORM } from 'utils/config';
import React from 'react';
import { isNil } from 'lodash';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import { FormField } from 'choerodon-ui/pro/lib/field/FormField';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import { observer } from 'mobx-react';
import { computed } from 'mobx';

@observer
export class FlexLink extends FormField {
  @computed
  get help() {
    return this.getProp('help');
  }

  render() {
    const { help } = this;
    const { extra = {}, ...options } = this.props;
    const { currentData = {} } = extra;
    const { linkTitle, linkHref, linkNewWindow, linkType = 'none', modalWidth = 600 } = options;
    let newHref = linkHref || '';
    let newTitle = linkTitle || '';
    const mappings = newHref.match(/{([^{}]*)}/g);
    const titleMappings = newTitle.match(/{([^{}]*)}/g);

    if (mappings) {
      newHref = replace(mappings, currentData, newHref);
    }
    if (titleMappings) {
      newTitle = replace(titleMappings, currentData, newTitle);
    }
    const linkProps = {
      disabled: this.isDisabled(),
      rel: 'noopener noreferrer',
      // eslint-disable-next-line no-script-url
      href: 'javascript:void(0)',
      style: {
        wordBreak: 'break-word',
      },
    };
    if (linkType === 'drawer' || linkType === 'modal') {
      linkProps.onClick = function () {
        const modal = Modal.open({
          closable: true,
          movable: false,
          drawer: linkType === 'drawer',
          key: Modal.key(),
          style: { width: modalWidth },
          footer: null,
          children: <EmbedPage href={newHref} pageData={extra} closeModal={closeModal} />,
        });

        function closeModal() {
          modal.close();
        }
      };
    } else if (linkType === 'inner') {
      linkProps.onClick = function () {
        const [uri, search] = newHref.split('?');
        window.dvaApp._store.dispatch(
          window.routerRedux.push({
            pathname: uri,
            search: `?${search}`,
          })
        );
      };
    } else {
      linkProps.target = linkNewWindow ? '_blank' : '_self';
      linkProps.href = newHref;
    }
    return (
      <>
        <a {...linkProps}>{newTitle}</a>
        {help && (
          <Tooltip
            title={help}
            openClassName={`${getConfig('proPrefixCls')}-tooltip-popup-help`}
            placement="bottom"
          >
            <Icon type="help" style={{ fontSize: '15px', verticalAlign: 'text-bottom' }} />
          </Tooltip>
        )}
      </>
    );
  }
}

// export function FlexLink1(props) {
//   const { extra = {}, ...options } = props;
//   const { currentData = {} } = extra;
//   const {
//     linkTitle,
//     linkHref,
//     linkNewWindow,
//     linkType = 'none',
//     modalWidth = 600,
//     disabled,
//   } = options;
//   let newHref = linkHref || '';
//   let newTitle = linkTitle || '';
//   const mappings = newHref.match(/{([^{}]*)}/g);
//   const titleMappings = newTitle.match(/{([^{}]*)}/g);

//   if (mappings) {
//     newHref = replace(mappings, currentData, newHref);
//   }
//   if (titleMappings) {
//     newTitle = replace(titleMappings, currentData, newTitle);
//   }
//   const linkProps = {
//     disabled,
//     rel: 'noopener noreferrer',
//     // eslint-disable-next-line no-script-url
//     href: 'javascript:void(0)',
//   };
//   if (linkType === 'drawer' || linkType === 'modal') {
//     linkProps.onClick = function() {
//       const modal = Modal.open({
//         closable: true,
//         drawer: linkType === 'drawer',
//         key: Modal.key(),
//         style: { width: modalWidth },
//         footer: null,
//         children: <EmbedPage href={newHref} pageData={extra} closeModal={closeModal} />,
//       });
//       function closeModal() {
//         modal.close();
//       }
//     };
//   } else if (linkType === 'inner') {
//     linkProps.onClick = function() {
//       const [uri, search] = newHref.split('?');
//       window.dvaApp._store.dispatch(
//         window.routerRedux.push({
//           pathname: uri,
//           search: `?${search}`,
//         })
//       );
//     };
//   } else {
//     linkProps.target = linkNewWindow ? '_blank' : '_self';
//     linkProps.href = newHref;
//   }

//   return <a {...linkProps}>{newTitle}</a>;
// }

export function FlexIntlField(props) {
  const tlsUrl = `${HZERO_PLATFORM}/v1/multi-language`;
  return <IntlField tlsUrl={tlsUrl} {...props} />;
}

function replace(mappings, values, targetString) {
  let newString = targetString;
  for (let i = 0; i < mappings.length; i++) {
    if (mappings[i] === '{organizationId}' || mappings[i] === '{tenantId}') {
      // eslint-disable-next-line no-continue
      continue;
    }
    const key = mappings[i].match(/{([^{}]*)}/)[1];
    const value = isNil(values[key]) ? '' : values[key];
    newString = newString.replace(`{${key}}`, value);
  }
  newString = newString.replace(/{organizationId}/, getCurrentOrganizationId());
  newString = newString.replace(/{tenantId}/, getUserOrganizationId());
  return newString;
}
