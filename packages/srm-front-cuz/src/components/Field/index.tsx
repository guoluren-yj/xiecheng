import React, { Component, ComponentClass, createElement, FunctionComponent } from "react";
import FieldContext from "./FieldContext";

export default class C7NField extends Component<{
  colSpan?: number, rowSpan?: number, name: string, type: ComponentClass<any> | FunctionComponent<any> | string,
  hidden?: boolean,
  formOptions?: any,
  inputProps?: any,
  refForward?: any,
}> {
  constructor(props) {
    super(props);
  }

  render() {
    const { type: Type, name, hidden, formOptions, inputProps, refForward } = this.props;
    if (typeof Type === "string") return createElement(Type, { ...inputProps, name })
    return (
      <FieldContext.Consumer>
        {({ form }) => {
          if (!form) return null;
          return hidden ? null : form.getFieldDecorator(name, formOptions)(<Type {...inputProps} ref={refForward} />);
        }}
      </FieldContext.Consumer>
    );
  }
  static classId = Symbol("H0Field")
}