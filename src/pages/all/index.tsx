import { useState } from 'react';
import { Link } from 'react-router';
import { GetJson } from '../../fetch';
import { SearchInput } from '../../components/search'
import { NsidNice, NsidBar } from '../../components/nsid';
import './all.css';

export function All({}) {
  const [searchActive, setSearchActive] = useState(false);

  return (
    <>
      <div className="home-search">
        <SearchInput onActivate={setSearchActive} />
      </div>

      <div className={`all-collections ${searchActive ? 'all-collections-hidden' : ''}`}>
        {/* we don't want to actually remove these from the react tree to avoid re-fetching*/}
        <h2>All collections</h2>
        <GetJson
          endpoint="/collections"
          params={{limit: 200}}
          ok={first => <List resp={first} />}
        />
      </div>
    </>
  );
}

function List({ resp }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {resp.collections.map(c => <CollectionItem c={c} />)}
      {resp.cursor && (showMore
        ? <GetJson
            endpoint="/collections"
            params={{limit: 200, cursor: resp.cursor}}
            ok={next => <List resp={next} />}
          />
        : (
          <p>
            <button onClick={() => setShowMore(true)}>
              + more
            </button>
          </p>
        )
      )}
    </>
  );
}

const CollectionItem = ({ c }) => (
  <Link
    key={c.nsid}
    to={`/collection/?nsid=${c.nsid}`}
    className="all-collections-item"
  >
    <NsidBar n={c.dids_estimate} />
    &nbsp;
    <NsidNice nsid={c.nsid} />
  </Link>
);
