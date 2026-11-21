// Deterministic zip writer: store-only entries, fixed DOS timestamps, no
// dependence on a system `zip` binary. Byte-for-byte reproducible for a given
// (name, data) list, readable by unzip/AdmZip, and directory-entry-free so
// `unzip -Z1` lists exactly the declared files (what validate-catalog.mjs
// compares against manifest.files).

// 2000-01-01T00:00:00Z in DOS date/time fields — matches ARTIFACT_MTIME used
// by the other package builders.
const DOS_DATE = ((2000 - 1980) << 9) | (1 << 5) | 1;
const DOS_TIME = 0;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data) {
  let crc = 0xffffffff;
  for (let index = 0; index < data.length; index += 1) {
    crc = CRC_TABLE[(crc ^ data[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Build a zip archive from ordered entries: [{ name, data }] with forward-slash
 * relative names. Entry order is preserved, so identical input yields an
 * identical archive.
 */
export function createDeterministicZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    if (entry.name.includes("\\") || entry.name.startsWith("/")) {
      throw new Error(`Zip entry names must be forward-slash relative paths: ${entry.name}`);
    }
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data);
    const checksum = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(0, 8); // method: store
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28); // extra length
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE((3 << 8) | 20, 4); // made by: unix, zip 2.0
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30); // extra
    central.writeUInt16LE(0, 32); // comment
    central.writeUInt16LE(0, 34); // disk number
    central.writeUInt16LE(0, 36); // internal attributes
    central.writeUInt32LE(0o644 << 16, 38); // external attributes: -rw-r--r--
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);

    offset += local.length + name.length + data.length;
  }

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, ...centralParts, end]);
}

/**
 * How a zip of `entries` (as createDeterministicZip takes them), `bytes` long, stands against a size
 * limit: null at `warn` bytes or under; above it { refuse (it is over `refuse` bytes too), message (its
 * size and its ten largest files, the entries being stored as they are) }.
 */
export function zipSizeCheck(entries, bytes, { warn, refuse }) {
  if (bytes <= warn) return null;
  const mib = (size) => `${(size / 1048576).toFixed(1)} MiB`;
  const largest = entries
    .map((entry) => ({ name: entry.name, size: Buffer.byteLength(entry.data) }))
    .sort((left, right) => right.size - left.size)
    .slice(0, 10);
  return {
    refuse: bytes > refuse,
    message: [
      `${mib(bytes)} (a warning above ${mib(warn)}, refused above ${mib(refuse)}). The largest files:`,
      ...largest.map((file) => `  ${mib(file.size).padStart(10)}  ${file.name}`),
    ].join("\n"),
  };
}
