/* eslint-disable */
import 'hzero-ui/es/tooltip/style';
import _Tooltip from 'hzero-ui/es/tooltip';
import _objectSpread from '@babel/runtime/helpers/esm/objectSpread';
import _defineProperty from '@babel/runtime/helpers/esm/defineProperty';
import _objectWithoutProperties from '@babel/runtime/helpers/esm/objectWithoutProperties';
import _classCallCheck from '@babel/runtime/helpers/esm/classCallCheck';
import _createClass from '@babel/runtime/helpers/esm/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/esm/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/esm/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/esm/inherits';
import React from 'react';
import classNames from 'classnames';
import { ORIGIN_ICON_NAME } from './Status';
import iconFont from './iconfont.css';
/**
 * Icons 组件 - 使用iconfont图标库
 * 图标的更新方式：
 * 1. 登录iconfont，添加图标，规范化图标的名称；
 * 2. 在图标项目中的Font Class中更新, 生成新的图标样式链接，例如：//at.alicdn.com/t/font_1089395_95h9j1chzts.css；
 * 3. 将 src/utils/icon.js 中的 aliUrl 属性替换为新的图标样式链接；
 * 4. 执行 yarn icon 命名下载图标文件
 * 5. 引入Icons组件，type属性值为除去公共后缀后的图标名称，
 * 比如，hzero-icon-edit，hzero-icon-是公共命名，edit是图标名称，
 * 所以，type="edit"
 * @author wangjiacheng <jiacheng.wang@hand-china.com>
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {!string} [type = ''] - 图标名称，例如 hzero-icon-edit, 取edit
 * @reactProps {?string} [size = ''] - 图标大小，默认以px为单位
 * @reactProps {?string} [color = ''] - 图标颜色，支持16进制或者rgb/rgba形式
 * @reactProps {?string} [className = ''] - class属性
 * @reactProps {?string} [title = ''] - tooltip提示文字，设置该属性将自动使用Tooltip
 * @reactProps {?object} [tipProps = {}] - Tooltip其余属性
 * @reactProps {?object} [style = {}] - style样式
 * @example
 * import Icons from 'components/Icons';
 *
 * <Icons type="edit" />
 */

const mIcons =
  /* #__PURE__ */
  (function (_React$Component) {
    _inherits(mIcons, _React$Component);

    function mIcons() {
      _classCallCheck(this, mIcons);

      return _possibleConstructorReturn(this, _getPrototypeOf(mIcons).apply(this, arguments));
    }

    _createClass(mIcons, [
      {
        key: 'render',
        value: function render() {
          let _classNames;
          let _classNames2;

          const _this$props = this.props;

          const type = _this$props.type;

          const title = _this$props.title;

          const _this$props$size = _this$props.size;

          const size = _this$props$size === void 0 ? '12' : _this$props$size;

          const _this$props$color = _this$props.color;

          const color = _this$props$color === void 0 ? '' : _this$props$color;

          const _this$props$className = _this$props.className;

          const className = _this$props$className === void 0 ? '' : _this$props$className;

          const _this$props$tipProps = _this$props.tipProps;

          const tipProps = _this$props$tipProps === void 0 ? {} : _this$props$tipProps;

          const _this$props$style = _this$props.style;

          const style = _this$props$style === void 0 ? {} : _this$props$style;

          const rest = _objectWithoutProperties(_this$props, [
            'type',
            'title',
            'size',
            'color',
            'className',
            'tipProps',
            'style',
          ]);

          return React.createElement(
            React.Fragment,
            null,
            title
              ? React.createElement(
                  _Tooltip,
                  Object.assign(
                    {
                      title,
                    },
                    tipProps
                  ),
                  React.createElement(
                    'i',
                    Object.assign(
                      {
                        className: classNames(
                          ((_classNames = {}),
                          _defineProperty(_classNames, iconFont[ORIGIN_ICON_NAME], true),
                          _defineProperty(_classNames, className, !!className),
                          _defineProperty(
                            _classNames,
                            iconFont[''.concat(ORIGIN_ICON_NAME, '-').concat(type)],
                            !!type
                          ),
                          _classNames)
                        ),
                        style: _objectSpread(
                          {
                            fontSize: ''.concat(size, 'px'),
                            color,
                          },
                          style
                        ),
                      },
                      rest
                    )
                  )
                )
              : React.createElement(
                  'i',
                  Object.assign(
                    {
                      className: classNames(
                        ((_classNames2 = {}),
                        _defineProperty(_classNames2, iconFont['hzero-icon'], true),
                        _defineProperty(_classNames2, className, !!className),
                        _defineProperty(_classNames2, iconFont['hzero-icon-'.concat(type)], !!type),
                        _classNames2)
                      ),
                      style: _objectSpread(
                        {
                          fontSize: ''.concat(size, 'px'),
                          color,
                        },
                        style
                      ),
                    },
                    rest
                  )
                )
          );
        },
      },
    ]);

    return mIcons;
  })(React.Component);

export { mIcons as default };
