import { useState } from 'react'
import { Link } from 'react-router'
import { SearchInput } from '../../components/search'
import { WhatsHot } from './WhatsHot'
import { TopCollections } from './TopCollections'
import './home.css'

export function Home({}) {
  const [searchActive, setSearchActive] = useState(false);
  return (
    <>
      <div className="home-search">
        <SearchInput onActivate={setSearchActive} />
      </div>

      <div className={`hot-stuff ${searchActive ? 'hot-stuff-hidden' : ''}`}>
        {/* we don't want to actually remove these from the react tree to avoid re-fetching*/}

        <div className="browse-all">
          →&nbsp;
          <Link to="/all/">
            browse <em>all</em> collections
          </Link>
        </div>

        <WhatsHot />
        <TopCollections />
      </div>
    </>
  );
}
