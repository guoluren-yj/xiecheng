/**
 * Since search box is in different position with different mode.
 * - Single: in the popup box
 * - multiple: in the selector
 * Move the code as a SearchInput for easy management.
 */

import React from 'react';
import { createRef } from './util';
import TreeSelectContext from './TreeSelectContext';

class SearchInput extends React.Component {
  static get contextType() {
    return TreeSelectContext;
  }

  constructor(props, context) {
    super(props, context);

    this.inputRef = createRef();
    this.mirrorInputRef = createRef();
  }

  componentDidMount() {
    const { open, needAlign } = this.props;
    if (needAlign) {
      this.alignInputWidth();
    }

    if (open) {
      this.focus(true);
    }
  }

  componentDidUpdate(prevProps) {
    const { open, searchValue, needAlign } = this.props;

    if (open && prevProps.open !== open) {
      this.focus();
    }


    if (needAlign && searchValue !== prevProps.searchValue) {
      this.alignInputWidth();
    }
  }

  /**
   * `scrollWidth` is not correct in IE, do the workaround.
   * ref: https://github.com/react-component/tree-select/issues/65
   */
  alignInputWidth = () => {
    this.inputRef.current.style.width =
      `${this.mirrorInputRef.current.clientWidth}px`;
  };

  /**
   * Need additional timeout for focus cause parent dom is not ready when didMount trigger
   */
  focus = (isDidMount) => {
    if (this.inputRef.current) {
      this.inputRef.current.focus();
      if (isDidMount) {
        setTimeout(() => {
          this.inputRef.current.focus();
        }, 0);
      }
    }
  };

  blur = () => {
    if (this.inputRef.current) {
      this.inputRef.current.blur();
    }
  };

  render() {
    const { searchValue, prefixCls, disabled, renderPlaceholder, open, ariaId } = this.props;
    const { rcTreeSelect: {
      onSearchInputChange, onSearchInputKeyDown,
    } } = this.context;

    return (
      <span className={`${prefixCls}-search__field__wrap`}>
        <input
          type="text"
          ref={this.inputRef}
          onChange={onSearchInputChange}
          onKeyDown={onSearchInputKeyDown}
          value={searchValue}
          disabled={disabled}
          className={`${prefixCls}-search__field`}

          aria-label="filter select"
          aria-autocomplete="list"
          aria-controls={open ? ariaId : undefined}
          aria-multiline="false"
        />
        <span
          ref={this.mirrorInputRef}
          className={`${prefixCls}-search__field__mirror`}
        >
          {searchValue}&nbsp;
        </span>

        {renderPlaceholder ? renderPlaceholder() : null}
      </span>
    );
  }
}

export default SearchInput;
