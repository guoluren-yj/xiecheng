import Input from './Input';
import Group from './Group';
import Search from './Search';
import TextArea from './TextArea';
import type { InputProps } from './Input';
import type { GroupProps } from './Group';
import type { SearchProps } from './Search';
import type { TextAreaProps } from './TextArea';

export type { InputProps, GroupProps, SearchProps, TextAreaProps };

type InputType = typeof Input & {
  Group: typeof Group;
  Search: typeof Search;
  TextArea: typeof TextArea;
}
(Input as InputType).Group = Group;
(Input as InputType).Search = Search;
(Input as InputType).TextArea = TextArea;
export default Input as InputType;
