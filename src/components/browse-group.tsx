import { useState } from 'react';
import { Link } from 'react-router';
import { GetJson } from '../fetch';
import { NsidName, NsidPrefix, NsidBar } from './nsid';
import './browse-group.css';

export function BrowseGroup({ prefix, active }) {
  const segments = prefix.split('.');
  const parents = [];
  for (let i = segments.length - 1; i >= 2; i--) {
    parents.unshift(segments.slice(0, i).join('.'));
  }
  return (
    <div className="browse-group">
      {parents.map(p => (
        <div key={p} style={{marginBottom: '0.5rem'}}>
          ↰&nbsp;
          <Link to={`/collection/?prefix=${p}`}>
            <NsidPrefix prefix={p} />
          </Link>
        </div>
      ))}
      <GetJson
        endpoint="/prefix"
        params={{ prefix }}
        ok={group => <Group group={group} active={active} />}
        todo="paging"
      />
    </div>
  );
}

function groupChildren(totals, children) {
  // make some small attempt to deprioritize obvious vanity NSIDs.
  // this makes some assumptions about apps' NSID usage that are not *always*
  // going to be correct, but probably usually will?
  //
  // let's take take app.bsky (monthly unique users)
  // 4.7M feed.like
  // 4.2M graph.follow
  // 3.0M feed.post
  // 2.0M feed.repost
  // 1.4M actor.profile
  // 760K graph.block
  //  78K feed.threadGtate
  //  68K graph.listitem
  //  37K feed.postGate
  //  25K graph.list
  //  25K graph.listblock
  //   9K graph.starterpack
  //   3K feed.generator
  //  225 actor.status
  //  129 graph.verification
  //   43 labeler.service
  //
  // app.bsky vanities:
  // 11 graph.cancellation (peaked @72)
  //  1 feed.bookmark
  //  1 feed.comment
  //  0 feed.deleteLike
  //  0 feed.dislike
  //  1 feed.pin
  //  1 feed.postSettings
  //  1 feed.settings
  //  1 feed.test
  //  0 feed.unlike
  //  0 feed.video
  //  0 graph.fuck
  //  0 graph.mute
  //  0 graph.unfollow
  //  0 graph.verification.create
  //  0 actor
  //  1 bookmark
  //  1 jerry.no
  //  1 reaction.like
  //  1 dm.conversation
  //  1 dm.message
  //
  // so here's the grand strategy:
  //
  // 1. are there more than 1000 unique users in the whole nsid subtree?
  //    -> yes: de-prioritize all with <10 uniques (monthly uniques?)
  //    -> no: no de-prioritization
  //
  // this should have only one false-positive for app.bsky (cancellation) no
  // false-negatives

  const sorted = children
    .toSorted((a, b) => b.dids_estimate - a.dids_estimate);

  let officials, vanities;
  if (totals.dids_estimate >= 1000) {
    officials = [];
    vanities = [];
    sorted.forEach(c => {
      if (c.dids_estimate >= 10) officials.push(c);
      else vanities.push(c);
    });
  } else {
    officials = sorted;
  }
  return [officials, vanities];
}

function Group({ group, active }) {
  const [officials, vanities] = groupChildren(group.total, group.children);
  return (
    <>
      {officials.map(c => (
        <div
          key={`${c.type}:${c.nsid ?? c.prefix}`}
          className="browse-group-item"
        >
          <span
            className="bar"
            title={`${c.dids_estimate.toLocaleString()} unique user${c.dids_estimate === 1 ? '' : 's'}`}
          >
            <NsidBar n={c.dids_estimate} />
            &nbsp;
          </span>
          {c.type === 'collection'
            ? <Collection c={c} active={c.nsid === active} />
            : <SubPrefix c={c} />
          }
        </div>
      ))}
      {vanities && vanities.map((c, i) => (
        <div
          key={`${c.type}:${c.nsid ?? c.prefix}`}
          className={`browse-group-item vanity ${i === 0 ? 'first' : ''}`}
        >
          <span
            className="bar"
            title={`${c.dids_estimate.toLocaleString()} unique user${c.dids_estimate === 1 ? '' : 's'}`}
          >
            <NsidBar n={c.dids_estimate} />
            &nbsp;
          </span>
          {c.type === 'collection'
            ? <Collection c={c} active={c.nsid === active} />
            : <SubPrefix c={c} />
          }
        </div>
      ))}
    </>
  )
}

function Collection({ c, active, marker }) {
  return (
    <div>
      {active
        ? (
          <div style={{fontWeight: 'bold'}}>
            {c.nsid}
          </div>
        ) : (
          <Link to={`/collection/?nsid=${c.nsid}`} style={{color: '#888'}}>
            {/*{marker || <>◦&nbsp;</>}*/}
            <NsidName nsid={c.nsid} />
          </Link>
        )
      }
    </div>
  );
}

function SubPrefix({ c, bottom }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <Link
        to={`/collection/?prefix=${c.prefix}`}
        style={{color: '#888'}}
        onClick={e => {
          if (!bottom) {
            e.preventDefault();
            setExpanded(e => !e);
          }
        }}
      >
        <span style={{color: 'hsl(210, 94%, 72%)'}}>
          {expanded ? '◢' : '▸'}
        </span>
        &nbsp;
        <NsidPrefix prefix={c.prefix} />
        {expanded ? ':' : '.*'}
      </Link>
      {expanded && (
        <BrowseSubGroup prefix={c.prefix} />
      )}
    </div>
  );
}

export function BrowseSubGroup({ prefix }) {
  return (
    <div className="browse-group-sub">
      <div>
        <GetJson
          endpoint="/prefix"
          params={{ prefix }}
          ok={group => <SubGroup group={group} />}
        />
      </div>
    </div>
  );
}

function SubGroup({ group }) {
  const [showVanities, setShowVanities] = useState(false);
  const [officials, vanities] = groupChildren(group.total, group.children);
  return (
    <>
      {officials.map(c => (
        <div
          key={`${c.type}:${c.nsid ?? c.prefix}`}
          className="browse-group-item sub-group"
        >
          <span
            className="bar"
            title={`${c.dids_estimate.toLocaleString()} unique user${c.dids_estimate === 1 ? '' : 's'}`}
          >
            <NsidBar n={c.dids_estimate} />
            &nbsp;
          </span>
          {c.type === 'collection'
            ? <Collection c={c} />
            : <SubPrefix c={c} bottom={true} />
          }
        </div>
      ))}
      {vanities && (
        showVanities
          ? vanities.map((c, i) => (
            <div
              key={`${c.type}:${c.nsid ?? c.prefix}`}
              className="browse-group-item sub-group vanity"
            >
              <span
                className="bar"
                title={`${c.dids_estimate.toLocaleString()} unique user${c.dids_estimate === 1 ? '' : 's'}`}
              >
                <NsidBar n={c.dids_estimate} />
                &nbsp;
              </span>
              {c.type === 'collection'
                ? <Collection c={c} />
                : <SubPrefix c={c} bottom={true} />
              }
            </div>
          ))
          : (
            <p class="browse-sub-group-show-all">
              <button className="subtle" onClick={() => setShowVanities(true)}>
                + show all
              </button>
            </p>
          )
      )}
    </>
  )
}
