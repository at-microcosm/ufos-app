import { Suspense, use, useContext, useDeferredValue, useEffect, useRef, useState } from 'react';
import { useThrottle } from '@uidotdev/usehooks';
import { HostContext } from '../context';
import { Link } from 'react-router';
import { NsidNice, NsidBar } from './nsid';
import './search.css';

// i don't like this hack
let wow = null;
function get_search_results(host, query) {
  if (wow?.host === host && wow?.query === query) {
    return wow.p;
  }
  const p = fetch(`${host}/search?q=${query}`).then(async res => {
    if (!res.ok) {
      throw new Error(`failed to fetch: ${await res.text()}`);
    }
    const data = await res.json();
    return data.matches;
  });
  wow = { host, query, p };
  return p;
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
            ? <GetResults query={normalized} />
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

function GetResults({ query }) {
  const throttledQuery = useThrottle(query, 300);
  const activeQuery = useDeferredValue(throttledQuery);
  const stale = activeQuery !== query;

  return (
    <>
      <Suspense fallback={<p className="searching">searching&hellip;</p>}>
        <p className="searching">{ stale ? <>searching&hellip;</> : <>&nbsp;</>}</p>
        <SearchResults query={activeQuery} />
      </Suspense>
    </>
  );
}

function SearchResults({ query }) {
  const host = useContext(HostContext);
  let matches = use(get_search_results(host, query));
  if (matches.length === 0) {
    return <p><em>no matches found :(</em></p>;
  }
  const terms = query.split(' ');

  const sorted = matches
    .map(match => {
      const popularity = match.dids_estimate >= 1
        ? Math.log10(match.dids_estimate)
        : 0; // ~0-8
      const matchiness = terms
        .filter(t => match.nsid.includes(t))
        .map(t => t.length)
        .reduce((a, t) => a + t, 0); // how many total characters matched
      console.log({ nsid: match.nsid, popularity, matchiness });
      return {...match, score: popularity + matchiness }
    })
    .toSorted((a, b) => b.score - a.score);

  return sorted.map(m => (
    <Link
      key={m.nsid}
      to={`/collection?nsid=${m.nsid}`}
      className="search-result-item"
    >
      <span className="bar"><NsidBar n={m.dids_estimate} /></span>
      {' '}
      <NsidNice nsid={m.nsid} />
    </Link>
  ));
}
