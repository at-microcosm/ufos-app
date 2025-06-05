import { useContext } from 'react'
import { HostContext } from '../context'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { Fetch } from '../fetch';

const get_timeseries = async (host, nsid) => {
  // TODO: custom time period
  const resp = await fetch(`${host}/timeseries?collection=${nsid}`);
  if (!resp.ok) {
    throw new Error(`failed to fetch: ${resp}`);
  }
  return await resp.json();
}

export function Sparkline({ nsid, metric, height }) {
  const host = useContext(HostContext);
  metric = metric ?? 'dids_estimate';
  return (
    <Fetch
      key={nsid}
      using={get_timeseries}
      args={[host, nsid]}
      ok={({ series }) => (
        <SparkLineChart
          data={series[nsid].map(d => d[metric])}
          height={height ?? 32}
        />
      )}
    />
  );
}
