import { useContext, useRef, useState } from 'react';
import { HostContext } from '../context';
import { Link } from 'react-router';
import { Fetch } from '../fetch';
import { NsidNice } from './nsid';
import './search.css';

async function get_search_results(host, query) {
  const res = await fetch(`${host}/search?q=${query}`);
  if (!res.ok) {
    throw new Error(`failed to fetch: ${await res.text()}`);
  }
  const data = await res.json();
  return data.matches;
}

export function SearchInput({ onActivate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const querySetter = v => e => {
    e.preventDefault();
    onActivate(true);
    setQuery(v);
    inputRef.current.focus();
  };
  const normalized = query.trim().replaceAll(/ {2,}/g, ' ');
  const contraband = query.replaceAll(/[0-9A-Za-z \-\.]/g, '');
  const canSearch = contraband.length === 0 && query.replaceAll(/[ \.]/g, '').length > 1;
  return (
    <div className="search-input">
      <div className="input-group">
        <input
          className="search-input-thing"
          placeholder="Search lexicons…"
          onFocus={() => onActivate(true)}
          onKeyDown={e => {
            if (e.key === 'Escape') inputRef.current.blur();
          }}
          onChange={e => setQuery(e.target.value)}
          onBlur={() => query === '' && onActivate(false)}
          value={query}
          ref={inputRef}
        />
        <button
          title="clear"
          onClick={() => {
            setQuery('');
            onActivate(false);
          }}
        >
          &times;
        </button>
      </div>
      {query === ''
        ? (
          <div className="eg">
            eg:
            <a href="#" onClick={querySetter('feed.like')}>feed.like</a>
            <a href="#" onClick={querySetter('uk.skyblur')}>uk.skyblur</a>
            <a href="#" onClick={querySetter('leaflet')}>leaflet</a>
          </div>
        ) : canSearch
            ? <SearchResults query={normalized} />
            : contraband
              ? (
                <div className="eg">
                  query cannot contain <span className="contraband">{contraband}</span>
                </div>
              ) : (
                <div className="eg">
                  <em>keep typing to search</em>
                </div>
              )
      }
    </div>
  );
}

function SearchResults({ query }) {
  const host = useContext(HostContext);
  return (
    <Fetch
      using={get_search_results}
      args={[host, query]}
      ok={matches => matches.length === 0
        ? <p><em>no matches found :(</em></p>
        : matches.map(m => (
          <div key={m.nsid} className="search-result-item">
            <Link to={`/collection?nsid=${m.nsid}`}>
              <NsidNice nsid={m.nsid} />
            </Link>
          </div>
        ))}
    />
  );
}
