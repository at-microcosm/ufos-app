import { useState } from 'react';
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
        <WhatsHot />
        <TopCollections />
      </div>
    </>
  );
}
