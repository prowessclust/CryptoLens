import Converter from '@/components/Converter';
import LiveDataWrapper from '@/components/LiveDataWrapper';
import { fetcher, getPools } from '@/lib/coingecko.actions';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const page = async ({ params }: NextPageProps) => {
  const { id } = await params;

  //Promise.all to fetch multiple requests at once by parallely calling functions
  const [ coinData, coinOHLCData ] = await Promise.all([
    fetcher<CoinDetailsData>(`/coins/${id}`),
    fetcher<OHLCData[]>(`/coins/${id}/ohlc`, {
    vs_currency: 'usd',
    days: 1,
    precision: 'full'
  })
  ])

  const platform = coinData.asset_platform_id? coinData.detail_platforms?.[coinData.asset_platform_id] : null;

  const network = platform?.geckoterminal_url.split('/')[3] ?? null;
  const contractAddress = platform?.contract_address || null;

  //pool identifies which market app should subscribe to get real time updates
  let pool: { id: string } | null = null;
  try {
    pool = await getPools(id, network, contractAddress);
  } catch (error) {
    console.error('Failed to fetch pool data:', error);
  }

  const coinDetails = [
    {
      label: 'Market Cap',
      value: formatCurrency(coinData.market_data.market_cap.usd)
    },
    {
      label: 'Market Cap Rank',
      value: `#${coinData.market_cap_rank}`,
    },
    {
      label: 'Total Volume',
      value: formatCurrency(coinData.market_data.total_volume.usd),
    },
    {
      label: 'Website',
      value: '-',
      link: coinData.links.homepage[0],
      linkText: 'Homepage'
    },
    {
      label: 'Explorer',
      value: '-',
      link: coinData.links.blockchain_site[0],
      linkText: 'Explorer'
    },
    {
      label: 'Community',
      value: '-',
      link: coinData.links.subreddit_url,
      linkText: 'Community'
    },
  ]

  return (
    <main id="coin-details-page">
      <section className="primary">
          <LiveDataWrapper coinId={id} poolId={pool?.id ?? ''} coin={coinData} coinOHLCData={coinOHLCData}>
          <h4>Exchange Listings</h4>
        </LiveDataWrapper>
      </section>
      <section className="secondary">
        <Converter
          symbol={coinData.symbol}
          icon={coinData.image.small}
          priceList={coinData.market_data.current_price}
        />
        <div className="details">
          <h4>Coin Details</h4>
          <ul className="details-grid">
            {coinDetails.map(({ label, value, link, linkText }, index) => (
              <li key={index}>
                <p className={label}>{label}</p>

                {link && link.trim() !== '' ? (
                  <div className="link">
                    <Link href={link} target="_blank">
                      {linkText || label}
                    </Link>
                    <ArrowUpRight size={16} />

                  </div>
                ) : (
                  <p className="text-base font-medium">
                    {value}
                  </p>
                )}
              </li>
            ))}

          </ul>
        </div>
        <p>Top Gainers & Losers</p>
      </section>
    </main>
  )
}

export default page