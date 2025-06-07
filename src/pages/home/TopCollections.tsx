import { useContext, useState } from 'react'
import { ButtonGroup } from '../../components/buttons'
import { Fetch } from '../../fetch'
import { HostContext } from '../../context'
import { TopTile } from './TopTile'

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = ONE_HOUR_MS * 24;
const ONE_WEEK_MS = ONE_DAY_MS * 7;
const ONE_MONTH_MS = ONE_WEEK_MS * 4;

async function get_top_collections(host, period) {
  // ufos buckets stats by hour
  // truncate query times to the hour so they can be cached by nginx
  const now_ms = +new Date();
  const now_hours = Math.floor(now_ms / ONE_HOUR_MS);
  const now_truncated = now_hours * ONE_HOUR_MS;
  const period_ms = {
    day: ONE_DAY_MS,
    week: ONE_WEEK_MS,
    month: ONE_MONTH_MS,
  }[period]!;
  const since = new Date(now_truncated - period_ms).toISOString();

  const q = `limit=9&since=${since}`;
  const r = await fetch(`${host}/collections?order=dids-estimate&${q}`);
  if (!r.ok) {
    throw new Error(`request failed: ${r}`);
  }
  const data = await r.json();
  return data.collections;
}

export function TopCollections() {
  const [period, setPeriod] = useState('day');
  const host = useContext(HostContext);
  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '2rem',
        justifyContent: 'center',
      }}>
        <h2>Top collections</h2>
        <ButtonGroup
          options={[
            {val: 'day', label: 'today'},
            {val: 'week', label: 'this week'},
            {val: 'month', label: 'this month'},
          ]}
          current={period}
          onChange={setPeriod}
          subtle={true}
        />
      </div>
      <Fetch
        using={get_top_collections}
        args={[host, period]}
        ok={tops => (
          <ol style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem 0.9rem',
            padding: '0',
            margin: '0.6rem 0',
          }}>
            {tops.map((top, i) => (
              <TopTile
                key={top.nsid}
                rank={i+1}
                nsid={top.nsid}
                activeCount={top.dids_estimate}
              />
            ))}
          </ol>
        )}
      />
    </>
  );
}
