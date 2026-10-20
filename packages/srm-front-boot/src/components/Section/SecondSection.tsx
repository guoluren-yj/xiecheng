import type { ReactNode } from 'react';
import React from 'react';
import { Spin } from 'choerodon-ui/pro';
import type { SpinProps } from 'choerodon-ui/pro/lib/spin';
import { sectionContext } from "./tools";

const { Consumer } = sectionContext;
type Props = {
  /** 二级卡片编码，对应个性化字段编码 */
  code: string;
  title?: ReactNode;
  titleProps?: any;
  spinProps?: SpinProps;
}

export default class SecondSection extends React.Component<Props, any> {
  cacheField: any = {};

  secondInit = false;

  render() {
    const {
      props: {
        title: propsTitle,
        code,
        titleProps,
        spinProps,
        children,
      },
    } = this;
    return (
      <Consumer>
        {({ unitConfig, init, subHiddenCards }) => {
          if(init && !this.secondInit){
            const { fields = [] } = unitConfig;
            this.secondInit = true;
            this.cacheField = fields.find(field=>field.fieldCode === code ) || {};
          }
          const {visible = -1, fieldName, fieldType, fieldCode} = this.cacheField;
          if(fieldType === "SECTION" && subHiddenCards.includes(fieldCode)) return null;
          const title = typeof propsTitle === "function" ? propsTitle(fieldName) : fieldName || propsTitle;
          return visible !== 0 ? (
            <>
              {!["FORM", "GRID"].includes(fieldType) && title && (
                <h3 {...titleProps} className='second-section-title'>
                  {title}
                </h3>
              )}
              {
                init && (
                  spinProps ? (
                    <Spin {...spinProps}>
                      {children}
                    </Spin>
                  ) : children
                )
              }
            </>
          ) : null;
        }}
      </Consumer>
    );
  }
}
