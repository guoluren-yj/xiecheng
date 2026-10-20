// annotation collect

import React, { Component } from 'react';
import { isEmpty } from 'lodash';

import notification from 'utils/notification';

// 注解 validateCuxAnnotation
// 继承式二开，校验父组件中需要继承函数的存在性,只在二开中可以使用
// 标准严禁使用
// 如果不存在，会弹窗提示，并console.error打印

/** example at srm-front-cux-xxx 的二开文件中
import { UpdateComponent, hocUpdate, } from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/Update';

@validateCuxAnnotation({
  cuxPropertyList: ['handleTestFunction', 'notExistFunction', 'handleDeleteReviewLine'], // 函数名称列表
  parentPropertyList: ['staticA', 'testVariable', 'testName', 'testStaticProperty'], // 父级组件属性，同样允许静态方法，属性
})
class UpdateNew extends UpdateComponent {
  constructor(props) {
    super(props);
  }
}

const Update = hocUpdate(UpdateNew);
export default Update;
*/
const validateCuxAnnotation = (options = {}) => {
  const { cuxPropertyList = [], parentPropertyList = [] } = options;

  const validateComponentMethods = (ComponentPrototype = {}, propertyList = []) => {
    if (isEmpty(propertyList)) {
      return;
    }

    const includeList = [];
    propertyList.forEach((item) => {
      const result = ComponentPrototype[item];
      // const result = item in ComponentPrototype;

      if (result === undefined) {
        includeList.push(item);
      }
    });

    warningAtInvoke(includeList);
  };

  const warningAtInvoke = (result = []) => {
    if (isEmpty(result)) {
      return;
    }

    const missingProperty = result.join();
    notification.warning({
      message: `standard properties ${missingProperty} error, Please contact your administrator !`,
    });
  };

  const validateCux = (Com) => {
    const ComponentPrototype = Com.prototype;

    validateComponentMethods(Com, parentPropertyList);
    validateComponentMethods(ComponentPrototype, cuxPropertyList);
  };

  return (Com) => {
    validateCux(Com);
    return Com;
  };
};

const ssrcCommonAnnotation = (options = {}) => {
  return (Com) => {
    class WrapperComponent extends Component {
      constructor(props, ...args) {
        super(props, args);
      }

      componentDidMount() {}

      render() {
        const { forwardRef = null } = this.props;

        const Props = {
          ...this.props,
          ...options,
        };

        return <Com {...Props} ref={forwardRef} />;
      }
    }

    return React.forwardRef((props, ref) => {
      return <WrapperComponent {...props} forwardRef={ref} />;
    });
  };
};

export { ssrcCommonAnnotation, validateCuxAnnotation };
