import { useContext } from 'react';
import { HostContext } from '../context'
import { Fetch } from './Fetch';

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const m = await res.text();
    throw new Error(`Failed to fetch: ${m}`);
  }
  return await res.json();
}

export function GetJson({ endpoint, params, ...forFetch }) {
  const host = useContext(HostContext);
  const url = new URL(endpoint, host);
  for (let [key, val] of Object.entries(params ?? {})) {
    url.searchParams.append(key, val);
  }
  return (
    <Fetch
      using={getJson}
      args={[url.toString()]}
      {...forFetch}
    />
  );
}
