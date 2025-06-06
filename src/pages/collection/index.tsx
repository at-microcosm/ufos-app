import { useContext, useState } from 'react';
import { HostContext } from '../../context';
import { Navigate, useSearchParams } from 'react-router';
import { BrowseGroup } from '../../components/browse-group';
import { NsidNice } from '../../components/nsid';
import { niceDt } from '../../components/nice';
import { Sparkline } from '../../components/sparkline';
import { Record } from '../../components/record';
import { ButtonGroup } from '../../components/buttons';
import { Fetch } from '../../fetch';
import './collection.css';

// TODO refactor out with what-hot (/top collections, ...)
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = ONE_HOUR_MS * 24;
const ONE_WEEK_MS = ONE_DAY_MS * 7;
const ONE_MONTH_MS = ONE_WEEK_MS * 4;

async function get_samples(host, nsid, limit) {
  const res = await fetch(`${host}/records?collection=${nsid}&limit=${limit}`);
  if (!res.ok) {
    throw new Error(`request failed: ${res}`);
  }
  return await res.json();
}

async function get_collection_stat(host, nsid, period) {
  const now_ms = +new Date();
  const now_hours = Math.floor(now_ms / ONE_HOUR_MS);
  const now_truncated = now_hours * ONE_HOUR_MS;
  const period_ms = {
    day: ONE_DAY_MS,
    week: ONE_WEEK_MS,
    month: ONE_MONTH_MS,
  }[period]!;
  const since = new Date(now_truncated - period_ms).toISOString();
  const res = await fetch(`${host}/collections/stats?collection=${nsid}&since=${since}`);
  if (!res.ok) {
    throw new Error(`request failed: ${res}`);
  }
  const data = await res.json();
  return data[nsid];
}

export function Collection({}) {
  const host = useContext(HostContext);
  const [showMore, setShowMore] = useState(false);
  const [statPeriod, setStatPeriod] = useState('day');
  const [statType, statStatType] = useState('estimated_dids');
  const [countType, setCountType] = useState('creates');
  const [searchParams, _setSearchParams] = useSearchParams();
  const nsid = searchParams.get('nsid');
  if (!nsid) {
    return <Navigate replace to="/" />;
  }

  const nsidPrefix = nsid.split('.').slice(0, -1).join('.');

  return (
    <div className="collection-page">
      <div className="collection-page-sidebar">
        <h3>Related lexicons</h3>
        <BrowseGroup prefix={nsidPrefix} active={nsid} />
      </div>
      <div className="collection-page-content">
        <h2>
          <NsidNice nsid={nsid} />
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '0.5rem 0',
          gap: '0.5rem',
        }}>
          <div style={{
            width: '12rem',
            background: '#111',
          }}>
            <Sparkline nsid={nsid} height={56} />
          </div>

          <span className="big-stat">
            <Fetch
              using={get_collection_stat}
              args={[host, nsid, statPeriod]}
              ok={data => {
                let n = '??';
                if (statType === 'estimated_dids') {
                  n = data.dids_estimate;
                } else if (countType === 'creates') {
                  n = data.creates;
                } else if (countType === 'updates') {
                  n = data.updates;
                } else {
                  n = data.deletes;
                }
                return n.toLocaleString();
              }}
            />
          </span>

          <ButtonGroup
            options={[
              {val: 'day', label: 'daily'},
              {val: 'week', label: 'weekly'},
              {val: 'month', label: 'monthly'},
            ]}
            current={statPeriod}
            onChange={p => setStatPeriod(p)}
            subtle
            vertical
          />
          <ButtonGroup
            options={[
              {val: 'estimated_dids', label: 'users'},
              {val: 'records', label: 'records'},
            ]}
            current={statType}
            onChange={t => statStatType(t)}
            subtle
            vertical
          />
          {statType === 'records' && (
            <ButtonGroup
              options={[
                {val: 'creates', label: 'created'},
                {val: 'updates', label: 'updated'},
                {val: 'deletes', label: 'deleted'},
              ]}
              current={countType}
              onChange={t => setCountType(t)}
              subtle
              vertical
            />
          )}

        </div>

        <h3 style={{margin: '2rem 0 1rem'}}>
          {showMore ? 'Sample records' : 'Sample record: latest'}
        </h3>
        <Fetch
          using={get_samples}
          args={[host, nsid, 1]}
          ok={samples => samples.length === 0
            ? <p><em>no records seen</em></p>
            : showMore
              ? (
                <>
                {samples.map(s => (
                  <Sample
                    key={`${s.did}/${s.rkey}`}
                    sample={s}
                    nsid={nsid}
                  />
                ))}
                {samples.length > 1 && (
                  <button onClick={() => setShowMore(false)}>
                    - hide samples
                  </button>
                )}
                </>
              )
              : (
                <>
                  <Sample
                    key={`${samples[0].did}/${samples[0].rkey}`}
                    sample={samples[0]}
                    nsid={nsid}
                  />
                  {samples.length > 1 && (
                    <button onClick={() => setShowMore(true)}>
                      + more samples
                    </button>
                  )}
                </>
              )
          }
        />
      </div>
    </div>
  );
}
      // <p>
      //   {niceDt(new Date() - sample.time_us / 1000)} ago
      //   {' '}
      //   <small>{sample.did}/&hellip;/{sample.rkey}</small>
      // </p>

function Sample({ sample, nsid }) {
  return (
    <div style={{
      background: '#111',
      padding: '0.5rem',
      margin: '0 0 1em',
    }}>
      <Record record={sample.record} nsid={nsid} />
    </div>
  );
}
