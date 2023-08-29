import { Input } from 'antd';

interface ISearchBarProps {
  onSearch: (str: string) => void;
  debounce?: number;
}

export function SearchBar({
  onSearch,
  debounce = 250,
}: ISearchBarProps): JSX.Element {
  return (
    <Input.Search
      onChange={e => {
        // Debounce
        setTimeout(() => {
          onSearch(e.target.value);
        }, debounce);
      }}
      placeholder='Search notes...'
      size='large'
      style={{ marginBottom: '2em' }}
    />
  );
}
