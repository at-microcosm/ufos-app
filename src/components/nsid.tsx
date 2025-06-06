import './nsid.css'

const getBits = nsid => {
  const segments = nsid.split('.');
  let tld, app, group, name;
  let mids = [];
  if (segments.length === 1) {
    [name] = segments;
  } else if (segments.length === 2) {
    [tld, name] = segments;
  } else if (segments.length === 3) {
    [tld, group, name] = segments;
  } else if (segments.length === 4) {
    [tld, app, group, name] = segments;
  } else {
    let rest;
    [tld, app, ...rest] = segments;
    [name, group, ...mids] = rest.toReversed();
  }
  return { tld, app, mids, group, name };
};

export function NsidTitle({ nsid }) {
  const bits = getBits(nsid);
  if (bits.app && bits.name) {
    return (
      <span className="nsid-title">
        <span className="nsid-app">{bits.app}</span>
        {' '}
        <span className="nsid-name">{bits.name}</span>
      </span>
    );
  } else {
    return (
      <span className="nsid-title">
        <span className="nsid-name">{bits.name}</span>
      </span>
    );
  }
}

export function NsidNice({ nsid, subtle }) {
  const { tld, app, mids, group, name } = getBits(nsid);
  return (
    <span className={`nsid-nice ${subtle ? 'subtle' : ''}`}>
      {tld && (<><span className="nsid-tld">{tld}</span>.</>)}
      {app && (<><span className="nsid-app">{app}</span>.</>)}
      {mids.length > 0 && (<><span className="nsid-mids">{mids.join('.')}</span>.</>)}
      {group && (<><span className="nsid-group">{group}</span>.</>)}
      {name && (<span className="nsid-name">{name}</span>)}
    </span>
  );
}

export function NsidName({ nsid }) {
  const { tld, app, mids, group, name } = getBits(nsid);
  return (
    <span className={`nsid-name`}>
      {tld && (<><span className="nsid-tld">{tld}</span>.</>)}
      {app && (<><span className="nsid-app">{app}</span>.</>)}
      {mids.length > 0 && (<><span className="nsid-mids">{mids.join('.')}</span>.</>)}
      {group && (<><span className="nsid-group">{group}</span>.</>)}
      {name && (<span className="nsid-name">{name}</span>)}
    </span>
  );
}

export function NsidBad({ nsid }) {
  const { tld, app, mids, group, name } = getBits(nsid);
  return (
    <span className="nsid-bad">
      ⚠️{' '}
      {tld && (<><span className="nsid-bad-bit">{tld}</span>.</>)}
      {app && (<><span className="nsid-bad-bit">{app}</span>.</>)}
      {mids.length > 0 && (<><span className="nsid-bad-bit">{mids.join('.')}</span>.</>)}
      {group && (<><span className="nsid-bad-bit">{group}</span>.</>)}
      {name && (<span className="nsid-bad-bit">{name}</span>)}
    </span>
  );
}

export function NsidPrefix({ prefix }) {
  // hack but whatever: put a name segment on so we can reuse the normal nsid parsing
  const { tld, app, mids, group } = getBits(`${prefix}.name`);
  return (
    <span className="nsid-prefix">
        {tld && (<><span className="nsid-tld">{tld}</span>.</>)}
        {app && (<><span className="nsid-app">{app}</span>.</>)}
        {mids.length > 0 && (<><span className="nsid-mids">{mids.join('.')}</span>.</>)}
        {group && (<><span className="nsid-group">{group}</span></>)}
    </span>
  );
}