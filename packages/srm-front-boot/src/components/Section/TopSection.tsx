
import { Spin } from 'choerodon-ui/pro';
import { cloneDeep } from 'lodash';
import type { SpinProps } from 'choerodon-ui/pro/lib/spin';
import type { ReactNode } from 'react';
import React, { Children, isValidElement } from 'react';
import { sectionContext } from "./tools";
import EmbedPage from "../EmbedPage";
import SecondSection from './SecondSection';

const { Provider } = sectionContext;
type Props = {
  /** 单元编码 */
  code: string;
  /** 获取当前上下文高阶实例的API，必传 */
  getHocInstance: Function;
  /** 用于获取当前页面定位轴实例 */
  getPositionAnchor: Function;
  /** 标题，支持函数 */
  // eslint-disable-next-line no-unused-vars
  title: ReactNode | ((name: string) => ReactNode);
  titleProps: any;
  /** wrapper className property */
  className?: string;
  spinProps?: SpinProps;
  /** 该隐藏属性优先级高于个性化配置 */
  hidden?: boolean;
}

export default class TopSection extends React.Component<Props, { unitConfig: any, init: boolean, subHiddenCards: string[] }> {

  static defaultProps = {
    getPositionAnchor: () => null,
  }

  customizeCache?: any;

  constructor(props) {
    super(props);
    const { code } = props;
    let init = false;
    if (code) {
      // eslint-disable-next-line no-new
      this.getUnitConfigAsync(code).then(() => this.initConfig());
    } else {
      init = true;
    }
    // eslint-disable-next-line no-multi-assign
    this.state = {
      unitConfig: {},
      init,
      // eslint-disable-next-line react/no-unused-state
      subHiddenCards: [],
    };
  }

  componentDidMount() {
    this.updatePositionAnchor();
  }

  componentDidUpdate(prevProps) {
    const { code } = this.props;
    if (code && this.state.init && prevProps.code !== code) {
      this.initConfig();
    }
  }

  getUnitConfigAsync = (code: string) => {
    return new Promise<void>((resolve, reject) => {
      const custInstance = this.props.getHocInstance();
      let times = 0;
      const timer = setInterval(() => {
        if (!custInstance.state.loading) {
          resolve();
          clearInterval(timer);
        }
        times += 1;
        if (times >= 30) {
          reject();
          clearInterval(timer);
        }
      }, 300);
    });
  }

  initConfig = () => {
    const { code, getHocInstance } = this.props;
    const custInstance = getHocInstance();
    const res = cloneDeep(custInstance.custConfig[code]);
    this.customizeCache = custInstance.cache;
    const newSubHiddenCards: string[] = [];
    if (res) {
      const { fields = [], enabledFlag } = res;
      fields.sort((before, after) => {
        if (before.seq === undefined && after.seq === undefined) return 0;
        if (before.seq === undefined) return 1;
        if (after.seq === undefined) return -1;
        return before.seq - after.seq;
      });
      const forceHidden = fields.every(field => {
        if (field.fieldType === "SECTION") {
          const r = cloneDeep(custInstance.custConfig[field.fieldCode] || {});
          if (r.enabledFlag === 0) {
            newSubHiddenCards.push(field.fieldCode);
          }
        }
        return field.visible === 0;
      }) || enabledFlag === 0;
      if (forceHidden) res.hidden = true;
    }
    // eslint-disable-next-line react/no-unused-state
    this.setState({ init: true, unitConfig: res || {}, subHiddenCards: newSubHiddenCards }, this.updatePositionAnchor);
  }

  updatePositionAnchor() {
    setTimeout(() => {
      /**
       * 历史遗留问题，PositionAnchor组件拿不到ref
       * 这里的api需要返回PositionAnchor的内部this
       */
      const positionAnchor = this.props.getPositionAnchor();
      if (positionAnchor) {
        /**
         * 因为updateHiddenLinks内部有setState，故这里去掉了forceUpdate
         */
        positionAnchor.updateHiddenLinks();
      }
    });
  }

  render() {
    const {
      props: {
        title: propsTitle,
        titleProps,
        spinProps,
        children,
        className,
        hidden: propsHidden,
      },
      state: {
        unitConfig: { hidden, unitTitle, fields = [] },
        init,
      },
    } = this;
    if (!init || hidden || propsHidden) return null;
    const slots: [string | undefined, any][] = [];
    const stdSeqMap = {};
    Children.forEach(children, (child, index) => {
      if (isValidElement(child) && child.props.code) {
        slots.push([child.props.code, child]);
        stdSeqMap[child.props.code] = index;
      } else slots.push([undefined, child]);
    });
    if (slots.length > 0) {
      let slotIndex = 0;
      fields.forEach((field) => {
        let currentSeq = stdSeqMap[field.fieldCode];
        // 配置多个同名字段无效
        // 非标准字段且代码中无对应卡片的才视为扩展卡片
        if (currentSeq === undefined && !field.isStandardField) {
          // 每一个新扩展卡片的初始顺序放在已有卡片的后面。
          // eslint-disable-next-line no-multi-assign
          currentSeq = stdSeqMap[field.fieldCode] = slots.length;
          slots.push([field.fieldCode!, (
            <SecondSection code={field.fieldCode} title={field.fieldName} titleProps={titleProps}>
              <EmbedPage href={field.linkHref} pageData={{ cache: this.customizeCache }} />
            </SecondSection>
          )]);
        }
        // 当前字段不存在卡片与之对应则忽略该字段
        if(currentSeq !== undefined) {
          const [code] = slots[slotIndex];
          // 当前槽位的编码不等于个性化配置的编码时，交换位置
          if (code !== field.fieldCode) {
            const temp = slots[slotIndex];
            slots[slotIndex] = slots[currentSeq];
            slots[currentSeq] = temp;
            if(code) stdSeqMap[code] = currentSeq;
            stdSeqMap[field.fieldCode] = slotIndex;
          }
          slotIndex ++;
        }
      });
    }
    return (
      <Provider value={this.state}>
        <div className={className}>
          <h3 {...titleProps} className='top-section-title'>
            {typeof propsTitle === "function" ? propsTitle(unitTitle) : unitTitle || propsTitle}
          </h3>
          {init && (
            spinProps ? (
              <Spin {...spinProps}>
                {slots.map(n => [n[1]])}
              </Spin>
            ) : slots.map(n => [n[1]])
          )}
        </div>
      </Provider>
    );
  }
}
