const getMetricsSnapshotsQuery = `
  query getMetricsSnapshots($startTime: BigInt!, $skip: Int!) {
    metricsSnapshots(
      first: 1000
      skip: $skip
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $startTime }
    ) {
      exchangeRate
      timestamp
    }
  }
`;

export default getMetricsSnapshotsQuery;
