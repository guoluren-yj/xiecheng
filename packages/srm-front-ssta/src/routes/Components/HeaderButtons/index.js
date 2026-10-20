// import React, { Component } from 'react';
// import { Icon, Popover } from 'choerodon-ui';

// import PropTypes from 'prop-types';
// import { isArray, isObject } from 'lodash';

// import { FAILURE } from 'components/Permission/Status';

// import Styles from './index.less';

// export default class headerButtons extends Component {
//   // 获取传递的context
//   static contextTypes = {
//     permission: PropTypes.object,
//   };

//   btnIndexs = [];

//   btnHiddens = [];

//   // 在 render 之前检查权限
//   // eslint-disable-next-line
//   UNSAFE_componentWillMount() {
//     this.check();
//   }

//   componentDidUpdate(preProps) {
//     if (preProps.key && preProps.key !== this.props.key) {
//       this.check();
//     }
//   }

//   check = () => {
//     const { children = [] } = this.props;
//     const tempArr = (children && isArray(children) ? children : [children]).filter((item) =>
//       isObject(item)
//     );
//     tempArr.forEach((item, index) => {
//       const { permissionList: btnPermssionList, otherButtonProps = {}, requestUrl } = item.props;
//       const { permissionList: excelPermissionList } = otherButtonProps;
//       const permissionList = requestUrl ? excelPermissionList : btnPermssionList;
//       if (permissionList !== undefined && isArray(permissionList) && this.context.permission) {
//         this.btnIndexs.push(index);
//         this.context.permission.check({ permissionList }, this.handlePermission);
//       }
//     });
//   };

//   /**
//    * 检查权限后的回调函数
//    * @param {number} status - 权限状态
//    * @param {string} controllerType - 权限的控制类型
//    */
//   handlePermission = (status, controllerType = 'hidden') => {
//     this.btnHiddens.push(status === FAILURE && controllerType !== 'disabled');
//   };

//   render() {
//     const hiddensMap = new Map();
//     this.btnIndexs.forEach((item, index) => {
//       const isHidden = this.btnHiddens.find((_, i) => index === i);
//       hiddensMap.set(item, isHidden);
//     });
//     const { children = [] } = this.props;
//     const tempArr = (children && isArray(children) ? children : [children]).filter((item) =>
//       isObject(item)
//     );
//     // 加入权限集
//     const childArr =
//       hiddensMap.size === 0
//         ? tempArr
//         : tempArr.filter((item, index) => {
//             const {
//               permissionList: btnPermssionList,
//               otherButtonProps = {},
//               requestUrl,
//             } = item.props;
//             const { permissionList: excelPermissionList } = otherButtonProps;
//             const permissionList = requestUrl ? excelPermissionList : btnPermssionList;
//             return !(permissionList && hiddensMap.get(index));
//           });
//     // 添加主按钮样式
//     const showChildren = [];
//     const foldChildren = [];
//     childArr.forEach((item, index) => {
//       if (index === 0) {
//         const { requestUrl, otherButtonProps, color } = item.props || {};
//         // 判断是否为导出组件
//         if (requestUrl) {
//           showChildren.push({
//             ...item,
//             props: {
//               ...item.props,
//               otherButtonProps: { ...otherButtonProps, color: 'primary', funcType: 'raised' },
//             },
//           });
//         } else {
//           showChildren.push({
//             ...item,
//             props: { ...item.props, color: color || 'primary', funcType: 'raised' },
//           });
//         }
//       } else if (index < 5) {
//         showChildren.push(item);
//       } else {
//         foldChildren.push(item);
//       }
//     });
//     const moreButtons = [
//       <Popover
//         placement="bottom"
//         content={foldChildren}
//         overlayClassName={Styles['ssta-buttons-popover']}
//       >
//         <Icon type="more_horiz" className={Styles['ssta-buttons-icon']} />
//       </Popover>,
//     ];
//     return childArr.length > 5 ? showChildren.concat(moreButtons) : showChildren;
//   }
// }

import { Component } from 'react';
import { isArray, isObject } from 'lodash';
import intl from 'utils/intl';

export default class headerButtons extends Component {
  render() {
    const { children = [] } = this.props;
    const tempArr = children && isArray(children) ? children : [children];
    //     {$$typeof: Symbol(react.element), type: Symbol(react.fragment), key: null, ref: null, props: {…}, …}
    // $$typeof: Symbol(react.element)
    // key: null
    // props:
    // children: {$$typeof: Symbol(react.element), key: null, ref: null, props: {…}, type: ƒ, …}
    // [[Prototype]]: Object
    // ref: null
    // type: Symbol(react.fragment)

    // props:
    // children: "同步"
    // funcType: "flat"
    // icon: "sync"
    // loading: false
    // onClick: ƒ onClick()
    // suffixCls: "btn"
    // type: "button"
    // wait: 1500
    // waitType: "throttle"

    // 添加主按钮样式
    const showChildren = [];
    const firstObjIndex = tempArr.findIndex((item) => item);
    tempArr.forEach((item, index) => {
      if (index === firstObjIndex) {
        const { requestUrl, otherButtonProps, color, funcType } = item.props || {};
        // 判断是否为导出组件
        if (
          item.props.children === intl.get('ssta.common.button.print').d('打印') ||
          item.props.children === intl.get('ssta.common.button.operateHistory').d('操作记录')
        ) {
          showChildren.push({
            ...item,
            props: { ...item.props, color },
          });
          return true;
        }
        if (requestUrl) {
          showChildren.push({
            ...item,
            props: {
              ...item.props,
              otherButtonProps: {
                ...otherButtonProps,
                color: 'primary',
                funcType: funcType || 'raised',
              },
            },
          });
        } else if (item) {
          if (typeof item.type === 'symbol' && isObject(item.props.children)) {
            // eslint-disable-next-line no-param-reassign
            item.props.children.props = {
              ...item.props.children.props,
              color: color || 'primary',
              funcType: 'raised',
            };
            showChildren.push(item);
          } else {
            showChildren.push({
              ...item,
              props: { ...item.props, color: color || 'primary', funcType: 'raised' },
            });
          }
        }
      } else {
        showChildren.push(item || false);
      }
    });
    return showChildren;
  }
}
