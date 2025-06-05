import { useContext } from 'react';
import { NavLink } from 'react-router';
import { HostContext } from '../context';
import { Fetch } from '../fetch';
import { NsidNice } from './nsid';

async function get_prefix(host, prefix) {
  let res = await fetch(`${host}/prefix?prefix=${prefix}`);
  if (!res.ok) {
    throw new Error(`request failed: ${await res.text()}`);
  }
  return await res.json();
}

export function BrowseGroup({ prefix, active }) {
  const host = useContext(HostContext);
  return (
    <Fetch
      using={get_prefix}
      args={[host, prefix]}
      ok={data => data.children.map(c => {
        if (c.type === 'collection') {
          return <Collection key={`c:${c.nsid}`} c={c} active={c.nsid === active} />;
        } else {
          return <span style={{color: '#777'}}>&gt;{c.prefix} [TODO]</span>;
        }
      } /*TODO: paging*/)}
    />
  );
}

function Collection({ c, active }) {
  return (
    <div>
      {active
        ? c.nsid
        : (
          <NavLink to={`/collection?nsid=${c.nsid}`}>
            <NsidNice nsid={c.nsid} />
          </NavLink>
        )
      }
    </div>
  );
}
